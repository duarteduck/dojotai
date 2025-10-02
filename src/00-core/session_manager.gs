/**
 * SessionManager V4 - Sistema de Sessões Centralizado
 *
 * @fileoverview Sistema robusto de gerenciamento de sessões com integração
 * completa ao DatabaseManager, validações automáticas e logs estruturados.
 *
 * @author Sistema Dojotai Team
 * @version 4.0.0
 * @since 22/09/2025
 *
 * @description Funcionalidades principais:
 * - DatabaseManager centralizado
 * - Validações FK automáticas
 * - Logs estruturados
 * - Cache management
 * - Tokens únicos seguros
 * - Limpeza automática de sessões expiradas
 */

/**
 * Criar nova sessão usando DatabaseManager centralizado
 *
 * @description Cria uma nova sessão para um usuário autenticado.
 * Gera token único, verifica existência do usuário e persiste no banco.
 *
 * @param {string} userId - ID do usuário (usuarios.uid)
 * @param {Object} [deviceInfo={}] - Informações do dispositivo
 * @param {string} [deviceInfo.ip] - IP do cliente
 * @param {string} [deviceInfo.userAgent] - User agent do browser
 * @param {string} [deviceInfo.platform] - Plataforma (web, mobile, etc)
 * @param {string} [deviceInfo.login_method] - Método de login usado
 *
 * @returns {Promise<Object>} Resultado da operação
 * @returns {boolean} returns.ok - Se a operação foi bem-sucedida
 * @returns {Object} [returns.session] - Dados da sessão criada
 * @returns {string} [returns.session.id] - Token único da sessão
 * @returns {string} [returns.session.user_id] - ID do usuário
 * @returns {string} [returns.session.expires_at] - Data de expiração
 * @returns {string} [returns.error] - Mensagem de erro se falhou
 *
 * @example
 * const result = await createSession('USR-123', {
 *   ip: '192.168.1.1',
 *   userAgent: 'Mozilla/5.0...',
 *   platform: 'web'
 * });
 * if (result.ok) {
 *   console.log('Sessão criada:', result.session.id);
 * }
 *
 * @since 4.0.0
 */
async function createSession(userId, deviceInfo = {}) {
  try {
    Logger.info('SessionManager', 'Criando sessão', { userId });

    // Verificar se usuário existe (validação básica)
    const userExists = checkUserExists(userId);
    if (!userExists) {
      Logger.warn('SessionManager', 'Usuário não existe', { userId });
      return { ok: false, error: 'Usuário não encontrado' };
    }

    // Gerar dados da sessão
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (8 * 60 * 60 * 1000)); // 8 horas

    // Gerar token único da sessão
    const sessionToken = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // Preparar dados estruturados para DatabaseManager
    const sessionData = {
      session_id: sessionToken, // Token único da sessão
      user_id: userId,
      created_at: Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss'),
      expires_at: Utilities.formatDate(expiresAt, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss'),
      ip_address: deviceInfo.ip || '127.0.0.1',
      device_info: JSON.stringify({
        userAgent: deviceInfo.userAgent || 'Unknown',
        platform: deviceInfo.platform || 'web',
        login_method: deviceInfo.login_method || 'standard',
        timestamp: now.getTime()
      }),
      active: 'sim',
      last_activity: Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss'),
      destroyed_at: ''
    };

    // Usar DatabaseManager.insert() centralizado
    const insertResult = await DatabaseManager.insert('sessoes', sessionData);

    if (insertResult.success) {
      Logger.info('SessionManager', 'Sessão criada com sucesso', {
        sessionId: sessionToken,
        recordId: insertResult.id,
        userId
      });

      return {
        ok: true,
        session: {
          id: sessionToken, // Retornar o token da sessão para o frontend
          user_id: userId,
          expires_at: sessionData.expires_at,
          created_at: sessionData.created_at,
          active: true
        }
      };
    } else {
      Logger.error('SessionManager', 'Falha no DatabaseManager.insert()', {
        error: insertResult.error,
        userId
      });
      return { ok: false, error: insertResult.error };
    }

  } catch (error) {
    Logger.error('SessionManager', 'Erro ao criar sessão', {
      error: error.message,
      userId
    });
    return { ok: false, error: error.message };
  }
}

/**
 * Validar sessão existente
 * @param {string} sessionId - ID da sessão
 * @returns {Object} Resultado da validação
 */
function validateSession(sessionId) {
  try {
    Logger.debug('SessionManager', 'Validando sessão', { sessionId });

    // Buscar sessão pelo campo session_id usando query()
    const queryResult = DatabaseManager.query('sessoes', { session_id: sessionId }, false);
    console.log('🔍 validateSession - queryResult:', JSON.stringify(queryResult));

    const sessions = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);
    console.log('🔍 validateSession - sessions:', JSON.stringify(sessions));

    if (!sessions || sessions.length === 0) {
      Logger.debug('SessionManager', 'Sessão não encontrada', { sessionId });
      console.log('❌ Sessão não encontrada');
      return { ok: false, error: 'Sessão não encontrada' };
    }

    const session = sessions[0];
    console.log('🔍 validateSession - session encontrada:', JSON.stringify(session));
    console.log('🔍 validateSession - session.active:', session.active);

    // Verificar se está ativa
    if (session.active !== 'sim') {
      Logger.debug('SessionManager', 'Sessão inativa', { sessionId, active: session.active });
      console.log('❌ Sessão inativa - session.active:', session.active);
      return { ok: false, error: 'Sessão inativa' };
    }

    // Verificar se não expirou
    const expiresAt = new Date(session.expires_at);
    const now = new Date();

    if (now > expiresAt) {
      Logger.debug('SessionManager', 'Sessão expirada', { sessionId, expiresAt });
      return { ok: false, error: 'Sessão expirada' };
    }

    // Atualizar last_activity usando o PRIMARY KEY (id, ex: SES-0055)
    DatabaseManager.update('sessoes', session.id, {
      last_activity: Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss')
    });

    const sessionData = {
      id: session.session_id,
      user_id: session.user_id,
      expires_at: session.expires_at,
      created_at: session.created_at,
      active: session.active === 'sim'
    };

    Logger.debug('SessionManager', 'Sessão válida', { sessionId, userId: sessionData.user_id });

    return {
      ok: true,
      session: sessionData
    };

  } catch (error) {
    Logger.error('SessionManager', 'Erro ao validar sessão', {
      error: error.message,
      sessionId
    });
    return { ok: false, error: error.message };
  }
}

/**
 * Destruir/desativar sessão
 * @param {string} sessionId - ID da sessão
 * @returns {Object} Resultado da operação
 */
function destroySession(sessionId) {
  try {
    Logger.info('SessionManager', 'Destruindo sessão', { sessionId });

    // Buscar sessão pelo campo session_id usando query()
    const queryResult = DatabaseManager.query('sessoes', { session_id: sessionId }, false);
    const sessions = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!sessions || sessions.length === 0) {
      Logger.warn('SessionManager', 'Sessão não encontrada', { sessionId });
      return { ok: false, error: 'Sessão não encontrada' };
    }

    const session = sessions[0];

    // Atualizar usando o PRIMARY KEY (id)
    const updateResult = DatabaseManager.update('sessoes', session.id, {
      active: '',
      destroyed_at: Utilities.formatDate(new Date(), 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss')
    });

    // Update executado com sucesso

    // Se updateResult está vazio ({}), significa que funcionou
    // DatabaseManager.update() pode retornar objeto vazio quando bem-sucedido
    if (updateResult.ok || updateResult.success ||
        (typeof updateResult === 'object' && !updateResult.error)) {
      Logger.info('SessionManager', 'Sessão destruída com sucesso', { sessionId });
      return { ok: true, message: 'Sessão destruída' };
    } else {
      Logger.error('SessionManager', 'Falha ao destruir sessão', {
        sessionId,
        error: updateResult.error || updateResult.message || 'Erro desconhecido',
        updateResult: updateResult
      });
      return { ok: false, error: updateResult.error || updateResult.message || 'Erro desconhecido' };
    }

  } catch (error) {
    Logger.error('SessionManager', 'Erro ao destruir sessão', {
      error: error.message,
      sessionId
    });
    return { ok: false, error: error.message };
  }
}

/**
 * Obter estatísticas das sessões
 * @returns {Object} Estatísticas das sessões
 */
function getSessionStats() {
  try {
    Logger.debug('SessionManager', 'Obtendo estatísticas das sessões');

    // Usar DatabaseManager (retorna apenas registros não deletados)
    const queryResult = DatabaseManager.query('sessoes', {}, false);

    // DatabaseManager.query() pode retornar array ou {data, pagination}
    const sessions = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!sessions) {
      return { error: 'Erro ao acessar tabela de sessões' };
    }

    const now = new Date();
    const stats = {
      total_sessions: sessions.length,
      active_sessions: 0,
      expired_sessions: 0,
      inactive_sessions: 0
    };

    // Processar cada sessão
    sessions.forEach(session => {
      const expiresAt = new Date(session.expires_at);

      if (session.active === 'sim') {
        if (now <= expiresAt) {
          stats.active_sessions++;
        } else {
          stats.expired_sessions++;
        }
      } else {
        stats.inactive_sessions++;
      }
    });

    Logger.debug('SessionManager', 'Estatísticas obtidas', stats);
    return stats;

  } catch (error) {
    Logger.error('SessionManager', 'Erro ao obter estatísticas', { error: error.message });
    return { error: error.message };
  }
}

/**
 * Verificar se usuário existe (função auxiliar)
 * @param {string} userId - ID do usuário
 * @returns {boolean} True se existe
 */
function checkUserExists(userId) {
  try {
    const users = DatabaseManager.query('usuarios', { uid: userId });
    return users && users.length > 0;
  } catch (error) {
    Logger.warn('SessionManager', 'Erro ao verificar usuário', { userId, error: error.message });
    return false; // Em caso de erro, assume que não existe
  }
}

/**
 * Limpar sessões expiradas (função de manutenção)
 * @returns {Object} Resultado da limpeza
 */
function cleanupExpiredSessions() {
  try {
    Logger.info('SessionManager', 'Iniciando limpeza de sessões expiradas');

    // Usar DatabaseManager para buscar todas as sessões ativas
    const queryResult = DatabaseManager.query('sessoes', { active: 'sim' }, false);

    // DatabaseManager.query() pode retornar array ou {data, pagination}
    const sessions = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);

    if (!sessions) {
      return { ok: false, error: 'Erro ao acessar tabela de sessões' };
    }

    const now = new Date();
    let cleanedCount = 0;

    // Processar cada sessão ativa
    sessions.forEach(session => {
      const expiresAt = new Date(session.expires_at);

      // Se expirada, desativar
      if (now > expiresAt) {
        // Atualizar usando o PRIMARY KEY (id)
        const updateResult = DatabaseManager.update('sessoes', session.id, {
          active: '',
          destroyed_at: Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss')
        });

        if (updateResult.success) {
          cleanedCount++;
        }
      }
    });

    Logger.info('SessionManager', 'Limpeza concluída', { sessionsCleanedCount: cleanedCount });

    return {
      ok: true,
      cleaned: cleanedCount,
      message: `${cleanedCount} sessões expiradas foram limpas`
    };

  } catch (error) {
    Logger.error('SessionManager', 'Erro na limpeza de sessões', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Limpar logs do sistema antigos (>7 dias)
 * @returns {Object} Resultado da limpeza
 */
async function cleanupOldSystemLogs() {
  try {
    Logger.info('SystemMaintenance', 'Iniciando limpeza de logs antigos');

    // ✅ USAR DatabaseManager.query() em vez de readTableByNome_
    const logsQuery = await DatabaseManager.query('system_logs', {});
    if (!logsQuery.success || !logsQuery.data || logsQuery.data.length === 0) {
      return { ok: true, cleaned: 0, message: 'Nenhum log para limpar' };
    }

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000)); // 7 dias atrás
    let cleanedCount = 0;

    // Identificar logs antigos para remoção
    const logsToDelete = [];
    logsQuery.data.forEach(log => {
      const logTimestamp = new Date(log.created_at);

      // Se log for mais antigo que 7 dias
      if (logTimestamp < cutoffDate) {
        logsToDelete.push(log.id);
      }
    });

    // Deletar logs antigos usando DatabaseManager
    for (const logId of logsToDelete) {
      try {
        const deleteResult = await DatabaseManager.delete('system_logs', logId);
        if (deleteResult.success) {
          cleanedCount++;
        }
      } catch (error) {
        Logger.warn('SystemMaintenance', 'Falha ao deletar log antigo', { logId, error: error.message });
      }
    }

    Logger.info('SystemMaintenance', 'Limpeza de logs concluída', {
      logsCleanedCount: cleanedCount,
      totalIdentified: logsToDelete.length
    });

    return {
      ok: true,
      cleaned: cleanedCount,
      message: `${cleanedCount} logs antigos foram removidos`
    };

  } catch (error) {
    Logger.error('SystemMaintenance', 'Erro na limpeza de logs', { error: error.message });
    return { ok: false, error: error.message };
  }
}

// ================================================================================
// FUNÇÕES DE COMPATIBILIDADE COM CÓDIGO EXISTENTE
// ================================================================================

/**
 * Aliases para compatibilidade com session_manager_simple.gs
 */
function createSessionSimple(userId, deviceInfo) {
  return createSession(userId, deviceInfo);
}

function validateSessionSimple(sessionId) {
  return validateSession(sessionId);
}

function destroySessionSimple(sessionId) {
  return destroySession(sessionId);
}

function getSessionStatsSimple() {
  return getSessionStats();
}

/**
 * Função de manutenção automática - executar periodicamente
 * @returns {Object} Resultado da manutenção
 */
async function runSystemMaintenance() {
  try {
    Logger.info('SystemMaintenance', 'Iniciando manutenção automática');

    const results = {
      timestamp: new Date(),
      tasks: {}
    };

    // 1. Limpar sessões expiradas
    const sessionCleanup = cleanupExpiredSessions();
    results.tasks.sessionCleanup = sessionCleanup;

    // 2. Limpar dados de performance antigos
    PerformanceMonitor.cleanup();
    results.tasks.performanceCleanup = { ok: true, message: 'Performance data cleaned' };

    // 3. Limpar logs do sistema antigos (>7 dias)
    const logsCleanup = await cleanupOldSystemLogs();
    results.tasks.systemLogsCleanup = logsCleanup;

    // 4. Salvar relatório diário de saúde
    const dailyHealthSave = await PerformanceMonitor.saveDailyHealthReport();
    results.tasks.dailyHealthReport = dailyHealthSave;

    // 4. Gerar relatório de saúde do sistema
    const healthReport = PerformanceMonitor.getAdvancedReport();
    results.tasks.healthCheck = {
      ok: true,
      healthScore: healthReport.advanced.healthScore,
      recommendations: healthReport.advanced.recommendations.length
    };

    // 5. Log de estatísticas do sistema
    const sessionStats = getSessionStats();
    results.tasks.systemStats = {
      activeSessions: sessionStats.active_sessions,
      totalOperations: healthReport.summary.totalOperations,
      cacheHitRate: (healthReport.summary.cacheHitRate * 100).toFixed(1) + '%'
    };

    Logger.info('SystemMaintenance', 'Manutenção concluída', results.tasks);

    return {
      ok: true,
      message: 'Manutenção automática concluída',
      results
    };

  } catch (error) {
    Logger.error('SystemMaintenance', 'Erro na manutenção automática', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Aliases para compatibilidade com auth.gs
 */
function createSessionForUser(userId, deviceInfo) {
  return createSession(userId, deviceInfo);
}

function validateSessionForAuth(sessionId) {
  return validateSession(sessionId);
}