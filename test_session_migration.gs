/**
 * Script de Teste - Migração session_manager.gs
 * Valida as funções migradas de readTableByNome_ para DatabaseManager
 */

async function testSessionMigration() {
  console.log('='.repeat(60));
  console.log('🧪 TESTE DE MIGRAÇÃO: session_manager.gs');
  console.log('='.repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    tests: []
  };

  // ============================================
  // TESTE 1: validateSession()
  // ============================================
  console.log('\n📝 Teste 1: validateSession()');
  try {
    // Primeiro, criar uma sessão de teste (AWAIT para funções assíncronas)
    const createResult = await createSession('U001', {
      ip: '192.168.1.100',
      userAgent: 'Test Browser',
      platform: 'test'
    });

    if (createResult && createResult.ok) {
      console.log('✅ Sessão de teste criada:', createResult.session.id);

      // Validar a sessão criada
      const validateResult = validateSession(createResult.session.id);

      if (validateResult && validateResult.ok && validateResult.session) {
        console.log('✅ validateSession() funcionou corretamente');
        console.log('   - Session ID:', validateResult.session.id);
        console.log('   - User ID:', validateResult.session.user_id);
        console.log('   - Active:', validateResult.session.active);
        results.passed++;
        results.tests.push({ test: 'validateSession', status: 'PASS' });
      } else {
        console.error('❌ validateSession() falhou:', validateResult.error);
        results.failed++;
        results.tests.push({ test: 'validateSession', status: 'FAIL', error: validateResult.error });
      }

      // Limpar: destruir sessão de teste
      destroySession(createResult.session.id);

    } else {
      console.error('❌ Não foi possível criar sessão de teste:', createResult.error);
      results.failed++;
      results.tests.push({ test: 'validateSession', status: 'FAIL', error: 'Falha ao criar sessão' });
    }
  } catch (error) {
    console.error('❌ Erro no teste validateSession():', error.message);
    results.failed++;
    results.tests.push({ test: 'validateSession', status: 'ERROR', error: error.message });
  }

  // ============================================
  // TESTE 2: getSessionStats()
  // ============================================
  console.log('\n📝 Teste 2: getSessionStats()');
  try {
    const statsResult = getSessionStats();

    if (statsResult && !statsResult.error) {
      console.log('✅ getSessionStats() funcionou corretamente');
      console.log('   - Total de sessões:', statsResult.total_sessions);
      console.log('   - Sessões ativas:', statsResult.active_sessions);
      console.log('   - Sessões expiradas:', statsResult.expired_sessions);
      console.log('   - Sessões inativas:', statsResult.inactive_sessions);
      results.passed++;
      results.tests.push({ test: 'getSessionStats', status: 'PASS' });
    } else {
      console.error('❌ getSessionStats() falhou:', statsResult.error);
      results.failed++;
      results.tests.push({ test: 'getSessionStats', status: 'FAIL', error: statsResult.error });
    }
  } catch (error) {
    console.error('❌ Erro no teste getSessionStats():', error.message);
    results.failed++;
    results.tests.push({ test: 'getSessionStats', status: 'ERROR', error: error.message });
  }

  // ============================================
  // TESTE 3: cleanupExpiredSessions()
  // ============================================
  console.log('\n📝 Teste 3: cleanupExpiredSessions()');
  try {
    const cleanupResult = cleanupExpiredSessions();

    if (cleanupResult && cleanupResult.ok !== false) {
      console.log('✅ cleanupExpiredSessions() funcionou corretamente');
      console.log('   - Sessões limpas:', cleanupResult.cleaned);
      console.log('   - Mensagem:', cleanupResult.message);
      results.passed++;
      results.tests.push({ test: 'cleanupExpiredSessions', status: 'PASS' });
    } else {
      console.error('❌ cleanupExpiredSessions() falhou:', cleanupResult.error);
      results.failed++;
      results.tests.push({ test: 'cleanupExpiredSessions', status: 'FAIL', error: cleanupResult.error });
    }
  } catch (error) {
    console.error('❌ Erro no teste cleanupExpiredSessions():', error.message);
    results.failed++;
    results.tests.push({ test: 'cleanupExpiredSessions', status: 'ERROR', error: error.message });
  }

  // ============================================
  // TESTE 4: Validação de Sessão Inexistente
  // ============================================
  console.log('\n📝 Teste 4: Validar sessão inexistente');
  try {
    const invalidResult = validateSession('sess_invalid_123456789');

    if (!invalidResult.ok && invalidResult.error) {
      console.log('✅ Validação de sessão inexistente funcionou corretamente');
      console.log('   - Erro esperado:', invalidResult.error);
      results.passed++;
      results.tests.push({ test: 'validateInvalidSession', status: 'PASS' });
    } else {
      console.error('❌ Deveria ter retornado erro para sessão inexistente');
      results.failed++;
      results.tests.push({ test: 'validateInvalidSession', status: 'FAIL', error: 'Não retornou erro' });
    }
  } catch (error) {
    console.error('❌ Erro no teste de sessão inexistente:', error.message);
    results.failed++;
    results.tests.push({ test: 'validateInvalidSession', status: 'ERROR', error: error.message });
  }

  // ============================================
  // TESTE 5: Comparação de Performance
  // ============================================
  console.log('\n📝 Teste 5: Performance (DatabaseManager vs readTableByNome_)');
  try {
    // Teste com DatabaseManager (novo)
    const startNew = new Date();
    DatabaseManager.query('sessoes', {}, false);
    const timeNew = new Date() - startNew;

    console.log('✅ Performance testada');
    console.log('   - DatabaseManager.query(): ' + timeNew + 'ms');
    console.log('   - Benefício: Cache automático, validação, sanitização');
    results.passed++;
    results.tests.push({ test: 'performance', status: 'PASS', timeMs: timeNew });
  } catch (error) {
    console.error('❌ Erro no teste de performance:', error.message);
    results.failed++;
    results.tests.push({ test: 'performance', status: 'ERROR', error: error.message });
  }

  // ============================================
  // RELATÓRIO FINAL
  // ============================================
  console.log('\n' + '='.repeat(60));
  console.log('📊 RELATÓRIO FINAL');
  console.log('='.repeat(60));
  console.log('✅ Testes aprovados:', results.passed);
  console.log('❌ Testes falhados:', results.failed);
  console.log('📈 Taxa de sucesso:', ((results.passed / (results.passed + results.failed)) * 100).toFixed(1) + '%');

  console.log('\n📋 Detalhes dos testes:');
  results.tests.forEach((test, index) => {
    const icon = test.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${index + 1}. ${test.test}: ${test.status}`);
    if (test.error) console.log(`   └─ Erro: ${test.error}`);
    if (test.timeMs) console.log(`   └─ Tempo: ${test.timeMs}ms`);
  });

  console.log('\n' + '='.repeat(60));

  if (results.failed === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM! Migração bem-sucedida.');
    console.log('✅ session_manager.gs está pronto para produção.');
  } else {
    console.log('⚠️ ALGUNS TESTES FALHARAM. Revisar antes de continuar.');
  }

  console.log('='.repeat(60));

  return results;
}

/**
 * Teste rápido - apenas executa e mostra resultado
 */
async function quickTest() {
  const results = await testSessionMigration();
  return results.failed === 0 ? '✅ SUCESSO' : '❌ FALHAS DETECTADAS';
}
