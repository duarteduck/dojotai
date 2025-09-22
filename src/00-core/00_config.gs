/**
 * Sistema Dojotai V2.0 - Configuração Central
 * Criado: 18/09/2025
 * Semana 1: Configuração básica e core
 */

const APP_CONFIG = {
  VERSION: '2.0.0-alpha.1',
  TZ: 'America/Sao_Paulo',

  // Configuração de cache
  CACHE_TTL_MINUTES: 5,

  // Configuração de logs
  LOG_LEVEL: 'INFO', // DEBUG, INFO, WARN, ERROR

  // Configuração de sessões
  SESSION: {
    TTL_HOURS: 8,        // 8 horas de duração da sessão
    CLEANUP_INTERVAL: 60, // Limpar sessões expiradas a cada 60 min
    MAX_SESSIONS_PER_USER: 3 // Máximo 3 sessões simultâneas por usuário
  },

  // Configuração de validações
  VALIDATION: {
    ENABLE_FK_VALIDATION: true,     // Validar foreign keys
    ENABLE_BUSINESS_RULES: true,    // Validar regras de negócio
    ENABLE_ADVANCED_VALIDATION: true, // Validar pattern, enum, etc
    ENABLE_UNIQUE_CONSTRAINTS: true,  // Validar campos únicos
    FAIL_ON_VALIDATION_ERROR: true   // Falhar operação se validação falhar
  },

  // Configuração de tags
  TAGS: {
    MAX_LENGTH: 200,              // Tamanho máximo do campo tags
    SEPARATOR: ',',               // Separador entre tags
    NORMALIZE_CASE: true,         // Converter para lowercase
    TRIM_WHITESPACE: true,        // Remover espaços em branco
    ALLOWED_PATTERN: '^[a-zA-Z0-9_,\\s]*$' // Padrão permitido
  },

  // Configuração de auditoria/histórico
  AUDIT: {
    ENABLE_AUDIT_LOG: false,      // Ativar log de auditoria
    LOG_OPERATIONS: ['INSERT', 'UPDATE', 'DELETE'], // Operações para logar
    RETENTION_DAYS: 365,          // Dias para manter logs
    INCLUDE_DATA_CHANGES: true    // Incluir dados alterados nos logs
  },

  // Configuração de notificações (futuro)
  NOTIFICATIONS: {
    ENABLE_NOTIFICATIONS: false,  // Ativar sistema de notificações
    DEFAULT_TTL_DAYS: 30,        // Dias para expirar notificações
    MAX_NOTIFICATIONS_PER_USER: 50, // Máximo de notificações por usuário
    AUTO_CLEANUP: true           // Limpeza automática de notificações expiradas
  },

  // Configuração principal de planilhas
  PLANILHAS: {
    // ID da planilha principal de configuração
    SSID: '1hfl-CeO6nK4FLYl4uacK5NncBoJ3q-8PPzUWh7W6PmY',

    // Named range para configuração
    NAMED: 'PLANILHA_TBL',

    // Fallback A1 notation
    A1: 'Planilhas!A1:H'
  },

  // Tabelas serão carregadas dinamicamente do dicionário
  // Usar getExistingTables() para obter lista atual

  // NOTA: Padrões de ID agora são obtidos automaticamente do DATA_DICTIONARY
  // Cada tabela define seu padrão no campo 'pattern' do seu campo 'id'
  // Ex: pattern: '^PERF-\\d+$' → gera PERF-001, PERF-002, etc.
};

/**
 * Função para obter configuração
 * Compatível com sistema atual
 */
function getAppConfig() {
  return APP_CONFIG;
}

/**
 * Função para obter todas as tabelas do dicionário
 * @returns {Object} Tabelas disponíveis
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
 * Função para obter configuração de uma tabela específica
 * @param {string} tableName - Nome da tabela
 * @returns {Object|null} Configuração da tabela
 */
function getTableConfig(tableName) {
  const existingTables = getExistingTables();
  return existingTables[tableName] || null;
}

/**
 * Função para obter padrão de ID
 * @param {string} tableName - Nome da tabela
 * @returns {Object} Padrão de ID da tabela
 */
function getIdPattern(tableName) {
  return APP_CONFIG.ID_PATTERNS[tableName] || {
    prefix: 'GEN',
    format: 'GEN-{timestamp}',
    description: 'ID genérico'
  };
}

/**
 * Log de inicialização
 */
function logConfigInit() {
  const existingTables = getExistingTables();
  console.log(`🚀 Sistema Dojotai V${APP_CONFIG.VERSION} inicializado`);
  console.log(`📊 Tabelas configuradas: ${Object.keys(existingTables).length}`);
  console.log(`🕒 Timezone: ${APP_CONFIG.TZ}`);
  console.log(`📝 Log Level: ${APP_CONFIG.LOG_LEVEL}`);
}