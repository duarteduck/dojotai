/**
 * Performance Monitor - Sistema Avançado de Monitoramento
 * Criado: 22/09/2025
 *
 * Expansão do PerformanceMetrics existente com:
 * - Monitoramento de operações lentas
 * - Alertas automáticos
 * - Relatórios detalhados
 * - Sistema de benchmarks
 */

/**
 * PerformanceMonitor - Sistema avançado de monitoramento
 */
class PerformanceMonitor {

  /**
   * Inicializar sistema de monitoramento
   */
  static init() {
    if (!this._initialized) {
      this._slowOperations = [];
      this._alerts = [];
      this._benchmarks = this._getDefaultBenchmarks();
      this._initialized = true;

      Logger.info('PerformanceMonitor', 'Sistema inicializado', {
        benchmarks: Object.keys(this._benchmarks).length
      });
    }
  }

  /**
   * Benchmarks padrão para diferentes operações (em ms)
   */
  static _getDefaultBenchmarks() {
    return {
      'QUERY': {
        fast: 500,      // < 500ms = Rápido
        normal: 2000,   // < 2s = Normal
        slow: 5000,     // < 5s = Lento
        critical: 10000 // > 10s = Crítico
      },
      'INSERT': {
        fast: 1000,
        normal: 3000,
        slow: 7000,
        critical: 15000
      },
      'UPDATE': {
        fast: 800,
        normal: 2500,
        slow: 6000,
        critical: 12000
      },
      'DELETE': {
        fast: 500,
        normal: 1500,
        slow: 4000,
        critical: 8000
      },
      'FK_VALIDATION': {
        fast: 200,
        normal: 800,
        slow: 2000,
        critical: 5000
      },
      'FULL_VALIDATION': {
        fast: 500,
        normal: 1500,
        slow: 3000,
        critical: 8000
      }
    };
  }

  /**
   * Monitorar operação e classificar performance
   * @param {string} operation - Tipo de operação
   * @param {string} tableName - Nome da tabela
   * @param {number} timeMs - Tempo em millisegundos
   * @param {Object} context - Contexto adicional
   */
  static trackOperation(operation, tableName, timeMs, context = {}) {
    this.init();

    // Usar PerformanceMetrics existente
    PerformanceMetrics.trackOperation(operation, tableName, timeMs, context.cacheHit || false);

    // Classificar performance
    const classification = this._classifyOperation(operation, timeMs);

    // Se for operação lenta, registrar
    if (classification.level >= 2) { // Lento ou Crítico
      this._recordSlowOperation({
        operation,
        tableName,
        timeMs,
        classification,
        context,
        timestamp: new Date()
      });
    }

    // Gerar alerta se crítico
    if (classification.level >= 3) { // Crítico
      this._generateAlert({
        type: 'CRITICAL_PERFORMANCE',
        operation,
        tableName,
        timeMs,
        classification,
        timestamp: new Date()
      });
    }

    Logger.debug('PerformanceMonitor', `${operation} classificada como ${classification.label}`, {
      operation, tableName, timeMs, level: classification.label
    });
  }

  /**
   * Classificar operação baseada em benchmarks
   * @param {string} operation - Tipo de operação
   * @param {number} timeMs - Tempo em millisegundos
   * @returns {Object} Classificação
   */
  static _classifyOperation(operation, timeMs) {
    this.init(); // Garantir que benchmarks estão inicializados
    const benchmarks = this._benchmarks[operation] || this._benchmarks['QUERY'];

    if (timeMs <= benchmarks.fast) {
      return { level: 0, label: 'FAST', color: '🟢' };
    } else if (timeMs <= benchmarks.normal) {
      return { level: 1, label: 'NORMAL', color: '🟡' };
    } else if (timeMs <= benchmarks.slow) {
      return { level: 2, label: 'SLOW', color: '🟠' };
    } else {
      return { level: 3, label: 'CRITICAL', color: '🔴' };
    }
  }

  /**
   * Registrar operação lenta
   * @param {Object} slowOp - Dados da operação lenta
   */
  static _recordSlowOperation(slowOp) {
    this._slowOperations.push(slowOp);

    // Manter apenas últimas 100 operações lentas
    if (this._slowOperations.length > 100) {
      this._slowOperations = this._slowOperations.slice(-100);
    }

    Logger.warn('PerformanceMonitor', `Operação lenta detectada: ${slowOp.operation}`, {
      tableName: slowOp.tableName,
      timeMs: slowOp.timeMs,
      classification: slowOp.classification.label
    });
  }

  /**
   * Gerar alerta crítico
   * @param {Object} alert - Dados do alerta
   */
  static _generateAlert(alert) {
    this._alerts.push(alert);

    // Manter apenas últimos 50 alertas
    if (this._alerts.length > 50) {
      this._alerts = this._alerts.slice(-50);
    }

    Logger.error('PerformanceMonitor', `ALERTA CRÍTICO: ${alert.operation} muito lenta`, {
      tableName: alert.tableName,
      timeMs: alert.timeMs,
      benchmark: this._benchmarks[alert.operation]?.critical || 'N/A'
    });
  }

  /**
   * Obter relatório completo de performance
   * @returns {Object} Relatório detalhado
   */
  static getAdvancedReport() {
    this.init();

    // Relatório base do PerformanceMetrics
    const baseReport = PerformanceMetrics.getReport();

    // Análise de operações lentas
    const slowOpsAnalysis = this._analyzeSlowOperations();

    // Análise de alertas
    const alertsAnalysis = this._analyzeAlerts();

    // Recomendações automáticas
    const recommendations = this._generateRecommendations(baseReport, slowOpsAnalysis);

    const report = {
      ...baseReport,
      advanced: {
        slowOperations: {
          count: this._slowOperations.length,
          analysis: slowOpsAnalysis
        },
        alerts: {
          count: this._alerts.length,
          analysis: alertsAnalysis
        },
        recommendations,
        benchmarks: this._benchmarks,
        healthScore: this._calculateHealthScore(baseReport, slowOpsAnalysis, alertsAnalysis)
      }
    };

    Logger.info('PerformanceMonitor', 'Relatório avançado gerado', {
      slowOpsCount: this._slowOperations.length,
      alertsCount: this._alerts.length,
      healthScore: report.advanced.healthScore
    });

    return report;
  }

  /**
   * Analisar operações lentas
   * @returns {Object} Análise das operações lentas
   */
  static _analyzeSlowOperations() {
    if (this._slowOperations.length === 0) {
      return { message: 'Nenhuma operação lenta detectada' };
    }

    // Agrupar por operação
    const byOperation = {};
    const byTable = {};
    let totalSlowTime = 0;

    this._slowOperations.forEach(op => {
      // Por operação
      if (!byOperation[op.operation]) {
        byOperation[op.operation] = { count: 0, totalTime: 0, avgTime: 0 };
      }
      byOperation[op.operation].count++;
      byOperation[op.operation].totalTime += op.timeMs;

      // Por tabela
      if (!byTable[op.tableName]) {
        byTable[op.tableName] = { count: 0, totalTime: 0, avgTime: 0 };
      }
      byTable[op.tableName].count++;
      byTable[op.tableName].totalTime += op.timeMs;

      totalSlowTime += op.timeMs;
    });

    // Calcular médias
    Object.values(byOperation).forEach(op => {
      op.avgTime = Math.round(op.totalTime / op.count);
    });
    Object.values(byTable).forEach(table => {
      table.avgTime = Math.round(table.totalTime / table.count);
    });

    return {
      total: this._slowOperations.length,
      totalTime: totalSlowTime,
      avgTime: Math.round(totalSlowTime / this._slowOperations.length),
      byOperation,
      byTable,
      worstOperation: this._findWorstPerformer(byOperation),
      worstTable: this._findWorstPerformer(byTable)
    };
  }

  /**
   * Analisar alertas críticos
   * @returns {Object} Análise dos alertas
   */
  static _analyzeAlerts() {
    if (this._alerts.length === 0) {
      return { message: 'Nenhum alerta crítico' };
    }

    const last24h = this._alerts.filter(alert =>
      new Date() - alert.timestamp < 24 * 60 * 60 * 1000
    );

    return {
      total: this._alerts.length,
      last24h: last24h.length,
      mostRecentAlert: this._alerts[this._alerts.length - 1],
      criticalOperations: [...new Set(this._alerts.map(a => a.operation))]
    };
  }

  /**
   * Encontrar pior performer
   * @param {Object} performers - Objeto com performers
   * @returns {Object} Pior performer
   */
  static _findWorstPerformer(performers) {
    let worst = null;
    let worstScore = 0;

    Object.entries(performers).forEach(([key, data]) => {
      // Score = count * avgTime (quanto mais operações lentas e mais demoradas, pior)
      const score = data.count * data.avgTime;
      if (score > worstScore) {
        worstScore = score;
        worst = { key, ...data, score };
      }
    });

    return worst;
  }

  /**
   * Gerar recomendações automáticas
   * @param {Object} baseReport - Relatório base
   * @param {Object} slowOpsAnalysis - Análise de operações lentas
   * @returns {Array} Lista de recomendações
   */
  static _generateRecommendations(baseReport, slowOpsAnalysis) {
    const recommendations = [];

    // Cache Hit Rate baixo
    if (baseReport.summary.cacheHitRate < 0.5) {
      recommendations.push({
        type: 'CACHE',
        priority: 'HIGH',
        message: `Cache hit rate baixo (${(baseReport.summary.cacheHitRate * 100).toFixed(1)}%). Considere aumentar TTL do cache.`
      });
    }

    // Muitas operações lentas
    if (slowOpsAnalysis.total > 10) {
      recommendations.push({
        type: 'PERFORMANCE',
        priority: 'MEDIUM',
        message: `${slowOpsAnalysis.total} operações lentas detectadas. Considere otimização de queries.`
      });
    }

    // Operação específica muito lenta
    if (slowOpsAnalysis.worstOperation && slowOpsAnalysis.worstOperation.avgTime > 5000) {
      recommendations.push({
        type: 'OPTIMIZATION',
        priority: 'HIGH',
        message: `Operação ${slowOpsAnalysis.worstOperation.key} está muito lenta (${slowOpsAnalysis.worstOperation.avgTime}ms). Necessita otimização urgente.`
      });
    }

    // Tabela específica problemática
    if (slowOpsAnalysis.worstTable && slowOpsAnalysis.worstTable.count > 5) {
      recommendations.push({
        type: 'DATABASE',
        priority: 'MEDIUM',
        message: `Tabela ${slowOpsAnalysis.worstTable.key} tem muitas operações lentas. Verifique índices e estrutura de dados.`
      });
    }

    return recommendations;
  }

  /**
   * Calcular score de saúde do sistema (0-100)
   * @param {Object} baseReport - Relatório base
   * @param {Object} slowOpsAnalysis - Análise de operações lentas
   * @param {Object} alertsAnalysis - Análise de alertas
   * @returns {number} Score de saúde
   */
  static _calculateHealthScore(baseReport, slowOpsAnalysis, alertsAnalysis) {
    let score = 100;

    // Penalizar por cache hit rate baixo
    const cacheHitRate = baseReport.summary.cacheHitRate;
    if (cacheHitRate < 0.8) {
      score -= (0.8 - cacheHitRate) * 50; // Max -40 pontos
    }

    // Penalizar por operações lentas
    const slowOpsRatio = slowOpsAnalysis.total / Math.max(baseReport.summary.totalOperations, 1);
    if (slowOpsRatio > 0.1) {
      score -= (slowOpsRatio - 0.1) * 200; // Max -20 pontos por 10% acima
    }

    // Penalizar por alertas críticos
    if (alertsAnalysis.last24h > 0) {
      score -= alertsAnalysis.last24h * 5; // -5 pontos por alerta nas últimas 24h
    }

    // Garantir que score não seja negativo
    return Math.max(Math.round(score), 0);
  }

  /**
   * Limpar dados antigos
   */
  static cleanup() {
    this.init();

    const oneWeekAgo = new Date() - (7 * 24 * 60 * 60 * 1000);

    // Limpar operações lentas antigas
    this._slowOperations = this._slowOperations.filter(op =>
      op.timestamp > oneWeekAgo
    );

    // Limpar alertas antigos
    this._alerts = this._alerts.filter(alert =>
      alert.timestamp > oneWeekAgo
    );

    Logger.info('PerformanceMonitor', 'Limpeza concluída', {
      slowOpsRemaining: this._slowOperations.length,
      alertsRemaining: this._alerts.length
    });
  }

  /**
   * Obter relatório simples para testes e debugging
   * @returns {Object} Relatório simplificado
   */
  static getSimpleReport() {
    this.init();

    // Obter relatório base do PerformanceMetrics
    const baseReport = (typeof PerformanceMetrics !== 'undefined' && PerformanceMetrics.getReport)
      ? PerformanceMetrics.getReport()
      : {
          summary: { totalOperations: 0, totalTimeMs: 0, cacheHitRate: 0, avgTimeMs: 0 },
          operations: {}
        };

    // Resumo simplificado
    const simple = {
      totalOperations: baseReport.summary.totalOperations,
      totalTimeMs: baseReport.summary.totalTimeMs,
      avgTimeMs: baseReport.summary.avgTimeMs,
      cacheHitRate: baseReport.summary.cacheHitRate,
      slowOperations: this._slowOperations.length,
      alerts: this._alerts.length,
      healthScore: this._calculateHealthScore(baseReport,
        this._analyzeSlowOperations(),
        this._analyzeAlerts())
    };

    Logger.debug('PerformanceMonitor', 'Relatório simples gerado', simple);
    return simple;
  }

  /**
   * Exibir relatório formatado no console
   */
  static logAdvancedReport() {
    const report = this.getAdvancedReport();

    console.log('📊 RELATÓRIO AVANÇADO DE PERFORMANCE');
    console.log('='.repeat(50));

    // Resumo base
    console.log('\n📈 RESUMO GERAL:');
    console.log(`   Total de operações: ${report.summary.totalOperations}`);
    console.log(`   Tempo total: ${report.summary.totalTimeMs}ms`);
    console.log(`   Cache hit rate: ${(report.summary.cacheHitRate * 100).toFixed(1)}%`);

    // Score de saúde
    const healthEmoji = report.advanced.healthScore >= 80 ? '💚' :
                       report.advanced.healthScore >= 60 ? '💛' : '❤️';
    console.log(`\n${healthEmoji} SCORE DE SAÚDE: ${report.advanced.healthScore}/100`);

    // Operações lentas
    if (report.advanced.slowOperations.count > 0) {
      console.log(`\n🐌 OPERAÇÕES LENTAS: ${report.advanced.slowOperations.count}`);
      const analysis = report.advanced.slowOperations.analysis;
      if (analysis.worstOperation) {
        console.log(`   Pior operação: ${analysis.worstOperation.key} (${analysis.worstOperation.avgTime}ms médio)`);
      }
      if (analysis.worstTable) {
        console.log(`   Pior tabela: ${analysis.worstTable.key} (${analysis.worstTable.count} ops lentas)`);
      }
    }

    // Alertas críticos
    if (report.advanced.alerts.count > 0) {
      console.log(`\n🚨 ALERTAS CRÍTICOS: ${report.advanced.alerts.count}`);
      console.log(`   Últimas 24h: ${report.advanced.alerts.analysis.last24h}`);
    }

    // Recomendações
    if (report.advanced.recommendations.length > 0) {
      console.log('\n💡 RECOMENDAÇÕES:');
      report.advanced.recommendations.forEach((rec, index) => {
        const priority = rec.priority === 'HIGH' ? '🔴' : rec.priority === 'MEDIUM' ? '🟡' : '🟢';
        console.log(`   ${index + 1}. ${priority} ${rec.message}`);
      });
    }

    return report;
  }

  /**
   * Resetar todos os dados
   */
  static reset() {
    this._slowOperations = [];
    this._alerts = [];
    PerformanceMetrics.reset();

    Logger.info('PerformanceMonitor', 'Sistema resetado completamente');
  }

  /**
   * Limpar cache (alias para reset)
   */
  static clearCache() {
    this.reset();
  }

  /**
   * Salvar log de performance na tabela persistente
   * @param {string} operation - Tipo da operação
   * @param {string} tableName - Nome da tabela
   * @param {number} timeMs - Duração em ms
   * @param {Object} context - Contexto adicional
   */
  static async savePerformanceLog(operation, tableName, timeMs, context = {}) {
    try {
      const classification = this._classifyOperation(operation, timeMs);
      const now = new Date();

      const logData = {
        operation_type: operation,
        table_name: tableName,
        duration_ms: timeMs,
        classification: classification.label,
        context: JSON.stringify(context),
        timestamp: Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss'),
        created_at: Utilities.formatDate(now, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss')
      };

      const result = await DatabaseManager.insert('performance_logs', logData);

      if (!result.success) {
        Logger.warn('PerformanceMonitor', 'Falha ao salvar log de performance', {
          operation, tableName, timeMs, error: result.error
        });
      }

      return result;

    } catch (error) {
      Logger.error('PerformanceMonitor', 'Erro ao salvar performance log', {
        error: error.message, operation, tableName, timeMs
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Salvar relatório diário de saúde do sistema
   * @param {Object} healthData - Dados do relatório de saúde
   */
  static async saveDailyHealthReport(healthData = null) {
    try {
      // Se não fornecido, gerar relatório atual
      if (!healthData) {
        const report = this.getAdvancedReport();
        healthData = {
          health_score: report.advanced.healthScore,
          total_operations: report.summary.totalOperations || 0,
          cache_hit_rate: report.summary.cacheHitRate || 0,
          slow_operations: this._slowOperations.length,
          critical_alerts: this._alerts.length,
          recommendations: JSON.stringify(report.advanced.recommendations || [])
        };
      }

      const today = new Date();
      const dateStr = Utilities.formatDate(today, 'America/Sao_Paulo', 'yyyy-MM-dd');

      const reportData = {
        date: dateStr,
        health_score: healthData.health_score,
        total_operations: healthData.total_operations,
        cache_hit_rate: healthData.cache_hit_rate,
        slow_operations: healthData.slow_operations,
        critical_alerts: healthData.critical_alerts,
        recommendations: healthData.recommendations,
        created_at: Utilities.formatDate(today, 'America/Sao_Paulo', 'yyyy-MM-dd HH:mm:ss')
      };

      // Verificar se já existe relatório para hoje
      const existingReport = DatabaseManager.query('system_health', { date: dateStr });

      let result;
      if (existingReport && existingReport.length > 0) {
        // Atualizar relatório existente
        const reportId = existingReport[0].id;
        result = await DatabaseManager.update('system_health', reportId, reportData);
        Logger.info('PerformanceMonitor', 'Relatório diário atualizado', { date: dateStr });
      } else {
        // Criar novo relatório
        result = await DatabaseManager.insert('system_health', reportData);
        Logger.info('PerformanceMonitor', 'Novo relatório diário criado', { date: dateStr });
      }

      return result;

    } catch (error) {
      Logger.error('PerformanceMonitor', 'Erro ao salvar relatório de saúde', {
        error: error.message
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Obter histórico de performance logs
   * @param {Object} filters - Filtros para consulta
   * @param {number} days - Número de dias para buscar (padrão: 7)
   */
  static getPerformanceHistory(filters = {}, days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const startDateStr = Utilities.formatDate(startDate, 'America/Sao_Paulo', 'yyyy-MM-dd');
      const endDateStr = Utilities.formatDate(endDate, 'America/Sao_Paulo', 'yyyy-MM-dd');

      // Buscar logs no período
      const logs = DatabaseManager.query('performance_logs', {
        ...filters,
        timestamp_gte: startDateStr,
        timestamp_lte: endDateStr
      });

      Logger.info('PerformanceMonitor', 'Histórico de performance obtido', {
        logsFound: logs.length,
        days,
        startDate: startDateStr,
        endDate: endDateStr
      });

      return logs;

    } catch (error) {
      Logger.error('PerformanceMonitor', 'Erro ao obter histórico de performance', {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Obter relatórios de saúde históricos
   * @param {number} days - Número de dias para buscar (padrão: 30)
   */
  static getHealthHistory(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

      const startDateStr = Utilities.formatDate(startDate, 'America/Sao_Paulo', 'yyyy-MM-dd');
      const endDateStr = Utilities.formatDate(endDate, 'America/Sao_Paulo', 'yyyy-MM-dd');

      const reports = DatabaseManager.query('system_health', {
        date_gte: startDateStr,
        date_lte: endDateStr
      });

      Logger.info('PerformanceMonitor', 'Histórico de saúde obtido', {
        reportsFound: reports.length,
        days
      });

      return reports;

    } catch (error) {
      Logger.error('PerformanceMonitor', 'Erro ao obter histórico de saúde', {
        error: error.message
      });
      return [];
    }
  }
}

// ================================================================================
// INTEGRAÇÃO COM SISTEMA EXISTENTE
// ================================================================================

/**
 * Método para integração sem hook circular
 * Chamado diretamente do DatabaseManager
 */
PerformanceMonitor.integrateWithExisting = function(operation, tableName, timeMs, cacheHit) {
  // Chamar PerformanceMetrics original
  if (typeof PerformanceMetrics !== 'undefined' && PerformanceMetrics.trackOperation) {
    // Usar uma flag para evitar recursão
    if (!this._integrationActive) {
      this._integrationActive = true;
      try {
        PerformanceMetrics.trackOperation(operation, tableName, timeMs, cacheHit);
      } catch (error) {
        Logger.warn('PerformanceMonitor', 'Erro na integração com PerformanceMetrics', { error: error.message });
      }
      this._integrationActive = false;
    }
  }

  // Chamar sistema avançado
  const context = { cacheHit };
  this.trackOperation(operation, tableName, timeMs, context);

  // Salvar persistentemente (async, não bloqueia operação principal)
  this._savePersistentLog(operation, tableName, timeMs, context);
};

/**
 * Salvar log persistente de forma async (não bloqueia operação principal)
 */
PerformanceMonitor._savePersistentLog = function(operation, tableName, timeMs, context) {
  try {
    // Evitar recursão infinita - não salvar logs das próprias operações de performance
    if (tableName === 'performance_logs' || tableName === 'system_health') {
      return; // Não logar operações das próprias tabelas de log
    }

    // Só salvar se for operação significativa (evitar spam de logs)
    if (timeMs > 100 || operation.includes('VALIDATION')) {
      // Executar de forma síncrona, mas com tratamento de erro
      const self = this;
      try {
        // Remover await para evitar problemas async em contexto não-async
        const result = self.savePerformanceLog(operation, tableName, timeMs, context);
        // Se retornar promise, capturar erro silenciosamente
        if (result && typeof result.catch === 'function') {
          result.catch(error => {
            Logger.warn('PerformanceMonitor', 'Falha silenciosa ao salvar log persistente', {
              operation, tableName, timeMs, error: error.message
            });
          });
        }
      } catch (syncError) {
        Logger.warn('PerformanceMonitor', 'Erro síncrono ao salvar log persistente', {
          operation, tableName, timeMs, error: syncError.message
        });
      }
    }
  } catch (error) {
    // Falhas na persistência não devem quebrar operação principal
    Logger.warn('PerformanceMonitor', 'Erro na preparação do log persistente', {
      operation, tableName, timeMs, error: error.message
    });
  }
};

// ================================================================================
// FUNÇÕES UTILITÁRIAS PARA MANUTENÇÃO
// ================================================================================

/**
 * Obter resumo rápido para debugging
 * @returns {string} Resumo do status atual
 */
PerformanceMonitor.getQuickStatus = function() {
  this.init();
  const report = this.getSimpleReport();
  return `Performance: ${report.totalOperations} ops | Health: ${report.healthScore}/100 | Slow: ${report.slowOperations} | Alerts: ${report.alerts}`;
};

// ================================================================================
// FIM DO PERFORMANCE MONITOR
// ================================================================================