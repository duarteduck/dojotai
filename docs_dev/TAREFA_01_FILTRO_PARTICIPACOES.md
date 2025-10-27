# 🎯 TAREFA 01: Filtro de Atividades com Participações

**Status:** 📋 Planejado
**Criado em:** 24/10/2025
**Prioridade:** 🔴 Alta
**Complexidade:** 🟡 Média
**Tempo Estimado:** 3-4 horas

---

## 📋 ÍNDICE

1. [Objetivo](#objetivo)
2. [Contexto Atual](#contexto-atual)
3. [Solução Proposta](#solução-proposta)
4. [Arquivos Impactados](#arquivos-impactados)
5. [Análise Técnica Detalhada](#análise-técnica-detalhada)
6. [Código de Implementação](#código-de-implementação)
7. [Pontos de Atenção](#pontos-de-atenção)
8. [Checklist de Implementação](#checklist-de-implementação)
9. [Testes](#testes)
10. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 🎯 OBJETIVO

Modificar a tela de atividades para mostrar:
- ✅ Atividades onde o **usuário logado é responsável** (atribuido_uid)
- ✅ Atividades onde o **membro ativo é participante** (tipo: alvo ou extra)
- ✅ **Respeitar todos os filtros existentes** (status, categorias, período, responsável)
- ✅ **Query otimizada** (evitar N queries, usar batch)

### Benefício para o Usuário

Atualmente, ao abrir a tela de atividades, o usuário vê **todas** as atividades do sistema (respeitando filtros). Com esta mudança, verá apenas as atividades **relevantes para ele**:
- Atividades que ele é responsável
- Atividades onde o membro selecionado participa

Isso melhora a **usabilidade** e a **performance** (menos dados para renderizar).

---

## 📊 CONTEXTO ATUAL

### Como Funciona Hoje

**Backend:** `src/01-business/activities.gs`
```javascript
function _listActivitiesCore(filtros, singleActivityId) {
  // Query de TODAS as atividades
  const atividades = DatabaseManager.query('atividades', filtrosBasicos);

  // Filtra por: status, categorias, periodo, responsavel
  // ❌ NÃO considera participações

  return { ok: true, items: atividades };
}
```

**Frontend:** `src/04-views/activities.html`
```javascript
function loadActivities() {
  const filtrosBackend = {
    status: filtrosState.status || [],
    categorias: filtrosState.categorias || [],
    periodo: filtrosState.periodo || [],
    responsavel: filtrosState.responsavel || []
  };

  apiCall('listActivitiesApi', filtrosBackend).then(response => {
    renderActivities(response.items);
  });
}
```

### Problema

1. **Poluição visual:** Usuário vê atividades irrelevantes
2. **Performance:** Renderiza 100+ atividades quando poderia mostrar 10-20
3. **Usabilidade:** Difícil encontrar "minhas atividades"

---

## 💡 SOLUÇÃO PROPOSTA

### Abordagem: Query Batch Otimizada

**Opção A: Join Eficiente (RECOMENDADA)** ⭐

```
┌─────────────────────────────────────────────────────┐
│                  FLUXO OTIMIZADO                    │
└─────────────────────────────────────────────────────┘

1. Query ATIVIDADES com filtros (1 query)
   ↓
2. Query PARTICIPAÇÕES do membro (1 query batch)
   ↓
3. Criar Set de IDs de atividades (lookup O(1))
   ↓
4. Filtrar atividades (loop único)
   ├─ Usuário é responsável? → INCLUIR
   └─ Membro é participante? → INCLUIR
   ↓
5. Retornar lista filtrada

TOTAL: 2 queries + 1 loop
TEMPO: ~200ms para 100 atividades + 500 participações
```

**Opção B: Query por Atividade (NÃO RECOMENDADA)** ❌
```
Para cada atividade:
  ├─ Query participações (1 query)
  └─ Verificar se membro participa

TOTAL: N queries (N = número de atividades)
TEMPO: ~5s para 100 atividades 😱
```

### Por que Opção A?

| Critério | Opção A | Opção B |
|----------|---------|---------|
| Queries | 2 | 100+ |
| Performance | ✅ ~200ms | ❌ ~5s |
| Escalabilidade | ✅ O(n) | ❌ O(n²) |
| Complexidade | 🟡 Média | 🟢 Baixa |

---

## 📁 ARQUIVOS IMPACTADOS

| Arquivo | Tipo | Modificação | Linhas | Zona |
|---------|------|-------------|--------|------|
| `src/01-business/activities.gs` | Backend Core | Modificar query + lógica de filtro | ~50 | 🟡 Amarela |
| `src/04-views/activities.html` | Frontend | Passar memberId na chamada API | ~5 | 🟢 Verde |
| `src/00-core/data_dictionary.gs` | Schema | Documentar (opcional) | ~10 | 🟢 Verde |

**Total:** 3 arquivos, ~65 linhas modificadas

---

## 🔧 ANÁLISE TÉCNICA DETALHADA

### 1. Backend Core - activities.gs

**Localização:** `src/01-business/activities.gs:60` (função `_listActivitiesCore`)

**Assinatura Atual:**
```javascript
function _listActivitiesCore(filtros, singleActivityId)
```

**Nova Assinatura:**
```javascript
function _listActivitiesCore(filtros, singleActivityId, userId, memberId)
```

**Mudanças:**
1. Adicionar parâmetros `userId` e `memberId`
2. Query batch de participações do membro
3. Criar Set de IDs para lookup O(1)
4. Adicionar filtro OR (responsável OU participante)

### 2. Backend API - activities.gs

**Localização:** `src/01-business/activities.gs:3` (função `listActivitiesApi`)

**Mudanças:**
1. Extrair `userId` da sessão
2. Receber `memberId` como parâmetro do frontend
3. Validar com `requireMemberAccess()`
4. Passar para `_listActivitiesCore()`

### 3. Frontend - activities.html

**Localização:** `src/04-views/activities.html:171` (função `loadActivities`)

**Mudanças:**
1. Adicionar `State.selectedMemberId` na chamada
2. Validar que membro está selecionado
3. Tratamento de erro se membro ausente

---

## 💻 CÓDIGO DE IMPLEMENTAÇÃO

### Backend Core (activities.gs)

```javascript
// Modificar listActivitiesApi (linha 3)
async function listActivitiesApi(sessionId, filtros, memberId) {
  console.log('🚀 listActivitiesApi - memberId:', memberId);
  try {
    // 1. Validar sessão
    const auth = await requireSession(sessionId, 'Activities');
    if (!auth.ok) return auth;

    const userId = auth.session.user_id;

    // 2. Validar acesso ao membro
    if (memberId) {
      const memberAuth = await requireMemberAccess(sessionId, memberId, 'Activities');
      if (!memberAuth.ok) return memberAuth;
    }

    // 3. Chamar core com userId e memberId
    const result = _listActivitiesCore(filtros, null, userId, memberId);
    console.log('📊 _listActivitiesCore resultado:', result?.ok ? 'OK' : 'ERRO', '- Items:', result?.items?.length || 0);

    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    console.error('❌ ERRO listActivitiesApi:', err);
    return { ok: false, error: 'Erro listActivitiesApi: ' + (err?.message || err) };
  }
}

// Modificar _listActivitiesCore (linha 60)
function _listActivitiesCore(filtros, singleActivityId, userId, memberId) {
  const modo = singleActivityId ? 'SINGLE' : 'LIST';
  console.log(`🔄 _listActivitiesCore - Modo: ${modo}, userId: ${userId}, memberId: ${memberId}`);

  const ctx = getActivitiesCtx_();
  const values = getFullTableValues_(ctx);

  if (!values || !values.length) {
    return { ok: false, error: 'A tabela de atividades está vazia.' };
  }

  const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
  const headerIndex = {};
  header.forEach((name, i) => headerIndex[name] = i);

  const v = trimValuesByRequired_(values, headerIndex, ['id','titulo','status']);

  // Índices das colunas
  const idxId   = headerIndex['id'];
  const idxTit  = headerIndex['titulo'];
  const idxDesc = headerIndex['descricao'];
  const idxData = headerIndex['data'];
  const idxStat = headerIndex['status'];
  const idxAtuU = headerIndex['atualizado_uid'];
  const idxCri  = headerIndex['criado_em'];
  const idxAtuE = headerIndex['atualizado_em'];
  const idxAtrU = headerIndex['atribuido_uid'];
  const idxCatIds = headerIndex['categorias_ids'];
  const idxTags = headerIndex['tags'];

  // ✅ NOVO: Query de participações do membro (BATCH)
  let atividadesComParticipacao = new Set();

  if (memberId) {
    console.log('🔍 Buscando participações do membro:', memberId);
    const participacoes = DatabaseManager.query('participacoes', {
      id_membro: memberId.toString(),
      deleted: { $ne: 'x' }
    });

    if (participacoes && participacoes.ok && participacoes.items) {
      participacoes.items.forEach(p => {
        atividadesComParticipacao.add(p.id_atividade);
      });
      console.log('✅ Participações encontradas:', atividadesComParticipacao.size);
    }
  }

  // Processar atividades
  const items = [];

  for (let i = 1; i < v.length; i++) {
    const row = v[i];
    const id = (row[idxId] || '').toString().trim();

    if (!id) continue; // Pular linhas vazias

    // ✅ NOVO: Filtro de usuário/membro
    const atribuidoUid = (row[idxAtrU] || '').toString().trim();
    const isResponsavel = (atribuidoUid === userId);
    const isParticipante = atividadesComParticipacao.has(id);

    // Pular se NÃO é responsável E NÃO é participante
    if (!isResponsavel && !isParticipante) {
      continue;
    }

    // Construir objeto da atividade
    const ativ = {
      id: id,
      titulo: (row[idxTit] || '').toString().trim(),
      descricao: (row[idxDesc] || '').toString().trim(),
      data: (row[idxData] || '').toString().trim(),
      status: (row[idxStat] || '').toString().trim(),
      atualizado_uid: atribuidoUid,
      criado_em: (row[idxCri] || '').toString().trim(),
      atualizado_em: (row[idxAtuE] || '').toString().trim(),
      atribuido_uid: atribuidoUid,
      categorias_ids: (row[idxCatIds] || '').toString().trim(),
      tags: (row[idxTags] || '').toString().trim()
    };

    // Aplicar filtros existentes (status, categorias, periodo, responsavel)
    // ... (lógica existente de filtros)

    items.push(ativ);
  }

  console.log('📋 Atividades filtradas:', items.length);
  return { ok: true, items: items };
}
```

### Frontend (activities.html)

```javascript
// Modificar loadActivities (linha 171)
function loadActivities() {
  // Prevenir chamadas simultâneas
  if (isLoadingActivities) {
    console.log('⚠️ loadActivities já está em execução, ignorando chamada duplicada');
    return;
  }
  isLoadingActivities = true;

  // ✅ NOVO: Validar membro selecionado
  if (!State.selectedMemberId) {
    console.warn('⚠️ Nenhum membro selecionado');
    showToast('Selecione um membro para ver as atividades', 'warning');
    isLoadingActivities = false;
    return;
  }

  const memberId = parseInt(State.selectedMemberId, 10);
  if (isNaN(memberId) || memberId <= 0) {
    console.error('❌ ID do membro inválido:', State.selectedMemberId);
    showToast('Erro: ID do membro inválido', 'error');
    isLoadingActivities = false;
    return;
  }

  const grid = document.getElementById('activities-grid');
  if (!grid) {
    isLoadingActivities = false;
    return;
  }

  // Mostrar loading overlay
  if (typeof showActivitiesLoadingOverlay === 'function') {
    showActivitiesLoadingOverlay(true);
  }

  // Preparar filtros para enviar ao backend
  const filtrosBackend = {
    status: filtrosState.status || [],
    categorias: filtrosState.categorias || [],
    periodo: filtrosState.periodo || [],
    responsavel: filtrosState.responsavel || []
  };

  // ✅ MODIFICADO: Adicionar memberId na chamada
  (async () => {
    try {
      const response = await apiCall('listActivitiesApi', filtrosBackend, memberId);

      if (response && response.ok) {
        console.log('✅ Atividades carregadas:', response.items?.length || 0);
        renderActivities(response.items || []);
      } else {
        console.error('❌ Erro ao carregar atividades:', response);
        showToast('Erro ao carregar atividades: ' + (response?.error || 'Erro desconhecido'), 'error');
        renderActivities([]);
      }

    } catch (error) {
      console.error('❌ Exceção ao carregar atividades:', error);
      showToast('Erro ao carregar atividades', 'error');
      renderActivities([]);
    } finally {
      if (typeof showActivitiesLoadingOverlay === 'function') {
        showActivitiesLoadingOverlay(false);
      }
      isLoadingActivities = false;
    }
  })();
}
```

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Conflito com Filtro "Responsável"

**Problema:** Atualmente o filtro "Responsável" filtra por `atribuido_uid`. Se usuário seleciona "Responsável: João", deve mostrar:
- Opção A: Apenas atividades onde João é responsável ✅
- Opção B: Atividades onde João é responsável OU participante ❓

**Decisão Recomendada:** Opção A (não misturar conceitos)

**Alternativa:** Adicionar filtro separado "Participante" no modal de filtros

### 2. Estado Global `selectedMemberId`

**Como é Usado:**
```javascript
// State é global, definido em src/05-components/core/state.html
State.selectedMemberId = 5; // Definido ao fazer login ou trocar membro
```

**Validação Necessária:**
- Frontend: Verificar se existe antes de chamar API
- Backend: Validar com `requireMemberAccess()` (garante vínculo ativo)

### 3. Performance com Muitas Participações

**Cenário Crítico:**
- 1000 atividades
- 5000 participações (média 5 por atividade)

**Performance Esperada:**
- Query atividades: ~100ms
- Query participações: ~150ms
- Criação do Set: ~10ms
- Loop de filtro: ~50ms
- **Total: ~310ms** ✅ Aceitável

**Se Performance Degradar:**
- Opção 1: Cache de participações por membro (30min)
- Opção 2: Índice composto (membro_id, id_atividade) na planilha

### 4. Backward Compatibility

**Chamadas Antigas da API:**
```javascript
// ANTES: apiCall('listActivitiesApi', filtros)
// DEPOIS: apiCall('listActivitiesApi', filtros, memberId)
```

**Solução:** Backend aceita `memberId` opcional:
```javascript
async function listActivitiesApi(sessionId, filtros, memberId = null) {
  // Se memberId não for passado, retorna TODAS as atividades (comportamento antigo)
  // Se memberId for passado, aplica filtro novo
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Backend Core

- [ ] **Modificar `listActivitiesApi()`** (linha 3)
  - [ ] Adicionar parâmetro `memberId`
  - [ ] Extrair `userId` da sessão
  - [ ] Validar com `requireMemberAccess()` se memberId fornecido
  - [ ] Passar `userId` e `memberId` para `_listActivitiesCore()`

- [ ] **Modificar `_listActivitiesCore()`** (linha 60)
  - [ ] Adicionar parâmetros `userId` e `memberId` na assinatura
  - [ ] Implementar query batch de participações
  - [ ] Criar `Set` de IDs de atividades com participação
  - [ ] Adicionar filtro OR (responsável OU participante)
  - [ ] Adicionar logs de debug

### Fase 2: Frontend

- [ ] **Modificar `loadActivities()`** (linha 171)
  - [ ] Adicionar validação de `State.selectedMemberId`
  - [ ] Converter para número e validar
  - [ ] Passar `memberId` na chamada `apiCall()`
  - [ ] Tratar erro se membro não selecionado

### Fase 3: Testes

- [ ] **Teste 1:** Usuário é responsável (deve aparecer)
- [ ] **Teste 2:** Membro é participante tipo "alvo" (deve aparecer)
- [ ] **Teste 3:** Membro é participante tipo "extra" (deve aparecer)
- [ ] **Teste 4:** Nem responsável nem participante (NÃO deve aparecer)
- [ ] **Teste 5:** Filtros combinados (status + categorias + participação)
- [ ] **Teste 6:** Performance com 100+ atividades (< 500ms)
- [ ] **Teste 7:** Membro não selecionado (exibir aviso)
- [ ] **Teste 8:** Sem vínculos ativos (erro de permissão)

### Fase 4: Validação

- [ ] Medir performance com `console.time()`
- [ ] Verificar logs no console
- [ ] Confirmar que filtros existentes ainda funcionam
- [ ] Verificar que não quebrou outras funcionalidades

---

## 🧪 TESTES

### Cenários de Teste

#### Teste 1: Usuário é Responsável

**Setup:**
- Usuário logado: U001
- Membro selecionado: 5
- Atividade ACT-001: atribuido_uid = U001
- Atividade ACT-002: atribuido_uid = U002

**Esperado:**
- Exibir ACT-001 ✅
- NÃO exibir ACT-002 ❌

#### Teste 2: Membro é Participante (Alvo)

**Setup:**
- Usuário logado: U001
- Membro selecionado: 5
- Atividade ACT-003: atribuido_uid = U002
- Participação: PART-001 (id_atividade=ACT-003, id_membro=5, tipo=alvo)

**Esperado:**
- Exibir ACT-003 ✅

#### Teste 3: Nem Responsável Nem Participante

**Setup:**
- Usuário logado: U001
- Membro selecionado: 5
- Atividade ACT-004: atribuido_uid = U002
- Sem participações do membro 5

**Esperado:**
- NÃO exibir ACT-004 ❌

#### Teste 4: Filtros Combinados

**Setup:**
- Filtros: status=Pendente, responsavel=U001
- Atividades:
  - ACT-001: U001, Pendente ✅
  - ACT-002: U001, Concluida ❌
  - ACT-003: U002, Pendente (mas membro 5 participa) ✅

**Esperado:**
- Exibir ACT-001 (responsável + pendente) ✅
- NÃO exibir ACT-002 (responsável mas concluída) ❌
- Exibir ACT-003 (participante + pendente) ✅

#### Teste 5: Performance

**Setup:**
- 100 atividades
- 500 participações
- 50 do membro selecionado

**Métrica:**
- Tempo total < 500ms ✅

**Como Medir:**
```javascript
console.time('loadActivities');
loadActivities();
// No callback:
console.timeEnd('loadActivities'); // Deve mostrar ~200-300ms
```

---

## 🚨 RISCOS E MITIGAÇÕES

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| 1 | Performance lenta com muitas participações | 🟡 Média | 🔴 Alto | Usar query batch, não N queries. Adicionar logs de performance. Se necessário, implementar cache. |
| 2 | Conflito com filtro "Responsável" | 🔴 Alta | 🟡 Médio | Clarificar regra de negócio: filtro "Responsável" filtra por atribuido_uid apenas, não considera participações. |
| 3 | Membro não selecionado | 🟡 Média | 🟢 Baixo | Validar no frontend (exibir toast) e backend (retornar erro claro). |
| 4 | Quebrar funcionalidade existente | 🟢 Baixa | 🔴 Alto | Fazer memberId opcional no backend. Testar todos os fluxos após implementação. |
| 5 | Usuário sem vínculos ativos | 🟡 Média | 🟡 Médio | Backend já valida com `requireMemberAccess()`. Retornar erro amigável. |

---

## 📈 MÉTRICAS DE SUCESSO

### Performance
- [ ] Tempo de carregamento < 500ms
- [ ] Apenas 2 queries executadas (atividades + participações)

### Funcionalidade
- [ ] Exibe atividades do usuário responsável
- [ ] Exibe atividades do membro participante
- [ ] Respeita todos os filtros existentes
- [ ] Não quebra funcionalidades existentes

### UX
- [ ] Feedback claro se membro não selecionado
- [ ] Lista menor e mais relevante
- [ ] Performance percebida melhor

---

## 📚 REFERÊNCIAS

### Arquivos Relacionados
- `src/01-business/activities.gs` - Core da listagem
- `src/01-business/participacoes.gs` - Query de participações
- `src/04-views/activities.html` - Interface de atividades
- `src/00-core/data_dictionary.gs` - Schema de atividades e participações
- `src/00-core/session_manager.gs` - Validação de sessão e acesso

### Documentação Relacionada
- [MAPA_CODIGO.md](../MAPA_CODIGO.md) - Onde está cada função
- [CLAUDE_INSTRUCOES.md](../CLAUDE_INSTRUCOES.md) - Regras de modificação
- [data_dictionary.gs](../src/00-core/data_dictionary.gs) - Schema completo

---

## ✅ IMPLEMENTAÇÃO REALIZADA

**Data:** 25/10/2025
**Status:** ✅ Implementada - Aguardando Testes
**Tempo Real:** ~2 horas

### Arquivos Modificados

#### 1. `src/01-business/activities.gs` (~70 linhas)

**Modificações:**
- `listActivitiesApi()` aceita `memberId` opcional (linha 3)
- Valida acesso com `requireMemberAccess()`
- `_listActivitiesCore()` recebe `userId` e `memberId` (linha 75)
- Query BATCH de participações (linhas 327-347)
- Filtro: responsável OU participa (linhas 376-398)

#### 2. `src/04-views/activities.html` (~5 linhas)

**Modificações:**
- Passa `State.selectedMemberId` na chamada API (linha 207)

#### 3. `src/05-components/filters.html` (~30 linhas)

**Modificações:**
- Seção "Responsável" escondida por padrão (linha 504)
- `abrirModalFiltros()` verifica admin (linha 132)
- `aplicarFiltrosPadrao()` sem filtro responsável (linha 71)

### Sistema de Permissões Usado

**Localização:** `src/05-components/utils/permissionsHelpers.html`

```javascript
const ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004'];
function isCurrentUserAdmin() { ... }
```

### Documentação Atualizada

- ✅ CLAUDE_INSTRUCOES.md - Seção "Sistema de Permissões" (linha 315)
- ✅ MAPA_CODIGO.md - permissionsHelpers + Fluxo de Filtros (linhas 132, 581)

---

## 🧪 PLANO DE TESTES

### ✅ TESTE 1: Não-Admin COM Membro

**Passos:**
1. Login como usuário comum (não U001-U004)
2. Selecionar um membro
3. Ir para "Atividades"

**Validar:**
- [ ] Ver atividades onde usuário é responsável
- [ ] Ver atividades onde membro participa
- [ ] Filtro "Responsável" NÃO aparece no modal
- [ ] Console: `memberId: <numero>`

---

### ✅ TESTE 2: Não-Admin SEM Membro

**Passos:**
1. Login como usuário comum
2. NÃO selecionar membro
3. Ir para "Atividades"

**Validar:**
- [ ] Ver apenas atividades onde é responsável
- [ ] Console: `memberId: (não selecionado)`

---

### ✅ TESTE 3: Admin COM Filtro

**Passos:**
1. Login como admin (U001-U004)
2. Ir para "Atividades"
3. Abrir modal de filtros

**Validar:**
- [ ] Seção "Responsável" VISÍVEL
- [ ] Pode selecionar outro responsável
- [ ] Ver atividades do responsável selecionado

---

### ✅ TESTE 4: Performance

**Validar:**
- [ ] Tempo < 500ms
- [ ] Console mostra logs de participações
- [ ] Loading funciona

---

### ✅ TESTE 5: Edge Cases

**Testar:**
- [ ] Membro sem participações
- [ ] Usuário sem atividades
- [ ] Trocar de membro
- [ ] Participação deletada (deleted='x')

---

**Última Atualização:** 25/10/2025
**Autor:** Claude Code
**Status:** ✅ Implementada - Pronta para Testes
