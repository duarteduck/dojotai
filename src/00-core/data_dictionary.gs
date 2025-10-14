/**
 * ╔══════════════════════════════════════════════════════════════════════════════════════════════════╗
 * ║                             SISTEMA DOJOTAI V2.0 - DICIONÁRIO DE DADOS                          ║
 * ║                                    Criado: 18/09/2025                                           ║
 * ║                                  Atualizado: 10/10/2025                                         ║
 * ╚══════════════════════════════════════════════════════════════════════════════════════════════════╝
 *
 * @fileoverview Definição central de todas as tabelas do sistema incluindo
 * estrutura de campos, validações, tipos de dados e relações entre tabelas.
 *
 * @author Sistema Dojotai Team
 * @version 2.0.0-alpha.1
 * @since 18/09/2025
 *
 * @description Este arquivo define a estrutura completa de dados do Sistema Dojotai V2.0.
 * Todas as validações, campos obrigatórios e padrões são baseados neste dicionário.
 *
 * @example
 * // Acessar definição de uma tabela
 * const userTable = DATA_DICTIONARY.usuarios;
 * console.log(userTable.fields.email.required); // true
 *
 * @example
 * // Validar campo
 * const isValid = ValidationEngine.validateField('usuarios', 'email', 'test@example.com');
 *
 * 📋 DEFINIÇÃO CENTRAL DE TODAS AS TABELAS DO SISTEMA
 *
 * 🎯 COMO USAR:
 * - Para adicionar campo: Copie um campo similar e modifique
 * - Para nova tabela: Copie uma tabela similar como template
 *
 * ⚠️ REGRA CRÍTICA: SINCRONIZAÇÃO DICIONÁRIO ↔ PLANILHAS
 *
 * 🔄 SEMPRE que alterar este dicionário, DEVE atualizar:
 *
 * 1. PLANILHA DE CONFIGURAÇÃO: Arquivo "Configurações" > Aba "Planilhas"
 * 2. PLANILHA DE DADOS: O arquivo específico > Aba da tabela sendo editada
 * 3. NOVOS CAMPOS: Adicionar coluna na planilha com nome exato
 * 4. CAMPOS RENOMEADOS: Renomear cabeçalho na planilha
 * 5. CAMPOS REMOVIDOS: Mover para final com prefixo "_DEPRECATED_"
 * 6. TESTAR: Sempre executar testes após alterações
 *
 * ✅ Teste obrigatório: readTableByNome_('nome_da_tabela')
 * ❌ Nunca: alterar dicionário sem atualizar planilhas correspondentes
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
 * 8. SESSOES             - Sessões de usuários (login/logout)
 * 9. PERFORMANCE_LOGS    - Logs detalhados de performance das operações
 * 10. SYSTEM_HEALTH      - Relatórios diários de saúde do sistema
 * 11. SYSTEM_LOGS        - Logs estruturados do sistema para auditoria
 * 12. NOTIFICACOES       - Sistema de notificações para usuários
 * 13. PREFERENCIAS       - Preferências personalizadas dos usuários
 * 14. HISTORICO          - Auditoria e histórico de ações do sistema
 *
 * ═════════════════════ TABELAS DE PARÂMETROS (CADASTROS) ═══════════════════════════
 * 15. CARGO              - Cadastro de Cargos do Dojo
 * 16. CATEGORIA_MEMBROS  - Cadastro de Categorias de Membros
 * 17. DOJO               - Cadastro de Dojos Ativos
 * 18. OMITAMA            - Cadastro de Graus de Omitama
 * 19. SEXO               - Cadastro de Sexo
 * 20. STATUS_MEMBRO      - Cadastro de Status de Membros
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
        pattern: '^U\\d+$',
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
        example: 'ACT-0001'
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
        type: 'DATETIME',
        required: false,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora de realização da atividade',
        example: '2025-09-20 14:30:00'
      },

      // Status da atividade
      status: {
        type: 'TEXT',
        required: true,
        enum: ['Pendente', 'Concluída'],
        default: 'Pendente',
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

      // IDs das categorias da atividade (múltiplas categorias possíveis)
      categorias_ids: {
        type: 'TEXT',
        required: false,
        description: 'IDs das categorias da atividade separados por vírgula',
        example: 'CAT-001,CAT-003,CAT-005',
        validation: {
          pattern: '^(CAT-\\d+)(,CAT-\\d+)*$',
          maxLength: 200
        },
        customValidation: 'validateMultipleCategorias'
      },

      // Soft delete - marca registro como deletado sem apagar fisicamente
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      },

      // Tags/etiquetas da atividade para filtros e categorização flexível
      tags: {
        type: 'TEXT',
        required: false,
        description: 'Tags/etiquetas da atividade separadas por vírgula',
        example: 'kata,avaliacao,iniciante',
        validation: {
          pattern: '^[a-zA-Z0-9_,\\s]*$',
          maxLength: 200
        }
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
        example: 'CAT-0001'
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

      // Buntai (equipe/grupo) - número identificador
      buntai: {
        type: 'NUMBER',
        required: false,
        description: 'Número do Buntai (equipe/grupo) do membro',
        example: 1
      },

      // ═══════════════════════════════════════════════════════════════════════════════════════════
      // 🔗 CAMPOS DE RELACIONAMENTO (FOREIGN KEYS)
      // ═══════════════════════════════════════════════════════════════════════════════════════════

      // ID do cargo do membro (FK)
      cargo_id: {
        type: 'NUMBER',
        required: false,
        foreignKey: { table: 'cargo', field: 'id' },
        description: 'ID do cargo do membro',
        example: 1
      },

      // ID do buntai (FK para grupos)
      buntai_id: {
        type: 'NUMBER',
        required: false,
        foreignKey: { table: 'grupos', field: 'id' },
        description: 'ID do Buntai (FK para tabela grupos filtrado por tipo=buntai)',
        example: 1
      },

      // ID da categoria do membro (FK)
      categoria_membro_id: {
        type: 'NUMBER',
        required: true,
        foreignKey: { table: 'categoria_membros', field: 'id' },
        description: 'Classificação/nível do membro (O QUE É)',
        example: 1
      },

      // ID da categoria do grupo (FK)
      categoria_grupo_id: {
        type: 'NUMBER',
        required: true,
        foreignKey: { table: 'categoria_membros', field: 'id' },
        description: 'Grupo que o membro pertence (ONDE ESTÁ)',
        example: 3
      },

      // ID do dojo (FK)
      dojo_id: {
        type: 'NUMBER',
        required: false,
        foreignKey: { table: 'dojo', field: 'id' },
        description: 'ID do dojo do membro',
        example: 1
      },

      // ID do grau de omitama (FK)
      omitama_id: {
        type: 'NUMBER',
        required: false,
        foreignKey: { table: 'omitama', field: 'id' },
        description: 'ID do grau de omitama',
        example: 1
      },

      // ID do sexo (FK)
      sexo_id: {
        type: 'NUMBER',
        required: false,
        foreignKey: { table: 'sexo', field: 'id' },
        description: 'ID do sexo',
        example: 1
      },

      // ID do status (FK)
      status_membro_id: {
        type: 'NUMBER',
        required: false,
        foreignKey: { table: 'status_membro', field: 'id' },
        description: 'ID do status do membro',
        example: 1
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
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                    8. TABELA: SESSOES                                          │
  // │ 🔐 Gerenciamento robusto de sessões de usuários                                               │
  // │ 📂 Arquivo: Sistema - Sessões | Planilha: sessoes | Referência: sessoes                      │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  sessoes: {
    tableName: 'sessoes',
    description: 'Gerenciamento robusto de sessões de usuários',
    primaryKey: 'id',
    file: 'Sistema - Sessões',
    sheet: 'sessoes',

    // 🔍 CAMPOS DA TABELA SESSOES
    fields: {

      // ID da linha (padrão DatabaseManager)
      id: {
        type: 'TEXT',
        required: true,
        pattern: '^SES-\\d+$',
        description: 'ID único da linha',
        generated: true,
        example: 'SES-001'
      },

      // Token único da sessão
      session_id: {
        type: 'TEXT',
        required: true,
        pattern: '^sess_[0-9]+_[a-z0-9]+$',
        description: 'Token único da sessão',
        generated: false,
        example: 'sess_1234567890_abc123def'
      },

      // ID do usuário (FK)
      user_id: {
        type: 'TEXT',
        required: true,
        foreignKey: 'usuarios.uid',
        description: 'ID do usuário proprietário da sessão',
        example: 'U001'
      },

      // Data e hora de criação
      created_at: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora de criação da sessão',
        example: '2025-09-19 14:30:00'
      },

      // Data e hora de expiração
      expires_at: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora de expiração da sessão',
        example: '2025-09-19 22:30:00'
      },

      // Endereço IP do usuário
      ip_address: {
        type: 'TEXT',
        required: false,
        maxLength: 45, // IPv6 support
        description: 'Endereço IP do usuário',
        example: '192.168.1.100'
      },

      // Informações do dispositivo (JSON)
      device_info: {
        type: 'TEXT',
        required: false,
        description: 'Informações do dispositivo em formato JSON',
        example: '{"userAgent":"Mozilla/5.0...","platform":"web"}'
      },

      // Status da sessão
      active: {
        type: 'TEXT',
        required: false,
        enum: ['sim', ''],
        description: 'Status da sessão (sim=ativa, vazio=inativa)',
        example: 'sim'
      },

      // Última atividade
      last_activity: {
        type: 'DATETIME',
        required: false,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Timestamp da última atividade na sessão',
        example: '2025-09-19 15:45:30'
      },

      // Data de destruição da sessão
      destroyed_at: {
        type: 'DATETIME',
        required: false,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora de destruição da sessão (logout)',
        example: '2025-09-19 18:00:00'
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                9. TABELA: PERFORMANCE_LOGS                                     │
  // │ 📊 Logs detalhados de performance das operações do sistema                                    │
  // │ 📂 Arquivo: Performance | Planilha: performance_logs | Referência: performance_logs          │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  performance_logs: {
    tableName: 'performance_logs',
    description: 'Logs detalhados de performance das operações do sistema',
    primaryKey: 'id',
    file: 'Performance',
    sheet: 'performance_logs',

    // 🔍 CAMPOS DA TABELA PERFORMANCE_LOGS
    fields: {

      // ID único do log de performance
      id: {
        type: 'TEXT',
        required: true,
        pattern: '^PERF-\\d+$',
        description: 'ID único do log de performance',
        generated: true,
        example: 'PERF-001'
      },

      // Timestamp da operação
      timestamp: {
        type: 'DATETIME',
        required: true,
        timezone: 'America/Sao_Paulo',
        description: 'Timestamp exato da operação monitorada',
        example: '2025-09-22 14:30:15'
      },

      // Tipo da operação
      operation_type: {
        type: 'TEXT',
        required: true,
        enum: ['QUERY', 'INSERT', 'UPDATE', 'DELETE', 'VALIDATION', 'FK_VALIDATION', 'BUSINESS_RULES', 'ADVANCED_VALIDATION', 'UNIQUE_VALIDATION', 'FULL_VALIDATION'],
        description: 'Tipo da operação executada',
        example: 'QUERY'
      },

      // Nome da tabela envolvida
      table_name: {
        type: 'TEXT',
        required: true,
        description: 'Nome da tabela onde a operação foi executada',
        example: 'usuarios'
      },

      // Duração em milissegundos
      duration_ms: {
        type: 'NUMBER',
        required: true,
        min: 0,
        description: 'Duração da operação em milissegundos',
        example: 1250
      },

      // Classificação da performance
      classification: {
        type: 'TEXT',
        required: true,
        enum: ['FAST', 'NORMAL', 'SLOW', 'CRITICAL'],
        description: 'Classificação automática da performance',
        example: 'NORMAL'
      },

      // Contexto adicional da operação
      context: {
        type: 'TEXT',
        required: false,
        description: 'JSON com contexto adicional (cache hit, filtros, etc.)',
        example: '{"cacheHit":true,"filters":{"status":"ativo"}}'
      },

      // Data de criação do log
      created_at: {
        type: 'DATETIME',
        required: true,
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora de criação do log',
        example: '2025-09-22 14:30:15'
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                               10. TABELA: SYSTEM_HEALTH                                        │
  // │ 📈 Relatórios diários consolidados de saúde do sistema                                        │
  // │ 📂 Arquivo: Performance | Planilha: system_health | Referência: system_health                │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  system_health: {
    tableName: 'system_health',
    description: 'Relatórios diários consolidados de saúde do sistema',
    primaryKey: 'id',
    file: 'Performance',
    sheet: 'system_health',

    // 🔍 CAMPOS DA TABELA SYSTEM_HEALTH
    fields: {

      // ID único do relatório de saúde
      id: {
        type: 'TEXT',
        required: true,
        pattern: '^HEALTH-\\d+$',
        description: 'ID único do relatório de saúde',
        generated: true,
        example: 'HEALTH-001'
      },

      // Data do relatório
      date: {
        type: 'DATE',
        required: true,
        unique: true,
        description: 'Data do relatório (um por dia)',
        example: '2025-09-22'
      },

      // Score de saúde do sistema
      health_score: {
        type: 'NUMBER',
        required: true,
        min: 0,
        max: 100,
        description: 'Score de saúde do sistema (0-100)',
        example: 85
      },

      // Total de operações no período
      total_operations: {
        type: 'NUMBER',
        required: true,
        min: 0,
        description: 'Total de operações executadas no período',
        example: 1247
      },

      // Taxa de cache hit
      cache_hit_rate: {
        type: 'NUMBER',
        required: true,
        min: 0,
        max: 1,
        description: 'Taxa de cache hit (0.0 a 1.0)',
        example: 0.785
      },

      // Quantidade de operações lentas
      slow_operations: {
        type: 'NUMBER',
        required: true,
        min: 0,
        description: 'Quantidade de operações lentas detectadas',
        example: 12
      },

      // Quantidade de alertas críticos
      critical_alerts: {
        type: 'NUMBER',
        required: true,
        min: 0,
        description: 'Quantidade de alertas críticos gerados',
        example: 3
      },

      // Recomendações do sistema
      recommendations: {
        type: 'TEXT',
        required: false,
        description: 'JSON com recomendações de otimização',
        example: '[{"type":"CACHE","priority":"HIGH","message":"Cache hit rate baixo"}]'
      },

      // Data de criação do relatório
      created_at: {
        type: 'DATETIME',
        required: true,
        timezone: 'America/Sao_Paulo',
        description: 'Data e hora de criação do relatório',
        example: '2025-09-22 23:59:59'
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                11. TABELA: SYSTEM_LOGS                                         │
  // │ 📝 Logs estruturados do sistema para auditoria e debugging                                    │
  // │ 📂 Arquivo: Logs | Planilha: system_logs | Referência: system_logs                            │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  system_logs: {
    tableName: 'system_logs',
    description: 'Logs estruturados do sistema para auditoria e debugging',
    primaryKey: 'id',
    file: 'Logs',
    sheet: 'Sistema',

    // 🔍 CAMPOS DA TABELA SYSTEM_LOGS
    fields: {

      // ID único do log
      id: {
        type: 'TEXT',
        required: true,
        pattern: '^LOG-\\d+$',
        description: 'ID único do log',
        generated: true,
        example: 'LOG-001'
      },

      // Timestamp do log
      timestamp: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss.SSS',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora exata do log com milissegundos'
      },

      // Nível do log
      level: {
        type: 'TEXT',
        required: true,
        enum: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
        description: 'Nível de severidade do log'
      },

      // Módulo/contexto que gerou o log
      module: {
        type: 'TEXT',
        required: true,
        maxLength: 50,
        description: 'Módulo que gerou o log (SessionManager, DatabaseManager, etc.)',
        example: 'SessionManager'
      },

      // Mensagem do log
      message: {
        type: 'TEXT',
        required: true,
        maxLength: 500,
        description: 'Mensagem descritiva do log',
        example: 'Sessão criada com sucesso'
      },

      // Dados estruturados (JSON)
      context: {
        type: 'TEXT',
        required: false,
        description: 'Dados estruturados em JSON para debugging',
        validation: 'JSON válido',
        example: '{"userId":"U001","sessionId":"SES-abc"}'
      },

      // ID do usuário (quando disponível)
      user_id: {
        type: 'TEXT',
        required: false,
        foreignKey: 'usuarios.uid',
        description: 'ID do usuário relacionado ao log (opcional)',
        example: 'U1726692234567'
      },

      // ID da sessão (quando disponível)
      session_id: {
        type: 'TEXT',
        required: false,
        description: 'ID da sessão ativa (opcional)',
        example: 'SES-abc123'
      },

      // Data de criação
      created_at: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data de criação do registro'
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                               12. TABELA: NOTIFICACOES  (em breve)                             │
  // │ 🔔 Sistema de notificações para usuários                                                       │
  // │ 📂 Arquivo: Sistema - Notificacoes | Planilha: notificacoes | Referência: notificacoes         │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  notificacoes: {
    tableName: 'notificacoes',
    description: 'Sistema de notificações para usuários',
    primaryKey: 'id',
    file: 'Sistema - Notificacoes',
    sheet: 'notificacoes',

    // 🔍 CAMPOS DA TABELA NOTIFICACOES
    fields: {

      // ID único da notificação
      id: {
        type: 'TEXT',
        required: true,
        pattern: '^NOT-\\d+$',
        description: 'ID único da notificação',
        generated: true,
        example: 'NOT-001'
      },

      // ID do usuário destinatário (FK)
      id_usuario: {
        type: 'TEXT',
        required: true,
        foreignKey: 'usuarios.uid',
        description: 'ID do usuário destinatário da notificação',
        example: 'U1726692234567'
      },

      // Tipo da notificação
      tipo: {
        type: 'TEXT',
        required: true,
        enum: ['info', 'warning', 'success', 'error', 'atividade', 'confirmacao'],
        description: 'Tipo da notificação',
        example: 'info'
      },

      // Título da notificação
      titulo: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Título curto da notificação',
        example: 'Nova Atividade'
      },

      // Mensagem da notificação
      mensagem: {
        type: 'TEXT',
        required: true,
        maxLength: 500,
        description: 'Mensagem completa da notificação',
        example: 'Atividade de Kata criada para amanhã'
      },

      // Status de leitura
      lida: {
        type: 'TEXT',
        required: false,
        enum: ['sim', ''],
        default: '',
        description: 'Status de leitura da notificação (vazio = não lida, sim = lida)'
      },

      // Data de expiração
      expires_at: {
        type: 'DATETIME',
        required: false,
        timezone: 'America/Sao_Paulo',
        description: 'Data de expiração da notificação (opcional)',
        example: '2025-09-26 20:00:00'
      },

      // Data de criação
      criado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora de criação da notificação'
      },

      // Soft delete
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                               13. TABELA: PREFERENCIAS    (em breve)                           │
  // │ ⚙️ Preferências personalizadas dos usuários                                                   │
  // │ 📂 Arquivo: Sistema - Preferencias | Planilha: preferencias | Referência: preferencias       │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  preferencias: {
    tableName: 'preferencias',
    description: 'Preferências personalizadas dos usuários',
    primaryKey: 'id_usuario',
    file: 'Sistema - Preferencias',
    sheet: 'preferencias',

    // 🔍 CAMPOS DA TABELA PREFERENCIAS
    fields: {

      // ID do usuário (chave primária e FK)
      id_usuario: {
        type: 'TEXT',
        required: true,
        foreignKey: 'usuarios.uid',
        description: 'ID do usuário (chave primária)',
        example: 'U1726692234567'
      },

      // Tema da interface
      tema: {
        type: 'TEXT',
        required: false,
        enum: ['claro', 'escuro', 'auto'],
        default: 'auto',
        description: 'Tema da interface do usuário',
        example: 'escuro'
      },

      // Notificações ativas
      notificacoes_ativas: {
        type: 'TEXT',
        required: false,
        enum: ['sim', ''],
        default: 'sim',
        description: 'Receber notificações do sistema (vazio = não, sim = sim)'
      },

      // Configuração do dashboard
      configuracao_dashboard: {
        type: 'TEXT',
        required: false,
        description: 'JSON com configurações personalizadas do dashboard',
        validation: 'JSON válido',
        example: '{"widgets":["atividades_proximas","estatisticas"],"layout":"compacto"}'
      },

      // Idioma da interface
      idioma: {
        type: 'TEXT',
        required: false,
        enum: ['pt-BR', 'en-US'],
        default: 'pt-BR',
        description: 'Idioma da interface do usuário',
        example: 'pt-BR'
      },

      // Data de atualização
      atualizado_em: {
        type: 'DATETIME',
        required: false,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        description: 'Última atualização das preferências'
      },

      // Soft delete
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ┌────────────────────────────────────────────────────────────────────────────────────────────────┐
  // │                                14. TABELA: HISTORICO     (em breve)                            │
  // │ 📚 Auditoria e histórico de ações do sistema                                                  │
  // │ 📂 Arquivo: Sistema - Historico | Planilha: historico | Referência: historico                │
  // └────────────────────────────────────────────────────────────────────────────────────────────────┘
  historico: {
    tableName: 'historico',
    description: 'Auditoria e histórico de ações do sistema',
    primaryKey: 'id',
    file: 'Sistema - Historico',
    sheet: 'historico',

    // 🔍 CAMPOS DA TABELA HISTORICO
    fields: {

      // ID único do log de histórico
      id: {
        type: 'TEXT',
        required: true,
        pattern: '^HIS-\\d+$',
        description: 'ID único do log de histórico',
        generated: true,
        example: 'HIS-001'
      },

      // ID do usuário que executou a ação (FK)
      id_usuario: {
        type: 'TEXT',
        required: true,
        foreignKey: 'usuarios.uid',
        description: 'ID do usuário que executou a ação',
        example: 'U1726692234567'
      },

      // Tipo de ação executada
      acao: {
        type: 'TEXT',
        required: true,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW'],
        description: 'Tipo de ação executada pelo usuário',
        example: 'CREATE'
      },

      // Tabela afetada pela ação
      tabela_alvo: {
        type: 'TEXT',
        required: false,
        description: 'Nome da tabela afetada pela ação (opcional para LOGIN/LOGOUT)',
        example: 'atividades'
      },

      // ID do registro afetado
      id_alvo: {
        type: 'TEXT',
        required: false,
        description: 'ID do registro específico afetado (opcional)',
        example: 'ACT-202509190001'
      },

      // Detalhes da operação
      detalhes: {
        type: 'TEXT',
        required: false,
        description: 'JSON com detalhes da operação (campos alterados, valores, etc.)',
        validation: 'JSON válido',
        example: '{"campos_alterados":["titulo"],"valores_anteriores":{"titulo":"Antiga"}}'
      },

      // User agent do navegador
      user_agent: {
        type: 'TEXT',
        required: false,
        maxLength: 500,
        description: 'User agent do navegador do usuário',
        example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)...'
      },

      // Data de criação do log
      criado_em: {
        type: 'DATETIME',
        required: true,
        format: 'yyyy-MM-dd HH:mm:ss',
        timezone: 'America/Sao_Paulo',
        generated: true,
        description: 'Data e hora da ação'
      },

      // Soft delete
      deleted: {
        type: 'TEXT',
        required: false,
        description: 'Marca se o registro foi deletado (vazio = ativo, x = deletado)',
        default: ''
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════════════════════════════
  // │                              TABELAS DE PARÂMETROS (CADASTROS)                                  │
  // ══════════════════════════════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════════════════════════════
  // │                                    8. TABELA: CARGO                                              │
  // ══════════════════════════════════════════════════════════════════════════════════════════════════

  cargo: {
    tableName: 'cargo',
    description: 'Cadastro de Cargos',
    primaryKey: 'id',
    file: 'Parametros',
    sheet: 'Cargo',

    fields: {
      id: {
        type: 'NUMBER',
        required: true,
        description: 'ID único do cargo',
        example: 1
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 25,
        description: 'Nome do cargo',
        example: 'Taityo'
      },
      abreviacao: {
        type: 'TEXT',
        required: false,
        maxLength: 5,
        description: 'Abreviação do cargo',
        example: 'TT'
      },
      ordem: {
        type: 'NUMBER',
        required: false,
        description: 'Ordem de exibição',
        example: 1
      },
      ativo: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        default: 'sim',
        description: 'Cargo ativo no sistema'
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════════════════════════════
  // │                               9. TABELA: CATEGORIA_MEMBROS                                       │
  // ══════════════════════════════════════════════════════════════════════════════════════════════════

  categoria_membros: {
    tableName: 'categoria_membros',
    description: 'Cadastro de Categorias de Membros',
    primaryKey: 'id',
    file: 'Parametros',
    sheet: 'Categoria_Membro',

    fields: {
      id: {
        type: 'NUMBER',
        required: true,
        description: 'ID único da categoria',
        example: 1
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 15,
        description: 'Nome da categoria',
        example: 'Oficial'
      },
      abreviacao: {
        type: 'TEXT',
        required: false,
        maxLength: 5,
        description: 'Abreviação da categoria',
        example: 'OF'
      },
      ordem: {
        type: 'NUMBER',
        required: false,
        description: 'Ordem de exibição',
        example: 1
      },
      ativo: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        default: 'sim',
        description: 'Categoria ativa no sistema'
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════════════════════════════
  // │                                    10. TABELA: DOJO                                              │
  // ══════════════════════════════════════════════════════════════════════════════════════════════════

  dojo: {
    tableName: 'dojo',
    description: 'Cadastro de Dojos Ativos',
    primaryKey: 'id',
    file: 'Parametros',
    sheet: 'Dojo',

    fields: {
      id: {
        type: 'NUMBER',
        required: true,
        description: 'ID único do dojo',
        example: 1
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 25,
        description: 'Nome do dojo',
        example: 'Dojotai'
      },
      abreviacao: {
        type: 'TEXT',
        required: false,
        maxLength: 5,
        description: 'Abreviação do dojo',
        example: 'TT'
      },
      ordem: {
        type: 'NUMBER',
        required: false,
        description: 'Ordem de exibição',
        example: 1
      },
      ativo: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        default: 'sim',
        description: 'Dojo ativo no sistema'
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════════════════════════════
  // │                                   11. TABELA: OMITAMA                                            │
  // ══════════════════════════════════════════════════════════════════════════════════════════════════

  omitama: {
    tableName: 'omitama',
    description: 'Cadastro de Graus de Omitama',
    primaryKey: 'id',
    file: 'Parametros',
    sheet: 'Omitama',

    fields: {
      id: {
        type: 'NUMBER',
        required: true,
        description: 'ID único do grau',
        example: 1
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 15,
        description: 'Nome do grau de omitama',
        example: 'Superior'
      },
      abreviacao: {
        type: 'TEXT',
        required: false,
        maxLength: 5,
        description: 'Abreviação do grau',
        example: 'S'
      },
      ordem: {
        type: 'NUMBER',
        required: false,
        description: 'Ordem de exibição (hierarquia)',
        example: 1
      },
      ativo: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        default: 'sim',
        description: 'Grau ativo no sistema'
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════════════════════════════
  // │                                    12. TABELA: SEXO                                              │
  // ══════════════════════════════════════════════════════════════════════════════════════════════════

  sexo: {
    tableName: 'sexo',
    description: 'Cadastro de Sexo',
    primaryKey: 'id',
    file: 'Parametros',
    sheet: 'Sexo',

    fields: {
      id: {
        type: 'NUMBER',
        required: true,
        description: 'ID único do sexo',
        example: 1
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 10,
        description: 'Sexo',
        example: 'Masculino'
      },
      abreviacao: {
        type: 'TEXT',
        required: false,
        maxLength: 1,
        description: 'Abreviação',
        example: 'M'
      },
      ordem: {
        type: 'NUMBER',
        required: false,
        description: 'Ordem de exibição',
        example: 1
      },
      ativo: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        default: 'sim',
        description: 'Opção ativa no sistema'
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════════════════════════════
  // │                                 13. TABELA: STATUS_MEMBRO                                        │
  // ══════════════════════════════════════════════════════════════════════════════════════════════════

  status_membro: {
    tableName: 'status_membro',
    description: 'Cadastro de Status de Membros',
    primaryKey: 'id',
    file: 'Parametros',
    sheet: 'Status',

    fields: {
      id: {
        type: 'NUMBER',
        required: true,
        description: 'ID único do status',
        example: 1
      },
      nome: {
        type: 'TEXT',
        required: true,
        maxLength: 15,
        description: 'Nome do status',
        example: 'Ativo'
      },
      ordem: {
        type: 'NUMBER',
        required: false,
        description: 'Ordem de exibição',
        example: 10
      },
      ativo: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        default: 'sim',
        description: 'Status ativo no sistema'
      }
    }
  },

  // ══════════════════════════════════════════════════════════════════════════════════════════════════
  // │                                    14. TABELA: GRUPO                                             │
  // ══════════════════════════════════════════════════════════════════════════════════════════════════

  grupo: {
    tableName: 'grupos',
    description: 'Cadastro de Grupos (Buntais)',
    primaryKey: 'id',
    file: 'Parametros',
    sheet: 'Grupo',

    fields: {
      id: {
        type: 'NUMBER',
        required: true,
        unique: true,
        description: 'ID único do grupo',
        example: 1
      },
      tipo: {
        type: 'TEXT',
        required: false,
        maxLength: 20,
        description: 'Tipo do grupo (buntai, etc)',
        example: 'buntai'
      },
      grupo: {
        type: 'TEXT',
        required: true,
        maxLength: 100,
        description: 'Nome/descrição do grupo',
        example: 'Buntai 1 (OF MASC CRI)'
      },
      ordem: {
        type: 'NUMBER',
        required: false,
        description: 'Ordem de exibição',
        example: 1
      },
      ativo: {
        type: 'TEXT',
        required: false,
        enum: ['sim', 'nao'],
        default: 'sim',
        description: 'Grupo ativo no sistema'
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