/**
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 * 🥋 PRACTICES API - ENDPOINTS PÚBLICOS
 * ═══════════════════════════════════════════════════════════════════════════════════════════════
 *
 * Endpoints expostos ao frontend para o sistema de práticas diárias.
 *
 * SEGURANÇA:
 * - TODAS as funções validam sessão + acesso ao membro com requireMemberAccess()
 * - memberId vem do frontend (State.selectedMemberId) mas é validado no backend
 * - Impede que usuário manipule State e acesse dados de outro membro
 *
 * PADRÃO:
 * - Funções públicas (sem _)
 * - Validação de sessão obrigatória
 * - Retorno serializado para HTMLService
 * - Try/catch com Logger
 * - Chamam funções core em src/01-business/practices.gs
 *
 * ENDPOINTS IMPLEMENTADOS:
 * - getAvailablePractices(sessionId, memberId)
 * - loadPracticesByDateRange(sessionId, memberId, startDate, endDate)
 * - savePractice(sessionId, memberId, data, praticaId, quantidade) - UPSERT
 * - saveObservation(sessionId, memberId, data, observacao) - UPSERT
 * - loadObservation(sessionId, memberId, date)
 *
 * @fileoverview API endpoints para práticas diárias
 * @version 1.0.0
 * @since 2025-01-20
 */
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 📋 PRÁTICAS CADASTRADAS (CONFIG)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
/**
 * Carrega lista de práticas disponíveis para o membro
 *
 * @description Retorna todas as práticas ativas do cadastro.
 * Futuramente pode filtrar baseado em grupo/categoria do membro.
 *
 * Segurança: Valida sessão + acesso ao membro
 *
 * @param {string} sessionId - ID da sessão do usuário
 * @param {number} memberId - ID do membro (validado contra vínculos)
 * @returns {Object} { ok: boolean, items: [], error?: string }
 *
 * @example
 * // Frontend:
 * const memberId = State.selectedMemberId;
 * const sessionId = localStorage.getItem('sessionId');
 * const result = await apiCall('getAvailablePractices', sessionId, memberId);
 */
async function getAvailablePractices(sessionId, memberId) {
  try {
    // Validar sessão + acesso ao membro
    const auth = await requireMemberAccess(sessionId, memberId, 'PracticesAPI');
    if (!auth.ok) return auth;
    Logger.debug('PracticesAPI', 'Buscando práticas disponíveis', {
      userId: auth.userId,
      memberId
    });
    // Chamar função core
    const result = await _loadAvailablePractices(memberId); // ✅ Adicionado 'await'
    // Garantir serialização para HTMLService
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    Logger.error('PracticesAPI', 'Erro ao buscar práticas disponíveis', {
      sessionId,
      memberId,
      error: error.message
    });
    return {
      ok: false,
      error: 'Erro ao buscar práticas disponíveis: ' + error.message
    };
  }
}
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 📊 PRÁTICAS DIÁRIAS (DADOS)
// ═══════════════════════════════════════════════════════════════════════════════════════════════
/**
 * Carrega práticas realizadas em um período
 *
 * @description Retorna todas as práticas diárias do membro no intervalo especificado.
 * Dados vêm enriquecidos com informações do cadastro (nome, tipo, ícone, etc).
 *
 * Segurança: Valida sessão + acesso ao membro
 *
 * @param {string} sessionId - ID da sessão do usuário
 * @param {number} memberId - ID do membro (validado contra vínculos)
 * @param {string} startDate - Data inicial (yyyy-MM-dd)
 * @param {string} endDate - Data final (yyyy-MM-dd)
 * @returns {Object} { ok: boolean, items: [], error?: string }
 *
 * @example
 * // Frontend:
 * const result = await apiCall('loadPracticesByDateRange',
 *   sessionId, memberId, '2025-01-01', '2025-01-31');
 */
async function loadPracticesByDateRange(sessionId, memberId, startDate, endDate) {
  try {
    // Validar sessão + acesso ao membro
    const auth = await requireMemberAccess(sessionId, memberId, 'PracticesAPI');
    if (!auth.ok) return auth;
    Logger.debug('PracticesAPI', 'Carregando práticas por período', {
      userId: auth.userId,
      memberId,
      startDate,
      endDate
    });
    // Chamar função core
    const result = await _loadPracticesByMemberAndDateRange(memberId, startDate, endDate); // ✅ Adicionado 'await'
    // Garantir serialização para HTMLService
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    Logger.error('PracticesAPI', 'Erro ao carregar práticas', {
      sessionId,
      memberId,
      startDate,
      endDate,
      error: error.message
    });
    return {
      ok: false,
      error: 'Erro ao carregar práticas: ' + error.message
    };
  }
}
/**
 * Salva ou atualiza uma prática diária
 *
 * @description Salva quantidade realizada de uma prática em uma data.
 * Implementa UPSERT: atualiza se existe, cria se não existe.
 *
 * Segurança: Valida sessão + acesso ao membro
 *
 * @param {string} sessionId - ID da sessão do usuário
 * @param {number} memberId - ID do membro (validado contra vínculos)
 * @param {string} data - Data da prática (yyyy-MM-dd)
 * @param {string} praticaId - ID da prática (PRAC-0001, PRAC-0002...)
 * @param {number} quantidade - Quantidade realizada (contador) ou 0/1 (sim_nao)
 * @returns {Object} { ok: boolean, id?: string, isNew?: boolean, error?: string }
 *
 * @example
 * // Frontend:
 * const result = await apiCall('savePractice',
 *   sessionId, memberId, '2025-01-15', 'PRAC-0001', 3);
 * if (result.ok) {
 *   console.log('Prática salva:', result.id, result.isNew ? 'NOVA' : 'ATUALIZADA');
 * }
 */
async function savePractice(sessionId, memberId, data, praticaId, quantidade) {
  try {
    // Validar sessão + acesso ao membro
    const auth = await requireMemberAccess(sessionId, memberId, 'PracticesAPI');
    if (!auth.ok) return auth;
    Logger.debug('PracticesAPI', 'Salvando prática', {
      userId: auth.userId,
      memberId,
      data,
      praticaId,
      quantidade
    });
    // Chamar função core (UPSERT)
    const result = await _savePracticeCore(memberId, data, praticaId, quantidade); // ✅ Adicionado 'await'
    // Garantir serialização para HTMLService
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    Logger.error('PracticesAPI', 'Erro ao salvar prática', {
      sessionId,
      memberId,
      data,
      praticaId,
      quantidade,
      error: error.message
    });
    return {
      ok: false,
      error: 'Erro ao salvar prática: ' + error.message
    };
  }
}
// ═══════════════════════════════════════════════════════════════════════════════════════════════
// 📝 OBSERVAÇÕES DO DIA
// ═══════════════════════════════════════════════════════════════════════════════════════════════
/**
 * Salva ou atualiza observação do dia
 *
 * @description Salva observação geral sobre o dia de práticas.
 * Implementa UPSERT: atualiza se existe, cria se não existe.
 * Constraint: 1 observação por dia por membro.
 *
 * Segurança: Valida sessão + acesso ao membro
 *
 * @param {string} sessionId - ID da sessão do usuário
 * @param {number} memberId - ID do membro (validado contra vínculos)
 * @param {string} data - Data da observação (yyyy-MM-dd)
 * @param {string} observacao - Texto da observação (max 500 chars)
 * @returns {Object} { ok: boolean, id?: string, isNew?: boolean, error?: string }
 *
 * @example
 * // Frontend:
 * const result = await apiCall('saveObservation',
 *   sessionId, memberId, '2025-01-15', 'Dia muito produtivo');
 */
async function saveObservation(sessionId, memberId, data, observacao) {
  try {
    // Validar sessão + acesso ao membro
    const auth = await requireMemberAccess(sessionId, memberId, 'PracticesAPI');
    if (!auth.ok) return auth;
    Logger.debug('PracticesAPI', 'Salvando observação', {
      userId: auth.userId,
      memberId,
      data
    });
    // Chamar função core (UPSERT)
    const result = await _saveObservationCore(memberId, data, observacao); // ✅ Adicionado 'await'
    // Garantir serialização para HTMLService
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    Logger.error('PracticesAPI', 'Erro ao salvar observação', {
      sessionId,
      memberId,
      data,
      error: error.message
    });
    return {
      ok: false,
      error: 'Erro ao salvar observação: ' + error.message
    };
  }
}
/**
 * Carrega observação de uma data específica
 *
 * @description Retorna observação do dia se existir.
 *
 * Segurança: Valida sessão + acesso ao membro
 *
 * @param {string} sessionId - ID da sessão do usuário
 * @param {number} memberId - ID do membro (validado contra vínculos)
 * @param {string} date - Data (yyyy-MM-dd)
 * @returns {Object} { ok: boolean, observacao?: string, id?: string, error?: string }
 *
 * @example
 * // Frontend:
 * const result = await apiCall('loadObservation', sessionId, memberId, '2025-01-15');
 * if (result.ok && result.observacao) {
 *   console.log('Observação:', result.observacao);
 * }
 */
async function loadObservation(sessionId, memberId, date) {
  try {
    // Validar sessão + acesso ao membro
    const auth = await requireMemberAccess(sessionId, memberId, 'PracticesAPI');
    if (!auth.ok) return auth;
    Logger.debug('PracticesAPI', 'Carregando observação', {
      userId: auth.userId,
      memberId,
      date
    });
    // Chamar função core
    const result = await _loadObservationByMemberAndDate(memberId, date); // ✅ Adicionado 'await'
    // Garantir serialização para HTMLService
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    Logger.error('PracticesAPI', 'Erro ao carregar observação', {
      sessionId,
      memberId,
      date,
      error: error.message
    });
    return {
      ok: false,
      error: 'Erro ao carregar observação: ' + error.message
    };
  }
}

/**
 * Carrega observações de um período (BATCH - otimizado)
 *
 * @description Retorna todas as observações do membro no intervalo especificado.
 * Otimização: 1 query ao invés de N queries (1 por dia).
 *
 * Segurança: Valida sessão + acesso ao membro
 *
 * @param {string} sessionId - ID da sessão do usuário
 * @param {number} memberId - ID do membro (validado contra vínculos)
 * @param {string} startDate - Data inicial (yyyy-MM-dd)
 * @param {string} endDate - Data final (yyyy-MM-dd)
 * @returns {Object} { ok: boolean, items: [], error?: string }
 *
 * @example
 * // Frontend:
 * const result = await apiCall('loadObservationsByDateRange',
 *   sessionId, memberId, '2025-01-01', '2025-01-31');
 * if (result.ok) {
 *   result.items.forEach(obs => {
 *     observations[obs.data] = obs.observacao;
 *   });
 * }
 */
async function loadObservationsByDateRange(sessionId, memberId, startDate, endDate) {
  try {
    // Validar sessão + acesso ao membro
    const auth = await requireMemberAccess(sessionId, memberId, 'PracticesAPI');
    if (!auth.ok) return auth;

    Logger.debug('PracticesAPI', 'Carregando observações (batch)', {
      userId: auth.userId,
      memberId,
      startDate,
      endDate
    });

    // Chamar função core
    const result = await _loadObservationsByDateRange(memberId, startDate, endDate);

    // Garantir serialização para HTMLService
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    Logger.error('PracticesAPI', 'Erro ao carregar observações (batch)', {
      sessionId,
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
