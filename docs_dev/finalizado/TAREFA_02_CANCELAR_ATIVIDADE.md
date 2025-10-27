# 🚫 TAREFA 02: Botão Cancelar Atividade com Motivo

**Status:** ✅ CONCLUÍDA
**Criado em:** 24/10/2025
**Desbloqueada em:** 25/10/2025
**Implementada em:** 26/10/2025
**Prioridade:** 🟡 Média
**Complexidade:** 🟢 Baixa
**Tempo Real:** 2 horas (unificada com TAREFA_03)

---

## ✅ RESUMO DA IMPLEMENTAÇÃO

**Solução Final:** Implementada como **funcionalidade unificada** junto com TAREFA_03 (Comunicado ao Concluir).

### Campo Único: `relato`
- Armazena motivo de cancelamento (se Cancelada)
- Armazena comunicado de conclusão (se Concluída)
- Reutiliza campos `atualizado_em` e `atualizado_uid`

### Arquivos Modificados (5 arquivos, ~605 linhas):
1. ✅ `src/00-core/data_dictionary.gs` - Enum status + campo relato
2. ✅ `src/02-api/activities_api.gs` - `cancelActivityApi()` + `completeActivity(relato)`
3. ✅ `src/04-views/activities.html` - Modais + funções JS
4. ✅ `src/05-components/utils/activityHelpers.html` - Matriz de botões + exibição relato
5. ✅ `src/05-components/core/styles.html` - CSS para cancelada + badges

### Funcionalidades Implementadas:
- ✅ Botão "🚫 Cancelar" com permissão (Admin/Responsável)
- ✅ Modal com campo relato OBRIGATÓRIO (min 10 chars, max 1000)
- ✅ Validação de status (não cancela Concluída/Cancelada)
- ✅ Badge vermelho "Cancelada" nos cards
- ✅ Exibição de relato em box vermelho
- ✅ Matriz de botões completa (ATRASADA/HOJE/PENDENTE/CONCLUÍDA/CANCELADA)
- ✅ Comparações case-insensitive de status
- ✅ Integração com update seletivo de cards

### Ver também:
- [TAREFA_03_COMUNICADO_CONCLUSAO.md](./TAREFA_03_COMUNICADO_CONCLUSAO.md) - Implementada em conjunto

---

## 📋 ÍNDICE

1. [Objetivo](#objetivo)
2. [Bloqueador Crítico](#bloqueador-crítico)
3. [Opções de Arquitetura](#opções-de-arquitetura)
4. [Solução Proposta](#solução-proposta)
5. [Arquivos Impactados](#arquivos-impactados)
6. [Código de Implementação](#código-de-implementação)
7. [Pontos de Atenção](#pontos-de-atenção)
8. [Checklist de Implementação](#checklist-de-implementação)
9. [Testes](#testes)
10. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 🎯 OBJETIVO

Adicionar funcionalidade de **cancelamento de atividades** com:
- ✅ Botão "Cancelar" nos cards de atividades
- ✅ **Permissão restrita:** Apenas admin OU responsável pela atividade
- ✅ Modal solicitando **motivo obrigatório** (mínimo 10 caracteres)
- ✅ Novo status "Cancelada" no schema
- ✅ Armazenamento de: motivo, data/hora, quem cancelou
- ✅ Feedback visual diferenciado para atividades canceladas

### Benefício para o Usuário

Atualmente, se uma atividade não pode ser realizada, o usuário tem duas opções ruins:
1. Deixar como "Pendente" (poluição da lista)
2. Marcar como "Concluída" (dados incorretos)

Com cancelamento:
- ✅ Histórico claro do que aconteceu
- ✅ Motivo documentado (auditoria)
- ✅ Lista mais limpa (filtros incluem canceladas)

---

## 🚨 BLOQUEADOR CRÍTICO

### Problema: Sistema Sem Permissões

**Descoberta:** O sistema **NÃO possui campo** para identificar o papel/role do usuário!

**Tabela `usuarios` atual:**
```javascript
// data_dictionary.gs:86
usuarios: {
  fields: {
    uid: { type: 'TEXT' },
    login: { type: 'TEXT' },
    pin: { type: 'TEXT' },
    nome: { type: 'TEXT' },
    status: { enum: ['Ativo', 'Inativo'] },
    // ❌ NÃO EXISTE: papel, role, permissoes
  }
}
```

**Referências no código:**
```javascript
// data_dictionary.gs:49
// * 1. USUARIOS - Usuários do sistema (Admin, Secretaria, Líder, Usuário)
//                                       ↑ Mencionado mas não implementado!

// menu.gs:347
permissoes: {
  example: 'Admin,Secretaria,Líder,Usuário'
  //        ↑ Sistema de permissões existe, mas não tem campo na tabela usuarios!
}
```

**Impacto:**
- ❌ Não há como identificar se usuário é admin
- ❌ Não há como restringir funcionalidade cancelar
- ❌ **BLOQUEIA implementação completa da Tarefa 2**

---

## 🔧 OPÇÕES DE ARQUITETURA

### Opção 1: Adicionar Campo `papel` na Tabela Usuarios ⭐ RECOMENDADO

**Modificação:**
```javascript
// data_dictionary.gs - tabela usuarios
papel: {
  type: 'TEXT',
  required: true,
  enum: ['Admin', 'Secretaria', 'Líder', 'Usuário'],
  default: 'Usuário',
  description: 'Papel/role do usuário no sistema'
}
```

**Vantagens:**
- ✅ Simples e direto
- ✅ Escalável (fácil adicionar novos papéis)
- ✅ Padrão de mercado
- ✅ Suporta múltiplas funcionalidades futuras
- ✅ Fácil de consultar e validar

**Desvantagens:**
- ⚠️ Requer migração de dados (adicionar coluna na planilha)
- ⚠️ Usuários existentes precisam ter papel definido

**Complexidade:** 🟡 Média (1 hora adicional)

---

### Opção 2: Lista Hardcoded de UIDs Admin

**Implementação:**
```javascript
// src/00-core/session_manager.gs ou utils.gs
const ADMIN_UIDS = ['U001', 'U002']; // UIDs dos admins

function isAdmin(userId) {
  return ADMIN_UIDS.includes(userId);
}
```

**Vantagens:**
- ✅ Implementação imediata (5 minutos)
- ✅ Sem mudanças no schema
- ✅ Sem migração de dados

**Desvantagens:**
- ❌ Não escalável
- ❌ Hardcoded (ruim para manutenção)
- ❌ Não suporta outros papéis (Secretaria, Líder)
- ❌ Mudança de admin requer alterar código

**Complexidade:** 🟢 Muito Baixa (5 minutos)

---

### Opção 3: Tabela Separada de Permissões

**Estrutura:**
```javascript
// Nova tabela: permissoes_usuarios
{
  id: 'PERM-0001',
  usuario_uid: 'U001',
  permissao: 'admin', // ou 'cancelar_atividades', 'gerenciar_membros', etc
  concedida_em: '2025-01-20 10:00:00',
  concedida_por_uid: 'U001'
}
```

**Vantagens:**
- ✅ Muito flexível (permissões granulares)
- ✅ Suporta múltiplas permissões por usuário
- ✅ Histórico de concessões

**Desvantagens:**
- ❌ Over-engineering para necessidade atual
- ❌ Complexidade alta
- ❌ Queries adicionais (JOIN necessário)
- ❌ 2-3 horas de trabalho adicional

**Complexidade:** 🔴 Alta (3+ horas adicionais)

---

## 💡 DECISÃO RECOMENDADA

### Opção 1: Campo `papel` ⭐

**Justificativa:**
1. **Balance entre simplicidade e escalabilidade**
2. **Padrão de mercado** (usado por 90% dos sistemas)
3. **Suporta funcionalidades futuras** (não só cancelar)
4. **Migração simples** (adicionar coluna + UPDATE default)

**Ação Necessária:**
1. ✅ Aprovar adição do campo `papel` (DECISÃO DO USUÁRIO)
2. ✅ Adicionar coluna na planilha "Usuarios"
3. ✅ Definir papel de cada usuário existente
4. ✅ Atualizar `data_dictionary.gs`
5. ✅ Implementar helper `isAdmin(userId)`

**Tempo Adicional:** 1 hora

---

## 📁 ARQUIVOS IMPACTADOS

| Arquivo | Tipo | Modificação | Linhas | Zona |
|---------|------|-------------|--------|------|
| `src/00-core/data_dictionary.gs` | Schema | Adicionar 4 campos (papel + cancelamento) | ~60 | 🟡 Amarela |
| `src/02-api/usuarios_api.gs` | Backend API | Nova função `cancelActivity()` | ~60 | 🟢 Verde |
| `src/00-core/session_manager.gs` | Segurança | Helper `isAdmin()` | ~20 | 🟢 Verde |
| `src/04-views/activities.html` | Frontend | Modal + Botão cancelar | ~150 | 🟢 Verde |
| `src/05-components/core/styles.html` | CSS | Estilos para cancelada | ~20 | 🟢 Verde |

**Total:** 5 arquivos, ~310 linhas

---

## 💻 CÓDIGO DE IMPLEMENTAÇÃO

### 1. Schema (data_dictionary.gs)

```javascript
// ============================================================
// MODIFICAÇÃO 1: Adicionar campo 'papel' na tabela usuarios
// ============================================================
usuarios: {
  tableName: 'usuarios',
  fields: {
    // ... campos existentes ...

    // ✅ NOVO: Papel/role do usuário
    papel: {
      type: 'TEXT',
      required: true,
      enum: ['Admin', 'Secretaria', 'Líder', 'Usuário'],
      default: 'Usuário',
      description: 'Papel/role do usuário no sistema',
      example: 'Admin'
    },

    status: { /* ... */ },
    criado_em: { /* ... */ },
    // ...
  }
}

// ============================================================
// MODIFICAÇÃO 2: Adicionar campos de cancelamento em atividades
// ============================================================
atividades: {
  tableName: 'atividades',
  fields: {
    // ... campos existentes ...

    status: {
      type: 'TEXT',
      required: true,
      enum: ['Pendente', 'Concluida', 'Cancelada'], // ✅ ADICIONAR 'Cancelada'
      default: 'Pendente',
      description: 'Status da atividade'
    },

    // ✅ NOVO: Motivo do cancelamento
    motivo_cancelamento: {
      type: 'TEXT',
      required: false,
      maxLength: 500,
      description: 'Motivo do cancelamento da atividade (obrigatório se status = Cancelada)',
      example: 'Aula suspensa devido às chuvas'
    },

    // ✅ NOVO: Data/hora do cancelamento
    cancelada_em: {
      type: 'DATETIME',
      required: false,
      format: 'yyyy-MM-dd HH:mm:ss',
      timezone: 'America/Sao_Paulo',
      description: 'Data e hora que a atividade foi cancelada'
    },

    // ✅ NOVO: Quem cancelou
    cancelada_por_uid: {
      type: 'TEXT',
      required: false,
      foreignKey: 'usuarios.uid',
      description: 'UID do usuário que cancelou a atividade',
      example: 'U001'
    },

    // ... campos existentes ...
  },

  businessRules: [
    // ... regras existentes ...
    'Apenas admin ou responsável pela atividade pode cancelá-la',
    'Motivo de cancelamento é obrigatório (mínimo 10 caracteres)',
    'Atividades canceladas não podem ser marcadas como concluídas',
    'Atividades concluídas não podem ser canceladas'
  ]
}
```

### 2. Helper de Segurança (session_manager.gs)

```javascript
// ============================================================
// NOVO: Helper para verificar se usuário é admin
// ============================================================

/**
 * Verifica se usuário tem papel de Admin
 * @param {string} userId - UID do usuário
 * @returns {Promise<boolean>} True se é admin
 */
async function isAdmin(userId) {
  try {
    if (!userId) return false;

    const result = DatabaseManager.query('usuarios', { uid: userId });

    if (!result || !result.ok || !result.items || result.items.length === 0) {
      Logger.warn('isAdmin', 'Usuário não encontrado', { userId });
      return false;
    }

    const user = result.items[0];
    const papel = (user.papel || '').toString().trim();

    return papel === 'Admin';

  } catch (error) {
    Logger.error('isAdmin', 'Erro ao verificar papel', { userId, error: error.message });
    return false;
  }
}

/**
 * Verifica se usuário pode cancelar uma atividade
 * (Admin OU Responsável pela atividade)
 * @param {string} userId - UID do usuário
 * @param {string} activityId - ID da atividade
 * @returns {Promise<Object>} { ok: boolean, canCancel: boolean, reason?: string }
 */
async function canCancelActivity(userId, activityId) {
  try {
    // 1. Verificar se é admin
    const adminCheck = await isAdmin(userId);
    if (adminCheck) {
      return { ok: true, canCancel: true, reason: 'Usuário é admin' };
    }

    // 2. Verificar se é responsável pela atividade
    const result = DatabaseManager.query('atividades', { id: activityId });
    if (!result || !result.ok || !result.items || result.items.length === 0) {
      return { ok: false, error: 'Atividade não encontrada' };
    }

    const atividade = result.items[0];
    const isResponsavel = (atividade.atribuido_uid === userId);

    if (isResponsavel) {
      return { ok: true, canCancel: true, reason: 'Usuário é responsável' };
    }

    // 3. Não é admin nem responsável
    return {
      ok: true,
      canCancel: false,
      reason: 'Apenas admin ou responsável pode cancelar'
    };

  } catch (error) {
    Logger.error('canCancelActivity', 'Erro', { userId, activityId, error: error.message });
    return { ok: false, error: error.message };
  }
}
```

### 3. Backend API (usuarios_api.gs)

```javascript
// ============================================================
// NOVO: API para cancelar atividade
// ============================================================

/**
 * Cancela uma atividade com motivo
 * Permissão: Apenas admin OU responsável pela atividade
 * @param {string} sessionId - ID da sessão
 * @param {string} activityId - ID da atividade
 * @param {string} motivo - Motivo do cancelamento (obrigatório, min 10 chars)
 * @returns {Object} { ok: boolean, error?: string }
 */
async function cancelActivity(sessionId, activityId, motivo) {
  try {
    // 1. Validar sessão
    const auth = await requireSession(sessionId, 'CancelActivity');
    if (!auth.ok) return auth;

    const userId = auth.session.user_id;

    // 2. Validar parâmetros
    if (!activityId) {
      return { ok: false, error: 'ID da atividade é obrigatório' };
    }

    if (!motivo || typeof motivo !== 'string' || motivo.trim().length < 10) {
      return { ok: false, error: 'Motivo deve ter no mínimo 10 caracteres' };
    }

    // 3. Buscar atividade
    const ativResult = DatabaseManager.query('atividades', { id: activityId });
    if (!ativResult.ok || !ativResult.items || ativResult.items.length === 0) {
      Logger.warn('CancelActivity', 'Atividade não encontrada', { activityId });
      return { ok: false, error: 'Atividade não encontrada' };
    }

    const atividade = ativResult.items[0];

    // 4. Validar status atual
    if (atividade.status === 'Cancelada') {
      return { ok: false, error: 'Atividade já está cancelada' };
    }

    if (atividade.status === 'Concluida') {
      return { ok: false, error: 'Não é possível cancelar atividades concluídas' };
    }

    // 5. Verificar permissão (admin OU responsável)
    const permCheck = await canCancelActivity(userId, activityId);
    if (!permCheck.ok) {
      return { ok: false, error: permCheck.error };
    }

    if (!permCheck.canCancel) {
      Logger.warn('CancelActivity', 'Permissão negada', {
        userId,
        activityId,
        reason: permCheck.reason
      });
      return { ok: false, error: 'Você não tem permissão para cancelar esta atividade' };
    }

    // 6. Cancelar atividade
    const now = new Date().toISOString();
    const updateResult = DatabaseManager.update('atividades', activityId, {
      status: 'Cancelada',
      motivo_cancelamento: motivo.trim(),
      cancelada_em: now,
      cancelada_por_uid: userId,
      atualizado_em: now,
      atualizado_uid: userId
    });

    if (!updateResult.ok) {
      Logger.error('CancelActivity', 'Erro ao cancelar', {
        activityId,
        error: updateResult.error
      });
      return { ok: false, error: 'Erro ao cancelar atividade: ' + updateResult.error };
    }

    Logger.info('CancelActivity', 'Atividade cancelada', {
      activityId,
      userId,
      motivo: motivo.substring(0, 50) + '...'
    });

    return { ok: true };

  } catch (error) {
    Logger.error('CancelActivity', 'Exceção', { error: error.message });
    return { ok: false, error: 'Erro ao cancelar atividade: ' + error.message };
  }
}
```

### 4. Frontend - Modal e Botão (activities.html)

```html
<!-- ============================================================
     NOVO: Modal de Cancelamento
     ============================================================ -->
<div id="modal-cancelar-atividade" class="modal" style="display: none;">
  <div class="modal-content" style="max-width: 500px;">
    <div class="modal-header" style="background: var(--danger); color: white;">
      <h3>❌ Cancelar Atividade</h3>
      <button onclick="fecharModalCancelar()" class="btn-close" style="color: white;">×</button>
    </div>

    <div class="modal-body">
      <p style="margin-bottom: var(--spacing-lg);">
        Tem certeza que deseja cancelar esta atividade?
      </p>
      <p style="color: var(--text-light); font-size: var(--font-size-sm); margin-bottom: var(--spacing-lg);">
        Esta ação não pode ser desfeita. A atividade será marcada como cancelada.
      </p>

      <label for="motivo-cancelamento" style="display: block; margin-bottom: var(--spacing-sm); font-weight: 600; color: var(--danger);">
        Motivo do Cancelamento *
      </label>
      <textarea
        id="motivo-cancelamento"
        placeholder="Descreva o motivo do cancelamento (mínimo 10 caracteres)"
        maxlength="500"
        rows="4"
        style="
          width: 100%;
          padding: var(--spacing-sm);
          border: 2px solid var(--danger);
          border-radius: var(--radius-md);
          font-family: inherit;
          resize: vertical;
        "
      ></textarea>
      <div style="display: flex; justify-content: space-between; margin-top: var(--spacing-xs);">
        <span style="color: var(--danger); font-size: var(--font-size-sm); font-weight: 600;">
          * Campo obrigatório
        </span>
        <span style="color: var(--text-light); font-size: var(--font-size-sm);">
          <span id="motivo-char-count">0</span>/500
        </span>
      </div>
    </div>

    <div class="modal-footer">
      <button onclick="fecharModalCancelar()" class="btn btn-outline">Voltar</button>
      <button onclick="confirmarCancelamento()" class="btn btn-danger">
        Confirmar Cancelamento
      </button>
    </div>
  </div>
</div>

<script>
// ============================================================
// NOVO: Gerenciamento do Modal de Cancelamento
// ============================================================

let activityIdToCancelGlobal = null;

/**
 * Abre modal de cancelamento
 * Verifica permissão antes de abrir (admin OU responsável)
 */
async function abrirModalCancelar(activityId) {
  // TODO: Verificar permissão no frontend também (UX)
  // Por enquanto, backend valida

  activityIdToCancelGlobal = activityId;
  document.getElementById('modal-cancelar-atividade').style.display = 'flex';
  document.getElementById('motivo-cancelamento').value = '';
  document.getElementById('motivo-char-count').textContent = '0';
  document.getElementById('motivo-cancelamento').focus();
}

/**
 * Fecha modal de cancelamento
 */
function fecharModalCancelar() {
  document.getElementById('modal-cancelar-atividade').style.display = 'none';
  activityIdToCancelGlobal = null;
}

// Contador de caracteres em tempo real
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.getElementById('motivo-cancelamento');
  if (textarea) {
    textarea.addEventListener('input', (e) => {
      const count = e.target.value.length;
      document.getElementById('motivo-char-count').textContent = count;

      // Feedback visual: borda vermelha se < 10 chars
      if (count > 0 && count < 10) {
        e.target.style.borderColor = 'var(--danger)';
      } else if (count >= 10) {
        e.target.style.borderColor = 'var(--success)';
      } else {
        e.target.style.borderColor = 'var(--danger)';
      }
    });
  }
});

/**
 * Confirma cancelamento da atividade
 * Valida motivo e chama API
 */
async function confirmarCancelamento() {
  const motivo = document.getElementById('motivo-cancelamento').value.trim();

  // Validação frontend
  if (motivo.length < 10) {
    showToast('Motivo deve ter no mínimo 10 caracteres', 'warning');
    document.getElementById('motivo-cancelamento').focus();
    return;
  }

  const button = event.target;
  const originalText = button.textContent;
  button.disabled = true;
  button.innerHTML = '<div class="loading-spinner" style="margin: 0 auto;"></div>';

  try {
    const response = await apiCall('cancelActivity', activityIdToCancelGlobal, motivo);

    if (response.ok) {
      showToast('Atividade cancelada com sucesso', 'success');
      fecharModalCancelar();

      // Atualizar card ou recarregar lista
      if (typeof updateSingleActivityCard === 'function') {
        updateSingleActivityCard(activityIdToCancelGlobal);
      } else {
        loadActivities();
      }
    } else {
      showToast('Erro: ' + response.error, 'error');
      button.disabled = false;
      button.innerHTML = originalText;
    }
  } catch (error) {
    console.error('Erro ao cancelar atividade:', error);
    showToast('Erro ao cancelar atividade', 'error');
    button.disabled = false;
    button.innerHTML = originalText;
  }
}

// ============================================================
// MODIFICAÇÃO: Adicionar botão cancelar no card
// ============================================================

function renderActivityCard(activity) {
  // ... código existente ...

  // Verificar se usuário pode cancelar
  const currentUserId = State.currentUser?.uid;
  const isResponsavel = (activity.atribuido_uid === currentUserId);
  const isAdmin = State.currentUser?.papel === 'Admin'; // ✅ NOVO: Verificar papel

  const canCancel = (isAdmin || isResponsavel) && activity.status === 'Pendente';

  // Botão de cancelar (somente se pode cancelar)
  const cancelButton = canCancel ? `
    <button
      class="btn btn-danger btn-sm"
      onclick="abrirModalCancelar('${activity.id}')"
      title="Cancelar atividade"
      style="margin-left: var(--spacing-xs);">
      ❌ Cancelar
    </button>
  ` : '';

  // Badge e motivo se cancelada
  const cancelInfo = activity.status === 'Cancelada' ? `
    <div class="badge badge-danger" style="margin-top: var(--spacing-sm);">
      ❌ Cancelada
    </div>
    <div style="
      background: rgba(239, 68, 68, 0.1);
      border-left: 4px solid var(--danger);
      padding: var(--spacing-sm);
      margin-top: var(--spacing-sm);
      border-radius: var(--radius-sm);
    ">
      <strong style="color: var(--danger);">Motivo:</strong>
      <span style="color: var(--text);">${activity.motivo_cancelamento || 'Não informado'}</span>
      <div style="font-size: var(--font-size-xs); color: var(--text-light); margin-top: var(--spacing-xs);">
        Cancelada em ${formatDate(activity.cancelada_em)} por ${activity.cancelada_por_uid}
      </div>
    </div>
  ` : '';

  // Retornar HTML do card
  return `
    <div class="activity-card ${activity.status === 'Cancelada' ? 'activity-card-canceled' : ''}">
      <!-- header -->
      <!-- info -->
      <!-- botões: editar, concluir, ${cancelButton} -->
      ${cancelInfo}
    </div>
  `;
}
</script>
```

### 5. CSS (styles.html)

```css
/* ============================================================
   NOVO: Estilos para atividades canceladas
   ============================================================ */

/* Card de atividade cancelada - visual diferenciado */
.activity-card-canceled {
    opacity: 0.7;
    border: 2px solid var(--danger) !important;
    background: rgba(239, 68, 68, 0.05);
}

.activity-card-canceled:hover {
    opacity: 1;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* Badge de cancelada */
.badge-danger {
    background: rgba(239, 68, 68, 0.2);
    color: var(--danger);
    border: 1px solid var(--danger);
    font-weight: 600;
}
```

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Migração de Dados (Campo `papel`)

**Ação Necessária:**
1. Adicionar coluna "papel" na planilha "Usuarios"
2. Definir papel de cada usuário:
   ```
   U001 → Admin
   U002 → Secretaria
   U003 → Usuário
   ```
3. Valor default: "Usuário"

**Script de Migração (executar UMA VEZ):**
```javascript
function migrarCampoPapel() {
  const sheet = SpreadsheetApp.openById('ID_PLANILHA').getSheetByName('Usuarios');
  const lastRow = sheet.getLastRow();

  // Adicionar coluna "papel" (assumindo que é coluna J)
  sheet.getRange('J1').setValue('papel');

  // Definir papel de cada usuário
  const papeis = {
    'U001': 'Admin',    // Definir admin principal
    'U002': 'Secretaria',
    // ... outros usuários
  };

  for (let i = 2; i <= lastRow; i++) {
    const uid = sheet.getRange(i, 1).getValue(); // Coluna A = uid
    const papel = papeis[uid] || 'Usuário'; // Default = Usuário
    sheet.getRange(i, 10).setValue(papel); // Coluna J = papel
  }

  Logger.log('Migração concluída!');
}
```

### 2. Atividades Canceladas nos Filtros

**Pergunta:** Incluir "Cancelada" no filtro de status?

**Opções:**
- **A)** Mostrar por padrão (junto com Pendente/Concluída) ✅ RECOMENDADO
- **B)** Ocultar por padrão (usuário precisa selecionar manualmente)

**Decisão Recomendada:** Opção A (transparência)

**Implementação:**
```javascript
// filters.html - Adicionar checkbox "Cancelada"
<label>
  <input type="checkbox" value="Cancelada" />
  Cancelada
</label>
```

### 3. Participações em Atividades Canceladas

**Pergunta:** O que fazer com participações?

**Resposta:** Manter histórico, mas:
- ❌ Não permitir editar participações de atividade cancelada
- ✅ Exibir badge "Atividade Cancelada" no modal de participações
- ✅ Manter dados para auditoria/histórico

### 4. Cancelar vs Deletar

**Diferença:**
- **Cancelar:** Status "Cancelada", mantém histórico, reversível (se necessário)
- **Deletar:** Soft delete (deleted='x'), oculta do sistema

**Filosofia do Sistema:** Preferir cancelamento (auditoria)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 0: DECISÃO ARQUITETURAL ⚠️ BLOQUEADOR

- [ ] **DECIDIR:** Opção 1, 2 ou 3 para sistema de permissões
- [ ] **SE Opção 1:** Migrar campo `papel` (1 hora)

### Fase 1: Schema

- [ ] Adicionar campo `papel` em `usuarios` (se Opção 1)
- [ ] Adicionar 'Cancelada' no enum de `status` em `atividades`
- [ ] Adicionar campo `motivo_cancelamento`
- [ ] Adicionar campo `cancelada_em`
- [ ] Adicionar campo `cancelada_por_uid`
- [ ] Adicionar regras de negócio no dicionário

### Fase 2: Backend Core

- [ ] Implementar `isAdmin(userId)` em `session_manager.gs`
- [ ] Implementar `canCancelActivity(userId, activityId)`

### Fase 3: Backend API

- [ ] Implementar `cancelActivity(sessionId, activityId, motivo)`
- [ ] Validar sessão com `requireSession()`
- [ ] Validar permissões (admin OU responsável)
- [ ] Validar motivo (mínimo 10 caracteres)
- [ ] Validar status (não pode cancelar concluída)
- [ ] Update com DatabaseManager
- [ ] Logs de auditoria

### Fase 4: Frontend - Modal

- [ ] Criar HTML do modal
- [ ] Função `abrirModalCancelar(activityId)`
- [ ] Função `fecharModalCancelar()`
- [ ] Contador de caracteres em tempo real
- [ ] Validação frontend (mínimo 10 chars)
- [ ] Função `confirmarCancelamento()`
- [ ] Loading state no botão
- [ ] Feedback de sucesso/erro

### Fase 5: Frontend - Card

- [ ] Adicionar botão "Cancelar" (condicional)
- [ ] Verificar permissão (frontend também)
- [ ] Badge "Cancelada" se status = Cancelada
- [ ] Exibir motivo e data de cancelamento
- [ ] Estilo diferenciado para card cancelado

### Fase 6: Filtros

- [ ] Adicionar opção "Cancelada" no modal de filtros
- [ ] Decidir se mostra por padrão ou não

### Fase 7: CSS

- [ ] Estilos para `.activity-card-canceled`
- [ ] Estilos para `.badge-danger`
- [ ] Estilos para box de motivo

### Fase 8: Testes

- [ ] Testar cancelamento como admin
- [ ] Testar cancelamento como responsável
- [ ] Testar bloqueio se não for admin nem responsável
- [ ] Testar validação de motivo (< 10 chars)
- [ ] Testar atividade já cancelada (não pode cancelar duas vezes)
- [ ] Testar atividade concluída (não pode cancelar)
- [ ] Testar filtro incluindo canceladas
- [ ] Testar exibição de motivo no card

---

## 🧪 TESTES

### Teste 1: Cancelamento como Admin

**Setup:**
- Usuário logado: U001 (papel = Admin)
- Atividade ACT-001: atribuido_uid = U002, status = Pendente

**Passos:**
1. Abrir tela de atividades
2. Clicar em "❌ Cancelar" na ACT-001
3. Preencher motivo: "Aula suspensa devido às chuvas"
4. Confirmar

**Esperado:**
- ✅ Modal abre
- ✅ Cancelamento é processado
- ✅ Atividade muda para status "Cancelada"
- ✅ Motivo é salvo
- ✅ Card exibe badge "Cancelada" + motivo

### Teste 2: Cancelamento como Responsável

**Setup:**
- Usuário logado: U002 (papel = Usuário, mas é responsável)
- Atividade ACT-002: atribuido_uid = U002, status = Pendente

**Passos:** (mesmos do Teste 1)

**Esperado:** ✅ Deve funcionar (responsável pode cancelar)

### Teste 3: Bloqueio de Usuário Sem Permissão

**Setup:**
- Usuário logado: U003 (papel = Usuário, NÃO é responsável)
- Atividade ACT-001: atribuido_uid = U002, status = Pendente

**Passos:**
1. Abrir tela de atividades
2. Card NÃO deve mostrar botão "Cancelar"

**Esperado:**
- ❌ Botão "Cancelar" não aparece
- Se tentar via console: Backend bloqueia com erro de permissão

### Teste 4: Validação de Motivo

**Setup:** (qualquer usuário com permissão)

**Passos:**
1. Clicar em "Cancelar"
2. Preencher motivo com apenas 5 caracteres: "Teste"
3. Tentar confirmar

**Esperado:**
- ❌ Toast: "Motivo deve ter no mínimo 10 caracteres"
- ❌ Modal permanece aberto
- ❌ Não chama API

### Teste 5: Não Pode Cancelar Concluída

**Setup:**
- Atividade ACT-003: status = Concluida

**Passos:**
1. Tentar cancelar via console (simular hack)

**Esperado:**
- ❌ Backend retorna: "Não é possível cancelar atividades concluídas"
- ❌ Status permanece "Concluida"

---

## 🚨 RISCOS E MITIGAÇÕES

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| 1 | Sistema de permissões inexistente | 🔴 Confirmado | 🔴 Alto | **BLOQUEADOR** - Decidir e implementar Opção 1, 2 ou 3 antes de continuar |
| 2 | Migração de dados (campo papel) | 🟡 Média | 🟡 Médio | Script de migração, testar em cópia da planilha primeiro |
| 3 | Conflito com atividades concluídas | 🟢 Baixa | 🟢 Baixo | Validação no backend (bloquear cancelamento) |
| 4 | Usuário cancela por engano | 🟡 Média | 🟡 Médio | Modal de confirmação + motivo obrigatório (fricção proposital) |
| 5 | Motivo muito curto/genérico | 🟡 Média | 🟢 Baixo | Validação de mínimo 10 caracteres |

---

## 📈 MÉTRICAS DE SUCESSO

### Funcionalidade
- [ ] Admin pode cancelar qualquer atividade
- [ ] Responsável pode cancelar suas atividades
- [ ] Outros usuários NÃO podem cancelar
- [ ] Motivo é obrigatório e validado
- [ ] Histórico é mantido (auditoria)

### UX
- [ ] Modal claro e intuitivo
- [ ] Feedback visual diferenciado para cancelada
- [ ] Motivo visível no card
- [ ] Filtros incluem "Cancelada"

### Segurança
- [ ] Permissões validadas no backend
- [ ] Logs de auditoria registrados
- [ ] Não pode cancelar concluída
- [ ] Não pode cancelar duas vezes

---

## 📚 REFERÊNCIAS

### Arquivos Relacionados
- `src/00-core/data_dictionary.gs` - Schema de atividades e usuarios
- `src/02-api/usuarios_api.gs` - APIs de atividades
- `src/00-core/session_manager.gs` - Validação de sessão e permissões
- `src/04-views/activities.html` - Interface de atividades
- `src/05-components/core/styles.html` - CSS global

### Documentação Relacionada
- [MAPA_CODIGO.md](../MAPA_CODIGO.md) - Onde está cada função
- [CLAUDE_INSTRUCOES.md](../CLAUDE_INSTRUCOES.md) - Regras de modificação

---

---

## 🎉 TAREFA DESBLOQUEADA!

**Data de Desbloqueio:** 25/10/2025
**Razão:** Sistema de permissões JÁ EXISTE!

### Como Foi Desbloqueada?

Durante a implementação da TAREFA 01, descobrimos que o sistema **já possui** lista de administradores:

**Localização:** `src/05-components/utils/permissionsHelpers.html`

```javascript
const ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004'];
function isCurrentUserAdmin() { ... }
```

**Conclusão:** Não precisa adicionar campo `papel` na tabela usuarios! ✅

---

## ✅ SOLUÇÃO SIMPLIFICADA

### Requisitos da Implementação

#### 1. Schema (data_dictionary.gs) - 4 campos

```javascript
atividades: {
  fields: {
    status: {
      enum: ['Pendente', 'Concluida', 'Cancelada'], // ← Adicionar 'Cancelada'
    },
    // NOVOS CAMPOS:
    motivo_cancelamento: {
      type: 'TEXT',
      maxLength: 500,
      required: false
    },
    cancelada_em: {
      type: 'DATETIME',
      required: false
    },
    cancelada_por_uid: {
      type: 'TEXT',
      foreignKey: 'usuarios.uid',
      required: false
    }
  }
}
```

#### 2. Backend (usuarios_api.gs) - Nova função

```javascript
/**
 * Cancela atividade com motivo
 * Permissão: Admin OU responsável
 */
async function cancelActivityApi(sessionId, activityId, motivo) {
  // 1. Validar sessão
  const auth = await requireSession(sessionId, 'Activities');
  const userId = auth.session.user_id;

  // 2. Buscar atividade
  const activity = await DatabaseManager.findById('atividades', activityId);

  // 3. Validar status (não pode cancelar concluída/cancelada)
  if (activity.item.status === 'Concluida') {
    return { ok: false, error: 'Não é possível cancelar atividade concluída' };
  }

  // 4. Verificar permissão
  const isAdmin = isUserAdmin(userId); // ← Usar lista ADMIN_UIDS
  const isResponsavel = (activity.item.atribuido_uid === userId);

  if (!isAdmin && !isResponsavel) {
    return { ok: false, error: 'Sem permissão' };
  }

  // 5. Validar motivo (min 10 chars)
  if (!motivo || motivo.trim().length < 10) {
    return { ok: false, error: 'Motivo deve ter no mínimo 10 caracteres' };
  }

  // 6. Cancelar
  await DatabaseManager.update('atividades', activityId, {
    status: 'Cancelada',
    motivo_cancelamento: motivo.trim(),
    cancelada_em: new Date().toISOString(),
    cancelada_por_uid: userId
  });

  return { ok: true };
}

// Helper: verificar se é admin
function isUserAdmin(uid) {
  const ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004'];
  return ADMIN_UIDS.includes(uid);
}
```

#### 3. Frontend (activities.html) - Modal + Botão

**Botão no card:**
```javascript
// Verificar permissão
const isAdmin = isCurrentUserAdmin();
const isResponsavel = (activity.atribuido_uid === currentUserUid);
const canCancel = (isAdmin || isResponsavel) && activity.status === 'Pendente';

// Adicionar botão
const cancelButton = canCancel ? `
  <button class="btn btn-danger" onclick="showCancelModal('${activity.id}')">
    🚫 Cancelar
  </button>
` : '';
```

**Modal HTML:**
```html
<div id="modal-cancelar-atividade" class="modal" style="display: none;">
  <div class="modal-content">
    <h3>🚫 Cancelar Atividade</h3>

    <textarea id="cancel-motivo" rows="4" maxlength="500"
              placeholder="Motivo (mínimo 10 caracteres)"></textarea>

    <button onclick="confirmCancelActivity()" class="btn btn-danger">
      Confirmar Cancelamento
    </button>
  </div>
</div>
```

**JavaScript:**
```javascript
async function confirmCancelActivity() {
  const motivo = document.getElementById('cancel-motivo').value.trim();

  if (motivo.length < 10) {
    showToast('Motivo deve ter no mínimo 10 caracteres', 'error');
    return;
  }

  const result = await apiCall('cancelActivityApi', currentCancelActivityId, motivo);

  if (result.ok) {
    showToast('Atividade cancelada', 'success');
    closeCancelModal();
    loadActivities();
  }
}
```

#### 4. Estilos (styles.html) - CSS

```css
.status-badge.cancelada {
  background: #ef4444;
  color: white;
}

.activity-card.cancelada {
  opacity: 0.7;
  border-left: 4px solid #ef4444;
}

.btn-danger {
  background: #ef4444;
  color: white;
}
```

---

## 📁 ARQUIVOS A MODIFICAR

| # | Arquivo | O Que Fazer | Linhas | Zona |
|---|---------|-------------|--------|------|
| 1 | `data_dictionary.gs` | Adicionar 4 campos | ~15 | 🔴 Red |
| 2 | `usuarios_api.gs` | Nova função `cancelActivityApi()` | ~70 | 🟡 Yellow |
| 3 | `activities.html` | Modal + botão + JS | ~120 | 🟡 Yellow |
| 4 | `styles.html` | CSS cancelada | ~15 | 🟢 Green |

**Total:** 4 arquivos, ~220 linhas

---

## 🚀 PASSOS PARA EXECUÇÃO

### Passo 1: Modificar Schema ⚠️ (RED ZONE)

**Arquivo:** `src/00-core/data_dictionary.gs`

**Localizar linha ~155** (status de atividades):
```javascript
status: {
  type: 'TEXT',
  required: true,
  enum: ['Pendente', 'Concluida'],
```

**Modificar para:**
```javascript
status: {
  type: 'TEXT',
  required: true,
  enum: ['Pendente', 'Concluida', 'Cancelada'], // ← Adicionar
```

**Adicionar 3 novos campos** (após linha ~175):
```javascript
motivo_cancelamento: {
  type: 'TEXT',
  maxLength: 500,
  required: false,
  description: 'Motivo do cancelamento (mínimo 10 caracteres)'
},
cancelada_em: {
  type: 'DATETIME',
  required: false,
  description: 'Data/hora do cancelamento'
},
cancelada_por_uid: {
  type: 'TEXT',
  foreignKey: 'usuarios.uid',
  required: false,
  description: 'UID do usuário que cancelou'
}
```

---

### Passo 2: Criar Função Backend

**Arquivo:** `src/02-api/usuarios_api.gs`

**Adicionar no final do arquivo** (após última função):
- Copiar código completo da função `cancelActivityApi()` (veja seção "Requisitos" acima)
- Copiar helper `isUserAdmin()`

---

### Passo 3: Adicionar Modal no Frontend

**Arquivo:** `src/04-views/activities.html`

**Localizar final do arquivo** (antes do `</div>` final):
- Adicionar HTML do modal completo
- Adicionar funções JavaScript: `showCancelModal()`, `closeCancelModal()`, `confirmCancelActivity()`

**Modificar função `renderActivityCard()`**:
- Adicionar verificação de permissão (isAdmin || isResponsavel)
- Adicionar botão "Cancelar" se tiver permissão

---

### Passo 4: Adicionar CSS

**Arquivo:** `src/05-components/core/styles.html`

**Adicionar no final da seção de badges**:
- CSS para `.status-badge.cancelada`
- CSS para `.activity-card.cancelada`
- CSS para `.btn-danger`

---

## 🧪 TESTES

### ✅ TESTE 1: Admin Cancela

**Passos:**
1. Login como U001-U004
2. Abrir qualquer atividade Pendente
3. Clicar "Cancelar"
4. Digitar motivo com 10+ caracteres
5. Confirmar

**Validar:**
- [ ] Modal abre
- [ ] Cancelamento funciona
- [ ] Atividade fica com status "Cancelada"
- [ ] Badge vermelha aparece
- [ ] Motivo, data e UID salvos

---

### ✅ TESTE 2: Responsável Cancela

**Passos:**
1. Login como usuário comum
2. Abrir atividade onde é responsável
3. Clicar "Cancelar"

**Validar:**
- [ ] Botão "Cancelar" APARECE
- [ ] Consegue cancelar

---

### ✅ TESTE 3: Sem Permissão

**Passos:**
1. Login como usuário comum
2. Abrir atividade de outro responsável

**Validar:**
- [ ] Botão "Cancelar" NÃO aparece

---

### ✅ TESTE 4: Validações

**Testar:**
- [ ] Motivo < 10 chars → Erro
- [ ] Cancelar atividade Concluída → Erro
- [ ] Cancelar atividade já Cancelada → Erro
- [ ] Campo vazio → Erro

---

### ✅ TESTE 5: Visual

**Validar:**
- [ ] Card cancelado com opacidade 0.7
- [ ] Borda vermelha no card
- [ ] Badge "Cancelada" vermelha
- [ ] Botões adequados aparecem

---

## 📊 COMPARAÇÃO: Antes vs Agora

|  | ANTES (Bloqueada) | AGORA (Desbloqueada) |
|---|---|---|
| **Status** | ⚠️ Bloqueada | ✅ Pronta |
| **Bloqueador** | Sem permissões | Sistema existe |
| **Modificar RED** | data_dictionary + usuarios | Apenas data_dictionary |
| **Arquivos** | 6+ | 4 |
| **Tempo** | 10+ horas | 3-4 horas |
| **Complexidade** | 🔴 Alta | 🟢 Baixa |

---

**Última Atualização:** 25/10/2025
**Autor:** Claude Code
**Status:** ✅ DESBLOQUEADA - Pronta para Implementar
**Próximo:** Aguardando aprovação para implementar
