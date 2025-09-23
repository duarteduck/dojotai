# ⚙️ CONFIGURAÇÃO - Sistema Dojotai V2.0

**Versão:** 2.0.0-alpha.1
**Atualizado:** 23/09/2025
**Plataforma:** Google Apps Script + Google Sheets

---

## 📋 **PRÉ-REQUISITOS**

### **Contas Necessárias**
- ✅ **Google Account** - Conta Google ativa
- ✅ **Google Drive** - Acesso ao Google Drive
- ✅ **Google Sheets** - Permissões para criar planilhas
- ✅ **Google Apps Script** - Acesso ao editor de scripts

### **Ferramentas de Desenvolvimento**
- ✅ **clasp CLI** - Command Line Apps Script Projects
- ✅ **Node.js** - v14+ para execução do clasp
- ✅ **Git** - Controle de versão
- ✅ **Editor de Código** - VS Code recomendado

---

## 🚀 **INSTALAÇÃO INICIAL**

### **1. Setup do Ambiente**

#### **Instalar clasp CLI**
```bash
npm install -g @google/clasp
```

#### **Autenticar com Google**
```bash
clasp login
```

#### **Verificar autenticação**
```bash
clasp whoami
```

### **2. Clone do Projeto**

#### **Clonar repositório**
```bash
git clone [URL_DO_REPOSITORIO]
cd Sistema-Dojotai
```

#### **Configurar clasp**
```bash
# Criar arquivo .clasp.json
echo '{"scriptId":"[SCRIPT_ID]","rootDir":"src"}' > .clasp.json
```

### **3. Configuração do Google Sheets**

#### **Criar Planilha Principal**
1. Acesse [Google Sheets](https://sheets.google.com)
2. Criar nova planilha: "Sistema Dojotai - Database"
3. Anotar ID da planilha (URL: `...spreadsheets/d/[ID]/...`)

#### **Configurar Abas/Tabelas**
Criar as seguintes abas na planilha:

**Core Tables:**
- `usuarios` - Usuários do sistema
- `atividades` - Atividades/aulas do dojo
- `membros` - Membros do dojo
- `participacao` - Participação em atividades
- `sessoes` - Sessões ativas
- `system_logs` - Logs do sistema
- `performance_logs` - Logs de performance

**Auxiliary Tables (Opcionais):**
- `notificacoes` - Sistema de notificações
- `preferencias` - Configurações de usuário
- `historico` - Auditoria de ações

---

## 🔧 **CONFIGURAÇÃO DO SISTEMA**

### **Arquivo de Configuração Principal**

Editar `src/00-core/00_config.gs`:

```javascript
const APP_CONFIG = {
  // Identificação da planilha
  SPREADSHEET_ID: 'SUA_PLANILHA_ID_AQUI',

  // Configurações de ambiente
  ENVIRONMENT: 'development', // 'development' | 'staging' | 'production'
  VERSION: '2.0.0-alpha.1',

  // Timezone e localização
  TZ: 'America/Sao_Paulo',    // UTC-3 Brasil
  LOCALE: 'pt-BR',

  // Configurações de log
  LOG_LEVEL: 'INFO',          // 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'

  // Cache configuration
  CACHE_TTL: 5 * 60 * 1000,   // 5 minutos em ms

  // Session configuration
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 horas em ms

  // Performance monitoring
  PERFORMANCE_MONITORING: true,
  HEALTH_CHECK_INTERVAL: 60000, // 1 minuto

  // Log persistence rules
  LOG_PERSISTENCE: {
    ALWAYS_PERSIST: ['ERROR'],
    IMPORTANT_CONTEXTS: [
      'SessionManager',
      'SecurityManager',
      'Application',
      'AuthManager',
      'UserAction',
      'BusinessLogic'
    ],
    WARN_EXCLUDE_PATTERNS: [
      'FK validation failed',
      'validation completed',
      'Cache',
      'Query completed',
      'Insert completed'
    ],
    WARN_EXCLUDE_CONTEXTS: [
      'ValidationEngine',
      'PerformanceMetrics',
      'PerformanceMonitor'
    ]
  }
};
```

### **Configurações de Segurança**

#### **Hash de Senhas**
O sistema usa SHA-256 com salt personalizado:

```javascript
// Em src/01-business/auth.gs
const SECURITY_CONFIG = {
  SALT: 'SeuSaltPersonalizadoAqui2025!',
  HASH_ALGORITHM: 'SHA-256',
  MIN_PASSWORD_LENGTH: 6,
  SESSION_TOKEN_LENGTH: 16
};
```

#### **Configurações de CORS**
```javascript
// Headers de CORS permitidos
const CORS_CONFIG = {
  allowedOrigins: [
    'https://script.google.com',
    'https://docs.google.com',
    'localhost:3000' // Para desenvolvimento
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With'
  ],
  allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
```

---

## 📊 **CONFIGURAÇÃO DO BANCO DE DADOS**

### **Schema das Tabelas**

As tabelas são configuradas automaticamente pelo `data_dictionary.gs`. Estrutura principal:

#### **Tabela: usuarios**
```
Campos:
- id (primaryKey)
- uid (unique)
- nome (required)
- email (unique, required)
- senha_hash (required)
- role (default: 'membro')
- ativo (default: 'sim')
- created_at (auto)
- updated_at (auto)
```

#### **Tabela: sessoes**
```
Campos:
- id (primaryKey)
- session_id (unique)
- user_id (foreignKey → usuarios.uid)
- created_at (auto)
- expires_at (required)
- ip_address (optional)
- device_info (JSON)
- active (default: 'sim')
- last_activity (auto)
- destroyed_at (optional)
```

### **Inicialização Automática**

O sistema verifica e cria automaticamente:
1. Tabelas ausentes
2. Campos obrigatórios
3. Índices necessários
4. Dados iniciais (admin user)

Para forçar inicialização:
```javascript
// No Apps Script Editor
DatabaseManager.initializeSystem();
```

---

## 🔐 **CONFIGURAÇÃO DE AUTENTICAÇÃO**

### **Usuário Administrador Inicial**

Criar usuário admin via script:

```javascript
// Executar no Apps Script Editor
function createAdminUser() {
  const adminData = {
    nome: 'Administrator',
    email: 'admin@dojo.com',
    senha: 'admin123',  // Alterar imediatamente após primeiro login
    role: 'admin',
    ativo: 'sim'
  };

  const result = AuthManager.createUser(adminData);
  console.log('Admin criado:', result);
}
```

### **Configurações de Sessão**

```javascript
// Configurações em APP_CONFIG
SESSION_CONFIG: {
  TIMEOUT: 8 * 60 * 60 * 1000,    // 8 horas
  CLEANUP_INTERVAL: 60 * 60 * 1000, // 1 hora
  MAX_SESSIONS_PER_USER: 3,        // Máximo de sessões simultâneas
  EXTEND_ON_ACTIVITY: true         // Estender sessão em atividade
}
```

---

## ⚡ **CONFIGURAÇÃO DE PERFORMANCE**

### **Cache Settings**

```javascript
CACHE_CONFIG: {
  TTL: 5 * 60 * 1000,           // 5 minutos
  MAX_SIZE: 100,                // Máximo de entradas
  ENABLED_TABLES: [             // Tabelas com cache
    'usuarios',
    'atividades',
    'membros'
  ],
  EXCLUDE_OPERATIONS: ['system_logs'] // Operações sem cache
}
```

### **Performance Monitoring**

```javascript
PERFORMANCE_CONFIG: {
  ENABLED: true,
  HEALTH_CHECK_INTERVAL: 60000,  // 1 minuto
  MAX_RESPONSE_TIME: 2000,       // 2 segundos
  ALERT_THRESHOLD: 5000,         // 5 segundos
  CLEANUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
  KEEP_LOGS_DAYS: 7              // Manter logs por 7 dias
}
```

---

## 🌐 **CONFIGURAÇÃO WEB**

### **Deploy como Web App**

1. **No Google Apps Script Editor:**
   - Ir em "Implantar" → "Nova implantação"
   - Tipo: "Aplicativo da web"
   - Executar como: "Eu"
   - Quem tem acesso: "Qualquer pessoa"

2. **Configurar URL:**
   ```javascript
   // Anotar URL gerada:
   // https://script.google.com/macros/s/[SCRIPT_ID]/exec
   ```

3. **Testar endpoint:**
   ```bash
   curl https://script.google.com/macros/s/[SCRIPT_ID]/exec
   ```

### **Frontend Configuration**

Configurar `index.html` com URL do backend:

```javascript
// Em app_api.html
const API_CONFIG = {
  BASE_URL: 'https://script.google.com/macros/s/[SCRIPT_ID]/exec',
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3
};
```

---

## 🔧 **DESENVOLVIMENTO LOCAL**

### **Workflow de Desenvolvimento**

#### **1. Setup Inicial**
```bash
# Clonar projeto
git clone [REPO_URL]
cd Sistema-Dojotai

# Instalar dependências
npm install -g @google/clasp

# Configurar clasp
clasp login
```

#### **2. Desenvolvimento**
```bash
# Fazer alterações no código
# Enviar para Google Apps Script
clasp push

# Visualizar logs
clasp logs

# Abrir no editor web
clasp open
```

#### **3. Testing**
```bash
# Executar testes via web interface
# Verificar logs de performance
# Validar funcionalidades críticas
```

### **VS Code Configuration**

Criar `.vscode/settings.json`:
```json
{
  "files.associations": {
    "*.gs": "javascript"
  },
  "javascript.preferences.includePackageJsonAutoImports": "off",
  "typescript.preferences.includePackageJsonAutoImports": "off"
}
```

### **Git Configuration**

Criar `.gitignore`:
```
# Apps Script
.clasp.json

# Logs
*.log

# Temporary files
*.tmp

# Environment
.env
```

---

## 📋 **CHECKLIST DE CONFIGURAÇÃO**

### **Pré-Deploy**
- [ ] Google Account configurada
- [ ] clasp CLI instalado e autenticado
- [ ] Planilha Google Sheets criada
- [ ] ID da planilha configurado em `00_config.gs`
- [ ] Usuário admin criado
- [ ] Teste de conexão com database

### **Deploy**
- [ ] `clasp push` executado sem erros
- [ ] Web app implantado no Google Apps Script
- [ ] URL do web app configurada no frontend
- [ ] Teste de login/logout funcionando
- [ ] Performance monitor ativo

### **Pós-Deploy**
- [ ] Logs de sistema funcionando
- [ ] Cache operacional
- [ ] Performance dentro dos limites
- [ ] Backup da planilha configurado
- [ ] Documentação atualizada

---

## 🛠️ **TROUBLESHOOTING COMUM**

### **Erro: "Script not found"**
```bash
# Verificar .clasp.json
cat .clasp.json

# Reconfigurar se necessário
clasp logout
clasp login
```

### **Erro: "Permission denied"**
1. Verificar permissões no Google Drive
2. Compartilhar planilha com conta correta
3. Reautenticar clasp se necessário

### **Frontend não conecta**
1. Verificar URL do web app
2. Verificar CORS configuration
3. Verificar implantação como "public"

---

## 🔄 **MANUTENÇÃO CONTÍNUA**

### **Tarefas Diárias**
- Verificar health score do sistema
- Revisar logs de erro
- Monitorar performance
- Backup automático ativo

### **Tarefas Semanais**
- Limpeza de logs antigos
- Limpeza de sessões expiradas
- Análise de performance trends
- Update de documentação

### **Tarefas Mensais**
- Review de configurações de segurança
- Análise de uso e escalabilidade
- Backup completo do sistema
- Planejamento de melhorias

---

**📚 Para mais informações:**
- `ARQUITETURA.md` - Estrutura técnica do sistema
- `API_REFERENCE.md` - Documentação de APIs
- `TROUBLESHOOTING.md` - Resolução de problemas específicos
- `DEVELOPMENT.md` - Guia detalhado para desenvolvedores