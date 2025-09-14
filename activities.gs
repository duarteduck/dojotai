// activities.gs – API de atividades (atualizada para categoria_atividade_id)

function listActivitiesApi() {
  try {
    const result = _listActivitiesCore();
    // Garante objeto "serializável" para o HTMLService
    return JSON.parse(JSON.stringify(result));
  } catch (err) {
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
    const categoria_atividade_id = (payload && payload.categoria_atividade_id || '').toString().trim(); // NOVO

    if (!titulo) return { ok:false, error:'Informe um título.' };

    // Validar categoria se informada
    if (categoria_atividade_id) {
      const catValida = validateCategoriaAtividade_(categoria_atividade_id);
      if (!catValida) {
        return { ok:false, error:'Categoria de atividade inválida: ' + categoria_atividade_id };
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
    const idxCatAtiv = header.indexOf('categoria_atividade_id'); // NOVO

    if ([idxId,idxTit,idxDesc,idxData,idxStat,idxAtuU,idxCri,idxAtuE,idxAtrU].some(i => i < 0)) {
      return { ok:false, error:'Cabeçalho da aba Atividades está diferente do esperado. Certifique-se de que há as colunas: id, titulo, descricao, data, status, atualizado_uid, criado_em, atualizado_em, atribuido_uid, categoria_atividade_id' };
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
    if (idxCatAtiv >= 0) rowArray[idxCatAtiv] = categoria_atividade_id || ''; // NOVO

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
  const ctx = getActivitiesCtx_();

  // Lê do cabeçalho até a última linha usada
  const values = getFullTableValues_(ctx);
  if (!values || !values.length) return { ok:false, error:'A tabela de atividades está vazia.' };

  const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
  const needed = ['id','titulo','descricao','data','status','atualizado_uid','criado_em','atualizado_em','atribuido_uid'];
  const missing = needed.filter(k => header.indexOf(k) === -1);
  if (missing.length) return { ok:false, error:'Cabeçalho inválido. Faltam: ' + missing.join(', ') };

  const headerIndex = {}; header.forEach((name, i) => headerIndex[name] = i);

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
  const idxCatAtiv = headerIndex['categoria_atividade_id']; // NOVO

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
    
    // Adicionar categoria_atividade_id se a coluna existir
    if (idxCatAtiv >= 0) {
      item.categoria_atividade_id = r[idxCatAtiv] || '';
    }
    
    items.push(item);
  }

  const users = getUsersMapReadOnly_();
  const categoriasAtividades = getCategoriasAtividadesMapReadOnly_(); // NOVO

  items.forEach(it => {
    const atr = (it.atribuido_uid || '').toString().trim();
    const atu = (it.atualizado_uid || '').toString().trim();
    it.atribuido_nome = users[atr]?.nome || '';
    it.atualizado_nome = users[atu]?.nome || '';
    
    // Adicionar dados da categoria de atividade
    const catAtivId = (it.categoria_atividade_id || '').toString().trim();
    if (catAtivId && categoriasAtividades[catAtivId]) {
      it.categoria_atividade_nome = categoriasAtividades[catAtivId].nome;
      it.categoria_atividade_icone = categoriasAtividades[catAtivId].icone;
      it.categoria_atividade_cor = categoriasAtividades[catAtivId].cor;
    } else {
      it.categoria_atividade_nome = '';
      it.categoria_atividade_icone = '';
      it.categoria_atividade_cor = '';
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
function updateActivity(input, uidEditor) {
  try {
    if (!input || !input.id) return { ok:false, error:'ID não informado.' };
    var patch = input.patch || {};

    // Validar categoria se for alterada
    if (patch.categoria_atividade_id !== undefined && patch.categoria_atividade_id !== '') {
      const catValida = validateCategoriaAtividade_(patch.categoria_atividade_id);
      if (!catValida) {
        return { ok:false, error:'Categoria de atividade inválida: ' + patch.categoria_atividade_id };
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
    if (patch.categoria_atividade_id != null) setIfPresent('categoria_atividade_id', patch.categoria_atividade_id); // NOVO

    // SEMPRE preenche os campos de auditoria quando há alteração
    var now = nowString_ ? nowString_() : (new Date()).toISOString();
    setIfPresent('atualizado_em', now);
    if (uidEditor) setIfPresent('atualizado_uid', uidEditor);

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