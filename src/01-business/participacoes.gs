// participacoes.gs - Sistema de Gestão de Participações em Atividades

/**
 * Lista participações usando acesso direto à planilha
 */
function listParticipacoes(activityId) {
  var ssid = '1IAR4_Y3-F5Ca2ZfBF7Z3gzC6u6ut-yQsfGtTasmmQHw';

  try {
    var ss = SpreadsheetApp.openById(ssid);
    var sheet = ss.getSheetByName('Participacoes');
    var range = sheet.getRange('A1:O1000');
    var values = range.getValues();

    if (!values || values.length < 2) {
      return { ok: true, items: [] };
    }

    var items = [];
    for (var i = 1; i < values.length; i++) {
      var row = values[i];
      if (!row[0]) break;

      var idAtividade = String(row[1] || '').trim();
      var deleted = String(row[14] || '').trim().toLowerCase();

      if (idAtividade === String(activityId).trim() && deleted !== 'x') {
        items.push({
          id: String(row[0] || '').trim(),
          id_atividade: idAtividade,
          id_membro: String(row[2] || '').trim(),
          tipo: String(row[3] || '').trim(),
          confirmou: String(row[4] || '').trim(),
          participou: String(row[6] || '').trim(),
          chegou_tarde: String(row[7] || '').trim(),
          saiu_cedo: String(row[8] || '').trim(),
          observacoes: String(row[11] || '').trim()
        });
      }
    }

    return { ok: true, items: items };

  } catch (error) {
    return { ok: false, error: 'Erro: ' + error.message };
  }
}

/**
 * Calcula o status de participação baseado nas regras
 */
function calculateStatusParticipacao(participacao) {
  if (participacao.participou === 'nao') {
    return participacao.justificativa ? 'ausente_justificado' : 'ausente';
  }

  if (participacao.participou === 'sim') {
    if (participacao.chegou_tarde === 'sim' && participacao.saiu_cedo === 'sim') {
      return 'chegou_tarde_saiu_cedo';
    }
    if (participacao.chegou_tarde === 'sim') {
      return 'chegou_tarde';
    }
    if (participacao.saiu_cedo === 'sim') {
      return 'saiu_cedo';
    }
    return 'presente_completo';
  }

  return 'pendente';
}

/**
 * Define alvos para uma atividade
 * @param {string} activityId - ID da atividade
 * @param {Array} memberIds - Array de IDs dos membros
 * @param {string} uid - UID do usuário que está definindo
 * @returns {Object} { ok: boolean, created: number }
 */
function defineTargets(activityId, memberIds, uid) {
  try {
    if (!activityId || !memberIds || !Array.isArray(memberIds)) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    const ctx = getParticipacaesCtx_();
    if (!ctx) {
      return { ok: false, error: 'Contexto de participações não encontrado.' };
    }

    // Verifica duplicatas existentes
    const existing = listParticipacoes(activityId);
    if (!existing.ok) return existing;

    const existingMemberIds = existing.items.map(p => p.id_membro);
    const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id));

    if (newMemberIds.length === 0) {
      return { ok: true, created: 0, message: 'Todos os membros já estão na lista.' };
    }

    const nowStr = nowString_();
    const rowsToAdd = [];

    newMemberIds.forEach(memberId => {
      const newId = generateParticipacaoId_();
      rowsToAdd.push([
        newId,                    // id
        activityId,               // id_atividade
        memberId,                 // id_membro
        'alvo',                   // tipo
        '',                       // confirmou
        '',                       // confirmado_em
        '',                       // participou
        '',                       // chegou_tarde
        '',                       // saiu_cedo
        '',                       // justificativa
        '',                       // observacoes
        nowStr,                   // marcado_em
        uid || ''                 // marcado_por
      ]);
    });

    // Adiciona as linhas
    if (rowsToAdd.length > 0) {
      const lastRow = ctx.sheet.getLastRow();
      const range = ctx.sheet.getRange(lastRow + 1, ctx.startCol, rowsToAdd.length, rowsToAdd[0].length);
      range.setValues(rowsToAdd);
    }

    return { ok: true, created: rowsToAdd.length };
  } catch (err) {
    return { ok: false, error: 'Erro defineTargets: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Marca participação de um membro
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {Object} dados - Dados da participação
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function markParticipacao(activityId, memberId, dados, uid) {
  try {
    if (!activityId || !memberId || !dados) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    const ctx = getParticipacaesCtx_();
    const values = getFullTableValues_(ctx);

    if (!values || !values.length) {
      return { ok: false, error: 'Tabela de participações vazia.' };
    }

    const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
    const idxIdAtiv = header.indexOf('id_atividade');
    const idxIdMembro = header.indexOf('id_membro');
    const idxParticipou = header.indexOf('participou');
    const idxChegouTarde = header.indexOf('chegou_tarde');
    const idxSaiuCedo = header.indexOf('saiu_cedo');
    const idxJustificativa = header.indexOf('justificativa');
    const idxObservacoes = header.indexOf('observacoes');
    const idxMarcadoEm = header.indexOf('marcado_em');
    const idxMarcadoPor = header.indexOf('marcado_por');

    // Encontra a linha da participação
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[idxIdAtiv] == activityId && row[idxIdMembro] == memberId) {
        const rowNumber = ctx.startRow + i;
        const nowStr = nowString_();

        // Atualiza os dados
        ctx.sheet.getRange(rowNumber, idxParticipou + 1).setValue(dados.participou || '');

        // Se não participou, limpa chegou_tarde e saiu_cedo
        if (dados.participou === 'nao') {
          ctx.sheet.getRange(rowNumber, idxChegouTarde + 1).setValue('');
          ctx.sheet.getRange(rowNumber, idxSaiuCedo + 1).setValue('');
        } else {
          ctx.sheet.getRange(rowNumber, idxChegouTarde + 1).setValue(dados.chegou_tarde || '');
          ctx.sheet.getRange(rowNumber, idxSaiuCedo + 1).setValue(dados.saiu_cedo || '');
        }

        ctx.sheet.getRange(rowNumber, idxJustificativa + 1).setValue(dados.justificativa || '');
        ctx.sheet.getRange(rowNumber, idxObservacoes + 1).setValue(dados.observacoes || '');
        ctx.sheet.getRange(rowNumber, idxMarcadoEm + 1).setValue(nowStr);
        ctx.sheet.getRange(rowNumber, idxMarcadoPor + 1).setValue(uid || '');

        return { ok: true };
      }
    }

    return { ok: false, error: 'Participação não encontrada.' };
  } catch (err) {
    return { ok: false, error: 'Erro markParticipacao: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Confirma participação do próprio membro
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {string} confirmou - 'sim' ou 'nao'
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function confirmarParticipacao(activityId, memberId, confirmou, uid) {
  try {
    if (!activityId || !memberId || !confirmou) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    const ctx = getParticipacaesCtx_();
    const values = getFullTableValues_(ctx);

    if (!values || !values.length) {
      return { ok: false, error: 'Tabela de participações vazia.' };
    }

    const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
    const idxIdAtiv = header.indexOf('id_atividade');
    const idxIdMembro = header.indexOf('id_membro');
    const idxConfirmou = header.indexOf('confirmou');
    const idxConfirmadoEm = header.indexOf('confirmado_em');

    // Encontra a linha da participação
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      if (row[idxIdAtiv] == activityId && row[idxIdMembro] == memberId) {
        const rowNumber = ctx.startRow + i;
        const nowStr = nowString_();

        ctx.sheet.getRange(rowNumber, idxConfirmou + 1).setValue(confirmou);
        ctx.sheet.getRange(rowNumber, idxConfirmadoEm + 1).setValue(nowStr);

        return { ok: true };
      }
    }

    return { ok: false, error: 'Participação não encontrada.' };
  } catch (err) {
    return { ok: false, error: 'Erro confirmarParticipacao: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Busca membros por critérios para definição de alvos
 * @param {Object} filters - Filtros aplicados
 * @returns {Object} { ok: boolean, items: Array }
 */
function searchMembersByCriteria(filters) {
  try {
    // Usar DatabaseManager para buscar membros
    const members = DatabaseManager.query('membros', {}, false);

    if (!members || members.length === 0) {
      return { ok: true, items: [] };
    }

    // Aplicar filtros se fornecidos
    let filteredMembers = members;

    // Filtro por dojo
    if (filters.dojo && filters.dojo.trim()) {
      filteredMembers = filteredMembers.filter(member => {
        const memberDojo = (member.dojo || '').toString().toLowerCase();
        const filterDojo = filters.dojo.toLowerCase();
        return memberDojo.includes(filterDojo) || memberDojo === filterDojo;
      });
    }

    // Filtro por status
    if (filters.status && filters.status.trim()) {
      filteredMembers = filteredMembers.filter(member => {
        const memberStatus = (member.status || '').toString().toLowerCase();
        const filterStatus = filters.status.toLowerCase();
        return memberStatus === filterStatus;
      });
    }

    // Filtro por nome
    if (filters.nome && filters.nome.trim()) {
      const nomeFiltro = filters.nome.toLowerCase().trim();
      filteredMembers = filteredMembers.filter(member => {
        const memberNome = (member.nome || '').toString().toLowerCase();
        return memberNome.includes(nomeFiltro);
      });
    }

    // Otimizar dados: retornar apenas campos necessários
    const optimizedMembers = filteredMembers.map(member => ({
      codigo_sequencial: member.codigo_sequencial,
      nome: member.nome,
      dojo: member.dojo,
      status: member.status
    }));

    const result = { ok: true, items: optimizedMembers };
    return result;
  } catch (err) {
    return { ok: false, error: 'Erro searchMembersByCriteria: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Obtém estatísticas de participação de uma atividade
 * @param {string} activityId - ID da atividade
 * @returns {Object} { ok: boolean, stats: Object }
 */
function getParticipacaoStats(activityId) {
  try {
    const participacoes = listParticipacoes(activityId);

    if (!participacoes.ok) {
      return participacoes;
    }

    const total = participacoes.items.length;
    const confirmados = participacoes.items.filter(p => p.confirmou === 'sim').length;
    const recusados = participacoes.items.filter(p => p.confirmou === 'nao').length;
    const participaram = participacoes.items.filter(p => p.participou === 'sim').length;
    const ausentes = participacoes.items.filter(p => p.participou === 'nao').length;
    const pendentes = participacoes.items.filter(p => !p.participou).length;

    const percentualParticipacao = total > 0 ? Math.round((participaram / total) * 100) : 0;

    const stats = {
      total,
      confirmados,
      recusados,
      participaram,
      ausentes,
      pendentes,
      percentualParticipacao
    };

    return {
      ok: true,
      stats: stats
    };
  } catch (err) {
    return { ok: false, error: 'Erro getParticipacaoStats: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Adiciona membro extra (não estava nos alvos originais)
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function addExtraMember(activityId, memberId, uid) {
  try {
    if (!activityId || !memberId) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    // Verifica se já existe
    const existing = listParticipacoes(activityId);
    if (!existing.ok) return existing;

    const exists = existing.items.find(p => p.id_membro === memberId);
    if (exists) {
      return { ok: false, error: 'Membro já está na lista de participações.' };
    }

    return defineTargets(activityId, [memberId], uid);
  } catch (err) {
    return { ok: false, error: 'Erro addExtraMember: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Função alternativa para salvar alvos diretamente na planilha
 * Similar ao padrão usado em activities.gs - não depende do contexto
 * @param {string} activityId - ID da atividade
 * @param {Array} memberIds - Array de IDs dos membros
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean, created: number }
 */
function saveTargetsDirectly(activityId, memberIds, uid) {
  try {
    if (!activityId || !memberIds || !Array.isArray(memberIds)) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    // Usa o mesmo padrão de acesso que activities.gs
    const { values, headerIndex, ctx } = readTableByNome_('participacoes');

    if (!values || values.length === 0) {
      return { ok: false, error: 'Tabela "participacoes" não encontrada ou vazia.' };
    }

    // Campos obrigatórios conforme o padrão existente
    const required = ['id', 'id_atividade', 'id_membro', 'tipo'];
    const missing = required.filter(k => headerIndex[k] === undefined);
    if (missing.length) {
      return { ok: false, error: 'Colunas faltando na tabela Participacoes: ' + missing.join(', ') };
    }

    // Verifica alvos existentes e identifica mudanças
    const existingTargets = [];
    const existingMemberIds = [];

    for (let r = 1; r < values.length; r++) {
      const row = values[r] || [];
      const rowActivityId = String(row[headerIndex['id_atividade']] || '').trim();
      if (rowActivityId === activityId.toString().trim()) {
        const memberId = String(row[headerIndex['id_membro']] || '').trim();
        const tipo = String(row[headerIndex['tipo']] || '').trim();
        const status = String(row[headerIndex['status_participacao']] || '').trim().toLowerCase();

        // Só considerar alvos ativos (não deletados - campo 'deleted' vazio)
        const deleted = String(row[headerIndex['deleted']] || '').trim().toLowerCase();
        if (tipo === 'alvo' && deleted !== 'x') {
          existingMemberIds.push(memberId);
          existingTargets.push({
            rowIndex: r,
            memberId: memberId,
            id: String(row[headerIndex['id']] || '').trim()
          });
        }
      }
    }

    const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id.toString()));
    const removedTargets = existingTargets.filter(target => !memberIds.includes(target.memberId));

    // Se não há mudanças, retornar
    if (newMemberIds.length === 0 && removedTargets.length === 0) {
      return { ok: true, created: 0, deleted: 0, message: 'Nenhuma alteração necessária nos alvos.' };
    }

    // Marcar alvos removidos como 'deleted'
    if (removedTargets.length > 0) {
      // Usar o contexto já obtido de readTableByNome_
      const sheet = ctx.sheet;

      // Marcar como deleted (usar campo 'deleted' com valor 'x')
      const deletedColIndex = headerIndex['deleted'] + 1; // +1 para índice baseado em 1
      const nowStr = nowString_();

      if (deletedColIndex === 0) {
        return { ok: false, error: 'Campo "deleted" não encontrado na tabela participações' };
      }

      removedTargets.forEach(target => {
        // rowIndex é baseado no array values (0=header, 1=primeira linha de dados, etc.)
        // Precisa usar ctx.range.getRow() para obter a posição inicial da planilha
        const startRow = ctx.range.getRow();
        const sheetRowNumber = startRow + target.rowIndex;

        if (target.rowIndex > 0 && sheetRowNumber > startRow) { // Garantir que não é o cabeçalho
          sheet.getRange(sheetRowNumber, deletedColIndex).setValue('x');
        }
      });

    }

    // Gera novos IDs seguindo o padrão
    let maxId = 0;
    for (let r = 1; r < values.length; r++) {
      const row = values[r] || [];
      const id = String(row[headerIndex['id']] || '');
      const match = id.match(/^PART-(\d+)$/);
      if (match) {
        maxId = Math.max(maxId, parseInt(match[1], 10));
      }
    }

    const nowStr = nowString_();
    const rowsToAdd = [];

    newMemberIds.forEach((memberId, index) => {
      const newId = `PART-${String(maxId + index + 1).padStart(4, '0')}`;
      const rowArray = new Array(Object.keys(headerIndex).length);

      rowArray[headerIndex['id']] = newId;
      rowArray[headerIndex['id_atividade']] = activityId;
      rowArray[headerIndex['id_membro']] = memberId;
      rowArray[headerIndex['tipo']] = 'alvo';
      rowArray[headerIndex['confirmou']] = '';
      rowArray[headerIndex['confirmado_em']] = '';
      rowArray[headerIndex['participou']] = '';
      rowArray[headerIndex['chegou_tarde']] = '';
      rowArray[headerIndex['saiu_cedo']] = '';
      rowArray[headerIndex['justificativa']] = '';
      rowArray[headerIndex['observacoes']] = '';
      rowArray[headerIndex['marcado_em']] = '';
      rowArray[headerIndex['marcado_por']] = '';

      rowsToAdd.push(rowArray);
    });

    // Usa o contexto da tabela para escrita, igual ao activities.gs
    const ref = getPlanRef_('participacoes');
    const ctxPlan = getContextFromRef_(ref);

    let sheet;
    if (ctxPlan.namedRange) {
      const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
        ? SpreadsheetApp.openById(ref.ssid)
        : SpreadsheetApp.getActiveSpreadsheet();

      try {
        const rng = ss.getRangeByName(ctxPlan.namedRange);
        sheet = rng.getSheet();
      } catch (e) {
        return { ok: false, error: 'Erro ao acessar named range: ' + e.message };
      }
    } else {
      const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
        ? SpreadsheetApp.openById(ref.ssid)
        : SpreadsheetApp.getActiveSpreadsheet();

      // Tenta o nome configurado primeiro, depois variações
      const sheetNames = [
        ctxPlan.planilha,
        'participacoes',
        'Participacoes',
        'participações',
        'Participações'
      ];

      for (const name of sheetNames) {
        sheet = ss.getSheetByName(name);
        if (sheet) break;
      }
    }

    if (!sheet) {
      return { ok: false, error: 'Aba de participações não encontrada na planilha de destino.' };
    }

    // Adiciona as novas linhas no final da planilha
    const currentLastRow = sheet.getLastRow();
    const startRow = currentLastRow + 1;

    if (rowsToAdd.length > 0) {
      sheet.getRange(startRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
    }

    return {
      ok: true,
      created: newMemberIds.length,
      deleted: removedTargets ? removedTargets.length : 0,
      message: `Alvos atualizados: ${newMemberIds.length} adicionados, ${removedTargets ? removedTargets.length : 0} removidos`
    };

  } catch (err) {
    return { ok: false, error: 'Erro saveTargetsDirectly: ' + (err && err.message ? err.message : err) };
  }
}

/**
 * Função alternativa para salvar participação diretamente na planilha
 * @param {string} activityId - ID da atividade
 * @param {string} memberId - ID do membro
 * @param {Object} dados - Dados da participação
 * @param {string} uid - UID do usuário
 * @returns {Object} { ok: boolean }
 */
function saveParticipacaoDirectly(activityId, memberId, dados, uid) {
  try {
    if (!activityId || !memberId || !dados) {
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    // Usa o mesmo padrão de acesso que a função de alvos
    const { values, headerIndex } = readTableByNome_('participacoes');

    if (!values || values.length === 0) {
      return { ok: false, error: 'Tabela "participacoes" não encontrada.' };
    }

    // Campos obrigatórios
    const required = ['id', 'id_atividade', 'id_membro'];
    const missing = required.filter(k => headerIndex[k] === undefined);
    if (missing.length) {
      return { ok: false, error: 'Colunas faltando na tabela Participacoes: ' + missing.join(', ') };
    }

    // Encontra a linha da participação
    let foundRowIndex = -1;
    for (let r = 1; r < values.length; r++) {
      const row = values[r] || [];
      const rowActivityId = String(row[headerIndex['id_atividade']] || '').trim();
      const rowMemberId = String(row[headerIndex['id_membro']] || '').trim();

      if (rowActivityId === activityId.toString().trim() && rowMemberId === memberId.toString()) {
        foundRowIndex = r;
        break;
      }
    }

    if (foundRowIndex === -1) {
      return { ok: false, error: 'Participação não encontrada para o membro.' };
    }

    // Usa o contexto da tabela para escrita
    const ref = getPlanRef_('participacoes');
    const ctxPlan = getContextFromRef_(ref);

    let sheet;
    if (ctxPlan.namedRange) {
      const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
        ? SpreadsheetApp.openById(ref.ssid)
        : SpreadsheetApp.getActiveSpreadsheet();
      const rng = ss.getRangeByName(ctxPlan.namedRange);
      sheet = rng.getSheet();
    } else {
      const ss = (ref.ssid && ref.ssid !== 'ACTIVE')
        ? SpreadsheetApp.openById(ref.ssid)
        : SpreadsheetApp.getActiveSpreadsheet();

      const sheetNames = [
        ctxPlan.planilha,
        'participacoes',
        'Participacoes',
        'participações',
        'Participações'
      ];

      for (const name of sheetNames) {
        sheet = ss.getSheetByName(name);
        if (sheet) break;
      }
    }

    if (!sheet) {
      return { ok: false, error: 'Aba de participações não encontrada.' };
    }

    // Atualiza os campos na linha encontrada
    const actualRowNumber = foundRowIndex + 1; // +1 porque foundRowIndex é 0-based, mas sheet rows são 1-based
    const nowStr = nowString_();

    if (headerIndex['participou'] !== undefined) {
      sheet.getRange(actualRowNumber, headerIndex['participou'] + 1).setValue(dados.participou || '');
    }
    if (headerIndex['chegou_tarde'] !== undefined) {
      sheet.getRange(actualRowNumber, headerIndex['chegou_tarde'] + 1).setValue(dados.chegou_tarde || '');
    }
    if (headerIndex['saiu_cedo'] !== undefined) {
      sheet.getRange(actualRowNumber, headerIndex['saiu_cedo'] + 1).setValue(dados.saiu_cedo || '');
    }
    if (headerIndex['observacoes'] !== undefined) {
      sheet.getRange(actualRowNumber, headerIndex['observacoes'] + 1).setValue(dados.observacoes || '');
    }
    if (headerIndex['marcado_em'] !== undefined) {
      sheet.getRange(actualRowNumber, headerIndex['marcado_em'] + 1).setValue(nowStr);
    }
    if (headerIndex['marcado_por'] !== undefined) {
      sheet.getRange(actualRowNumber, headerIndex['marcado_por'] + 1).setValue(uid || '');
    }

    return { ok: true };

  } catch (err) {
    return { ok: false, error: 'Erro saveParticipacaoDirectly: ' + (err && err.message ? err.message : err) };
  }
}

// Funções auxiliares

function getParticipacaesCtx_() {
  try {
    const ref = getPlanRef_('participacoes');
    const ctxPlan = getContextFromRef_(ref);

    // Quando for named_range (ex.: PARTICIPACOES_TBL)
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

    const sheet = ss.getSheetByName(ctxPlan.planilha);
    if (!sheet) throw new Error(`Aba "${ctxPlan.planilha}" não encontrada.`);

    return {
      sheet: sheet,
      startRow: 1,
      startCol: 1
    };
  } catch (err) {
    return null;
  }
}

function generateParticipacaoId_() {
  try {
    const ctx = getParticipacaesCtx_();
    const values = getFullTableValues_(ctx);

    if (!values || values.length < 2) {
      return 'PART-0001';
    }

    const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
    const idIdx = header.indexOf('id');

    let maxNum = 0;
    for (let i = 1; i < values.length; i++) {
      const id = String(values[i][idIdx] || '').trim();
      const match = id.match(/^PART-(\d+)$/);
      if (match) {
        maxNum = Math.max(maxNum, parseInt(match[1], 10));
      }
    }

    return 'PART-' + String(maxNum + 1).padStart(4, '0');
  } catch (err) {
    return 'PART-0001';
  }
}