# 📱 Especificação de Telas – Sistema Dojotai

<!-- TOC -->
- [Visão Geral da Interface](#visão-geral-da-interface)
- [Autenticação](#autenticação)
  - [Tela de Login](#tela-de-login)
- [Dashboard Principal](#dashboard-principal)
  - [Tela do Usuário](#tela-do-usuário)
  - [Menu Principal](#menu-principal)
- [Gestão de Atividades](#gestão-de-atividades)
  - [Lista de Atividades](#lista-de-atividades)
  - [Criação/Edição de Atividade](#criaçãoedição-de-atividade)
  - [Detalhes da Atividade](#detalhes-da-atividade)
  - [Calendário de Atividades](#calendário-de-atividades)
- [Gestão de Membros](#gestão-de-membros)
  - [Lista de Membros](#lista-de-membros)
  - [Perfil do Membro](#perfil-do-membro)
  - [Organograma](#organograma)
- [Sistema de Participação](#sistema-de-participação)
  - [Convites para Atividades](#convites-para-atividades)
  - [Confirmação de Presença](#confirmação-de-presença)
  - [Check-in/Check-out](#check-incheck-out)
- [Relatórios](#relatórios)
  - [Dashboard de Relatórios](#dashboard-de-relatórios)
  - [Criação de Relatório Mensal](#criação-de-relatório-mensal)
  - [Aprovação de Relatórios](#aprovação-de-relatórios)
- [Gamificação](#gamificação)
  - [Catálogo de Práticas](#catálogo-de-práticas)
  - [Lançamento de Práticas](#lançamento-de-práticas)
  - [Ranking e Pontuação](#ranking-e-pontuação)
- [Controle de Materiais](#controle-de-materiais)
  - [Estoque de Materiais](#estoque-de-materiais)
  - [Movimentação de Materiais](#movimentação-de-materiais)
- [Configurações](#configurações)
  - [Configurações do Sistema](#configurações-do-sistema)
  - [Gestão de Usuários](#gestão-de-usuários)
- [Componentes Transversais](#componentes-transversais)
<!-- /TOC -->

## Visão Geral da Interface

### 🎨 **Design System**
- **Mobile-First**: Interface otimizada para dispositivos móveis
- **Dark Mode**: Suporte automático baseado na preferência do sistema
- **Responsivo**: Adaptação fluida entre mobile, tablet e desktop
- **Acessibilidade**: Contraste adequado e navegação por teclado

### 🧭 **Navegação**
- **SPA (Single Page Application)**: Navegação sem recarregamento
- **Menu Lateral**: Menu principal configurável via planilha
- **Breadcrumbs**: Localização atual na hierarquia
- **Back Button**: Botão voltar contextual

---

## Autenticação

### Tela de Login
**Rota**: `#/login`
**Acesso**: Público

#### **Layout**
```
┌─────────────────────────┐
│    🥋 DOJOTAI           │
│                         │
│  ┌─────────────────┐    │
│  │ Usuário         │    │
│  └─────────────────┘    │
│                         │
│  ┌─────────────────┐    │
│  │ PIN/Senha       │    │
│  └─────────────────┘    │
│                         │
│  [ Entrar ]             │
│                         │
│  ⚠️ Mensagem de erro    │
└─────────────────────────┘
```

#### **Funcionalidades**
- ✅ **Implementado**: Sistema de semáforos de data (overdue/upcoming)
- ✅ **Implementado**: Menu dinâmico configurável
- 🔄 **Planejado**: Dashboard de estatísticas pessoais
- 🔄 **Planejado**: Notificações de atividades próximas

### Menu Principal
**Componente**: Menu lateral overlay
**Acesso**: Usuários autenticados

#### **Layout**
```
┌─────────────────────┐
│ Menu           [×]  │
├─────────────────────┤
│ 📋 Atividades       │
│ 👥 Membros          │
│ 📊 Relatórios       │
│ 🎮 Gamificação      │
│ 📦 Materiais        │
│ ⚙️ Configurações    │
│ 📄 Ajuda           │
└─────────────────────┘
```

#### **Funcionalidades**
- ✅ **Implementado**: Menu configurável via planilha
- ✅ **Implementado**: Controle de permissões por papel
- ✅ **Implementado**: Ícones e ordenação personalizáveis
- ✅ **Implementado**: Ações: route, function, external
- 🔄 **Planejado**: Submenus hierárquicos

---

## Gestão de Atividades

### Lista de Atividades
**Rota**: `#/dash` (view principal)
**Acesso**: Todos os usuários

#### **Funcionalidades por Card**
```
┌─────────────────────────────────────┐
│ 🎯 [Status] [Categoria Badge]       │
│                                     │
│ Título da Atividade                 │
│ Descrição detalhada...              │
│                                     │
│ 👤 Responsável: João Silva          │
│ 📅 Data: 15/09/2024 - ⚠️ Atrasada  │
│                                     │
│ 💬 Última ação de Maria em          │
│    14/09/2024 às 16:30             │
│                                     │
│               [Concluir] [Alterar]  │
└─────────────────────────────────────┘
```

#### **Estados de Atividade**
- **🟡 Pendente**: Atividade criada, aguardando execução
- **🟢 Concluída**: Atividade finalizada
- **🔴 Atrasada**: Data vencida e ainda pendente
- **🟠 Próxima**: Vence nos próximos 7 dias

### Criação/Edição de Atividade
**Rota**: `#/new` (criação) / `#/edit?id=ACT-001` (edição)
**Acesso**: Usuários com permissão

#### **Layout**
```
┌─────────────────────────────────────┐
│ ← Nova Atividade               [×]  │
├─────────────────────────────────────┤
│                                     │
│ Título*                             │
│ ┌─────────────────────────────────┐ │
│ │ Ex.: Reunião semanal            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Categoria                           │
│ ┌─────────────────────────────────┐ │
│ │ 📋 Reunião            [v]       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Descrição                           │
│ ┌─────────────────────────────────┐ │
│ │ Detalhes opcionais...           │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Data/Hora          Responsável      │
│ ┌─────────────┐   ┌───────────────┐ │
│ │15/09/2024   │   │João Silva [v] │ │
│ └─────────────┘   └───────────────┘ │
│                                     │
│              [Cancelar] [Salvar]    │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- ✅ **Implementado**: Formulário responsivo
- ✅ **Implementado**: Seleção de categoria
- ✅ **Implementado**: Seleção de responsável
- ✅ **Implementado**: Validação de campos obrigatórios
- ✅ **Implementado**: Modo edição com dados pré-carregados
- 🔄 **Planejado**: Seleção de participantes
- 🔄 **Planejado**: Upload de imagens
- 🔄 **Planejado**: Repetição de atividades

### Detalhes da Atividade
**Rota**: `#/activity?id=ACT-001`
**Acesso**: Participantes e organizadores

#### **Layout**
```
┌─────────────────────────────────────┐
│ ← Reunião Semanal              [×]  │
├─────────────────────────────────────┤
│ 📋 Reunião • 🟡 Pendente            │
│                                     │
│ 📅 15/09/2024 às 14:00              │
│ 📍 Sala de reuniões                 │
│ 👤 Organizador: João Silva          │
│                                     │
│ ──── DESCRIÇÃO ────                 │
│ Reunião semanal para alinhamento    │
│ dos projetos em andamento...        │
│                                     │
│ ──── PARTICIPANTES ────             │
│ ✅ João Silva (organizador)         │
│ ❓ Maria Santos (convidada)         │
│ ✅ Pedro Lima (confirmado)          │
│ ❌ Ana Costa (ausente)              │
│                                     │
│ ──── AÇÕES ────                     │
│ [📷 Adicionar Foto]                 │
│ [📝 Adicionar Relato]               │
│ [✅ Marcar como Concluída]          │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Planejado**: Visualização completa da atividade
- 🔄 **Planejado**: Lista de participantes com status
- 🔄 **Planejado**: Upload de fotos
- 🔄 **Planejado**: Adição de relatos
- 🔄 **Planejado**: Check-in de presença

### Calendário de Atividades
**Componente**: Integrado ao dashboard
**Acesso**: Todos os usuários

#### **Layout**
```
┌─────────────────────────────────────┐
│ Setembro 2024              [< >]    │
├─────────────────────────────────────┤
│ D  S  T  Q  Q  S  S              │
│ 1  2  3  4  5  6  7              │
│ 8  9 10 11 12 13 14              │
│15●16 17●18 19 20 21              │ ● = atividade
│22 23 24 25 26 27 28              │
│29 30                             │
│                                     │
│ Legenda:                            │
│ 🔴 Atrasadas  🟠 Próximas          │
│ 🟢 Futuras    ▣ Selecionadas       │
│                                     │
│ [Limpar] [Padrão]                   │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- ✅ **Implementado**: Visualização mensal
- ✅ **Implementado**: Marcação de atividades por data
- ✅ **Implementado**: Seleção múltipla de datas
- ✅ **Implementado**: Filtro de atividades por datas selecionadas
- ✅ **Implementado**: Sistema de cores por urgência
- 🔄 **Planejado**: Visualização semanal/diária
- 🔄 **Planejado**: Drag & drop para reagendar

---

## Gestão de Membros

### Lista de Membros
**Rota**: `#/members`
**Acesso**: Administradores e secretaria

#### **Layout**
```
┌─────────────────────────────────────┐
│ 👥 Membros              [📊] [←]    │
├─────────────────────────────────────┤
│                                     │
│ ──── FILTROS ────                   │
│ Nome: [________] Dojo: [Todos v]     │
│ Cargo: [Todos v] Status: [Ativo v]  │
│ [Limpar] [Aplicar]                  │
│                                     │
│ ──── RESUMO ────                    │
│ 45 membros encontrados              │
│ 40 ativos • 3 inativos • 2 licenc. │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 João Silva                   │ │
│ │ 📧 joao@email.com              │ │
│ │ 🥋 Faixa Preta • Instrutor     │ │
│ │ 📅 Ingresso: Jan/2020          │ │
│ │ 🟢 Ativo                       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 Maria Santos                 │ │
│ │ ...                             │ │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Planejado**: Lista paginada de membros
- 🔄 **Planejado**: Filtros por nome, dojo, cargo, status
- 🔄 **Planejado**: Busca em tempo real
- 🔄 **Planejado**: Exportação para Excel/PDF
- 🔄 **Planejado**: Estatísticas resumidas

### Perfil do Membro
**Rota**: `#/member?id=MBR-001`
**Acesso**: O próprio membro, superior hierárquico, admin

#### **Layout**
```
┌─────────────────────────────────────┐
│ ← João Silva                   [✏️] │
├─────────────────────────────────────┤
│     ┌─────────┐                     │
│     │  📷     │  João Silva         │
│     │ Foto    │  🥋 Faixa Preta     │
│     └─────────┘  📧 joao@email.com  │
│                  📱 (11) 99999-9999 │
│                                     │
│ ──── DADOS PESSOAIS ────            │
│ Nascimento: 15/03/1985              │
│ Endereço: Rua A, 123...             │
│ Ingresso: Janeiro/2020              │
│ Status: 🟢 Ativo                    │
│                                     │
│ ──── ATIVIDADES ────                │
│ Participações este mês: 8           │
│ Última atividade: 10/09/2024        │
│ Taxa de presença: 95%               │
│                                     │
│ ──── GAMIFICAÇÃO ────               │
│ Pontos totais: 1.250                │
│ Ranking mensal: #3                  │
│ Última prática: Kata - 12/09        │
│                                     │
│ ──── HISTÓRICO ────                 │
│ [Ver atividades] [Ver práticas]     │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Planejado**: Dados pessoais completos
- 🔄 **Planejado**: Histórico de atividades
- 🔄 **Planejado**: Estatísticas de participação
- 🔄 **Planejado**: Integração com gamificação
- 🔄 **Planejado**: Upload de foto
- 🔄 **Planejado**: Edição de dados (com permissões)

### Organograma
**Rota**: `#/organization`
**Acesso**: Líderes (visualizam seu grupo), admins (visualizam tudo)

#### **Layout**
```
┌─────────────────────────────────────┐
│ 🌳 Organograma                 [←]  │
├─────────────────────────────────────┤
│                                     │
│         ┌─────────────┐             │
│         │ DOJO MATRIZ │             │
│         │ João Silva  │             │
│         └─────────────┘             │
│              │                      │
│    ┌─────────┼─────────┐           │
│    │         │         │           │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │Grupo │ │Grupo │ │Grupo │         │
│ │ A    │ │ B    │ │ C    │         │
│ │Maria │ │Pedro │ │ Ana  │         │
│ └──────┘ └──────┘ └──────┘         │
│   │        │        │              │
│  (5)      (8)      (3)             │ (nº membros)
│                                     │
│ ── LEGENDA ──                       │
│ 👑 Líder  👥 Membros  📊 Stats      │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Futuro**: Visualização hierárquica em árvore
- 🔄 **Futuro**: Expansão/colapso de grupos
- 🔄 **Futuro**: Filtro por status (ativo/inativo)
- 🔄 **Futuro**: Estatísticas por grupo
- 🔄 **Futuro**: Permissões baseadas na hierarquia

---

## Sistema de Participação

### Convites para Atividades
**Componente**: Integrado à criação de atividades
**Acesso**: Organizadores de atividades

#### **Layout**
```
┌─────────────────────────────────────┐
│ 👥 Participantes                    │
├─────────────────────────────────────┤
│                                     │
│ ──── CONVIDAR ────                  │
│ Por grupo:                          │
│ ☑️ Grupo A (5 membros)             │
│ ☐ Grupo B (8 membros)              │
│ ☐ Grupo C (3 membros)              │
│                                     │
│ Por membro individual:              │
│ 🔍 [Buscar membro...]               │
│ ☑️ João Silva                      │
│ ☑️ Maria Santos                    │
│ ☐ Pedro Lima                       │
│                                     │
│ ──── CONVIDADOS (3) ────            │
│ 👤 João Silva (Grupo A)            │
│ 👤 Maria Santos (Grupo A)          │
│ 👤 Ana Costa (Individual)          │
│                                     │
│ [📤 Enviar Convites]               │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Planejado**: Seleção por grupos ou individual
- 🔄 **Planejado**: Busca de membros em tempo real
- 🔄 **Planejado**: Preview dos convidados
- 🔄 **Planejado**: Envio automático de notificações
- 🔄 **Planejado**: Modelos de convite personalizáveis

### Confirmação de Presença
**Rota**: `#/invites` (para o membro convidado)
**Acesso**: Membros convidados

#### **Layout**
```
┌─────────────────────────────────────┐
│ 📨 Meus Convites               [←]  │
├─────────────────────────────────────┤
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 📋 Reunião Semanal             │ │
│ │ 📅 15/09/2024 às 14:00         │ │
│ │ 📍 Sala de reuniões            │ │
│ │ 👤 Organizador: João Silva     │ │
│ │                                │ │
│ │ Status: ❓ Aguardando resposta │ │
│ │                                │ │
│ │ [✅ Confirmar] [❌ Recusar]   │ │
│ │ [👁️ Ver detalhes]            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🎯 Treino Técnico              │ │
│ │ Status: ✅ Confirmado          │ │
│ │ ...                            │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Planejado**: Lista de convites pendentes
- 🔄 **Planejado**: Confirmação/recusa com um clique
- 🔄 **Planejado**: Histórico de respostas
- 🔄 **Planejado**: Notificações push (futuro PWA)
- 🔄 **Planejado**: Comentários opcionais na resposta

### Check-in/Check-out
**Componente**: Durante a atividade
**Acesso**: Organizadores e participantes

#### **Layout**
```
┌─────────────────────────────────────┐
│ ✅ Check-in: Reunião Semanal       │
├─────────────────────────────────────┤
│                                     │
│ 📅 Hoje, 15/09/2024 - 14:00        │
│ 📍 Sala de reuniões                 │
│                                     │
│ ──── PARTICIPANTES ────             │
│ ✅ João Silva      14:00 ●         │ ● = presente
│ ✅ Maria Santos    14:02 ●         │
│ ❓ Pedro Lima      -- ○            │ ○ = ausente
│ ❌ Ana Costa       RECUSOU          │
│                                     │
│ ──── AÇÕES RÁPIDAS ────             │
│ [📷 Tirar Foto]                    │
│ [✅ Marcar Todos Presentes]        │
│ [📝 Adicionar Observação]          │
│                                     │
│ [🏁 Finalizar Atividade]           │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Planejado**: Check-in automático por proximidade (GPS)
- 🔄 **Planejado**: Check-in manual pelo organizador
- 🔄 **Planejado**: QR Code para check-in rápido
- 🔄 **Planejado**: Fotos durante a atividade
- 🔄 **Planejado**: Relatório automático de presença

---

## Relatórios

### Dashboard de Relatórios
**Rota**: `#/reports`
**Acesso**: Líderes, secretaria, administradores

#### **Layout**
```
┌─────────────────────────────────────┐
│ 📊 Relatórios                  [←]  │
├─────────────────────────────────────┤
│                                     │
│ ──── RESUMO MENSAL ────             │
│ Setembro/2024                       │
│ 📋 12 atividades realizadas         │
│ 👥 85% participação média           │
│ 🎯 8 práticas aprovadas             │
│                                     │
│ ──── AÇÕES RÁPIDAS ────             │
│ [📝 Novo Relatório Mensal]         │
│ [📈 Ver Estatísticas]              │
│ [📄 Relatórios Anteriores]         │
│                                     │
│ ──── STATUS DOS GRUPOS ────         │
│ 🟢 Grupo A - Enviado (João)        │
│ 🟡 Grupo B - Rascunho (Maria)      │
│ 🔴 Grupo C - Pendente (Pedro)      │
│                                     │
│ [📊 Dashboard Executivo]           │
└─────────────────────────────────────┘
```

### Criação de Relatório Mensal
**Rota**: `#/reports/new`
**Acesso**: Líderes de grupo

#### **Funcionalidades**
- 🔄 **Futuro**: Editor de texto rich
- 🔄 **Futuro**: Dados automáticos de atividades
- 🔄 **Futuro**: Inserção de fotos e evidências
- 🔄 **Futuro**: Templates pré-definidos
- 🔄 **Futuro**: Salvamento automático (rascunho)

### Aprovação de Relatórios
**Rota**: `#/reports/approve`
**Acesso**: Secretaria, administradores

#### **Funcionalidades**
- 🔄 **Futuro**: Lista de relatórios pendentes
- 🔄 **Futuro**: Visualização lado a lado
- 🔄 **Futuro**: Comentários e solicitação de ajustes
- 🔄 **Futuro**: Aprovação em lote
- 🔄 **Futuro**: Histórico de versões

---

## Gamificação

### Catálogo de Práticas
**Rota**: `#/practices`
**Acesso**: Todos os usuários

#### **Layout**
```
┌─────────────────────────────────────┐
│ 🎮 Práticas                    [←]  │
├─────────────────────────────────────┤
│                                     │
│ ──── CATEGORIAS ────                │
│ [Todas] [Kata] [Kumite] [Físico]    │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🥋 Kata Heian Shodan           │ │
│ │ ⭐ 10 pontos                   │ │
│ │ 📝 Execução completa do kata   │ │
│ │ [🎯 Registrar Prática]         │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 💪 Flexões                     │ │
│ │ ⭐ 1 ponto (por 10 repetições)  │ │
│ │ 📝 Exercício de fortalecimento │ │
│ │ [🎯 Registrar Prática]         │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Lançamento de Práticas
**Rota**: `#/practices/log`
**Acesso**: Todos os membros

#### **Layout**
```
┌─────────────────────────────────────┐
│ 🎯 Registrar Prática           [←]  │
├─────────────────────────────────────┤
│                                     │
│ Prática                             │
│ ┌─────────────────────────────────┐ │
│ │ 🥋 Kata Heian Shodan       [v] │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Data da Prática                     │
│ ┌─────────────────────────────────┐ │
│ │ 15/09/2024                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Quantidade/Repetições               │
│ ┌─────────────────────────────────┐ │
│ │ 1 (execução completa)          │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Observações                         │
│ ┌─────────────────────────────────┐ │
│ │ Executado com boa técnica...    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💡 Esta prática vale 10 pontos     │
│ ⏱️ Aguardará aprovação do líder     │
│                                     │
│ [📤 Enviar para Aprovação]         │
└─────────────────────────────────────┘
```

### Ranking e Pontuação
**Rota**: `#/ranking`
**Acesso**: Todos os usuários

#### **Layout**
```
┌─────────────────────────────────────┐
│ 🏆 Ranking                     [←]  │
├─────────────────────────────────────┤
│                                     │
│ [Este Mês] [Geral] [Meu Grupo]      │
│                                     │
│ ──── SETEMBRO 2024 ────             │
│                                     │
│ 🥇 1º João Silva      1.250 pts     │
│    🥋 15 katas • 💪 50 flexões      │
│                                     │
│ 🥈 2º Maria Santos   1.100 pts      │
│    🥋 12 katas • 🏃 10 corridas     │
│                                     │
│ 🥉 3º Pedro Lima      980 pts       │
│    🥋 10 katas • 💪 40 flexões      │
│                                     │
│ ──── SUA POSIÇÃO ────               │
│ 📍 5º Você            750 pts       │
│    🥋 8 katas • 💪 25 flexões       │
│                                     │
│ 🎯 Próxima meta: 4º lugar (50 pts)  │
│                                     │
│ [📊 Meu Histórico]                 │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Futuro**: Rankings por período
- 🔄 **Futuro**: Rankings por categoria
- 🔄 **Futuro**: Rankings por grupo
- 🔄 **Futuro**: Badges e conquistas
- 🔄 **Futuro**: Metas pessoais e desafios

---

## Controle de Materiais

### Estoque de Materiais
**Rota**: `#/materials`
**Acesso**: Administradores, responsáveis por materiais

#### **Layout**
```
┌─────────────────────────────────────┐
│ 📦 Materiais                   [←]  │
├─────────────────────────────────────┤
│                                     │
│ [➕ Novo Material] [📊 Relatório]   │
│                                     │
│ 🔍 [Buscar materiais...]            │
│ [Todos] [Baixo Estoque] [Inativos]  │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🥋 Kimono Infantil              │ │
│ │ Estoque: 15 UN                  │ │
│ │ Mínimo: 10 UN ✅               │ │
│ │ Valor: R$ 85,00                 │ │
│ │ [📝] [📦 Movimentar]           │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🥊 Luvas de Kumite              │ │
│ │ Estoque: 3 PAR                  │ │
│ │ Mínimo: 5 PAR ⚠️               │ │ ⚠️ = abaixo do mínimo
│ │ Valor: R$ 120,00                │ │
│ │ [📝] [📦 Movimentar]           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### Movimentação de Materiais
**Rota**: `#/materials/move?id=MAT-001`
**Acesso**: Responsáveis por materiais

#### **Layout**
```
┌─────────────────────────────────────┐
│ 📦 Movimentar: Kimono Infantil [←] │
├─────────────────────────────────────┤
│                                     │
│ Estoque Atual: 15 UN                │
│                                     │
│ Tipo de Movimentação                │
│ ● Entrada  ○ Saída  ○ Ajuste       │
│                                     │
│ Quantidade                          │
│ ┌─────────────────────────────────┐ │
│ │ 5                               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Motivo                              │
│ ┌─────────────────────────────────┐ │
│ │ Compra de reposição             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 💡 Novo estoque: 20 UN              │
│                                     │
│ [📦 Confirmar Movimentação]        │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Futuro**: Entrada, saída e ajustes de estoque
- 🔄 **Futuro**: Histórico completo de movimentações
- 🔄 **Futuro**: Alertas de estoque mínimo
- 🔄 **Futuro**: Relatórios de custo e valor do estoque
- 🔄 **Futuro**: Código de barras para facilitar movimentação

---

## Configurações

### Configurações do Sistema
**Rota**: `#/settings`
**Acesso**: Administradores

#### **Layout**
```
┌─────────────────────────────────────┐
│ ⚙️ Configurações               [←]  │
├─────────────────────────────────────┤
│                                     │
│ ──── SISTEMA ────                   │
│ Nome do Dojo                        │
│ ┌─────────────────────────────────┐ │
│ │ Dojo Tradicional Karate-Do      │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Expiração de Sessão (minutos)      │
│ ┌─────────────────────────────────┐ │
│ │ 120                             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ──── ATIVIDADES ────                │
│ Dias para alerta de vencimento      │
│ ┌─────────────────────────────────┐ │
│ │ 7                               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Permitir auto-conclusão             │
│ ☑️ Sim  ☐ Não                      │
│                                     │
│ ──── GAMIFICAÇÃO ────               │
│ Sistema ativo                       │
│ ☑️ Sim  ☐ Não                      │
│                                     │
│ Período de ranking                  │
│ ● Mensal  ○ Bimestral  ○ Anual    │
│                                     │
│ [💾 Salvar Configurações]          │
└─────────────────────────────────────┘
```

### Gestão de Usuários
**Rota**: `#/users`
**Acesso**: Administradores

#### **Layout**
```
┌─────────────────────────────────────┐
│ 👥 Usuários                    [←]  │
├─────────────────────────────────────┤
│                                     │
│ [➕ Novo Usuário] [📊 Relatório]    │
│                                     │
│ 🔍 [Buscar usuários...]             │
│ [Todos] [Ativos] [Inativos] [Admin] │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 admin                        │ │
│ │ 📛 João Silva (Administrador)   │ │
│ │ 📧 joao@dojo.com.br            │ │
│ │ 🟢 Ativo • Último acesso: hoje  │ │
│ │ [📝] [🔑 Reset PIN] [🚫]       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 👤 secretaria                   │ │
│ │ 📛 Maria Santos (Secretária)    │ │
│ │ 📧 maria@dojo.com.br           │ │
│ │ 🟢 Ativo • Último acesso: ontem │ │
│ │ [📝] [🔑 Reset PIN] [🚫]       │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Planejado**: CRUD completo de usuários
- 🔄 **Planejado**: Definição de papéis e permissões
- 🔄 **Planejado**: Reset de PIN
- 🔄 **Planejado**: Logs de acesso por usuário
- 🔄 **Planejado**: Vinculação com cadastro de membros

---

## Componentes Transversais

### Sistema de Notificações
**Componente**: Toast/Banner
**Acesso**: Todos os usuários

#### **Tipos de Notificação**
```
┌─────────────────────────────────────┐
│ ✅ Sucesso                          │
│ Atividade criada com sucesso!       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ⚠️ Atenção                          │
│ Você tem 3 convites pendentes       │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ❌ Erro                             │
│ Falha ao salvar. Tente novamente.   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 📅 Lembrete                         │
│ Reunião em 1 hora                   │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- ✅ **Implementado**: Toast notifications
- ✅ **Implementado**: Auto-dismiss temporizado
- ✅ **Implementado**: Tipos visuais diferentes
- 🔄 **Planejado**: Notificações push (PWA)
- 🔄 **Planejado**: Central de notificações
- 🔄 **Planejado**: Configuração de preferências

### Sistema de Loading
**Componente**: Estados de carregamento
**Acesso**: Todos os usuários

#### **Estados**
```
┌─────────────────────────────────────┐
│ [🔄 Carregando...]                 │ ← Botão loading
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│                                     │
│     ┌───┐ ┌───┐ ┌───┐              │ ← Skeleton cards
│     │░░░│ │░░░│ │░░░│              │
│     │░░░│ │░░░│ │░░░│              │
│     └───┘ └───┘ └───┘              │
│                                     │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔄 Carregando dados...              │ ← Loading overlay
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- ✅ **Implementado**: Loading em botões
- ✅ **Implementado**: Skeleton loading para listas
- ✅ **Implementado**: Spinner animations
- 🔄 **Planejado**: Loading progressivo
- 🔄 **Planejado**: Retry automático em falhas

### Sistema de Confirmação
**Componente**: Modais de confirmação
**Acesso**: Todos os usuários

#### **Layout**
```
┌─────────────────────────────────────┐
│                                     │
│   ┌─────────────────────────────┐   │
│   │ ⚠️ Confirmar Ação           │   │
│   ├─────────────────────────────┤   │
│   │                             │   │
│   │ Tem certeza que deseja      │   │
│   │ excluir esta atividade?     │   │
│   │                             │   │
│   │ Esta ação não pode ser      │   │
│   │ desfeita.                   │   │
│   │                             │   │
│   │ [Cancelar] [Confirmar]      │   │
│   └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Planejado**: Confirmações para ações críticas
- 🔄 **Planejado**: Diferentes tipos de alerta
- 🔄 **Planejado**: Animações suaves
- 🔄 **Planejado**: Suporte a teclado (ESC/Enter)

### Sistema de Busca Global
**Componente**: Search bar global
**Acesso**: Todos os usuários

#### **Layout**
```
┌─────────────────────────────────────┐
│ 🔍 [Buscar atividades, membros...] │
├─────────────────────────────────────┤
│                                     │
│ ──── RESULTADOS PARA "joão" ────    │
│                                     │
│ 👤 MEMBROS (2)                      │
│ • João Silva (Instrutor)            │
│ • João Costa (Aluno)                │
│                                     │
│ 📋 ATIVIDADES (3)                   │
│ • Reunião com João - 15/09          │
│ • Treino - responsável João         │
│ • Avaliação João Costa              │
│                                     │
│ [🔍 Ver todos os resultados]        │
└─────────────────────────────────────┘
```

#### **Funcionalidades**
- 🔄 **Futuro**: Busca em tempo real
- 🔄 **Futuro**: Busca em múltiplas entidades
- 🔄 **Futuro**: Histórico de buscas
- 🔄 **Futuro**: Filtros avançados
- 🔄 **Futuro**: Sugestões inteligentes

---

## 📋 Resumo de Status de Implementação

### ✅ **Implementado (MVP v0.1)**
- Sistema de autenticação
- Dashboard de atividades com filtros
- Criação/edição de atividades
- Sistema de categorias
- Calendário básico
- Menu dinâmico
- Interface responsiva
- Sistema de toasts

### 🔄 **Em Desenvolvimento (v0.2)**
- Sistema de participação em atividades
- Gestão básica de membros
- Melhorias de UX/UI

### 🔄 **Planejado (v0.3+)**
- Relatórios mensais
- Sistema de gamificação
- Controle de materiais
- Organograma completo

### 🔄 **Futuro (v1.0+)**
- PWA com notificações push
- Sistema de busca global
- Importação de ondas
- Dashboard executivo avançado

---

## 🎯 **Princípios de Design**

### **Mobile-First**
- Todas as telas são projetadas primeiro para mobile
- Expansão progressiva para tablet e desktop
- Touch-friendly com alvos de toque adequados

### **Consistência Visual**
- Padrão de cores e tipografia unificado
- Componentes reutilizáveis
- Ícones padronizados em todo o sistema

### **Feedback Imediato**
- Estados de loading visíveis
- Confirmações de ações
- Indicadores de progresso

### **Acessibilidade**
- Contraste adequado
- Navegação por teclado
- Labels descritivos
- Suporte a leitores de tela

Essa especificação serve como guia para desenvolvimento e pode ser atualizada conforme novas funcionalidades são implementadas ou modificadas.do**: Login com usuário + PIN
- ✅ **Implementado**: Validação em tempo real
- ✅ **Implementado**: Feedback de erro/sucesso
- ✅ **Implementado**: Enter para submeter
- 🔄 **Planejado**: Lembrar usuário
- 🔄 **Planejado**: Recuperação de senha

#### **Estados**
- **Carregando**: Botão com spinner durante autenticação
- **Erro**: Mensagem vermelha com motivo da falha
- **Sucesso**: Redirecionamento automático para dashboard

---

## Dashboard Principal

### Tela do Usuário
**Rota**: `#/dash`
**Acesso**: Usuários autenticados

#### **Layout Desktop**
```
┌─────────────────────────────────────────────────────┐
│ 🥋 Dojotai    [🔍] [📅] [➕Nova] [☰Menu] [Sair]   │
├─────────────────────────────────────────────────────┤
│                                                     │
│ 📅 [Calendário]    ───────────────────              │
│                                                     │
│ [Todas] [Pendentes] [Concluídas] | [Minhas tarefas] │
│                                                     │
│ 🔍 [Filtro por usuário...]                          │
│                                                     │
│ 🏷️ [Todas] [📋Reunião] [🎯Treino] [📝Admin]        │
│                                                     │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐     │
│ │ 📋 Reunião  │ │ 🎯 Treino   │ │ 📝 Admin    │     │
│ │ Reunião ... │ │ Treino ...  │ │ Relatório...│     │
│ │ 👤 João     │ │ 👤 Maria    │ │ 👤 Pedro    │     │
│ │ [Concluir]  │ │ [Concluir]  │ │ [Concluir]  │     │
│ │ [Alterar]   │ │ [Alterar]   │ │ [Alterar]   │     │
│ └─────────────┘ └─────────────┘ └─────────────┘     │
└─────────────────────────────────────────────────────┘
```

#### **Layout Mobile**
```
┌─────────────────────┐
│ 🥋 Dojotai     [☰] │
├─────────────────────┤
│ [📅] [➕] [Sair]   │
│                     │
│ ──── FILTROS ────   │
│ [Todas][Pendentes]  │
│ [Minhas tarefas]    │
│                     │
│ 🔍 [Buscar...]      │
│                     │
│ 🏷️ [Todas][📋][🎯] │
│                     │
│ ┌─────────────────┐ │
│ │ 📋 Pendente     │ │
│ │ Reunião semanal │ │
│ │ 👤 João Silva   │ │
│ │ 📅 Hoje, 14:00  │ │
│ │                 │ │
│ │ [Concluir]      │ │
│ │ [Alterar]       │ │
│ └─────────────────┘ │
│                     │
│ ┌─────────────────┐ │
│ │ 🎯 Próxima      │ │
│ │ Treino técnico  │ │
│ │ ...             │ │
└─────────────────────┘
```

#### **Funcionalidades**
- ✅ **Implementado**: Lista de atividades em cards
- ✅ **Implementado**: Filtros por status (Todas/Pendentes/Concluídas)
- ✅ **Implementado**: Filtro "Minhas tarefas"
- ✅ **Implementado**: Filtro por nome de usuário
- ✅ **Implementado**: Filtro por categoria de atividade
- ✅ **Implementado**: Calendário com seleção de datas
- ✅ **Implementado**: Botões Concluir/Alterar atividades
- ✅ **Implementa