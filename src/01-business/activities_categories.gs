// categorias_atividades.gs - ARQUIVO NOVO - Criar este arquivo completo

// ============================================================================
// FUNÇÃO REMOVIDA: listCategoriasAtividadesApi() - activities_categories.gs:3-10
//
// Motivo: Função duplicada - wrapper simples sem valor agregado
// - Versão migrada existe em usuarios_api.gs:62
// - Versão migrada tem logs, mapeamento de campos e validação
// - Esta versão apenas chamava _listCategoriasAtividadesCore() e serializava
// - _listCategoriasAtividadesCore() continua disponível para uso interno
//
// Removido em: Migração #2 - Fase 1, Tarefa 2.2
// Data: 02/10/2025
// ============================================================================

function _listCategoriasAtividadesCore() {
  try {
    // Migrado para DatabaseManager - Query sem cache para dados dinâmicos
    const queryResult = DatabaseManager.query('categorias_atividades', {}, false);
    const categorias = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!categorias || categorias.length === 0) {
      return { ok: true, items: [] };
    }

    const items = [];

    categorias.forEach(cat => {
      // Filtrar apenas status ativo (DatabaseManager já aplica soft delete automaticamente)
      const status = String(cat.status || '').trim().toLowerCase();
      if (!['ativo', 'active', '1', 'true', 'sim'].includes(status)) return;

      // Validar campos obrigatórios
      if (!cat.id || !cat.nome) return;

      const item = {
        id: String(cat.id || '').trim(),
        nome: String(cat.nome || '').trim(),
        icone: String(cat.icone || '📋').trim(),
        cor: String(cat.cor || '#6B7280').trim(),
        descricao: String(cat.descricao || '').trim(),
        ordem: Number(cat.ordem || 999)
      };

      items.push(item);
    });

    // Ordenar por ordem
    items.sort((a, b) => a.ordem - b.ordem);

    return { ok: true, items };
  } catch (err) {
    Logger.error('ActivitiesCategories', 'Erro ao listar categorias', {
      error: err && err.message ? err.message : err
    });
    return { ok: false, error: 'Erro _listCategoriasAtividadesCore: ' + (err && err.message ? err.message : err) };
  }
}

let __categoriasAtividadesCache = null;

function getCategoriasAtividadesMapReadOnly_() {
  try {
    if (__categoriasAtividadesCache) {
      console.log('🔍 DEBUG: Usando cache de categorias:', __categoriasAtividadesCache);
      return __categoriasAtividadesCache;
    }

    console.log('🔍 DEBUG: Carregando categorias do banco...');
    const result = _listCategoriasAtividadesCore();
    console.log('🔍 DEBUG: Resultado _listCategoriasAtividadesCore:', result);

    if (!result || !result.ok) {
      console.log('❌ DEBUG: Erro ao carregar categorias:', result);
      return {};
    }

    const map = {};
    (result.items || []).forEach(cat => {
      console.log(`🔍 DEBUG: Adicionando categoria ao map: ${cat.id} = ${cat.nome}`);
      map[cat.id] = cat;
    });

    console.log('🔍 DEBUG: Map final de categorias:', map);
    __categoriasAtividadesCache = map;
    return map;
  } catch (e) {
    console.log('❌ DEBUG: Erro na função getCategoriasAtividadesMapReadOnly_:', e);
    return {};
  }
}

function clearCategoriasAtividadesCache_() {
  __categoriasAtividadesCache = null;
}

function validateCategoriaAtividade_(categoriaId) {
  const categorias = getCategoriasAtividadesMapReadOnly_();
  return categorias[categoriaId] || null;
}