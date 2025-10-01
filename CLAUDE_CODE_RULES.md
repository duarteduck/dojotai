# 🚦 REGRAS PARA CLAUDE CODE

**Versão:** 2.0 - Pós-Auditoria Completa | **Data:** 30/09/2025

---

## ❌ PROIBIDO SEM PERMISSÃO

### Nunca faça isso sozinho:

1. ❌ Criar ou deletar arquivos .gs ou .html
2. ❌ Modificar `src/00-core/*` (DatabaseManager, SessionManager, Config, etc)
3. ❌ Alterar estrutura de tabelas no `data_dictionary.gs`
4. ❌ Fazer `clasp push` (deploy para produção)
5. ❌ Modificar mais de 3 arquivos numa única tarefa
6. ❌ Mudar lógica de autenticação em `auth.gs`
7. ❌ Alterar schemas de banco de dados
8. ❌ Mover ou arquivar documentação sem permissão
9. ❌ Reorganizar estrutura de pastas
10. ❌ Remover arquivos mesmo que pareçam órfãos (validar primeiro)

### ⚠️ Sempre pergunte ANTES:

```
"Vou criar o arquivo X.gs para fazer Y, posso?"
"Preciso modificar database_manager.gs, posso prosseguir?"
"Vou mudar 5 arquivos para implementar isso, ok?"
"Posso arquivar/mover estes arquivos de documentação?"
"Encontrei código que parece órfão, posso mover para backup?"
```

---

## ✅ PODE FAZER LIVREMENTE

### Modificações seguras:

1. ✅ Corrigir bugs em funções específicas (1 arquivo por vez)
2. ✅ Adicionar campos em formulários HTML (sem mudar estrutura)
3. ✅ Ajustar estilos CSS
4. ✅ Melhorar mensagens de erro
5. ✅ Adicionar logs de debug (usando Logger)
6. ✅ Criar funções auxiliares em arquivos existentes
7. ✅ Análise técnica (buscar referências, mapear dependências)
8. ✅ Gerar relatórios (sem modificar código)

---

## 📋 CHECKLIST ANTES DE QUALQUER MODIFICAÇÃO

```
[ ] Li o ORIENTACAO_DIARIA.md hoje?
[ ] Consultei o MAPA_PROJETO.md para ver estrutura?
[ ] Consultei o data_dictionary.gs para ver estrutura de dados?
[ ] Vou modificar MENOS de 3 arquivos?
[ ] A mudança NÃO afeta src/00-core/?
[ ] Tenho certeza de que não vou quebrar nada?
[ ] Vou documentar a mudança no código?
[ ] NÃO vou mover/arquivar documentação sem permissão?
[ ] NÃO vou criar/deletar arquivos sem permissão?
```

**Se marcou tudo ✅ → PODE FAZER**  
**Se algum ❌ → PERGUNTAR PRIMEIRO**

---

## 🎯 PADRÕES OBRIGATÓRIOS

### 1. Sempre use DatabaseManager

```javascript
// ❌ ERRADO
const sheet = SpreadsheetApp.openById(id);
sheet.appendRow([data]);

// ✅ CORRETO
const result = await DatabaseManager.insert('tabela', data);
```

### 2. Sempre use Logger

```javascript
// ❌ ERRADO
console.log('erro');

// ✅ CORRETO
Logger.error('ModuleName', 'Descrição clara', { contextData });
```

### 3. Consulte o dicionário ANTES

```javascript
// SEMPRE faça isso primeiro:
// 1. Abrir src/00-core/data_dictionary.gs
// 2. Verificar campos da tabela
// 3. Verificar FKs e validações
// 4. Verificar tipos de dados
```

---

## 💬 COMO PEDIR PERMISSÃO

### Template de pergunta:

```
Preciso fazer [TAREFA].

Vou modificar:
- Arquivo X: [motivo]
- Arquivo Y: [motivo]

Arquivos que vou criar/deletar:
- [lista se aplicável]

Isso é seguro? Posso prosseguir?
```

---

## 🚨 SE COMETER ERRO

### Passos de recuperação:

1. ⚠️ **PARE IMEDIATAMENTE**
2. 🔍 **Documente o que fez**
3. 💬 **Avise o usuário**: 
   ```
   "Cometi um erro em X, como reverter?"
   "Modifiquei [arquivos], criei [arquivos], deletei [arquivos]"
   ```
4. ⏪ **Aguarde instruções de rollback**

**NUNCA tente "consertar" o erro sozinho sem avisar!**

---

## 📊 RESUMO VISUAL

```
┌─────────────────────────────────────────┐
│  🔴 ZONA VERMELHA (Nunca mexer)         │
├─────────────────────────────────────────┤
│  • src/00-core/*                        │
│  • data_dictionary.gs                   │
│  • database_manager.gs                  │
│  • auth.gs (lógica principal)           │
│  • Criar/deletar arquivos               │
│  • Mover/arquivar documentação          │
│  • Reorganizar pastas                   │
│  • Deploy (clasp push)                  │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🟡 ZONA AMARELA (Pedir permissão)      │
├─────────────────────────────────────────┤
│  • Modificar >3 arquivos                │
│  • Alterar estruturas de dados          │
│  • Mudar fluxos críticos                │
│  • Remover código órfão                 │
│  • Mover arquivos para backup           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🟢 ZONA VERDE (Pode fazer)             │
├─────────────────────────────────────────┤
│  • Bugs em funções específicas          │
│  • Ajustes de CSS/HTML                  │
│  • Melhorar mensagens                   │
│  • Adicionar logs                       │
│  • Análise técnica (leitura)            │
│  • Gerar relatórios                     │
└─────────────────────────────────────────┘
```

---

## 🔍 ARQUIVOS ÓRFÃOS - PROCEDIMENTO ESPECIAL

### Situação Atual (30/09/2025)

**Órfãos Identificados (7 arquivos - 6.751 linhas):**
1. src/02-api/main.gs (12 linhas)
2. src/03-shared/app_api.html (841 linhas)
3. src/03-shared/app_ui.html (5.373 linhas)
4. src/04-views/view_activity_new.html (42 linhas)
5. src/04-views/view_member_detail.html (163 