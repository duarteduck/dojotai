// categorias_atividades.gs - ARQUIVO NOVO - Criar este arquivo completo

function listCategoriasAtividadesApi() {
  try {
    const result = _listCategoriasAtividadesCore();
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    return { ok: false, error: 'Erro listCategoriasAtividadesApi: ' + (err && err.message ? err.message : err) };
  }
}

function _listCategoriasAtividadesCore() {
  try {
    const { values, headerIndex } = readTableByNome_('categorias_atividades');
    if (!values || values.length < 2) {
      return { ok: true, items: [] };
    }

    const needed = ['id', 'nome', 'icone', 'cor', 'status'];
    const missing = needed.filter(k => headerIndex[k] === undefined);
    if (missing.length) {
      return { ok: false, error: 'Colunas faltando na tabela CategoriasAtividades: ' + missing.join(', ') };
    }

    const items = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r] || [];
      
      const status = String(row[headerIndex['status']] || '').trim().toLowerCase();
      if (!['ativo', 'active', '1', 'true', 'sim'].includes(status)) continue;

      const item = {
        id: String(row[headerIndex['id']] || '').trim(),
        nome: String(row[headerIndex['nome']] || '').trim(),
        icone: String(row[headerIndex['icone']] || '📋').trim(),
        cor: String(row[headerIndex['cor']] || '#6B7280').trim(),
        descricao: String(row[headerIndex['descricao']] || '').trim(),
        ordem: Number(row[headerIndex['ordem']] || 999)
      };

      if (!item.id || !item.nome) continue;
      items.push(item);
    }

    items.sort((a, b) => a.ordem - b.ordem);
    
    return { ok: true, items };
  } catch (err) {
    return { ok: false, error: 'Erro _listCategoriasAtividadesCore: ' + (err && err.message ? err.message : err) };
  }
}

let __categoriasAtividadesCache = null;

function getCategoriasAtividadesMapReadOnly_() {
  try {
    if (__categoriasAtividadesCache) return __categoriasAtividadesCache;
    
    const result = _listCategoriasAtividadesCore();
    if (!result || !result.ok) return {};
    
    const map = {};
    (result.items || []).forEach(cat => {
      map[cat.id] = cat;
    });
    
    __categoriasAtividadesCache = map;
    return map;
  } catch (e) {
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