/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                             SISTEMA DOJOTAI V2.0 - API DE USUÁRIOS                              ║
 * ║                                    Criado: 25/09/2025                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 *
 * @fileoverview API para gerenciar usuários do sistema
 * @author Sistema Dojotai Team
 * @version 2.0.0
 */

/**
 * Lista todos os usuários ativos do sistema
 * Refatorado para usar listActiveUsers (já migrado para DatabaseManager)
 * @returns {Object} Resultado com lista de usuários
 */
function listUsuariosApi() {
  try {
    console.log('📋 Listando usuários para seleção...');

    // Usar função já migrada para DatabaseManager
    const result = listActiveUsers();

    if (!result || !result.ok) {
      return {
        ok: false,
        error: result?.error || 'Nenhum usuário encontrado',
        items: []
      };
    }

    // Mapear para formato da API (uid e nome)
    const usuariosList = result.users.map(user => ({
      uid: user.uid,
      nome: user.nome || `Usuário ${user.uid}`
    }));

    console.log(`✅ ${usuariosList.length} usuários carregados`);

    return {
      ok: true,
      items: usuariosList,
      total: usuariosList.length
    };

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    Logger.error('UsuariosAPI', 'Error listing users', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro interno do servidor',
      items: []
    };
  }
}

/**
 * Lista categorias de atividades
 * Refatorado para usar _listCategoriasAtividadesCore (já migrado para DatabaseManager)
 * @returns {Object} Resultado com lista de categorias
 */
function listCategoriasAtividadesApi() {
  try {
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

    // Mapear para formato simplificado da API (apenas id e nome)
    const categoriasList = result.items.map(cat => ({
      id: cat.id,
      nome: cat.nome || `Categoria ${cat.id}`
    }));

    console.log(`✅ ${categoriasList.length} categorias carregadas`);

    return {
      ok: true,
      items: categoriasList,
      total: categoriasList.length
    };

  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    Logger.error('UsuariosAPI', 'Error listing categories', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro interno do servidor',
      items: []
    };
  }
}

/**
 * Cria uma nova atividade
 * @param {Object} activityData - Dados da atividade
 * @param {string} creatorUid - UID do usuário criador
 * @returns {Object} Resultado da operação
 */
async function createActivity(activityData, creatorUid) {
  try {
    console.log('📝 Criando nova atividade - dados recebidos:', activityData);

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
 * @param {string} activityId - ID da atividade
 * @returns {Object} Resultado com dados da atividade
 */
function getActivityById(activityId, retryCount = 0) {
  try {
    console.log(`🔍 Buscando atividade ID: ${activityId} (tentativa ${retryCount + 1})`);

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

/**
 * Atualiza uma atividade existente
 * @param {Object} activityData - Dados da atividade para atualizar
 * @returns {Object} Resultado da operação
 */
async function updateActivity(activityData) {
  try {
    console.log('🔄 Atualizando atividade - dados recebidos:', activityData);

    if (!activityData || !activityData.id) {
      return {
        ok: false,
        error: 'ID da atividade é obrigatório para atualização'
      };
    }

    const activityId = activityData.id;

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

    // Preparar dados para atualização (remover ID dos dados)
    const updateData = { ...activityData };
    delete updateData.id; // Remover ID dos dados de update

    // Tratar data - converter para formato DATETIME (yyyy-MM-dd HH:mm:ss)
    let dataFormatted = updateData.data;
    if (dataFormatted.includes('T')) {
      const [datePart, timePart] = dataFormatted.split('T');
      if (timePart && timePart.trim() !== '') {
        const timeFormatted = timePart.includes(':') ? timePart : timePart + ':00';
        dataFormatted = `${datePart} ${timeFormatted}:00`;
      } else {
        dataFormatted = `${datePart} 00:00:00`;
      }
    } else {
      dataFormatted = `${dataFormatted} 00:00:00`;
    }
    updateData.data = dataFormatted;

    // Processar categorias (múltiplas seleções)
    if (updateData.categorias && updateData.categorias.length > 0) {
      let categoriasIds;
      if (Array.isArray(updateData.categorias)) {
        const cleanedCategories = updateData.categorias
          .map(cat => cat ? cat.toString().trim() : '')
          .filter(cat => cat.length > 0);
        categoriasIds = cleanedCategories.join(',');
      } else {
        categoriasIds = updateData.categorias.toString().trim();
      }
      updateData.categorias_ids = categoriasIds;
      delete updateData.categorias; // Remover campo temporário
    }

    // Campos de auditoria para update
    updateData.atualizado_em = Utilities.formatDate(new Date(), APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss');

    console.log('📝 Dados preparados para atualização:', updateData);

    // Usar DatabaseManager para atualizar
    console.log('🔄 Chamando DatabaseManager.update...');
    const result = await DatabaseManager.update('atividades', activityId, updateData);
    console.log('📋 Resultado DatabaseManager.update:', result);

    if (result && result.success === true) {
      console.log('✅ Atividade atualizada com sucesso no banco');

      // Forçar limpeza de cache para garantir dados atualizados
      try {
        if (typeof CacheManager !== 'undefined') {
          CacheManager.invalidate('atividades');
          console.log('🗑️ Cache de atividades invalidado após update');
        }
      } catch (cacheError) {
        console.warn('⚠️ Erro ao invalidar cache:', cacheError.message);
      }

      return {
        ok: true,
        message: 'Atividade atualizada com sucesso'
      };
    } else {
      console.error('❌ DatabaseManager.update falhou:', result);

      // Log estruturado se Logger estiver disponível
      if (typeof Logger !== 'undefined') {
        Logger.error('UpdateActivity', 'Falha ao atualizar atividade no banco', {
          activityId: activityId,
          updateData: updateData,
          result: result
        });
      }

      return {
        ok: false,
        error: result?.error || 'Erro ao atualizar atividade no banco de dados'
      };
    }

  } catch (error) {
    console.error('❌ Erro ao atualizar atividade:', error);
    console.error('❌ Stack trace:', error.stack);
    return {
      ok: false,
      error: error.message || 'Erro interno do servidor'
    };
  }
}

/**
 * Marca uma atividade como concluída
 * @param {string} activityId - ID da atividade
 * @returns {Object} Resultado da operação
 */
async function completeActivity(activityId) {
  try {
    console.log('✅ Marcando atividade como concluída:', activityId);

    if (!activityId) {
      throw new Error('ID da atividade é obrigatório');
    }

    // Obter usuário logado real via sessão
    const sessionId = PropertiesService.getScriptProperties().getProperty('currentSessionId');
    console.log('🔍 SessionId recuperado:', sessionId);

    if (!sessionId) {
      throw new Error('Usuário não autenticado - sem sessão ativa');
    }

    const sessionData = validateSession(sessionId);
    console.log('🔍 Validação da sessão:', sessionData);

    if (!sessionData || !sessionData.ok || !sessionData.session) {
      throw new Error('Sessão inválida ou expirada');
    }

    const userId = sessionData.session.user_id;

    // Buscar dados do usuário
    const usuario = DatabaseManager.findById('usuarios', userId);
    if (!usuario) {
      throw new Error('Usuário não encontrado na base de dados');
    }

    console.log('👤 Usuário logado:', usuario.uid);

    // Dados para atualização - apenas campos necessários
    const agora = Utilities.formatDate(new Date(), APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss');
    const updateData = {
      status: 'Concluída',
      atualizado_uid: usuario.uid,
      atualizado_em: agora
    };

    console.log('📝 Dados de atualização:', updateData);

    // Primeiro verificar se a atividade existe
    console.log('🔍 Verificando se atividade existe:', activityId);
    const existingActivity = DatabaseManager.findById('atividades', activityId);
    console.log('🔍 Resultado da verificação:', existingActivity);

    if (!existingActivity) {
      console.error('❌ Atividade não encontrada:', activityId);
      return {
        ok: false,
        error: `Atividade ${activityId} não encontrada`
      };
    }

    // Usar DatabaseManager para atualizar
    const result = await DatabaseManager.update('atividades', activityId, updateData);

    if (result && result.success) {
      console.log('✅ Status da atividade atualizado com sucesso');

      // Forçar limpeza de cache
      try {
        if (typeof CacheManager !== 'undefined') {
          CacheManager.invalidate('atividades');
          console.log('🗑️ Cache de atividades invalidado após marcar como concluída');
        }
      } catch (cacheError) {
        console.warn('⚠️ Erro ao invalidar cache:', cacheError.message);
      }

      return {
        ok: true,
        message: 'Atividade marcada como concluída com sucesso'
      };
    } else {
      console.error('❌ DatabaseManager.update falhou:', result);

      return {
        ok: false,
        error: result?.error || 'Erro ao marcar atividade como concluída'
      };
    }

  } catch (error) {
    console.error('❌ Erro ao marcar atividade como concluída:', error);
    console.error('❌ Stack trace:', error.stack);
    return {
      ok: false,
      error: error.message || 'Erro interno do servidor'
    };
  }
}

/**
 * Retorna o usuário atual logado para filtros
 * @returns {Object} Dados do usuário atual
 */
function getCurrentUserForFilter() {
  try {
    // Obter usuário logado real via sessão
    const sessionId = PropertiesService.getScriptProperties().getProperty('currentSessionId');
    if (!sessionId) {
      console.log('❌ Usuário não autenticado - sem sessão ativa');
      return null;
    }

    const sessionData = validateSession(sessionId);
    if (!sessionData || !sessionData.ok || !sessionData.session) {
      console.log('❌ Sessão inválida ou expirada');
      return null;
    }

    const userId = sessionData.session.user_id;

    // Buscar dados do usuário
    const usuario = DatabaseManager.findById('usuarios', userId);
    if (!usuario) {
      console.log('❌ Usuário não encontrado na base de dados:', userId);
      return null;
    }

    return {
      uid: usuario.uid,
      nome: usuario.nome
    };
  } catch (error) {
    console.error('❌ Erro ao obter usuário atual para filtro:', error);
    return null;
  }
}

/**
 * Autentica usuário e cria sessão usando SecurityManager existente
 * @param {string} login - Login do usuário
 * @param {string} password - PIN do usuário
 * @returns {Object} Resultado da autenticação
 */
async function authenticateUser(login, password) {
  try {
    console.log('🔐 Autenticando usuário:', login);

    // Usar SecurityManager.secureLogin existente
    const loginResult = await SecurityManager.secureLogin(login, password);

    if (!loginResult.ok) {
      return {
        success: false,
        error: loginResult.error
      };
    }

    // Criar sessão usando SessionManager
    const sessionResult = await createSession(loginResult.user.uid, {
      platform: 'web',
      login_method: 'pin'
    });

    console.log('🔍 Resultado da criação de sessão:', sessionResult);

    if (!sessionResult || !sessionResult.ok || !sessionResult.session) {
      return {
        success: false,
        error: 'Erro ao criar sessão: ' + (sessionResult?.error || 'Resposta inválida do SessionManager')
      };
    }

    // Salvar sessionId para uso posterior
    PropertiesService.getScriptProperties().setProperty('currentSessionId', sessionResult.session.id);
    console.log('💾 SessionId salvo:', sessionResult.session.id);

    console.log('✅ Login bem-sucedido para usuário:', loginResult.user.uid);

    return {
      success: true,
      user: {
        uid: loginResult.user.uid,
        nome: loginResult.user.nome,
        login: loginResult.user.login,
        role: loginResult.user.role
      },
      session: {
        id: sessionResult.session.id,
        expires_at: sessionResult.session.expires_at
      }
    };

  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return {
      success: false,
      error: 'Erro interno do servidor: ' + error.message
    };
  }
}

/**
 * Retorna dados do usuário logado atualmente (para menu dinâmico)
 * @returns {Object} Dados do usuário logado
 */
function getCurrentLoggedUser() {
  try {
    console.log('👤 Buscando usuário logado atual...');

    // Método 1: Tentar via sessão atual armazenada
    let sessionId = PropertiesService.getScriptProperties().getProperty('currentSessionId');
    console.log('🔍 SessionId recuperado das propriedades:', sessionId);

    if (sessionId) {
      const sessionData = validateSession(sessionId);
      console.log('🔍 Dados da sessão validada:', sessionData);

      if (sessionData && sessionData.ok && sessionData.session) {
        const userId = sessionData.session.user_id;
        console.log('🔍 UserId da sessão:', userId);

        const usuario = DatabaseManager.findById('usuarios', userId);
        if (usuario) {
          console.log('✅ Usuário encontrado via sessão:', usuario.uid, usuario.nome);
          return {
            uid: usuario.uid,
            nome: usuario.nome,
            metodo: 'sessao_ativa'
          };
        }
      }
    }

    // Método 2: Tentar buscar sessão ativa mais recente
    console.log('🔄 Tentando método 2: sessão ativa mais recente...');
    try {
      const sessionsData = readTableByNome_('sessoes');
      if (sessionsData && sessionsData.values && sessionsData.values.length > 1) {
        const headers = sessionsData.values[0];
        const rows = sessionsData.values.slice(1);

        // Buscar sessões ativas ordenadas por data
        const sessionsAtivas = rows
          .map(row => {
            const session = {};
            headers.forEach((header, index) => {
              session[header] = row[index];
            });
            return session;
          })
          .filter(s => s.active === 'true' || s.active === true)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        if (sessionsAtivas.length > 0) {
          const sessionAtiva = sessionsAtivas[0];
          console.log('🔍 Sessão ativa mais recente encontrada:', sessionAtiva.session_id);

          const usuario = DatabaseManager.findById('usuarios', sessionAtiva.user_id);
          if (usuario) {
            console.log('✅ Usuário encontrado via sessão ativa:', usuario.uid, usuario.nome);
            return {
              uid: usuario.uid,
              nome: usuario.nome,
              metodo: 'sessao_ativa_recente'
            };
          }
        }
      }
    } catch (sessionError) {
      console.warn('⚠️ Erro ao buscar sessões ativas:', sessionError.message);
    }

    // Método 3: Log para debug - NÃO retornar usuário aleatório
    console.log('❌ Nenhum usuário logado encontrado pelos métodos disponíveis');
    console.log('💡 Isso pode indicar que o usuário precisa fazer login novamente');

    return null;

  } catch (error) {
    console.error('❌ Erro ao obter usuário logado:', error);
    return null;
  }
}

/**
 * Retorna o primeiro usuário da tabela para desenvolvimento
 * @returns {Object} Dados do usuário para desenvolvimento
 */
function getFirstUserForDev() {
  try {
    const usuarios = DatabaseManager.query('usuarios', {}, false);
    if (!usuarios || usuarios.length === 0) {
      return null;
    }

    const firstUser = usuarios[0];
    return {
      uid: firstUser.uid,
      nome: firstUser.nome,
      login: firstUser.login
    };
  } catch (error) {
    console.error('❌ Erro ao obter primeiro usuário:', error);
    return null;
  }
}