/** =========================================================
 *  vinculos_api.gs — Endpoints públicos de vínculos
 *  Funções expostas via google.script.run para o frontend
 * ========================================================= */

/**
 * Retorna membros vinculados ao usuário logado
 * Endpoint usado no login e ao acessar páginas que dependem de membro
 * @param {string} sessionId - ID da sessão
 * @returns {Object} { ok, items: [...] }
 */
async function getMyLinkedMembers(sessionId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    const userId = auth.session.user_id;

    Logger.info('VinculosAPI', 'Buscando membros vinculados ao usuário logado', { userId });

    // Chamar função core (apenas vínculos ativos)
    const result = _getLinkedMembersCore(userId, true);

    // Garantir serialização para HTMLService
    return JSON.parse(JSON.stringify(result));

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao buscar membros vinculados', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro ao buscar membros vinculados'
    };
  }
}

/**
 * Retorna vínculos de um usuário específico (admin)
 * @param {string} sessionId - ID da sessão
 * @param {string} targetUserId - UID do usuário alvo
 * @param {boolean} somenteAtivos - Opcional, padrão true
 * @returns {Object} { ok, items: [...] }
 */
async function getVinculosUsuario(sessionId, targetUserId, somenteAtivos) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    // TODO: Validar se usuário logado é admin
    // Por enquanto, qualquer usuário autenticado pode chamar (será restrito depois)

    Logger.info('VinculosAPI', 'Admin buscando vínculos de usuário', { targetUserId });

    // Validação de parâmetro
    if (!targetUserId) {
      return {
        ok: false,
        error: 'targetUserId é obrigatório'
      };
    }

    // Chamar função core
    const result = _getLinkedMembersCore(targetUserId, somenteAtivos !== false);

    return JSON.parse(JSON.stringify(result));

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao buscar vínculos do usuário', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro ao buscar vínculos'
    };
  }
}

/**
 * Retorna usuários vinculados a um membro (admin)
 * @param {string} sessionId - ID da sessão
 * @param {number} membroId - Código sequencial do membro
 * @param {boolean} somenteAtivos - Opcional, padrão true
 * @returns {Object} { ok, items: [...] }
 */
async function getUsersLinkedToMember(sessionId, membroId, somenteAtivos) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin buscando usuários vinculados ao membro', { membroId });

    // Validação de parâmetro
    if (!membroId) {
      return {
        ok: false,
        error: 'membroId é obrigatório'
      };
    }

    // Chamar função core
    const result = _getUsersLinkedToMemberCore(membroId, somenteAtivos !== false);

    return JSON.parse(JSON.stringify(result));

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao buscar usuários vinculados', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro ao buscar usuários vinculados'
    };
  }
}

/**
 * Cria novo vínculo (admin)
 * @param {string} sessionId - ID da sessão
 * @param {Object} vinculoData - Dados do vínculo { user_id, membro_id, tipo_vinculo, observacoes }
 * @returns {Object} { ok, id }
 */
async function createVinculo(sessionId, vinculoData) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    const createdBy = auth.session.user_id;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin criando vínculo', { vinculoData, createdBy });

    // Validação de dados
    if (!vinculoData) {
      return {
        ok: false,
        error: 'Dados do vínculo são obrigatórios'
      };
    }

    // Chamar função core (async)
    const result = await _createVinculoCore(vinculoData, createdBy);

    return JSON.parse(JSON.stringify(result));

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao criar vínculo', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro ao criar vínculo'
    };
  }
}

/**
 * Desativa vínculo (admin)
 * @param {string} sessionId - ID da sessão
 * @param {string} vinculoId - ID do vínculo (UM-XXXX)
 * @returns {Object} { ok }
 */
async function deactivateVinculo(sessionId, vinculoId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    const deactivatedBy = auth.session.user_id;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin desativando vínculo', { vinculoId });

    // Validação de parâmetro
    if (!vinculoId) {
      return {
        ok: false,
        error: 'vinculoId é obrigatório'
      };
    }

    // Chamar função core
    const result = _deactivateVinculoCore(vinculoId, deactivatedBy);

    return JSON.parse(JSON.stringify(result));

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao desativar vínculo', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro ao desativar vínculo'
    };
  }
}

/**
 * Reativa vínculo (admin)
 * @param {string} sessionId - ID da sessão
 * @param {string} vinculoId - ID do vínculo (UM-XXXX)
 * @returns {Object} { ok }
 */
async function reactivateVinculo(sessionId, vinculoId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin reativando vínculo', { vinculoId });

    // Validação de parâmetro
    if (!vinculoId) {
      return {
        ok: false,
        error: 'vinculoId é obrigatório'
      };
    }

    // Chamar função core
    const result = _reactivateVinculoCore(vinculoId);

    return JSON.parse(JSON.stringify(result));

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao reativar vínculo', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro ao reativar vínculo'
    };
  }
}

/**
 * Define vínculo como principal do usuário logado
 * Permite que o próprio usuário escolha seu membro padrão
 * @param {string} sessionId - ID da sessão
 * @param {string} vinculoId - ID do vínculo a ser marcado como principal
 * @returns {Object} { ok }
 */
async function setMyPrincipalMember(sessionId, vinculoId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    const userId = auth.session.user_id;

    Logger.info('VinculosAPI', 'Usuário definindo membro principal', { userId, vinculoId });

    // Validação de parâmetro
    if (!vinculoId) {
      return {
        ok: false,
        error: 'vinculoId é obrigatório'
      };
    }

    // Verificar se vínculo pertence ao usuário logado (segurança)
    const vinculoResult = DatabaseManager.query('usuario_membro', {
      id: vinculoId,
      deleted: ''
    }, false);

    const vinculos = Array.isArray(vinculoResult) ? vinculoResult : (vinculoResult?.data || []);

    if (vinculos.length === 0) {
      Logger.warn('VinculosAPI', 'Vínculo não encontrado', { vinculoId });
      return {
        ok: false,
        error: 'Vínculo não encontrado'
      };
    }

    const vinculo = vinculos[0];

    if (vinculo.user_id !== userId) {
      Logger.warn('VinculosAPI', 'Tentativa de alterar vínculo de outro usuário', {
        vinculoId,
        vinculo_user_id: vinculo.user_id,
        logged_user_id: userId
      });
      return {
        ok: false,
        error: 'Este vínculo não pertence a você'
      };
    }

    // Chamar função core
    const result = _setPrincipalVinculoCore(userId, vinculoId);

    return JSON.parse(JSON.stringify(result));

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao definir membro principal', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro ao definir membro principal'
    };
  }
}

/**
 * Busca membros disponíveis para vincular (admin)
 * Retorna membros que ainda não estão vinculados a um usuário específico
 * @param {string} sessionId - ID da sessão
 * @param {string} targetUserId - UID do usuário
 * @returns {Object} { ok, items: [...] }
 */
async function getAvailableMembersForUser(sessionId, targetUserId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Buscando membros disponíveis para vincular', { targetUserId });

    // Validação de parâmetro
    if (!targetUserId) {
      return {
        ok: false,
        error: 'targetUserId é obrigatório'
      };
    }

    // 1. Buscar todos os membros ativos
    const membrosResult = DatabaseManager.query('membros', {
      status: 'Ativo'
    }, true);

    const todosMembros = Array.isArray(membrosResult) ? membrosResult : (membrosResult?.data || []);

    // 2. Buscar vínculos existentes do usuário
    const vinculosResult = _getLinkedMembersCore(targetUserId, false);
    const vinculados = vinculosResult.ok ? vinculosResult.items : [];

    // 3. Filtrar membros que já estão vinculados
    const vinculadosIds = new Set(vinculados.map(v => v.membro_id));

    const disponiveis = todosMembros.filter(m => !vinculadosIds.has(m.codigo_sequencial));

    // 4. Formatar resposta
    const items = disponiveis.map(m => ({
      codigo_sequencial: m.codigo_sequencial,
      nome: m.nome,
      codigo_mestre: m.codigo_mestre,
      status: m.status,
      categoria_membro: m.categoria_membro,
      dojo: m.dojo
    }));

    Logger.info('VinculosAPI', `${items.length} membro(s) disponível(is) para vincular`, { targetUserId });

    return {
      ok: true,
      items: items,
      total: items.length
    };

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao buscar membros disponíveis', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro ao buscar membros disponíveis'
    };
  }
}
