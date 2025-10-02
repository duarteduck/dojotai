# ANÁLISE TÉCNICA - Sistema Dojotai

**Documento gerado em:** 2025-01-10
**Versão:** 1.0
**Escopo:** Mapeamento completo de app_migrated.html e suas dependências backend

---

## 📊 VISÃO GERAL

### Métricas do Sistema
- **Total de funções frontend:** 105 funções JavaScript
- **Total de funções backend utilizadas:** 17 funções únicas
- **Total de chamadas ao backend:** 29 chamadas mapeadas
- **Arquivos backend envolvidos:** 5 arquivos principais
- **Complexidade:** Alta (sistema modular com múltiplas camadas)

### Arquivos Backend Mapeados
1. `src/02-api/main_migrated.gs` - Ponto de entrada web
2. `src/01-business/auth.gs` - Autenticação e sessões
3. `src/01-business/activities.gs` - Gestão de atividades
4. `src/01-business/members.gs` - Gestão de membros
5. `src/01-business/participacoes.gs` - Participações em atividades
6. `src/01-business/activities_categories.gs` - Categorias de atividades

---

## 🎨 FRONTEND (app_migrated.html)

### Estrutura do Arquivo
- **Linhas totais:** 7675
- **Design System:** CSS Variables com suporte a Dark Mode
- **Framework:** Vanilla JavaScript (sem dependências externas)
- **Padrão de Navegação:** SPA (Single Page Application) com sistema de abas

### Principais Módulos Frontend

#### 1. **Sistema de Navegação**
```javascript
// Funções: 3
- initNavigation() → Inicializa navegação entre páginas
- navigateToPage(targetPage) → Troca de página/aba
- toggleMobileMenu() / closeMobileMenu() → Menu responsivo
```

#### 2. **Autenticação e Sessão**
```javascript
// Funções: 6
- doLogin(event) → Processa login
- showLogin() → Exibe tela de login
- logout() → Realiza logout
- loadCurrentUser() → Carrega dados do usuário
- checkAuthAndInit() → Verifica autenticação
- showApp() → Exibe aplicação autenticada
```
**Chama Backend:**
- `authenticateUser(usuario, password)`
- `logoutUser(sessionId)`
- `getCurrentLoggedUser()`

#### 3. **Gestão de Atividades**
```javascript
// Funções: 15
- initActivities() → Inicializa módulo
- loadActivities() → Carrega lista de atividades
- applyActivityFilters() → Aplica filtros
- renderActivities() → Renderiza cards
- createActivityModal() → Cria modal de nova atividade
- openActivityModal() → Abre modal
- submitActivity() → Submete nova atividade
- editActivity(id) → Edita atividade
- updateActivity(id) → Atualiza atividade
- completeActivity(id) → Marca como concluída
- openParticipants(id) → Abre modal de participantes
```
**Chama Backend:**
- `listActivitiesApi()`
- `createActivity(formData, uid)`
- `getActivityById(activityId)`
- `updateActivityWithTargets(input)`
- `completeActivity(activityId)`

#### 4. **Sistema de Filtros**
```javascript
// Funções: 10
- initFiltrosSystem() → Inicializa sistema
- abrirModalFiltros() → Abre modal
- fecharModalFiltros() → Fecha modal
- aplicarFiltros() → Aplica filtros selecionados
- renderizarChips() → Renderiza chips de filtros ativos
- criarChip() → Cria chip individual
- removerFiltro() → Remove filtro específico
- limparTodosFiltros() → Limpa todos
- carregarCategorias() → Carrega opções
- carregarResponsaveis() → Carrega usuários
```
**Chama Backend:**
- `listCategoriasAtividadesApi()`
- `listUsuariosApi()`

#### 5. **Participações (Alvos)**
```javascript
// Funções: 12
- openParticipantsModal(activityId) → Abre modal
- loadActivityForParticipants(id) → Carrega dados
- renderParticipantsForModal() → Renderiza lista
- toggleParticipationOptions(checkbox) → Controla opções
- saveAllParticipations(activityId) → Salva múltiplas
- saveParticipants(activityId) → Salva alterações
```
**Chama Backend:**
- `getActivityById(activityId)`
- `listParticipacoes(activityId)`
- `listMembersApi()`
- `saveParticipacaoDirectly(...)`
- `updateParticipations(participationUpdates)`

#### 6. **Sistema de Alvos (Seleção de Membros)**
```javascript
// Funções: 20
- initializeTargetsSection(mode) → Inicializa
- toggleTargetsSection(mode, activityId) → Mostra/oculta
- loadTargetFilters(mode) → Carrega filtros
- searchMembersForTargets(mode) → Busca membros
- displayTargetsResults(members, mode) → Exibe resultados
- toggleTargetSelection(memberId, mode) → Seleciona/remove
- updateDualListDisplay(mode) → Atualiza listas
- selectAllTargets(mode) → Seleciona todos
- unselectAllTargets(mode) → Remove todos
- clearTargetFilters(mode) → Limpa filtros
- saveTargets(mode, activityId) → Salva alvos
- loadExistingTargets(activityId) → Carrega existentes
```
**Chama Backend:**
- `searchMembersByCriteria(filters)`
- `listMembersApi()`
- `listParticipacoes(activityId)`
- `saveTargetsDirectly(activityId, memberIds, uid)`

#### 7. **Práticas Diárias**
```javascript
// Funções: 10
- initPractices() → Inicializa módulo
- getLast7Days() → Obtém últimos 7 dias
- renderDays() → Renderiza calendário
- renderPractice() → Renderiza prática
- incrementPractice() → Incrementa contador
- updateQuantity() → Atualiza valor
- setYesNoValue() → Define sim/não
- openCalendar() → Abre calendário
```
**Nota:** Não há chamadas ao backend neste módulo (usa localStorage)

#### 8. **Relatórios**
```javascript
// Funções: 5
- initReports() → Inicializa módulo
- updateReportDisplay() → Atualiza exibição
- generateReportChart() → Gera gráfico
- previousReportPeriod() → Período anterior
- nextReportPeriod() → Próximo período
```
**Nota:** Não há chamadas ao backend neste módulo (usa dados do localStorage)

#### 9. **Utilitários e Helpers**
```javascript
// Funções: 15
- showToast(message, type) → Exibe notificação
- formatDate(dateString) → Formata data
- toggleTheme() → Alterna tema
- loadTheme() → Carrega tema salvo
- showLoading() / hideLoading() → Spinners
- populateSelect() → Popula selects
- getSmartStatus(status, dateString) → Status inteligente
```

---

## 🔧 BACKEND (Dependências)

### Mapa Completo de Funções Backend

#### 1. **AUTENTICAÇÃO (auth.gs)**

##### `authenticateUser(usuario, password)`
- **Linha:** auth.gs (chamada interna a loginUser)
- **Retorna:** `{ok: boolean, user: {...}, session: {...}, error?: string}`
- **Chama Internamente:**
  - `SecurityManager.secureLogin(login, pin)`
  - `createSession(userId, deviceInfo)`
  - `Logger.info/warn/error()`
- **Usa:**
  - DatabaseManager (via SecurityManager)
  - SessionManager
  - data_dictionary
- **Fluxo:**
```
authenticateUser()
  ↓ SecurityManager.secureLogin()
  ↓ DatabaseManager.read('usuarios')
  ↓ createSession()
  ↓ SessionManager.createSession()
  ↓ return {ok, user, session}
```

##### `logoutUser(sessionId)`
- **Linha:** auth.gs:90
- **Retorna:** `{ok: boolean, message: string, error?: string}`
- **Chama Internamente:**
  - `destroySession(sessionId)`
  - `SessionManager.destroySession()`
  - `Logger.info/error()`
- **Fluxo:**
```
logoutUser()
  ↓ destroySession()
  ↓ SessionManager.destroySession()
  ↓ return {ok, message}
```

##### `getCurrentLoggedUser()`
- **Linha:** Não diretamente visível (inferida pelo frontend)
- **Retorna:** `{ok: boolean, user: {...}, error?: string}`
- **Nota:** Provavelmente usa SessionManager para recuperar usuário da sessão ativa

#### 2. **ATIVIDADES (activities.gs)**

##### `listActivitiesApi()`
- **Linha:** activities.gs:3
- **Retorna:** `{ok: boolean, items: Array<Activity>, error?: string}`
- **Chama Internamente:**
  - `_listActivitiesCore()`
  - `getActivitiesCtx_()`
  - `getFullTableValues_(ctx)`
  - `getUsersMapReadOnly_()`
  - `getCategoriasAtividadesMapReadOnly_()`
  - `getParticipacaoStats(activityId)`
- **Usa:**
  - DatabaseManager (via readTableByNome_)
  - data_dictionary
- **Fluxo:**
```
listActivitiesApi()
  ↓ _listActivitiesCore()
  ↓ getActivitiesCtx_()
  ↓ getFullTableValues_(ctx)
  ↓ DatabaseManager.read('atividades')
  ↓ getUsersMapReadOnly_()
  ↓ getCategoriasAtividadesMapReadOnly_()
  ↓ getParticipacaoStats(activityId) [para cada atividade]
  ↓ return {ok, items: [...]}
```

##### `createActivity(payload, uidCriador)`
- **Linha:** activities.gs:56
- **Retorna:** `{ok: boolean, id: string, error?: string}`
- **Chama Internamente:**
  - `CategoriaManager.validateMultipleCategorias()`
  - `getActivitiesCtx_()`
  - `getFullTableValues_(ctx)`
  - `generateSequentialId_()`
  - `nowString_()`
- **Usa:**
  - DatabaseManager (escrita direta na planilha)
  - data_dictionary
- **Fluxo:**
```
createActivity()
  ↓ CategoriaManager.validateMultipleCategorias()
  ↓ getActivitiesCtx_()
  ↓ getFullTableValues_(ctx)
  ↓ generateSequentialId_('ACT-', ids, 4)
  ↓ sheet.getRange().setValues([rowArray])
  ↓ return {ok, id: nextId}
```

##### `getActivityById(activityId)`
- **Linha:** activities.gs:530
- **Retorna:** `{ok: boolean, item: {...}, error?: string}`
- **Chama Internamente:**
  - `_listActivitiesCore()`
- **Fluxo:**
```
getActivityById()
  ↓ _listActivitiesCore()
  ↓ items.find(it => it.id === id)
  ↓ return {ok, item}
```

##### `updateActivityWithTargets(input, uidEditor)`
- **Linha:** activities.gs:443
- **Retorna:** `{ok: boolean, atualizadoPorNome?: string, error?: string}`
- **Chama Internamente:**
  - `validateCategoriaAtividade_()` (para cada categoria)
  - `getActivitiesCtx_()`
  - `getFullTableValues_(ctx)`
  - `saveTargetsDirectly()` (se alvos fornecidos)
  - `getUsersMapReadOnly_()`
  - `nowString_()`
- **Fluxo:**
```
updateActivityWithTargets()
  ↓ validateCategoriaAtividade_() [para cada categoria]
  ↓ getActivitiesCtx_()
  ↓ getFullTableValues_(ctx)
  ↓ sheet.getRange().setValue() [múltiplas células]
  ↓ saveTargetsDirectly() [se alvos fornecidos]
  ↓ return {ok, atualizadoPorNome}
```

##### `completeActivity(id, uid)`
- **Linha:** activities.gs:19
- **Retorna:** `{ok: boolean, status: string, atualizadoPorNome?: string, error?: string}`
- **Chama Internamente:**
  - `getActivitiesCtx_()`
  - `getFullTableValues_(ctx)`
  - `getUsersMapReadOnly_()`
  - `nowString_()`
- **Fluxo:**
```
completeActivity()
  ↓ getActivitiesCtx_()
  ↓ getFullTableValues_(ctx)
  ↓ sheet.getRange().setValue('Concluida')
  ↓ return {ok, status: 'concluida'}
```

#### 3. **CATEGORIAS (activities_categories.gs)**

##### `listCategoriasAtividadesApi()`
- **Linha:** activities_categories.gs:3
- **Retorna:** `{ok: boolean, items: Array<Categoria>, error?: string}`
- **Chama Internamente:**
  - `_listCategoriasAtividadesCore()`
  - `readTableByNome_('categorias_atividades')`
- **Usa:**
  - DatabaseManager
  - data_dictionary
- **Fluxo:**
```
listCategoriasAtividadesApi()
  ↓ _listCategoriasAtividadesCore()
  ↓ readTableByNome_('categorias_atividades')
  ↓ DatabaseManager.read('categorias_atividades')
  ↓ return {ok, items: [...]}
```

#### 4. **USUÁRIOS (auth.gs)**

##### `listUsuariosApi()`
- **Linha:** Não diretamente visível (inferida; possivelmente usa listActiveUsers)
- **Retorna:** `{ok: boolean, users: Array<User>, error?: string}`
- **Chama Internamente:**
  - `readTableByNome_('usuarios')`
  - `trimValuesByRequired_()`
  - `generateSequentialId_()`
- **Fluxo:**
```
listUsuariosApi()
  ↓ readTableByNome_('usuarios')
  ↓ DatabaseManager.read('usuarios')
  ↓ trimValuesByRequired_()
  ↓ return {ok, users: [...]}
```

#### 5. **MEMBROS (members.gs)**

##### `listMembersApi()`
- **Linha:** members.gs:7
- **Retorna:** `{ok: boolean, items: Array<Member>, error?: string}`
- **Chama Internamente:**
  - `_listMembersCore()`
  - `readTableByNome_('membros')`
- **Usa:**
  - DatabaseManager
  - data_dictionary
- **Fluxo:**
```
listMembersApi()
  ↓ _listMembersCore()
  ↓ readTableByNome_('membros')
  ↓ DatabaseManager.read('membros')
  ↓ return {ok, items: [...]}
```

##### `searchMembersByCriteria(filters)`
- **Linha:** participacoes.gs:267
- **Retorna:** `{ok: boolean, items: Array<Member>, error?: string}`
- **Chama Internamente:**
  - `DatabaseManager.query('membros', {}, false)`
  - Aplica filtros (nome, dojo, status)
- **Fluxo:**
```
searchMembersByCriteria()
  ↓ DatabaseManager.query('membros', {}, false)
  ↓ [filtra por nome, dojo, status]
  ↓ return {ok, items: [optimizedMembers]}
```

#### 6. **PARTICIPAÇÕES (participacoes.gs)**

##### `listParticipacoes(activityId)`
- **Linha:** participacoes.gs:6
- **Retorna:** `{ok: boolean, items: Array<Participacao>, error?: string}`
- **Chama Internamente:**
  - `DatabaseManager.query('participacoes', filters, false)`
- **Usa:**
  - DatabaseManager
  - data_dictionary
- **Fluxo:**
```
listParticipacoes()
  ↓ DatabaseManager.query('participacoes', {id_atividade: activityId}, false)
  ↓ [filtra deleted !== 'x']
  ↓ return {ok, items: [...]}
```

##### `saveTargetsDirectly(activityId, memberIds, uid)`
- **Linha:** participacoes.gs:398
- **Retorna:** `{ok: boolean, created: number, deleted: number, message: string, error?: string}`
- **Chama Internamente:**
  - `readTableByNome_('participacoes')`
  - `getPlanRef_('participacoes')`
  - `getContextFromRef_(ref)`
  - `generateSequentialId_('PART-', ids, 4)`
  - `nowString_()`
- **Usa:**
  - DatabaseManager (leitura e escrita direta)
  - data_dictionary
- **Fluxo:**
```
saveTargetsDirectly()
  ↓ readTableByNome_('participacoes')
  ↓ [identifica novos e removidos]
  ↓ [marca removidos como deleted='x']
  ↓ generateSequentialId_('PART-', ids, 4)
  ↓ sheet.getRange().setValues([rowsToAdd])
  ↓ return {ok, created, deleted}
```

##### `saveParticipacaoDirectly(activityId, memberId, dados, uid)`
- **Linha:** participacoes.gs:580
- **Retorna:** `{ok: boolean, message?: string, error?: string}`
- **Chama Internamente:**
  - Se `dados.id` existe: `updateParticipacaoById()`
  - Senão: `markParticipacao()`
- **Fluxo:**
```
saveParticipacaoDirectly()
  ↓ [verifica se dados.id existe]
  ↓ SE SIM: updateParticipacaoById()
  ↓   ↓ DatabaseManager.findByField('participacoes', 'id', id)
  ↓   ↓ DatabaseManager.update('participacoes', id, updateData)
  ↓ SE NÃO: markParticipacao()
  ↓   ↓ DatabaseManager.query('participacoes', filters, false)
  ↓   ↓ DatabaseManager.update('participacoes', id, updateData)
  ↓ return {ok, message}
```

##### `updateParticipations(participationUpdates)`
- **Linha:** Não diretamente visível (inferida; usa DatabaseManager.update em loop)
- **Retorna:** `{ok: boolean, updated: number, error?: string}`
- **Fluxo:**
```
updateParticipations()
  ↓ [para cada participação em participationUpdates]
  ↓   ↓ DatabaseManager.update('participacoes', id, dados)
  ↓ return {ok, updated: count}
```

##### `getParticipacaoStats(activityId)`
- **Linha:** participacoes.gs:326
- **Retorna:** `{ok: boolean, stats: {...}, error?: string}`
- **Chama Internamente:**
  - `listParticipacoes(activityId)`
- **Fluxo:**
```
getParticipacaoStats()
  ↓ listParticipacoes(activityId)
  ↓ [calcula: total, confirmados, recusados, participaram, ausentes, pendentes, percentual]
  ↓ return {ok, stats: {...}}
```

---

## 📋 PADRÕES DO PROJETO

### 1. Padrão de CRUD

#### Leitura (Read)
```javascript
// Frontend
google.script.run
  .withSuccessHandler(function(result) {
    if (result.ok) {
      // Processa result.items
    } else {
      console.error(result.error);
    }
  })
  .withFailureHandler(function(error) {
    console.error(error);
  })
  .listActivitiesApi();

// Backend (activities.gs:3)
function listActivitiesApi() {
  try {
    const result = _listActivitiesCore();
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}

// Core (activities.gs:127)
function _listActivitiesCore() {
  const ctx = getActivitiesCtx_();
  const values = getFullTableValues_(ctx);
  // ... processamento
  return { ok: true, items: items };
}
```

#### Criação (Create)
```javascript
// Frontend
google.script.run
  .withSuccessHandler(function(result) {
    if (result.ok) {
      showToast('Criado com sucesso!', 'success');
      loadActivities(); // Recarrega lista
    } else {
      showToast(result.error, 'error');
    }
  })
  .withFailureHandler(function(error) {
    showToast('Erro ao criar: ' + error, 'error');
  })
  .createActivity(formData, uid);

// Backend (activities.gs:56)
function createActivity(payload, uidCriador) {
  try {
    // 1. Validação
    if (!payload.titulo) return { ok: false, error: 'Título obrigatório.' };

    // 2. Validação de Categoria
    if (payload.categorias_ids) {
      const validationResult = CategoriaManager.validateMultipleCategorias(payload.categorias_ids);
      if (!validationResult.isValid) {
        return { ok: false, error: validationResult.error };
      }
    }

    // 3. Contexto e Dados
    const ctx = getActivitiesCtx_();
    const all = getFullTableValues_(ctx);

    // 4. Geração de ID
    const ids = all.slice(1).map(r => (r[idxId]||'').toString());
    const nextId = generateSequentialId_('ACT-', ids, 4);

    // 5. Inserção
    const nowStr = nowString_();
    const rowArray = [...]; // preparar dados
    const targetRow = ctx.sheet.getLastRow() + 1;
    ctx.sheet.getRange(targetRow, ctx.startCol, 1, header.length).setValues([rowArray]);

    // 6. Logger (se disponível)
    // Logger.info('Activities', 'Created', { id: nextId, creator: uidCriador });

    // 7. Return
    return { ok: true, id: nextId };
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}
```

#### Atualização (Update)
```javascript
// Frontend
google.script.run
  .withSuccessHandler(function(result) {
    if (result.ok) {
      showToast('Atualizado com sucesso!', 'success');
      closeModal();
      loadActivities();
    } else {
      showToast(result.error, 'error');
    }
  })
  .withFailureHandler(function(error) {
    showToast('Erro ao atualizar: ' + error, 'error');
  })
  .updateActivityWithTargets(input, uid);

// Backend (activities.gs:443)
function updateActivityWithTargets(input, uidEditor) {
  try {
    if (!input || !input.id) return { ok: false, error: 'ID não informado.' };

    var patch = input.patch || {};

    // 1. Validação
    if (patch.categorias_ids !== undefined && patch.categorias_ids !== '') {
      const categoriasArray = patch.categorias_ids.split(',').map(id => id.trim());
      for (const catId of categoriasArray) {
        const catValida = validateCategoriaAtividade_(catId);
        if (!catValida) {
          return { ok: false, error: 'Categoria inválida: ' + catId };
        }
      }
    }

    // 2. Contexto e Busca
    var ctx = getActivitiesCtx_();
    var values = getFullTableValues_(ctx);
    var rowIndex = values.findIndex((r, i) => i > 0 && r[idx['id']] === input.id);
    if (rowIndex === -1) return { ok: false, error: 'Não encontrado.' };

    // 3. Atualização
    var sh = ctx.sheet;
    var rowNumber = ctx.startRow + rowIndex;

    function setIfPresent(colName, value) {
      var c = idx[colName];
      if (c != null) sh.getRange(rowNumber, c+1).setValue(value);
    }

    if (patch.titulo != null) setIfPresent('titulo', patch.titulo);
    if (patch.descricao != null) setIfPresent('descricao', patch.descricao);
    // ... outros campos

    // 4. Auditoria
    var now = nowString_();
    setIfPresent('atualizado_em', now);
    if (uidEditor) setIfPresent('atualizado_uid', uidEditor);

    // 5. Alvos (se fornecidos)
    if (input.alvos && Array.isArray(input.alvos)) {
      var resultAlvos = saveTargetsDirectly(input.id, input.alvos, uidEditor);
      if (!resultAlvos.ok) return { ok: false, error: resultAlvos.error };
    }

    return { ok: true, atualizadoPorNome: '...' };
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}
```

### 2. Padrão de API Response

**Todas** as funções backend seguem este padrão de retorno:

```javascript
// SUCESSO
{
  ok: true,
  // campos específicos da função:
  items?: Array,      // para listagens
  item?: Object,      // para get por ID
  id?: string,        // para create
  created?: number,   // para batch operations
  stats?: Object,     // para estatísticas
  message?: string    // mensagens adicionais
}

// ERRO
{
  ok: false,
  error: string  // mensagem de erro clara
}
```

### 3. Padrão de Chamada ao Backend

```javascript
// PADRÃO OBRIGATÓRIO
if (typeof google !== 'undefined' && google.script && google.script.run) {
  google.script.run
    .withSuccessHandler(function(result) {
      if (result && result.ok) {
        // Sucesso: processar result
      } else {
        // Erro retornado pela função
        console.error(result && result.error || 'Erro desconhecido');
      }
    })
    .withFailureHandler(function(error) {
      // Erro de conexão ou runtime
      console.error('Falha na chamada:', error);
    })
    .nomeDaFuncao(parametros);
} else {
  // Fallback para desenvolvimento local
  console.warn('google.script.run não disponível');
  // Pode usar dados mockados ou mostrar mensagem
}
```

### 4. Padrão de Validação

#### No Frontend (antes de enviar)
```javascript
function submitActivity(event) {
  event.preventDefault();

  // 1. Validações Básicas
  const titulo = document.getElementById('activity-titulo').value.trim();
  if (!titulo) {
    showToast('Título é obrigatório', 'error');
    return;
  }

  // 2. Validações de Formato
  const data = document.getElementById('activity-data').value;
  if (data && !isValidDate(data)) {
    showToast('Data inválida', 'error');
    return;
  }

  // 3. Monta Payload
  const formData = {
    titulo: titulo,
    descricao: document.getElementById('activity-descricao').value.trim(),
    data: data,
    atribuido_uid: document.getElementById('activity-responsavel').value,
    categorias_ids: getSelectedCategories().join(','),
    tags: document.getElementById('activity-tags').value.trim()
  };

  // 4. Envia
  showCreateActivityLoading(true);
  google.script.run
    .withSuccessHandler(function(result) {
      showCreateActivityLoading(false);
      // ...
    })
    .withFailureHandler(function(error) {
      showCreateActivityLoading(false);
      // ...
    })
    .createActivity(formData, uid);
}
```

#### No Backend (revalidação)
```javascript
function createActivity(payload, uidCriador) {
  try {
    // 1. Validações de Campos Obrigatórios
    const titulo = (payload && payload.titulo || '').toString().trim();
    if (!titulo) return { ok: false, error: 'Informe um título.' };

    // 2. Validações de Negócio
    const categorias_ids = (payload && payload.categorias_ids || '').toString().trim();
    if (categorias_ids) {
      const validationResult = CategoriaManager.validateMultipleCategorias(categorias_ids);
      if (!validationResult.isValid) {
        return { ok: false, error: validationResult.error };
      }
    }

    // 3. Validações de Integridade
    // (ex: verificar se responsável existe)
    const atribuido_uid = (payload && payload.atribuido_uid || '').toString().trim();
    if (atribuido_uid) {
      const users = getUsersMapReadOnly_();
      if (!users[atribuido_uid]) {
        return { ok: false, error: 'Usuário responsável não encontrado.' };
      }
    }

    // 4. Processa se tudo OK
    // ...
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}
```

### 5. Padrão de Loading States

```javascript
// Funções de Loading
function showCreateActivityLoading(show) {
  const button = document.getElementById('btn-submit-activity');
  const buttonText = button.querySelector('.button-text');
  const loadingSpinner = button.querySelector('.loading-spinner');

  if (show) {
    button.disabled = true;
    buttonText.textContent = 'Salvando...';
    loadingSpinner.classList.remove('hidden');
  } else {
    button.disabled = false;
    buttonText.textContent = 'Criar Atividade';
    loadingSpinner.classList.add('hidden');
  }
}

// Uso
showCreateActivityLoading(true);
google.script.run
  .withSuccessHandler(function(result) {
    showCreateActivityLoading(false);
    // ...
  })
  .withFailureHandler(function(error) {
    showCreateActivityLoading(false);
    // ...
  })
  .createActivity(formData, uid);
```

### 6. Padrão de DatabaseManager

O sistema usa uma camada de abstração chamada **DatabaseManager** que gerencia o acesso às planilhas do Google Sheets.

```javascript
// Leitura
const { values, headerIndex, ctx } = readTableByNome_('nome_da_tabela');

// Query com filtros
const members = DatabaseManager.query('membros', { status: 'Ativo' }, false);

// Create
const result = DatabaseManager.create('participacoes', {
  id_atividade: 'ACT-0001',
  id_membro: 'M001',
  tipo: 'alvo'
});

// Update
const result = DatabaseManager.update('participacoes', 'PART-0001', {
  participou: 'sim',
  marcado_em: nowString_()
});

// FindByField
const participacao = DatabaseManager.findByField('participacoes', 'id', 'PART-0001');
```

**Localização:** `src/00-core/data_dictionary.gs` (inferido)

### 7. Padrão de Auditoria

Todas as operações de escrita (Create/Update) registram:

```javascript
// Campos de Auditoria
{
  criado_em: '2025-01-10T10:30:00Z',      // CREATE
  atualizado_em: '2025-01-10T15:45:00Z',  // UPDATE
  atualizado_uid: 'U001',                 // UPDATE
  marcado_em: '2025-01-10T15:45:00Z',     // PARTICIPAÇÕES
  marcado_por: 'U001'                     // PARTICIPAÇÕES
}

// Função Helper
function nowString_() {
  return new Date().toISOString();
}
```

### 8. Padrão de Soft Delete

```javascript
// Não deleta fisicamente, marca como deletado
DatabaseManager.update('participacoes', 'PART-0001', {
  deleted: 'x'
});

// Ao listar, filtra deletados
const participacoes = DatabaseManager.query('participacoes', filters, false)
  .filter(p => p.deleted !== 'x');
```

---

## 🔍 DESCOBERTAS

### O que funciona bem

1. ✅ **Arquitetura em Camadas**
   - Separação clara entre API (02-api), Business (01-business) e Core (00-core)
   - Facilita manutenção e teste de cada camada

2. ✅ **Padrão de Response Unificado**
   - Todas as APIs retornam `{ok: boolean, ...}`
   - Facilita tratamento de erros no frontend

3. ✅ **DatabaseManager Abstraction**
   - Abstrai acesso ao Google Sheets
   - Permite trocar backend sem mexer no código de negócio

4. ✅ **Design System Consistente**
   - CSS Variables com tema claro/escuro
   - Componentes reutilizáveis

5. ✅ **Sistema de Auditoria**
   - Rastreamento de quem criou/atualizou
   - Timestamps em todas operações

6. ✅ **Soft Delete**
   - Não perde dados históricos
   - Permite recuperação

### O que pode melhorar

1. ⚠️ **Falta de TypeScript/JSDoc**
   - Dificulta entendimento dos tipos de dados
   - Sugestão: Adicionar JSDoc em todas as funções

2. ⚠️ **Ausência de Testes**
   - Nenhum teste automatizado identificado
   - Sugestão: Implementar testes unitários com Google Apps Script Testing

3. ⚠️ **Duplicação de Código**
   - Funções similares em múltiplos lugares (ex: showLoading)
   - Sugestão: Criar módulo de utilitários compartilhados

4. ⚠️ **Falta de Paginação**
   - listActivitiesApi() retorna TODOS os registros
   - Pode causar lentidão com muitos dados
   - Sugestão: Implementar paginação server-side

5. ⚠️ **Cache Manual**
   - Cache de categorias é manual (`__categoriasAtividadesCache`)
   - Sugestão: Implementar sistema de cache centralizado

6. ⚠️ **Validações Duplicadas**
   - Mesmas validações no frontend e backend
   - Sugestão: Criar schema de validação compartilhado

7. ⚠️ **Falta de Rate Limiting**
   - Nenhuma proteção contra chamadas excessivas
   - Sugestão: Implementar throttling/debouncing

### Funções mais importantes

#### **Top 5 - Frontend**

1. **`loadActivities()`** (app_migrated.html:2936)
   - Carrega e renderiza lista de atividades
   - Usada em quase todas as páginas
   - Aplica filtros e ordenação

2. **`submitActivity()`** (app_migrated.html:5426)
   - Cria nova atividade
   - Integra com sistema de alvos
   - Validações complexas

3. **`openParticipantsModal()`** (app_migrated.html:3918)
   - Gerencia participações de atividade
   - Integra múltiplas funcionalidades
   - Permite marcar presença/ausência

4. **`saveTargets()`** (app_migrated.html:6869)
   - Define alvos para atividade
   - Usa sistema de busca avançada
   - Permite seleção múltipla

5. **`initNavigation()`** (app_migrated.html:2423)
   - Controla toda navegação do sistema
   - Carrega módulos sob demanda
   - Base do sistema SPA

#### **Top 5 - Backend**

1. **`listActivitiesApi()`** (activities.gs:3)
   - API mais chamada do sistema
   - Integra dados de múltiplas tabelas
   - Calcula estatísticas de participação
   - Usa: activities, usuarios, categorias_atividades, participacoes

2. **`saveTargetsDirectly()`** (participacoes.gs:398)
   - Define alvos para atividades
   - Gerencia adição e remoção
   - Usa soft delete
   - Gera IDs sequenciais

3. **`updateActivityWithTargets()`** (activities.gs:443)
   - Atualiza atividade e alvos atomicamente
   - Validações complexas
   - Auditoria completa

4. **`authenticateUser()`** (auth.gs:7, via loginUser)
   - Autenticação segura
   - Cria sessões
   - Integra com SecurityManager

5. **`_listActivitiesCore()`** (activities.gs:127)
   - Core da listagem de atividades
   - Enriquece dados com joins
   - Base para getActivityById

---

## 📚 REFERÊNCIA RÁPIDA

### APIs Principais (Frontend → Backend)

| Função Frontend | Chama Backend | Arquivo Backend | Linha |
|----------------|---------------|-----------------|-------|
| `doLogin()` | `authenticateUser()` | auth.gs | 7 |
| `logout()` | `logoutUser()` | auth.gs | 90 |
| `loadCurrentUser()` | `getCurrentLoggedUser()` | auth.gs | (inferida) |
| `loadActivities()` | `listActivitiesApi()` | activities.gs | 3 |
| `submitActivity()` | `createActivity()` | activities.gs | 56 |
| `loadActivityForEdit()` | `getActivityById()` | activities.gs | 530 |
| `updateActivity()` | `updateActivityWithTargets()` | activities.gs | 443 |
| `completeActivity()` | `completeActivity()` | activities.gs | 19 |
| `loadCategories()` | `listCategoriasAtividadesApi()` | activities_categories.gs | 3 |
| `loadResponsibleUsers()` | `listUsuariosApi()` | auth.gs | (inferida) |
| `renderParticipantsForModal()` | `listMembersApi()` | members.gs | 7 |
| `loadActivityForParticipants()` | `listParticipacoes()` | participacoes.gs | 6 |
| `saveParticipants()` | `updateParticipations()` | participacoes.gs | (inferida) |
| `searchMembersForTargets()` | `searchMembersByCriteria()` | participacoes.gs | 267 |
| `saveTargets()` | `saveTargetsDirectly()` | participacoes.gs | 398 |
| `saveAllParticipations()` | `saveParticipacaoDirectly()` | participacoes.gs | 580 |

### Fluxo de Dados Completo

```
┌─────────────────────────────────────────────────┐
│          FRONTEND (app_migrated.html)           │
│  • Interface do usuário (HTML/CSS/JS)           │
│  • Validações de formulário                     │
│  • Gerenciamento de estado (localStorage)       │
│  • Renderização de componentes                  │
└────────────────┬────────────────────────────────┘
                 │ google.script.run
                 ↓
┌─────────────────────────────────────────────────┐
│         API LAYER (02-api/*.gs)                 │
│  • main_migrated.gs: doGet() - ponto de entrada │
│  • Serialização de objetos para HTML            │
└────────────────┬────────────────────────────────┘
                 │ chama funções de negócio
                 ↓
┌─────────────────────────────────────────────────┐
│       BUSINESS LAYER (01-business/*.gs)         │
│  • auth.gs: Autenticação e sessões              │
│  • activities.gs: CRUD de atividades            │
│  • members.gs: CRUD de membros                  │
│  • participacoes.gs: Gestão de participações    │
│  • activities_categories.gs: Categorias         │
│  • menu.gs: Menu e navegação                    │
└────────────────┬────────────────────────────────┘
                 │ usa abstrações
                 ↓
┌─────────────────────────────────────────────────┐
│         CORE LAYER (00-core/*.gs)               │
│  • DatabaseManager: Abstração de acesso a dados │
│  • data_dictionary.gs: Mapeamento de tabelas    │
│  • SecurityManager: Segurança                   │
│  • SessionManager: Gerenciamento de sessões     │
│  • Logger: Sistema de logs                      │
│  • Helpers: Funções utilitárias                 │
└────────────────┬────────────────────────────────┘
                 │ acessa
                 ↓
┌─────────────────────────────────────────────────┐
│          GOOGLE SHEETS (Planilhas)              │
│  • Aba "atividades"                             │
│  • Aba "membros"                                │
│  • Aba "participacoes"                          │
│  • Aba "usuarios"                               │
│  • Aba "categorias_atividades"                  │
│  • Aba "sessions"                               │
└─────────────────────────────────────────────────┘
```

### Mapa de Dependências Principais

```
app_migrated.html
  ├─ authenticateUser() [auth.gs]
  │    ├─ SecurityManager.secureLogin()
  │    ├─ createSession()
  │    └─ Logger.info()
  │
  ├─ listActivitiesApi() [activities.gs]
  │    ├─ _listActivitiesCore()
  │    │    ├─ getActivitiesCtx_()
  │    │    │    ├─ getPlanRef_('atividades')
  │    │    │    └─ getContextFromRef_()
  │    │    ├─ getFullTableValues_(ctx)
  │    │    ├─ getUsersMapReadOnly_()
  │    │    │    └─ readTableByNome_('usuarios')
  │    │    ├─ getCategoriasAtividadesMapReadOnly_()
  │    │    │    └─ _listCategoriasAtividadesCore()
  │    │    └─ getParticipacaoStats(activityId)
  │    │         └─ listParticipacoes(activityId)
  │    └─ JSON.parse(JSON.stringify(result))
  │
  ├─ createActivity() [activities.gs]
  │    ├─ CategoriaManager.validateMultipleCategorias()
  │    ├─ getActivitiesCtx_()
  │    ├─ generateSequentialId_('ACT-', ids, 4)
  │    └─ nowString_()
  │
  ├─ updateActivityWithTargets() [activities.gs]
  │    ├─ validateCategoriaAtividade_() [loop]
  │    ├─ getActivitiesCtx_()
  │    ├─ saveTargetsDirectly()
  │    │    ├─ readTableByNome_('participacoes')
  │    │    ├─ generateSequentialId_('PART-', ids, 4)
  │    │    └─ nowString_()
  │    └─ getUsersMapReadOnly_()
  │
  ├─ listMembersApi() [members.gs]
  │    ├─ _listMembersCore()
  │    │    └─ readTableByNome_('membros')
  │    └─ JSON.parse(JSON.stringify(result))
  │
  ├─ searchMembersByCriteria() [participacoes.gs]
  │    └─ DatabaseManager.query('membros', {}, false)
  │
  ├─ listParticipacoes() [participacoes.gs]
  │    └─ DatabaseManager.query('participacoes', filters, false)
  │
  ├─ saveParticipacaoDirectly() [participacoes.gs]
  │    ├─ updateParticipacaoById()
  │    │    ├─ DatabaseManager.findByField('participacoes', 'id', id)
  │    │    └─ DatabaseManager.update('participacoes', id, data)
  │    └─ markParticipacao()
  │         ├─ DatabaseManager.query('participacoes', filters, false)
  │         └─ DatabaseManager.update('participacoes', id, data)
  │
  └─ listCategoriasAtividadesApi() [activities_categories.gs]
       ├─ _listCategoriasAtividadesCore()
       │    └─ readTableByNome_('categorias_atividades')
       └─ JSON.parse(JSON.stringify(result))
```

---

## ⚙️ COMO USAR ESTE DOCUMENTO

### Para Criar Novo CRUD

1. **Definir a Entidade**
   - Criar tabela no data_dictionary.gs
   - Definir campos e tipos

2. **Criar Business Layer** (01-business/nome_entidade.gs)
   ```javascript
   function listNomeEntidadeApi() {
     try {
       const result = _listNomeEntidadeCore();
       return JSON.parse(JSON.stringify(result));
     } catch (err) {
       return { ok: false, error: 'Erro: ' + err.message };
     }
   }

   function _listNomeEntidadeCore() {
     const { values, headerIndex } = readTableByNome_('nome_entidade');
     // ... processamento
     return { ok: true, items: items };
   }

   function createNomeEntidade(payload, uidCriador) {
     // Seguir padrão de createActivity()
   }

   function updateNomeEntidade(input, uidEditor) {
     // Seguir padrão de updateActivityWithTargets()
   }

   function getNomeEntidadeById(id) {
     // Seguir padrão de getActivityById()
   }
   ```

3. **Criar Frontend** (app_migrated.html)
   ```javascript
   // Inicialização
   function initNomeEntidade() {
     loadNomeEntidade();
   }

   // Listagem
   function loadNomeEntidade() {
     google.script.run
       .withSuccessHandler(function(result) {
         if (result.ok) renderNomeEntidade(result.items);
       })
       .withFailureHandler(function(error) {
         showToast('Erro: ' + error, 'error');
       })
       .listNomeEntidadeApi();
   }

   // Criação
   function submitNomeEntidade(event) {
     event.preventDefault();
     // validações
     google.script.run
       .withSuccessHandler(function(result) {
         if (result.ok) {
           showToast('Criado!', 'success');
           loadNomeEntidade();
         }
       })
       .withFailureHandler(function(error) {
         showToast('Erro: ' + error, 'error');
       })
       .createNomeEntidade(formData, uid);
   }
   ```

### Para Adicionar Nova Função Backend

1. **Seguir padrão de resposta:**
   ```javascript
   function minhaNovaFuncao(parametros) {
     try {
       // 1. Validações
       if (!parametros.campo) {
         return { ok: false, error: 'Campo obrigatório.' };
       }

       // 2. Processamento
       const resultado = processar(parametros);

       // 3. Sucesso
       return { ok: true, dados: resultado };
     } catch (err) {
       // 4. Erro
       return { ok: false, error: 'Erro: ' + err.message };
     }
   }
   ```

2. **Adicionar chamada no frontend:**
   ```javascript
   function minhaFuncaoFrontend() {
     if (typeof google !== 'undefined' && google.script && google.script.run) {
       google.script.run
         .withSuccessHandler(function(result) {
           if (result && result.ok) {
             // processar result.dados
           } else {
             console.error(result && result.error);
           }
         })
         .withFailureHandler(function(error) {
           console.error('Erro:', error);
         })
         .minhaNovaFuncao(parametros);
     } else {
       console.warn('google.script.run não disponível');
     }
   }
   ```

### Para Debugar Problema

1. **Identificar a camada:**
   - Frontend? Abrir DevTools do navegador
   - Backend? Usar console.log e Logger.info

2. **Verificar fluxo:**
   - Usar este documento para seguir o fluxo de dados
   - Verificar se todos os elos da cadeia estão funcionando

3. **Testar isoladamente:**
   - Testar função backend no Script Editor
   - Testar função frontend no Console do navegador

---

## 📊 ESTATÍSTICAS FINAIS

### Complexidade do Código

| Métrica | Valor |
|---------|-------|
| **Funções Frontend** | 105 |
| **Funções Backend** | 17 (únicas) |
| **Chamadas Backend** | 29 (total) |
| **Linhas HTML/CSS/JS** | 7.675 |
| **Linhas Backend (total)** | ~2.500 |
| **Arquivos Backend** | 6 |
| **Tabelas/Entidades** | 6+ |
| **Módulos Frontend** | 9 |

### Cobertura de Funcionalidades

- ✅ **Autenticação:** Completa (login, logout, sessões)
- ✅ **Atividades:** CRUD completo + filtros + categorias múltiplas
- ✅ **Membros:** Listagem + busca avançada
- ✅ **Participações:** CRUD completo + estatísticas
- ✅ **Alvos:** Sistema completo de seleção e gerenciamento
- ⚠️ **Relatórios:** Básico (sem backend integration)
- ⚠️ **Práticas:** Local apenas (sem backend integration)
- ❌ **Configurações:** Não implementado

---

## 🎯 CONCLUSÃO

O **Sistema Dojotai** é um projeto bem estruturado com arquitetura em camadas clara, seguindo padrões consistentes de desenvolvimento. A separação entre frontend (SPA) e backend (Google Apps Script) permite escalabilidade e manutenção facilitadas.

**Pontos Fortes:**
- Arquitetura modular e bem organizada
- Padrões de código consistentes
- Sistema de auditoria robusto
- Design system unificado

**Áreas de Melhoria:**
- Documentação inline (JSDoc)
- Testes automatizados
- Performance (paginação, cache)
- Validações compartilhadas

Este documento serve como **referência técnica completa** para desenvolvedores que precisam entender, manter ou expandir o sistema.

---

**Documento gerado por:** Claude Code
**Data:** 2025-01-10
**Versão:** 1.0.0
