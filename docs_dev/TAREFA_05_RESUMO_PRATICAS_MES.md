# 📈 TAREFA 05: Resumo de Relatórios de Práticas do Mês

**Status:** 📋 Planejado
**Criado em:** 24/10/2025
**Prioridade:** 🟢 Baixa
**Complexidade:** 🟡 Média
**Tempo Estimado:** 6-7 horas

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

Transformar `reports.html` de **mockup** em **funcional** com dados reais:
- ✅ Estatísticas do mês (dias com registros, taxa de completude, total de práticas, streak)
- ✅ Comparação com mês anterior
- ✅ Detalhamento por prática individual
- ✅ Gráfico de evolução (opcional - CSS puro)
- ✅ Navegação entre meses (anterior/próximo)

### Benefício para o Usuário

**Problema Atual:**
- `reports.html` tem números hardcoded (mockup)
- Não reflete dados reais do usuário
- Inutilizável para acompanhamento

**Solução:**
- Dados reais de práticas do mês
- Insights sobre consistência
- Motivação ao ver progresso
- Identificar padrões (dias com mais/menos práticas)

---

## 📊 CONTEXTO ATUAL

### Reports.html Atual

**Arquivo:** `src/04-views/reports.html:1-100`

Atualmente tem números **hardcoded**:
```html
<div id="report-total-days">23</div>  <!-- Fixo! -->
<div id="report-completion-rate">76%</div>  <!-- Fixo! -->
<div id="report-total-practices">189</div>  <!-- Fixo! -->
<div id="report-consistency">18</div>  <!-- Fixo! -->
```

**Estrutura Existente:**
- ✅ Header com período
- ✅ 4 cards de estatísticas
- ✅ Placeholder para gráfico
- ✅ Detalhamento por prática
- ✅ Botões de navegação (‹ e ›)

**Falta:**
- ❌ Carregar dados reais
- ❌ Implementar funções JS
- ❌ Conectar com backend
- ❌ Navegação funcional

---

## 💡 SOLUÇÃO PROPOSTA

### Estatísticas a Calcular

```
┌────────────────────────────────────────────────┐
│  📊 ESTATÍSTICAS DO MÊS                        │
├────────────────────────────────────────────────┤
│                                                │
│  1. Dias com Registros                        │
│     - Quantos dias o usuário registrou algo   │
│     - Comparação com mês anterior             │
│                                                │
│  2. Taxa de Completude                        │
│     - % de dias com 100% das práticas         │
│     - Dias perfeitos vs dias parciais         │
│                                                │
│  3. Total de Práticas                         │
│     - Soma de todas as quantidades            │
│     - Comparação com mês anterior             │
│                                                │
│  4. Streak (Dias Consecutivos)                │
│     - Maior sequência de dias seguidos        │
│     - Motivação para manter consistência      │
│                                                │
│  5. Detalhamento por Prática                  │
│     - Total no mês                            │
│     - Média diária                            │
│     - Dias registrados                        │
└────────────────────────────────────────────────┘
```

### Cálculo de Taxa de Completude

**Lógica:**
```
Dia 100% Completo = TODAS as práticas preenchidas E nenhuma com valor 0

Taxa = (Dias 100% / Total de dias com registros) * 100
```

**Exemplo:**
- Mês de Outubro (31 dias)
- Usuário registrou em 23 dias
- Desses 23 dias, 18 estavam 100% completos
- Taxa = (18 / 23) * 100 = **78%**

### Cálculo de Streak

**Lógica:**
```
Streak = Maior sequência de dias consecutivos com registros

Dia 1, 2, 3, 4 [faltou], 6, 7, 8, 9
         ↑ Sequência 1: 4 dias
                              ↑ Sequência 2: 4 dias

Maior streak = 4
```

---

## 📁 ARQUIVOS IMPACTADOS

| Arquivo | Tipo | Modificação | Linhas | Zona |
|---------|------|-------------|--------|------|
| `src/01-business/practices.gs` | Backend Core | Nova função `getMonthlyReport()` | ~120 | 🟢 Verde |
| `src/02-api/practices_api.gs` | Backend API | Expor `getMonthlyReport()` | ~30 | 🟢 Verde |
| `src/04-views/reports.html` | Frontend | Implementar carregamento real | ~100 | 🟢 Verde |

**Total:** 3 arquivos, ~250 linhas

---

## 💻 CÓDIGO DE IMPLEMENTAÇÃO

### 1. Backend Core (practices.gs)

```javascript
// ============================================================
// NOVO: Relatório mensal de práticas
// ============================================================

/**
 * Gera relatório mensal de práticas de um membro
 * @param {number} memberId - ID do membro
 * @param {number} year - Ano (2025)
 * @param {number} month - Mês (1-12)
 * @returns {Object} { ok: boolean, report: {...} }
 */
async function _getMonthlyPracticesReport(memberId, year, month) {
  try {
    Logger.debug('PracticesReport', 'Iniciando cálculo', { memberId, year, month });

    // 1. Range do mês
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month, 0).getDate();
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${lastDay}`;

    // 2. Carregar práticas cadastradas (disponíveis)
    const practicesResult = await _loadAvailablePractices(memberId);
    if (!practicesResult.ok) {
      return { ok: false, error: 'Erro ao carregar práticas cadastradas' };
    }
    const availablePractices = practicesResult.items;

    if (availablePractices.length === 0) {
      return { ok: false, error: 'Nenhuma prática cadastrada no sistema' };
    }

    Logger.debug('PracticesReport', 'Práticas disponíveis', { count: availablePractices.length });

    // 3. Carregar práticas realizadas no mês
    const dataResult = await _loadPracticesByMemberAndDateRange(memberId, startDate, endDate);
    if (!dataResult.ok) {
      return { ok: false, error: 'Erro ao carregar práticas realizadas' };
    }
    const practicesData = dataResult.items;

    Logger.debug('PracticesReport', 'Práticas realizadas', { count: practicesData.length });

    // 4. Organizar por data
    const practicesByDate = {};
    practicesData.forEach(p => {
      if (!practicesByDate[p.data]) {
        practicesByDate[p.data] = {};
      }
      practicesByDate[p.data][p.pratica_id] = p.quantidade;
    });

    // 5. Calcular estatísticas principais
    const daysWithRecords = Object.keys(practicesByDate).length;

    let daysWithFullCompletion = 0;
    let totalPractices = 0;

    Object.values(practicesByDate).forEach(day => {
      const completedPractices = Object.keys(day).length;
      totalPractices += completedPractices;

      // Dia 100% = todas as práticas preenchidas E nenhuma com valor 0
      const hasAllPractices = (completedPractices === availablePractices.length);
      const hasNoZeros = Object.values(day).every(val => val > 0);

      if (hasAllPractices && hasNoZeros) {
        daysWithFullCompletion++;
      }
    });

    const completionRate = daysWithRecords > 0
      ? Math.round((daysWithFullCompletion / daysWithRecords) * 100)
      : 0;

    // 6. Calcular streak (dias consecutivos)
    const sortedDates = Object.keys(practicesByDate).sort();
    let currentStreak = 0;
    let maxStreak = 0;
    let lastDate = null;

    sortedDates.forEach(dateStr => {
      if (!lastDate) {
        currentStreak = 1;
      } else {
        const lastDateObj = new Date(lastDate);
        const currentDateObj = new Date(dateStr);
        const diffDays = Math.round((currentDateObj - lastDateObj) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          currentStreak++;
        } else {
          currentStreak = 1;
        }
      }
      maxStreak = Math.max(maxStreak, currentStreak);
      lastDate = dateStr;
    });

    // 7. Estatísticas por prática individual
    const practiceStats = {};
    availablePractices.forEach(prat => {
      let total = 0;
      let days = 0;
      let maxValue = 0;

      Object.values(practicesByDate).forEach(day => {
        if (day[prat.id] !== undefined) {
          const val = day[prat.id];
          total += val;
          days++;
          maxValue = Math.max(maxValue, val);
        }
      });

      practiceStats[prat.id] = {
        id: prat.id,
        nome: prat.nome,
        icone: prat.icone || '',
        tipo: prat.tipo,
        unidade: prat.unidade || 'vezes',
        meta: prat.meta || 0,
        total: total,
        dias: days,
        media: days > 0 ? (total / days).toFixed(1) : 0,
        maximo: maxValue
      };
    });

    // 8. Comparação com mês anterior
    const prevMonth = month - 1 === 0 ? 12 : month - 1;
    const prevYear = month - 1 === 0 ? year - 1 : year;
    const prevStartDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-01`;
    const prevLastDay = new Date(prevYear, prevMonth, 0).getDate();
    const prevEndDate = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${prevLastDay}`;

    const prevDataResult = await _loadPracticesByMemberAndDateRange(memberId, prevStartDate, prevEndDate);
    const prevPracticesByDate = {};

    if (prevDataResult.ok) {
      prevDataResult.items.forEach(p => {
        if (!prevPracticesByDate[p.data]) {
          prevPracticesByDate[p.data] = {};
        }
        prevPracticesByDate[p.data][p.pratica_id] = p.quantidade;
      });
    }

    const prevDaysWithRecords = Object.keys(prevPracticesByDate).length;
    const daysDiff = daysWithRecords - prevDaysWithRecords;

    let prevTotalPractices = 0;
    Object.values(prevPracticesByDate).forEach(day => {
      prevTotalPractices += Object.keys(day).length;
    });
    const practicesDiff = totalPractices - prevTotalPractices;

    // 9. Montar relatório final
    const report = {
      period: {
        year: year,
        month: month,
        startDate: startDate,
        endDate: endDate
      },
      statistics: {
        daysWithRecords: daysWithRecords,
        daysWithFullCompletion: daysWithFullCompletion,
        completionRate: completionRate,
        totalPractices: totalPractices,
        maxStreak: maxStreak
      },
      practiceStats: practiceStats,
      comparison: {
        prevMonth: {
          year: prevYear,
          month: prevMonth
        },
        daysDiff: daysDiff,
        practicesDiff: practicesDiff
      }
    };

    Logger.info('PracticesReport', 'Relatório gerado', {
      memberId,
      daysWithRecords,
      totalPractices,
      streak: maxStreak
    });

    return { ok: true, report: report };

  } catch (error) {
    Logger.error('PracticesReport', 'Erro ao gerar relatório', {
      memberId,
      year,
      month,
      error: error.message
    });
    return { ok: false, error: 'Erro ao gerar relatório: ' + error.message };
  }
}
```

### 2. Backend API (practices_api.gs)

```javascript
// ============================================================
// NOVO: API de relatório mensal
// ============================================================

/**
 * Retorna relatório mensal de práticas
 * @param {string} sessionId - ID da sessão
 * @param {number} memberId - ID do membro
 * @param {number} year - Ano
 * @param {number} month - Mês (1-12)
 * @returns {Object} { ok: boolean, report: {...} }
 */
async function getMonthlyPracticesReport(sessionId, memberId, year, month) {
  try {
    // 1. Validar acesso ao membro
    const auth = await requireMemberAccess(sessionId, memberId, 'PracticesReport');
    if (!auth.ok) return auth;

    // 2. Validar parâmetros
    const yearNum = parseInt(year, 10);
    const monthNum = parseInt(month, 10);

    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      return { ok: false, error: 'Ano inválido' };
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return { ok: false, error: 'Mês inválido (deve ser 1-12)' };
    }

    // 3. Gerar relatório
    const result = await _getMonthlyPracticesReport(memberId, yearNum, monthNum);

    // 4. Serializar para HTMLService
    return JSON.parse(JSON.stringify(result));

  } catch (error) {
    Logger.error('PracticesReportAPI', 'Erro', {
      memberId,
      year,
      month,
      error: error.message
    });
    return { ok: false, error: 'Erro ao gerar relatório: ' + error.message };
  }
}
```

### 3. Frontend - Implementar Carregamento (reports.html)

```javascript
// ============================================================
// MODIFICAÇÃO: Implementar carregamento real de dados
// ============================================================

// Estado global
let currentReportYear = null;
let currentReportMonth = null;

/**
 * Inicializa relatórios ao abrir a página
 */
async function initReports() {
  console.log('📊 Inicializando relatórios...');

  try {
    // 1. Validar membro selecionado
    if (!State.selectedMemberId) {
      showToast('Nenhum membro selecionado', 'warning');
      return;
    }

    const memberId = parseInt(State.selectedMemberId, 10);
    if (isNaN(memberId) || memberId <= 0) {
      showToast('Erro: ID do membro inválido', 'error');
      return;
    }

    // 2. Mês atual (padrão)
    const now = new Date();
    currentReportYear = now.getFullYear();
    currentReportMonth = now.getMonth() + 1;

    // 3. Carregar dados
    await loadReportData(memberId, currentReportYear, currentReportMonth);

  } catch (error) {
    console.error('❌ Erro ao inicializar relatórios:', error);
    showToast('Erro ao carregar relatórios: ' + error.message, 'error');
  }
}

/**
 * Carrega dados do relatório
 */
async function loadReportData(memberId, year, month) {
  try {
    showLoadingOverlay(true, 'Carregando relatório...');

    // Atualizar display do período
    updatePeriodDisplay(year, month);

    // Chamar API
    const response = await apiCall('getMonthlyPracticesReport', memberId, year, month);

    showLoadingOverlay(false);

    if (!response.ok) {
      showToast('Erro ao carregar relatório: ' + response.error, 'error');
      return;
    }

    const report = response.report;
    console.log('📊 Relatório recebido:', report);

    // Atualizar interface
    updateStatistics(report.statistics);
    updateComparison(report.comparison);
    updatePracticeDetails(report.practiceStats);

  } catch (error) {
    console.error('❌ Erro ao carregar dados:', error);
    showLoadingOverlay(false);
    showToast('Erro ao carregar relatório', 'error');
  }
}

/**
 * Atualiza display do período
 */
function updatePeriodDisplay(year, month) {
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  const nomeMes = meses[month - 1];

  document.getElementById('report-period-display').textContent = `${nomeMes} ${year}`;
  document.getElementById('report-detail-period').textContent = `${nomeMes} ${year}`;
}

/**
 * Atualiza estatísticas principais
 */
function updateStatistics(stats) {
  document.getElementById('report-total-days').textContent = stats.daysWithRecords;
  document.getElementById('report-completion-rate').textContent = stats.completionRate + '%';
  document.getElementById('report-total-practices').textContent = stats.totalPractices;
  document.getElementById('report-consistency').textContent = stats.maxStreak;
}

/**
 * Atualiza comparação com mês anterior
 */
function updateComparison(comparison) {
  // Dias com registros
  const daysChangeText = comparison.daysDiff >= 0
    ? `+${comparison.daysDiff} que mês anterior`
    : `${comparison.daysDiff} que mês anterior`;
  document.getElementById('report-days-change').textContent = daysChangeText;

  // Total de práticas
  const practicesChangeText = comparison.practicesDiff >= 0
    ? `+${comparison.practicesDiff} que mês anterior`
    : `${comparison.practicesDiff} que mês anterior`;
  document.getElementById('report-practices-change').textContent = practicesChangeText;

  // Taxa de completude (TODO: calcular diferença de % também)
  // document.getElementById('report-completion-change').textContent = '...';

  // Streak (mostrar mensagem motivacional)
  const streakEl = document.getElementById('report-consistency-change');
  if (comparison.daysDiff > 0) {
    streakEl.textContent = 'Você melhorou! Continue assim!';
    streakEl.className = 'badge badge-success';
  } else if (comparison.daysDiff < 0) {
    streakEl.textContent = 'Vamos recuperar o ritmo!';
    streakEl.className = 'badge badge-warning';
  } else {
    streakEl.textContent = 'Mantendo consistência';
    streakEl.className = 'badge badge-info';
  }
}

/**
 * Atualiza detalhamento por prática
 */
function updatePracticeDetails(practiceStats) {
  // Exemplo: Atualizar "Okiyome para Pessoas" (assumindo IDs conhecidos)
  // NOTA: Adaptar conforme práticas cadastradas no sistema

  Object.values(practiceStats).forEach(prat => {
    // Tentar encontrar elemento pelo nome (ou criar dinamicamente)
    // Por simplicidade, vamos atualizar IDs conhecidos:

    if (prat.nome.includes('Pessoas')) {
      document.getElementById('report-pessoas-total').textContent = `${prat.total} ${prat.unidade}`;
      document.getElementById('report-pessoas-media').textContent = `${prat.media} ${prat.unidade}/dia`;
    }

    // TODO: Adicionar outros campos ou renderizar dinamicamente
  });
}

/**
 * Navega para mês anterior
 */
function previousReportPeriod() {
  if (currentReportMonth === 1) {
    currentReportMonth = 12;
    currentReportYear--;
  } else {
    currentReportMonth--;
  }

  const memberId = parseInt(State.selectedMemberId, 10);
  loadReportData(memberId, currentReportYear, currentReportMonth);
}

/**
 * Navega para próximo mês
 */
function nextReportPeriod() {
  if (currentReportMonth === 12) {
    currentReportMonth = 1;
    currentReportYear++;
  } else {
    currentReportMonth++;
  }

  const memberId = parseInt(State.selectedMemberId, 10);
  loadReportData(memberId, currentReportYear, currentReportMonth);
}
```

---

## ⚠️ PONTOS DE ATENÇÃO

### 1. Práticas Dinâmicas (Não Hardcoded)

**Problema:** Template HTML atual tem IDs hardcoded para práticas específicas

**Solução 1:** Renderizar dinamicamente
```javascript
function updatePracticeDetails(practiceStats) {
  const container = document.getElementById('practices-details-container');

  container.innerHTML = Object.values(practiceStats).map(prat => `
    <div class="practice-detail-card">
      <div class="practice-header">${prat.icone} ${prat.nome}</div>
      <div>Total: ${prat.total} ${prat.unidade}</div>
      <div>Média: ${prat.media} ${prat.unidade}/dia</div>
      <div>Dias registrados: ${prat.dias}</div>
    </div>
  `).join('');
}
```

**Solução 2:** Manter template, atualizar apenas valores conhecidos

**Decisão Recomendada:** Solução 1 (dinâmico)

### 2. Gráfico de Evolução

**Opções:**
- **A)** CSS Puro (barras simples) ✅ RECOMENDADO
- **B)** Biblioteca (Chart.js, ApexCharts)
- **C)** Não implementar (deixar para depois)

**Decisão Recomendada:** Opção C (focar em estatísticas primeiro, gráfico é nice-to-have)

### 3. Performance com Muitos Dias

**Cenário:**
- 30 dias com registros
- 5 práticas cadastradas
- 150 registros

**Performance Esperada:**
- Query: ~150ms
- Processamento: ~50ms
- **Total: ~200ms** ✅ Aceitável

### 4. Navegação de Meses

**Estado:**
```javascript
let currentReportYear = 2025;
let currentReportMonth = 10;

// Usuário clica "‹" (mês anterior)
// → Recarrega com year=2025, month=9
```

**Edge Cases:**
- Janeiro → Dezembro do ano anterior
- Dezembro → Janeiro do ano seguinte

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Fase 1: Backend Core

- [ ] Implementar `_getMonthlyPracticesReport(memberId, year, month)`
- [ ] Query de práticas do mês
- [ ] Organizar por data
- [ ] Calcular dias com registros
- [ ] Calcular dias com completude 100%
- [ ] Calcular taxa de completude
- [ ] Calcular total de práticas
- [ ] Calcular streak (dias consecutivos)
- [ ] Estatísticas por prática (total, média, máximo, dias)
- [ ] Query de mês anterior
- [ ] Calcular diferenças
- [ ] Retornar JSON estruturado
- [ ] Logs de debug

### Fase 2: Backend API

- [ ] Expor `getMonthlyPracticesReport(sessionId, memberId, year, month)`
- [ ] Validar com `requireMemberAccess()`
- [ ] Validar parâmetros (year, month)
- [ ] Serializar resposta

### Fase 3: Frontend - Carregamento

- [ ] Implementar `initReports()`
- [ ] Validar `State.selectedMemberId`
- [ ] Definir mês atual como padrão
- [ ] Implementar `loadReportData()`
- [ ] Chamar API `getMonthlyPracticesReport()`
- [ ] Implementar `updateStatistics()`
- [ ] Implementar `updateComparison()`
- [ ] Implementar `updatePracticeDetails()`
- [ ] Implementar `updatePeriodDisplay()`

### Fase 4: Frontend - Navegação

- [ ] Implementar `previousReportPeriod()`
- [ ] Implementar `nextReportPeriod()`
- [ ] Testar edge cases (virada de ano)

### Fase 5: Testes

- [ ] Testar com mês atual
- [ ] Testar com mês anterior (navegação)
- [ ] Testar com mês sem registros
- [ ] Testar comparação correta
- [ ] Testar cálculo de streak
- [ ] Testar cálculo de taxa de completude
- [ ] Verificar performance (< 500ms)
- [ ] Testar navegação entre meses

---

## 🧪 TESTES

### Teste 1: Mês Atual com Dados

**Setup:**
- Membro: 5
- Mês: Outubro 2025
- 23 dias com registros
- 18 dias com 100% completude
- 189 práticas no total
- Maior streak: 12 dias
- Mês anterior: 20 dias, 165 práticas

**Esperado:**
- Dias com registros: 23
- Taxa de completude: 78% (18/23)
- Total de práticas: 189
- Streak: 12
- Comparação dias: +3
- Comparação práticas: +24

### Teste 2: Mês Sem Registros

**Setup:**
- Mês: Janeiro 2025
- 0 registros

**Esperado:**
- Dias com registros: 0
- Taxa de completude: 0%
- Total de práticas: 0
- Streak: 0
- Comparação: "0 que mês anterior"

### Teste 3: Navegação de Meses

**Passos:**
1. Abrir relatórios (mês atual = Outubro 2025)
2. Clicar "‹" (mês anterior)
3. Período deve mudar para "Setembro 2025"
4. Números devem atualizar
5. Clicar "‹" 9 vezes (voltar até Janeiro 2025)
6. Clicar "‹" mais 1 vez
7. Período deve mudar para "Dezembro 2024"

**Esperado:**
- ✅ Navegação funcional
- ✅ Dados corretos em cada mês
- ✅ Sem erros ao cruzar anos

### Teste 4: Cálculo de Streak

**Cenário:**
```
Dia 1: ✅ (1)
Dia 2: ✅ (2)
Dia 3: ✅ (3)
Dia 4: ❌ (reset)
Dia 5: ❌
Dia 6: ✅ (1)
Dia 7: ✅ (2)
Dia 8: ✅ (3)
Dia 9: ✅ (4)
Dia 10: ✅ (5)

Maior streak = 5
```

**Esperado:**
- Streak: 5 ✅

---

## 🚨 RISCOS E MITIGAÇÕES

| # | Risco | Probabilidade | Impacto | Mitigação |
|---|-------|--------------|---------|-----------|
| 1 | Cálculo complexo de streak | 🟡 Média | 🟢 Baixo | Algoritmo simples, testar bem com edge cases |
| 2 | Práticas dinâmicas (variam) | 🟡 Média | 🟡 Médio | Renderizar dinamicamente, não usar IDs hardcoded |
| 3 | Performance com muitos registros | 🟢 Baixa | 🟡 Médio | Query batch otimizada, ~200ms aceitável |
| 4 | Navegação entre meses (edge cases) | 🟡 Média | 🟢 Baixo | Testar virada de ano (Janeiro↔Dezembro) |
| 5 | Gráfico complexo | 🟡 Média | 🟢 Baixo | Deixar para depois, focar em estatísticas |

---

## 📈 MÉTRICAS DE SUCESSO

### Funcionalidade
- [ ] Estatísticas são calculadas corretamente
- [ ] Comparação com mês anterior funciona
- [ ] Detalhamento por prática é exibido
- [ ] Navegação entre meses funciona
- [ ] Cálculo de streak está correto

### Performance
- [ ] Carregamento < 500ms
- [ ] Apenas 2 queries (mês atual + mês anterior)
- [ ] Navegação fluida (sem travamento)

### UX
- [ ] Números são claros e úteis
- [ ] Comparação motiva usuário
- [ ] Informações ajudam a tomar decisões
- [ ] Interface responsiva

---

## 📚 REFERÊNCIAS

### Arquivos Relacionados
- `src/01-business/practices.gs` - Core de práticas
- `src/02-api/practices_api.gs` - APIs de práticas
- `src/04-views/reports.html` - Interface de relatórios
- [docs_dev/PRATICAS.md](PRATICAS.md) - Documentação completa do sistema de práticas

### Documentação Relacionada
- [MAPA_CODIGO.md](../MAPA_CODIGO.md) - Onde está cada função
- [CLAUDE_INSTRUCOES.md](../CLAUDE_INSTRUCOES.md) - Regras de modificação

---

**Última Atualização:** 24/10/2025
**Autor:** Claude Code
**Status:** 📋 Pronto para implementação
**Dependências:** Sistema de práticas (já implementado)
**Prioridade de Implementação:** 🟡 Média (após tarefas mais simples)
