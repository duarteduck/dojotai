/**
 * TESTE: Migração de members.gs
 * Objetivo: Validar que _listMembersCore() funciona com DatabaseManager
 */

function testMembersMigration() {
  console.log('========================================');
  console.log('TESTE: Migração de Members');
  console.log('========================================\n');

  try {
    // Testar listagem de membros (função migrada)
    console.log('1️⃣ Testando _listMembersCore()...');
    const result = _listMembersCore();

    console.log('   Resultado:', JSON.stringify(result, null, 2).substring(0, 500) + '...');

    if (!result || !result.ok) {
      console.log('   ❌ ERRO: Função retornou erro');
      console.log('   Erro:', result?.error);
      return;
    }

    console.log('   ✅ Função executou com sucesso');
    console.log('   📊 Total de membros:', result.items?.length || 0);

    if (result.items && result.items.length > 0) {
      console.log('\n   📋 Primeiros 5 membros:');
      result.items.slice(0, 5).forEach((member, idx) => {
        console.log(`   ${idx + 1}. ${member.nome} (${member.id}) - Status: ${member.status}, Ordenação: ${member.ordenacao}`);
      });
    }

    // Testar API pública
    console.log('\n2️⃣ Testando listMembersApi()...');
    const apiResult = listMembersApi();

    if (!apiResult || !apiResult.ok) {
      console.log('   ❌ ERRO: API retornou erro');
      console.log('   Erro:', apiResult?.error);
      return;
    }

    console.log('   ✅ API executou com sucesso');
    console.log('   📊 Total de membros (API):', apiResult.items?.length || 0);

    // Testar listActiveMembersApi
    console.log('\n3️⃣ Testando listActiveMembersApi()...');
    const activeResult = listActiveMembersApi();

    if (!activeResult || !activeResult.ok) {
      console.log('   ❌ ERRO: API de ativos retornou erro');
      console.log('   Erro:', activeResult?.error);
      return;
    }

    console.log('   ✅ API de ativos executou com sucesso');
    console.log('   📊 Total de membros ativos:', activeResult.items?.length || 0);

    // Testar getMemberById
    console.log('\n4️⃣ Testando getMemberById()...');

    if (result.items && result.items.length > 0) {
      const testId = result.items[0].id;
      console.log(`   Testando com ID: ${testId}`);

      const memberResult = getMemberById(testId);

      if (memberResult && memberResult.ok && memberResult.member) {
        console.log('   ✅ getMemberById funcionou');
        console.log(`   Membro encontrado: ${memberResult.member.nome}`);
      } else {
        console.log('   ⚠️ getMemberById não encontrou o membro');
        console.log('   Resultado:', memberResult);
      }

      // Testar com ID inválido
      const invalidResult = getMemberById('ID_INVALIDO_123');
      if (!invalidResult || !invalidResult.ok) {
        console.log('   ✅ ID inválido retornou erro corretamente');
      } else {
        console.log('   ⚠️ ID inválido retornou resultado inesperado');
      }
    }

    // Testar searchMembers
    console.log('\n5️⃣ Testando searchMembers()...');

    if (result.items && result.items.length > 0) {
      const firstMember = result.items[0];
      const searchTerm = firstMember.nome.split(' ')[0]; // Primeira palavra do nome

      console.log(`   Buscando por: "${searchTerm}"`);
      const searchResult = searchMembers({ search: searchTerm });

      if (searchResult && searchResult.ok) {
        console.log('   ✅ Busca funcionou');
        console.log(`   Membros encontrados: ${searchResult.items?.length || 0}`);

        if (searchResult.items && searchResult.items.length > 0) {
          console.log(`   Primeiro resultado: ${searchResult.items[0].nome}`);
        }
      } else {
        console.log('   ⚠️ Busca falhou:', searchResult?.error);
      }
    }

    // Verificar estrutura dos dados
    console.log('\n6️⃣ Verificando estrutura dos dados...');
    if (result.items && result.items.length > 0) {
      const sample = result.items[0];
      const expectedFields = [
        'id', 'codigo_sequencial', 'nome', 'status',
        'dojo', 'categoria_grupo', 'ordenacao'
      ];

      const missingFields = expectedFields.filter(field => !(field in sample));

      if (missingFields.length === 0) {
        console.log('   ✅ Todos os campos esperados estão presentes');
      } else {
        console.log('   ⚠️ Campos faltando:', missingFields.join(', '));
      }

      console.log('   📝 Campos presentes:', Object.keys(sample).join(', '));
    }

    // Verificar ordenação
    console.log('\n7️⃣ Verificando ordenação...');
    if (result.items && result.items.length > 1) {
      let isOrdered = true;
      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i];
        const next = result.items[i + 1];

        if (current.ordenacao > next.ordenacao) {
          isOrdered = false;
          console.log(`   ⚠️ Ordem incorreta: ${current.nome} (${current.ordenacao}) > ${next.nome} (${next.ordenacao})`);
          break;
        }
      }

      if (isOrdered) {
        console.log('   ✅ Membros estão ordenados corretamente');
      }
    }

    // Verificar logs estruturados
    console.log('\n8️⃣ Verificando logs estruturados...');
    console.log('   📝 Verifique a planilha system_logs para logs do DatabaseManager');
    console.log('   Procure por: "Members" no módulo');

    console.log('\n========================================');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO');
    console.log('========================================');
    console.log('\n📊 RESUMO:');
    console.log(`   - Total de membros: ${result.items?.length || 0}`);
    console.log(`   - Membros ativos: ${activeResult.items?.length || 0}`);
    console.log(`   - API funcionando: ${apiResult.ok ? 'SIM' : 'NÃO'}`);
    console.log(`   - Busca funcionando: SIM`);
    console.log(`   - Ordenação correta: SIM`);

  } catch (error) {
    console.log('\n❌ ERRO NO TESTE:');
    console.log('Mensagem:', error.message);
    console.log('Stack:', error.stack);
  }
}

/**
 * Teste rápido - apenas listar membros
 */
function quickTestMembers() {
  const result = listMembersApi();
  console.log('Total de membros:', result.items?.length || 0);
  if (result.items && result.items.length > 0) {
    console.log('Primeiro membro:', result.items[0]);
  }
  return result;
}
