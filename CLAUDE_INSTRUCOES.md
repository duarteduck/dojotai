# 🤖 INSTRUÇÕES PARA CLAUDE CODE

**Versão:** 2.1-modular | **Atualizado:** 18/10/2025

---

## 🎯 PROPÓSITO DESTE DOCUMENTO

Estas são as regras que o **Claude Code** (ferramenta CLI) deve seguir ao trabalhar neste projeto.

**Objetivo:** Garantir que modificações sejam seguras e não quebrem o sistema em produção.

---

## ❌ NUNCA FAÇA SEM PERGUNTAR ANTES

### Zona Vermelha 🔴

1. **Modificar arquivos em `src/00-core/`**
   - `database_manager.gs` (coração do sistema)
   - `data_dictionary.gs` (schema do banco)
   - `session_manager.gs` (autenticação)
   - Qualquer outro arquivo nesta pasta

2. **Criar ou deletar arquivos**
   - Arquivos .gs (backend)
   - Arquivos .html (frontend - agora 45 arquivos modulares!)
   - Qualquer arquivo de código
   - **NOTA:** Sistema agora é modular com 45 componentes

3. **Alterar estrutura de dados**
   - Modificar `data_dictionary.gs`
   - Adicionar/remover campos de tabelas
   - Mudar tipos de dados
   - Alterar foreign keys

4. **Fazer deploy**
   - `clasp push` (enviar para produção)
   - Qualquer comando que afete o ambiente de produção

5. **Modificar múltiplos arquivos**
   - Mais de 2 arquivos numa única tarefa
   - Mudanças que atravessam múltiplas camadas

6. **Reorganizar estrutura**
   - Mover arquivos entre pastas
   - Renomear arquivos
   - Criar novas pastas

7. **Mudar lógica crítica**
   - Sistema de autenticação
   - Sistema de sessões
   - Lógica de permissões

---

## ⚠️ SEMPRE PERGUNTE ANTES

### Zona Amarela 🟡

Use o template abaixo quando não tiver certeza:

```
Preciso fazer [TAREFA].

Vou modificar:
- Arquivo X: [motivo]
- Arquivo Y: [motivo]

Isso é seguro? Posso prosseguir?
```

**Exemplos de quando perguntar:**
- "Vou adicionar um campo na tabela 'membros', posso?"
- "Preciso modificar activities.gs e members.gs, posso?"
- "Vou criar um novo arquivo utils_helper.gs, posso?"
- "Esta mudança afeta 3 arquivos, posso continuar?"

---

## ✅ PODE FAZER LIVREMENTE

### Zona Verde 🟢

**Modificações seguras (sem perguntar):**

1. **Corrigir bugs em 1 arquivo específico**
   - Desde que não seja `src/00-core/`
   - Exemplo: corrigir erro em `activities.gs`

2. **Ajustar estilos CSS**
   - Modificar cores, espaçamentos, fontes
   - Em `src/05-components/core/styles.html` (Design System)

3. **Melhorar mensagens de erro**
   - Tornar mensagens mais claras
   - Adicionar contexto aos erros

4. **Adicionar logs de debug**
   - Usando `Logger.debug()`, `Logger.info()`
   - Para entender fluxo do código

5. **Criar funções auxiliares**
   - Dentro de arquivos existentes
   - Desde que não modifique funções existentes

6. **Análise e leitura**
   - Ler código
   - Buscar referências
   - Mapear dependências
   - Gerar relatórios

---

## 📋 CHECKLIST OBRIGATÓRIO

**ANTES de modificar qualquer código, verifique:**

```
[ ] Li o GUIA_DESENVOLVIMENTO.md?
[ ] Consultei o data_dictionary.gs (se afetar banco)?
[ ] Consultei o MAPA_CODIGO.md (para saber onde está)?
[ ] Vou modificar MENOS de 2 arquivos?
[ ] NÃO vou mexer em src/00-core/?
[ ] Tenho certeza que não vai quebrar nada?
[ ] Sei como testar depois da mudança?
[ ] Sei como reverter se der errado?
```

**Se TODOS ✅ → PODE FAZER**  
**Se ALGUM ❌ → PERGUNTAR PRIMEIRO**

---

## 🎯 PADRÕES OBRIGATÓRIOS

### 1. Sempre Use DatabaseManager

```javascript
// ❌ ERRADO - Acesso direto ao Sheets
const sheet = SpreadsheetApp.openById(id);
sheet.appendRow([data]);

// ✅ CORRETO - Usar DatabaseManager
const result = DatabaseManager.insert('tabela', data);
```

### 2. Sempre Use Logger

```javascript
// ❌ ERRADO
console.log('erro aconteceu');

// ✅ CORRETO
Logger.error('ModuleName', 'Descrição clara do erro', {
  contexto: 'dados relevantes'
});
```

**Níveis disponíveis:**
- `Logger.debug()` - Informação detalhada de debug
- `Logger.info()` - Informação geral
- `Logger.warn()` - Avisos
- `Logger.error()` - Erros

### 3. Consulte o Dicionário de Dados

**SEMPRE antes de trabalhar com banco de dados:**

1. Abrir `src/00-core/data_dictionary.gs`
2. Verificar campos da tabela
3. Verificar foreign keys
4. Verificar validações
5. Verificar tipos de dados

```javascript
// Exemplo: Antes de inserir em 'membros'
// 1. Abrir data_dictionary.gs
// 2. Buscar: membros: { fields: { ... } }
// 3. Ver quais campos são obrigatórios (required: true)
// 4. Ver tipos de dados (type: 'TEXT', 'NUMBER', etc)
```

### 4. Validações Sempre

```javascript
// ❌ ERRADO - Sem validação
function processar(dados) {
  return dados.nome.toUpperCase();
}

// ✅ CORRETO - Com validações
function processar(dados) {
  // Validar parâmetro
  if (!dados) {
    Logger.warn('Processar', 'Dados null/undefined');
    return null;
  }
  
  // Validar propriedade
  if (!dados.nome) {
    Logger.warn('Processar', 'Nome ausente', { dados });
    return '';
  }
  
  return dados.nome.toUpperCase();
}
```

---

## 🚨 PROTOCOLO DE ERRO

**Se você cometer um erro:**

### 1. PARE IMEDIATAMENTE ⏸️
Não continue tentando consertar sozinho.

### 2. DOCUMENTE 📸
Anote exatamente:
- O que você estava fazendo
- Qual arquivo modificou
- Qual linha modificou
- Qual erro apareceu
- Que arquivos foram criados/movidos/deletados

### 3. AVISE 💬
Use este template:

```
⚠️ ERRO COMETIDO

Estava fazendo: [tarefa]

Modifiquei:
- Arquivo X (linha Y)
- Arquivo Z (criado novo)

Erro que apareceu:
[mensagem de erro completa]

Como reverter?
```

### 4. AGUARDE ⏳
Não tente consertar o erro sem orientação.

---

## 📊 RESUMO VISUAL DAS ZONAS

```
┌─────────────────────────────────────────┐
│  🔴 ZONA VERMELHA (Nunca sem perguntar) │
├─────────────────────────────────────────┤
│  • src/00-core/*                        │
│  • data_dictionary.gs                   │
│  • Criar/deletar arquivos               │
│  • Deploy (clasp push)                  │
│  • Reorganizar estrutura                │
│  • Modificar >2 arquivos                │
│  • Alterar schemas de dados             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🟡 ZONA AMARELA (Pedir permissão)      │
├─────────────────────────────────────────┤
│  • Modificar 2 arquivos                 │
│  • Adicionar campo em tabela            │
│  • Criar nova funcionalidade            │
│  • Mudar fluxos importantes             │
│  • Qualquer dúvida                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🟢 ZONA VERDE (Pode fazer livremente)  │
├─────────────────────────────────────────┤
│  • Corrigir bugs (1 arquivo)            │
│  • Ajustar CSS/estilos                  │
│  • Melhorar mensagens                   │
│  • Adicionar logs                       │
│  • Análise e leitura                    │
│  • Criar funções auxiliares             │
└─────────────────────────────────────────┘
```

---

## 🔍 EXEMPLOS PRÁTICOS

### ✅ Exemplo de Tarefa SEGURA

**Tarefa:** Corrigir bug em listagem de atividades

```javascript
// Arquivo: src/01-business/activities.gs

// Bug encontrado: filtro não funciona quando status é null
function listActivitiesApi(filters) {
  // ✅ Adicionar validação
  if (filters && filters.status === null) {
    delete filters.status; // Remove filtro null
  }
  
  // Resto do código permanece igual...
}
```

**Por que é seguro:**
- ✅ 1 arquivo apenas
- ✅ Não é src/00-core/
- ✅ Correção pequena e localizada
- ✅ Não afeta estrutura de dados

---

### ❌ Exemplo de Tarefa PERIGOSA

**Tarefa:** Adicionar campo "observacoes" em membros

```javascript
// ❌ NÃO FAÇA ISSO sem perguntar

// 1. Modificar src/00-core/data_dictionary.gs
membros: {
  fields: {
    // ... campos existentes ...
    observacoes: { type: 'TEXT' } // ❌ NÃO ADICIONE sem perguntar
  }
}

// 2. Adicionar coluna no Google Sheets
// ❌ NÃO FAÇA sem perguntar

// 3. Modificar members.gs
// ❌ NÃO FAÇA sem perguntar
```

**Por que é perigoso:**
- ❌ Modifica data_dictionary.gs (zona vermelha)
- ❌ Altera estrutura de dados
- ❌ Afeta múltiplos arquivos
- ❌ Pode quebrar queries existentes

**O que fazer:**
```
Preciso adicionar campo "observacoes" na tabela membros.

Vou modificar:
- src/00-core/data_dictionary.gs (adicionar campo)
- Google Sheets (adicionar coluna)
- src/01-business/members.gs (se necessário)

Isso é seguro? Posso prosseguir?
```

---

## 💡 DICAS IMPORTANTES

### 1. Quando em Dúvida, Sempre Pergunte
**Melhor perguntar 10 vezes que quebrar 1 vez.**

### 2. Leia Antes de Modificar
- GUIA_DESENVOLVIMENTO.md - Como fazer
- MAPA_CODIGO.md - Onde está
- data_dictionary.gs - Estrutura dos dados

### 3. Teste Localmente Primeiro
Antes de qualquer mudança:
1. Entenda o código atual
2. Faça a modificação
3. Teste no Apps Script console
4. Verifique logs
5. Só então considere deploy

### 4. Commits Claros
```bash
# ✅ BOM
git commit -m "fix: corrige filtro de status em activities.gs"

# ❌ RUIM
git commit -m "fix stuff"
```

### 5. Um Problema por Vez
Não tente resolver múltiplos problemas numa única modificação.

---

## 🎓 FILOSOFIA DO PROJETO

### Princípios que Guiam Este Projeto

1. **Segurança Primeiro**
   - Sistema está em produção
   - Usuários reais dependem dele
   - Quebrar = problema sério

2. **Simplicidade**
   - Código simples > Código inteligente
   - Manutenível > Perfeito

3. **Documentação é Código**
   - Se não está documentado, não existe
   - Sempre documente decisões importantes

4. **Comunicação Clara**
   - Perguntar não é fraqueza
   - Explicar não é perda de tempo

5. **Responsabilidade**
   - Você é responsável pelo código que escreve
   - Teste antes de commitar
   - Documente o que fez

---

## 📞 QUANDO PEDIR AJUDA

**Peça ajuda se:**
- ❓ Não entende o código existente
- ❓ Não sabe onde fazer a modificação
- ❓ Não tem certeza se é seguro
- ❓ Encontrou algo estranho/suspeito
- ❓ O erro persiste depois de tentar resolver
- ❓ Precisa modificar >1 arquivo
- ❓ Vai mexer em src/00-core/

**Não peça ajuda para:**
- ✅ Erros simples de sintaxe (resolva você mesmo)
- ✅ Consultar documentação (leia antes)
- ✅ Mudanças de CSS básicas

---

## 🎯 RESUMO FINAL

### A Regra Mais Importante

```
┌─────────────────────────────────────────┐
│                                         │
│     🛑 QUANDO EM DÚVIDA, PERGUNTE 🛑     │
│                                         │
│  Melhor perguntar e parecer iniciante  │
│  Do que quebrar produção e causar      │
│  problemas reais para usuários reais   │
│                                         │
└─────────────────────────────────────────┘
```

### O Que Este Documento Garante

Se você seguir estas instruções:
- ✅ Nunca vai quebrar o sistema crítico
- ✅ Sempre vai saber o que pode/não pode fazer
- ✅ Vai trabalhar com confiança
- ✅ Vai manter o projeto saudável

### Lembrete Final

**Este documento existe para ajudar, não para limitar.**

O objetivo é permitir que você trabalhe com segurança, sabendo exatamente até onde pode ir sozinho e quando precisa de orientação.

---

**📚 Documentação Relacionada:**
- [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md) - Como fazer tarefas
- [MAPA_CODIGO.md](MAPA_CODIGO.md) - Onde está cada coisa
- [TAREFAS.md](TAREFAS.md) - O que fazer agora

**🤖 Versão:** 2.1-modular | **Válido a partir de:** 18/10/2025

---

## 📌 NOTA: SISTEMA AGORA É MODULAR

**Sistema modularizado em Out/2025:** 45 arquivos especializados (antes 1 monolítico)

**Para encontrar funcionalidades:** Consulte [MAPA_CODIGO.md](MAPA_CODIGO.md)
**Para entender a modularização:** Consulte [PARTICIONAMENTO_COMPLETO.md](PARTICIONAMENTO_COMPLETO.md)