# 🗺️ PADRÃO MAP GLOBAL - DatabaseManager

**Status:** 📋 Documentação / Análise
**Prioridade:** 🟡 Média-Alta (Impacto em performance de todo o sistema)
**Criado em:** 19/10/2025

---

## 🎯 OBJETIVO

Documentar e propor implementação de padrão global de otimização usando Map para evitar N+1 queries em todo o sistema, baseado na solução implementada com sucesso no projeto de Vínculos Usuário↔Membro.

---

## 🚨 PROBLEMA: N+1 QUERIES

### O que é o problema N+1?

Ocorre quando:
1. Fazemos 1 query para buscar uma lista de registros (ex: atividades)
2. Para cada registro, fazemos 1 query adicional para buscar dados relacionados (ex: responsável)
3. Resultado: **N+1 acessos ao banco de dados** (1 inicial + N individuais)

### Por que é problemático no Google Sheets?

```javascript
// ❌ PROBLEMA: N+1 queries
const atividades = DatabaseManager.query('atividades', {...}); // 1 acesso ao Sheets

atividades.items.forEach(ativ => {
  // ❌ Cada iteração = 1 novo acesso ao Sheets
  const responsavel = DatabaseManager.query('usuarios', {
    uid: ativ.responsavel_id
  });

  ativ.responsavel_nome = responsavel.nome;
});

// Total: 1 + 10 atividades = 11 acessos ao Google Sheets
```

**Impacto:**
- Google Sheets é **muito mais lento** que bancos relacionais
- Cada `getDataRange().getValues()` tem latência significativa
- Limite de quotas/minuto do Google Apps Script
- Experiência do usuário degradada (loading longo)

---

## ✅ SOLUÇÃO IMPLEMENTADA: Padrão Map

### Caso Real: Vínculos Usuário↔Membro

**Arquivo:** `src/01-business/vinculos.gs` (linhas 47-96)

#### **ANTES da otimização:**

```javascript
// ❌ N+1 QUERIES
vinculos.forEach(vinculo => {
  // Buscar dados do membro - 1 query POR vínculo
  const membroResult = DatabaseManager.query('membros', {
    codigo_sequencial: vinculo.membro_id
  }, true);

  const membro = membroResult[0];

  items.push({
    ...vinculo,
    membro_nome: membro ? membro.nome : 'Membro não encontrado',
    membro_status: membro ? membro.status : null
  });
});

// Se usuário tem 3 vínculos = 1 + 3 = 4 acessos ao Sheets
```

#### **DEPOIS da otimização:**

```javascript
// ✅ OTIMIZADO: 2 QUERIES TOTAIS

// 1. Buscar TODOS os membros ativos em uma única query
const todosMembroResult = DatabaseManager.query('membros', {
  status: 'Ativo'
}, true);

const todosMembros = Array.isArray(todosMembroResult)
  ? todosMembroResult
  : (todosMembroResult?.data || []);

// 2. Criar Map de lookup por codigo_sequencial para acesso O(1)
const membrosMap = new Map();
todosMembros.forEach(membro => {
  membrosMap.set(membro.codigo_sequencial, membro);
});

Logger.info('Vinculos', `Carregados ${todosMembros.length} membros para lookup`);

// 3. Enriquecer vínculos com dados dos membros (sem queries adicionais)
vinculos.forEach(vinculo => {
  // Lookup em memória - O(1) - SEM query adicional ao Sheets
  const membro = membrosMap.get(vinculo.membro_id);

  items.push({
    ...vinculo,
    membro_nome: membro ? membro.nome : 'Membro não encontrado',
    membro_status: membro ? membro.status : null,
    categoria_membro: membro ? membro.categoria_membro : null
  });
});

// Se usuário tem 3 vínculos = 1 + 1 = 2 acessos ao Sheets (sempre!)
```

### Resultados da Otimização

**Performance:**
- **Antes:** 4 acessos ao Sheets (3 vínculos)
- **Depois:** 2 acessos ao Sheets (independente do número de vínculos)
- **Ganho:** 50% de redução (ou mais conforme N aumenta)

**Complexidade:**
- Query membros: O(1) - uma vez
- Criação do Map: O(M) onde M = total de membros
- Lookup por vínculo: O(1) por vínculo
- **Total:** O(M + N) vs O(N * M) anterior

---

## 🔍 ANÁLISE DO SISTEMA: Onde Aplicar?

### Locais com Potencial N+1 Query

#### **1. Atividades com Responsável**
**Arquivo:** `src/01-business/activities.gs` ou frontend

**Situação atual:**
```javascript
// Possível N+1 se feito no loop
atividades.forEach(ativ => {
  const responsavel = buscarUsuario(ativ.responsavel_id);
  ativ.responsavel_nome = responsavel.nome;
});
```

**Solução proposta:**
```javascript
// Buscar todos os usuários uma vez
const usuariosMap = criarMapUsuarios();

atividades.forEach(ativ => {
  const responsavel = usuariosMap.get(ativ.responsavel_id);
  ativ.responsavel_nome = responsavel?.nome || 'Desconhecido';
});
```

#### **2. Participações com Dados de Membros**
**Arquivo:** `src/01-business/participacoes.gs`

**Situação potencial:**
```javascript
// Se estiver buscando dados dos membros em loop
participacoes.forEach(part => {
  const membro = buscarMembro(part.membro_id);
  part.membro_nome = membro.nome;
});
```

**Solução proposta:**
```javascript
const membrosMap = criarMapMembros();
participacoes.forEach(part => {
  const membro = membrosMap.get(part.membro_id);
  part.membro_nome = membro?.nome || 'Desconhecido';
});
```

#### **3. Atividades com Múltiplas Categorias**
**Arquivo:** `src/01-business/activities.gs`

**Situação potencial:**
```javascript
// Se enriquecer categorias em loop
atividades.forEach(ativ => {
  ativ.categorias_detalhes = ativ.categorias_ids.map(catId => {
    return buscarCategoria(catId); // ❌ N*M queries
  });
});
```

**Solução proposta:**
```javascript
const categoriasMap = criarMapCategorias();
atividades.forEach(ativ => {
  ativ.categorias_detalhes = ativ.categorias_ids.map(catId =>
    categoriasMap.get(catId)
  );
});
```

#### **4. Alvos (Targets) de Atividades**
**Arquivo:** Possível em gestão de alvos

**Situação potencial:**
```javascript
alvos.forEach(alvo => {
  const membro = buscarMembro(alvo.membro_id);
  const atividade = buscarAtividade(alvo.atividade_id);
  // ❌ 2N queries
});
```

**Solução proposta:**
```javascript
const membrosMap = criarMapMembros();
const atividadesMap = criarMapAtividades();

alvos.forEach(alvo => {
  const membro = membrosMap.get(alvo.membro_id);
  const atividade = atividadesMap.get(alvo.atividade_id);
  // ✅ 0 queries (tudo em memória)
});
```

---

## 💻 PROPOSTA: Helper Genérico no DatabaseManager

### Opção 1: Função Helper Standalone

```javascript
/**
 * Cria Map de lookup a partir de uma tabela
 * @param {string} tableName - Nome da tabela
 * @param {Object} filters - Filtros para query
 * @param {string} keyField - Campo a usar como chave do Map
 * @param {boolean} useCache - Usar cache do DatabaseManager
 * @returns {Map} Map com registros indexados pela chave
 */
function createLookupMap(tableName, filters, keyField, useCache = true) {
  try {
    // Query todos os registros
    const result = DatabaseManager.query(tableName, filters, useCache);
    const items = Array.isArray(result) ? result : (result?.data || []);

    // Criar Map
    const lookupMap = new Map();
    items.forEach(item => {
      const keyValue = item[keyField];
      if (keyValue !== undefined && keyValue !== null) {
        lookupMap.set(keyValue, item);
      }
    });

    Logger.info('DatabaseHelper', `Map criado para ${tableName}`, {
      total: items.length,
      keyField: keyField
    });

    return lookupMap;

  } catch (error) {
    Logger.error('DatabaseHelper', 'Erro ao criar lookup map', {
      tableName,
      error: error.message
    });
    return new Map(); // Retornar Map vazio em caso de erro
  }
}

// ============================================================================
// USO:
// ============================================================================

function _getLinkedMembersCore(userId, somenteAtivos = true) {
  // ... buscar vínculos ...

  // Criar Map de membros
  const membrosMap = createLookupMap('membros', { status: 'Ativo' }, 'codigo_sequencial', true);

  // Enriquecer vínculos
  vinculos.forEach(vinculo => {
    const membro = membrosMap.get(vinculo.membro_id);
    items.push({
      ...vinculo,
      membro_nome: membro?.nome || 'Não encontrado',
      membro_status: membro?.status || null
    });
  });

  return { ok: true, items };
}
```

### Opção 2: Método Integrado no DatabaseManager

```javascript
// Adicionar ao DatabaseManager:

DatabaseManager.createLookupMap = function(tableName, filters, keyField, useCache) {
  // ... mesma implementação ...
};

// USO:
const membrosMap = DatabaseManager.createLookupMap(
  'membros',
  { status: 'Ativo' },
  'codigo_sequencial'
);
```

### Opção 3: Query com Enrichment Automático

```javascript
/**
 * Query com enriquecimento automático via lookup
 * @param {string} tableName - Tabela principal
 * @param {Object} filters - Filtros
 * @param {Object} enrichConfig - Configuração de enriquecimento
 * @returns {Object} Resultado com items enriquecidos
 */
DatabaseManager.queryWithEnrichment = function(tableName, filters, enrichConfig) {
  // 1. Buscar registros principais
  const mainResult = this.query(tableName, filters);
  const items = mainResult?.data || mainResult || [];

  if (!enrichConfig || items.length === 0) {
    return { ok: true, items };
  }

  // 2. Criar Maps de lookup para cada enriquecimento
  const lookupMaps = {};

  for (let config of enrichConfig) {
    const { from, filters: enrichFilters, key, field, as } = config;

    lookupMaps[as] = this.createLookupMap(from, enrichFilters || {}, key);
  }

  // 3. Enriquecer items
  const enrichedItems = items.map(item => {
    const enriched = { ...item };

    for (let config of enrichConfig) {
      const { field, as } = config;
      const foreignKey = item[field];
      const lookupMap = lookupMaps[as];

      enriched[as] = lookupMap.get(foreignKey) || null;
    }

    return enriched;
  });

  return { ok: true, items: enrichedItems };
};

// ============================================================================
// USO SIMPLIFICADO:
// ============================================================================

const result = DatabaseManager.queryWithEnrichment('usuario_membro',
  { user_id: userId, ativo: 'sim' },
  [
    {
      from: 'membros',          // Tabela de lookup
      filters: { status: 'Ativo' }, // Filtros na tabela de lookup
      key: 'codigo_sequencial', // Chave na tabela de lookup
      field: 'membro_id',       // Campo no registro principal
      as: 'membro_dados'        // Nome do campo enriquecido
    }
  ]
);

// Resultado:
// [
//   {
//     id: 'UM-0001',
//     user_id: 'U001',
//     membro_id: 5,
//     tipo_vinculo: 'proprio',
//     membro_dados: {           // ← Enriquecido automaticamente
//       codigo_sequencial: 5,
//       nome: 'João Silva',
//       status: 'Ativo',
//       categoria_membro: 'Adulto'
//     }
//   }
// ]
```

---

## 📝 PLANO DE IMPLEMENTAÇÃO

### **FASE 1: Análise Completa (2-3 horas)**

**Atividades:**
1. ✅ Grep em todos os arquivos .gs procurando:
   - `forEach` + `query`
   - `map` + `query`
   - Loops com chamadas DatabaseManager
2. ✅ Listar todos os casos encontrados
3. ✅ Classificar por impacto (alto/médio/baixo)
4. ✅ Priorizar implementações

**Entregável:** Documento com lista de casos N+1 encontrados

### **FASE 2: Criar Helper Genérico (1-2 horas)**

**Atividades:**
1. Decidir qual opção implementar:
   - Opção 1: Helper standalone (mais simples)
   - Opção 2: Método no DatabaseManager (mais integrado)
   - Opção 3: Query com enrichment (mais avançado)
2. Implementar função escolhida
3. Adicionar testes unitários
4. Documentar uso no código

**Entregável:** Função `createLookupMap()` ou similar pronta

### **FASE 3: Refatorar Código Existente (4-8 horas)**

**Atividades:**
1. Aplicar padrão Map em `vinculos.gs` (✅ JÁ FEITO)
2. Aplicar em `activities.gs` (se houver N+1)
3. Aplicar em `participacoes.gs` (se houver N+1)
4. Aplicar em outros locais identificados
5. Testar cada refatoração individualmente

**Entregável:** Código refatorado e testado

### **FASE 4: Documentação (1 hora)**

**Atividades:**
1. Atualizar `GUIA_DESENVOLVIMENTO.md` com padrão
2. Adicionar exemplos de uso
3. Documentar quando usar vs não usar
4. Adicionar à checklist de code review

**Entregável:** Documentação atualizada

### **FASE 5: Testes de Performance (1 hora)**

**Atividades:**
1. Medir tempo de execução antes/depois
2. Comparar número de acessos ao Sheets
3. Validar ganho de performance real
4. Documentar resultados

**Entregável:** Relatório de performance

---

## 📊 ESTIMATIVA DE ESFORÇO

| Fase | Atividade | Tempo Estimado |
|------|-----------|----------------|
| 1 | Análise completa do código | 2-3 horas |
| 2 | Criar helper genérico | 1-2 horas |
| 3 | Refatorar código existente | 4-8 horas |
| 4 | Documentação | 1 hora |
| 5 | Testes de performance | 1 hora |
| **TOTAL** | | **9-15 horas (~2 dias)** |

---

## 🎯 BENEFÍCIOS ESPERADOS

### **Performance:**
- ⚡ Redução de 50-80% no número de queries ao Google Sheets
- ⚡ Tempo de carregamento mais rápido
- ⚡ Melhor experiência do usuário

### **Escalabilidade:**
- 📈 Sistema preparado para crescimento de dados
- 📈 Menos impacto de quotas do Google Apps Script
- 📈 Performance consistente independente do volume

### **Manutenibilidade:**
- 📝 Padrão documentado e reutilizável
- 📝 Código mais limpo e legível
- 📝 Facilita code review e onboarding

### **Custo:**
- 💰 Redução de uso de quotas do Google Apps Script
- 💰 Menos risco de throttling
- 💰 Infraestrutura mais eficiente

---

## ⚠️ QUANDO NÃO USAR

### Casos onde Map NÃO é vantajoso:

1. **Poucos registros principais (N < 3)**
   ```javascript
   // Se só tem 1-2 vínculos, overhead do Map pode não compensar
   if (vinculos.length <= 2) {
     // Query direta é OK
   }
   ```

2. **Tabela de lookup muito grande**
   ```javascript
   // Se tabela tem 50.000+ registros, carregar tudo pode ser pior
   // Considerar paginação ou filtros específicos
   ```

3. **Dados raramente repetidos**
   ```javascript
   // Se cada FK é único (não há reuso), Map não ajuda
   // Exemplo: histórico de alterações (cada registro é único)
   ```

4. **Já existe cache efetivo**
   ```javascript
   // Se DatabaseManager já está retornando do cache
   // E não há loop, não precisa Map
   ```

---

## 📚 REFERÊNCIAS

### Implementações Existentes:
- ✅ **Vínculos Usuário↔Membro:** `src/01-business/vinculos.gs` (linhas 47-96)

### Documentação Relacionada:
- `VINCULO_USUARIO_MEMBRO.md` - Projeto completo de vínculos
- `GUIA_DESENVOLVIMENTO.md` - Padrões de desenvolvimento
- `database_manager.gs` - Implementação do DatabaseManager

### Literatura:
- [N+1 Query Problem (Wikipedia)](https://en.wikipedia.org/wiki/Select_(SQL)#N+1_query_problem)
- [JavaScript Map (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Map)
- [Google Apps Script Best Practices](https://developers.google.com/apps-script/guides/support/best-practices)

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Análise
- [ ] Grep todos os arquivos .gs por padrões N+1
- [ ] Listar casos encontrados com impacto
- [ ] Priorizar implementações

### Desenvolvimento
- [ ] Escolher qual opção de helper implementar
- [ ] Implementar função `createLookupMap()` ou similar
- [ ] Adicionar ao DatabaseManager ou criar helper standalone
- [ ] Adicionar tratamento de erros
- [ ] Adicionar logs informativos

### Refatoração
- [ ] Refatorar `activities.gs` (se aplicável)
- [ ] Refatorar `participacoes.gs` (se aplicável)
- [ ] Refatorar outros locais identificados
- [ ] Testar cada refatoração individualmente

### Documentação
- [ ] Atualizar `GUIA_DESENVOLVIMENTO.md`
- [ ] Adicionar exemplos de uso
- [ ] Documentar quando usar vs não usar
- [ ] Adicionar à checklist de code review

### Validação
- [ ] Medir performance antes/depois
- [ ] Validar número de queries reduzido
- [ ] Testar com diferentes volumes de dados
- [ ] Documentar resultados

---

## 🔮 EVOLUÇÃO FUTURA

### Possíveis Melhorias:

1. **Cache Inteligente de Maps**
   - Persistir Maps entre chamadas da API
   - Invalidação automática quando dados mudam
   - TTL configurável

2. **Suporte a Múltiplos Níveis**
   ```javascript
   // Enriquecer com dados de várias tabelas aninhadas
   const result = queryWithDeepEnrichment('atividades', filters, {
     responsavel: { from: 'usuarios', key: 'uid', field: 'responsavel_id' },
     categoria: { from: 'categorias', key: 'id', field: 'categoria_id' },
     alvos: {
       from: 'alvos',
       key: 'atividade_id',
       field: 'id',
       enrichWith: {
         membro: { from: 'membros', key: 'id', field: 'membro_id' }
       }
     }
   });
   ```

3. **Agregações e Joins Complexos**
   - Suporte a COUNT, SUM, AVG via Map
   - LEFT JOIN, RIGHT JOIN simulados
   - GROUP BY em memória

4. **Monitoramento de Performance**
   - Logging automático de queries N+1
   - Dashboard de performance
   - Alertas quando padrão não é seguido

---

**📅 Última atualização:** 19/10/2025
**📌 Status:** 📋 Documentação completa - Aguardando decisão de implementação
**👤 Documentado por:** Claude Code
**👤 Aprovação pendente:** Diogo Duarte
