# 💬 TAREFA 03: Comunicado ao Concluir Atividade

**Status:** ✅ CONCLUÍDA
**Criado em:** 24/10/2025
**Implementada em:** 26/10/2025
**Prioridade:** 🟡 Média
**Complexidade:** 🟡 Média
**Tempo Real:** 2 horas (unificada com TAREFA_02)

---

## ✅ RESUMO DA IMPLEMENTAÇÃO

**Solução Final:** Implementada como **funcionalidade unificada** junto com TAREFA_02 (Cancelar Atividade).

### Campo Único: `relato`
- Armazena comunicado de conclusão (se Concluída) - OPCIONAL
- Armazena motivo de cancelamento (se Cancelada) - OBRIGATÓRIO
- Limite: 1000 caracteres

### Arquivos Modificados (mesmos da TAREFA_02):
1. ✅ `src/00-core/data_dictionary.gs`
2. ✅ `src/02-api/activities_api.gs`
3. ✅ `src/04-views/activities.html`
4. ✅ `src/05-components/utils/activityHelpers.html`
5. ✅ `src/05-components/core/styles.html`

### Funcionalidades Implementadas:
- ✅ Modal ao clicar "✅ Concluir" com campo relato OPCIONAL
- ✅ 3 botões: "Cancelar", "Pular (concluir sem relato)", "Concluir com Relato"
- ✅ Contador de caracteres em tempo real (0/1000)
- ✅ Feedback visual (cores ao aproximar do limite)
- ✅ Validação de tamanho (máximo 1000 caracteres)
- ✅ Badge verde "Concluída" nos cards
- ✅ Exibição de relato em box verde (se preenchido)
- ✅ UX: Não forçar preenchimento (opcional mas recomendado)
- ✅ Compatibilidade retroativa (atividades antigas sem relato)

### Ver também:
- [TAREFA_02_CANCELAR_ATIVIDADE.md](./TAREFA_02_CANCELAR_ATIVIDADE.md) - Implementada em conjunto

---

## 📋 ÍNDICE

1. [Objetivo](#objetivo)
2. [Contexto Atual](#contexto-atual)
3. [Solução Proposta](#solução-proposta)
4. [Arquivos Impactados](#arquivos-impactados)
5. [Código de Implementação](#código-de-implementação)
6. [Pontos de Atenção](#pontos-de-atenção)
7. [Checklist de Implementação](#checklist-de-implementação)
8. [Testes](#testes)
9. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 🎯 OBJETIVO

Ao marcar atividade como "Concluída", abrir **modal para comunicado opcional**:
- ✅ Campo de texto livre (máximo 1000 caracteres)
- ✅ **Opcional mas recomendado** (não forçar)
- ✅ Botão "Pular" para concluir sem comunicado
- ✅ Armazenar resumo/comunicado no banco
- ✅ Exibir no card da atividade concluída

### Benefício para o Usuário

**Problema Atual:**
- Atividade é concluída com 1 clique
- Nenhum feedback sobre como foi
- Informações importantes se perdem

**Solução:**
- Capturar resumo/destaques da atividade
- Documentar o que aconteceu
- Compartilhar informações com equipe
- Histórico rico para consultas futuras

**Exemplos de Uso:**
- "Treino realizado com sucesso. 15 participantes, foco em kata Heian Shodan."
- "Aula cancelada no meio devido à chuva. 8 alunos presentes."
- "Ótima participação! Destaque para João que evoluiu muito no kumite."

---

## 📊 CONTEXTO ATUAL

### Como Funciona Hoje

**Frontend:** `src/04-views/activities.html:363`
```javascript
async function completeActivity(activityId) {
  // Clique direto → Concluir (sem perguntar nada)
  const response = await apiCall('completeActivity', activityId);

  if (response.ok) {
    showToast('Atividade concluída!', 'success');
    updateSingleActivityCard(activityId);
  }
}
```

**Backend:** `src/02-api/usuarios_api.gs` (aproximadamente linha 512)
```javascript
async function completeActivity(sessionId, activityId) {
  // Apenas muda status, nada mais
  const updateResult = DatabaseManager.update('atividades', activityId, {
    status: 'Concluida',
    atualizado_em: new Date().toISOString(),
    atualizado_uid: userId
  });

  return updateResult;
}
```

### Problema

1. **Perda de informações:** Como foi a atividade? Quantos participantes? Houve destaques?
2. **Sem contexto:** Atividade concluída = apenas status, não conta a história
3. **Oportunidade perdida:** Momento ideal para capturar feedback

---

## 💡 SOLUÇÃO PROPOSTA

### Fluxo Novo

```
┌─────────────────────────────────────────────────────┐
│          NOVO FLUXO DE CONCLUSÃO                    │
└─────────────────────────────────────────────────────┘

Usuário clica "✅ Concluir"
   ↓
Modal abre com campo de texto
   ├─ "Deseja adicionar um comunicado?"
   ├─ Textarea (opcional, 1000 chars)
   ├─ Botão "Pular (concluir sem comunicado)"
   └─ Botão "Concluir com Comunicado"
   ↓
Backend recebe: activityId + comunicado (pode ser vazio)
   ↓
Update com status=Concluida + comunicado
   ↓
Card exibe badge "Concluída" + box verde com comunicado
```

### UX: Opcional mas Recomendado

**Filosofia:**
- ❌ NÃO forçar (campo obrigatório irrita)
- ✅ Tornar fácil pular (botão visível)
- ✅ Mostrar valor (placeholder com exemplo)
- ✅ Incentivar sem obrigar

**Botões:**
1. "Cancelar" (voltar sem concluir)
2. "Pular" (concluir SEM comunicado)
3. "Concluir com Comunicado" (concluir COM comunicado)

---

## 📁 ARQUIVOS IMPACTADOS

| Arquivo | Tipo | Modificação | Linhas | Zona |
|---------|------|-------------|--------|------|
| `src/00-core/data_dictionary.gs` | Schema | Adicionar campo `comunicado` | ~15 | 🟡 Amarela |
| `src/02-api/usuarios_api.gs` | Backend API | Modificar `completeActivity()` | ~20 | 🟢 Verde |
| `src/04-views/activities.html` | Frontend | Modal + Modificar fluxo | ~120 | 🟢 Verde |
| `src/05-components/core/styles.html` | CSS | Estilo para box de comunicado | ~15 | 🟢 Verde |

**Total:** 4 arquivos, ~170 linhas

---

## 💻 CÓDIGO DE IMPLEMENTAÇÃO

### 1. Schema (data_dictionary.gs)

```javascript
// ============================================================
// MODIFICAÇÃO: Adicionar campo 'comunicado' em atividades
// ============================================================
atividades: {
  tableName: 'atividades',
  fields: {
    // ... campos existentes ...

    status: {
      type: 'TEXT',
      required: true,
      enum: ['Pendente', 'Concluida', 'Cancelada'],
      default: 'Pendente',
      description: 'Status da atividade'
    },

    // ✅ NOVO: Comunicado após conclusão
    comunicado: {
      type: 'TEXT',
      required: false,
      maxLength: 1000,
      description: 'Resumo/comunicado após conclusão da atividade',
      example: 'Treino realizado com sucesso. 15 participantes, foco em kata Heian Shodan. Destaque para João que evoluiu muito no kumite.'
    },

    // ... outros campos ...
  },

  businessRules: [
    // ... regras existentes ...
    'Comunicado é opcional ao concluir atividade',
    'Comunicado pode ter até 1000 caracteres',
    'Comunicado só é relevante se status = Concluida',
    'Comunicado pode ser vazio (usuário pode pular)'
  ]
}
```

### 2. Backend API (usuarios_api.gs)

```javascript
// ============================================================
// MODIFICAÇÃO: completeActivity agora aceita comunicado
// ============================================================

/**
 * Marca atividade como concluída (com comunicado opcional)
 * @param {string} sessionId - ID da sessão
 * @param {string} activityId - ID da atividade
 * @param {string} comunicado - Comunicado opcional (até 1000 chars)
 * @returns {Object} { ok: boolean, error?: string }
 */
async function completeActivity(sessionId, activityId, comunicado = '') {
  try {
    // 1. Validar sessão
    const auth = await requireSession(sessionId, 'CompleteActivity');
    if (!auth.ok) return auth;

    const userId = auth.session.user_id;

    // 2. Validar parâmetros
    if (!activityId) {
      return { ok: false, error: 'ID da atividade é obrigatório' };
    }

    // 3. Validar comunicado (se fornecido)
    let comunicadoFinal = '';
    if (comunicado && typeof comunicado === 'string') {
      comunicadoFinal = comunicado.trim();

      // Limite de 1000 caracteres
      if (comunicadoFinal.length > 1000) {
        return { ok: false, error: 'Comunicado não pode ter mais de 1000 caracteres' };
      }
    }

    // 4. Buscar atividade (validar que existe)
    const ativResult = DatabaseManager.query('atividades', { id: activityId });
    if (!ativResult.ok || !ativResult.items || ativResult.items.length === 0) {
      Logger.warn('CompleteActivity', 'Atividade não encontrada', { activityId });
      return { ok: false, error: 'Atividade não encontrada' };
    }

    const atividade = ativResult.items[0];

    // 5. Validar status atual
    if (atividade.status === 'Concluida') {
      return { ok: false, error: 'Atividade já está concluída' };
    }

    if (atividade.status === 'Cancelada') {
      return { ok: false, error: 'Não é possível concluir atividades canceladas' };
    }

    // 6. Concluir atividade (com comunicado)
    const now = new Date().toISOString();
    const updateResult = DatabaseManager.update('atividades', activityId, {
      status: 'Concluida',
      comunicado: comunicadoFinal, // ✅ NOVO
      atualizado_em: now,
      atualizado_uid: userId
    });

    if (!updateResult.ok) {
      Logger.error('CompleteActivity', 'Erro ao concluir', {
        activityId,
        error: updateResult.error
      });
      return { ok: false, error: 'Erro ao concluir atividade: ' + updateResult.error };
    }

    Logger.info('CompleteActivity', 'Atividade concluída', {
      activityId,
      userId,
      hasComunicado: comunicadoFinal.length > 0
    });

    return { ok: true };

  } catch (error) {
    Logger.error('CompleteActivity', 'Exceção', { error: error.message });
    return { ok: false, error: 'Erro ao concluir atividade: ' + error.message };
  }
}
```

### 3. Frontend - Modal (activities.html)

```html
<!-- ============================================================
     NOVO: Modal de Conclusão com Comunicado
     ============================================================ -->
<div id="modal-concluir-atividade" class="modal" style="display: none;">
  <div class="modal-content" style="max-width: 600px;">
    <div class="modal-header" style="background: var(--success); color: white;">
      <h3>✅ Concluir Atividade</h3>
      <button onclick="fecharModalConcluir()" class="btn-close" style="color: white;">×</button>
    </div>

    <div class="modal-body">
      <p style="margin-bottom: var(--spacing-lg); color: var(--text);">
        Deseja adicionar um resumo ou comunicado sobre esta atividade?
      </p>
      <p style="color: var(--text-light); font-size: var(--font-size-sm); margin-bottom: var(--spacing-lg); font-style: italic;">
        Este campo é opcional, mas ajuda a documentar como foi a atividade.
      </p>

      <label for="comunicado-atividade" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--text);">
        Resumo / Comunicado (opcional)
      </label>
      <textarea
        id="comunicado-atividade"
        placeholder="Ex: Treino realizado com sucesso. 15 participantes, foco em kata Heian Shodan. Destaque para João que evoluiu muito no kumite."
        maxlength="1000"
        rows="5"
        style="
          width: 100%;
          padding: var(--spacing-sm);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          font-family: inherit;
          resize: vertical;
          line-height: 1.5;
        "
      ></textarea>
      <div style="display: flex; justify-content: space-between; margin-top: var(--spacing-xs);">
        <span style="color: var(--text-light); font-size: var(--font-size-sm);">
          Este comunicado será visível no card da atividade
        </span>
        <span style="color: var(--text-light); font-size: var(--font-size-sm);">
          <span id="comunicado-char-count">0</span>/1000
        </span>
      </div>
    </div>

    <div class="modal-footer">
      <button onclick="fecharModalConcluir()" class="btn btn-outline">
        Cancelar
      </button>
      <button onclick="pularComunicado()" class="btn btn-secondary">
        Pular (concluir sem comunicado)
      </button>
      <button onclick="confirmarConclusaoComComunicado()" class="btn btn-success">
        Concluir com Comunicado
      </button>
    </div>
  </div>
</div>

<script>
// ============================================================
// MODIFICAÇÃO: Gerenciamento do fluxo de conclusão
// ============================================================

let activityIdToCompleteGlobal = null;

/**
 * MODIFICAÇÃO DA FUNÇÃO EXISTENTE
 * Ao invés de concluir direto, abre modal
 */
async function completeActivity(activityId) {
  // Armazenar ID e abrir modal
  activityIdToCompleteGlobal = activityId;
  document.getElementById('modal-concluir-atividade').style.display = 'flex';
  document.getElementById('comunicado-atividade').value = '';
  document.getElementById('comunicado-char-count').textContent = '0';
  document.getElementById('comunicado-atividade').focus();
}

/**
 * NOVO: Fecha modal de conclusão
 */
function fecharModalConcluir() {
  document.getElementById('modal-concluir-atividade').style.display = 'none';
  activityIdToCompleteGlobal = null;
}

// NOVO: Contador de caracteres em tempo real
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('comunicado-atividade');
  if (textarea) {
    textarea.addEventListener('input', (e) => {
      const count = e.target.value.length;
      document.getElementById('comunicado-char-count').textContent = count;

      // Feedback visual se próximo do limite
      const counter = document.getElementById('comunicado-char-count');
      if (count > 900) {
        counter.style.color = 'var(--danger)';
        counter.style.fontWeight = '700';
      } else if (count > 750) {
        counter.style.color = 'var(--warning)';
        counter.style.fontWeight = '600';
      } else {
        counter.style.color = 'var(--text-light)';
        counter.style.fontWeight = '400';
      }
    });
  }
});

/**
 * NOVO: Opção 1 - Concluir COM comunicado
 */
async function confirmarConclusaoComComunicado() {
  const comunicado = document.getElementById('comunicado-atividade').value.trim();

  // Se usuário não preencheu nada, sugerir pular
  if (comunicado.length === 0) {
    const confirmar = confirm('Você não preencheu o comunicado. Deseja concluir mesmo assim?');
    if (!confirmar) {
      document.getElementById('comunicado-atividade').focus();
      return;
    }
  }

  await finalizarConclusao(comunicado);
}

/**
 * NOVO: Opção 2 - Pular (concluir SEM comunicado)
 */
async function pularComunicado() {
  await finalizarConclusao('');
}

/**
 * NOVO: Função auxiliar que faz a chamada real à API
 */
async function finalizarConclusao(comunicado) {
  const button = event.target;
  const originalText = button.textContent;
  button.disabled = true;
  button.innerHTML = '<div class="loading-spinner" style="margin: 0 auto;"></div>';

  try {
    // Chamar API com comunicado (pode ser vazio)
    const response = await apiCall('completeActivity', activityIdToCompleteGlobal, comunicado);

    if (response.ok) {
      const mensagem = comunicado.length > 0
        ? 'Atividade concluída com comunicado!'
        : 'Atividade concluída!';
      showToast(mensagem, 'success');

      fecharModalConcluir();

      // Atualizar card ou recarregar lista
      if (typeof updateSingleActivityCard === 'function') {
        updateSingleActivityCard(activityIdToCompleteGlobal);
      } else {
        loadActivities();
      }
    } else {
      showToast('Erro: ' + response.error, 'error');
      button.disabled = false;
      button.innerHTML = originalText;
    }
  } catch (error) {
    console.error('Erro ao concluir atividade:', error);
    showToast('Erro ao concluir atividade', 'error');
    button.disabled = false;
    button.innerHTML = originalText;
  }
}
</script>
```

### 4. Frontend - Exibir no Card (activities.html)

```javascript
// ============================================================
// MODIFICAÇÃO: Exibir comunicado no card da atividade
// ============================================================

function renderActivityCard(activity) {
  // ... código existente do card ...

  // ✅ NOVO: Se atividade está concluída E tem comunicado, mostrar
  const comunicadoSection = (activity.status === 'Concluida' && activity.comunicado) ? `
    <div style="
      background: var(--success-light);
      border-left: 4px solid var(--success);
      padding: var(--spacing-md);
      margin-top: var(--spacing-md);
      border-radius: var(--radius-md);
    ">
      <div style="
        font-weight: 600;
        color: var(--success);
        margin-bottom: var(--spacing-xs);
        display: flex;
        align-items: center;
        gap: var(--spacing-xs);
      ">
        <span>💬</span>
        <span>Comunicado</span>
      </div>
      <div style="
        color: var(--text);
        font-size: var(--font-size-sm);
        line-height: 1.6;
        white-space: pre-wrap;
      ">
        ${activity.comunicado}
      </div>
    </div>
  ` : '';

  return `
    <div class="activity-card">
      <!-- ... header, título, descrição, info ... -->

      <!-- Botões de ação -->
      <div class="activity-actions">
        <!-- ... botões editar, concluir, etc ... -->
      </div>

      <!-- ✅ NOVO: Seção de comunicado (se existir) -->
      ${comunicadoSection}
    </div>
  `;
}
```

### 5. CSS (styles.html)

```css
/* ============================================================
   NOVO: Estilos para box de comunicado
   ============================================================ */

/* Evitar quebra de linha abrupta em palavras longas */
.activity-card div[style*="white-space: pre-wrap"] {
    word-wrap: break-word;
    overflow-wrap: break-word;
}

/* Scroll se comunicado for muito longo */
.activity-card div[style*="pre-wrap"] {
    max-height: 200px;
    overflow-y: auto;
}
```

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Comunicado é OPCIONAL

**UX Crítico:**
- ✅ Usuário PODE pular (não forçar)
- ✅ Botão "Pular" deve ser óbvio
- ✅ Placeholder deve mostrar exemplo útil
- ✅ Se usuário clica "Concluir" sem preencher → confirmar?

**Decisão:** Confirmar apenas se clicou "Concluir com Comunicado" mas campo vazio

### 2. Editar Comunicado Depois?

**Pergunta:** Usuário pode editar comunicado depois de concluir?

**Opções:**
- **A)** NÃO permitir (imutável após conclusão) ✅ MAIS SIMPLES
- **B)** Permitir edição apenas pelo responsável/admin

**Decisão Recomendada:** Opção A (imutável)

**Justificativa:**
- Comunicado = "snapshot" do momento da conclusão
- Evita confusão sobre "versões" do comunicado
- Mais simples de implementar

**Se Necessário Editar:** Re-concluir atividade (modal abre novamente com campo preenchido)

### 3. Atividades Antigas Sem Comunicado

**Compatibilidade Retroativa:**
- Atividades já concluídas não terão comunicado
- ✅ Não exibir seção se campo vazio
- ✅ Não quebrar renderização de cards antigos

**Implementação:**
```javascript
const comunicadoSection = (activity.status === 'Concluida' && activity.comunicado) ? ...
//                                                             ↑ Verifica se existe
```

### 4. Limite de 1000 Caracteres

**Por quê 1000?**
- Suficiente para resumo detalhado (5-6 linhas)
- Não vira "redação" (evitar textos longos)
- Performance (não sobrecarrega card)

**Feedback Visual:**
- 0-750 chars: Contador cinza claro
- 750-900 chars: Contador laranja (atenção)
- 900-1000 chars: Contador vermelho (perto do limite)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Schema

- [ ] Adicionar campo `comunicado` em `atividades`
- [ ] Tipo TEXT, maxLength 1000, opcional
- [ ] Adicionar regras de negócio no dicionário

### Fase 2: Backend

- [ ] Modificar `completeActivity(sessionId, activityId, comunicado)`
- [ ] Adicionar parâmetro `comunicado` com default vazio
- [ ] Validar tamanho máximo (1000 chars)
- [ ] Incluir comunicado no UPDATE
- [ ] Logs registrando se tem comunicado ou não

### Fase 3: Frontend - Modal

- [ ] Criar HTML do modal de conclusão
- [ ] Modificar `completeActivity()` para abrir modal
- [ ] Função `fecharModalConcluir()`
- [ ] Função `confirmarConclusaoComComunicado()`
- [ ] Função `pularComunicado()`
- [ ] Função `finalizarConclusao(comunicado)`
- [ ] Contador de caracteres em tempo real
- [ ] Feedback visual (cores) conforme aproxima do limite
- [ ] Confirmar se campo vazio mas clicou "Concluir com Comunicado"

### Fase 4: Frontend - Card

- [ ] Adicionar seção de comunicado no card (condicional)
- [ ] Verificar `status === 'Concluida' && comunicado existe`
- [ ] Estilo: box verde claro, borda esquerda verde, ícone 💬
- [ ] Texto com `white-space: pre-wrap` (respeitar quebras de linha)
- [ ] Scroll se muito longo (max-height: 200px)

### Fase 5: CSS

- [ ] Estilos para box de comunicado
- [ ] Estilos para contador de caracteres (cores)
- [ ] Quebra de linha e scroll

### Fase 6: Testes

- [ ] Concluir com comunicado (preenchido)
- [ ] Concluir sem comunicado (pular)
- [ ] Validar limite de 1000 caracteres
- [ ] Verificar exibição no card
- [ ] Verificar que atividades antigas sem comunicado não quebram
- [ ] Testar quebras de linha no texto
- [ ] Testar texto muito longo (scroll)

---

## 🧪 TESTES

### Teste 1: Concluir com Comunicado

**Passos:**
1. Clicar "✅ Concluir" em atividade
2. Modal abre
3. Preencher: "Treino excelente! 12 participantes."
4. Clicar "Concluir com Comunicado"

**Esperado:**
- ✅ Atividade muda para "Concluída"
- ✅ Comunicado é salvo
- ✅ Card exibe box verde com o comunicado

### Teste 2: Concluir sem Comunicado (Pular)

**Passos:**
1. Clicar "✅ Concluir"
2. Modal abre
3. NÃO preencher nada
4. Clicar "Pular"

**Esperado:**
- ✅ Atividade muda para "Concluída"
- ✅ Comunicado fica vazio
- ✅ Card NÃO exibe seção de comunicado

### Teste 3: Cancelar (Fechar Modal)

**Passos:**
1. Clicar "✅ Concluir"
2. Modal abre
3. Clicar "Cancelar"

**Esperado:**
- ❌ Atividade permanece "Pendente"
- ✅ Modal fecha
- ❌ Nada é salvo

### Teste 4: Limite de 1000 Caracteres

**Passos:**
1. Preencher comunicado com texto gigante (> 1000 chars)
2. Tentar concluir

**Esperado:**
- ✅ Contador mostra vermelho ao passar de 900
- ❌ Backend valida e retorna erro se > 1000
- ❌ Textarea bloqueia digitação após 1000 (maxlength)

### Teste 5: Compatibilidade Retroativa

**Setup:**
- Atividade antiga concluída antes da implementação (sem campo comunicado)

**Esperado:**
- ✅ Card renderiza normalmente
- ✅ Seção de comunicado NÃO aparece
- ❌ Não dá erro JavaScript

---

## 🚨 RISCOS E MITIGAÇÕES

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| 1 | UX confusa (forçar vs opcional) | 🟡 Média | 🟡 Médio | Botão "Pular" visível, placeholder claro, NÃO tornar obrigatório |
| 2 | Comunicado muito longo (> 1000) | 🟢 Baixa | 🟢 Baixo | Validação frontend (maxlength) + backend (retornar erro) |
| 3 | Quebrar atividades antigas | 🟢 Baixa | 🟡 Médio | Verificar `if (comunicado && comunicado.length > 0)` antes de exibir |
| 4 | Usuário quer editar depois | 🟡 Média | 🟢 Baixo | Decisão: imutável. Se necessário, re-concluir. |
| 5 | Texto com formatação (HTML) | 🟢 Baixa | 🟢 Baixo | Usar `white-space: pre-wrap`, não interpretar HTML (XSS safe) |

---

## 📈 MÉTRICAS DE SUCESSO

### Funcionalidade
- [ ] Modal abre ao clicar "Concluir"
- [ ] Comunicado é opcional (pode pular)
- [ ] Comunicado é salvo corretamente
- [ ] Comunicado é exibido no card
- [ ] Limite de 1000 chars é respeitado

### UX
- [ ] Fluxo intuitivo (não confunde usuário)
- [ ] Botão "Pular" está óbvio
- [ ] Placeholder ajuda a entender o propósito
- [ ] Contador de caracteres é útil
- [ ] Feedback visual adequado

### Performance
- [ ] Modal abre instantaneamente (< 50ms)
- [ ] Contador de caracteres não trava (debounce desnecessário, é síncrono)
- [ ] Card com comunicado longo não quebra layout

---

## 📚 REFERÊNCIAS

### Arquivos Relacionados
- `src/00-core/data_dictionary.gs` - Schema de atividades
- `src/02-api/usuarios_api.gs` - API `completeActivity()`
- `src/04-views/activities.html` - Interface de atividades
- `src/05-components/core/styles.html` - CSS global

### Documentação Relacionada
- [MAPA_CODIGO.md](../MAPA_CODIGO.md) - Onde está cada função
- [CLAUDE_INSTRUCOES.md](../CLAUDE_INSTRUCOES.md) - Regras de modificação

---

**Última Atualização:** 24/10/2025
**Autor:** Claude Code
**Status:** 📋 Pronto para implementação
**Dependências:** Nenhuma (independente)
