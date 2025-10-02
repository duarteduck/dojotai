// participacoes.gs - Sistema de Gestão de Participações em Atividades

/**
 * Lista participações usando DatabaseManager
 */
function listParticipacoes(activityId) {
  try {
    if (!activityId) {
      return { ok: false, error: 'ID da atividade é obrigatório.' };
    }

    console.log('🔧 [BACKEND] listParticipacoes chamada para atividade:', activityId);

    // Busca todas as participações da atividade usando DatabaseManager
    const filters = {
      id_atividade: activityId.toString().trim()
    };

    const participacoes = DatabaseManager.query('participacoes', filters, false);

    if (!participacoes) {
      return { ok: true, items: [] };
    }

    // Filtra apenas participações ativas (não deletadas)
    const activeParticipacoes = participacoes
      .filter(p => p.deleted !== 'x')
      .map(p => ({
        id: p.id,
        id_atividade: p.id_atividade,
        id_membro: p.id_membro,
        tipo: p.tipo,
        confirmou: p.confirmou,
        participou: p.participou,
        chegou_tarde: p.chegou_tarde,
        saiu_cedo: p.saiu_cedo,
        observacoes: p.observacoes,
        deleted: p.deleted // Incluir para controle no frontend
      }));

    console.log('🔧 [BACKEND] Participações encontradas:', activeParticipacoes.length);

    return { ok: true, items: activeParticipacoes };

  } catch (error) {
    console.error('❌ [BACKEND] Erro listParticipacoes:', error);
    return { ok: false, error: 'Erro: ' + error.message };
  }
}

/**
 * Calcula o status de participação baseado nas regras
 */
function calculateStatusParticipacao(participacao) {
  if (participacao.participou === 'nao') {
    return participacao.justificativa ? 'ausente_justificado' : 'ausente';
  }

  if (participacao.participou === 'sim') {
    if (participacao.chegou_tarde === 'sim' && participacao.saiu_cedo === 'sim') {
      return 'chegou_tarde_saiu_cedo';
    }
    if (participacao.chegou_tarde === 'sim') {
      return 'chegou_tarde';
    }
    if (participacao.saiu_cedo === 'sim') {
      return 'saiu_cedo';
    }
    return 'presente_completo';
  }

  return 'pendente';
}

/**
 * Define alvos para uma atividade usando DatabaseManager
 * @param {string} activityId - ID da atividade
 * @param {Array} memberIds - Array de IDs dos membros
 * @param {string} uid - UID do usuário que está definindo
 * @returns {Object} { ok: boolean, created: number }
 */
function defineTargets(activityId, memberIds, uid) {
  try {
    if (!activityId || !memberIds || !Array.isArray(memberIds)) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    console.log('🔧 [BACKEND] defineTargets chamada para atividade:', activityId, 'membros:', memberIds);

    // Verifica duplicatas existentes
    const existing = listParticipacoes(activityId);
    if (!existing.ok) return existing;

    const existingMemberIds = existing.items.map(p => p.id_membro);
    const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id.toString()));

    if (newMemberIds.length === 0) {
      return { ok: true, created: 0, message: 'Todos os membros já estão na lista.' };
    }

    console.log('🔧 [BACKEND] Novos membros a adicionar:', newMemberIds);

    const nowStr = nowString_();
    const createdIds = [];

    // Cria as novas participações usando DatabaseManager
    for (const memberId of newMemberIds) {
      const participacaoData = {
        id_atividade: activityId,
        id_membro: memberId.toString(),
        tipo: 'alvo',
        confirmou: '',
        confirmado_em: '',
        participou: '',
        chegou_tarde: '',
        saiu_cedo: '',
        justificativa: '',
        observacoes: '',
        marcado_em: nowStr,
        marcado_por: uid || ''
      };

      const result = DatabaseManager.create('participacoes', participacaoData);

      if (result.ok) {
        createdIds.push(result.id);
        console.log('🔧 [BACKEND] Participação criada:', result.id, 'para membro:', memberId);
      } else {
        console.error('❌ [BACKEND] Erro ao criar participação para membro:', memberId, result.error);
        return { ok: false, error: 'Erro ao criar participação para membro ' + memberId + ': ' + result.error };
      }
    }

    console.log('✅ [BACKEND] Alvos definidos com sucesso:', createdIds.length);
    return { ok: true, created: createdIds.length, ids: createdIds };

  } catch (err) {
    console.error('❌ [BACKEND] Erro defineTargets:', err);
    return { ok: false, error: 'Erro defineTargets: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Marca participação de um membro usando DatabaseManager
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {Object} dados - Dados da participação
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function markParticipacao(activityId, memberId, dados, uid) {
  try {
    if (!activityId || !memberId || !dados) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    console.log('🔧 [BACKEND] markParticipacao chamada:', activityId, memberId);

    // Busca todas as participações da atividade
    const filters = {
      id_atividade: activityId.toString(),
      id_membro: memberId.toString()
    };

    const participacoes = DatabaseManager.query('participacoes', filters, false);

    if (!participacoes || participacoes.length === 0) {
      return { ok: false, error: 'Participação não encontrada.' };
    }

    // Busca a participação ativa (não deletada)
    const participacao = participacoes.find(p => p.deleted !== 'x');

    if (!participacao) {
      return { ok: false, error: 'Participação ativa não encontrada.' };
    }

    console.log('🔧 [BACKEND] Participação encontrada:', participacao.id);

    // Prepara os dados para atualização
    const updateData = {
      participou: dados.participou || '',
      justificativa: dados.justificativa || '',
      observacoes: dados.observacoes || '',
      marcado_em: nowString_(),
      marcado_por: uid || ''
    };

    // Se não participou, limpa chegou_tarde e saiu_cedo
    if (dados.participou === 'nao') {
      updateData.chegou_tarde = '';
      updateData.saiu_cedo = '';
    } else {
      updateData.chegou_tarde = dados.chegou_tarde || '';
      updateData.saiu_cedo = dados.saiu_cedo || '';
    }

    // Atualiza usando DatabaseManager
    const result = DatabaseManager.update('participacoes', participacao.id, updateData);

    if (result.ok) {
      console.log('✅ [BACKEND] Participação marcada com sucesso:', participacao.id);
      return { ok: true };
    } else {
      console.error('❌ [BACKEND] Erro ao marcar participação:', result.error);
      return { ok: false, error: result.error };
    }

  } catch (err) {
    console.error('❌ [BACKEND] Erro markParticipacao:', err);
    return { ok: false, error: 'Erro markParticipacao: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Confirma participação do próprio membro
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {string} confirmou - 'sim' ou 'nao'
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function confirmarParticipacao(activityId, memberId, confirmou, uid) {
  try {
    if (!activityId || !memberId || !confirmou) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    const ctx = getParticipacaesCtx_();
    const values = getFullTableValues_(ctx);

    if (!values || !values.length) {
      return { ok: false, error: 'Tabela de participações vazia.' };
    }

    const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
    const idxIdAtiv = header.indexOf('id_atividade');
    const idxIdMembro = header.indexOf('id_membro');
    const idxConfirmou = header.indexOf('confirmou');
    const idxConfirmadoEm = header.indexOf('confirmado_em');

    // Encontra a linha da participação
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[idxIdAtiv] == activityId && row[idxIdMembro] == memberId) {
        const rowNumber = ctx.startRow + i;
        const nowStr = nowString_();

        ctx.sheet.getRange(rowNumber, idxConfirmou + 1).setValue(confirmou);
        ctx.sheet.getRange(rowNumber, idxConfirmadoEm + 1).setValue(nowStr);

        return { ok: true };
      }
    }

    return { ok: false, error: 'Participação não encontrada.' };
  } catch (err) {
    return { ok: false, error: 'Erro confirmarParticipacao: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Busca membros por critérios para definição de alvos
 * @param {Object} filters - Filtros aplicados
 * @returns {Object} { ok: boolean, items: Array }
 */
function searchMembersByCriteria(filters) {
  try {
    // Usar DatabaseManager para buscar membros
    const members = DatabaseManager.query('membros', {}, false);

    if (!members || members.length === 0) {
      return { ok: true, items: [] };
    }

    // Aplicar filtros se fornecidos
    let filteredMembers = members;

    // Filtro por dojo
    if (filters.dojo && filters.dojo.trim()) {
      filteredMembers = filteredMembers.filter(member => {
        const memberDojo = (member.dojo || '').toString().toLowerCase();
        const filterDojo = filters.dojo.toLowerCase();
        return memberDojo.includes(filterDojo) || memberDojo === filterDojo;
      });
    }

    // Filtro por status
    if (filters.status && filters.status.trim()) {
      filteredMembers = filteredMembers.filter(member => {
        const memberStatus = (member.status || '').toString().toLowerCase();
        const filterStatus = filters.status.toLowerCase();
        return memberStatus === filterStatus;
      });
    }

    // Filtro por nome
    if (filters.nome && filters.nome.trim()) {
      const nomeFiltro = filters.nome.toLowerCase().trim();
      filteredMembers = filteredMembers.filter(member => {
        const memberNome = (member.nome || '').toString().toLowerCase();
        return memberNome.includes(nomeFiltro);
      });
    }

    // Otimizar dados: retornar apenas campos necessários
    const optimizedMembers = filteredMembers.map(member => ({
      codigo_sequencial: member.codigo_sequencial,
      nome: member.nome,
      dojo: member.dojo,
      status: member.status
    }));

    const result = { ok: true, items: optimizedMembers };
    return result;
  } catch (err) {
    return { ok: false, error: 'Erro searchMembersByCriteria: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Obtém estatísticas de participação de uma atividade
 * @param {string} activityId - ID da atividade
 * @returns {Object} { ok: boolean, stats: Object }
 */
function getParticipacaoStats(activityId) {
  try {
    const participacoes = listParticipacoes(activityId);

    if (!participacoes.ok) {
      return participacoes;
    }

    const total = participacoes.items.length;
    const confirmados = participacoes.items.filter(p => p.confirmou === 'sim').length;
    const recusados = participacoes.items.filter(p => p.confirmou === 'nao').length;
    const participaram = participacoes.items.filter(p => p.participou === 'sim').length;
    const ausentes = participacoes.items.filter(p => p.participou === 'nao').length;
    const pendentes = participacoes.items.filter(p => !p.participou).length;

    const percentualParticipacao = total > 0 ? Math.round((participaram / total) * 100) : 0;

    const stats = {
      total,
      confirmados,
      recusados,
      participaram,
      ausentes,
      pendentes,
      percentualParticipacao
    };

    return {
      ok: true,
      stats: stats
    };
  } catch (err) {
    return { ok: false, error: 'Erro getParticipacaoStats: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Adiciona membro extra (não estava nos alvos originais)
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function addExtraMember(activityId, memberId, uid) {
  try {
    if (!activityId || !memberId) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    // Verifica se já existe
    const existing = listParticipacoes(activityId);
    if (!existing.ok) return existing;

    const exists = existing.items.find(p => p.id_membro === memberId);
    if (exists) {
      return { ok: false, error: 'Membro já está na lista de participações.' };
    }

    return defineTargets(activityId, [memberId], uid);
  } catch (err) {
    return { ok: false, error: 'Erro addExtraMember: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Função alternativa para salvar alvos diretamente na planilha
 * Similar ao padrão usado em activities.gs - não depende do contexto
 * @param {string} activityId - ID da atividade
 * @param {Array} memberIds - Array de IDs dos membros
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean, created: number }
 */
async function saveTargetsDirectly(activityId, memberIds, uid) {
  try {
    if (!activityId || !memberIds || !Array.isArray(memberIds)) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    // ===== ETAPA 1: MIGRAÇÃO PARCIAL - Leitura via DatabaseManager =====
    // Buscar participações existentes da atividade usando DatabaseManager
    Logger.info('DEBUG-Participacoes', 'Buscando participações', { activityId });

    const queryResult = DatabaseManager.query('participacoes', {
      id_atividade: activityId.toString().trim(),
      tipo: 'alvo'
    }, false); // Sem cache - dados dinâmicos

    Logger.info('DEBUG-Participacoes', 'Query result type', {
      isArray: Array.isArray(queryResult),
      hasData: queryResult?.data ? 'sim' : 'nao'
    });

    const participacoes = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    Logger.info('DEBUG-Participacoes', 'Participações encontradas', {
      count: participacoes.length,
      ids: participacoes.map(p => p.id)
    });

    // Verifica alvos existentes e identifica mudanças
    const existingTargets = [];
    const existingMemberIds = [];

    participacoes.forEach(part => {
      // DatabaseManager já filtra soft delete automaticamente (deleted !== 'x')
      const memberId = String(part.id_membro || '').trim();

      if (memberId) {
        existingMemberIds.push(memberId);
        existingTargets.push({
          id: String(part.id || '').trim(),
          memberId: memberId,
          // Manter dados originais para compatibilidade com código legado
          participacao: part
        });
      }
    });

    const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id.toString()));
    const removedTargets = existingTargets.filter(target => !memberIds.includes(target.memberId));

    console.log('📊 DEBUG: Análise de mudanças:', {
      memberIdsRecebidos: memberIds,
      existingMemberIds: existingMemberIds,
      existingTargets: existingTargets,
      newMemberIds: newMemberIds,
      removedTargets: removedTargets
    });

    // Se não há mudanças, retornar
    if (newMemberIds.length === 0 && removedTargets.length === 0) {
      console.log('ℹ️ DEBUG: Nenhuma mudança detectada');
      return { ok: true, created: 0, deleted: 0, message: 'Nenhuma alteração necessária nos alvos.' };
    }

    // ===== ETAPA 2: MIGRAÇÃO PARCIAL - Soft Delete via DatabaseManager =====
    // Marcar alvos removidos como 'deleted'
    let deletedCount = 0;
    if (removedTargets.length > 0) {
      console.log('🗑️ DEBUG: Iniciando soft delete de alvos:', removedTargets);

      removedTargets.forEach(target => {
        try {
          console.log('🗑️ DEBUG: Deletando alvo:', { id: target.id, memberId: target.memberId });

          // Usar DatabaseManager.delete() para soft delete automático
          const deleteResult = DatabaseManager.delete('participacoes', target.id);

          console.log('🗑️ DEBUG: Resultado do delete:', deleteResult);

          if (deleteResult && deleteResult.success) {
            deletedCount++;
            Logger.info('Participacoes', 'Alvo removido (soft delete)', {
              participacaoId: target.id,
              membroId: target.memberId,
              atividadeId: activityId
            });
          } else {
            console.error('❌ DEBUG: Falha ao deletar:', deleteResult);
            Logger.warn('Participacoes', 'Falha ao remover alvo', {
              participacaoId: target.id,
              error: deleteResult?.error
            });
          }
        } catch (err) {
          console.error('❌ DEBUG: Exceção ao deletar:', err);
          Logger.error('Participacoes', 'Erro ao deletar alvo', {
            participacaoId: target.id,
            error: err.message
          });
        }
      });

      console.log('🗑️ DEBUG: Total deletado:', deletedCount);
    }

    // ===== ETAPA 3: MIGRAÇÃO COMPLETA - INSERT via DatabaseManager =====
    let createdCount = 0;
    if (newMemberIds.length > 0) {
      Logger.info('DEBUG-Participacoes', 'Iniciando insert de alvos', {
        count: newMemberIds.length,
        memberIds: newMemberIds
      });

      for (const memberId of newMemberIds) {
        try {
          // Criar objeto de dados para inserção
          const novoAlvo = {
            id_atividade: activityId,
            id_membro: memberId,
            tipo: 'alvo',
            confirmou: '',
            confirmado_em: '',
            participou: '',
            chegou_tarde: '',
            saiu_cedo: '',
            justificativa: '',
            observacoes: '',
            // marcado_em: NÃO enviar - deve ficar vazio até marcar participação
            // marcado_por: NÃO enviar - deve ficar vazio até marcar participação
            status_participacao: ''
          };

          Logger.info('DEBUG-Participacoes', 'Inserindo alvo', {
            memberId,
            activityId
          });

          // Usar DatabaseManager.insert() - gera ID automaticamente (async)
          const insertResult = await DatabaseManager.insert('participacoes', novoAlvo);

          Logger.info('DEBUG-Participacoes', 'Resultado insert completo', {
            memberId,
            insertResult: JSON.stringify(insertResult)
          });

          if (insertResult && insertResult.success) {
            createdCount++;
            Logger.info('Participacoes', 'Alvo adicionado', {
              participacaoId: insertResult.id,
              membroId: memberId,
              atividadeId: activityId
            });
          } else {
            Logger.warn('Participacoes', 'Falha ao adicionar alvo', {
              membroId: memberId,
              insertResultCompleto: JSON.stringify(insertResult),
              error: insertResult?.error
            });
          }
        } catch (err) {
          Logger.error('Participacoes', 'Erro ao inserir alvo', {
            membroId: memberId,
            error: err.message
          });
        }
      }

      Logger.info('DEBUG-Participacoes', 'Insert concluído', { createdCount });
    }

    Logger.info('DEBUG-Participacoes', 'Finalizando saveTargetsDirectly', {
      createdCount,
      deletedCount,
      returning: 'success'
    });

    return {
      ok: true,
      created: createdCount, // ETAPA 3: Usando contador do DatabaseManager.insert()
      deleted: deletedCount, // ETAPA 2: Usando contador do DatabaseManager.delete()
      message: `Alvos atualizados: ${createdCount} adicionados, ${deletedCount} removidos`
    };

  } catch (err) {
    Logger.error('Participacoes', 'ERRO FATAL em saveTargetsDirectly', {
      error: err.message,
      stack: err.stack
    });
    return { ok: false, error: 'Erro saveTargetsDirectly: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Função alternativa para salvar participação diretamente na planilha
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {Object} dados - Dados da participação
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function saveParticipacaoDirectly(activityId, memberId, dados, uid) {
  try {
    console.log('🔧 [BACKEND] saveParticipacaoDirectly chamada com:');
    console.log('🔧 [BACKEND] - activityId:', activityId);
    console.log('🔧 [BACKEND] - memberId:', memberId);
    console.log('🔧 [BACKEND] - dados:', JSON.stringify(dados, null, 2));
    console.log('🔧 [BACKEND] - uid:', uid);

    // Se dados.id estiver presente, usar busca por ID da tabela
    if (dados && dados.id) {
      console.log('🔧 [BACKEND] Usando busca por ID da tabela:', dados.id);
      return updateParticipacaoById(dados.id, dados, uid);
    }

    // Lógica antiga (fallback) - busca por activityId + memberId usando DatabaseManager
    console.log('🔧 [BACKEND] Usando busca por activityId + memberId (fallback)');
    console.log('🔧 [BACKEND] - dados.id não encontrado, usando fallback');
    return markParticipacao(activityId, memberId, dados, uid);

  } catch (err) {
    return { ok: false, error: 'Erro saveParticipacaoDirectly: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Atualiza participação usando ID específico da tabela
 * @param {string} participacaoId - ID específico da participação (ex: PART-0001)
 * @param {Object} dados - Dados da participação
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function updateParticipacaoById(participacaoId, dados, uid) {
  try {
    if (!participacaoId || !dados) {
      return { ok: false, error: 'Parâmetros inválidos para updateParticipacaoById.' };
    }

    console.log('🔧 [BACKEND] updateParticipacaoById chamada com ID:', participacaoId);

    // Busca a participação pelo ID usando DatabaseManager
    const participacao = DatabaseManager.findByField('participacoes', 'id', participacaoId);

    if (!participacao) {
      console.error('🔧 [BACKEND] Participação não encontrada para ID:', participacaoId);
      return { ok: false, error: 'Participação não encontrada para o ID: ' + participacaoId };
    }

    // Verifica se a participação não está deletada
    if (participacao.deleted === 'x') {
      return { ok: false, error: 'Participação está marcada como deletada.' };
    }

    console.log('🔧 [BACKEND] Participação encontrada:', participacao);

    // Prepara os dados para atualização
    const updateData = {
      participou: dados.participou || '',
      chegou_tarde: dados.chegou_tarde || '',
      saiu_cedo: dados.saiu_cedo || '',
      observacoes: dados.observacoes || '',
      marcado_em: nowString_(),
      marcado_por: uid || ''
    };

    console.log('🔧 [BACKEND] Dados para atualização:', updateData);

    // Atualiza usando DatabaseManager
    const result = DatabaseManager.update('participacoes', participacaoId, updateData);

    if (result.ok) {
      console.log('✅ [BACKEND] Participação atualizada com sucesso para ID:', participacaoId);
      return { ok: true, message: 'Participação atualizada com sucesso.' };
    } else {
      console.error('❌ [BACKEND] Erro na atualização:', result.error);
      return { ok: false, error: result.error };
    }

  } catch (err) {
    console.error('❌ [BACKEND] Erro updateParticipacaoById:', err);
    return { ok: false, error: 'Erro updateParticipacaoById: ' + (err && err.message ? err.message : err) };
  }
}

// Funções auxiliares

function getParticipacaesCtx_() {
  try {
    const ref = getPlanRef_('participacoes');
    const ctxPlan = getContextFromRef_(ref);

    // Quando for named_range (ex.: PARTICIPACOES_TBL)
    if (ctxPlan.namedRange) {
      const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
        ? SpreadsheetApp.openById(ref.ssid)
        : SpreadsheetApp.getActiveSpreadsheet();
      const rng = ss.getRangeByName(ctxPlan.namedRange);
      return {
        sheet: rng.getSheet(),
        startRow: rng.getRow(),
        startCol: rng.getColumn()
      };
    }

    // Fallback: planilha!range_a1
    const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
      ? SpreadsheetApp.openById(ref.ssid)
      : SpreadsheetApp.getActiveSpreadsheet();

    const sheet = ss.getSheetByName(ctxPlan.planilha);
    if (!sheet) throw new Error(`Aba "${ctxPlan.planilha}" não encontrada.`);

    return {
      sheet: sheet,
      startRow: 1,
      startCol: 1
    };
  } catch (err) {
    return null;
  }
}

function generateParticipacaoId_() {
  try {
    const ctx = getParticipacaesCtx_();
    const values = getFullTableValues_(ctx);

    if (!values || values.length < 2) {
      return 'PART-0001';
    }

    const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
    const idIdx = header.indexOf('id');

    let maxNum = 0;
    for (let i = 1; i < values.length; i++) {
      const id = String(values[i][idIdx] || '').trim();
      const match = id.match(/^PART-(\d+)$/);
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1], 10));
      }
    }

    return 'PART-' + String(maxNum + 1).padStart(4, '0');
  } catch (err) {
    return 'PART-0001';
  }
}