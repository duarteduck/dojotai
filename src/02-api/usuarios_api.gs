/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                             SISTEMA DOJOTAI V2.0 - API DE USUÁRIOS                              ║
 * ║                                    Criado: 25/09/2025                                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 *
 * @fileoverview API para gerenciar usuários do sistema
 * @author Sistema Dojotai Team
 * @version 2.0.0
 */

/**
 * Lista todos os usuários ativos do sistema
 * Refatorado para usar listActiveUsers (já migrado para DatabaseManager)
 * @returns {Object} Resultado com lista de usuários
 */
function listUsuariosApi() {
  try {
    console.log('📋 Listando usuários para seleção...');

    // Usar função já migrada para DatabaseManager
    const result = listActiveUsers();

    if (!result || !result.ok) {
      return {
        ok: false,
        error: result?.error || 'Nenhum usuário encontrado',
        items: []
      };
    }

    // Mapear para formato da API (uid e nome)
    const usuariosList = result.users.map(user => ({
      uid: user.uid,
      nome: user.nome || `Usuário ${user.uid}`
    }));

    console.log(`✅ ${usuariosList.length} usuários carregados`);

    return {
      ok: true,
      items: usuariosList,
      total: usuariosList.length
    };

  } catch (error) {
    console.error('❌ Erro ao listar usuários:', error);
    Logger.error('UsuariosAPI', 'Error listing users', { error: error.message });
    return {
      ok: false,
      error: error.message || 'Erro interno do servidor',
      items: []
    };
  }
}

// ============================================================================
// FUNÇÕES REMOVIDAS: Movidas para activities_api.gs - usuarios_api.gs:58-605
//
// Motivo: Reorganização por domínio - funções de atividades não devem estar em usuarios_api
// - listCategoriasAtividadesApi() → activities_api.gs (linhas 10-50)
// - createActivity() → activities_api.gs (linhas 58-241)
// - getActivityById() → activities_api.gs (linhas 249-364)
// - updateActivity() → activities_api.gs (linhas 372-486)
// - completeActivity() → activities_api.gs (linhas 494-593)
//
// Todas as 5 funções são endpoints públicos chamados via google.script.run pelo frontend
// Localização nova: src/02-api/activities_api.gs
//
// Removido em: Migração #2 - Fase 1, Reorganização de Arquivos
// Data: 02/10/2025
// ============================================================================

// REMOVIDO: listCategoriasAtividadesApi() → Movido para activities_api.gs:10-50
// REMOVIDO: createActivity() → Movido para activities_api.gs:58-241
// REMOVIDO: getActivityById() → Movido para activities_api.gs:249-364
// REMOVIDO: updateActivity() → Movido para activities_api.gs:372-486
// REMOVIDO: completeActivity() → Movido para activities_api.gs:494-593

/**
 * Retorna o usuário atual logado para filtros
 * @returns {Object} Dados do usuário atual
 */
function getCurrentUserForFilter() {
  try {
    // Obter usuário logado real via sessão
    const sessionId = PropertiesService.getScriptProperties().getProperty('currentSessionId');
    if (!sessionId) {
      console.log('❌ Usuário não autenticado - sem sessão ativa');
      return null;
    }

    const sessionData = validateSession(sessionId);
    if (!sessionData || !sessionData.ok || !sessionData.session) {
      console.log('❌ Sessão inválida ou expirada');
      return null;
    }

    const userId = sessionData.session.user_id;

    // Buscar dados do usuário
    const usuario = DatabaseManager.findById('usuarios', userId);
    if (!usuario) {
      console.log('❌ Usuário não encontrado na base de dados:', userId);
      return null;
    }

    return {
      uid: usuario.uid,
      nome: usuario.nome
    };
  } catch (error) {
    console.error('❌ Erro ao obter usuário atual para filtro:', error);
    return null;
  }
}

/**
 * Autentica usuário e cria sessão usando SecurityManager existente
 * @param {string} login - Login do usuário
 * @param {string} password - PIN do usuário
 * @returns {Object} Resultado da autenticação
 */
async function authenticateUser(login, password) {
  try {
    console.log('🔐 Autenticando usuário:', login);

    // Usar SecurityManager.secureLogin existente
    const loginResult = await SecurityManager.secureLogin(login, password);

    if (!loginResult.ok) {
      return {
        success: false,
        error: loginResult.error
      };
    }

    // Criar sessão usando SessionManager
    const sessionResult = await createSession(loginResult.user.uid, {
      platform: 'web',
      login_method: 'pin'
    });

    console.log('🔍 Resultado da criação de sessão:', sessionResult);

    if (!sessionResult || !sessionResult.ok || !sessionResult.session) {
      return {
        success: false,
        error: 'Erro ao criar sessão: ' + (sessionResult?.error || 'Resposta inválida do SessionManager')
      };
    }

    // Salvar sessionId para uso posterior
    PropertiesService.getScriptProperties().setProperty('currentSessionId', sessionResult.session.id);
    console.log('💾 SessionId salvo:', sessionResult.session.id);

    console.log('✅ Login bem-sucedido para usuário:', loginResult.user.uid);

    return {
      success: true,
      user: {
        uid: loginResult.user.uid,
        nome: loginResult.user.nome,
        login: loginResult.user.login,
        role: loginResult.user.role
      },
      session: {
        id: sessionResult.session.id,
        expires_at: sessionResult.session.expires_at
      }
    };

  } catch (error) {
    console.error('❌ Erro na autenticação:', error);
    return {
      success: false,
      error: 'Erro interno do servidor: ' + error.message
    };
  }
}

/**
 * Retorna dados do usuário logado atualmente (para menu dinâmico)
 * @returns {Object} Dados do usuário logado
 */
function getCurrentLoggedUser() {
  try {
    console.log('👤 Buscando usuário logado atual...');

    // Método 1: Tentar via sessão atual armazenada
    let sessionId = PropertiesService.getScriptProperties().getProperty('currentSessionId');
    console.log('🔍 SessionId recuperado das propriedades:', sessionId);

    if (sessionId) {
      const sessionData = validateSession(sessionId);
      console.log('🔍 Dados da sessão validada:', sessionData);

      if (sessionData && sessionData.ok && sessionData.session) {
        const userId = sessionData.session.user_id;
        console.log('🔍 UserId da sessão:', userId);

        const usuario = DatabaseManager.findById('usuarios', userId);
        if (usuario) {
          console.log('✅ Usuário encontrado via sessão:', usuario.uid, usuario.nome);
          return {
            uid: usuario.uid,
            nome: usuario.nome,
            metodo: 'sessao_ativa'
          };
        }
      }
    }

    // Método 2: Tentar buscar sessão ativa mais recente (migrado para DatabaseManager)
    console.log('🔄 Tentando método 2: sessão ativa mais recente...');
    try {
      // Buscar todas as sessões ativas usando DatabaseManager
      const queryResult = DatabaseManager.query('sessoes', { active: 'true' }, false);
      const sessions = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

      if (sessions && sessions.length > 0) {
        // Ordenar por created_at (mais recente primeiro)
        const sessionsOrdenadas = sessions.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });

        const sessionAtiva = sessionsOrdenadas[0];
        console.log('🔍 Sessão ativa mais recente encontrada:', sessionAtiva.session_id);

        const usuario = DatabaseManager.findById('usuarios', sessionAtiva.user_id);
        if (usuario) {
          console.log('✅ Usuário encontrado via sessão ativa:', usuario.uid, usuario.nome);
          return {
            uid: usuario.uid,
            nome: usuario.nome,
            metodo: 'sessao_ativa_recente'
          };
        }
      }
    } catch (sessionError) {
      console.warn('⚠️ Erro ao buscar sessões ativas:', sessionError.message);
      Logger.error('UsuariosAPI', 'Error finding active session', { error: sessionError.message });
    }

    // Método 3: Log para debug - NÃO retornar usuário aleatório
    console.log('❌ Nenhum usuário logado encontrado pelos métodos disponíveis');
    console.log('💡 Isso pode indicar que o usuário precisa fazer login novamente');

    return null;

  } catch (error) {
    console.error('❌ Erro ao obter usuário logado:', error);
    return null;
  }
}

/**
 * Retorna o primeiro usuário da tabela para desenvolvimento
 * @returns {Object} Dados do usuário para desenvolvimento
 */
function getFirstUserForDev() {
  try {
    const usuarios = DatabaseManager.query('usuarios', {}, false);
    if (!usuarios || usuarios.length === 0) {
      return null;
    }

    const firstUser = usuarios[0];
    return {
      uid: firstUser.uid,
      nome: firstUser.nome,
      login: firstUser.login
    };
  } catch (error) {
    console.error('❌ Erro ao obter primeiro usuário:', error);
    return null;
  }
}