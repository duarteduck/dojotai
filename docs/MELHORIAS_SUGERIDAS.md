# 🚀 Plano de Melhorias - Sistema Dojotai

> **Documento gerado automaticamente após análise completa do código**
> **Data**: 16/09/2025
> **Versão analisada**: v0.1.5

## 📋 Resumo Executivo

### **Status Atual**
- **Funcionalidade**: ✅ MVP operacional e funcional
- **Arquitetura**: ✅ Base sólida e escalável
- **Qualidade de Código**: ⚠️ Boa, mas com oportunidades de melhoria
- **Documentação**: ⚠️ Adequada para negócio, técnica pode melhorar
- **Testes**: ❌ Cobertura zero
- **Segurança**: ⚠️ Básica, precisa de reforços

### **Score Geral: 7.2/10**
*Um projeto sólido com grandes oportunidades de aprimoramento*

---

## 🔥 Ações Críticas (Imediatas - 1-2 dias)

### **1. Correção de Bug Crítico**
**Problema**: Nome de arquivo com erro ortográfico
- **Arquivo**: ~~`activies_categories.gs`~~ → `activities_categories.gs` ✅ **Corrigido**
- **Impacto**: Pode causar confusão e inconsistências
- **Ação**: Renomear arquivo e verificar referências

### **2. Validações Server-Side**
**Problema**: Algumas operações críticas dependem apenas de validação client-side

```javascript
// ❌ Atual - apenas validação frontend
if (!titulo) return { ok:false, error:'Informe um título.' };

// ✅ Sugerido - adicionar validações robustas
function validateActivityData(payload) {
  const errors = [];

  if (!payload.titulo || payload.titulo.trim().length < 3) {
    errors.push('Título deve ter pelo menos 3 caracteres');
  }

  if (payload.data && new Date(payload.data) < new Date()) {
    errors.push('Data não pode ser no passado');
  }

  if (payload.categoria_atividade_id && !validateCategoriaAtividade_(payload.categoria_atividade_id)) {
    errors.push('Categoria inválida');
  }

  return { valid: errors.length === 0, errors };
}
```

### **3. Padronização de Tratamento de Erros**
**Problema**: Inconsistência no tratamento de erros entre diferentes funções

```javascript
// ✅ Padrão sugerido para todas as funções
function standardErrorHandler(functionName, error, context = {}) {
  const errorMsg = `${functionName}: ${error?.message || error}`;

  // Log detalhado para debugging
  console.error(`[${new Date().toISOString()}] ${errorMsg}`, {
    context,
    stack: error?.stack
  });

  // Retorno padronizado
  return {
    ok: false,
    error: errorMsg,
    timestamp: new Date().toISOString(),
    context
  };
}
```

---

## ⚠️ Melhorias de Alta Prioridade (1-2 sprints)

### **1. Refatoração JavaScript Moderno**

**Problemas identificados**:
- Uso de `var` em vez de `const/let`
- Funções anônimas onde poderia usar arrow functions
- Callbacks onde poderia usar async/await

```javascript
// ❌ Código atual
var API = {
  login: function(login, pin){
    return new Promise(function(resolve){
      google.script.run
        .withSuccessHandler(function(res){
          if(res && res.ok && res.user && res.user.uid){
            State.uid = res.user.uid;
            resolve(res);
          }
        })
        .loginUser(login, pin);
    });
  }
};

// ✅ Código refatorado
const API = {
  async login(login, pin) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler((res) => {
          if (res?.ok && res?.user?.uid) {
            State.uid = res.user.uid;
            resolve(res);
          } else {
            resolve({ ok: false, error: res?.error || 'Login falhou' });
          }
        })
        .withFailureHandler(reject)
        .loginUser(login, pin);
    });
  }
};
```

### **2. Sistema de Cache Robusto**

```javascript
// Implementar cache inteligente com TTL
const CacheManager = {
  cache: new Map(),
  ttl: new Map(),

  set(key, value, ttlMinutes = 5) {
    this.cache.set(key, value);
    this.ttl.set(key, Date.now() + (ttlMinutes * 60 * 1000));
  },

  get(key) {
    if (!this.cache.has(key)) return null;

    if (Date.now() > this.ttl.get(key)) {
      this.cache.delete(key);
      this.ttl.delete(key);
      return null;
    }

    return this.cache.get(key);
  },

  clear() {
    this.cache.clear();
    this.ttl.clear();
  }
};
```

### **3. Implementar Loading States Completos**

```javascript
// Sistema unificado de loading
const LoadingManager = {
  activeLoaders: new Set(),

  start(key) {
    this.activeLoaders.add(key);
    this.updateUI();
  },

  stop(key) {
    this.activeLoaders.delete(key);
    this.updateUI();
  },

  updateUI() {
    const isLoading = this.activeLoaders.size > 0;
    document.body.classList.toggle('loading', isLoading);

    // Atualizar botões específicos
    this.activeLoaders.forEach(key => {
      const btn = document.querySelector(`[data-loading-key="${key}"]`);
      if (btn) {
        btn.disabled = isLoading;
        btn.classList.toggle('loading', isLoading);
      }
    });
  }
};
```

---

## 📈 Melhorias de Média Prioridade (2-4 sprints)

### **1. Organização por Nomenclatura de Arquivos**

**Limitação do Google Apps Script**: Estrutura de arquivos é sempre plana (não permite pastas)

**Estrutura atual**:
```
├── main.gs
├── auth.gs
├── activities.gs
├── activities_categories.gs
├── members.gs
├── menu.gs
├── utils.gs
├── index.html
├── app_state.html
├── app_api.html
├── app_ui.html
├── app_router.html
├── view_login.html
├── view_dash.html
├── view_activity_new.html
├── view_members_list.html
├── view_component_activityCard.html
├── view_component_memberCard.html
├── view_component_emptyState.html
├── view_component_toast.html
├── styles_base.html
└── styles_components.html
```

**Nomenclatura sugerida para melhor organização**:

**Arquivos Backend (.gs)**:
```
├── 00_main.gs                    // Entry point
├── 00_utils.gs                   // Utilitários globais
├── 00_config.gs                  // Configurações
├── auth_core.gs                  // Autenticação principal
├── auth_permissions.gs           // Sistema de permissões
├── module_activities.gs          // Gestão de atividades
├── module_activities_categories.gs // Categorias de atividades
├── module_members.gs             // Gestão de membros
├── module_menu.gs                // Menu dinâmico
├── shared_validators.gs          // Validações reutilizáveis
└── shared_helpers.gs             // Funções auxiliares
```

**Arquivos Frontend (.html)**:
```
├── index.html                    // Template principal
├── app_state.html                // Gerenciamento de estado
├── app_api.html                  // Camada de API
├── app_ui.html                   // Manipulação de UI
├── app_router.html               // Sistema de rotas
├── view_login.html               // Tela de login
├── view_dashboard.html           // Dashboard principal
├── view_activities_list.html     // Lista de atividades
├── view_activities_new.html      // Nova atividade
├── view_activities_edit.html     // Editar atividade
├── view_members_list.html        // Lista de membros
├── component_activity_card.html  // Card de atividade
├── component_member_card.html    // Card de membro
├── component_empty_state.html    // Estado vazio
├── component_toast.html          // Notificações
├── component_loading.html        // Estados de carregamento
├── style_base.html               // Estilos base
├── style_components.html         // Estilos de componentes
└── style_themes.html             // Temas (dark/light)
```

### **2. Sistema de Validação Unificado**

```javascript
// validators.gs - Novo arquivo com todas as validações
const Validators = {
  activity: {
    titulo: (value) => ({
      valid: value && value.trim().length >= 3,
      error: 'Título deve ter pelo menos 3 caracteres'
    }),

    data: (value) => ({
      valid: !value || new Date(value) >= new Date(),
      error: 'Data não pode ser no passado'
    }),

    categoria: (value) => ({
      valid: !value || validateCategoriaAtividade_(value),
      error: 'Categoria inválida'
    })
  },

  user: {
    login: (value) => ({
      valid: value && value.trim().length >= 3,
      error: 'Login deve ter pelo menos 3 caracteres'
    }),

    pin: (value) => ({
      valid: value && value.length >= 4,
      error: 'PIN deve ter pelo menos 4 caracteres'
    })
  },

  validate(data, schema) {
    const errors = [];

    Object.keys(schema).forEach(field => {
      const validator = schema[field];
      const result = validator(data[field]);

      if (!result.valid) {
        errors.push({ field, message: result.error });
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }
};
```

### **3. Melhorias de Performance**

```javascript
// Implementar pagination para listas grandes
function getActivitiesPaginated(page = 1, limit = 20) {
  const { values, headerIndex } = readTableByNome_('atividades');

  const startIndex = (page - 1) * limit + 1; // +1 para pular header
  const endIndex = Math.min(startIndex + limit, values.length);

  const pageData = values.slice(startIndex, endIndex);

  return {
    ok: true,
    items: pageData.map(row => mapActivityRow(row, headerIndex)),
    pagination: {
      page,
      limit,
      total: values.length - 1, // -1 para remover header
      totalPages: Math.ceil((values.length - 1) / limit),
      hasNext: endIndex < values.length,
      hasPrev: page > 1
    }
  };
}
```

---

## 🔧 Melhorias Técnicas Avançadas

### **1. Implementação de Testes**

```javascript
// tests/activities.test.gs - Exemplo de testes básicos
function testCreateActivity() {
  // Setup
  const mockPayload = {
    titulo: 'Teste Atividade',
    descricao: 'Descrição teste',
    data: '2024-12-31',
    categoria_atividade_id: 'CAT-001'
  };

  // Execute
  const result = createActivity(mockPayload, 'U001');

  // Assert
  if (!result.ok) {
    throw new Error(`Teste falhou: ${result.error}`);
  }

  if (!result.id || !result.id.startsWith('ACT-')) {
    throw new Error('ID da atividade não foi gerado corretamente');
  }

  console.log('✅ testCreateActivity passou');
}

function runAllTests() {
  const tests = [
    testCreateActivity,
    testLoginUser,
    testListActivities,
    // ... outros testes
  ];

  let passed = 0;
  let failed = 0;

  tests.forEach(test => {
    try {
      test();
      passed++;
    } catch (error) {
      console.error(`❌ ${test.name}: ${error.message}`);
      failed++;
    }
  });

  console.log(`Testes: ${passed} ✅ | ${failed} ❌`);
}
```

### **2. Sistema de Logs Avançado**

```javascript
// logging.gs - Sistema de logs estruturados
const Logger = {
  levels: { ERROR: 0, WARN: 1, INFO: 2, DEBUG: 3 },
  currentLevel: 2, // INFO por padrão

  log(level, message, data = {}) {
    if (this.levels[level] > this.currentLevel) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      user: State.uid || 'anonymous',
      session: Session.getTemporaryActiveUserKey() || 'none'
    };

    console.log(`[${logEntry.timestamp}] ${level}: ${message}`, data);

    // Salvar logs críticos na planilha
    if (level === 'ERROR') {
      this.saveToSheet(logEntry);
    }
  },

  error(message, data) { this.log('ERROR', message, data); },
  warn(message, data) { this.log('WARN', message, data); },
  info(message, data) { this.log('INFO', message, data); },
  debug(message, data) { this.log('DEBUG', message, data); },

  saveToSheet(logEntry) {
    try {
      // Implementar salvamento em planilha de logs
      // ... código para salvar
    } catch (e) {
      console.error('Falha ao salvar log:', e);
    }
  }
};
```

### **3. Melhorias de Segurança**

```javascript
// security.gs - Utilitários de segurança
const Security = {
  // Hash simples para PINs (melhor que texto plano)
  hashPin(pin, salt = 'dojotai2024') {
    const rawHash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      salt + pin,
      Utilities.Charset.UTF_8
    );

    return Utilities.base64Encode(rawHash);
  },

  // Validação de sessão mais robusta
  validateSession(uid) {
    if (!uid) return false;

    const sessionKey = `session_${uid}`;
    const session = PropertiesService.getScriptProperties().getProperty(sessionKey);

    if (!session) return false;

    try {
      const sessionData = JSON.parse(session);
      const now = Date.now();

      // Sessão expira em 8 horas
      if (now > sessionData.expires) {
        this.invalidateSession(uid);
        return false;
      }

      // Renova sessão se ainda válida
      sessionData.lastActivity = now;
      PropertiesService.getScriptProperties().setProperty(sessionKey, JSON.stringify(sessionData));

      return true;
    } catch (e) {
      this.invalidateSession(uid);
      return false;
    }
  },

  invalidateSession(uid) {
    PropertiesService.getScriptProperties().deleteProperty(`session_${uid}`);
  }
};
```

---

## 📚 Melhorias de Documentação

### **1. Documentação JSDoc**

```javascript
/**
 * Cria uma nova atividade no sistema
 * @param {Object} payload - Dados da atividade
 * @param {string} payload.titulo - Título da atividade (obrigatório)
 * @param {string} payload.descricao - Descrição detalhada
 * @param {string} payload.data - Data da atividade (YYYY-MM-DD)
 * @param {string} payload.categoria_atividade_id - ID da categoria
 * @param {string} payload.atribuido_uid - UID do responsável
 * @param {string} uidCriador - UID de quem está criando
 * @returns {Object} Resultado da operação
 * @returns {boolean} returns.ok - Sucesso da operação
 * @returns {string} returns.id - ID da atividade criada
 * @returns {string} returns.error - Mensagem de erro (se houver)
 *
 * @example
 * const result = createActivity({
 *   titulo: 'Reunião Semanal',
 *   descricao: 'Reunião de acompanhamento',
 *   data: '2024-12-15',
 *   categoria_atividade_id: 'CAT-001'
 * }, 'U001');
 *
 * if (result.ok) {
 *   console.log('Atividade criada:', result.id);
 * }
 */
function createActivity(payload, uidCriador) {
  // ... implementação
}
```

### **2. README Técnico**

```markdown
# 💻 Guia do Desenvolvedor

## Setup Local

### Pré-requisitos
- Node.js 16+
- Google Apps Script CLI (clasp)
- Conta Google com acesso ao Google Sheets

### Instalação
1. Clone o repositório
2. Instale dependências: `npm install -g @google/clasp`
3. Configure credenciais: `clasp login`
4. Configure planilhas conforme `docs/dados_dojotai.md`

### Deploy
```bash
# Deploy completo
clasp push

# Deploy específico
clasp push --watch

# Abrir editor online
clasp open
```

## Estrutura do Código

### Backend (.gs)
- `main.gs`: Entry point da aplicação
- `auth.gs`: Sistema de autenticação
- `activities.gs`: CRUD de atividades
- `utils.gs`: Utilitários e configuração

### Frontend (.html)
- `index.html`: Template principal
- `app_*.html`: Módulos da aplicação
- `view_*.html`: Telas da interface
- `styles_*.html`: Estilos CSS

## Convenções

### Nomenclatura
- **Funções públicas**: camelCase (`createActivity`)
- **Funções privadas**: camelCase com underscore (`validateData_`)
- **Constantes**: UPPER_CASE (`APP_CONFIG`)
- **IDs**: Prefixo + número (`ACT-0001`, `U-001`)

### Estrutura de Retorno
```javascript
// Sucesso
{ ok: true, data: {...} }

// Erro
{ ok: false, error: "Mensagem de erro" }
```
```

---

## 🎯 Cronograma de Implementação

### **Sprint 1 (1 semana) - Correções Críticas**
- [x] Renomear arquivo `activies_categories.gs` ✅ **Concluído**
- [ ] Implementar validações server-side
- [ ] Padronizar tratamento de erros
- [ ] Adicionar loading states faltantes

### **Sprint 2 (2 semanas) - Refatoração JavaScript**
- [ ] Modernizar sintaxe JavaScript (ES6+)
- [ ] Implementar sistema de cache robusto
- [ ] Melhorar performance de queries
- [ ] Adicionar documentação JSDoc

### **Sprint 3 (2 semanas) - Organização e Estrutura**
- [ ] Reorganizar nomenclatura de arquivos (prefixos)
- [ ] Implementar sistema de validação unificado
- [ ] Criar sistema de logs avançado
- [ ] Melhorias de segurança

### **Sprint 4 (3 semanas) - Testes e Documentação**
- [ ] Implementar testes básicos
- [ ] Criar guias de documentação técnica
- [ ] Setup de CI/CD básico
- [ ] Monitoramento e alertas

---

## 📊 Métricas de Sucesso

### **Qualidade de Código**
- **Antes**: 6.5/10 → **Meta**: 8.5/10
- Reduzir duplicação de código em 70%
- Cobrir 80% das funções críticas com testes
- Implementar JSDoc em 100% das APIs públicas

### **Performance**
- **Tempo de carregamento**: <3s → <1.5s
- **Queries otimizadas**: Reduzir em 50% chamadas desnecessárias
- **Cache hit rate**: 0% → 80%

### **Segurança**
- Implementar hash de senhas
- Sistema de sessões robusto
- Logs de auditoria completos
- Validações server-side em 100% das operações

### **Maintainability**
- Estrutura de arquivos organizada
- Documentação técnica completa
- Sistema de testes funcionando
- Pipeline de CI/CD configurado

---

## 🚀 Próximos Passos

### **1. Quick Wins (Esta semana)**
1. Corrigir nome do arquivo com typo
2. Adicionar validações básicas server-side
3. Implementar loading states faltantes
4. Padronizar retornos de erro

### **2. Médio Prazo (Próximo mês)**
1. Refatorar JavaScript para padrões modernos
2. Reorganizar nomenclatura de arquivos (prefixos semânticos)
3. Implementar sistema de cache
4. Adicionar documentação JSDoc

### **3. Longo Prazo (Próximos 3 meses)**
1. Implementar testes automatizados
2. Melhorias robustas de segurança
3. Sistema de monitoramento
4. Pipeline de CI/CD

---

## 📞 Suporte à Implementação

### **Recursos Recomendados**
- **Google Apps Script Best Practices**: [Link da documentação oficial]
- **JavaScript ES6+ Guide**: Para modernização do código
- **Testing Frameworks**: Para implementação de testes
- **Security Checklist**: Para melhorias de segurança

### **Priorização Sugerida**
1. **Segurança e Validações** (Crítico)
2. **Qualidade de Código** (Alto)
3. **Performance** (Médio)
4. **Testes e Docs** (Médio)
5. **Nomenclatura de Arquivos** (Baixo)

---

**🔄 Este documento deve ser revisado após cada sprint e atualizado conforme o progresso das implementações.**

---

*Documento gerado automaticamente através de análise de código. Para dúvidas ou esclarecimentos sobre as recomendações, consulte a equipe de desenvolvimento.*