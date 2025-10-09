/**
 * Sistema Dojotai V2.0 - Configuração Central
 *
 * @fileoverview Configurações centralizadas do sistema incluindo cache, logs,
 * sessões, validações e configurações de planilhas.
 *
 * @author Sistema Dojotai Team
 * @version 2.0.0-alpha.1
 * @since 18/09/2025
 */

/**
 * Configuração principal do sistema
 * @type {Object}
 * @constant
 */
const APP_CONFIG = {
  /** @type {string} Versão atual do sistema */
  VERSION: '2.0.0-alpha.1',

  /** @type {string} Timezone padrão (UTC-3 Brasil) */
  TZ: 'America/Sao_Paulo',

  /** @type {number} TTL do cache em minutos */
  CACHE_TTL_MINUTES: 5,

  /** @type {string} Nível de log (DEBUG|INFO|WARN|ERROR) */
  LOG_LEVEL: 'INFO',

  /**
   * Configuração de persistência de logs
   * @type {Object}
   */
  LOG_PERSISTENCE: {
    /** @type {string[]} Níveis que sempre persistem */
    ALWAYS_PERSIST: ['ERROR'],

    /** @type {string[]} Contextos importantes para INFO */
    IMPORTANT_CONTEXTS: [
      'SessionManager',
      'SecurityManager',
      'Application',
      'AuthManager',
      'UserAction',
      'BusinessLogic'
    ],

    /** @type {string[]} Padrões para excluir de WARN */
    WARN_EXCLUDE_PATTERNS: [
      'FK validation failed',
      'validation completed',
      'Cache',
      'Query completed',
      'Insert completed'
    ],

    /** @type {string[]} Contextos que não persistem WARN */
    WARN_EXCLUDE_CONTEXTS: ['ValidationEngine', 'PerformanceMetrics', 'PerformanceMonitor']
  },

  /**
   * Configuração de debug temporário
   * @type {Object}
   */
  DEBUG: {
    /** @type {boolean} Desabilitar todo o sistema de performance temporariamente */
    DISABLE_PERFORMANCE_SYSTEM: true
  },

  /**
   * Configuração de sessões
   * @type {Object}
   */
  SESSION: {
    /** @type {number} Duração da sessão em horas */
    // Sessão estendida automaticamente a cada atividade do usuário
    TTL_HOURS: 4,  // 4 horas - renovado automaticamente em cada operação

    /** @type {number} Intervalo de limpeza em minutos */
    CLEANUP_INTERVAL: 60,

    /** @type {number} Máximo de sessões simultâneas por usuário */
    MAX_SESSIONS_PER_USER: 3
  },

  /**
   * Configuração de validações
   * @type {Object}
   */
  VALIDATION: {
    /** @type {boolean} Validar foreign keys */
    ENABLE_FK_VALIDATION: true,

    /** @type {boolean} Validar regras de negócio */
    ENABLE_BUSINESS_RULES: true,

    /** @type {boolean} Validar pattern, enum, etc */
    ENABLE_ADVANCED_VALIDATION: true,

    /** @type {boolean} Validar campos únicos */
    ENABLE_UNIQUE_CONSTRAINTS: true,

    /** @type {boolean} Falhar operação se validação falhar */
    FAIL_ON_VALIDATION_ERROR: true
  },

  /**
   * Configuração de tags
   * @type {Object}
   */
  TAGS: {
    /** @type {number} Tamanho máximo do campo tags */
    MAX_LENGTH: 200,

    /** @type {string} Separador entre tags */
    SEPARATOR: ',',

    /** @type {boolean} Converter para lowercase */
    NORMALIZE_CASE: true,

    /** @type {boolean} Remover espaços em branco */
    TRIM_WHITESPACE: true,

    /** @type {string} Padrão permitido (regex) */
    ALLOWED_PATTERN: '^[a-zA-Z0-9_,\\s]*$'
  },

  /**
   * Configuração de auditoria/histórico
   * @type {Object}
   */
  AUDIT: {
    /** @type {boolean} Ativar log de auditoria */
    ENABLE_AUDIT_LOG: false,

    /** @type {string[]} Operações para logar */
    LOG_OPERATIONS: ['INSERT', 'UPDATE', 'DELETE'],

    /** @type {number} Dias para manter logs */
    RETENTION_DAYS: 365,

    /** @type {boolean} Incluir dados alterados nos logs */
    INCLUDE_DATA_CHANGES: true
  },

  /**
   * Configuração de notificações (futuro)
   * @type {Object}
   */
  NOTIFICATIONS: {
    /** @type {boolean} Ativar sistema de notificações */
    ENABLE_NOTIFICATIONS: false,

    /** @type {number} Dias para expirar notificações */
    DEFAULT_TTL_DAYS: 30,

    /** @type {number} Máximo de notificações por usuário */
    MAX_NOTIFICATIONS_PER_USER: 50,

    /** @type {boolean} Limpeza automática de notificações expiradas */
    AUTO_CLEANUP: true
  },

  /**
   * Configuração principal de planilhas
   * @type {Object}
   */
  PLANILHAS: {
    /** @type {string} ID da planilha principal de configuração */
    SSID: '1hfl-CeO6nK4FLYl4uacK5NncBoJ3q-8PPzUWh7W6PmY',

    /** @type {string} Named range para configuração */
    NAMED: 'PLANILHA_TBL',

    /** @type {string} Fallback A1 notation */
    A1: 'Planilhas!A1:H'
  },

  /**
   * NOTA: Tabelas são carregadas dinamicamente do DATA_DICTIONARY
   * Use getExistingTables() para obter lista atual
   *
   * Padrões de ID são obtidos automaticamente do DATA_DICTIONARY
   * Cada tabela define seu padrão no campo 'pattern' do seu campo 'id'
   * Ex: pattern: '^PERF-\\d+$' → gera PERF-001, PERF-002, etc.
   */
};

/**
 * Obtém a configuração principal do sistema
 *
 * @description Retorna o objeto de configuração completo do sistema.
 * Compatível com o sistema atual para manter retrocompatibilidade.
 *
 * @returns {Object} Objeto de configuração completo
 * @example
 * const config = getAppConfig();
 * console.log(config.VERSION); // '2.0.0-alpha.1'
 *
 * @since 1.0.0
 */
function getAppConfig() {
  return APP_CONFIG;
}

/**
 * Obtém todas as tabelas disponíveis do dicionário de dados
 *
 * @description Carrega dinamicamente as tabelas do DATA_DICTIONARY.
 * Se o dicionário não estiver disponível, retorna configuração básica.
 *
 * @returns {Object<string, {name: string, description: string}>} Mapa de tabelas disponíveis
 *
 * @example
 * const tables = getExistingTables();
 * console.log(tables.usuarios.name); // 'usuarios'
 * console.log(tables.usuarios.description); // 'Usuários do sistema'
 *
 * @since 2.0.0
 */
function getExistingTables() {
  if (typeof DATA_DICTIONARY === 'undefined') {
    console.warn('⚠️ DATA_DICTIONARY não encontrado, usando configuração básica');
    return {
      usuarios: { name: 'usuarios', description: 'Usuários do sistema' },
      atividades: { name: 'atividades', description: 'Atividades do dojo' },
      membros: { name: 'membros', description: 'Membros do dojo' },
      participacoes: { name: 'participacoes', description: 'Participações em atividades' },
      categorias_atividades: { name: 'categorias_atividades', description: 'Categorias de atividades' },
      menu: { name: 'menu', description: 'Menu dinâmico do sistema' },
      planilhas: { name: 'planilhas', description: 'Configuração de planilhas' }
    };
  }

  const tables = {};
  Object.keys(DATA_DICTIONARY).forEach(key => {
    const tableConfig = DATA_DICTIONARY[key];
    tables[key] = {
      name: tableConfig.tableName || key,
      description: tableConfig.description || 'Tabela do sistema'
    };
  });

  return tables;
}

/**
 * Obtém a configuração de uma tabela específica
 *
 * @description Busca a configuração de uma tabela pelo nome.
 * Retorna null se a tabela não existir.
 *
 * @param {string} tableName - Nome da tabela a buscar
 * @returns {Object|null} Configuração da tabela ou null se não encontrada
 *
 * @example
 * const userTable = getTableConfig('usuarios');
 * if (userTable) {
 *   console.log(userTable.description);
 * }
 *
 * @since 2.0.0
 */
function getTableConfig(tableName) {
  if (!tableName || typeof tableName !== 'string') {
    console.warn('⚠️ getTableConfig: tableName deve ser uma string válida');
    return null;
  }

  const existingTables = getExistingTables();
  return existingTables[tableName] || null;
}

/**
 * Obtém o padrão de ID para uma tabela
 *
 * @description Busca o padrão de ID definido no DATA_DICTIONARY.
 * Retorna padrão genérico se não encontrado.
 *
 * @param {string} tableName - Nome da tabela
 * @returns {Object} Padrão de ID da tabela
 * @returns {string} returns.prefix - Prefixo do ID
 * @returns {string} returns.format - Formato do ID
 * @returns {string} returns.description - Descrição do padrão
 *
 * @example
 * const pattern = getIdPattern('usuarios');
 * console.log(pattern.prefix); // 'USR'
 *
 * @since 2.0.0
 * @deprecated Use DATA_DICTIONARY diretamente para padrões de ID
 */
function getIdPattern(tableName) {
  if (!tableName || typeof tableName !== 'string') {
    console.warn('⚠️ getIdPattern: tableName deve ser uma string válida');
  }

  // Fallback para compatibilidade (APP_CONFIG.ID_PATTERNS não existe mais)
  return {
    prefix: 'GEN',
    format: 'GEN-{timestamp}',
    description: 'ID genérico (deprecated)'
  };
}

/**
 * Log de inicialização do sistema
 *
 * @description Exibe informações básicas sobre a configuração do sistema
 * no console. Útil para debugging e verificação da inicialização.
 *
 * @returns {void}
 *
 * @example
 * logConfigInit();
 * // 🚀 Sistema Dojotai V2.0.0-alpha.1 inicializado
 * // 📊 Tabelas configuradas: 7
 * // 🕒 Timezone: America/Sao_Paulo
 * // 📝 Log Level: INFO
 *
 * @since 2.0.0
 */
function logConfigInit() {
  const existingTables = getExistingTables();
  console.log(`🚀 Sistema Dojotai V${APP_CONFIG.VERSION} inicializado`);
  console.log(`📊 Tabelas configuradas: ${Object.keys(existingTables).length}`);
  console.log(`🕒 Timezone: ${APP_CONFIG.TZ}`);
  console.log(`📝 Log Level: ${APP_CONFIG.LOG_LEVEL}`);
}