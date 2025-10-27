# ⚡ APRENDIZADOS CRÍTICOS DO PROJETO

**Versão:** 2.2-modular | **Atualizado:** 26/10/2025

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

Lições aprendidas durante o desenvolvimento que TODOS devem conhecer. Bugs sistêmicos, problemas de arquitetura e soluções implementadas.

**📖 Leia quando:** Trabalhar em área relacionada ao aprendizado (ex: leia "Status Case-Sensitivity" quando trabalhar com atividades)

**🔙 Voltar para:** [CLAUDE_INSTRUCOES.md](../CLAUDE_INSTRUCOES.md)

---

## 📑 ÍNDICE

1. [apiCall() Injeta sessionId Automaticamente](#1-apicall-injeta-sessionid-automaticamente-️)
2. [Sistema de Permissões](#2-sistema-de-permissões-)
3. [Status Case-Sensitivity](#3-status-case-sensitivity-️)

---

## 1. apiCall() Injeta sessionId Automaticamente ⚠️

**Descoberto em:** 23/10/2025
**Contexto:** Sistema de Práticas Diárias
**Impacto:** CRÍTICO - Causa desalinhamento de parâmetros no backend

### ❌ NUNCA FAÇA:
```javascript
// ❌ ERRADO - Passa sessionId manualmente
const sessionId = localStorage.getItem('sessionId');
apiCall('minhaFuncao', sessionId, param1, param2);
```

### ✅ SEMPRE FAÇA:
```javascript
// ✅ CORRETO - apiCall() injeta sessionId automaticamente
apiCall('minhaFuncao', param1, param2);

// apiCall() internamente transforma em:
// google.script.run.minhaFuncao(sessionId, param1, param2)
```

### 🔍 Por que acontece?

**Código do apiCall()** (`src/05-components/core/api.html` linha 32-33):
```javascript
// Injetar sessionId como primeiro parâmetro
const argsWithSession = [sessionId, ...args];
```

O `apiCall()` **SEMPRE** adiciona o sessionId como primeiro parâmetro automaticamente. Se você passar manualmente, vai duplicar!

### 💥 Exemplo Real do Problema:

**Frontend faz:**
```javascript
apiCall('savePractice', sessionId, memberId, date, praticaId, quantidade)
```

**apiCall() transforma em:**
```javascript
google.script.run.savePractice(
  sessionId,   // ← Injetado automaticamente pelo apiCall() ✅
  sessionId,   // ← Passado manualmente (DUPLICADO!) ❌
  memberId,    // ← Backend recebe como 'date' ❌
  date,        // ← Backend recebe como 'praticaId' ❌
  praticaId,   // ← Backend recebe como 'quantidade' ❌
  quantidade   // ← Perdido! ❌
)
```

**Backend espera:**
```javascript
async function savePractice(sessionId, memberId, data, praticaId, quantidade)
```

**Backend recebe (ERRADO):**
- `sessionId` = "sess_..." ✅ (correto)
- `memberId` = "sess_..." ❌ (recebeu sessionId duplicado!)
- `data` = número ❌ (recebeu memberId)
- `praticaId` = string data ❌ (recebeu data)
- `quantidade` = string praticaId ❌ (recebeu praticaId)

**Resultado:** Tudo desalinhado, sistema quebra com erro de permissão ou validação.

### 📋 Regra de Ouro:

```
┌──────────────────────────────────────────────────────┐
│  SEMPRE USE apiCall() SEM sessionId                  │
│                                                      │
│  ✅ apiCall('funcao', param1, param2)                │
│  ❌ apiCall('funcao', sessionId, param1, param2)     │
│                                                      │
│  O sistema JÁ GERENCIA sessionId automaticamente    │
└──────────────────────────────────────────────────────┘
```

### ✅ Exemplos Corretos:

```javascript
// Práticas
apiCall('getAvailablePractices', memberId)
apiCall('savePractice', memberId, date, praticaId, quantidade)
apiCall('loadPracticesByDateRange', memberId, startDate, endDate)

// Atividades
apiCall('loadActivities', filters)
apiCall('saveActivity', activityData)

// Membros
apiCall('getMemberDetails', memberId)
apiCall('updateMember', memberId, updates)
```

**Nota:** O `sessionId` é pego automaticamente de `localStorage.getItem('sessionId')` pelo `apiCall()`.

---

## 2. Sistema de Permissões 🔐

**Implementado em:** 25/10/2025
**Contexto:** Filtro de Atividades por Participação
**Localização:** `src/05-components/utils/permissionsHelpers.html`

### 📋 Definição de Administradores

**Arquivo:** `src/05-components/utils/permissionsHelpers.html` (linha 10)

```javascript
const ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004'];
```

### ✅ Funções Disponíveis Globalmente:

```javascript
// Verificar se usuário atual é admin
if (isCurrentUserAdmin()) {
  // Mostrar funcionalidades de admin
}

// Acessar lista de UIDs admin
const admins = window.ADMIN_UIDS;
```

### 🎯 Permissões de Admin:

1. **Ver filtro "Responsável"** na tela de atividades
   - Não-admins: filtro escondido automaticamente
   - Admins: podem filtrar por responsáveis específicos

2. **Ver todas as atividades** (sem filtro de participação)
   - Não-admins: veem apenas atividades onde são responsáveis ou membro participa
   - Admins: podem usar filtro "Responsável" para ver atividades de qualquer usuário

3. **Cancelar atividades** (futuro - TAREFA 02)
4. **Gerenciar vínculos** (futuro)
5. **Gerenciar práticas** (futuro)

### 🔍 Como Funciona o Filtro de Atividades:

**Para NÃO-ADMINS:**
- Backend recebe `userId` (da sessão) e `memberId` (do State)
- Se `memberId` informado: mostra atividades onde usuário é responsável OU membro participa
- Se `memberId` NÃO informado: mostra apenas atividades onde usuário é responsável

**Para ADMINS:**
- Mesmo comportamento acima
- **PLUS:** Podem usar filtro "Responsável" para ver atividades de outros usuários
- Filtro "Responsável" é aplicado APÓS filtro de usuário/membro

### ⚠️ IMPORTANTE:

1. **NÃO hardcode permissões** em múltiplos lugares
   - Use sempre `isCurrentUserAdmin()` da `permissionsHelpers.html`
   - Lista de UIDs está em UM único lugar

2. **Adicionar novo admin:**
   ```
   1. Abrir: src/05-components/utils/permissionsHelpers.html
   2. Adicionar UID ao array ADMIN_UIDS (linha 10)
   3. Fazer deploy
   ```

3. **Backend NÃO valida permissões de admin ainda**
   - Validação é apenas no frontend
   - Futuro: adicionar validação backend em `session_manager.gs`

### 📁 Arquivos Relacionados:

- `src/05-components/utils/permissionsHelpers.html` - Definição de admin e funções
- `src/05-components/filters.html` - Esconde filtro "Responsável" para não-admins
- `src/01-business/activities.gs` - Aplica filtro por usuário/membro
- `src/04-views/activities.html` - Passa memberId para API

---

## 3. Status Case-Sensitivity ⚠️

**Descoberto em:** 26/10/2025
**Contexto:** Implementação de Cancelamento e Conclusão de Atividades
**Impacto:** CRÍTICO - Causa falhas silenciosas em validações e lógica de botões

### 🐛 O Problema:

O Google Sheets retorna valores de status em **lowercase** ('concluida', 'pendente', 'cancelada'), mas comparações no código estavam usando **capitalized** ('Concluida', 'Pendente', 'Cancelada'), causando falhas nas validações.

### ❌ Exemplo Real do Bug:

**Frontend (activities.html - linha 132):**
```javascript
// ❌ ERRADO - Comparação case-sensitive
const isConcluida = activity.status === 'Concluida';
// Database retorna 'concluida' (lowercase)
// Comparação SEMPRE retorna false ❌

// Resultado: Botões aparecem em atividades concluídas
console.log({
  status: 'concluida',           // Do banco
  isConcluida: false,            // Comparação falha
  showParticipantes: true,       // ❌ Deveria ser false
  showConcluir: true             // ❌ Deveria ser false
});
```

**Backend (activities_api.gs - linha 485):**
```javascript
// ❌ ERRADO - Não pode cancelar atividade concluída
if (activity.status === 'Concluida' || activity.status === 'Cancelada') {
  throw new Error('Não é possível cancelar...');
}
// Validação NUNCA funciona pois status vem 'concluida' do banco ❌
```

### ✅ SOLUÇÃO OBRIGATÓRIA:

**SEMPRE use `.toLowerCase()` em comparações de status:**

```javascript
// ✅ CORRETO - Frontend
const statusLower = (activity.status || '').toLowerCase();
const isConcluida = statusLower === 'concluida';
const isCancelada = statusLower === 'cancelada';
const isPendente = statusLower === 'pendente';

// ✅ CORRETO - Backend
const statusLower = (activity.status || '').toLowerCase();
if (statusLower === 'concluida' || statusLower === 'cancelada') {
  throw new Error('Não é possível cancelar atividade já finalizada');
}
```

### 📋 Regra de Ouro:

```
┌────────────────────────────────────────────────────────┐
│  SEMPRE NORMALIZE STATUS COM .toLowerCase()           │
│                                                        │
│  ✅ const statusLower = (status || '').toLowerCase()  │
│  ✅ if (statusLower === 'concluida') { ... }          │
│                                                        │
│  ❌ if (status === 'Concluida') { ... }               │
│  ❌ const isConcluida = status === 'Concluida';       │
│                                                        │
│  Database SEMPRE retorna lowercase!                   │
└────────────────────────────────────────────────────────┘
```

### 🔍 Por que acontece?

**Google Sheets armazena e retorna valores com capitalização inconsistente:**
- Data Dictionary define: `enum: ['Pendente', 'Concluida', 'Cancelada']`
- Mas Google Sheets retorna: `'pendente'`, `'concluida'`, `'cancelada'`
- Não há transformação automática entre banco e código

### 💥 Impactos Reais do Bug:

1. **Botões aparecendo incorretamente:**
   - Atividades concluídas mostravam botões "Participantes" e "Concluir"
   - Atividades canceladas mostravam botões de ação

2. **Validações não funcionando:**
   - Backend permitia cancelar atividades já concluídas
   - Backend permitia concluir atividades já canceladas

3. **Badge não estilizado:**
   - Status 'cancelada' aparecia como texto normal sem estilo
   - Somente lowercase funcionava: `.badge-cancelada`

### 📁 Arquivos Afetados e Corrigidos:

**Frontend:**
- `src/05-components/utils/activityHelpers.html` (linha 132-145)
  - Lógica de visibilidade de botões
  - Normalização de status antes de comparações

**Backend:**
- `src/02-api/activities_api.gs` (linha 485, 549)
  - Validações de cancelamento
  - Validações de conclusão

**Helpers:**
- `src/05-components/utils/dateHelpers.html` (linha 43, 51, 59)
  - getSmartStatus() - comparações de status

**CSS:**
- `src/05-components/core/styles.html` (linha 2076)
  - Badge classes seguem lowercase: `.badge-cancelada`

### ⚠️ IMPORTANTE:

1. **Não confie na capitalização do banco**
   - SEMPRE normalize com `.toLowerCase()`
   - Mesmo que Data Dictionary defina capitalized

2. **Padrão para CSS:**
   - Classes de badge: lowercase (`.badge-pendente`, `.badge-cancelada`)
   - Mantém consistência com valores do banco

3. **Validação defensiva:**
   ```javascript
   // ✅ Protege contra null/undefined
   const statusLower = (activity.status || '').toLowerCase();
   ```

4. **Ao adicionar novos status:**
   - Defina no Data Dictionary com capitalização
   - Use lowercase em TODAS as comparações no código
   - Classes CSS em lowercase

### 🎯 Checklist de Status:

Sempre que trabalhar com status de atividades:
```
[ ] Normalizou com .toLowerCase()?
[ ] Usou lowercase nas comparações?
[ ] Classes CSS em lowercase?
[ ] Validação protege contra null/undefined?
[ ] Testou com valores do banco real?
```

---

**📚 Voltar para:** [CLAUDE_INSTRUCOES.md](../CLAUDE_INSTRUCOES.md)
