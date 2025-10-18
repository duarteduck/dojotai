// parametros.gs - Funções para carregar tabelas de parâmetros/cadastros auxiliares

/**
 * Lista todos os cargos ativos
 * @param {string} sessionId - ID da sessão do usuário
 * @returns {Object} { ok: boolean, items: Array }
 */
async function listCargosApi(sessionId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Parametros');
    if (!auth.ok) return auth;

    const cargos = DatabaseManager.query('cargo', { ativo: 'sim' }, true);

    if (!cargos || cargos.length === 0) {
      return { ok: true, items: [] };
    }

    // Ordenar por campo 'ordem'
    const sorted = cargos
      .map(c => ({
        id: c.id,
        nome: c.nome || '',
        abreviacao: c.abreviacao || '',
        ordem: Number(c.ordem || 999)
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return { ok: true, items: sorted };

  } catch (err) {
    Logger.error('Parametros', 'Erro ao listar cargos', { error: err.message });
    return { ok: false, error: 'Erro ao listar cargos: ' + (err?.message || err) };
  }
}

/**
 * Lista todas as categorias de membros ativas
 * @param {string} sessionId - ID da sessão do usuário
 * @returns {Object} { ok: boolean, items: Array }
 */
async function listCategoriasApi(sessionId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Parametros');
    if (!auth.ok) return auth;

    const categorias = DatabaseManager.query('categoria_membros', { ativo: 'sim' }, true);

    if (!categorias || categorias.length === 0) {
      return { ok: true, items: [] };
    }

    const sorted = categorias
      .map(c => ({
        id: c.id,
        nome: c.nome || '',
        abreviacao: c.abreviacao || '',
        ordem: Number(c.ordem || 999)
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return { ok: true, items: sorted };

  } catch (err) {
    Logger.error('Parametros', 'Erro ao listar categorias', { error: err.message });
    return { ok: false, error: 'Erro ao listar categorias: ' + (err?.message || err) };
  }
}

/**
 * Lista todos os dojos ativos
 * @param {string} sessionId - ID da sessão do usuário
 * @returns {Object} { ok: boolean, items: Array }
 */
async function listDojosApi(sessionId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Parametros');
    if (!auth.ok) return auth;

    const dojos = DatabaseManager.query('dojo', { ativo: 'sim' }, true);

    if (!dojos || dojos.length === 0) {
      return { ok: true, items: [] };
    }

    const sorted = dojos
      .map(d => ({
        id: d.id,
        nome: d.nome || '',
        abreviacao: d.abreviacao || '',
        ordem: Number(d.ordem || 999)
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return { ok: true, items: sorted };

  } catch (err) {
    Logger.error('Parametros', 'Erro ao listar dojos', { error: err.message });
    return { ok: false, error: 'Erro ao listar dojos: ' + (err?.message || err) };
  }
}

/**
 * Lista todos os níveis de omitama ativos
 * @param {string} sessionId - ID da sessão do usuário
 * @returns {Object} { ok: boolean, items: Array }
 */
async function listOmitamasApi(sessionId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Parametros');
    if (!auth.ok) return auth;

    const omitamas = DatabaseManager.query('omitama', { ativo: 'sim' }, true);

    if (!omitamas || omitamas.length === 0) {
      return { ok: true, items: [] };
    }

    const sorted = omitamas
      .map(o => ({
        id: o.id,
        nome: o.nome || '',
        abreviacao: o.abreviacao || '',
        ordem: Number(o.ordem || 999)
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return { ok: true, items: sorted };

  } catch (err) {
    Logger.error('Parametros', 'Erro ao listar omitamas', { error: err.message });
    return { ok: false, error: 'Erro ao listar omitamas: ' + (err?.message || err) };
  }
}

/**
 * Lista todos os sexos ativos
 * @param {string} sessionId - ID da sessão do usuário
 * @returns {Object} { ok: boolean, items: Array }
 */
async function listSexosApi(sessionId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Parametros');
    if (!auth.ok) return auth;

    const sexos = DatabaseManager.query('sexo', { ativo: 'sim' }, true);

    if (!sexos || sexos.length === 0) {
      return { ok: true, items: [] };
    }

    const sorted = sexos
      .map(s => ({
        id: s.id,
        nome: s.nome || '',
        abreviacao: s.abreviacao || '',
        ordem: Number(s.ordem || 999)
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return { ok: true, items: sorted };

  } catch (err) {
    Logger.error('Parametros', 'Erro ao listar sexos', { error: err.message });
    return { ok: false, error: 'Erro ao listar sexos: ' + (err?.message || err) };
  }
}

/**
 * Lista todos os status de membro ativos
 * @param {string} sessionId - ID da sessão do usuário
 * @returns {Object} { ok: boolean, items: Array }
 */
async function listStatusMembrosApi(sessionId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Parametros');
    if (!auth.ok) return auth;

    const status = DatabaseManager.query('status_membro', { ativo: 'sim' }, true);

    if (!status || status.length === 0) {
      return { ok: true, items: [] };
    }

    const sorted = status
      .map(s => ({
        id: s.id,
        nome: s.nome || '',
        ordem: Number(s.ordem || 999)
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return { ok: true, items: sorted };

  } catch (err) {
    Logger.error('Parametros', 'Erro ao listar status', { error: err.message });
    return { ok: false, error: 'Erro ao listar status: ' + (err?.message || err) };
  }
}

/**
 * Lista grupos por tipo (genérico para buntais e futuros tipos de grupo)
 * @param {string} sessionId - ID da sessão do usuário
 * @param {string} tipo - Tipo de grupo a filtrar (ex: 'buntai', null = todos)
 * @returns {Object} { ok: boolean, items: Array }
 */
async function listGruposApi(sessionId, tipo = null) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Parametros');
    if (!auth.ok) return auth;

    // Montar filtros
    const filters = { ativo: 'sim' };
    if (tipo) {
      filters.tipo = tipo;
    }

    const grupos = DatabaseManager.query('grupos', filters, true);

    if (!grupos || grupos.length === 0) {
      return { ok: true, items: [] };
    }

    const sorted = grupos
      .map(g => ({
        id: g.id,
        tipo: g.tipo || '',
        nome: g.grupo || '',
        ordem: Number(g.ordem || 999)
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return { ok: true, items: sorted };

  } catch (err) {
    Logger.error('Parametros', 'Erro ao listar grupos', { error: err.message, tipo });
    return { ok: false, error: 'Erro ao listar grupos: ' + (err?.message || err) };
  }
}

/**
 * OTIMIZAÇÃO: Carrega todos os filtros de uma vez
 * Reduz 7 chamadas API para 1 única chamada
 *
 * @param {string} sessionId - ID da sessão do usuário
 * @returns {Object} { ok: boolean, filters: { dojos, status, categorias, cargos, omitamas, sexos, buntais } }
 */
async function listAllFiltersApi(sessionId) {
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Parametros');
    if (!auth.ok) return auth;

    // Buscar todas as tabelas de parâmetros (todas com cache habilitado)
    const dojos = DatabaseManager.query('dojo', { ativo: 'sim' }, true) || [];
    const status = DatabaseManager.query('status_membro', { ativo: 'sim' }, true) || [];
    const categorias = DatabaseManager.query('categoria_membros', { ativo: 'sim' }, true) || [];
    const cargos = DatabaseManager.query('cargo', { ativo: 'sim' }, true) || [];
    const omitamas = DatabaseManager.query('omitama', { ativo: 'sim' }, true) || [];
    const sexos = DatabaseManager.query('sexo', { ativo: 'sim' }, true) || [];

    // Buntais: buscar da tabela grupos filtrado por tipo='buntai'
    const buntais = DatabaseManager.query('grupos', { ativo: 'sim', tipo: 'buntai' }, true) || [];

    // Mapear e ordenar cada filtro
    const mapAndSort = (items) => items
      .map(item => ({
        id: item.id,
        nome: item.nome || '',
        abreviacao: item.abreviacao || '',
        ordem: Number(item.ordem || 999)
      }))
      .sort((a, b) => a.ordem - b.ordem);

    return {
      ok: true,
      filters: {
        dojos: mapAndSort(dojos),
        status: status.map(s => ({
          id: s.id,
          nome: s.nome || '',
          ordem: Number(s.ordem || 999)
        })).sort((a, b) => a.ordem - b.ordem),
        categorias: mapAndSort(categorias),
        cargos: mapAndSort(cargos),
        omitamas: mapAndSort(omitamas),
        sexos: mapAndSort(sexos),
        buntais: buntais.map(b => ({
          id: b.id,
          nome: b.grupo || '',
          ordem: Number(b.ordem || 999)
        })).sort((a, b) => a.ordem - b.ordem)
      }
    };

  } catch (err) {
    Logger.error('Parametros', 'Erro ao listar todos os filtros', { error: err.message });
    return { ok: false, error: 'Erro ao listar filtros: ' + (err?.message || err) };
  }
}
