// activities.gs – API de atividades (atualizada para categoria_atividade_id)

function listActivitiesApi() {
  console.log('🚀 listActivitiesApi chamada');
  try {
    const result = _listActivitiesCore();
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

function completeActivity(id, uid) {
  try {
    if (!id) return { ok:false, error:'ID da atividade não informado.' };

    const ctx = getActivitiesCtx_();

    // Lê toda a tabela (até a última linha usada)
    const values = getFullTableValues_(ctx);
    if (!values || !values.length) return { ok:false, error:'A tabela de atividades está vazia.' };

    const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
    const idxId   = header.indexOf('id');
    const idxStat = header.indexOf('status');
    const idxAtuU = header.indexOf('atualizado_uid');
    const idxAtuE = header.indexOf('atualizado_em');

    for (let i=1;i<values.length;i++) {
      const r = values[i];
      if ((r[idxId]||'').toString().trim() === id.toString().trim()) {
        const rowNumber = ctx.startRow + i;
        const nowStr = nowString_();
        
        // Marca como concluída e registra quem fez a ação
        ctx.sheet.getRange(rowNumber, idxStat + 1).setValue('Concluida');
        ctx.sheet.getRange(rowNumber, idxAtuU + 1).setValue(uid || '');
        ctx.sheet.getRange(rowNumber, idxAtuE + 1).setValue(nowStr);
        
        const users = getUsersMapReadOnly_();
        return { ok:true, status: 'concluida', atualizadoPorNome: users[(uid||'').toString().trim()]?.nome || '' };
      }
    }
    return { ok:false, error:'Atividade não encontrada.' };
  } catch (err) {
    return { ok:false, error:'Erro completeActivity: ' + (err && err.message ? err.message : err) };
  }
}

function createActivity(payload, uidCriador) {
  try {
    const titulo = (payload && payload.titulo || '').toString().trim();
    const descricao = (payload && payload.descricao || '').toString().trim();
    const data = (payload && payload.data || '').toString().trim();
    const atribuido_uid = (payload && payload.atribuido_uid || '').toString().trim();
    // Compatibilidade: aceita tanto campo novo quanto antigo
    const categorias_ids = (payload && (payload.categorias_ids || payload.categoria_atividade_id) || '').toString().trim();
    const tags = (payload && payload.tags || '').toString().trim(); // Tags livres

    if (!titulo) return { ok:false, error:'Informe um título.' };

    // Validar múltiplas categorias se informadas
    if (categorias_ids) {
      const validationResult = CategoriaManager.validateMultipleCategorias(categorias_ids);
      if (!validationResult.isValid) {
        return { ok:false, error: validationResult.error };
      }
    }

    const ctx = getActivitiesCtx_();

    // Lê base para saber cabeçalho e IDs existentes
    const all = getFullTableValues_(ctx);
    if (!all || !all.length) return { ok:false, error:'Estrutura da tabela de atividades não encontrada.' };

    const header = all[0].map(h => (h||'').toString().trim().toLowerCase());
    const idxId   = header.indexOf('id');
    const idxTit  = header.indexOf('titulo');
    const idxDesc = header.indexOf('descricao');
    const idxData = header.indexOf('data');
    const idxStat = header.indexOf('status');
    const idxAtuU = header.indexOf('atualizado_uid');
    const idxCri  = header.indexOf('criado_em');
    const idxAtuE = header.indexOf('atualizado_em');
    const idxAtrU = header.indexOf('atribuido_uid');
    const idxCategorias = header.indexOf('categorias_ids'); // NOVO: múltiplas categorias
    const idxTags = header.indexOf('tags'); // NOVO: tags livres

    if ([idxId,idxTit,idxDesc,idxData,idxStat,idxAtuU,idxCri,idxAtuE,idxAtrU].some(i => i < 0)) {
      return { ok:false, error:'Cabeçalho da aba Atividades está diferente do esperado. Certifique-se de que há as colunas: id, titulo, descricao, data, status, atualizado_uid, criado_em, atualizado_em, atribuido_uid, categorias_ids, tags' };
    }

    const ids = all.slice(1).map(r => (r[idxId]||'').toString());
    const nextId = generateSequentialId_('ACT-', ids, 4);

    const nowStr = nowString_();
    const rowArray = [];
    rowArray[idxId]   = nextId;
    rowArray[idxTit]  = titulo;
    rowArray[idxDesc] = descricao;
    rowArray[idxData] = data || '';
    rowArray[idxStat] = 'Pendente';
    rowArray[idxAtuU] = ''; // VAZIO na criação
    rowArray[idxCri]  = nowStr;
    rowArray[idxAtuE] = ''; // VAZIO na criação
    rowArray[idxAtrU] = atribuido_uid || (uidCriador || '');
    if (idxCategorias >= 0) rowArray[idxCategorias] = categorias_ids || ''; // NOVO: múltiplas categorias
    if (idxTags >= 0) rowArray[idxTags] = tags || ''; // NOVO: tags livres

    // Próxima linha após a última linha usada na aba
    const targetRow = ctx.sheet.getLastRow() + 1;
    ctx.sheet.getRange(targetRow, ctx.startCol, 1, header.length).setValues([rowArray]);

    return { ok:true, id: nextId };
  } catch (err) {
    return { ok:false, error:'Erro createActivity: ' + (err && err.message ? err.message : err) };
  }
}

/** Core da listagem (usado pela API pública) */
function _listActivitiesCore() {
  console.log('🔄 _listActivitiesCore INICIADA');
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

  const users = getUsersMapReadOnly_();
  const categoriasAtividades = getCategoriasAtividadesMapReadOnly_(); // NOVO

  // DEBUG: Verificar dados das categorias
  console.log('🔍 DEBUG categoriasAtividades map:', JSON.stringify(categoriasAtividades, null, 2));
  console.log('🔍 DEBUG categoriasAtividades keys:', Object.keys(categoriasAtividades));

  items.forEach(it => {
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

    // Adicionar contadores de participação usando função existente
    try {
      console.log('🔄 Tentando carregar stats para atividade:', it.id);

      // TEMPORÁRIO: Verificar se função existe
      if (typeof getParticipacaoStats !== 'function') {
        console.error('❌ getParticipacaoStats não é uma função!');
        it.total_alvos = 999; // Valor de teste para identificar o problema
        it.confirmados = 888;
        it.rejeitados = 777;
        it.participantes = 666;
        it.ausentes = 555;
      } else {
        const statsResult = getParticipacaoStats(it.id);
        console.log('📊 Stats resultado para', it.id, ':', JSON.stringify(statsResult));

        if (statsResult && statsResult.ok && statsResult.stats) {
          const stats = statsResult.stats;
          it.total_alvos = stats.total || 0;
          it.confirmados = stats.confirmados || 0;
          it.rejeitados = stats.recusados || 0;  // recusados no backend = rejeitados no frontend
          it.participantes = stats.participaram || 0;
          it.ausentes = stats.ausentes || 0;
          console.log('✅ Contadores definidos para', it.id, '- Total:', it.total_alvos, 'Confirmados:', it.confirmados);
        } else {
          // Fallback para zeros se não conseguir calcular
          console.log('⚠️ Usando fallback de zeros para atividade', it.id, '- Resultado completo:', statsResult);
          it.total_alvos = 0;
          it.confirmados = 0;
          it.rejeitados = 0;
          it.participantes = 0;
          it.ausentes = 0;
        }
      }
    } catch (error) {
      console.error('❌ ERRO ao carregar stats para', it.id, ':', error);
      // Fallback em caso de erro
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

  // Ordenação: pendentes primeiro; depois por data crescente
  items.sort((a,b) => {
    const sA = (a.status||'').toString().toLowerCase();
    const sB = (b.status||'').toString().toLowerCase();
    if (sA !== sB) return sA === 'pendente' ? -1 : 1;
    return new Date(a.data||'2100-01-01') - new Date(b.data||'2100-01-01');
  });

  return { ok:true, items };
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

/** Lê a tabela 'usuarios' via Tabela Planilhas e devolve um mapa */
function getUsersMapReadOnly_() {
  try {
    const { values, headerIndex } = readTableByNome_('usuarios');
    if (!values || values.length < 2) return {};

    const cUid   = headerIndex['uid'];
    const cNome  = headerIndex['nome'];
    const cLogin = headerIndex['login'];
    const cStat  = headerIndex['status'];

    const map = {};
    for (let r = 1; r < values.length; r++) {
      const row = values[r] || [];

      // aceita Ativo/ACTIVE/1/true/sim (ignora inativos)
      const st = (cStat != null ? String(row[cStat] || '').trim().toLowerCase() : 'ativo');
      if (['inativo','0','false','no','nao','não'].includes(st)) continue;

      const uid   = cUid   != null ? String(row[cUid]   || '').trim() : '';
      const nome  = cNome  != null ? String(row[cNome]  || '').trim() : '';
      const login = cLogin != null ? String(row[cLogin] || '').trim() : '';

      if (!uid) continue;
      map[uid] = { nome: (nome || login || uid), login: login };
    }
    return map;
  } catch (e) {
    return {};
  }
}

/**
 * Atualiza atividade por ID (PATCH parcial baseado em cabeçalho).
 */
function updateActivityWithTargets(input, uidEditor) {
  try {
    if (!input || !input.id) return { ok:false, error:'ID não informado.' };
    var patch = input.patch || {};

    // Validar categoria se for alterada
    if (patch.categorias_ids !== undefined && patch.categorias_ids !== '') {
      // Validar cada categoria na lista (separadas por vírgula)
      const categoriasArray = patch.categorias_ids.split(',').map(id => id.trim()).filter(id => id);
      for (const catId of categoriasArray) {
        const catValida = validateCategoriaAtividade_(catId);
        if (!catValida) {
          return { ok:false, error:'Categoria de atividade inválida: ' + catId };
        }
      }
    }

    var ctx = getActivitiesCtx_();
    var values = getFullTableValues_(ctx);
    if (!values || !values.length) return { ok:false, error:'Tabela vazia.' };

    var header = values[0].map(function(h){ return (h||'').toString().trim().toLowerCase(); });
    var idx = {};
    header.forEach(function(h,i){ idx[h]=i; });

    if (idx['id'] == null) return { ok:false, error:'Cabeçalho sem coluna id.' };

    // encontra linha (1-based include header)
    var rowIndex = -1;
    for (var i=1;i<values.length;i++){
      var r = values[i];
      if ((r[idx['id']]||'').toString().trim() === input.id.toString().trim()) { rowIndex = i; break; }
    }
    if (rowIndex === -1) return { ok:false, error:'Atividade não encontrada.' };

    var sh = ctx.sheet;
    var rowNumber = ctx.startRow + rowIndex; // posição real na planilha

    function setIfPresent(colName, value){
      var c = idx[colName];
      if (c == null) return;
      sh.getRange(rowNumber, c+1).setValue(value);
    }

    if (patch.titulo != null)        setIfPresent('titulo', patch.titulo);
    if (patch.descricao != null)     setIfPresent('descricao', patch.descricao);
    if (patch.data != null)          setIfPresent('data', patch.data);
    if (patch.atribuido_uid != null) setIfPresent('atribuido_uid', patch.atribuido_uid);
    if (patch.categorias_ids != null) setIfPresent('categorias_ids', patch.categorias_ids); // NOVO

    // SEMPRE preenche os campos de auditoria quando há alteração
    var now = nowString_ ? nowString_() : (new Date()).toISOString();
    setIfPresent('atualizado_em', now);
    if (uidEditor) setIfPresent('atualizado_uid', uidEditor);

    // Salvar alvos se fornecidos
    if (input.alvos && Array.isArray(input.alvos)) {
      console.log('🎯 Salvando alvos para atividade:', input.id, 'Alvos:', input.alvos);
      try {
        var resultAlvos = saveTargetsDirectly(input.id, input.alvos, uidEditor);
        if (!resultAlvos.ok) {
          console.error('❌ Erro ao salvar alvos:', resultAlvos.error);
          return { ok:false, error:'Erro ao salvar alvos: ' + resultAlvos.error };
        }
        console.log('✅ Alvos salvos com sucesso');
      } catch(e) {
        console.error('❌ Exceção ao salvar alvos:', e);
        return { ok:false, error:'Exceção ao salvar alvos: ' + e.toString() };
      }
    }

    // retorna nome de quem atualizou (se possível)
    var atualizadoPorNome = '';
    try {
      var users = getUsersMapReadOnly_ && getUsersMapReadOnly_();
      if (users && uidEditor && users[uidEditor] && users[uidEditor].nome) atualizadoPorNome = users[uidEditor].nome;
    } catch(e){}

    return { ok:true, atualizadoPorNome: atualizadoPorNome };
  } catch (err) {
    return { ok:false, error:'Erro updateActivity: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Retorna uma única atividade por ID, com os mesmos campos de listActivitiesApi().
 */
function getActivityById(id) {
  try {
    if (!id) return { ok:false, error:'ID não informado.' };
    var res = _listActivitiesCore();
    if (!res || !res.ok) return { ok:false, error: (res && res.error) || 'Falha ao listar.' };
    var items = res.items || [];
    for (var i=0;i<items.length;i++){
      var it = items[i];
      if ((it.id||'').toString() === id.toString()) {
        return { ok:true, item: it };
      }
    }
    return { ok:false, error:'Atividade não encontrada.' };
  } catch (err) {
    return { ok:false, error:'Erro getActivityById: ' + (err && err.message ? err.message : err) };
  }
}


