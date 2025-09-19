# 🚀 Roadmap de Migração Sistema Dojotai V2

> **Migração completa do backend com preparação para novo layout**
> **Período**: 8 semanas
> **Objetivo**: Backend moderno + Base de dados preparada para layout novo

---

## 📋 **Resumo Executivo**

### **Estratégia Geral**
- **Migração gradual**: Um módulo por vez, mantendo sistema funcionando
- **Fallback automático**: Versões V2 com fallback para V1 em caso de erro
- **Preparação BD**: Base de dados já preparada para futuro layout moderno
- **Zero downtime**: Sistema nunca para de funcionar durante migração

### **Entregáveis Finais**
1. ✅ Backend 100% modernizado (ES6+, logs, cache, validações)
2. ✅ Base de dados preparada para layout novo
3. ✅ Sistema atual funcionando perfeitamente com melhorias
4. ✅ Pronto para migração de layout (processo futuro)

---

## 🗓️ **FASE 1: Preparação e Core (Semanas 1-2)**

### **Semana 1: Configuração Central e Utilitários**

#### **📁 Arquivos Criados**
```
00_config.gs              // Configurações centralizadas
00_utils_v2.gs            // Utilitários modernizados
database_manager.gs       // Gerenciador de BD unificado
```

#### **🔧 Implementações**

**`00_config.gs` (NOVO)**
```javascript
// Configurações centralizadas do sistema
const APP_CONFIG = {
  VERSION: '2.0.0',
  TZ: 'America/Sao_Paulo',
  CACHE_TTL: 5,
  LOG_LEVEL: 'INFO',

  // Configuração de planilhas
  PLANILHAS: {
    SSID: '1hfl-CeO6nK4FLYl4uacK5NncBoJ3q-8PPzUWh7W6PmY',
    NAMED: 'PLANILHA_TBL',
    A1: 'Planilhas!A1:H'
  },

  // Novas tabelas para layout moderno
  NEW_TABLES: {
    notifications: 'Notificacoes!A1:G',
    user_preferences: 'Preferencias!A1:E',
    action_history: 'Historico!A1:F'
  }
};
```

**`database_manager.gs` (NOVO)**
```javascript
// Gerenciador unificado de base de dados
const DatabaseManager = {
  // Métodos CRUD padronizados
  insert(tableName, data) { },
  update(tableName, id, data) { },
  delete(tableName, id) { },
  query(tableName, filters) { },

  // Cache integrado
  getCached(key) { },
  setCached(key, data, ttl) { }
};
```

#### **📊 Novas Tabelas Google Sheets**
```
Tabela: "Notificacoes"
Cabeçalho: id | user_id | type | title | message | read | created_at

Tabela: "Preferencias"
Cabeçalho: user_id | theme | notifications_enabled | dashboard_config | updated_at

Tabela: "Historico"
Cabeçalho: id | user_id | action | target_id | details | created_at
```

#### **✅ Entregas Semana 1**
- [ ] Arquivo de configuração central funcionando
- [ ] Novas tabelas criadas no Google Sheets
- [ ] Sistema de configuração testado
- [ ] Documentação das novas estruturas

---

### **Semana 2: Sistema de Logs e Cache**

#### **📁 Arquivos Criados**
```
shared_logger.gs          // Sistema de logs estruturados
shared_cache.gs           // Gerenciamento de cache
shared_validators.gs      // Validações reutilizáveis
00_main_v2.gs             // Novo entry point
```

#### **🔧 Implementações**

**`shared_logger.gs` (NOVO)**
```javascript
// Sistema de logs com níveis e persistência
const Logger = {
  levels: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 },

  error(message, data) { },
  warn(message, data) { },
  info(message, data) { },
  debug(message, data) { },

  // Salva erros críticos na planilha
  saveToSheet(logEntry) { }
};
```

**`shared_cache.gs` (NOVO)**
```javascript
// Sistema de cache com TTL
const CacheManager = {
  set(key, value, ttlMinutes) { },
  get(key) { },
  invalidate(pattern) { },
  clear() { }
};
```

#### **✅ Entregas Semana 2**
- [ ] Sistema de logs funcionando em todas as funções
- [ ] Cache implementado e testado
- [ ] Validações básicas implementadas
- [ ] Entry point V2 funcionando

---

## 🔐 **FASE 2: Módulos Core (Semanas 3-4)**

### **Semana 3: Sistema de Autenticação V2**

#### **📁 Arquivos Criados/Modificados**
```
auth_core_v2.gs           // Autenticação modernizada
auth_sessions.gs          // Gerenciamento de sessões
shared_security.gs        // Utilitários de segurança
```

#### **🔧 Implementações**

**`auth_core_v2.gs` (NOVO)**
```javascript
// Sistema de login modernizado
function loginUserV2(login, pin) {
  // Validações robustas
  // Hash de senhas
  // Logs de auditoria
  // Gerenciamento de sessões
}

function getUserPreferencesV2(userId) {
  // Buscar preferências do usuário (tema, notificações)
}

function updateUserPreferencesV2(userId, preferences) {
  // Atualizar preferências (preparação para layout novo)
}
```

**`auth_sessions.gs` (NOVO)**
```javascript
// Gerenciamento de sessões robusto
const SessionManager = {
  create(userId) { },
  validate(sessionId) { },
  destroy(sessionId) { },
  cleanup() { } // Remove sessões expiradas
};
```

#### **📊 Migração Gradual**
```javascript
// Frontend: Fallback automático durante migração
async function login(user, pin) {
  try {
    return await google.script.run.loginUserV2(user, pin);
  } catch (error) {
    console.warn('V2 falhou, usando V1');
    return await google.script.run.loginUser(user, pin);
  }
}
```

#### **✅ Entregas Semana 3**
- [ ] Login V2 funcionando com fallback para V1
- [ ] Sistema de sessões implementado
- [ ] Preferências de usuário funcionando
- [ ] Logs de auditoria de login implementados

---

### **Semana 4: Validações e Segurança**

#### **📁 Arquivos Criados/Modificados**
```
shared_validators.gs      // Sistema completo de validações
shared_security.gs       // Melhorias de segurança
shared_permissions.gs    // Sistema de permissões
```

#### **🔧 Implementações**

**`shared_validators.gs` (COMPLETO)**
```javascript
// Validações para todos os módulos
const Validators = {
  activity: {
    titulo: (value) => ({ valid: boolean, error: string }),
    data: (value) => ({ valid: boolean, error: string }),
    categoria: (value) => ({ valid: boolean, error: string })
  },

  user: {
    login: (value) => ({ valid: boolean, error: string }),
    pin: (value) => ({ valid: boolean, error: string })
  },

  member: {
    nome: (value) => ({ valid: boolean, error: string }),
    cpf: (value) => ({ valid: boolean, error: string })
  },

  // Validador genérico
  validateObject(data, schema) { }
};
```

**`shared_permissions.gs` (NOVO)**
```javascript
// Sistema de permissões por papel
const PermissionManager = {
  canCreateActivity(userId) { },
  canEditActivity(userId, activityId) { },
  canDeleteActivity(userId, activityId) { },
  canManageMembers(userId) { },
  canViewReports(userId) { }
};
```

#### **✅ Entregas Semana 4**
- [ ] Sistema de validações funcionando em todos os módulos
- [ ] Segurança aprimorada (hash de senhas, validação de sessões)
- [ ] Sistema de permissões implementado
- [ ] Auditoria completa de ações

---

## 📋 **FASE 3: Módulos de Negócio (Semanas 5-6)**

### **Semana 5: Sistema de Atividades V2**

#### **📁 Arquivos Criados/Modificados**
```
module_activities_v2.gs   // CRUD de atividades modernizado
module_categories_v2.gs   // Categorias modernizadas
```

#### **🔧 Implementações**

**`module_activities_v2.gs` (NOVO)**
```javascript
// Atividades com preparação para layout novo
function createActivityV2(payload, uidCriador) {
  // Validações robustas usando Validators
  // Verificação de permissões
  // Logs de auditoria
  // Cache invalidation
}

function listActivitiesV2(options = {}) {
  return {
    ok: true,
    // Para layout atual (compatibilidade)
    data: activities,

    // Para layout novo (preparação)
    dashboard: {
      statistics: {
        total: activities.length,
        pending: pendingCount,
        completed_this_month: completedCount,
        participation_rate: avgParticipation
      },
      recent_activity: getRecentActivity(),
      notifications: getUserNotifications(options.user_id)
    },

    // Paginação para layout novo
    pagination: {
      page: options.page || 1,
      per_page: options.per_page || 20,
      total: activities.length,
      total_pages: Math.ceil(activities.length / (options.per_page || 20))
    }
  };
}

function getActivityStatsV2(activityId) {
  // Estatísticas detalhadas para dashboard novo
  return {
    participation: getParticipacaoStats(activityId),
    timeline: getActivityTimeline(activityId),
    performance: getActivityPerformance(activityId)
  };
}
```

#### **📊 Preparação para Layout Novo**
```javascript
// Campos extras em atividades (para futuro layout)
activity_extended: {
  tags: ['kata', 'avaliacao'],
  priority: 'high',
  estimated_duration: 120,
  actual_duration: 135,
  difficulty_level: 3,
  required_materials: ['tatame', 'cronometro']
}
```

#### **✅ Entregas Semana 5**
- [ ] CRUD de atividades V2 funcionando com fallback
- [ ] Estatísticas preparadas para dashboard novo
- [ ] Sistema de tags implementado
- [ ] Paginação implementada

---

### **Semana 6: Participações e Membros V2**

#### **📁 Arquivos Criados/Modificados**
```
module_participacoes_v2.gs // Sistema de participações modernizado
module_members_v2.gs       // Gestão de membros modernizada
```

#### **🔧 Implementações**

**`module_participacoes_v2.gs` (NOVO)**
```javascript
function listParticipacoes_V2(activityId, options = {}) {
  // Cache inteligente
  // Joins otimizados
  // Filtros avançados

  return {
    ok: true,
    // Para layout atual
    data: participacoes,

    // Para dashboard novo
    analytics: {
      attendance_rate: calculateAttendanceRate(),
      late_arrivals: getLateArrivals(),
      early_departures: getEarlyDepartures(),
      trends: getParticipationTrends()
    }
  };
}

function markParticipacaoV2(data) {
  // Validações robustas
  // Logs de auditoria
  // Notificações automáticas
  // Cache invalidation
}

function getParticipacaoStatsV2(filters = {}) {
  // Estatísticas avançadas para dashboard
  return {
    overview: getOverviewStats(),
    by_member: getStatsByMember(),
    by_activity: getStatsByActivity(),
    trends: getTrendsData()
  };
}
```

**`module_members_v2.gs` (NOVO)**
```javascript
function listMembersV2(filters = {}) {
  return {
    ok: true,
    // Para layout atual
    data: members,

    // Para dashboard novo
    analytics: {
      total_active: getActiveMembers().length,
      new_this_month: getNewMembers().length,
      attendance_leaders: getAttendanceLeaders(),
      categories_distribution: getCategoriesDistribution()
    }
  };
}

function getMemberProfileV2(memberId) {
  // Perfil completo para tela individual nova
  return {
    basic_info: getMemberBasic(memberId),
    activity_history: getMemberActivities(memberId),
    statistics: getMemberStats(memberId),
    achievements: getMemberAchievements(memberId)
  };
}
```

#### **✅ Entregas Semana 6**
- [ ] Sistema de participações V2 funcionando
- [ ] Gestão de membros V2 implementada
- [ ] Analytics preparadas para dashboard novo
- [ ] Perfis de membros expandidos

---

## 🎨 **FASE 4: Frontend e Finalização (Semanas 7-8)**

### **Semana 7: API Frontend V2 e Cache Cliente**

#### **📁 Arquivos Criados/Modificados**
```
app_api_v2.html           // API frontend modernizada
app_cache_client.html     // Cache do lado cliente
app_state_v2.html         // Gerenciamento de estado V2
```

#### **🔧 Implementações**

**`app_api_v2.html` (NOVO)**
```javascript
// API frontend com cache inteligente e fallbacks
const API_V2 = {
  cache: new Map(),

  async callFunction(functionName, params, useCache = false) {
    // Cache client-side
    // Fallback automático V2 -> V1
    // Error handling robusto
    // Loading states automáticos
  },

  // Métodos específicos
  async listActivities(filters = {}, useCache = true) { },
  async createActivity(data) { },
  async getParticipations(activityId) { },
  async getDashboardData(userId) { }, // Preparado para layout novo

  // Invalidação de cache inteligente
  invalidateCache(pattern) { }
};
```

**`app_cache_client.html` (NOVO)**
```javascript
// Sistema de cache do lado cliente
const ClientCache = {
  storage: new Map(),
  ttl: new Map(),

  set(key, value, ttlMinutes = 5) { },
  get(key) { },
  invalidate(pattern) { },
  clear() { },

  // Cache persistente para dados críticos
  setPersistent(key, value) { }, // localStorage
  getPersistent(key) { }
};
```

#### **📱 Preparação para Layout Novo**
```javascript
// Dados estruturados para o dashboard moderno
const DashboardAPI = {
  async getDashboardData(userId) {
    return {
      user_info: await API_V2.getUserInfo(userId),
      statistics: await API_V2.getStatistics(),
      recent_activities: await API_V2.getRecentActivities(),
      notifications: await API_V2.getNotifications(userId),
      quick_actions: await API_V2.getQuickActions(userId)
    };
  }
};
```

#### **✅ Entregas Semana 7**
- [ ] API frontend V2 funcionando com fallbacks
- [ ] Cache cliente implementado
- [ ] Estados de loading otimizados
- [ ] Preparação completa para layout novo

---

### **Semana 8: Performance e Finalização**

#### **📁 Arquivos Finalizados**
```
performance_monitor.gs    // Monitoramento de performance
cleanup_v1.gs            // Script para limpeza das versões V1
migration_validator.gs   // Validador da migração
```

#### **🔧 Implementações Finais**

**Performance e Otimização**
```javascript
// Monitoramento de performance
const PerformanceMonitor = {
  startTimer(operation) { },
  endTimer(operation) { },
  logSlowQueries(threshold = 5000) { },
  generateReport() { }
};

// Limpeza das versões V1 (após validação)
function cleanupV1Functions() {
  // Comentar funções V1 antigas
  // Manter apenas para emergência
}
```

**Validação da Migração**
```javascript
// Validador completo da migração
function validateMigration() {
  const tests = [
    testLoginV2(),
    testActivitiesV2(),
    testParticipationsV2(),
    testMembersV2(),
    testCacheSystem(),
    testLoggingSystem(),
    testPermissions()
  ];

  return {
    passed: tests.filter(t => t.success).length,
    failed: tests.filter(t => !t.success).length,
    details: tests
  };
}
```

#### **📊 Preparação Final para Layout Novo**
```javascript
// Todas as APIs necessárias para o layout moderno prontas
const NewLayoutAPIs = {
  // Dashboard
  getDashboardData: '✅ Pronto',
  getStatistics: '✅ Pronto',
  getNotifications: '✅ Pronto',

  // Atividades
  getActivitiesWithAnalytics: '✅ Pronto',
  getActivityDetails: '✅ Pronto',

  // Membros
  getMembersWithAnalytics: '✅ Pronto',
  getMemberProfile: '✅ Pronto',

  // Participações
  getParticipationAnalytics: '✅ Pronto',
  getParticipationTrends: '✅ Pronto'
};
```

#### **✅ Entregas Semana 8**
- [ ] Performance otimizada
- [ ] Migração 100% validada
- [ ] Versões V1 limpas (comentadas)
- [ ] Sistema pronto para layout novo
- [ ] Documentação completa

---

## 📊 **Estrutura Final de Arquivos**

### **Backend (.gs) - Pós Migração**
```
// Core
00_config.gs              ✅ Configurações centralizadas
00_main_v2.gs            ✅ Entry point modernizado
00_utils_v2.gs           ✅ Utilitários modernizados
database_manager.gs      ✅ Gerenciador BD unificado

// Autenticação
auth_core_v2.gs          ✅ Login/logout modernizado
auth_sessions.gs         ✅ Gerenciamento de sessões
auth_permissions.gs      ✅ Sistema de permissões

// Módulos de Negócio
module_activities_v2.gs  ✅ Atividades modernizadas
module_categories_v2.gs  ✅ Categorias modernizadas
module_members_v2.gs     ✅ Membros modernizados
module_participacoes_v2.gs ✅ Participações modernizadas
module_menu_v2.gs        ✅ Menu dinâmico modernizado

// Shared
shared_logger.gs         ✅ Sistema de logs
shared_cache.gs          ✅ Gerenciamento de cache
shared_validators.gs     ✅ Validações reutilizáveis
shared_security.gs       ✅ Utilitários de segurança

// Legacy (Comentado)
// auth.gs                ❌ Comentado pós-migração
// activities.gs          ❌ Comentado pós-migração
// members.gs             ❌ Comentado pós-migração
// utils.gs               ❌ Comentado pós-migração
```

### **Frontend (.html) - Pós Migração**
```
// Core
index.html               ✅ Template principal
app_api_v2.html          ✅ API frontend modernizada
app_state_v2.html        ✅ Estado modernizado
app_ui_v2.html           ✅ UI management modernizado
app_router_v2.html       ✅ Router modernizado

// Cache e Performance
app_cache_client.html    ✅ Cache do lado cliente

// Views (mantidas, melhoradas)
view_login.html          ✅ Melhorada com V2 APIs
view_dash.html           ✅ Preparada para novo layout
view_*.html              ✅ Todas melhoradas

// Estilos
styles_base.html         ✅ Estilos base
styles_components.html   ✅ Componentes
```

---

## 🎯 **Base de Dados Final**

### **Tabelas Existentes (Migradas)**
```
usuarios                 ✅ + campos extras (preferences)
atividades              ✅ + campos extras (tags, priority)
membros                 ✅ + campos extras (analytics)
participacoes           ✅ + campos extras (detailed status)
categoria_atividades    ✅ Mantida
menu                    ✅ Mantida
```

### **Tabelas Novas (Para Layout Moderno)**
```
notifications           ✅ Sistema de notificações
user_preferences        ✅ Preferências do usuário
action_history          ✅ Histórico de ações
system_stats            ✅ Estatísticas do sistema
```

---

## 🔄 **Cronograma de Execução**

### **Cronograma Semanal**
| Semana | Foco | Entregas | Status |
|--------|------|----------|--------|
| 1 | Config + BD | Core funcionando + Novas tabelas | ⏳ |
| 2 | Logs + Cache | Sistema base moderno | ⏳ |
| 3 | Auth V2 | Login modernizado funcionando | ⏳ |
| 4 | Validações | Segurança e validações completas | ⏳ |
| 5 | Atividades V2 | CRUD moderno funcionando | ⏳ |
| 6 | Participações V2 | Todos módulos V2 funcionando | ⏳ |
| 7 | Frontend V2 | Interface moderna funcionando | ⏳ |
| 8 | Finalização | Sistema 100% V2 + preparado para novo layout | ⏳ |

### **Marco de Validação (Final de cada semana)**
- [ ] **Semana 1**: Config central funcionando
- [ ] **Semana 2**: Logs e cache operacionais
- [ ] **Semana 3**: Login V2 funcionando com fallback
- [ ] **Semana 4**: Validações e segurança implementadas
- [ ] **Semana 5**: Atividades V2 funcionando
- [ ] **Semana 6**: Todos módulos V2 operacionais
- [ ] **Semana 7**: Frontend V2 funcionando
- [ ] **Semana 8**: Migração completa validada

---

## 🚀 **Processo de Deploy Semanal**

### **Ritual de Deploy (Toda Sexta)**
1. **Backup**: Backup completo do projeto atual
2. **Deploy**: `clasp push` com novos arquivos
3. **Teste**: Validação das funcionalidades da semana
4. **Rollback Plan**: Script pronto para reverter se necessário
5. **Documentação**: Atualizar progresso no roadmap

### **Validação de Qualidade**
```javascript
// Checklist semanal de qualidade
const WeeklyValidation = {
  codeQuality: {
    eslintPassed: true,
    noConsoleErrors: true,
    functionsDocumented: true
  },

  functionality: {
    allTestsPassed: true,
    performanceGood: true,
    backwardsCompatible: true
  },

  security: {
    validationsWorking: true,
    logsRecording: true,
    permissionsChecked: true
  }
};
```

---

## 📈 **Métricas de Sucesso**

### **KPIs Técnicos**
- **Performance**: Redução de 50% no tempo de resposta
- **Qualidade**: 0 erros de console em produção
- **Cobertura**: 100% das funções críticas com logs
- **Cache Hit Rate**: >70% para dados frequentes

### **KPIs de Negócio**
- **Uptime**: 100% durante migração (zero downtime)
- **Funcionalidade**: Todas as features atuais funcionando
- **Preparação**: 100% pronto para novo layout
- **Documentação**: Roadmap atualizado semanalmente

---

## ⚠️ **Riscos e Mitigações**

### **Riscos Identificados**
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Fallback V2->V1 falha | Baixa | Alto | Testes robustos + Rollback script |
| Performance degradada | Média | Médio | Monitoring + Cache agressivo |
| Dados corrompidos | Baixa | Alto | Backup diário + Validações |
| Apps Script limits | Média | Médio | Chunking + Rate limiting |

### **Plano de Contingência**
1. **Rollback Rápido**: Script automatizado para voltar versão anterior
2. **Hotfix Process**: Deploy de correções em <2 horas
3. **Communication**: Canal de comunicação para issues críticas
4. **Backup Strategy**: Backup automático antes de cada deploy

---

## 📞 **Próximos Passos**

### **Para Iniciar (Após Aprovação)**
1. **Semana 1 - Dia 1**: Criar estrutura de pastas local
2. **Semana 1 - Dia 2**: Implementar `00_config.gs`
3. **Semana 1 - Dia 3**: Criar novas tabelas Google Sheets
4. **Semana 1 - Dia 4**: Implementar `database_manager.gs`
5. **Semana 1 - Dia 5**: Deploy e validação da Semana 1

### **Decisões Necessárias**
- [ ] **Aprovação do roadmap**: Este documento está alinhado?
- [ ] **Cronograma**: 8 semanas é adequado?
- [ ] **Prioridades**: Algum módulo tem prioridade específica?
- [ ] **Layout novo**: Iniciar migração logo após Semana 8?

## 🔮 **Ideias para Avaliação Futura (Pós-Migração)**

### **Sistema de Schema Dinâmico**
**Status**: 💡 Ideia para evaluar após Semana 8
**Descrição**: Planilha de metadados para gerenciar estrutura das tabelas automaticamente
**Benefícios potenciais**:
- Evolução automática das planilhas
- Validações baseadas em schema
- Documentação viva da estrutura de dados
- Valores padrão automáticos

**Complexidade**: Alta
**Prioridade**: Baixa (apenas se trouxer benefício real)
**Avaliação**: Após sistema V2 estável e funcionando

**Estrutura proposta**:
```
Tabela: Schema
Colunas: tabela | campo | tipo | obrigatorio | default | descricao | ordem
```

**Decisão**: Manter gestão de planilhas **manual** durante migração para manter foco na funcionalidade core.

---

**📋 Documento criado em**: 18/09/2025
**🔄 Última atualização**: 18/09/2025
**👤 Responsável**: Claude + Diogo
**📅 Revisão**: Semanal (toda sexta-feira)

---

*Este roadmap é um documento vivo que será atualizado semanalmente conforme o progresso da migração.*