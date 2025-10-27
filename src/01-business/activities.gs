// activities.gs – API de atividades (atualizada para categoria_atividade_id)

async function listActivitiesApi(sessionId, filtros, memberId) {
  console.log('🚀 listActivitiesApi chamada - sessionId:', sessionId ? '✓' : '✗', 'filtros:', JSON.stringify(filtros), 'memberId:', memberId || '(não informado)');
  try {
    // Validar sessão (helper centralizado)
    const auth = await requireSession(sessionId, 'Activities');
    if (!auth.ok) return auth;

    const userId = auth.session.user_id;
    console.log('👤 Usuário autenticado:', userId);

    // Validar acesso ao membro se fornecido
    if (memberId) {
      const memberAuth = await requireMemberAccess(sessionId, memberId, 'Activities');
      if (!memberAuth.ok) {
        console.error('❌ Usuário não tem acesso ao membro:', memberId);
        return memberAuth;
      }
      console.log('✅ Acesso ao membro validado:', memberId);
    }

    const result = _listActivitiesCore(filtros, null, userId, memberId);
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

/**
 * Core da listagem (usado pela API pública)
 * NOVO: Suporta 2 modos de operação
 * - Modo LIST: _listActivitiesCore(filtros, null, userId, memberId) → { ok, items: [...] }
 * - Modo SINGLE: _listActivitiesCore(filtros, 'ACT-001', userId, memberId) → { ok, passaNoFiltro, activity }
 *
 * @param {Object} filtros - Filtros a aplicar
 * @param {string} singleActivityId - (Opcional) Se fornecido, processa apenas esta atividade
 * @param {string} userId - UID do usuário logado (para filtrar por responsável)
 * @param {string|number} memberId - (Opcional) ID do membro selecionado (para filtrar por participação)
 */
function _listActivitiesCore(filtros, singleActivityId, userId, memberId) {
  const modo = singleActivityId ? 'SINGLE' : 'LIST';
  console.log(`🔄 _listActivitiesCore INICIADA - Modo: ${modo}, userId: ${userId || '(não informado)'}, memberId: ${memberId || '(não informado)'}, Filtros:`, JSON.stringify(filtros));
  if (singleActivityId) {
    console.log('🎯 Modo SINGLE - Atividade:', singleActivityId);
  }

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

  // ============================================================================
  // MODO SINGLE: Processar apenas 1 atividade
  // ============================================================================
  if (singleActivityId) {
    console.log('🎯 [MODO SINGLE] Buscando atividade:', singleActivityId);

    // Buscar linha da atividade específica
    let activityRow = null;
    for (let i = 1; i < v.length; i++) {
      const r = v[i];
      if (r[idxId] === singleActivityId) {
        activityRow = r;
        console.log('✅ [MODO SINGLE] Atividade encontrada na linha', i);
        break;
      }
    }

    if (!activityRow) {
      console.error('❌ [MODO SINGLE] Atividade não encontrada:', singleActivityId);
      return { ok: false, error: 'Atividade não encontrada: ' + singleActivityId };
    }

    // Criar objeto da atividade
    const activity = {
      id: activityRow[idxId],
      titulo: activityRow[idxTit],
      descricao: activityRow[idxDesc],
      data: activityRow[idxData],
      status: activityRow[idxStat],
      atribuido_uid: activityRow[idxAtrU],
      atualizado_uid: activityRow[idxAtuU],
      criado_em: activityRow[idxCri],
      atualizado_em: activityRow[idxAtuE]
    };

    // Adicionar campos opcionais
    if (idxCatIds >= 0) activity.categorias_ids = activityRow[idxCatIds] || '';
    if (idxTags >= 0) activity.tags = activityRow[idxTags] || '';

    console.log('📋 [MODO SINGLE] Processando categorias, stats e usuários...');

    // Carregar dados auxiliares (mesma lógica do modo LIST)
    const users = getUsersMapReadOnly_();
    const categoriasAtividades = getCategoriasAtividadesMapReadOnly_();
    const statsBatchResult = getParticipacaoStatsBatch([activity.id]);
    const statsMap = statsBatchResult.ok ? statsBatchResult.statsMap : {};

    // Adicionar nomes de usuários
    const atr = (activity.atribuido_uid || '').toString().trim();
    const atu = (activity.atualizado_uid || '').toString().trim();
    activity.atribuido_nome = users[atr]?.nome || '';
    activity.atualizado_nome = users[atu]?.nome || '';

    // Processar categorias
    const categoriasIds = (activity.categorias_ids || '').toString().trim();
    activity.categorias = [];

    if (categoriasIds) {
      const idsArray = categoriasIds.split(',').map(id => id.trim()).filter(id => id);

      idsArray.forEach(catId => {
        if (categoriasAtividades[catId]) {
          activity.categorias.push({
            id: catId,
            nome: categoriasAtividades[catId].nome,
            icone: categoriasAtividades[catId].icone,
            cor: categoriasAtividades[catId].cor
          });
        }
      });

      // Compatibilidade: campos da primeira categoria
      if (activity.categorias.length > 0) {
        activity.categoria_atividade_nome = activity.categorias[0].nome;
        activity.categoria_atividade_icone = activity.categorias[0].icone;
        activity.categoria_atividade_cor = activity.categorias[0].cor;
      } else {
        activity.categoria_atividade_nome = '';
        activity.categoria_atividade_icone = '';
        activity.categoria_atividade_cor = '';
      }
    } else {
      activity.categoria_atividade_nome = '';
      activity.categoria_atividade_icone = '';
      activity.categoria_atividade_cor = '';
    }

    // Adicionar stats de participação
    const stats = statsMap[activity.id];
    if (stats) {
      activity.total_alvos = stats.total || 0;
      activity.confirmados = stats.confirmados || 0;
      activity.rejeitados = stats.recusados || 0;
      activity.participantes = stats.participaram || 0;
      activity.ausentes = stats.ausentes || 0;
    } else {
      activity.total_alvos = 0;
      activity.confirmados = 0;
      activity.rejeitados = 0;
      activity.participantes = 0;
      activity.ausentes = 0;
    }

    // Normalizar status
    const s = (activity.status || '').toString().trim().toLowerCase();
    if (s === 'pendente') activity.status = 'pendente';
    else if (s === 'concluida' || s === 'concluída') activity.status = 'concluida';

    console.log('🔍 [MODO SINGLE] Atividade processada:', activity.id);

    // ✅ APLICAR FILTROS (mesma lógica que modo LIST)
    let passaNoFiltro = true;

    if (filtros) {
      console.log('🔍 [MODO SINGLE] Aplicando filtros...');

      // Filtro STATUS
      if (filtros.status && Array.isArray(filtros.status) && filtros.status.length > 0) {
        const itemStatus = (activity.status || '').toString().trim().toLowerCase();
        if (!filtros.status.includes(itemStatus)) {
          console.log(`  ❌ Filtro STATUS: ${activity.status} não está em [${filtros.status.join(', ')}]`);
          passaNoFiltro = false;
        } else {
          console.log(`  ✅ Filtro STATUS: ${activity.status} passa`);
        }
      }

      // Filtro RESPONSÁVEL
      if (passaNoFiltro && filtros.responsavel && Array.isArray(filtros.responsavel) && filtros.responsavel.length > 0) {
        if (!filtros.responsavel.includes(activity.atribuido_uid)) {
          console.log(`  ❌ Filtro RESPONSÁVEL: ${activity.atribuido_uid} não está em [${filtros.responsavel.join(', ')}]`);
          passaNoFiltro = false;
        } else {
          console.log(`  ✅ Filtro RESPONSÁVEL: ${activity.atribuido_uid} passa`);
        }
      }

      // Filtro PERÍODO
      if (passaNoFiltro && filtros.periodo && Array.isArray(filtros.periodo) && filtros.periodo.length > 0) {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataAtividade = new Date(activity.data);
        dataAtividade.setHours(0, 0, 0, 0);

        const passaPeriodo = filtros.periodo.some(periodo => {
          switch (periodo) {
            case 'hoje':
              return dataAtividade.getTime() === hoje.getTime();
            case 'atrasadas':
              return dataAtividade < hoje && activity.status === 'pendente';
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

        if (!passaPeriodo) {
          console.log(`  ❌ Filtro PERÍODO: data ${activity.data} não passa em [${filtros.periodo.join(', ')}]`);
          passaNoFiltro = false;
        } else {
          console.log(`  ✅ Filtro PERÍODO: passa`);
        }
      }

      // Filtro CATEGORIAS
      if (passaNoFiltro && filtros.categorias && Array.isArray(filtros.categorias) && filtros.categorias.length > 0) {
        if (activity.categorias && activity.categorias.length > 0) {
          const hasMatchingCategory = activity.categorias.some(cat =>
            filtros.categorias.includes(cat.id)
          );
          if (!hasMatchingCategory) {
            console.log(`  ❌ Filtro CATEGORIAS: nenhuma categoria match em [${filtros.categorias.join(', ')}]`);
            passaNoFiltro = false;
          } else {
            console.log(`  ✅ Filtro CATEGORIAS: passa`);
          }
        } else {
          console.log(`  ❌ Filtro CATEGORIAS: atividade sem categorias`);
          passaNoFiltro = false;
        }
      }
    }

    console.log(`✅ [MODO SINGLE] Resultado: ${passaNoFiltro ? 'PASSA' : 'NÃO PASSA'} nos filtros`);

    return {
      ok: true,
      passaNoFiltro: passaNoFiltro,
      activity: activity
    };
  }

  // ============================================================================
  // MODO LIST: Processar todas as atividades (código original mantido)
  // ============================================================================
  console.log('📋 [MODO LIST] Processando todas as atividades...');

  // ============================================================================
  // NOVO: Query BATCH de participações (se memberId fornecido)
  // ============================================================================
  let atividadesComParticipacao = new Set();

  if (memberId) {
    console.log('🔍 Buscando participações do membro:', memberId);
    try {
      const participacoes = DatabaseManager.query('participacoes', {
        id_membro: memberId.toString(),
        deleted: { $ne: 'x' }
      });

      if (participacoes && participacoes.ok && participacoes.items) {
        participacoes.items.forEach(p => {
          atividadesComParticipacao.add(p.id_atividade);
        });
        console.log('✅ Participações encontradas:', atividadesComParticipacao.size, 'atividades');
      } else {
        console.log('ℹ️ Nenhuma participação encontrada para o membro');
      }
    } catch (err) {
      console.error('❌ Erro ao buscar participações:', err);
      // Continuar sem participações
    }
  }

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

    // ============================================================================
    // NOVO: Filtro de usuário/membro
    // Se userId fornecido, filtrar por responsável OU participação
    // ============================================================================
    if (userId) {
      const atribuidoUid = (item.atribuido_uid || '').toString().trim();
      const isResponsavel = (atribuidoUid === userId);
      const isParticipante = atividadesComParticipacao.has(item.id);

      // Se memberId fornecido: mostrar se é responsável OU participa
      // Se memberId NÃO fornecido: mostrar apenas se é responsável
      if (memberId) {
        // Com membro selecionado: responsável OU participa
        if (!isResponsavel && !isParticipante) {
          continue; // Pular esta atividade
        }
      } else {
        // Sem membro selecionado: apenas responsável
        if (!isResponsavel) {
          continue; // Pular esta atividade
        }
      }
    }

    items.push(item);
  }

  console.log('📋 Total de atividades após filtro de usuário/membro:', items.length);

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

/**
 * Valida se uma atividade específica passa nos filtros fornecidos
 *
 * IMPORTANTE: Esta é uma API PÚBLICA chamada pelo frontend
 * Wrapper thin para _listActivitiesCore() em modo SINGLE
 *
 * @param {string} sessionId - ID da sessão do usuário (validação obrigatória)
 * @param {string} activityId - ID da atividade a validar (ex: 'ACT-001')
 * @param {Object} filtros - Filtros a aplicar (mesma estrutura de listActivitiesApi)
 *   @param {string[]} filtros.status - Array de status (ex: ['pendente'])
 *   @param {string[]} filtros.categorias - Array de IDs de categorias (ex: ['CAT-001'])
 *   @param {string[]} filtros.periodo - Array de períodos (ex: ['hoje', 'proximos_10'])
 *   @param {string[]} filtros.responsavel - Array de UIDs (ex: ['U001'])
 *
 * @returns {Object} Resultado com validação e dados da atividade
 *   - Sucesso: { ok: true, passaNoFiltro: boolean, activity: {...} }
 *   - Erro: { ok: false, error: string }
 *
 * @example
 * // Frontend chama:
 * const result = await apiCall('validateActivityAgainstFilters', 'ACT-001', {
 *   status: ['pendente'],
 *   responsavel: ['U001']
 * });
 *
 * if (result.ok && result.passaNoFiltro) {
 *   // Atividade ainda passa nos filtros → atualizar card
 *   updateSingleActivityCard(activityId, result.activity);
 * } else {
 *   // Não passa mais → remover card
 *   removeActivityCardWithAnimation(activityId);
 * }
 */
async function validateActivityAgainstFilters(sessionId, activityId, filtros) {
  try {
    console.log('🔍 validateActivityAgainstFilters chamada');
    console.log('  → sessionId:', sessionId ? '✓ fornecido' : '✗ ausente');
    console.log('  → activityId:', activityId || '(vazio)');
    console.log('  → filtros:', JSON.stringify(filtros));

    // ============================================================================
    // VALIDAÇÃO 1: Sessão
    // ============================================================================
    const auth = await requireSession(sessionId, 'Activities');
    if (!auth.ok) {
      console.error('❌ Sessão inválida ou expirada');
      return auth; // Retorna { ok: false, error: '...' }
    }
    console.log('✅ Sessão válida');

    // ============================================================================
    // VALIDAÇÃO 2: ID da atividade
    // ============================================================================
    if (!activityId || typeof activityId !== 'string' || activityId.trim() === '') {
      console.error('❌ ID da atividade inválido:', activityId);
      return {
        ok: false,
        error: 'ID da atividade é obrigatório e deve ser uma string não vazia'
      };
    }
    console.log('✅ ID da atividade válido:', activityId);

    // ============================================================================
    // VALIDAÇÃO 3: Filtros (opcional, mas validar estrutura se fornecido)
    // ============================================================================
    if (filtros && typeof filtros !== 'object') {
      console.error('❌ Filtros devem ser um objeto');
      return {
        ok: false,
        error: 'Filtros devem ser um objeto'
      };
    }

    // Normalizar filtros vazios para objeto vazio
    const filtrosNormalizados = filtros || {};
    console.log('✅ Filtros validados');

    // ============================================================================
    // EXECUÇÃO: Chamar _listActivitiesCore em modo SINGLE
    // ============================================================================
    console.log('🚀 Chamando _listActivitiesCore em modo SINGLE...');
    const result = _listActivitiesCore(filtrosNormalizados, activityId);

    // ============================================================================
    // VERIFICAÇÃO DE RESULTADO
    // ============================================================================
    if (!result || !result.ok) {
      console.error('❌ Erro retornado por _listActivitiesCore:', result?.error);
      return {
        ok: false,
        error: result?.error || 'Erro ao processar atividade'
      };
    }

    console.log('✅ Resultado obtido com sucesso');
    console.log('  → passaNoFiltro:', result.passaNoFiltro);
    console.log('  → activity.id:', result.activity?.id);
    console.log('  → activity.status:', result.activity?.status);

    // ============================================================================
    // RETORNO: Serializar para garantir compatibilidade com HTMLService
    // ============================================================================
    const serialized = JSON.parse(JSON.stringify(result));
    console.log('✅ validateActivityAgainstFilters finalizada com sucesso');

    return serialized;

  } catch (err) {
    // ============================================================================
    // TRATAMENTO DE EXCEÇÕES
    // ============================================================================
    console.error('❌ EXCEÇÃO em validateActivityAgainstFilters:', err);
    console.error('   Stack trace:', err.stack);

    return {
      ok: false,
      error: 'Erro interno: ' + (err.message || err.toString())
    };
  }
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
    const auth = await requireSession(sessionId, 'Activities');
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
    if (patch.tags !== undefined) updateData.tags = patch.tags; // Tags livres separadas por vírgula
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


