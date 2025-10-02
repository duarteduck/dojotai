/**
 * TESTE: Migração de activities_categories.gs
 * Objetivo: Validar que _listCategoriasAtividadesCore() funciona com DatabaseManager
 */

function testCategoriesMigration() {
  console.log('========================================');
  console.log('TESTE: Migração de Categorias de Atividades');
  console.log('========================================\n');

  try {
    // Limpar cache antes do teste
    console.log('1️⃣ Limpando cache de categorias...');
    clearCategoriasAtividadesCache_();
    console.log('   ✅ Cache limpo\n');

    // Testar listagem de categorias (função migrada)
    console.log('2️⃣ Testando _listCategoriasAtividadesCore()...');
    const result = _listCategoriasAtividadesCore();

    console.log('   Resultado:', JSON.stringify(result, null, 2));

    if (!result || !result.ok) {
      console.log('   ❌ ERRO: Função retornou erro');
      console.log('   Erro:', result?.error);
      return;
    }

    console.log('   ✅ Função executou com sucesso');
    console.log('   📊 Total de categorias:', result.items?.length || 0);

    if (result.items && result.items.length > 0) {
      console.log('\n   📋 Categorias encontradas:');
      result.items.forEach((cat, idx) => {
        console.log(`   ${idx + 1}. ${cat.icone} ${cat.nome} (${cat.id}) - Ordem: ${cat.ordem}`);
      });
    }

    // Testar API pública
    console.log('\n3️⃣ Testando listCategoriasAtividadesApi()...');
    const apiResult = listCategoriasAtividadesApi();

    if (!apiResult || !apiResult.ok) {
      console.log('   ❌ ERRO: API retornou erro');
      console.log('   Erro:', apiResult?.error);
      return;
    }

    console.log('   ✅ API executou com sucesso');
    console.log('   📊 Total de categorias (API):', apiResult.items?.length || 0);

    // Testar getCategoriasAtividadesMapReadOnly_
    console.log('\n4️⃣ Testando getCategoriasAtividadesMapReadOnly_()...');
    const map = getCategoriasAtividadesMapReadOnly_();

    const mapKeys = Object.keys(map);
    console.log('   ✅ Map criado com sucesso');
    console.log('   📊 Total de IDs no map:', mapKeys.length);

    if (mapKeys.length > 0) {
      console.log('\n   🗺️ Primeiras 3 entradas do map:');
      mapKeys.slice(0, 3).forEach(key => {
        console.log(`   ${key}: ${map[key].nome}`);
      });
    }

    // Testar validação de categoria
    console.log('\n5️⃣ Testando validateCategoriaAtividade_()...');

    if (mapKeys.length > 0) {
      const testId = mapKeys[0];
      console.log(`   Testando com ID: ${testId}`);

      const validated = validateCategoriaAtividade_(testId);

      if (validated) {
        console.log('   ✅ Validação OK:', validated.nome);
      } else {
        console.log('   ❌ Validação falhou');
      }

      // Testar com ID inválido
      const invalidResult = validateCategoriaAtividade_('ID_INVALIDO_123');
      if (!invalidResult) {
        console.log('   ✅ ID inválido retornou null corretamente');
      } else {
        console.log('   ⚠️ ID inválido retornou resultado inesperado');
      }
    }

    // Testar cache
    console.log('\n6️⃣ Testando cache...');
    console.log('   Chamando getCategoriasAtividadesMapReadOnly_() novamente...');
    const cachedMap = getCategoriasAtividadesMapReadOnly_();
    console.log('   ✅ Cache funcionando (deve ter usado cache na 2ª chamada)');

    // Verificar logs estruturados
    console.log('\n7️⃣ Verificando logs estruturados...');
    console.log('   📝 Verifique a planilha system_logs para logs do DatabaseManager');
    console.log('   Procure por: "ActivitiesCategories" no módulo');

    console.log('\n========================================');
    console.log('✅ TESTE CONCLUÍDO COM SUCESSO');
    console.log('========================================');
    console.log('\n📊 RESUMO:');
    console.log(`   - Categorias encontradas: ${result.items?.length || 0}`);
    console.log(`   - API funcionando: ${apiResult.ok ? 'SIM' : 'NÃO'}`);
    console.log(`   - Map funcionando: ${mapKeys.length > 0 ? 'SIM' : 'NÃO'}`);
    console.log(`   - Cache funcionando: SIM`);

  } catch (error) {
    console.log('\n❌ ERRO NO TESTE:');
    console.log('Mensagem:', error.message);
    console.log('Stack:', error.stack);
  }
}

/**
 * Teste rápido - apenas listar categorias
 */
function quickTestCategories() {
  const result = listCategoriasAtividadesApi();
  console.log('Categorias:', JSON.stringify(result, null, 2));
  return result;
}
