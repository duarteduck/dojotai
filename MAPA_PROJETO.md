# 🗺️ MAPA DO PROJETO - Sistema Dojotai V2.0

**Atualizado:** 30/09/2025 | **Versão:** 3.0 - Pós-Auditoria Completa
**STATUS:** ✅ Estrutura Real Mapeada e Validada

---

## 🎯 VISÃO GERAL

Sistema de gestão de dojos baseado em Google Apps Script + Google Sheets.
- **Backend:** 15 arquivos .gs (10.141 linhas)
- **Frontend:** App monolítico + estrutura órfã (14.138 linhas)
- **Database:** 12 tabelas no Google Sheets
- **Status:** ✅ Funcional em produção

---

## 🏗️ ARQUITETURA - 3 CAMADAS

```
┌──────────────────────────────────────────┐
│    FRONTEND (App Monolítico)             │
│    app_migrated.html (7.399 linhas)      │
│    HTML + CSS + JavaScript               │
└──────────────────────────────────────────┘
              ⬇️ google.script.run
┌──────────────────────────────────────────┐
│    BACKEND (15 arquivos .gs)             │
│    Core + Business + APIs                │
└──────────────────────────────────────────┘
              ⬇️ DatabaseManager
┌──────────────────────────────────────────┐
│    DATABASE (12 tabelas)                 │
│    Google Sheets                         │
└──────────────────────────────────────────┘
```

---

## 📦 BACKEND - Estrutura Real

### 🔴 00-CORE/ (6 arquivos - NÃO MEXER SEM PERMISSÃO)

```
src/00-core/
├── 00_config.gs (327 linhas)
│   └── Configurações centralizadas do sistema
│
├── database_manager.gs (3.688 linhas) ⭐ CORAÇÃO DO SISTEMA
│   ├── CRUD completo (insert, query, update, delete)
│   ├── Logger integrado com anti-recursão
│   ├── Cache multi-camada
│   ├── ValidationEngine (FK, business rules)
│   └── Transaction support
│
├── data_dictionary.gs (1.863 linhas) ⭐ FONTE DA VERDADE
│   ├── Schema de 12 tabelas
│   ├── Validações de campos
│   ├── Foreign keys
│   └── Tipos de dados
│
├── performance_monitor.gs (775 linhas)
│   ├── Health score
│   ├── Métricas de performance
│   └── Relatórios avançados
│
├── session_manager.gs (509 linhas)
│   ├── Criação de sessões
│   ├── Validação de tokens
│   ├── Cleanup automático
│   └── Manutenção
│
└── utils.gs (199 linhas)
    ├── Funções auxiliares
    ├── Configuração dinâmica
    └── Utilitários gerais
```

### 🟢 01-BUSINESS/ (6 arquivos - Lógica de Negócio)

```
src/01-business/
├── activities.gs (533 linhas)
│   ├── listActivitiesApi()
│   ├── createActivity()
│   ├── updateActivity()
│   ├── completeActivity()
│   └── CRUD completo de atividades
│
├── activities_categories.gs (136 linhas)
│   ├── listCategoriasAtividadesApi()
│   ├── createCategory()
│   └── Gestão de categorias
│
├── auth.gs (235 linhas)
│   ├── authenticateUser()
│   ├── getCurrentUser()
│   ├── loginUser()
│   └── Sistema de autenticação SHA-256
│
├── members.gs (280 linhas)
│   ├── listMembersApi()
│   ├── searchMembersByCriteria()
│   ├── createMember()
│   └── Gestão de membros + tags
│
├── menu.gs (45 linhas)
│   ├── getMenuItems()
│   ├── buildMenu()
│   └── Menu dinâmico
│
└── participacoes.gs (1.222 linhas) ⭐ SISTEMA DE ALVOS
    ├── listParticipacoes()
    ├── saveParticipacaoDirectly()
    ├── defineTargets()
    └── Sistema completo de participação
```

### 🔵 02-API/ (3 arquivos - Endpoints)

```
src/02-api/
├── main.gs (12 linhas) ❌ DUPLICADO - REMOVER
│   └── Cópia idêntica de main_migrated.gs
│
├── main_migrated.gs (11 linhas) ✅ ATIVO
│   ├── doGet() - Ponto de entrada web
│   └── include() - Sistema de includes
│
└── usuarios_api.gs (833 linhas)
    ├── listUsuariosApi()
    ├── createActivity()
    ├── updateActivityWithTargets()
    └── APIs principais de usuários
```

**Total Backend:** 10.141 linhas em 15 arquivos

---

## 🎨 FRONTEND - Estrutura Real

### ✅ APLICAÇÃO PRINCIPAL (ATIVA)

```
RAIZ/
├── index.html (❓ status desconhecido - investigar)
│
└── app_migrated.html (7.399 linhas) ✅ APLICAÇÃO MONOLÍTICA
    ├── CSS (143 linhas)
    │   └── Design system completo
    │
    ├── HTML (2.225 linhas)
    │   ├── Login screen
    │   ├── Header + navigation
    │   ├── Dashboard
    │   ├── Activities page
    │   ├── Members page
    │   ├── Modals (participação, alvos, filtros)
    │   └── Empty states
    │
    └── JavaScript (5.020 linhas - 97 funções)
        ├── Auth & Session (7 funções)
        │   ├── checkAuthAndInit()
        │   ├── showLogin() / hideLogin()
        │   └── logout()
        │
        ├── Navigation (4 funções)
        │   ├── showTab()
        │   └── Tab management
        │
        ├── Activities (20+ funções)
        │   ├── loadActivities()
        │   ├── openActivityModal()
        │   ├── saveActivity()
        │   └── completeActivity()
        │
        ├── Sistema de Alvos (10+ funções) ⭐
        │   ├── toggleTargetsSection()
        │   ├── searchMembers()
        │   ├── toggleTargetSelection()
        │   └── Lista dupla (disponíveis/selecionados)
        │
        ├── Members (15+ funções)
        │   ├── loadMembers()
        │   ├── renderMembers()
        │   └── searchMembers()
        │
        ├── Participations (15+ funções)
        │   ├── openParticipantsModal()
        │   ├── togglePresence()
        │   └── saveParticipacao()
        │
        ├── Filters & Search (8 funções)
        │   ├── openFilterModal()
        │   ├── applyFilters()
        │   └── clearFilters()
        │
        └── Modals & UI (9 funções)
            ├── createModal()
            ├── closeModal()
            └── UI helpers
```

### ❌ ARQUIVOS ÓRFÃOS (NÃO UTILIZADOS)

```
src/ (ESTRUTURA ÓRFÃ - 6.739 linhas)
│
├── 03-shared/ (2 arquivos)
│   ├── app_api.html (841 linhas) ❌
│   │   └── API wrapper substituído por inline
│   └── app_ui.html (5.373 linhas) ❌
│       └── UI modular abandonada
│
├── 04-views/ (3 arquivos)
│   ├── view_activity_new.html (42 linhas) ❌
│   │   └── Modal inline em app_migrated
│   ├── view_member_detail.html (163 linhas) ❌
│   │   └── Funcionalidade não implementada
│   └── view_participacoes_modal.html (254 linhas) ❌
│       └── Modal inline em app_migrated
│
└── 05-components/ (1 arquivo)
    └── activityCard.html (66 linhas) ❌
        └── Renderização inline em app_migrated

⚠️ AÇÃO PENDENTE: Mover para _backup/ após validação
```

**Total Frontend:**
- Ativo: 7.399 linhas (app_migrated.html)
- Órfão: 6.739 linhas (28% não utilizado)
- Total: 14.138 linhas

---

## 🗄️ BANCO DE DADOS - 12 Tabelas

### 📊 CORE (5 tabelas principais)

```
1. usuarios (8 campos)
   PK: uid (gerado)
   ├── login, senha_hash (SHA-256)
   ├── nome, email
   ├── tipo_usuario (Admin, Secretaria, Líder, Usuário)
   ├── status (ativo/inativo)
   └── timestamps: criado_em, atualizado_em

2. atividades (15+ campos) ⭐ COM SISTEMA DE ALVOS
   PK: id (ACT-XXXX)
   ├── FK: id_categoria → categorias_atividades
   ├── titulo, descricao, local
   ├── data_hora, duracao
   ├── status (agendada/realizada/cancelada)
   ├── id_criador → usuarios.uid
   ├── qtd_alvos (calculado automaticamente)
   ├── alvos_nomes (concatenado automaticamente)
   └── timestamps: criado_em, atualizado_em

3. membros (12 campos)
   PK: codigo_sequencial (1, 2, 3...)
   ├── nome_completo, nome_exibicao
   ├── cpf, data_nascimento
   ├── email, telefone
   ├── status (ativo/inativo)
   ├── tags (sistema de tags múltiplas)
   ├── deleted (soft delete: '' ou 'x')
   └── timestamps: criado_em, atualizado_em

4. participacao (11 campos) ⭐ CRÍTICA PARA ALVOS
   PK: id (PART-XXXX)
   ├── FK: id_atividade → atividades.id
   ├── FK: id_membro → membros.codigo_sequencial
   ├── tipo: 'alvo' (definido antes) | 'extra' (adicionado depois)
   ├── confirmou (sim/não)
   ├── confirmado_em (timestamp)
   ├── participou (sim/não)
   ├── chegou_tarde, saiu_cedo (sim/não)
   ├── status_participacao (Confirmado, Presente, Ausente, etc)
   ├── deleted (soft delete: '' ou 'x')
   └── criado_em

5. sessoes (8 campos)
   PK: id (gerado)
   ├── FK: user_id → usuarios.uid
   ├── session_token (sess_timestamp_random)
   ├── device_info (JSON)
   ├── created_at, expires_at (8 horas)
   ├── last_activity
   ├── is_active (sim/não)
   └── invalidated_at
```

### 🔧 AUXILIARES (3 tabelas)

```
6. categorias_atividades (5 campos)
   PK: id
   ├── nome, descricao
   ├── cor_hex (para UI)
   └── timestamps

7. menu (7 campos)
   PK: id
   ├── label, route, icon
   ├── permissions (array)
   ├── ordem, ativo
   └── criado_em

8. planilhas (5 campos) - Metadata
   PK: nome (nome da tabela)
   ├── ssid (spreadsheet ID)
   ├── aba (nome da sheet)
   ├── a1_range
   └── descricao
```

### 📈 MONITORAMENTO (4 tabelas)

```
9. system_logs (10 campos)
   PK: id (LOG-timestamp-random)
   ├── level (DEBUG, INFO, WARN, ERROR)
   ├── context, message
   ├── data (JSON)
   ├── user_id, session_id
   ├── stack_trace
   └── timestamp (UTC-3)

10. performance_logs (13 campos)
    PK: id
    ├── operation_name, operation_type
    ├── start_time, end_time, duration_ms
    ├── cache_hit, cache_key
    ├── query_params (JSON)
    ├── result_count, memory_used
    └── timestamp

11. system_health (planejado)
    └── Relatórios diários de saúde

12. notificacoes/preferencias/historico (planejados)
    └── A implementar conforme roadmap
```

### 🔗 Relacionamentos

```
usuarios (1) ──→ (N) sessoes
usuarios (1) ──→ (N) atividades (como criador)
atividades (1) ──→ (N) participacao
membros (1) ──→ (N) participacao ⭐ SISTEMA DE ALVOS
categorias_atividades (1) ──→ (N) atividades
```

---

## 🔄 FLUXOS DE DADOS PRINCIPAIS

### 1. Login
```
Frontend: showLogin()
    ↓
google.script.run.authenticateUser(login, senha)
    ↓
Backend: auth.gs → loginUser()
    ↓
session_manager.gs → createSession()
    ↓
database_manager.gs → insert('sessoes', ...)
    ↓
Retorno: session_token + user_data
    ↓
Frontend: hideLogin() + initApp()
```

### 2. Sistema de Alvos ⭐
```
Frontend: toggleTargetsSection()
    ↓
searchMembers() + filtros aplicados
    ↓
google.script.run.searchMembersByCriteria(filters)
    ↓
Backend: members.gs → query filtrada
    ↓
database_manager.gs → query('membros', filters)
    ↓
Retorno: lista de membros
    ↓
Frontend: Renderiza listas duplas
    - targetsResults (disponíveis para seleção)
    - targetsSelectedContainer (já selecionados)
    ↓
toggleTargetSelection() → Move entre listas
    ↓
saveActivity() → Salva com alvos
    ↓
google.script.run.defineTargets(activityId, memberIds)
    ↓
Backend: participacoes.gs
    ↓
database_manager.gs → batch insert('participacao', tipo='alvo')
```

### 3. Participação em Atividade
```
Frontend: openParticipantsModal(activityId)
    ↓
google.script.run.listParticipacoes(activityId)
    ↓
Backend: participacoes.gs
    ↓
database_manager.gs → query com JOIN
    participacao + membros + atividades
    ↓
Retorno: lista com detalhes completos
    ↓
Frontend: Renderiza modal com 3 abas
    - Alvos definidos
    - Participação efetiva
    - Estatísticas
    ↓
togglePresence() → Atualiza status
    ↓
google.script.run.saveParticipacaoDirectly()
    ↓
database_manager.gs → update('participacao', ...)
```

---

## 🚦 SEMÁFORO DE COMPLEXIDADE

### 🟢 FÁCIL (pode fazer sozinho)
- Ajustar CSS/estilos
- Melhorar mensagens de erro
- Adicionar logs de debug
- Modificar texto/labels
- Corrigir bugs em função específica (1 arquivo)

### 🟡 MÉDIO (pedir orientação)
- Criar nova tela/view
- Adicionar campo em formulário
- Modificar função existente
- Adicionar campo em tabela
- Criar novo componente

### 🔴 DIFÍCIL (SEMPRE pedir permissão)
- Mexer em src/00-core/*
- Alterar data_dictionary.gs
- Modificar database_manager.gs
- Alterar estrutura de dados
- Reorganizar arquivos/pastas
- Criar/deletar arquivos
- Fazer clasp push (deploy)
- Modificar mais de 3 arquivos numa tarefa

---

## 📚 DOCUMENTAÇÃO

### ✅ Documentação Ativa

```
RAIZ/
├── PENDENCIAS_E_ROADMAP_V2.md ⭐ FONTE DA VERDADE
│   └── Roadmap, status, próximas tarefas
│
├── ORIENTACAO_DIARIA.md
│   └── Guia diário de desenvolvimento
│
├── CLAUDE.md
│   └── Orientações para Claude Code
│
└── docs/
    ├── ARQUITETURA.md ⭐ ESTRUTURA TÉCNICA
    ├── DEVELOPMENT.md
    ├── CONFIGURACAO.md
    ├── TROUBLESHOOTING.md
    ├── API_REFERENCE.md (se existir)
    └── CHANGELOG.md
```

### ❌ Documentação Desatualizada

```
├── PENDENCIAS_E_ROADMAP.md (V1) ⚠️ ARQUIVAR
└── docs/roadmap_dojotai.md (2024) ⚠️ REMOVER
```

### 📁 Documentação Arquivada

```
docs/_archive_old_docs/ (17+ arquivos)
└── ⚠️ Revisar criteriosamente antes de deletar
```

---

## 🔍 ARQUIVOS ÓRFÃOS IDENTIFICADOS

### Lista Completa (7 arquivos - 6.751 linhas)

| Arquivo | Linhas | Motivo | Ação |
|---------|--------|--------|------|
| src/02-api/main.gs | 12 | Duplicata main_migrated.gs | 🗑️ Remover |
| src/03-shared/app_api.html | 841 | API inline em app_migrated | 📦 Backup |
| src/03-shared/app_ui.html | 5.373 | UI monolítica preferida | 📦 Backup |
| src/04-views/view_activity_new.html | 42 | Modal inline | 📦 Backup |
| src/04-views/view_member_detail.html | 163 | Não implementado | 📦 Backup |
| src/04-views/view_participacoes_modal.html | 254 | Modal inline | 📦 Backup |
| src/05-components/activityCard.html | 66 | Render inline | 📦 Backup |

**Status:** ⏳ Aguardando validação técnica (Claude Code - Fase 2)

---

## ⚠️ O QUE NÃO MEXER

### 🔴 ZONA VERMELHA (Nunca mexer sem permissão)

```
src/00-core/
├── database_manager.gs     ← CORAÇÃO DO SISTEMA
├── data_dictionary.gs      ← FONTE DA VERDADE
├── session_manager.gs      ← Sistema crítico
└── Todos os outros arquivos do core
```

### 🟡 ZONA AMARELA (Sempre perguntar antes)

```
- Criar ou deletar arquivos (.gs ou .html)
- Mover arquivos entre pastas
- Reorganizar estrutura
- Modificar mais de 3 arquivos
- Fazer deploy (clasp push)
- Arquivar ou mover documentação
```

### 🟢 ZONA VERDE (Pode modificar com cuidado)

```
- Bugs em funções específicas (1 arquivo)
- Ajustes de CSS/HTML
- Melhorar mensagens
- Adicionar logs (usando Logger)
- Criar funções auxiliares em arquivos existentes
```

---

## 📊 ESTATÍSTICAS DO PROJETO

### Métricas de Código
```
Backend (.gs):      10.141 linhas | 15 arquivos
Frontend (.html):   14.138 linhas | ~22 arquivos
  ├── Ativo:         7.399 linhas | 1 arquivo
  └── Órfão:         6.739 linhas | 7 arquivos (28%)
──────────────────────────────────────────────
Total:              24.279 linhas | ~37 arquivos
Código morto:        6.751 linhas | 28% do total
```

### Métricas de Qualidade
- **Health Score:** 100/100
- **Cache Hit Rate:** 45%+
- **Cobertura Testes:** 0% (não implementado)
- **Documentação:** 40% (comentários parciais)
- **Uptime:** 99.9%

### Funcionalidades Implementadas
- ✅ Sistema de autenticação (SHA-256)
- ✅ Gestão de sessões
- ✅ CRUD completo de atividades
- ✅ CRUD completo de membros
- ✅ Sistema de participação
- ✅ Sistema de Alvos V2.0 ⭐
- ✅ Filtros avançados
- ✅ Sistema de logs estruturados
- ✅ Performance monitoring
- ✅ Cache multi-camada

---

## 🔄 PRÓXIMOS PASSOS

### Fase 1: Documentação (EM ANDAMENTO)
- [x] Auditoria completa da estrutura
- [x] Mapeamento de código órfão
- [x] Atualização deste MAPA_PROJETO.md
- [ ] Consolidar documentação principal
- [ ] Atualizar CLAUDE_CODE_RULES.md

### Fase 2: Validação Técnica (AGUARDANDO)
- [ ] Claude Code: Busca exaustiva de referências
- [ ] Confirmar órfãos
- [ ] Mapear dependências
- [ ] Relatórios técnicos

### Fase 3: Limpeza (PLANEJADO)
- [ ] Mover órfãos para _backup/
- [ ] Remover duplicatas
- [ ] Testar sistema
- [ ] Deploy e validação

---

## 🎯 CHECKLIST ANTES DE QUALQUER MODIFICAÇÃO

```
[ ] Li o ORIENTACAO_DIARIA.md hoje?
[ ] Consultei o data_dictionary.gs?
[ ] Vou modificar MENOS de 3 arquivos?
[ ] A mudança NÃO afeta src/00-core/?
[ ] Tenho certeza que não vou quebrar nada?
[ ] Vou documentar a mudança?
[ ] NÃO vou mover/arquivar documentação sem permissão?
```

**Se marcou tudo ✅ → PODE FAZER**  
**Se algum ❌ → PERGUNTAR PRIMEIRO**

---

## 📞 QUANDO EM DÚVIDA

```
┌─────────────────────────────────────────┐
│                                         │
│      🛑  SEMPRE PERGUNTE ANTES  🛑      │
│                                         │
│  Especialmente para:                    │
│  • Criar/mover/deletar arquivos         │
│  • Modificar >1 arquivo                 │
│  • Mudanças em src/00-core/             │
│  • Reorganizar estrutura                │
│  • Quando não souber onde colocar algo  │
│                                         │
└─────────────────────────────────────────┘
```

---

**⚠️ MAPA ATUALIZADO PÓS-AUDITORIA COMPLETA - ESTRUTURA REAL VALIDADA**
**📅 Última atualização:** 30/09/2025
**🔍 Próxima revisão:** Após Fase 3 (limpeza de órfãos)