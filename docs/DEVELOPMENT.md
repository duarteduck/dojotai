# 👨‍💻 DEVELOPMENT GUIDE - Sistema Dojotai V2.0

**Versão:** 2.0.0-alpha.1
**Atualizado:** 23/09/2025
**Target:** Desenvolvedores e contribuidores

---

## 📋 **QUICK START**

### **Primeiro Setup (5 minutos)**

```bash
# 1. Clone do projeto
git clone [REPO_URL]
cd Sistema-Dojotai

# 2. Setup clasp
npm install -g @google/clasp
clasp login

# 3. Configurar ambiente
echo '{"scriptId":"[SEU_SCRIPT_ID]","rootDir":"src"}' > .clasp.json

# 4. Deploy inicial
clasp push
```

### **Workflow Diário**

```bash
# 1. Pull latest changes
git pull origin main

# 2. Fazer mudanças no código
# 3. Deploy para teste
clasp push

# 4. Verificar logs
clasp logs

# 5. Commit quando funcional
git add .
git commit -m "feat: sua nova funcionalidade"
```

---

## 🏗️ **ARQUITETURA DE DESENVOLVIMENTO**

### **Estrutura de Diretórios**

```
Sistema-Dojotai/
├── src/                     # Código Google Apps Script
│   ├── 00-core/            # Sistema central
│   │   ├── 00_config.gs    # Configurações globais
│   │   ├── database_manager.gs # CRUD + Logger
│   │   ├── session_manager.gs  # Gestão de sessões
│   │   └── data_dictionary.gs  # Schema + validações
│   │
│   ├── 01-business/        # Lógica de negócio
│   │   ├── auth.gs         # Autenticação
│   │   ├── atividades.gs   # Gestão de atividades
│   │   ├── membros.gs      # Gestão de membros
│   │   ├── participacao.gs # Sistema de participação
│   │   └── performance_monitor.gs # Monitoramento
│   │
│   └── 02-api/            # Endpoints web
│       ├── doGet.gs       # Router principal
│       ├── doPost.gs      # Handlers POST
│       └── api_handlers.gs # Controllers específicos
│
├── docs/                   # Documentação
├── frontend/              # Arquivos HTML/JS/CSS
└── tests/                # Testes (futuro)
```

### **Padrões de Arquitetura**

#### **MVC Pattern**
- **Model:** `data_dictionary.gs` + `database_manager.gs`
- **View:** Arquivos HTML na raiz
- **Controller:** `api_handlers.gs` + business logic

#### **Separation of Concerns**
- **Core:** Funcionalidades fundamentais (DB, Auth, Logs)
- **Business:** Regras de negócio específicas do dojo
- **API:** Interface web e endpoints REST

---

## 📝 **PADRÕES DE CÓDIGO**

### **Naming Conventions**

#### **Arquivos**
```javascript
// Google Apps Script (.gs)
database_manager.gs      // snake_case
session_manager.gs
auth.gs

// Frontend (.html)
view-membros.html       // kebab-case
app-router.html
```

#### **Funções e Variáveis**
```javascript
// Functions - camelCase
function createSession() {}
function validateUser() {}

// Classes - PascalCase
class DatabaseManager {}
class Logger {}

// Constants - UPPER_SNAKE_CASE
const APP_CONFIG = {};
const DEFAULT_TIMEOUT = 5000;

// Variables - camelCase
let sessionToken = '';
const userData = {};
```

#### **Database**
```javascript
// Tables - snake_case
usuarios
atividades
system_logs

// Fields - snake_case
user_id
created_at
session_id
```

### **Code Structure**

#### **Função Padrão**
```javascript
/**
 * Descrição clara da função
 * @param {string} param1 - Descrição do parâmetro
 * @param {Object} param2 - Objeto com propriedades
 * @returns {Object} Resultado da operação
 */
function exemploFuncao(param1, param2 = {}) {
  try {
    // Log de entrada (se relevante)
    Logger.debug('ModuleName', 'Iniciando operação', { param1 });

    // Validações
    if (!param1) {
      throw new Error('param1 é obrigatório');
    }

    // Lógica principal
    const result = processarDados(param1, param2);

    // Log de sucesso
    Logger.info('ModuleName', 'Operação concluída', { resultId: result.id });

    // Retorno padronizado
    return {
      success: true,
      data: result,
      message: 'Operação realizada com sucesso'
    };

  } catch (error) {
    // Log de erro
    Logger.error('ModuleName', 'Erro na operação', {
      error: error.message,
      param1
    });

    // Retorno de erro padronizado
    return {
      success: false,
      error: error.message,
      code: 'OPERATION_FAILED'
    };
  }
}
```

#### **Class Structure**
```javascript
/**
 * Classe para gerenciar [funcionalidade]
 */
class ExemploManager {

  /**
   * Método estático para operação comum
   */
  static operacaoComum() {
    // Implementação
  }

  /**
   * Método de instância
   */
  metodoInstancia() {
    // Implementação
  }

  /**
   * Método privado (convenção com _)
   */
  static _metodoPrivado() {
    // Implementação
  }
}
```

---

## 🗄️ **TRABALHANDO COM DATABASE**

### **CRUD Operations**

#### **Create (Insert)**
```javascript
// Inserção simples
const userData = {
  nome: 'João Silva',
  email: 'joao@email.com',
  senha: 'password123'
};

const result = await DatabaseManager.insert('usuarios', userData);
if (result.success) {
  console.log('Usuário criado:', result.id);
}
```

#### **Read (Query)**
```javascript
// Consulta simples
const users = await DatabaseManager.query('usuarios', { ativo: 'sim' });

// Consulta com opções
const recentUsers = await DatabaseManager.query('usuarios',
  { ativo: 'sim' },
  { limit: 10, orderBy: 'created_at', orderDir: 'desc' }
);

// Consulta específica por ID
const user = await DatabaseManager.query('usuarios', { uid: 'USR-123' });
```

#### **Update**
```javascript
// Atualização
const updateData = { nome: 'João Santos' };
const result = DatabaseManager.update('usuarios', 'USR-123', updateData);

// Verificar sucesso (update retorna {} quando bem-sucedido)
if (!result.error) {
  console.log('Atualização bem-sucedida');
}
```

#### **Delete**
```javascript
// Remoção
const result = await DatabaseManager.delete('usuarios', 'USR-123');
if (result.success) {
  console.log('Usuário removido');
}
```

### **Advanced Patterns**

#### **Transações Simuladas**
```javascript
async function criarUsuarioCompleto(userData) {
  try {
    // Começar "transação"
    const startTime = Date.now();

    // 1. Criar usuário
    const userResult = await DatabaseManager.insert('usuarios', userData);
    if (!userResult.success) {
      throw new Error('Falha ao criar usuário');
    }

    // 2. Criar sessão inicial
    const sessionResult = await createSession(userResult.id);
    if (!sessionResult.ok) {
      // Rollback: remover usuário criado
      await DatabaseManager.delete('usuarios', userResult.id);
      throw new Error('Falha ao criar sessão');
    }

    Logger.info('UserCreation', 'Usuário completo criado', {
      userId: userResult.id,
      sessionId: sessionResult.session.id,
      duration: Date.now() - startTime
    });

    return {
      success: true,
      user: userResult.data,
      session: sessionResult.session
    };

  } catch (error) {
    Logger.error('UserCreation', 'Falha na criação completa', {
      error: error.message,
      userData: userData.email // Não logar dados sensíveis
    });

    return { success: false, error: error.message };
  }
}
```

#### **Bulk Operations**
```javascript
async function bulkInsertUsers(usersData) {
  const results = [];
  const errors = [];

  for (const userData of usersData) {
    try {
      const result = await DatabaseManager.insert('usuarios', userData);
      results.push(result);
    } catch (error) {
      errors.push({ userData, error: error.message });
    }
  }

  return {
    success: errors.length === 0,
    created: results.length,
    errors: errors
  };
}
```

---

## 📝 **SISTEMA DE LOGS**

### **Usando o Logger**

#### **Níveis de Log**
```javascript
// DEBUG - Informações detalhadas (não persistidas)
Logger.debug('ModuleName', 'Variável X tem valor Y', { x: value });

// INFO - Operações importantes (persistidas seletivamente)
Logger.info('SessionManager', 'Sessão criada', { sessionId, userId });

// WARN - Situações que requerem atenção (filtradas)
Logger.warn('ValidationEngine', 'FK validation failed', { table, field });

// ERROR - Erros críticos (sempre persistidos)
Logger.error('DatabaseManager', 'Falha na conexão', { error: error.message });
```

#### **Contextos Importantes**
Use contextos específicos para facilitar debugging:

```javascript
// Contextos que sempre são logados
'SessionManager'     // Gestão de sessões
'AuthManager'        // Autenticação
'UserAction'         // Ações do usuário
'BusinessLogic'      // Regras de negócio críticas
'SecurityManager'    // Eventos de segurança
'Application'        // Eventos de aplicação

// Contextos filtrados (menos importantes)
'ValidationEngine'   // Validações automáticas
'PerformanceMonitor' // Métricas de performance
'CacheManager'       // Operações de cache
```

#### **Best Practices para Logs**
```javascript
// ✅ BOM: Log com contexto útil
Logger.info('UserAction', 'Usuário fez login', {
  userId: user.id,
  ip: request.ip,
  userAgent: request.userAgent
});

// ❌ RUIM: Log genérico sem contexto
Logger.info('System', 'Login successful');

// ✅ BOM: Error log com detalhes para debugging
Logger.error('DatabaseManager', 'Insert failed', {
  table: 'usuarios',
  data: { email: userData.email }, // Não incluir senhas!
  error: error.message
});

// ❌ RUIM: Error log sem informações suficientes
Logger.error('Database', 'Error occurred');
```

---

## 🔒 **SEGURANÇA E VALIDAÇÕES**

### **Autenticação**

#### **Criando Usuários**
```javascript
function criarUsuarioSeguro(userData) {
  // 1. Validar dados de entrada
  if (!userData.email || !userData.senha) {
    return { success: false, error: 'Email e senha obrigatórios' };
  }

  // 2. Verificar se email já existe
  const existingUser = DatabaseManager.query('usuarios', { email: userData.email });
  if (existingUser.data.length > 0) {
    return { success: false, error: 'Email já cadastrado' };
  }

  // 3. Hash da senha
  const hashedPassword = AuthManager.hashPassword(userData.senha);

  // 4. Preparar dados seguros
  const safeUserData = {
    nome: userData.nome,
    email: userData.email.toLowerCase().trim(),
    senha_hash: hashedPassword, // Nunca salvar senha em texto plano
    role: userData.role || 'membro',
    ativo: 'sim'
  };

  // 5. Inserir no banco
  return DatabaseManager.insert('usuarios', safeUserData);
}
```

#### **Validação de Sessões**
```javascript
function requererAutenticacao(sessionToken) {
  // 1. Verificar se token foi fornecido
  if (!sessionToken) {
    return { valid: false, error: 'Token de sessão requerido' };
  }

  // 2. Validar formato do token
  if (!sessionToken.startsWith('sess_')) {
    return { valid: false, error: 'Formato de token inválido' };
  }

  // 3. Validar sessão no banco
  const sessionResult = validateSession(sessionToken);
  if (!sessionResult.ok) {
    return { valid: false, error: sessionResult.error };
  }

  // 4. Retornar dados do usuário
  return {
    valid: true,
    user: sessionResult.session.user_id,
    session: sessionResult.session
  };
}
```

### **Input Sanitization**

```javascript
function sanitizeInput(input, type = 'string') {
  switch (type) {
    case 'email':
      return input.toLowerCase().trim();

    case 'name':
      return input.trim().replace(/[<>]/g, ''); // Remove HTML tags básicos

    case 'number':
      const num = parseFloat(input);
      return isNaN(num) ? 0 : num;

    case 'boolean':
      return input === true || input === 'true' || input === 'sim';

    default:
      return String(input).trim();
  }
}

// Uso
const userData = {
  nome: sanitizeInput(rawData.nome, 'name'),
  email: sanitizeInput(rawData.email, 'email'),
  idade: sanitizeInput(rawData.idade, 'number')
};
```

---

## ⚡ **PERFORMANCE E OTIMIZAÇÃO**

### **Cache Strategy**

#### **Usando Cache Efetivamente**
```javascript
// ✅ BOM: Usar cache para dados que não mudam frequentemente
const users = await DatabaseManager.query('usuarios', filters, { useCache: true });

// ✅ BOM: Cache para lookups frequentes
function getUserByEmail(email) {
  // Cache automático está ativo para queries por default
  return DatabaseManager.query('usuarios', { email });
}

// ❌ RUIM: Cache para dados que mudam constantemente
const activeSessions = await DatabaseManager.query('sessoes',
  { active: 'sim' },
  { useCache: true } // Sessões mudam frequentemente!
);
```

#### **Gerenciamento Manual de Cache**
```javascript
// Limpar cache após operações que alteram dados
async function updateUserProfile(userId, newData) {
  const result = DatabaseManager.update('usuarios', userId, newData);

  if (!result.error) {
    // Limpar cache da tabela para garantir dados atualizados
    DatabaseManager.clearCache('usuarios');
  }

  return result;
}
```

### **Performance Monitoring**

#### **Medindo Performance de Operações**
```javascript
async function operacaoMonitorada() {
  // Iniciar medição
  const measurementId = PerformanceMonitor.start('minha_operacao');

  try {
    // Sua operação aqui
    const result = await DatabaseManager.query('usuarios', {});

    // Finalizar medição com sucesso
    PerformanceMonitor.end(measurementId, {
      success: true,
      recordCount: result.data.length
    });

    return result;

  } catch (error) {
    // Finalizar medição com erro
    PerformanceMonitor.end(measurementId, {
      success: false,
      error: error.message
    });

    throw error;
  }
}
```

#### **Otimizações Comuns**
```javascript
// ✅ BOM: Usar limit em queries grandes
const recentUsers = await DatabaseManager.query('usuarios',
  {},
  { limit: 50, orderBy: 'created_at' }
);

// ✅ BOM: Filtrar dados na query, não no código
const activeUsers = await DatabaseManager.query('usuarios', { ativo: 'sim' });

// ❌ RUIM: Carregar tudo e filtrar depois
const allUsers = await DatabaseManager.query('usuarios', {});
const activeUsers = allUsers.data.filter(user => user.ativo === 'sim');
```

---

## 🌐 **DESENVOLVIMENTO DE API**

### **Criando Novos Endpoints**

#### **1. Definir no Router (`doGet.gs`)**
```javascript
function doGet(e) {
  const path = e.parameter.path || '';

  switch (path) {
    case 'health':
      return createJsonResponse(getSystemHealth());

    case 'meu-novo-endpoint':
      return handleMeuNovoEndpoint(e);

    default:
      return createJsonResponse({ error: 'Endpoint não encontrado' }, 404);
  }
}
```

#### **2. Implementar Handler**
```javascript
/**
 * Handler para meu novo endpoint
 * @param {Object} e - Event object do Google Apps Script
 * @returns {Object} JSON response
 */
function handleMeuNovoEndpoint(e) {
  try {
    // Verificar autenticação se necessário
    const sessionToken = e.parameter.session;
    if (sessionToken) {
      const authResult = requererAutenticacao(sessionToken);
      if (!authResult.valid) {
        return createJsonResponse({ error: authResult.error }, 401);
      }
    }

    // Lógica do endpoint
    const result = processarLogicaEspecifica(e.parameter);

    // Log da operação
    Logger.info('API', 'Endpoint meu-novo-endpoint chamado', {
      parameters: e.parameter,
      success: result.success
    });

    return createJsonResponse(result);

  } catch (error) {
    Logger.error('API', 'Erro no endpoint meu-novo-endpoint', {
      error: error.message,
      parameters: e.parameter
    });

    return createJsonResponse({ error: 'Erro interno do servidor' }, 500);
  }
}
```

#### **3. Função de Processamento**
```javascript
function processarLogicaEspecifica(parameters) {
  // Sua lógica aqui
  return {
    success: true,
    data: { message: 'Processamento concluído' }
  };
}
```

### **Response Helpers**

```javascript
/**
 * Criar response JSON padronizada
 * @param {Object} data - Dados a retornar
 * @param {number} statusCode - HTTP status code
 * @returns {TextOutput} Google Apps Script response
 */
function createJsonResponse(data, statusCode = 200) {
  const response = ContentService.createTextOutput(JSON.stringify(data));
  response.setMimeType(ContentService.MimeType.JSON);

  // Headers CORS
  response.setHeaders({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });

  return response;
}

/**
 * Response de sucesso padronizada
 */
function successResponse(data, message = 'Operação realizada com sucesso') {
  return createJsonResponse({
    success: true,
    message: message,
    data: data
  });
}

/**
 * Response de erro padronizada
 */
function errorResponse(message, code = 'GENERAL_ERROR', statusCode = 400) {
  return createJsonResponse({
    success: false,
    error: message,
    code: code
  }, statusCode);
}
```

---

## 🧪 **TESTING E DEBUGGING**

### **Manual Testing**

#### **Testando Funções no Apps Script Editor**
```javascript
/**
 * Função de teste para operações de usuário
 */
function testUserOperations() {
  console.log('=== TESTE: Operações de Usuário ===');

  // Teste 1: Criar usuário
  const userData = {
    nome: 'Teste User',
    email: 'teste@exemplo.com',
    senha: 'teste123'
  };

  const createResult = criarUsuarioSeguro(userData);
  console.log('Criar usuário:', createResult);

  if (createResult.success) {
    // Teste 2: Fazer login
    const loginResult = authenticateUser(userData.email, userData.senha);
    console.log('Login:', loginResult);

    if (loginResult.success) {
      // Teste 3: Criar sessão
      const sessionResult = createSession(loginResult.user.uid);
      console.log('Criar sessão:', sessionResult);

      // Teste 4: Validar sessão
      if (sessionResult.ok) {
        const validateResult = validateSession(sessionResult.session.id);
        console.log('Validar sessão:', validateResult);

        // Teste 5: Destruir sessão
        const destroyResult = destroySession(sessionResult.session.id);
        console.log('Destruir sessão:', destroyResult);
      }
    }

    // Limpeza: Remover usuário de teste
    DatabaseManager.delete('usuarios', createResult.id);
    console.log('Usuário de teste removido');
  }

  console.log('=== TESTE CONCLUÍDO ===');
}
```

#### **Health Check Automatizado**
```javascript
function runAutomatedHealthCheck() {
  const checks = [
    {
      name: 'Database Connection',
      test: () => DatabaseManager.query('usuarios', {}, { limit: 1 })
    },
    {
      name: 'Session Management',
      test: () => getSessionStats()
    },
    {
      name: 'Performance Monitor',
      test: () => PerformanceMonitor.getReport()
    },
    {
      name: 'Cache System',
      test: () => DatabaseManager.getCacheStats()
    }
  ];

  const results = checks.map(check => {
    try {
      const result = check.test();
      return {
        name: check.name,
        status: 'PASS',
        result: result
      };
    } catch (error) {
      return {
        name: check.name,
        status: 'FAIL',
        error: error.message
      };
    }
  });

  const passedChecks = results.filter(r => r.status === 'PASS').length;
  const totalChecks = results.length;

  console.log(`Health Check: ${passedChecks}/${totalChecks} checks passed`);
  results.forEach(result => {
    console.log(`${result.status === 'PASS' ? '✅' : '❌'} ${result.name}`);
    if (result.status === 'FAIL') {
      console.log(`   Error: ${result.error}`);
    }
  });

  return {
    passed: passedChecks,
    total: totalChecks,
    results: results
  };
}
```

### **Debugging Techniques**

#### **Logger para Debugging**
```javascript
function debugComplexOperation(inputData) {
  // Log início
  Logger.debug('Debug', 'Iniciando operação complexa', { inputData });

  try {
    // Step 1
    Logger.debug('Debug', 'Step 1: Validando dados');
    const validatedData = validateData(inputData);

    // Step 2
    Logger.debug('Debug', 'Step 2: Processando', { validatedData });
    const processedData = processData(validatedData);

    // Step 3
    Logger.debug('Debug', 'Step 3: Salvando resultado');
    const result = saveData(processedData);

    Logger.debug('Debug', 'Operação concluída com sucesso', { resultId: result.id });

    return result;

  } catch (error) {
    Logger.error('Debug', 'Falha na operação complexa', {
      error: error.message,
      inputData,
      stack: error.stack
    });
    throw error;
  }
}
```

#### **Performance Debugging**
```javascript
function debugPerformance() {
  const operations = [
    { name: 'Query Users', fn: () => DatabaseManager.query('usuarios', {}) },
    { name: 'Query Activities', fn: () => DatabaseManager.query('atividades', {}) },
    { name: 'Cache Stats', fn: () => DatabaseManager.getCacheStats() }
  ];

  operations.forEach(op => {
    const start = Date.now();
    try {
      const result = op.fn();
      const duration = Date.now() - start;
      console.log(`${op.name}: ${duration}ms - SUCCESS`);
    } catch (error) {
      const duration = Date.now() - start;
      console.log(`${op.name}: ${duration}ms - ERROR: ${error.message}`);
    }
  });
}
```

---

## 🚀 **DEPLOY E CI/CD**

### **Processo de Deploy**

#### **1. Pre-Deploy Checklist**
```javascript
function preDeployCheck() {
  const checks = [];

  // Verificar configuração
  checks.push({
    name: 'Configuration',
    status: APP_CONFIG.SPREADSHEET_ID ? 'PASS' : 'FAIL'
  });

  // Verificar database
  try {
    DatabaseManager.query('usuarios', {}, { limit: 1 });
    checks.push({ name: 'Database', status: 'PASS' });
  } catch (error) {
    checks.push({ name: 'Database', status: 'FAIL', error: error.message });
  }

  // Verificar logs
  checks.push({
    name: 'Logs Level',
    status: APP_CONFIG.LOG_LEVEL === 'INFO' ? 'PASS' : 'WARN'
  });

  return checks;
}
```

#### **2. Deploy Script**
```bash
#!/bin/bash
# deploy.sh

echo "🚀 Starting deployment..."

# Pre-deploy checks
echo "1. Running pre-deploy checks..."
npm run check || exit 1

# Push code
echo "2. Pushing code to Google Apps Script..."
clasp push || exit 1

# Run post-deploy tests
echo "3. Running post-deploy tests..."
npm run test:production || exit 1

echo "✅ Deployment successful!"
```

#### **3. Post-Deploy Validation**
```javascript
function postDeployValidation() {
  console.log('🔍 Running post-deploy validation...');

  // Test critical endpoints
  const healthCheck = runAutomatedHealthCheck();
  if (healthCheck.passed < healthCheck.total) {
    console.error('❌ Health check failed!');
    return false;
  }

  // Test performance
  const performanceReport = PerformanceMonitor.getAdvancedReport();
  if (performanceReport.advanced.healthScore < 80) {
    console.warn('⚠️ Performance below threshold');
  }

  console.log('✅ Post-deploy validation completed');
  return true;
}
```

---

## 📚 **RECURSOS E REFERÊNCIAS**

### **Documentação Oficial**
- [Google Apps Script Reference](https://developers.google.com/apps-script/reference)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [clasp CLI Documentation](https://github.com/google/clasp)

### **Ferramentas Úteis**
- **VS Code Extensions:**
  - Apps Script (Google)
  - JavaScript (ES6) code snippets
  - Prettier (formatação)

### **Links Internos**
- `ARQUITETURA.md` - Entenda a estrutura do sistema
- `API_REFERENCE.md` - Referência completa de APIs
- `CONFIGURACAO.md` - Setup e configuração
- `TROUBLESHOOTING.md` - Resolução de problemas

---

## ❓ **FAQ PARA DESENVOLVEDORES**

### **Q: Como adicionar uma nova tabela ao sistema?**
```javascript
// 1. Adicionar definição em data_dictionary.gs
const NOVATABELA_DEFINITION = {
  name: 'nova_tabela',
  primaryKey: 'id',
  fields: {
    id: { type: 'string', required: true },
    nome: { type: 'string', required: true },
    created_at: { type: 'datetime', auto: true }
  }
};

// 2. Adicionar ao DATA_DICTIONARY
DATA_DICTIONARY.nova_tabela = NOVATABELA_DEFINITION;

// 3. Executar inicialização
DatabaseManager.initializeSystem();
```

### **Q: Como implementar uma nova funcionalidade de negócio?**
1. Criar arquivo em `src/01-business/minha_funcionalidade.gs`
2. Implementar lógica de negócio
3. Adicionar endpoints em `src/02-api/api_handlers.gs`
4. Criar testes manuais
5. Atualizar documentação

### **Q: Como debuggar problemas de performance?**
```javascript
// 1. Verificar health score
const report = PerformanceMonitor.getAdvancedReport();
console.log('Health Score:', report.advanced.healthScore);

// 2. Verificar cache hit rate
const cacheStats = DatabaseManager.getCacheStats();
console.log('Cache Hit Rate:', cacheStats.hitRate);

// 3. Executar performance deep dive
debugPerformance();
```

### **Q: Como contribuir com o projeto?**
1. **Fork** do repositório
2. **Branch** para sua feature: `git checkout -b feature/minha-feature`
3. **Commit** suas mudanças: `git commit -m 'feat: adicionar minha feature'`
4. **Push** para branch: `git push origin feature/minha-feature`
5. **Pull Request** para branch main

---

**🎯 Próximos Passos:**
1. Ler `ARQUITETURA.md` para entender a estrutura
2. Configurar ambiente conforme `CONFIGURACAO.md`
3. Implementar sua primeira funcionalidade
4. Executar testes e health checks
5. Fazer deploy seguindo as práticas recomendadas