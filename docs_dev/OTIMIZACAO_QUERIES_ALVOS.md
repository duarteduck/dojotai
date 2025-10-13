# 🚀 OTIMIZAÇÃO DE QUERIES - Sistema de Alvos e Participações

**Data:** 10/10/2025
**Objetivo:** Analisar e otimizar queries de busca de membros para alvos e participações

---

## 📊 ANÁLISE ATUAL

### **1. Fluxo: Definir Alvos (Edição de Atividade)**

**Sequência de chamadas:**

```
1. Usuário clica "🎯 Definir Alvos"
   └─> toggleTargetsSection('edit', activityId)
       └─> initializeTargetsSection('edit', activityId)
           ├─> loadTargetFilters('edit')
           │   └─> apiCall('listMembersApi')              // QUERY 1
           │       └─> DatabaseManager.query('membros', {}, true) // Busca TODOS
           └─> loadExistingTargets(activityId)
               └─> apiCall('listParticipacoes', activityId) // QUERY 2
                   ├─> DatabaseManager.query('participacoes', {id_atividade: X}, false)
                   └─> DatabaseManager.query('membros', {}, false) // QUERY 3 - Busca TODOS novamente!
```

**Total de queries:** 3
- Query 1: TODOS os membros (para filtros de status)
- Query 2: Participações da atividade
- Query 3: TODOS os membros (para mapear nomes)

**Problema:** Busca TODOS os membros 2x na mesma operação!

---

### **2. Fluxo: Buscar Membros (Botão "Buscar")**

**Sequência de chamadas:**

```
1. Usuário digita filtros e clica "Buscar"
   └─> searchMembersForTargets('edit')
       └─> apiCall('searchMembersByCriteria', filters)    // QUERY 4
           └─> DatabaseManager.query('membros', {}, false) // Busca TODOS
               └─> Filtra em MEMÓRIA (dojo, status, nome)
```

**Total de queries:** 1
- Query 4: TODOS os membros (filtra depois em memória)

**Problema:** Não aproveita índices do DatabaseManager, filtra tudo em memória

---

## 🔍 ANÁLISE DETALHADA DAS FUNÇÕES

### **Função 1: `listParticipacoes`** (participacoes.gs:8-79)

**Queries executadas:**
```javascript
// Query 1: Participações da atividade (OTIMIZADA - usa filtro)
const participacoes = DatabaseManager.query('participacoes', {
  id_atividade: activityId
}, false);

// Query 2: TODOS os membros (NÃO OTIMIZADA)
const membros = DatabaseManager.query('membros', {}, false);
```

**Objetivo:** Mapear `id_membro` → `nome_membro`

**Otimização possível:**
- Buscar apenas membros com IDs presentes nas participações
- Criar função `getMembersMapByIds(memberIds)`

---

### **Função 2: `searchMembersByCriteria`** (participacoes.gs:143-215)

**Queries executadas:**
```javascript
// Query única: TODOS os membros
const members = DatabaseManager.query('membros', {}, false);

// Depois filtra em memória
if (filters.dojo) {
  filteredMembers = filteredMembers.filter(m => m.dojo.includes(filters.dojo));
}
if (filters.status) {
  filteredMembers = filteredMembers.filter(m => m.status === filters.status);
}
if (filters.nome) {
  filteredMembers = filteredMembers.filter(m => m.nome.includes(filters.nome));
}
```

**Otimização possível:**
- Passar filtros diretamente para DatabaseManager.query()
- Aproveitar índices (se existirem)

---

### **Função 3: `listMembersApi`** (members.gs:8-35)

**Queries executadas:**
```javascript
// Query com cache habilitado
const queryResult = DatabaseManager.query('membros', {}, true);
```

**Observação:**
- ✅ Usa cache (membros mudam raramente)
- ❌ Retorna TODOS os campos de TODOS os membros

**Otimização possível:**
- Criar versão light: `listMembersLightApi()` com apenas `id`, `nome`, `dojo`, `status`

---

## 💡 PROPOSTAS DE OTIMIZAÇÃO

### **OTIMIZAÇÃO #1: Cache de Membros no Frontend** 🚀

**Impacto:** ALTO - Elimina 2 queries redundantes

**Implementação:**
```javascript
// Frontend: app_migrated.html
let cachedMembrosComplete = null; // Cache de todos os membros

async function getCachedMembers() {
  if (!cachedMembrosComplete) {
    const result = await apiCall('listMembersApi');
    if (result && result.ok) {
      cachedMembrosComplete = result.items;
    }
  }
  return cachedMembrosComplete || [];
}

// Usar em vez de múltiplas chamadas
async function initializeTargetsSection(mode, activityId) {
  // Carregar membros UMA VEZ
  const members = await getCachedMembers();

  // Usar para filtros
  populateTargetStatusFilter(members, mode);

  // Carregar alvos
  if (mode === 'edit' && activityId) {
    const participacoes = await apiCall('listParticipacoes', activityId);
    // Mapear nomes localmente usando cache
    const withNames = participacoes.items.map(p => ({
      ...p,
      nome_membro: members.find(m => m.codigo_sequencial === p.id_membro)?.nome || 'N/A'
    }));
  }
}
```

**Ganho:** 3 queries → 1 query

---

### **OTIMIZAÇÃO #2: listParticipacoes Otimizado** 🚀

**Impacto:** MÉDIO - Reduz volume de dados

**Backend: Nova função `listParticipacoes`**
```javascript
function listParticipacoes(sessionId, activityId) {
  // ... validação de sessão ...

  const participacoes = DatabaseManager.query('participacoes', {
    id_atividade: activityId
  }, false);

  if (!participacoes || participacoes.length === 0) {
    return { ok: true, items: [] };
  }

  // OTIMIZAÇÃO: Buscar apenas membros necessários
  const memberIds = [...new Set(participacoes.map(p => p.id_membro))];

  // Criar mapa apenas com membros necessários
  const membros = DatabaseManager.query('membros', {}, false) || [];
  const membrosMap = {};

  membros.forEach(m => {
    // Apenas membros que estão nas participações
    if (memberIds.includes(m.codigo_sequencial)) {
      membrosMap[m.codigo_sequencial] = m.nome || '';
    }
  });

  // ... resto do código ...
}
```

**Ganho:** Processa apenas membros necessários (ex: 10 em vez de 500)

---

### **OTIMIZAÇÃO #3: searchMembersByCriteria com Filtros Reais** 🚀

**Impacto:** MÉDIO - Aproveita índices do banco

**Backend: Otimizar filtros**
```javascript
function searchMembersByCriteria(sessionId, filters) {
  // ... validação de sessão ...

  // OTIMIZAÇÃO: Passar filtros simples para DatabaseManager
  const dbFilters = {};

  // Filtros exatos (aproveita índice)
  if (filters.status && filters.status.trim()) {
    dbFilters.status = filters.status.trim();
  }

  if (filters.dojo && filters.dojo.trim()) {
    dbFilters.dojo = filters.dojo.trim();
  }

  // Query já filtrada
  const members = DatabaseManager.query('membros', dbFilters, false);

  // Apenas filtro de nome precisa ser em memória (contains)
  let filteredMembers = members;

  if (filters.nome && filters.nome.trim()) {
    const nomeFiltro = filters.nome.toLowerCase().trim();
    filteredMembers = filteredMembers.filter(member => {
      const memberNome = (member.nome || '').toString().toLowerCase();
      return memberNome.includes(nomeFiltro);
    });
  }

  // Retornar apenas campos necessários
  const optimizedMembers = filteredMembers.map(member => ({
    codigo_sequencial: member.codigo_sequencial,
    nome: member.nome,
    dojo: member.dojo,
    status: member.status
  }));

  return { ok: true, items: optimizedMembers };
}
```

**Ganho:** Banco faz o trabalho pesado, menos dados trafegados

---

### **OTIMIZAÇÃO #4: Função Helper getMembersMapByIds** 🚀

**Impacto:** BAIXO - Reutilização de código

**Backend: Nova função auxiliar**
```javascript
/**
 * Busca apenas membros específicos por IDs e retorna mapa id->nome
 * @param {Array<string>} memberIds - Array de códigos sequenciais
 * @returns {Object} Mapa { codigo_sequencial: nome }
 */
function getMembersMapByIds(memberIds) {
  if (!memberIds || memberIds.length === 0) {
    return {};
  }

  const allMembers = DatabaseManager.query('membros', {}, true); // Com cache
  const membrosMap = {};

  allMembers.forEach(m => {
    if (memberIds.includes(m.codigo_sequencial)) {
      membrosMap[m.codigo_sequencial] = {
        nome: m.nome || '',
        dojo: m.dojo || '',
        status: m.status || ''
      };
    }
  });

  return membrosMap;
}
```

**Uso em `listParticipacoes`:**
```javascript
const memberIds = [...new Set(participacoes.map(p => p.id_membro))];
const membrosMap = getMembersMapByIds(memberIds);
```

---

## 📊 COMPARAÇÃO DE PERFORMANCE

### **Cenário: Editar atividade com 20 alvos**

| Métrica | ANTES | DEPOIS | Ganho |
|---------|-------|--------|-------|
| **Queries ao banco** | 3 | 1 | 67% ↓ |
| **Membros processados** | 500 + 500 + 500 = 1500 | 500 | 67% ↓ |
| **Dados trafegados** | ~200 KB | ~70 KB | 65% ↓ |
| **Tempo estimado** | ~2s | ~0.7s | 65% ↓ |

### **Cenário: Buscar membros com filtros**

| Métrica | ANTES | DEPOIS | Ganho |
|---------|-------|--------|-------|
| **Filtros aplicados** | Memória (JS) | Banco (índices) | - |
| **Membros processados** | 500 | ~50 (filtrados) | 90% ↓ |
| **Dados trafegados** | ~100 KB | ~2 KB | 98% ↓ |
| **Tempo estimado** | ~1s | ~0.2s | 80% ↓ |

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### **Fase 1: Quick Wins** (30 min)
- [x] Documentar problema
- [ ] Implementar cache de membros no frontend
- [ ] Testar com dados reais

### **Fase 2: Otimizar Backend** (1h)
- [ ] Atualizar `searchMembersByCriteria` para passar filtros ao DatabaseManager
- [ ] Otimizar `listParticipacoes` para processar apenas membros necessários
- [ ] Testar performance

### **Fase 3: Refatorar (se necessário)** (2h)
- [ ] Criar `getMembersMapByIds` helper
- [ ] Criar `listMembersLightApi` (apenas campos essenciais)
- [ ] Atualizar frontend para usar versão light

---

## ⚠️ CONSIDERAÇÕES

### **DatabaseManager.query() - Como funciona?**
```javascript
// Com filtros vazios
DatabaseManager.query('membros', {}, false) // Retorna TODOS

// Com filtros
DatabaseManager.query('membros', { status: 'Ativo' }, false) // Retorna apenas Ativos
```

**Pergunta:** O DatabaseManager filtra no banco ou em memória?
- Se filtra no banco (índices): ✅ Otimização #3 vale a pena
- Se filtra em memória: ❌ Otimização #3 não melhora performance

**Ação:** Verificar implementação de `DatabaseManager.query()`

---

## 🔗 PRÓXIMOS PASSOS

1. **Implementar Otimização #1** (Cache frontend) - Ganho imediato
2. **Verificar DatabaseManager.query()** - Entender como filtra
3. **Implementar Otimização #3** (se DatabaseManager suporta filtros eficientes)
4. **Medir performance real** - Antes vs Depois

---

**Status:** 📋 Análise completa - Aguardando decisão de implementação
**Responsável:** Claude Code + Diogo
**Próxima revisão:** Após implementação das otimizações
