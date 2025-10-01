# ⚙️ WORKFLOW PARA TAREFAS COMUNS

**Versão:** 2.0 - Pós-Auditoria | **Atualizado:** 30/09/2025

---

## 📋 ÍNDICE DE TAREFAS

1. [Adicionar campo em tabela](#1-adicionar-campo-em-tabela)
2. [Criar nova funcionalidade](#2-criar-nova-funcionalidade)
3. [Corrigir bug](#3-corrigir-bug)
4. [Criar nova tela](#4-criar-nova-tela)
5. [Modificar estilo/layout](#5-modificar-estilolayout)
6. [Adicionar nova API backend](#6-adicionar-nova-api-backend)
7. [Integrar nova API no frontend](#7-integrar-nova-api-no-frontend)

---

## 1️⃣ ADICIONAR CAMPO EM TABELA

### ✅ Checklist ANTES de começar:

```
[ ] Sei em qual tabela vou adicionar o campo?
[ ] Li o data_dictionary.gs para ver a estrutura atual?
[ ] O campo é realmente necessário?
[ ] Sei o tipo de dado (TEXT/NUMBER/DATE/DATETIME)?
[ ] Verifiquei se não existe um campo similar?
```

### 📍 Passo a passo:

#### PASSO 1: Atualizar Data Dictionary

**Arquivo:** `src/00-core/data_dictionary.gs`

```javascript
// Encontre a tabela (ex: membros)
membros: {
  fields: {
    // ... campos existentes ...
    
    // ✅ ADICIONAR NOVO CAMPO AQUI (sempre no final)
    observacoes: {
      type: 'TEXT',
      required: false,
      maxLength: 500,
      description: 'Observações sobre o membro',
      example: 'Possui restrição de horário'
    }
  }
}
```

**⚠️ IMPORTANTE:**
- Sempre adicione no **final** da lista de campos
- Nunca remova campos existentes (use deprecated se necessário)
- Nunca mude o tipo de campos existentes

#### PASSO 2: Atualizar Google Sheets

1. Abrir planilha correspondente no Google Sheets
2. Adicionar coluna no **final** (após última coluna com dados)
3. Adicionar header com o **nome exato** do campo (ex: `observacoes`)
4. Deixar células vazias (dados virão do sistema)

#### PASSO 3: Testar no Apps Script Console

```javascript
// Testar se o campo é reconhecido
function testarNovoCampo() {
  // Buscar registros da tabela
  const result = DatabaseManager.query('membros', {}, { limit: 1 });
  
  // Verificar se o novo campo aparece
  Logger.info('Test', 'Resultado', result);
  
  // Deve aparecer o campo "observacoes" (mesmo vazio)
  console.log(result.data[0]);
}
```

#### PASSO 4: Atualizar Frontend (se necessário)

Se o campo deve aparecer na interface:

**Arquivo:** `app_migrated.html`

```html
<!-- Adicionar no formulário -->
<div class="form-group">
  <label for="observacoes">Observações</label>
  <textarea 
    id="observacoes" 
    name="observacoes" 
    maxlength="500"
    placeholder="Observações sobre o membro"
  ></textarea>
</div>
```

```javascript
// Adicionar na função de salvar
function saveMember() {
  const memberData = {
    // ... campos existentes ...
    observacoes: document.getElementById('observacoes').value
  };
  
  // Salvar
  google.script.run
    .withSuccessHandler(onSuccess)
    .withFailureHandler(onError)
    .createMember(memberData);
}
```

### ⚠️ CUIDADOS:

- ❌ NÃO remova campos existentes
- ❌ NÃO mude tipo de campos existentes  
- ❌ NÃO renomeie campos (cria campo novo e deprecia antigo)
- ✅ SEMPRE adicione no final da lista
- ✅ SEMPRE teste antes de considerar pronto
- ✅ SEMPRE pergunte se não tiver certeza

---

## 2️⃣ CRIAR NOVA FUNCIONALIDADE

### ✅ Checklist ANTES de começar:

```
[ ] Defini claramente o que a funcionalidade faz?
[ ] Sei quais arquivos vou precisar modificar?
[ ] A funcionalidade precisa de nova tabela?
[ ] Vou precisar modificar src/00-core? (se sim, PEDIR PERMISSÃO)
[ ] Vou modificar mais de 3 arquivos? (se sim, PEDIR PERMISSÃO)
[ ] Consultei o MAPA_PROJETO.md para entender a estrutura?
```

### 📝 Template de solicitação:

**⚠️ SE modificar >3 arquivos OU afetar core, SEMPRE use este template:**

```
FUNCIONALIDADE: [nome descritivo]

DESCRIÇÃO:
- O que faz: [explicar em 2-3 linhas]
- Onde aparece: [tela X, modal Y]
- Quem usa: [tipo de usuário]

VOU PRECISAR:

Backend:
- [ ] Criar função em [arquivo.gs] para [motivo]
- [ ] Modificar [arquivo.gs] para [motivo]

Frontend:
- [ ] Modificar app_migrated.html seção [qual]
- [ ] Adicionar modal/formulário para [o quê]

Banco:
- [ ] Nova tabela: [nome] OU
- [ ] Novos campos em [tabela existente]: [lista campos]

MODIFICAÇÕES:
- Total de arquivos a modificar: [número]
- Arquivos core afetados: [sim/não]
- Criar novos arquivos: [sim/não - quais?]

ISSO É SEGURO? POSSO COMEÇAR?
```

### 📍 Ordem de implementação:

```
1. Backend primeiro
   └── Criar funções de API em src/01-business/
   └── OU adicionar em arquivo existente

2. Testar backend no console
   └── google.script.run.minhaFuncao() no Apps Script

3. Frontend depois
   └── Adicionar chamada em app_migrated.html
   └── Criar/modificar interface

4. Testar integração completa
   └── Fluxo end-to-end no navegador
```

### 📍 Exemplo prático: Adicionar "Arquivar Atividade"

#### PASSO 1: Backend

**Arquivo:** `src/01-business/activities.gs`

```javascript
/**
 * Arquiva uma atividade (soft delete)
 * @param {string} activityId - ID da atividade
 * @returns {Object} Resultado da operação
 */
function archiveActivity(activityId) {
  try {
    // Validar
    if (!activityId) {
      return { success: false, error: 'ID obrigatório' };
    }
    
    // Atualizar status
    const result = DatabaseManager.update('atividades', activityId, {
      status: 'arquivada',
      arquivada_em: new Date().toISOString()
    });
    
    // Log
    Logger.info('Activities', 'Atividade arquivada', { 
      activityId 
    });
    
    return { success: true, data: result };
    
  } catch (error) {
    Logger.error('Activities', 'Erro ao arquivar', { 
      activityId, 
      error: error.message 
    });
    return { success: false, error: error.message };
  }
}
```

#### PASSO 2: Testar Backend

No Apps Script Console:

```javascript
function testarArquivar() {
  const result = archiveActivity('ACT-001');
  console.log(result);
  // Deve retornar { success: true, ... }
}
```

#### PASSO 3: Frontend

**Arquivo:** `app_migrated.html`

Adicionar botão no card de atividade:

```javascript
// Na função que renderiza atividades
function renderActivityCard(activity) {
  return `
    <div class="activity-card">
      <!-- ... conteúdo existente ... -->
      
      <div class="activity-actions">
        <button onclick="archiveActivityUI('${activity.id}')">
          🗄️ Arquivar
        </button>
      </div>
    </div>
  `;
}

// Adicionar função de UI
function archiveActivityUI(activityId) {
  if (!confirm('Deseja arquivar esta atividade?')) {
    return;
  }
  
  // Mostrar loading
  showLoading();
  
  // Chamar backend
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoading();
      if (result.success) {
        showToast('Atividade arquivada!', 'success');
        loadActivities(); // Recarregar lista
      } else {
        showToast('Erro: ' + result.error, 'error');
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showToast('Erro: ' + error.message, 'error');
    })
    .archiveActivity(activityId);
}
```

#### PASSO 4: Testar Integração

1. Abrir aplicação no navegador
2. Encontrar uma atividade
3. Clicar em "Arquivar"
4. Verificar se:
   - Modal de confirmação aparece
   - Loading é exibido
   - Toast de sucesso aparece
   - Lista é atualizada
   - Atividade some da lista (ou muda status)

---

## 3️⃣ CORRIGIR BUG

### ✅ Checklist ANTES de começar:

```
[ ] Consegui reproduzir o bug consistentemente?
[ ] Sei em qual arquivo está o problema?
[ ] Tenho os logs de erro (F12 Console)?
[ ] Testei em ambiente de dev?
[ ] Vou modificar apenas 1 arquivo? (se não, PERGUNTAR)
```

### 📍 Passo a passo:

#### PASSO 1: Reproduzir e Documentar

```
1. Anotar passos exatos para reproduzir:
   - Passo 1: Abrir tela X
   - Passo 2: Clicar em botão Y
   - Passo 3: Preencher campo Z
   - Resultado: Erro [descrição]

2. Capturar erro no console (F12):
   - Screenshot da mensagem
   - Stack trace completo
   - Network tab (se for erro de API)

3. Identificar arquivo problemático:
   - Olhar no stack trace
   - Buscar nome da função no código
```

#### PASSO 2: Diagnosticar com Logs

**Adicionar logs temporários para debug:**

```javascript
// Frontend (app_migrated.html)
function funcaoComBug(parametro) {
  console.log('🔍 DEBUG: Início função', { parametro });
  
  // Código existente
  const resultado = processarDados(parametro);
  console.log('🔍 DEBUG: Após processar', { resultado });
  
  // Mais código
  if (resultado) {
    console.log('🔍 DEBUG: Entrando no if');
    // ...
  }
  
  console.log('🔍 DEBUG: Fim função');
}
```

```javascript
// Backend (.gs)
function funcaoComBug(parametro) {
  Logger.debug('ModuleName', 'Início função', { parametro });
  
  // Código existente
  const resultado = processarDados(parametro);
  Logger.debug('ModuleName', 'Após processar', { resultado });
  
  // ...
  
  Logger.debug('ModuleName', 'Fim função');
}
```

#### PASSO 3: Isolar o Problema

```javascript
// Testar função isoladamente
function testarFuncaoIsolada() {
  // Preparar dados de teste
  const dadosTeste = {
    campo1: 'valor1',
    campo2: 123
  };
  
  // Chamar função
  const resultado = funcaoComBug(dadosTeste);
  
  // Verificar resultado
  console.log('Resultado:', resultado);
  // Esperado: { success: true, ... }
  // Atual: { success: false, error: '...' }
}
```

#### PASSO 4: Corrigir

**Exemplo: Bug de null reference**

```javascript
// ❌ ANTES (com bug)
function processarMembro(membroId) {
  const membro = buscarMembro(membroId);
  return membro.nome.toUpperCase(); // ❌ Erro se membro for null
}

// ✅ DEPOIS (corrigido)
function processarMembro(membroId) {
  const membro = buscarMembro(membroId);
  
  // Validação
  if (!membro) {
    Logger.warn('ProcessarMembro', 'Membro não encontrado', { 
      membroId 
    });
    return null;
  }
  
  // Validação adicional
  if (!membro.nome) {
    Logger.warn('ProcessarMembro', 'Membro sem nome', { 
      membroId, 
      membro 
    });
    return '';
  }
  
  return membro.nome.toUpperCase();
}
```

**Exemplo: Bug de tipo de dado**

```javascript
// ❌ ANTES (com bug)
function calcularTotal(itens) {
  let total = 0;
  itens.forEach(item => {
    total += item.valor; // ❌ Erro se valor for string "123"
  });
  return total;
}

// ✅ DEPOIS (corrigido)
function calcularTotal(itens) {
  let total = 0;
  
  // Validação do array
  if (!Array.isArray(itens)) {
    Logger.warn('CalcularTotal', 'Itens não é array', { itens });
    return 0;
  }
  
  itens.forEach(item => {
    // Converter para número
    const valor = parseFloat(item.valor) || 0;
    total += valor;
  });
  
  return total;
}
```

#### PASSO 5: Testar

```
1. Testar cenário original do bug
   └── Deve funcionar agora

2. Testar cenários extremos:
   - Valores null
   - Valores undefined
   - Strings vazias
   - Arrays vazios
   - Números negativos
   - Tipos inesperados

3. Verificar se não quebrou nada adjacente:
   - Funções que chamam esta função
   - Funções chamadas por esta função

4. Remover logs temporários de debug
```

### ⚠️ CUIDADOS:

- ❌ NÃO faça mudanças grandes "já que está mexendo"
- ✅ FOQUE apenas no bug específico
- ✅ DOCUMENTE a correção no código
- ✅ SE precisar mexer em múltiplos arquivos, PERGUNTE ANTES
- ✅ ADICIONE validações para prevenir o bug no futuro

---

## 4️⃣ CRIAR NOVA TELA

### ✅ Checklist ANTES:

```
[ ] A tela é realmente necessária?
[ ] Sei que dados ela vai mostrar?
[ ] Já existem componentes que posso reutilizar?
[ ] Li o MAPA_PROJETO.md para entender a estrutura?
```

### ⚠️ IMPORTANTE - ESTRUTURA ATUAL:

O sistema usa **app_migrated.html MONOLÍTICO**. Não crie arquivos separados sem permissão!

**Estrutura atual:**
- ✅ Telas são **seções dentro de app_migrated.html**
- ✅ Navegação por tabs (data-page attribute)
- ✅ Show/hide com CSS

### 📍 Passo a passo:

#### PASSO 1: Adicionar Tab de Navegação

**Arquivo:** `app_migrated.html`

Localizar a seção `<nav class="nav-tabs">` e adicionar:

```html
<nav class="nav-tabs">
  <!-- ... tabs existentes ... -->
  
  <!-- ✅ NOVA TAB -->
  <button class="nav-tab" data-page="minha-tela">
    <span>📋</span>
    <span>Minha Tela</span>
  </button>
</nav>
```

#### PASSO 2: Adicionar Seção de Conteúdo

Localizar onde estão as `<div class="page-content">` e adicionar:

```html
<!-- ✅ NOVA TELA -->
<div id="minha-tela" class="page-content" style="display: none;">
  <div class="container">
    
    <!-- Header da tela -->
    <div class="page-header">
      <h1>📋 Minha Tela</h1>
      <p>Descrição do que esta tela faz</p>
    </div>
    
    <!-- Actions -->
    <div class="page-actions">
      <button class="btn btn-primary" onclick="minhaAcao()">
        ➕ Nova Ação
      </button>
    </div>
    
    <!-- Conteúdo principal -->
    <div id="minha-tela-content">
      <!-- Conteúdo será renderizado aqui -->
    </div>
    
  </div>
</div>
```

#### PASSO 3: Adicionar Funções JavaScript

Na seção `<script>` do app_migrated.html:

```javascript
// ✅ Inicializar tela
function initMinhaTela() {
  console.log('Inicializando Minha Tela');
  loadMinhaTelaDados();
}

// ✅ Carregar dados
function loadMinhaTelaDados() {
  showLoading();
  
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoading();
      if (result.success) {
        renderMinhaTela(result.data);
      } else {
        showToast('Erro ao carregar: ' + result.error, 'error');
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showToast('Erro: ' + error.message, 'error');
    })
    .minhaFuncaoBackend();
}

// ✅ Renderizar dados
function renderMinhaTela(dados) {
  const container = document.getElementById('minha-tela-content');
  
  if (!dados || dados.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">Nenhum dado encontrado</div>
        <div class="empty-state-description">
          Comece adicionando um novo item
        </div>
      </div>
    `;
    return;
  }
  
  let html = '<div class="cards-grid">';
  dados.forEach(item => {
    html += `
      <div class="card">
        <h3>${item.titulo}</h3>
        <p>${item.descricao}</p>
        <button onclick="editarItem('${item.id}')">
          ✏️ Editar
        </button>
      </div>
    `;
  });
  html += '</div>';
  
  container.innerHTML = html;
}

// ✅ Ações
function minhaAcao() {
  console.log('Ação executada');
  // Implementar lógica
}

function editarItem(itemId) {
  console.log('Editar item:', itemId);
  // Implementar lógica
}
```

#### PASSO 4: Integrar na Navegação

Atualizar a função `showTab()` se necessário (geralmente não precisa):

```javascript
function showTab(tabName) {
  // ... código existente ...
  
  // Inicializar tela específica se necessário
  if (tabName === 'minha-tela') {
    initMinhaTela();
  }
  
  // ... resto do código ...
}
```

#### PASSO 5: Criar Backend (se necessário)

**Arquivo:** `src/01-business/minha_funcionalidade.gs` (criar novo) OU adicionar em existente

```javascript
/**
 * Busca dados para minha tela
 * @returns {Object} Resultado com dados
 */
function minhaFuncaoBackend() {
  try {
    // Buscar dados
    const result = DatabaseManager.query('tabela', {}, {
      orderBy: 'created_at',
      order: 'DESC'
    });
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
    
  } catch (error) {
    Logger.error('MinhaFuncionalidade', 'Erro ao buscar dados', {
      error: error.message
    });
    return { success: false, error: error.message };
  }
}
```

### ⚠️ CUIDADOS:

- ❌ NÃO crie arquivos .html separados
- ✅ Tudo vai dentro de app_migrated.html
- ✅ Use a estrutura de tabs existente
- ✅ Reaproveite estilos CSS existentes
- ✅ SEMPRE pergunte se não souber onde colocar

---

## 5️⃣ MODIFICAR ESTILO/LAYOUT

### ✅ Checklist ANTES:

```
[ ] Sei qual componente/tela vou modificar?
[ ] A mudança é só visual (não afeta lógica)?
[ ] Testei em mobile E desktop?
[ ] Sei onde está o CSS relevante?
```

### 📍 Localização do CSS:

**TODO O CSS ESTÁ EM:** `app_migrated.html`

Dentro da tag `<style>` no início do arquivo.

### 📍 Passo a passo:

#### PASSO 1: Identificar Componente

Inspecionar elemento no navegador (F12):

```html
<!-- Exemplo: Card de atividade -->
<div class="activity-card">
  <h3 class="activity-title">Título</h3>
  <p class="activity-description">Descrição</p>
</div>
```

#### PASSO 2: Localizar CSS

Buscar no `<style>` de app_migrated.html:

```css
.activity-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  /* ... */
}

.activity-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  /* ... */
}
```

#### PASSO 3: Modificar com Cuidado

```css
/* ✅ BOM: Modificação específica e clara */
.activity-card {
  background: white;
  padding: var(--spacing-lg);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm); /* ✅ Adicionado */
  transition: transform 0.2s; /* ✅ Adicionado */
}

.activity-card:hover {
  transform: translateY(-2px); /* ✅ Novo */
  box-shadow: var(--shadow-md); /* ✅ Novo */
}

/* ❌ RUIM: Modificação genérica que pode afetar outros elementos */
.card {
  padding: 2rem; /* ❌ Pode afetar TODOS os cards */
}
```

#### PASSO 4: Usar Variáveis CSS

O sistema usa **CSS Variables** (custom properties):

```css
/* ✅ CORRETO: Usar variáveis */
.meu-componente {
  padding: var(--spacing-lg);
  color: var(--primary);
  border-radius: var(--radius);
  font-size: var(--font-size-md);
}

/* ❌ ERRADO: Valores hardcoded */
.meu-componente {
  padding: 24px;
  color: #2563eb;
  border-radius: 8px;
  font-size: 16px;
}
```

**Variáveis disponíveis** (ver no início do `<style>`):

```css
:root {
  /* Cores */
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --secondary: #8b5cf6;
  
  /* Espaçamentos */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* Tamanhos de fonte */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-md: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Border radius */
  --radius: 8px;
  --radius-lg: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
}
```

#### PASSO 5: Responsividade

**SEMPRE testar em mobile:**

```css
/* Desktop first, depois mobile */
.meu-componente {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-lg);
}

/* Tablet */
@media (max-width: 768px) {
  .meu-componente {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Mobile */
@media (max-width: 480px) {
  .meu-componente {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}
```

#### PASSO 6: Testar

```
1. Desktop Chrome (F12 → Responsive Design Mode)
2. Tablet (768px)
3. Mobile (375px, 480px)
4. Testar interações:
   - Hover states
   - Active states
   - Focus states
5. Testar em dark mode (se aplicável)
```

### ⚠️ CUIDADOS:

- ✅ Use classes **específicas** (.activity-card, não .card)
- ✅ Use **variáveis CSS** (var(--primary))
- ✅ Teste **responsividade**
- ❌ NÃO use `!important` (exceto casos extremos)
- ❌ NÃO modifique estilos **globais** sem necessidade
- ❌ NÃO adicione CSS em **atributos inline** (use classes)

---

## 6️⃣ ADICIONAR NOVA API BACKEND

### ✅ Checklist ANTES:

```
[ ] Defini claramente o que a API faz?
[ ] Sei em qual arquivo .gs adicionar?
[ ] A API precisa acessar banco de dados?
[ ] Precisa de validações específicas?
[ ] Vou criar arquivo novo? (se sim, PERGUNTAR)
```

### 📍 Onde adicionar APIs:

```
src/01-business/          ← Lógica de negócio
├── activities.gs         ← APIs de atividades
├── members.gs            ← APIs de membros
├── participacoes.gs      ← APIs de participação
└── [nova_funcionalidade].gs  ← Nova funcionalidade
```

### 📍 Template de API:

```javascript
/**
 * [Descrição do que a API faz]
 * 
 * @param {Object} params - Parâmetros da requisição
 * @param {string} params.campo1 - Descrição do campo
 * @param {number} params.campo2 - Descrição do campo
 * @returns {Object} Resultado da operação
 * @returns {boolean} returns.success - Se operação foi bem-sucedida
 * @returns {Object} returns.data - Dados retornados
 * @returns {string} returns.error - Mensagem de erro (se falha)
 * 
 * @example
 * const result = minhaNovaApi({ campo1: 'valor', campo2: 123 });
 * // { success: true, data: {...} }
 */
function minhaNovaApi(params) {
  try {
    // 1. VALIDAÇÃO
    if (!params || typeof params !== 'object') {
      return { 
        success: false, 
        error: 'Parâmetros inválidos' 
      };
    }
    
    if (!params.campo1) {
      return { 
        success: false, 
        error: 'Campo1 é obrigatório' 
      };
    }
    
    // 2. LOG DE ENTRADA
    Logger.info('MinhaAPI', 'Iniciando operação', { 
      params 
    });
    
    // 3. LÓGICA PRINCIPAL
    const result = DatabaseManager.query('tabela', {
      campo1: params.campo1
    });
    
    if (!result.success) {
      Logger.error('MinhaAPI', 'Erro na query', { 
        error: result.error 
      });
      return { 
        success: false, 
        error: result.error 
      };
    }
    
    // 4. PROCESSAR DADOS (se necessário)
    const processedData = result.data.map(item => ({
      id: item.id,
      nome: item.nome,
      // Adicionar campos calculados
      calculado: item.campo1 + item.campo2
    }));
    
    // 5. LOG DE SUCESSO
    Logger.info('MinhaAPI', 'Operação concluída', {
      totalItems: processedData.length
    });
    
    // 6. RETORNO
    return { 
      success: true, 
      data: processedData 
    };
    
  } catch (error) {
    // 7. TRATAMENTO DE ERRO
    Logger.error('MinhaAPI', 'Erro inesperado', {
      params,
      error: error.message,
      stack: error.stack
    });
    
    return { 
      success: false, 
      error: error.message 
    };
  }
}
```

### 📍 Padrões de APIs Comuns:

#### API de Listagem (Query)

```javascript
function listarItens(filters) {
  try {
    // Validar filtros
    filters = filters || {};
    
    // Query no banco
    const result = DatabaseManager.query('tabela', filters, {
      orderBy: 'criado_em',
      order: 'DESC',
      limit: 100
    });
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    return { success: true, data: result.data };
    
  } catch (error) {
    Logger.error('ListarItens', 'Erro', { error: error.message });
    return { success: false, error: error.message };
  }
}
```

#### API de Criação (Insert)

```javascript
function criarItem(itemData) {
  try {
    // Validação
    if (!itemData || !itemData.campo_obrigatorio) {
      return { 
        success: false, 
        error: 'Dados inválidos' 
      };
    }
    
    // Preparar dados
    const dataToInsert = {
      ...itemData,
      criado_em: new Date().toISOString(),
      status: 'ativo'
    };
    
    // Inserir
    const result = DatabaseManager.insert('tabela', dataToInsert);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    Logger.info('CriarItem', 'Item criado', { 
      itemId: result.id 
    });
    
    return { 
      success: true, 
      data: result.data,
      id: result.id 
    };
    
  } catch (error) {
    Logger.error('CriarItem', 'Erro', { error: error.message });
    return { success: false, error: error.message };
  }
}
```

#### API de Atualização (Update)

```javascript
function atualizarItem(itemId, itemData) {
  try {
    // Validação
    if (!itemId) {
      return { success: false, error: 'ID obrigatório' };
    }
    
    // Adicionar timestamp de atualização
    const dataToUpdate = {
      ...itemData,
      atualizado_em: new Date().toISOString()
    };
    
    // Atualizar
    const result = DatabaseManager.update('tabela', itemId, dataToUpdate);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    Logger.info('AtualizarItem', 'Item atualizado', { 
      itemId 
    });
    
    return { success: true, data: result.data };
    
  } catch (error) {
    Logger.error('AtualizarItem', 'Erro', { error: error.message });
    return { success: false, error: error.message };
  }
}
```

#### API de Soft Delete

```javascript
function deletarItem(itemId) {
  try {
    // Validação
    if (!itemId) {
      return { success: false, error: 'ID obrigatório' };
    }
    
    // Soft delete (marcar como deletado)
    const result = DatabaseManager.update('tabela', itemId, {
      deleted: 'x',
      deletado_em: new Date().toISOString()
    });
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    Logger.info('DeletarItem', 'Item deletado', { 
      itemId 
    });
    
    return { success: true };
    
  } catch (error) {
    Logger.error('DeletarItem', 'Erro', { error: error.message });
    return { success: false, error: error.message };
  }
}
```

### 📍 Testar a API:

```javascript
// No Apps Script Console (Ctrl+Enter)
function testarMinhaAPI() {
  const params = {
    campo1: 'teste',
    campo2: 123
  };
  
  const result = minhaNovaApi(params);
  
  console.log('Resultado:', result);
  
  if (result.success) {
    console.log('✅ Sucesso!');
    console.log('Dados:', result.data);
  } else {
    console.log('❌ Erro:', result.error);
  }
}
```

---

## 7️⃣ INTEGRAR NOVA API NO FRONTEND

### ✅ Checklist ANTES:

```
[ ] A API backend já está criada e testada?
[ ] Sei onde no frontend vou chamar a API?
[ ] Sei como exibir os dados retornados?
[ ] Testei a API no Apps Script Console?
```

### 📍 Passo a passo:

#### PASSO 1: Criar Função Frontend

**Arquivo:** `app_migrated.html` (na seção `<script>`)

```javascript
/**
 * Chama a API e processa resultado
 */
function chamarMinhaAPI(params) {
  // 1. Validação local (opcional mas recomendado)
  if (!params || !params.campo1) {
    showToast('Preencha todos os campos obrigatórios', 'error');
    return;
  }
  
  // 2. Mostrar loading
  showLoading();
  
  // 3. Chamar API
  google.script.run
    .withSuccessHandler(function(result) {
      // 4. Esconder loading
      hideLoading();
      
      // 5. Processar resultado
      if (result.success) {
        console.log('✅ API retornou sucesso:', result);
        
        // Mostrar toast de sucesso
        showToast('Operação realizada com sucesso!', 'success');
        
        // Processar dados retornados
        processarDados(result.data);
        
        // Atualizar interface
        atualizarInterface();
        
      } else {
        console.log('❌ API retornou erro:', result.error);
        showToast('Erro: ' + result.error, 'error');
      }
    })
    .withFailureHandler(function(error) {
      // 6. Tratamento de erro de comunicação
      hideLoading();
      console.error('❌ Erro de comunicação:', error);
      showToast('Erro ao comunicar com servidor: ' + error.message, 'error');
    })
    .minhaNovaApi(params);  // ← Nome da função backend
}

// Função auxiliar para processar dados
function processarDados(dados) {
  console.log('Processando dados:', dados);
  
  // Fazer algo com os dados
  if (Array.isArray(dados)) {
    dados.forEach(item => {
      console.log('Item:', item);
    });
  }
}

// Função auxiliar para atualizar interface
function atualizarInterface() {
  // Recarregar lista, fechar modal, etc
  console.log('Atualizando interface');
}
```

#### PASSO 2: Chamar a Função

**Exemplo: Ao clicar em botão**

```html
<button 
  class="btn btn-primary" 
  onclick="chamarAPI()"
>
  🚀 Executar Ação
</button>

<script>
function chamarAPI() {
  const params = {
    campo1: document.getElementById('campo1').value,
    campo2: parseInt(document.getElementById('campo2').value)
  };
  
  chamarMinhaAPI(params);
}
</script>
```

**Exemplo: Ao submeter formulário**

```html
<form onsubmit="submitForm(event)">
  <input type="text" id="campo1" required>
  <input type="number" id="campo2" required>
  <button type="submit">Enviar</button>
</form>

<script>
function submitForm(event) {
  event.preventDefault(); // Prevenir reload da página
  
  const params = {
    campo1: document.getElementById('campo1').value,
    campo2: parseInt(document.getElementById('campo2').value)
  };
  
  chamarMinhaAPI(params);
}
</script>
```

#### PASSO 3: Exibir Resultados

**Exemplo: Renderizar lista**

```javascript
function chamarMinhaAPI(params) {
  showLoading();
  
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoading();
      
      if (result.success) {
        renderizarLista(result.data);
      } else {
        showToast('Erro: ' + result.error, 'error');
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      showToast('Erro: ' + error.message, 'error');
    })
    .minhaNovaApi(params);
}

function renderizarLista(dados) {
  const container = document.getElementById('lista-container');
  
  if (!dados || dados.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">Nenhum resultado</div>
      </div>
    `;
    return;
  }
  
  let html = '<div class="cards-grid">';
  dados.forEach(item => {
    html += `
      <div class="card">
        <h3>${item.titulo}</h3>
        <p>${item.descricao}</p>
        <div class="card-footer">
          <button onclick="editar('${item.id}')">✏️ Editar</button>
          <button onclick="deletar('${item.id}')">🗑️ Deletar</button>
        </div>
      </div>
    `;
  });
  html += '</div>';
  
  container.innerHTML = html;
}
```

#### PASSO 4: Tratamento de Erros Específicos

```javascript
function chamarMinhaAPI(params) {
  showLoading();
  
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoading();
      
      if (result.success) {
        showToast('Sucesso!', 'success');
        processarDados(result.data);
        
      } else {
        // Erros específicos
        if (result.error.includes('não encontrado')) {
          showToast('Registro não encontrado', 'warning');
          
        } else if (result.error.includes('duplicado')) {
          showToast('Este registro já existe', 'warning');
          
        } else if (result.error.includes('permissão')) {
          showToast('Você não tem permissão para esta ação', 'error');
          
        } else {
          // Erro genérico
          showToast('Erro: ' + result.error, 'error');
        }
      }
    })
    .withFailureHandler(function(error) {
      hideLoading();
      
      // Erros de comunicação
      console.error('Erro de comunicação:', error);
      
      showToast(
        'Erro ao conectar com o servidor. Tente novamente.',
        'error'
      );
    })
    .minhaNovaApi(params);
}
```

### 📍 Padrões de Integração:

#### Pattern 1: Query e Renderizar

```javascript
// Buscar e exibir lista
function loadItens() {
  showLoading();
  
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoading();
      if (result.success) {
        renderItens(result.data);
      }
    })
    .listarItens();
}

function renderItens(itens) {
  // Renderizar na tela
}
```

#### Pattern 2: Create e Atualizar

```javascript
// Criar novo item
function criarNovoItem() {
  const dados = coletarDadosDoForm();
  
  showLoading();
  
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoading();
      if (result.success) {
        showToast('Item criado!', 'success');
        fecharModal();
        loadItens(); // Recarregar lista
      }
    })
    .criarItem(dados);
}
```

#### Pattern 3: Update e Feedback

```javascript
// Atualizar item existente
function atualizarItem(itemId) {
  const dados = coletarDadosDoForm();
  
  showLoading();
  
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoading();
      if (result.success) {
        showToast('Item atualizado!', 'success');
        fecharModal();
        loadItens();
      }
    })
    .atualizarItem(itemId, dados);
}
```

#### Pattern 4: Delete com Confirmação

```javascript
// Deletar com confirmação
function deletarComConfirmacao(itemId) {
  if (!confirm('Tem certeza que deseja deletar?')) {
    return;
  }
  
  showLoading();
  
  google.script.run
    .withSuccessHandler(function(result) {
      hideLoading();
      if (result.success) {
        showToast('Item deletado!', 'success');
        loadItens();
      }
    })
    .deletarItem(itemId);
}
```

---

## 🆘 SE ALGO DER ERRADO

### Protocolo de Emergência:

```
1. ⏸️ PARE IMEDIATAMENTE
   └── Não tente "consertar" mais

2. 📸 DOCUMENTE:
   ├── O que você estava fazendo
   ├── Qual arquivo modificou
   ├── Qual erro apareceu
   ├── Screenshots do erro
   └── Logs do console (F12)

3. 💬 AVISE:
   "⚠️ Problema! 
   
   Estava fazendo: [tarefa]
   Modifiquei: [arquivos]
   Erro: [mensagem de erro]
   
   Arquivos criados: [lista]
   Arquivos deletados: [lista]
   Arquivos movidos: [lista]
   
   Como reverter?"

4. ⏳ AGUARDE:
   └── Não tente consertar sozinho
```

### Erros Comuns e Soluções:

#### Erro: "function not found"

```
Causa: Função backend não existe ou nome errado

Solução:
1. Verificar nome exato da função no .gs
2. Fazer clasp push (deploy)
3. Aguardar 1-2 minutos
4. Testar novamente
```

#### Erro: "Cannot read property of undefined"

```
Causa: Tentando acessar propriedade de objeto null/undefined

Solução:
1. Adicionar validação:
   if (!objeto) return;
   if (!objeto.propriedade) return;

2. Usar optional chaining:
   objeto?.propriedade
```

#### Erro: "Timeout"

```
Causa: Operação demorou mais de 6 minutos

Solução:
1. Otimizar query (adicionar filtros)
2. Reduzir volume de dados
3. Implementar paginação
4. Usar cache
```

---

## 📊 RESUMO VISUAL DOS WORKFLOWS

```
┌─────────────────────────────────────────┐
│  ADICIONAR CAMPO                        │
├─────────────────────────────────────────┤
│  1. data_dictionary.gs                  │
│  2. Google Sheets (adicionar coluna)    │
│  3. Testar                              │
│  4. Frontend (se necessário)            │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  NOVA FUNCIONALIDADE                    │
├─────────────────────────────────────────┤
│  1. Planejar (PEDIR PERMISSÃO)          │
│  2. Backend (.gs)                       │
│  3. Testar backend                      │
│  4. Frontend (.html)                    │
│  5. Testar integração                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  CORRIGIR BUG                           │
├─────────────────────────────────────────┤
│  1. Reproduzir e documentar             │
│  2. Diagnosticar (logs)                 │
│  3. Isolar problema                     │
│  4. Corrigir (1 arquivo)                │
│  5. Testar                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  CRIAR TELA                             │
├─────────────────────────────────────────┤
│  1. Adicionar tab                       │
│  2. Adicionar seção HTML                │
│  3. Adicionar funções JS                │
│  4. Backend (se necessário)             │
│  5. Testar                              │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  MODIFICAR CSS                          │
├─────────────────────────────────────────┤
│  1. Identificar componente              │
│  2. Localizar CSS                       │
│  3. Modificar com cuidado               │
│  4. Usar variáveis CSS                  │
│  5. Testar responsividade               │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  NOVA API BACKEND                       │
├─────────────────────────────────────────┤
│  1. Criar função .gs                    │
│  2. Seguir template padrão              │
│  3. Adicionar validações                │
│  4. Adicionar logs                      │
│  5. Testar no console                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  INTEGRAR API FRONTEND                  │
├─────────────────────────────────────────┤
│  1. Criar função frontend               │
│  2. Chamar google.script.run            │
│  3. Processar resultado                 │
│  4. Atualizar interface                 │
│  5. Testar integração                   │
└─────────────────────────────────────────┘
```

---

## ⚠️ REGRA DE OURO

```
EM CASO DE DÚVIDA:
┌─────────────────────────────────────────┐
│                                         │
│      🛑  SEMPRE PERGUNTE ANTES  🛑      │
│                                         │
│  Especialmente para:                    │
│  • Criar/mover/deletar arquivos         │
│  • Modificar >1 arquivo                 │
│  • Mudanças em src/00-core/             │
│  • Reorganizar estrutura                │
│  • Quando não souber onde colocar algo  │
│  • Deploy (clasp push)                  │
│                                         │
└─────────────────────────────────────────┘
```

---

## 📚 ARQUIVOS DE REFERÊNCIA

### Consulta Rápida:

```
ANTES de QUALQUER tarefa, consulte:

1. ORIENTACAO_DIARIA.md
   └── Contexto do dia, últimas mudanças

2. MAPA_PROJETO.md
   └── Estrutura completa do projeto

3. src/00-core/data_dictionary.gs
   └── Estrutura de todas as tabelas

4. CLAUDE_CODE_RULES.md
   └── O que pode/não pode fazer

5. Este arquivo (WORKFLOW_TAREFAS.md)
   └── Passo a passo das tarefas
```

### Quando Precisar de Ajuda:

```
📖 Documentação Técnica:
   └── docs/ARQUITETURA.md
   └── docs/DEVELOPMENT.md
   └── docs/API_REFERENCE.md (se existir)

🐛 Problemas:
   └── docs/TROUBLESHOOTING.md

⚙️ Configuração:
   └── docs/CONFIGURACAO.md

📝 Changelog:
   └── docs/CHANGELOG.md
```

---

## 🎯 CHECKLIST UNIVERSAL

**Use ANTES de começar QUALQUER tarefa:**

```
[ ] Li ORIENTACAO_DIARIA.md hoje?
[ ] Consultei MAPA_PROJETO.md?
[ ] Consultei data_dictionary.gs (se afetar BD)?
[ ] Sei exatamente o que vou fazer?
[ ] Vou modificar MENOS de 3 arquivos?
[ ] NÃO vou mexer em src/00-core/?
[ ] Tenho certeza que não vou quebrar nada?
[ ] Sei como testar depois?
[ ] Sei como reverter se der errado?
[ ] NÃO vou criar/deletar arquivos sem permissão?
```

**Se TODOS ✅ → PODE FAZER**  
**Se ALGUM ❌ → PERGUNTAR PRIMEIRO**

---

**💡 Consulte este workflow antes de QUALQUER tarefa!**

**📅 Última atualização:** 30/09/2025
**🔄 Próxima revisão:** Após grandes mudanças na estrutura