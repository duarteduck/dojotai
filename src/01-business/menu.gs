// menu.gs - Sistema de Menu via planilha

/**
 * Lista itens do menu para o usuário atual
 * @returns {Object} { ok:boolean, items:Array }
 */
function listMenuItems() {
  try {
    // Usar DatabaseManager para buscar itens do menu (com sanitização e cache)
    const queryResult = DatabaseManager.query('menu', {}, false);
    const menuItems = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!menuItems || menuItems.length === 0) {
      return { ok: true, items: [] }; // Menu vazio é válido
    }

    const items = [];

    menuItems.forEach(menuItem => {
      // Verifica se está ativo
      const status = menuItem.status ? String(menuItem.status).toLowerCase() : 'ativo';
      if (status === 'inativo' || status === '0' || status === 'false') return;

      // Validar campos obrigatórios
      if (!menuItem.titulo || !menuItem.destino) return;

      const item = {
        id: String(menuItem.id || ''),
        titulo: String(menuItem.titulo || ''),
        icone: String(menuItem.icone || ''),
        ordem: Number(menuItem.ordem) || 999,
        acao: String(menuItem.acao || 'route'),
        destino: String(menuItem.destino || ''),
        permissoes: String(menuItem.permissoes || '')
      };

      items.push(item);
    });

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