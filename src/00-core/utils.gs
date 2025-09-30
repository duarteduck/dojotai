/** =========================================================================
 *  utils_v2.gs — Config dinâmico via aba "Planilhas"
 *  Usa somente colunas: nome, ssid, planilha, named_range, range_a1, status
 * ========================================================================= */

const APP = {
  TZ: 'America/Sao_Paulo',
  TS_FORMAT: 'yyyy-MM-dd HH:mm:ss',

  // A tabela "Planilhas" no Google Sheets (SSID específico para standalone):
  PLANILHAS_SSID: '1hfl-CeO6nK4FLYl4uacK5NncBoJ3q-8PPzUWh7W6PmY',

  // Você criou este named range (singular):
  PLANILHAS_NAMED: 'PLANILHA_TBL',

  // Fallback caso não exista o named range acima:
  PLANILHAS_A1: 'Planilhas!A1:H'
};

// Cache em memória do ciclo de execução
let __planilhasCache = null;

/** Lê a tabela Planilhas (somente linhas ativas) */
function getPlanilhas_() {
  if (__planilhasCache) return __planilhasCache;

  // tenta usar o named range; se não existir, cai no A1 informado
  let keyToUse = null;
  if (APP.PLANILHAS_NAMED && /^[A-Za-z0-9_]+$/.test(APP.PLANILHAS_NAMED)) {
    try {
      const ss = SpreadsheetApp.openById(APP.PLANILHAS_SSID);
      const testRange = ss.getRangeByName(APP.PLANILHAS_NAMED);
      if (testRange) keyToUse = APP.PLANILHAS_NAMED;
    } catch (e) { /* ignora e usa fallback */ }
  }
  if (!keyToUse) keyToUse = APP.PLANILHAS_A1;

  const { values, headerIndex } = readNamedTable_(APP.PLANILHAS_SSID, keyToUse);
  if (!values || values.length === 0) {
    throw new Error('Tabela "Planilhas" vazia ou inválida.');
  }

  const idx = (k) => headerIndex[k];
  if (idx('nome') == null || idx('ssid') == null || idx('status') == null) {
    throw new Error('Tabela "Planilhas" precisa ter colunas: nome, ssid, status.');
  }

  const list = [];
  for (let r = 1; r < values.length; r++) {
    const row = values[r] || [];

    // status flexível: "Ativo", "ACTIVE", "1", "true", "sim"
    const statusRaw = String(row[idx('status')] || '').trim().toLowerCase();
    const isActive = ['ativo', 'active', '1', 'true', 'sim'].includes(statusRaw);
    if (!isActive) continue;

    const nome        = String(row[idx('nome')] || '').trim();
    const ssid        = String(row[idx('ssid')] || '').trim();
    const planilha    = idx('planilha')    != null ? String(row[idx('planilha')]||'').trim()    : '';
    const named_range = idx('named_range') != null ? String(row[idx('named_range')]||'').trim() : '';
    const range_a1    = idx('range_a1')    != null ? String(row[idx('range_a1')]||'').trim()    : '';

    if (!nome) continue;
    list.push({
      nomeKey: nome.toLowerCase(), // normaliza para busca case-insensitive
      nome, ssid, planilha, named_range, range_a1
    });
  }

  __planilhasCache = list;
  return __planilhasCache;
}

/** Busca uma entrada por "nome" (ex.: 'usuarios', 'atividades'), sem sensibilidade a maiúsculas */
function getPlanRef_(nome) {
  const key = String(nome || '').trim().toLowerCase();
  const rec = getPlanilhas_().find(x => x.nomeKey === key);
  if (!rec) throw new Error(`"Planilhas": entrada "${nome}" não encontrada ou Inativa.`);
  return rec;
}

/** Monta contexto com prioridade para named_range; senão usa planilha!range_a1 */
function getContextFromRef_(ref) {
  const file = SpreadsheetApp.openById(ref.ssid);

  if (ref.named_range) {
    const range = file.getRangeByName(ref.named_range);
    if (!range) throw new Error(`Named range "${ref.named_range}" não encontrado para "${ref.nome}".`);
    return { file, sheet: range.getSheet(), rangeStr: null, namedRange: ref.named_range };
  }

  if (!ref.planilha || !ref.range_a1) {
    throw new Error(`"${ref.nome}": informe named_range ou (planilha + range_a1).`);
  }

  const sheet = file.getSheetByName(ref.planilha);
  if (!sheet) throw new Error(`Aba "${ref.planilha}" não encontrada (nome="${ref.nome}").`);

  return { file, sheet, rangeStr: `${ref.planilha}!${ref.range_a1}`, namedRange: null };
}

/** Lê uma tabela onde a 1ª linha é cabeçalho; retorna { values, headerIndex, ctx } */
function readNamedTable_(ssidOrActive, namedOrA1) {
  const ss = SpreadsheetApp.openById(ssidOrActive);

  let range;
  if (namedOrA1 && !String(namedOrA1).includes('!') && /^[A-Za-z0-9_]+$/.test(namedOrA1)) {
    range = ss.getRangeByName(namedOrA1);
    if (!range) throw new Error(`Named range "${namedOrA1}" não encontrado no arquivo alvo.`);
  } else {
    try {
      range = ss.getRange(String(namedOrA1));
    } catch (e) {
      throw new Error(`Range A1 "${namedOrA1}" inválido: ${e && e.message}`);
    }
  }

  const values = range.getValues();
  const header = values[0] || [];
  const headerIndex = {};
  header.forEach((h, i) => {
    const key = String(h || '').toLowerCase().trim();
    if (key) headerIndex[key] = i;
  });
  return { values, headerIndex, ctx: { ss, range, sheet: range.getSheet() } };
}

/** ---------- Cortes de linhas vazias ---------- */

/** Remove linhas vazias no final (mantém até a última com algum valor) */
function trimTrailingEmptyRows_(values) {
  if (!values || !values.length) return values || [];
  let last = values.length - 1;
  outer: for (; last >= 0; last--) {
    const row = values[last] || [];
    for (let c = 0; c < row.length; c++) {
      const v = row[c];
      if (!(v === '' || v === null || typeof v === 'undefined')) {
        break outer; // achou conteúdo
      }
    }
  }
  return values.slice(0, last + 1);
}

/** Corta cauda com base em uma coluna-chave (ex.: 'id' ou 'titulo') */
function trimByKeyColumn_(values, headerIndex, keyField) {
  if (!values || values.length < 2) return values || [];
  const c = headerIndex[keyField];
  if (c == null) return values; // sem a coluna, mantém

  let last = values.length - 1;
  for (; last >= 1; last--) { // preserva o cabeçalho na linha 0
    const v = values[last] && values[last][c];
    const empty = (v === '' || v === null || typeof v === 'undefined');
    if (!empty) break; // achou a última com a chave preenchida
  }
  return values.slice(0, last + 1);
}

/** Acesso rápido por "nome" + corte de cauda antes de retornar */
function readTableByNome_(nome) {
  const ref = getPlanRef_(nome);
  const ctx = getContextFromRef_(ref);
  const resp = ctx.namedRange
    ? readNamedTable_(ref.ssid, ctx.namedRange)
    : readNamedTable_(ref.ssid, ctx.rangeStr);

  // 1) corta cauda vazia genérica
  resp.values = trimTrailingEmptyRows_(resp.values);
  // 2) refina com coluna-chave quando fizer sentido (atividades costuma ter 'id')
  resp.values = trimByKeyColumn_(resp.values, resp.headerIndex, 'id');

  return resp;
}

/** Utils gerais */
function nowString_() {
  return Utilities.formatDate(new Date(), APP.TZ, APP.TS_FORMAT);
}

function generateSequentialId_(prefix, existingIds, minDigits) {
  let max = 0;
  (existingIds || []).forEach(id => {
    const s = String(id || '');
    if (!s.startsWith(prefix)) return;
    const m = s.slice(prefix.length).match(/^\d+$/);
    if (m) max = Math.max(max, parseInt(m[0], 10));
  });
  return prefix + String(max + 1).padStart(minDigits || 3, '0');
}

function findRowById_(values, headerIndex, idField, idValue) {
  const c = headerIndex[idField];
  if (c == null) throw new Error(`Campo "${idField}" não encontrado no cabeçalho.`);
  for (let r = 1; r < values.length; r++) {
    if (String(values[r][c]) === String(idValue)) return r + 1; // 1-based
  }
  return -1;
}