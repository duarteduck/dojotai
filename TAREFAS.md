# 📋 TAREFAS - Sistema Dojotai V2.0

**Última atualização:** 01/10/2025  
**Versão atual:** 2.0.0-alpha.4  
**Status:** ✅ Sistema Estável em Produção

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

**"O que fazer agora?"** - Este documento responde essa pergunta.

Lista organizada de tarefas, pendências e roadmap do projeto por ordem de prioridade.

---

## 🚀 ENTREGAS RECENTES (Últimos 30 dias)

### ✅ **Sistema de Alvos V2.0** - 29/09/2025
- Lista dupla (disponíveis + selecionados)
- Soft delete de alvos
- Busca com filtros avançados
- Persistência 100% funcional
- Zero bugs conhecidos

### ✅ **Sistema de Logs Estruturados** - 23/09/2025
- 4 níveis (DEBUG, INFO, WARN, ERROR)
- Anti-recursão robusto
- IDs únicos garantidos
- Timezone Brasil (UTC-3)

### ✅ **Sistema de Sessões V4** - 22/09/2025
- Tokens únicos seguros
- Login/Logout completo
- Validação de sessão
- Limpeza automática

### ✅ **Documentação Fase 1** - 01/10/2025
- README.md
- CLAUDE_INSTRUCOES.md
- MAPA_CODIGO.md (validado e corrigido)

---

## 🔴 PRÓXIMO (Urgente - 2 Semanas)

### 1. **Finalizar Documentação Base**
**Prazo:** 3 dias  
**Responsável:** Equipe  
**Status:** 🔄 Em andamento (60% completo)

**Tarefas:**
- [x] README.md
- [x] CLAUDE_INSTRUCOES.md
- [x] MAPA_CODIGO.md
- [ ] TAREFAS.md (este arquivo)
- [ ] GUIA_DESENVOLVIMENTO.md

**Resultado esperado:** Documentação completa para qualquer dev começar

---

### 2. **Auditoria Técnica com Claude Code**
**Prazo:** 1 dia  
**Responsável:** Claude Code  
**Status:** ⏳ Aguardando

**Tarefas:**
- [ ] Validar seção "Onde Encontrar" do MAPA_CODIGO.md
- [ ] Listar TODAS as funções e onde estão definidas
- [ ] Identificar duplicações e qual versão é usada
- [ ] Mapear dependências entre módulos
- [ ] Gerar relatório de órfãos confirmados

**Resultado esperado:** Mapeamento 100% preciso do código

---

### 3. **Consolidação de Duplicações**
**Prazo:** 2 dias  
**Responsável:** Equipe  
**Status:** ⏳ Aguardando auditoria

**Problemas conhecidos:**
- `createActivity()` duplicada (activities.gs + usuarios_api.gs)
- `updateActivity()` duplicada (activities.gs + usuarios_api.gs)
- `completeActivity()` duplicada (activities.gs + usuarios_api.gs)
- `listCategoriasAtividadesApi()` duplicada (2 lugares)

**Ações:**
- [ ] Decidir: manter ou remover versões antigas
- [ ] Adicionar comentários indicando qual usar
- [ ] Atualizar MAPA_CODIGO.md com decisão final

---

## 🟡 IMPORTANTE (Próximo Mês)

### 4. **Finalização do Cadastro de Participações**
**Prazo:** 2 semanas  
**Prioridade:** Alta  
**Status:** 📋 Planejado

**Features:**
- Completar campos faltantes no formulário
- Validações de dados obrigatórios
- Histórico de participações por membro
- Relatório de frequência/presença
- Exportação de dados de participação

**Benefício:** Sistema completo de controle de presença

---

### 5. **Registro de Práticas Diárias pelos Membros**
**Prazo:** 2 semanas  
**Prioridade:** Alta  
**Status:** 📋 Planejado

**Features:**
- Interface para membros registrarem práticas diárias
- Catálogo de práticas (Zazen, Taisso, Sesshin, etc.)
- Registro de duração e observações
- Aprovação pelos líderes/responsáveis
- Histórico pessoal de práticas

**Dependências:**
- Tabela de práticas (criar no data_dictionary)
- Permissões de membro para auto-registro

**Benefício:** Gamificação e engajamento dos membros

---

### 6. **Sistema de Notificações para Alvos/Membros**
**Prazo:** 3 semanas  
**Prioridade:** Alta  
**Status:** 📋 Planejado

**Features:**
- Notificar membros quando são definidos como alvos
- Confirmação de participação pelo membro
- Lembretes automáticos antes da atividade
- Notificações de aprovação de práticas
- Dashboard de notificações pendentes

**Dependências:**
- Tabela `notificacoes` (já definida no dicionário)
- Sistema de envio (email ou push)

---

## 🟢 BACKLOG (Futuro Indefinido)

### 7. **Dashboard de Participação** ⏸️
**Status:** Adiado para futuro indefinido

**Features planejadas:**
- Estatísticas por membro (% presença, atividades)
- Estatísticas por atividade (% comparecimento)
- Gráficos de tendência
- Exportação para Excel/PDF

---

### Fase 3 - Sistemas Avançados (2-3 meses)

#### 8. **Sistema de Relatórios Mensais**
- Templates configuráveis
- Editor rich text
- Fluxo de aprovação (rascunho → enviado → aprovado)
- Consolidação automática
- Exportação PDF/Excel

#### 9. **Sistema de Permissões Granulares**
- Roles customizados além dos 4 atuais
- Permissões por recurso
- Herança de permissões por hierarquia
- Auditoria de acessos

#### 10. **Gamificação**
- Sistema de práticas com pontuação
- Rankings mensais e gerais
- Badges/conquistas
- Metas pessoais e de grupo

#### 11. **Gestão de Materiais**
- Cadastro de materiais
- Controle de estoque (entrada/saída)
- Alertas de estoque mínimo
- Relatórios de movimentação

#### 12. **Organograma e Hierarquia**
- Visualização em árvore de grupos
- Permissões herdadas
- Gestão de líderes
- Transferências entre grupos

---

### Fase 4 - Modernização (3-6 meses)

#### 13. **Frontend V3 (React/Vue)**
- Migrar de HTML/JS puro para framework moderno
- Componentização completa
- State management profissional
- Testes automatizados

#### 14. **PWA (Progressive Web App)**
- Instalável como app nativo
- Funcionamento offline
- Sincronização automática
- Push notifications nativas

#### 15. **Analytics e BI**
- Dashboards executivos
- Análise preditiva
- Insights automáticos
- Integração com ferramentas BI

---

## 📊 MÉTRICAS DE PROGRESSO

### Funcionalidades Implementadas

```
✅ Core System:          100% (database, session, auth)
✅ Gestão de Atividades:  90% (falta relatórios)
✅ Sistema de Alvos:     100% (completo)
✅ Gestão de Membros:     80% (falta vincular com usuários)
✅ Participação:          85% (falta histórico)
⏳ Notificações:           0% (planejado)
⏳ Relatórios:             0% (planejado)
⏳ Gamificação:            0% (planejado)
⏳ Materiais:              0% (planejado)
───────────────────────────────────────
TOTAL GERAL:             55% completo
```

### Roadmap para V2.0 Completo

```
Fase 1 - Base:          ████████████████████ 100%
Fase 2 - Alvos:         ████████████████████ 100%
Fase 3 - Notificações:  ░░░░░░░░░░░░░░░░░░░░   0%
Fase 4 - Relatórios:    ░░░░░░░░░░░░░░░░░░░░   0%
───────────────────────────────────────────────
V2.0 Total:             ██████████░░░░░░░░░░  50%
```

**Estimativa V2.0 completo:** Q2 2026

---

## 🔧 MANUTENÇÃO CONTÍNUA

### Tarefas Recorrentes

**Semanalmente:**
- [ ] Revisar logs de erro no system_logs
- [ ] Verificar performance_logs para gargalos
- [ ] Limpar sessões expiradas antigas (>30 dias)
- [ ] Atualizar este documento (TAREFAS.md)

**Mensalmente:**
- [ ] Backup completo das planilhas
- [ ] Auditoria de segurança (sessões, acessos)
- [ ] Revisar e atualizar documentação técnica
- [ ] Análise de métricas de uso

**Trimestralmente:**
- [ ] Revisão completa de código (code review)
- [ ] Atualização de dependências
- [ ] Planejamento de próximas features
- [ ] Treinamento de usuários

---

## 🚦 SEMÁFORO DE PRIORIDADES

| Cor | Significado | Prazo | Exemplos |
|-----|-------------|-------|----------|
| 🔴 | **Urgente** | 1-2 semanas | Documentação, Auditoria |
| 🟡 | **Importante** | 2-4 semanas | Notificações, Dashboard |
| 🟢 | **Desejável** | 1-6 meses | Gamificação, PWA |
| ⚪ | **Backlog** | 6+ meses | BI, Analytics |

---

## 📚 DOCUMENTAÇÃO RELACIONADA

- **[README.md](README.md)** - Visão geral do projeto
- **[MAPA_CODIGO.md](MAPA_CODIGO.md)** - Onde está cada coisa
- **[GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)** - Como fazer tarefas
- **[CLAUDE_INSTRUCOES.md](CLAUDE_INSTRUCOES.md)** - Regras do código

---

**📋 Este documento é atualizado semanalmente e reflete o planejamento real do projeto.**