# 📊 TAREFA 04: Resumo de Atividades do Mês

**Status:** 📋 Planejado
**Criado em:** 24/10/2025
**Prioridade:** 🟢 Baixa
**Complexidade:** 🟢 Baixa
**Tempo Estimado:** 4 horas

---

## 📋 ÍNDICE

1. [Objetivo](#objetivo)
2. [Contexto Atual](#contexto-atual)
3. [Solução Proposta](#solução-proposta)
4. [Arquivos Impactados](#arquivos-impactados)
5. [Código de Implementação](#código-de-implementação)
6. [Pontos de Atenção](#pontos-de-atenção)
7. [Checklist de Implementação](#checklist-de-implementação)
8. [Testes](#testes)
9. [Riscos e Mitigações](#riscos-e-mitigações)

---

## 🎯 OBJETIVO

Adicionar **widget de resumo mensal** na tela de Dashboard mostrando:
- ✅ Total de atividades do mês
- ✅ Distribuição por status (Pendente, Concluída, Cancelada)
- ✅ Distribuição por categoria
- ✅ Comparação com mês anterior (diferença e percentual)
- ✅ Visual atraente com cards coloridos

### Benefício para o Usuário

**Problema Atual:**
- Dashboard está vazio/mockup
- Não há visão geral de atividades do período
- Usuário não sabe se está produtivo ou não

**Solução:**
- Dashboard útil logo ao abrir sistema
- Visão rápida do que aconteceu no mês
- Motivação ao ver números crescendo
- Comparação com mês anterior (gamificação)

---

## 📊 CONTEXTO ATUAL

### Dashboard Atual

**Arquivo:** `src/04-views/dashboard.html`

Atualmente o dashboard está praticamente vazio:
```html
<div id="dashboard" class="page-content hidden">
    <h1>Dashboard</h1>
    <!-- Vazio ou com conteúdo mockup -->
</div>
```

**Oportunidade:**
- Espaço disponível e subutilizado
- Primeira tela que usuário vê ao fazer login
- Perfeito para informações-chave

---

## 💡 SOLUÇÃO PROPOSTA

### Widget de Resumo Mensal

```
┌────────────────────────────────────────────────┐
│  📊 Atividades do Mês - Outubro 2025          │
├────────────────────────────────────────────────┤
│                                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │   12    │  │    5    │  │    6    │       │
│  │  TOTAL  │  │PENDENTE │  │CONCLUÍDA│       │
│  │+3 mês ant│  │         │  │         │       │
│  └─────────┘  └─────────┘  └─────────┘       │
│                                                │
│  ┌─────────┐                                  │
│  │    1    │  Por Categoria:                  │
│  │CANCELADA│  🥋 Treino: 5 | 📚 Estudo: 3     │
│  └─────────┘  🎯 Cerimônia: 4                 │
└────────────────────────────────────────────────┘
```

### Informações Exibidas

1. **Total de Atividades**
   - Número grande e destacado
   - Comparação: "+3 que mês anterior" ou "-2 que mês anterior"
   - Percentual de mudança

2. **Por Status**
   - Pendentes (amarelo)
   - Concluídas (verde)
   - Canceladas (vermelho)

3. **Por Categoria**
   - Chips coloridos com contador
   - Top 5 categorias mais usadas

---

## 📁 ARQUIVOS IMPACTADOS

| Arquivo | Tipo | Modificação | Linhas | Zona |
|---------|------|-------------|--------|------|
| `src/01-business/activities.gs` | Backend Core | Nova função `getMonthSummary()` | ~80 | 🟢 Verde |
| `src/04-views/dashboard.html` | Frontend | Widget de resumo + carregamento | ~100 | 🟢 Verde |

**Total:** 2 arquivos, ~180 linhas

---

## 💻 CÓDIGO DE IMPLEMENTAÇÃO

### 1. Backend Core (activities.gs)

```javascript
// ============================================================
// NOVO: Resumo de atividades do mês
// ============================================================

/**
 * Retorna resumo estatístico de atividades de um mês
 * @param {string} year - Ano (ex: '2025')
 * @param {string} month - Mês (ex: '10' para outubro)
 * @returns {Object} { ok: boolean, stats: {...} }
 */
async function getActivitiesMonthSummary(sessionId, year, month) {
  try {
    // 1. Validar sessão
    const auth = await requireSession(sessionId, 'ActivitiesSummary');
    if (!auth.ok) return auth;

    // 2. Validar parâmetros
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return { ok: false, error: 'Ano inválido' };
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return { ok: false, error: 'Mês inválido' };
    }

    // 3. Calcular range de datas do mês
    const startDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(yearNum, monthNum, 0).getDate();
    const endDate = `${yearNum}-${monthNum.toString().padStart(2, '0')}-${lastDay}`;

    Logger.debug('ActivitiesSummary', 'Calculando resumo', { year, month, startDate, endDate });

    // 4. Query de atividades do mês
    const result = DatabaseManager.query('atividades', {
      data: { $gte: startDate, $lte: endDate }
    });

    if (!result.ok) {
      Logger.error('ActivitiesSummary', 'Erro ao buscar atividades', { error: result.error });
      return { ok: false, error: 'Erro ao buscar atividades' };
    }

    const atividades = result.items || [];
    Logger.info('ActivitiesSummary', 'Atividades encontradas', { count: atividades.length });

    // 5. Calcular estatísticas
    const stats = {
      total: atividades.length,
      porStatus: {
        pendente: 0,
        concluida: 0,
        cancelada: 0
      },
      porCategoria: {}
    };

    // Contar por status
    atividades.forEach(ativ => {
      const status = (ativ.status || '').toString().toLowerCase();
      if (status === 'pendente') stats.porStatus.pendente++;
      else if (status === 'concluida') stats.porStatus.concluida++;
      else if (status === 'cancelada') stats.porStatus.cancelada++;
    });

    // Contar por categoria
    atividades.forEach(ativ => {
      const categoriasIds = (ativ.categorias_ids || '').toString().trim();
      if (!categoriasIds) return;

      const cats = categoriasIds.split(',').map(c => c.trim()).filter(c => c);

      cats.forEach(catId => {
        if (!stats.porCategoria[catId]) {
          stats.porCategoria[catId] = {
            id: catId,
            count: 0
          };
        }
        stats.porCategoria[catId].count++;
      });
    });

    // 6. Buscar nomes das categorias
    const categoriasResult = DatabaseManager.query('categorias_atividades', {});
    if (categoriasResult.ok && categoriasResult.items) {
      const categoriasMap = {};
      categoriasResult.items.forEach(cat => {
        categoriasMap[cat.id] = {
          nome: cat.nome,
          icone: cat.icone || '',
          cor: cat.cor || ''
        };
      });

      // Enriquecer stats com nomes
      Object.keys(stats.porCategoria).forEach(catId => {
        const catInfo = categoriasMap[catId];
        if (catInfo) {
          stats.porCategoria[catId].nome = catInfo.nome;
          stats.porCategoria[catId].icone = catInfo.icone;
          stats.porCategoria[catId].cor = catInfo.cor;
        } else {
          stats.porCategoria[catId].nome = `Categoria ${catId}`;
        }
      });
    }

    // 7. Comparação com mês anterior
    const prevMonth = monthNum - 1 === 0 ? 12 : monthNum - 1;
    const prevYear = monthNum - 1 === 0 ? yearNum - 1 : yearNum;
    const prevStartDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    const prevEndDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${prevLastDay}`;

    const prevResult = DatabaseManager.query('atividades', {
      data: { $gte: prevStartDate, $lte: prevEndDate }
    });

    const prevTotal = (prevResult.ok && prevResult.items) ? prevResult.items.length : 0;
    const diff = stats.total - prevTotal;
    const percentChange = prevTotal > 0 ? ((diff / prevTotal) * 100).toFixed(1) : '0';

    stats.comparacaoMesAnterior = {
      mesAnterior: { year: prevYear, month: prevMonth },
      total: prevTotal,
      diferenca: diff,
      percentual: parseFloat(percentChange)
    };

    Logger.info('ActivitiesSummary', 'Resumo calculado', {
      total: stats.total,
      prevTotal: prevTotal,
      diff: diff
    });

    return {
      ok: true,
      stats: stats
    };

  } catch (error) {
    Logger.error('ActivitiesSummary', 'Exceção', { error: error.message });
    return { ok: false, error: 'Erro ao calcular resumo: ' + error.message };
  }
}
```

### 2. Frontend - Widget no Dashboard (dashboard.html)

```html
<!-- ============================================================
     NOVO: Widget de Resumo de Atividades do Mês
     ============================================================ -->
<div id="dashboard" class="page-content hidden">
  <h1 style="margin-bottom: var(--spacing-xl);">Dashboard</h1>

  <!-- Widget de Resumo de Atividades -->
  <div class="card" id="resumo-atividades-mes">
    <div style="background: var(--gradient-primary); color: white; padding: var(--spacing-lg); margin: calc(-1 * var(--spacing-lg)) calc(-1 * var(--spacing-lg)) var(--spacing-lg); border-radius: var(--radius-lg) var(--radius-lg) 0 0;">
      <h3 style="margin-bottom: var(--spacing-xs); font-size: var(--font-size-xl);">
        📊 Atividades do Mês
      </h3>
      <p style="opacity: 0.9; font-size: var(--font-size-sm);" id="resumo-mes-periodo">
        Outubro 2025
      </p>
    </div>

    <!-- Cards de Estatísticas -->
    <div style="padding: var(--spacing-lg); display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--spacing-lg);">

      <!-- Card Total -->
      <div class="stat-card stat-card-primary">
        <div class="stat-number" id="resumo-total">0</div>
        <div class="stat-label">Total de Atividades</div>
        <div class="badge badge-info" id="resumo-comparacao">Calculando...</div>
      </div>

      <!-- Card Pendentes -->
      <div class="stat-card stat-card-warning">
        <div class="stat-number" id="resumo-pendente">0</div>
        <div class="stat-label">Pendentes</div>
      </div>

      <!-- Card Concluídas -->
      <div class="stat-card stat-card-success">
        <div class="stat-number" id="resumo-concluida">0</div>
        <div class="stat-label">Concluídas</div>
      </div>

      <!-- Card Canceladas -->
      <div class="stat-card stat-card-danger">
        <div class="stat-number" id="resumo-cancelada">0</div>
        <div class="stat-label">Canceladas</div>
      </div>
    </div>

    <!-- Categorias -->
    <div style="padding: 0 var(--spacing-lg) var(--spacing-lg);">
      <h4 style="margin-bottom: var(--spacing-md); color: var(--text); font-size: var(--font-size-md);">
        Por Categoria
      </h4>
      <div id="resumo-categorias" style="display: flex; gap: var(--spacing-sm); flex-wrap: wrap; min-height: 40px;">
        <div style="color: var(--text-light); font-size: var(--font-size-sm);">
          Carregando...
        </div>
      </div>
    </div>
  </div>

  <!-- Outros widgets do dashboard podem vir aqui -->
</div>

<style>
/* ============================================================
   Estilos para Cards de Estatísticas
   ============================================================ */
.stat-card {
  background: var(--light);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  text-align: center;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-card-primary:hover { border-color: var(--primary); }
.stat-card-warning:hover { border-color: var(--warning); }
.stat-card-success:hover { border-color: var(--success); }
.stat-card-danger:hover { border-color: var(--danger); }

.stat-number {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  margin-bottom: var(--spacing-sm);
}

.stat-card-primary .stat-number { color: var(--primary); }
.stat-card-warning .stat-number { color: var(--warning); }
.stat-card-success .stat-number { color: var(--success); }
.stat-card-danger .stat-number { color: var(--danger); }

.stat-label {
  color: var(--text-light);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-sm);
}

.stat-card .badge {
  margin-top: var(--spacing-sm);
}

/* Chips de categoria */
.category-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  background: var(--light);
  border: 1px solid var(--border-color);
}

.category-chip:hover {
  background: var(--surface);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>

<script>
// ============================================================
// NOVO: Carregamento do Dashboard
// ============================================================

/**
 * Inicializa dashboard ao abrir a página
 * Carrega resumo de atividades do mês atual
 */
async function initDashboard() {
  console.log('🏠 Inicializando dashboard...');

  try {
    // Mês atual
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Nome do mês
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const nomeMes = meses[month - 1];

    document.getElementById('resumo-mes-periodo').textContent = `${nomeMes} ${year}`;

    // Carregar resumo
    const response = await apiCall('getActivitiesMonthSummary', year.toString(), month.toString());

    if (response.ok) {
      const stats = response.stats;
      console.log('📊 Estatísticas recebidas:', stats);

      // Atualizar números
      document.getElementById('resumo-total').textContent = stats.total;
      document.getElementById('resumo-pendente').textContent = stats.porStatus.pendente;
      document.getElementById('resumo-concluida').textContent = stats.porStatus.concluida;
      document.getElementById('resumo-cancelada').textContent = stats.porStatus.cancelada;

      // Comparação com mês anterior
      const comp = stats.comparacaoMesAnterior;
      const compText = comp.diferenca >= 0
        ? `+${comp.diferenca} que mês anterior (+${comp.percentual}%)`
        : `${comp.diferenca} que mês anterior (${comp.percentual}%)`;

      const badge = document.getElementById('resumo-comparacao');
      badge.textContent = compText;

      // Cor do badge: verde se cresceu, vermelho se diminuiu
      if (comp.diferenca > 0) {
        badge.className = 'badge badge-success';
      } else if (comp.diferenca < 0) {
        badge.className = 'badge badge-danger';
      } else {
        badge.className = 'badge badge-secondary';
        badge.textContent = 'Mesmo que mês anterior';
      }

      // Renderizar categorias
      renderCategorias(stats.porCategoria);

    } else {
      console.error('❌ Erro ao carregar resumo:', response.error);
      document.getElementById('resumo-comparacao').textContent = 'Erro ao carregar';
      document.getElementById('resumo-categorias').innerHTML = `
        <div style="color: var(--danger); font-size: var(--font-size-sm);">
          Erro ao carregar dados
        </div>
      `;
    }

  } catch (error) {
    console.error('❌ Exceção ao carregar dashboard:', error);
  }
}

/**
 * Renderiza chips de categorias
 */
function renderCategorias(porCategoria) {
  const container = document.getElementById('resumo-categorias');

  if (!porCategoria || Object.keys(porCategoria).length === 0) {
    container.innerHTML = `
      <div style="color: var(--text-light); font-size: var(--font-size-sm);">
        Nenhuma categoria registrada neste mês
      </div>
    `;
    return;
  }

  // Ordenar por quantidade (decrescente)
  const categorias = Object.values(porCategoria).sort((a, b) => b.count - a.count);

  // Renderizar chips
  container.innerHTML = categorias.map(cat => {
    const icone = cat.icone || '📁';
    const nome = cat.nome || `Categoria ${cat.id}`;
    const count = cat.count;

    return `
      <div class="category-chip">
        <span>${icone}</span>
        <span>${nome}</span>
        <span style="font-weight: 700; color: var(--primary);">${count}</span>
      </div>
    `;
  }).join('');
}

// ============================================================
// INTEGRAÇÃO: Chamar initDashboard ao navegar para dashboard
// ============================================================

// NOTA: Esta função já deve existir no sistema de navegação
// Modificar para incluir initDashboard()
//
// Exemplo (em app_router.html ou navigation.html):
// if (targetPage === 'dashboard') {
//   initDashboard();
// }
</script>
```

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Performance com Muitas Atividades

**Cenário:**
- 1000 atividades no mês
- Query simples sem índices

**Performance Esperada:**
- Query: ~200ms
- Processamento JS: ~50ms
- **Total: ~250ms** ✅ Aceitável

**Se Degradar:**
- Implementar cache (1 hora)
- Índice na coluna `data`

### 2. Integração com Navegação

**Onde Chamar `initDashboard()`?**

Depende do sistema de navegação existente:

**Opção A:** No router (app_router.html)
```javascript
Router.mount('dashboard', () => {
  showPage('dashboard');
  initDashboard(); // Carregar ao entrar
});
```

**Opção B:** No navigation.html
```javascript
function navigateToPage(targetPage) {
  // ... código existente ...

  if (targetPage === 'dashboard') {
    initDashboard();
  }
}
```

### 3. Categorias Sem Nome

**Problema:** Categoria pode ter sido deletada mas atividade ainda referencia

**Solução:**
```javascript
if (catInfo) {
  stats.porCategoria[catId].nome = catInfo.nome;
} else {
  stats.porCategoria[catId].nome = `Categoria ${catId}`; // Fallback
}
```

### 4. Mês Sem Atividades

**Cenário:** Mês com 0 atividades

**UI Esperada:**
- Total: 0
- Comparação: "Nenhuma atividade neste mês"
- Categorias: "Nenhuma categoria registrada"

**Implementação:**
```javascript
if (stats.total === 0) {
  badge.textContent = 'Nenhuma atividade neste mês';
  badge.className = 'badge badge-secondary';
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Backend

- [ ] Implementar `getActivitiesMonthSummary(sessionId, year, month)`
- [ ] Validar sessão com `requireSession()`
- [ ] Validar parâmetros (year, month)
- [ ] Calcular range de datas
- [ ] Query de atividades do mês
- [ ] Contar por status
- [ ] Contar por categoria
- [ ] Buscar nomes das categorias
- [ ] Query de mês anterior
- [ ] Calcular diferença e percentual
- [ ] Retornar JSON estruturado
- [ ] Logs de debug

### Fase 2: Frontend - Widget

- [ ] Criar HTML do widget
- [ ] Criar estilos para `.stat-card`
- [ ] Criar estilos para `.category-chip`
- [ ] Implementar `initDashboard()`
- [ ] Chamar API `getActivitiesMonthSummary()`
- [ ] Atualizar números no DOM
- [ ] Atualizar badge de comparação (cor dinâmica)
- [ ] Implementar `renderCategorias()`
- [ ] Tratar erro de API
- [ ] Tratar caso de 0 atividades

### Fase 3: Integração

- [ ] Integrar `initDashboard()` com sistema de navegação
- [ ] Testar que carrega ao abrir dashboard
- [ ] Verificar que não carrega múltiplas vezes

### Fase 4: Testes

- [ ] Testar com mês atual (com atividades)
- [ ] Testar com mês sem atividades
- [ ] Testar comparação com mês anterior (positiva, negativa, igual)
- [ ] Testar múltiplas categorias
- [ ] Testar categoria deletada (fallback)
- [ ] Verificar performance (< 500ms)
- [ ] Testar responsividade (mobile)

---

## 🧪 TESTES

### Teste 1: Mês Atual com Atividades

**Setup:**
- Mês atual: Outubro 2025
- 12 atividades no total
- 5 pendentes, 6 concluídas, 1 cancelada
- Categorias: Treino (5), Estudo (3), Cerimônia (4)
- Mês anterior: 9 atividades

**Esperado:**
- Total: 12
- Badge: "+3 que mês anterior (+33.3%)" (verde)
- Por status: 5, 6, 1
- Categorias: 3 chips (Treino: 5, Cerimônia: 4, Estudo: 3)

### Teste 2: Mês Sem Atividades

**Setup:**
- Mês atual: Janeiro 2025
- 0 atividades

**Esperado:**
- Total: 0
- Badge: "Nenhuma atividade neste mês" (cinza)
- Por status: 0, 0, 0
- Categorias: "Nenhuma categoria registrada"

### Teste 3: Comparação Negativa

**Setup:**
- Mês atual: 8 atividades
- Mês anterior: 12 atividades

**Esperado:**
- Total: 8
- Badge: "-4 que mês anterior (-33.3%)" (vermelho)

### Teste 4: Performance

**Setup:**
- 100 atividades no mês
- 10 categorias diferentes

**Métrica:**
- Tempo total < 500ms

**Como Medir:**
```javascript
console.time('initDashboard');
await initDashboard();
console.timeEnd('initDashboard'); // Deve mostrar ~250-400ms
```

---

## 🚨 RISCOS E MITIGAÇÕES

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| 1 | Performance lenta com muitas atividades | 🟡 Média | 🟡 Médio | Query otimizada, índice na data, cache de 1h se necessário |
| 2 | Categoria deletada (sem nome) | 🟡 Média | 🟢 Baixo | Fallback: "Categoria ID" |
| 3 | Múltiplas chamadas (navegação duplicada) | 🟢 Baixa | 🟢 Baixo | Flag para prevenir re-inicialização |
| 4 | Dashboard quebrar outras páginas | 🟢 Baixa | 🟡 Médio | Código isolado, não modifica globals |
| 5 | Muitas categorias (overflow) | 🟢 Baixa | 🟢 Baixo | Flex-wrap + scroll horizontal se necessário |

---

## 📈 MÉTRICAS DE SUCESSO

### Funcionalidade
- [ ] Widget carrega corretamente ao abrir dashboard
- [ ] Números estão corretos
- [ ] Comparação com mês anterior funciona
- [ ] Categorias são exibidas com nomes

### Performance
- [ ] Carregamento < 500ms
- [ ] Não trava interface
- [ ] Apenas 2 queries (mês atual + mês anterior)

### UX
- [ ] Visual atraente e profissional
- [ ] Informação clara e útil
- [ ] Responsivo (mobile)
- [ ] Cores ajudam a interpretar dados

---

## 📚 REFERÊNCIAS

### Arquivos Relacionados
- `src/01-business/activities.gs` - Core de atividades
- `src/04-views/dashboard.html` - Dashboard
- `src/03-shared/app_router.html` - Sistema de navegação
- `src/05-components/core/navigation.html` - Navegação

### Documentação Relacionada
- [MAPA_CODIGO.md](../MAPA_CODIGO.md) - Onde está cada função
- [CLAUDE_INSTRUCOES.md](../CLAUDE_INSTRUCOES.md) - Regras de modificação

---

**Última Atualização:** 24/10/2025
**Autor:** Claude Code
**Status:** 📋 Pronto para implementação
**Dependências:** Nenhuma (independente)
**Prioridade de Implementação:** ✅ Boa opção para implementar primeiro (simples, baixo risco)
