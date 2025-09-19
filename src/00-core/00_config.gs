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

  // Configuração principal de planilhas
  PLANILHAS: {
    // ID da planilha principal de configuração
    SSID: '1hfl-CeO6nK4FLYl4uacK5NncBoJ3q-8PPzUWh7W6PmY',

    // Named range para configuração
    NAMED: 'PLANILHA_TBL',

    // Fallback A1 notation
    A1: 'Planilhas!A1:H'
  },

  // Mapeamento de tabelas existentes (Semana 1)
  EXISTING_TABLES: {
    // Tabelas que já existem e vamos usar imediatamente
    usuarios: {
      name: 'usuarios',
      description: 'Usuários do sistema'
    },
    atividades: {
      name: 'atividades',
      description: 'Atividades do dojo'
    },
    membros: {
      name: 'membros',
      description: 'Membros do dojo'
    },
    participacoes: {
      name: 'participacoes',
      description: 'Participações em atividades'
    },
    categoria_atividades: {
      name: 'categoria_atividades',
      description: 'Categorias de atividades'
    },
    menu: {
      name: 'menu',
      description: 'Menu dinâmico do sistema'
    },
    planilhas: {
      name: 'planilhas',
      description: 'Configuração de planilhas'
    },
    dicionario: {
      name: 'dicionario',
      description: 'Dicionário de dados das tabelas (NOVO V2)'
    }
  },

  // Padrões de ID baseados no sistema real
  ID_PATTERNS: {
    usuarios: {
      prefix: 'U',
      format: 'U{timestamp}{random}', // Ex: U437880409339
      description: 'ID de usuário - U + timestamp + random'
    },
    atividades: {
      prefix: 'ACT',
      format: 'ACT-{timestamp}{random}', // Ex: ACT-202509180001
      description: 'ID de atividade - ACT- + timestamp + contador'
    },
    membros: {
      prefix: 'M',
      format: 'M{timestamp}{random}', // Ex: M437880409340
      description: 'ID de membro - M + timestamp + random'
    },
    participacoes: {
      prefix: 'P',
      format: 'P{timestamp}{random}', // Ex: P437880409341
      description: 'ID de participação - P + timestamp + random'
    },
    categoria_atividades: {
      prefix: 'CAT',
      format: 'CAT-{counter}', // Ex: CAT-001, CAT-002
      description: 'ID de categoria - CAT- + contador sequencial'
    },
    menu: {
      prefix: 'MNU',
      format: 'MNU-{counter}', // Ex: MNU-001, MNU-002
      description: 'ID de menu - MNU- + contador sequencial'
    }
  }
};

/**
 * Função para obter configuração
 * Compatível com sistema atual
 */
function getAppConfig() {
  return APP_CONFIG;
}

/**
 * Função para obter configuração de uma tabela específica
 * @param {string} tableName - Nome da tabela
 * @returns {Object|null} Configuração da tabela
 */
function getTableConfig(tableName) {
  return APP_CONFIG.EXISTING_TABLES[tableName] || null;
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
  console.log(`🚀 Sistema Dojotai V${APP_CONFIG.VERSION} inicializado`);
  console.log(`📊 Tabelas configuradas: ${Object.keys(APP_CONFIG.EXISTING_TABLES).length}`);
  console.log(`🕒 Timezone: ${APP_CONFIG.TZ}`);
  console.log(`📝 Log Level: ${APP_CONFIG.LOG_LEVEL}`);
}