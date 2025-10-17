# 🔐 Sistema de Permissões - Dojotai

**Versão:** 1.0 (Temporária - Baseada em UIDs)
**Atualizado:** 17/10/2025
**Status:** ⚠️ Implementação Temporária

---

## 🎯 Visão Geral

Este documento descreve o sistema de permissões atual e o planejamento futuro para gestão de permissões por **roles** e **cargos**.

---

## ⚠️ IMPLEMENTAÇÃO ATUAL (Temporária)

### Sistema Baseado em UID (Código do Usuário)

Atualmente, as permissões são hardcoded baseadas nos **UIDs dos usuários**.

### Usuários Administradores

Os seguintes usuários têm **permissão total**:

```javascript
const admins = ['U001', 'U002', 'U003', 'U004'];
```

---

## 📋 Permissões por Funcionalidade

### 1. **Botão "Editar" Atividade**

**Quem pode ver:**
- ✅ Usuários: `U001`, `U002`, `U003`, `U004`

**Condições adicionais:**
- ❌ Atividade não pode estar concluída
- ❌ Data da atividade não pode ter passado

**Implementação:**
```javascript
// app_migrated.html:3454
const podeEditar = statusInfo.text !== 'Concluída' && !atividadeJaPassou && isAdmin;
```

---

### 2. **Botão "Participantes" / "Resumo"**

**Quem pode ver:**
- ✅ Usuários: `U001`, `U002`, `U003`, `U004` (admins)
- ✅ **Responsável pela atividade** (campo `atribuido_uid`)

**Comportamento:**
- Se atividade **não está concluída** → Botão "👥 Participantes" (azul, clicável)
- Se atividade **está concluída** → Botão "📊 Resumo" (desabilitado, opacidade 0.5)

**Implementação:**
```javascript
// app_migrated.html:3448
const podeVerParticipantes = isAdmin || isResponsavel;
```

---

### 3. **Botão "Concluir" Atividade**

**Quem pode ver:**
- ✅ Usuários: `U001`, `U002`, `U003`, `U004`

**Condições adicionais:**
- ❌ Atividade não pode já estar concluída

**Implementação:**
```javascript
// app_migrated.html:3532
${statusInfo.text !== 'Concluída' && isAdmin ? `<button...>✅ Concluir</button>` : ''}
```

---

## 📍 Onde Está Implementado

### Frontend

**Arquivo:** `app_migrated.html`

**Função:** `renderActivityCard(activity)` (linhas 3436-3533)

**Seção de Permissões:** Linhas 3436-3454

```javascript
// ===== CONTROLE DE PERMISSÕES =====
// Obter usuário logado
const currentUserUid = State.uid || localStorage.getItem('uid');

// Lista de administradores (permissão total)
const admins = ['U001', 'U002', 'U003', 'U004'];
const isAdmin = admins.includes(currentUserUid);

// Verificar se é o responsável pela atividade
const isResponsavel = activity.atribuido_uid === currentUserUid;

// Permissões específicas
const podeVerParticipantes = isAdmin || isResponsavel;
const podeEditar = statusInfo.text !== 'Concluída' && !atividadeJaPassou && isAdmin;
```

---

## 🔮 PLANEJAMENTO FUTURO

### Sistema por Roles e Cargos

**Objetivo:** Implementar um sistema flexível de permissões baseado em:

1. **Roles (Perfis de Acesso)**
   - Administrador
   - Coordenador
   - Instrutor
   - Membro
   - Convidado

2. **Cargos (Hierarquia Organizacional)**
   - Mestre
   - Responsável de Dojo
   - Instrutor Chefe
   - Instrutor Assistente
   - Monitor
   - Praticante

---

### Estrutura Planejada

#### Tabela `roles` (a criar)

```javascript
roles: {
  fields: {
    id: { type: 'TEXT', required: true }, // ROL-001
    nome: { type: 'TEXT', required: true }, // Ex: "Administrador"
    descricao: { type: 'TEXT' },
    permissoes: { type: 'JSON', required: true }, // Array de permissões
    status: { type: 'TEXT', default: 'Ativo' },
    criado_em: { type: 'DATETIME', auto: true },
    deleted: { type: 'TEXT', default: '' }
  }
}
```

#### Tabela `cargos` (a criar)

```javascript
cargos: {
  fields: {
    id: { type: 'TEXT', required: true }, // CAR-001
    nome: { type: 'TEXT', required: true }, // Ex: "Instrutor Chefe"
    nivel_hierarquia: { type: 'NUMBER', required: true }, // 1 = maior hierarquia
    descricao: { type: 'TEXT' },
    permissoes_padrao: { type: 'JSON' }, // Permissões do cargo
    status: { type: 'TEXT', default: 'Ativo' },
    criado_em: { type: 'DATETIME', auto: true },
    deleted: { type: 'TEXT', default: '' }
  }
}
```

#### Modificação na Tabela `usuarios`

```javascript
usuarios: {
  fields: {
    // ... campos existentes ...
    role_id: { type: 'TEXT', foreignKey: 'roles.id' }, // Novo campo
    cargo_id: { type: 'TEXT', foreignKey: 'cargos.id' }, // Novo campo
  }
}
```

---

### Exemplo de Permissões JSON

```json
{
  "atividades": {
    "criar": true,
    "editar": ["proprias", "todas"], // Pode editar próprias ou todas
    "excluir": false,
    "concluir": ["proprias", "todas"],
    "ver_participantes": ["proprias", "todas"]
  },
  "membros": {
    "criar": true,
    "editar": true,
    "excluir": false,
    "ver_detalhes": true
  },
  "relatorios": {
    "ver_todos": true,
    "exportar": true
  }
}
```

---

### Migração Planejada

**Fase 1: Estrutura de Dados**
- [ ] Criar tabela `roles`
- [ ] Criar tabela `cargos`
- [ ] Adicionar campos `role_id` e `cargo_id` em `usuarios`
- [ ] Atualizar `data_dictionary.gs`

**Fase 2: Backend**
- [ ] Criar `roles.gs` (CRUD de roles)
- [ ] Criar `cargos.gs` (CRUD de cargos)
- [ ] Criar `permissions_manager.gs` (validação de permissões)
- [ ] Funções auxiliares:
  - `hasPermission(uid, recurso, acao)`
  - `canEditActivity(uid, activityId)`
  - `canViewParticipants(uid, activityId)`

**Fase 3: Frontend**
- [ ] Substituir checks hardcoded por chamadas ao `permissions_manager`
- [ ] Interface de gestão de roles e cargos
- [ ] Atribuição de roles/cargos aos usuários

**Fase 4: Testes e Validação**
- [ ] Testar todas as combinações de permissões
- [ ] Validar hierarquia de cargos
- [ ] Garantir retrocompatibilidade

---

## 🔍 Como Verificar Permissões Atuais

### No Console do Navegador

```javascript
// Ver usuário logado
console.log('UID:', State.uid);

// Ver se é admin
const admins = ['U001', 'U002', 'U003', 'U004'];
console.log('É admin?', admins.includes(State.uid));

// Ver dados completos do usuário
console.log('Usuário:', State.user);
```

### No Código Backend

```javascript
// Em qualquer função .gs
function verificarPermissao(uid) {
  const admins = ['U001', 'U002', 'U003', 'U004'];
  const isAdmin = admins.includes(uid);

  Logger.info('Permissions', 'Verificação de permissão', { uid, isAdmin });

  return { isAdmin };
}
```

---

## ⚠️ Limitações Atuais

1. **Hardcoded:** Lista de admins está no código frontend
2. **Sem Flexibilidade:** Não é possível adicionar/remover admins sem modificar código
3. **Sem Granularidade:** Apenas dois níveis (admin ou não-admin)
4. **Sem Auditoria:** Não há registro de quem fez o quê
5. **Sem Interface:** Não há tela de gestão de permissões

---

## 📚 Referências

- **Implementação atual:** `app_migrated.html:3436-3533`
- **Estrutura de usuários:** `src/00-core/data_dictionary.gs` (tabela `usuarios`)
- **Documentação relacionada:** [GUIA_DESENVOLVIMENTO.md](../GUIA_DESENVOLVIMENTO.md)

---

## 🔄 Histórico de Versões

| Versão | Data       | Mudanças                                    |
|--------|------------|---------------------------------------------|
| 1.0    | 17/10/2025 | Criação do documento - Sistema baseado em UID |

---

**📝 Nota:** Este documento será atualizado conforme o sistema de permissões evolui de UIDs hardcoded para roles e cargos dinâmicos.
