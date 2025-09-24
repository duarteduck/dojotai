# 🏗️ ARQUITETURA - Sistema Dojotai V2.0

**Versão:** 2.0.0-alpha.1
**Atualizado:** 23/09/2025
**Responsável:** Sistema de documentação consolidada

---

## 📋 **VISÃO GERAL DO SISTEMA**

O Sistema Dojotai V2.0 é uma aplicação web moderna construída sobre Google Apps Script e Google Sheets, projetada para gestão completa de dojos de artes marciais. A arquitetura seguiu evolução de MVP (V1.0) para sistema robusto de produção (V2.0).

### **Características Técnicas**
- **Platform:** Google Apps Script (JavaScript ES6+)
- **Database:** Google Sheets com DatabaseManager centralizado
- **Frontend:** SPA responsiva com HTML5 + CSS3 + JavaScript vanilla
- **Arquitetura:** MVC com separação clara de responsabilidades
- **Autenticação:** SHA-256 + sistema de sessões com tokens únicos
- **Logs:** Sistema estruturado multi-nível com anti-recursão

---

## 🏭 **ARQUITETURA DE SISTEMA**

### **Camadas da Aplicação**

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (SPA)                    │
├─────────────────────────────────────────────────────┤
│ Router → Views → Components → API Client            │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│               GOOGLE APPS SCRIPT API                │
├─────────────────────────────────────────────────────┤
│ Controllers → Business Logic → Validation           │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│                CORE SYSTEM LAYER                    │
├─────────────────────────────────────────────────────┤
│ DatabaseManager → Session → Auth → Performance      │
└─────────────────────────────────────────────────────┘
                           │
┌─────────────────────────────────────────────────────┐
│              DATABASE (GOOGLE SHEETS)               │
├─────────────────────────────────────────────────────┤
│ 7 Tabelas Core + 3 Auxiliares + 2 Monitoring       │
└─────────────────────────────────────────────────────┘
```

---

## 📁 **ESTRUTURA DE ARQUIVOS**

### **Backend Core (Google Apps Script)**
```
src/
├── 00-core/                 # Sistema central
│   ├── 00_config.gs         # Configurações globais
│   ├── database_manager.gs  # CRUD centralizado + Logger
│   ├── session_manager.gs   # Gestão de sessões
│   └── data_dictionary.gs   # Schema e validações
│
├── 01-business/             # Lógica de negócio
│   ├── auth.gs             # Autenticação e segurança
│   ├── atividades.gs       # Gestão de atividades
│   ├── membros.gs          # Gestão de membros
│   ├── participacao.gs     # Sistema de participação
│   └── performance_monitor.gs # Monitoramento
│
└── 02-api/                 # Endpoints web
    ├── doGet.gs            # Router principal
    ├── doPost.gs           # Handlers POST
    └── api_handlers.gs     # Controllers específicos
```

### **Frontend SPA (HTML/JS)**
```
├── index.html              # Template principal
├── app_state.html          # Gerenciamento de estado
├── app_api.html           # Cliente API
├── app_ui.html            # Sistema de UI
├── app_router.html        # Roteamento SPA
├── styles_base.html       # Estilos CSS base
├── src/                   # Código fonte organizado
│   ├── 03-shared/         # Recursos compartilhados
│   │   └── components.html         # Estilos de componentes
│   ├── 04-views/          # Telas do sistema
│   │   ├── dashboard.html          # Dashboard principal
│   │   ├── practices.html          # Práticas diárias
│   │   └── reports.html            # Relatórios
│   └── 05-components/     # Componentes reutilizáveis
│       ├── userMenu.html           # Menu de usuário
│       ├── memberCard.html         # Card de membro
│       ├── activityCard.html       # Card de atividade
│       ├── emptyState.html         # Estado vazio
│       ├── toast.html              # Notificações
│       └── calendarModal.html      # Modal de calendário
└── view_*.html            # Views antigas (sendo migradas)
```

---

## 🗄️ **ARQUITETURA DE DADOS**

### **Tabelas Core (7)**

| Tabela | Chave Primária | Função | Relações |
|--------|---------------|---------|----------|
| `usuarios` | `uid` | Usuários do sistema | → sessoes, participacao |
| `atividades` | `id` | Atividades/aulas | → participacao |
| `membros` | `id` | Membros do dojo | → participacao |
| `participacao` | `id` | Presença em atividades | usuarios, atividades, membros |
| `sessoes` | `id` | Sessões ativas | usuarios |
| `system_logs` | `id` | Logs estruturados | - |
| `performance_logs` | `id` | Métricas de performance | - |

### **Tabelas Auxiliares (Planejadas)**
- `notificacoes` - Sistema de notificações
- `preferencias` - Configurações por usuário
- `historico` - Auditoria de ações

### **Padrões de Dados**
- **IDs Únicos:** Timestamp + random para garantir unicidade
- **Timestamps:** UTC-3 (Brasil) em formato `yyyy-MM-dd HH:mm:ss`
- **Foreign Keys:** Validação automática via ValidationEngine
- **Status:** Padronização `'sim'/'não'` ou `'ativo'/'inativo'`

---

## 🔧 **COMPONENTES PRINCIPAIS**

### **1. DatabaseManager (`database_manager.gs`)**
Sistema centralizado de acesso a dados com:
- **CRUD Operations:** Create, Read, Update, Delete unificados
- **Cache Multi-Camada:** Otimização automática de performance
- **Validation Engine:** Validação de FK e business rules
- **Logger Integrado:** Logs estruturados com anti-recursão
- **Transaction Support:** Operações atômicas e rollback

**Principais Métodos:**
```javascript
DatabaseManager.insert(tableName, data)    // Criar registro
DatabaseManager.query(tableName, filters)  // Consultar dados
DatabaseManager.update(tableName, id, data) // Atualizar registro
DatabaseManager.delete(tableName, id)      // Deletar registro
```

### **2. SessionManager (`session_manager.gs`)**
Gestão completa de sessões com:
- **Token Generation:** Tokens únicos formato `sess_timestamp_random`
- **Session Validation:** Verificação de expiração e atividade
- **Auto Cleanup:** Limpeza automática de sessões expiradas
- **Security:** Integração com AuthManager para autenticação

### **3. Logger System**
Sistema de logs estruturados com 4 níveis:
- **DEBUG:** Informações detalhadas de debugging
- **INFO:** Operações importantes do sistema
- **WARN:** Situações que requerem atenção
- **ERROR:** Erros críticos que impedem operação

**Anti-Recursão:** Flag global `_LOGGER_IS_LOGGING` previne loops infinitos entre Logger ↔ DatabaseManager.

### **4. PerformanceMonitor**
Monitoramento em tempo real com:
- **Health Score:** Pontuação 0-100 da saúde do sistema
- **Cache Metrics:** Hit rate, miss rate, cache efficiency
- **Performance Tracking:** Tempo de resposta, throughput
- **Automated Reports:** Relatórios diários automáticos

---

## 🔒 **SEGURANÇA E AUTENTICAÇÃO**

### **Camadas de Segurança**
1. **Autenticação:** SHA-256 hash + salt personalizado
2. **Sessões:** Tokens únicos com expiração de 8 horas
3. **Validation:** Foreign key validation automática
4. **Logging:** Auditoria completa de todas as operações
5. **Input Sanitization:** Sanitização automática de inputs

### **Fluxo de Autenticação**
```
1. Login → Hash SHA-256 → Validação → Criação de Sessão
2. Request → Validação de Token → Verificação de Expiração → Autorização
3. Logout → Destruição de Sessão → Log de Auditoria
```

---

## ⚡ **OTIMIZAÇÃO E PERFORMANCE**

### **Cache Multi-Camada**
- **L1 Cache:** Cache de aplicação (in-memory)
- **L2 Cache:** Cache de planilha (PropertiesService)
- **L3 Cache:** Cache de sessão (temporário)
- **Auto Invalidation:** Invalidação automática em updates

### **Métricas de Performance**
- **Target Response Time:** < 2 segundos
- **Cache Hit Rate:** > 40% (atual: ~45%)
- **Health Score:** > 90 (atual: 100/100)
- **Database Operations:** < 50ms por operação

### **Otimizações Implementadas**
- Batch operations para múltiplas inserções
- Lazy loading de dados não críticos
- Compression de payloads grandes
- Connection pooling para Google Sheets API

---

## 🔄 **PADRÕES DE DESENVOLVIMENTO**

### **Naming Conventions**
- **Files:** `snake_case.gs` para backend, `kebab-case.html` para frontend
- **Functions:** `camelCase()` para métodos, `PascalCase()` para classes
- **Variables:** `camelCase` para locais, `UPPER_CASE` para constantes
- **Database:** `snake_case` para tabelas e campos

### **Error Handling**
- Try-catch obrigatório em todas as operações críticas
- Retorno padronizado: `{ok: boolean, data?: any, error?: string}`
- Logging automático de todos os erros
- Graceful degradation em caso de falhas

### **Code Organization**
- **Single Responsibility:** Cada função tem uma responsabilidade
- **DRY Principle:** Evitar duplicação de código
- **Separation of Concerns:** Camadas bem definidas
- **Interface Consistency:** APIs consistentes entre módulos

---

## 🔧 **DEPLOY E INFRAESTRUTURA**

### **Google Apps Script Environment**
- **Runtime:** V8 JavaScript Engine
- **Execution Time Limit:** 6 minutos por execução
- **Memory Limit:** 100MB por execução
- **Storage:** Unlimited via Google Sheets
- **Bandwidth:** Unlimited (Google infrastructure)

### **Deploy Process**
1. **Development:** Desenvolvimento local com clasp
2. **Testing:** Testes em ambiente de staging
3. **Deploy:** `clasp push` para produção
4. **Validation:** Testes automatizados pós-deploy
5. **Monitoring:** Monitoramento contínuo via PerformanceMonitor

### **Backup Strategy**
- **Automated:** Backup automático via Google Drive
- **Version Control:** Git para código fonte
- **Data Export:** Export manual de dados críticos
- **Recovery:** Procedimento documentado de recovery

---

## 📊 **MÉTRICAS ATUAIS DO SISTEMA**

### **Código**
- **Backend:** 6 arquivos .gs (2.043 linhas)
- **Frontend:** 20 arquivos .html (9.979 linhas)
- **Total:** 12.022 linhas de código

### **Database**
- **Core Tables:** 7 tabelas principais
- **Auxiliary Tables:** 3 tabelas de apoio
- **Monitoring Tables:** 2 tabelas de monitoramento
- **Total Records:** ~500+ registros ativos

### **Performance**
- **Health Score:** 100/100
- **Cache Hit Rate:** 45%+
- **Average Response Time:** < 1.5s
- **System Uptime:** 99.9%

---

## 🚀 **ROADMAP TÉCNICO**

### **V2.1 (Q4 2025)**
- Implementação das tabelas auxiliares
- Dashboard de performance avançado
- Sistema de notificações em tempo real

### **V3.0 (2026)**
- Frontend moderno (React/Vue)
- APIs REST para integração externa
- PWA com recursos offline
- Analytics avançado com machine learning

---

**📚 Para mais detalhes técnicos específicos, consulte:**
- `API_REFERENCE.md` - Documentação completa de APIs
- `CONFIGURACAO.md` - Setup e configuração detalhada
- `DEVELOPMENT.md` - Guia para desenvolvedores
- `TROUBLESHOOTING.md` - Resolução de problemas comuns