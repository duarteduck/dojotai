# CLAUDE.md

Este arquivo fornece orientação para o Claude Code (claude.ai/code) ao trabalhar com código neste repositório.

## Visão Geral do Projeto

**Sistema Dojotai** é uma aplicação web standalone baseada em Google Apps Script para gestão de dojos. É uma Single Page Application (SPA) que usa Google Sheets como banco de dados e serve HTML/CSS/JavaScript através da funcionalidade web app do Google Apps Script, rodando independentemente das planilhas de dados.

## Principais Tecnologias e Arquitetura

- **Backend**: Google Apps Script (arquivos .gs) - Runtime JavaScript do lado servidor
- **Frontend**: HTML/CSS/JavaScript vanilla com arquitetura SPA
- **Banco de Dados**: Google Sheets com sistema de configuração dinâmica
- **Deploy**: Google clasp CLI para envio ao Google Apps Script
- **Autenticação**: Sistema de login customizado usando Google Sheets para gerenciamento de usuários

## Comandos de Desenvolvimento

### Deploy para Google Apps Script
```bash
# Instalar clasp globalmente se não estiver instalado
npm install -g @google/clasp

# Autenticar no Google (apenas primeira vez)
clasp login

# Fazer deploy das alterações para o Google Apps Script
clasp push

# Abrir o projeto no editor do Apps Script
clasp open
```

### Configuração do Projeto
- **Script ID**: `1H_zNc2ek2gcO5B3feNRgmcv8O34dzIWmwi2puwVA1A9CTdj09eYez3q3` (encontrado no .clasp.json)
- **Fuso Horário**: America/Sao_Paulo
- **Runtime**: V8
- **Acesso Web App**: Qualquer pessoa com o link pode acessar

## Visão Geral da Arquitetura

### Padrão de Estrutura de Arquivos
O projeto usa uma estrutura de arquivos plana onde:

- **Arquivos do lado servidor** (.gs): Lidam com lógica de backend, operações de banco de dados, autenticação
- **Arquivos do lado cliente** (.html): Contêm templates HTML, estilos CSS e código JavaScript
- **Sistema de templates**: Usa a função `include()` do Google Apps Script para compor o HTML final

### Principais Arquivos do Servidor (.gs)
- `main.gs`: Ponto de entrada para web app (função `doGet()`)
- `auth.gs`: Autenticação e gerenciamento de usuários
- `activities.gs`: Lógica de negócio para gestão de atividades
- `activities_categories.gs`: Sistema de categorização de atividades
- `members.gs`: Funcionalidade de gerenciamento de membros
- `menu.gs`: Configuração dinâmica de menu
- `utils.gs`: Utilitários de banco de dados e sistema de configuração dinâmica

### Principais Arquivos do Cliente (.html)
- `index.html`: Template principal da aplicação que inclui todos os outros arquivos
- `app_state.html`: Gerenciamento de estado da aplicação
- `app_api.html`: Comunicação API com backend Google Apps Script
- `app_ui.html`: Gerenciamento de UI e manipulação DOM
- `app_router.html`: Sistema de roteamento SPA
- `styles_base.html`: Estilos CSS base
- `styles_components.html`: Estilos específicos de componentes
- `view_*.html`: Templates de página (login, dashboard, atividades, membros)
- `view_component_*.html`: Componentes UI reutilizáveis

### Sistema de Configuração de Banco de Dados
A aplicação usa um sistema de configuração dinâmica via tabela "Planilhas" que permite:
- Múltiplas Google Sheets como fontes de dados
- Named ranges ou notação A1 para acesso aos dados
- Configuração flexível de tabelas sem alterações no código
- Configuração armazenada em `utils.gs` sob a constante `APP`

## Padrões de Desenvolvimento

### Fluxo de Autenticação
- Login via usuário/PIN armazenado no Google Sheets
- Controle de acesso baseado em papéis (Admin, Secretaria, Líder, Usuário)
- Gerenciamento de sessão com tokens temporários
- Log de acesso para segurança

### Gerenciamento de Estado
- Estado global da aplicação gerenciado em `app_state.html`
- Arquitetura orientada a eventos com eventos customizados
- Local storage para persistência de sessão
- Camada API abstrai comunicação com backend

### Componentes UI
- Sistema de componentes baseado em templates usando elementos HTML `<template>`
- Design responsivo mobile-first
- Suporte a modo escuro
- Notificações toast para feedback do usuário
- Estados de loading e tratamento de erros

### Fluxo de Dados
1. JavaScript frontend faz chamadas para funções backend via `google.script.run`
2. Funções Google Apps Script consultam/atualizam Google Sheets usando `readTableByNome_()`
3. Sistema de configuração dinâmica determina quais planilhas/ranges usar via tabela "Planilhas"
4. Resultados retornados ao frontend via JSON com estrutura padronizada

### Arquitetura API com Fallbacks
**Padrão de Chamada API (app_api.html)**:
```javascript
function_name: function(params) {
  return new Promise(function(resolve, reject) {
    console.log('📡 API.function_name:', params);
    google.script.run
      .withSuccessHandler(function(res) {
        if (res && res.ok) {
          resolve(res);
        } else if (res === null) {
          reject('Erro: Função falhou no backend');
        } else {
          reject(res.error || 'Erro desconhecido');
        }
      })
      .withFailureHandler(function(error) {
        reject('Erro de conexão: ' + error.toString());
      })
      .backend_function_name(params);
  });
}
```

**Sistema de Dados Exclusivamente Real (17/09/2025)**:
- **Primeira Tentativa**: Função backend específica (ex: `listParticipacoes`)
- **Error handling**: Robusto sem dados mock ou fallbacks simulados
- **Logging**: Console detalhado para debugging (`📡 API.function_name`)
- **Validação**: Verificação de `res.ok` e tratamento de `null` responses

## Configuração Importante

### Configuração do Banco de Dados
A configuração principal está em `utils.gs`:
```javascript
const APP = {
  TZ: 'America/Sao_Paulo',
  PLANILHAS_SSID: '1hfl-CeO6nK4FLYl4uacK5NncBoJ3q-8PPzUWh7W6PmY', // Planilha principal de config
  PLANILHAS_NAMED: 'PLANILHA_TBL', // Named range para configuração
  PLANILHAS_A1: 'Planilhas!A1:H' // Range fallback
};
```

**⚡ Aplicação Standalone (Otimizado 17/09/2025)**:
- A aplicação roda **independentemente** das planilhas de dados
- Todos os acessos a planilhas usam SSIDs explícitos via `SpreadsheetApp.openById()`
- **Não há mais fallbacks** para `getActiveSpreadsheet()` ou `'ACTIVE'`
- Cada entrada na tabela "Planilhas" deve ter um SSID válido
- **Performance melhorada**: Removidos condicionais desnecessários

### Estrutura Necessária do Google Sheets
O sistema requer uma planilha de configuração principal com tabelas para:
- Usuarios (Usuários)
- Atividades (Atividades)
- Categoria_Atividades (Categorias de Atividades)
- Membros (Membros)
- Menu (Configuração do Menu)
- Participacoes (Participações em Atividades)

**Tabela "Planilhas" - Configuração Central**:
Cabeçalho: `arquivo | nome | ssid | planilha | named_range | range_a1 | descrição | status`

- `arquivo`: Nome do arquivo para organização humana (não usado no código)
- `nome`: **Campo usado pelo código** para identificar a tabela (ex: "participacoes", "membros")
- `ssid`: ID da Google Sheet (usado em SpreadsheetApp.openById)
- `planilha`: Nome da aba/sheet dentro do arquivo Google Sheets
- `named_range`: Nome do range nomeado (opcional, usado primeiro)
- `range_a1`: Range em notação A1 como fallback
- `descrição`: Descrição da funcionalidade
- `status`: "Ativo" ou "Inativo" (apenas "Ativo" é processado)

Veja `docs/dados_dojotai.md` para o esquema completo do banco de dados.

## Testes e Validação

Este é um projeto Google Apps Script, então não há testes unitários tradicionais. Os testes são feitos através de:
1. Deploy para Google Apps Script com `clasp push`
2. Teste da funcionalidade da web app no browser
3. Verificação dos logs do Google Apps Script para erros
4. Testes manuais dos fluxos da UI

## Fluxo de Desenvolvimento

1. Fazer alterações nos arquivos .gs ou .html localmente
2. Usar `clasp push` para fazer deploy das alterações para o Google Apps Script
3. Testar funcionalidade na web app deployada
4. Fazer commit das alterações no repositório git
5. Documentar alterações em `docs/roadmap_dojotai.md`

## Problemas Comuns e Troubleshooting

### Problemas de Conectividade Backend
- **Função retorna `null`**: Verificar se função está publicada corretamente no Google Apps Script
- **"Função não disponível"**: Confirmar deploy com `clasp push` e verificar permissões
- **Timeout de API**: Funções que demoram >6 minutos no Google Apps Script causam timeout
- **Permissões**: Acesso ao Google Sheets requer permissões de compartilhamento adequadas

### Debugging de Problemas de Dados
- **Dados não carregam**: Verificar console do browser para erros de API (`📡 API.function_name`)
- **Checkboxes incorretos**: Validar se dados na planilha estão como "sim"/"não" (case-insensitive)
- **Tabela não encontrada**: Verificar configuração na tabela "Planilhas" com status "Ativo"
- **Named range inválido**: Fallback automático para range_a1 se named_range falhar

### Troubleshooting de Desenvolvimento
- **Cache**: Browser pode cachear versões antigas; use hard refresh (Ctrl+F5) durante desenvolvimento
- **Encoding**: Garantir encoding UTF-8 para texto em português
- **Viewport mobile**: Usa cálculo customizado de altura do viewport para mobile Safari
- **Logs Google Apps Script**: Verificar logs no editor do Apps Script para erros backend

### Checklist de Debugging Pós-Rollback (17/09/2025)
1. ✅ **Deploy atualizado**: Sempre fazer `clasp push` após mudanças
2. ✅ **Sistema standalone**: Verificar se não há dependência de `getActiveSpreadsheet()`
3. ✅ **Console logging**: Usar `📡 API.function_name` para rastrear chamadas
4. ✅ **Tabela "Planilhas"**: Validar configuração de acesso aos dados
5. ✅ **Error handling**: Verificar se res.ok e tratamento de null estão implementados
6. ✅ **Estado funcional**: Preferir rollback a debugging excessivo quando necessário

## Histórico de Mudanças Recentes

### 17/09/2025 - Otimizações Pós-Rollback e Documentação

**🔄 Rollback Estratégico para Estado Funcional**
- Rollback para commit `47c74fa` após debugging excessivo
- Restauração completa da funcionalidade do sistema de participações
- Lição aprendida: Preferir estado funcional conhecido vs debugging prolongado

**⚡ Otimizações de Performance e Arquitetura**
- Remoção completa de fallbacks `'ACTIVE'` e `getActiveSpreadsheet()` em `utils.gs`
- Aplicação 100% standalone sem dependências de planilhas ativas
- Simplificação de condicionais desnecessárias para melhor performance
- Todos os acessos agora usam exclusivamente `SpreadsheetApp.openById()`

**📚 Melhoria Abrangente da Documentação**
- Atualização completa da tabela "Participacoes" com 14 campos reais implementados
- Documentação da tabela "Planilhas" como arquitetura central do sistema
- Guias detalhados de troubleshooting e debugging pós-rollback
- Padrões de API e fluxo de dados claramente documentados
- Checklist de debugging para prevenir problemas futuros

**🛠️ Padrões de Desenvolvimento Estabelecidos**
- **Rollback preventivo**: Preferir volta ao estado funcional vs debugging excessivo
- **Deploy incremental**: Uma melhoria por vez com teste intermediário
- **Documentação proativa**: Atualizar docs simultaneamente com implementação
- **Logging estruturado**: Usar padrão `📡 API.function_name` para debugging

### 16/09/2025 - Sistema de Membros Completo

**Implementação do Sistema de Filtros Avançados para Membros**
- Redesign completo dos filtros seguindo padrão da tela de atividades
- Filtros principais sempre visíveis (Status e Dojos)
- Modal com filtros avançados (Categoria/Grupo, Categoria de Membro, Buntai, Cargo, Sexo, Grau/Omitama, Usuário)
- Sistema de tags removíveis para filtros ativos
- Busca por nome em tempo real

**Correções de Layout e Funcionalidade**
- Correção da largura dos cards de membros para ocupar tela completa
- Implementação da tela de detalhes individual do membro
- Correção do botão "Ver" que redirecionava incorretamente para login
- Separação do campo de busca e botão de filtros em linhas distintas
- Correção do erro JavaScript `filtersEl is not defined`

**Arquivos Modificados:**
- `view_members_list.html`: Interface completa com modal de filtros
- `view_member_detail.html`: Nova tela de detalhes do membro
- `view_component_memberCard.html`: Card com botão "Ver" funcional
- `styles_components.html`: CSS para modal, filtros e responsividade
- `app_ui.html`: Lógica completa de filtros e navegação (Views.initMembers/initMember)
- `app_router.html`: Rotas para `/members` e `/member?id={ID}`
- `index.html`: Registro dos novos templates

**Funcionalidades Entregues:**
1. **Sistema de Filtros Multi-Nível**: Filtros simples + modal avançado
2. **Visualização Individual**: Tela completa de detalhes do membro
3. **Interface Responsiva**: Design consistente mobile/desktop
4. **Navegação Funcional**: Integração completa com roteamento SPA
5. **Estados Visuais**: Loading, erro, vazio para melhor UX

### 17/09/2025 - Sistema de Participação em Atividades FUNCIONAL ✅

**✅ IMPLEMENTAÇÃO COMPLETA E FUNCIONAL**

**Sistema de Gestão de Participantes totalmente implementado e operacional**
- Tabela "Participacoes" configurada e funcional no Google Sheets
- Sistema de 3 abas: Definir Alvos, Marcar Participações, Estatísticas
- Modal responsivo integrado nos cards de atividades via botão "👥 Participantes"
- Carregamento correto de participações salvas com checkboxes refletindo dados reais
- Interface mobile otimizada para marcar presenças

**🔧 Correções Técnicas Implementadas:**
1. **Função `listParticipacoes` corrigida**: Implementação direta sem dependência de `readTableByNome_()`
2. **Duplicidades removidas**: Event listeners otimizados, prevenção de chamadas múltiplas
3. **Loading states**: Indicadores visuais durante carregamento de dados
4. **Estrutura da tabela "Participacoes"**: 14 campos implementados conforme especificação
5. **Configuração tabela "Planilhas"**: Documentação completa dos campos de configuração

**📋 Tabela "Participacoes" - Estrutura Final:**
Campos: `id | id_atividade | id_membro | tipo | confirmou | confirmado_em | participou | chegou_tarde | saiu_cedo | status_participacao | justificativa | observacoes | marcado_em | marcado_por`

**🔄 Arquivos Principais:**
- **Backend**: `participacoes.gs` (implementação direta e robusta)
- **Frontend**: `view_participacoes_modal.html`, `app_ui.html`, `app_api.html`
- **Estilos**: `styles_components.html` (loading states e responsividade)

**🎯 Pendências para Próximas Sessões:**
1. **Sistema de Status Avançado**: Implementar flags confirmado/rejeitado/justificado
2. **Cálculos Automáticos**: Status dinâmico baseado em regras de negócio
3. **Otimização Global**: Auditoria de duplicidades em todo o projeto
4. **Performance**: Sistema de cache para membros e atividades

### 18/09/2025 - Contadores de Participação nos Cards das Atividades

**📊 IMPLEMENTAÇÃO DOS CONTADORES DE PARTICIPAÇÃO**

**Sistema de contadores visuais nos cards das atividades para mostrar estatísticas de participação**
- Layout com 3 linhas organizadas: Alvo, Previsão e Participação
- Integração com função existente `getParticipacaoStats()` do sistema de participações
- Cores discretas: texto colorido com fundos sutis (preto, verde, vermelho)
- Compatibilidade com atividades pendentes e concluídas

**🔧 Implementação Técnica:**
1. **Backend (`activities.gs`)**: Integração com `getParticipacaoStats()` na função `_listActivitiesCore()`
2. **Frontend (`app_ui.html`)**: Mapeamento dos campos no `Normalizer.activity`
3. **Template (`view_component_activityCard.html`)**: Estrutura HTML com 3 linhas de contadores
4. **Estilos (`styles_components.html`)**: CSS para `.participation-summary` e classes de cores

**📋 Estrutura dos Contadores:**
```
Alvo: [total_alvos]               // sempre exibido
Previsão: [confirmados] [rejeitados]  // verde e vermelho
Participação: [participantes] [ausentes]  // verde e vermelho
```

**🔄 Mapeamento de Dados (Backend → Frontend):**
- `stats.total` → `total_alvos`
- `stats.confirmados` → `confirmados`
- `stats.recusados` → `rejeitados`
- `stats.participaram` → `participantes`
- `stats.ausentes` → `ausentes`

**📂 Arquivos Modificados:**
- `activities.gs`: Integração com `getParticipacaoStats()` e mapeamento de dados
- `app_ui.html`: Normalização dos campos de participação
- `view_component_activityCard.html`: Template com 3 linhas de contadores
- `styles_components.html`: CSS para layout e cores dos contadores

**✅ Benefícios Implementados:**
1. **Reaproveitamento**: Usa função já testada do sistema de participações
2. **Consistência**: Mesmos cálculos da tela de estatísticas
3. **Visibilidade**: Informações de participação direto no card
4. **Layout Organizado**: 3 linhas claras e descritivas
5. **Design Discreto**: Cores sutis que não sobrecarregam a interface

**⚠️ Status**: Implementação completa, aguardando testes funcionais na interface

### 18/09/2025 - Tentativa de Calendário Modal (Revertida)

**🔄 EXPERIMENTAÇÃO COM MODAL DE CALENDÁRIO**

**Tentativa de implementação de calendário modal com filtros padrões**
- Modal responsivo com filtros rápidos (Atrasados, Hoje, 10 dias, 30 dias)
- Interface mais organizada com botões de filtro
- Navegação mensal integrada
- Seleção personalizada de datas

**🚫 Problemas Identificados:**
1. **Complexidade desnecessária**: Modal adicionou camadas extras sem benefício claro
2. **UX inconsistente**: Interação via modal interrompe fluxo natural
3. **Debugging complexo**: Estrutura HTML duplicada causou problemas de renderização
4. **Overhead técnico**: Código adicional para funcionalidade já existente

**✅ Decisão: Rollback para Sistema Original**
- **Calendário inline mantido**: Sistema original funcionando perfeitamente
- **Chip simplificado**: Apenas ícone 📅 sem texto adicional
- **Funcionalidade preservada**: Toggle show/hide do calendário responsivo
- **Código limpo**: Removidas tentativas de modal e templates relacionados

**📂 Arquivos Revertidos:**
- `view_dash.html`: Restaurado calendar-wrapper inline
- `app_ui.html`: Funcionalidade original do chip calendário
- `index.html`: Removido template do modal
- `view_component_calendarModal.html`: Arquivo não será usado

**📚 Lições Aprendidas:**
1. **Não quebrar o que funciona**: Sistema original já atendia necessidades
2. **UX primeiro**: Modal não melhorava experiência do usuário
3. **Simplicidade**: Interface inline é mais direta e intuitiva
4. **Rollback rápido**: Reverter rapidamente quando abordagem não funciona