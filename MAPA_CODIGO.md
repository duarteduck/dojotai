# 🗺️ MAPA DO CÓDIGO - Sistema Dojotai

**Última atualização:** 27/10/2025 | **Versão:** 2.0.0-modular

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
│   Google Sheets (15 tabelas)                      │
└────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUTURA DETALHADA POR CAMADA

**Documentação separada para melhor organização e economia de tokens:**

### 🎨 Frontend (45 arquivos modulares)
📖 **[MAPA_FRONTEND.md](docs_instrucoes/MAPA_FRONTEND.md)** - Estrutura completa do frontend

**Contém:**
- Core (6 arquivos) - Sistema base
- Utils (3 arquivos) - Utilitários
- UI Components (4 arquivos) - Componentes reutilizáveis
- Components específicos (4 arquivos)
- Shared (1 arquivo) - Router
- Views (6 arquivos) - Páginas da aplicação

**Quando consultar:** Trabalhando com UI, componentes, páginas ou frontend em geral

---

### 📦 Backend (15 arquivos)
📖 **[MAPA_BACKEND.md](docs_instrucoes/MAPA_BACKEND.md)** - Estrutura completa do backend

**Contém:**
- Core (6 arquivos) - Núcleo do sistema
- Business (8 arquivos) - Lógica de negócio
- API (4 arquivos) - Pontos de entrada

**Quando consultar:** Trabalhando com lógica de negócio, APIs ou backend em geral

---

### 🗄️ Database (15 tabelas)
📖 **[MAPA_DATABASE.md](docs_instrucoes/MAPA_DATABASE.md)** - Estrutura completa do database

**Contém:**
- Tabelas Core (5 principais)
- Tabelas Auxiliares (10 tabelas)

**Quando consultar:** Trabalhando com dados, schema ou queries

---

## 📊 MÉTRICAS GERAIS

**Frontend:** 45 arquivos modulares (~7.491 linhas)
**Backend:** 15 arquivos (10.141 linhas)
**Database:** 15 tabelas (Google Sheets)

**Total:** 60 arquivos + 15 tabelas

---

## 🔄 FLUXO DE INICIALIZAÇÃO

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

### 2. Sistema de Filtros (ATUALIZADO - 25/10/2025) 🔐

```
Frontend: Navega para Atividades
    ↓
initActivities() (activities.html)
    ├── Inicializa filtros (primeira vez)
    │   └── initFiltrosSystem() (filters.html)
    │       ├── Event listeners
    │       └── aplicarFiltrosPadrao()
    │           └── Status: Pendente ✓
    │           └── Responsável: (removido - backend filtra automaticamente)
    ↓
loadActivities()
    ├── Pega filtros: window.getFiltrosAtivos()
    ├── Pega membro selecionado: State.selectedMemberId
    └── apiCall('listActivitiesApi', filtrosState, memberId)
        ↓
        Backend: activities.gs → listActivitiesApi(sessionId, filtros, memberId)
        ├── Extrai userId da sessão
        ├── Query BATCH de participações (se memberId fornecido)
        ├── Cria Set de atividades onde membro participa
        └── Filtra:
            ├── Se memberId: responsável OU participa
            └── Se NÃO memberId: apenas responsável
        ↓
        Retorno: { ok: true, items: [...] }
    ↓
applyActivityFilters() - Filtros locais adicionais
    ├── Busca por texto (searchText)
    └── Já vem filtrado do backend
    ↓
renderActivities() - Renderiza cards
```

**Abrir Modal de Filtros (com permissões):**
```
abrirModalFiltros() (filters.html)
    ├── Modal style.display = 'block'
    ├── carregarCategorias() - Usa window.cachedCategorias
    ├── Verificar se é admin: isCurrentUserAdmin()
    │   ├── Se admin: mostrar seção "Responsável"
    │   │   └── carregarResponsaveis() - Usa window.cachedResponsaveis
    │   └── Se NÃO admin: esconder seção "Responsável"
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

**🔐 Sistema de Permissões:**
- **Não-admins:** Veem apenas atividades relevantes (responsável ou membro participa)
- **Admins:** Veem atividades relevantes + podem usar filtro "Responsável" para ver atividades de outros usuários

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
| Cancelar atividade | src/04-views/activities.html | cancelActivity() ⭐ NOVO |
| Concluir atividade | src/04-views/activities.html | completeActivity() ⭐ MODIFICADO |
| Sistema de alvos | src/04-views/activities.html | toggleTargetsSection() |
| Modal participantes | src/04-views/activities.html | openParticipantsModal() |
| Membros | src/04-views/members.html | loadMembers() |
| Práticas | src/04-views/practices.html | initPractices() |
| Carregar práticas disponíveis | src/04-views/practices.html | loadAvailablePractices() |
| Renderizar cards de dias | src/04-views/practices.html | renderDays() |
| Auto-save práticas | src/04-views/practices.html | savePracticeToServer() |
| Auto-save observações | src/04-views/practices.html | saveObservationToServer() |
| Sistema de progresso (4 cores) | src/04-views/practices.html | getDayProgress() |
| Modal calendário | src/04-views/practices.html | openCalendar() (PENDENTE) |
| Relatórios | src/04-views/reports.html | initReports() |
| **BACKEND - CORE** |
| Login API | usuarios_api.gs | authenticateUser() |
| Listar atividades | activities.gs | listActivitiesApi() |
| Criar atividade | usuarios_api.gs | createActivity() |
| Concluir atividade | activities_api.gs | completeActivity() ⭐ MODIFICADO |
| Cancelar atividade | activities_api.gs | cancelActivityApi() ⭐ NOVO |
| Listar categorias | activities_categories.gs | listCategoriasAtividadesApi() |
| Listar usuários | usuarios_api.gs | listUsuariosApi() |
| Definir alvos | participacoes.gs | defineTargets() |
| Listar participações | participacoes.gs | listParticipacoes() |
| **BACKEND - PRÁTICAS** ⭐ |
| API: Práticas disponíveis | practices_api.gs | getAvailablePractices() |
| API: Carregar práticas | practices_api.gs | loadPracticesByDateRange() |
| API: Salvar prática | practices_api.gs | savePractice() |
| API: Salvar observação | practices_api.gs | saveObservation() |
| Core: Carregar práticas | practices.gs | _loadAvailablePractices() |
| Core: UPSERT prática | practices.gs | _savePracticeCore() |
| Core: UPSERT observação | practices.gs | _saveObservationCore() |
| Core: Batch observações | practices.gs | _loadObservationsByDateRange() |
| **BACKEND - GERAL** |
| CRUD genérico | database_manager.gs | insert/query/update/delete |
| Criar sessão | session_manager.gs | createSession() |
| Validar sessão | session_manager.gs | validateSession() |

**Legenda:**
- ⭐ = Função crítica do sistema
- NOVO = Adicionado recentemente
- MODIFICADO = Alterado recentemente

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
| **Documentação** | ❌ 1 arquivo gigante | ✅ Documentação modular por camada |

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
- Backend: `activities.gs` + `activities_api.gs` + `usuarios_api.gs`
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

**Práticas:** ⭐ SISTEMA COMPLETO IMPLEMENTADO
- Backend Core: `practices.gs` (6 funções de negócio)
- Backend API: `practices_api.gs` (6 endpoints públicos)
- Frontend: `src/04-views/practices.html` (interface completa)
- Database: 3 tabelas (`PRATICAS_CADASTRO`, `PRATICAS_DIARIAS`, `OBSERVACOES_DIARIAS`)
- Funcionalidades:
  - ✅ Cadastro dinâmico de práticas (editável via planilha)
  - ✅ Auto-save com debounce (500ms)
  - ✅ Sistema de progresso com 4 cores
  - ✅ Observações do dia (500 chars)
  - ✅ Múltiplos tipos de input (contador/checkbox)
  - ✅ Integração com sistema de vínculos
  - 🔴 PENDENTE: Sistema de calendário/filtros (removido, precisa refazer)

**Relatórios:**
- Frontend: `src/04-views/reports.html`
- Database: Queries agregadas de múltiplas tabelas

---

## 📚 DOCUMENTAÇÃO RELACIONADA

**Instruções e Guias:**
- **[CLAUDE_INSTRUCOES.md](CLAUDE_INSTRUCOES.md)** - Regras e padrões do código
- **[GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)** - Como fazer tarefas (workflows)
- **[TAREFAS.md](TAREFAS.md)** - O que fazer agora (roadmap)

**Mapas Detalhados:**
- **[MAPA_FRONTEND.md](docs_instrucoes/MAPA_FRONTEND.md)** - Frontend completo
- **[MAPA_BACKEND.md](docs_instrucoes/MAPA_BACKEND.md)** - Backend completo
- **[MAPA_DATABASE.md](docs_instrucoes/MAPA_DATABASE.md)** - Database completo

**Outros:**
- **[PARTICIONAMENTO_COMPLETO.md](PARTICIONAMENTO_COMPLETO.md)** - Detalhes da modularização
- **[README.md](README.md)** - Visão geral do projeto

---

## 🔄 HISTÓRICO DE VERSÕES

- **v2.2** (27/10/2025) - Divisão de documentação modular
  - ✅ Documentação dividida em arquivos menores
  - ✅ Economia de ~60-75% em tokens de leitura
  - ✅ MAPA_FRONTEND.md, MAPA_BACKEND.md, MAPA_DATABASE.md
  - ✅ APRENDIZADOS_CRITICOS.md separado

- **v2.1** (26/10/2025) - Cancelamento e Conclusão de Atividades
  - ✅ Campo `relato` unificado (conclusão ou cancelamento)
  - ✅ Novo status 'Cancelada'
  - ✅ Matriz de botões dinâmica por status
  - ✅ Modais para cancelamento e conclusão

- **v2.1.0** (24/10/2025) - Sistema de Práticas Diárias
  - ✅ 3 novas tabelas (PRATICAS_CADASTRO, PRATICAS_DIARIAS, OBSERVACOES_DIARIAS)
  - ✅ 2 novos arquivos backend (practices.gs, practices_api.gs)
  - ✅ 2 novos arquivos backend (vinculos.gs, vinculos_api.gs)
  - ✅ Sistema completo de práticas funcionando
  - ✅ Auto-save, progresso 4 cores, observações do dia
  - 🔴 Calendário/filtros pendente

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
**Última grande atualização: Divisão Modular de Documentação - 27/10/2025**
