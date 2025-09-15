# 📊 Dicionário de Dados – Sistema Dojotai

<!-- TOC -->
- [Visão Geral](#visão-geral)
- [Configurações do Sistema](#configurações-do-sistema)
  - [Usuarios](#usuarios)
  - [Planilhas](#planilhas)
  - [Menu](#menu)
- [Gestão de Atividades](#gestão-de-atividades)
  - [Atividades](#atividades)
  - [Categoria_Atividades](#categoria_atividades)
  - [Activity_Participation](#activity_participation)
- [Gestão de Membros](#gestão-de-membros)
  - [Membros](#membros)
  - [Grupos](#grupos)
- [Sistema de Gamificação](#sistema-de-gamificação)
  - [Praticas](#praticas)
  - [Praticas_Realizadas](#praticas_realizadas)
- [Controle de Materiais](#controle-de-materiais)
  - [Materiais](#materiais)
  - [Movimentacao_Materiais](#movimentacao_materiais)
- [Relatórios e Ondas](#relatórios-e-ondas)
  - [Relatorios_Mensais](#relatorios_mensais)
  - [Ondas](#ondas)
- [Logs e Auditoria](#logs-e-auditoria)
  - [Access_Logs](#access_logs)
- [Regras de Integridade](#regras-de-integridade)
<!-- /TOC -->

## Visão Geral

Este documento especifica a **estrutura completa de dados** do Sistema Dojotai, incluindo todas as tabelas (abas do Google Sheets), campos obrigatórios, relacionamentos e regras de integridade.

### 📋 **Convenções**
- **PK** = Chave Primária
- **FK** = Chave Estrangeira  
- **[Obrigatório]** = Campo não pode ser vazio
- **[Gerado]** = Preenchido automaticamente pelo sistema
- **[Futuro]** = Planejado para implementação posterior

---

## Configurações do Sistema

### Usuarios
**Propósito**: Controle de acesso e autenticação no sistema

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `uid` | String | ID único do usuário **[PK]** **[Gerado]** | ✅ Implementado |
| `login` | String | Nome de login **[Obrigatório]** | ✅ Implementado |
| `pin` | String | PIN de acesso **[Obrigatório]** | ✅ Implementado |
| `nome` | String | Nome exibido no sistema **[Obrigatório]** | ✅ Implementado |
| `status` | String | Ativo/Inativo **[Obrigatório]** | ✅ Implementado |
| `criado_em` | DateTime | Data criação **[Gerado]** | ✅ Implementado |
| `atualizado_em` | DateTime | Data última atualização **[Gerado]** | ✅ Implementado |
| `ultimo_acesso` | DateTime | Data último login **[Gerado]** | ✅ Implementado |
| `member_id` | String | Referência ao cadastro de membros **[FK→Membros.id]** | 🔄 Planejado |
| `papel` | String | admin, secretaria, líder, usuário | 🔄 Planejado |

### Planilhas
**Propósito**: Configuração dinâmica de conexões com planilhas Google

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `arquivo` | String | Nome do arquivo (organização) | ✅ Implementado |
| `nome` | String | Chave de referência no código **[Obrigatório]** | ✅ Implementado |
| `ssid` | String | ID da planilha Google **[Obrigatório]** | ✅ Implementado |
| `planilha` | String | Nome da aba/planilha | ✅ Implementado |
| `named_range` | String | Named range (se houver) | ✅ Implementado |
| `range_a1` | String | Range A1 (ex: A1:Z) | ✅ Implementado |
| `descricao` | String | Descrição para documentação | ✅ Implementado |
| `status` | String | Ativo/Inativo **[Obrigatório]** | ✅ Implementado |

### Menu
**Propósito**: Sistema de navegação dinâmico configurável

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | Identificador único (MENU-001) **[PK]** | ✅ Implementado |
| `titulo` | String | Texto exibido **[Obrigatório]** | ✅ Implementado |
| `icone` | String | Emoji/ícone Unicode | ✅ Implementado |
| `ordem` | Number | Ordem de exibição (padrão: 999) | ✅ Implementado |
| `acao` | String | route, function, external **[Obrigatório]** | ✅ Implementado |
| `destino` | String | Destino da ação **[Obrigatório]** | ✅ Implementado |
| `permissoes` | String | Roles autorizados (vazio = todos) | ✅ Implementado |
| `status` | String | Ativo/Inativo **[Obrigatório]** | ✅ Implementado |

---

## Gestão de Atividades

### Atividades
**Propósito**: Controle completo de atividades e eventos

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (ACT-0001) **[PK]** **[Gerado]** | ✅ Implementado |
| `titulo` | String | Título da atividade **[Obrigatório]** | ✅ Implementado |
| `descricao` | Text | Descrição detalhada | ✅ Implementado |
| `data` | Date | Data/hora prevista | ✅ Implementado |
| `local` | String | Local da atividade | 🔄 Planejado |
| `status` | String | Pendente, Concluida, Cancelada | ✅ Implementado |
| `categoria_atividade_id` | String | **[FK→Categoria_Atividades.id]** | ✅ Implementado |
| `criado_em` | DateTime | Data criação **[Gerado]** | ✅ Implementado |
| `atualizado_em` | DateTime | Data última alteração **[Gerado]** | ✅ Implementado |
| `atribuido_uid` | String | Responsável **[FK→Usuarios.uid]** | ✅ Implementado |
| `atualizado_uid` | String | Quem fez última alteração **[FK→Usuarios.uid]** | ✅ Implementado |
| `concluido_em` | DateTime | Data conclusão **[Gerado]** | 🔄 Planejado |
| `concluido_por_uid` | String | Quem concluiu **[FK→Usuarios.uid]** | 🔄 Planejado |
| `foto_url` | String | URL da foto da atividade | 🔄 Futuro |
| `relato` | Text | Relato pós-atividade | 🔄 Futuro |

### Categoria_Atividades
**Propósito**: Organização visual e funcional das atividades

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | Identificador único (CAT-001) **[PK]** | ✅ Implementado |
| `nome` | String | Nome da categoria **[Obrigatório]** | ✅ Implementado |
| `icone` | String | Emoji/ícone Unicode | ✅ Implementado |
| `cor` | String | Cor em hex (#FF5733) ou CSS | ✅ Implementado |
| `descricao` | String | Descrição da categoria | ✅ Implementado |
| `ordem` | Number | Ordem de exibição | ✅ Implementado |
| `status` | String | Ativo/Inativo **[Obrigatório]** | ✅ Implementado |

### Activity_Participation
**Propósito**: Controle de participação em atividades

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (PART-0001) **[PK]** **[Gerado]** | 🔄 Planejado |
| `activity_id` | String | **[FK→Atividades.id]** **[Obrigatório]** | 🔄 Planejado |
| `member_id` | String | **[FK→Membros.id]** **[Obrigatório]** | 🔄 Planejado |
| `status` | String | convidado, confirmado, ausente, presente | 🔄 Planejado |
| `data_resposta` | DateTime | Quando confirmou/recusou | 🔄 Planejado |
| `presente` | Boolean | Compareceu à atividade | 🔄 Planejado |
| `observacoes` | String | Comentários sobre a participação | 🔄 Planejado |

---

## Gestão de Membros

### Membros
**Propósito**: Cadastro completo dos membros do dojo

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (MBR-0001) **[PK]** **[Gerado]** | 🔄 Planejado |
| `nome_completo` | String | Nome completo **[Obrigatório]** | 🔄 Planejado |
| `nome_exibicao` | String | Nome para exibição no sistema | 🔄 Planejado |
| `data_nascimento` | Date | Data de nascimento | 🔄 Planejado |
| `telefone` | String | Telefone principal | 🔄 Planejado |
| `email` | String | E-mail principal | 🔄 Planejado |
| `endereco` | Text | Endereço completo | 🔄 Planejado |
| `foto_url` | String | URL da foto do membro | 🔄 Futuro |
| `grupo_id` | String | **[FK→Grupos.id]** | 🔄 Planejado |
| `cargo` | String | Função no dojo | 🔄 Planejado |
| `data_ingresso` | Date | Data de entrada no dojo | 🔄 Planejado |
| `status` | String | Ativo, Inativo, Licenciado **[Obrigatório]** | 🔄 Planejado |
| `observacoes` | Text | Observações gerais | 🔄 Planejado |
| `criado_em` | DateTime | Data cadastro **[Gerado]** | 🔄 Planejado |
| `atualizado_em` | DateTime | Data última alteração **[Gerado]** | 🔄 Planejado |

### Grupos
**Propósito**: Estrutura hierárquica do dojo

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (GRP-0001) **[PK]** **[Gerado]** | 🔄 Futuro |
| `nome` | String | Nome do grupo **[Obrigatório]** | 🔄 Futuro |
| `descricao` | String | Descrição do grupo | 🔄 Futuro |
| `lider_uid` | String | Líder do grupo **[FK→Usuarios.uid]** | 🔄 Futuro |
| `grupo_pai_id` | String | Grupo hierárquico pai **[FK→Grupos.id]** | 🔄 Futuro |
| `status` | String | Ativo/Inativo **[Obrigatório]** | 🔄 Futuro |

---

## Sistema de Gamificação

### Praticas
**Propósito**: Catálogo de práticas para gamificação

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (PRT-0001) **[PK]** **[Gerado]** | 🔄 Futuro |
| `nome` | String | Nome da prática **[Obrigatório]** | 🔄 Futuro |
| `descricao` | String | Descrição detalhada | 🔄 Futuro |
| `pontos` | Number | Pontuação da prática | 🔄 Futuro |
| `categoria` | String | Categoria da prática | 🔄 Futuro |
| `status` | String | Ativo/Inativo **[Obrigatório]** | 🔄 Futuro |

### Praticas_Realizadas
**Propósito**: Registro de práticas realizadas pelos membros

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (PRTREAL-0001) **[PK]** **[Gerado]** | 🔄 Futuro |
| `pratica_id` | String | **[FK→Praticas.id]** **[Obrigatório]** | 🔄 Futuro |
| `member_id` | String | **[FK→Membros.id]** **[Obrigatório]** | 🔄 Futuro |
| `data_pratica` | Date | Data da prática | 🔄 Futuro |
| `quantidade` | Number | Quantidade/repetições | 🔄 Futuro |
| `observacoes` | String | Comentários sobre a prática | 🔄 Futuro |
| `status_aprovacao` | String | pendente, aprovado, rejeitado | 🔄 Futuro |
| `aprovado_por` | String | **[FK→Usuarios.uid]** | 🔄 Futuro |
| `data_aprovacao` | DateTime | Data da aprovação | 🔄 Futuro |

---

## Controle de Materiais

### Materiais
**Propósito**: Cadastro de materiais e equipamentos

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (MAT-0001) **[PK]** **[Gerado]** | 🔄 Futuro |
| `nome` | String | Nome do material **[Obrigatório]** | 🔄 Futuro |
| `descricao` | String | Descrição detalhada | 🔄 Futuro |
| `categoria` | String | Categoria do material | 🔄 Futuro |
| `quantidade_atual` | Number | Estoque atual | 🔄 Futuro |
| `quantidade_minima` | Number | Estoque mínimo | 🔄 Futuro |
| `unidade_medida` | String | UN, KG, M, etc. | 🔄 Futuro |
| `valor_unitario` | Number | Valor por unidade | 🔄 Futuro |
| `status` | String | Ativo/Inativo **[Obrigatório]** | 🔄 Futuro |

### Movimentacao_Materiais
**Propósito**: Histórico de movimentações de estoque

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (MOV-0001) **[PK]** **[Gerado]** | 🔄 Futuro |
| `material_id` | String | **[FK→Materiais.id]** **[Obrigatório]** | 🔄 Futuro |
| `tipo_movimentacao` | String | entrada, saida, ajuste | 🔄 Futuro |
| `quantidade` | Number | Quantidade movimentada | 🔄 Futuro |
| `motivo` | String | Motivo da movimentação | 🔄 Futuro |
| `responsavel_uid` | String | **[FK→Usuarios.uid]** | 🔄 Futuro |
| `data_movimentacao` | DateTime | Data da movimentação **[Gerado]** | 🔄 Futuro |

---

## Relatórios e Ondas

### Relatorios_Mensais
**Propósito**: Relatórios consolidados mensais por grupo

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (REL-0001) **[PK]** **[Gerado]** | 🔄 Futuro |
| `periodo` | String | YYYY-MM **[Obrigatório]** | 🔄 Futuro |
| `grupo_id` | String | **[FK→Grupos.id]** | 🔄 Futuro |
| `conteudo` | Text | Conteúdo do relatório | 🔄 Futuro |
| `status` | String | rascunho, enviado, aprovado | 🔄 Futuro |
| `criado_por` | String | **[FK→Usuarios.uid]** | 🔄 Futuro |
| `aprovado_por` | String | **[FK→Usuarios.uid]** | 🔄 Futuro |
| `data_envio` | DateTime | Data do envio | 🔄 Futuro |
| `data_aprovacao` | DateTime | Data da aprovação | 🔄 Futuro |

### Ondas
**Propósito**: Importação e controle de dados de ondas

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único (OND-0001) **[PK]** **[Gerado]** | 🔄 Futuro |
| `periodo` | String | YYYY-MM **[Obrigatório]** | 🔄 Futuro |
| `member_id` | String | **[FK→Membros.id]** | 🔄 Futuro |
| `dados_importados` | Text | JSON com dados da importação | 🔄 Futuro |
| `data_importacao` | DateTime | Data da importação **[Gerado]** | 🔄 Futuro |
| `importado_por` | String | **[FK→Usuarios.uid]** | 🔄 Futuro |

---

## Logs e Auditoria

### Access_Logs
**Propósito**: Registro de acessos ao sistema

| Campo | Tipo | Descrição | Status |
|-------|------|-----------|--------|
| `id` | String | ID único **[PK]** **[Gerado]** | 🔄 Planejado |
| `uid` | String | **[FK→Usuarios.uid]** | 🔄 Planejado |
| `login_time` | DateTime | Data/hora do login **[Gerado]** | 🔄 Planejado |
| `ip_address` | String | IP de acesso | 🔄 Planejado |
| `user_agent` | String | Navegador/dispositivo | 🔄 Planejado |
| `success` | Boolean | Login bem-sucedido | 🔄 Planejado |

---

## Regras de Integridade

### **Chaves Primárias**
- Todos os IDs são únicos e seguem padrão: `PREFIXO-NNNN`
- Geração automática via `generateSequentialId_()`

### **Relacionamentos Obrigatórios**
- `Atividades.atribuido_uid` → `Usuarios.uid`
- `Activity_Participation.activity_id` → `Atividades.id`
- `Activity_Participation.member_id` → `Membros.id`
- `Usuarios.member_id` → `Membros.id` (quando implementado)

### **Regras de Status**
- **Ativo/Inativo**: Valores aceitos: "Ativo", "ACTIVE", "1", "true", "sim"
- **Case-insensitive**: Comparações sempre em lowercase
- **Status padrão**: "Ativo" para novos registros

### **Auditoria Automática**
- Campos `criado_em` e `atualizado_em` preenchidos automaticamente
- `atualizado_uid` registra quem fez alterações
- Logs de acesso para todas as operações críticas

### **Validações**
- PIDs sequenciais únicos para evitar conflitos
- Validação de formato de email e telefone
- Datas não podem ser no passado para atividades futuras
- Quantidades de materiais não podem ser negativas