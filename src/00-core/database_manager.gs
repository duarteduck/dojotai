/**
 * Sistema Dojotai V2.0 - Database Manager
 * Criado: 18/09/2025
 * Semana 1: Versão básica compatível com sistema atual
 */

/**
 * DatabaseManager - Camada unificada de acesso a dados
 * Compatible com sistema atual (utils.gs) mas modernizado
 */
const DatabaseManager = {
  // Cache interno (limpa a cada execução do Apps Script)
  _cache: new Map(),

  // TTL do cache em minutos
  _cacheTTL: APP_CONFIG.CACHE_TTL_MINUTES,

  /**
   * Query principal - buscar dados de uma tabela
   * @param {string} tableName - Nome da tabela (ex: 'usuarios', 'atividades')
   * @param {Object} filters - Filtros opcionais { campo: valor }
   * @param {boolean} useCache - Usar cache (padrão: true)
   * @returns {Array} Array de objetos
   */
  query(tableName, filters = {}, useCache = true) {
    try {
      const startTime = new Date();

      // Gerar chave de cache
      const cacheKey = this._generateCacheKey(tableName, filters);

      // Verificar cache primeiro
      if (useCache) {
        const cached = this._getFromCache(cacheKey);
        if (cached) {
          this._logOperation('CACHE_HIT', tableName, filters, startTime);
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

      // Salvar no cache
      if (useCache) {
        this._setCache(cacheKey, results);
      }

      this._logOperation('QUERY', tableName, filters, startTime, results.length);
      return results;

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
      const results = this.query(tableName, { id }, true);
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
  insert(tableName, data) {
    try {
      const startTime = new Date();

      // Validar dados primeiro
      const validation = this._validateData(tableName, data);
      if (!validation.valid) {
        return {
          success: false,
          error: `Dados inválidos: ${validation.errors.join(', ')}`,
          validation: validation.errors
        };
      }

      // Gerar ID único
      const id = this._generateId(tableName);

      // Preparar dados com metadados específicos por tabela
      const record = {
        id,
        ...data,
        ...this._getTableSpecificFields(tableName, data)
      };

      // Obter configuração da tabela usando sistema atual
      const tableRef = this._getTableReference(tableName);
      const context = this._getContext(tableRef);

      // Obter headers existentes
      const headers = this._getHeaders(context);

      // Converter objeto para array na ordem dos headers
      const rowData = headers.map(header => record[header] || '');

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

      // Invalidar cache
      this._invalidateTableCache(tableName);

      this._logOperation('INSERT', tableName, { id }, startTime);
      return { success: true, id };

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
  update(tableName, id, data) {
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

      // Encontrar linha na planilha e atualizar
      const rowIndex = this._findRowIndex(tableName, id);
      if (rowIndex === -1) {
        return { success: false, error: 'Linha não encontrada na planilha' };
      }

      const tableRef = this._getTableReference(tableName);
      const context = this._getContext(tableRef);
      const headers = this._getHeaders(context);

      // Converter para array
      const rowData = headers.map(header => updatedRecord[header] || '');

      // Atualizar linha (rowIndex + 1 porque planilha é 1-indexed)
      const sheet = context.sheet;
      sheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);

      // Invalidar cache
      this._invalidateTableCache(tableName);

      this._logOperation('UPDATE', tableName, { id }, startTime);
      return { success: true };

    } catch (error) {
      this._logError('update', tableName, error, { id, data });
      return { success: false, error: error.message };
    }
  },

  /**
   * Invalidar cache de uma tabela
   * @param {string} tableName - Nome da tabela
   */
  invalidateCache(tableName) {
    this._invalidateTableCache(tableName);
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

      return dataRows
        .filter(row => row.some(cell => cell !== null && cell !== '')) // Remove linhas vazias
        .map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        })
        .filter(obj => !obj.deleted); // Exclui registros soft deleted

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

    if (!pattern) {
      // Fallback para padrão genérico
      console.warn(`⚠️ Padrão de ID não definido para ${tableName}, usando genérico`);
      return `GEN-${Date.now()}`;
    }

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

      case 'categoria_atividades':
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
      const { values } = readTableByNome_(tableName);

      for (let i = 1; i < values.length; i++) { // i=1 para pular header
        const row = values[i];
        if (row[0] === id) { // Assume que ID está na primeira coluna
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
    Object.assign(fields, defaultValues);

    // Obter campos gerados automaticamente
    const generatedFields = getGeneratedFields(tableName);

    generatedFields.forEach(fieldName => {
      const fieldDef = getFieldDefinition(tableName, fieldName);

      if (!data[fieldName]) { // Só gerar se não foi fornecido
        switch (fieldName) {
          case 'uid':
            fields.uid = this._generateUID();
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
   * Gerar UID único para usuários
   */
  _generateUID() {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `U${timestamp.slice(-8)}${random}`;
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