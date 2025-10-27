# 🎨 MAPA DO FRONTEND - Sistema Dojotai

**Versão:** 2.0.0-modular | **Atualizado:** 26/10/2025

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

Documentação detalhada da estrutura modular do **Frontend** (45 arquivos).

**🔙 Voltar para:** [MAPA_CODIGO.md](../MAPA_CODIGO.md)

---

## 📊 VISÃO GERAL

```
FRONTEND: 45 arquivos modulares
├── index.html (ponto de entrada)
├── Core (6 arquivos) - Sistema base
├── Utils (3 arquivos) - Utilitários
├── UI Components (4 arquivos) - Componentes reutilizáveis
├── Components específicos (4 arquivos)
├── Shared (1 arquivo) - Router
└── Views (6 arquivos) - Páginas da aplicação
```

---

## 📄 index.html (51 linhas) - Ponto de Entrada

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

## 🔴 src/05-components/core/ - Sistema Base (6 arquivos)

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

## 🟢 src/05-components/utils/ - Utilitários (3 arquivos)

```
src/05-components/utils/
├── dateHelpers.html (~100 linhas)
│   ├── formatDate(date, format)
│   ├── parseDate(dateString)
│   ├── isOverdue(date)
│   ├── getSmartStatus(status, dateString) - Atualizado 26/10/2025
│   │   ├── Suporta status 'Cancelada' (badge vermelho)
│   │   ├── Comparações case-insensitive
│   │   └── Retorna { text, class } para badges
│   └── Helpers de data/hora
│
├── permissionsHelpers.html (~120 linhas) 🔐 SISTEMA DE PERMISSÕES
│   ├── ADMIN_UIDS = ['U001', 'U002', 'U003', 'U004'] - Lista de admins
│   ├── isCurrentUserAdmin() - Verifica se usuário atual é admin
│   ├── canEditActivity(responsavelUid) - Pode editar atividade
│   ├── canCompleteActivity(activity) - Pode completar atividade
│   ├── getActivityPermissions(activity) - Retorna objeto com permissões
│   └── ⚡ Funções expostas globalmente: window.ADMIN_UIDS, window.isCurrentUserAdmin
│
└── activityHelpers.html (~270 linhas) ⭐ ATUALIZADO - 26/10/2025
    ├── renderActivityCard(activity) - Modificado
    │   ├── Matriz de botões dinâmica (ATRASADA/HOJE/PENDENTE/CONCLUÍDA/CANCELADA)
    │   ├── Exibição de relato (box verde ou vermelho conforme status)
    │   ├── Validações case-insensitive de status
    │   └── Debug logs para classificação temporal
    ├── renderActivities(activities)
    ├── updateSingleActivityCard(activityId, onComplete) - Corrigido
    │   ├── Validação de filtros via backend (single source of truth)
    │   ├── Animação pulse durante validação
    │   ├── Remove card com fadeOutSlide se não passa no filtro
    │   └── Transforma campos categoria (backend → frontend)
    └── removeActivityCardWithAnimation(activityId)
```

---

## 🔵 src/05-components/ui/ - Componentes de UI (4 arquivos)

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

## 🟡 src/05-components/ - Componentes Específicos (4 arquivos)

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

## 🟣 src/04-views/ - Páginas da Aplicação (6 arquivos)

```
src/04-views/
├── dashboard.html (~100 linhas)
│   └── Página inicial (estatísticas e resumo)
│
├── activities.html (~2.680 linhas) ⭐⭐⭐ MAIOR ARQUIVO - Atualizado 26/10/2025
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
│   │   │
│   │   ├── CANCELAR ATIVIDADE (novo 26/10/2025):
│   │   │   ├── cancelActivity(activityId) - Abre modal
│   │   │   ├── fecharModalCancelar()
│   │   │   └── confirmarCancelamento() - Valida e chama API
│   │   │
│   │   ├── CONCLUIR ATIVIDADE (modificado 26/10/2025):
│   │   │   ├── completeActivity(activityId) - Abre modal (era direto)
│   │   │   ├── fecharModalConcluir()
│   │   │   ├── confirmarConclusaoComRelato()
│   │   │   ├── pularRelato() - Conclui sem relato
│   │   │   └── finalizarConclusao(relato) - Chamada unificada
│   │   │
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
│   │       ├── Modal cancelar atividade (novo 26/10/2025)
│   │       │   ├── Campo relato obrigatório (min 10, max 1000 chars)
│   │       │   ├── Contador de caracteres com feedback visual
│   │       │   └── Botões: Voltar, Confirmar Cancelamento
│   │       ├── Modal concluir atividade (novo 26/10/2025)
│   │       │   ├── Campo relato opcional (max 1000 chars)
│   │       │   ├── Contador de caracteres
│   │       │   └── Botões: Cancelar, Pular, Concluir com Relato
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

## 🔧 src/03-shared/ - Componentes Compartilhados (1 arquivo)

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

**📚 Voltar para:** [MAPA_CODIGO.md](../MAPA_CODIGO.md)
