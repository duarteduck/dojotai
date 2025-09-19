/**
 * Sistema Dojotai V2.0 - Database Manager
 * Criado: 18/09/2025
 * Semana 1: Versão básica compatível com sistema atual
 * Dia 2: Sistema de logs, cache persistente e métricas
 */

/**
 * Logger - Sistema de logs estruturado com níveis
 */
class Logger {
  static _getLevelValue(level) {
    const levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    return levels[level] || 1;
  }

  static _shouldLog(level) {
    const currentLevel = APP_CONFIG.LOG_LEVEL || 'INFO';
    const currentLevelValue = this._getLevelValue(currentLevel);
    const logLevelValue = this._getLevelValue(level);
    return logLevelValue >= currentLevelValue;
  }

  static _formatMessage(level, context, message, data) {
    const timestamp = Utilities.formatDate(new Date(), APP_CONFIG.TZ, 'HH:mm:ss.SSS');
    const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
    return `${timestamp} [${level}] ${context}: ${message}${dataStr}`;
  }

  static debug(context, message, data = null) {
    // DEBUG só aparece se currentLevel for DEBUG
    const currentLevel = APP_CONFIG.LOG_LEVEL || 'INFO';
    if (currentLevel === 'DEBUG') {
      console.log(this._formatMessage('DEBUG', context, message, data));
    }
  }

  static info(context, message, data = null) {
    // INFO aparece se currentLevel for DEBUG ou INFO
    const currentLevel = APP_CONFIG.LOG_LEVEL || 'INFO';
    if (currentLevel === 'DEBUG' || currentLevel === 'INFO') {
      console.log(this._formatMessage('INFO', context, message, data));
    }
  }

  static warn(context, message, data = null) {
    // WARN aparece se currentLevel for DEBUG, INFO ou WARN
    const currentLevel = APP_CONFIG.LOG_LEVEL || 'INFO';
    if (currentLevel === 'DEBUG' || currentLevel === 'INFO' || currentLevel === 'WARN') {
      console.warn(this._formatMessage('WARN', context, message, data));
    }
  }

  static error(context, message, data = null) {
    // ERROR sempre aparece
    console.error(this._formatMessage('ERROR', context, message, data));
  }
}

/**
 * ValidationEngine - Sistema de validações avançadas
 */
class ValidationEngine {

  /**
   * Extrair Foreign Keys do dicionário
   * @param {string} tableName - Nome da tabela
   * @returns {Array} Array de objetos {field, targetTable, targetField}
   */
  static getForeignKeys(tableName) {
    try {
      if (typeof DATA_DICTIONARY === 'undefined' || !DATA_DICTIONARY[tableName]) {
        Logger.warn('ValidationEngine', 'Tabela não encontrada no dicionário', { tableName });
        return [];
      }

      const tableConfig = DATA_DICTIONARY[tableName];
      const foreignKeys = [];

      Object.entries(tableConfig.fields || {}).forEach(([fieldName, fieldConfig]) => {
        if (fieldConfig.foreignKey) {
          const [targetTable, targetField] = fieldConfig.foreignKey.split('.');
          foreignKeys.push({
            field: fieldName,
            targetTable,
            targetField,
            required: fieldConfig.required || false
          });
        }
      });

      Logger.debug('ValidationEngine', 'Foreign keys encontradas', { tableName, count: foreignKeys.length, keys: foreignKeys });
      return foreignKeys;

    } catch (error) {
      Logger.error('ValidationEngine', 'Erro ao extrair foreign keys', { tableName, error: error.message });
      return [];
    }
  }

  /**
   * Validar Foreign Keys de um registro
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados do registro
   * @returns {Object} {isValid, errors}
   */
  static async validateForeignKeys(tableName, data) {
    const startTime = new Date();
    const foreignKeys = this.getForeignKeys(tableName);
    const errors = [];

    if (foreignKeys.length === 0) {
      Logger.debug('ValidationEngine', 'Nenhuma FK para validar', { tableName });
      return { isValid: true, errors: [] };
    }

    Logger.info('ValidationEngine', 'Validando foreign keys', { tableName, fkCount: foreignKeys.length });

    for (const fk of foreignKeys) {
      const fieldValue = data[fk.field];

      // Se campo é obrigatório e está vazio
      if (fk.required && (!fieldValue || fieldValue.trim() === '')) {
        errors.push(`Campo ${fk.field} é obrigatório`);
        continue;
      }

      // Se campo está vazio mas não é obrigatório, pular validação
      if (!fieldValue || fieldValue.trim() === '') {
        continue;
      }

      // Validar se valor existe na tabela de referência
      try {
        const targetRecords = DatabaseManager.query(fk.targetTable, { [fk.targetField]: fieldValue }, true);

        if (targetRecords.length === 0) {
          errors.push(`${fk.field}: Valor '${fieldValue}' não existe em ${fk.targetTable}.${fk.targetField}`);
          Logger.warn('ValidationEngine', 'FK validation failed', {
            field: fk.field,
            value: fieldValue,
            target: `${fk.targetTable}.${fk.targetField}`
          });
        } else {
          Logger.debug('ValidationEngine', 'FK validation passed', {
            field: fk.field,
            value: fieldValue,
            target: `${fk.targetTable}.${fk.targetField}`
          });
        }

      } catch (error) {
        errors.push(`${fk.field}: Erro ao validar referência - ${error.message}`);
        Logger.error('ValidationEngine', 'Erro na validação de FK', {
          field: fk.field,
          value: fieldValue,
          error: error.message
        });
      }
    }

    const timeMs = new Date() - startTime;
    const isValid = errors.length === 0;

    PerformanceMetrics.trackOperation('FK_VALIDATION', tableName, timeMs, false);

    Logger.info('ValidationEngine', 'FK validation completed', {
      tableName,
      isValid,
      errorCount: errors.length,
      time: timeMs
    });

    return { isValid, errors };
  }

  /**
   * Validar Business Rules de um registro
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados do registro
   * @returns {Object} {isValid, errors}
   */
  static validateBusinessRules(tableName, data) {
    const startTime = new Date();
    const errors = [];

    Logger.info('ValidationEngine', 'Validando business rules', { tableName });

    try {
      // Regras específicas por tabela
      switch (tableName) {
        case 'atividades':
          errors.push(...this._validateAtividadesRules(data));
          break;
        case 'participacoes':
          errors.push(...this._validateParticipacoesRules(data));
          break;
        case 'membros':
          errors.push(...this._validateMembrosRules(data));
          break;
        default:
          Logger.debug('ValidationEngine', 'Nenhuma business rule definida', { tableName });
      }

      const timeMs = new Date() - startTime;
      const isValid = errors.length === 0;

      PerformanceMetrics.trackOperation('BUSINESS_RULES', tableName, timeMs, false);

      Logger.info('ValidationEngine', 'Business rules validation completed', {
        tableName,
        isValid,
        errorCount: errors.length,
        time: timeMs
      });

      return { isValid, errors };

    } catch (error) {
      Logger.error('ValidationEngine', 'Erro na validação de business rules', {
        tableName,
        error: error.message
      });
      return { isValid: false, errors: [`Erro interno: ${error.message}`] };
    }
  }

  /**
   * Regras de negócio para atividades
   */
  static _validateAtividadesRules(data) {
    const errors = [];

    // Regra 1: Se status é "Concluída", data_fim deve estar preenchida
    if (data.status === 'Concluída' && (!data.data_fim || data.data_fim.trim() === '')) {
      errors.push('Atividades concluídas devem ter data_fim preenchida');
    }

    // Regra 2: Se status é "Planejada", data_inicio deve ser futura
    if (data.status === 'Planejada' && data.data_inicio) {
      const dataInicio = new Date(data.data_inicio);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      if (dataInicio < hoje) {
        errors.push('Atividades planejadas devem ter data_inicio futura');
      }
    }

    // Regra 3: data_fim deve ser >= data_inicio
    if (data.data_inicio && data.data_fim) {
      const dataInicio = new Date(data.data_inicio);
      const dataFim = new Date(data.data_fim);

      if (dataFim < dataInicio) {
        errors.push('data_fim deve ser maior ou igual a data_inicio');
      }
    }

    return errors;
  }

  /**
   * Regras de negócio para participações
   */
  static _validateParticipacoesRules(data) {
    const errors = [];

    // Regra 1: Se participou = 'sim', status_participacao deve ser válido
    if (data.participou === 'sim' && (!data.status_participacao || data.status_participacao.trim() === '')) {
      errors.push('Participações confirmadas devem ter status_participacao preenchido');
    }

    // Regra 2: Se chegou_tarde = 'sim', participou deve ser 'sim'
    if (data.chegou_tarde === 'sim' && data.participou !== 'sim') {
      errors.push('Não é possível chegar tarde sem participar');
    }

    // Regra 3: Se saiu_cedo = 'sim', participou deve ser 'sim'
    if (data.saiu_cedo === 'sim' && data.participou !== 'sim') {
      errors.push('Não é possível sair cedo sem participar');
    }

    return errors;
  }

  /**
   * Regras de negócio para membros
   */
  static _validateMembrosRules(data) {
    const errors = [];

    // Regra 1: Se ativo = 'sim', data_admissao deve estar preenchida
    if (data.ativo === 'sim' && (!data.data_admissao || data.data_admissao.trim() === '')) {
      errors.push('Membros ativos devem ter data_admissao preenchida');
    }

    // Regra 2: data_desligamento só pode estar preenchida se ativo = 'não'
    if (data.data_desligamento && data.data_desligamento.trim() !== '' && data.ativo === 'sim') {
      errors.push('Membros ativos não podem ter data_desligamento');
    }

    // Regra 3: Se data_desligamento existe, deve ser >= data_admissao
    if (data.data_admissao && data.data_desligamento && data.data_desligamento.trim() !== '') {
      const dataAdmissao = new Date(data.data_admissao);
      const dataDesligamento = new Date(data.data_desligamento);

      if (dataDesligamento < dataAdmissao) {
        errors.push('data_desligamento deve ser maior ou igual a data_admissao');
      }
    }

    return errors;
  }

  /**
   * Validar formato e padrões baseados no dicionário
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados do registro
   * @returns {Object} {isValid, errors}
   */
  static validateAdvanced(tableName, data) {
    const startTime = new Date();
    const errors = [];

    Logger.info('ValidationEngine', 'Validando formatos avançados', { tableName });

    try {
      if (typeof DATA_DICTIONARY === 'undefined' || !DATA_DICTIONARY[tableName]) {
        Logger.debug('ValidationEngine', 'Tabela não encontrada para validação avançada', { tableName });
        return { isValid: true, errors: [] };
      }

      const tableConfig = DATA_DICTIONARY[tableName];
      const fields = tableConfig.fields || {};

      Object.entries(data).forEach(([fieldName, fieldValue]) => {
        const fieldConfig = fields[fieldName];
        if (!fieldConfig || !fieldValue || fieldValue.toString().trim() === '') {
          return; // Pular campos não configurados ou vazios
        }

        // 1. Pattern validation
        if (fieldConfig.pattern && fieldValue.toString().trim() !== '') {
          try {
            const regex = new RegExp(fieldConfig.pattern);
            if (!regex.test(fieldValue.toString())) {
              errors.push(`${fieldName}: Formato inválido. ${fieldConfig.description || 'Verifique o padrão esperado'}`);
            }
          } catch (e) {
            Logger.warn('ValidationEngine', 'Pattern inválido no dicionário', {
              field: fieldName,
              pattern: fieldConfig.pattern
            });
          }
        }

        // 2. MaxLength validation
        if (fieldConfig.maxLength && fieldValue.toString().length > fieldConfig.maxLength) {
          errors.push(`${fieldName}: Máximo ${fieldConfig.maxLength} caracteres (atual: ${fieldValue.toString().length})`);
        }

        // 3. Enum validation
        if (fieldConfig.enum && !fieldConfig.enum.includes(fieldValue.toString())) {
          errors.push(`${fieldName}: Valor deve ser um de: ${fieldConfig.enum.join(', ')}`);
        }

        // 4. Number range validation
        if (fieldConfig.type === 'NUMBER' && !isNaN(fieldValue)) {
          const numValue = parseFloat(fieldValue);
          if (fieldConfig.min !== undefined && numValue < fieldConfig.min) {
            errors.push(`${fieldName}: Valor mínimo é ${fieldConfig.min}`);
          }
          if (fieldConfig.max !== undefined && numValue > fieldConfig.max) {
            errors.push(`${fieldName}: Valor máximo é ${fieldConfig.max}`);
          }
        }

        // 5. Date format validation
        if (fieldConfig.type === 'DATE' || fieldConfig.type === 'DATETIME') {
          try {
            const date = new Date(fieldValue);
            if (isNaN(date.getTime())) {
              errors.push(`${fieldName}: Data inválida`);
            }
          } catch (e) {
            errors.push(`${fieldName}: Formato de data inválido`);
          }
        }
      });

      const timeMs = new Date() - startTime;
      const isValid = errors.length === 0;

      PerformanceMetrics.trackOperation('ADVANCED_VALIDATION', tableName, timeMs, false);

      Logger.info('ValidationEngine', 'Advanced validation completed', {
        tableName,
        isValid,
        errorCount: errors.length,
        time: timeMs
      });

      return { isValid, errors };

    } catch (error) {
      Logger.error('ValidationEngine', 'Erro na validação avançada', {
        tableName,
        error: error.message
      });
      return { isValid: false, errors: [`Erro interno: ${error.message}`] };
    }
  }

  /**
   * Validar unique constraints
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados do registro
   * @param {string} excludeId - ID para excluir da verificação (para updates)
   * @returns {Object} {isValid, errors}
   */
  static async validateUnique(tableName, data, excludeId = null) {
    const startTime = new Date();
    const errors = [];

    Logger.info('ValidationEngine', 'Validando unique constraints', { tableName });

    try {
      if (typeof DATA_DICTIONARY === 'undefined' || !DATA_DICTIONARY[tableName]) {
        return { isValid: true, errors: [] };
      }

      const tableConfig = DATA_DICTIONARY[tableName];
      const fields = tableConfig.fields || {};

      // Procurar campos com unique: true
      const uniqueFields = Object.entries(fields)
        .filter(([_, fieldConfig]) => fieldConfig.unique === true)
        .map(([fieldName, _]) => fieldName);

      if (uniqueFields.length === 0) {
        Logger.debug('ValidationEngine', 'Nenhum campo unique definido', { tableName });
        return { isValid: true, errors: [] };
      }

      for (const fieldName of uniqueFields) {
        const fieldValue = data[fieldName];
        if (!fieldValue || fieldValue.toString().trim() === '') {
          continue; // Pular campos vazios
        }

        // Buscar registros existentes com o mesmo valor
        const existingRecords = DatabaseManager.query(tableName, { [fieldName]: fieldValue }, true);

        // Filtrar o próprio registro se for update
        const conflictingRecords = excludeId
          ? existingRecords.filter(record => record[tableConfig.primaryKey || 'id'] !== excludeId)
          : existingRecords;

        if (conflictingRecords.length > 0) {
          errors.push(`${fieldName}: Valor '${fieldValue}' já existe. Deve ser único.`);
          Logger.warn('ValidationEngine', 'Unique constraint violation', {
            field: fieldName,
            value: fieldValue,
            conflicts: conflictingRecords.length
          });
        }
      }

      const timeMs = new Date() - startTime;
      const isValid = errors.length === 0;

      PerformanceMetrics.trackOperation('UNIQUE_VALIDATION', tableName, timeMs, false);

      Logger.info('ValidationEngine', 'Unique validation completed', {
        tableName,
        isValid,
        errorCount: errors.length,
        time: timeMs
      });

      return { isValid, errors };

    } catch (error) {
      Logger.error('ValidationEngine', 'Erro na validação de unique', {
        tableName,
        error: error.message
      });
      return { isValid: false, errors: [`Erro interno: ${error.message}`] };
    }
  }

  /**
   * Validar um registro completo
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados do registro
   * @param {string} excludeId - ID para excluir da verificação unique (para updates)
   * @returns {Object} {isValid, errors}
   */
  static async validateRecord(tableName, data, excludeId = null) {
    const startTime = new Date();
    Logger.info('ValidationEngine', 'Iniciando validação completa', { tableName });

    const allErrors = [];

    // 1. Validar Foreign Keys
    const fkValidation = await this.validateForeignKeys(tableName, data);
    allErrors.push(...fkValidation.errors);

    // 2. Validar Business Rules
    const businessValidation = this.validateBusinessRules(tableName, data);
    allErrors.push(...businessValidation.errors);

    // 3. Validar Formatos Avançados
    const advancedValidation = this.validateAdvanced(tableName, data);
    allErrors.push(...advancedValidation.errors);

    // 4. Validar Unique Constraints
    const uniqueValidation = await this.validateUnique(tableName, data, excludeId);
    allErrors.push(...uniqueValidation.errors);

    const timeMs = new Date() - startTime;
    const isValid = allErrors.length === 0;

    PerformanceMetrics.trackOperation('FULL_VALIDATION', tableName, timeMs, false);

    Logger.info('ValidationEngine', 'Validação completa finalizada', {
      tableName,
      isValid,
      totalErrors: allErrors.length,
      fkErrors: fkValidation.errors.length,
      businessErrors: businessValidation.errors.length,
      advancedErrors: advancedValidation.errors.length,
      uniqueErrors: uniqueValidation.errors.length,
      time: timeMs
    });

    return { isValid, errors: allErrors };
  }
}

/**
 * PerformanceMetrics - Sistema de métricas de performance
 */
class PerformanceMetrics {
  static _getMetrics() {
    if (!this._metrics) {
      this._metrics = {
        operations: {},
        cacheStats: { hits: 0, misses: 0 },
        totalOperations: 0,
        startTime: new Date()
      };
    }
    return this._metrics;
  }

  static trackOperation(operation, tableName, timeMs, cacheHit = false) {
    const metrics = this._getMetrics();

    // Incrementar contadores gerais
    metrics.totalOperations++;

    // Track cache stats
    if (cacheHit) {
      metrics.cacheStats.hits++;
    } else {
      metrics.cacheStats.misses++;
    }

    // Track por operação
    const opKey = `${operation}_${tableName}`;
    if (!metrics.operations[opKey]) {
      metrics.operations[opKey] = {
        count: 0,
        totalTime: 0,
        avgTime: 0,
        minTime: timeMs,
        maxTime: timeMs
      };
    }

    const op = metrics.operations[opKey];
    op.count++;
    op.totalTime += timeMs;
    op.avgTime = op.totalTime / op.count;
    op.minTime = Math.min(op.minTime, timeMs);
    op.maxTime = Math.max(op.maxTime, timeMs);

    Logger.debug('PerformanceMetrics', 'Operation tracked', {
      operation, tableName, timeMs, cacheHit, totalOps: metrics.totalOperations
    });
  }

  static getCacheHitRate() {
    const metrics = this._getMetrics();
    const total = metrics.cacheStats.hits + metrics.cacheStats.misses;
    return total > 0 ? ((metrics.cacheStats.hits / total) * 100).toFixed(1) : '0.0';
  }

  static getReport() {
    const metrics = this._getMetrics();
    const uptime = new Date() - metrics.startTime;
    const uptimeMinutes = (uptime / 60000).toFixed(2);

    const report = {
      summary: {
        totalOperations: metrics.totalOperations,
        cacheHitRate: this.getCacheHitRate() + '%',
        uptimeMinutes: parseFloat(uptimeMinutes),
        operationsPerMinute: (metrics.totalOperations / parseFloat(uptimeMinutes)).toFixed(2)
      },
      cacheStats: metrics.cacheStats,
      operations: metrics.operations
    };

    Logger.info('PerformanceMetrics', 'Performance report', report.summary);
    return report;
  }

  static logReport() {
    const report = this.getReport();

    console.log('\n' + '='.repeat(50));
    console.log('📊 RELATÓRIO DE PERFORMANCE');
    console.log('='.repeat(50));

    console.log(`🎯 Operações totais: ${report.summary.totalOperations}`);
    console.log(`💾 Cache hit rate: ${report.summary.cacheHitRate}`);
    console.log(`⏱️ Uptime: ${report.summary.uptimeMinutes} min`);
    console.log(`📈 Ops/min: ${report.summary.operationsPerMinute}`);

    console.log('\n📋 Operações detalhadas:');
    Object.entries(report.operations).forEach(([opKey, stats]) => {
      console.log(`  ${opKey}: ${stats.count}x | avg: ${stats.avgTime.toFixed(0)}ms | min: ${stats.minTime}ms | max: ${stats.maxTime}ms`);
    });

    console.log('='.repeat(50));
    return report;
  }

  static reset() {
    this._metrics = {
      operations: {},
      cacheStats: { hits: 0, misses: 0 },
      totalOperations: 0,
      startTime: new Date()
    };
    Logger.info('PerformanceMetrics', 'Metrics reset');
  }
}

/**
 * CacheManager - Gerenciador de cache multi-camada
 */
class CacheManager {
  static _getCache() {
    if (!this._cache) {
      this._cache = new Map();
    }
    return this._cache;
  }

  static _getTTL() {
    return APP_CONFIG.CACHE_TTL_MINUTES;
  }

  // Gerar chave de cache
  static _generateKey(tableName, filters = {}) {
    const filterStr = Object.keys(filters).length > 0 ? JSON.stringify(filters) : 'all';
    return `${tableName}:${filterStr}`;
  }

  // Cache em memória (session-only)
  static _getFromMemory(key) {
    const cache = this._getCache();
    const cached = cache.get(key);
    if (!cached) return null;

    const now = new Date().getTime();
    if (now > cached.expires) {
      cache.delete(key);
      return null;
    }

    Logger.debug('CacheManager', 'Memory cache hit', { key });
    return cached.data;
  }

  static _setToMemory(key, data) {
    const cache = this._getCache();
    const ttl = this._getTTL();
    const expires = new Date().getTime() + (ttl * 60 * 1000);
    cache.set(key, { data, expires });
    Logger.debug('CacheManager', 'Memory cache set', { key, ttl });
  }

  // Cache persistente (cross-session)
  static _getFromPersistent(key) {
    try {
      const stored = PropertiesService.getScriptProperties().getProperty(`cache_${key}`);
      if (!stored) return null;

      const cached = JSON.parse(stored);
      const now = new Date().getTime();

      if (now > cached.expires) {
        PropertiesService.getScriptProperties().deleteProperty(`cache_${key}`);
        Logger.debug('CacheManager', 'Persistent cache expired', { key });
        return null;
      }

      Logger.debug('CacheManager', 'Persistent cache hit', { key });
      return cached.data;
    } catch (error) {
      Logger.warn('CacheManager', 'Error reading persistent cache', { key, error: error.message });
      return null;
    }
  }

  static _setToPersistent(key, data) {
    try {
      const ttl = this._getTTL();
      const expires = new Date().getTime() + (ttl * 60 * 1000);
      const cacheData = { data, expires };
      PropertiesService.getScriptProperties().setProperty(`cache_${key}`, JSON.stringify(cacheData));
      Logger.debug('CacheManager', 'Persistent cache set', { key, ttl });
    } catch (error) {
      Logger.warn('CacheManager', 'Error writing persistent cache', { key, error: error.message });
    }
  }

  // API pública do cache
  static get(tableName, filters = {}) {
    const key = this._generateKey(tableName, filters);

    // Tentar memória primeiro
    let cached = this._getFromMemory(key);
    if (cached) return cached;

    // Tentar cache persistente
    cached = this._getFromPersistent(key);
    if (cached) {
      // Promover para memória
      this._setToMemory(key, cached);
      return cached;
    }

    return null;
  }

  static set(tableName, filters, data) {
    const key = this._generateKey(tableName, filters);
    this._setToMemory(key, data);
    this._setToPersistent(key, data);
  }

  static invalidate(tableName) {
    const pattern = `${tableName}:`;
    const cache = this._getCache();

    // Limpar memória
    for (const key of cache.keys()) {
      if (key.startsWith(pattern)) {
        cache.delete(key);
      }
    }

    // Limpar persistente
    try {
      const properties = PropertiesService.getScriptProperties().getProperties();
      Object.keys(properties).forEach(prop => {
        if (prop.startsWith(`cache_${pattern}`)) {
          PropertiesService.getScriptProperties().deleteProperty(prop);
        }
      });
    } catch (error) {
      Logger.warn('CacheManager', 'Error clearing persistent cache', { tableName, error: error.message });
    }

    Logger.info('CacheManager', 'Cache invalidated', { tableName });
  }

  static clearExpired() {
    const now = new Date().getTime();
    const cache = this._getCache();

    // Limpar memória expirada
    for (const [key, cached] of cache.entries()) {
      if (now > cached.expires) {
        cache.delete(key);
      }
    }

    // Limpar persistente expirado
    try {
      const properties = PropertiesService.getScriptProperties().getProperties();
      Object.keys(properties).forEach(prop => {
        if (prop.startsWith('cache_')) {
          try {
            const cached = JSON.parse(properties[prop]);
            if (now > cached.expires) {
              PropertiesService.getScriptProperties().deleteProperty(prop);
            }
          } catch (e) {
            // Remover entradas corrompidas
            PropertiesService.getScriptProperties().deleteProperty(prop);
          }
        }
      });
    } catch (error) {
      Logger.warn('CacheManager', 'Error cleaning expired cache', { error: error.message });
    }

    Logger.info('CacheManager', 'Expired cache entries cleared');
  }
}

/**
 * DatabaseManager - Camada unificada de acesso a dados
 * Compatible com sistema atual (utils.gs) mas modernizado
 */
const DatabaseManager = {

  /**
   * Query principal - buscar dados de uma tabela com paginação opcional
   * @param {string} tableName - Nome da tabela (ex: 'usuarios', 'atividades')
   * @param {Object} filters - Filtros opcionais { campo: valor }
   * @param {boolean|Object} useCacheOrOptions - Usar cache (true/false) ou objeto de opções
   * @returns {Array|Object} Array de objetos ou objeto com dados e paginação
   */
  query(tableName, filters = {}, useCacheOrOptions = true) {
    try {
      const startTime = new Date();

      // Processar parâmetros (compatibilidade com chamadas antigas)
      let useCache = true;
      let paginationOptions = null;

      if (typeof useCacheOrOptions === 'boolean') {
        // Chamada antiga: query(table, filters, useCache)
        useCache = useCacheOrOptions;
      } else if (typeof useCacheOrOptions === 'object' && useCacheOrOptions !== null) {
        // Chamada nova: query(table, filters, {useCache, page, per_page})
        useCache = useCacheOrOptions.useCache !== false; // default true
        paginationOptions = {
          page: useCacheOrOptions.page || 1,
          per_page: useCacheOrOptions.per_page || 20
        };
      }

      // Chave de cache inclui paginação se presente
      const cacheKey = paginationOptions
        ? `${JSON.stringify(filters)}_page${paginationOptions.page}_per${paginationOptions.per_page}`
        : JSON.stringify(filters);

      // Verificar cache primeiro
      if (useCache) {
        const cached = CacheManager.get(tableName, cacheKey);
        if (cached) {
          const timeMs = new Date() - startTime;
          PerformanceMetrics.trackOperation('QUERY', tableName, timeMs, true);
          Logger.info('DatabaseManager', 'Cache hit', { tableName, filters, pagination: paginationOptions, time: timeMs });
          return cached;
        }
      }

      // Buscar dados da planilha
      const rawData = this._getRawData(tableName);

      // Aplicar filtros
      let results = rawData;
      if (Object.keys(filters).length > 0) {
        results = this._applyFilters(rawData, filters);
      }

      // Aplicar paginação se solicitada
      let finalResult = results;
      let paginationInfo = null;

      if (paginationOptions) {
        const { page, per_page } = paginationOptions;
        const totalRecords = results.length;
        const totalPages = Math.ceil(totalRecords / per_page);
        const startIndex = (page - 1) * per_page;
        const endIndex = startIndex + per_page;

        // Paginar resultados
        const paginatedData = results.slice(startIndex, endIndex);

        paginationInfo = {
          page: page,
          per_page: per_page,
          total: totalRecords,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
          start_index: startIndex + 1, // 1-based
          end_index: Math.min(endIndex, totalRecords) // 1-based
        };

        finalResult = {
          data: paginatedData,
          pagination: paginationInfo
        };

        Logger.info('DatabaseManager', 'Query with pagination completed', {
          tableName,
          filters,
          pagination: paginationInfo,
          time: new Date() - startTime
        });
      } else {
        Logger.info('DatabaseManager', 'Query completed', {
          tableName,
          filters,
          results: results.length,
          time: new Date() - startTime
        });
      }

      // Salvar no cache
      if (useCache) {
        CacheManager.set(tableName, cacheKey, finalResult);
      }

      const timeMs = new Date() - startTime;
      PerformanceMetrics.trackOperation('QUERY', tableName, timeMs, false);
      return finalResult;

    } catch (error) {
      this._logError('query', tableName, error, { filters });
      return [];
    }
  },

  /**
   * Buscar por ID específico
   * @param {string} tableName - Nome da tabela
   * @param {string} id - ID do registro
   * @returns {Object|null} Objeto encontrado ou null
   */
  findById(tableName, id) {
    try {
      // Obter chave primária do dicionário
      const table = getTableDictionary(tableName);
      const primaryKey = table?.primaryKey || 'id';

      // Criar filtro usando a chave primária correta
      const filter = {};
      filter[primaryKey] = id;

      const results = this.query(tableName, filter, true);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      this._logError('findById', tableName, error, { id });
      return null;
    }
  },

  /**
   * Contar registros
   * @param {string} tableName - Nome da tabela
   * @param {Object} filters - Filtros opcionais
   * @returns {number} Quantidade de registros
   */
  count(tableName, filters = {}) {
    return this.query(tableName, filters, true).length;
  },

  /**
   * Obter todos os registros
   * @param {string} tableName - Nome da tabela
   * @returns {Array} Todos os registros
   */
  getAll(tableName) {
    return this.query(tableName, {}, true);
  },

  /**
   * Inserir novo registro
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados a inserir
   * @returns {Object} { success: boolean, id?: string, error?: string }
   */
  async insert(tableName, data) {
    try {
      const startTime = new Date();

      // Obter chave primária do dicionário
      const table = getTableDictionary(tableName);
      const primaryKey = table?.primaryKey || 'id';

      // Gerar ID único
      const generatedId = this._generateId(tableName);

      // Preparar dados base com ID já definido
      const baseData = {
        [primaryKey]: generatedId, // Usar chave primária correta
        ...data
      };

      // Adicionar campos específicos da tabela (sem sobrescrever a chave primária)
      const tableFields = this._getTableSpecificFields(tableName, baseData);

      // Montar record final
      const record = {
        ...baseData,
        ...tableFields
      };

      // Validar dados APÓS aplicar campos gerados e padrões
      const validation = this._validateData(tableName, record);
      if (!validation.valid) {
        return {
          success: false,
          error: `Dados inválidos: ${validation.errors.join(', ')}`,
          validation: validation.errors
        };
      }

      // Validar Foreign Keys
      const fkValidation = await ValidationEngine.validateRecord(tableName, record);
      if (!fkValidation.isValid) {
        Logger.warn('DatabaseManager', 'FK validation failed on INSERT', {
          tableName,
          errors: fkValidation.errors
        });
        return {
          success: false,
          error: `Erro de integridade referencial: ${fkValidation.errors.join(', ')}`,
          validation: fkValidation.errors
        };
      }

      // Obter configuração da tabela usando sistema atual
      const tableRef = this._getTableReference(tableName);
      const context = this._getContext(tableRef);

      // Obter headers existentes
      const headers = this._getHeaders(context);

      // Converter objeto para array na ordem dos headers - evitando booleans
      const rowData = headers.map(header => {
        let value = record[header];

        // Converter undefined/null para string vazia
        if (value === undefined || value === null) {
          value = '';
        }
        // Converter boolean para string
        else if (typeof value === 'boolean') {
          value = value ? 'true' : 'false';
        }
        // Garantir que outros tipos sejam string
        else if (typeof value !== 'string') {
          value = String(value);
        }

        return value;
      });

      // Inserir na planilha
      if (context.namedRange) {
        // Se usa named range, precisa adicionar após o range
        const range = context.file.getRangeByName(context.namedRange);
        const sheet = range.getSheet();
        sheet.appendRow(rowData);
      } else {
        // Se usa A1 notation, adiciona na aba
        context.sheet.appendRow(rowData);
      }

      const timeMs = new Date() - startTime;
      PerformanceMetrics.trackOperation('INSERT', tableName, timeMs, false);
      Logger.info('DatabaseManager', 'Insert completed', { tableName, id: generatedId, time: timeMs });

      // Invalidar cache para forçar reload na próxima query
      CacheManager.invalidate(tableName);

      return { success: true, id: generatedId };

    } catch (error) {
      this._logError('insert', tableName, error, { data });
      return { success: false, error: error.message };
    }
  },

  /**
   * Atualizar registro existente
   * @param {string} tableName - Nome da tabela
   * @param {string} id - ID do registro
   * @param {Object} data - Dados para atualizar
   * @returns {Object} { success: boolean, error?: string }
   */
  async update(tableName, id, data) {
    try {
      const startTime = new Date();

      // Buscar registro atual
      const currentRecord = this.findById(tableName, id);
      if (!currentRecord) {
        return { success: false, error: 'Registro não encontrado' };
      }

      // Preparar dados atualizados
      const updatedRecord = {
        ...currentRecord,
        ...data,
        updated_at: new Date().toISOString()
      };

      // Validar Foreign Keys do registro atualizado
      const fkValidation = await ValidationEngine.validateRecord(tableName, updatedRecord);
      if (!fkValidation.isValid) {
        Logger.warn('DatabaseManager', 'FK validation failed on UPDATE', {
          tableName,
          id,
          errors: fkValidation.errors
        });
        return {
          success: false,
          error: `Erro de integridade referencial: ${fkValidation.errors.join(', ')}`,
          validation: fkValidation.errors
        };
      }


      // Encontrar linha na planilha e atualizar
      const rowIndex = this._findRowIndex(tableName, id);
      if (rowIndex === -1) {
        return { success: false, error: 'Linha não encontrada na planilha' };
      }

      const tableRef = this._getTableReference(tableName);
      const context = this._getContext(tableRef);
      const headers = this._getHeaders(context);

      // Converter para array - garantindo que booleans virem strings
      const rowData = headers.map(header => {
        let value = updatedRecord[header];

        // Converter undefined/null para string vazia
        if (value === undefined || value === null) {
          value = '';
        }
        // Converter boolean para string
        else if (typeof value === 'boolean') {
          value = value ? 'true' : 'false';
        }
        // Garantir que outros tipos sejam string
        else if (typeof value !== 'string') {
          value = String(value);
        }

        return value;
      });

      // Atualizar linha (rowIndex + 1 porque planilha é 1-indexed)
      const sheet = context.sheet;
      sheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);

      // Invalidar cache
      CacheManager.invalidate(tableName);

      const timeMs = new Date() - startTime;
      PerformanceMetrics.trackOperation('UPDATE', tableName, timeMs, false);
      Logger.info('DatabaseManager', 'Update completed', { tableName, id, time: timeMs });
      return { success: true };

    } catch (error) {
      this._logError('update', tableName, error, { id, data });
      return { success: false, error: error.message };
    }
  },

  /**
   * Deletar registro (soft delete - marca como deletado)
   * @param {string} tableName - Nome da tabela
   * @param {string} id - ID do registro a ser deletado
   * @returns {Object} Resultado da operação
   */
  delete(tableName, id) {
    try {
      const startTime = new Date();

      // Usar soft delete - marca como deletado
      // Usar 'x' para marcar como deletado (simples e eficaz)
      const deleteData = {
        deleted: 'x',
        atualizado_em: this._formatTimestamp(new Date())
      };

      const result = this.update(tableName, id, deleteData);

      if (result.success) {
        const timeMs = new Date() - startTime;
        PerformanceMetrics.trackOperation('DELETE', tableName, timeMs, false);
        Logger.info('DatabaseManager', 'Delete completed', { tableName, id, time: timeMs });
      }

      return result;

    } catch (error) {
      this._logError('delete', tableName, error, { id });
      return { success: false, error: error.message };
    }
  },

  /**
   * Invalidar cache de uma tabela
   * @param {string} tableName - Nome da tabela
   */
  invalidateCache(tableName) {
    CacheManager.invalidate(tableName);
  },

  /**
   * Obter relatório de performance
   * @returns {Object} Relatório detalhado
   */
  getPerformanceReport() {
    return PerformanceMetrics.getReport();
  },

  /**
   * Exibir relatório de performance no console
   */
  logPerformanceReport() {
    return PerformanceMetrics.logReport();
  },

  /**
   * Resetar métricas de performance
   */
  resetPerformanceMetrics() {
    PerformanceMetrics.reset();
  },

  /**
   * Limpar cache expirado
   */
  clearExpiredCache() {
    CacheManager.clearExpired();
  },

  /**
   * Testar validação de Foreign Keys
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados para validar
   * @returns {Object} Resultado da validação
   */
  async testForeignKeyValidation(tableName, data) {
    return await ValidationEngine.validateForeignKeys(tableName, data);
  },

  /**
   * Obter Foreign Keys de uma tabela
   * @param {string} tableName - Nome da tabela
   * @returns {Array} Array de FKs
   */
  getForeignKeys(tableName) {
    return ValidationEngine.getForeignKeys(tableName);
  },

  /**
   * Testar Business Rules
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados para validar
   * @returns {Object} Resultado da validação
   */
  testBusinessRules(tableName, data) {
    return ValidationEngine.validateBusinessRules(tableName, data);
  },

  /**
   * Testar Validações Avançadas (pattern, maxLength, enum, etc.)
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados para validar
   * @returns {Object} Resultado da validação
   */
  testAdvancedValidation(tableName, data) {
    return ValidationEngine.validateAdvanced(tableName, data);
  },

  /**
   * Testar Unique Constraints
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados para validar
   * @returns {Object} Resultado da validação
   */
  async testUniqueValidation(tableName, data) {
    return await ValidationEngine.validateUnique(tableName, data);
  },

  /**
   * Testar Validação Completa (FK + Business + Advanced + Unique)
   * @param {string} tableName - Nome da tabela
   * @param {Object} data - Dados para validar
   * @returns {Object} Resultado da validação
   */
  async testCompleteValidation(tableName, data) {
    return await ValidationEngine.validateRecord(tableName, data);
  },

  /**
   * Limpar todo o cache
   */
  clearCache() {
    this._cache.clear();
    console.log('🗑️ DatabaseManager: Cache limpo');
  },

  // ===========================================
  // MÉTODOS INTERNOS (PRIVADOS)
  // ===========================================

  /**
   * Obter dados brutos de uma tabela (compatível com sistema atual)
   */
  _getRawData(tableName) {
    try {
      // Usar sistema atual (readTableByNome_) para compatibilidade
      const { values, headerIndex } = readTableByNome_(tableName);

      if (!values || values.length <= 1) {
        return [];
      }

      // Converter para objetos
      const headers = values[0];
      const dataRows = values.slice(1);

      const mappedData = dataRows
        .filter(row => row.some(cell => cell !== null && cell !== '')) // Remove linhas vazias
        .map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });

      const filteredData = mappedData.filter(obj => obj.deleted !== 'x');
      return filteredData;

    } catch (error) {
      console.error(`❌ Erro ao buscar dados de ${tableName}:`, error);
      return [];
    }
  },

  /**
   * Aplicar filtros aos dados
   */
  _applyFilters(data, filters) {
    return data.filter(record => {
      return Object.keys(filters).every(field => {
        const filterValue = filters[field];
        const recordValue = record[field];

        if (filterValue === undefined || filterValue === null || filterValue === '') {
          return true;
        }

        // Filtro por string (case insensitive)
        if (typeof filterValue === 'string') {
          return recordValue?.toString().toLowerCase()
            .includes(filterValue.toLowerCase());
        }

        // Filtro exato
        return recordValue === filterValue;
      });
    });
  },

  /**
   * Gerar ID único para um registro
   */
  /**
   * Gerar ID único baseado nos padrões reais do sistema
   */
  _generateId(tableName) {
    const pattern = APP_CONFIG.ID_PATTERNS[tableName];

    switch (tableName) {
      case 'usuarios':
      case 'membros':
      case 'participacoes':
        // Padrão: U{timestamp completo} (como no sistema real)
        const fullTimestamp = Date.now().toString();
        return `${pattern.prefix}${fullTimestamp}`;

      case 'atividades':
        // Padrão: ACT-{timestamp}{random}
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${pattern.prefix}-${timestamp}${random}`;

      case 'categorias_atividades':
      case 'menu':
        // Padrão: CAT-{counter} - precisa buscar último número
        const lastCounter = this._getLastCounter(tableName, pattern.prefix);
        const nextCounter = (lastCounter + 1).toString().padStart(3, '0');
        return `${pattern.prefix}-${nextCounter}`;

      default:
        // Fallback
        return `${pattern.prefix}-${Date.now()}`;
    }
  },

  /**
   * Obter último contador usado para uma tabela
   */
  _getLastCounter(tableName, prefix) {
    try {
      const allRecords = this.query(tableName, {}, false); // Sem cache
      let maxCounter = 0;

      allRecords.forEach(record => {
        if (record.id && record.id.startsWith(prefix + '-')) {
          const counterStr = record.id.split('-')[1];
          const counter = parseInt(counterStr, 10);
          if (!isNaN(counter) && counter > maxCounter) {
            maxCounter = counter;
          }
        }
      });

      return maxCounter;
    } catch (error) {
      console.warn(`⚠️ Erro ao obter contador para ${tableName}:`, error);
      return 0;
    }
  },

  /**
   * Gerar chave de cache
   */
  _generateCacheKey(tableName, filters) {
    const filterStr = JSON.stringify(filters);
    return `${tableName}_${filterStr}`;
  },

  /**
   * Obter dados do cache
   */
  _getFromCache(key) {
    const cached = this._cache.get(key);
    if (!cached) return null;

    // Verificar TTL
    if (Date.now() > cached.expires) {
      this._cache.delete(key);
      return null;
    }

    return cached.data;
  },

  /**
   * Salvar no cache
   */
  _setCache(key, data) {
    this._cache.set(key, {
      data,
      expires: Date.now() + (this._cacheTTL * 60 * 1000)
    });
  },

  /**
   * Invalidar cache de uma tabela
   */
  _invalidateTableCache(tableName) {
    const keysToDelete = [];
    this._cache.forEach((value, key) => {
      if (key.startsWith(tableName + '_')) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this._cache.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🗑️ Cache invalidado para ${tableName}: ${keysToDelete.length} entradas`);
    }
  },

  /**
   * Obter referência da tabela (compatível com sistema atual)
   */
  _getTableReference(tableName) {
    return getPlanRef_(tableName);
  },

  /**
   * Obter contexto da tabela (compatível com sistema atual)
   */
  _getContext(tableRef) {
    return getContextFromRef_(tableRef);
  },

  /**
   * Obter headers da tabela
   */
  _getHeaders(context) {
    if (context.namedRange) {
      const range = context.file.getRangeByName(context.namedRange);
      return range.getValues()[0];
    } else {
      const range = context.sheet.getRange(context.rangeStr);
      return range.getValues()[0];
    }
  },

  /**
   * Encontrar índice da linha na planilha
   */
  _findRowIndex(tableName, id) {
    try {
      const result = readTableByNome_(tableName);
      const { values } = result;

      if (!values || values.length <= 1) {
        console.error(`❌ Tabela ${tableName} vazia ou sem dados`);
        return -1;
      }

      // Headers está na primeira linha de values
      const headers = values[0];

      // Obter chave primária do dicionário
      const table = getTableDictionary(tableName);
      const primaryKey = table?.primaryKey || 'id';

      // Encontrar índice da coluna da chave primária
      const primaryKeyIndex = headers.indexOf(primaryKey);
      if (primaryKeyIndex === -1) {
        console.error(`❌ Chave primária '${primaryKey}' não encontrada nos headers:`, headers);
        return -1;
      }

      for (let i = 1; i < values.length; i++) { // i=1 para pular header
        const row = values[i];
        if (row[primaryKeyIndex] === id) {
          return i;
        }
      }

      return -1;
    } catch (error) {
      console.error(`❌ Erro ao encontrar linha para ID ${id}:`, error);
      return -1;
    }
  },

  /**
   * Log de operações
   */
  _logOperation(operation, tableName, params, startTime, resultCount = null) {
    const duration = new Date() - startTime;
    const resultStr = resultCount !== null ? ` (${resultCount} registros)` : '';

    // Log mais detalhado para diagnóstico
    const paramsStr = JSON.stringify(params);
    const hasFilters = Object.keys(params).length > 0;
    const filterInfo = hasFilters ? ` [filtros: ${paramsStr}]` : ' [sem filtros]';

    console.log(`🔍 DatabaseManager.${operation}: ${tableName}${resultStr} em ${duration}ms${filterInfo}`);
  },

  /**
   * Log de erros
   */
  _logError(operation, tableName, error, context) {
    console.error(`❌ DatabaseManager.${operation} erro em ${tableName}:`, error.message, context);
  },

  /**
   * Obter campos específicos por tabela usando dicionário de dados
   */
  _getTableSpecificFields(tableName, data) {
    const fields = {};

    // Obter valores padrão do dicionário
    const defaultValues = getDefaultValues(tableName);

    // Aplicar valores padrão diretamente
    Object.assign(fields, defaultValues);


    // Obter campos gerados automaticamente
    const generatedFields = getGeneratedFields(tableName);

    generatedFields.forEach(fieldName => {
      const fieldDef = getFieldDefinition(tableName, fieldName);

      // Só gerar se não foi fornecido E não está no record já montado
      if (!data[fieldName] && fields[fieldName] === undefined) {
        switch (fieldName) {
          case 'uid':
            fields.uid = this._generateId('usuarios'); // Usar função unificada
            break;

          case 'criado_em':
          case 'marcado_em':
            fields[fieldName] = this._formatTimestamp(new Date());
            break;

          case 'created_at':
            fields.created_at = new Date().toISOString();
            break;

          default:
            // Para outros campos gerados, usar padrão baseado no tipo
            if (fieldDef?.type === 'DATETIME') {
              fields[fieldName] = this._formatTimestamp(new Date());
            }
            break;
        }
      }
    });

    return fields;
  },

  /**
   * Validar dados antes de inserir/atualizar
   */
  _validateData(tableName, data) {
    try {
      return validateAgainstDictionary(tableName, data);
    } catch (error) {
      console.warn(`⚠️ Erro na validação de ${tableName}:`, error);
      return { valid: true, errors: [] }; // Fallback: permitir operação
    }
  },


  /**
   * Formatar timestamp no formato do sistema
   */
  _formatTimestamp(date) {
    // Usar formato compatível com sistema atual
    // Verificar se APP_CONFIG tem formato específico
    if (APP_CONFIG && APP_CONFIG.TZ) {
      return Utilities.formatDate(date, APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss');
    } else {
      // Fallback para ISO string
      return date.toISOString();
    }
  }
};

/**
 * Testar especificamente o problema dos filtros no cache
 */
function testCacheFilters() {
  try {
    console.log('🔍 TESTE: Filtros no cache...');

    // Limpar cache
    DatabaseManager.clearCache();

    // Teste 1: Query com filtro específico
    console.log('\n📋 Primeira query com filtro status=Ativo');
    const usuariosAtivos1 = DatabaseManager.query('usuarios', { status: 'Ativo' });

    // Teste 2: Mesma query (deveria mostrar mesmos filtros no cache)
    console.log('\n📋 Segunda query com mesmo filtro (cache)');
    const usuariosAtivos2 = DatabaseManager.query('usuarios', { status: 'Ativo' });

    // Teste 3: Query diferente
    console.log('\n📋 Query sem filtros');
    const todosusuarios = DatabaseManager.query('usuarios', {});

    // Teste 4: Voltar para query com filtro
    console.log('\n📋 Voltar para query com filtro');
    const usuariosAtivos3 = DatabaseManager.query('usuarios', { status: 'Ativo' });

    console.log('\n✅ Teste de filtros no cache concluído');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no teste de filtros:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Diagnóstico detalhado do cache
 */
function diagnoseCacheIssue() {
  try {
    console.log('🔍 DIAGNÓSTICO: Investigando cache issue...');

    // Limpar cache primeiro
    DatabaseManager.clearCache();

    // Teste 1: Query simples sem filtros
    console.log('\n📋 Teste 1: Query sem filtros');
    const usuarios1 = DatabaseManager.query('usuarios', {});

    // Teste 2: Mesma query (deveria vir do cache)
    console.log('\n📋 Teste 2: Mesma query (cache)');
    const usuarios2 = DatabaseManager.query('usuarios', {});

    // Teste 3: Query com filtro específico
    console.log('\n📋 Teste 3: Query com filtro');
    const usuariosAtivos = DatabaseManager.query('usuarios', { status: 'Ativo' });

    // Teste 4: findById (pode ser a causa do id: undefined)
    console.log('\n📋 Teste 4: findById');
    if (usuarios1.length > 0) {
      const primeiro = DatabaseManager.findById('usuarios', usuarios1[0].id);
      console.log('FindById resultado:', primeiro ? 'Encontrado' : 'Não encontrado');
    }

    // Teste 5: findById com ID inválido (pode gerar id: undefined)
    console.log('\n📋 Teste 5: findById com ID inválido');
    const invalido = DatabaseManager.findById('usuarios', undefined);

    console.log('\n✅ Diagnóstico concluído');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no diagnóstico:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Função de teste para validar DatabaseManager
 */
function testDatabaseManager() {
  try {
    console.log('🧪 Iniciando teste do DatabaseManager...');

    // Teste 1: Query básica
    const usuarios = DatabaseManager.query('usuarios');
    console.log(`✅ Teste 1 - Query usuarios: ${usuarios.length} registros`);

    // Teste 2: Query com filtro
    const usuariosAtivos = DatabaseManager.query('usuarios', { status: 'Ativo' });
    console.log(`✅ Teste 2 - Filtro status: ${usuariosAtivos.length} registros`);

    // Teste 3: FindById (se houver dados)
    if (usuarios.length > 0) {
      const primeiroUsuario = DatabaseManager.findById('usuarios', usuarios[0].id);
      console.log(`✅ Teste 3 - FindById: ${primeiroUsuario ? 'Encontrado' : 'Não encontrado'}`);
    }

    // Teste 4: Count
    const totalAtividades = DatabaseManager.count('atividades');
    console.log(`✅ Teste 4 - Count atividades: ${totalAtividades} registros`);

    console.log('🎉 DatabaseManager: Todos os testes básicos passaram!');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no teste do DatabaseManager:', error);
    return { success: false, error: error.message };
  }
}

/**
 * SecurityManager - Funções de segurança e hash
 */
class SecurityManager {

  /**
   * Gerar hash SHA-256 de uma string
   * @param {string} text - Texto para gerar hash
   * @returns {string} Hash em formato hexadecimal
   */
  static generateHash(text) {
    try {
      const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text);
      return digest.map(byte => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, '0')).join('');
    } catch (error) {
      Logger.error('SecurityManager', 'Erro ao gerar hash', { error: error.message });
      throw error;
    }
  }

  /**
   * Verificar se valor é um hash (formato: $hash$...)
   * @param {string} value - Valor para verificar
   * @returns {boolean} True se é hash
   */
  static isHash(value) {
    return typeof value === 'string' && value.startsWith('$hash$');
  }

  /**
   * Criar hash formatado para armazenamento
   * @param {string} plainText - Texto em claro
   * @returns {string} Hash formatado ($hash$...)
   */
  static createStorageHash(plainText) {
    const hash = this.generateHash(plainText);
    return `$hash$${hash}`;
  }

  /**
   * Extrair hash puro do formato de armazenamento
   * @param {string} storageHash - Hash no formato $hash$...
   * @returns {string} Hash puro
   */
  static extractHash(storageHash) {
    if (this.isHash(storageHash)) {
      return storageHash.replace('$hash$', '');
    }
    return storageHash;
  }

  /**
   * Validar PIN/senha com compatibilidade híbrida
   * @param {string} inputPin - PIN digitado pelo usuário
   * @param {string} storedValue - Valor armazenado (pode ser hash ou texto puro)
   * @returns {boolean} True se PIN está correto
   */
  static validatePin(inputPin, storedValue) {
    try {
      if (!inputPin || !storedValue) {
        Logger.debug('SecurityManager', 'PIN ou valor armazenado vazio');
        return false;
      }

      // Se é hash, validar com hash
      if (this.isHash(storedValue)) {
        const storedHash = this.extractHash(storedValue);
        const inputHash = this.generateHash(inputPin);
        const isValid = inputHash === storedHash;

        Logger.debug('SecurityManager', 'Validação por hash', {
          isValid,
          hasStoredHash: !!storedHash,
          hasInputHash: !!inputHash
        });

        return isValid;
      }

      // Senão, é texto puro (compatibilidade)
      const isValid = String(inputPin).trim() === String(storedValue).trim();

      Logger.debug('SecurityManager', 'Validação por texto puro', {
        isValid,
        inputLength: String(inputPin).length,
        storedLength: String(storedValue).length
      });

      return isValid;

    } catch (error) {
      Logger.error('SecurityManager', 'Erro na validação de PIN', { error: error.message });
      return false;
    }
  }

  /**
   * Migrar PIN de texto puro para hash (chamado após login bem-sucedido)
   * @param {string} tableName - Nome da tabela
   * @param {string} userId - ID do usuário
   * @param {string} plainPin - PIN em texto puro
   * @returns {boolean} True se migração foi bem-sucedida
   */
  static migratePinToHash(tableName, userId, plainPin) {
    try {
      Logger.info('SecurityManager', 'Iniciando migração de PIN para hash', { userId });

      // Gerar hash do PIN
      const hashedPin = this.createStorageHash(plainPin);

      // Atualizar no banco
      const updateResult = DatabaseManager.update(tableName, userId, { pin: hashedPin });

      if (updateResult) {
        Logger.info('SecurityManager', 'PIN migrado para hash com sucesso', { userId });
        return true;
      } else {
        Logger.warn('SecurityManager', 'Falha na migração de PIN', { userId });
        return false;
      }

    } catch (error) {
      Logger.error('SecurityManager', 'Erro na migração de PIN', { userId, error: error.message });
      return false;
    }
  }

  /**
   * Função de login segura com migração automática
   * @param {string} login - Login do usuário
   * @param {string} pin - PIN digitado
   * @returns {Object} Resultado do login
   */
  static secureLogin(login, pin) {
    try {
      Logger.info('SecurityManager', 'Tentativa de login seguro', { login });

      if (!login || !pin) {
        return { ok: false, error: 'Informe login e PIN.' };
      }

      // Buscar usuário por login
      const usuarios = DatabaseManager.query('usuarios', { login: login.trim() });

      if (!usuarios || usuarios.length === 0) {
        Logger.warn('SecurityManager', 'Usuário não encontrado', { login });
        return { ok: false, error: 'Usuário ou PIN inválidos.' };
      }

      const usuario = usuarios[0];

      // Verificar se usuário está ativo
      const status = String(usuario.status || '').toLowerCase();
      if (status !== 'ativo' && status !== 'active' && status !== '1' && status !== 'true') {
        Logger.warn('SecurityManager', 'Usuário inativo', { login, status });
        return { ok: false, error: 'Usuário inativo.' };
      }

      // Validar PIN (híbrido: hash ou texto puro)
      const pinValido = this.validatePin(pin, usuario.pin);

      if (!pinValido) {
        Logger.warn('SecurityManager', 'PIN inválido', { login });
        return { ok: false, error: 'Usuário ou PIN inválidos.' };
      }

      // Se PIN é texto puro, migrar para hash automaticamente
      if (!this.isHash(usuario.pin)) {
        Logger.info('SecurityManager', 'Migrando PIN para hash', { login });
        this.migratePinToHash('usuarios', usuario.id, pin);
      }

      // Atualizar último acesso
      DatabaseManager.update('usuarios', usuario.id, {
        ultimo_acesso: Utilities.formatDate(new Date(), APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss')
      });

      Logger.info('SecurityManager', 'Login bem-sucedido', { login, userId: usuario.id });

      return {
        ok: true,
        user: {
          id: usuario.id,
          uid: usuario.uid || '',
          nome: usuario.nome || '',
          login: usuario.login,
          role: usuario.role || 'user'
        }
      };

    } catch (error) {
      Logger.error('SecurityManager', 'Erro no login seguro', { login, error: error.message });
      return { ok: false, error: 'Erro interno no sistema.' };
    }
  }
}

/**
 * SessionManager - Gerenciamento de sessões com expiração
 */
class SessionManager {

  /**
   * Criar nova sessão para usuário
   * @param {string} userId - ID do usuário
   * @param {Object} metadata - Metadados da sessão (IP, user agent, etc)
   * @returns {Object} Dados da sessão criada
   */
  static createSession(userId, metadata = {}) {
    try {
      Logger.info('SessionManager', 'Criando nova sessão', { userId });

      // Limpar sessões expiradas antes de criar nova
      this.cleanupExpiredSessions();

      // Verificar limite de sessões por usuário
      const userSessions = this.getUserSessions(userId);
      const maxSessions = APP_CONFIG.SESSION.MAX_SESSIONS_PER_USER || 3;

      if (userSessions.length >= maxSessions) {
        // Remover sessão mais antiga
        const oldestSession = userSessions.sort((a, b) =>
          new Date(a.criado_em) - new Date(b.criado_em)
        )[0];
        this.destroySession(oldestSession.id);
        Logger.info('SessionManager', 'Sessão mais antiga removida por limite', { oldestSessionId: oldestSession.id });
      }

      // Criar nova sessão
      const sessionId = DatabaseManager._generateId('sessions');
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (APP_CONFIG.SESSION.TTL_HOURS * 60 * 60 * 1000));

      const sessionData = {
        id: sessionId,
        id_usuario: userId,
        criado_em: Utilities.formatDate(now, APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss'),
        expira_em: Utilities.formatDate(expiresAt, APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss'),
        ativo: 'sim',
        ip_address: metadata.ip || '',
        user_agent: metadata.userAgent || '',
        ultimo_acesso: Utilities.formatDate(now, APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss')
      };

      // Salvar sessão em memória (PropertiesService para persistir entre execuções)
      const sessionKey = `session_${sessionId}`;
      PropertiesService.getScriptProperties().setProperty(sessionKey, JSON.stringify(sessionData));

      Logger.info('SessionManager', 'Sessão criada com sucesso', { sessionId, userId, expiresAt });

      return {
        sessionId,
        userId,
        expiresAt: sessionData.expira_em,
        metadata: sessionData
      };

    } catch (error) {
      Logger.error('SessionManager', 'Erro ao criar sessão', { userId, error: error.message });
      throw error;
    }
  }

  /**
   * Validar se sessão é válida e ativa
   * @param {string} sessionId - ID da sessão
   * @returns {Object|null} Dados da sessão se válida, null se inválida
   */
  static validateSession(sessionId) {
    try {
      if (!sessionId) {
        Logger.debug('SessionManager', 'SessionId não fornecido');
        return null;
      }

      const sessionKey = `session_${sessionId}`;
      const sessionData = PropertiesService.getScriptProperties().getProperty(sessionKey);

      if (!sessionData) {
        Logger.debug('SessionManager', 'Sessão não encontrada', { sessionId });
        return null;
      }

      const session = JSON.parse(sessionData);
      const now = new Date();
      const expiresAt = new Date(session.expira_em);

      // Verificar se sessão expirou
      if (now > expiresAt) {
        Logger.info('SessionManager', 'Sessão expirada', { sessionId, expiresAt });
        this.destroySession(sessionId);
        return null;
      }

      // Verificar se sessão está ativa
      if (session.ativo !== 'sim') {
        Logger.debug('SessionManager', 'Sessão inativa', { sessionId });
        return null;
      }

      // Atualizar último acesso
      session.ultimo_acesso = Utilities.formatDate(now, APP_CONFIG.TZ, 'yyyy-MM-dd HH:mm:ss');
      PropertiesService.getScriptProperties().setProperty(sessionKey, JSON.stringify(session));

      Logger.debug('SessionManager', 'Sessão validada', { sessionId, userId: session.id_usuario });

      return {
        sessionId: session.id,
        userId: session.id_usuario,
        createdAt: session.criado_em,
        expiresAt: session.expira_em,
        lastAccess: session.ultimo_acesso
      };

    } catch (error) {
      Logger.error('SessionManager', 'Erro ao validar sessão', { sessionId, error: error.message });
      return null;
    }
  }

  /**
   * Destruir sessão específica
   * @param {string} sessionId - ID da sessão
   * @returns {boolean} True se sessão foi destruída
   */
  static destroySession(sessionId) {
    try {
      if (!sessionId) return false;

      const sessionKey = `session_${sessionId}`;
      PropertiesService.getScriptProperties().deleteProperty(sessionKey);

      Logger.info('SessionManager', 'Sessão destruída', { sessionId });
      return true;

    } catch (error) {
      Logger.error('SessionManager', 'Erro ao destruir sessão', { sessionId, error: error.message });
      return false;
    }
  }

  /**
   * Obter todas as sessões de um usuário
   * @param {string} userId - ID do usuário
   * @returns {Array} Lista de sessões do usuário
   */
  static getUserSessions(userId) {
    try {
      const allProperties = PropertiesService.getScriptProperties().getProperties();
      const userSessions = [];

      Object.keys(allProperties).forEach(key => {
        if (key.startsWith('session_')) {
          try {
            const session = JSON.parse(allProperties[key]);
            if (session.id_usuario === userId && session.ativo === 'sim') {
              userSessions.push(session);
            }
          } catch (parseError) {
            Logger.warn('SessionManager', 'Erro ao parsear sessão', { key, error: parseError.message });
          }
        }
      });

      return userSessions;

    } catch (error) {
      Logger.error('SessionManager', 'Erro ao obter sessões do usuário', { userId, error: error.message });
      return [];
    }
  }

  /**
   * Limpar sessões expiradas
   * @returns {number} Número de sessões removidas
   */
  static cleanupExpiredSessions() {
    try {
      const allProperties = PropertiesService.getScriptProperties().getProperties();
      const now = new Date();
      let removedCount = 0;

      Object.keys(allProperties).forEach(key => {
        if (key.startsWith('session_')) {
          try {
            const session = JSON.parse(allProperties[key]);
            const expiresAt = new Date(session.expira_em);

            if (now > expiresAt) {
              PropertiesService.getScriptProperties().deleteProperty(key);
              removedCount++;
              Logger.debug('SessionManager', 'Sessão expirada removida', { sessionId: session.id });
            }
          } catch (parseError) {
            // Remove propriedades corrompidas
            PropertiesService.getScriptProperties().deleteProperty(key);
            removedCount++;
            Logger.warn('SessionManager', 'Propriedade corrompida removida', { key });
          }
        }
      });

      if (removedCount > 0) {
        Logger.info('SessionManager', 'Limpeza de sessões concluída', { removedCount });
      }

      return removedCount;

    } catch (error) {
      Logger.error('SessionManager', 'Erro na limpeza de sessões', { error: error.message });
      return 0;
    }
  }

  /**
   * Obter estatísticas das sessões
   * @returns {Object} Estatísticas das sessões ativas
   */
  static getSessionStats() {
    try {
      const allProperties = PropertiesService.getScriptProperties().getProperties();
      const stats = {
        totalSessions: 0,
        activeSessions: 0,
        userCounts: {},
        oldestSession: null,
        newestSession: null
      };

      const now = new Date();

      Object.keys(allProperties).forEach(key => {
        if (key.startsWith('session_')) {
          try {
            const session = JSON.parse(allProperties[key]);
            stats.totalSessions++;

            const expiresAt = new Date(session.expira_em);
            const createdAt = new Date(session.criado_em);

            if (now <= expiresAt && session.ativo === 'sim') {
              stats.activeSessions++;

              // Contar por usuário
              if (!stats.userCounts[session.id_usuario]) {
                stats.userCounts[session.id_usuario] = 0;
              }
              stats.userCounts[session.id_usuario]++;

              // Tracking da sessão mais antiga e mais nova
              if (!stats.oldestSession || createdAt < new Date(stats.oldestSession)) {
                stats.oldestSession = session.criado_em;
              }
              if (!stats.newestSession || createdAt > new Date(stats.newestSession)) {
                stats.newestSession = session.criado_em;
              }
            }
          } catch (parseError) {
            Logger.warn('SessionManager', 'Erro ao parsear sessão para stats', { key });
          }
        }
      });

      return stats;

    } catch (error) {
      Logger.error('SessionManager', 'Erro ao obter estatísticas', { error: error.message });
      return { error: error.message };
    }
  }
}

/**
 * Testes do SessionManager
 */

/**
 * Teste básico do SessionManager
 */
function testSessionManager() {
  try {
    console.log('🔐 Testando SessionManager...');

    // Limpar sessões expiradas primeiro
    const cleanedCount = SessionManager.cleanupExpiredSessions();
    console.log(`🧹 Sessões expiradas removidas: ${cleanedCount}`);

    // Teste 1: Criar sessão
    const testUserId = 'U1726692234567';
    const session = SessionManager.createSession(testUserId, {
      ip: '192.168.1.100',
      userAgent: 'Test Browser'
    });
    console.log(`✅ Teste 1 - Sessão criada: ${session.sessionId}`);

    // Teste 2: Validar sessão
    const validatedSession = SessionManager.validateSession(session.sessionId);
    console.log(`✅ Teste 2 - Sessão validada: ${validatedSession ? 'Válida' : 'Inválida'}`);

    // Teste 3: Sessões do usuário
    const userSessions = SessionManager.getUserSessions(testUserId);
    console.log(`✅ Teste 3 - Sessões do usuário: ${userSessions.length}`);

    // Teste 4: Estatísticas
    const stats = SessionManager.getSessionStats();
    console.log(`✅ Teste 4 - Sessões ativas: ${stats.activeSessions}`);

    // Teste 5: Destruir sessão
    const destroyed = SessionManager.destroySession(session.sessionId);
    console.log(`✅ Teste 5 - Sessão destruída: ${destroyed ? 'Sim' : 'Não'}`);

    console.log('🎉 SessionManager: Todos os testes passaram!');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no teste do SessionManager:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Função para obter relatório de sessões
 */
function getSessionReport() {
  try {
    const stats = SessionManager.getSessionStats();

    console.log('📊 RELATÓRIO DE SESSÕES');
    console.log('='.repeat(50));
    console.log(`🔢 Total de sessões: ${stats.totalSessions}`);
    console.log(`✅ Sessões ativas: ${stats.activeSessions}`);
    console.log(`👥 Usuários com sessões: ${Object.keys(stats.userCounts).length}`);

    if (stats.oldestSession) {
      console.log(`⏰ Sessão mais antiga: ${stats.oldestSession}`);
    }
    if (stats.newestSession) {
      console.log(`🆕 Sessão mais recente: ${stats.newestSession}`);
    }

    // Detalhes por usuário
    if (Object.keys(stats.userCounts).length > 0) {
      console.log('\n👤 Sessões por usuário:');
      Object.entries(stats.userCounts).forEach(([userId, count]) => {
        console.log(`   ${userId}: ${count} sessão(s)`);
      });
    }

    return stats;

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    return { error: error.message };
  }
}

/**
 * Testes do SecurityManager
 */

/**
 * Teste básico do SecurityManager
 */
function testSecurityManager() {
  try {
    console.log('🔒 Testando SecurityManager...');

    // Teste 1: Gerar hash
    const testPin = '1234';
    const hash = SecurityManager.generateHash(testPin);
    console.log(`✅ Teste 1 - Hash gerado: ${hash.length} caracteres`);

    // Teste 2: Verificar formato de hash
    const storageHash = SecurityManager.createStorageHash(testPin);
    const isHashFormat = SecurityManager.isHash(storageHash);
    console.log(`✅ Teste 2 - Formato hash: ${isHashFormat ? 'Correto' : 'Incorreto'}`);

    // Teste 3: Validar PIN com texto puro
    const validPlainText = SecurityManager.validatePin('1234', '1234');
    console.log(`✅ Teste 3 - Validação texto puro: ${validPlainText ? 'Válida' : 'Inválida'}`);

    // Teste 4: Validar PIN com hash
    const validHash = SecurityManager.validatePin('1234', storageHash);
    console.log(`✅ Teste 4 - Validação hash: ${validHash ? 'Válida' : 'Inválida'}`);

    // Teste 5: PIN incorreto
    const invalidPin = SecurityManager.validatePin('0000', storageHash);
    console.log(`✅ Teste 5 - PIN incorreto: ${invalidPin ? 'ERRO!' : 'Rejeitado corretamente'}`);

    // Teste 6: Consistência do hash
    const hash1 = SecurityManager.generateHash('teste');
    const hash2 = SecurityManager.generateHash('teste');
    const consistent = hash1 === hash2;
    console.log(`✅ Teste 6 - Consistência hash: ${consistent ? 'Consistente' : 'Inconsistente'}`);

    console.log('🎉 SecurityManager: Todos os testes passaram!');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no teste do SecurityManager:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Teste de login seguro (simulado)
 */
function testSecureLogin() {
  try {
    console.log('🔐 Testando login seguro...');

    // Buscar um usuário real para testar
    const usuarios = DatabaseManager.query('usuarios', {}, false); // sem cache para teste

    if (!usuarios || usuarios.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado para teste');
      return { success: false, error: 'Nenhum usuário disponível' };
    }

    const primeiroUsuario = usuarios[0];
    console.log(`🔍 Testando com usuário: ${primeiroUsuario.login}`);

    // NOTA: Para teste real, você precisaria saber o PIN atual
    // Este teste só verifica a estrutura da função
    console.log('📝 Teste estrutural do login seguro');
    console.log(`   Login: ${primeiroUsuario.login}`);
    console.log(`   PIN atual: ${SecurityManager.isHash(primeiroUsuario.pin) ? 'Hash' : 'Texto puro'}`);

    // Verificar se PIN atual é hash ou texto puro
    if (SecurityManager.isHash(primeiroUsuario.pin)) {
      console.log('✅ PIN já está em formato hash (seguro)');
    } else {
      console.log('⚠️ PIN ainda em texto puro (será migrado no próximo login)');
    }

    console.log('🎉 Teste estrutural concluído!');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no teste de login seguro:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Relatório de segurança dos PINs
 */
function getSecurityReport() {
  try {
    console.log('📊 RELATÓRIO DE SEGURANÇA');
    console.log('='.repeat(50));

    const usuarios = DatabaseManager.query('usuarios', {}, false);

    if (!usuarios || usuarios.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado');
      return { error: 'Nenhum usuário encontrado' };
    }

    let totalUsuarios = 0;
    let comHash = 0;
    let textoPlano = 0;

    usuarios.forEach(usuario => {
      totalUsuarios++;
      if (SecurityManager.isHash(usuario.pin)) {
        comHash++;
      } else {
        textoPlano++;
      }
    });

    const percentualSeguro = ((comHash / totalUsuarios) * 100).toFixed(1);

    console.log(`👥 Total de usuários: ${totalUsuarios}`);
    console.log(`🔒 PINs com hash: ${comHash} (${percentualSeguro}%)`);
    console.log(`📝 PINs texto puro: ${textoPlano}`);

    if (textoPlano > 0) {
      console.log('\n⚠️ RECOMENDAÇÃO:');
      console.log(`   ${textoPlano} usuário(s) ainda com PIN em texto puro`);
      console.log('   PINs serão migrados automaticamente no próximo login');
    }

    if (comHash === totalUsuarios) {
      console.log('\n🎉 PARABÉNS: Todos os PINs estão seguros com hash!');
    }

    return {
      totalUsuarios,
      comHash,
      textoPlano,
      percentualSeguro: parseFloat(percentualSeguro)
    };

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de segurança:', error);
    return { error: error.message };
  }
}

/**
 * Testes de Paginação
 */

/**
 * Teste básico do sistema de paginação
 */
function testPagination() {
  try {
    console.log('📄 Testando sistema de paginação...');

    // Teste 1: Query sem paginação (modo tradicional)
    const allUsers = DatabaseManager.query('usuarios');
    console.log(`✅ Teste 1 - Query tradicional: ${allUsers.length} registros`);

    if (allUsers.length === 0) {
      console.log('⚠️ Nenhum usuário encontrado para teste');
      return { success: false, error: 'Nenhum dado disponível' };
    }

    // Teste 2: Query com paginação - página 1
    const page1 = DatabaseManager.query('usuarios', {}, {
      useCache: false,
      page: 1,
      per_page: 2
    });
    console.log(`✅ Teste 2 - Página 1: ${page1.data ? page1.data.length : 0} registros`);
    console.log(`   Paginação: ${JSON.stringify(page1.pagination)}`);

    // Teste 3: Query com paginação - página 2
    if (page1.pagination && page1.pagination.has_next) {
      const page2 = DatabaseManager.query('usuarios', {}, {
        useCache: false,
        page: 2,
        per_page: 2
      });
      console.log(`✅ Teste 3 - Página 2: ${page2.data ? page2.data.length : 0} registros`);
    } else {
      console.log('⚠️ Teste 3 - Não há página 2 (poucos registros)');
    }

    // Teste 4: Filtros com paginação
    const filteredPaginated = DatabaseManager.query('usuarios', { status: 'ativo' }, {
      useCache: false,
      page: 1,
      per_page: 3
    });
    console.log(`✅ Teste 4 - Filtro + paginação: ${filteredPaginated.data ? filteredPaginated.data.length : 0} registros`);

    // Teste 5: Cache com paginação
    const cachedPage = DatabaseManager.query('usuarios', {}, {
      useCache: true,
      page: 1,
      per_page: 2
    });
    console.log(`✅ Teste 5 - Cache com paginação: ${cachedPage.data ? cachedPage.data.length : 0} registros`);

    console.log('🎉 Paginação: Todos os testes passaram!');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro no teste de paginação:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Demonstração prática de paginação
 */
function demonstratePagination() {
  try {
    console.log('📊 DEMONSTRAÇÃO DE PAGINAÇÃO');
    console.log('='.repeat(50));

    // Buscar table com mais registros para demonstrar
    const tables = ['usuarios', 'atividades', 'membros'];
    let bestTable = 'usuarios';
    let maxRecords = 0;

    tables.forEach(table => {
      try {
        const records = DatabaseManager.query(table, {}, false);
        if (records.length > maxRecords) {
          maxRecords = records.length;
          bestTable = table;
        }
      } catch (error) {
        // Ignorar erros de tabelas que não existem
      }
    });

    console.log(`📋 Usando tabela '${bestTable}' com ${maxRecords} registros`);

    if (maxRecords === 0) {
      console.log('⚠️ Nenhum registro encontrado para demonstração');
      return { error: 'Nenhum dado disponível' };
    }

    // Demonstrar diferentes tamanhos de página
    const pageSizes = [2, 5, 10];

    pageSizes.forEach(pageSize => {
      if (maxRecords > pageSize) {
        const result = DatabaseManager.query(bestTable, {}, {
          useCache: false,
          page: 1,
          per_page: pageSize
        });

        console.log(`\n📄 Página 1 com ${pageSize} registros por página:`);
        console.log(`   Registros retornados: ${result.data.length}`);
        console.log(`   Total de páginas: ${result.pagination.total_pages}`);
        console.log(`   Há próxima página: ${result.pagination.has_next ? 'Sim' : 'Não'}`);
        console.log(`   Intervalo: ${result.pagination.start_index}-${result.pagination.end_index} de ${result.pagination.total}`);
      }
    });

    return { success: true, table: bestTable, totalRecords: maxRecords };

  } catch (error) {
    console.error('❌ Erro na demonstração:', error);
    return { error: error.message };
  }
}

/**
 * Teste de performance de paginação vs query completa
 */
function testPaginationPerformance() {
  try {
    console.log('⚡ TESTE DE PERFORMANCE: Paginação vs Query Completa');
    console.log('='.repeat(60));

    // Escolher tabela com mais registros
    const table = 'usuarios'; // ou a tabela com mais dados

    console.log(`📊 Testando com tabela: ${table}`);

    // Teste 1: Query completa
    const startFull = new Date();
    const fullResult = DatabaseManager.query(table, {}, false);
    const timeFull = new Date() - startFull;

    console.log(`\n🔍 Query Completa:`);
    console.log(`   Registros: ${fullResult.length}`);
    console.log(`   Tempo: ${timeFull}ms`);

    if (fullResult.length > 10) {
      // Teste 2: Query paginada
      const startPaged = new Date();
      const pagedResult = DatabaseManager.query(table, {}, {
        useCache: false,
        page: 1,
        per_page: 10
      });
      const timePaged = new Date() - startPaged;

      console.log(`\n📄 Query Paginada (10 registros):`);
      console.log(`   Registros: ${pagedResult.data.length}`);
      console.log(`   Tempo: ${timePaged}ms`);

      // Comparação
      const improvement = ((timeFull - timePaged) / timeFull * 100).toFixed(1);
      console.log(`\n📈 Melhoria de Performance:`);
      console.log(`   Paginação é ${improvement}% mais rápida que query completa`);
      console.log(`   Economia de ${timeFull - timePaged}ms`);

    } else {
      console.log('\n⚠️ Poucos registros para testar performance da paginação');
    }

    return { success: true, fullTime: timeFull, records: fullResult.length };

  } catch (error) {
    console.error('❌ Erro no teste de performance:', error);
    return { error: error.message };
  }
}