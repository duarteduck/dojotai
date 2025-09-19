/** =========================================================
 *  auth_v2.gs — Login simples lendo a tabela 'usuarios'
 *  Requer colunas (min): login, pin, status
 *  Usa também, se existirem: uid, nome, role, ultimo_acesso
 * ========================================================= */

async function loginUser(login, pin) {
  try {
    // Usar SecurityManager sempre
    if (typeof SecurityManager === 'undefined') {
      throw new Error('SecurityManager não disponível');
    }

    const secureResult = await SecurityManager.secureLogin(login, pin);
    if (secureResult.ok) {
      // Converter formato para compatibilidade
      return {
        ok: true,
        user: {
          uid: secureResult.user.id,  // ID é usado como uid para compatibilidade
          nome: secureResult.user.nome,
          role: secureResult.user.role,
          login: secureResult.user.login
        }
      };
    }

    return secureResult; // Retorna erro do SecurityManager
  } catch (err) {
    return { ok: false, error: 'loginUser: ' + (err && err.message || err) };
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

