// participacoes.gs - Sistema de Gestão de Participações em Atividades

/**
 * Lista todas as participações de uma atividade
 * @param {string} activityId - ID da atividade
 * @returns {Object} { ok: boolean, items: Array }
 */
function listParticipacoes(activityId) {
  try {
    if (!activityId) {
      return { ok: false, error: 'ID da atividade não informado.' };
    }

    const { values, headerIndex } = readTableByNome_('participacoes');

    if (!values || values.length < 2) {
      return { ok: true, items: [] };
    }

    // Campos obrigatórios
    const required = ['id', 'id_atividade', 'id_membro', 'tipo'];
    const missing = required.filter(k => headerIndex[k] === undefined);
    if (missing.length) {
      return { ok: false, error: 'Colunas faltando na tabela Participacoes: ' + missing.join(', ') };
    }

    const items = [];

    for (let r = 1; r < values.length; r++) {
      const row = values[r] || [];

      // Filtra apenas as participações da atividade específica
      const rowActivityId = String(row[headerIndex['id_atividade']] || '').trim();
      if (rowActivityId !== activityId.toString().trim()) continue;

      const participacao = {
        id: String(row[headerIndex['id']] || '').trim(),
        id_atividade: rowActivityId,
        id_membro: String(row[headerIndex['id_membro']] || '').trim(),
        tipo: String(row[headerIndex['tipo']] || 'alvo').trim(),
        confirmou: String(row[headerIndex['confirmou']] || '').trim(),
        confirmado_em: row[headerIndex['confirmado_em']] || null,
        participou: String(row[headerIndex['participou']] || '').trim(),
        chegou_tarde: String(row[headerIndex['chegou_tarde']] || '').trim(),
        saiu_cedo: String(row[headerIndex['saiu_cedo']] || '').trim(),
        justificativa: String(row[headerIndex['justificativa']] || '').trim(),
        observacoes: String(row[headerIndex['observacoes']] || '').trim(),
        marcado_em: row[headerIndex['marcado_em']] || null,
        marcado_por: String(row[headerIndex['marcado_por']] || '').trim()
      };

      // Calcula status_participacao
      participacao.status_participacao = calculateStatusParticipacao(participacao);

      items.push(participacao);
    }

    return { ok: true, items };
  } catch (err) {
    return { ok: false, error: 'Erro listParticipacoes: ' + (err && err.message ? err.message : err) };
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
    const membersResult = _listMembersCore();
    if (!membersResult.ok) return membersResult;

    let items = membersResult.items;

    // Aplica filtros
    if (filters.dojo && filters.dojo.length > 0) {
      items = items.filter(m => filters.dojo.includes(m.dojo));
    }

    if (filters.cargo && filters.cargo.length > 0) {
      items = items.filter(m => filters.cargo.includes(m.cargo));
    }

    if (filters.categoria_grupo && filters.categoria_grupo.length > 0) {
      items = items.filter(m => filters.categoria_grupo.includes(m.categoria_grupo));
    }

    if (filters.buntai && filters.buntai.length > 0) {
      items = items.filter(m => filters.buntai.includes(m.buntai));
    }

    if (filters.status && filters.status.length > 0) {
      items = items.filter(m => filters.status.includes(m.status));
    }

    if (filters.nome && filters.nome.trim()) {
      const nome = filters.nome.toLowerCase().trim();
      items = items.filter(m => m.nome.toLowerCase().includes(nome));
    }

    return { ok: true, items };
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
    if (!participacoes.ok) return participacoes;

    const total = participacoes.items.length;
    const confirmados = participacoes.items.filter(p => p.confirmou === 'sim').length;
    const recusados = participacoes.items.filter(p => p.confirmou === 'nao').length;
    const participaram = participacoes.items.filter(p => p.participou === 'sim').length;
    const ausentes = participacoes.items.filter(p => p.participou === 'nao').length;
    const pendentes = participacoes.items.filter(p => !p.participou).length;

    const percentualParticipacao = total > 0 ? Math.round((participaram / total) * 100) : 0;

    return {
      ok: true,
      stats: {
        total,
        confirmados,
        recusados,
        participaram,
        ausentes,
        pendentes,
        percentualParticipacao
      }
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
    console.log('🔧 saveTargetsDirectly chamada:', { activityId, memberIds, uid });

    if (!activityId || !memberIds || !Array.isArray(memberIds)) {
      console.log('❌ Parâmetros inválidos');
      return { ok: false, error: 'Parâmetros inválidos.' };
    }

    // Acesso direto à planilha, sem depender de configuração
    const spreadsheetId = '1hfl-CeO6nK4FLYl4uacK5NncBoJ3q-8PPzUWh7W6PmY';
    console.log('📋 Tentando abrir planilha:', spreadsheetId);

    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName('Participacoes');
    console.log('📋 Aba encontrada:', !!sheet);

    if (!sheet) {
      console.log('❌ Aba "Participacoes" não encontrada');
      return { ok: false, error: 'Aba "Participacoes" não encontrada na planilha.' };
    }

    // Lê os dados da planilha diretamente
    const lastRow = sheet.getLastRow();
    if (lastRow < 1) {
      return { ok: false, error: 'Planilha "Participacoes" está vazia.' };
    }

    const values = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues();
    if (!values || values.length === 0) {
      return { ok: false, error: 'Não foi possível ler dados da planilha "Participacoes".' };
    }

    // Cria headerIndex manualmente
    const header = values[0].map(h => (h||'').toString().trim().toLowerCase());
    const headerIndex = {};
    header.forEach((name, i) => headerIndex[name] = i);

    // Campos obrigatórios conforme o padrão existente
    const required = ['id', 'id_atividade', 'id_membro', 'tipo'];
    const missing = required.filter(k => headerIndex[k] === undefined);
    if (missing.length) {
      return { ok: false, error: 'Colunas faltando na tabela Participacoes: ' + missing.join(', ') };
    }

    // Verifica duplicatas existentes
    const existingMemberIds = [];
    for (let r = 1; r < values.length; r++) {
      const row = values[r] || [];
      const rowActivityId = String(row[headerIndex['id_atividade']] || '').trim();
      if (rowActivityId === activityId.toString().trim()) {
        existingMemberIds.push(String(row[headerIndex['id_membro']] || '').trim());
      }
    }

    const newMemberIds = memberIds.filter(id => !existingMemberIds.includes(id.toString()));

    if (newMemberIds.length === 0) {
      return { ok: true, created: 0, message: 'Todos os membros já estão na lista.' };
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

    // Adiciona as novas linhas no final da planilha
    const currentLastRow = sheet.getLastRow();
    const startRow = currentLastRow + 1;

    if (rowsToAdd.length > 0) {
      console.log('📝 Escrevendo', rowsToAdd.length, 'linhas a partir da linha', startRow);
      sheet.getRange(startRow, 1, rowsToAdd.length, rowsToAdd[0].length).setValues(rowsToAdd);
      console.log('✅ Dados escritos com sucesso');
    } else {
      console.log('ℹ️ Nenhuma linha para escrever');
    }

    console.log('✅ saveTargetsDirectly concluída com sucesso');
    return { ok: true, created: newMemberIds.length };

  } catch (err) {
    console.error('❌ Erro em saveTargetsDirectly:', err);
    return { ok: false, error: 'Erro saveTargetsDirectly: ' + (err && err.message ? err.message : err) };
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
    console.error('Erro getParticipacaesCtx_:', err);
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
    console.error('Erro generateParticipacaoId_:', err);
    return 'PART-0001';
  }
}