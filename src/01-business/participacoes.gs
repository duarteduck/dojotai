// participacoes.gs - Sistema de Gestão de Participações em Atividades

/**
 * Lista participações usando DatabaseManager
 * @param {string} sessionId - ID da sessão do usuário
 * @param {string} activityId - ID da atividade
 */
async function listParticipacoes(sessionId, activityId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Participacoes');
    if (!auth.ok) return auth;

    if (!activityId) {
      return { ok: false, error: 'ID da atividade é obrigatório.' };
    }

    const filters = {
      id_atividade: activityId.toString().trim()
    };

    const participacoes = DatabaseManager.query('participacoes', filters, false);

    if (!participacoes) {
      return { ok: true, items: [] };
    }

    // Buscar membros para ordenação alfabética
    const membros = DatabaseManager.query('membros', {}, false) || [];
    const membrosMap = {};
    membros.forEach(m => {
      membrosMap[m.codigo_sequencial] = m.nome || '';
    });

    // Filtra, adiciona nome do membro e ordena
    const activeParticipacoes = participacoes
      .filter(p => p.deleted !== 'x')
      .map(p => ({
        id: p.id,
        id_atividade: p.id_atividade,
        id_membro: p.id_membro,
        nome_membro: membrosMap[p.id_membro] || 'Nome não encontrado',
        tipo: p.tipo,
        confirmou: p.confirmou,
        participou: p.participou,
        chegou_tarde: p.chegou_tarde,
        saiu_cedo: p.saiu_cedo,
        observacoes: p.observacoes,
        deleted: p.deleted
      }))
      .sort((a, b) => {
        const nomeA = (a.nome_membro || '').toLowerCase();
        const nomeB = (b.nome_membro || '').toLowerCase();
        return nomeA.localeCompare(nomeB, 'pt-BR');
      });

    return { ok: true, items: activeParticipacoes };

  } catch (error) {
    Logger.error('Participacoes', 'Erro ao listar participações', { activityId, error: error.message });
    return { ok: false, error: 'Erro: ' + error.message };
  }
}

// ============================================================================
// FUNÇÃO REMOVIDA: calculateStatusParticipacao() - participacoes.gs:51-73
//
// Motivo: Padrão inconsistente com data_dictionary.gs
// - Função retornava: 'ausente_justificado', 'chegou_tarde', etc (minúsculo com underscore)
// - Dicionário define: 'Confirmado', 'Presente', 'Ausente', 'Justificado' (PascalCase)
// - Função não estava sendo utilizada em nenhum lugar do sistema
//
// Removido em: Limpeza de Código - Fase de Correção de Participações
// Data: 03/10/2025
// Linhas removidas: 23 (incluindo JSDoc)
// Próximo passo: Recriar dentro do padrão correto quando necessário
// ============================================================================

// ============================================================================
// FUNÇÃO REMOVIDA: defineTargets() - participacoes.gs:65-131
//
// Motivo: Substituída por saveTargetsDirectly() que é mais robusta
// - saveTargetsDirectly() tem suporte async, soft delete, logs detalhados
// - defineTargets() era versão antiga sem detecção de alvos removidos
// - Função não estava sendo utilizada no frontend (app_migrated.html)
//
// Removido em: Limpeza de Código - Fase de Correção de Participações
// Data: 03/10/2025
// Linhas removidas: 67 (incluindo JSDoc)
// Substituída por: saveTargetsDirectly() (linha 345+)
// ============================================================================

// ============================================================================
// FUNÇÃO REMOVIDA: markParticipacao() - participacoes.gs:79-141
//
// Motivo: Substituída por updateParticipacaoById() que é mais direta
// - updateParticipacaoById() busca por ID específico da participação (PART-XXXX)
// - markParticipacao() fazia busca por activityId + memberId (método antigo)
// - Mesma funcionalidade, mas updateParticipacaoById() é mais eficiente
//
// Removido em: Limpeza de Código - Fase de Correção de Participações
// Data: 03/10/2025
// Linhas removidas: 63 (incluindo JSDoc)
// Substituída por: updateParticipacaoById() (linha 509+)
// ============================================================================

// ============================================================================
// FUNÇÃO REMOVIDA: confirmarParticipacao() - participacoes.gs:215-260
//
// Motivo: Função não está em uso - não há chamadas no frontend ou backend
// - Usa acesso direto à planilha (sheet.getRange().setValue())
// - Usa nowString_() (linha 247)
// - Funcionalidade substituída por markParticipacao() (já migrado para DatabaseManager)
//
// Removido em: Migração #2 - Fase 1, Limpeza de Código Obsoleto
// Data: 02/10/2025
// Linhas removidas: 46 (incluindo JSDoc)
// Benefício: Remove 1 uso de nowString_() + código obsoleto
// ============================================================================

/**
 * Busca membros por critérios para definição de alvos
 * @param {string} sessionId - ID da sessão do usuário
 * @param {Object} filters - Filtros aplicados
 * @returns {Object} { ok: boolean, items: Array }
 */
/**
 * Busca membros com filtros dinâmicos
 * Aceita valores simples (string/number) ou múltiplos (array)
 * Filtra pelos campos _id (foreign keys) e campos numéricos diretamente
 *
 * EXEMPLOS:
 * - Filtro simples: { status_membro_id: 1 }
 * - Filtro múltiplo: { dojo_id: [1, 2] }
 * - Filtros combinados: { status_membro_id: 1, dojo_id: [1, 2], nome: 'João' }
 * - Campo texto: { nome: 'João' } (usa CONTAINS)
 * - Campo numérico array: { buntai: [1, 2] } (usa IN)
 */
async function searchMembersByCriteria(sessionId, filters = {}) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Participacoes');
    if (!auth.ok) return auth;

    // Separar filtros: exatos (para DatabaseManager) vs complexos (para JS)
    const exactFilters = {};
    const complexFilters = {};

    Object.keys(filters).forEach(field => {
      const value = filters[field];

      // Ignorar valores vazios
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Detectar tipo de filtro
      if (Array.isArray(value)) {
        // Array = filtro IN (múltiplos valores)
        complexFilters[field] = { type: 'IN', values: value };
      } else if (field === 'nome') {
        // Campo 'nome' sempre usa CONTAINS
        complexFilters[field] = { type: 'CONTAINS', value: value };
      } else if (typeof value === 'string' && value.trim()) {
        // String simples = EQUALS (passa para DatabaseManager)
        exactFilters[field] = value.trim();
      } else {
        // Outros tipos (não deveria acontecer, mas por segurança)
        exactFilters[field] = value;
      }
    });

    Logger.debug('searchMembersByCriteria', 'Filtros processados', {
      filters: filters,
      exact: exactFilters,
      complex: complexFilters
    });

    // Query otimizada: passa filtros exatos para DatabaseManager (aproveita cache!)
    const members = DatabaseManager.query('membros', exactFilters, true);

    if (!members || members.length === 0) {
      return { ok: true, items: [], total: 0 };
    }

    // Aplicar filtros complexos em memória
    let filteredMembers = members;

    Object.keys(complexFilters).forEach(field => {
      const filter = complexFilters[field];

      if (filter.type === 'IN') {
        // Filtro IN: campo está em lista de valores
        filteredMembers = filteredMembers.filter(member => {
          const memberValue = member[field];

          // Ignorar membros com valor vazio/null/undefined
          if (memberValue === null || memberValue === undefined || memberValue === '') {
            return false;
          }

          // Comparar valores (numéricos ou strings)
          return filter.values.some(filterValue => {
            // Comparar como números (campos _id e buntai)
            const memberNum = Number(memberValue);
            const filterNum = Number(filterValue);

            if (!isNaN(memberNum) && !isNaN(filterNum)) {
              return memberNum === filterNum;
            }

            // Fallback para campos texto futuros (case-insensitive)
            return memberValue.toString().toLowerCase() === filterValue.toString().toLowerCase();
          });
        });
      } else if (filter.type === 'CONTAINS') {
        // Filtro CONTAINS: campo contém valor
        const searchValue = filter.value.toString().toLowerCase();
        filteredMembers = filteredMembers.filter(member => {
          const memberValue = (member[field] || '').toString().toLowerCase();
          return memberValue.includes(searchValue);
        });
      }
    });

    // Retornar apenas campos necessários (otimiza tráfego)
    const optimizedMembers = filteredMembers.map(member => ({
      codigo_sequencial: member.codigo_sequencial,
      nome: member.nome,
      dojo: member.dojo,
      status: member.status,
      categoria_grupo: member.categoria_grupo,
      categoria_membro: member.categoria_membro
    }));

    return {
      ok: true,
      items: optimizedMembers,
      total: optimizedMembers.length
    };

  } catch (err) {
    Logger.error('Participacoes', 'Erro em searchMembersByCriteria', {
      error: err.message,
      filters
    });
    return {
      ok: false,
      error: 'Erro ao buscar membros: ' + (err?.message || err)
    };
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
 * Obtém estatísticas de participação para MÚLTIPLAS atividades de uma vez (OTIMIZADO)
 * @param {Array<string>} activityIds - Array de IDs das atividades
 * @returns {Object} { ok: boolean, statsMap: Object } - Mapa com activityId -> stats
 */
function getParticipacaoStatsBatch(activityIds) {
  try {
    console.log('⚡ getParticipacaoStatsBatch chamado para', activityIds.length, 'atividades');

    if (!activityIds || activityIds.length === 0) {
      return { ok: true, statsMap: {} };
    }

    // 1. Ler TODA a tabela de participações UMA ÚNICA VEZ
    const todasParticipacoes = DatabaseManager.query('participacoes', {}, false) || [];
    console.log('📊 Total de participações na tabela:', todasParticipacoes.length);

    // 2. Filtrar apenas participações ativas
    const participacoesAtivas = todasParticipacoes.filter(p => p.deleted !== 'x');
    console.log('📊 Participações ativas:', participacoesAtivas.length);

    // 3. Agrupar participações por atividade
    const participacoesPorAtividade = {};
    activityIds.forEach(id => {
      participacoesPorAtividade[id] = [];
    });

    participacoesAtivas.forEach(p => {
      const actId = (p.id_atividade || '').toString().trim();
      if (participacoesPorAtividade.hasOwnProperty(actId)) {
        participacoesPorAtividade[actId].push(p);
      }
    });

    // 4. Calcular stats para cada atividade
    const statsMap = {};
    activityIds.forEach(activityId => {
      const participacoes = participacoesPorAtividade[activityId] || [];

      const total = participacoes.length;
      const confirmados = participacoes.filter(p => p.confirmou === 'sim').length;
      const recusados = participacoes.filter(p => p.confirmou === 'nao').length;
      const participaram = participacoes.filter(p => p.participou === 'sim').length;
      const ausentes = participacoes.filter(p => p.participou === 'nao').length;
      const pendentes = participacoes.filter(p => !p.participou).length;
      const percentualParticipacao = total > 0 ? Math.round((participaram / total) * 100) : 0;

      statsMap[activityId] = {
        total,
        confirmados,
        recusados,
        participaram,
        ausentes,
        pendentes,
        percentualParticipacao
      };
    });

    console.log('✅ Stats calculados para', Object.keys(statsMap).length, 'atividades');
    return {
      ok: true,
      statsMap: statsMap
    };
  } catch (err) {
    console.error('❌ Erro getParticipacaoStatsBatch:', err);
    return { ok: false, error: 'Erro getParticipacaoStatsBatch: ' + (err && err.message ? err.message : err) };
  }
}

// ============================================================================
// FUNÇÃO REMOVIDA: addExtraMember() - participacoes.gs:330-355
//
// Motivo: Funcionalidade duplicada/redundante
// - Apenas um wrapper para defineTargets() ou saveTargetsDirectly()
// - Mesma funcionalidade já existe de forma mais robusta em saveTargetsDirectly()
// - Função não estava sendo utilizada em nenhum lugar do sistema
//
// Removido em: Limpeza de Código - Fase de Correção de Participações
// Data: 03/10/2025
// Linhas removidas: 26 (incluindo JSDoc)
// Próximo passo: Usar saveTargetsDirectly() diretamente quando necessário
// ============================================================================

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
 * @param {string} sessionId - ID da sessão do usuário
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {Object} dados - Dados da participação
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
async function saveParticipacaoDirectly(sessionId, activityId, memberId, dados, uid) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Participacoes');
    if (!auth.ok) return auth;

    console.log('🔧 [BACKEND] saveParticipacaoDirectly chamada com:');
    console.log('🔧 [BACKEND] - activityId:', activityId);
    console.log('🔧 [BACKEND] - memberId:', memberId);
    console.log('🔧 [BACKEND] - dados:', JSON.stringify(dados, null, 2));
    console.log('🔧 [BACKEND] - uid:', uid);

    // Sempre usar busca por ID da tabela (padrão atual)
    if (dados && dados.id) {
      console.log('🔧 [BACKEND] Usando busca por ID da tabela:', dados.id);
      return await updateParticipacaoById(dados.id, dados, uid);
    }

    // Fallback para busca por activityId + memberId (casos legados)
    console.log('⚠️ [BACKEND] FALLBACK: dados.id não fornecido, buscando por activityId + memberId');

    // Buscar participação por filtros
    const filters = {
      id_atividade: activityId.toString(),
      id_membro: memberId.toString()
    };

    const participacoes = DatabaseManager.query('participacoes', filters, false);

    if (!participacoes || participacoes.length === 0) {
      return { ok: false, error: 'Participação não encontrada.' };
    }

    const participacao = participacoes.find(p => p.deleted !== 'x');

    if (!participacao || !participacao.id) {
      return { ok: false, error: 'Participação ativa não encontrada.' };
    }

    console.log('🔧 [BACKEND] Participação encontrada via fallback:', participacao.id);

    // Usar updateParticipacaoById com o ID encontrado (await porque é async)
    return await updateParticipacaoById(participacao.id, dados, uid);

  } catch (err) {
    return { ok: false, error: 'Erro saveParticipacaoDirectly: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Cria múltiplas participações em batch (membros extras)
 * @param {string} sessionId - ID da sessão do usuário
 * @param {string} activityId - ID da atividade
 * @param {Array<Object>} membrosData - Array de {memberId, tipo}
 * @param {string} uid - UID do usuário que está criando
 * @returns {Object} { ok: boolean, created: number, skipped: number, message: string }
 */
async function createMultipleParticipacoes(sessionId, activityId, membrosData, uid) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Participacoes');
    if (!auth.ok) return auth;

    // Validar parâmetros
    if (!activityId) {
      return { ok: false, error: 'ID da atividade é obrigatório.' };
    }

    if (!Array.isArray(membrosData) || membrosData.length === 0) {
      return { ok: false, error: 'Array de membros é obrigatório e não pode estar vazio.' };
    }

    Logger.info('Participacoes', 'Criando múltiplas participações', {
      activityId,
      quantidade: membrosData.length,
      uid
    });

    // Buscar participações existentes para evitar duplicatas
    const existentes = DatabaseManager.query('participacoes', {
      id_atividade: activityId
    }, false) || [];

    const existentesMembrosSet = new Set(
      existentes
        .filter(p => p.deleted !== 'x')
        .map(p => p.id_membro.toString())
    );

    Logger.debug('Participacoes', 'Participações existentes verificadas', {
      total: existentes.length,
      ativos: existentesMembrosSet.size
    });

    // Inserir novos membros
    let createdCount = 0;
    let skippedCount = 0;

    for (const membroData of membrosData) {
      const memberId = membroData.memberId.toString();

      // Verificar se já existe participação ativa para este membro
      if (existentesMembrosSet.has(memberId)) {
        Logger.debug('Participacoes', 'Participação já existe, pulando', {
          memberId,
          activityId
        });
        skippedCount++;
        continue;
      }

      // Montar dados da participação seguindo data_dictionary.gs
      const novaParticipacao = {
        // Campos obrigatórios
        id_atividade: activityId,
        id_membro: memberId,
        tipo: membroData.tipo || 'extra',
        marcado_em: nowString_(),

        // Campos opcionais (usar dados do frontend se fornecidos, senão vazio)
        confirmou: '',
        confirmado_em: '',
        participou: membroData.participou || '',
        chegou_tarde: membroData.chegou_tarde || '',
        saiu_cedo: membroData.saiu_cedo || '',
        status_participacao: (membroData.participou === 'sim') ? 'Presente' : '',
        justificativa: '',
        observacoes: membroData.observacoes || '',
        marcado_por: uid || '',
        deleted: ''
      };

      // Inserir usando DatabaseManager (padrão do projeto)
      const insertResult = await DatabaseManager.insert('participacoes', novaParticipacao);

      if (insertResult && insertResult.success) {
        createdCount++;
        Logger.info('Participacoes', 'Participação criada com sucesso', {
          participacaoId: insertResult.id,
          memberId,
          tipo: novaParticipacao.tipo
        });
      } else {
        Logger.warn('Participacoes', 'Falha ao criar participação', {
          memberId,
          error: insertResult?.error
        });
      }
    }

    const message = `${createdCount} participações criadas, ${skippedCount} já existentes`;
    Logger.info('Participacoes', 'Batch insert finalizado', {
      created: createdCount,
      skipped: skippedCount
    });

    return {
      ok: true,
      created: createdCount,
      skipped: skippedCount,
      message: message
    };

  } catch (error) {
    Logger.error('Participacoes', 'Erro em createMultipleParticipacoes', {
      error: error.message,
      stack: error.stack
    });
    return { ok: false, error: 'Erro ao criar participações: ' + error.message };
  }
}

/**
 * Atualiza participação usando ID específico da tabela
 * @param {string} participacaoId - ID específico da participação (ex: PART-0001)
 * @param {Object} dados - Dados da participação
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
async function updateParticipacaoById(participacaoId, dados, uid) {
  try {
    if (!participacaoId || !dados) {
      return { ok: false, error: 'Parâmetros inválidos para updateParticipacaoById.' };
    }

    console.log('🔧 [BACKEND] updateParticipacaoById chamada com ID:', participacaoId);

    // Busca a participação pelo ID usando DatabaseManager.query com filtro
    const participacoes = DatabaseManager.query('participacoes', { id: participacaoId }, true);

    if (!participacoes || participacoes.length === 0) {
      console.error('🔧 [BACKEND] Participação não encontrada para ID:', participacaoId);
      return { ok: false, error: 'Participação não encontrada para o ID: ' + participacaoId };
    }

    const participacao = participacoes[0];

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

    // Atualizar status_participacao automaticamente baseado em participou
    if (dados.participou === 'sim') {
      updateData.status_participacao = 'Presente';
    } else if (dados.participou === 'nao') {
      updateData.status_participacao = 'Ausente';
    } else {
      updateData.status_participacao = ''; // Pendente/não definido
    }

    console.log('🔧 [BACKEND] Dados para atualização:', updateData);

    // Atualiza usando DatabaseManager (await porque é async)
    const result = await DatabaseManager.update('participacoes', participacaoId, updateData);

    if (result.success) {
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