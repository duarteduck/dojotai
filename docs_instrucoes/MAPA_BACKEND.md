# 📦 MAPA DO BACKEND - Sistema Dojotai

**Versão:** 2.0.0-modular | **Atualizado:** 26/10/2025

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

Documentação detalhada da estrutura do **Backend** (15 arquivos Google Apps Script).

**🔙 Voltar para:** [MAPA_CODIGO.md](../MAPA_CODIGO.md)

---

## 📊 VISÃO GERAL

```
BACKEND: 15 arquivos (10.141 linhas)
├── Core (6 arquivos) - Núcleo do sistema
├── Business (8 arquivos) - Lógica de negócio
└── API (4 arquivos) - Pontos de entrada
```

---

## 🔴 src/00-core/ (NÚCLEO - 6 arquivos)

```
src/00-core/
├── 00_config.gs (327 linhas)
│   └── Configurações centralizadas
│
├── database_manager.gs (3.688 linhas) ⭐
│   ├── CRUD Completo
│   ├── Cache Multi-Camada
│   ├── Logger Integrado
│   ├── ValidationEngine
│   └── Transaction Support
│
├── data_dictionary.gs (1.863 linhas) ⭐
│   └── Schema de 12 tabelas
│
├── performance_monitor.gs (775 linhas)
│   └── Métricas de performance
│
├── session_manager.gs (509 linhas)
│   └── Gestão de sessões
│
└── utils.gs (199 linhas)
    └── Funções auxiliares gerais
```

---

## 🟢 src/01-business/ (LÓGICA DE NEGÓCIO - 8 arquivos)

```
src/01-business/
├── activities.gs (533 linhas)
│   └── CRUD de atividades
│
├── activities_categories.gs (136 linhas)
│   └── Gestão de categorias
│
├── auth.gs (235 linhas)
│   └── Autenticação SHA-256
│
├── members.gs (280 linhas)
│   └── Gestão de membros
│
├── menu.gs (45 linhas)
│   └── Menu dinâmico
│
├── participacoes.gs (1.222 linhas) ⭐
│   └── Sistema de alvos e participações
│
├── practices.gs ⭐ NOVO - Sistema de Práticas Diárias
│   ├── _loadAvailablePractices(memberId)
│   ├── _loadPracticesByMemberAndDateRange(memberId, startDate, endDate)
│   ├── _savePracticeCore(memberId, data, praticaId, quantidade)
│   ├── _saveObservationCore(memberId, data, observacao)
│   ├── _loadObservationByMemberAndDate(memberId, date)
│   └── _loadObservationsByDateRange(memberId, startDate, endDate)
│
└── vinculos.gs ⭐ NOVO - Sistema de Vínculos
    └── Gestão de vínculos usuário-membro
```

---

## 🔵 src/02-api/ (PONTOS DE ENTRADA - 4 arquivos)

```
src/02-api/
├── main.gs (11 linhas) ✅ ATIVO
│   ├── doGet(e) - Ponto de entrada web
│   └── include(filename) - Sistema de includes
│
├── usuarios_api.gs (833 linhas)
│   └── APIs de usuários e atividades (legado)
│
├── activities_api.gs ⭐ ATUALIZADO - APIs de Atividades
│   ├── completeActivity(sessionId, activityId, relato) - Modificado 26/10/2025
│   │   └── Aceita relato opcional (max 1000 chars)
│   ├── cancelActivityApi(sessionId, activityId, relato) - Novo 26/10/2025
│   │   ├── Permissão: Admin OU Responsável
│   │   ├── Relato obrigatório (min 10 chars, max 1000)
│   │   ├── Não cancela Concluída/Cancelada
│   │   └── Validações case-insensitive
│   └── Outras funções CRUD de atividades
│
├── practices_api.gs ⭐ NOVO - APIs de Práticas Diárias
│   ├── getAvailablePractices(sessionId, memberId)
│   ├── loadPracticesByDateRange(sessionId, memberId, startDate, endDate)
│   ├── savePractice(sessionId, memberId, data, praticaId, quantidade)
│   ├── saveObservation(sessionId, memberId, data, observacao)
│   ├── loadObservation(sessionId, memberId, date)
│   └── loadObservationsByDateRange(sessionId, memberId, startDate, endDate)
│
└── vinculos_api.gs ⭐ NOVO - APIs de Vínculos
    └── APIs de gestão de vínculos usuário-membro
```

**Total Backend:** 10.141 linhas em 15 arquivos

---

**📚 Voltar para:** [MAPA_CODIGO.md](../MAPA_CODIGO.md)
