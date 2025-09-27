# 📚 API REFERENCE - Sistema Dojotai V2.0

**Versão:** 2.0.0-alpha.1
**Atualizado:** 23/09/2025
**Cobertura:** 100% dos módulos principais

---

## 📋 **ÍNDICE DE MÓDULOS**

1. [DatabaseManager](#-databasemanager) - Sistema centralizado de dados
2. [SessionManager](#-sessionmanager) - Gestão de sessões e autenticação
3. [Logger](#-logger) - Sistema de logs estruturados
4. [AuthManager](#-authmanager) - Autenticação e segurança
5. [PerformanceMonitor](#-performancemonitor) - Monitoramento de performance
6. [ValidationEngine](#-validationengine) - Validações e business rules
7. [API Endpoints](#-api-endpoints) - Endpoints REST disponíveis

---

## 🗄️ **DatabaseManager**

Sistema centralizado para operações CRUD com cache, validações e logs integrados.

### **Core Methods**

#### `DatabaseManager.insert(tableName, data)`
Insere novo registro com validações automáticas.

**Parâmetros:**
- `tableName` (string) - Nome da tabela
- `data` (Object) - Dados do registro

**Retorno:**
```javascript
{
  success: boolean,
  id: string,           // ID único gerado
  message: string,
  data?: Object         // Dados inseridos (com ID)
}
```

**Exemplo:**
```javascript
const result = await DatabaseManager.insert('usuarios', {
  nome: 'João Silva',
  email: 'joao@email.com',
  senha_hash: 'abc123...'
});
// Retorna: { success: true, id: "USR-1727102345678", data: {...} }
```

#### `DatabaseManager.query(tableName, filters, options)`
Consulta registros com filtros avançados.

**Parâmetros:**
- `tableName` (string) - Nome da tabela
- `filters` (Object) - Filtros de busca
- `options` (Object, opcional) - Opções de consulta

**Opções Disponíveis:**
```javascript
{
  limit: number,        // Máximo de registros
  orderBy: string,      // Campo para ordenação
  orderDir: 'asc'|'desc', // Direção da ordenação
  useCache: boolean     // Usar cache (default: true)
}
```

**Retorno:**
```javascript
{
  success: boolean,
  data: Array<Object>,  // Registros encontrados
  count: number,        // Total de registros
  cached: boolean       // Se veio do cache
}
```

**Exemplo:**
```javascript
const users = await DatabaseManager.query('usuarios',
  { ativo: 'sim' },
  { limit: 10, orderBy: 'nome' }
);
```

#### `DatabaseManager.update(tableName, id, data)`
Atualiza registro existente.

**Parâmetros:**
- `tableName` (string) - Nome da tabela
- `id` (string) - ID do registro
- `data` (Object) - Dados para atualizar

**Retorno:**
```javascript
{} | { error: string }  // Objeto vazio = sucesso
```

**Exemplo:**
```javascript
const result = DatabaseManager.update('usuarios', 'USR-123', {
  nome: 'João Santos'
});
// Retorna: {} (sucesso) ou { error: "mensagem" }
```

#### `DatabaseManager.delete(tableName, id)`
Remove registro permanentemente.

**Parâmetros:**
- `tableName` (string) - Nome da tabela
- `id` (string) - ID do registro

**Retorno:**
```javascript
{
  success: boolean,
  message: string
}
```

### **Cache Methods**

#### `DatabaseManager.clearCache(tableName?)`
Limpa cache de uma tabela específica ou todo o cache.

**Parâmetros:**
- `tableName` (string, opcional) - Tabela específica

**Retorno:**
```javascript
{
  success: boolean,
  cleared: Array<string> // Tabelas limpas
}
```

#### `DatabaseManager.getCacheStats()`
Obtém estatísticas do cache.

**Retorno:**
```javascript
{
  hitRate: number,      // Taxa de acerto (0-1)
  totalHits: number,    // Total de hits
  totalMisses: number,  // Total de misses
  cacheSize: number     // Tamanho atual do cache
}
```

---

## 🔐 **SessionManager**

Gestão completa de sessões com tokens únicos e validação automática.

### **Session Methods**

#### `createSession(userId, deviceInfo)`
Cria nova sessão para usuário autenticado.

**Parâmetros:**
- `userId` (string) - ID do usuário (usuarios.uid)
- `deviceInfo` (Object, opcional) - Informações do dispositivo

**deviceInfo Structure:**
```javascript
{
  ip: string,           // IP do cliente
  userAgent: string,    // User agent do browser
  platform: string,    // Plataforma (web, mobile, etc)
  login_method: string  // Método de login usado
}
```

**Retorno:**
```javascript
{
  ok: boolean,
  session?: {
    id: string,         // Token da sessão (sess_timestamp_random)
    user_id: string,    // ID do usuário
    expires_at: string, // Data de expiração
    created_at: string, // Data de criação
    active: boolean     // Status ativo
  },
  error?: string
}
```

#### `validateSession(sessionId)`
Valida sessão existente e atualiza última atividade.

**Parâmetros:**
- `sessionId` (string) - Token da sessão

**Retorno:**
```javascript
{
  ok: boolean,
  session?: {
    id: string,         // Token da sessão
    user_id: string,    // ID do usuário
    expires_at: string, // Data de expiração
    created_at: string, // Data de criação
    active: boolean     // Status ativo
  },
  error?: string        // Motivo da falha
}
```

#### `destroySession(sessionId)`
Desativa sessão (logout).

**Parâmetros:**
- `sessionId` (string) - Token da sessão

**Retorno:**
```javascript
{
  ok: boolean,
  message?: string,
  error?: string
}
```

### **Session Utilities**

#### `getSessionStats()`
Obtém estatísticas das sessões ativas.

**Retorno:**
```javascript
{
  total_sessions: number,    // Total de sessões
  active_sessions: number,   // Sessões ativas
  expired_sessions: number,  // Sessões expiradas
  inactive_sessions: number  // Sessões inativas
}
```

#### `cleanupExpiredSessions()`
Remove sessões expiradas (manutenção).

**Retorno:**
```javascript
{
  ok: boolean,
  cleaned: number,      // Sessões limpas
  message: string
}
```

---

## 📝 **Logger**

Sistema de logs estruturados com 4 níveis e anti-recursão.

### **Log Levels**

#### `Logger.debug(context, message, data?)`
Logs de debugging (não persistidos).

#### `Logger.info(context, message, data?)`
Informações importantes (persistidas seletivamente).

#### `Logger.warn(context, message, data?)`
Avisos que requerem atenção (filtrados).

#### `Logger.error(context, message, data?)`
Erros críticos (sempre persistidos).

**Parâmetros Padrão:**
- `context` (string) - Módulo/contexto (ex: 'SessionManager')
- `message` (string) - Mensagem descritiva
- `data` (Object, opcional) - Dados adicionais estruturados

**Configuração de Persistência:**
```javascript
// APP_CONFIG.LOG_PERSISTENCE
{
  ALWAYS_PERSIST: ['ERROR'],
  IMPORTANT_CONTEXTS: ['SessionManager', 'AuthManager', 'UserAction'],
  WARN_EXCLUDE_PATTERNS: ['FK validation failed', 'Cache'],
  WARN_EXCLUDE_CONTEXTS: ['ValidationEngine', 'PerformanceMonitor']
}
```

### **Anti-Recursão**
- Flag global `_LOGGER_IS_LOGGING` previne loops infinitos
- Modo silencioso para operações em `system_logs`
- Filtros específicos para PerformanceMonitor

---

## 🔒 **AuthManager**

Sistema de autenticação com SHA-256 e gestão de usuários.

### **Authentication Methods**

#### `authenticateUser(email, senha)`
Autentica usuário com email e senha.

**Parâmetros:**
- `email` (string) - Email do usuário
- `senha` (string) - Senha em texto plano

**Retorno:**
```javascript
{
  success: boolean,
  user?: {
    uid: string,        // ID único do usuário
    nome: string,       // Nome completo
    email: string,      // Email
    role: string,       // Papel no sistema
    ativo: string       // Status ativo ('sim'/'não')
  },
  error?: string
}
```

#### `createUser(userData)`
Cria novo usuário com hash de senha.

**Parâmetros:**
- `userData` (Object) - Dados do usuário

**userData Structure:**
```javascript
{
  nome: string,         // Nome completo
  email: string,        // Email único
  senha: string,        // Senha em texto plano
  role?: string,        // Papel (default: 'membro')
  ativo?: string        // Status (default: 'sim')
}
```

#### `hashPassword(senha, salt?)`
Gera hash SHA-256 da senha.

**Parâmetros:**
- `senha` (string) - Senha em texto plano
- `salt` (string, opcional) - Salt personalizado

**Retorno:**
- `string` - Hash SHA-256 da senha

---

## ⚡ **PerformanceMonitor**

Monitoramento em tempo real da performance do sistema.

### **Monitoring Methods**

#### `PerformanceMonitor.start(operation)`
Inicia medição de performance.

**Parâmetros:**
- `operation` (string) - Nome da operação

**Retorno:**
- `string` - ID da medição

#### `PerformanceMonitor.end(measurementId, metadata?)`
Finaliza medição e registra performance.

**Parâmetros:**
- `measurementId` (string) - ID da medição
- `metadata` (Object, opcional) - Metadados adicionais

#### `PerformanceMonitor.getReport()`
Obtém relatório de performance atual.

**Retorno:**
```javascript
{
  summary: {
    totalOperations: number,
    averageTime: number,
    cacheHitRate: number,
    errorRate: number
  },
  details: {
    slowestOperations: Array<Object>,
    mostFrequentOperations: Array<Object>,
    recentErrors: Array<Object>
  }
}
```

#### `PerformanceMonitor.getAdvancedReport()`
Relatório avançado com health score.

**Retorno:**
```javascript
{
  summary: Object,      // Resumo básico
  advanced: {
    healthScore: number,        // Pontuação 0-100
    recommendations: Array<string>, // Recomendações
    trends: Object,             // Tendências
    alerts: Array<Object>       // Alertas ativos
  }
}
```

### **Health Score Calculation**
- **100 pontos:** Performance excelente (< 500ms average)
- **80-99 pontos:** Performance boa (500ms - 1s)
- **60-79 pontos:** Performance aceitável (1s - 2s)
- **< 60 pontos:** Performance ruim (> 2s)

---

## ✅ **ValidationEngine**

Sistema de validações automáticas e business rules.

### **Validation Methods**

#### `ValidationEngine.validateForeignKeys(tableName, data)`
Valida foreign keys automaticamente.

**Parâmetros:**
- `tableName` (string) - Tabela de destino
- `data` (Object) - Dados a validar

**Retorno:**
```javascript
{
  isValid: boolean,
  errors: Array<string>  // Lista de erros encontrados
}
```

#### `ValidationEngine.validateBusinessRules(tableName, data, operation)`
Valida regras de negócio específicas.

**Parâmetros:**
- `tableName` (string) - Tabela
- `data` (Object) - Dados
- `operation` (string) - Operação ('insert', 'update', 'delete')

---

## 🌐 **API Endpoints**

Endpoints REST disponíveis via Google Apps Script.

### **Authentication Endpoints**

#### `POST /api/auth/login`
Realiza login no sistema.

**Body:**
```javascript
{
  email: string,
  senha: string
}
```

**Response:**
```javascript
{
  success: boolean,
  session?: {
    id: string,         // Token da sessão
    user: Object,       // Dados do usuário
    expires_at: string
  },
  error?: string
}
```

#### `POST /api/auth/logout`
Realiza logout e destrói sessão.

**Headers:**
```
Authorization: Bearer {session_token}
```

### **Data Endpoints**

#### `GET /api/data/{tableName}`
Lista registros de uma tabela.

**Query Parameters:**
- `limit` (number) - Máximo de registros
- `offset` (number) - Offset para paginação
- `filter` (string) - Filtros em JSON

#### `POST /api/data/{tableName}`
Cria novo registro.

**Body:** Object com dados do registro

#### `PUT /api/data/{tableName}/{id}`
Atualiza registro existente.

**Body:** Object com dados para atualizar

#### `DELETE /api/data/{tableName}/{id}`
Remove registro.

### **System Endpoints**

#### `GET /api/system/health`
Obtém status de saúde do sistema.

**Response:**
```javascript
{
  status: 'healthy' | 'warning' | 'critical',
  healthScore: number,
  uptime: number,
  version: string,
  metrics: Object
}
```

#### `GET /api/system/stats`
Estatísticas do sistema.

**Response:**
```javascript
{
  sessions: Object,     // Estatísticas de sessões
  performance: Object,  // Métricas de performance
  cache: Object,        // Estatísticas de cache
  database: Object      // Estatísticas do banco
}
```

---

## 🔧 **Error Handling**

### **Padrão de Retorno de Erro**
```javascript
{
  success: false,
  error: string,        // Mensagem de erro
  code?: string,        // Código de erro
  details?: Object      // Detalhes adicionais
}
```

### **Códigos de Erro Comuns**
- `AUTH_FAILED` - Falha na autenticação
- `SESSION_EXPIRED` - Sessão expirada
- `VALIDATION_ERROR` - Erro de validação
- `NOT_FOUND` - Registro não encontrado
- `PERMISSION_DENIED` - Permissão negada
- `INTERNAL_ERROR` - Erro interno do sistema

### **HTTP Status Codes**
- `200` - Sucesso
- `400` - Bad Request (dados inválidos)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (sem permissão)
- `404` - Not Found (não encontrado)
- `500` - Internal Server Error

---

## 📊 **Rate Limiting**

### **Limites Atuais**
- **Requests por usuário:** 100/minuto
- **Requests por IP:** 1000/minuto
- **Operações de escrita:** 50/minuto por usuário
- **Uploads:** 10MB/request

### **Headers de Rate Limiting**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1640995200
```

---

## 👤 **User Management APIs**

APIs para gerenciamento e obtenção de dados do usuário logado.

### **getCurrentLoggedUser()**
Retorna dados do usuário logado atualmente (versão robusta para menu dinâmico).

**Método:** 3 camadas de verificação para máxima confiabilidade
1. **Sessão ativa armazenada** - Via `currentSessionId` nas propriedades
2. **Sessão ativa mais recente** - Busca na tabela `sessoes`
3. **Fallback seguro** - Retorna `null` se não encontrar usuário válido

**Retorno:**
```javascript
{
  uid: string,              // ID único do usuário
  nome: string,             // Nome completo do usuário
  metodo: string           // Método usado ('sessao_ativa', 'sessao_ativa_recente')
} | null                   // null se não encontrar usuário logado
```

**Exemplo:**
```javascript
const user = getCurrentLoggedUser();
if (user) {
  console.log(`Usuário logado: ${user.nome} (${user.uid})`);
  console.log(`Método de obtenção: ${user.metodo}`);
}
```

**Logs detalhados:**
- `🔍 SessionId recuperado das propriedades`
- `✅ Usuário encontrado via sessão ativa`
- `❌ Nenhum usuário logado encontrado`

### **getCurrentUserForFilter()**
Versão simplificada para filtros (compatibilidade com código existente).

**Retorno:**
```javascript
{
  uid: string,              // ID único do usuário
  nome: string              // Nome completo do usuário
} | null                    // null se não encontrar usuário
```

---

## 🎯 **Sistema de Definição de Alvos**

APIs específicas para o sistema de definição de alvos de atividades implementado na v2.0.0-alpha.3.

### **searchMembersByCriteria(filters)**
Busca membros com filtros avançados para definição de alvos.

**Parâmetros:**
- `filters` (Object) - Critérios de busca

**filters Structure:**
```javascript
{
  dojo: string,         // Filtro por dojo (opcional)
  status: string,       // Filtro por status (opcional)
  nome: string          // Filtro por nome (opcional)
}
```

**Retorno:**
```javascript
{
  ok: boolean,
  items?: Array<Object>, // Lista de membros encontrados
  error?: string
}
```

**items Structure (otimizado):**
```javascript
{
  codigo_sequencial: string,  // ID único do membro
  nome: string,              // Nome completo
  dojo: string,              // Dojo de origem
  status: string             // Status do membro
}
```

**Exemplo:**
```javascript
const result = await searchMembersByCriteria({
  dojo: 'Centro',
  status: 'Ativo'
});

if (result.ok) {
  console.log(`${result.items.length} membros encontrados`);
  result.items.forEach(member => {
    console.log(`${member.nome} (${member.codigo_sequencial})`);
  });
}
```

**Otimizações:**
- **Performance**: Retorna apenas 4 campos essenciais (vs 15+ campos originais)
- **Filtros**: Suporte a busca parcial case-insensitive
- **Backend**: Usa `DatabaseManager.query()` moderno em vez de legacy `_listMembersCore()`

### **saveTargetsDirectly(activityId, memberIds, uid)**
Salva alvos selecionados para uma atividade específica.

**Parâmetros:**
- `activityId` (string) - ID da atividade
- `memberIds` (Array<string>) - Lista de códigos sequenciais dos membros
- `uid` (string) - ID do usuário executando a operação

**Retorno:**
```javascript
{
  ok: boolean,
  created?: number,      // Quantidade de alvos criados
  error?: string
}
```

**Exemplo:**
```javascript
const memberIds = ['M001', 'M003', 'M015'];
const result = await saveTargetsDirectly('ACT-123', memberIds, 'U001');

if (result.ok) {
  console.log(`${result.created} alvos definidos para a atividade`);
}
```

### **Frontend JavaScript APIs**

#### **displayTargetsResults(members, mode)**
Renderiza lista de membros com persistência de seleções.

**Parâmetros:**
- `members` (Array) - Lista de membros retornados da API
- `mode` (string) - 'create' ou 'edit'

**Funcionalidades:**
- **Persistência**: Mantém seleções entre diferentes buscas
- **Ordenação**: Alfabética automática por nome
- **Estados visuais**: Destaque para membros selecionados
- **Responsividade**: Layout adaptado para mobile/desktop

#### **toggleTargetSelection(memberId, mode)**
Alterna seleção de um membro específico.

**Parâmetros:**
- `memberId` (string) - Código sequencial do membro
- `mode` (string) - 'create' ou 'edit'

**Comportamento:**
- **Estado toggle**: Checkbox e Set() sincronizados
- **Feedback visual**: Bordas e cores em tempo real
- **Logs**: Console detalhado para debugging

#### **Sistema de Loading**
```javascript
// Mostrar loading
showTargetsLoading(mode);  // mode: 'create' ou 'edit'

// Esconder loading
hideTargetsLoading(mode);
```

**Estados suportados:**
- `targetsLoading` / `editTargetsLoading` - Spinner durante busca
- `targetsResults` / `editTargetsResults` - Lista de resultados
- `targetsEmpty` / `editTargetsEmpty` - Estado sem resultados

---

## 🔒 **Security**

### **Autenticação Requerida**
Todos os endpoints (exceto login) requerem header:
```
Authorization: Bearer {session_token}
```

### **Input Sanitization**
- Escape automático de HTML
- Validação de tipos de dados
- Sanitização de SQL injection
- Limite de tamanho de payload

### **CORS**
- Domínios permitidos configuráveis
- Headers CORS automáticos
- Preflight requests suportados

---

**📚 Para mais informações:**
- `ARQUITETURA.md` - Estrutura técnica do sistema
- `CONFIGURACAO.md` - Setup e configuração
- `TROUBLESHOOTING.md` - Resolução de problemas
- `DEVELOPMENT.md` - Guia para desenvolvedores