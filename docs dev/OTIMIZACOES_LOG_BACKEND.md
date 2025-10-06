# 📋 PLANO DE LIMPEZA DE LOGS DO SISTEMA

**Data:** 06/10/2025
**Sistema:** Dojotai V2.0
**Objetivo:** Remover console.logs não essenciais do backend para melhorar performance

---

## 📊 SITUAÇÃO ATUAL

### **Análise de Logs no Sistema**

| Localização | Quantidade | Tipo |
|-------------|-----------|------|
| **Frontend** (`app_migrated.html`) | ~300 | console.log, console.error, console.warn |
| **Backend** (arquivos .gs) | ~354 | console.log, console.error, console.warn |
| **TOTAL** | **654 logs** | - |

### **Distribuição no Backend**

```
src/00-core/
├── database_manager.gs: ~80 logs
├── 00_config.gs: ~5 logs
├── logger.gs: ~10 logs
└── outros: ~50 logs

src/01-business/
├── participacoes.gs: ~60 logs
├── activities.gs: ~40 logs
├── membros.gs: ~30 logs
└── outros: ~40 logs

src/02-api/
├── activities_api.gs: ~25 logs
└── outros: ~14 logs
```

---

## 🎯 OBJETIVO DA LIMPEZA

### **Manter Apenas:**
- ✅ **Erros críticos** - usando `Logger.error()`
- ✅ **Avisos importantes** - usando `Logger.warn()` (apenas operações críticas)
- ✅ **Logs de auditoria** - contextos definidos em `APP_CONFIG.LOG_PERSISTENCE.IMPORTANT_CONTEXTS`

### **Remover:**
- ❌ `console.log()` de debug/desenvolvimento
- ❌ `console.warn()` de validações comuns
- ❌ Logs redundantes (ex: "iniciando função X", "finalizando função X")
- ❌ Logs de performance (já desabilitado via `APP_CONFIG.DEBUG.DISABLE_PERFORMANCE_SYSTEM`)

---

## 🔧 SISTEMA DE LOGGING EXISTENTE

### **Configuração Atual** (`00_config.gs`)

```javascript
const APP_CONFIG = {
  LOG_LEVEL: 'INFO',  // Controla níveis que aparecem

  LOG_PERSISTENCE: {
    ALWAYS_PERSIST: ['ERROR'],  // Erros sempre são salvos

    IMPORTANT_CONTEXTS: [
      'SessionManager',
      'SecurityManager',
      'Application',
      'AuthManager',
      'UserAction',
      'BusinessLogic'
    ],

    WARN_EXCLUDE_PATTERNS: [
      'FK validation failed',
      'validation completed',
      'Cache',
      'Query completed',
      'Insert completed'
    ],

    WARN_EXCLUDE_CONTEXTS: [
      'ValidationEngine',
      'PerformanceMetrics',
      'PerformanceMonitor'
    ]
  },

  DEBUG: {
    DISABLE_PERFORMANCE_SYSTEM: true  // Performance logs desabilitados
  }
}
```

### **Uso Correto do Logger**

```javascript
// ✅ CORRETO - Usar Logger com contexto
Logger.error('NomeDoModulo', 'Descrição do erro', { dados: 'relevantes' });
Logger.warn('NomeDoModulo', 'Aviso importante', { detalhes });
Logger.info('NomeDoModulo', 'Informação relevante');

// ❌ EVITAR - console direto (será removido)
console.log('Debug info...');
console.warn('Validação falhou...');
```

---

## 📝 CRITÉRIOS DE DECISÃO

### **MANTER o log se:**
1. É um erro crítico que impede funcionamento
2. É informação de auditoria (quem fez, quando, o quê)
3. É aviso de segurança ou validação de negócio importante
4. Está em contexto importante (`IMPORTANT_CONTEXTS`)

### **REMOVER o log se:**
1. É debug de desenvolvimento ("iniciando...", "valor de X é...")
2. É log de performance/métricas (já desabilitado)
3. É validação FK automática (excluído por padrão)
4. É log redundante de sucesso ("Query completed", "Insert completed")
5. É `console.log/warn/error` que pode ser substituído por `Logger`

---

## 🗂️ PLANO DE EXECUÇÃO

### **Fase 1: Backend Core** (`src/00-core/`)

**Arquivos:**
- `database_manager.gs` (~80 logs)
- `logger.gs` (~10 logs)
- `session_manager.gs`
- `security_manager.gs`

**Ações:**
1. Converter `console.error` → `Logger.error()`
2. Remover `console.log` de debug
3. Manter logs de contextos importantes (SessionManager, SecurityManager)

**Tempo estimado:** 2h

---

### **Fase 2: Business Logic** (`src/01-business/`)

**Arquivos:**
- `participacoes.gs` (~60 logs) - **INICIADO**
- `activities.gs` (~40 logs)
- `membros.gs` (~30 logs)
- Outros módulos

**Ações:**
1. Converter `console.error` → `Logger.error()`
2. Remover logs de sucesso redundantes
3. Manter logs de UserAction e BusinessLogic

**Status:**
- ✅ `participacoes.gs` - **PARCIALMENTE LIMPO**
  - 1 `console.error` convertido para `Logger.error`
  - Restantes ~59 logs aguardando limpeza

**Tempo estimado:** 3h

---

### **Fase 3: API Layer** (`src/02-api/`)

**Arquivos:**
- `activities_api.gs` (~25 logs)
- Outros endpoints

**Ações:**
1. Manter logs de requisições importantes
2. Remover logs de debug de rotas
3. Converter erros para Logger

**Tempo estimado:** 1h

---

### **Fase 4: Frontend** (OPCIONAL - avaliar necessidade)

**Arquivo:**
- `app_migrated.html` (~300 logs)

**Considerações:**
- Logs do frontend são úteis para debug no navegador
- Não impactam performance do servidor
- **Decisão:** Avaliar se vale a pena limpar após backend

**Tempo estimado:** 4h (se necessário)

---

## 📈 IMPACTO ESTIMADO

### **Performance**

**Overhead Atual (estimativa):**
- Backend: ~354 logs × 1-2ms cada = **500-700ms** por requisição complexa
- Logs de string concatenation e serialização de objetos
- I/O de logging em desenvolvimento

**Ganho Esperado após Limpeza:**
- Redução de ~70% dos logs (manter apenas ~100 logs essenciais)
- **Ganho estimado:** 350-500ms por requisição complexa
- **Percentual:** 30-40% de redução no overhead de logging

### **Manutenibilidade**

**Benefícios:**
- ✅ Código mais limpo e legível
- ✅ Logs focados em informações relevantes
- ✅ Mais fácil debug (menos ruído)
- ✅ Consistência no uso do Logger
- ✅ Logs estruturados com contexto

---

## 🚀 EXEMPLO DE TRANSFORMAÇÃO

### **ANTES (participacoes.gs)**

```javascript
function listParticipacoes(activityId) {
  console.log('🔵 Listando participações para atividade:', activityId);

  if (!activityId) {
    console.error('❌ ID da atividade é obrigatório');
    return { ok: false, error: 'ID da atividade é obrigatório.' };
  }

  const participacoes = DatabaseManager.query('participacoes', filters, false);
  console.log('✅ Query retornou', participacoes.length, 'registros');

  if (!participacoes) {
    console.log('ℹ️ Nenhuma participação encontrada');
    return { ok: true, items: [] };
  }

  console.log('📊 Ordenando lista alfabeticamente...');
  const sorted = participacoes.sort(...);
  console.log('✅ Ordenação concluída');

  return { ok: true, items: sorted };
}
```

### **DEPOIS (limpo)**

```javascript
function listParticipacoes(activityId) {
  try {
    if (!activityId) {
      return { ok: false, error: 'ID da atividade é obrigatório.' };
    }

    const participacoes = DatabaseManager.query('participacoes', filters, false);

    if (!participacoes) {
      return { ok: true, items: [] };
    }

    const sorted = participacoes
      .filter(p => p.deleted !== 'x')
      .map(p => ({ ...p, nome_membro: membrosMap[p.id_membro] }))
      .sort((a, b) => a.nome_membro.localeCompare(b.nome_membro, 'pt-BR'));

    return { ok: true, items: sorted };

  } catch (error) {
    Logger.error('Participacoes', 'Erro ao listar participações', {
      activityId,
      error: error.message
    });
    return { ok: false, error: 'Erro: ' + error.message };
  }
}
```

**Logs removidos:** 6
**Logs mantidos:** 1 (Logger.error no catch)
**Redução:** 83%

---

## ✅ CHECKLIST DE LIMPEZA

### **Por Arquivo:**
- [ ] Identificar todos os `console.log/warn/error`
- [ ] Classificar: manter ou remover
- [ ] Converter erros críticos para `Logger.error()`
- [ ] Converter avisos importantes para `Logger.warn()`
- [ ] Remover logs de debug/desenvolvimento
- [ ] Testar funcionalidade após limpeza
- [ ] Commit com mensagem descritiva

### **Validação Geral:**
- [ ] Sistema funciona sem erros
- [ ] Logs essenciais ainda aparecem
- [ ] Performance melhorou
- [ ] Código mais limpo

---

## 📌 OBSERVAÇÕES IMPORTANTES

1. **Não remover logs de segurança:**
   - Tentativas de acesso não autorizado
   - Falhas de autenticação
   - Validações de sessão

2. **Manter logs de auditoria:**
   - Criação/edição/exclusão de dados
   - Ações de usuários importantes
   - Mudanças de estado críticas

3. **Usar Logger com contexto apropriado:**
   - Primeiro parâmetro: nome do módulo
   - Segundo parâmetro: descrição clara
   - Terceiro parâmetro: objeto com dados relevantes

4. **Testar após cada arquivo:**
   - Não fazer limpeza em massa sem testar
   - Validar que funcionalidade continua OK
   - Verificar que erros críticos ainda são logados

---

## 🎯 PRIORIDADE DE EXECUÇÃO

1. **ALTA** - Backend Business Logic (`src/01-business/`)
   - Módulos mais usados (participacoes, activities, membros)
   - Maior impacto em performance

2. **MÉDIA** - Backend Core (`src/00-core/`)
   - DatabaseManager e Logger precisam estar limpos
   - Base para outros módulos

3. **BAIXA** - API Layer (`src/02-api/`)
   - Menos logs que business logic
   - Já usa padrões mais limpos

4. **OPCIONAL** - Frontend (`app_migrated.html`)
   - Avaliar necessidade após backend
   - Logs úteis para debug no navegador

---

## 📅 CRONOGRAMA SUGERIDO

| Fase | Tempo | Quando Executar |
|------|-------|-----------------|
| **Fase 1** - Backend Core | 2h | Após finalizar participações |
| **Fase 2** - Business Logic | 3h | Sessão dedicada |
| **Fase 3** - API Layer | 1h | Após business logic |
| **Fase 4** - Frontend (opcional) | 4h | Se necessário |

**Total estimado:** 6-10h (dependendo se incluir frontend)

---

## 🔗 REFERÊNCIAS

- `src/00-core/00_config.gs` - Configuração do Logger
- `src/00-core/logger.gs` - Implementação do sistema de logs
- `APP_CONFIG.LOG_PERSISTENCE` - Regras de persistência
- `APP_CONFIG.DEBUG` - Configurações de debug

---

**Documento criado em:** 06/10/2025
**Última atualização:** 06/10/2025
**Responsável:** Claude Code
**Status:** ⏳ Aguardando execução
