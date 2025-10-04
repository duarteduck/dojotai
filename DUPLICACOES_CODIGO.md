# 📋 DOCUMENTAÇÃO DE CÓDIGO DUPLICADO - app_migrated.html

**Data de Análise:** 03/10/2025
**Arquivo Analisado:** `app_migrated.html`
**Total de Linhas:** 7.896
**Status:** 🟡 Código funcional, mas com duplicações que precisam ser refatoradas

---

## 🎯 RESUMO EXECUTIVO

### Estatísticas Gerais
- **Funções duplicadas identificadas:** 2
- **Funções órfãs (não utilizadas):** 1
- **Sistemas redundantes:** 1 (Sistema de Filtros completo)
- **Bugs relacionados a duplicações:** 1 (✅ CORRIGIDO em 03/10/2025)
- **Linhas de código redundante:** ~350+ linhas
- **Impacto de manutenção:** 🔴 Alto (confusão, risco de bugs)

### Status das Correções
- ✅ **03/10/2025** - Bug do emoji duplicado no toast CORRIGIDO
- ✅ **03/10/2025** - Bug dos checkboxes empilhados CORRIGIDO
- ⏳ **Pendente** - Remoção de código duplicado (refatoração futura)

---

## 🔴 FUNÇÕES COMPLETAMENTE DUPLICADAS

### 1. `toggleParticipationOptions(checkbox)`

**📍 Localizações:**
- **Linha 4600-4612** ✅ VERSÃO ATIVA (em uso)
- **Linha 7704-7716** ❌ VERSÃO DUPLICADA (não utilizada)

**🔍 Comparação:**

| Aspecto | Versão 1 (4600) | Versão 2 (7704) |
|---------|-----------------|-----------------|
| **Funcionalidade** | Idêntica | Idêntica |
| **Comentário linha 8** | "Limpar subcampos quando desmarcar" | "Desmarcar sub-opções quando 'participou' é desmarcado" |
| **Código JavaScript** | 100% igual | 100% igual |
| **Utilizada por** | renderParticipantsForModal (linha 4360)<br>renderParticipantsList (linha 4531) | ❌ Nenhuma função |

**📝 Código Completo:**
```javascript
function toggleParticipationOptions(checkbox) {
    const participationId = checkbox.dataset.participationId;
    const optionsDiv = document.getElementById(`options-${participationId}`);

    if (checkbox.checked) {
        optionsDiv.style.display = 'flex';  // ✅ Corrigido em 03/10/2025
    } else {
        optionsDiv.style.display = 'none';
        // Limpar subcampos quando desmarcar participação
        document.getElementById(`chegou-tarde-${participationId}`).checked = false;
        document.getElementById(`saiu-cedo-${participationId}`).checked = false;
    }
}
```

**🎯 Ação Recomendada:**
```diff
+ REMOVER completamente a versão da linha 7704-7716
+ Manter apenas a versão da linha 4600-4612
+ Economia: 13 linhas
```

**⚠️ Impacto da Remoção:**
- ✅ **SEGURO** - A versão duplicada não está sendo utilizada
- ✅ **SEM RISCOS** - Nenhuma quebra de funcionalidade
- ✅ **BENEFÍCIOS** - Reduz confusão e facilita manutenção

---

### 2. `saveAllParticipations(activityId)` (async)

**📍 Localizações:**
- **Linha 4614-4712** ✅ VERSÃO COMPLETA (com observações)
- **Linha 7718-7803** ⚠️ VERSÃO SIMPLIFICADA (sem observações)

**🔍 Diferenças IMPORTANTES:**

| Funcionalidade | Versão 1 (4614) | Versão 2 (7718) |
|----------------|-----------------|-----------------|
| **Validação do botão** | ❌ Não valida se existe | ✅ `if (!saveBtn) return` |
| **Campo tableId** | ✅ Captura `item.dataset.tableId` | ❌ NÃO captura |
| **Verificação deleted** | ✅ Verifica e pula `deleted === 'x'` | ❌ NÃO verifica |
| **Campo observações** | ✅ Captura textarea de observações | ❌ NÃO captura |
| **Método de salvamento** | `saveParticipacaoDirectly(null, null, {id: tableId, ...})` | `saveParticipacaoDirectly(activityId, memberId, {...})` |
| **Recarga de atividades** | ❌ Não recarrega | ✅ `loadActivities()` |
| **Optional chaining** | ❌ Não usa | ✅ Usa `?.checked` |
| **Logs detalhados** | ✅ Logs completos com DEBUG | Logs básicos |

**📊 Estrutura de dados coletada:**

**Versão 1 (COMPLETA - EM USO):**
```javascript
{
    tableId: tableId,           // ✅ ID da tabela participações
    participationId: participationId,
    memberId: memberId,
    participou: 'sim' | 'nao',
    chegou_tarde: 'sim' | 'nao',
    saiu_cedo: 'sim' | 'nao',
    observacoes: string         // ✅ INCLUI OBSERVAÇÕES
}
```

**Versão 2 (SIMPLIFICADA):**
```javascript
{
    participationId: participationId,
    memberId: memberId,
    participou: 'sim' | 'nao',
    chegou_tarde: 'sim' | 'nao',
    saiu_cedo: 'sim' | 'nao'
    // ❌ NÃO INCLUI tableId
    // ❌ NÃO INCLUI observacoes
}
```

**📞 Utilizada Por:**
- Linha 3817: Botão "Salvar Participações" no modal de edição de atividade

**🎯 Ação Recomendada:**
```diff
+ CONSOLIDAR as duas versões em uma única função híbrida
+ Manter estrutura da Versão 1 (tableId, observações, verificação deleted)
+ Adicionar melhorias da Versão 2 (validação de botão, recarga, optional chaining)
+ REMOVER a duplicata da linha 7718-7803 após consolidação
+ Economia: 86 linhas
```

**🔧 Versão Consolidada Recomendada:**

```javascript
async function saveAllParticipations(activityId) {
    const saveBtn = document.getElementById('save-participations-btn');

    // ✅ Da versão 2 - Validação de botão
    if (!saveBtn) {
        console.error('❌ Botão de salvar não encontrado');
        return;
    }

    const originalContent = saveBtn.innerHTML;

    try {
        console.log('💾 Salvando todas as participações para atividade:', activityId);

        saveBtn.disabled = true;
        saveBtn.innerHTML = '<div class="loading-select-spinner" style="margin: 0 auto;"></div>';

        const participationUpdates = [];
        const participantItems = document.querySelectorAll('.participant-item');

        participantItems.forEach(item => {
            const participouCheckbox = item.querySelector('input[data-participation-id]');

            // ✅ Da versão 2 - Optional chaining
            if (!participouCheckbox) return;

            const participationId = participouCheckbox.dataset.participationId;
            const memberId = participouCheckbox.dataset.memberId;
            const tableId = item.dataset.tableId;  // ✅ Da versão 1

            // ✅ Da versão 1 - Verificação de deletados
            const isDeleted = item.dataset.deleted === 'x';
            if (isDeleted) {
                console.log('🗑️ Pulando participação deletada:', participationId);
                return;
            }

            const chegouTardeCheckbox = item.querySelector(`#chegou-tarde-${participationId}`);
            const saiuCedoCheckbox = item.querySelector(`#saiu-cedo-${participationId}`);
            const observacoesTextarea = item.querySelector(`#observacoes-${participationId}`);

            const participationData = {
                tableId: tableId,  // ✅ Da versão 1
                participationId: participationId,
                memberId: memberId,
                participou: participouCheckbox.checked ? 'sim' : 'nao',
                // ✅ Da versão 2 - Optional chaining
                chegou_tarde: (chegouTardeCheckbox?.checked) ? 'sim' : 'nao',
                saiu_cedo: (saiuCedoCheckbox?.checked) ? 'sim' : 'nao',
                observacoes: observacoesTextarea?.value.trim() || ''  // ✅ Versão 1 + optional chaining
            };

            participationUpdates.push(participationData);
        });

        console.log('📊 Dados coletados:', participationUpdates);

        // ✅ Da versão 1 - Salvamento usando tableId
        const savePromises = participationUpdates.map(data => {
            return new Promise((resolve, reject) => {
                google.script.run
                    .withSuccessHandler(resolve)
                    .withFailureHandler(reject)
                    .saveParticipacaoDirectly(null, null, {
                        id: data.tableId,
                        participou: data.participou,
                        chegou_tarde: data.chegou_tarde,
                        saiu_cedo: data.saiu_cedo,
                        observacoes: data.observacoes
                    }, '');
            });
        });

        const results = await Promise.all(savePromises);
        console.log('✅ Resultados:', results);

        const failures = results.filter(result => !result.ok);
        if (failures.length > 0) {
            throw new Error(`${failures.length} participações falharam ao salvar`);
        }

        showToast('Participações salvas com sucesso!', 'success');

        setTimeout(() => {
            closeEditActivityModal();

            // ✅ Da versão 2 - Recarregar atividades
            if (typeof loadActivities === 'function') {
                loadActivities();
            }
        }, 1000);

    } catch (error) {
        console.error('❌ Erro ao salvar participações:', error);
        showToast('Erro ao salvar participações: ' + (error.message || error), 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = originalContent;
    }
}
```

**⚠️ Impacto da Consolidação:**
- ⚠️ **REQUER TESTES** - Verificar ambos os contextos de uso
- ✅ **BENEFÍCIOS** - Funcionalidade completa unificada
- ✅ **MANUTENÇÃO** - Apenas um local para corrigir bugs
- ✅ **OBSERVAÇÕES** - Campo observações finalmente será salvo corretamente

---

## 🟡 FUNÇÕES ÓRFÃS (Não Utilizadas)

### 3. `renderParticipantsList(participations)`

**📍 Localização:**
- **Linha 4473-4598** ❌ NUNCA CHAMADA

**🔍 Análise:**
Esta função parece ser código **legado** de uma versão anterior do sistema. Ela renderiza participantes de forma similar a `renderParticipantsForModal`, mas com diferenças significativas:

| Aspecto | renderParticipantsForModal (EM USO) | renderParticipantsList (ÓRFÃ) |
|---------|-------------------------------------|-------------------------------|
| **Container** | `participantsList` | `participants-items` |
| **Busca nomes** | ✅ API call para buscar nomes | ❌ Usa `participation.membro_nome` |
| **Campo observações** | ✅ Inclui textarea | ❌ NÃO inclui |
| **Campo tableId** | ✅ Captura `data-table-id` | ❌ NÃO captura |
| **Deletados** | ✅ Verifica e estiliza | ❌ NÃO verifica |
| **Avatar** | `var(--primary-light)` | `var(--gradient-primary)` |
| **Uso** | ✅ Linha 4240 | ❌ Nunca chamada |

**📝 Código (resumido):**
```javascript
function renderParticipantsList(participations) {
    const container = document.getElementById('participants-items');
    container.innerHTML = '';

    participations.forEach((participation, index) => {
        const itemHTML = `
            <div class="participant-item" style="...">
                <!-- Nome do Membro -->
                <div style="...">
                    ${participation.membro_nome || 'Nome não encontrado'}
                </div>

                <!-- Checkbox Participou -->
                <input type="checkbox" id="participou-${participation.id}" ...>

                <!-- Opções adicionais -->
                <div id="options-${participation.id}" ...>
                    <input type="checkbox" id="chegou-tarde-${participation.id}" ...>
                    <input type="checkbox" id="saiu-cedo-${participation.id}" ...>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', itemHTML);
    });
}
```

**🎯 Ação Recomendada:**
```diff
+ REMOVER completamente a função (linha 4473-4598)
+ Economia: 126 linhas
```

**⚠️ Impacto da Remoção:**
- ✅ **SEGURO** - Função nunca é chamada
- ✅ **SEM RISCOS** - Container `participants-items` não existe no HTML
- ✅ **BENEFÍCIOS** - Remove código morto e confusão

---

## 🔵 SISTEMAS REDUNDANTES

### 4. Sistema de Filtros Duplicado

**📍 Localizações:**

#### Sistema 1: Multi-Select Dropdowns (Inglês) - Linhas 4871-5142
**Tamanho:** ~271 linhas

**Funções:**
- `loadCategoriesFilter()` - linha 4871
- `populateCategoriesFilter(categories)` - linha 4914
- `loadResponsaveisFilter()` - linha 5086
- `populateResponsaveisFilter(users)` - linha 5118
- `applyFilters()` - linha 5079

**Características:**
- Containers: `categorias-options`, `responsavel-options`
- Sistema de tags selecionadas
- Multi-select dropdowns com toggle
- Integrado com `initMultiSelectDropdowns()` linha 4956
- Idioma: Inglês (categories, responsaveis)

**Inicialização:**
```javascript
// Linha 5721-5722 no DOMContentLoaded
loadCategoriesFilter();
loadResponsaveisFilter();
```

---

#### Sistema 2: Modal de Filtros (Português) - Linhas 7288-7623
**Tamanho:** ~335 linhas

**Funções:**
- `initFiltrosSystem()` - linha 7288
- `carregarCategorias()` - linha 7547
- `populateCategoriasOptions()` - linha 7583
- `carregarResponsaveis()` - linha 7565
- `populateResponsaveisOptions()` - linha 7603
- `aplicarFiltros()` - linha 7429
- `abrirModalFiltros()` - linha 7392
- `fecharModalFiltros()` - linha 7402
- `renderizarChips()` - linha 7447
- `limparTodosFiltros()` - linha 7531

**Características:**
- State management: `filtrosState` com status, categorias, periodo, responsavel
- Modal completo de filtros
- Sistema de chips visuais
- Containers: `categorias-filter-options`, `responsavel-filter-options`
- Idioma: Português (categorias, responsáveis)

**Inicialização:**
```javascript
// Linha 7697-7699 no DOMContentLoaded com timeout
setTimeout(() => {
    if (typeof initFiltrosSystem === 'function') {
        initFiltrosSystem();
    }
}, 500);
```

---

**🔍 Comparação Detalhada:**

| Aspecto | Sistema 1 (Inglês) | Sistema 2 (Português) |
|---------|-------------------|----------------------|
| **Idioma** | Inglês | Português |
| **Linhas** | ~271 | ~335 |
| **UI** | Dropdowns inline | Modal dedicado |
| **State** | Variáveis locais | Objeto `filtrosState` |
| **Chips visuais** | ✅ Sim | ✅ Sim |
| **Período** | ❌ Não | ✅ Sim |
| **Status** | ❌ Não | ✅ Sim |
| **Aplicar** | Automático | Botão "Aplicar" |
| **Limpar** | Individual | Botão "Limpar Todos" |

**🎯 Ação Recomendada:**
```diff
! INVESTIGAR qual sistema está efetivamente em uso
! Verificar qual modal/interface o usuário vê
! ESCOLHER UM DOS DOIS SISTEMAS baseado em:
  - Qual está mais completo (Sistema 2 parece mais rico)
  - Qual tem melhor UX
  - Qual segue padrões do projeto
+ REMOVER completamente o sistema não escolhido
+ PADRONIZAR nomenclatura (Português OU Inglês)
+ Economia: ~300+ linhas
```

**⚠️ Impacto da Consolidação:**
- ⚠️ **REQUER ANÁLISE** - Verificar qual interface está ativa
- ⚠️ **REQUER TESTES** - Garantir que filtros funcionam após remoção
- ✅ **BENEFÍCIOS** - Reduz drasticamente complexidade
- ✅ **MANUTENÇÃO** - Um único sistema para manter

---

## 🐛 BUGS CORRIGIDOS RELACIONADOS A DUPLICAÇÕES

### Bug 1: Emoji Duplicado no Toast (✅✅)

**Status:** ✅ **CORRIGIDO em 03/10/2025**

**📍 Localização do Bug:**
- Linha 7783 (antiga): `showToast('✅ Participações salvas com sucesso!', 'success');`

**🔍 Causa Raiz:**
A função `showToast` (linha 4782) **adiciona automaticamente** o ícone apropriado baseado no tipo:

```javascript
const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
};

toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>  // ✅ Adiciona ícone
    <span class="toast-message">${message}</span>   // Mensagem
`;
```

Quando a mensagem **já incluía** o emoji ✅, resultava em:
- toast-icon: ✅
- toast-message: ✅ Participações salvas...
- **Resultado:** ✅✅ Participações salvas...

**✅ Solução Aplicada:**
```diff
- showToast('✅ Participações salvas com sucesso!', 'success');
+ showToast('Participações salvas com sucesso!', 'success');
```

**📊 Todas as correções aplicadas:**

| Linha | Antes | Depois | Status |
|-------|-------|--------|--------|
| 4697 | `'✅ Participações...'` | `'Participações...'` | ✅ OK |
| 4706 | `'❌ Erro ao salvar...'` | `'Erro ao salvar...'` | ✅ OK |
| 4766 | `'✅ Participações...'` | `'Participações...'` | ✅ OK |
| 4773 | `'❌ Erro ao salvar...'` | `'Erro ao salvar...'` | ✅ OK |
| 7783 | `'✅ Participações...'` | `'Participações...'` | ✅ OK |
| 7796 | `'❌ Erro ao salvar...'` | `'Erro ao salvar...'` | ✅ OK |

---

### Bug 2: Checkboxes Empilhados em Vez de Lado a Lado

**Status:** ✅ **CORRIGIDO em 03/10/2025**

**📍 Localização do Bug:**
- Linha 4605: `optionsDiv.style.display = 'block';`
- Linha 7709: `optionsDiv.style.display = 'block';`

**🔍 Causa Raiz:**
A div `options-${participation.id}` é criada com `display: flex` no HTML inicial:

```javascript
<div id="options-${participation.id}" style="
    display: ${participation.participou === 'sim' ? 'flex' : 'none'};
    gap: 16px;
    flex-wrap: nowrap;
">
```

Mas a função `toggleParticipationOptions` estava mudando para `display: 'block'` quando o usuário marcava "Participou", quebrando o layout flex e empilhando os checkboxes verticalmente.

**✅ Solução Aplicada:**
```diff
function toggleParticipationOptions(checkbox) {
    const participationId = checkbox.dataset.participationId;
    const optionsDiv = document.getElementById(`options-${participationId}`);

    if (checkbox.checked) {
-       optionsDiv.style.display = 'block';
+       optionsDiv.style.display = 'flex';
    } else {
        optionsDiv.style.display = 'none';
        // Limpar subcampos
        document.getElementById(`chegou-tarde-${participationId}`).checked = false;
        document.getElementById(`saiu-cedo-${participationId}`).checked = false;
    }
}
```

**📊 Locais corrigidos:**
- ✅ Linha 4605 (função ativa)
- ✅ Linha 7709 (função duplicada)

---

## 📊 PLANO DE AÇÃO PARA REFATORAÇÃO

### 🔴 Prioridade ALTA (Fazer AGORA)

✅ **Concluído:**
1. ✅ Corrigir emoji duplicado no toast (linha 7783)
2. ✅ Corrigir checkboxes empilhados (linhas 4605, 7709)

### 🟡 Prioridade MÉDIA (Próxima Sprint)

⏳ **Pendente:**
3. **Remover `toggleParticipationOptions` duplicada**
   - Arquivo: `app_migrated.html`
   - Linhas: 7704-7716
   - Risco: Baixo
   - Tempo estimado: 5 minutos
   - Teste: Marcar participações no modal

4. **Consolidar `saveAllParticipations`**
   - Arquivo: `app_migrated.html`
   - Linhas: 4614-4712 (manter/melhorar), 7718-7803 (remover)
   - Risco: Médio
   - Tempo estimado: 30 minutos
   - Teste: Salvar participações com observações

5. **Remover `renderParticipantsList` órfã**
   - Arquivo: `app_migrated.html`
   - Linhas: 4473-4598
   - Risco: Baixo
   - Tempo estimado: 5 minutos
   - Teste: Nenhum (função não utilizada)

### 🟢 Prioridade BAIXA (Refatoração Futura)

⏳ **Planejado:**
6. **Investigar sistemas de filtros duplicados**
   - Tempo estimado: 1 hora
   - Requer: Análise de interface, testes de usuário

7. **Consolidar sistema de filtros**
   - Tempo estimado: 2 horas
   - Requer: Decisão sobre qual sistema manter
   - Economia: ~300+ linhas

8. **Padronizar nomenclatura**
   - Tempo estimado: 1 hora
   - Decisão: Português vs Inglês
   - Impacto: Melhor manutenibilidade

---

## 🔧 CHECKLIST PARA REFATORAÇÃO

### Antes de Remover Código Duplicado:

```markdown
[ ] Fazer backup do arquivo atual
[ ] Identificar TODAS as chamadas à função
[ ] Verificar se há dependências cruzadas
[ ] Testar cenário de uso no navegador
[ ] Verificar console do navegador por erros
[ ] Documentar mudanças no git commit
```

### Após Remover Código Duplicado:

```markdown
[ ] Executar testes manuais de funcionalidade
[ ] Verificar console por erros JavaScript
[ ] Testar em diferentes navegadores (se aplicável)
[ ] Atualizar esta documentação com status
[ ] Fazer commit com mensagem descritiva
[ ] Fazer deploy e testar em produção
```

---

## 📈 MÉTRICAS DE MELHORIA

### Situação Atual (03/10/2025)
- **Linhas de código:** 7.896
- **Funções duplicadas:** 2
- **Código redundante:** ~350+ linhas (4,4%)
- **Bugs ativos:** 0 ✅
- **Índice de manutenibilidade:** 🟡 Médio

### Situação Após Refatoração (Projetado)
- **Linhas de código:** ~7.546 (-350 linhas)
- **Funções duplicadas:** 0
- **Código redundante:** 0%
- **Bugs ativos:** 0
- **Índice de manutenibilidade:** 🟢 Alto

### Benefícios Esperados
- ✅ **Redução de 4,4%** no tamanho do arquivo
- ✅ **Eliminação de confusão** entre desenvolvedores
- ✅ **Facilita manutenção** (apenas um local para corrigir bugs)
- ✅ **Melhora performance** (menos código para parsear)
- ✅ **Reduz risco de bugs** (inconsistências eliminadas)

---

## 🔍 OBSERVAÇÕES TÉCNICAS

### Origem das Duplicações

A análise sugere que as duplicações surgiram por:

1. **Desenvolvimento incremental sem busca prévia**
   - Seção "FUNÇÕES DE PARTICIPAÇÃO FALTANTES" (linha 7702) indica que funções foram adicionadas sem verificar se já existiam

2. **Falta de organização/modularização**
   - Arquivo monolítico de 7.896 linhas dificulta localização de código
   - Ausência de índice ou sumário no topo

3. **Possível trabalho paralelo**
   - Dois desenvolvedores podem ter implementado mesma funcionalidade
   - Falta de sincronização/code review

4. **Evolução do código**
   - Versões antigas não foram removidas após refatoração
   - Acúmulo de código legado

### Recomendações Estruturais

Para evitar duplicações futuras:

1. **✅ Organizar código em seções claramente delimitadas**
   ```javascript
   // ============================================
   // SEÇÃO: PARTICIPAÇÕES
   // ============================================
   ```

2. **✅ Adicionar índice no topo do arquivo**
   ```javascript
   /*
    * ÍNDICE DO ARQUIVO
    *
    * 1. Autenticação ................. linha 100
    * 2. Atividades ................... linha 500
    * 3. Participações ................ linha 4200
    * 4. Filtros ...................... linha 4871
    * ...
    */
   ```

3. **✅ Implementar ferramentas de análise estática**
   - ESLint para detectar código duplicado
   - SonarQube para qualidade de código
   - Git hooks para prevenir commits com duplicações

4. **✅ Code Review obrigatório**
   - Verificar duplicações antes de merge
   - Checklist de revisão incluindo "busca por funções similares"

5. **✅ Documentação inline**
   - JSDoc para todas as funções públicas
   - Comentários sobre propósito e uso

6. **✅ Considerar modularização**
   - Separar em múltiplos arquivos JavaScript
   - Sistema de build (Webpack, Rollup) para concatenar

---

## 📞 CONTATO E SUPORTE

**Para dúvidas sobre este documento:**
- Desenvolvedor: Claude Code
- Data da análise: 03/10/2025
- Última atualização: 03/10/2025

**Para executar refatoração:**
1. Revisar este documento
2. Seguir checklist de refatoração
3. Testar extensivamente
4. Atualizar este documento com resultados

---

## 📝 CHANGELOG DESTE DOCUMENTO

### Versão 1.0 (03/10/2025)
- ✅ Análise inicial completa de duplicações
- ✅ Identificadas 2 funções duplicadas
- ✅ Identificada 1 função órfã
- ✅ Identificado 1 sistema redundante
- ✅ Documentados 2 bugs corrigidos
- ✅ Criado plano de ação para refatoração

---

**🎯 Status Geral:** Documentação completa. Sistema funcional. Refatoração planejada para sprint futura.

**📌 Próximo passo:** Executar itens de Prioridade MÉDIA conforme disponibilidade da equipe.
