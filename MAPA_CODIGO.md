# 🗺️ MAPA DO CÓDIGO - Sistema Dojotai

**Última atualização:** 18/10/2025 | **Versão:** 2.0.0-modular

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

**"Onde está X?"** - Este documento responde essa pergunta.

Mapa visual e detalhado de todos os arquivos, funções e estruturas do projeto após a **modularização completa**.

---

## 📊 VISÃO GERAL - ARQUITETURA MODULAR

```
┌────────────────────────────────────────────────────┐
│         FRONTEND (45 arquivos modulares)           │
│   index.html + 44 componentes especializados      │
│   HTML + CSS + JavaScript componentizado          │
└────────────────────────────────────────────────────┘
              ⬇️ google.script.run
┌────────────────────────────────────────────────────┐
│         BACKEND (15 arquivos)                      │
│   src/00-core/ + src/01-business/                 │
│   Google Apps Script (10.141 linhas)              │
└────────────────────────────────────────────────────┘
              ⬇️ DatabaseManager
┌────────────────────────────────────────────────────┐
│         DATABASE                                   │
│   Google Sheets (12 tabelas)                      │
└────────────────────────────────────────────────────┘
```

---

## 🎨 FRONTEND - Estrutura Modular (45 arquivos)

### 📄 index.html (51 linhas) - Ponto de Entrada

```html
index.html
├── Includes ordenados por responsabilidade:
│   ├── Core (6 arquivos)
│   ├── Utils (3 arquivos)
│   ├── UI Components (4 arquivos)
│   ├── Components específicos (2 arquivos)
│   ├── Layout (2 arquivos)
│   └── Views (6 arquivos)
└── TOTAL: 44 arquivos incluídos
```

---

### 🔴 src/05-components/core/ - Sistema Base (6 arquivos)

```
src/05-components/core/
├── styles.html (~500 linhas)
│   └── Design System completo
│       ├── Variáveis CSS (cores, espaçamentos, fontes)
│       ├── Reset e estilos base
│       ├── Componentes (cards, buttons, forms, badges)
│       ├── Layout (grid, flex, containers)
│       ├── Modais e overlays
│       ├── Responsive design
│       └── Dark mode support
│
├── state.html (~50 linhas)
│   └── Gerenciamento de estado global
│       ├── State.get(key)
│       ├── State.set(key, value)
│       ├── State.clear()
│       └── Cache de dados (categorias, responsáveis)
│
├── auth.html (~504 linhas) ⭐ AUTENTICAÇÃO
│   ├── Funções principais:
│   │   ├── checkAuthAndInit()
│   │   ├── showLogin() - Tela de login completa
│   │   ├── doLogin(event) - Processa login
│   │   ├── showLoginError(message)
│   │   ├── showApp() - Mostra aplicação após login
│   │   ├── logout() - Async, destroi sessão no servidor
│   │   ├── showLogoutLoading(show) - Overlay de loading
│   │   └── handleSessionExpired() - Modal de sessão expirada
│   └── HTML: Loading Overlay para Logout
│
├── navigation.html (~167 linhas)
│   ├── Funções principais:
│   │   ├── initNavigation() - Inicializa tabs e mobile menu
│   │   ├── navigateToPage(targetPage) - Navegação entre páginas
│   │   ├── toggleMobileMenu()
│   │   ├── closeMobileMenu()
│   │   ├── toggleTheme() - Alterna dark/light
│   │   └── loadTheme() - Carrega tema salvo
│   └── HTML: Mobile Menu Modal
│
├── router.html (~3 linhas)
│   └── Include do app_router via HtmlService
│       └── Processa src/03-shared/app_router.html
│
├── api.html (~150 linhas)
│   └── Comunicação com backend
│       ├── apiCall(functionName, ...args) - Wrapper com sessionId
│       ├── checkSessionBeforeModal() - Valida sessão
│       └── Tratamento de erros e sessão expirada
│
└── init.html (~58 linhas) ⭐ INICIALIZAÇÃO CENTRALIZADA
    └── Sistema que garante inicialização única
        ├── Flag: window.systemInitialized
        ├── initSystem() - Chama TODAS as inicializações
        │   ├── 1. loadTheme()
        │   ├── 2. initNavigation()
        │   ├── 3. initUserMenuDropdown()
        │   └── 4. checkAuthAndInit()
        └── DOMContentLoaded listener (único no sistema!)
```

---

### 🟢 src/05-components/utils/ - Utilitários (3 arquivos)

```
src/05-components/utils/
├── dateHelpers.html (~100 linhas)
│   ├── formatDate(date, format)
│   ├── parseDate(dateString)
│   ├── isOverdue(date)
│   └── Helpers de data/hora
│
├── permissionsHelpers.html (~80 linhas)
│   ├── hasPermission(user, permission)
│   ├── canEdit(userId, resourceOwnerId)
│   └── Controle de permissões
│
└── activityHelpers.html (~120 linhas)
    ├── getStatusBadge(status)
    ├── getPriorityClass(priority)
    ├── formatActivityCard(activity)
    └── Helpers específicos de atividades
```

---

### 🔵 src/05-components/ui/ - Componentes de UI (4 arquivos)

```
src/05-components/ui/
├── toast.html (~150 linhas)
│   ├── showToast(message, type, duration)
│   ├── Types: success, error, warning, info
│   └── Auto-hide configurável
│
├── loading.html (~100 linhas)
│   ├── showLoading(message)
│   ├── hideLoading()
│   └── Overlay de loading global
│
├── emptyState.html (~80 linhas)
│   ├── renderEmptyState(message, icon)
│   └── Estados vazios para listas
│
└── selectHelpers.html (~207 linhas)
    ├── populateCategoriesSelect(selectId)
    ├── populateUsersSelect(selectId)
    ├── preLoadCachedData() - Carrega cache de categorias/responsáveis
    └── Helpers para popular selects
```

---

### 🟡 src/05-components/ - Componentes Específicos (4 arquivos)

```
src/05-components/
├── userMenuDropdown.html (~434 linhas)
│   ├── Estrutura:
│   │   ├── Estilos CSS do dropdown
│   │   ├── Template HTML
│   │   └── JavaScript de controle
│   ├── Funções:
│   │   ├── initUserMenuDropdown() - Inicializa (chamado em init.html)
│   │   ├── toggleUserMenu()
│   │   ├── openUserMenu() / closeUserMenu()
│   │   ├── loadUserMenuItems() - Carrega da planilha
│   │   ├── renderUserMenuItems(items)
│   │   ├── handleMenuItemClick(acao, destino)
│   │   └── updateDropdownUserInfo(user)
│   └── Integração com menu.gs (backend)
│
├── filters.html (~514 linhas) ⭐ SISTEMA DE FILTROS
│   ├── JavaScript:
│   │   ├── Estado: filtrosState { status, categorias, periodo, responsavel, searchText }
│   │   ├── initFiltrosSystem() - Lazy init (chamado em activities)
│   │   ├── aplicarFiltrosPadrao() - Pendente + Usuário logado
│   │   ├── abrirModalFiltros() / fecharModalFiltros()
│   │   ├── handleCheckboxChange(checkbox)
│   │   ├── aplicarFiltros()
│   │   ├── atualizarContadorFiltros()
│   │   ├── renderizarChips() - Chips de filtros ativos
│   │   ├── criarChip(nome, cor, tipo, valor)
│   │   ├── removerFiltro(tipo, valor)
│   │   ├── limparTodosFiltros()
│   │   ├── carregarCategorias(callback) - Usa cache
│   │   ├── carregarResponsaveis(callback) - Usa cache
│   │   ├── populateCategoriasOptions()
│   │   ├── populateResponsaveisOptions()
│   │   ├── filtrarAtividades() - Recarrega lista
│   │   ├── filterActivitiesByText(searchText)
│   │   ├── clearSearchText()
│   │   └── window.getFiltrosAtivos() - Exposta globalmente
│   └── HTML: Modal completo de filtros
│       ├── Backdrop
│       ├── Header
│       ├── Seções: Status, Categorias, Período, Responsável
│       └── Footer com botão Aplicar
│
├── layout.html (~150 linhas)
│   └── Estrutura HTML principal
│       ├── Login screen placeholder
│       ├── App header (logo + user menu + theme toggle)
│       ├── Navigation tabs (desktop)
│       ├── Mobile navigation
│       └── App container (páginas são inseridas aqui)
│
└── layoutClose.html (~5 linhas)
    └── Fecha tags abertas em layout.html
```

---

### 🟣 src/04-views/ - Páginas da Aplicação (6 arquivos)

```
src/04-views/
├── dashboard.html (~100 linhas)
│   └── Página inicial (estatísticas e resumo)
│
├── activities.html (~2.485 linhas) ⭐⭐⭐ MAIOR ARQUIVO
│   ├── HTML: Estrutura da página de atividades
│   ├── JavaScript: Sistema completo de atividades
│   │   ├── initActivities() - Lazy init ao entrar na página
│   │   ├── loadActivities() - Carrega lista com filtros
│   │   ├── renderActivities(activities) - Renderiza cards
│   │   ├── applyActivityFilters(activity) - Aplica filtros locais
│   │   ├── openActivityModal(mode, activityId)
│   │   ├── loadActivityModalData() - Popula selects
│   │   ├── submitActivity(event) - Cria nova atividade
│   │   ├── openEditActivityModal(activityId)
│   │   ├── updateActivity(event) - Atualiza existente
│   │   ├── completeActivity(activityId)
│   │   ├── deleteActivity(activityId)
│   │   │
│   │   ├── SISTEMA DE ALVOS (10+ funções):
│   │   │   ├── toggleTargetsSection(mode, activityId)
│   │   │   ├── searchMembers(criteria, mode)
│   │   │   ├── renderTargetsList(members, mode)
│   │   │   ├── toggleTargetSelection(memberId, mode)
│   │   │   ├── saveTargetsAfterActivity(activityId)
│   │   │   └── clearTargetsState()
│   │   │
│   │   ├── SISTEMA DE PARTICIPAÇÕES (15+ funções):
│   │   │   ├── openParticipantsModal(activityId)
│   │   │   ├── loadActivityForParticipants(activityId)
│   │   │   ├── renderParticipantsList(participants)
│   │   │   ├── togglePresence(participacaoId, field)
│   │   │   ├── saveParticipants(activityId)
│   │   │   └── closeParticipantsModal()
│   │   │
│   │   ├── CACHE E PRÉ-CARREGAMENTO:
│   │   │   ├── preLoadCachedData()
│   │   │   ├── loadCurrentUser()
│   │   │   └── window.allMembersCache (Map global)
│   │   │
│   │   └── MODAIS:
│   │       ├── Modal criar atividade (inline)
│   │       ├── Modal editar atividade (inline)
│   │       ├── Modal participantes (inline)
│   │       └── Seção de alvos (inline, lista dupla)
│   │
│   └── Integração com filters.html via window.getFiltrosAtivos()
│
├── members.html (~200 linhas)
│   ├── loadMembers(filters)
│   ├── renderMembers(members)
│   ├── openMemberModal(mode, memberId)
│   └── CRUD completo de membros
│
├── practices.html (~271 linhas)
│   ├── Sistema de práticas diárias:
│   │   ├── fixedPractices (3 práticas fixas)
│   │   ├── initPractices()
│   │   ├── selectLast7Days()
│   │   ├── renderDays() - Renderiza grid de dias
│   │   ├── renderPractice(practice, dateKey)
│   │   ├── setYesNoValue(dateKey, practiceId, value)
│   │   ├── incrementPractice(dateKey, practiceId)
│   │   ├── updateQuantity(dateKey, practiceId, newValue)
│   │   ├── getDayProgress(dateKey)
│   │   ├── openCalendar() / closeCalendar()
│   │   └── updateDaysCount()
│   └── HTML: Modal do Calendário (inline)
│
├── reports.html (~378 linhas)
│   ├── initReports()
│   ├── loadReportsData()
│   ├── renderCharts(data)
│   └── Estatísticas e gráficos
│
└── settings.html (~50 linhas)
    └── Página de configurações (futuro)
```

---

### 🔧 src/03-shared/ - Componentes Compartilhados (1 arquivo)

```
src/03-shared/
└── app_router.html (~95 linhas)
    └── Router baseado em hash
        ├── Router.start()
        ├── Router.mount(view)
        ├── Router.resolve() - Proteção de rotas
        └── Router.go(hash)
```

---

## 📊 MÉTRICAS FRONTEND - NOVA ESTRUTURA

### Distribuição de Arquivos

```
Frontend Total:          45 arquivos
├── index.html:           1 arquivo (51 linhas)
├── Core:                 6 arquivos (~1.432 linhas)
├── Utils:                3 arquivos (~300 linhas)
├── UI:                   4 arquivos (~537 linhas)
├── Components:           4 arquivos (~1.103 linhas)
├── Views:                6 arquivos (~3.484 linhas)
└── Shared:               1 arquivo (95 linhas)
──────────────────────────────────────────────
Total Frontend:      ~7.002 linhas (modular)

vs. Antes:           ~7.399 linhas (monolítico)
```

### Redução de Complexidade

```
ANTES:
✗ app_migrated.html - 8.298 linhas monolíticas
✗ Difícil manutenção
✗ Inicializações duplicadas
✗ Código acoplado

DEPOIS:
✓ 45 arquivos modulares
✓ Média de 156 linhas por arquivo
✓ Separação de responsabilidades clara
✓ Inicialização centralizada (init.html)
✓ Componentes reutilizáveis
✓ Código desacoplado
```

---

## 📦 BACKEND - Estrutura Completa (Mantida)

### 🔴 src/00-core/ (NÚCLEO - 6 arquivos)

```
src/00-core/
├── 00_config.gs (327 linhas)
│   └── Configurações centralizadas
│
├── database_manager.gs (3.688 linhas) ⭐
│   ├── CRUD Completo
│   ├── Cache Multi-Camada
│   ├── Logger Integrado
│   ├── ValidationEngine
│   └── Transaction Support
│
├── data_dictionary.gs (1.863 linhas) ⭐
│   └── Schema de 12 tabelas
│
├── performance_monitor.gs (775 linhas)
│   └── Métricas de performance
│
├── session_manager.gs (509 linhas)
│   └── Gestão de sessões
│
└── utils.gs (199 linhas)
    └── Funções auxiliares gerais
```

---

### 🟢 src/01-business/ (LÓGICA DE NEGÓCIO - 6 arquivos)

```
src/01-business/
├── activities.gs (533 linhas)
│   └── CRUD de atividades
│
├── activities_categories.gs (136 linhas)
│   └── Gestão de categorias
│
├── auth.gs (235 linhas)
│   └── Autenticação SHA-256
│
├── members.gs (280 linhas)
│   └── Gestão de membros
│
├── menu.gs (45 linhas)
│   └── Menu dinâmico
│
└── participacoes.gs (1.222 linhas) ⭐
    └── Sistema de alvos e participações
```

---

### 🔵 src/02-api/ (PONTOS DE ENTRADA - 2 arquivos)

```
src/02-api/
├── main.gs (11 linhas) ✅ ATIVO
│   ├── doGet(e) - Ponto de entrada web
│   └── include(filename) - Sistema de includes
│
└── usuarios_api.gs (833 linhas)
    └── APIs de usuários e atividades
```

**Total Backend:** 10.141 linhas em 15 arquivos (inalterado)

---

## 🗄️ DATABASE - 12 Tabelas (Inalterado)

### Tabelas Core (5 principais)

```
1. usuarios (9 campos)
   PK: uid (U001, U002...)

2. atividades (15+ campos)
   PK: id (ACT-0001, ACT-0002...)
   FK: atribuido_uid → usuarios.uid

3. membros (20+ campos)
   PK: codigo_sequencial (1, 2, 3...)

4. participacoes (12 campos) ⭐ SISTEMA DE ALVOS
   PK: id (PART-0001...)
   FK: id_atividade → atividades.id
   FK: id_membro → membros.codigo_sequencial
   Tipo: 'alvo' ou 'extra'

5. sessoes (10 campos)
   PK: id (SES-001...)
   FK: id_usuario → usuarios.uid
```

### Tabelas Auxiliares (7 tabelas)

```
6. categorias_atividades
7. menu
8. planilhas
9. performance_logs
10. system_logs
11. notificacoes (planejado)
12. preferencias (planejado)
```

---

## 🔄 FLUXO DE INICIALIZAÇÃO (NOVO!)

### Sequência de Carregamento

```
1. index.html carregado
   ↓
2. Includes processados em ordem:
   ├── styles.html (CSS)
   ├── state.html (Estado global)
   ├── auth.html (Autenticação)
   ├── navigation.html (Navegação)
   ├── router.html (Roteamento)
   ├── api.html (Comunicação)
   ├── init.html ⭐ INICIALIZAÇÃO
   ├── ... (utils, ui, components)
   ├── ... (views)
   └── layoutClose.html
   ↓
3. init.html executa (UMA ÚNICA VEZ):
   ├── loadTheme() - Carrega tema salvo
   ├── initNavigation() - Inicializa navegação
   ├── initUserMenuDropdown() - Inicializa menu
   └── checkAuthAndInit() - Verifica sessão
       ↓
       ├── SE logado → showApp()
       │   ├── Mostra interface
       │   ├── loadCurrentUser()
       │   └── preLoadCachedData()
       │
       └── SE não logado → showLogin()
           └── Mostra tela de login
   ↓
4. Lazy Initialization (ao navegar):
   ├── initActivities() - Ao abrir Atividades
   │   └── initFiltrosSystem() - Primeira vez
   ├── initPractices() - Ao abrir Práticas
   └── initReports() - Ao abrir Relatórios
```

---

## 🔄 FLUXOS DE DADOS PRINCIPAIS

### 1. Login do Usuário

```
Frontend: doLogin() (auth.html)
    ↓
google.script.run.authenticateUser(usuario, password)
    ↓
Backend: auth.gs → Valida → session_manager.gs → createSession()
    ↓
database_manager.gs → insert('sessoes', sessionData)
    ↓
Retorno: { success: true, sessionId, uid, nome }
    ↓
Frontend: localStorage + showApp() → Mostra dashboard
```

---

### 2. Sistema de Filtros (NOVO FLUXO!)

```
Frontend: Navega para Atividades
    ↓
initActivities() (activities.html)
    ├── Inicializa filtros (primeira vez)
    │   └── initFiltrosSystem() (filters.html)
    │       ├── Event listeners
    │       └── aplicarFiltrosPadrao()
    │           ├── Status: Pendente ✓
    │           └── Responsável: Usuário logado ✓
    ↓
loadActivities()
    ├── Pega filtros: window.getFiltrosAtivos()
    └── google.script.run.listActivitiesApi(filtrosState)
        ↓
        Backend: activities.gs → Query filtrada
        ↓
        Retorno: { ok: true, items: [...] }
    ↓
applyActivityFilters() - Filtros locais adicionais
    ├── Busca por texto (searchText)
    └── Filtros de período (atrasadas, hoje, etc.)
    ↓
renderActivities() - Renderiza cards
```

**Abrir Modal de Filtros:**
```
abrirModalFiltros() (filters.html)
    ├── Modal style.display = 'block'
    ├── carregarCategorias() - Usa window.cachedCategorias
    ├── carregarResponsaveis() - Usa window.cachedResponsaveis
    └── sincronizarCheckboxesComEstado()
    ↓
Usuário marca/desmarca checkboxes
    ↓
handleCheckboxChange() - Atualiza filtrosState
    ↓
aplicarFiltros()
    ├── fecharModalFiltros()
    ├── renderizarChips() - Mostra chips ativos
    └── filtrarAtividades() → loadActivities()
```

---

### 3. Sistema de Alvos (Mantido)

```
Frontend: toggleTargetsSection(mode, activityId) (activities.html)
    ├── Mostra seção inline com filtros e duas listas
    └── Inicializa selectedTargets = new Set()
    ↓
searchMembers(mode) → Aplica filtros
    ↓
google.script.run.searchMembersByCriteria(filters)
    ↓
Backend: members.gs → Query filtrada
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
        Backend: participacoes.gs → Batch insert tipo='alvo'
    ↓
Toast + limpa caches + recarrega lista
```

---

## 📍 ONDE ENCONTRAR COISAS (ATUALIZADO)

### Tabela de Referência Rápida

| Preciso de... | Está em... | Arquivo/Função |
|---------------|-----------|----------------|
| **FRONTEND - CORE** |
| Inicialização do sistema | src/05-components/core/init.html | initSystem() ⭐ |
| Tela de login | src/05-components/core/auth.html | showLogin() |
| Autenticação | src/05-components/core/auth.html | checkAuthAndInit() |
| Logout | src/05-components/core/auth.html | logout() |
| Sessão expirada | src/05-components/core/auth.html | handleSessionExpired() |
| Navegação entre páginas | src/05-components/core/navigation.html | navigateToPage() |
| Menu mobile | src/05-components/core/navigation.html | toggleMobileMenu() |
| Tema dark/light | src/05-components/core/navigation.html | toggleTheme() |
| Comunicação com backend | src/05-components/core/api.html | apiCall() |
| Router | src/05-components/core/router.html | Processa app_router.html |
| **FRONTEND - UI** |
| Toast messages | src/05-components/ui/toast.html | showToast() |
| Loading overlay | src/05-components/ui/loading.html | showLoading() |
| Empty states | src/05-components/ui/emptyState.html | renderEmptyState() |
| Popular selects | src/05-components/ui/selectHelpers.html | populate*Select() |
| **FRONTEND - COMPONENTS** |
| Menu dropdown usuário | src/05-components/userMenuDropdown.html | initUserMenuDropdown() |
| Sistema de filtros | src/05-components/filters.html | initFiltrosSystem() ⭐ |
| Aplicar filtros padrão | src/05-components/filters.html | aplicarFiltrosPadrao() |
| Modal de filtros | src/05-components/filters.html | abrirModalFiltros() |
| Chips de filtros | src/05-components/filters.html | renderizarChips() |
| Obter filtros ativos | src/05-components/filters.html | window.getFiltrosAtivos() |
| Layout principal | src/05-components/layout.html | Estrutura HTML |
| **FRONTEND - VIEWS** |
| Dashboard | src/04-views/dashboard.html | -- |
| Atividades | src/04-views/activities.html | initActivities() ⭐ |
| Lista atividades | src/04-views/activities.html | loadActivities() |
| Nova atividade | src/04-views/activities.html | submitActivity() |
| Editar atividade | src/04-views/activities.html | updateActivity() |
| Sistema de alvos | src/04-views/activities.html | toggleTargetsSection() |
| Modal participantes | src/04-views/activities.html | openParticipantsModal() |
| Membros | src/04-views/members.html | loadMembers() |
| Práticas | src/04-views/practices.html | initPractices() |
| Modal calendário | src/04-views/practices.html | openCalendar() |
| Relatórios | src/04-views/reports.html | initReports() |
| **BACKEND** |
| Login API | usuarios_api.gs | authenticateUser() |
| Listar atividades | activities.gs | listActivitiesApi() |
| Criar atividade | usuarios_api.gs | createActivity() |
| Listar categorias | activities_categories.gs | listCategoriasAtividadesApi() |
| Listar usuários | usuarios_api.gs | listUsuariosApi() |
| Definir alvos | participacoes.gs | defineTargets() |
| Listar participações | participacoes.gs | listParticipacoes() |
| CRUD genérico | database_manager.gs | insert/query/update/delete |
| Criar sessão | session_manager.gs | createSession() |
| Validar sessão | session_manager.gs | validateSession() |

**Legenda:**
- ⭐ = Função crítica do sistema
- (NOVO) = Adicionado na modularização

---

## 🎯 BENEFÍCIOS DA MODULARIZAÇÃO

### Antes vs Depois

| Aspecto | ANTES (Monolítico) | DEPOIS (Modular) |
|---------|-------------------|------------------|
| **Arquivos** | 1 arquivo (8.298 linhas) | 45 arquivos (~156 linhas/média) |
| **Manutenibilidade** | ❌ Difícil localizar código | ✅ Separação clara de responsabilidades |
| **Duplicações** | ❌ 3+ inicializações duplicadas | ✅ Inicialização centralizada (init.html) |
| **Carregamento** | ❌ Tudo carregava duplicado | ✅ Carregamento único garantido |
| **Escalabilidade** | ❌ Adicionar features complexo | ✅ Fácil adicionar componentes |
| **Colaboração** | ❌ Conflitos de merge frequentes | ✅ Múltiplos devs podem trabalhar juntos |
| **Testes** | ❌ Difícil isolar componentes | ✅ Componentes testáveis isoladamente |
| **Reutilização** | ❌ Código acoplado | ✅ Componentes reutilizáveis |
| **Performance** | ❌ Carregamento pesado | ✅ Lazy initialization de views |

---

## 🔍 BUSCA RÁPIDA POR FUNCIONALIDADE

**Autenticação:**
- Backend: `auth.gs` + `session_manager.gs`
- Frontend: `src/05-components/core/auth.html`

**Navegação:**
- Frontend: `src/05-components/core/navigation.html`
- Router: `src/05-components/core/router.html` → `src/03-shared/app_router.html`

**Inicialização:**
- Frontend: `src/05-components/core/init.html` ⭐ (CENTRALIZADO)

**Filtros:**
- Frontend: `src/05-components/filters.html` ⭐ (MODULAR)
- Integração: `src/04-views/activities.html`

**Atividades:**
- Backend: `activities.gs` + `usuarios_api.gs`
- Frontend: `src/04-views/activities.html`
- Database: Tabela `atividades`

**Sistema de Alvos:**
- Backend: `participacoes.gs` → `defineTargets()`
- Frontend: `src/04-views/activities.html` → `toggleTargetsSection()`
- Database: Tabela `participacao` (tipo='alvo')

**Membros:**
- Backend: `members.gs`
- Frontend: `src/04-views/members.html`
- Database: Tabela `membros`

**Práticas:**
- Frontend: `src/04-views/practices.html` (com modal calendário)
- Database: (futuro - atualmente localStorage)

**Relatórios:**
- Frontend: `src/04-views/reports.html`
- Database: Queries agregadas de múltiplas tabelas

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- **[PARTICIONAMENTO_COMPLETO.md](PARTICIONAMENTO_COMPLETO.md)** - Detalhes da modularização
- **[GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)** - Como fazer tarefas (workflows)
- **[TAREFAS.md](TAREFAS.md)** - O que fazer agora (roadmap)
- **[CLAUDE_INSTRUCOES.md](CLAUDE_INSTRUCOES.md)** - Regras do código
- **[README.md](README.md)** - Visão geral do projeto

---

## 🔄 HISTÓRICO DE VERSÕES

- **v2.0.0-modular** (18/10/2025) - Modularização completa
  - 45 arquivos modulares criados
  - app_migrated.html eliminado
  - Inicialização centralizada
  - Sistema de filtros componentizado

- **v2.0.0-alpha.4** (01/10/2025) - Versão monolítica
  - app_migrated.html (7.399 linhas)
  - Sistema de alvos implementado
  - 15 arquivos backend

---

**🗺️ Este mapa é atualizado quando a estrutura do projeto muda significativamente.**
**Última grande atualização: Modularização completa do frontend - 18/10/2025**
