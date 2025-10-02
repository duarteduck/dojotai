# GUIA DE DESENVOLVIMENTO - Sistema Dojotai

**Versão:** 1.0  
**Última atualização:** 01/10/2025  
**Baseado em:** ANALISE_SISTEMA.md  
**Público-alvo:** Desenvolvedores do Sistema Dojotai

---

## 📑 ÍNDICE

1. [Introdução](#1-introdução)
2. [Setup do Ambiente](#2-setup-do-ambiente)
3. [Arquitetura do Sistema](#3-arquitetura-do-sistema)
4. [Workflows de Desenvolvimento](#4-workflows-de-desenvolvimento)
5. [Padrões de Código](#5-padrões-de-código)
6. [Guia de APIs](#6-guia-de-apis)
7. [Troubleshooting](#7-troubleshooting)
8. [Boas Práticas](#8-boas-práticas)
9. [Referência Rápida](#9-referência-rápida)

---

## 1. INTRODUÇÃO

### 1.1 Sobre Este Guia

Este guia documenta os **padrões reais** utilizados no Sistema Dojotai, baseado em análise técnica completa do código-fonte realizada em 01/10/2025. Todos os exemplos são extraídos diretamente do sistema em produção.

### 1.2 Visão Geral do Sistema

O **Sistema Dojotai** é uma aplicação web desenvolvida sobre Google Apps Script para gestão de atividades, membros e participações em dojos.

**Tecnologias:**
- Frontend: Single Page Application (SPA) em Vanilla JavaScript
- Backend: Google Apps Script com arquitetura em 3 camadas
- Banco de Dados: Google Sheets
- Deploy: Clasp CLI

### 1.3 Métricas do Sistema (Real)

Baseado na análise técnica de 01/10/2025:

```
Frontend:
- Total de funções: 105 funções JavaScript
- Linhas de código: 7.675 linhas (app_migrated.html)
- Módulos: 9 módulos principais

Backend:
- Total de funções únicas: 17 funções
- Chamadas mapeadas: 29 chamadas
- Arquivos envolvidos: 6 arquivos
- Linhas de código: ~2.500 linhas

Arquitetura:
- Camadas: 3 (API, Business, Core)
- Tabelas/Entidades: 6+
- Complexidade: Alta
```

### 1.4 Funcionalidades Implementadas

- Autenticação segura (SHA-256)
- CRUD de atividades com categorias múltiplas
- Sistema de alvos (seleção de membros)
- Gestão de participações com soft delete
- Filtros avançados e busca
- Dark mode e design responsivo
- Auditoria completa de operações

---

## 2. SETUP DO AMBIENTE

### 2.1 Pré-requisitos

```bash
# Node.js (versão 14+)
node --version

# npm
npm --version

# Git
git --version

# Conta Google com acesso ao Apps Script
```

### 2.2 Instalação do Clasp

```bash
# Instalar clasp globalmente
npm install -g @google/clasp

# Verificar instalação
clasp --version

# Login
clasp login
```

### 2.3 Clone do Projeto

```bash
# Opção 1: Clone via clasp
clasp clone <SCRIPT_ID>

# Opção 2: Clone via Git + clasp
git clone <url-repositorio>
cd sistema-dojotai
```

**Nota:** O SCRIPT_ID está na URL: `https://script.google.com/d/<SCRIPT_ID>/edit`

### 2.4 Estrutura de Arquivos (Real)

```
sistema-dojotai/
├── .clasp.json
├── appsscript.json
├── app_migrated.html          # 7.675 linhas (Frontend SPA)
├── src/
│   ├── 00-core/               # Infraestrutura
│   │   ├── 00_config.gs
│   │   ├── data_dictionary.gs
│   │   ├── database_manager.gs
│   │   └── session_manager.gs
│   ├── 01-business/           # Lógica de negócio
│   │   ├── auth.gs
│   │   ├── activities.gs
│   │   ├── members.gs
│   │   ├── participacoes.gs
│   │   └── activities_categories.gs
│   └── 02-api/                # API Layer
│       └── main_migrated.gs
└── docs/
    ├── ANALISE_SISTEMA.md     # Análise técnica
    ├── MAPA_CODIGO.md
    └── TAREFAS.md
```

### 2.5 Configuração

**Arquivo `.clasp.json`:**
```json
{
  "scriptId": "<SEU_SCRIPT_ID>",
  "rootDir": "."
}
```

**Arquivo `appsscript.json`:**
```json
{
  "timeZone": "America/Sao_Paulo",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

### 2.6 Deploy

```bash
# Push para Apps Script
clasp push

# Abrir editor
clasp open

# Ver logs
clasp logs
```

### 2.7 Configurar Web App

1. No Apps Script Editor: **Deploy > New deployment**
2. Tipo: **Web app**
3. Execute as: **Me**
4. Who has access: **Anyone with Google account**
5. Deploy e copie a URL

---

## 3. ARQUITETURA DO SISTEMA

### 3.1 Visão Geral (3 Camadas)

```
┌─────────────────────────────────────────┐
│   FRONTEND (app_migrated.html)          │
│   • 105 funções JavaScript               │
│   • 7.675 linhas                         │
│   • SPA com sistema de navegação        │
└──────────────┬──────────────────────────┘
               │ google.script.run
               ↓
┌─────────────────────────────────────────┐
│   API LAYER (02-api/main_migrated.gs)   │
│   • doGet() - ponto de entrada          │
│   • Serialização para HTML              │
└──────────────┬──────────────────────────┘
               │ chama Business Layer
               ↓
┌─────────────────────────────────────────┐
│   BUSINESS LAYER (01-business/*.gs)     │
│   • auth.gs                              │
│   • activities.gs                        │
│   • members.gs                           │
│   • participacoes.gs                     │
│   • activities_categories.gs            │
└──────────────┬──────────────────────────┘
               │ usa Core Layer
               ↓
┌─────────────────────────────────────────┐
│   CORE LAYER (00-core/*.gs)             │
│   • DatabaseManager                      │
│   • data_dictionary.gs                   │
│   • SecurityManager                      │
│   • SessionManager                       │
│   • Logger                               │
└──────────────┬──────────────────────────┘
               │ acessa
               ↓
┌─────────────────────────────────────────┐
│   GOOGLE SHEETS                          │
│   • atividades                           │
│   • membros                              │
│   • participacoes                        │
│   • usuarios                             │
│   • categorias_atividades                │
│   • sessions                             │
└─────────────────────────────────────────┘
```

### 3.2 Ponto de Entrada (Real)

**Arquivo:** `src/02-api/main_migrated.gs`

```javascript
function doGet(e) {
  const tmpl = HtmlService.createTemplateFromFile('app_migrated');
  return tmpl.evaluate()
    .setTitle('Sistema Dojotai - Migrado')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
```

### 3.3 Principais Módulos Frontend (Real)

Baseado em `app_migrated.html` (análise de 01/10/2025):

1. **Sistema de Navegação** (3 funções)
   - `initNavigation()`
   - `navigateToPage(targetPage)`
   - `toggleMobileMenu()`

2. **Autenticação e Sessão** (6 funções)
   - `doLogin(event)`
   - `showLogin()`
   - `logout()`
   - `loadCurrentUser()`
   - `checkAuthAndInit()`
   - `showApp()`

3. **Gestão de Atividades** (15 funções)
   - `initActivities()`
   - `loadActivities()`
   - `renderActivities()`
   - `createActivityModal()`
   - `submitActivity()`
   - `editActivity(id)`
   - `updateActivity(id)`
   - `completeActivity(id)`
   - E mais...

4. **Sistema de Filtros** (10 funções)
   - `initFiltrosSystem()`
   - `aplicarFiltros()`
   - `renderizarChips()`
   - E mais...

5. **Participações/Alvos** (12 funções)
   - `openParticipantsModal(activityId)`
   - `saveAllParticipations(activityId)`
   - E mais...

6. **Sistema de Alvos** (20 funções)
   - `toggleTargetsSection(mode, activityId)`
   - `searchMembersForTargets(mode)`
   - `saveTargets(mode, activityId)`
   - E mais...

7. **Práticas Diárias** (10 funções)
8. **Relatórios** (5 funções)
9. **Utilitários** (15 funções)

**Total: 105 funções mapeadas**

### 3.4 Fluxo de Dados Completo (Exemplo Real)

**Criar atividade:**

```
1. submitActivity() valida formulário (app_migrated.html)
   ↓
2. google.script.run.createActivity(formData, uid)
   ↓
3. createActivity() em activities.gs:56
   ↓
4. CategoriaManager.validateMultipleCategorias()
   ↓
5. getActivitiesCtx_()
   ↓
6. generateSequentialId_('ACT-', ids, 4)
   ↓
7. sheet.getRange().setValues([rowArray])
   ↓
8. return {ok: true, id: 'ACT-0001'}
   ↓
9. Frontend atualiza UI
```

---

## 4. WORKFLOWS DE DESENVOLVIMENTO

### 4.1 Criar Nova Funcionalidade Backend

#### Passo 1: Definir Entidade em data_dictionary.gs

```javascript
const TABLES = {
  minha_entidade: {
    sheetName: 'minha_entidade',
    range: 'A1:J1000',
    fields: ['id', 'nome', 'descricao', 'status', 
             'criado_em', 'atualizado_em', 'atualizado_uid', 'deleted'],
    requiredFields: ['id', 'nome'],
    foreignKeys: {
      'atualizado_uid': 'usuarios.uid'
    }
  }
};
```

#### Passo 2: Criar Business Layer (Exemplo Real)

**Arquivo:** `src/01-business/minha_entidade.gs`

```javascript
/**
 * Lista entidades (padrão real do sistema)
 * Baseado em: activities.gs:3
 */
function listMinhaEntidadeApi() {
  try {
    const result = _listMinhaEntidadeCore();
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}

/**
 * Core de listagem (padrão real)
 * Baseado em: activities.gs:127
 */
function _listMinhaEntidadeCore() {
  const { values, headerIndex } = readTableByNome_('minha_entidade');
  
  const items = [];
  for (let i = 1; i < values.length; i++) {
    const row = values[i];
    
    // Soft delete filter (padrão real)
    const deleted = String(row[headerIndex['deleted']] || '').trim().toLowerCase();
    if (deleted === 'x') continue;
    
    items.push({
      id: row[headerIndex['id']],
      nome: row[headerIndex['nome']],
      descricao: row[headerIndex['descricao']],
      status: row[headerIndex['status']]
    });
  }
  
  return { ok: true, items: items };
}

/**
 * Cria entidade (padrão real do sistema)
 * Baseado em: activities.gs:56
 */
function createMinhaEntidade(payload, uidCriador) {
  try {
    // 1. Validações
    const nome = (payload && payload.nome || '').toString().trim();
    if (!nome) return { ok: false, error: 'Nome obrigatório.' };
    
    // 2. Contexto
    const ctx = getContextFromTableName_('minha_entidade');
    const { values, headerIndex } = readTableByNome_('minha_entidade');
    
    // 3. Geração de ID sequencial (padrão real)
    const idxId = headerIndex['id'];
    const ids = values.slice(1).map(r => (r[idxId] || '').toString());
    const nextId = generateSequentialId_('ENT-', ids, 4);
    
    // 4. Preparar dados
    const nowStr = nowString_();
    const rowArray = new Array(ctx.header.length).fill('');
    rowArray[headerIndex['id']] = nextId;
    rowArray[headerIndex['nome']] = nome;
    rowArray[headerIndex['descricao']] = payload.descricao || '';
    rowArray[headerIndex['status']] = payload.status || 'Ativo';
    rowArray[headerIndex['criado_em']] = nowStr;
    rowArray[headerIndex['atualizado_em']] = nowStr;
    rowArray[headerIndex['atualizado_uid']] = uidCriador;
    rowArray[headerIndex['deleted']] = '';
    
    // 5. Inserção (padrão real)
    const targetRow = ctx.sheet.getLastRow() + 1;
    ctx.sheet.getRange(targetRow, ctx.startCol, 1, ctx.header.length)
      .setValues([rowArray]);
    
    // 6. Return (padrão real)
    return { ok: true, id: nextId };
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}

/**
 * Atualiza entidade (padrão real)
 * Baseado em: activities.gs:443
 */
function updateMinhaEntidade(input, uidEditor) {
  try {
    if (!input || !input.id) {
      return { ok: false, error: 'ID não informado.' };
    }
    
    const patch = input.patch || {};
    
    // Contexto e busca
    const ctx = getContextFromTableName_('minha_entidade');
    const { values, headerIndex } = readTableByNome_('minha_entidade');
    
    const rowIndex = values.findIndex((r, i) => 
      i > 0 && r[headerIndex['id']] === input.id
    );
    
    if (rowIndex === -1) {
      return { ok: false, error: 'Não encontrado.' };
    }
    
    // Atualização (padrão real)
    const sheet = ctx.sheet;
    const rowNumber = ctx.startRow + rowIndex;
    
    function setIfPresent(colName, value) {
      const c = headerIndex[colName];
      if (c != null) sheet.getRange(rowNumber, c+1).setValue(value);
    }
    
    if (patch.nome != null) setIfPresent('nome', patch.nome);
    if (patch.descricao != null) setIfPresent('descricao', patch.descricao);
    if (patch.status != null) setIfPresent('status', patch.status);
    
    // Auditoria (padrão real)
    const now = nowString_();
    setIfPresent('atualizado_em', now);
    setIfPresent('atualizado_uid', uidEditor);
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}
```

#### Passo 3: Integração Frontend (Padrão Real)

**Em app_migrated.html:**

```javascript
/**
 * Carrega entidades (padrão real do sistema)
 * Baseado em: loadActivities() linha 2936
 */
function loadMinhaEntidade() {
  if (typeof google !== 'undefined' && google.script && google.script.run) {
    google.script.run
      .withSuccessHandler(function(result) {
        if (result && result.ok) {
          renderMinhaEntidade(result.items);
        } else {
          console.error(result && result.error);
          showToast(result && result.error || 'Erro desconhecido', 'error');
        }
      })
      .withFailureHandler(function(error) {
        console.error('Falha:', error);
        showToast('Erro: ' + error, 'error');
      })
      .listMinhaEntidadeApi();
  } else {
    console.warn('google.script.run não disponível');
  }
}

/**
 * Submete formulário (padrão real)
 * Baseado em: submitActivity() linha 5426
 */
function submitMinhaEntidade(event) {
  event.preventDefault();
  
  // Validações frontend
  const nome = document.getElementById('entidade-nome').value.trim();
  if (!nome) {
    showToast('Nome é obrigatório', 'error');
    return;
  }
  
  // Monta payload
  const formData = {
    nome: nome,
    descricao: document.getElementById('entidade-descricao').value.trim(),
    status: document.getElementById('entidade-status').value
  };
  
  // Loading state (padrão real)
  showLoadingButton('btn-submit-entidade', true);
  
  // Chamada backend
  google.script.run
    .withSuccessHandler(function(result) {
      showLoadingButton('btn-submit-entidade', false);
      if (result && result.ok) {
        showToast('Criado com sucesso!', 'success');
        closeModal('modal-entidade');
        loadMinhaEntidade();
      } else {
        showToast(result && result.error, 'error');
      }
    })
    .withFailureHandler(function(error) {
      showLoadingButton('btn-submit-entidade', false);
      showToast('Erro: ' + error, 'error');
    })
    .createMinhaEntidade(formData, currentUser.uid);
}
```

### 4.2 Modificar Funcionalidade Existente

#### Fluxo Seguro:

1. **Identificar o arquivo** usando `MAPA_CODIGO.md` ou `ANALISE_SISTEMA.md`
2. **Fazer backup** do arquivo original
3. **Modificar** seguindo os padrões existentes
4. **Testar localmente** (se possível)
5. **Deploy incremental:**
   ```bash
   clasp push
   clasp open
   # Testar no Apps Script Editor
   ```
6. **Verificar logs:**
   ```bash
   clasp logs
   ```
7. **Rollback se necessário:**
   ```bash
   # Reverter commit ou restaurar backup
   ```

---

## 5. PADRÕES DE CÓDIGO

### 5.1 Padrão de API Response (Real)

**TODAS as funções backend seguem este padrão:**

```javascript
// SUCESSO
{
  ok: true,
  items?: Array,      // para listagens
  item?: Object,      // para get por ID
  id?: string,        // para create
  created?: number,   // para batch
  stats?: Object,     // para estatísticas
  message?: string
}

// ERRO
{
  ok: false,
  error: string
}
```

**Exemplos reais do sistema:**

```javascript
// activities.gs:3
return { ok: true, items: items };

// activities.gs:56
return { ok: true, id: nextId };

// activities.gs:443
return { ok: false, error: 'ID não informado.' };
```

### 5.2 Padrão de CRUD (Real)

#### CREATE (Exemplo: activities.gs:56)

```javascript
function createActivity(payload, uidCriador) {
  try {
    // 1. Validações
    if (!payload.titulo) return { ok: false, error: 'Título obrigatório.' };
    
    // 2. Validação de Negócio
    if (payload.categorias_ids) {
      const validationResult = CategoriaManager.validateMultipleCategorias(
        payload.categorias_ids
      );
      if (!validationResult.isValid) {
        return { ok: false, error: validationResult.error };
      }
    }
    
    // 3. Contexto
    const ctx = getActivitiesCtx_();
    const all = getFullTableValues_(ctx);
    
    // 4. Geração de ID
    const ids = all.slice(1).map(r => (r[idxId]||'').toString());
    const nextId = generateSequentialId_('ACT-', ids, 4);
    
    // 5. Preparar dados
    const nowStr = nowString_();
    const rowArray = [...]; // todos os campos
    
    // 6. Inserção
    const targetRow = ctx.sheet.getLastRow() + 1;
    ctx.sheet.getRange(targetRow, ctx.startCol, 1, header.length)
      .setValues([rowArray]);
    
    // 7. Return
    return { ok: true, id: nextId };
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}
```

#### READ (Exemplo: activities.gs:3)

```javascript
function listActivitiesApi() {
  try {
    const result = _listActivitiesCore();
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}

function _listActivitiesCore() {
  const ctx = getActivitiesCtx_();
  const values = getFullTableValues_(ctx);
  // ... processamento
  return { ok: true, items: items };
}
```

#### UPDATE (Exemplo: activities.gs:443)

```javascript
function updateActivityWithTargets(input, uidEditor) {
  try {
    if (!input || !input.id) {
      return { ok: false, error: 'ID não informado.' };
    }
    
    const patch = input.patch || {};
    
    // Buscar registro
    const ctx = getActivitiesCtx_();
    const values = getFullTableValues_(ctx);
    const rowIndex = values.findIndex((r, i) => 
      i > 0 && r[idx['id']] === input.id
    );
    
    if (rowIndex === -1) {
      return { ok: false, error: 'Não encontrado.' };
    }
    
    // Atualizar
    const sh = ctx.sheet;
    const rowNumber = ctx.startRow + rowIndex;
    
    function setIfPresent(colName, value) {
      const c = idx[colName];
      if (c != null) sh.getRange(rowNumber, c+1).setValue(value);
    }
    
    if (patch.titulo != null) setIfPresent('titulo', patch.titulo);
    // ... outros campos
    
    // Auditoria
    const now = nowString_();
    setIfPresent('atualizado_em', now);
    setIfPresent('atualizado_uid', uidEditor);
    
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}
```

### 5.3 Padrão de Chamada ao Backend (Real)

**Exemplo do sistema (app_migrated.html):**

```javascript
if (typeof google !== 'undefined' && google.script && google.script.run) {
  google.script.run
    .withSuccessHandler(function(result) {
      if (result && result.ok) {
        // Sucesso
      } else {
        console.error(result && result.error || 'Erro desconhecido');
      }
    })
    .withFailureHandler(function(error) {
      console.error('Falha:', error);
    })
    .nomeDaFuncao(parametros);
} else {
  console.warn('google.script.run não disponível');
}
```

### 5.4 Padrão de Validação (Real)

#### Frontend (antes de enviar):

```javascript
// Exemplo real: submitActivity() linha 5426
function submitActivity(event) {
  event.preventDefault();
  
  // Validações básicas
  const titulo = document.getElementById('activity-titulo').value.trim();
  if (!titulo) {
    showToast('Título é obrigatório', 'error');
    return;
  }
  
  // Validações de formato
  const data = document.getElementById('activity-data').value;
  if (data && !isValidDate(data)) {
    showToast('Data inválida', 'error');
    return;
  }
  
  // Monta payload
  const formData = { ... };
  
  // Envia
  google.script.run
    .withSuccessHandler(...)
    .createActivity(formData, uid);
}
```

#### Backend (revalidação):

```javascript
// Exemplo real: activities.gs:56
function createActivity(payload, uidCriador) {
  try {
    // Revalidação
    const titulo = (payload && payload.titulo || '').toString().trim();
    if (!titulo) return { ok: false, error: 'Título obrigatório.' };
    
    // Validação de negócio
    const categorias_ids = (payload && payload.categorias_ids || '').toString().trim();
    if (categorias_ids) {
      const validationResult = CategoriaManager.validateMultipleCategorias(categorias_ids);
      if (!validationResult.isValid) {
        return { ok: false, error: validationResult.error };
      }
    }
    
    // Processa se OK
    // ...
  } catch (err) {
    return { ok: false, error: 'Erro: ' + err.message };
  }
}
```

### 5.5 Padrão de Loading States (Real)

```javascript
// Função real do sistema
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
  .createActivity(formData, uid);
```

### 5.6 Padrão de DatabaseManager (Real)

**O sistema usa DatabaseManager como camada de abstração principal:**

```javascript
// ✅ API PÚBLICA RECOMENDADA (DatabaseManager)

// Query com filtros
const members = DatabaseManager.query('membros', { status: 'Ativo' }, false);

// Create
const result = DatabaseManager.create('participacoes', {
  id_atividade: 'ACT-0001',
  id_membro: 'M001'
});

// Update
const result = DatabaseManager.update('participacoes', 'PART-0001', {
  participou: 'sim'
});

// FindByField
const item = DatabaseManager.findByField('participacoes', 'id', 'PART-0001');
```

**Função interna `readTableByNome_()` (uso interno apenas):**

```javascript
// ⚠️ FUNÇÃO INTERNA - NÃO USAR DIRETAMENTE
// Apenas para referência (usada internamente pelas funções _Core)

const { values, headerIndex, ctx } = readTableByNome_('nome_tabela');

// Retorna:
// - values: Array com dados da planilha
// - headerIndex: Object mapeando nome_coluna → índice
// - ctx: Object com contexto (sheet, range, etc)
```

**Diferença importante:**

| Aspecto | `DatabaseManager` | `readTableByNome_()` |
|---------|------------------|---------------------|
| **Uso** | API pública | Função interna |
| **Quando usar** | Sempre que possível | Nunca diretamente |
| **Onde usar** | Business Layer | Dentro de funções `_Core()` |
| **Validações** | Automáticas | Nenhuma |
| **Cache** | Gerenciado | Manual |
| **Recomendação** | ✅ Usar | ❌ Evitar |

**Nota:** O underscore `_` no final de `readTableByNome_()` indica que é uma função **privada/interna** do sistema.

### 5.7 Padrão de Auditoria (Real)

**Todos os creates/updates registram:**

```javascript
// Campos padrão
{
  criado_em: '2025-01-10T10:30:00Z',      // CREATE
  atualizado_em: '2025-01-10T15:45:00Z',  // UPDATE
  atualizado_uid: 'U001',                 // UPDATE
  marcado_em: '2025-01-10T15:45:00Z',     // PARTICIPAÇÕES
  marcado_por: 'U001'                     // PARTICIPAÇÕES
}

// Função helper real
function nowString_() {
  return new Date().toISOString();
}
```

### 5.8 Padrão de Soft Delete (Real)

**Usado em participacoes.gs:**

```javascript
// Marcar como deletado
DatabaseManager.update('participacoes', 'PART-0001', {
  deleted: 'x'
});

// Ao listar, filtrar deletados
const participacoes = DatabaseManager.query('participacoes', filters, false)
  .filter(p => p.deleted !== 'x');
```

---

## 6. GUIA DE APIS

### 6.1 Tabela Completa de APIs (Real)

Baseado em ANALISE_SISTEMA.md - Todas as 17 APIs mapeadas:

| Função Frontend | Backend | Arquivo | Linha | Retorno |
|----------------|---------|---------|-------|---------|
| `doLogin()` | `authenticateUser()` | auth.gs | 7 | `{ok, user, session}` |
| `logout()` | `logoutUser()` | auth.gs | 90 | `{ok, message}` |
| `loadCurrentUser()` | `getCurrentLoggedUser()` | auth.gs | - | `{ok, user}` |
| `loadActivities()` | `listActivitiesApi()` | activities.gs | 3 | `{ok, items}` |
| `submitActivity()` | `createActivity()` | activities.gs | 56 | `{ok, id}` |
| `loadActivityForEdit()` | `getActivityById()` | activities.gs | 530 | `{ok, item}` |
| `updateActivity()` | `updateActivityWithTargets()` | activities.gs | 443 | `{ok}` |
| `completeActivity()` | `completeActivity()` | activities.gs | 19 | `{ok, status}` |
| `loadCategories()` | `listCategoriasAtividadesApi()` | activities_categories.gs | 3 | `{ok, items}` |
| `loadResponsibleUsers()` | `listUsuariosApi()` | auth.gs | - | `{ok, users}` |
| `renderParticipantsForModal()` | `listMembersApi()` | members.gs | 7 | `{ok, items}` |
| `searchMembersForTargets()` | `searchMembersByCriteria()` | participacoes.gs | 267 | `{ok, items}` |
| `loadActivityForParticipants()` | `listParticipacoes()` | participacoes.gs | 6 | `{ok, items}` |
| `saveTargets()` | `saveTargetsDirectly()` | participacoes.gs | 398 | `{ok, created, deleted}` |
| `saveAllParticipations()` | `saveParticipacaoDirectly()` | participacoes.gs | 580 | `{ok, message}` |
| `saveParticipants()` | `updateParticipations()` | participacoes.gs | - | `{ok, updated}` |
| `getParticipacaoStats()` | `getParticipacaoStats()` | participacoes.gs | 326 | `{ok, stats}` |

### 6.2 Detalhamento das APIs Principais

#### authenticateUser(usuario, password)

**Arquivo:** `auth.gs:7` (via loginUser)  
**Uso:** Login de usuário

```javascript
// Frontend
google.script.run
  .withSuccessHandler(function(result) {
    if (result.ok) {
      currentUser = result.user;
      sessionId = result.session.id;
      showApp();
    }
  })
  .authenticateUser(usuario, password);

// Backend
function authenticateUser(usuario, password) {
  // → SecurityManager.secureLogin()
  // → createSession()
  // → Logger.info()
  return {ok: true, user: {...}, session: {...}};
}
```

#### listActivitiesApi()

**Arquivo:** `activities.gs:3`  
**Uso:** Lista todas as atividades

```javascript
// Frontend
google.script.run
  .withSuccessHandler(function(result) {
    if (result.ok) {
      renderActivities(result.items);
    }
  })
  .listActivitiesApi();

// Backend (fluxo completo)
function listActivitiesApi() {
  // → _listActivitiesCore()
  //   → getActivitiesCtx_()
  //   → getFullTableValues_(ctx)
  //   → getUsersMapReadOnly_()
  //   → getCategoriasAtividadesMapReadOnly_()
  //   → getParticipacaoStats(activityId) [para cada]
  return {ok: true, items: [...]};
}
```

#### createActivity(payload, uidCriador)

**Arquivo:** `activities.gs:56`  
**Uso:** Cria nova atividade

```javascript
// Frontend
const formData = {
  titulo: 'Título',
  descricao: 'Descrição',
  data: '2025-01-15',
  categorias_ids: 'CAT-0001,CAT-0002'
};

google.script.run
  .withSuccessHandler(function(result) {
    if (result.ok) {
      console.log('Criado:', result.id);
    }
  })
  .createActivity(formData, currentUser.uid);

// Backend (fluxo)
function createActivity(payload, uidCriador) {
  // → CategoriaManager.validateMultipleCategorias()
  // → getActivitiesCtx_()
  // → generateSequentialId_('ACT-', ids, 4)
  // → sheet.getRange().setValues([rowArray])
  return {ok: true, id: 'ACT-0001'};
}
```

#### saveTargetsDirectly(activityId, memberIds, uid)

**Arquivo:** `participacoes.gs:398`  
**Uso:** Define alvos para uma atividade

```javascript
// Frontend
const memberIds = ['M001', 'M002', 'M003'];

google.script.run
  .withSuccessHandler(function(result) {
    if (result.ok) {
      console.log(`${result.created} criados, ${result.deleted} removidos`);
    }
  })
  .saveTargetsDirectly('ACT-0001', memberIds, currentUser.uid);

// Backend (fluxo)
function saveTargetsDirectly(activityId, memberIds, uid) {
  // → readTableByNome_('participacoes')
  // → [identifica novos e removidos]
  // → [marca removidos como deleted='x']
  // → generateSequentialId_('PART-', ids, 4)
  // → sheet.getRange().setValues([rowsToAdd])
  return {ok: true, created: 2, deleted: 1};
}
```

### 6.3 Mapa de Dependências (Real)

```
listActivitiesApi()
  ├─ _listActivitiesCore()
  │  ├─ getActivitiesCtx_()
  │  │  ├─ getPlanRef_('atividades')
  │  │  └─ getContextFromRef_()
  │  ├─ getFullTableValues_(ctx)
  │  ├─ getUsersMapReadOnly_()
  │  │  └─ readTableByNome_('usuarios')
  │  ├─ getCategoriasAtividadesMapReadOnly_()
  │  │  └─ _listCategoriasAtividadesCore()
  │  └─ getParticipacaoStats(activityId)
  │     └─ listParticipacoes(activityId)
  └─ JSON.parse(JSON.stringify(result))
```

---

## 7. TROUBLESHOOTING

### 7.1 Erros Comuns e Soluções

#### Erro: "google.script.run is not defined"

**Causa:** Código rodando fora do contexto do Apps Script

**Solução:**
```javascript
// Sempre verificar antes de usar
if (typeof google !== 'undefined' && google.script && google.script.run) {
  // Usar google.script.run
} else {
  console.warn('Ambiente de desenvolvimento local');
  // Usar dados mockados ou avisar usuário
}
```

#### Erro: "Cannot read property 'ok' of undefined"

**Causa:** Backend retornou `undefined` ou `null`

**Solução:**
```javascript
.withSuccessHandler(function(result) {
  if (result && result.ok) {
    // OK
  } else {
    console.error(result && result.error || 'Erro desconhecido');
  }
})
```

#### Erro: "A linha inicial do intervalo é muito pequena"

**Causa:** Cálculo incorreto da posição da linha na planilha

**Solução (padrão real do sistema):**
```javascript
// ❌ ERRADO
const sheetRowNumber = target.rowIndex + 1;

// ✅ CORRETO (participacoes.gs:540)
const startRow = ctx.range.getRow();
const sheetRowNumber = startRow + target.rowIndex;
```

#### Erro: "ID já existe"

**Causa:** Geração de ID não está considerando todos os registros

**Solução:**
```javascript
// Usar generateSequentialId_ corretamente
const { values, headerIndex } = readTableByNome_('tabela');
const idxId = headerIndex['id'];
const ids = values.slice(1).map(r => (r[idxId] || '').toString());
const nextId = generateSequentialId_('PREFIX-', ids, 4);
```

#### Erro: "Campo 'deleted' não existe"

**Causa:** Tabela não tem coluna 'deleted' ou range está incompleto

**Solução:**
```javascript
// 1. Verificar data_dictionary.gs
// 2. Expandir range na planilha
// 3. Adicionar coluna 'deleted' se necessário

// Exemplo real: participacoes.gs:74
range: 'A1:O1000'  // Incluir coluna O (deleted)
```

### 7.2 Debug no Apps Script

#### Método 1: Logger (backend)

```javascript
function minhaFuncao() {
  Logger.log('Iniciando função');
  Logger.log('Valor:', valor);
  Logger.log('Tipo:', typeof valor);
  
  // Ver logs: clasp logs
}
```

#### Método 2: Console no navegador (frontend)

```javascript
function minhaFuncao() {
  console.log('Estado atual:', currentState);
  console.table(arrayDeObjetos);
  console.error('Erro detectado:', erro);
  
  // Ver logs: F12 > Console
}
```

#### Método 3: Testes no Apps Script Editor

```javascript
function testMinhaFuncao() {
  const resultado = minhaFuncao('parametro-teste');
  Logger.log('Resultado:', JSON.stringify(resultado, null, 2));
}
```

### 7.3 Verificar Logs em Produção

```bash
# Logs em tempo real
clasp logs

# Logs com filtro de tempo
clasp logs --watch

# Logs simplificados
clasp logs --simplified
```

### 7.4 Rollback de Deploy

#### Opção 1: Via Git

```bash
# Ver histórico
git log --oneline

# Reverter commit
git revert <commit-hash>

# Push novamente
clasp push
```

#### Opção 2: Via Apps Script Editor

1. Abrir **Deploy > Manage deployments**
2. Selecionar versão anterior
3. Restaurar versão

#### Opção 3: Backup manual

```bash
# Antes de qualquer mudança crítica
cp -r src/ src_backup_$(date +%Y%m%d)/
```

### 7.5 Problemas de Performance

#### Sintoma: Lentidão ao listar atividades

**Causa:** `listActivitiesApi()` carrega TODOS os registros + estatísticas

**Soluções:**
1. Implementar paginação server-side
2. Limitar quantidade de registros retornados
3. Cache de estatísticas de participação
4. Lazy loading no frontend

```javascript
// Exemplo de paginação
function listActivitiesApi(page = 1, pageSize = 20) {
  const result = _listActivitiesCore();
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  
  return {
    ok: true,
    items: result.items.slice(start, end),
    total: result.items.length,
    page: page,
    pageSize: pageSize
  };
}
```

### 7.6 Problemas com Soft Delete

#### Sintoma: Registros deletados aparecem nas listas

**Causa:** Filtro `deleted !== 'x'` não aplicado

**Solução (padrão real):**
```javascript
// Sempre filtrar em listagens
const deleted = String(row[headerIndex['deleted']] || '').trim().toLowerCase();
if (deleted === 'x') continue;
```

---

## 8. BOAS PRÁTICAS

### 8.1 Checklist Antes de Modificar Código

```
[ ] Li ORIENTACAO_DIARIA.md hoje?
[ ] Consultei data_dictionary.gs?
[ ] Vou modificar MENOS de 3 arquivos?
[ ] A mudança NÃO afeta src/00-core/?
[ ] Tenho certeza que não vou quebrar nada?
[ ] Vou documentar a mudança?
[ ] Vou fazer backup antes?
```

### 8.2 Seguir Arquitetura em Camadas

✅ **CORRETO:**
```
Frontend (app_migrated.html)
  → API Layer (02-api/main_migrated.gs)
    → Business Layer (01-business/activities.gs)
      → Core Layer (00-core/database_manager.gs)
        → Google Sheets
```

❌ **ERRADO:**
```
Frontend → Google Sheets diretamente
Frontend → Core Layer (pular Business)
Business → Google Sheets (pular Core)
```

### 8.3 Sempre Usar DatabaseManager (API Pública)

✅ **CORRETO:**
```javascript
// Usar API pública do DatabaseManager
const result = DatabaseManager.query('membros', {status: 'Ativo'}, false);
const member = DatabaseManager.findByField('membros', 'id', 'M001');
```

❌ **ERRADO:**
```javascript
// NÃO acessar Google Sheets diretamente
const sheet = SpreadsheetApp.openById(ssid).getSheetByName('membros');
const values = sheet.getDataRange().getValues();

// NÃO usar função interna readTableByNome_ diretamente
const { values, headerIndex } = readTableByNome_('membros');
```

**Nota:** `readTableByNome_()` é uma função interna (underscore `_` no final) usada apenas dentro das funções `_Core()`. Use sempre `DatabaseManager.*` no Business Layer.

### 8.4 Sempre Validar Entrada

✅ **CORRETO:**
```javascript
function createActivity(payload, uidCriador) {
  // Validações
  const titulo = (payload && payload.titulo || '').toString().trim();
  if (!titulo) return { ok: false, error: 'Título obrigatório.' };
  
  // Processar
  // ...
}
```

❌ **ERRADO:**
```javascript
function createActivity(payload, uidCriador) {
  // Assumir que payload.titulo existe
  const titulo = payload.titulo;
  // ...
}
```

### 8.5 Usar Padrão de Response Unificado

✅ **CORRETO:**
```javascript
return { ok: true, id: nextId };
return { ok: false, error: 'Mensagem clara' };
```

❌ **ERRADO:**
```javascript
return nextId;  // Sem estrutura
throw new Error('Erro');  // Não trata no frontend
return { success: true };  // Padrão diferente
```

### 8.6 Implementar Auditoria

✅ **CORRETO:**
```javascript
// CREATE
rowArray[headerIndex['criado_em']] = nowString_();

// UPDATE
setIfPresent('atualizado_em', nowString_());
setIfPresent('atualizado_uid', uidEditor);
```

❌ **ERRADO:**
```javascript
// Sem auditoria - não sabe quem/quando modificou
```

### 8.7 Usar Soft Delete

✅ **CORRETO:**
```javascript
// Marcar como deletado
setIfPresent('deleted', 'x');

// Filtrar deletados
if (deleted === 'x') continue;
```

❌ **ERRADO:**
```javascript
// Deletar permanentemente
sheet.deleteRow(rowNumber);
```

### 8.8 Adicionar JSDoc (Melhoria Identificada)

✅ **BOM:**
```javascript
/**
 * Cria nova atividade
 * @param {Object} payload - Dados da atividade
 * @param {string} payload.titulo - Título obrigatório
 * @param {string} payload.descricao - Descrição opcional
 * @param {string} uidCriador - UID do usuário criador
 * @returns {Object} {ok: boolean, id?: string, error?: string}
 */
function createActivity(payload, uidCriador) {
  // ...
}
```

❌ **RUIM:**
```javascript
// Sem documentação
function createActivity(payload, uidCriador) {
  // ...
}
```

### 8.9 Evitar Código Duplicado

✅ **CORRETO:**
```javascript
// Criar função reutilizável
function showLoadingButton(buttonId, show) {
  const button = document.getElementById(buttonId);
  // ... lógica comum
}

// Usar em múltiplos lugares
showLoadingButton('btn-submit-activity', true);
showLoadingButton('btn-submit-member', true);
```

❌ **ERRADO:**
```javascript
// Duplicar lógica em cada lugar
function submitActivity() {
  const button = document.getElementById('btn-submit-activity');
  button.disabled = true;
  // ...
}

function submitMember() {
  const button = document.getElementById('btn-submit-member');
  button.disabled = true;
  // ...
}
```

### 8.10 Testar Antes do Deploy

```bash
# 1. Testar localmente (se possível)
# 2. Push para dev
clasp push

# 3. Testar no Apps Script Editor
clasp open

# 4. Executar função de teste
# function testMinhaFuncao() { ... }

# 5. Verificar logs
clasp logs

# 6. Se OK, deploy para produção
# Deploy > New deployment
```

---

## 9. REFERÊNCIA RÁPIDA

### 9.1 Comandos Clasp Essenciais

```bash
# Login
clasp login

# Clone projeto
clasp clone <SCRIPT_ID>

# Push código
clasp push

# Pull código (do Apps Script para local)
clasp pull

# Abrir editor
clasp open

# Ver logs
clasp logs
clasp logs --watch
clasp logs --simplified

# Ver versões
clasp versions

# Deploy
clasp deploy

# Listar deployments
clasp deployments
```

### 9.2 Estrutura de Arquivos

```
src/
├── 00-core/           → Infraestrutura (NÃO MODIFICAR sem permissão)
│   ├── data_dictionary.gs    → SEMPRE consultar
│   ├── database_manager.gs   → SEMPRE usar
│   └── session_manager.gs
├── 01-business/       → Lógica de negócio (modificar aqui)
│   ├── auth.gs
│   ├── activities.gs
│   └── ...
└── 02-api/            → API Layer (raramente modificar)
    └── main_migrated.gs
```

### 9.3 Arquivos de Documentação

| Arquivo | Conteúdo |
|---------|----------|
| `ANALISE_SISTEMA.md` | Análise técnica completa (01/10/2025) |
| `MAPA_CODIGO.md` | Estrutura detalhada do projeto |
| `GUIA_DESENVOLVIMENTO.md` | Este guia |
| `TAREFAS.md` | Planejamento e pendências |
| `CLAUDE_INSTRUCOES.md` | Regras para Claude Code |

### 9.4 Links Importantes

- **Apps Script Editor:** `https://script.google.com/d/<SCRIPT_ID>/edit`
- **Google Sheets:** `https://docs.google.com/spreadsheets/d/<SHEET_ID>/edit`
- **Clasp Docs:** https://github.com/google/clasp
- **Apps Script Docs:** https://developers.google.com/apps-script

### 9.5 Variáveis de Ambiente

```javascript
// Em 00_config.gs
const CONFIG = {
  SPREADSHEET_ID: 'ID_DA_PLANILHA',
  SESSION_TIMEOUT: 8 * 60 * 60 * 1000, // 8 horas
  LOG_LEVEL: 'INFO'
};
```

### 9.6 Atalhos do Apps Script Editor

- `Ctrl + S` - Salvar
- `Ctrl + Enter` - Executar função
- `Ctrl + F` - Buscar
- `Ctrl + H` - Substituir
- `Ctrl + /` - Comentar linha
- `F1` - Ajuda

### 9.7 Padrão de Nomenclatura

```javascript
// IDs de tabela
'ACT-0001'  // Atividades
'M001'      // Membros
'PART-0001' // Participações
'U001'      // Usuários
'CAT-0001'  // Categorias

// Funções
listMinhaEntidadeApi()      // Lista (pública)
_listMinhaEntidadeCore()    // Core (privada)
createMinhaEntidade()       // Criar
updateMinhaEntidade()       // Atualizar
getMinhaEntidadeById()      // Buscar por ID

// Variáveis
currentUser       // Estado global
currentData       // Dados atuais
is/has/should     // Booleans
```

### 9.8 Consulta Rápida de Padrões

```javascript
// 1. CRIAR
function create(payload, uid) {
  // validar → contexto → gerar ID → inserir → return {ok, id}
}

// 2. LISTAR
function listApi() {
  // try { _listCore() } catch { return {ok:false, error} }
}

// 3. ATUALIZAR
function update(input, uid) {
  // validar → buscar → atualizar → auditoria → return {ok}
}

// 4. CHAMAR BACKEND
google.script.run
  .withSuccessHandler(fn)
  .withFailureHandler(fn)
  .nomeFuncao(params);

// 5. RESPONSE
return { ok: true/false, ... }
```

---

## CONCLUSÃO

Este guia documenta os **padrões reais** do Sistema Dojotai baseado em análise técnica de 01/10/2025. Todos os exemplos são extraídos do código em produção.

**Pontos-chave:**
- Sempre seguir a arquitetura em 3 camadas
- Usar DatabaseManager para acesso a dados
- Seguir padrão de response `{ok: boolean, ...}`
- Implementar auditoria e soft delete
- Validar entrada no frontend E backend
- Documentar mudanças importantes

**Para dúvidas:**
1. Consultar este guia
2. Verificar `ANALISE_SISTEMA.md`
3. Consultar `MAPA_CODIGO.md`
4. Verificar código existente similar

**Lembre-se:** O sistema está bem estruturado - **mantenha os padrões!**

---

**Documento criado em:** 01/10/2025  
**Baseado em:** ANALISE_SISTEMA.md (análise técnica completa)  
**Versão:** 1.0.0  
**Próxima revisão:** Após mudanças significativas na arquitetura