/**
 * Funções de teste para o Sistema de Sessões
 * Execute estas funções no editor do Google Apps Script
 */

/**
 * TESTE 1: Testar criação de sessão
 * Execute esta função primeiro
 */
async function testCreateSession() {
  try {
    console.log('🧪 TESTE 1: Criando sessão...');

    // Dados de teste do dispositivo
    const deviceInfo = {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      platform: 'web'
    };

    // Criar sessão para um usuário existente (use um UID real da sua planilha)
    const result = await SessionManager.createSession('U1726692234567', deviceInfo);

    console.log('✅ Resultado criação sessão:', result);

    if (result.ok) {
      console.log(`📝 Session ID criado: ${result.session.id}`);
      console.log(`⏰ Expira em: ${result.session.expires_at}`);

      // Salvar session ID para próximos testes
      PropertiesService.getScriptProperties().setProperty('TEST_SESSION_ID', result.session.id);

      return result.session.id;
    } else {
      console.error('❌ Erro ao criar sessão:', result.error);
      return null;
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
    return null;
  }
}

/**
 * TESTE 2: Testar validação de sessão
 * Execute depois do teste 1
 */
async function testValidateSession() {
  try {
    console.log('🧪 TESTE 2: Validando sessão...');

    // Pegar session ID do teste anterior
    const sessionId = PropertiesService.getScriptProperties().getProperty('TEST_SESSION_ID');

    if (!sessionId) {
      console.error('❌ Session ID não encontrado. Execute testCreateSession() primeiro.');
      return;
    }

    console.log(`🔍 Validando sessão: ${sessionId}`);

    const result = await SessionManager.validateSession(sessionId);

    console.log('✅ Resultado validação:', result);

    if (result.ok) {
      console.log(`👤 Usuário: ${result.user.nome} (${result.user.login})`);
      console.log(`⏰ Última atividade: ${result.session.last_activity}`);
    } else {
      console.error('❌ Sessão inválida:', result.error);
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

/**
 * TESTE 3: Testar destruição de sessão
 * Execute depois do teste 2
 */
async function testDestroySession() {
  try {
    console.log('🧪 TESTE 3: Destruindo sessão...');

    // Pegar session ID do teste anterior
    const sessionId = PropertiesService.getScriptProperties().getProperty('TEST_SESSION_ID');

    if (!sessionId) {
      console.error('❌ Session ID não encontrado. Execute testCreateSession() primeiro.');
      return;
    }

    console.log(`🗑️ Destruindo sessão: ${sessionId}`);

    const result = await SessionManager.destroySession(sessionId);

    console.log('✅ Resultado destruição:', result);

    if (result.ok) {
      console.log('💀 Sessão encerrada com sucesso');

      // Limpar session ID
      PropertiesService.getScriptProperties().deleteProperty('TEST_SESSION_ID');
    } else {
      console.error('❌ Erro ao destruir sessão:', result.error);
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

/**
 * TESTE 4: Testar login com sessão integrada
 * Execute para testar o sistema completo
 */
async function testLoginWithSession() {
  try {
    console.log('🧪 TESTE 4: Login com criação de sessão...');

    // Dados de teste (use credenciais reais da sua planilha)
    const login = 'diogo.duarte';  // Ajuste conforme necessário
    const pin = '1234';            // Ajuste conforme necessário

    const deviceInfo = {
      ip: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Test) AppleWebKit/537.36',
      platform: 'test'
    };

    console.log(`🔑 Fazendo login: ${login}`);

    const result = await loginUser(login, pin, deviceInfo);

    console.log('✅ Resultado login:', result);

    if (result.ok && result.session) {
      console.log(`👤 Usuário logado: ${result.user.nome}`);
      console.log(`🎫 Session ID: ${result.session.id}`);
      console.log(`⏰ Sessão expira: ${result.session.expires_at}`);

      // Salvar para teste de logout
      PropertiesService.getScriptProperties().setProperty('TEST_LOGIN_SESSION_ID', result.session.id);

    } else if (result.ok && !result.session) {
      console.log('⚠️ Login funcionou mas sem sessão robusta');
    } else {
      console.error('❌ Erro no login:', result.error);
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

/**
 * TESTE 5: Testar logout com destruição de sessão
 * Execute depois do teste 4
 */
async function testLogoutWithSession() {
  try {
    console.log('🧪 TESTE 5: Logout com destruição de sessão...');

    // Pegar session ID do login
    const sessionId = PropertiesService.getScriptProperties().getProperty('TEST_LOGIN_SESSION_ID');

    if (!sessionId) {
      console.error('❌ Session ID não encontrado. Execute testLoginWithSession() primeiro.');
      return;
    }

    console.log(`🚪 Fazendo logout da sessão: ${sessionId}`);

    const result = await logoutUser(sessionId);

    console.log('✅ Resultado logout:', result);

    if (result.ok) {
      console.log('👋 Logout realizado com sucesso');

      // Limpar session ID
      PropertiesService.getScriptProperties().deleteProperty('TEST_LOGIN_SESSION_ID');
    } else {
      console.error('❌ Erro no logout:', result.error);
    }

  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

/**
 * TESTE 6: Testar estatísticas de sessões
 */
function testSessionStats() {
  try {
    console.log('🧪 TESTE 6: Estatísticas de sessões...');

    const stats = SessionManager.getSessionStats();

    console.log('📊 Estatísticas das sessões:', stats);
    console.log(`📈 Total de sessões: ${stats.total_sessions}`);
    console.log(`🟢 Sessões ativas: ${stats.active_sessions}`);
    console.log(`🔴 Sessões expiradas: ${stats.expired_sessions}`);
    console.log(`⚫ Sessões inativas: ${stats.inactive_sessions}`);
    console.log(`👥 Usuários únicos ativos: ${stats.unique_users_active}`);

  } catch (error) {
    console.error('💥 Erro no teste:', error.message);
  }
}

/**
 * TESTE 7: Verificar se tabela de sessões existe
 */
function testSessionsTable() {
  try {
    console.log('🧪 TESTE 7: Verificando tabela de sessões...');

    // Tentar ler a tabela de sessões
    const result = readTableByNome_('sessoes');

    if (result && result.values) {
      console.log('✅ Tabela de sessões encontrada!');
      console.log(`📋 Colunas: ${result.values[0].join(', ')}`);
      console.log(`📊 Total de linhas: ${result.values.length - 1}`);
    } else {
      console.error('❌ Tabela de sessões não encontrada ou vazia');
    }

  } catch (error) {
    console.error('💥 Erro ao verificar tabela:', error.message);
  }
}

/**
 * EXECUTAR TODOS OS TESTES
 * Execute esta função para rodar todos os testes em sequência
 */
async function runAllSessionTests() {
  console.log('🚀 INICIANDO BATERIA DE TESTES DO SISTEMA DE SESSÕES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Teste 7: Verificar tabela primeiro
  testSessionsTable();

  // Teste 6: Estatísticas iniciais
  testSessionStats();

  // Teste 1: Criar sessão
  const sessionId = await testCreateSession();

  if (sessionId) {
    // Teste 2: Validar sessão
    await testValidateSession();

    // Teste 3: Destruir sessão
    await testDestroySession();
  }

  // Teste 4: Login com sessão
  await testLoginWithSession();

  // Teste 5: Logout com sessão
  await testLogoutWithSession();

  // Teste 6: Estatísticas finais
  testSessionStats();

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏁 TESTES CONCLUÍDOS!');
}

/**
 * TESTE DIRETO DO DatabaseManager para sessões
 */
async function testDatabaseManagerDirect() {
  try {
    console.log('🔧 TESTE DIRETO: DatabaseManager.insert para sessões');

    // Dados básicos da sessão
    const sessionData = {
      session_id: 'SES-TEST-001',
      user_id: 'U1726692234567',
      created_at: '2025-09-20 09:00:00',
      expires_at: '2025-09-20 17:00:00',
      ip_address: '192.168.1.100',
      device_info: '{"test": true}',
      active: 'sim',
      last_activity: '2025-09-20 09:00:00'
    };

    console.log('📝 Dados a inserir:', sessionData);

    // Testar insert direto
    const result = await DatabaseManager.insert('sessoes', sessionData);

    console.log('✅ Resultado insert:', result);

    if (result.ok || result.success) {
      console.log('🎉 Insert funcionou! Verificando se gravou...');

      // Verificar se realmente gravou
      const sessions = DatabaseManager.query('sessoes', {}, false);
      console.log('📊 Sessões na tabela:', sessions.length);

      if (sessions.length > 0) {
        console.log('✅ GRAVOU COM SUCESSO!');
        console.log('📋 Primeira sessão:', sessions[0]);
      } else {
        console.log('❌ NÃO GRAVOU - tabela ainda vazia');
      }
    } else {
      console.error('❌ Insert falhou:', result.error);
    }

  } catch (error) {
    console.error('💥 Erro no teste direto:', error.message);
  }
}

/**
 * TESTE SIMPLES: Só gravar uma linha manualmente
 */
function testManualInsert() {
  try {
    console.log('✍️ TESTE MANUAL: Inserir linha diretamente na planilha');

    // Buscar a configuração da tabela de sessões
    const tableConfig = readTableByNome_('sessoes');
    if (!tableConfig || !tableConfig.ctx) {
      console.error('❌ Não foi possível acessar a tabela de sessões');
      return;
    }

    const sheet = tableConfig.ctx.sheet;
    console.log('📋 Sheet encontrada:', sheet.getName());

    // Dados de teste
    const testRow = [
      'SES-MANUAL-001',              // session_id
      'U1726692234567',              // user_id
      '2025-09-20 09:05:00',         // created_at
      '2025-09-20 17:05:00',         // expires_at
      '192.168.1.100',               // ip_address
      '{"manual": true}',            // device_info
      'sim',                         // active
      '2025-09-20 09:05:00',         // last_activity
      ''                             // destroyed_at
    ];

    console.log('📝 Inserindo linha:', testRow);

    // Inserir na próxima linha vazia
    const lastRow = sheet.getLastRow();
    const newRow = lastRow + 1;

    sheet.getRange(newRow, 1, 1, testRow.length).setValues([testRow]);

    console.log(`✅ Linha inserida na linha ${newRow}`);

    // Verificar se gravou
    const newData = sheet.getRange(newRow, 1, 1, testRow.length).getValues()[0];
    console.log('📋 Dados gravados:', newData);

  } catch (error) {
    console.error('💥 Erro no teste manual:', error.message);
  }
}

/**
 * TESTE: Verificar se insert realmente grava
 */
async function testInsertVerification() {
  try {
    console.log('🔍 TESTE: Verificando se insert realmente grava na planilha');

    // Contar sessões antes
    const beforeCount = DatabaseManager.query('sessoes', {}, false).length;
    console.log(`📊 Sessões antes: ${beforeCount}`);

    // Dados de teste
    const testData = {
      session_id: 'SES-VERIFY-001',
      user_id: 'U1726692234567',
      created_at: '2025-09-20 12:30:00',
      expires_at: '2025-09-20 20:30:00',
      ip_address: '192.168.1.200',
      device_info: '{"test": "verification"}',
      active: 'sim',
      last_activity: '2025-09-20 12:30:00'
    };

    console.log('📝 Inserindo dados de teste...');

    // Inserir via DatabaseManager
    const insertResult = await DatabaseManager.insert('sessoes', testData);
    console.log('✅ Resultado insert:', insertResult);

    // Aguardar um pouco (caso haja delay)
    Utilities.sleep(1000);

    // Contar sessões depois
    const afterCount = DatabaseManager.query('sessoes', {}, false).length;
    console.log(`📊 Sessões depois: ${afterCount}`);

    // Verificar se realmente gravou
    if (afterCount > beforeCount) {
      console.log('✅ INSERT FUNCIONOU! Sessão foi gravada.');
    } else {
      console.log('❌ INSERT NÃO GRAVOU! Problema identificado.');
    }

    // Buscar a sessão específica
    const foundSession = DatabaseManager.query('sessoes', { session_id: 'SES-VERIFY-001' }, false);
    if (foundSession.length > 0) {
      console.log('🎉 Sessão encontrada na tabela:', foundSession[0]);
    } else {
      console.log('❌ Sessão NÃO foi encontrada na tabela');
    }

  } catch (error) {
    console.error('💥 Erro no teste de verificação:', error.message);
  }
}

/**
 * TESTE DEBUG: Verificar configurações disponíveis
 */
function testDebugConfig() {
  try {
    console.log('🔍 DEBUG: Verificando configurações disponíveis');

    // Verificar APP_CONFIG
    console.log('📋 APP_CONFIG existe:', typeof APP_CONFIG !== 'undefined');

    if (typeof APP_CONFIG !== 'undefined') {
      console.log('🔧 ID_PATTERNS disponíveis:', Object.keys(APP_CONFIG.ID_PATTERNS));
      console.log('📝 Pattern para sessoes:', APP_CONFIG.ID_PATTERNS.sessoes);
    }

    // Testar generateUniqueId direto
    console.log('🧪 Testando generateUniqueId("SES")...');
    const testId = generateUniqueId('SES');
    console.log('✅ ID gerado:', testId);

  } catch (error) {
    console.error('💥 Erro no debug:', error.message);
  }
}

/**
 * TESTE SIMPLIFICADO: Só criar e validar sessão
 * Execute esta função se quiser um teste rápido
 */
async function quickSessionTest() {
  console.log('⚡ TESTE RÁPIDO DO SISTEMA DE SESSÕES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Verificar tabela
  testSessionsTable();

  // Teste direto do DatabaseManager
  await testDatabaseManagerDirect();

  // Teste manual
  testManualInsert();

  // Criar sessão
  const sessionId = await testCreateSession();

  if (sessionId) {
    // Validar sessão
    await testValidateSession();

    console.log('✅ TESTE RÁPIDO CONCLUÍDO COM SUCESSO!');
  } else {
    console.log('❌ TESTE RÁPIDO FALHOU NA CRIAÇÃO DA SESSÃO');
  }
}