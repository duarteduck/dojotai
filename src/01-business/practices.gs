/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🥋 PRACTICES - BUSINESS LOGIC (CORE)
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Funções core de lógica de negócio para o sistema de práticas diárias.
 *
 * IMPORTANTE:
 * - Todas as funções são privadas (prefixo _)
 * - Chamadas apenas pelas APIs em src/02-api/practices_api.gs
 * - Validação de sessão e membro feita nas APIs
 * - Usar DatabaseManager para todas as operações
 * - Usar Logger para todas as operações
 *
 * MODELO DE DADOS:
 * - praticas_cadastro: Cadastro de práticas (PRAC-0001, PRAC-0002...)
 * - praticas_diarias: Registros diários (1 linha por prática por dia)
 * - praticas_observacoes: Observações do dia (1 linha por membro por dia)
 *
 * FUNÇÕES IMPLEMENTADAS:
 * - _loadAvailablePractices(memberId)
 * - _savePracticeCore(membroId, data, praticaId, quantidade) - UPSERT
 * - _loadPracticesByMemberAndDateRange(memberId, startDate, endDate)
 * - _saveObservationCore(membroId, data, observacao) - UPSERT
 * - _loadObservationByMemberAndDate(memberId, date)
 *
 * @fileoverview Business logic para práticas diárias
 * @version 1.0.0
 * @since 2025-01-20
 */
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 📋 PRÁTICAS CADASTRADAS (CONFIG)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
/**
 * Carrega lista de práticas disponíveis do cadastro
 *
 * @description Retorna todas as práticas ativas ordenadas por ordem.
 * Futuramente pode filtrar por grupo/categoria do membro.
 *
 * @param {number} [memberId=null] - ID do membro (para filtros futuros)
 * @returns {Object} { ok: boolean, items: [], error?: string }
 *
 * @example
 * const result = _loadAvailablePractices();
 * if (result.ok) {
 *   result.items.forEach(pratica => {
 *     console.log(pratica.nome, pratica.tipo);
 *   });
 * }
 */
async function _loadAvailablePractices(memberId = null) { // ✅ Adicionado 'async'
  try {
    Logger.debug('PracticesCore', 'Carregando práticas disponíveis', { memberId });
    // Buscar todas práticas ativas
    const result = await DatabaseManager.query('praticas_cadastro', { // ✅ Adicionado 'await'
      status: 'Ativo',
      deleted: ''
    });
    const praticas = Array.isArray(result) ? result : (result?.data || []);
    if (!praticas || praticas.length === 0) {
      Logger.warn('PracticesCore', 'Nenhuma prática cadastrada encontrada');
      return {
        ok: true,
        items: []
      };
    }
    // Ordenar por campo "ordem"
    praticas.sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
    // [FUTURO] Filtrar por grupo/categoria do membro
    // if (memberId) {
    //   const membro = await DatabaseManager.query('membros', { codigo_sequencial: memberId })[0]; // Exemplo de await futuro
    //   const praticasFiltradas = praticas.filter(p => {
    //     if (p.categoria_grupo && p.categoria_grupo !== membro.categoria_grupo) return false;
    //     if (p.categoria_membro && p.categoria_membro !== membro.categoria_membro) return false;
    //     return true;
    //   });
    //   return { ok: true, items: praticasFiltradas };
    // }
    Logger.debug('PracticesCore', 'Práticas carregadas', { count: praticas.length });
    return {
      ok: true,
      items: praticas
    };
  } catch (error) {
    Logger.error('PracticesCore', 'Erro ao carregar práticas disponíveis', {
      error: error.message,
      stack: error.stack
    });
    return {
      ok: false,
      error: 'Erro ao carregar práticas disponíveis: ' + error.message
    };
  }
}
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 📊 PRÁTICAS DIÁRIAS (DADOS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
/**
 * Salva ou atualiza uma prática diária (UPSERT)
 *
 * @description Implementa lógica UPSERT:
 * - Se registro existe (membro + data + pratica) → UPDATE
 * - Se não existe → INSERT
 *
 * Garante constraint: 1 linha por prática por dia por membro
 *
 * @param {number} membroId - Código sequencial do membro
 * @param {string} data - Data da prática (yyyy-MM-dd)
 * @param {string} praticaId - ID da prática (PRAC-0001, PRAC-0002...)
 * @param {number} quantidade - Quantidade realizada (contador) ou 0/1 (sim_nao)
 * @returns {Object} { ok: boolean, id?: string, isNew?: boolean, error?: string }
 *
 * @example
 * const result = _savePracticeCore(5, '2025-01-15', 'PRAC-0001', 3);
 * if (result.ok) {
 * console.log('Prática salva:', result.id, result.isNew ? 'NOVA' : 'ATUALIZADA');
 * }
 */
async function _savePracticeCore(membroId, data, praticaId, quantidade) {
  try {
    Logger.debug('PracticesCore', 'Salvando prática', { membroId, data, praticaId, quantidade });
    // Validações
    if (!membroId || !data || !praticaId) {
      Logger.warn('PracticesCore', 'Parâmetros obrigatórios ausentes', { membroId, data, praticaId });
      return {
        ok: false,
        error: 'Parâmetros obrigatórios ausentes (membroId, data, praticaId)'
      };
    }
    // Validar quantidade (pode ser 0)
    if (quantidade === null || quantidade === undefined) {
      Logger.warn('PracticesCore', 'Quantidade não informada', { membroId, data, praticaId });
      return {
        ok: false,
        error: 'Quantidade é obrigatória'
      };
    }
    // Validar se prática existe e está ativa
    const praticaResult = await DatabaseManager.query('praticas_cadastro', { // ✅ Adicionado 'await'
      id: praticaId,
      status: 'Ativo',
      deleted: ''
    });
    const pratica = Array.isArray(praticaResult)
      ? praticaResult[0]
      : (praticaResult?.data?.[0] || null);
    if (!pratica) {
      Logger.warn('PracticesCore', 'Prática não encontrada ou inativa', { praticaId });
      return {
        ok: false,
        error: 'Prática não encontrada ou inativa'
      };
    }
    // Verificar se já existe registro (UPSERT logic)
    const existingResult = await DatabaseManager.query('praticas_diarias', { // ✅ Adicionado 'await'
      membro_id: membroId,
      data: data,
      pratica_id: praticaId,
      deleted: ''
    }, { useCache: false });

    const existing = Array.isArray(existingResult)
      ? existingResult[0]
      : (existingResult?.data?.[0] || null);
    const now = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');
    if (existing) {
      // UPDATE - Registro já existe
      Logger.debug('PracticesCore', 'Atualizando prática existente', {
        id: existing.id,
        qtdAnterior: existing.quantidade,
        qtdNova: quantidade
      });
      const updateResult = await DatabaseManager.update('praticas_diarias', existing.id, {
        quantidade: quantidade,
        atualizado_em: now
      });

      if (!updateResult.success) {
        Logger.error('PracticesCore', 'Erro ao atualizar prática', {
          id: existing.id,
          error: updateResult.error
        });
        return {
          ok: false,
          error: 'Erro ao atualizar prática: ' + updateResult.error
        };
      }

      Logger.debug('PracticesCore', 'Prática atualizada', { id: existing.id });
      return {
        ok: true,
        id: existing.id,
        isNew: false
      };
    } else {
      // INSERT - Novo registro
      Logger.debug('PracticesCore', 'Criando nova prática');

      // Gerar ID composto: membro_id|data|pratica_id (elimina race condition)
      const compositeId = `${membroId}|${data}|${praticaId}`;

      const insertData = {
        id: compositeId,
        membro_id: membroId,
        data: data,
        pratica_id: praticaId,
        quantidade: quantidade,
        criado_em: now,
        atualizado_em: '',
        deleted: ''
      };

      const insertResult = await DatabaseManager.insert('praticas_diarias', insertData);

      if (!insertResult.success) {
        Logger.error('PracticesCore', 'Erro ao inserir prática', { error: insertResult.error });
        return {
          ok: false,
          error: 'Erro ao inserir prática: ' + (insertResult.error || 'Erro desconhecido')
        };
      }

      Logger.debug('PracticesCore', 'Prática criada', { id: insertResult.id });
      return {
        ok: true,
        id: insertResult.id,
        isNew: true
      };
    }
  } catch (error) {
    Logger.error('PracticesCore', 'Erro ao salvar prática', {
      membroId,
      data,
      praticaId,
      error: error.message
    });
    return {
      ok: false,
      error: 'Erro ao salvar prática: ' + error.message
    };
  }
}
/**
 * Carrega práticas de um membro em um intervalo de datas
 *
 * @description Retorna todos os registros de práticas diárias do membro
 * no período especificado. Enriquece com dados de praticas_cadastro.
 *
 * @param {number} memberId - Código sequencial do membro
 * @param {string} startDate - Data inicial (yyyy-MM-dd)
 * @param {string} endDate - Data final (yyyy-MM-dd)
 * @returns {Object} { ok: boolean, items: [], error?: string }
 *
 * @example
 * const result = _loadPracticesByMemberAndDateRange(5, '2025-01-01', '2025-01-31');
 * if (result.ok) {
 *   result.items.forEach(registro => {
 *     console.log(registro.data, registro.pratica_nome, registro.quantidade);
 *   });
 * }
 */
async function _loadPracticesByMemberAndDateRange(memberId, startDate, endDate) { // ✅ Adicionado 'async'
  try {
    Logger.debug('PracticesCore', 'Carregando práticas por período', {
      memberId,
      startDate,
      endDate
    });
    // Validações
    if (!memberId) {
      return {
        ok: false,
        error: 'memberId é obrigatório'
      };
    }
    if (!startDate || !endDate) {
      return {
        ok: false,
        error: 'startDate e endDate são obrigatórios'
      };
    }
    // Query práticas diárias
    const result = await DatabaseManager.query('praticas_diarias', { // ✅ Adicionado 'await'
      membro_id: memberId,
      deleted: ''
    });
    let praticas = Array.isArray(result) ? result : (result?.data || []);
    // Filtrar por intervalo de datas (query não suporta >= <=)
    praticas = praticas.filter(p => {
      return p.data >= startDate && p.data <= endDate;
    });
    if (!praticas || praticas.length === 0) {
      Logger.debug('PracticesCore', 'Nenhuma prática encontrada', {
        memberId,
        startDate,
        endDate
      });
      return {
        ok: true,
        items: []
      };
    }
    // Buscar TODAS as práticas do cadastro para enriquecer
    const cadastroResult = await DatabaseManager.query('praticas_cadastro', { // ✅ Adicionado 'await'
      deleted: ''
    });
    const cadastro = Array.isArray(cadastroResult)
      ? cadastroResult
      : (cadastroResult?.data || []);
    // Criar Map de lookup (performance)
    const cadastroMap = new Map();
    cadastro.forEach(p => {
      cadastroMap.set(p.id, p);
    });
    // Enriquecer práticas diárias com dados do cadastro
    const praticasEnriquecidas = praticas.map(p => {
      const praticaCadastro = cadastroMap.get(p.pratica_id);
      return {
        ...p,
        pratica_nome: praticaCadastro ? praticaCadastro.nome : 'Prática não encontrada',
        pratica_tipo: praticaCadastro ? praticaCadastro.tipo : null,
        pratica_icone: praticaCadastro ? praticaCadastro.icone : '',
        pratica_cor: praticaCadastro ? praticaCadastro.cor : '',
        pratica_status: praticaCadastro ? praticaCadastro.status : null
      };
    });
    // Ordenar por data (mais recente primeiro)
    praticasEnriquecidas.sort((a, b) => {
      if (a.data === b.data) {
        // Se mesma data, ordenar por ordem da prática (cadastro)
        const praticaA = cadastroMap.get(a.pratica_id);
        const praticaB = cadastroMap.get(b.pratica_id);
        return (praticaA?.ordem || 0) - (praticaB?.ordem || 0);
      }
      return b.data.localeCompare(a.data);
    });
    Logger.debug('PracticesCore', 'Práticas carregadas', {
      count: praticasEnriquecidas.length
    });
    return {
      ok: true,
      items: praticasEnriquecidas
    };
  } catch (error) {
    Logger.error('PracticesCore', 'Erro ao carregar práticas por período', {
      memberId,
      startDate,
      endDate,
      error: error.message,
      stack: error.stack
    });
    return {
      ok: false,
      error: 'Erro ao carregar práticas: ' + error.message
    };
  }
}
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 📝 OBSERVAÇÕES DO DIA
// ═══════════════════════════════════════════════════════════════════════════════════════════════
/**
 * Salva ou atualiza observação do dia (UPSERT)
 *
 * @description Implementa lógica UPSERT:
 * - Se observação do dia existe (membro + data) → UPDATE
 * - Se não existe → INSERT
 *
 * Garante constraint: 1 observação por dia por membro
 *
 * @param {number} membroId - Código sequencial do membro
 * @param {string} data - Data da observação (yyyy-MM-dd)
 * @param {string} observacao - Texto da observação (max 500 chars)
 * @returns {Object} { ok: boolean, id?: string, isNew?: boolean, error?: string }
 *
 * @example
 * const result = _saveObservationCore(5, '2025-01-15', 'Dia produtivo');
 * if (result.ok) {
 *   console.log('Observação salva:', result.id);
 * }
 */
async function _saveObservationCore(membroId, data, observacao) {
  try {
    Logger.debug('PracticesCore', 'Salvando observação', { membroId, data });
    // Validações
    if (!membroId || !data) {
      Logger.warn('PracticesCore', 'Parâmetros obrigatórios ausentes', { membroId, data });
      return {
        ok: false,
        error: 'membroId e data são obrigatórios'
      };
    }
    if (!observacao || observacao.trim() === '') {
      Logger.warn('PracticesCore', 'Observação vazia', { membroId, data });
      return {
        ok: false,
        error: 'Observação não pode ser vazia'
      };
    }
    // Validar tamanho
    if (observacao.length > 500) {
      Logger.warn('PracticesCore', 'Observação muito longa', {
        membroId,
        data,
        length: observacao.length
      });
      return {
        ok: false,
        error: 'Observação muito longa (máximo 500 caracteres)'
      };
    }
    // Verificar se já existe observação do dia (UPSERT logic)
    const existingResult = await DatabaseManager.query('praticas_observacoes', { // ✅ Adicionado 'await'
      membro_id: membroId,
      data: data,
      deleted: ''
    });
    const existing = Array.isArray(existingResult)
      ? existingResult[0]
      : (existingResult?.data?.[0] || null);
    const now = Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');
    if (existing) {
      // UPDATE - Observação já existe
      Logger.debug('PracticesCore', 'Observação existente encontrada, atualizando', {
        id: existing.id
      });
      const updateResult = await DatabaseManager.update('praticas_observacoes', existing.id, { // ✅ Adicionado 'await'
        observacao: observacao.trim(),
        atualizado_em: now
      });
      if (!updateResult.success) {  // ✅ CORRIGIDO: update() retorna 'success', não 'ok'
        Logger.error('PracticesCore', 'Erro ao atualizar observação', {
          id: existing.id,
          error: updateResult.error
        });
        return {
          ok: false,
          error: 'Erro ao atualizar observação: ' + updateResult.error
        };
      }
      Logger.debug('PracticesCore', 'Observação atualizada', { id: existing.id });
      return {
        ok: true,
        id: existing.id,
        isNew: false
      };
    } else {
      // INSERT - Nova observação
      Logger.debug('PracticesCore', 'Nenhuma observação existente, criando nova');

      // Gerar ID composto: membro_id|data (elimina race condition)
      const compositeId = `${membroId}|${data}`;

      const insertData = {
        id: compositeId,
        membro_id: membroId,
        data: data,
        observacao: observacao.trim(),
        criado_em: now,
        atualizado_em: '',
        deleted: ''
      };
      const insertResult = await DatabaseManager.insert('praticas_observacoes', insertData); // ✅ Adicionado 'await'
      // ✅ ALTERAÇÃO: Usar 'success' em vez de 'ok' para consistência com DatabaseManager.insert()
      if (!insertResult.success) {
        Logger.error('PracticesCore', 'Erro ao inserir observação', {
          error: insertResult.error
        });
        return {
          ok: false, // Mantém 'ok' no retorno final para consistência externa
          error: 'Erro ao inserir observação: ' + (insertResult.error || 'Erro desconhecido') // ✅ Melhorado tratamento de erro
        };
      }
      Logger.debug('PracticesCore', 'Observação criada', { id: insertResult.id });
      return {
        ok: true,
        id: insertResult.id,
        isNew: true
      };
    }
  } catch (error) {
    Logger.error('PracticesCore', 'Erro ao salvar observação', {
      membroId,
      data,
      error: error.message,
      stack: error.stack
    });
    return {
      ok: false,
      error: 'Erro ao salvar observação: ' + error.message
    };
  }
}
/**
 * Carrega observação de um membro em uma data específica
 *
 * @param {number} memberId - Código sequencial do membro
 * @param {string} date - Data (yyyy-MM-dd)
 * @returns {Object} { ok: boolean, observacao?: string, error?: string }
 *
 * @example
 * const result = _loadObservationByMemberAndDate(5, '2025-01-15');
 * if (result.ok && result.observacao) {
 *   console.log('Observação:', result.observacao);
 * }
 */
async function _loadObservationByMemberAndDate(memberId, date) { // ✅ Adicionado 'async'
  try {
    Logger.debug('PracticesCore', 'Carregando observação do dia', { memberId, date });
    if (!memberId || !date) {
      return {
        ok: false,
        error: 'memberId e date são obrigatórios'
      };
    }
    const result = await DatabaseManager.query('praticas_observacoes', { // ✅ Adicionado 'await'
      membro_id: memberId,
      data: date,
      deleted: ''
    });
    const observacaoData = Array.isArray(result)
      ? result[0]
      : (result?.data?.[0] || null);
    if (!observacaoData) {
      Logger.debug('PracticesCore', 'Nenhuma observação encontrada', { memberId, date });
      return {
        ok: true,
        observacao: null
      };
    }
    Logger.debug('PracticesCore', 'Observação carregada', {
      memberId,
      date,
      id: observacaoData.id
    });
    return {
      ok: true,
      observacao: observacaoData.observacao,
      id: observacaoData.id,
      criado_em: observacaoData.criado_em,
      atualizado_em: observacaoData.atualizado_em
    };
  } catch (error) {
    Logger.error('PracticesCore', 'Erro ao carregar observação', {
      memberId,
      date,
      error: error.message,
      stack: error.stack
    });
    return {
      ok: false,
      error: 'Erro ao carregar observação: ' + error.message
    };
  }
}

/**
 * Carrega observações de um membro em um intervalo de datas (BATCH)
 *
 * @description Retorna todas as observações do membro no período especificado.
 * Otimização: 1 query para N dias, ao invés de N queries (1 por dia).
 *
 * @param {number} memberId - Código sequencial do membro
 * @param {string} startDate - Data inicial (yyyy-MM-dd)
 * @param {string} endDate - Data final (yyyy-MM-dd)
 * @returns {Object} { ok: boolean, items: [], error?: string }
 *
 * @example
 * const result = await _loadObservationsByDateRange(5, '2025-01-01', '2025-01-31');
 * if (result.ok) {
 *   result.items.forEach(obs => {
 *     console.log(obs.data, obs.observacao);
 *   });
 * }
 */
async function _loadObservationsByDateRange(memberId, startDate, endDate) {
  try {
    Logger.debug('PracticesCore', 'Carregando observações por período (batch)', {
      memberId,
      startDate,
      endDate
    });

    if (!memberId || !startDate || !endDate) {
      return {
        ok: false,
        error: 'memberId, startDate e endDate são obrigatórios'
      };
    }

    // Query todas as observações do membro (sem filtro de data)
    const result = await DatabaseManager.query('praticas_observacoes', {
      membro_id: memberId,
      deleted: ''
    });

    const allObservacoes = Array.isArray(result) ? result : (result?.data || []);

    // Filtrar por intervalo de datas no JavaScript
    const filtered = allObservacoes.filter(obs => {
      return obs.data >= startDate && obs.data <= endDate;
    });

    Logger.debug('PracticesCore', 'Observações carregadas (batch)', {
      memberId,
      startDate,
      endDate,
      totalEncontradas: filtered.length
    });

    return {
      ok: true,
      items: filtered
    };

  } catch (error) {
    Logger.error('PracticesCore', 'Erro ao carregar observações (batch)', {
      memberId,
      startDate,
      endDate,
      error: error.message
    });
    return {
      ok: false,
      error: 'Erro ao carregar observações: ' + error.message
    };
  }
}
