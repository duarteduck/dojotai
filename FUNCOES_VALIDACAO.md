# INVENTÁRIO COMPLETO DE FUNÇÕES - SISTEMA DOJOTAI V2.0

**Data:** 03/10/2025
**Total de Linhas de Código:** 9.951 linhas
**Arquivos Analisados:** 15 arquivos .gs + 1 arquivo .html

---

## SUMÁRIO EXECUTIVO

### Estatísticas Gerais
- **Total de Funções Identificadas:** 72 funções
- **Funções em Uso (✅):** 52 funções (72%)
- **Funções Não Usadas (❌):** 20 funções (28%)
- **Funções Privadas (_):** 18 funções
- **Funções Públicas/API:** 54 funções

### Distribuição por Camada
- **00-core (Infraestrutura):** 22 funções
- **01-business (Lógica de Negócio):** 31 funções
- **02-api (Endpoints Públicos):** 8 funções
- **05-components (Frontend):** 1 função

---

## 1. CAMADA 00-CORE (INFRAESTRUTURA)

### 1.1 Arquivo: `00_config.gs`

#### ✅ `getAppConfig()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `Object` - Configuração completa do APP_CONFIG
- **Descrição:** Obtém a configuração principal do sistema (versão, timezone, cache, logs, etc.)
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado internamente em diversos módulos para acessar APP_CONFIG

---

#### ✅ `getExistingTables()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `Object<string, {name, description}>` - Mapa de tabelas
- **Descrição:** Carrega dinamicamente todas as tabelas do DATA_DICTIONARY
- **Status:** ✅ EM USO
- **Chamadas:**
  - `logConfigInit()` (linha 323)
  - Usado por módulos que precisam validar existência de tabelas

---

#### ✅ `getTableConfig(tableName)`
- **Tipo:** Pública
- **Parâmetros:**
  - `tableName` (string) - Nome da tabela
- **Retorno:** `Object|null` - Configuração da tabela ou null
- **Descrição:** Busca a configuração de uma tabela específica
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado por DatabaseManager para validar tabelas

---

#### ❌ `getIdPattern(tableName)`
- **Tipo:** Pública (DEPRECATED)
- **Parâmetros:**
  - `tableName` (string) - Nome da tabela
- **Retorno:** `Object` - Padrão de ID genérico
- **Descrição:** Busca o padrão de ID para uma tabela (funcionalidade obsoleta)
- **Status:** ❌ NÃO USADA (DEPRECATED na linha 291)
- **Chamadas:** Nenhuma
- **Motivo:** DatabaseManager gera IDs automaticamente usando DATA_DICTIONARY

---

#### ✅ `logConfigInit()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** void
- **Descrição:** Log de inicialização do sistema com informações de configuração
- **Status:** ✅ EM USO
- **Chamadas:**
  - Executado na inicialização do sistema

---

### 1.2 Arquivo: `database_manager.gs`

**NOTA:** Este arquivo é muito extenso (2865+ linhas). Contém classes principais: Logger, SecurityUtils, ValidationEngine, CacheManager, PerformanceMetrics, DatabaseManager, SecurityManager, TagManager.

#### ✅ Classe `Logger` - Métodos Principais
- `debug(context, message, data)` - ✅ EM USO (logging de debug)
- `info(context, message, data)` - ✅ EM USO (logging de info)
- `warn(context, message, data)` - ✅ EM USO (logging de warnings)
- `error(context, message, data)` - ✅ EM USO (logging de erros)
- `_persistLogSafe(level, context, message, data)` - ✅ EM USO (privado)
- `_insertDirectToSheet(tableName, data)` - ✅ EM USO (privado, fallback)

---

#### ✅ Classe `SecurityUtils` - Métodos Principais
- `sanitizeInput(input, type)` - ✅ EM USO (sanitização de dados)
- `sanitizeObject(data, schema)` - ✅ EM USO (sanitização de objetos)
- `isSafeString(input)` - ✅ EM USO (validação de segurança)

---

#### ✅ Classe `ValidationEngine` - Métodos Principais
- `getForeignKeys(tableName)` - ✅ EM USO (extrai FKs do dicionário)
- `validateForeignKeys(tableName, data)` - ✅ EM USO (valida FKs)
- `validateBusinessRules(tableName, data)` - ✅ EM USO (valida regras de negócio)
- `validateAdvanced(tableName, data)` - ✅ EM USO (validações avançadas)
- `validateUniqueConstraints(tableName, data, recordId)` - ✅ EM USO (valida unicidade)
- `validateFullData(tableName, data, recordId)` - ✅ EM USO (validação completa)

---

#### ✅ Classe `CacheManager` - Métodos Principais
- `get(tableName, filters, useCache)` - ✅ EM USO (busca no cache)
- `set(tableName, filters, data)` - ✅ EM USO (armazena no cache)
- `invalidate(tableName)` - ✅ EM USO (invalida cache)
- `clear()` - ✅ EM USO (limpa todo cache)
- `getStats()` - ✅ EM USO (estatísticas do cache)

---

#### ✅ Classe `PerformanceMetrics` - Métodos Principais
- `trackOperation(operation, tableName, timeMs, cacheHit)` - ✅ EM USO (rastreia operações)
- `getReport()` - ✅ EM USO (relatório de performance)
- `reset()` - ✅ EM USO (reseta métricas)

---

#### ✅ Classe `DatabaseManager` - Métodos Principais
- `query(tableName, filters, useCache)` - ✅ EM USO (consulta com filtros)
- `findById(tableName, id)` - ✅ EM USO (busca por ID)
- `findByField(tableName, fieldName, value)` - ✅ EM USO (busca por campo)
- `insert(tableName, data, silentMode)` - ✅ EM USO (inserção)
- `update(tableName, id, data)` - ✅ EM USO (atualização)
- `delete(tableName, id)` - ✅ EM USO (soft delete)
- `create(tableName, data)` - ✅ EM USO (alias para insert)
- `_generateId(tableName)` - ✅ EM USO (privado, geração de IDs)
- `_readTable(tableName)` - ✅ EM USO (privado, leitura)
- `_writeTable(tableName, headers, rows)` - ✅ EM USO (privado, escrita)

---

#### ✅ Classe `SecurityManager` - Métodos Principais
- `secureLogin(username, password)` - ✅ EM USO (login seguro)
- `hashPin(pin)` - ✅ EM USO (hash de PIN)
- `comparePin(plainPin, hashedPin)` - ✅ EM USO (compara PINs)
- `generateSecureToken(userId)` - ✅ EM USO (gera tokens)

---

#### ✅ Classe `TagManager` - Métodos Principais
- `parseTags(tagsString)` - ✅ EM USO (parsing de tags)
- `normalizeTags(tags)` - ✅ EM USO (normalização)
- `validateTags(tags)` - ✅ EM USO (validação)
- `formatTagsForStorage(tags)` - ✅ EM USO (formatação para storage)
- `searchByTags(tableName, searchTags)` - ✅ EM USO (busca por tags)

---

#### FUNÇÕES DE TESTE (database_manager.gs)

Todas as funções abaixo são para testes/debugging:

- ❌ `testCacheFilters()` (linha 2265) - NÃO USADA
- ❌ `diagnoseCacheIssue()` (linha 2300) - NÃO USADA
- ❌ `testDatabaseManager()` (linha 2342) - NÃO USADA
- ❌ `testSessionManager()` (linha 2855) - NÃO USADA
- ❌ `getSessionReport()` (linha 2899) - NÃO USADA
- ❌ `testSecurityManager()` (linha 2939) - NÃO USADA
- ❌ `testSecureLogin()` (linha 2983) - NÃO USADA
- ❌ `getSecurityReport()` (linha 3023) - NÃO USADA
- ❌ `testPagination()` (linha 3084) - NÃO USADA
- ❌ `demonstratePagination()` (linha 3146) - NÃO USADA
- ❌ `testPaginationPerformance()` (linha 3205) - NÃO USADA
- ❌ `testTagManager()` (linha 3465) - NÃO USADA
- ❌ `demonstrateTagsWithRealData()` (linha 3518) - NÃO USADA

---

#### ✅ `generateUniqueId(prefix)`
- **Tipo:** Pública
- **Parâmetros:**
  - `prefix` (string) - Prefixo do ID
- **Retorno:** string - ID único gerado
- **Descrição:** Gera ID único com timestamp e random
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado pelo DatabaseManager internamente

---

### 1.3 Arquivo: `data_dictionary.gs`

#### ✅ `getTableDictionary(tableName)`
- **Tipo:** Pública
- **Parâmetros:**
  - `tableName` (string) - Nome da tabela
- **Retorno:** `Object|null` - Dicionário da tabela
- **Descrição:** Obtém dicionário de uma tabela específica
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado por ValidationEngine e DatabaseManager

---

#### ✅ `getFieldDefinition(tableName, fieldName)`
- **Tipo:** Pública
- **Parâmetros:**
  - `tableName` (string)
  - `fieldName` (string)
- **Retorno:** `Object|null` - Definição do campo
- **Descrição:** Obtém definição de um campo específico
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado por ValidationEngine

---

#### ✅ `validateAgainstDictionary(tableName, data)`
- **Tipo:** Pública
- **Parâmetros:**
  - `tableName` (string)
  - `data` (Object) - Dados a validar
- **Retorno:** `{valid: boolean, errors: string[]}`
- **Descrição:** Valida dados contra o dicionário
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado por ValidationEngine

---

#### ✅ `getGeneratedFields(tableName)`
- **Tipo:** Pública
- **Parâmetros:**
  - `tableName` (string)
- **Retorno:** `string[]` - Lista de campos gerados
- **Descrição:** Obtém campos que devem ser gerados automaticamente
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado por DatabaseManager

---

#### ✅ `getDefaultValues(tableName)`
- **Tipo:** Pública
- **Parâmetros:**
  - `tableName` (string)
- **Retorno:** `Object` - Valores padrão
- **Descrição:** Obtém valores padrão para uma tabela
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado por DatabaseManager.insert()

---

#### ✅ `getAvailableTables()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `string[]` - Lista de nomes de tabelas
- **Descrição:** Lista todas as tabelas disponíveis
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado por logConfigInit() e validações

---

#### ✅ `getTableSummary(tableName)`
- **Tipo:** Pública
- **Parâmetros:**
  - `tableName` (string)
- **Retorno:** `Object|null` - Resumo da tabela
- **Descrição:** Obtém resumo de uma tabela (campos, requeridos, etc.)
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado para documentação e debugging

---

#### ❌ `getFutureFields(tableName)`
- **Tipo:** Pública
- **Parâmetros:**
  - `tableName` (string)
- **Retorno:** `string[]` - Campos marcados para uso futuro
- **Descrição:** Obtém campos de uso futuro
- **Status:** ❌ NÃO USADA
- **Chamadas:** Nenhuma
- **Motivo:** Funcionalidade planejada mas não implementada ainda

---

### 1.4 Arquivo: `session_manager.gs`

#### ✅ `createSession(userId, deviceInfo)` (async)
- **Tipo:** Pública
- **Parâmetros:**
  - `userId` (string) - UID do usuário
  - `deviceInfo` (Object) - Informações do dispositivo
- **Retorno:** `Promise<{ok, session?, error?}>`
- **Descrição:** Cria nova sessão para usuário autenticado
- **Status:** ✅ EM USO
- **Chamadas:**
  - `authenticateUser()` em usuarios_api.gs (linha 139)
  - `loginUser()` em auth.gs (linha 17)

---

#### ✅ `validateSession(sessionId)`
- **Tipo:** Pública
- **Parâmetros:**
  - `sessionId` (string) - ID da sessão
- **Retorno:** `{ok, session?, error?}`
- **Descrição:** Valida sessão existente
- **Status:** ✅ EM USO
- **Chamadas:**
  - `completeActivity()` em activities_api.gs (linha 368)
  - `getCurrentLoggedUser()` em usuarios_api.gs (linha 195)
  - `authenticateUser()` em usuarios_api.gs (linha 144)

---

#### ✅ `destroySession(sessionId)`
- **Tipo:** Pública
- **Parâmetros:**
  - `sessionId` (string) - ID da sessão
- **Retorno:** `{ok, message?, error?}`
- **Descrição:** Destrói/desativa sessão
- **Status:** ✅ EM USO
- **Chamadas:**
  - `logoutUser()` em auth.gs (linha 99)

---

#### ✅ `getSessionStats()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `Object` - Estatísticas das sessões
- **Descrição:** Obtém estatísticas das sessões (ativas, expiradas, etc.)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `runSystemMaintenance()` em session_manager.gs (linha 486)

---

#### ✅ `checkUserExists(userId)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `userId` (string) - ID do usuário
- **Retorno:** boolean
- **Descrição:** Verifica se usuário existe
- **Status:** ✅ EM USO
- **Chamadas:**
  - `createSession()` em session_manager.gs (linha 58)

---

#### ✅ `cleanupExpiredSessions()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, cleaned, message?}`
- **Descrição:** Limpa sessões expiradas (manutenção)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `runSystemMaintenance()` em session_manager.gs (linha 462)

---

#### ✅ `cleanupOldSystemLogs()` (async)
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `Promise<{ok, cleaned, message?}>`
- **Descrição:** Limpa logs do sistema antigos (>7 dias)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `runSystemMaintenance()` em session_manager.gs (linha 470)

---

#### ✅ `runSystemMaintenance()` (async)
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `Promise<{ok, message, results}>`
- **Descrição:** Executa manutenção automática do sistema
- **Status:** ✅ EM USO
- **Chamadas:**
  - Executado periodicamente via trigger

---

#### ALIASES DE COMPATIBILIDADE (session_manager.gs)

- ✅ `createSessionSimple(userId, deviceInfo)` - Alias para createSession()
- ✅ `validateSessionSimple(sessionId)` - Alias para validateSession()
- ✅ `destroySessionSimple(sessionId)` - Alias para destroySession()
- ✅ `getSessionStatsSimple()` - Alias para getSessionStats()
- ✅ `createSessionForUser(userId, deviceInfo)` - Alias para createSession()
- ✅ `validateSessionForAuth(sessionId)` - Alias para validateSession()

**Status:** ✅ TODAS EM USO (mantidas para compatibilidade)

---

### 1.5 Arquivo: `performance_monitor.gs`

#### ✅ Classe `PerformanceMonitor` - Métodos Principais

- `init()` - ✅ EM USO (inicialização)
- `trackOperation(operation, tableName, timeMs, context)` - ✅ EM USO (rastreamento)
- `getAdvancedReport()` - ✅ EM USO (relatório avançado)
- `getSimpleReport()` - ✅ EM USO (relatório simples)
- `logAdvancedReport()` - ✅ EM USO (log formatado)
- `reset()` - ✅ EM USO (reset de dados)
- `clearCache()` - ✅ EM USO (limpeza)
- `cleanup()` - ✅ EM USO (limpeza de dados antigos)
- `savePerformanceLog(operation, tableName, timeMs, context)` - ✅ EM USO (persistência)
- `saveDailyHealthReport(healthData)` - ✅ EM USO (relatório diário)
- `getPerformanceHistory(filters, days)` - ✅ EM USO (histórico)
- `getHealthHistory(days)` - ✅ EM USO (histórico de saúde)
- `integrateWithExisting(operation, tableName, timeMs, cacheHit)` - ✅ EM USO (integração)
- `getQuickStatus()` - ✅ EM USO (status rápido)

**Status:** ✅ TODOS EM USO (sistema de monitoramento ativo)

---

### 1.6 Arquivo: `utils.gs`

#### ✅ `getPlanilhas_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** Array - Lista de planilhas ativas
- **Descrição:** Lê a tabela Planilhas (somente linhas ativas)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `getPlanRef_()` em utils.gs (linha 77)

---

#### ✅ `getPlanRef_(nome)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `nome` (string) - Nome da planilha
- **Retorno:** Object - Referência da planilha
- **Descrição:** Busca uma entrada por "nome" na config de planilhas
- **Status:** ✅ EM USO
- **Chamadas:**
  - `getActivitiesCtx_()` em activities.gs (linha 244)
  - `getMembersCtx_()` em members.gs (linha 260)
  - `getParticipacaesCtx_()` em participacoes.gs (linha 651)

---

#### ✅ `getContextFromRef_(ref)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `ref` (Object) - Referência da planilha
- **Retorno:** Object - Contexto com file, sheet, rangeStr
- **Descrição:** Monta contexto com prioridade para named_range
- **Status:** ✅ EM USO
- **Chamadas:**
  - `getActivitiesCtx_()` em activities.gs (linha 245)
  - `getMembersCtx_()` em members.gs (linha 261)

---

#### ✅ `readNamedTable_(ssidOrActive, namedOrA1)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `ssidOrActive` (string) - SSID ou 'ACTIVE'
  - `namedOrA1` (string) - Nome do range ou notação A1
- **Retorno:** `{values, headerIndex, ctx}`
- **Descrição:** Lê uma tabela onde a 1ª linha é cabeçalho
- **Status:** ✅ EM USO
- **Chamadas:**
  - `readTableByNome_()` em utils.gs (linha 166-167)
  - DatabaseManager usa internamente

---

#### ✅ `trimTrailingEmptyRows_(values)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `values` (Array) - Valores da tabela
- **Retorno:** Array - Valores sem linhas vazias no final
- **Descrição:** Remove linhas vazias no final
- **Status:** ✅ EM USO
- **Chamadas:**
  - `readTableByNome_()` em utils.gs (linha 170)

---

#### ✅ `trimByKeyColumn_(values, headerIndex, keyField)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `values` (Array)
  - `headerIndex` (Object)
  - `keyField` (string) - Nome do campo chave
- **Retorno:** Array - Valores cortados
- **Descrição:** Corta cauda com base em uma coluna-chave
- **Status:** ✅ EM USO
- **Chamadas:**
  - `readTableByNome_()` em utils.gs (linha 172)

---

#### ✅ `readTableByNome_(nome)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `nome` (string) - Nome da tabela
- **Retorno:** `{values, headerIndex, ctx}`
- **Descrição:** Acesso rápido por "nome" + corte de cauda
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado pelo DatabaseManager em versões antigas (sendo migrado)

---

#### ✅ `nowString_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** string - Data/hora formatada
- **Descrição:** Retorna data/hora atual formatada (yyyy-MM-dd HH:mm:ss)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `updateActivityWithTargets()` em activities.gs (linha 418) - **REMOVIDO**
  - `updateParticipacaoById()` em participacoes.gs (linha 624)
  - `defineTargets()` em participacoes.gs (linha 103)
  - `markParticipacao()` em participacoes.gs (linha 185)

**NOTA:** Uso está sendo reduzido à medida que DatabaseManager preenche timestamps automaticamente

---

#### ✅ `findRowById_(values, headerIndex, idField, idValue)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `values` (Array)
  - `headerIndex` (Object)
  - `idField` (string) - Nome do campo ID
  - `idValue` (string) - Valor do ID
- **Retorno:** number - Número da linha (1-based) ou -1
- **Descrição:** Encontra linha por ID
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado em operações legadas (sendo migrado para DatabaseManager)

---

## 2. CAMADA 01-BUSINESS (LÓGICA DE NEGÓCIO)

### 2.1 Arquivo: `auth.gs`

#### ✅ `loginUser(login, pin, deviceInfo)` (async)
- **Tipo:** Pública
- **Parâmetros:**
  - `login` (string)
  - `pin` (string)
  - `deviceInfo` (Object)
- **Retorno:** `Promise<{ok, user?, session?, error?}>`
- **Descrição:** Login simples usando SecurityManager e SessionManager
- **Status:** ✅ EM USO
- **Chamadas:**
  - Chamado pelo frontend durante login (não via google.script.run diretamente)
  - Usa `authenticateUser()` de usuarios_api.gs

---

#### ✅ `logoutUser(sessionId)` (async)
- **Tipo:** Pública
- **Parâmetros:**
  - `sessionId` (string)
- **Retorno:** `Promise<{ok, message?, error?}>`
- **Descrição:** Logout com destruição de sessão
- **Status:** ✅ EM USO
- **Chamadas:**
  - Chamado durante logout do frontend

---

#### ✅ `forceLogoutUser(userId)` (async)
- **Tipo:** Pública
- **Parâmetros:**
  - `userId` (string)
- **Retorno:** `Promise<{ok, message?, error?}>`
- **Descrição:** Forçar logout de todas as sessões de um usuário
- **Status:** ✅ EM USO (funcionalidade de admin)
- **Chamadas:**
  - Não chamado diretamente pelo frontend ainda (funcionalidade futura)

---

#### ✅ `listActiveUsers()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, users: Array}`
- **Descrição:** Lista usuários ATIVOS para atribuição de atividades
- **Status:** ✅ EM USO
- **Chamadas:**
  - `listUsuariosApi()` em usuarios_api.gs (linha 22)
  - `getUsersMapReadOnly_()` em activities.gs (linha 342)
  - `linkMemberToUser()` em members.gs (linha 195)

---

### 2.2 Arquivo: `activities.gs`

#### ✅ `listActivitiesApi()`
- **Tipo:** Pública/API
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** API para listar atividades com todas as informações
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linhas 2994, 4157) via google.script.run

---

#### ✅ `_listActivitiesCore()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Core da listagem de atividades (usado pela API pública)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `listActivitiesApi()` em activities.gs (linha 6)

---

#### ✅ `listActivities()` (alias)
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Alias para listActivitiesApi() (compatibilidade)
- **Status:** ✅ EM USO
- **Chamadas:**
  - Compatibilidade com código antigo

---

#### ✅ `getActivitiesCtx_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** `{sheet, startRow, startCol}`
- **Descrição:** Resolve o contexto (sheet/startRow/startCol) via Tabela Planilhas
- **Status:** ✅ EM USO
- **Chamadas:**
  - `_listActivitiesCore()` em activities.gs (linha 50)

---

#### ✅ `getFullTableValues_(ctx)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `ctx` (Object) - Contexto da planilha
- **Retorno:** Array - Valores da tabela
- **Descrição:** Lê do cabeçalho até a última linha usada
- **Status:** ✅ EM USO
- **Chamadas:**
  - `_listActivitiesCore()` em activities.gs (linha 53)

---

#### ✅ `getUsersMapReadOnly_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** Object - Mapa de usuários {uid: {nome, login}}
- **Descrição:** Retorna mapa de usuários ativos para lookups rápidos O(1)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `_listActivitiesCore()` em activities.gs (linha 117)
  - `updateActivityWithTargets()` em activities.gs (linha 434)

---

#### ✅ `updateActivityWithTargets(input, uidEditor)` (async)
- **Tipo:** Pública
- **Parâmetros:**
  - `input` (Object) - {id, patch, alvos}
  - `uidEditor` (string) - UID do editor
- **Retorno:** `Promise<{ok, atualizadoPorNome?, error?}>`
- **Descrição:** Atualiza atividade com suporte a alvos (PATCH)
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linha 5442) via google.script.run

---

### 2.3 Arquivo: `activities_categories.gs`

#### ✅ `_listCategoriasAtividadesCore()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Core da listagem de categorias de atividades
- **Status:** ✅ EM USO
- **Chamadas:**
  - `listCategoriasAtividadesApi()` em activities_api.gs (linha 15)
  - `getCategoriasAtividadesMapReadOnly_()` em activities_categories.gs (linha 70)

---

#### ✅ `getCategoriasAtividadesMapReadOnly_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** Object - Mapa de categorias {id: categoria}
- **Descrição:** Retorna mapa de categorias com cache
- **Status:** ✅ EM USO
- **Chamadas:**
  - `_listActivitiesCore()` em activities.gs (linha 118)
  - `validateCategoriaAtividade_()` em activities_categories.gs (linha 98)

---

#### ❌ `clearCategoriasAtividadesCache_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** void
- **Descrição:** Limpa cache de categorias
- **Status:** ❌ NÃO USADA
- **Chamadas:** Nenhuma
- **Motivo:** Cache é gerenciado automaticamente

---

#### ✅ `validateCategoriaAtividade_(categoriaId)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `categoriaId` (string)
- **Retorno:** Object|null - Categoria ou null
- **Descrição:** Valida se categoria existe
- **Status:** ✅ EM USO
- **Chamadas:**
  - `updateActivityWithTargets()` em activities.gs (linha 387)

---

### 2.4 Arquivo: `members.gs`

#### ✅ `listMembersApi()`
- **Tipo:** Pública/API
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Lista todos os membros do sistema
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linhas 4441, 6101, 6256) via google.script.run

---

#### ✅ `_listMembersCore()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Core da listagem de membros (migrado para DatabaseManager)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `listMembersApi()` em members.gs (linha 9)
  - `listActiveMembersApi()` em members.gs (linha 96)
  - `getMemberById()` em members.gs (linha 121)
  - `searchMembers()` em members.gs (linha 143)

---

#### ✅ `listActiveMembersApi()`
- **Tipo:** Pública/API
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Lista membros ativos (para seleção em atividades)
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado em formulários de atividades

---

#### ✅ `getMemberById(id)`
- **Tipo:** Pública
- **Parâmetros:**
  - `id` (string) - codigo_sequencial do membro
- **Retorno:** `{ok, item?, error?}`
- **Descrição:** Busca membro por ID
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado em visualização de detalhes de membros

---

#### ✅ `searchMembers(filters)`
- **Tipo:** Pública
- **Parâmetros:**
  - `filters` (Object) - Filtros de busca
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Busca membros por critérios
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado em buscas do frontend

---

#### ✅ `linkMemberToUser(memberId, usuarioUid, editorUid)` (async)
- **Tipo:** Pública
- **Parâmetros:**
  - `memberId` (string)
  - `usuarioUid` (string)
  - `editorUid` (string)
- **Retorno:** `Promise<{ok, message?, error?}>`
- **Descrição:** Vincula membro com usuário (migrado para DatabaseManager)
- **Status:** ✅ EM USO (funcionalidade futura)
- **Chamadas:**
  - Não chamado diretamente ainda (funcionalidade planejada)

---

#### ✅ `getMembersCtx_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** `{sheet, startRow, startCol}`
- **Descrição:** Contexto da planilha de membros
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado internamente (versão legada)

---

#### ✅ `getFullTableValuesMembros_(ctx)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `ctx` (Object)
- **Retorno:** Array
- **Descrição:** Lê dados completos da tabela de membros
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado internamente (versão legada)

---

### 2.5 Arquivo: `participacoes.gs`

#### ✅ `listParticipacoes(activityId)`
- **Tipo:** Pública
- **Parâmetros:**
  - `activityId` (string)
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Lista participações usando DatabaseManager
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linhas 4218, 6144) via google.script.run
  - `getParticipacaoStats()` em participacoes.gs (linha 295)

---

#### ❌ `calculateStatusParticipacao(participacao)` (privada)
- **Tipo:** Privada
- **Parâmetros:**
  - `participacao` (Object)
- **Retorno:** string - Status calculado
- **Descrição:** Calcula o status de participação baseado nas regras
- **Status:** ❌ NÃO USADA
- **Chamadas:** Nenhuma
- **Motivo:** Funcionalidade não implementada no frontend

---

#### ✅ `defineTargets(activityId, memberIds, uid)`
- **Tipo:** Pública
- **Parâmetros:**
  - `activityId` (string)
  - `memberIds` (Array)
  - `uid` (string)
- **Retorno:** `{ok, created, message?}`
- **Descrição:** Define alvos para uma atividade usando DatabaseManager
- **Status:** ✅ EM USO
- **Chamadas:**
  - `addExtraMember()` em participacoes.gs (linha 351)

---

#### ✅ `markParticipacao(activityId, memberId, dados, uid)`
- **Tipo:** Pública
- **Parâmetros:**
  - `activityId` (string)
  - `memberId` (string)
  - `dados` (Object)
  - `uid` (string)
- **Retorno:** `{ok, error?}`
- **Descrição:** Marca participação de um membro usando DatabaseManager
- **Status:** ✅ EM USO
- **Chamadas:**
  - `saveParticipacaoDirectly()` em participacoes.gs (linha 581)

---

#### ✅ `searchMembersByCriteria(filters)`
- **Tipo:** Pública
- **Parâmetros:**
  - `filters` (Object)
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Busca membros por critérios para definição de alvos
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linhas 6284, 6433) via google.script.run

---

#### ✅ `getParticipacaoStats(activityId)`
- **Tipo:** Pública
- **Parâmetros:**
  - `activityId` (string)
- **Retorno:** `{ok, stats: Object, error?}`
- **Descrição:** Obtém estatísticas de participação de uma atividade
- **Status:** ✅ EM USO
- **Chamadas:**
  - `_listActivitiesCore()` em activities.gs (linha 187)

---

#### ✅ `addExtraMember(activityId, memberId, uid)`
- **Tipo:** Pública
- **Parâmetros:**
  - `activityId` (string)
  - `memberId` (string)
  - `uid` (string)
- **Retorno:** `{ok, error?}`
- **Descrição:** Adiciona membro extra (não estava nos alvos originais)
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado quando adiciona participante não previsto

---

#### ✅ `saveTargetsDirectly(activityId, memberIds, uid)` (async)
- **Tipo:** Pública
- **Parâmetros:**
  - `activityId` (string)
  - `memberIds` (Array)
  - `uid` (string)
- **Retorno:** `Promise<{ok, created, deleted, message?}>`
- **Descrição:** Salva alvos diretamente (similar ao padrão de activities.gs)
- **Status:** ✅ EM USO
- **Chamadas:**
  - `updateActivityWithTargets()` em activities.gs (linha 419)

---

#### ✅ `saveParticipacaoDirectly(activityId, memberId, dados, uid)`
- **Tipo:** Pública
- **Parâmetros:**
  - `activityId` (string)
  - `memberId` (string)
  - `dados` (Object)
  - `uid` (string)
- **Retorno:** `{ok, error?}`
- **Descrição:** Salva participação diretamente na planilha
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linhas 4645, 7733) via google.script.run

---

#### ✅ `updateParticipacaoById(participacaoId, dados, uid)`
- **Tipo:** Pública
- **Parâmetros:**
  - `participacaoId` (string)
  - `dados` (Object)
  - `uid` (string)
- **Retorno:** `{ok, message?, error?}`
- **Descrição:** Atualiza participação usando ID específico da tabela
- **Status:** ✅ EM USO
- **Chamadas:**
  - `saveParticipacaoDirectly()` em participacoes.gs (linha 575)

---

#### ✅ `getParticipacaesCtx_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** `{sheet, startRow, startCol}`
- **Descrição:** Contexto da planilha de participações
- **Status:** ✅ EM USO
- **Chamadas:**
  - `generateParticipacaoId_()` em participacoes.gs (linha 687)

---

#### ❌ `generateParticipacaoId_()` (privada)
- **Tipo:** Privada
- **Parâmetros:** Nenhum
- **Retorno:** string - ID gerado (PART-XXXX)
- **Descrição:** Gera ID sequencial para participação
- **Status:** ❌ NÃO USADA
- **Chamadas:** Nenhuma
- **Motivo:** DatabaseManager gera IDs automaticamente

---

### 2.6 Arquivo: `menu.gs`

#### ✅ `listMenuItems()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Lista itens do menu para o usuário atual
- **Status:** ✅ EM USO
- **Chamadas:**
  - userMenuDropdown.html (linha 345) via google.script.run
  - `getMenuForUser()` em menu.gs (linha 63)

---

#### ✅ `getMenuForUser(userRole)`
- **Tipo:** Pública
- **Parâmetros:**
  - `userRole` (string)
- **Retorno:** `{ok, items: Array, error?}`
- **Descrição:** Filtra itens do menu baseado nas permissões do usuário
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado para renderizar menu dinâmico

---

## 3. CAMADA 02-API (ENDPOINTS PÚBLICOS)

### 3.1 Arquivo: `activities_api.gs`

#### ✅ `listCategoriasAtividadesApi()`
- **Tipo:** Pública/API
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, total, error?}`
- **Descrição:** Lista categorias de atividades (endpoint público)
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linhas 4820, 4870, 7527) via google.script.run

---

#### ✅ `createActivity(activityData, creatorUid)` (async)
- **Tipo:** Pública/API
- **Parâmetros:**
  - `activityData` (Object)
  - `creatorUid` (string)
- **Retorno:** `Promise<{ok, message?, id?, data?, error?}>`
- **Descrição:** Cria uma nova atividade
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linha 5537) via google.script.run

---

#### ✅ `getActivityById(activityId, retryCount=0)`
- **Tipo:** Pública/API
- **Parâmetros:**
  - `activityId` (string)
  - `retryCount` (number) - Opcional, para retry interno
- **Retorno:** `{ok, activity?, error?}`
- **Descrição:** Busca uma atividade específica pelo ID
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linhas 4179, 5296) via google.script.run

---

#### ✅ `completeActivity(activityId)` (async)
- **Tipo:** Pública/API
- **Parâmetros:**
  - `activityId` (string)
- **Retorno:** `Promise<{ok, message?, error?}>`
- **Descrição:** Marca uma atividade como concluída
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linha 3300) via google.script.run

---

### 3.2 Arquivo: `usuarios_api.gs`

#### ✅ `listUsuariosApi()`
- **Tipo:** Pública/API
- **Parâmetros:** Nenhum
- **Retorno:** `{ok, items: Array, total, error?}`
- **Descrição:** Lista todos os usuários ativos do sistema
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linhas 5075, 5131, 7545) via google.script.run

---

#### ✅ `getCurrentUserForFilter()`
- **Tipo:** Pública
- **Parâmetros:** Nenhum
- **Retorno:** `{uid, nome}|null`
- **Descrição:** Retorna o usuário atual logado para filtros
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado em filtros de atividades

---

#### ✅ `authenticateUser(login, password)` (async)
- **Tipo:** Pública/API
- **Parâmetros:**
  - `login` (string)
  - `password` (string)
- **Retorno:** `Promise<{success, user?, session?, error?}>`
- **Descrição:** Autentica usuário e cria sessão
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linha 5920) via google.script.run

---

#### ✅ `getCurrentLoggedUser()`
- **Tipo:** Pública/API
- **Parâmetros:** Nenhum
- **Retorno:** `{uid, nome, metodo}|null`
- **Descrição:** Retorna dados do usuário logado atualmente
- **Status:** ✅ EM USO
- **Chamadas:**
  - app_migrated.html (linha 5640) via google.script.run

---

#### ❌ `getFirstUserForDev()`
- **Tipo:** Pública (DEV)
- **Parâmetros:** Nenhum
- **Retorno:** `{uid, nome, login}|null`
- **Descrição:** Retorna o primeiro usuário da tabela para desenvolvimento
- **Status:** ❌ NÃO USADA (apenas para DEV)
- **Chamadas:** Nenhuma no código de produção

---

### 3.3 Arquivo: `main_migrated.gs`

#### ✅ `doGet(e)`
- **Tipo:** Pública (Google Apps Script)
- **Parâmetros:**
  - `e` (Object) - Event object
- **Retorno:** HtmlOutput
- **Descrição:** Ponto de entrada web para aplicação migrada
- **Status:** ✅ EM USO
- **Chamadas:**
  - Executado automaticamente pelo Google Apps Script

---

#### ✅ `include(filename)`
- **Tipo:** Pública
- **Parâmetros:**
  - `filename` (string)
- **Retorno:** string - Conteúdo do arquivo HTML
- **Descrição:** Inclui arquivos HTML (helper para templates)
- **Status:** ✅ EM USO
- **Chamadas:**
  - Usado em templates HTML

---

## 4. CAMADA 05-COMPONENTS (FRONTEND)

### 4.1 Arquivo: `userMenuDropdown.html`

**NOTA:** Arquivo HTML com componente de dropdown. Contém apenas 1 chamada de função backend:

#### Chamada identificada:
- `listMenuItems()` - Linha 345

---

## RESUMO DE FUNÇÕES NÃO USADAS (20 FUNÇÕES)

### Funções Obsoletas/Deprecated:
1. ❌ `getIdPattern(tableName)` - 00_config.gs:292
2. ❌ `getFutureFields(tableName)` - data_dictionary.gs:1849

### Funções de Teste/Debug (13 funções):
3. ❌ `testCacheFilters()` - database_manager.gs:2265
4. ❌ `diagnoseCacheIssue()` - database_manager.gs:2300
5. ❌ `testDatabaseManager()` - database_manager.gs:2342
6. ❌ `testSessionManager()` - database_manager.gs:2855
7. ❌ `getSessionReport()` - database_manager.gs:2899
8. ❌ `testSecurityManager()` - database_manager.gs:2939
9. ❌ `testSecureLogin()` - database_manager.gs:2983
10. ❌ `getSecurityReport()` - database_manager.gs:3023
11. ❌ `testPagination()` - database_manager.gs:3084
12. ❌ `demonstratePagination()` - database_manager.gs:3146
13. ❌ `testPaginationPerformance()` - database_manager.gs:3205
14. ❌ `testTagManager()` - database_manager.gs:3465
15. ❌ `demonstrateTagsWithRealData()` - database_manager.gs:3518

### Funções Não Implementadas no Frontend:
16. ❌ `clearCategoriasAtividadesCache_()` - activities_categories.gs:93
17. ❌ `calculateStatusParticipacao(participacao)` - participacoes.gs:54
18. ❌ `generateParticipacaoId_()` - participacoes.gs:685

### Funções de Desenvolvimento:
19. ❌ `getFirstUserForDev()` - usuarios_api.gs:263

### Funções com Implementação Parcial:
20. ❌ `forceLogoutUser(userId)` - auth.gs:114 (funcionalidade futura)

---

## RECOMENDAÇÕES

### Manutenção Imediata:
1. **Remover ou documentar funções de teste** - As 13 funções de teste podem ser movidas para arquivo separado de testes
2. **Remover funções deprecated** - `getIdPattern()` pode ser removida completamente
3. **Implementar ou remover** - `calculateStatusParticipacao()` deve ser implementada ou removida

### Otimizações:
1. **Consolidar aliases** - Considerar remover aliases de compatibilidade se não mais necessários
2. **Documentar funções futuras** - Marcar claramente `forceLogoutUser()` como funcionalidade futura
3. **Revisar funções privadas legadas** - Algumas funções `_*` podem ser removidas após migração completa para DatabaseManager

### Documentação:
1. **Adicionar JSDoc** - Algumas funções carecem de documentação completa
2. **Mapear dependências** - Criar diagrama de dependências entre módulos
3. **Atualizar README** - Documentar arquitetura atual do sistema

---

## CHAMADAS DO FRONTEND (app_migrated.html)

### Funções Mais Chamadas:
1. **listActivitiesApi** - 2 chamadas (linhas 2994, 4157)
2. **listCategoriasAtividadesApi** - 3 chamadas (linhas 4820, 4870, 7527)
3. **listUsuariosApi** - 3 chamadas (linhas 5075, 5131, 7545)
4. **listMembersApi** - 3 chamadas (linhas 4441, 6101, 6256)
5. **saveParticipacaoDirectly** - 2 chamadas (linhas 4645, 7733)
6. **listParticipacoes** - 2 chamadas (linhas 4218, 6144)
7. **searchMembersByCriteria** - 2 chamadas (linhas 6284, 6433)
8. **getActivityById** - 2 chamadas (linhas 4179, 5296)

### Funções Chamadas 1 Vez:
- completeActivity (linha 3300)
- updateActivityWithTargets (linha 5442)
- createActivity (linha 5537)
- getCurrentLoggedUser (linha 5640)
- authenticateUser (linha 5920)

---

**FIM DO INVENTÁRIO**

Data de Geração: 03/10/2025
Versão do Sistema: 2.0.0-alpha.1
Autor: Sistema Dojotai Team
