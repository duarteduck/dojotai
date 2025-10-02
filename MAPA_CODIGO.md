# 🗺️ MAPA DO CÓDIGO - Sistema Dojotai

**Última atualização:** 01/10/2025 | **Versão:** 2.0.0-alpha.4

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

**"Onde está X?"** - Este documento responde essa pergunta.

Mapa visual e detalhado de todos os arquivos, funções e estruturas do projeto.

---

## 📊 VISÃO GERAL - 3 CAMADAS

```
┌──────────────────────────────────────────┐
│         FRONTEND (1 arquivo)             │
│   app_migrated.html (7.399 linhas)      │
│   HTML + CSS + JavaScript monolítico    │
└──────────────────────────────────────────┘
              ⬇️ google.script.run
┌──────────────────────────────────────────┐
│         BACKEND (15 arquivos)            │
│   src/00-core/ + src/01-business/       │
│   Google Apps Script (10.141 linhas)    │
└──────────────────────────────────────────┘
              ⬇️ DatabaseManager
┌──────────────────────────────────────────┐
│         DATABASE                         │
│   Google Sheets (12 tabelas)            │
└──────────────────────────────────────────┘
```

---

## 📦 BACKEND - Estrutura Completa

### 🔴 src/00-core/ (NÚCLEO - NÃO MEXER)

```
src/00-core/
├── 00_config.gs (327 linhas)
│   └── Configurações centralizadas do sistema
│       ├── getAppConfig()
│       ├── getExistingTables()
│       └── getTableConfig(tableName)
│
├── database_manager.gs (3.688 linhas) ⭐ CORAÇÃO DO SISTEMA
│   ├── CRUD Completo
│   │   ├── insert(tableName, data)
│   │   ├── query(tableName, filters, options)
│   │   ├── update(tableName, id, data)
│   │   └── delete(tableName, id)
│   ├── Cache Multi-Camada
│   ├── Logger Integrado (anti-recursão)
│   ├── ValidationEngine (FK + business rules)
│   └── Transaction Support
│
├── data_dictionary.gs (1.863 linhas) ⭐ FONTE DA VERDADE
│   └── Schema de 12 tabelas
│       ├── usuarios (8 campos)
│       ├── atividades (15+ campos)
│       ├── membros (12 campos)
│       ├── participacao (11 campos) - Sistema de Alvos
│       ├── sessoes (8 campos)
│       ├── categorias_atividades (5 campos)
│       ├── menu (7 campos)
│       ├── planilhas (5 campos)
│       ├── system_logs (10 campos)
│       ├── performance_logs (13 campos)
│       └── [2 tabelas planejadas]
│
├── performance_monitor.gs (775 linhas)
│   ├── start(operationName)
│   ├── end(operationName)
│   ├── getMetrics()
│   └── getAdvancedReport()
│
├── session_manager.gs (509 linhas)
│   ├── createSession(userId, deviceInfo)
│   ├── validateSession(sessionId)
│   ├── destroySession(sessionId)
│   ├── cleanupExpiredSessions()
│   └── getSessionStats()
│
└── utils.gs (199 linhas)
    ├── getPlanilhas_()
    ├── readTableByNome_(nome)
    ├── generateSequentialId_(prefix)
    └── Funções auxiliares gerais
```

---

### 🟢 src/01-business/ (LÓGICA DE NEGÓCIO)

```
src/01-business/
├── activities.gs (533 linhas)
│   ├── APIs Principais
│   │   ├── listActivitiesApi(filters)
│   │   ├── createActivity(activityData, creatorUid)
│   │   ├── getActivityById(activityId)
│   │   ├── updateActivity(activityData)
│   │   └── completeActivity(activityId)
│   └── CRUD completo de atividades
│
├── activities_categories.gs (136 linhas)
│   ├── listCategoriasAtividadesApi()
│   ├── createCategory(categoryData)
│   ├── updateCategory(categoryId, data)
│   └── Gestão de categorias
│
├── auth.gs (235 linhas)
│   ├── authenticateUser(login, password)
│   ├── getCurrentUser()
│   ├── loginUser(credentials)
│   ├── logoutUser(sessionId)
│   └── Sistema de autenticação SHA-256
│
├── members.gs (280 linhas)
│   ├── listMembersApi(filters)
│   ├── searchMembersByCriteria(criteria)
│   ├── createMember(memberData)
│   ├── updateMember(memberId, data)
│   └── Sistema de tags + gestão completa
│
├── menu.gs (45 linhas)
│   ├── getMenuItems()
│   ├── buildMenu(userType)
│   └── Menu dinâmico por permissões
│
└── participacoes.gs (1.222 linhas) ⭐ SISTEMA DE ALVOS
    ├── APIs Principais
    │   ├── listParticipacoes(activityId)
    │   ├── saveParticipacaoDirectly(data)
    │   ├── defineTargets(activityId, memberIds)
    │   └── updatePresence(participacaoId, status)
    └── Sistema completo de participação
        ├── Alvos (tipo='alvo')
        ├── Extras (tipo='extra')
        └── Estatísticas de presença
```

---

### 🔵 src/02-api/ (PONTOS DE ENTRADA)

```
src/02-api/
├── main_migrated.gs (11 linhas) ✅ ATIVO
│   ├── doGet(e) - Ponto de entrada web
│   └── include(filename) - Sistema de includes
│
└── usuarios_api.gs (833 linhas)
    ├── listUsuariosApi()
    ├── createActivity(activityData, creatorUid)
    ├── updateActivityWithTargets(activityData)
    ├── getCurrentLoggedUser()
    └── APIs de usuários e atividades
```

**Total Backend:** 10.141 linhas em 15 arquivos

---

## 🎨 FRONTEND - App Monolítico

### app_migrated.html (7.399 linhas)

```
app_migrated.html
├── [LINHAS 1-150] CSS (Design System)
│   ├── Variáveis CSS (cores, espaçamentos)
│   ├── Estilos base
│   ├── Componentes (cards, buttons, forms)
│   └── Responsive design
│
├── [LINHAS 151-2.500] HTML (Interface Completa)
│   ├── Login Screen
│   ├── Header + User Menu
│   ├── Navigation Tabs
│   ├── Dashboard Page
│   ├── Activities Page
│   │   ├── Lista de atividades
│   │   ├── Modal nova atividade
│   │   └── Modal de alvos (lista dupla)
│   ├── Members Page
│   ├── Modals
│   │   ├── Activity modal
│   │   ├── Participants modal
│   │   ├── Targets modal (Sistema de Alvos)
│   │   └── Filter modal
│   └── Empty States
│
└── [LINHAS 2.501-7.399] JavaScript (97 funções)
    ├── Autenticação (7 funções)
    │   ├── checkAuthAndInit()
    │   ├── showLogin() / hideLogin()
    │   ├── logout()
    │   └── Session management
    │
    ├── Navegação (4 funções)
    │   ├── showTab(tabName)
    │   ├── initApp()
    │   └── Router básico
    │
    ├── Atividades (20+ funções)
    │   ├── loadActivities()
    │   ├── renderActivities(activities)
    │   ├── openActivityModal(mode, activityId)
    │   ├── saveActivity()
    │   ├── completeActivity(activityId)
    │   └── Filtros e busca
    │
    ├── Sistema de Alvos (10+ funções) ⭐
    │   ├── toggleTargetsSection()
    │   ├── searchMembers(criteria)
    │   ├── renderTargetsList(members)
    │   ├── toggleTargetSelection(memberId)
    │   ├── saveTargetsDirectly()
    │   └── Lista dupla (disponíveis + selecionados)
    │
    ├── Membros (15+ funções)
    │   ├── loadMembers()
    │   ├── renderMembers(members)
    │   ├── searchMembers()
    │   └── Gestão completa
    │
    ├── Participações (15+ funções)
    │   ├── openParticipantsModal(activityId)
    │   ├── loadParticipants(activityId)
    │   ├── togglePresence(participacaoId)
    │   ├── saveParticipacao()
    │   └── Controle de presença
    │
    ├── Filtros e Busca (8 funções)
    │   ├── openFilterModal()
    │   ├── applyFilters(filters)
    │   ├── clearFilters()
    │   └── Filtros avançados
    │
    └── UI e Utilitários (15+ funções)
        ├── showToast(message, type)
        ├── showLoading() / hideLoading()
        ├── createModal(content)
        ├── closeModal()
        └── Helpers de interface
```

**Total Frontend:** 7.399 linhas em 1 arquivo

---

## 🗄️ DATABASE - 12 Tabelas

### Tabelas Core (5 principais)

```
1. usuarios (9 campos)
   PK: uid (gerado - padrão U001)
   ├── login (único, max 50 chars)
   ├── pin (4+ dígitos, criptografado)
   ├── nome (requerido, max 100 chars)
   ├── status (Ativo/Inativo, default: Ativo)
   ├── criado_em (datetime, auto)
   ├── atualizado_em (datetime, opcional)
   ├── ultimo_acesso (datetime, opcional)
   └── deleted (soft delete: '' ou 'x')

2. atividades (campos conforme planilha)
   PK: id (padrão ACT-XXXX)
   ├── titulo (requerido)
   ├── descricao (opcional)
   ├── categorias (array/JSON)
   ├── data, hora (datetime)
   ├── local (opcional)
   ├── atribuido_uid (FK → usuarios.uid)
   ├── status (default: Pendente)
   ├── tags (opcional)
   ├── criado_em, atualizado_em (auto)
   └── deleted (soft delete: '' ou 'x')

3. membros (20+ campos)
   PK: codigo_sequencial (1, 2, 3... gerado)
   ├── codigo_mestre (opcional)
   ├── nome (requerido, max 100)
   ├── status (Ativo/Licença/Afastado/Graduado/Transferido/Desligado)
   ├── dojo (max 100, opcional)
   ├── categoria_grupo (opcional)
   ├── faixa_etaria (opcional)
   ├── cpf (opcional)
   ├── rg (opcional)
   ├── data_nascimento (date, opcional)
   ├── telefone (opcional)
   ├── email (opcional)
   ├── endereco_completo (opcional)
   ├── tags (opcional)
   ├── observacoes (text longo, opcional)
   ├── Datas: desligamento, transferencia_saida/entrada, afastado, licenca
   └── deleted (soft delete: '' ou 'x')

4. participacoes (12 campos) ⭐ CRÍTICA PARA SISTEMA DE ALVOS
   PK: id (PART-0001)
   ├── FK: id_atividade → atividades.id
   ├── FK: id_membro → membros.codigo_sequencial
   ├── tipo ('alvo' ou 'extra')
   ├── confirmou ('sim'/'nao', opcional)
   ├── confirmado_em (datetime, opcional)
   ├── participou ('sim'/'nao', opcional)
   ├── chegou_tarde ('sim'/'nao', opcional)
   ├── saiu_cedo ('sim'/'nao', opcional)
   ├── status_participacao (enum: Confirmado/Rejeitado/Presente/Ausente/Justificado)
   ├── justificativa (text, opcional)
   ├── observacoes (text, opcional)
   ├── marcado_em (datetime, opcional)
   ├── marcado_por (FK → usuarios.uid, opcional)
   └── deleted (soft delete: '' ou 'x')

5. sessoes (10 campos)
   PK: id (SES-001)
   ├── session_id (único: sess_timestamp_random)
   ├── FK: id_usuario → usuarios.uid
   ├── device_info (JSON, opcional)
   ├── ip_address (opcional)
   ├── criado_em (datetime, auto)
   ├── expira_em (datetime, requerido)
   ├── ultima_atividade (datetime, opcional)
   ├── ativo ('sim'/'nao')
   ├── destruido_em (datetime, opcional)
   └── deleted (soft delete: '' ou 'x')
```

### Tabelas Auxiliares (5 tabelas)

```
6. categorias_atividades (7 campos)
   PK: id (CAT-001)
   ├── nome (requerido, max 100)
   ├── descricao (opcional)
   ├── cor (hex, opcional)
   ├── icone (opcional)
   ├── status (Ativo/Inativo, default: Ativo)
   ├── criado_em (datetime, auto)
   └── deleted (soft delete: '' ou 'x')

7. menu (9 campos)
   PK: id (MENU-001)
   ├── titulo (requerido, max 50)
   ├── icone (opcional)
   ├── ordem (número, default: 999)
   ├── acao (route/function/external)
   ├── destino (URL ou função)
   ├── permissoes (array/JSON, opcional)
   ├── status (Ativo/Inativo, default: Ativo)
   ├── criado_em (datetime, auto)
   └── deleted (soft delete: '' ou 'x')

8. planilhas (6 campos) - Metadata
   PK: nome (nome da tabela)
   ├── ssid (spreadsheet ID, requerido)
   ├── aba (sheet name, requerido)
   ├── a1_range (range, default: A1:Z)
   ├── descricao (opcional)
   └── deleted (soft delete: '' ou 'x')

9. performance_logs (17 campos)
   PK: id (PERF-timestamp-random)
   ├── operation_name (requerido)
   ├── operation_type (query/insert/update/delete)
   ├── start_time, end_time, duration_ms (métricas)
   ├── cache_hit ('sim'/'nao')
   ├── cache_key (opcional)
   ├── query_params (JSON, opcional)
   ├── result_count (número)
   ├── memory_used (bytes)
   ├── id_usuario (FK → usuarios.uid, opcional)
   ├── session_id (FK → sessoes.session_id, opcional)
   ├── error_message (text, opcional)
   ├── stack_trace (text, opcional)
   ├── criado_em (datetime, auto)
   └── deleted (soft delete: '' ou 'x')

10. system_logs (11 campos)
    PK: id (LOG-timestamp-random)
    ├── level (DEBUG/INFO/WARN/ERROR)
    ├── context (módulo/funcionalidade)
    ├── message (requerido)
    ├── data (JSON, opcional)
    ├── id_usuario (FK → usuarios.uid, opcional)
    ├── session_id (FK → sessoes.session_id, opcional)
    ├── stack_trace (text, para erros)
    ├── user_agent (opcional)
    ├── criado_em (datetime, auto)
    └── deleted (soft delete: '' ou 'x')
```

### Tabelas Planejadas (3 tabelas)

```
11. notificacoes (planejado)
    ├── Sistema de notificações
    └── Estrutura a definir

12. preferencias (planejado)
    ├── Preferências por usuário
    └── Estrutura a definir

13. historico (10+ campos planejado)
    PK: id (HIS-001)
    ├── FK: id_usuario → usuarios.uid
    ├── acao (CREATE/UPDATE/DELETE/LOGIN/LOGOUT/VIEW)
    ├── tabela_alvo (nome da tabela)
    ├── id_alvo (ID do registro)
    ├── detalhes (JSON com mudanças)
    ├── user_agent (opcional)
    ├── criado_em (datetime, auto)
    └── deleted (soft delete: '' ou 'x')
```

### Relacionamentos

```
usuarios (1) ──→ (N) sessoes
usuarios (1) ──→ (N) atividades (como criador)
atividades (1) ──→ (N) participacao
membros (1) ──→ (N) participacao ⭐ SISTEMA DE ALVOS
categorias_atividades (1) ──→ (N) atividades
```

---

## 🔄 FLUXOS DE DADOS PRINCIPAIS

### 1. Login do Usuário

```
Frontend: handleLogin() → Valida campos
    ↓
google.script.run.authenticateUser(usuario, password)
    ↓
Backend: auth.gs → Valida → session_manager.gs → createSession()
    ↓
database_manager.gs → insert('sessoes', sessionData)
    ↓
Retorno: { success: true, sessionId, uid, nome }
    ↓
Frontend: localStorage + showApp() → Remove login, mostra dashboard
```

---

### 2. Sistema de Alvos (Definir Quem Convidar) ⭐

```
Frontend: toggleTargetsSection(mode, activityId)
    ├── Mostra seção inline com filtros e duas listas
    └── Inicializa selectedTargets = new Set()
    ↓
searchMembers(mode) → Aplica filtros
    ↓
google.script.run.searchMembersByCriteria(filters)
    ↓
Backend: members.gs → Query filtrada na tabela membros
    ↓
Frontend: Renderiza listas duplas (disponíveis + selecionados)
    ├── Cache: window.allMembersCache.set(codigo, membro)
    └── toggleTargetSelection() move cards entre listas
    ↓
submitActivity() ou updateActivity()
    ├── Salva atividade primeiro
    └── saveTargetsAfterActivity() se tem alvos
        ↓
        google.script.run.defineTargets(activityId, memberIds, uid)
        ↓
        Backend: participacoes.gs → Valida + batch insert tipo='alvo'
        ↓
        Retorno: { ok: true, created: X }
    ↓
Frontend: Toast + limpa caches + recarrega lista
```

---

### 3. Controlar Presença em Atividade ⭐

```
Frontend: openParticipantsModal(activityId)
    ├── Cria modal HTML dedicado
    └── loadActivityForParticipants()
        ↓
        google.script.run.listParticipacoes(activityId)
        ↓
        Backend: participacoes.gs → Query com JOINs
            ├── participacao + membros + atividades
            └── Filtra: id_atividade e deleted != 'x'
        ↓
        Retorno: Array com dados completos de cada participação
    ↓
Frontend: renderParticipantsList()
    ├── Agrupa por tipo (alvos vs extras)
    ├── Cards com checkboxes de presença
    └── togglePresence() atualiza local
    ↓
saveParticipants(activityId)
    ├── Para cada modificação:
    │   └── google.script.run.saveParticipacaoDirectly(activityId, memberId, dados, uid)
    ↓
Backend: participacoes.gs → update() com status consolidado
    ↓
Frontend: Toast + fecha modal + recarrega lista
```

---

### 4. Criar Nova Atividade ⭐

```
Frontend: openActivityModal()
    ├── createActivityModal() → Gera HTML
    ├── loadActivityModalData() → Popula selects (categorias, usuários)
    └── Focus no primeiro campo
    ↓
Usuário: Preenche formulário + (Opcional) Define alvos via Fluxo 2
    ↓
submitActivity(event)
    ├── Valida campos obrigatórios
    ├── showCreateActivityLoading(true)
    └── google.script.run.createActivity(formData, uid)
        ↓
        Backend: activities.gs → Gera ID + metadata
            └── DatabaseManager.insert('atividades', data)
        ↓
        Retorno: { ok: true, id: 'ACT-XXX' }
    ↓
Frontend: Se tem alvos → saveTargetsAfterActivity(id)
    └── Senão → Toast + fecha modal + recarrega
```

---

## 📍 ONDE ENCONTRAR COISAS

### Tabela de Referência Rápida

| Preciso de... | Está em... | Arquivo/Função |
|---------------|-----------|----------------|
| **BACKEND** |
| Login usuário | auth.gs | loginUser() |
| Autenticar (API) | usuarios_api.gs | authenticateUser() ⭐ |
| Listar atividades | activities.gs | listActivitiesApi() |
| Criar atividade | usuarios_api.gs ⚠️ | createActivity() ⭐ |
| Atualizar atividade | usuarios_api.gs ⚠️ | updateActivity() ⭐ |
| Completar atividade | usuarios_api.gs ⚠️ | completeActivity() ⭐ |
| Buscar membros (alvos) | participacoes.gs ⚠️ | searchMembersByCriteria() ⭐ |
| Listar membros | members.gs | listMembersApi() |
| Definir alvos | participacoes.gs | defineTargets() |
| Listar participações | participacoes.gs | listParticipacoes() |
| Salvar presença | participacoes.gs | saveParticipacaoDirectly() |
| Adicionar campo BD | data_dictionary.gs | Seção da tabela |
| CRUD genérico | database_manager.gs | insert/query/update/delete |
| Criar sessão | session_manager.gs | createSession() |
| Validar sessão | session_manager.gs | validateSession() |
| Listar categorias | activities_categories.gs | listCategoriasAtividadesApi() |
| **FRONTEND** |
| Tela de login | app_migrated.html | showLogin() |
| Autenticação | app_migrated.html | checkAuthAndInit() |
| Navegação | app_migrated.html | showTab() |
| Lista atividades | app_migrated.html | loadActivities() |
| Modal nova atividade | app_migrated.html | openActivityModal() |
| Submit nova atividade | app_migrated.html | submitActivity() |
| Modal editar atividade | app_migrated.html | openEditActivityModal() |
| Update atividade (FE) | app_migrated.html | updateActivity() |
| Sistema de alvos | app_migrated.html | toggleTargetsSection() |
| Buscar membros (FE) | app_migrated.html | searchMembers() |
| Selecionar alvo | app_migrated.html | toggleTargetSelection() |
| Salvar alvos após criar | app_migrated.html | saveTargetsAfterActivity() |
| Modal participantes | app_migrated.html | openParticipantsModal() |
| Carregar participantes | app_migrated.html | loadActivityForParticipants() |
| Toggle presença | app_migrated.html | togglePresence() |
| Salvar participações | app_migrated.html | saveParticipants() |
| Lista membros | app_migrated.html | loadMembers() |
| Estilos CSS | app_migrated.html | Linhas 1-150 |
| Toast messages | app_migrated.html | showToast() |
| Loading states | app_migrated.html | show*Loading() |

**Legenda:**
- ⭐ = Função usada pelo frontend (existe versão duplicada em outro arquivo)
- ⚠️ = Função existe em múltiplos lugares (indicado qual o frontend usa)
- (FE) = Função frontend que chama backend com mesmo nome

### 📝 Notas sobre Duplicações

**Funções que existem em múltiplos arquivos:**

1. **createActivity()**
   - `activities.gs` → Versão antiga/helper (~50 linhas) - NÃO USADA
   - `usuarios_api.gs` → Versão completa usada pelo frontend (~200 linhas) ⭐

2. **updateActivity()**
   - `activities.gs` → Helper core (~100 linhas)
   - `usuarios_api.gs` → API usada pelo frontend ⭐

3. **completeActivity()**
   - `activities.gs` → Helper core (~50 linhas)
   - `usuarios_api.gs` → API usada pelo frontend ⭐

4. **authenticateUser()**
   - `auth.gs` → Helper interno
   - `usuarios_api.gs` → API usada pelo frontend ⭐

5. **searchMembersByCriteria()**
   - Localização: `participacoes.gs` (não está em `members.gs`)
   - Usado para buscar membros no sistema de alvos

6. **listCategoriasAtividadesApi()**
   - `activities_categories.gs` → Versão principal
   - `usuarios_api.gs` → Versão duplicada (ambas funcionam)

---

## 🎯 MÉTRICAS DO CÓDIGO

### Distribuição de Linhas

```
Backend:        10.141 linhas (42%)
Frontend:        7.399 linhas (31%)
  ├── CSS:         143 linhas (1%)
  ├── HTML:      2.225 linhas (9%)
  └── JavaScript: 5.020 linhas (21%)
──────────────────────────────────
Total Ativo:    17.540 linhas
```

### Arquivos por Camada

```
Core (00-core):           6 arquivos
Business (01-business):   6 arquivos
API (02-api):             2 arquivos
Frontend:                 1 arquivo
─────────────────────────────────
Total:                   15 arquivos
```

### Complexidade por Arquivo

```
Mais complexos:
1. database_manager.gs      3.688 linhas
2. data_dictionary.gs       1.863 linhas
3. participacoes.gs         1.222 linhas
4. usuarios_api.gs            833 linhas
5. performance_monitor.gs     775 linhas
```

---

## 🔍 BUSCA RÁPIDA POR FUNCIONALIDADE

**Autenticação:**
- Backend: `auth.gs` + `session_manager.gs`
- Frontend: `checkAuthAndInit()`, `showLogin()`

**Atividades:**
- Backend: `activities.gs`
- Frontend: `loadActivities()`, `submitActivity()`, `updateActivity()`
- Database: Tabela `atividades`

**Membros:**
- Backend: `members.gs`
- Frontend: `loadMembers()`, `searchMembers()`
- Database: Tabela `membros`

**Sistema de Alvos:**
- Backend: `participacoes.gs` → `defineTargets()`
- Frontend: `toggleTargetsSection()`, `toggleTargetSelection()`
- Database: Tabela `participacao` (tipo='alvo')

**Participação/Presença:**
- Backend: `participacoes.gs` → `listParticipacoes()`, `saveParticipacaoDirectly()`
- Frontend: `openParticipantsModal()`, `togglePresence()`
- Database: Tabela `participacao`

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- **[GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)** - Como fazer tarefas (workflows)
- **[TAREFAS.md](TAREFAS.md)** - O que fazer agora (roadmap)
- **[CLAUDE_INSTRUCOES.md](CLAUDE_INSTRUCOES.md)** - Regras do código
- **[README.md](README.md)** - Visão geral do projeto

---

**🗺️ Este mapa é atualizado quando a estrutura do projeto muda significativamente.**