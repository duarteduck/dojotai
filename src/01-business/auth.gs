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

// ============================================================================
// FUNÇÃO REMOVIDA: validateSession() - auth.gs:72-83
//
// Motivo: Função duplicada e com BUG de recursão infinita
// - Versão correta existe em session_manager.gs:131
// - Esta versão chamava a si mesma (linha 78), causando recursão infinita
// - Wrapper desnecessário - validateSession() já está disponível globalmente
//
// Bug encontrado: return validateSession(sessionId) chamava a si mesma
// Deveria chamar a função de session_manager.gs, mas ela já está disponível
//
// Removido em: Correção de bug - Sessão inválida
// Data: 02/10/2025
// ============================================================================

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

// ============================================================================
// FUNÇÃO REMOVIDA: forceLogoutUser() - auth.gs:109-128 (20 linhas)
//
// Motivo: Função órfã nunca utilizada
// - Única referência: classe SessionManager antiga em database_manager.gs (removida)
// - Chamava SessionManager.destroyAllUserSessions() que não existe
// - Funcionalidade substituída por destroySession() em session_manager.gs:199-235
// - Nenhuma parte do sistema chama forceLogoutUser()
//
// Se necessário no futuro, criar função similar usando session_manager.gs:
//   const sessions = getUserSessions(userId);
//   sessions.forEach(s => destroySession(s.session_id));
//
// Removido em: Migração #2 - Auto Logout, Consolidação de Sessões
// Data: 02/10/2025
// ============================================================================

/** Lista usuários ATIVOS para atribuição de atividades.
 *  Migrado para DatabaseManager (cache habilitado - usuários mudam raramente)
 */
function listActiveUsers() {
  try {
    // Migrado para DatabaseManager - Query com cache habilitado
    const queryResult = DatabaseManager.query('usuarios', {}, true);
    const usuarios = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!usuarios || usuarios.length === 0) {
      return { ok: true, users: [] };
    }

    const users = [];

    usuarios.forEach(user => {
      // Filtrar apenas usuários ativos
      const status = String(user.status || '').trim().toLowerCase();
      if (!['ativo', 'active', '1', 'true', 'sim'].includes(status)) return;

      // Validar campos obrigatórios
      if (!user.login) return;

      // uid já é gerado automaticamente pelo DatabaseManager (PRIMARY KEY)
      const uid = String(user.uid || user.id || '').trim();
      if (!uid) return;

      users.push({
        uid: uid,
        nome: user.nome || user.login || uid,
        login: user.login
      });
    });

    // Ordenar por nome (case-insensitive, locale pt-BR)
    users.sort((a, b) => (a.nome || '').localeCompare(b.nome || '', 'pt-BR', { sensitivity: 'base' }));

    return { ok: true, users };
  } catch (err) {
    Logger.error('Auth', 'Error listing active users', { error: err.message });
    return { ok: false, error: 'Erro: ' + (err && err.message ? err.message : err) };
  }
}

