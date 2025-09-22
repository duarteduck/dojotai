# 📊 Tela de Relatórios de Performance - Novo Frontend

> **Para:** Dashboard de administração do novo frontend V3
> **Público:** Admin e Secretaria
> **Objetivo:** Monitorar saúde e performance do sistema

---

## 🎨 **Layout da Tela**

### **📋 Header da Tela**
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Relatórios de Performance                    🔄 Atualizar │
│  ├─ Última atualização: 22/09/2025 11:30                   │
│  └─ Score de Saúde: 85/100 💚                             │
└─────────────────────────────────────────────────────────────┘
```

### **📈 Dashboard Cards (Row 1)**
```
┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ 📊 Operações  │ │ 🎯 Cache      │ │ ⚡ Avg Speed  │ │ 🚨 Alertas    │
│               │ │               │ │               │ │               │
│    1,247      │ │    78.5%      │ │    1.2s       │ │      3        │
│  (últimas 24h)│ │   Hit Rate    │ │   Response    │ │   Críticos    │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘
```

### **📊 Gráficos (Row 2)**
```
┌─────────────────────────────────┐ ┌─────────────────────────────────┐
│  📈 Performance ao Longo do Dia │ │  🏷️ Operações por Tipo        │
│                                 │ │                                 │
│  Duration (ms) ▲               │ │    QUERY    ████████ 45%      │
│               │                 │ │    INSERT   ████     20%      │
│         1000  ├─────────        │ │    UPDATE   ██       15%      │
│               │       ╱╲        │ │    DELETE   █        10%      │
│          500  ├──────╱  ╲──     │ │    VALID    ██       10%      │
│               │     ╱    ╲      │ │                                 │
│            0  └────────────────▶│ │                                 │
│               9h  12h  15h  18h │ │                                 │
└─────────────────────────────────┘ └─────────────────────────────────┘
```

### **🚨 Seção de Alertas e Problemas (Row 3)**
```
┌─────────────────────────────────────────────────────────────┐
│  🚨 Alertas Críticos                                       │
│  ┌─────────────────────────────────────────────────────────┐
│  │ 🔴 HIGH    Query 'atividades' muito lenta (12.3s)       │
│  │            └─ Detectado: 11:25 - Tabela: atividades     │
│  │ 🟡 MEDIUM  Cache hit rate baixo (45%)                   │
│  │            └─ Detectado: 11:20 - Recomenda: ↑ TTL       │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### **💡 Seção de Recomendações (Row 4)**
```
┌─────────────────────────────────────────────────────────────┐
│  💡 Recomendações Automáticas                              │
│  ┌─────────────────────────────────────────────────────────┐
│  │ 1. 🎯 Otimizar query da tabela 'participacoes'           │
│  │    ├─ 23 operações lentas nas últimas 24h              │
│  │    └─ Tempo médio: 4.2s (meta: <2s)                    │
│  │                                                         │
│  │ 2. 📦 Aumentar TTL do cache para 10 minutos            │
│  │    ├─ Cache hit atual: 65%                             │
│  │    └─ Potencial melhoria: +20% performance             │
│  │                                                         │
│  │ 3. 🗑️ Executar limpeza de sessões expiradas            │
│  │    └─ 12 sessões inativas detectadas                   │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

### **📋 Tabela Detalhada (Row 5)**
```
┌─────────────────────────────────────────────────────────────┐
│  📋 Operações Mais Lentas (Top 10)            🔍 [Filtros]  │
│  ┌─────────────────────────────────────────────────────────┐
│  │ Hora   │ Tipo    │ Tabela       │ Duração │ Status      │
│  ├─────────────────────────────────────────────────────────│
│  │ 11:25  │ QUERY   │ atividades   │ 12.3s   │ 🔴 CRITICAL │
│  │ 11:22  │ INSERT  │ sessoes      │  8.1s   │ 🟠 SLOW     │
│  │ 11:20  │ UPDATE  │ membros      │  5.2s   │ 🟠 SLOW     │
│  │ 11:18  │ QUERY   │ participacoes│  4.8s   │ 🟠 SLOW     │
│  │ 11:15  │ VALID   │ atividades   │  3.1s   │ 🟡 NORMAL   │
│  └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 **Funcionalidades da Tela**

### **🔄 Atualizações Automáticas**
- **Auto-refresh**: A cada 30 segundos
- **Real-time alerts**: Notificações push quando houver alertas críticos
- **Background sync**: Busca dados sem reload da página

### **📊 Filtros e Períodos**
- **Período**: Últimas 24h, 7 dias, 30 dias, personalizado
- **Tipo de operação**: QUERY, INSERT, UPDATE, DELETE, VALIDATION
- **Tabela**: Filtrar por tabela específica
- **Classificação**: FAST, NORMAL, SLOW, CRITICAL

### **📤 Ações Disponíveis**
- **🔄 Executar Manutenção**: Botão para `runSystemMaintenance()`
- **📊 Exportar Relatório**: PDF/CSV com dados do período
- **🧹 Limpar Cache**: Forçar limpeza do cache
- **⚙️ Configurar Alertas**: Definir limites personalizados

### **📱 Responsividade Mobile**
- **Cards empilhados** - Dashboard cards em coluna única
- **Gráficos simplificados** - Versões mobile-friendly
- **Tabela com scroll** - Horizontal scroll para tabela detalhada
- **Alertas em destaque** - Cards de alerta mais proeminentes

---

## 🎯 **APIs Necessárias (Backend)**

### **📊 Principais Endpoints**
```javascript
// 1. Obter dashboard de performance
API.getPerformanceDashboard(period = '24h')
// Retorna: score, stats, charts data, alerts, recommendations

// 2. Obter operações lentas paginadas
API.getSlowOperations(filters, pagination)
// Retorna: operations list, total, pagination info

// 3. Obter dados para gráficos
API.getPerformanceCharts(period, type)
// Retorna: timeline data, operation distribution

// 4. Executar ações de manutenção
API.runMaintenance(action)
// Ações: 'cleanup', 'cache_clear', 'health_check'

// 5. Configurar alertas personalizados
API.updateAlertSettings(settings)
// Configurar: limites de tempo, tipos de alerta
```

### **📈 Estrutura de Dados**
```javascript
// Dashboard Response
{
  timestamp: "2025-09-22T11:30:00Z",
  healthScore: 85,
  summary: {
    totalOperations: 1247,
    cacheHitRate: 0.785,
    avgResponseTime: 1200,
    criticalAlerts: 3
  },
  charts: {
    timeline: [/* dados do gráfico de linha */],
    distribution: [/* dados do gráfico de pizza */]
  },
  alerts: [
    {
      priority: "HIGH",
      type: "PERFORMANCE",
      message: "Query 'atividades' muito lenta",
      timestamp: "2025-09-22T11:25:00Z",
      details: { table: "atividades", duration: 12300 }
    }
  ],
  recommendations: [/* array de recomendações */]
}
```

---

## 🎨 **Design System**

### **🎨 Cores para Classificações**
- **🟢 FAST**: `#22c55e` (Verde)
- **🟡 NORMAL**: `#eab308` (Amarelo)
- **🟠 SLOW**: `#f97316` (Laranja)
- **🔴 CRITICAL**: `#ef4444` (Vermelho)

### **📊 Score de Saúde**
- **💚 85-100**: Sistema saudável
- **💛 70-84**: Atenção necessária
- **❤️ 0-69**: Problemas críticos

### **⚡ Animações**
- **Cards**: Hover com sombra sutil
- **Gráficos**: Animação de loading
- **Alertas**: Pulse animation para críticos
- **Transições**: 200ms ease-in-out

---

## 🔒 **Controle de Acesso**

### **👥 Permissões por Papel**
- **Admin**: Acesso completo + ações de manutenção
- **Secretaria**: Visualização completa, ações limitadas
- **Líder**: Apenas visualização básica
- **Usuário**: Sem acesso à tela

### **🔐 Funcionalidades por Nível**
```javascript
Admin: {
  view: true,
  maintenance: true,
  configure: true,
  export: true
}

Secretaria: {
  view: true,
  maintenance: false,
  configure: false,
  export: true
}
```

---

**📅 Esta tela será implementada na Fase 4 do Roadmap V2.0 (Frontend V3)**

**💡 Preparação atual:** Tabelas de performance logs criadas, sistema de monitoramento funcionando, APIs planejadas.