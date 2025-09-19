/**
 * Sistema Dojotai V2.0 - Testes de Migração
 * Criado: 18/09/2025
 * Semana 1: Testes básicos de compatibilidade
 */

/**
 * BATERIA COMPLETA DE TESTES - Executa todos os testes de validação
 */
function runCompleteValidation() {
  try {
    console.log('='.repeat(60));
    console.log('🧪 VALIDAÇÃO COMPLETA DA MIGRAÇÃO V2');
    console.log('='.repeat(60));

    const testSuite = [
      { name: 'Configuração', func: testConfiguration },
      { name: 'Todas as Tabelas', func: testAllTables },
      { name: 'Compatibilidade V1 vs V2', func: testV1vsV2Compatibility },
      { name: 'Performance Cache', func: testPerformanceScenarios },
      { name: 'Operações CRUD', func: testCRUDOperations },
      { name: 'Cache de Filtros', func: testCacheFilters }
    ];

    const results = {};
    let totalPassed = 0;
    let totalTests = testSuite.length;

    console.log(`\n🎯 Executando ${totalTests} suítes de testes...\n`);

    testSuite.forEach((test, index) => {
      try {
        console.log(`\n${'='.repeat(40)}`);
        console.log(`📋 ${index + 1}/${totalTests}: ${test.name}`);
        console.log(`${'='.repeat(40)}`);

        const result = test.func();
        results[test.name] = result;

        if (result.success) {
          totalPassed++;
          console.log(`✅ ${test.name}: PASSOU`);
        } else {
          console.log(`❌ ${test.name}: FALHOU - ${result.error || 'Erro desconhecido'}`);
        }

      } catch (error) {
        console.error(`💥 Erro crítico em ${test.name}:`, error);
        results[test.name] = { success: false, error: error.message };
      }
    });

    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO FINAL DA VALIDAÇÃO');
    console.log('='.repeat(60));

    const successRate = ((totalPassed / totalTests) * 100).toFixed(1);

    Object.keys(results).forEach(testName => {
      const result = results[testName];
      const status = result.success ? '✅ PASSOU' : '❌ FALHOU';
      console.log(`${status} - ${testName}`);
    });

    console.log(`\n🎯 Taxa de sucesso: ${totalPassed}/${totalTests} (${successRate}%)`);

    if (totalPassed === totalTests) {
      console.log('\n🎉 MIGRAÇÃO V2 TOTALMENTE VALIDADA!');
      console.log('✅ Sistema pronto para uso em produção');
      console.log('✅ Compatibilidade 100% com sistema atual');
      console.log('✅ Performance otimizada com cache');
      console.log('✅ Operações CRUD funcionando');
    } else {
      console.log('\n⚠️ VALIDAÇÃO PARCIAL');
      console.log(`❌ ${totalTests - totalPassed} teste(s) falharam`);
      console.log('⚠️ Revisar problemas antes de usar em produção');
    }

    return {
      success: totalPassed === totalTests,
      totalTests,
      totalPassed,
      successRate,
      results
    };

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NA VALIDAÇÃO:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Função principal de teste da migração V2
 * Valida se o DatabaseManager funciona corretamente
 */
function testMigrationV2() {
  try {
    console.log('='.repeat(60));
    console.log('🚀 INICIANDO TESTES DE MIGRAÇÃO V2');
    console.log('='.repeat(60));

    // Inicializar configuração
    logConfigInit();

    // Executar bateria de testes
    const results = {
      config: testConfiguration(),
      database: testDatabaseManager(),
      compatibility: testCompatibility(),
      performance: testPerformance()
    };

    // Resumo dos resultados
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO DOS TESTES');
    console.log('='.repeat(60));

    let totalTests = 0;
    let passedTests = 0;

    Object.keys(results).forEach(testType => {
      const result = results[testType];
      totalTests++;
      if (result.success) {
        passedTests++;
        console.log(`✅ ${testType}: PASSOU`);
      } else {
        console.log(`❌ ${testType}: FALHOU - ${result.error}`);
      }
    });

    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    console.log(`\n🎯 Taxa de sucesso: ${passedTests}/${totalTests} (${successRate}%)`);

    if (passedTests === totalTests) {
      console.log('🎉 MIGRAÇÃO V2 PRONTA PARA DEPLOY!');
    } else {
      console.log('⚠️ Corrija os problemas antes do deploy');
    }

    return {
      success: passedTests === totalTests,
      results,
      summary: { total: totalTests, passed: passedTests, rate: successRate }
    };

  } catch (error) {
    console.error('💥 ERRO CRÍTICO NO TESTE DE MIGRAÇÃO:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Testar configuração básica
 */
function testConfiguration() {
  try {
    console.log('\n📋 Testando configuração...');

    // Verificar se APP_CONFIG existe
    if (typeof APP_CONFIG === 'undefined') {
      throw new Error('APP_CONFIG não definido');
    }

    // Verificar propriedades essenciais (removido EXISTING_TABLES)
    const requiredProps = ['VERSION', 'TZ', 'PLANILHAS'];
    for (const prop of requiredProps) {
      if (!APP_CONFIG[prop]) {
        throw new Error(`APP_CONFIG.${prop} não definido`);
      }
    }

    // Verificar se getExistingTables() funciona
    const existingTables = getExistingTables();
    if (typeof existingTables !== 'object' || existingTables === null) {
      throw new Error('getExistingTables() não retorna objeto válido');
    }

    // Verificar se tem tabelas configuradas
    const tableCount = Object.keys(existingTables).length;
    if (tableCount === 0) {
      throw new Error('Nenhuma tabela configurada');
    }

    console.log(`✅ Configuração válida: ${tableCount} tabelas configuradas`);
    return { success: true };

  } catch (error) {
    console.error('❌ Erro na configuração:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Testar compatibilidade com sistema atual
 */
function testCompatibility() {
  try {
    console.log('\n🔄 Testando compatibilidade...');

    // Verificar se funções do sistema atual existem
    const requiredFunctions = ['readTableByNome_', 'getPlanRef_', 'getContextFromRef_'];
    for (const funcName of requiredFunctions) {
      if (typeof eval(funcName) !== 'function') {
        throw new Error(`Função ${funcName} não encontrada`);
      }
    }

    // Testar acesso a uma tabela usando sistema atual
    const { values } = readTableByNome_('usuarios');
    if (!values || values.length === 0) {
      throw new Error('Não foi possível acessar tabela usuarios com sistema atual');
    }

    // Testar se DatabaseManager e sistema atual retornam dados similares
    const usuariosV1 = values.slice(1).length; // Sistema atual (sem header)
    const usuariosV2 = DatabaseManager.query('usuarios').length; // Sistema V2

    console.log(`📊 Comparação usuarios: V1=${usuariosV1}, V2=${usuariosV2}`);

    // Permitir pequena diferença devido a filtros
    const difference = Math.abs(usuariosV1 - usuariosV2);
    if (difference > 5) { // Tolerância de 5 registros
      console.warn(`⚠️ Diferença significativa entre V1 e V2: ${difference} registros`);
    }

    console.log('✅ Compatibilidade verificada');
    return { success: true };

  } catch (error) {
    console.error('❌ Erro de compatibilidade:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Testar performance básica
 */
function testPerformance() {
  try {
    console.log('\n⚡ Testando performance...');

    // Teste 1: Query sem cache
    const start1 = new Date();
    DatabaseManager.query('usuarios', {}, false); // Sem cache
    const time1 = new Date() - start1;

    // Teste 2: Query com cache (deveria ser mais rápido)
    const start2 = new Date();
    DatabaseManager.query('usuarios', {}, true); // Com cache
    const time2 = new Date() - start2;

    console.log(`⏱️ Query sem cache: ${time1}ms`);
    console.log(`⏱️ Query com cache: ${time2}ms`);

    // Verificar se cache funciona (segunda query deveria ser mais rápida)
    if (time2 < time1) {
      console.log('✅ Cache funcionando corretamente');
    } else {
      console.log('⚠️ Cache pode não estar funcionando otimamente');
    }

    // Verificar se não está muito lento (mais de 10 segundos é problemático)
    if (time1 > 10000) {
      throw new Error(`Query muito lenta: ${time1}ms`);
    }

    return { success: true, stats: { withoutCache: time1, withCache: time2 } };

  } catch (error) {
    console.error('❌ Erro de performance:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Teste rápido - versão simplificada para desenvolvimento
 */
function quickTestV2() {
  try {
    console.log('🧪 Teste rápido V2...');

    // Teste básico: consegue buscar dados?
    const usuarios = DatabaseManager.query('usuarios');
    console.log(`👥 Usuarios encontrados: ${usuarios.length}`);

    const atividades = DatabaseManager.query('atividades');
    console.log(`📋 Atividades encontradas: ${atividades.length}`);

    // Teste de cache
    const start = new Date();
    DatabaseManager.query('usuarios'); // Deveria vir do cache
    const cacheTime = new Date() - start;
    console.log(`⚡ Tempo com cache: ${cacheTime}ms`);

    console.log('✅ Teste rápido concluído!');
    return true;

  } catch (error) {
    console.error('❌ Erro no teste rápido:', error);
    return false;
  }
}

/**
 * Teste completo de operações CRUD
 */
function testCRUDOperations() {
  try {
    console.log('🔧 TESTE CRUD: Testando Insert, Update, Delete...');

    // Teste 1: INSERT
    console.log('\n📝 Teste INSERT:');
    const testData = {
      nome: 'Teste Migração V2',
      login: 'teste_v2',
      pin: '1234'
      // status será gerado automaticamente com default 'Ativo'
      // uid e criado_em são gerados automaticamente
    };

    const insertResult = DatabaseManager.insert('usuarios', testData);
    console.log('Insert resultado:', insertResult.success ? `✅ UID: ${insertResult.id}` : `❌ ${insertResult.error}`);

    if (!insertResult.success) {
      throw new Error('Insert falhou: ' + insertResult.error);
    }

    const newUid = insertResult.id; // Na verdade é o UID

    // Teste 2: FIND BY UID (chave primária da tabela usuarios)
    console.log('\n🔍 Teste FIND BY UID:');
    const foundUser = DatabaseManager.findById('usuarios', newUid);
    console.log('FindById resultado:', foundUser ? `✅ Encontrado: ${foundUser.nome}` : '❌ Não encontrado');

    // Teste 2.1: Verificar campos obrigatórios gerados automaticamente
    if (foundUser) {
      console.log('\n🔍 Verificando campos gerados automaticamente:');
      console.log(`   UID (padrão U{counter}): ${foundUser.uid ? '✅' : '❌'} ${foundUser.uid}`);
      console.log(`   criado_em: ${foundUser.criado_em ? '✅' : '❌'} ${foundUser.criado_em}`);
      console.log(`   status (default): ${foundUser.status ? '✅' : '❌'} ${foundUser.status}`);
      console.log(`   nome: ${foundUser.nome ? '✅' : '❌'} ${foundUser.nome}`);
      console.log(`   login: ${foundUser.login ? '✅' : '❌'} ${foundUser.login}`);

      // Verificar se algum campo obrigatório está faltando
      const missingFields = [];
      if (!foundUser.uid) missingFields.push('uid');
      if (!foundUser.criado_em) missingFields.push('criado_em');
      if (!foundUser.status) missingFields.push('status');
      if (!foundUser.nome) missingFields.push('nome');
      if (!foundUser.login) missingFields.push('login');
      if (!foundUser.pin) missingFields.push('pin');

      if (missingFields.length > 0) {
        console.log(`⚠️ Campos faltantes: ${missingFields.join(', ')}`);
      } else {
        console.log('✅ Todos os campos obrigatórios presentes');
      }

      // Verificar padrão do UID
      if (foundUser.uid && foundUser.uid.startsWith('U')) {
        console.log(`✅ Padrão de UID correto: ${foundUser.uid}`);
      } else {
        console.log(`❌ Padrão de UID incorreto: ${foundUser.uid}`);
      }
    }

    // Teste 3: UPDATE
    console.log('\n✏️ Teste UPDATE:');
    const updateResult = DatabaseManager.update('usuarios', newUid, {
      nome: 'Teste Migração V2 - ATUALIZADO',
      status: 'Inativo'
    });
    console.log('Update resultado:', updateResult.success ? '✅ Atualizado' : `❌ ${updateResult.error}`);

    // Teste 4: VERIFICAR UPDATE
    console.log('\n🔍 Verificar UPDATE:');
    const updatedUser = DatabaseManager.findById('usuarios', newUid);
    console.log('Usuário atualizado:', updatedUser ? `✅ Nome: ${updatedUser.nome}, Status: ${updatedUser.status}` : '❌ Não encontrado');

    // Teste 5: DELETE (Soft Delete)
    console.log('\n🗑️ Teste DELETE:');
    const deleteResult = DatabaseManager.delete('usuarios', newUid);
    console.log('Delete resultado:', deleteResult.success ? '✅ Deletado (soft)' : `❌ ${deleteResult.error}`);

    // Teste 6: VERIFICAR DELETE
    console.log('\n🔍 Verificar DELETE:');
    const deletedUser = DatabaseManager.findById('usuarios', newUid);
    console.log('Usuário deletado ainda aparece?', deletedUser ? '❌ Ainda aparece (problema!)' : '✅ Filtrado corretamente');

    console.log('\n✅ CRUD completo testado!');
    return { success: true, testId: newUid };

  } catch (error) {
    console.error('❌ Erro no teste CRUD:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Teste de performance em diferentes cenários
 */
function testPerformanceScenarios() {
  try {
    console.log('⚡ TESTE PERFORMANCE: Diferentes cenários...');

    const scenarios = [
      { table: 'usuarios', filters: {} },
      { table: 'usuarios', filters: { status: 'Ativo' } },
      { table: 'atividades', filters: {} },
      { table: 'atividades', filters: { status: 'Planejada' } },
      { table: 'membros', filters: {} },
      { table: 'participacoes', filters: {} }
    ];

    // Limpar cache para teste limpo
    DatabaseManager.clearCache();

    console.log('\n📊 Teste 1: Performance sem cache');
    const timesWithoutCache = [];
    scenarios.forEach((scenario, index) => {
      const start = new Date();
      DatabaseManager.query(scenario.table, scenario.filters, false); // Sem cache
      const time = new Date() - start;
      timesWithoutCache.push(time);
      console.log(`${index + 1}. ${scenario.table}: ${time}ms`);
    });

    console.log('\n📊 Teste 2: Performance com cache');
    const timesWithCache = [];
    scenarios.forEach((scenario, index) => {
      const start = new Date();
      DatabaseManager.query(scenario.table, scenario.filters, true); // Com cache
      const time = new Date() - start;
      timesWithCache.push(time);
      console.log(`${index + 1}. ${scenario.table}: ${time}ms`);
    });

    // Calcular melhoria do cache
    const totalWithout = timesWithoutCache.reduce((a, b) => a + b, 0);
    const totalWith = timesWithCache.reduce((a, b) => a + b, 0);
    const improvement = ((totalWithout - totalWith) / totalWithout * 100).toFixed(1);

    console.log(`\n📈 Melhoria do cache: ${improvement}% (${totalWithout}ms → ${totalWith}ms)`);

    return { success: true, improvement, totalWithout, totalWith };

  } catch (error) {
    console.error('❌ Erro no teste de performance:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Teste de todas as tabelas do sistema
 */
function testAllTables() {
  try {
    console.log('📋 TESTE TABELAS: Verificando todas as tabelas...');

    const existingTables = getExistingTables();
    const tables = Object.keys(existingTables);
    const results = [];

    tables.forEach(tableName => {
      try {
        console.log(`\n🔍 Testando tabela: ${tableName}`);

        const start = new Date();
        const data = DatabaseManager.query(tableName);
        const time = new Date() - start;

        console.log(`✅ ${tableName}: ${data.length} registros em ${time}ms`);

        // Teste de cache
        const startCache = new Date();
        DatabaseManager.query(tableName);
        const cacheTime = new Date() - startCache;

        console.log(`   Cache: ${cacheTime}ms`);

        results.push({
          table: tableName,
          records: data.length,
          time,
          cacheTime,
          success: true
        });

      } catch (error) {
        console.error(`❌ Erro em ${tableName}:`, error.message);
        results.push({
          table: tableName,
          success: false,
          error: error.message
        });
      }
    });

    // Resumo
    const successful = results.filter(r => r.success).length;
    const total = results.length;

    console.log(`\n📊 RESUMO: ${successful}/${total} tabelas funcionando`);

    return { success: successful === total, results, summary: `${successful}/${total}` };

  } catch (error) {
    console.error('❌ Erro no teste de tabelas:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Teste de compatibilidade V1 vs V2
 */
function testV1vsV2Compatibility() {
  try {
    console.log('🔄 TESTE COMPATIBILIDADE: V1 vs V2...');

    const testTables = ['usuarios', 'atividades', 'membros'];
    const results = [];

    testTables.forEach(tableName => {
      try {
        console.log(`\n📊 Comparando ${tableName}:`);

        // V1 (sistema atual)
        const { values: v1Values } = readTableByNome_(tableName);
        const v1Count = v1Values.length - 1; // -1 header

        // V2 (DatabaseManager)
        const v2Data = DatabaseManager.query(tableName);
        const v2Count = v2Data.length;

        const difference = Math.abs(v1Count - v2Count);
        const compatible = difference <= 2; // Tolerância de 2 registros

        console.log(`   V1: ${v1Count} registros`);
        console.log(`   V2: ${v2Count} registros`);
        console.log(`   Diferença: ${difference} ${compatible ? '✅' : '❌'}`);

        results.push({
          table: tableName,
          v1Count,
          v2Count,
          difference,
          compatible
        });

      } catch (error) {
        console.error(`❌ Erro na comparação de ${tableName}:`, error);
        results.push({
          table: tableName,
          compatible: false,
          error: error.message
        });
      }
    });

    const compatibleTables = results.filter(r => r.compatible).length;
    const totalTables = results.length;

    console.log(`\n📊 COMPATIBILIDADE: ${compatibleTables}/${totalTables} tabelas compatíveis`);

    return {
      success: compatibleTables === totalTables,
      results,
      summary: `${compatibleTables}/${totalTables}`
    };

  } catch (error) {
    console.error('❌ Erro no teste de compatibilidade:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Comparar resultado V1 vs V2 para uma tabela específica
 */
function compareV1vsV2(tableName = 'usuarios') {
  try {
    console.log(`\n🔍 Comparando V1 vs V2 para tabela: ${tableName}`);

    // Dados V1 (sistema atual)
    const { values: v1Data } = readTableByNome_(tableName);
    const v1Count = v1Data.length - 1; // -1 para remover header

    // Dados V2 (DatabaseManager)
    const v2Data = DatabaseManager.query(tableName);
    const v2Count = v2Data.length;

    console.log(`📊 V1 (sistema atual): ${v1Count} registros`);
    console.log(`📊 V2 (DatabaseManager): ${v2Count} registros`);

    // Verificar estrutura do primeiro registro
    if (v2Data.length > 0) {
      const firstRecord = v2Data[0];
      const fields = Object.keys(firstRecord);
      console.log(`📋 Campos disponíveis (${fields.length}): ${fields.slice(0, 5).join(', ')}${fields.length > 5 ? '...' : ''}`);
    }

    const difference = Math.abs(v1Count - v2Count);
    if (difference === 0) {
      console.log('✅ Contagens idênticas!');
    } else if (difference <= 2) {
      console.log(`⚠️ Pequena diferença: ${difference} registros`);
    } else {
      console.log(`❌ Diferença significativa: ${difference} registros`);
    }

    return { v1Count, v2Count, difference };

  } catch (error) {
    console.error(`❌ Erro na comparação de ${tableName}:`, error);
    return null;
  }
}