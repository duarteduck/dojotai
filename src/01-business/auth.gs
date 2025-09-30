/** =========================================================
 *  auth_v2.gs — Login simples lendo a tabela 'usuarios'
 *  Requer colunas (min): login, pin, status
 *  Usa também, se existirem: uid, nome, role, ultimo_acesso
 * ========================================================= */

async function loginUser(login, pin, deviceInfo = {}) {
  try {
    // Usar SecurityManager sempre
    if (typeof SecurityManager === 'undefined') {
      throw new Error('SecurityManager não disponível');
    }

    const secureResult = await SecurityManager.secureLogin(login, pin);
    if (secureResult.ok) {
      // Criar sessão robusta usando SessionManager centralizado
      const sessionResult = await createSession(secureResult.user.id, deviceInfo);

      if (sessionResult.ok) {
        Logger.info('Auth', 'Login successful with session', {
          userId: secureResult.user.id,
          sessionId: sessionResult.session.id
        });

        // Converter formato para compatibilidade + dados da sessão
        return {
          ok: true,
          user: {
            uid: secureResult.user.id,
            nome: secureResult.user.nome,
            role: secureResult.user.role,
            login: secureResult.user.login
          },
          session: {
            id: sessionResult.session.id,
            expires_at: sessionResult.session.expires_at,
            created_at: sessionResult.session.created_at
          }
        };
      } else {
        Logger.warn('Auth', 'Session creation failed, proceeding without session', {
          userId: secureResult.user.id,
          error: sessionResult.error
        });

        // Login funcionou, mas sessão falhou - proceder sem sessão robusta
        return {
          ok: true,
          user: {
            uid: secureResult.user.id,
            nome: secureResult.user.nome,
            role: secureResult.user.role,
            login: secureResult.user.login
          },
          session: null // Indica que não tem sessão robusta
        };
      }
    }

    return secureResult; // Retorna erro do SecurityManager
  } catch (err) {
    Logger.error('Auth', 'Login error', { login, error: err.message });
    return { ok: false, error: 'loginUser: ' + (err && err.message || err) };
  }
}

/**
 * Validar sessão existente
 * @param {string} sessionId - ID da sessão
 * @returns {Object} Resultado da validação
 */
async function validateSession(sessionId) {
  try {
    if (typeof SessionManager === 'undefined') {
      return { ok: false, error: 'SessionManager não disponível' };
    }

    return validateSession(sessionId);
  } catch (err) {
    Logger.error('Auth', 'Session validation error', { sessionId, error: err.message });
    return { ok: false, error: 'validateSession: ' + (err && err.message || err) };
  }
}

/**
 * Logout com destruição de sessão
 * @param {string} sessionId - ID da sessão
 * @returns {Object} Resultado do logout
 */
async function logoutUser(sessionId) {
  try {
    if (!sessionId) {
      Logger.info('Auth', 'Logout without session');
      return { ok: true, message: 'Logout realizado' };
    }

    if (typeof SessionManager === 'undefined') {
      Logger.warn('Auth', 'SessionManager not available for logout');
      return { ok: true, message: 'Logout realizado (sem gestão de sessões)' };
    }

    const result = destroySession(sessionId);
    Logger.info('Auth', 'Logout completed', { sessionId, success: result.ok });

    return result;
  } catch (err) {
    Logger.error('Auth', 'Logout error', { sessionId, error: err.message });
    return { ok: false, error: 'logoutUser: ' + (err && err.message || err) };
  }
}

/**
 * Forçar logout de todas as sessões de um usuário
 * @param {string} userId - ID do usuário
 * @returns {Object} Resultado da operação
 */
async function forceLogoutUser(userId) {
  try {
    if (typeof SessionManager === 'undefined') {
      return { ok: false, error: 'SessionManager não disponível' };
    }

    const result = await SessionManager.destroyAllUserSessions(userId);
    Logger.info('Auth', 'Force logout completed', { userId, result });

    return result;
  } catch (err) {
    Logger.error('Auth', 'Force logout error', { userId, error: err.message });
    return { ok: false, error: 'forceLogoutUser: ' + (err && err.message || err) };
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

