/** =========================================================
 *  activities_api.gs — Endpoints públicos de atividades
 *  Funções expostas via google.script.run para o frontend
 * ========================================================= */

/**
 * Lista categorias de atividades (endpoint público)
 * @param {string} sessionId - ID da sessão do usuário
 * @returns {Object} Resultado com lista de categorias
 */
function listCategoriasAtividadesApi(sessionId) {
  try {
    // Validar sessão
    if (!sessionId) {
      Logger.warn('ActivitiesAPI', 'Tentativa de listar categorias sem sessionId');
      return {
        ok: false,
        error: 'Usuário não autenticado',
        sessionExpired: true
      };
    }

    const sessionData = validateSession(sessionId);
    if (!sessionData || !sessionData.ok || !sessionData.session) {
      Logger.warn('ActivitiesAPI', 'Sessão inválida ao listar categorias');
      return {
        ok: false,
        error: 'Sessão inválida ou expirada',
        sessionExpired: true
      };
    }

    console.log('📋 Listando categorias de atividades...');

    // Usar função já migrada para DatabaseManager
    const result = _listCategoriasAtividadesCore();

    if (!result || !result.ok) {
      return {
        ok: false,
        error: result?.error || 'Erro ao buscar categorias',
        items: []
      };
    }

    // Mapear para formato da API (id, nome, icone)
    const categoriasList = result.items.map(cat => ({
      id: cat.id,
      nome: cat.nome || `Categoria ${cat.id}`,
      icone: cat.icone || '📋'
    }));

    console.log(`✅ ${categoriasList.length} categorias carregadas`);

    return {
      ok: true,
      items: categoriasList,
      total: categoriasList.length
    };

  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    Logger.error('ActivitiesAPI', 'Error listing categories', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro interno do servidor',
      items: []
    };
  }
}

/**
 * Cria uma nova atividade
 * @param {string} sessionId - ID da sessão do usuário
 * @param {Object} activityData - Dados da atividade
 * @param {string} creatorUid - UID do usuário criador
 * @returns {Object} Resultado da operação
 */
async function createActivity(sessionId, activityData, creatorUid) {
  try {
    console.log('📝 Criando nova atividade - sessionId:', sessionId ? '✓' : '✗', 'dados:', activityData);

    // Validar sessão
    if (!sessionId) {
      Logger.warn('ActivitiesAPI', 'Tentativa de criar atividade sem sessionId');
      return {
        ok: false,
        error: 'Usuário não autenticado',
        sessionExpired: true
      };
    }

    const sessionData = validateSession(sessionId);
    if (!sessionData || !sessionData.ok || !sessionData.session) {
      Logger.warn('ActivitiesAPI', 'Sessão inválida ao criar atividade');
      return {
        ok: false,
        error: 'Sessão inválida ou expirada',
        sessionExpired: true
      };
    }

    // Remover qualquer campo 'id' que possa estar vindo do frontend
    if (activityData.hasOwnProperty('id')) {
      delete activityData.id;
      console.log('🧹 Campo "id" removido dos dados de entrada');
    }

    // Validação dos dados obrigatórios
    if (!activityData.titulo) {
      return {
        ok: false,
        error: 'Título da atividade é obrigatório'
      };
    }

    if (!activityData.data) {
      return {
        ok: false,
        error: 'Data da atividade é obrigatória'
      };
    }

    // Validar formato da data - deve ter pelo menos data
    if (activityData.data.length < 10 || !activityData.data.includes('-')) {
      return {
        ok: false,
        error: 'Formato da data inválido. Esperado: YYYY-MM-DD ou YYYY-MM-DDTHH:MM'
      };
    }

    // Preparar dados para inserção (IMPORTANTE: sem campo ID - é gerado automaticamente)
    const newActivity = {};

    // Adicionar apenas campos não-generated do dicionário
    newActivity.titulo = activityData.titulo;
    newActivity.descricao = activityData.descricao || '';

    // Tratar data - converter para formato DATETIME (yyyy-MM-dd HH:mm:ss)
    let dataFormatted = activityData.data;

    // Converter de ISO (2025-09-25T17:36) para formato do banco (2025-09-25 17:36:00)
    if (dataFormatted.includes('T')) {
      const [datePart, timePart] = dataFormatted.split('T');
      if (timePart && timePart.trim() !== '') {
        // Tem horário: adicionar :00 se necessário
        const timeFormatted = timePart.includes(':') ? timePart : timePart + ':00';
        dataFormatted = `${datePart} ${timeFormatted}:00`;
      } else {
        // Só tem data (ex: "2025-09-25T"): adicionar horário padrão
        dataFormatted = `${datePart} 00:00:00`;
      }
    } else {
      // Só tem data: adicionar horário padrão
      dataFormatted = `${dataFormatted} 00:00:00`;
    }

    newActivity.data = dataFormatted;
    console.log('📅 Data formatada para DATETIME:', dataFormatted);
    newActivity.status = 'Pendente'; // Status padrão sempre Pendente

    // Categorias (múltiplas seleções)
    if (activityData.categorias && activityData.categorias.length > 0) {
      // Converter array para string separada por vírgula
      let categoriasIds;
      if (Array.isArray(activityData.categorias)) {
        // Garantir que cada elemento seja uma string limpa
        const cleanedCategories = activityData.categorias
          .map(cat => cat ? cat.toString().trim() : '')
          .filter(cat => cat.length > 0);
        categoriasIds = cleanedCategories.join(',');
      } else {
        categoriasIds = activityData.categorias.toString().trim();
      }

      newActivity.categorias_ids = categoriasIds;
    }

    // Responsável
    if (activityData.atribuido_uid) {
      newActivity.atribuido_uid = activityData.atribuido_uid;
    }

    // Tags opcionais
    if (activityData.tags) {
      newActivity.tags = activityData.tags;
    }

    // Campos de auditoria
    // TEMPORÁRIO: usar UID fixo até corrigir sistema de login
    const cleanCreatorUid = creatorUid && creatorUid.startsWith('U') ? creatorUid : 'U001';
    newActivity.criado_por = cleanCreatorUid;
    // Usar formatTimestamp do DatabaseManager para timezone correto
    newActivity.criado_em = Utilities.formatDate(new Date(), APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss');
    newActivity.deleted = ''; // Campo padrão para soft delete

    console.log('👤 UID do criador usado:', cleanCreatorUid);

    console.log('📋 Dados preparados para inserção (sem ID):', newActivity);
    console.log('🔍 Campos enviados:', Object.keys(newActivity));

    // Verificação final - garantir que não há campo 'id'
    if (newActivity.hasOwnProperty('id')) {
      console.error('🚨 ERRO: Campo "id" ainda presente nos dados!');
      delete newActivity.id;
    }

    // Usar DatabaseManager conforme orientação diária
    console.log('📝 Usando DatabaseManager.insert para atividades...');
    console.log('📤 Dados finais enviados ao DatabaseManager:', JSON.stringify(newActivity, null, 2));
    console.log('🔍 Verificação campo ID:', newActivity.id || 'CAMPO ID NÃO ESTÁ PRESENTE');
    console.log('🔍 Todos os campos:', Object.keys(newActivity));


    try {
      const result = await DatabaseManager.insert('atividades', newActivity);
      console.log('📋 Resultado DatabaseManager.insert:', result);

      // Se deu erro, vamos interceptar para mostrar mais detalhes
      if (!result.success && result.error && result.error.includes('id:')) {
        console.error('🚨 ERRO ESPECÍFICO DO ID:');
        console.error('🔍 ID que causou erro:', newActivity.id || 'undefined');
        console.error('🔍 Tipo do ID:', typeof newActivity.id);
        console.error('🔍 Propriedades do objeto:', Object.getOwnPropertyNames(newActivity));
      }

      if (result && result.success) {
        console.log('✅ Atividade criada com sucesso via DatabaseManager');
        return {
          ok: true,
          message: result.message || 'Atividade criada com sucesso',
          id: result.id,
          data: result.data
        };
      } else {
        console.error('❌ DatabaseManager.insert falhou:', result);

        // Log estruturado conforme orientação (se Logger estiver disponível)
        if (typeof Logger !== 'undefined') {
          Logger.error('CreateActivity', 'Falha ao inserir atividade no banco', {
            activityData: newActivity,
            result: result
          });
        }

        return {
          ok: false,
          error: result?.error || result?.message || 'Erro ao criar atividade no banco de dados'
        };
      }
    } catch (dbError) {
      console.error('❌ Exception no DatabaseManager:', dbError);
      console.error('🔍 Stack trace:', dbError.stack);
      return {
        ok: false,
        error: 'Exception no banco de dados: ' + dbError.message
      };
    }

  } catch (error) {
    console.error('❌ Erro ao criar atividade:', error);
    return {
      ok: false,
      error: error.message || 'Erro interno do servidor'
    };
  }
}

/**
 * Busca uma atividade específica pelo ID
 * @param {string} sessionId - ID da sessão do usuário
 * @param {string} activityId - ID da atividade
 * @param {number} retryCount - Contador de tentativas
 * @returns {Object} Resultado com dados da atividade
 */
function getActivityById(sessionId, activityId, retryCount = 0) {
  try {
    console.log(`🔍 Buscando atividade - sessionId: ${sessionId ? '✓' : '✗'}, ID: ${activityId} (tentativa ${retryCount + 1})`);

    // Validar sessão
    if (!sessionId) {
      Logger.warn('ActivitiesAPI', 'Tentativa de buscar atividade sem sessionId');
      return {
        ok: false,
        error: 'Usuário não autenticado',
        sessionExpired: true
      };
    }

    const sessionData = validateSession(sessionId);
    if (!sessionData || !sessionData.ok || !sessionData.session) {
      Logger.warn('ActivitiesAPI', 'Sessão inválida ao buscar atividade');
      return {
        ok: false,
        error: 'Sessão inválida ou expirada',
        sessionExpired: true
      };
    }

    if (!activityId) {
      console.error('❌ ID da atividade não fornecido');
      return {
        ok: false,
        error: 'ID da atividade é obrigatório'
      };
    }

    // Verificar se DatabaseManager está disponível
    if (typeof DatabaseManager === 'undefined') {
      console.error('❌ DatabaseManager não está disponível');
      return {
        ok: false,
        error: 'Sistema de banco de dados não disponível'
      };
    }

    // Se é retry, forçar limpeza de cache primeiro
    if (retryCount > 0) {
      console.log(`🔄 Retry ${retryCount}: invalidando cache antes da busca...`);
      try {
        if (typeof CacheManager !== 'undefined') {
          CacheManager.invalidate('atividades');
          // Pequena pausa para garantir que cache foi limpo
          Utilities.sleep(100);
        }
      } catch (cacheError) {
        console.warn('⚠️ Erro ao invalidar cache no retry:', cacheError.message);
      }
    }

    // Buscar atividade usando DatabaseManager
    console.log('🔍 Chamando DatabaseManager.findById...');
    const atividade = DatabaseManager.findById('atividades', activityId);
    console.log('📋 Resultado do findById:', atividade);

    if (!atividade) {
      // Se não encontrou e ainda não tentou retry, tentar novamente
      if (retryCount < 2) {
        console.log(`⏳ Atividade não encontrada, tentando novamente em 200ms... (retry ${retryCount + 1})`);
        Utilities.sleep(200);
        return getActivityById(activityId, retryCount + 1);
      }

      console.error('❌ Atividade não encontrada no banco após todas as tentativas:', activityId);
      return {
        ok: false,
        error: `Atividade ${activityId} não encontrada`
      };
    }

    // Limpar e serializar dados para evitar problemas de comunicação
    const cleanActivity = {
      id: atividade.id || '',
      titulo: atividade.titulo || '',
      descricao: atividade.descricao || '',
      data: atividade.data ? atividade.data.toString() : '',
      status: atividade.status || 'Pendente',
      atribuido_uid: atividade.atribuido_uid || '',
      categorias_ids: atividade.categorias_ids || '',
      tags: atividade.tags || '',
      criado_por: atividade.criado_por || '',
      criado_em: atividade.criado_em ? atividade.criado_em.toString() : '',
      atualizado_em: atividade.atualizado_em ? atividade.atualizado_em.toString() : ''
    };

    console.log('✅ Atividade encontrada e limpa:', {
      id: cleanActivity.id,
      titulo: cleanActivity.titulo,
      data: cleanActivity.data,
      status: cleanActivity.status
    });

    console.log('📤 Retornando atividade serializada:', JSON.stringify(cleanActivity));

    return {
      ok: true,
      activity: cleanActivity
    };

  } catch (error) {
    console.error('❌ Erro ao buscar atividade:', error);
    console.error('❌ Stack trace:', error.stack);

    // Se erro e ainda não tentou retry, tentar novamente
    if (retryCount < 2) {
      console.log(`⏳ Erro na busca, tentando novamente em 300ms... (retry ${retryCount + 1})`);
      Utilities.sleep(300);
      return getActivityById(activityId, retryCount + 1);
    }

    return {
      ok: false,
      error: error.message || 'Erro interno do servidor'
    };
  }
}

// ============================================================================
// FUNÇÃO REMOVIDA: updateActivity() - activities_api.gs:335-453
//
// Motivo: Função órfã/não utilizada - substituída por updateActivityWithTargets()
// - Frontend usa apenas updateActivityWithTargets() (app_migrated.html:5442)
// - Esta função não suportava alvos (targets)
// - Funcionalidade consolidada em updateActivityWithTargets()
//
// Removido em: Migração #2 - Fase 4, Consolidação de funções de update
// Data: 02/10/2025
// Linhas removidas: 119 (incluindo JSDoc)
// ============================================================================

/**
 * Marca uma atividade como concluída
 * @param {string} sessionId - ID da sessão (injetado automaticamente pelo apiCall)
 * @param {string} activityId - ID da atividade
 * @returns {Object} Resultado da operação
 */
async function completeActivity(sessionId, activityId) {
  try {
    Logger.info('ActivitiesAPI', 'Marcando atividade como concluída', { activityId, sessionId: sessionId ? '✓' : '✗' });

    // Validar sessionId
    if (!sessionId) {
      Logger.warn('ActivitiesAPI', 'Tentativa de completar atividade sem sessionId', { activityId });
      return {
        ok: false,
        error: 'Usuário não autenticado - sessionId ausente',
        sessionExpired: true
      };
    }

    if (!activityId) {
      throw new Error('ID da atividade é obrigatório');
    }

    // Validar sessão
    const sessionData = validateSession(sessionId);

    if (!sessionData || !sessionData.ok || !sessionData.session) {
      Logger.warn('ActivitiesAPI', 'Sessão inválida ao completar atividade', { activityId, sessionId });
      return {
        ok: false,
        error: 'Sessão inválida ou expirada',
        sessionExpired: true
      };
    }

    const userId = sessionData.session.user_id;

    // Buscar dados do usuário
    const usuario = DatabaseManager.findById('usuarios', userId);
    if (!usuario) {
      Logger.error('ActivitiesAPI', 'Usuário não encontrado ao completar atividade', { userId, activityId });
      throw new Error('Usuário não encontrado na base de dados');
    }

    // Dados para atualização - apenas campos necessários
    // Campo atualizado_em preenchido automaticamente pelo DatabaseManager
    const updateData = {
      status: 'Concluída',
      atualizado_uid: usuario.uid
    };

    // Verificar se a atividade existe
    const existingActivity = DatabaseManager.findById('atividades', activityId);

    if (!existingActivity) {
      Logger.warn('ActivitiesAPI', 'Atividade não encontrada ao tentar completar', { activityId });
      return {
        ok: false,
        error: `Atividade ${activityId} não encontrada`
      };
    }

    // Usar DatabaseManager para atualizar
    const result = await DatabaseManager.update('atividades', activityId, updateData);

    if (result && result.success) {
      Logger.info('ActivitiesAPI', 'Atividade marcada como concluída', { activityId, userId: usuario.uid });

      // Forçar limpeza de cache
      try {
        if (typeof CacheManager !== 'undefined') {
          CacheManager.invalidate('atividades');
        }
      } catch (cacheError) {
        Logger.warn('ActivitiesAPI', 'Erro ao invalidar cache', { error: cacheError.message });
      }

      return {
        ok: true,
        message: 'Atividade marcada como concluída com sucesso'
      };
    } else {
      Logger.error('ActivitiesAPI', 'Falha ao atualizar status da atividade', { activityId, result });
      return {
        ok: false,
        error: result?.error || 'Erro ao marcar atividade como concluída'
      };
    }

  } catch (error) {
    Logger.error('ActivitiesAPI', 'Erro ao marcar atividade como concluída', {
      activityId,
      error: error.message,
      stack: error.stack
    });
    return {
      ok: false,
      error: error.message || 'Erro interno do servidor'
    };
  }
}
