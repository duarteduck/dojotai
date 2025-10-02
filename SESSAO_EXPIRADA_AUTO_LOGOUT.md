# 🔐 Sistema de Auto-Logout em Sessão Expirada

**Data:** 02/10/2025
**Status:** Planejado (não implementado)
**Prioridade:** Alta (melhoria de UX e segurança)

---

## 🎯 PROBLEMA ATUAL

### Comportamento Atual (Ruim):
1. ✅ Usuário faz login → sessão criada
2. ⏰ Sessão expira (após X horas de TTL)
3. ❌ Usuário **continua vendo a interface** como se estivesse logado
4. ❌ Ao tentar realizar ação (ex: clicar "Concluir") → erro "Sessão inválida ou expirada"
5. 😕 Usuário fica confuso

### Por que é um problema:
- ❌ **UX ruim** - Usuário não entende por que a ação falhou
- ❌ **Segurança** - Usuário pode sair sem saber que sessão expirou
- ❌ **Frustração** - Preenche formulário e perde dados ao enviar

---

## ✅ COMPORTAMENTO ESPERADO

### Comportamento Ideal:
1. ✅ Usuário faz login → sessão criada
2. ⏰ Sessão expira (após X horas de TTL)
3. ✅ Sistema **detecta sessão expirada** automaticamente
4. ✅ **Redireciona para tela de login** OU mostra modal de re-autenticação
5. ✅ Mensagem clara: "Sua sessão expirou. Por favor, faça login novamente."

### Benefícios:
- ✅ **UX melhor** - Feedback claro para o usuário
- ✅ **Segurança** - Garante que interface protegida não fica acessível
- ✅ **Prevenção de perda de dados** - Avisa antes de ação falhar

---

## 🔧 SOLUÇÃO PROPOSTA

### Estratégia: Combinação de 3 Abordagens

#### **1. Verificação Periódica no Frontend** (Proativa)
- Verifica sessão **a cada 5 minutos** automaticamente
- Detecta expiração **antes** do usuário tentar uma ação
- Melhor UX: usuário é avisado imediatamente quando sessão expira

#### **2. Interceptor de Erros** (Reativa)
- Detecta erro "Sessão expirada" em **qualquer chamada**
- Captura e trata de forma específica
- Backup caso verificação periódica falhe

#### **3. Flag Especial no Backend**
- Backend retorna `sessionExpired: true` quando sessão expirou
- Frontend identifica e trata de forma diferente de outros erros
- Permite UX específica para sessão expirada vs outros erros

---

## 📝 IMPLEMENTAÇÃO

### **PARTE 1: Frontend - Verificação Periódica**

**Arquivo:** `app_migrated.html`

```javascript
// ============================================================================
// SISTEMA DE MONITORAMENTO DE SESSÃO
// ============================================================================

let sessionCheckInterval;
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutos

/**
 * Inicia monitoramento automático de sessão
 * Chama checkSession() a cada 5 minutos
 */
function startSessionMonitoring() {
  console.log('🔐 Iniciando monitoramento de sessão (verifica a cada 5 min)');

  // Verificar imediatamente
  checkSession();

  // Verificar a cada 5 minutos
  sessionCheckInterval = setInterval(checkSession, SESSION_CHECK_INTERVAL);
}

/**
 * Para monitoramento de sessão
 */
function stopSessionMonitoring() {
  if (sessionCheckInterval) {
    console.log('🛑 Parando monitoramento de sessão');
    clearInterval(sessionCheckInterval);
    sessionCheckInterval = null;
  }
}

/**
 * Verifica se sessão ainda é válida
 */
async function checkSession() {
  try {
    const sessionId = localStorage.getItem('sessionId');

    if (!sessionId) {
      console.warn('⚠️ Nenhuma sessão encontrada no localStorage');
      handleSessionExpired();
      return;
    }

    console.log('🔍 Verificando validade da sessão:', sessionId.substring(0, 10) + '...');

    // Validar sessão no backend
    google.script.run
      .withSuccessHandler((result) => {
        if (!result || !result.ok) {
          console.warn('⚠️ Sessão inválida:', result);
          handleSessionExpired();
        } else if (result.sessionExpired) {
          console.warn('⏱️ Sessão expirada detectada pelo backend');
          handleSessionExpired();
        } else {
          console.log('✅ Sessão válida');
        }
      })
      .withFailureHandler((error) => {
        console.error('❌ Erro ao verificar sessão:', error);
        // Não força logout em caso de erro de rede/servidor
        // Apenas loga o erro
      })
      .validateSession(sessionId);

  } catch (error) {
    console.error('❌ Erro ao verificar sessão:', error);
  }
}

/**
 * Handler quando sessão expira
 * Limpa dados locais e mostra modal de re-autenticação
 */
function handleSessionExpired() {
  console.log('🔴 Tratando sessão expirada');

  // Parar monitoramento
  stopSessionMonitoring();

  // Limpar dados locais
  localStorage.removeItem('sessionId');

  try {
    PropertiesService.getScriptProperties().deleteProperty('currentSessionId');
  } catch (e) {
    // Ignorar erro se PropertiesService não disponível no frontend
  }

  // Mostrar modal amigável
  showSessionExpiredModal();
}

/**
 * Modal de sessão expirada
 */
function showSessionExpiredModal() {
  // Opção 1: Modal personalizado
  const modal = `
    <div style="
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    ">
      <div style="
        background: white;
        padding: 2rem;
        border-radius: 8px;
        max-width: 400px;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      ">
        <h2 style="margin-top: 0; color: #e74c3c;">⏱️ Sessão Expirada</h2>
        <p style="margin: 1.5rem 0; color: #555;">
          Sua sessão expirou por inatividade.<br>
          Por favor, faça login novamente para continuar.
        </p>
        <button
          onclick="window.location.reload()"
          style="
            background: #3498db;
            color: white;
            border: none;
            padding: 0.75rem 2rem;
            border-radius: 4px;
            font-size: 1rem;
            cursor: pointer;
          "
        >
          Fazer Login Novamente
        </button>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modal);

  // Opção 2: Alert simples (fallback)
  // alert('⏱️ Sua sessão expirou. Por favor, faça login novamente.');
  // window.location.reload();
}

/**
 * Iniciar monitoramento após login bem-sucedido
 * MODIFICAR função de login existente para chamar startSessionMonitoring()
 */
function onLoginSuccess(session) {
  // Salvar sessão
  localStorage.setItem('sessionId', session.sessionId);

  // NOVO: Iniciar monitoramento
  startSessionMonitoring();

  // ... resto do código de login existente
  console.log('✅ Login bem-sucedido, monitoramento de sessão ativo');
}

/**
 * Parar monitoramento ao fazer logout
 * MODIFICAR função de logout existente para chamar stopSessionMonitoring()
 */
function onLogout() {
  // NOVO: Parar monitoramento
  stopSessionMonitoring();

  // Limpar sessão
  localStorage.removeItem('sessionId');

  // ... resto do código de logout existente
  console.log('✅ Logout realizado, monitoramento de sessão parado');
}
```

---

### **PARTE 2: Frontend - Interceptor de Erros**

**Arquivo:** `app_migrated.html`

```javascript
// ============================================================================
// INTERCEPTOR DE CHAMADAS API
// Valida sessão antes de cada chamada e trata erros de sessão
// ============================================================================

/**
 * Wrapper para todas as chamadas google.script.run
 * Adiciona tratamento automático de sessão expirada
 *
 * @param {string} method - Nome do método backend a chamar
 * @param {Array} args - Argumentos para o método
 * @returns {Promise} Resultado da chamada
 *
 * @example
 * // Ao invés de:
 * google.script.run.completeActivity(activityId);
 *
 * // Usar:
 * apiCall('completeActivity', activityId);
 */
async function apiCall(method, ...args) {
  return new Promise((resolve, reject) => {
    google.script.run
      .withSuccessHandler((result) => {
        // Verificar se backend retornou flag de sessão expirada
        if (result && result.sessionExpired) {
          console.warn('⏱️ Sessão expirada detectada na resposta');
          handleSessionExpired();
          reject(new Error('Sessão expirada'));
          return;
        }

        // Verificar erro genérico de sessão
        if (result && !result.ok && result.error) {
          const errorMsg = result.error.toLowerCase();
          if (errorMsg.includes('sessão') &&
              (errorMsg.includes('expirada') || errorMsg.includes('inválida'))) {
            console.warn('⏱️ Erro de sessão detectado:', result.error);
            handleSessionExpired();
            reject(new Error(result.error));
            return;
          }
        }

        // Resposta normal
        resolve(result);
      })
      .withFailureHandler((error) => {
        // Verificar se erro é relacionado a sessão
        const errorMsg = error.message ? error.message.toLowerCase() : '';
        if (errorMsg.includes('sessão') || errorMsg.includes('session')) {
          console.warn('⏱️ Erro de sessão detectado no failure handler');
          handleSessionExpired();
        }

        reject(error);
      })
      [method](...args);
  });
}

/**
 * EXEMPLO DE USO:
 * Refatorar chamadas existentes para usar apiCall()
 */

// ANTES:
/*
async function completeActivity(activityId) {
  google.script.run
    .withSuccessHandler((response) => {
      if (response && response.ok) {
        loadActivities();
      } else {
        alert('Erro: ' + response.error);
      }
    })
    .completeActivity(activityId);
}
*/

// DEPOIS:
async function completeActivity(activityId) {
  try {
    const response = await apiCall('completeActivity', activityId);

    if (response && response.ok) {
      console.log('✅ Atividade concluída com sucesso');
      loadActivities();
    } else {
      alert('Erro ao concluir atividade: ' + (response.error || 'Erro desconhecido'));
    }

  } catch (error) {
    // Erros de sessão já tratados pelo interceptor
    // Aqui só trata outros erros
    if (!error.message.includes('Sessão')) {
      console.error('❌ Erro ao concluir atividade:', error);
      alert('Erro ao concluir atividade: ' + error.message);
    }
  }
}
```

---

### **PARTE 3: Backend - Flag de Sessão Expirada**

**Arquivo:** `src/02-api/usuarios_api.gs` (e outras funções que validam sessão)

```javascript
/**
 * MODIFICAR: completeActivity() e outras funções que validam sessão
 * Adicionar flag sessionExpired: true quando sessão expirar
 */

async function completeActivity(activityId) {
  try {
    console.log('✅ Marcando atividade como concluída:', activityId);

    if (!activityId) {
      throw new Error('ID da atividade é obrigatório');
    }

    // Obter usuário logado real via sessão
    const sessionId = PropertiesService.getScriptProperties().getProperty('currentSessionId');
    console.log('🔍 SessionId recuperado:', sessionId);

    if (!sessionId) {
      return {
        ok: false,
        error: 'Usuário não autenticado - sem sessão ativa',
        sessionExpired: true  // ← NOVO: Flag especial
      };
    }

    const sessionData = validateSession(sessionId);
    console.log('🔍 Validação da sessão:', sessionData);

    if (!sessionData || !sessionData.ok || !sessionData.session) {
      return {
        ok: false,
        error: 'Sessão inválida ou expirada',
        sessionExpired: true  // ← NOVO: Flag especial
      };
    }

    // ... resto da função

  } catch (error) {
    console.error('❌ Erro ao concluir atividade:', error);
    return {
      ok: false,
      error: error.message
    };
  }
}
```

**Arquivo:** `src/00-core/session_manager.gs`

```javascript
/**
 * MODIFICAR: validateSession()
 * Retornar flag sessionExpired quando sessão expirar
 */

function validateSession(sessionId) {
  try {
    if (!sessionId) {
      return {
        ok: false,
        error: 'Session ID não fornecido',
        sessionExpired: true  // ← NOVO: Flag especial
      };
    }

    // Buscar sessão usando DatabaseManager
    const queryResult = DatabaseManager.query('sessoes', { session_id: sessionId }, false);
    const sessions = Array.isArray(queryResult) ? queryResult : (queryResult?.data || []);
    const session = sessions[0];

    if (!session) {
      return {
        ok: false,
        error: 'Sessão não encontrada',
        sessionExpired: true  // ← NOVO: Flag especial
      };
    }

    // Verificar se sessão está ativa
    const isActive = session.ativo === 'sim' || session.ativo === '1' || session.ativo === true;
    if (!isActive) {
      return {
        ok: false,
        error: 'Sessão inativa',
        sessionExpired: true  // ← NOVO: Flag especial
      };
    }

    // Verificar expiração
    const now = new Date();
    const expiresAt = new Date(session.expira_em);

    if (now > expiresAt) {
      console.warn('⏱️ Sessão expirada:', sessionId);

      // Marcar sessão como inativa (soft delete)
      DatabaseManager.update('sessoes', session.id, { ativo: 'não' });

      return {
        ok: false,
        error: 'Sessão expirada',
        sessionExpired: true  // ← NOVO: Flag especial
      };
    }

    // Sessão válida
    return {
      ok: true,
      session: {
        session_id: session.session_id,
        user_id: session.id_usuario,
        expires_at: session.expira_em
      }
    };

  } catch (error) {
    Logger.error('SessionManager', 'Erro ao validar sessão', { sessionId, error: error.message });
    return {
      ok: false,
      error: 'Erro ao validar sessão: ' + error.message
    };
  }
}
```

---

## 🎯 PLANO DE IMPLEMENTAÇÃO

### **Fase 1: Backend (Preparação)**
- [ ] Modificar `validateSession()` para retornar `sessionExpired: true`
- [ ] Modificar `completeActivity()` para retornar flag quando sessão expirar
- [ ] Modificar outras funções da API que validam sessão
- [ ] Testar retorno de flag no backend

### **Fase 2: Frontend - Verificação Periódica**
- [ ] Adicionar função `startSessionMonitoring()`
- [ ] Adicionar função `checkSession()`
- [ ] Adicionar função `handleSessionExpired()`
- [ ] Adicionar função `showSessionExpiredModal()`
- [ ] Modificar `onLoginSuccess()` para chamar `startSessionMonitoring()`
- [ ] Modificar `onLogout()` para chamar `stopSessionMonitoring()`
- [ ] Testar verificação periódica

### **Fase 3: Frontend - Interceptor (Opcional)**
- [ ] Criar função `apiCall()`
- [ ] Refatorar chamadas existentes para usar `apiCall()`
- [ ] Testar interceptor

### **Fase 4: Testes**
- [ ] Testar expiração de sessão (reduzir TTL para 1 minuto)
- [ ] Testar modal de sessão expirada
- [ ] Testar re-login após sessão expirar
- [ ] Testar que sessão ativa não é deslogada incorretamente

---

## 🧪 COMO TESTAR

### **Teste 1: Expiração Automática**
1. Modificar TTL da sessão para 1 minuto (temporariamente)
2. Fazer login
3. Aguardar 1 minuto sem interagir
4. Verificar se modal de "Sessão Expirada" aparece automaticamente
5. Clicar em "Fazer Login Novamente" e verificar se redireciona

### **Teste 2: Expiração Durante Ação**
1. Fazer login
2. Expirar sessão manualmente no backend
3. Tentar concluir uma atividade
4. Verificar se modal de "Sessão Expirada" aparece
5. Verificar que ação não é executada

### **Teste 3: Sessão Válida Não Expira**
1. Fazer login
2. Interagir com o sistema (concluir atividades, etc.)
3. Aguardar 10 minutos (mas TTL maior que isso)
4. Verificar que sessão **NÃO** expira
5. Verificar que ações continuam funcionando

---

## 📊 IMPACTO

### **UX:**
- ✅ Usuário sabe imediatamente quando sessão expira
- ✅ Mensagem clara e amigável
- ✅ Redirecionamento automático para login
- ✅ Previne frustração de preencher formulários e perder dados

### **Segurança:**
- ✅ Interface protegida não fica acessível após expiração
- ✅ Dados sensíveis não ficam visíveis
- ✅ Conformidade com boas práticas de segurança

### **Manutenibilidade:**
- ✅ Código centralizado e reutilizável
- ✅ Fácil de testar
- ✅ Fácil de ajustar TTL e comportamento

---

## 🔄 ALTERNATIVAS CONSIDERADAS

### **Alternativa 1: Renovação Automática de Sessão**
- **Prós:** Usuário nunca precisa fazer re-login
- **Contras:** Menos seguro (sessão fica ativa indefinidamente)
- **Decisão:** Não recomendado para aplicação com dados sensíveis

### **Alternativa 2: Avisar Antes de Expirar**
- **Prós:** Dá chance do usuário renovar antes de expirar
- **Contras:** Mais complexo de implementar
- **Decisão:** Pode ser implementado como melhoria futura (Fase 2)

### **Alternativa 3: Apenas Mostrar Erro**
- **Prós:** Mais simples
- **Contras:** UX ruim (comportamento atual)
- **Decisão:** Rejeitado

---

## 📝 NOTAS ADICIONAIS

### **Configuração de TTL**
- Atualmente: Verificar em `src/00-core/00_config.gs` → `APP_CONFIG.SESSION.TTL_HOURS`
- Recomendado: 2-4 horas para aplicação interna
- Ajustar conforme necessidade de segurança vs conveniência

### **Compatibilidade**
- ✅ Funciona com Google Apps Script
- ✅ Funciona com localStorage
- ✅ Funciona sem dependências externas

### **Performance**
- ✅ Verificação a cada 5 min tem impacto mínimo
- ✅ Apenas 1 chamada de validação leve
- ✅ Não afeta performance de outras operações

---

**Última Atualização:** 02/10/2025
**Status:** Planejado - Aguardando implementação após Migração #2
**Prioridade:** Alta
