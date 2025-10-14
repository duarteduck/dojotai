// activities.gs – API de atividades (atualizada para categoria_atividade_id)

function listActivitiesApi(sessionId, filtros) {
  console.log('🚀 listActivitiesApi chamada - sessionId:', sessionId ? '✓' : '✗', 'filtros:', JSON.stringify(filtros));
  try {
    // Validar sessão (helper centralizado)
    const auth = requireSession(sessionId, 'Activities');
    if (!auth.ok) return auth;

    const result = _listActivitiesCore(filtros);
    console.log('📊 _listActivitiesCore resultado:', result?.ok ? 'OK' : 'ERRO', '- Items:', result?.items?.length || 0);

    // Garante objeto "serializável" para o HTMLService
    const serialized = JSON.parse(JSON.stringify(result));
    console.log('✅ listActivitiesApi retornando:', serialized?.ok ? 'OK' : 'ERRO');
    return serialized;
  } catch (err) {
    console.error('❌ ERRO listActivitiesApi:', err);
    return { ok:false, error: 'Erro listActivitiesApi: ' + (err && err.message ? err.message : err) };
  }
}

// ============================================================================
// FUNÇÃO REMOVIDA: completeActivity() - activities.gs:19-54
//
// Motivo: Função obsoleta/duplicada
// - Versão migrada existe em usuarios_api.gs:512
// - Versão migrada usa DatabaseManager.update() com validação e logs
// - Esta versão usava acesso direto à planilha (sheet.getRange().setValue())
// - Usava nowString_() para preencher atualizado_em manualmente
//
// Removido em: Migração #2 - Fase 1, Tarefa 1.1
// Data: 02/10/2025
// ============================================================================

// ============================================================================
// FUNÇÃO REMOVIDA: createActivity() - activities.gs:32-100
//
// Motivo: Função obsoleta/duplicada
// - Versão migrada existe em usuarios_api.gs:108
// - Versão migrada usa DatabaseManager.insert() com validação automática
// - Esta versão usava acesso direto à planilha (sheet.getRange().setValues())
// - Usava generateSequentialId_() para gerar IDs manualmente (linha 76)
// - Usava nowString_() para preencher criado_em manualmente (linha 78)
// - DatabaseManager faz tudo isso automaticamente
//
// Removido em: Migração #2 - Fase 1, Tarefa 1.2
// Data: 02/10/2025
// ============================================================================

/** Core da listagem (usado pela API pública) */
function _listActivitiesCore(filtros) {
  console.log('🔄 _listActivitiesCore INICIADA com filtros:', JSON.stringify(filtros));
  const ctx = getActivitiesCtx_();

  // Lê do cabeçalho até a última linha usada
  const values = getFullTableValues_(ctx);
  console.log('📋 Tabela atividades lida - Linhas:', values?.length || 0);
  if (!values || !values.length) return { ok:false, error:'A tabela de atividades está vazia.' };

  const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
  const needed = ['id','titulo','descricao','data','status','atualizado_uid','criado_em','atualizado_em','atribuido_uid'];
  const missing = needed.filter(k => header.indexOf(k) === -1);
  if (missing.length) return { ok:false, error:'Cabeçalho inválido. Faltam: ' + missing.join(', ') };

  const headerIndex = {}; header.forEach((name, i) => headerIndex[name] = i);

  // DEBUG: Verificar colunas disponíveis
  console.log('🔍 DEBUG Header disponível:', header);
  console.log('🔍 DEBUG HeaderIndex mapeado:', headerIndex);

  // Corta vazios no final (considera colunas-chave)
  const v = trimValuesByRequired_(values, headerIndex, ['id','titulo','status']);

  const idxId   = headerIndex['id'];
  const idxTit  = headerIndex['titulo'];
  const idxDesc = headerIndex['descricao'];
  const idxData = headerIndex['data'];
  const idxStat = headerIndex['status'];
  const idxAtuU = headerIndex['atualizado_uid'];
  const idxCri  = headerIndex['criado_em'];
  const idxAtuE = headerIndex['atualizado_em'];
  const idxAtrU = headerIndex['atribuido_uid'];
  const idxCatIds = headerIndex['categorias_ids']; // CORRETO: conforme dicionário
  const idxTags = headerIndex['tags']; // NOVO: tags livres

  // DEBUG: Verificar se colunas existe
  console.log('🔍 DEBUG idxCatIds (categorias_ids):', idxCatIds);
  console.log('🔍 DEBUG idxTags (tags):', idxTags);

  const items = [];
  for (let i=1;i<v.length;i++) {
    const r = v[i];
    if (!r.length) continue;

    const item = {
      id: r[idxId],
      titulo: r[idxTit],
      descricao: r[idxDesc],
      data: r[idxData],
      status: r[idxStat],
      atualizado_uid: r[idxAtuU],
      criado_em: r[idxCri],
      atualizado_em: r[idxAtuE],
      atribuido_uid: r[idxAtrU]
    };

    // Adicionar categorias_ids se a coluna existir
    if (idxCatIds >= 0) {
      item.categorias_ids = r[idxCatIds] || '';
    }

    // Adicionar tags se a coluna existir
    if (idxTags >= 0) {
      item.tags = r[idxTags] || '';
    }

    items.push(item);
  }

  console.log('📋 Total de atividades brutas:', items.length);

  // ============================================================================
  // OTIMIZAÇÃO: Aplicar filtros ANTES do processamento pesado (stats, categorias)
  // ============================================================================
  let filteredItems = items;

  if (filtros) {
    console.log('⚡ Aplicando filtros ANTES do processamento pesado:', JSON.stringify(filtros));

    // Filtro por status (rápido - apenas string comparison)
    if (filtros.status && Array.isArray(filtros.status) && filtros.status.length > 0) {
      const antes = filteredItems.length;
      filteredItems = filteredItems.filter(item => {
        const itemStatus = (item.status || '').toString().trim().toLowerCase();
        return filtros.status.includes(itemStatus);
      });
      console.log(`  ✂️ Filtro status: ${filteredItems.length} de ${antes} (removeu ${antes - filteredItems.length})`);
    }

    // Filtro por responsável (rápido - apenas comparação de string)
    if (filtros.responsavel && Array.isArray(filtros.responsavel) && filtros.responsavel.length > 0) {
      const antes = filteredItems.length;
      filteredItems = filteredItems.filter(item =>
        filtros.responsavel.includes(item.atribuido_uid)
      );
      console.log(`  ✂️ Filtro responsável: ${filteredItems.length} de ${antes} (removeu ${antes - filteredItems.length})`);
    }

    // Filtro por período (médio - precisa parse de datas)
    if (filtros.periodo && Array.isArray(filtros.periodo) && filtros.periodo.length > 0) {
      const antes = filteredItems.length;
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      filteredItems = filteredItems.filter(item => {
        if (!item.data) return false;
        const dataAtividade = new Date(item.data);
        dataAtividade.setHours(0, 0, 0, 0);

        return filtros.periodo.some(periodo => {
          switch (periodo) {
            case 'hoje':
              return dataAtividade.getTime() === hoje.getTime();
            case 'atrasadas':
              return dataAtividade < hoje && (item.status || '').toString().toLowerCase() === 'pendente';
            case 'proximos_10':
              const em10Dias = new Date(hoje);
              em10Dias.setDate(hoje.getDate() + 10);
              return dataAtividade >= hoje && dataAtividade <= em10Dias;
            case 'mes_atual':
              return dataAtividade.getMonth() === hoje.getMonth() &&
                     dataAtividade.getFullYear() === hoje.getFullYear();
            default:
              return false;
          }
        });
      });
      console.log(`  ✂️ Filtro período: ${filteredItems.length} de ${antes} (removeu ${antes - filteredItems.length})`);
    }

    console.log(`⚡ TOTAL após filtros rápidos: ${filteredItems.length} de ${items.length} (economizou ${items.length - filteredItems.length} processamentos pesados!)`);
  }

  // Agora processar apenas as atividades filtradas
  const users = getUsersMapReadOnly_();
  const categoriasAtividades = getCategoriasAtividadesMapReadOnly_();

  console.log('🔍 DEBUG categoriasAtividades keys:', Object.keys(categoriasAtividades));
  console.log('📋 Processando categorias e stats para', filteredItems.length, 'atividades...');

  // ============================================================================
  // OTIMIZAÇÃO: Buscar stats de TODAS as atividades de uma vez (batch)
  // ============================================================================
  const activityIds = filteredItems.map(it => it.id);
  const statsBatchResult = getParticipacaoStatsBatch(activityIds);
  const statsMap = statsBatchResult.ok ? statsBatchResult.statsMap : {};
  console.log('📊 Stats em batch carregados:', Object.keys(statsMap).length, 'atividades');

  filteredItems.forEach(it => {
    const atr = (it.atribuido_uid || '').toString().trim();
    const atu = (it.atualizado_uid || '').toString().trim();
    it.atribuido_nome = users[atr]?.nome || '';
    it.atualizado_nome = users[atu]?.nome || '';

    // Adicionar dados de todas as categorias da atividade
    const categoriasIds = (it.categorias_ids || '').toString().trim();
    console.log(`🔍 DEBUG Atividade ${it.id}: categorias_ids="${categoriasIds}"`);

    it.categorias = []; // Array de todas as categorias

    if (categoriasIds) {
      const idsArray = categoriasIds.split(',').map(id => id.trim()).filter(id => id);
      console.log(`🔍 DEBUG IDs das categorias: [${idsArray.join(', ')}]`);

      idsArray.forEach(catId => {
        if (categoriasAtividades[catId]) {
          const categoria = {
            id: catId,
            nome: categoriasAtividades[catId].nome,
            icone: categoriasAtividades[catId].icone,
            cor: categoriasAtividades[catId].cor
          };
          it.categorias.push(categoria);
          console.log(`✅ Categoria adicionada: ${catId} = ${categoria.nome}`);
        } else {
          console.log(`❌ Categoria NÃO encontrada: ${catId}. Disponíveis:`, Object.keys(categoriasAtividades));
        }
      });

      // Para compatibilidade, manter campos da primeira categoria
      if (it.categorias.length > 0) {
        it.categoria_atividade_nome = it.categorias[0].nome;
        it.categoria_atividade_icone = it.categorias[0].icone;
        it.categoria_atividade_cor = it.categorias[0].cor;
      } else {
        it.categoria_atividade_nome = '';
        it.categoria_atividade_icone = '';
        it.categoria_atividade_cor = '';
      }
    } else {
      console.log(`❌ Nenhuma categoria definida para atividade ${it.id}`);
      it.categoria_atividade_nome = '';
      it.categoria_atividade_icone = '';
      it.categoria_atividade_cor = '';
    }

    console.log(`🔍 DEBUG Categorias processadas para ${it.id}:`, it.categorias);

    // Adicionar contadores de participação do statsMap (já carregado em batch)
    const stats = statsMap[it.id];
    if (stats) {
      it.total_alvos = stats.total || 0;
      it.confirmados = stats.confirmados || 0;
      it.rejeitados = stats.recusados || 0;  // recusados no backend = rejeitados no frontend
      it.participantes = stats.participaram || 0;
      it.ausentes = stats.ausentes || 0;
    } else {
      // Fallback se não houver stats (atividade sem participações)
      it.total_alvos = 0;
      it.confirmados = 0;
      it.rejeitados = 0;
      it.participantes = 0;
      it.ausentes = 0;
    }

    // Normaliza status já no back se preferir:
    const s = (it.status || '').toString().trim().toLowerCase();
    if (s === 'pendente') it.status = 'pendente';
    else if (s === 'concluida' || s === 'concluída') it.status = 'concluida';
  });

  console.log('📋 Total de atividades APÓS processamento:', filteredItems.length);

  // Filtro por categorias (só pode ser aplicado DEPOIS de processar categorias)
  if (filtros && filtros.categorias && Array.isArray(filtros.categorias) && filtros.categorias.length > 0) {
    const antes = filteredItems.length;
    filteredItems = filteredItems.filter(item => {
      if (item.categorias && item.categorias.length > 0) {
        return item.categorias.some(cat => filtros.categorias.includes(cat.id));
      }
      return false;
    });
    console.log(`  ✂️ Filtro categorias (pós-processamento): ${filteredItems.length} de ${antes} (removeu ${antes - filteredItems.length})`);
  }

  // Ordenação: pendentes primeiro; depois por data crescente
  filteredItems.sort((a,b) => {
    const sA = (a.status||'').toString().toLowerCase();
    const sB = (b.status||'').toString().toLowerCase();
    if (sA !== sB) return sA === 'pendente' ? -1 : 1;
    return new Date(a.data||'2100-01-01') - new Date(b.data||'2100-01-01');
  });

  console.log('✅ Retornando', filteredItems.length, 'atividades filtradas');
  return { ok:true, items: filteredItems };
}

// (Opcional) deixe um alias para trás caso o front antigo chame listActivities
function listActivities() {
  return listActivitiesApi();
}

/* ----------------------------------------------------------------------
 * NOVO: resolve o contexto (sheet/startRow/startCol) via Tabela Planilhas
 * -------------------------------------------------------------------- */
function getActivitiesCtx_() {
  const ref = getPlanRef_('atividades');
  const ctxPlan = getContextFromRef_(ref);

  // Quando for named_range (ex.: ATIVIDADES_TBL)
  if (ctxPlan.namedRange) {
    const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
      ? SpreadsheetApp.openById(ref.ssid)
      : SpreadsheetApp.getActiveSpreadsheet();
    const rng = ss.getRangeByName(ctxPlan.namedRange);
    return {
      sheet: rng.getSheet(),
      startRow: rng.getRow(),
      startCol: rng.getColumn()
    };
  }

  // Fallback: planilha!range_a1
  const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
    ? SpreadsheetApp.openById(ref.ssid)
    : SpreadsheetApp.getActiveSpreadsheet();
  const rng = ss.getRange(ctxPlan.rangeStr);
  return {
    sheet: rng.getSheet(),
    startRow: rng.getRow(),
    startCol: rng.getColumn()
  };
}

/** Lê do cabeçalho (ctx.startRow/startCol) até a última linha usada da sheet */
function getFullTableValues_(ctx) {
  const sh = ctx.sheet;
  const startRow = Number(ctx.startRow) || 1;
  const startCol = Number(ctx.startCol) || 1;

  const lastColSheet = sh.getLastColumn();
  const headerRow = sh.getRange(startRow, startCol, 1, Math.max(1, lastColSheet - startCol + 1)).getValues()[0];

  // define a largura da tabela pela última célula de cabeçalho não vazia
  let width = headerRow.length;
  for (let c = headerRow.length - 1; c >= 0; c--) {
    const v = headerRow[c];
    if (!(v === '' || v == null)) { width = c + 1; break; }
    if (c === 0) width = 1;
  }

  const lastRow = sh.getLastRow();
  if (lastRow < startRow) return [headerRow.slice(0, width)];

  const rng = sh.getRange(startRow, startCol, lastRow - startRow + 1, width);
  return rng.getValues();
}

/** Versão compatível com o que seu código espera */
if (typeof trimValuesByRequired_ !== 'function') {
  var trimValuesByRequired_ = function(values, headerIndex, requiredKeys) {
    if (!values || !values.length) return values || [];

    // valida que o header tem as chaves exigidas
    (requiredKeys || []).forEach(k => {
      if (!(k in headerIndex)) throw new Error('Cabeçalho faltando: ' + k);
    });

    // aparar cauda de linhas vazias (preserva a linha 0 = cabeçalho)
    let last = values.length - 1;
    outer: for (; last >= 1; last--) {
      const row = values[last] || [];
      for (let c = 0; c < row.length; c++) {
        const v = row[c];
        if (!(v === '' || v == null)) break outer; // achou conteúdo
      }
    }
    const sliced = values.slice(0, last + 1);

    // trim em strings
    for (let r = 0; r < sliced.length; r++) {
      const row = sliced[r];
      for (let c = 0; c < row.length; c++) {
        const v = row[c];
        if (typeof v === 'string') row[c] = v.trim();
      }
    }
    return sliced;
  };
}

/**
 * Retorna mapa de usuários ativos para lookups rápidos O(1)
 * Refatorado para usar listActiveUsers() (já migrado para DatabaseManager)
 *
 * @returns {Object} Mapa: { "U001": {nome: "João", login: "joao"}, ... }
 *
 * PERFORMANCE: Conversão array→mapa é O(n) mas rápida (~0.1ms para 50 usuários).
 * Lookups no mapa são O(1), muito mais rápidos que find() no array O(n).
 * Cache vem do DatabaseManager (via listActiveUsers), dados sempre atualizados.
 */
function getUsersMapReadOnly_() {
  try {
    // Usar função já migrada (cache do DatabaseManager)
    const result = listActiveUsers();

    if (!result || !result.ok || !result.users) {
      return {};
    }

    // Converter array em mapa para lookups O(1)
    const map = {};
    result.users.forEach(user => {
      map[user.uid] = {
        nome: user.nome || user.login || user.uid,
        login: user.login
      };
    });

    return map;
  } catch (e) {
    Logger.error('Activities', 'Error creating users map', { error: e.message });
    return {};
  }
}

/**
 * Atualiza atividade por ID (PATCH parcial baseado em cabeçalho).
 */
/**
 * Atualiza atividade com suporte a alvos (PATCH)
 * Migrado para DatabaseManager - Migração #2, Fase 4
 * @param {string} sessionId - ID da sessão do usuário
 * @param {Object} input - Objeto com {id, patch, alvos}
 * @param {string} uidEditor - UID do usuário que está editando
 * @returns {Object} {ok: boolean, atualizadoPorNome?: string, error?: string}
 */
async function updateActivityWithTargets(sessionId, input, uidEditor) {
  try {
    // Validar sessão (helper centralizado)
    const auth = requireSession(sessionId, 'Activities');
    if (!auth.ok) return auth;

    if (!input || !input.id) {
      return { ok: false, error: 'ID não informado.' };
    }

    const patch = input.patch || {};

    // Validar categorias se fornecidas
    if (patch.categorias_ids !== undefined && patch.categorias_ids !== '') {
      const categoriasArray = patch.categorias_ids.split(',').map(id => id.trim()).filter(id => id);
      for (const catId of categoriasArray) {
        const catValida = validateCategoriaAtividade_(catId);
        if (!catValida) {
          return { ok: false, error: 'Categoria de atividade inválida: ' + catId };
        }
      }
    }

    // Preparar dados para update (apenas campos fornecidos - PATCH)
    const updateData = {};
    if (patch.titulo !== undefined) updateData.titulo = patch.titulo;
    if (patch.descricao !== undefined) updateData.descricao = patch.descricao;
    if (patch.data !== undefined) updateData.data = patch.data;
    if (patch.atribuido_uid !== undefined) updateData.atribuido_uid = patch.atribuido_uid;
    if (patch.categorias_ids !== undefined) updateData.categorias_ids = patch.categorias_ids;
    if (uidEditor) updateData.atualizado_uid = uidEditor;
    // atualizado_em preenchido automaticamente pelo DatabaseManager

    console.log('🔄 updateActivityWithTargets - Atualizando:', input.id, updateData);

    // Atualizar usando DatabaseManager
    const updateResult = await DatabaseManager.update('atividades', input.id, updateData);

    if (!updateResult || !updateResult.success) {
      console.error('❌ Erro ao atualizar atividade:', updateResult?.error);
      return { ok: false, error: updateResult?.error || 'Erro ao atualizar atividade' };
    }

    console.log('✅ Atividade atualizada com sucesso');

    // Salvar alvos se fornecidos
    if (input.alvos && Array.isArray(input.alvos)) {
      console.log('🎯 Salvando alvos para atividade:', input.id, 'Alvos:', input.alvos);
      try {
        const resultAlvos = await saveTargetsDirectly(input.id, input.alvos, uidEditor);
        if (!resultAlvos.ok) {
          console.error('❌ Erro ao salvar alvos:', resultAlvos.error);
          return { ok: false, error: 'Erro ao salvar alvos: ' + resultAlvos.error };
        }
        console.log('✅ Alvos salvos com sucesso');
      } catch (e) {
        console.error('❌ Exceção ao salvar alvos:', e);
        return { ok: false, error: 'Exceção ao salvar alvos: ' + e.toString() };
      }
    }

    // Buscar nome de quem atualizou
    let atualizadoPorNome = '';
    try {
      const users = getUsersMapReadOnly_ && getUsersMapReadOnly_();
      if (users && uidEditor && users[uidEditor] && users[uidEditor].nome) {
        atualizadoPorNome = users[uidEditor].nome;
      }
    } catch (e) {
      console.warn('⚠️ Não foi possível buscar nome do usuário:', e);
    }

    return { ok: true, atualizadoPorNome: atualizadoPorNome };

  } catch (err) {
    return { ok:false, error:'Erro updateActivity: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Retorna uma única atividade por ID, com os mesmos campos de listActivitiesApi().
 */
// ============================================================================
// FUNÇÃO REMOVIDA: getActivityById() - activities.gs:509-525
//
// Motivo: Função duplicada e ineficiente
// - Versão migrada existe em usuarios_api.gs:283
// - Versão migrada usa DatabaseManager.findById() (busca direta O(1))
// - Esta versão chamava _listActivitiesCore() + loop manual (O(n) - ineficiente)
// - Versão migrada tem retry automático e invalidação de cache
//
// Removido em: Migração #2 - Fase 1, Tarefa 2.1
// Data: 02/10/2025
// ============================================================================


