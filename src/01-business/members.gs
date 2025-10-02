// members.gs - Sistema de Gestão de Membros (Adaptado aos campos existentes)

/**
 * Lista todos os membros do sistema
 * @returns {Object} { ok: boolean, items: Array }
 */
function listMembersApi() {
  try {
    const result = _listMembersCore();
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    return { ok: false, error: 'Erro listMembersApi: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Core da listagem de membros
 * MIGRADO para DatabaseManager
 */
function _listMembersCore() {
  try {
    // Migrado para DatabaseManager - Query com cache habilitado (membros mudam raramente)
    const queryResult = DatabaseManager.query('membros', {}, true);
    const membros = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!membros || membros.length === 0) {
      return { ok: true, items: [] };
    }

    const items = [];

    membros.forEach(m => {
      // Validar campos obrigatórios
      if (!m.codigo_sequencial && !m.nome) return;
      if (!m.codigo_sequencial || !m.nome) return;

      const member = {
        // Campos obrigatórios mapeados
        id: String(m.codigo_sequencial || '').trim(),
        codigo_sequencial: String(m.codigo_sequencial || '').trim(),
        codigo_mestre: String(m.codigo_mestre || '').trim(),
        nome: String(m.nome || '').trim(),
        nome_completo: String(m.nome || '').trim(), // alias
        nome_exibicao: String(m.nome || '').trim(), // alias
        status: String(m.status || 'Ativo').trim(),

        // Campos de organização
        dojo: String(m.dojo || '').trim(),
        categoria_grupo: String(m.categoria_grupo || '').trim(),
        categoria_membro: String(m.categoria_membro || '').trim(),
        buntai: String(m.buntai || '').trim(),
        ordenacao: Number(m.ordenacao || 999),
        cargo: String(m.cargo || '').trim(),

        // Dados pessoais
        sexo: String(m.sexo || '').trim(),
        data_nascimento: m.data_nascimento || '',
        idade: Number(m.idade || 0),
        grau_omitama: String(m.grau_omitama || '').trim(),
        numero_seminario_basico: String(m.numero_seminario_basico || '').trim(),

        // Campos opcionais (sempre incluir, DatabaseManager já traz se existir)
        telefone: String(m.telefone || '').trim(),
        email: String(m.email || '').trim(),
        endereco: String(m.endereco || '').trim(),
        usuario_uid: String(m.usuario_uid || '').trim(),
        criado_em: m.criado_em || '',
        atualizado_em: m.atualizado_em || ''
      };

      items.push(member);
    });

    // Ordenação: por ordenacao primeiro, depois por nome
    items.sort((a, b) => {
      if (a.ordenacao !== b.ordenacao) return a.ordenacao - b.ordenacao;
      return a.nome.localeCompare(b.nome, 'pt-BR');
    });

    return { ok: true, items };

  } catch (err) {
    Logger.error('Members', 'Erro ao listar membros', {
      error: err && err.message ? err.message : err
    });
    return { ok: false, error: 'Erro _listMembersCore: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Lista membros ativos (para seleção em atividades)
 * @returns {Object} { ok: boolean, items: Array }
 */
function listActiveMembersApi() {
  try {
    const result = _listMembersCore();
    if (!result.ok) return result;
    
    // Filtra apenas membros ativos
    const activeMembers = (result.items || []).filter(member => {
      const status = member.status.toLowerCase();
      return ['ativo', 'active', '1'].includes(status);
    });
    
    return { ok: true, items: activeMembers };
    
  } catch (err) {
    return { ok: false, error: 'Erro listActiveMembersApi: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Busca membro por ID (codigo_sequencial)
 * @param {string} id - ID do membro
 * @returns {Object} { ok: boolean, item?: Object, error?: string }
 */
function getMemberById(id) {
  try {
    if (!id) return { ok: false, error: 'ID não informado.' };
    
    const result = _listMembersCore();
    if (!result || !result.ok) return { ok: false, error: (result && result.error) || 'Falha ao listar.' };
    
    const items = result.items || [];
    const member = items.find(m => m.id === id.toString().trim());
    
    if (!member) return { ok: false, error: 'Membro não encontrado.' };
    
    return { ok: true, item: member };
    
  } catch (err) {
    return { ok: false, error: 'Erro getMemberById: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Busca membros por critérios
 * @param {Object} filters - Filtros de busca
 * @returns {Object} { ok: boolean, items: Array }
 */
function searchMembers(filters) {
  try {
    const result = _listMembersCore();
    if (!result.ok) return result;
    
    let items = result.items || [];
    
    // Aplica filtros
    if (filters.nome) {
      const nome = filters.nome.toLowerCase();
      items = items.filter(m => m.nome.toLowerCase().includes(nome));
    }
    
    if (filters.status) {
      items = items.filter(m => m.status.toLowerCase() === filters.status.toLowerCase());
    }
    
    if (filters.dojo) {
      items = items.filter(m => m.dojo.toLowerCase().includes(filters.dojo.toLowerCase()));
    }
    
    if (filters.categoria_grupo) {
      items = items.filter(m => m.categoria_grupo === filters.categoria_grupo);
    }
    
    if (filters.categoria_membro) {
      items = items.filter(m => m.categoria_membro === filters.categoria_membro);
    }
    
    return { ok: true, items };
    
  } catch (err) {
    return { ok: false, error: 'Erro searchMembers: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Vincula membro com usuário (migrado para DatabaseManager)
 *
 * Permite vincular um membro do dojo (aluno/praticante) com uma conta de usuário do sistema.
 * Útil para quando alunos tiverem login próprio e precisarem ver suas atividades/presenças.
 *
 * @param {string} memberId - ID do membro (codigo_sequencial)
 * @param {string} usuarioUid - UID do usuário
 * @param {string} editorUid - UID de quem está fazendo a vinculação
 * @returns {Object} { ok: boolean, message?: string, error?: string }
 */
async function linkMemberToUser(memberId, usuarioUid, editorUid) {
  try {
    if (!memberId || !usuarioUid) {
      return { ok: false, error: 'ID do membro e UID do usuário são obrigatórios.' };
    }

    // Verifica se o usuário existe e está ativo (usa função já migrada)
    const users = getUsersMapReadOnly_();
    if (!users[usuarioUid]) {
      return { ok: false, error: 'Usuário não encontrado ou inativo.' };
    }

    // Verifica se o usuário já está vinculado a outro membro (usa função já migrada)
    const existingMembers = _listMembersCore();
    if (existingMembers.ok && existingMembers.items) {
      const alreadyLinked = existingMembers.items.find(m =>
        m.usuario_uid === usuarioUid && m.id !== memberId
      );
      if (alreadyLinked) {
        return { ok: false, error: `Usuário já está vinculado ao membro: ${alreadyLinked.nome}` };
      }
    }

    // Buscar membro específico para pegar o PRIMARY KEY (id)
    const member = existingMembers.items?.find(m => m.id === memberId);
    if (!member) {
      return { ok: false, error: 'Membro não encontrado.' };
    }

    // Atualizar usando DatabaseManager
    const updateResult = await DatabaseManager.update('membros', member.id, {
      usuario_uid: usuarioUid
      // atualizado_em é preenchido automaticamente pelo DatabaseManager
    });

    if (!updateResult || !updateResult.success) {
      return {
        ok: false,
        error: updateResult?.error || 'Erro ao vincular membro com usuário'
      };
    }

    const userName = users[usuarioUid].nome;
    const memberName = member.nome;

    Logger.info('Members', 'Member linked to user', {
      memberId,
      memberName,
      usuarioUid,
      userName,
      editorUid
    });

    return {
      ok: true,
      message: `Membro ${memberName} vinculado com usuário ${userName}`
    };

  } catch (err) {
    Logger.error('Members', 'Error linking member to user', {
      memberId,
      usuarioUid,
      error: err.message
    });
    return { ok: false, error: 'Erro linkMemberToUser: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Contexto da planilha de membros
 */
function getMembersCtx_() {
  const ref = getPlanRef_('membros');
  const ctxPlan = getContextFromRef_(ref);

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

  const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
    ? SpreadsheetApp.openById(ref.ssid)
    : SpreadsheetApp.getActiveSpreadsheet();
  const rng = ss.getRange(ctxPlan.rangeStr);
  return {
    sheet: rng.getSheet(),
    startRow: rng.getRow(),
    startCol: rng.getColumn()
  };
}

/**
 * Lê dados completos da tabela de membros
 */
function getFullTableValuesMembros_(ctx) {
  const sh = ctx.sheet;
  const startRow = Number(ctx.startRow) || 1;
  const startCol = Number(ctx.startCol) || 1;

  const lastColSheet = sh.getLastColumn();
  const headerRow = sh.getRange(startRow, startCol, 1, Math.max(1, lastColSheet - startCol + 1)).getValues()[0];

  let width = headerRow.length;
  for (let c = headerRow.length - 1; c >= 0; c--) {
    const v = headerRow[c];
    if (!(v === '' || v == null)) { width = c + 1; break; }
    if (c === 0) width = 1;
  }

  const lastRow = sh.getLastRow();
  if (lastRow < startRow) return [headerRow.slice(0, width)];

  const rng = sh.getRange(startRow, startCol, lastRow - startRow + 1, width);
  return rng.getValues();
}