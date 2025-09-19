/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                             SISTEMA DOJOTAI V2.0 - DICIONÁRIO DE DADOS                          ║
 * ║                                    Criado: 18/09/2025                                           ║
 * ║                                  Atualizado: 19/09/2025                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 *
 * 📋 DEFINIÇÃO CENTRAL DE TODAS AS TABELAS DO SISTEMA
 *
 * Este arquivo define a estrutura completa de dados do Sistema Dojotai V2.0.
 * Todas as validações, campos obrigatórios e padrões são baseados neste dicionário.
 *
 * 🎯 COMO USAR:
 * - Para adicionar campo: Copie um campo similar e modifique
 * - Para nova tabela: Copie uma tabela similar como template
 * - Sempre execute `clasp push` após mudanças
 * - Teste com `testCRUDOperations()` após alterações
 *
 * 📝 ÍNDICE DAS TABELAS:
 * ────────────────────────────────────────────────────────────────────────────────────────────────
 * 1. USUARIOS            - Usuários do sistema (Admin, Secretaria, Líder, Usuário)
 * 2. PLANILHAS           - Configuração de acesso aos dados
 * 3. MENU                - Configuração do menu do sistema
 * 4. ATIVIDADES          - Atividades do dojo (treinos, eventos, avaliações)
 * 5. CATEGORIAS_ATIVIDADES - Categorias de atividades
 * 6. PARTICIPACOES       - Participações de membros em atividades
 * 7. MEMBROS             - Cadastro de membros do dojo (praticantes)
 *
 * 🕐 FORMATO DE DATAS: yyyy-MM-dd HH:mm:ss (America/Sao_Paulo)
 */

// ════════════════════════════════════════════════════════════════════════════════════════════════════
// 📊 DICIONÁRIO PRINCIPAL DE DADOS
// ════════════════════════════════════════════════════════════════════════════════════════════════════

const DATA_DICTIONARY = {

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                    1. TABELA: USUARIOS                                         │
  // │ 👥 Usuários do sistema com diferentes papéis e permissões                                     │
  // │ 📂 Arquivo: Configurações | Planilha: Usuarios | Referência: usuarios                        │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  usuarios: {
    tableName: 'usuarios',
    description: 'Usuários do sistema com diferentes papéis e permissões',
    primaryKey: 'uid',
    file: 'Configurações',
    sheet: 'Usuarios',

    // 🔍 CAMPOS DA TABELA USUARIOS
    fields: {

      // UID único do usuário (chave primária)
      uid: {
        type: 'TEXT',
        required: true,
        pattern: 'U{counter}',           
        description: 'UID único do usuário (chave primária)',
        generated: true,
        example: 'U001'
      },

      // Login único para acesso ao sistema
      login: {
        type: 'TEXT',
        required: true,
        unique: true,
        maxLength: 50,
        description: 'Login único para acesso ao sistema',
        example: 'joao.silva'
      },

      // PIN de acesso (criptografado)
      pin: {
        type: 'TEXT',
        required: true,
        minLength: 4,
        description: 'PIN de acesso (criptografado)',
        example: '1234'
      },

      // Nome completo do usuário
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Nome completo do usuário',
        example: 'João Silva'
      },

      // Status do usuário
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo',
        description: 'Status do usuário'
      },

      // Data e hora de criação
      criado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora de criação'
      },

      // Data e hora da última atualização
      atualizado_em: {
        type: 'DATETIME',
        required: false,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora da última atualização'
      },

      // Data e hora do último acesso
      ultimo_acesso: {
        type: 'DATETIME',
        required: false,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora do último acesso ao sistema'
      },

      // Soft delete - marca registro como deletado sem apagar fisicamente
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                   2. TABELA: PLANILHAS                                        │
  // │ ⚙️ Configuração de acesso às planilhas Google Sheets                                          │
  // │ 📂 Arquivo: Configurações | Planilha: Planilhas | Referência: planilhas                      │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  planilhas: {
    tableName: 'planilhas',
    description: 'Configuração de acesso às planilhas Google Sheets',
    primaryKey: 'nome',
    file: 'Configurações',
    sheet: 'Planilhas',

    // 🔍 CAMPOS DA TABELA PLANILHAS
    fields: {

      // Nome do arquivo (para organização humana)
      arquivo: {
        type: 'TEXT',
        required: false,
        maxLength: 100,
        description: 'Nome do arquivo para organização humana',
        example: 'Configurações'
      },

      // Nome da planilha (identificador usado no código)
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 50,
        description: 'Nome da planilha (identificador usado no código)',
        example: 'usuarios'
      },

      // ID da Google Sheet (SSID)
      ssid: {
        type: 'TEXT',
        required: true,
        description: 'ID da Google Sheet (SSID)',
        example: '1hfl-CeO6nK4FLYl4uacK5NncBoJ3q-8PPzUWh7W6PmY'
      },

      // Nome da aba/sheet dentro do arquivo
      planilha: {
        type: 'TEXT',
        required: true,
        maxLength: 50,
        description: 'Nome da aba/sheet dentro do arquivo',
        example: 'Usuarios'
      },

      // Nome do range nomeado (opcional, usado primeiro)
      named_range: {
        type: 'TEXT',
        required: false,
        maxLength: 50,
        description: 'Nome do range nomeado (opcional, usado primeiro)',
        example: 'USUARIOS_TBL'
      },

      // Range em notação A1 (fallback)
      range_a1: {
        type: 'TEXT',
        required: true,
        maxLength: 20,
        description: 'Range em notação A1 (fallback)',
        example: 'Usuarios!A1:J'
      },

      // Descrição da funcionalidade
      descricao: {
        type: 'TEXT',
        required: false,
        maxLength: 200,
        description: 'Descrição da funcionalidade',
        example: 'Tabela principal de usuários do sistema'
      },

      // Status da configuração
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo',
        description: 'Status da configuração (apenas "Ativo" é processado)'
      },

      // Soft delete - marca registro como deletado sem apagar fisicamente
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                     3. TABELA: MENU                                           │
  // │ 🧭 Configuração dinâmica do menu do sistema                                                   │
  // │ 📂 Arquivo: Configurações | Planilha: Menu | Referência: menu                                │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  menu: {
    tableName: 'menu',
    description: 'Configuração dinâmica do menu do sistema',
    primaryKey: 'id',
    file: 'Configurações',
    sheet: 'Menu',

    // 🔍 CAMPOS DA TABELA MENU
    fields: {

      // ID único do item de menu
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'MENU-{counter}',
        description: 'ID único do item de menu',
        example: 'MENU-001'
      },

      // Título exibido no menu
      titulo: {
        type: 'TEXT',
        required: true,
        maxLength: 50,
        description: 'Título exibido no menu',
        example: 'Dashboard'
      },

      // Ícone do item de menu
      icone: {
        type: 'TEXT',
        required: false,
        maxLength: 20,
        description: 'Ícone do item de menu (emoji ou classe CSS)',
        example: '📊'
      },

      // Ordem de exibição no menu
      ordem: {
        type: 'NUMBER',
        required: true,
        description: 'Ordem de exibição no menu',
        example: 1
      },

      // Ação do item de menu
      acao: {
        type: 'TEXT',
        required: false,
        maxLength: 50,
        enum: ['external' , 'function' , 'route'],
        description: 'Ação do item de menu',
        example: 'external (link externo) | function (chamada de função) | route (rota interna)'
      },

      // Destino/rota do item de menu
      destino: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Destino/rota do item de menu',
        example: '#/members'
      },

      // Permissões necessárias para ver o item
      permissoes: {
        type: 'TEXT',
        required: true,
        description: 'Permissões necessárias para ver o item',
        example: 'Admin,Secretaria,Líder,Usuário'
      },

      // Status do item de menu
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo',
        description: 'Status do item de menu'
      },

      // Soft delete - marca registro como deletado sem apagar fisicamente
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                   4. TABELA: ATIVIDADES                                       │
  // │ 🥋 Atividades do dojo (treinos, eventos, avaliações, competições)                            │
  // │ 📂 Arquivo: Atividades | Planilha: Atividades | Referência: atividades                       │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  atividades: {
    tableName: 'atividades',
    description: 'Atividades do dojo (treinos, eventos, avaliações, competições)',
    primaryKey: 'id',
    file: 'Atividades',
    sheet: 'Atividades',

    // 🔍 CAMPOS DA TABELA ATIVIDADES
    fields: {

      // ID único da atividade (gerado automaticamente)
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'ACT-{counter}',
        description: 'ID único da atividade (gerado automaticamente)',
        generated: true,
        example: 'ACT-001'
      },

      // Título da atividade
      titulo: {
        type: 'TEXT',
        required: true,
        maxLength: 200,
        description: 'Título da atividade',
        example: 'Treino de Kata - Sábado Manhã'
      },

      // Descrição detalhada da atividade
      descricao: {
        type: 'TEXT',
        required: false,
        maxLength: 1000,
        description: 'Descrição detalhada da atividade',
        example: 'Treino focado em katas básicos para faixas amarela e laranja'
      },

      // Data de realização da atividade
      data: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de realização da atividade',
        example: '2025-09-20'
      },

      // Status da atividade
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Planejada', 'Em Andamento', 'Concluída', 'Cancelada'],
        default: 'Planejada',
        description: 'Status da atividade'
      },

      // UID de quem atualizou a atividade por último
      atualizado_uid: {
        type: 'TEXT',
        required: false,
        foreignKey: 'usuarios.uid',
        description: 'UID de quem atualizou a atividade por último',
        example: 'U001'
      },

      // Data e hora de criação
      criado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora de criação'
      },

      // Data e hora da última atualização
      atualizado_em: {
        type: 'DATETIME',
        required: false,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora da última atualização'
      },

      // UID do responsável pela atividade
      atribuido_uid: {
        type: 'TEXT',
        required: false,
        foreignKey: 'usuarios.uid',
        description: 'UID do responsável pela atividade',
        example: 'U001'
      },

      // ID da categoria da atividade
      categoria_atividade_id: {
        type: 'TEXT',
        required: false,
        foreignKey: 'categorias_atividades.id',
        description: 'ID da categoria da atividade',
        example: 'CAT-001'
      },

      // Soft delete - marca registro como deletado sem apagar fisicamente
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                            5. TABELA: CATEGORIAS_ATIVIDADES                                   │
  // │ 📂 Categorias para classificar atividades do dojo                                             │
  // │ 📂 Arquivo: Atividades | Planilha: Categoria_Atividade | Referência: categorias_atividades   │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  categorias_atividades: {
    tableName: 'categorias_atividades',
    description: 'Categorias para classificar atividades do dojo',
    primaryKey: 'id',
    file: 'Atividades',
    sheet: 'Categoria_Atividade',

    // 🔍 CAMPOS DA TABELA CATEGORIAS_ATIVIDADES
    fields: {

      // ID único da categoria (gerado automaticamente)
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'CAT-{counter}',
        description: 'ID único da categoria (gerado automaticamente)',
        generated: true,
        example: 'CAT-001'
      },

      // Nome da categoria
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Nome da categoria',
        example: 'Treino Técnico'
      },

      // Ícone da categoria
      icone: {
        type: 'TEXT',
        required: false,
        maxLength: 20,
        description: 'Ícone da categoria (emoji ou classe CSS)',
        example: '🥋'
      },

      // Cor da categoria (hex)
      cor: {
        type: 'TEXT',
        required: false,
        pattern: '^#[0-9A-Fa-f]{6}$',
        description: 'Cor da categoria em hexadecimal',
        example: '#FF5722'
      },

      // Descrição da categoria
      descricao: {
        type: 'TEXT',
        required: false,
        maxLength: 500,
        description: 'Descrição da categoria',
        example: 'Treinos focados em técnicas específicas e kata'
      },

      // Status da categoria
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Ativo', 'Inativo'],
        default: 'Ativo',
        description: 'Status da categoria'
      },

      // Ordem de exibição
      ordem: {
        type: 'NUMBER',
        required: false,
        description: 'Ordem de exibição da categoria',
        example: 1
      },

      // Soft delete - marca registro como deletado sem apagar fisicamente
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                6. TABELA: PARTICIPACOES                                       │
  // │ ✅ Controle de participação de membros em atividades                                          │
  // │ 📂 Arquivo: Atividades | Planilha: Participacoes | Referência: participacoes                 │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  participacoes: {
    tableName: 'participacoes',
    description: 'Controle de participação de membros em atividades',
    primaryKey: 'id',
    file: 'Atividades',
    sheet: 'Participacoes',

    // 🔍 CAMPOS DA TABELA PARTICIPACOES
    fields: {

      // ID único da participação (gerado automaticamente)
      id: {
        type: 'TEXT',
        required: true,
        pattern: 'PART-{counter}',
        description: 'ID único da participação (gerado automaticamente)',
        generated: true,
        example: 'PART-0001'
      },

      // ID da atividade
      id_atividade: {
        type: 'TEXT',
        required: true,
        foreignKey: 'atividades.id',
        description: 'ID da atividade',
        example: 'ACT-001'
      },

      // ID do membro
      id_membro: {
        type: 'TEXT',
        required: true,
        foreignKey: 'membros.codigo_sequencial',
        description: 'ID do membro',
        example: '1'
      },

      // Tipo de participação
      tipo: {
        type: 'TEXT',
        required: true,
        enum: ['alvo', 'extra'],
        description: 'Tipo de participação (alvo=convidado, extra=não estava previsto)'
      },

      // Se o membro confirmou presença
      confirmou: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        description: 'Se o membro confirmou presença'
      },

      // Data de confirmação
      confirmado_em: {
        type: 'DATETIME',
        required: false,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora da confirmação'
      },

      // Se o membro realmente participou
      participou: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        description: 'Se o membro realmente participou da atividade'
      },

      // Se o membro chegou atrasado
      chegou_tarde: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        description: 'Se o membro chegou atrasado'
      },

      // Se o membro saiu antes do fim
      saiu_cedo: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        description: 'Se o membro saiu antes do fim da atividade'
      },

      // Status detalhado da participação
      status_participacao: {
        type: 'TEXT',
        required: false,
        enum: ['Confirmado', 'Rejeitado', 'Presente', 'Ausente', 'Justificado'],
        description: 'Status detalhado da participação'
      },

      // Justificativa para ausência
      justificativa: {
        type: 'TEXT',
        required: false,
        maxLength: 500,
        description: 'Justificativa para ausência ou situação especial'
      },

      // Observações adicionais
      observacoes: {
        type: 'TEXT',
        required: false,
        maxLength: 500,
        description: 'Observações adicionais sobre a participação'
      },

      // Data e hora de marcação da participação
      marcado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora de marcação da participação'
      },

      // UID de quem marcou a participação
      marcado_por: {
        type: 'TEXT',
        required: false,
        foreignKey: 'usuarios.uid',
        description: 'UID de quem marcou a participação',
        example: 'U001'
      },

      // Soft delete - marca registro como deletado sem apagar fisicamente
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                    7. TABELA: MEMBROS                                         │
  // │ 👨‍👩‍👧‍👦 Cadastro completo de membros do dojo (praticantes)                                    │
  // │ 📂 Arquivo: Cadastro | Planilha: Cadastro | Referência: membros                               │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  membros: {
    tableName: 'membros',
    description: 'Cadastro completo de membros do dojo (praticantes)',
    primaryKey: 'codigo_sequencial',
    file: 'Cadastro',
    sheet: 'Cadastro',

    // 🔍 CAMPOS DA TABELA MEMBROS
    fields: {

      // Código sequencial interno
      codigo_sequencial: {
        type: 'NUMBER',
        required: true,
        pattern: '{counter}',
        description: 'Código sequencial interno para organização (chave primária)',
        example: '1',
        generated: true
      },

      // Código mestre (chave primária)
      codigo_mestre: {
        type: 'TEXT',
        required: false,
        description: 'Código mestre do membro'
      },

      // Nome completo do membro
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Nome completo do membro',
        example: 'Maria Santos'
      },

      // Status do membro no dojo
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Ativo','Licença','Afastado','Graduado','Transferido','Desligado'],
        default: 'Ativo',
        description: 'Status do membro no dojo'
      },

      // Dojo de origem/atual
      dojo: {
        type: 'TEXT',
        required: false,
        maxLength: 100,
        description: 'Dojo de origem ou atual do membro',
        example: 'Dojo Principal'
      },

      // Categoria/grupo do membro
      categoria_grupo: {
        type: 'TEXT',
        required: false,
        maxLength: 50,
        description: 'Categoria ou grupo do membro',
        example: 'Adulto'
      },

      // Categoria específica de membro
      categoria_membro: {
        type: 'TEXT',
        required: false,
        maxLength: 50,
        description: 'Categoria específica de membro',
        example: 'Praticante'
      },

      // Buntai (equipe/grupo)
      buntai: {
        type: 'TEXT',
        required: false,
        maxLength: 50,
        description: 'Buntai (equipe/grupo) do membro',
        example: 'Buntai A'
      },

      // Ordenação para listagens
      ordenacao: {
        type: 'NUMBER',
        required: false,
        description: 'Número para ordenação em listagens'
      },

      // Cargo no dojo
      cargo: {
        type: 'TEXT',
        required: false,
        maxLength: 50,
        description: 'Cargo do membro no dojo',
        example: 'Instrutor'
      },

      // Sexo do membro
      sexo: {
        type: 'TEXT',
        required: false,
        enum: ['M', 'F', 'Masculino', 'Feminino'],
        description: 'Sexo do membro'
      },

      // Data de nascimento
      data_nascimento: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de nascimento do membro',
        example: '1990-05-15'
      },

      // Idade (calculada ou informada)
      idade: {
        type: 'NUMBER',
        required: false,
        description: 'Idade do membro (calculada ou informada)'
      },

      // Grau/graduação atual
      grau_omitama: {
        type: 'TEXT',
        required: false,
        maxLength: 50,
        description: 'Grau/graduação atual (omitama)',
        example: 'Faixa Amarela'
      },

      // Número do seminário básico
      numero_seminario_basico: {
        type: 'TEXT',
        required: false,
        maxLength: 20,
        description: 'Número do seminário básico realizado'
      },

      // ═══════════════════════════════════════════════════════════════════════════════════════════
      // 📅 CAMPOS DE DATAS (FUNCIONALIDADES FUTURAS)
      // ═══════════════════════════════════════════════════════════════════════════════════════════

      // Data de ingresso MT
      ingresso_mt: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de ingresso MT (funcionalidade futura)',
        futureUse: true
      },

      // Data de ingresso Shonenbu
      ingresso_shonenbu: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de ingresso Shonenbu (funcionalidade futura)',
        futureUse: true
      },

      // Data de ingresso PMT
      ingresso_pmt: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de ingresso PMT (funcionalidade futura)',
        futureUse: true
      },

      // Data de oficialização
      oficializacao: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de oficialização (funcionalidade futura)',
        futureUse: true
      },

      // Data de graduação
      graduacao: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de graduação (funcionalidade futura)',
        futureUse: true
      },

      // Data de desligamento
      desligamento: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de desligamento (funcionalidade futura)',
        futureUse: true
      },

      // Data de transferência de saída
      transferencia_saida: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de transferência de saída (funcionalidade futura)',
        futureUse: true
      },

      // Data de transferência de entrada
      transferencia_entrada: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de transferência de entrada (funcionalidade futura)',
        futureUse: true
      },

      // Data de afastamento
      afastado: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de afastamento (funcionalidade futura)',
        futureUse: true
      },

      // Data de licença
      licenca: {
        type: 'DATE',
        required: false,
        format: 'yyyy-MM-dd',
        timezone: 'America/Sao_Paulo',
        description: 'Data de licença (funcionalidade futura)',
        futureUse: true
      },

      // Soft delete - marca registro como deletado sem apagar fisicamente
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  }
};

// ════════════════════════════════════════════════════════════════════════════════════════════════════
// 🔧 FUNÇÕES UTILITÁRIAS DO DICIONÁRIO
// ════════════════════════════════════════════════════════════════════════════════════════════════════

/**
 * 📋 Obter dicionário de uma tabela específica
 * @param {string} tableName - Nome da tabela
 * @returns {Object|null} Dicionário da tabela ou null se não encontrada
 */
function getTableDictionary(tableName) {
  const dictionary = DATA_DICTIONARY[tableName];
  if (!dictionary) {
    console.warn(`⚠️ Tabela '${tableName}' não encontrada no dicionário`);
    return null;
  }
  return dictionary;
}

/**
 * 🔍 Obter definição de um campo específico
 * @param {string} tableName - Nome da tabela
 * @param {string} fieldName - Nome do campo
 * @returns {Object|null} Definição do campo ou null se não encontrado
 */
function getFieldDefinition(tableName, fieldName) {
  const table = getTableDictionary(tableName);
  if (!table) return null;

  const field = table.fields[fieldName];
  if (!field) {
    console.warn(`⚠️ Campo '${fieldName}' não encontrado na tabela '${tableName}'`);
    return null;
  }

  return field;
}

/**
 * ✅ Validar dados contra o dicionário
 * @param {string} tableName - Nome da tabela
 * @param {Object} data - Dados a validar
 * @returns {Object} { valid: boolean, errors: string[] }
 */
function validateAgainstDictionary(tableName, data) {
  const table = getTableDictionary(tableName);
  if (!table) {
    return { valid: false, errors: [`Tabela '${tableName}' não encontrada no dicionário`] };
  }

  const errors = [];

  // Verificar campos obrigatórios
  Object.keys(table.fields).forEach(fieldName => {
    const field = table.fields[fieldName];

    // Pular campos gerados automaticamente e campos de uso futuro
    if (field.required && !field.generated && !field.futureUse) {
      const value = data[fieldName];
      if (value === undefined || value === null || value === '') {
        errors.push(`Campo '${fieldName}' é obrigatório`);
      }
    }

    // Validar valores existentes
    if (data[fieldName] !== undefined && data[fieldName] !== null && data[fieldName] !== '') {
      const value = data[fieldName];

      // Validar enums
      if (field.enum && !field.enum.includes(value)) {
        errors.push(`Campo '${fieldName}' deve ser um de: ${field.enum.join(', ')}`);
      }

      // Validar tamanho máximo
      if (field.maxLength && value.toString().length > field.maxLength) {
        errors.push(`Campo '${fieldName}' não pode ter mais que ${field.maxLength} caracteres`);
      }

      // Validar tamanho mínimo
      if (field.minLength && value.toString().length < field.minLength) {
        errors.push(`Campo '${fieldName}' deve ter pelo menos ${field.minLength} caracteres`);
      }

      // Validar padrão de cor hex
      if (field.pattern === '^#[0-9A-Fa-f]{6}$' && typeof value === 'string') {
        const hexRegex = /^#[0-9A-Fa-f]{6}$/;
        if (!hexRegex.test(value)) {
          errors.push(`Campo '${fieldName}' deve estar no formato #RRGGBB`);
        }
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * 🏭 Obter campos que devem ser gerados automaticamente
 * @param {string} tableName - Nome da tabela
 * @returns {string[]} Lista de campos gerados automaticamente
 */
function getGeneratedFields(tableName) {
  const table = getTableDictionary(tableName);
  if (!table) return [];

  return Object.keys(table.fields).filter(fieldName => {
    return table.fields[fieldName].generated === true;
  });
}

/**
 * 📝 Obter valores padrão para uma tabela
 * @param {string} tableName - Nome da tabela
 * @returns {Object} Objeto com valores padrão
 */
function getDefaultValues(tableName) {
  const table = getTableDictionary(tableName);
  if (!table) return {};

  const defaults = {};

  Object.keys(table.fields || {}).forEach(fieldName => {
    const field = table.fields[fieldName];
    if (field.default !== undefined) {
      defaults[fieldName] = field.default;
      // Debug específico para campo deleted
      if (fieldName === 'deleted') {
        console.log(`🔍 DEBUG getDefaultValues - Campo deleted: "${field.default}" (tipo: ${typeof field.default})`);
      }
    }
  });

  console.log(`🔍 DEBUG getDefaultValues - ${tableName}:`, defaults);
  return defaults;
}

/**
 * 📊 Listar todas as tabelas disponíveis
 * @returns {string[]} Lista de nomes de tabelas
 */
function getAvailableTables() {
  return Object.keys(DATA_DICTIONARY);
}

/**
 * 📋 Obter resumo de uma tabela
 * @param {string} tableName - Nome da tabela
 * @returns {Object|null} Resumo da tabela
 */
function getTableSummary(tableName) {
  const table = getTableDictionary(tableName);
  if (!table) return null;

  const fieldCount = Object.keys(table.fields).length;
  const requiredFields = Object.keys(table.fields).filter(fieldName =>
    table.fields[fieldName].required && !table.fields[fieldName].futureUse
  ).length;
  const generatedFields = getGeneratedFields(tableName).length;
  const futureFields = Object.keys(table.fields).filter(fieldName =>
    table.fields[fieldName].futureUse
  ).length;

  return {
    tableName: table.tableName,
    description: table.description,
    primaryKey: table.primaryKey,
    file: table.file,
    sheet: table.sheet,
    fieldCount,
    requiredFields,
    generatedFields,
    futureFields
  };
}

/**
 * 🔮 Obter campos de uso futuro
 * @param {string} tableName - Nome da tabela
 * @returns {string[]} Lista de campos marcados para uso futuro
 */
function getFutureFields(tableName) {
  const table = getTableDictionary(tableName);
  if (!table) return [];

  return Object.keys(table.fields).filter(fieldName => {
    return table.fields[fieldName].futureUse === true;
  });
}

// ════════════════════════════════════════════════════════════════════════════════════════════════════
// 📖 LOG DE INICIALIZAÇÃO
// ════════════════════════════════════════════════════════════════════════════════════════════════════

console.log('📊 Dicionário de Dados V2.0 carregado com sucesso!');
console.log(`📋 Tabelas disponíveis: ${getAvailableTables().join(', ')}`);
console.log('🕐 Formato de datas: yyyy-MM-dd HH:mm:ss (America/Sao_Paulo)');