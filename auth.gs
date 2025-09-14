/** =========================================================
 *  auth_v2.gs — Login simples lendo a tabela 'usuarios'
 *  Requer colunas (min): login, pin, status
 *  Usa também, se existirem: uid, nome, role, ultimo_acesso
 * ========================================================= */

function loginUser(login, pin) {
  try {
    if (!login || !pin) return { ok: false, error: 'Informe login e pin.' };

    const { values, headerIndex, ctx } = readTableByNome_('usuarios');

    const cLogin = headerIndex['login'];
    const cPin   = headerIndex['pin'];
    const cStat  = headerIndex['status'];

    if (cLogin == null || cPin == null || cStat == null) {
      return { ok:false, error:'A tabela de usuários precisa de: login, pin, status.' };
    }

    const cUid   = headerIndex['uid'];
    const cNome  = headerIndex['nome'];
    const cRole  = headerIndex['role'];
    const cLast  = headerIndex['ultimo_acesso'];

    let foundRow = -1;
    let user = null;

    for (let r = 1; r < values.length; r++) {
      const row = values[r];
      const st  = String(row[cStat] || '').toLowerCase();
      if (st !== 'ativo' && st !== 'active' && st !== '1' && st !== 'true') continue;

      if (String(row[cLogin]).trim() === String(login).trim()
       && String(row[cPin]).trim()   === String(pin).trim()) {
        foundRow = r + 1; // 1-based
        user = {
          uid:  cUid  != null ? String(row[cUid]  || '') : '',
          nome: cNome != null ? String(row[cNome] || '') : '',
          role: cRole != null ? String(row[cRole] || '') : 'user',
          login: String(row[cLogin] || '')
        };
        break;
      }
    }

    if (!user) return { ok:false, error:'Usuário ou PIN inválidos (ou inativos).' };

    // Atualiza "ultimo_acesso" se existir
    if (cLast != null && foundRow > 0) {
      const ref = getPlanRef_('usuarios');
      const ctx2 = getContextFromRef_(ref);
      const sheet = ctx2.sheet || ctx.ctx.sheet;
      sheet.getRange(foundRow, cLast + 1).setValue(nowString_());
    }

    // Gera UID se vazio (opcional)
    if (!user.uid && cUid != null && foundRow > 0) {
      const allIds = values.slice(1).map(r => r[cUid]).filter(Boolean);
      const newId = generateSequentialId_('U', allIds, 3);
      const ref = getPlanRef_('usuarios');
      const ctx2 = getContextFromRef_(ref);
      const sheet = ctx2.sheet || ctx.ctx.sheet;
      sheet.getRange(foundRow, cUid + 1).setValue(newId);
      user.uid = newId;
    }

    return { ok:true, user };
  } catch (err) {
    return { ok:false, error:'loginUser: ' + (err && err.message || err) };
  }
}

/** Lista usuários ATIVOS para atribuição de atividades.
 *  (Agora lê via Tabela Planilhas: entrada 'usuarios')
 */
function listActiveUsers() {
  try {
    // ANTES: readNamedTable_(CONFIG.USERS_SSID, CONFIG.USERS_RANGE)
    // AGORA: usa o controle de planilhas
    const { values, headerIndex, ctx } = readTableByNome_('usuarios');
    if (!headerIndex) return { ok:false, error:'Estrutura da tabela de usuários inválida.' };

    const v = trimValuesByRequired_(values, headerIndex, ['login','pin','status']);

    const idxLogin = headerIndex['login'];
    const idxNome  = headerIndex['nome'];
    const idxUid   = headerIndex['uid'];
    const idxStatus= headerIndex['status'];

    const users = [];
    const existingUids = v.slice(1).map(r => (r[idxUid]||'').toString());

    for (let i=1; i<v.length; i++) {
      const row = v[i];
      if (!row) continue;

      // já era case-insensitive; aqui mantemos e aceitamos os mesmos "Ativo/ACTIVE/1/true/sim"
      const status = (row[idxStatus]||'').toString().trim().toLowerCase();
      if (!['ativo','active','1','true','sim'].includes(status)) continue;

      let uid = (row[idxUid]||'').toString().trim();
      if (!uid) {
        uid = generateSequentialId_('U', existingUids, 3);
        existingUids.push(uid);
        // ctx.range.getRow() é o início do intervalo (linha do cabeçalho)
        // + i (porque v[0] é cabeçalho, v[i] é a linha i abaixo do cabeçalho)
        const rowNumber = (ctx && ctx.range ? ctx.range.getRow() : 1) + i;
        ctx.sheet.getRange(rowNumber, idxUid + 1).setValue(uid);
      }

      users.push({ uid, nome: row[idxNome] || row[idxLogin] || uid, login: row[idxLogin] });
    }

    users.sort((a,b) => (a.nome||'').localeCompare(b.nome||'', 'pt-BR', { sensitivity: 'base' }));
    return { ok:true, users };
  } catch (err) {
    return { ok:false, error:'Erro: ' + (err && err.message ? err.message : err) };
  }
}

