// menu.gs - Sistema de Menu via planilha

/**
 * Lista itens do menu para o usuário atual
 * @returns {Object} { ok:boolean, items:Array }
 */
function listMenuItems() {
  try {
    const { values, headerIndex } = readTableByNome_('menu');
    
    if (!values || values.length < 2) {
      return { ok: true, items: [] }; // Menu vazio é válido
    }

    const cId = headerIndex['id'];
    const cTitulo = headerIndex['titulo'];
    const cIcone = headerIndex['icone'];
    const cOrdem = headerIndex['ordem'];
    const cAcao = headerIndex['acao'];
    const cDestino = headerIndex['destino'];
    const cPermissoes = headerIndex['permissoes'];
    const cStatus = headerIndex['status'];

    if (cId == null || cTitulo == null || cAcao == null || cDestino == null) {
      return { ok: false, error: 'Tabela de menu precisa das colunas: id, titulo, acao, destino' };
    }

    const items = [];
    
    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      if (!row) continue;

      // Verifica se está ativo
      const status = cStatus != null ? String(row[cStatus] || '').toLowerCase() : 'ativo';
      if (status === 'inativo' || status === '0' || status === 'false') continue;

      const item = {
        id: String(row[cId] || ''),
        titulo: String(row[cTitulo] || ''),
        icone: cIcone != null ? String(row[cIcone] || '') : '',
        ordem: cOrdem != null ? (Number(row[cOrdem]) || 999) : 999,
        acao: String(row[cAcao] || 'route'),
        destino: String(row[cDestino] || ''),
        permissoes: cPermissoes != null ? String(row[cPermissoes] || '') : ''
      };

      if (!item.titulo || !item.destino) continue;

      items.push(item);
    }

    // Ordena pelos campos ordem e depois título
    items.sort((a, b) => {
      if (a.ordem !== b.ordem) return a.ordem - b.ordem;
      return a.titulo.localeCompare(b.titulo, 'pt-BR');
    });

    return { ok: true, items };
    
  } catch (err) {
    return { 
      ok: false, 
      error: 'Erro ao carregar menu: ' + (err && err.message ? err.message : err) 
    };
  }
}

/**
 * Filtra itens do menu baseado nas permissões do usuário
 * @param {string} userRole - Role do usuário atual
 * @returns {Object} { ok:boolean, items:Array }
 */
function getMenuForUser(userRole) {
  try {
    const result = listMenuItems();
    if (!result.ok) return result;

    const allowedItems = result.items.filter(item => {
      if (!item.permissoes || item.permissoes.trim() === '') {
        return true; // Sem restrição, todos podem ver
      }

      // Separa permissões por vírgula e verifica
      const permissions = item.permissoes.split(',').map(p => p.trim().toLowerCase());
      const currentRole = String(userRole || 'user').toLowerCase();
      
      return permissions.includes(currentRole) || permissions.includes('todos');
    });

    return { ok: true, items: allowedItems };
    
  } catch (err) {
    return { 
      ok: false, 
      error: 'Erro ao filtrar menu: ' + (err && err.message ? err.message : err) 
    };
  }
}