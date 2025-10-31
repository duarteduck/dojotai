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



Sessão de alteração de permissões (ler, documentar e apagar):

 🔥 PLANO: Migrar permissões de ADMIN_UIDS hardcoded para role dinâmico do banco

 ⚠️ PRÉ-REQUISITO (VOCÊ PRECISA CONFIRMAR):

 ✅ Confirme que você já fez:
 1. Adicionou campo role na planilha Google Sheets (tabela usuarios)
 2. Preencheu role = "admin" (minúsculo) para U001, U002, U003, U004
 3. Deixou role vazio/null para os outros usuários
 4. Adicionou definição do campo role no data_dictionary.gs após linha 141:
 // Role/Papel do usuário no sistema
 role: {
   type: 'TEXT',
   required: false,
   enum: ['admin', 'membro'],
   default: null,
   description: 'Papel do usuário no sistema (admin = administrador, vazio = membro)',
   example: 'admin'
 },

 ---
 🔧 O QUE VOU FAZER (2 arquivos):

 ARQUIVO 1: src/05-components/core/auth.html

 Zona: 🟢 Verde (safe)

 Mudança 1 - Salvar role no localStorage (linha ~184):
 // ADICIONAR após localStorage.setItem('userName', ...)
 localStorage.setItem('userRole', result.user.role || '');

 Mudança 2 - Salvar role no State (linha ~186):
 // ADICIONAR após salvar sessionId/uid/userName
 if (window.State) {
     State.uid = result.user.uid;
     State.nome = result.user.nome;
     State.role = result.user.role || '';
 }

 ---
 ARQUIVO 2: src/05-components/utils/permissionsHelpers.html

 Zona: 🟢 Verde (safe)

 Mudança 1 - DELETAR linha 10:
 const ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004']; // ❌ DELETAR COMPLETAMENTE

 Mudança 2 - SUBSTITUIR função isCurrentUserAdmin() (linhas 16-19):

 DE:
 function isCurrentUserAdmin() {
     const currentUserUid = State.uid || localStorage.getItem('uid');
     return ADMIN_UIDS.includes(currentUserUid);
 }

 PARA:
 function isCurrentUserAdmin() {
     // Lê role do State (setado no login) ou fallback localStorage
     const role = (window.State && State.role) || localStorage.getItem('userRole');

     // Retorna true APENAS se role === "admin"
     // Se vazio/null/undefined/qualquer outro valor → false (não é admin)

●User approved Claude's plan:
  ⎿  🔥 PLANO: Migrar permissões de ADMIN_UIDS hardcoded para role dinâmico do banco

     ⚠️ PRÉ-REQUISITO (VOCÊ PRECISA CONFIRMAR):

     ✅ Confirme que você já fez:
     1. Adicionou campo role na planilha Google Sheets (tabela usuarios)
     2. Preencheu role = "admin" (minúsculo) para U001, U002, U003, U004
     3. Deixou role vazio/null para os outros usuários
     4. Adicionou definição do campo role no data_dictionary.gs após linha 141:
     // Role/Papel do usuário no sistema
     role: {
       type: 'TEXT',
       required: false,
       enum: ['admin', 'membro'],
       default: null,
       description: 'Papel do usuário no sistema (admin = administrador, vazio = membro)',
       example: 'admin'
     },

     ---
     🔧 O QUE VOU FAZER (2 arquivos):

     ARQUIVO 1: src/05-components/core/auth.html

     Zona: 🟢 Verde (safe)

     Mudança 1 - Salvar role no localStorage (linha ~184):
     // ADICIONAR após localStorage.setItem('userName', ...)
     localStorage.setItem('userRole', result.user.role || '');

     Mudança 2 - Salvar role no State (linha ~186):
     // ADICIONAR após salvar sessionId/uid/userName
     if (window.State) {
         State.uid = result.user.uid;
         State.nome = result.user.nome;
         State.role = result.user.role || '';
     }

     ---
     ARQUIVO 2: src/05-components/utils/permissionsHelpers.html

     Zona: 🟢 Verde (safe)

     Mudança 1 - DELETAR linha 10:
     const ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004']; // ❌ DELETAR COMPLETAMENTE

     Mudança 2 - SUBSTITUIR função isCurrentUserAdmin() (linhas 16-19):

     DE:
     function isCurrentUserAdmin() {
         const currentUserUid = State.uid || localStorage.getItem('uid');
         return ADMIN_UIDS.includes(currentUserUid);
     }

     PARA:
     function isCurrentUserAdmin() {
         // Lê role do State (setado no login) ou fallback localStorage
         const role = (window.State && State.role) || localStorage.getItem('userRole');

         // Retorna true APENAS se role === "admin"
         // Se vazio/null/undefined/qualquer outro valor → false (não é admin)
         return role && role.toLowerCase() === 'admin';
     }

     Mudança 3 - DELETAR linha 113:
     window.ADMIN_UIDS = ADMIN_UIDS; // ❌ DELETAR COMPLETAMENTE

     ---
     ✅ RESULTADO FINAL:

     Antes (hardcoded):

     - Lista fixa de UIDs no código
     - Adicionar admin = editar código + deploy

     Depois (dinâmico):

     - Lê role do banco de dados
     - Adicionar admin = alterar planilha (sem código/deploy)
     - Sistema verifica: role === "admin" → é admin, qualquer outro valor → não é admin

     ---
     🧪 COMO TESTAR APÓS IMPLEMENTAÇÃO:

     1. Fazer logout (se logado)
     2. Logar com usuário admin (ex: U001)
     3. Verificar no console: localStorage.getItem('userRole') deve retornar "admin"
     4. Tentar editar atividade → deve permitir ✅
     5. Fazer logout
     6. Logar com usuário não-admin (ex: U005)
     7. Verificar no console: localStorage.getItem('userRole') deve retornar "" (vazio) ou null
     8. Tentar editar atividade → NÃO deve permitir ❌

     ---
     📊 RESUMO:

     - Arquivos modificados: 2
     - Linhas adicionadas: ~10
     - Linhas deletadas: ~2
     - Zona de risco: 🟢 VERDE (safe)
     - Sem fallback: ✅ Vai direto no quente!
     - ADMIN_UIDS: ❌ DELETADO completamente
  ⎿

● Perfeito! Plano aprovado! Vou executar agora. Deixe-me criar o todo list e começar:

● Agora vou começar as modificações:

● Read(src\05-components\core\auth.html)
  ⎿  Read 80 lines

● Perfeito! Agora vou fazer a primeira modificação no auth.html:

● Update(src\05-components\core\auth.html)
  ⎿  Updated src\05-components\core\auth.html with 8 additions
       182                            localStorage.setItem('sessionId', result.session.id);
       183                            localStorage.setItem('uid', result.user.uid); // UID real do usuário
       184                            localStorage.setItem('userName', result.user.nome);
       185 +                          localStorage.setItem('userRole', result.user.role || ''); // Role do usuário (admin, vazio, etc)
       186
       187 +                          // Salvar também no State global
       188 +                          if (window.State) {
       189 +                              State.uid = result.user.uid;
       190 +                              State.nome = result.user.nome;
       191 +                              State.role = result.user.role || '';
       192 +                          }
       193 +
       194                            // Sucesso - remover tela de login e mostrar app
       195                            const loginScreen = document.getElementById('login-screen');
       196                            if (loginScreen) {

● Excelente! ✅ Primeira modificação concluída. Agora vou para o segundo arquivo:

● Read(src\05-components\utils\permissionsHelpers.html)
  ⎿  Read 122 lines

● Perfeito! Agora vou fazer as 3 mudanças neste arquivo:

  1. Deletar a constante ADMIN_UIDS e seu comentário (linhas 7-10):

● Update(src\05-components\utils\permissionsHelpers.html)
  ⎿  Updated src\05-components\utils\permissionsHelpers.html with 9 additions and 8 removals
        2        // ============================================================================
        3        // PERMISSIONS HELPERS
        4        // Funções utilitárias para controle de permissões e autorização
        5 +      // Sistema dinâmico baseado em roles (campo 'role' na tabela usuarios)
        6        // ============================================================================
        7
        8        /**
        9 -       * Lista de UIDs de administradores (temporário - futuramente será por roles/cargos)
       10 -       */
       11 -      const ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004'];
       12 -
       13 -      /**
        9         * Verifica se o usuário atual é administrador
       10 -       * @returns {boolean} - true se for admin
       10 +       * Lê o campo 'role' do banco de dados (carregado no login via State/localStorage)
       11 +       * @returns {boolean} - true se role === 'admin', false caso contrário
       12         */
       13        function isCurrentUserAdmin() {
       14 -          const currentUserUid = State.uid || localStorage.getItem('uid');
       15 -          return ADMIN_UIDS.includes(currentUserUid);
       14 +          // Lê role do State (setado no login) ou fallback localStorage
       15 +          const role = (window.State && State.role) || localStorage.getItem('userRole');
       16 +
       17 +          // Retorna true APENAS se role === "admin"
       18 +          // Qualquer outro valor (vazio, null, "membro", etc) → false
       19 +          return role && role.toLowerCase() === 'admin';
       20        }
       21
       22        /**

● Ótimo! ✅ Agora a segunda mudança - deletar a exposição global de ADMIN_UIDS:

● Update(src\05-components\utils\permissionsHelpers.html)
  ⎿  Updated src\05-components\utils\permissionsHelpers.html with 1 removal
       111        }
       112
       113        // Expor funções globalmente
       114 -      window.ADMIN_UIDS = ADMIN_UIDS;
       114        window.isCurrentUserAdmin = isCurrentUserAdmin;
       115        window.isCurrentUserResponsavel = isCurrentUserResponsavel;
       116        window.canViewParticipants = canViewParticipants;

● Perfeito! ✅ Todas as modificações concluídas! Vou atualizar o todo e fazer um resumo:

● ✅ CONCLUÍDO! Sistema migrado de hardcoded para role dinâmico

  📝 RESUMO DAS MUDANÇAS:

  Arquivo 1: src/05-components/core/auth.html ✅

  Mudanças:
  - ✅ Adicionado localStorage.setItem('userRole', result.user.role || '') no login
  - ✅ Adicionado salvamento de State.role no login
  - Resultado: Agora o role do usuário é salvo quando ele faz login

  Arquivo 2: src/05-components/utils/permissionsHelpers.html ✅

  Mudanças:
  - ✅ DELETADO completamente: const ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004']
  - ✅ DELETADO completamente: window.ADMIN_UIDS = ADMIN_UIDS
  - ✅ REFATORADO: Função isCurrentUserAdmin() agora lê State.role ou localStorage.userRole
  - Resultado: Sistema agora verifica permissões dinamicamente lendo o banco de dados

  ---
  🔥 SISTEMA FUNCIONANDO ASSIM AGORA:

  Fluxo de autenticação:

  1. Usuário faz login
  2. Backend retorna { user: { uid, nome, role: "admin" } }  ← do banco!
  3. Frontend salva:
     ✅ localStorage.userRole = "admin"
     ✅ State.role = "admin"
  4. Quando verificar permissão:
     → isCurrentUserAdmin() lê State.role
     → Se "admin" → true
     → Se vazio/null/qualquer outro → false
