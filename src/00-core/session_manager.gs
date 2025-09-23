/**
 * SessionManager V4 - Sistema de Sessões Centralizado
 * Criado: 22/09/2025
 *
 * Sistema robusto de gerenciamento de sessões integrado com:
 * - DatabaseManager centralizado
 * - Validações FK automáticas
 * - Logs estruturados
 * - Cache management
 */

/**
 * Criar nova sessão usando DatabaseManager centralizado
 * @param {string} userId - ID do usuário (usuarios.uid)
 * @param {Object} deviceInfo - Informações do dispositivo
 * @returns {Object} Resultado da operação
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

    // Ler tabela de sessões usando sistema padrão
    const sessionsData = readTableByNome_('sessoes');
    if (!sessionsData || !sessionsData.values) {
      return { ok: false, error: 'Erro ao acessar tabela de sessões' };
    }

    // Encontrar sessão pelo ID
    const sessionRow = sessionsData.values.slice(1).find(row => {
      const sessionIdIndex = sessionsData.headerIndex.session_id;
      return row[sessionIdIndex] === sessionId;
    });

    if (!sessionRow) {
      Logger.debug('SessionManager', 'Sessão não encontrada', { sessionId });
      return { ok: false, error: 'Sessão não encontrada' };
    }

    // Verificar se está ativa
    const active = sessionRow[sessionsData.headerIndex.active];
    if (active !== 'sim') {
      Logger.debug('SessionManager', 'Sessão inativa', { sessionId });
      return { ok: false, error: 'Sessão inativa' };
    }

    // Verificar se não expirou
    const expiresAt = new Date(sessionRow[sessionsData.headerIndex.expires_at]);
    const now = new Date();

    if (now > expiresAt) {
      Logger.debug('SessionManager', 'Sessão expirada', { sessionId, expiresAt });
      return { ok: false, error: 'Sessão expirada' };
    }

    // Atualizar last_activity
    const updateResult = DatabaseManager.update('sessoes', sessionId, {
      last_activity: Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss')
    });

    const sessionData = {
      id: sessionRow[sessionsData.headerIndex.session_id],
      user_id: sessionRow[sessionsData.headerIndex.user_id],
      expires_at: sessionRow[sessionsData.headerIndex.expires_at],
      created_at: sessionRow[sessionsData.headerIndex.created_at],
      active: sessionRow[sessionsData.headerIndex.active] === 'sim'
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

    // Primeiro, encontrar a sessão usando session_id (não id)
    const sessionsQuery = DatabaseManager.query('sessoes', { session_id: sessionId });

    if (!sessionsQuery || sessionsQuery.length === 0) {
      Logger.warn('SessionManager', 'Sessão não encontrada', { sessionId });
      return { ok: false, error: 'Sessão não encontrada' };
    }

    const session = sessionsQuery[0];

    // Para sessões antigas sem campo id, usar session_id como fallback
    const recordId = session.id || session.session_id;

    // Atualizar usando o ID real da linha
    const updateResult = DatabaseManager.update('sessoes', recordId, {
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

    const sessionsData = readTableByNome_('sessoes');
    if (!sessionsData || !sessionsData.values) {
      return { error: 'Erro ao acessar tabela de sessões' };
    }

    const now = new Date();
    const stats = {
      total_sessions: sessionsData.values.length - 1, // -1 para header
      active_sessions: 0,
      expired_sessions: 0,
      inactive_sessions: 0
    };

    // Processar cada sessão
    sessionsData.values.slice(1).forEach(row => {
      const active = row[sessionsData.headerIndex.active];
      const expiresAt = new Date(row[sessionsData.headerIndex.expires_at]);

      if (active === 'sim') {
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

    const sessionsData = readTableByNome_('sessoes');
    if (!sessionsData || !sessionsData.values) {
      return { ok: false, error: 'Erro ao acessar tabela de sessões' };
    }

    const now = new Date();
    let cleanedCount = 0;

    // Processar cada sessão ativa
    sessionsData.values.slice(1).forEach(row => {
      const sessionId = row[sessionsData.headerIndex.session_id];
      const active = row[sessionsData.headerIndex.active];
      const expiresAt = new Date(row[sessionsData.headerIndex.expires_at]);

      // Se ativa mas expirada, desativar
      if (active === 'sim' && now > expiresAt) {
        const updateResult = DatabaseManager.update('sessoes', sessionId, {
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