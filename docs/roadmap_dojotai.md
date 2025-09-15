# Roadmap – Sistema Dojotai

<!-- TOC -->
- [Entregas já concluídas (Etapa 1 – MVP)](#entregas-já-concluídas-etapa-1--mvp)
- [Pendências imediatas (Etapa 1.2 – Bloqueadores)](#pendências-imediatas-etapa-12--bloqueadores)
- [Refino / Melhorias](#refino--melhorias)
- [Backlog Futuro](#backlog-futuro)
- [Changelog](#changelog)
<!-- /TOC -->

## Entregas já concluídas (Etapa 1 – MVP)
- Login via planilha de usuários (`USUARIOS_TBL`)
- UID automático + registro de último acesso
- Tela de atividades (listar, criar, concluir)
- Dark mode + responsividade básica
- Toasts de feedback
- Menu

## Pendências imediatas (Etapa 1.2 – Bloqueadores)
- [x] Integrar **Tabela Planilhas** no código (remover SSIDs fixos)
- [x] Tipos de atividade com cores distintas
- [ ] Seleção de participantes por atividade
- [x] Calendário com marcações das atividades do usuário
- [x] Filtro **“Minhas tarefas”**

## Refino / Melhorias
- [ ] Responsividade mobile (limpeza e padronização)
- [ ] Feedback visual ao concluir atividade
- [x] Cores nas datas conforme proximidade
- [x] Ajuste no campo “Última ação de …”
- [ ] Controle de códigos para todos os cadastros, gravar o último código em algum lugar e consumir, para se apagar algo não reutilizar o código
- [ ] Data da atividade não está sendo carregada na alteração da atividade
- [x] Loading do concluir está aparecendo no último botão concluir, não no que foi clicado

## Backlog Futuro
- Relatórios mensais (cadastro, aprovação, consolidados)
- Organograma de grupos ↔ membros
- Ondas (importação e resumos)
- Materiais (cadastro + estoque)
- Gamificação (práticas, aprovação, ranking)
- Funcionalidade: aniversariantes do mês
- Migração para PWA + push notifications

## Changelog
- **v0.1 (MVP)**: Login + atividades básicas
- **v0.2 (pendente)**: Integração Tabela Links + refinamentos iniciais


----- v2

# 🗺️ Roadmap – Sistema Dojotai

<!-- TOC -->
- [Status Atual do Projeto](#status-atual-do-projeto)
- [Entregas Concluídas](#entregas-concluídas)
  - [MVP v0.1 - Base Funcional](#mvp-v01---base-funcional)
- [Em Desenvolvimento](#em-desenvolvimento)
  - [v0.2 - Sistema de Participação](#v02---sistema-de-participação)
- [Roadmap Detalhado](#roadmap-detalhado)
  - [v0.3 - Gestão de Membros](#v03---gestão-de-membros)
  - [v0.4 - Relatórios e Aprovações](#v04---relatórios-e-aprovações)
  - [v0.5 - Gamificação](#v05---gamificação)
  - [v0.6 - Controle de Materiais](#v06---controle-de-materiais)
  - [v0.7 - Organograma e Hierarquia](#v07---organograma-e-hierarquia)
  - [v0.8 - Integração com Ondas](#v08---integração-com-ondas)
  - [v1.0 - Release Completo](#v10---release-completo)
- [Backlog Futuro](#backlog-futuro)
  - [v2.0 - PWA e Mobile](#v20---pwa-e-mobile)
  - [v3.0 - Analytics e BI](#v30---analytics-e-bi)
- [Melhorias Técnicas Contínuas](#melhorias-técnicas-contínuas)
- [Changelog Detalhado](#changelog-detalhado)
<!-- /TOC -->

## Status Atual do Projeto

### 📊 **Indicadores Gerais**
- **Versão Atual**: v0.1.5 (MVP estável)
- **Próxima Release**: v0.2 (Sistema de Participação)
- **Previsão v1.0**: Q2 2025
- **Ambiente**: Produção estável
- **Coverage**: ~70% das funcionalidades planejadas para v1.0

### 🎯 **Marcos Importantes**
- ✅ **Jan/2024**: Início do desenvolvimento
- ✅ **Mar/2024**: MVP funcional em produção
- ✅ **Ago/2024**: Sistema de categorias implementado
- 🔄 **Set/2024**: Sistema de participação (em desenvolvimento)
- 📅 **Nov/2024**: Gestão de membros (planejado)
- 📅 **Jan/2025**: Sistema de relatórios (planejado)
- 📅 **Mar/2025**: Gamificação (planejado)
- 📅 **Mai/2025**: Release v1.0 completo

---

## Entregas Concluídas

### MVP v0.1 - Base Funcional
**Período**: Janeiro - Março 2024
**Status**: ✅ **Concluído e Estável**

#### **🔐 Sistema de Autenticação**
- ✅ Login via planilha Google Sheets
- ✅ Controle de sessão com tokens
- ✅ Hierarquia de papéis (admin, secretaria, líder, usuário)
- ✅ Geração automática de UIDs
- ✅ Registro de último acesso
- ✅ Logs de segurança

#### **📋 Gestão de Atividades (Core)**
- ✅ CRUD completo de atividades
- ✅ Estados: Pendente → Concluída
- ✅ Atribuição de responsáveis
- ✅ Sistema de auditoria (quem/quando)
- ✅ IDs sequenciais únicos (ACT-NNNN)

#### **🎨 Sistema de Categorias**
- ✅ Categorias configuráveis com ícones e cores
- ✅ Filtros visuais no dashboard
- ✅ Organização por tipo de atividade
- ✅ Badges visuais nos cards

#### **📅 Calendário Inteligente**
- ✅ Visualização mensal de atividades
- ✅ Sistema de semáforos por urgência:
  - 🔴 Atrasadas (data vencida)
  - 🟠 Próximas (≤7 dias)
  - 🟢 Futuras (>7 dias)
- ✅ Seleção múltipla de datas
- ✅ Filtro de atividades por período

#### **🎛️ Menu Dinâmico**
- ✅ Configuração via planilha
- ✅ Controle de permissões por papel
- ✅ Suporte a ações: route, function, external
- ✅ Ícones e ordenação personalizáveis

#### **📱 Interface Responsiva**
- ✅ Design mobile-first
- ✅ Dark mode automático
- ✅ Componentes adaptativos
- ✅ Touch-friendly interactions
- ✅ PWA-ready (base técnica)

#### **🔧 Infraestrutura Flexível**
- ✅ Sistema de planilhas configurável
- ✅ Named ranges e ranges A1
- ✅ Deploy automatizado via clasp
- ✅ Versionamento com Git

#### **📈 Melhorias v0.1.1 - v0.1.5**
- ✅ Filtro "Minhas tarefas"
- ✅ Busca por nome de usuário
- ✅ Loading states aprimorados
- ✅ Correção bugs mobile
- ✅ Melhoria performance calendário
- ✅ Sistema de toasts polido

---

## Em Desenvolvimento

### v0.2 - Sistema de Participação
**Período**: Setembro - Outubro 2024
**Status**: 🔄 **Em Desenvolvimento (40% completo)**

#### **👥 Gestão de Participantes**
- 🔄 Seleção de participantes na criação de atividades
- 🔄 Convites automáticos por grupo ou individual
- 🔄 Estados de participação: convidado → confirmado/ausente → presente
- 📅 Interface de confirmação para membros
- 📅 Notificações de convites e mudanças

#### **✅ Check-in e Presença**
- 📅 Tela de check-in durante a atividade
- 📅 Marcação de presença por organizador
- 📅 Relatório automático de participação
- 🔄 QR Code para check-in rápido (experimentação)

#### **📊 Dashboards de Participação**
- 📅 Estatísticas de presença por membro
- 📅 Taxa de comparecimento por atividade
- 📅 Métricas de engajamento

#### **Blockers/Dependências**
- ⚠️ Necessita estrutura básica de membros
- ⚠️ Sistema de notificações via email
- ⚠️ Definição de fluxo de convites

---

## Roadmap Detalhado

### v0.3 - Gestão de Membros
**Período**: Novembro - Dezembro 2024
**Prioridade**: 🔥 **Alta** (base para outras funcionalidades)

#### **👤 Cadastro de Membros**
- Estrutura completa da tabela MEMBROS
- CRUD de membros com dados pessoais
- Upload de fotos de perfil
- Histórico de alterações

#### **🔗 Vinculação Usuário-Membro**
- Campo member_id em USUARIOS
- Sincronização automática de dados
- Migração de usuários existentes
- Interface de vinculação manual

#### **📊 Perfis e Estatísticas**
- Página de perfil individual
- Histórico de participação em atividades
- Métricas pessoais de engajamento
- Exportação de dados pessoais

#### **🎯 Critérios de Sucesso**
- [ ] 100% dos usuários vinculados a membros
- [ ] Interface intuitiva para gestão
- [ ] Migração sem perda de dados
- [ ] Performance <2s para carregamento de perfis

### v0.4 - Relatórios e Aprovações
**Período**: Janeiro - Fevereiro 2025
**Prioridade**: 🔥 **Alta** (demanda operacional)

#### **📝 Relatórios Mensais**
- Templates configuráveis por grupo
- Editor rich text para conteúdo
- Dados automáticos de atividades e participação
- Sistema de rascunho/preview

#### **✅ Fluxo de Aprovação**
- Workflow: rascunho → enviado → aprovado
- Interface para secretaria/admin revisar
- Sistema de comentários e correções
- Notificações automáticas por etapa

#### **📈 Consolidação Automática**
- Dashboard executivo com todos os grupos
- Métricas consolidadas mensais
- Gráficos e visualizações
- Exportação para PDF/Excel

#### **🎯 Critérios de Sucesso**
- [ ] Redução de 80% no tempo de criação de relatórios
- [ ] 100% dos grupos usando o sistema
- [ ] Aprovação média em <48h
- [ ] Zero relatórios perdidos ou corrompidos

### v0.5 - Gamificação
**Período**: Março - Abril 2025
**Prioridade**: 🟡 **Média** (engajamento)

#### **🎮 Sistema de Práticas**
- Catálogo configurável de práticas
- Pontuação por categoria e dificuldade
- Sistema de lançamento pelos membros
- Aprovação pelos líderes

#### **🏆 Rankings e Conquistas**
- Rankings mensais, gerais e por categoria
- Sistema de badges/conquistas
- Metas pessoais e de grupo
- Gamificação visual atrativa

#### **📊 Analytics de Engajamento**
- Métricas de participação no sistema
- Identificação de padrões de uso
- Sugestões automáticas de práticas
- Relatórios de gamificação

### v0.6 - Controle de Materiais
**Período**: Maio - Junho 2025
**Prioridade**: 🟡 **Média** (operacional)

#### **📦 Gestão de Estoque**
- Cadastro completo de materiais
- Controle de entrada/saída
- Alertas de estoque mínimo
- Relatórios de movimentação

#### **💰 Controle Financeiro**
- Valores unitários e totais
- Relatórios de custo de estoque
- Histórico de preços
- Sugestões de compra

### v0.7 - Organograma e Hierarquia
**Período**: Julho - Agosto 2025
**Prioridade**: 🟡 **Média** (estrutura)

#### **🌳 Estrutura Organizacional**
- Hierarquia de grupos configurável
- Visualização em árvore interativa
- Permissões herdadas por hierarquia
- Gestão de líderes por grupo

### v0.8 - Integração com Ondas
**Período**: Setembro 2025
**Prioridade**: 🟢 **Baixa** (específico)

#### **📊 Importação de Dados**
- Upload de arquivos CSV/Excel
- Validação e limpeza automática
- Mapeamento flexível de campos
- Relatórios de importação

#### **📈 Consolidação nos Relatórios**
- Integração automática com relatórios mensais
- Gráficos e métricas baseadas em ondas
- Comparativos históricos

### v1.0 - Release Completo
**Período**: Outubro 2025
**Prioridade**: 🔥 **Crítica** (milestone)

#### **🔧 Finalização e Polimento**
- Correção de bugs críticos
- Otimização de performance
- Documentação completa
- Treinamento de usuários

#### **📋 Funcionalidades v1.0**
- ✅ Todas as funcionalidades principais implementadas
- ✅ Sistema estável em produção
- ✅ Documentação técnica e de usuário
- ✅ Suporte completo mobile e desktop
- ✅ Backup e recuperação automáticos
- ✅ Monitoramento e logs completos

---

## Backlog Futuro

### v2.0 - PWA e Mobile
**Previsão**: 2026
**Foco**: Experiência mobile nativa

#### **📱 Progressive Web App**
- Instalação como app nativo
- Funcionamento offline
- Sincronização automática
- Push notifications

#### **🔔 Notificações Inteligentes**
- Push notifications personalizadas
- Lembretes automáticos
- Notificações baseadas em localização
- Preferências granulares

### v3.0 - Analytics e BI
**Previsão**: 2027
**Foco**: Inteligência de negócio

#### **📊 Business Intelligence**
- Dashboards executivos avançados
- Análise preditiva de participação
- Insights automáticos
- Integração com ferramentas BI

#### **🤖 Automação Inteligente**
- Sugestões automáticas de atividades
- Detecção de padrões de engajamento
- Recomendações personalizadas
- Chatbot para suporte

---

## Melhorias Técnicas Contínuas

### **🔧 Performance e Escalabilidade**
- **v0.2**: Otimização de queries Google Sheets
- **v0.3**: Cache inteligente de dados
- **v0.4**: Lazy loading de componentes
- **v0.5**: Pagination para grandes volumes
- **v1.0**: CDN para assets estáticos

### **🛡️ Segurança e Conformidade**
- **v0.2**: Auditoria completa de logs
- **v0.3**: Encryption de dados sensíveis
- **v0.4**: Two-factor authentication
- **v0.5**: LGPD compliance completo
- **v1.0**: Penetration testing

### **🚀 DevOps e Infraestrutura**
- **v0.2**: Pipeline de CI/CD
- **v0.3**: Ambiente de staging
- **v0.4**: Monitoring e alertas
- **v0.5**: Backup automatizado
- **v1.0**: Disaster recovery

### **🔍 Testing e Qualidade**
- **v0.2**: Unit tests básicos
- **v0.3**: Integration tests
- **v0.4**: E2E testing automatizado
- **v0.5**: Performance testing
- **v1.0**: User acceptance testing

---

## Changelog Detalhado

### **v0.1.5** (Setembro 2024)
#### 🆕 **Novas Funcionalidades**
- Sistema de semáforos de data implementado
- Filtro por categoria de atividade adicionado
- Calendário com seleção múltipla de datas
- Contadores dinâmicos nos filtros de categoria

#### 🐛 **Bugs Corrigidos**
- Loading do botão "Concluir" agora aparece no botão correto
- Data da atividade carregando corretamente na edição
- Performance do calendário melhorada
- Responsividade mobile ajustada

#### ⚡ **Melhorias**
- Interface do calendário redesenhada
- Sistema de cores mais consistente
- Feedback visual aprimorado
- Documentação técnica atualizada

### **v0.1.4** (Agosto 2024)
#### 🆕 **Novas Funcionalidades**
- Sistema de categorias de atividades
- Filtros visuais por categoria
- Ícones e cores configuráveis
- Badge de categoria nos cards

#### 🐛 **Bugs Corrigidos**
- Campo "Última ação" formatado corretamente
- Filtro "Minhas tarefas" funcionando perfeitamente
- Resolução de conflitos de CSS mobile

### **v0.1.3** (Julho 2024)
#### 🆕 **Novas Funcionalidades**
- Integração com sistema de planilhas configurável
- Menu dinâmico implementado
- Filtro "Minhas tarefas"
- Busca por nome de usuário

#### ⚡ **Melhorias**
- Remoção de SSIDs fixos
- Sistema de configuração flexível
- Performance geral melhorada

### **v0.1.2** (Junho 2024)
#### 🐛 **Bugs Corrigidos**
- Responsividade mobile corrigida
- Dark mode ajustado
- Estados de loading padronizados

#### ⚡ **Melhorias**
- Interface mais polida
- Animações suavizadas
- Código refatorado

### **v0.1.1** (Maio 2024)
#### 🆕 **Novas Funcionalidades**
- Sistema de toasts implementado
- Feedback visual de ações
- Estados de carregamento

#### 🐛 **Bugs Corrigidos**
- Correções de layout mobile
- Validações de formulário
- Sync de dados aprimorado

### **v0.1.0** (Março 2024)
#### 🎉 **Release MVP**
- Sistema de autenticação funcional
- CRUD de atividades completo
- Interface responsiva básica
- Deploy em produção estável

---

## 📊 Métricas e KPIs

### **Métricas de Desenvolvimento**
| Métrica | v0.1 | v0.2 (Meta) | v1.0 (Meta) |
|---------|------|-------------|-------------|
| Funcionalidades | 15 | 25 | 50+ |
| Telas implementadas | 5 | 10 | 20+ |
| Usuários ativos | 10 | 25 | 100+ |
| Performance (load time) | <3s | <2s | <1s |
| Bugs críticos | 0 | 0 | 0 |
| Coverage de testes | 0% | 30% | 80% |

### **Métricas de Negócio**
| Objetivo | Status Atual | Meta v1.0 |
|----------|--------------|-----------|
| Redução tempo relatórios | - | 80% |
| Automatização processos | 30% | 90% |
| Satisfação usuários | - | 4.5/5 |
| Adoção da ferramenta | 60% | 95% |
| Erros manuais | - | -70% |

---

## 🎯 Estratégia de Releases

### **Modelo de Release**
- **Major versions** (x.0): Funcionalidades grandes, breaking changes
- **Minor versions** (x.y): Novas funcionalidades, melhorias
- **Patch versions** (x.y.z): Bug fixes, pequenos ajustes

### **Ciclo de Desenvolvimento**
1. **Planning** (1 semana): Definição de escopo e prioridades
2. **Development** (3-4 semanas): Implementação das funcionalidades
3. **Testing** (1 semana): Testes internos e correções
4. **Staging** (1 semana): Testes com usuários piloto
5. **Production** (Deploy): Release para todos os usuários
6. **Monitoring** (1 semana): Acompanhamento pós-release

### **Estratégia de Rollout**
- **Alpha**: Desenvolvedores e admin principal
- **Beta**: Líderes de grupo e secretaria
- **Release Candidate**: Usuários avançados
- **General Availability**: Todos os usuários

---

## 🚫 Débito Técnico Conhecido

### **Prioridade Alta**
- [ ] **Performance**: Queries Google Sheets não otimizadas
- [ ] **Segurança**: Tokens de sessão simples demais
- [ ] **Escalabilidade**: Sem pagination em listas grandes
- [ ] **Testes**: Cobertura de testes insuficiente

### **Prioridade Média**
- [ ] **Código**: Duplicação em funções de validação
- [ ] **UX**: Feedback de erro genérico demais
- [ ] **Mobile**: Alguns componentes não 100% responsivos
- [ ] **Caching**: Dados recarregados desnecessariamente

### **Prioridade Baixa**
- [ ] **Documentação**: JSDoc incompleto
- [ ] **Logs**: Sistema de logs muito verboso
- [ ] **CSS**: Classes CSS não padronizadas
- [ ] **Acessibilidade**: ARIA labels faltando

### **Plano de Quitação**
- **v0.2**: Resolver 100% prioridade alta
- **v0.3**: Resolver 70% prioridade média  
- **v0.4**: Resolver 100% prioridade média
- **v1.0**: Resolver 90% prioridade baixa

---

## 🤝 Dependências Externas

### **Google Services**
- **Google Sheets**: Base de dados principal
- **Google Apps Script**: Runtime da aplicação
- **Google Drive**: Storage de arquivos
- **Gmail**: Sistema de notificações

### **Riscos e Mitigações**
| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Limites Google Sheets | Média | Alto | Implementar pagination e cache |
| Mudanças Google Apps Script | Baixa | Alto | Monitorar updates e manter backup |
| Performance Sheets | Alta | Médio | Otimizar queries e implementar cache |
| Quota de execução | Média | Médio | Implementar retry e otimizar código |

### **Alternativas Avaliadas**
- **Database**: Firebase, MySQL (descartados por complexidade)
- **Runtime**: Node.js, Python (descartados por infraestrutura)
- **Frontend**: React, Vue (descartados por simplicidade)

---

## 📅 Marcos Críticos

### **Q4 2024**
- ✅ **Out/2024**: v0.2 - Sistema de Participação
- 📅 **Nov/2024**: v0.3 - Gestão de Membros
- 📅 **Dez/2024**: Integração completa usuário-membro

### **Q1 2025**
- 📅 **Jan/2025**: v0.4 - Relatórios e Aprovações
- 📅 **Fev/2025**: Fluxo completo de relatórios mensais
- 📅 **Mar/2025**: v0.5 - Gamificação

### **Q2 2025**
- 📅 **Abr/2025**: Testes extensivos v1.0
- 📅 **Mai/2025**: **🎯 v1.0 - Release Completo**
- 📅 **Jun/2025**: Documentação e treinamento finais

---

## 💡 Ideias para Futuro Distante

### **Integrações Possíveis**
- WhatsApp Business API para notificações
- Integração com sistema de pagamentos
- Conexão com plataformas de videoconferência
- API para apps móveis nativos

### **Funcionalidades Inovadoras**
- IA para sugestão automática de atividades
- Reconhecimento facial para check-in
- Análise de sentimento em feedback
- Previsão de participação baseada em histórico

### **Expansão de Mercado**
- Template para outros tipos de organizações
- Sistema multi-tenant
- Marketplace de plugins
- SaaS para pequenas organizações

---

## 📞 Suporte e Manutenção

### **Modelo de Suporte**
- **Bugs críticos**: Correção em 24h
- **Bugs não-críticos**: Correção na próxima release
- **Melhorias**: Avaliação e inclusão no roadmap
- **Dúvidas**: Suporte via canal interno

### **Manutenção Preventiva**
- **Backup**: Diário automático
- **Monitoramento**: Alertas em tempo real
- **Updates**: Google Apps Script sempre atualizado
- **Performance**: Review mensal de métricas

### **Plano de Continuidade**
- Documentação técnica completa
- Código versionado e comentado
- Ambientes de desenvolvimento replicáveis
- Conhecimento distribuído entre desenvolvedores

---

## 🎉 Comemorações de Marcos

### **Marcos Atingidos**
- 🎉 **Mar/2024**: Primeiro usuário real usando o sistema
- 🎉 **Mai/2024**: Primeira atividade concluída via sistema
- 🎉 **Ago/2024**: 100+ atividades gerenciadas
- 🎉 **Set/2024**: Sistema estável há 6 meses

### **Próximas Comemorações**
- 🎯 **Out/2024**: Primeira participação confirmada via sistema
- 🎯 **Dez/2024**: Primeiro membro cadastrado
- 🎯 **Mar/2025**: Primeiro relatório aprovado via sistema
- 🎯 **Mai/2025**: 🎊 **v1.0 LANÇADO!** 🎊

---

**📝 Última atualização**: Setembro 2024  
**👨‍💻 Mantido por**: Equipe de Desenvolvimento Dojotai  
**📋 Próxima revisão**: Outubro 2024

---

*Este roadmap é um documento vivo e é atualizado mensalmente com base no progresso real do desenvolvimento e feedback dos usuários. Para sugestões ou correções, entre em contato com a equipe de desenvolvimento.*