# 🗄️ MAPA DO DATABASE - Sistema Dojotai

**Versão:** 2.0.0-modular | **Atualizado:** 26/10/2025

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

Documentação detalhada da estrutura do **Database** (15 tabelas no Google Sheets).

**🔙 Voltar para:** [MAPA_CODIGO.md](../MAPA_CODIGO.md)

---

## 📊 VISÃO GERAL

```
DATABASE: 15 tabelas no Google Sheets
├── Core (5 tabelas) - Principais entidades
└── Auxiliares (10 tabelas) - Suporte e configuração
```

---

## 📋 Tabelas Core (5 principais)

```
1. usuarios (9 campos)
   PK: uid (U001, U002...)
   ├── uid - Identificador único do usuário
   ├── nome_completo
   ├── email
   ├── senha_hash - SHA-256
   ├── ativo - STATUS (true/false)
   ├── data_criacao
   ├── data_atualizacao
   ├── criado_por
   └── atualizado_por

2. atividades (15+ campos) ⭐ ATUALIZADO - 26/10/2025
   PK: id (ACT-0001, ACT-0002...)
   FK: atribuido_uid → usuarios.uid
   ├── id - ID da atividade
   ├── titulo
   ├── descricao
   ├── data_atividade
   ├── hora_inicio
   ├── hora_fim
   ├── local
   ├── status - ENUM: 'Pendente', 'Concluida', 'Cancelada'
   ├── categoria_id → categorias_atividades.id
   ├── atribuido_uid → usuarios.uid (responsável)
   ├── relato - Novo campo (TEXT, max 1000) - Conclusão ou Cancelamento
   ├── criado_em
   ├── criado_uid
   ├── atualizado_em
   └── atualizado_uid

3. membros (20+ campos)
   PK: codigo_sequencial (1, 2, 3...)
   ├── codigo_sequencial - ID numérico
   ├── nome_completo
   ├── nome_social
   ├── data_nascimento
   ├── telefone
   ├── email
   ├── endereco
   ├── cidade
   ├── estado
   ├── cep
   ├── observacoes
   ├── ativo
   ├── data_cadastro
   ├── data_atualizacao
   └── ... outros campos

4. participacoes (12 campos) ⭐ SISTEMA DE ALVOS
   PK: id (PART-0001...)
   FK: id_atividade → atividades.id
   FK: id_membro → membros.codigo_sequencial
   ├── id - ID da participação
   ├── id_atividade → atividades.id
   ├── id_membro → membros.codigo_sequencial
   ├── tipo - ENUM: 'alvo', 'extra'
   ├── presente - BOOLEAN (checkmark)
   ├── justificativa_ausencia - TEXT
   ├── observacoes - TEXT
   ├── avaliacao - TEXT
   ├── criado_em
   ├── criado_uid
   ├── atualizado_em
   └── atualizado_uid

5. sessoes (10 campos)
   PK: id (SES-001...)
   FK: id_usuario → usuarios.uid
   ├── id - ID da sessão
   ├── id_usuario → usuarios.uid
   ├── token - Token único
   ├── ip_address
   ├── user_agent
   ├── criado_em
   ├── expira_em
   ├── ultimo_acesso
   ├── ativo
   └── dados_sessao - JSON
```

---

## 🔧 Tabelas Auxiliares (10 tabelas)

```
6. categorias_atividades
   PK: id (CAT-0001...)
   ├── id - ID da categoria
   ├── nome - Nome da categoria
   ├── cor - Cor hexadecimal (#RRGGBB)
   ├── icone - Nome do ícone
   ├── ativo
   ├── criado_em
   └── atualizado_em

7. menu
   PK: id
   ├── id - ID do item de menu
   ├── rotulo - Texto exibido
   ├── acao - Tipo de ação (navigate, external, function)
   ├── destino - URL ou página
   ├── icone
   ├── ordem - Ordem de exibição
   └── ativo

8. planilhas
   ├── Metadados de planilhas
   └── Configuração de abas

9. performance_logs
   ├── id
   ├── funcao - Nome da função
   ├── tempo_execucao_ms
   ├── timestamp
   └── metadados - JSON

10. system_logs
    ├── id
    ├── nivel - debug, info, warn, error
    ├── modulo - Nome do módulo
    ├── mensagem
    ├── contexto - JSON
    └── timestamp

11. PRATICAS_CADASTRO ⭐ NOVO
    PK: id (PRAC-0001...)
    ├── id - ID da prática
    ├── nome - Nome da prática
    ├── tipo - ENUM: 'sim_nao', 'quantidade'
    ├── unidade - Ex: "minutos", "páginas" (para quantidade)
    ├── ordem - Ordem de exibição
    ├── ativo
    ├── criado_em
    └── atualizado_em

    Cadastro de práticas disponíveis (editável via planilha)

12. PRATICAS_DIARIAS ⭐ NOVO
    PK: id (PRAD-0001...)
    FK: membro_id → membros.codigo_sequencial
    FK: pratica_id → PRATICAS_CADASTRO.id
    UNIQUE: (membro_id, data, pratica_id)
    ├── id - ID do registro
    ├── membro_id → membros.codigo_sequencial
    ├── data - Data da prática (YYYY-MM-DD)
    ├── pratica_id → PRATICAS_CADASTRO.id
    ├── valor - BOOLEAN (sim_nao) ou NUMBER (quantidade)
    ├── criado_em
    ├── criado_uid
    ├── atualizado_em
    └── atualizado_uid

13. OBSERVACOES_DIARIAS ⭐ NOVO
    PK: id (OBS-0001...)
    FK: membro_id → membros.codigo_sequencial
    UNIQUE: (membro_id, data)
    ├── id - ID da observação
    ├── membro_id → membros.codigo_sequencial
    ├── data - Data da observação (YYYY-MM-DD)
    ├── observacao - TEXT (max 500 chars)
    ├── criado_em
    ├── criado_uid
    ├── atualizado_em
    └── atualizado_uid

14. notificacoes (planejado)
    └── Sistema de notificações (futuro)

15. preferencias (planejado)
    └── Preferências do usuário (futuro)
```

---

**📚 Voltar para:** [MAPA_CODIGO.md](../MAPA_CODIGO.md)
