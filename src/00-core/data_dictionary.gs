/**
 * Sistema Dojotai V2.0 - Dicionário de Dados
 * Criado: 18/09/2025
 * Define estrutura padrão de todas as tabelas do sistema
 */

/**
 * DICIONÁRIO COMPLETO DE DADOS
 * Baseado na estrutura real do sistema atual
 */
const DATA_DICTIONARY = {

  // ===========================================
  // TABELA: USUARIOS
  // ===========================================
  usuarios: {
    tableName: 'usuarios',
    description: 'Usuários do sistema com diferentes papéis',
    primaryKey: 'id',
    uniqueKey: 'uid',

    fields: {
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'U{timestamp}', // Ex: U1726692234567
        description: 'ID único do usuário',
        generated: true
      },
      uid: {
        type: 'TEXT',
        required: true,
        pattern: 'U{timestamp}', // Ex: U1726692234567 (mesmo que ID)
        description: 'UID único do usuário (legado)',
        generated: true
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Nome completo do usuário'
      },
      login: {
        type: 'TEXT',
        required: true,
        unique: true,
        maxLength: 50,
        description: 'Login único para acesso'
      },
      pin: {
        type: 'TEXT',
        required: true,
        minLength: 4,
        description: 'PIN de acesso (criptografado)'
      },
      papel: {
        type: 'TEXT',
        required: true,
        enum: ['Admin', 'Secretaria', 'Líder', 'Usuário'],
        default: 'Usuário',
        description: 'Papel/permissão do usuário'
      },
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo',
        description: 'Status do usuário'
      },
      criado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora de criação'
      },
      created_at: {
        type: 'DATETIME',
        required: true,
        format: 'ISO',
        generated: true,
        description: 'Timestamp ISO de criação (V2)'
      }
    }
  },

  // ===========================================
  // TABELA: ATIVIDADES
  // ===========================================
  atividades: {
    tableName: 'atividades',
    description: 'Atividades do dojo (treinos, eventos, avaliações)',
    primaryKey: 'id',

    fields: {
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'ACT-{timestamp}{random}', // Ex: ACT-202509180001
        description: 'ID único da atividade',
        generated: true
      },
      titulo: {
        type: 'TEXT',
        required: true,
        maxLength: 200,
        description: 'Título da atividade'
      },
      descricao: {
        type: 'TEXT',
        required: false,
        maxLength: 1000,
        description: 'Descrição detalhada da atividade'
      },
      data: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        description: 'Data de realização da atividade'
      },
      categoria_atividade_id: {
        type: 'TEXT',
        required: false,
        foreignKey: 'categoria_atividades.id',
        description: 'ID da categoria da atividade'
      },
      atribuido_uid: {
        type: 'TEXT',
        required: false,
        foreignKey: 'usuarios.uid',
        description: 'UID do responsável pela atividade'
      },
      criado_por: {
        type: 'TEXT',
        required: true,
        foreignKey: 'usuarios.uid',
        description: 'UID de quem criou a atividade'
      },
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Planejada', 'Em Andamento', 'Concluída', 'Cancelada'],
        default: 'Planejada',
        description: 'Status da atividade'
      },
      criado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora de criação'
      }
    }
  },

  // ===========================================
  // TABELA: MEMBROS
  // ===========================================
  membros: {
    tableName: 'membros',
    description: 'Membros do dojo (praticantes)',
    primaryKey: 'id',

    fields: {
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'M{timestamp}', // Ex: M1726692234567
        description: 'ID único do membro',
        generated: true
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Nome completo do membro'
      },
      cpf: {
        type: 'TEXT',
        required: false,
        pattern: '\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}',
        description: 'CPF do membro'
      },
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Ativo', 'Inativo', 'Licenciado'],
        default: 'Ativo',
        description: 'Status do membro'
      },
      categoria: {
        type: 'TEXT',
        required: false,
        description: 'Categoria do membro (Infantil, Juvenil, Adulto)'
      },
      grau: {
        type: 'TEXT',
        required: false,
        description: 'Grau/graduação do membro'
      },
      criado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora de criação'
      }
    }
  },

  // ===========================================
  // TABELA: PARTICIPACOES
  // ===========================================
  participacoes: {
    tableName: 'participacoes',
    description: 'Participações de membros em atividades',
    primaryKey: 'id',

    fields: {
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'P{timestamp}', // Ex: P1726692234567
        description: 'ID único da participação',
        generated: true
      },
      id_atividade: {
        type: 'TEXT',
        required: true,
        foreignKey: 'atividades.id',
        description: 'ID da atividade'
      },
      id_membro: {
        type: 'TEXT',
        required: true,
        foreignKey: 'membros.id',
        description: 'ID do membro'
      },
      tipo: {
        type: 'TEXT',
        required: true,
        enum: ['alvo', 'confirmado', 'participante'],
        description: 'Tipo de participação'
      },
      confirmou: {
        type: 'BOOLEAN',
        required: false,
        description: 'Se o membro confirmou presença'
      },
      participou: {
        type: 'BOOLEAN',
        required: false,
        description: 'Se o membro realmente participou'
      },
      chegou_tarde: {
        type: 'BOOLEAN',
        required: false,
        description: 'Se o membro chegou atrasado'
      },
      saiu_cedo: {
        type: 'BOOLEAN',
        required: false,
        description: 'Se o membro saiu antes do fim'
      },
      marcado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora de marcação'
      },
      marcado_por: {
        type: 'TEXT',
        required: false,
        foreignKey: 'usuarios.uid',
        description: 'UID de quem marcou a participação'
      }
    }
  },

  // ===========================================
  // TABELA: CATEGORIA_ATIVIDADES
  // ===========================================
  categoria_atividades: {
    tableName: 'categoria_atividades',
    description: 'Categorias de atividades do dojo',
    primaryKey: 'id',

    fields: {
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'CAT-{counter}', // Ex: CAT-001, CAT-002
        description: 'ID único da categoria',
        generated: true
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Nome da categoria'
      },
      descricao: {
        type: 'TEXT',
        required: false,
        maxLength: 500,
        description: 'Descrição da categoria'
      },
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo',
        description: 'Status da categoria'
      }
    }
  }
};

/**
 * Obter dicionário de uma tabela específica
 * Prioridade: 1. Planilha "Dicionario", 2. Arquivo local
 * @param {string} tableName - Nome da tabela
 * @returns {Object|null} Dicionário da tabela
 */
function getTableDictionary(tableName) {
  try {
    // Tentar carregar da planilha primeiro
    const fromSheet = getTableDictionaryFromSheet(tableName);
    if (fromSheet) {
      return fromSheet;
    }
  } catch (error) {
    console.warn('⚠️ Erro ao carregar dicionário da planilha, usando arquivo:', error.message);
  }

  // Fallback para dicionário local
  return DATA_DICTIONARY[tableName] || null;
}

/**
 * Carregar dicionário de uma tabela da planilha "Dicionario"
 * @param {string} tableName - Nome da tabela
 * @returns {Object|null} Dicionário da tabela
 */
function getTableDictionaryFromSheet(tableName) {
  try {
    // Buscar dados da tabela "dicionario"
    const dictionaryData = DatabaseManager.query('dicionario', {
      tabela: tableName,
      status: 'Ativo'
    }, true);

    if (!dictionaryData || dictionaryData.length === 0) {
      return null;
    }

    // Converter dados da planilha para formato do dicionário
    const tableDict = {
      tableName: tableName,
      description: `Tabela ${tableName} (carregada da planilha)`,
      primaryKey: 'id',
      fields: {}
    };

    dictionaryData.forEach(row => {
      const fieldName = row.campo;

      tableDict.fields[fieldName] = {
        type: row.tipo || 'TEXT',
        required: (row.obrigatorio || '').toLowerCase() === 'sim',
        description: row.description || '',
        generated: (row.generated || '').toLowerCase() === 'sim'
      };

      // Adicionar propriedades opcionais se presentes
      if (row.default) {
        tableDict.fields[fieldName].default = row.default;
      }

      if (row.enum_values) {
        tableDict.fields[fieldName].enum = row.enum_values.split(',').map(v => v.trim());
      }

      if (row.max_length) {
        tableDict.fields[fieldName].maxLength = parseInt(row.max_length);
      }

      if (row.min_length) {
        tableDict.fields[fieldName].minLength = parseInt(row.min_length);
      }

      if (row.pattern) {
        tableDict.fields[fieldName].pattern = row.pattern;
      }

      if (row.foreign_key) {
        tableDict.fields[fieldName].foreignKey = row.foreign_key;
      }
    });

    console.log(`📊 Dicionário de ${tableName} carregado da planilha com ${Object.keys(tableDict.fields).length} campos`);
    return tableDict;

  } catch (error) {
    console.warn(`⚠️ Erro ao carregar dicionário de ${tableName} da planilha:`, error);
    return null;
  }
}

/**
 * Obter definição de um campo específico
 * @param {string} tableName - Nome da tabela
 * @param {string} fieldName - Nome do campo
 * @returns {Object|null} Definição do campo
 */
function getFieldDefinition(tableName, fieldName) {
  const table = DATA_DICTIONARY[tableName];
  return table?.fields?.[fieldName] || null;
}

/**
 * Validar dados contra o dicionário
 * @param {string} tableName - Nome da tabela
 * @param {Object} data - Dados a validar
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateAgainstDictionary(tableName, data) {
  const table = DATA_DICTIONARY[tableName];
  if (!table) {
    return { valid: false, errors: [`Tabela ${tableName} não encontrada no dicionário`] };
  }

  const errors = [];

  // Verificar campos obrigatórios
  Object.keys(table.fields).forEach(fieldName => {
    const field = table.fields[fieldName];

    if (field.required && !field.generated) {
      if (data[fieldName] === undefined || data[fieldName] === null || data[fieldName] === '') {
        errors.push(`Campo '${fieldName}' é obrigatório`);
      }
    }

    // Validar enums
    if (field.enum && data[fieldName] && !field.enum.includes(data[fieldName])) {
      errors.push(`Campo '${fieldName}' deve ser um de: ${field.enum.join(', ')}`);
    }

    // Validar tamanho máximo
    if (field.maxLength && data[fieldName] && data[fieldName].length > field.maxLength) {
      errors.push(`Campo '${fieldName}' não pode ter mais que ${field.maxLength} caracteres`);
    }

    // Validar tamanho mínimo
    if (field.minLength && data[fieldName] && data[fieldName].length < field.minLength) {
      errors.push(`Campo '${fieldName}' deve ter pelo menos ${field.minLength} caracteres`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Obter campos que devem ser gerados automaticamente
 * @param {string} tableName - Nome da tabela
 * @returns {string[]} Lista de campos gerados automaticamente
 */
function getGeneratedFields(tableName) {
  const table = DATA_DICTIONARY[tableName];
  if (!table) return [];

  return Object.keys(table.fields).filter(fieldName => {
    return table.fields[fieldName].generated === true;
  });
}

/**
 * Obter valores padrão para uma tabela
 * @param {string} tableName - Nome da tabela
 * @returns {Object} Objeto com valores padrão
 */
function getDefaultValues(tableName) {
  const table = getTableDictionary(tableName);
  if (!table) return {};

  const defaults = {};

  Object.keys(table.fields || {}).forEach(fieldName => {
    const field = table.fields[fieldName];
    if (field.default !== undefined) {
      defaults[fieldName] = field.default;
    }
  });

  return defaults;
}

/**
 * UTILITÁRIO: Migrar dicionário do arquivo para planilha
 * Execute UMA VEZ para popular a planilha "dicionario"
 */
function migrateDictionaryToSheet() {
  try {
    console.log('📊 Migrando dicionário do arquivo para planilha...');

    const results = [];

    Object.keys(DATA_DICTIONARY).forEach(tableName => {
      const table = DATA_DICTIONARY[tableName];

      Object.keys(table.fields).forEach(fieldName => {
        const field = table.fields[fieldName];

        const row = {
          tabela: tableName,
          campo: fieldName,
          tipo: field.type || 'TEXT',
          obrigatorio: field.required ? 'sim' : 'não',
          default: field.default || '',
          enum_values: field.enum ? field.enum.join(', ') : '',
          max_length: field.maxLength || '',
          min_length: field.minLength || '',
          pattern: field.pattern || '',
          description: field.description || '',
          generated: field.generated ? 'sim' : 'não',
          foreign_key: field.foreignKey || '',
          status: 'Ativo'
        };

        const insertResult = DatabaseManager.insert('dicionario', row);

        if (insertResult.success) {
          results.push(`✅ ${tableName}.${fieldName}`);
        } else {
          results.push(`❌ ${tableName}.${fieldName}: ${insertResult.error}`);
          console.error(`Erro ao inserir ${tableName}.${fieldName}:`, insertResult.error);
        }
      });
    });

    console.log('\n📊 Resultados da migração:');
    results.forEach(result => console.log(result));

    const successCount = results.filter(r => r.startsWith('✅')).length;
    const totalCount = results.length;

    console.log(`\n🎯 Migração concluída: ${successCount}/${totalCount} campos migrados`);

    return {
      success: successCount === totalCount,
      results,
      summary: `${successCount}/${totalCount}`
    };

  } catch (error) {
    console.error('❌ Erro na migração do dicionário:', error);
    return { success: false, error: error.message };
  }
}

/**
 * UTILITÁRIO: Testar se dicionário da planilha funciona
 */
function testDictionaryFromSheet() {
  try {
    console.log('🧪 Testando dicionário da planilha...');

    const tables = ['usuarios', 'atividades', 'membros'];
    const results = [];

    tables.forEach(tableName => {
      console.log(`\n📋 Testando ${tableName}:`);

      // Testar carregamento da planilha
      const fromSheet = getTableDictionaryFromSheet(tableName);
      const fromFile = DATA_DICTIONARY[tableName];

      if (fromSheet) {
        const sheetFields = Object.keys(fromSheet.fields).length;
        const fileFields = Object.keys(fromFile.fields).length;

        console.log(`   Planilha: ${sheetFields} campos`);
        console.log(`   Arquivo: ${fileFields} campos`);

        const match = sheetFields === fileFields;
        console.log(`   Compatível: ${match ? '✅' : '❌'}`);

        results.push({
          table: tableName,
          sheetFields,
          fileFields,
          compatible: match
        });
      } else {
        console.log(`   ❌ Não encontrado na planilha`);
        results.push({
          table: tableName,
          compatible: false,
          error: 'Não encontrado na planilha'
        });
      }
    });

    const compatibleTables = results.filter(r => r.compatible).length;
    console.log(`\n🎯 Compatibilidade: ${compatibleTables}/${results.length} tabelas`);

    return {
      success: compatibleTables === results.length,
      results
    };

  } catch (error) {
    console.error('❌ Erro no teste do dicionário:', error);
    return { success: false, error: error.message };
  }
}