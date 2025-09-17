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

### 16/09/2025 - Sistema de Participação em Atividades

**⚠️ IMPLEMENTAÇÃO PARCIAL - REQUER VALIDAÇÃO E AJUSTES**

**Sistema de Gestão de Participantes implementado mas necessita testes e validação**
- Nova tabela "Participacoes" com estrutura completa (id, id_atividade, id_membro, tipo, confirmou, participou, etc.)
- 7 novas APIs para gestão completa: listParticipacoes, defineTargets, markParticipacao, confirmarParticipacao, etc.
- Modal com 3 abas: Definir Alvos, Marcar Participações, Estatísticas
- Botão "👥 Participantes" integrado nos cards de atividades
- Interface responsiva para marcar presenças no mobile

**⚠️ Melhorias Pendentes - Requer Validação:**
1. **Configuração da Tabela**: Tabela "Participacoes" precisa ser criada no Google Sheets
2. **Teste das APIs**: Backend necessita verificação e possíveis ajustes
3. **Integração Modal**: Sistema de modal pode precisar de correções de CSS/JS
4. **Filtros de Alvos**: Interface de definição de alvos precisa implementação completa
5. **Estatísticas nos Cards**: Display "X/Y participantes (Z%)" necessita integração
6. **Validação de Regras**: Regras de negócio (status atividade vs. funcionalidades) precisam teste

**Arquivos Criados/Modificados:**
- **Novos**: `participacoes.gs`, `view_participacoes_modal.html`
- **Modificados**: `app_api.html`, `app_ui.html`, `view_component_activityCard.html`, `styles_components.html`, `index.html`

**Próximos Passos para Validação:**
1. Configurar tabela "Participacoes" no Google Sheets
2. Testar APIs no ambiente Google Apps Script
3. Validar funcionamento do modal e abas
4. Ajustar interface de filtros para definir alvos
5. Implementar cálculo de estatísticas nos cards
6. Testes de usabilidade mobile