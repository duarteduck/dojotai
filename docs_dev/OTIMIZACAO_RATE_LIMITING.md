# ⚡ OTIMIZAÇÃO: Rate Limiting do Google Apps Script

**Status:** 📋 Documentado - Implementação Pendente
**Prioridade:** 🟡 Média (🔴 Alta antes de produção com 5+ usuários)
**Criado em:** 30/10/2025
**Última Atualização:** 30/10/2025

---

## 📋 ÍNDICE

1. [O Problema](#o-problema)
2. [Limites do Google Apps Script](#limites-do-google-apps-script)
3. [Diagnóstico do Sistema Atual](#diagnóstico-do-sistema-atual)
4. [Soluções Propostas (Priorizadas)](#soluções-propostas-priorizadas)
5. [Implementação Recomendada](#implementação-recomendada)
6. [Testes](#testes)
7. [Monitoramento em Produção](#monitoramento-em-produção)
8. [Estimativas](#estimativas)

---

## 🐛 O PROBLEMA

### O Que É HTTP 429?

**HTTP 429 - Too Many Requests** é um código de status HTTP que indica que o usuário enviou **muitas requisições em um curto período de tempo** (rate limiting).

No contexto do Google Apps Script, significa que o **limite de requisições por minuto** foi atingido.

---

### Quando Aconteceu

**Data:** 30/10/2025
**Contexto:** Durante testes de logout/login com reload automático

**Log Real do Console:**

```
🔄 Destruindo sessão no servidor...
POST https://script.google.com/.../callback?... 429 (Too Many Requests)
❌ Erro ao destruir sessão no servidor: NetworkError: HTTP 429

🧹 Limpando dados locais...
✅ Logout completo! Recarregando página em 50ms...
🔄 Executando reload...
GET https://.../blank 429 (Too Many Requests)
```

**Análise:**
1. **1º 429:** Tentativa de fazer logout no servidor
2. **2º 429:** Tentativa de recarregar a página
3. **Causa:** Rate limit já havia sido atingido ANTES do logout (testes repetidos)

---

### Impacto

- ❌ Sistema fica **temporariamente bloqueado** (1-2 minutos)
- ❌ **Todos os usuários** são afetados (limite é por aplicação)
- ❌ Tela pode ficar branca ou travada
- ❌ Usuário não consegue fazer login/logout

---

## 📊 LIMITES DO GOOGLE APPS SCRIPT

### Quotas Diárias (Conta Gratuita)

| Recurso | Limite Diário |
|---------|---------------|
| URL Fetch calls | 20,000 |
| Script runtime | 6 min/execução |
| Simultaneous executions | ~30 |
| UrlfetchApp data received | 100 MB |

**Fonte:** [Apps Script Quotas](https://developers.google.com/apps-script/guides/services/quotas)

---

### Rate Limiting (Por Minuto)

⚠️ **Não documentado oficialmente**, mas existe!

**Observações práticas:**
- 🚫 Estimado: **60-100 requisições/minuto** por aplicação
- ⏱️ Janela de tempo: ~60 segundos
- 🔒 Bloqueio: 1-2 minutos após atingir o limite

---

### ⚠️ IMPORTANTE: Limitação é POR APLICAÇÃO

**NÃO é por usuário individual!**

```
┌─────────────────────────────────────────────────┐
│          APLICAÇÃO (Script Deploy)              │
├─────────────────────────────────────────────────┤
│  Rate Limit: ~60-100 req/min COMPARTILHADO     │
├─────────────────────────────────────────────────┤
│                                                 │
│  👤 Usuário 1: 20 req/min                      │
│  👤 Usuário 2: 25 req/min                      │
│  👤 Usuário 3: 30 req/min                      │
│  👤 Usuário 4: 15 req/min                      │
│                                                 │
│  TOTAL: 90 req/min ⚠️ PRÓXIMO DO LIMITE        │
│                                                 │
└─────────────────────────────────────────────────┘
```

**Implicação:**
- Um usuário "pesado" pode afetar todos os outros
- Durante testes intensos, pode bloquear o script inteiro
- 5-10 usuários ativos = risco alto de 429

---

## 🔍 DIAGNÓSTICO DO SISTEMA ATUAL

### Chamadas de API Identificadas

#### **1. `listUsuariosApi`** (Lista de usuários/responsáveis)

**Encontrado em 4 lugares:**

| Arquivo | Linha | Contexto | Quando Chama |
|---------|-------|----------|--------------|
| `src/05-components/filters.html` | 322 | Carregar responsáveis no filtro | Toda vez que abre modal de filtros (admin) |
| `src/05-components/ui/selectHelpers.html` | 114 | Populate select de responsáveis | Ao abrir modal de nova atividade |
| `src/05-components/ui/selectHelpers.html` | 188 | **DUPLICADO** - Pre-load | DOMContentLoaded |
| `src/04-views/activities.html` | 2792 | Pre-load de responsáveis | Ao entrar na tela de atividades |

**Problema:**
- ⚠️ **selectHelpers.html chama 2 vezes** (linha 114 e 188)
- ⚠️ Toda vez que abre modal de filtros carrega novamente

---

#### **2. `listCategoriasAtividadesApi`** (Lista de categorias)

**Encontrado em:**
- `src/05-components/filters.html` - Ao abrir modal de filtros
- `src/04-views/activities.html` - Pre-load na tela de atividades
- Diversos modais de criação/edição

---

#### **3. `getMyLinkedMembers`** (Vínculos usuário-membro)

**Encontrado em:**
- `src/05-components/memberSelector.html` - Ao carregar seletor de perfis
- Chamado no DOMContentLoaded

---

### Cenários de Múltiplas Requisições

#### **Cenário 1: Logout/Login sem Refresh**
```
logout()
  → logoutUser() ..................... 1 req
  → reload()
    → DOMContentLoaded
      → preLoadCachedData()
        → listUsuariosApi ............ 2 req
        → listCategoriasApi .......... 3 req
        → getMyLinkedMembers ......... 4 req
      → checkAuthAndInit()
        → showApp()
          → Carregar dashboard ........ 5-10 req
```

**1 logout = ~10 requisições!**

---

#### **Cenário 2: Abrir Tela de Atividades**
```
navigateToPage('activities')
  → initActivities()
    → listActivitiesApi ............. 1 req
    → listUsuariosApi (pre-load) .... 2 req
    → listCategoriasApi (pre-load) ... 3 req
  → Usuário abre modal de filtros
    → carregarCategorias() ........... 4 req
    → carregarResponsaveis() ......... 5 req (admin)
```

**1 navegação + 1 modal = 5 requisições!**

---

#### **Cenário 3: Criar Nova Atividade**
```
Abrir modal de nova atividade
  → listCategoriasApi ................ 1 req
  → listUsuariosApi (responsável) .... 2 req
  → listUsuariosApi (DUPLICADO) ...... 3 req ⚠️
  → createActivityApi ................ 4 req
  → listActivitiesApi (recarregar) ... 5 req
```

**1 criação = 5 requisições!**

---

### Estimativa de Requisições em Teste

**Durante 5 minutos de teste intenso:**
- 🔄 3 logout/login = 30 req
- 📋 5 aberturas de atividades = 25 req
- ➕ 2 criações de atividade = 10 req
- 🔍 3 aberturas de filtros = 15 req

**TOTAL: ~80 requisições em 5 minutos** ⚠️ Próximo do limite!

---

## ✅ SOLUÇÕES PROPOSTAS (PRIORIZADAS)

### 🔴 **Estratégia 1: Cache no LocalStorage** (ALTA PRIORIDADE)

**Problema que resolve:**
- ✅ Cache sobrevive ao reload
- ✅ Evita recarregar dados que não mudam frequentemente
- ✅ Redução de ~60% das requisições

**Implementação:**

```javascript
// Helper para cache com timestamp
const CacheManager = {
    set(key, data, ttlMinutes = 30) {
        const item = {
            data: data,
            timestamp: Date.now(),
            ttl: ttlMinutes * 60 * 1000
        };
        localStorage.setItem(`cache_${key}`, JSON.stringify(item));
    },

    get(key) {
        const itemStr = localStorage.getItem(`cache_${key}`);
        if (!itemStr) return null;

        const item = JSON.parse(itemStr);
        const now = Date.now();

        // Verificar se expirou
        if (now - item.timestamp > item.ttl) {
            localStorage.removeItem(`cache_${key}`);
            return null;
        }

        return item.data;
    },

    invalidate(key) {
        localStorage.removeItem(`cache_${key}`);
    },

    clear() {
        Object.keys(localStorage)
            .filter(k => k.startsWith('cache_'))
            .forEach(k => localStorage.removeItem(k));
    }
};

// Uso em carregarResponsaveis()
function carregarResponsaveis(callback) {
    // Tentar cache primeiro
    const cached = CacheManager.get('responsaveis');
    if (cached) {
        console.log('✅ Usando cache de responsáveis');
        responsaveisDisponiveis = cached;
        populateResponsaveisOptions();
        if (callback) callback();
        return;
    }

    // Cache miss, carregar do servidor
    if (typeof google !== 'undefined' && google.script && google.script.run) {
        (async () => {
            try {
                const result = await apiCall('listUsuariosApi');
                if (result && result.ok && result.items) {
                    // Salvar no cache (30 minutos)
                    CacheManager.set('responsaveis', result.items, 30);

                    responsaveisDisponiveis = result.items;
                    populateResponsaveisOptions();
                    console.log('✅ Responsáveis carregados e cacheados:', result.items.length);
                    if (callback) callback();
                }
            } catch (error) {
                console.error('❌ Erro ao carregar responsáveis:', error);
            }
        })();
    }
}
```

**Impacto Esperado:** Redução de **~60%** das requisições

**Arquivos a Modificar:**
- `src/05-components/filters.html` - carregarResponsaveis(), carregarCategorias()
- `src/05-components/ui/selectHelpers.html` - Populate selects
- `src/04-views/activities.html` - Pre-load

---

### 🔴 **Estratégia 2: Remover Chamadas Duplicadas** (ALTA PRIORIDADE)

**Problema que resolve:**
- ✅ selectHelpers.html chama listUsuariosApi 2 vezes!
- ✅ Fácil de implementar (apenas remover código)
- ✅ Redução imediata de ~10-15% das requisições

**Duplicatas Identificadas:**

**1. selectHelpers.html - Linhas 114 e 188:**

```javascript
// LINHA 114 - Populate select (quando modal abre)
const result = await apiCall('listUsuariosApi');

// LINHA 188 - Pre-load no DOMContentLoaded
const result = await apiCall('listUsuariosApi');  // ⚠️ DUPLICADO!
```

**Solução:** Remover pre-load da linha 188 (já tem cache de qualquer forma)

**Impacto Esperado:** Redução de **~10-15%** das requisições

**Arquivos a Modificar:**
- `src/05-components/ui/selectHelpers.html:185-195` - Remover bloco de pre-load

---

### 🟡 **Estratégia 3: Lazy Loading** (MÉDIA PRIORIDADE)

**Problema que resolve:**
- ✅ Não carrega dados que usuário pode não usar
- ✅ Distribui requisições ao longo do tempo
- ✅ Redução de ~20-30% no pico de requisições

**Implementação:**

```javascript
// ANTES - Pre-load no DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    carregarCategorias();     // Sempre carrega
    carregarResponsaveis();   // Sempre carrega
});

// DEPOIS - Lazy load ao abrir modal
function abrirModalFiltros() {
    const modal = document.getElementById('modal-filtros');
    modal.style.display = 'block';

    // Carregar apenas quando abrir (se não tem cache)
    carregarCategorias();

    const isAdmin = isCurrentUserAdmin();
    if (isAdmin) {
        carregarResponsaveis();
    }
}
```

**Impacto Esperado:** Redução de **~20-30%** no pico inicial

**Arquivos a Modificar:**
- `src/05-components/filters.html` - Remover pre-load, manter lazy load no modal
- `src/04-views/activities.html` - Remover pre-load desnecessário

---

### 🟢 **Estratégia 4: Debouncing** (BAIXA PRIORIDADE)

**Problema que resolve:**
- ✅ Previne múltiplas chamadas da mesma API em < 1 segundo
- ✅ Proteção adicional contra bugs/loops
- ✅ Redução de ~5-10% (casos extremos)

**Implementação:**

```javascript
// Wrapper com debouncing
const apiCallDebounced = (() => {
    const lastCalls = {};
    const pendingCalls = {};

    return function(functionName, ...args) {
        const key = `${functionName}_${JSON.stringify(args)}`;
        const now = Date.now();

        // Se já tem uma chamada pendente, retornar a Promise existente
        if (pendingCalls[key]) {
            console.log('⏸️ Reutilizando chamada pendente:', functionName);
            return pendingCalls[key];
        }

        // Se chamou recentemente (< 1 segundo), bloquear
        if (lastCalls[key] && now - lastCalls[key] < 1000) {
            console.warn('⚠️ Bloqueando chamada duplicada (<1s):', functionName);
            return Promise.resolve(null);
        }

        // Fazer chamada
        lastCalls[key] = now;
        const promise = apiCall(functionName, ...args);

        pendingCalls[key] = promise;
        promise.finally(() => {
            delete pendingCalls[key];
        });

        return promise;
    };
})();

// Uso
const result = await apiCallDebounced('listUsuariosApi');
```

**Impacto Esperado:** Redução de **~5-10%** (casos extremos)

**Arquivos a Modificar:**
- `src/05-components/core/api.html` - Criar wrapper debounced

---

### 🟢 **Estratégia 5: Batch Requests** (BAIXA PRIORIDADE - Mais Trabalhoso)

**Problema que resolve:**
- ✅ Múltiplas chamadas viram 1 só
- ✅ Mais eficiente para o servidor
- ✅ Redução potencial de ~40-50%

**Implementação:**

```javascript
// Backend - Criar função batch
function batchLoadApi(sessionId, requests) {
    // requests = ['usuarios', 'categorias', 'members']
    const results = {};

    if (requests.includes('usuarios')) {
        results.usuarios = listUsuariosApi(sessionId);
    }
    if (requests.includes('categorias')) {
        results.categorias = listCategoriasAtividadesApi(sessionId);
    }
    if (requests.includes('members')) {
        results.members = getMyLinkedMembersApi(sessionId);
    }

    return { ok: true, results: results };
}

// Frontend
const result = await apiCall('batchLoadApi', ['usuarios', 'categorias', 'members']);
const usuarios = result.results.usuarios;
const categorias = result.results.categorias;
const members = result.results.members;
```

**Impacto Esperado:** Redução de **~40-50%** (mas requer refatoração)

**Arquivos a Criar/Modificar:**
- Backend: Criar `batchLoadApi()` em algum arquivo de API
- Frontend: Modificar todos os pre-loads para usar batch

---

## 📝 IMPLEMENTAÇÃO RECOMENDADA

### Ordem de Implementação (Por Prioridade)

#### **Fase 1: Quick Wins (1-2 horas)** 🔴
**Implementar antes de produção com 5+ usuários**

1. ✅ **Remover chamadas duplicadas** (selectHelpers.html)
   - Esforço: 5 minutos
   - Impacto: -10-15% requisições

2. ✅ **Cache no localStorage** (responsáveis + categorias)
   - Esforço: 1-2 horas
   - Impacto: -60% requisições
   - TTL: 30 minutos

**Redução Total Fase 1:** **~65-70%** ✨

---

#### **Fase 2: Melhorias (2-3 horas)** 🟡
**Implementar quando tiver 10+ usuários ativos**

3. ✅ **Lazy loading** (remover pre-loads desnecessários)
   - Esforço: 1-2 horas
   - Impacto: -20-30% pico inicial

4. ✅ **Debouncing** (proteção contra loops)
   - Esforço: 1 hora
   - Impacto: -5-10% casos extremos

**Redução Total Fase 2:** **~25-40%** adicional

---

#### **Fase 3: Otimização Avançada (1 dia)** 🟢
**Implementar quando escalar para 20+ usuários**

5. ✅ **Batch requests** (refatoração backend)
   - Esforço: 1 dia
   - Impacto: -30-40% adicional

---

### Código Pronto para Copiar

#### **CacheManager (Helper)**

Criar novo arquivo: `src/05-components/utils/cacheManager.html`

```html
<script>
    /**
     * ============================================================================
     * CACHE MANAGER - Gerenciamento de cache no localStorage com TTL
     * ============================================================================
     */

    window.CacheManager = {
        /**
         * Salva dados no cache com timestamp e TTL
         * @param {string} key - Chave do cache
         * @param {*} data - Dados a serem cacheados
         * @param {number} ttlMinutes - Tempo de vida em minutos (padrão: 30)
         */
        set(key, data, ttlMinutes = 30) {
            try {
                const item = {
                    data: data,
                    timestamp: Date.now(),
                    ttl: ttlMinutes * 60 * 1000
                };
                localStorage.setItem(`cache_${key}`, JSON.stringify(item));
                console.log(`💾 Cache salvo: ${key} (TTL: ${ttlMinutes}min)`);
            } catch (error) {
                console.error('❌ Erro ao salvar cache:', error);
            }
        },

        /**
         * Recupera dados do cache (se não expirou)
         * @param {string} key - Chave do cache
         * @returns {*|null} - Dados ou null se expirado/inexistente
         */
        get(key) {
            try {
                const itemStr = localStorage.getItem(`cache_${key}`);
                if (!itemStr) {
                    console.log(`📭 Cache miss: ${key}`);
                    return null;
                }

                const item = JSON.parse(itemStr);
                const now = Date.now();
                const age = Math.floor((now - item.timestamp) / 1000); // segundos

                // Verificar se expirou
                if (now - item.timestamp > item.ttl) {
                    console.log(`⏰ Cache expirado: ${key} (idade: ${age}s)`);
                    localStorage.removeItem(`cache_${key}`);
                    return null;
                }

                console.log(`✅ Cache hit: ${key} (idade: ${age}s)`);
                return item.data;
            } catch (error) {
                console.error('❌ Erro ao ler cache:', error);
                return null;
            }
        },

        /**
         * Invalida (remove) um cache específico
         * @param {string} key - Chave do cache
         */
        invalidate(key) {
            localStorage.removeItem(`cache_${key}`);
            console.log(`🗑️ Cache invalidado: ${key}`);
        },

        /**
         * Limpa todos os caches
         */
        clear() {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
            keys.forEach(k => localStorage.removeItem(k));
            console.log(`🧹 ${keys.length} caches limpos`);
        },

        /**
         * Lista todos os caches e seus status
         */
        list() {
            const keys = Object.keys(localStorage).filter(k => k.startsWith('cache_'));
            const caches = keys.map(k => {
                try {
                    const item = JSON.parse(localStorage.getItem(k));
                    const age = Math.floor((Date.now() - item.timestamp) / 1000);
                    const ttl = Math.floor(item.ttl / 1000);
                    const remaining = ttl - age;
                    return {
                        key: k.replace('cache_', ''),
                        age: `${age}s`,
                        remaining: remaining > 0 ? `${remaining}s` : 'EXPIRADO',
                        size: new Blob([JSON.stringify(item.data)]).size + ' bytes'
                    };
                } catch {
                    return null;
                }
            }).filter(Boolean);

            console.table(caches);
        }
    };

    console.log('✅ CacheManager carregado');
</script>
```

---

## 🧪 TESTES

### Como Testar se Otimizações Funcionaram

#### **1. Monitorar Requisições no Console**

Abrir DevTools (F12) → Network → Filtrar por "script.google.com"

**ANTES das otimizações:**
```
Ação: Abrir tela de atividades
Requisições: 5-7 em < 1 segundo
```

**DEPOIS das otimizações:**
```
Ação: Abrir tela de atividades
Requisições: 1-2 (resto vem do cache)
```

---

#### **2. Verificar Logs do Cache**

Console deve mostrar:
```
💾 Cache salvo: responsaveis (TTL: 30min)
✅ Cache hit: responsaveis (idade: 45s)
```

---

#### **3. Teste de Stress**

Fazer **10 logout/login seguidos** em < 2 minutos:

**ANTES:**
- ❌ 429 após 3-4 tentativas

**DEPOIS:**
- ✅ Sem 429 (ou apenas nos últimos 1-2)

---

### Métricas de Sucesso

| Métrica | Antes | Meta Pós-Otimização |
|---------|-------|---------------------|
| Req/min (1 usuário) | ~15-20 | < 5 |
| Req ao abrir atividades | 5-7 | 1-2 |
| Req ao abrir filtros | 3-5 | 0-1 (cache) |
| Usuários simultâneos suportados | ~3-5 | 10-15 |
| Tempo até 429 (teste stress) | ~3 min | > 10 min |

---

## ⚠️ MONITORAMENTO EM PRODUÇÃO

### Quando Implementar

**Momento crítico:** Antes de ter **5+ usuários ativos simultaneamente**

**Sinais de alerta:**
- 🚨 Usuários reportam "sistema lento"
- 🚨 Erros 429 aparecem nos logs
- 🚨 Tela branca após logout
- 🚨 Modais demoram para abrir

---

### Plano de Contingência

**Se mesmo com otimizações ainda tiver 429:**

1. **Curto prazo:**
   - ⚠️ Avisar usuários para aguardar 1-2 min entre ações pesadas
   - ⚠️ Limitar número de usuários simultâneos

2. **Médio prazo:**
   - 🔄 Implementar Batch Requests (Estratégia 5)
   - 💰 Considerar upgrade para conta paga do Google Workspace (limites maiores)
   - 🔧 Implementar fila de requisições com retry

3. **Longo prazo:**
   - 🏗️ Migrar para backend próprio (Node.js, Firebase, etc)
   - 📊 Implementar analytics para identificar gargalos

---

## 📊 ESTIMATIVAS

### Requisições Atuais vs Otimizadas

#### **Cenário: 1 Usuário - Sessão de 30 minutos**

| Ação | Req ANTES | Req DEPOIS (Fase 1) | Redução |
|------|-----------|---------------------|---------|
| Login | 3-4 | 3-4 (não otimizado) | 0% |
| Abrir Atividades | 5-7 | 1-2 | **70%** |
| Abrir Filtros | 3-5 | 0-1 | **80%** |
| Criar Atividade | 5 | 3 | **40%** |
| Logout | 1 | 1 | 0% |
| **TOTAL** | **17-22** | **8-11** | **~50%** |

---

#### **Cenário: 10 Usuários Simultâneos - Pico de Uso**

| Fase | Req/min | Usuários Suportados | Status |
|------|---------|---------------------|--------|
| **ATUAL** | ~80-100 | 3-5 | ❌ Risco alto de 429 |
| **Fase 1** | ~30-40 | 10-15 | ✅ Seguro |
| **Fase 2** | ~15-25 | 15-20 | ✅ Muito seguro |
| **Fase 3** | ~10-15 | 20-30 | ✅ Escalável |

---

### Capacidade Máxima

**Com otimizações da Fase 1 + 2:**
- ✅ **10-15 usuários simultâneos** sem problemas
- ⚠️ **15-20 usuários** - monitorar de perto
- 🚫 **20+ usuários** - implementar Fase 3

---

## 📅 HISTÓRICO DE MUDANÇAS

| Data | Mudança | Responsável |
|------|---------|-------------|
| 30/10/2025 | Documento criado | Claude Code |
| 30/10/2025 | Identificado problema de 429 durante testes | Diogo + Claude |

---

## 📚 REFERÊNCIAS

- [Apps Script Quotas Documentation](https://developers.google.com/apps-script/guides/services/quotas)
- [HTTP Status 429 - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429)
- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)

---

**📅 Última Atualização:** 30/10/2025
**👤 Autor:** Claude Code
**✅ Status:** Documentado - Aguardando Implementação
