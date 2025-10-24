// vinculos.gs - Sistema de Vínculos Usuário ↔ Membro

/**
 * ═══════════════════════════════════════════════════════════════
 * BUSCAR MEMBROS VINCULADOS A UM USUÁRIO
 * ═══════════════════════════════════════════════════════════════
 * @param {string} userId - UID do usuário
 * @param {boolean} somenteAtivos - Retornar apenas vínculos ativos (padrão: true)
 * @returns {Object} { ok, items: [...] }
 */
function _getLinkedMembersCore(userId, somenteAtivos) {
  try {
    // Padrão: se não especificou, buscar apenas ativos
    if (somenteAtivos === undefined || somenteAtivos === null) {
      somenteAtivos = true;
    }

    Logger.info('Vinculos', 'Buscando membros vinculados', { userId, somenteAtivos });

    // Validar parâmetro
    if (!userId) {
      Logger.warn('Vinculos', 'userId não fornecido');
      return { ok: false, error: 'userId é obrigatório' };
    }

    // Montar filtros
    const filters = {
      user_id: userId,
      deleted: '' // Não incluir deletados
    };

    if (somenteAtivos) {
      filters.ativo = 'sim';
    }

    // Query no DatabaseManager (sem cache - vínculos podem mudar)
    const queryResult = DatabaseManager.query('usuario_membro', filters, false);

    // DatabaseManager pode retornar array direto ou { data: [...] }
    const vinculos = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!vinculos || vinculos.length === 0) {
      Logger.info('Vinculos', 'Nenhum vínculo encontrado', { userId });
      return { ok: true, items: [] };
    }

    // =========================================================================
    // OTIMIZAÇÃO: Buscar todos os membros de uma vez (evitar N+1 queries)
    // Reduz de N+1 acessos ao Sheets para apenas 2 acessos totais
    // =========================================================================

    // Buscar TODOS os membros ativos em uma única query
    const todosMembroResult = DatabaseManager.query('membros', {
      status: 'Ativo'
    }, true); // Cache = true (membros mudam raramente)

    const todosMembros = Array.isArray(todosMembroResult)
      ? todosMembroResult
      : (todosMembroResult?.data || []);

    // Criar Map de lookup por codigo_sequencial para acesso O(1)
    const membrosMap = new Map();
    todosMembros.forEach(membro => {
      membrosMap.set(membro.codigo_sequencial, membro);
    });

    Logger.info('Vinculos', `Carregados ${todosMembros.length} membros para lookup`, { userId });

    // Enriquecer vínculos com dados dos membros (sem queries adicionais)
    const items = [];

    vinculos.forEach(vinculo => {
      // Lookup em memória - O(1) - sem query adicional ao Sheets
      const membro = membrosMap.get(vinculo.membro_id);

      items.push({
        // Dados do vínculo
        id: vinculo.id,
        user_id: vinculo.user_id,
        membro_id: vinculo.membro_id,
        tipo_vinculo: vinculo.tipo_vinculo,
        ativo: vinculo.ativo,
        principal: vinculo.principal,
        criado_em: vinculo.criado_em,
        criado_por: vinculo.criado_por,
        desativado_em: vinculo.desativado_em,
        desativado_por: vinculo.desativado_por,
        observacoes: vinculo.observacoes,

        // Dados do membro (enriquecidos via Map lookup)
        membro_nome: membro ? membro.nome : 'Membro não encontrado',
        membro_status: membro ? membro.status : null,
        membro_codigo_mestre: membro ? membro.codigo_mestre : null,
        categoria_membro: membro ? membro.categoria_membro : null
      });
    });

    // Ordenar: principal primeiro, depois alfabeticamente por nome
    items.sort((a, b) => {
      // Principal vem primeiro
      if (a.principal === 'sim' && b.principal !== 'sim') return -1;
      if (a.principal !== 'sim' && b.principal === 'sim') return 1;

      // Depois ordenar alfabeticamente por nome do membro
      return (a.membro_nome || '').localeCompare(b.membro_nome || '', 'pt-BR', { sensitivity: 'base' });
    });

    Logger.info('Vinculos', `${items.length} vínculo(s) encontrado(s)`, { userId });

    return {
      ok: true,
      items: items,
      total: items.length
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao buscar membros vinculados', {
      userId,
      error: error.message
    });
    return { ok: false, error: error.message };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * CRIAR NOVO VÍNCULO
 * ═══════════════════════════════════════════════════════════════
 * @param {Object} vinculoData - Dados do vínculo { user_id, membro_id, tipo_vinculo, observacoes }
 * @param {string} createdBy - UID de quem está criando
 * @returns {Promise<Object>} { ok, id }
 */
async function _createVinculoCore(vinculoData, createdBy) {
  try {
    Logger.info('Vinculos', 'Criando novo vínculo', { vinculoData, createdBy });

    // Validações obrigatórias
    if (!vinculoData) {
      Logger.warn('Vinculos', 'vinculoData não fornecido');
      return { ok: false, error: 'Dados do vínculo são obrigatórios' };
    }

    if (!vinculoData.user_id) {
      Logger.warn('Vinculos', 'user_id não fornecido');
      return { ok: false, error: 'user_id é obrigatório' };
    }

    if (!vinculoData.membro_id) {
      Logger.warn('Vinculos', 'membro_id não fornecido');
      return { ok: false, error: 'membro_id é obrigatório' };
    }

    if (!vinculoData.tipo_vinculo) {
      Logger.warn('Vinculos', 'tipo_vinculo não fornecido');
      return { ok: false, error: 'tipo_vinculo é obrigatório' };
    }

    // Validar tipo_vinculo
    const tiposValidos = ['proprio', 'filho', 'filha', 'dependente', 'pai', 'mae', 'responsavel', 'tutor'];
    if (!tiposValidos.includes(vinculoData.tipo_vinculo)) {
      Logger.warn('Vinculos', 'tipo_vinculo inválido', { tipo: vinculoData.tipo_vinculo });
      return {
        ok: false,
        error: `tipo_vinculo deve ser um de: ${tiposValidos.join(', ')}`
      };
    }

    // Verificar se vínculo já existe (duplicata)
    const existingResult = DatabaseManager.query('usuario_membro', {
      user_id: vinculoData.user_id,
      membro_id: vinculoData.membro_id,
      deleted: ''
    }, false);

    const existing = Array.isArray(existingResult) ? existingResult : (existingResult?.data || []);

    if (existing.length > 0) {
      Logger.warn('Vinculos', 'Vínculo duplicado bloqueado', {
        user_id: vinculoData.user_id,
        membro_id: vinculoData.membro_id
      });
      return {
        ok: false,
        error: 'Vínculo já existe entre este usuário e membro'
      };
    }

    // Verificar se é o primeiro vínculo do usuário (para marcar como principal)
    const existingLinksResult = _getLinkedMembersCore(vinculoData.user_id, false);
    const isPrimeiro = !existingLinksResult.ok || existingLinksResult.items.length === 0;

    // Preparar dados para inserção
    const data = {
      user_id: vinculoData.user_id,
      membro_id: vinculoData.membro_id,
      tipo_vinculo: vinculoData.tipo_vinculo,
      ativo: 'sim',
      principal: isPrimeiro ? 'sim' : (vinculoData.principal || ''),
      observacoes: vinculoData.observacoes || '',
      criado_por: createdBy || vinculoData.user_id
    };

    // Inserir no DatabaseManager (ele gera id e criado_em automaticamente)
    const result = await DatabaseManager.insert('usuario_membro', data);

    if (!result || !result.success) {
      Logger.error('Vinculos', 'Erro ao inserir vínculo', { data, result });
      return {
        ok: false,
        error: result?.error || result?.message || 'Erro ao criar vínculo no banco de dados'
      };
    }

    Logger.info('Vinculos', 'Vínculo criado com sucesso', { id: result.id });

    return {
      ok: true,
      id: result.id,
      message: 'Vínculo criado com sucesso'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao criar vínculo', {
      vinculoData,
      error: error.message
    });
    return { ok: false, error: error.message };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * DESATIVAR VÍNCULO
 * ═══════════════════════════════════════════════════════════════
 * @param {string} vinculoId - ID do vínculo (UM-XXXX)
 * @param {string} deactivatedBy - UID de quem está desativando
 * @returns {Object} { ok }
 */
function _deactivateVinculoCore(vinculoId, deactivatedBy) {
  try {
    Logger.info('Vinculos', 'Desativando vínculo', { vinculoId, deactivatedBy });

    // Validações
    if (!vinculoId) {
      Logger.warn('Vinculos', 'vinculoId não fornecido');
      return { ok: false, error: 'vinculoId é obrigatório' };
    }

    // Formatar data/hora no padrão do sistema
    const now = new Date();
    const desativadoEm = Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss');

    // Preparar dados para atualização
    const updates = {
      ativo: 'não',
      desativado_em: desativadoEm,
      desativado_por: deactivatedBy || ''
    };

    // Atualizar via DatabaseManager
    const result = DatabaseManager.update('usuario_membro', vinculoId, updates);

    if (!result || !result.ok) {
      Logger.error('Vinculos', 'Erro ao desativar vínculo', { vinculoId, result });
      return { ok: false, error: 'Erro ao desativar vínculo' };
    }

    Logger.info('Vinculos', 'Vínculo desativado com sucesso', { vinculoId });

    return {
      ok: true,
      message: 'Vínculo desativado com sucesso'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao desativar vínculo', {
      vinculoId,
      error: error.message
    });
    return { ok: false, error: error.message };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * REATIVAR VÍNCULO
 * ═══════════════════════════════════════════════════════════════
 * @param {string} vinculoId - ID do vínculo (UM-XXXX)
 * @returns {Object} { ok }
 */
function _reactivateVinculoCore(vinculoId) {
  try {
    Logger.info('Vinculos', 'Reativando vínculo', { vinculoId });

    // Validações
    if (!vinculoId) {
      Logger.warn('Vinculos', 'vinculoId não fornecido');
      return { ok: false, error: 'vinculoId é obrigatório' };
    }

    // Preparar dados para atualização
    const updates = {
      ativo: 'sim',
      desativado_em: '',
      desativado_por: ''
    };

    // Atualizar via DatabaseManager
    const result = DatabaseManager.update('usuario_membro', vinculoId, updates);

    if (!result || !result.ok) {
      Logger.error('Vinculos', 'Erro ao reativar vínculo', { vinculoId, result });
      return { ok: false, error: 'Erro ao reativar vínculo' };
    }

    Logger.info('Vinculos', 'Vínculo reativado com sucesso', { vinculoId });

    return {
      ok: true,
      message: 'Vínculo reativado com sucesso'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao reativar vínculo', {
      vinculoId,
      error: error.message
    });
    return { ok: false, error: error.message };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * DEFINIR VÍNCULO PRINCIPAL
 * ═══════════════════════════════════════════════════════════════
 * @param {string} userId - UID do usuário
 * @param {string} vinculoId - ID do vínculo a ser marcado como principal
 * @returns {Object} { ok }
 */
function _setPrincipalVinculoCore(userId, vinculoId) {
  try {
    Logger.info('Vinculos', 'Definindo vínculo principal', { userId, vinculoId });

    // Validações
    if (!userId || !vinculoId) {
      Logger.warn('Vinculos', 'Parâmetros incompletos');
      return { ok: false, error: 'userId e vinculoId são obrigatórios' };
    }

    // 1. Remover principal de todos os vínculos do usuário
    const allLinksResult = _getLinkedMembersCore(userId, false);

    if (allLinksResult.ok && allLinksResult.items) {
      allLinksResult.items.forEach(link => {
        if (link.principal === 'sim') {
          DatabaseManager.update('usuario_membro', link.id, { principal: '' });
          Logger.debug('Vinculos', 'Removeu principal de vínculo', { id: link.id });
        }
      });
    }

    // 2. Definir novo principal
    const result = DatabaseManager.update('usuario_membro', vinculoId, { principal: 'sim' });

    if (!result || !result.ok) {
      Logger.error('Vinculos', 'Erro ao definir principal', { vinculoId, result });
      return { ok: false, error: 'Erro ao definir vínculo principal' };
    }

    Logger.info('Vinculos', 'Vínculo principal definido', { vinculoId });

    return {
      ok: true,
      message: 'Vínculo principal atualizado'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao definir principal', {
      userId,
      vinculoId,
      error: error.message
    });
    return { ok: false, error: error.message };
  }
}

/**
 * ═══════════════════════════════════════════════════════════════
 * BUSCAR USUÁRIOS VINCULADOS A UM MEMBRO
 * ═══════════════════════════════════════════════════════════════
 * Função usada para features administrativas/relatórios
 * @param {number} membroId - Código sequencial do membro
 * @param {boolean} somenteAtivos - Retornar apenas vínculos ativos (padrão: true)
 * @returns {Object} { ok, items: [...] }
 */
function _getUsersLinkedToMemberCore(membroId, somenteAtivos) {
  try {
    // Padrão: se não especificou, buscar apenas ativos
    if (somenteAtivos === undefined || somenteAtivos === null) {
      somenteAtivos = true;
    }

    Logger.info('Vinculos', 'Buscando usuários vinculados ao membro', { membroId, somenteAtivos });

    // Validações
    if (!membroId) {
      Logger.warn('Vinculos', 'membroId não fornecido');
      return { ok: false, error: 'membroId é obrigatório' };
    }

    // Montar filtros
    const filters = {
      membro_id: membroId,
      deleted: ''
    };

    if (somenteAtivos) {
      filters.ativo = 'sim';
    }

    // Query no DatabaseManager
    const queryResult = DatabaseManager.query('usuario_membro', filters, false);

    const vinculos = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!vinculos || vinculos.length === 0) {
      Logger.info('Vinculos', 'Nenhum usuário vinculado ao membro', { membroId });
      return { ok: true, items: [] };
    }

    // Enriquecer com dados do usuário
    const items = [];

    vinculos.forEach(vinculo => {
      // Buscar dados do usuário
      const usuarioResult = DatabaseManager.query('usuarios', {
        uid: vinculo.user_id
      }, true); // Cache = true

      const usuarios = Array.isArray(usuarioResult) ? usuarioResult : (usuarioResult?.data || []);
      const usuario = usuarios.length > 0 ? usuarios[0] : null;

      items.push({
        // Dados do vínculo
        id: vinculo.id,
        user_id: vinculo.user_id,
        membro_id: vinculo.membro_id,
        tipo_vinculo: vinculo.tipo_vinculo,
        ativo: vinculo.ativo,
        principal: vinculo.principal,
        criado_em: vinculo.criado_em,
        criado_por: vinculo.criado_por,
        desativado_em: vinculo.desativado_em,
        desativado_por: vinculo.desativado_por,
        observacoes: vinculo.observacoes,

        // Dados do usuário (enriquecidos)
        usuario_nome: usuario ? usuario.nome : 'Usuário não encontrado',
        usuario_login: usuario ? usuario.login : null,
        usuario_status: usuario ? usuario.status : null
      });
    });

    Logger.info('Vinculos', `${items.length} usuário(s) vinculado(s) ao membro`, { membroId });

    return {
      ok: true,
      items: items,
      total: items.length
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao buscar usuários vinculados', {
      membroId,
      error: error.message
    });
    return { ok: false, error: error.message };
  }
}
