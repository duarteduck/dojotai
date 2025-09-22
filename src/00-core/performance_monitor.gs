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
  this.trackOperation(operation, tableName, timeMs, { cacheHit });
};

// ================================================================================
// FUNÇÕES DE TESTE E DEMONSTRAÇÃO
// ================================================================================

/**
 * Função para testar o sistema de monitoramento (SEM integração com PerformanceMetrics)
 */
function testPerformanceMonitor() {
  console.log('🧪 TESTANDO PERFORMANCE MONITOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Reset para teste limpo
    PerformanceMonitor.reset();

    // Simular algumas operações
    console.log('\n📊 Simulando operações...');

    // Operações rápidas
    PerformanceMonitor._trackOperationDirect('QUERY', 'usuarios', 300);
    PerformanceMonitor._trackOperationDirect('INSERT', 'atividades', 800);

    // Operações normais
    PerformanceMonitor._trackOperationDirect('QUERY', 'membros', 1500);
    PerformanceMonitor._trackOperationDirect('UPDATE', 'participacoes', 2000);

    // Operações lentas
    PerformanceMonitor._trackOperationDirect('QUERY', 'atividades', 4000);
    PerformanceMonitor._trackOperationDirect('FULL_VALIDATION', 'membros', 6000);

    // Operações críticas
    PerformanceMonitor._trackOperationDirect('QUERY', 'participacoes', 12000);
    PerformanceMonitor._trackOperationDirect('INSERT', 'atividades', 18000);

    console.log('✅ Operações simuladas');

    // Gerar relatório
    console.log('\n📋 Gerando relatório...');
    const report = PerformanceMonitor.logAdvancedReport();

    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    return { success: true, report };

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Método direto de tracking para testes (sem integração)
 */
PerformanceMonitor._trackOperationDirect = function(operation, tableName, timeMs, context = {}) {
  this.init();

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
};

/**
 * Função para benchmark do sistema atual
 */
async function runSystemBenchmark() {
  console.log('⚡ EXECUTANDO BENCHMARK DO SISTEMA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Reset métricas
    PerformanceMonitor.reset();

    // Benchmark de queries
    console.log('\n🔍 Benchmark: Queries...');
    const startQuery = new Date();
    const users = DatabaseManager.query('usuarios', {});
    const atividades = DatabaseManager.query('atividades', {});
    const membros = DatabaseManager.query('membros', {});
    const queryTime = new Date() - startQuery;

    // Benchmark de inserção (simulada)
    console.log('\n➕ Benchmark: Validações...');
    const startValidation = new Date();
    // Simular validações complexas
    await ValidationEngine.validateRecord('atividades', {
      id: 'TEST-001',
      titulo: 'Benchmark Test',
      data: '2025-09-22',
      categoria_atividade_id: 'CAT-001'
    });
    const validationTime = new Date() - startValidation;

    // Gerar relatório do benchmark
    console.log('\n📊 Resultados do Benchmark:');
    console.log(`   Queries (3 tabelas): ${queryTime}ms`);
    console.log(`   Validação completa: ${validationTime}ms`);

    const report = PerformanceMonitor.getAdvancedReport();

    console.log('\n🏆 BENCHMARK CONCLUÍDO!');
    return {
      success: true,
      benchmark: { queryTime, validationTime },
      report
    };

  } catch (error) {
    console.error('❌ Erro no benchmark:', error.message);
    return { success: false, error: error.message };
  }
}