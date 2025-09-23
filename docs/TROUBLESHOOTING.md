# 🔧 TROUBLESHOOTING - Sistema Dojotai V2.0

**Versão:** 2.0.0-alpha.1
**Atualizado:** 23/09/2025
**Status:** ✅ Sistema estável sem problemas críticos conhecidos

---

## 📋 **ÍNDICE DE PROBLEMAS**

1. [🚨 Problemas Críticos](#-problemas-críticos)
2. [⚠️ Problemas de Autenticação](#️-problemas-de-autenticação)
3. [🗄️ Problemas de Database](#️-problemas-de-database)
4. [📝 Problemas de Logs](#-problemas-de-logs)
5. [⚡ Problemas de Performance](#-problemas-de-performance)
6. [🌐 Problemas de Frontend](#-problemas-de-frontend)
7. [🔧 Problemas de Deploy](#-problemas-de-deploy)
8. [📊 Ferramentas de Diagnóstico](#-ferramentas-de-diagnóstico)

---

## 🚨 **PROBLEMAS CRÍTICOS**

### ✅ **NENHUM PROBLEMA CRÍTICO ATIVO**

**Status Atual:** Todos os sistemas estão funcionando perfeitamente.

- ✅ **Sistema de Logs:** Funcionando sem recursão
- ✅ **Sistema de Sessões:** Criação e destruição corretas
- ✅ **Performance:** Health score 100/100
- ✅ **Cache:** Hit rate otimizado (>40%)

---

## ⚠️ **PROBLEMAS DE AUTENTICAÇÃO**

### **Login Falha com "Usuário não encontrado"**

**Sintomas:**
- Usuário existe na planilha mas login falha
- Mensagem: "Usuário não encontrado"

**Diagnóstico:**
```javascript
// Verificar no Apps Script Editor
function debugLogin() {
  const email = 'usuario@exemplo.com';
  const users = DatabaseManager.query('usuarios', { email: email });
  console.log('Usuários encontrados:', users);
}
```

**Soluções:**
1. **Verificar email exato** - Case sensitive
2. **Verificar campo 'ativo'** - Deve ser 'sim'
3. **Limpar cache** - `DatabaseManager.clearCache('usuarios')`

---

### **Sessão Expira Rapidamente**

**Sintomas:**
- Logout automático frequente
- Mensagem: "Sessão expirada"

**Diagnóstico:**
```javascript
// Verificar configuração de timeout
console.log('Session timeout:', APP_CONFIG.SESSION_TIMEOUT);

// Verificar sessões ativas
const stats = getSessionStats();
console.log('Session stats:', stats);
```

**Soluções:**
1. **Aumentar timeout** em `00_config.gs`:
   ```javascript
   SESSION_TIMEOUT: 12 * 60 * 60 * 1000 // 12 horas
   ```
2. **Verificar timezone** - Certificar que está em UTC-3
3. **Limpar sessões órfãs** - `cleanupExpiredSessions()`

---

### **Hash de Senha Incorreto**

**Sintomas:**
- Senha correta mas login falha
- Erro de hash mismatch

**Solução:**
```javascript
// Verificar e recriar hash
function fixPasswordHash() {
  const email = 'usuario@exemplo.com';
  const newPassword = 'novaSenha123';

  const hashedPassword = AuthManager.hashPassword(newPassword);
  const result = DatabaseManager.update('usuarios', email, {
    senha_hash: hashedPassword
  });

  console.log('Password updated:', result);
}
```

---

## 🗄️ **PROBLEMAS DE DATABASE**

### **Tabela Não Encontrada**

**Sintomas:**
- Erro: "Sheet 'table_name' not found"
- Operações CRUD falham

**Diagnóstico:**
```javascript
// Verificar tabelas existentes
function checkTables() {
  const spreadsheet = SpreadsheetApp.openById(APP_CONFIG.SPREADSHEET_ID);
  const sheets = spreadsheet.getSheets();

  sheets.forEach(sheet => {
    console.log('Sheet found:', sheet.getName());
  });
}
```

**Soluções:**
1. **Criar tabela manualmente** na planilha
2. **Executar inicialização**:
   ```javascript
   DatabaseManager.initializeSystem();
   ```
3. **Verificar SPREADSHEET_ID** em `00_config.gs`

---

### **Foreign Key Validation Failed**

**Sintomas:**
- Erro ao inserir dados
- Mensagem: "FK validation failed"

**Diagnóstico:**
```javascript
// Verificar FK específica
function debugFK() {
  const participacao = {
    user_id: 'USR-123',
    atividade_id: 'ATV-456'
  };

  // Verificar se usuário existe
  const user = DatabaseManager.query('usuarios', { uid: participacao.user_id });
  console.log('User exists:', user.data.length > 0);

  // Verificar se atividade existe
  const atividade = DatabaseManager.query('atividades', { id: participacao.atividade_id });
  console.log('Atividade exists:', atividade.data.length > 0);
}
```

**Soluções:**
1. **Verificar se registro pai existe**
2. **Usar IDs corretos** (não rowIds)
3. **Temporariamente desabilitar validação**:
   ```javascript
   APP_CONFIG.ENABLE_FK_VALIDATION = false;
   ```

---

### **Cache Corrupted**

**Sintomas:**
- Dados desatualizados
- Comportamento inconsistente

**Solução:**
```javascript
// Limpar todo o cache
DatabaseManager.clearCache();

// Verificar estatísticas
const stats = DatabaseManager.getCacheStats();
console.log('Cache stats:', stats);
```

---

## 📝 **PROBLEMAS DE LOGS**

### **⚠️ PROBLEMAS RESOLVIDOS**

#### ~~**Recursão Infinita no Logger**~~ ✅ **RESOLVIDO**
- **Problema:** Loops entre Logger ↔ DatabaseManager
- **Solução:** Flag global `_LOGGER_IS_LOGGING` implementada
- **Status:** ✅ Funcionando perfeitamente

#### ~~**IDs Duplicados**~~ ✅ **RESOLVIDO**
- **Problema:** LOG-xxx IDs duplicados
- **Solução:** Geração única com timestamp + random
- **Status:** ✅ Todos os IDs são únicos

#### ~~**Timezone Incorreto**~~ ✅ **RESOLVIDO**
- **Problema:** Logs em UTC+0
- **Solução:** Implementado UTC-3 em todos os timestamps
- **Status:** ✅ Horário do Brasil correto

---

### **Logs Não Aparecem**

**Diagnóstico:**
```javascript
// Verificar nível de log
console.log('Log level:', APP_CONFIG.LOG_LEVEL);

// Forçar log de teste
Logger.error('TEST', 'Teste de log forçado', { timestamp: new Date() });

// Verificar logs na planilha
const logs = DatabaseManager.query('system_logs', {}, { limit: 10 });
console.log('Recent logs:', logs);
```

**Soluções:**
1. **Verificar LOG_LEVEL** - Deve ser 'DEBUG' para ver tudo
2. **Verificar filtros** - Alguns contextos são filtrados
3. **Verificar planilha system_logs** existe

---

### **Spam de Logs**

**Configuração de Filtros:**
```javascript
// Em 00_config.gs - Ajustar filtros
LOG_PERSISTENCE: {
  WARN_EXCLUDE_PATTERNS: [
    'FK validation failed',
    'Cache hit',
    'Query completed'
  ],
  WARN_EXCLUDE_CONTEXTS: [
    'ValidationEngine',
    'PerformanceMonitor'
  ]
}
```

---

## ⚡ **PROBLEMAS DE PERFORMANCE**

### **Sistema Lento (Health Score < 80)**

**Diagnóstico:**
```javascript
// Verificar relatório de performance
const report = PerformanceMonitor.getAdvancedReport();
console.log('Health Score:', report.advanced.healthScore);
console.log('Recommendations:', report.advanced.recommendations);
```

**Soluções Comuns:**
1. **Limpar cache** se hit rate < 30%:
   ```javascript
   DatabaseManager.clearCache();
   ```

2. **Reduzir operações de log**:
   ```javascript
   APP_CONFIG.LOG_LEVEL = 'WARN'; // Só warnings e errors
   ```

3. **Executar limpeza**:
   ```javascript
   cleanupExpiredSessions();
   PerformanceMonitor.cleanup();
   ```

---

### **Timeout nas Operações**

**Sintomas:**
- Operações demoram > 6 minutos
- Script timeout errors

**Soluções:**
1. **Batch operations** para inserções múltiplas
2. **Paginação** para consultas grandes
3. **Assíncronos** quando possível

**Exemplo de Batch Insert:**
```javascript
// Em vez de múltiplos inserts
const batchData = [
  { nome: 'User1', email: 'user1@test.com' },
  { nome: 'User2', email: 'user2@test.com' }
];

// Usar batch insert (se implementado)
DatabaseManager.batchInsert('usuarios', batchData);
```

---

## 🌐 **PROBLEMAS DE FRONTEND**

### **API Não Responde**

**Sintomas:**
- Frontend não consegue conectar
- Erros CORS ou 404

**Diagnóstico:**
1. **Verificar URL** em `app_api.html`
2. **Testar endpoint** diretamente:
   ```bash
   curl "https://script.google.com/macros/s/[SCRIPT_ID]/exec"
   ```

**Soluções:**
1. **Redeployar web app** com permissões públicas
2. **Verificar CORS** configuration
3. **Verificar se script está ativo**

---

### **Dados Não Atualizam**

**Sintomas:**
- Interface mostra dados antigos
- Mudanças não refletem

**Soluções:**
1. **Forçar refresh** sem cache
2. **Limpar localStorage**:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. **Verificar se está usando cache do browser**

---

### **Login Loop Infinito**

**Sintomas:**
- Página de login aparece após login bem-sucedido
- Sessão não persiste

**Diagnóstico:**
```javascript
// Verificar se sessão está sendo salva
const sessionToken = localStorage.getItem('sessionToken');
console.log('Session token:', sessionToken);

// Verificar validade da sessão
validateSession(sessionToken).then(result => {
  console.log('Session validation:', result);
});
```

**Soluções:**
1. **Verificar localStorage** funciona
2. **Verificar token format** correto
3. **Limpar dados corruptos**

---

## 🔧 **PROBLEMAS DE DEPLOY**

### **clasp push Falha**

**Sintomas:**
- `clasp push` retorna erro
- Código não atualiza no Apps Script

**Diagnóstico:**
```bash
# Verificar configuração
clasp status

# Verificar autenticação
clasp whoami

# Verificar .clasp.json
cat .clasp.json
```

**Soluções:**
1. **Reautenticar**:
   ```bash
   clasp logout
   clasp login
   ```

2. **Verificar .clasp.json**:
   ```json
   {
     "scriptId": "SEU_SCRIPT_ID",
     "rootDir": "src"
   }
   ```

3. **Verificar permissões** da planilha

---

### **Web App Não Funciona Após Deploy**

**Sintomas:**
- Deploy bem-sucedido mas app não responde
- Erro 403 ou similar

**Checklist:**
- [ ] Web app configurado como "Executar como: Eu"
- [ ] Acesso configurado como "Qualquer pessoa"
- [ ] Nova versão implantada (não teste)
- [ ] Permissões aceitas para acessar planilhas

---

## 📊 **FERRAMENTAS DE DIAGNÓSTICO**

### **Health Check Completo**

```javascript
function systemHealthCheck() {
  console.log('=== SYSTEM HEALTH CHECK ===');

  // 1. Verificar configuração
  console.log('Config:', {
    spreadsheetId: APP_CONFIG.SPREADSHEET_ID,
    logLevel: APP_CONFIG.LOG_LEVEL,
    environment: APP_CONFIG.ENVIRONMENT
  });

  // 2. Verificar database
  try {
    const users = DatabaseManager.query('usuarios', {}, { limit: 1 });
    console.log('Database OK:', users.success);
  } catch (error) {
    console.error('Database ERROR:', error.message);
  }

  // 3. Verificar performance
  const report = PerformanceMonitor.getAdvancedReport();
  console.log('Performance:', {
    healthScore: report.advanced.healthScore,
    cacheHitRate: report.summary.cacheHitRate
  });

  // 4. Verificar sessões
  const sessionStats = getSessionStats();
  console.log('Sessions:', sessionStats);

  // 5. Verificar logs recentes
  const recentLogs = DatabaseManager.query('system_logs', {}, { limit: 5 });
  console.log('Recent logs count:', recentLogs.data?.length || 0);

  console.log('=== HEALTH CHECK COMPLETE ===');
}
```

### **Database Integrity Check**

```javascript
function databaseIntegrityCheck() {
  console.log('=== DATABASE INTEGRITY CHECK ===');

  // Verificar cada tabela principal
  const tables = ['usuarios', 'atividades', 'membros', 'participacao', 'sessoes'];

  tables.forEach(tableName => {
    try {
      const data = DatabaseManager.query(tableName, {}, { limit: 1 });
      console.log(`✅ ${tableName}:`, data.success ? 'OK' : 'ERROR');
    } catch (error) {
      console.error(`❌ ${tableName}:`, error.message);
    }
  });

  console.log('=== INTEGRITY CHECK COMPLETE ===');
}
```

### **Performance Deep Dive**

```javascript
function performanceDeepDive() {
  console.log('=== PERFORMANCE DEEP DIVE ===');

  // Iniciar medição
  const start = Date.now();

  // Teste de operações
  const testOperations = [
    () => DatabaseManager.query('usuarios', {}, { limit: 10 }),
    () => DatabaseManager.query('atividades', {}, { limit: 10 }),
    () => PerformanceMonitor.getReport()
  ];

  testOperations.forEach((operation, index) => {
    const opStart = Date.now();
    try {
      operation();
      const opTime = Date.now() - opStart;
      console.log(`Operation ${index + 1}: ${opTime}ms`);
    } catch (error) {
      console.error(`Operation ${index + 1}: ERROR -`, error.message);
    }
  });

  const totalTime = Date.now() - start;
  console.log(`Total test time: ${totalTime}ms`);

  // Estatísticas de cache
  const cacheStats = DatabaseManager.getCacheStats();
  console.log('Cache stats:', cacheStats);

  console.log('=== PERFORMANCE ANALYSIS COMPLETE ===');
}
```

---

## 🆘 **QUANDO TUDO MAIS FALHA**

### **Reset Completo do Sistema**

⚠️ **ATENÇÃO:** Só use como último recurso!

```javascript
function emergencySystemReset() {
  console.log('🚨 EMERGENCY SYSTEM RESET STARTING...');

  // 1. Backup de dados críticos
  const criticalData = {
    usuarios: DatabaseManager.query('usuarios', {}),
    atividades: DatabaseManager.query('atividades', {}),
    membros: DatabaseManager.query('membros', {})
  };

  console.log('✅ Critical data backed up');

  // 2. Limpar caches
  DatabaseManager.clearCache();
  console.log('✅ Caches cleared');

  // 3. Limpar logs antigos
  cleanupOldSystemLogs();
  console.log('✅ Old logs cleaned');

  // 4. Limpar sessões
  cleanupExpiredSessions();
  console.log('✅ Sessions cleaned');

  // 5. Reinicializar sistema
  DatabaseManager.initializeSystem();
  console.log('✅ System reinitialized');

  console.log('🎉 EMERGENCY RESET COMPLETE');
  console.log('⚠️ Please test all critical functions');
}
```

### **Rollback para Versão Anterior**

Se tudo falhar:

1. **Recuperar backup** da planilha
2. **Reverter código** para última versão estável:
   ```bash
   git log --oneline  # Ver commits
   git checkout [HASH_DA_VERSAO_ESTAVEL]
   clasp push
   ```
3. **Redeployar** web app
4. **Executar health check**

---

## 📞 **CONTATOS PARA SUPORTE**

### **Informações de Debug**

Ao reportar problemas, sempre incluir:

```javascript
function generateDebugInfo() {
  return {
    version: APP_CONFIG.VERSION,
    timestamp: new Date().toISOString(),
    environment: APP_CONFIG.ENVIRONMENT,
    healthScore: PerformanceMonitor.getAdvancedReport().advanced.healthScore,
    sessionStats: getSessionStats(),
    cacheStats: DatabaseManager.getCacheStats(),
    lastError: Logger.getLastErrors ? Logger.getLastErrors(5) : 'N/A'
  };
}

// Executar e copiar resultado
console.log(JSON.stringify(generateDebugInfo(), null, 2));
```

---

**📚 Para mais informações:**
- `ARQUITETURA.md` - Estrutura técnica do sistema
- `API_REFERENCE.md` - Documentação completa de APIs
- `DEVELOPMENT.md` - Guia para desenvolvedores
- `CONFIGURACAO.md` - Setup e configuração detalhada