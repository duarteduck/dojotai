# 📊 Estruturas das Novas Tabelas - Revisão Final

> **Criado**: 19/09/2025
> **Atualizado**: 22/09/2025
> **Status**: ✅ **DATA_DICTIONARY ATUALIZADO** - Estruturas prontas para implementação

---

## ✅ **TABELAS JÁ IMPLEMENTADAS**
- **performance_logs** ✅ Funcional desde 22/09/2025
- **system_health** ✅ Funcional desde 22/09/2025

---

## 🔔 **TABELA: notificacoes** - **ESTRUTURA FINALIZADA**

### **✅ Estrutura Otimizada (Já no Data Dictionary)**
```
id | id_usuario | tipo | titulo | mensagem | lida | expires_at | criado_em | deleted
```

### **🔧 Melhorias Aplicadas:**
- ✅ **Campos obrigatórios adicionados**: `criado_em`, `deleted`
- ✅ **FK validation**: `id_usuario` → `usuarios.uid`
- ✅ **Pattern ID**: `^NOT-\\d+$` com geração automática
- ✅ **Enum `lida`**: `['sim', '']` seguindo padrão do sistema
- ✅ **Validações de tamanho**: título (100 chars), mensagem (500 chars)

### **📋 Campos Detalhados:**
| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `id` | TEXT | Sim (auto) | ID único - gerado automaticamente | `NOT-001` |
| `id_usuario` | TEXT | Sim | FK para usuarios.uid | `U1726692234567` |
| `tipo` | TEXT | Sim | Tipo: info\|warning\|success\|error\|atividade\|confirmacao | `info` |
| `titulo` | TEXT | Sim | Título (max 100 chars) | `Nova Atividade` |
| `mensagem` | TEXT | Sim | Mensagem (max 500 chars) | `Atividade criada para amanhã` |
| `lida` | TEXT | Não | Status: vazio=não lida, sim=lida | `''` ou `'sim'` |
| `expires_at` | DATETIME | Não | Data de expiração (opcional) | `2025-09-26 20:00:00` |
| `criado_em` | DATETIME | Sim (auto) | Data de criação - gerado automaticamente | `2025-09-22 15:30:00` |
| `deleted` | TEXT | Não | Soft delete: vazio=ativo, x=deletado | `''` |

---

## ⚙️ **TABELA: preferencias** - **ESTRUTURA FINALIZADA**

### **✅ Estrutura Otimizada (Já no Data Dictionary)**
```
id_usuario | tema | notificacoes_ativas | configuracao_dashboard | idioma | atualizado_em | deleted
```

### **🔧 Melhorias Aplicadas:**
- ✅ **PK correta**: `id_usuario` como chave primária
- ✅ **FK validation**: `id_usuario` → `usuarios.uid`
- ✅ **Enum otimizado**: `tema` com valores `['claro', 'escuro', 'auto']`
- ✅ **Defaults inteligentes**: `tema='auto'`, `notificacoes_ativas='sim'`, `idioma='pt-BR'`
- ✅ **JSON validation**: `configuracao_dashboard` com validação

### **📋 Campos Detalhados:**
| Campo | Tipo | Obrigatório | Padrão | Descrição |
|-------|------|-------------|--------|-----------|
| `id_usuario` | TEXT | Sim | - | FK para usuarios.uid (PK) |
| `tema` | TEXT | Não | `auto` | Tema: claro\|escuro\|auto |
| `notificacoes_ativas` | TEXT | Não | `sim` | Receber notificações: vazio=não, sim=sim |
| `configuracao_dashboard` | TEXT | Não | - | JSON com config personalizada |
| `idioma` | TEXT | Não | `pt-BR` | Idioma: pt-BR\|en-US |
| `atualizado_em` | DATETIME | Não | - | Última atualização |
| `deleted` | TEXT | Não | `''` | Soft delete |

### **📄 Exemplo de `configuracao_dashboard`:**
```json
{
  "widgets": ["atividades_proximas", "estatisticas", "participacoes"],
  "layout": "compacto",
  "cards_por_pagina": 10,
  "exibir_graficos": true,
  "tema_cards": "moderno"
}
```

---

## 📚 **TABELA: historico** - **ESTRUTURA FINALIZADA**

### **✅ Estrutura Otimizada (Já no Data Dictionary)**
```
id | id_usuario | acao | tabela_alvo | id_alvo | detalhes | user_agent | criado_em | deleted
```

### **🔧 Melhorias Aplicadas:**
- ✅ **Campo removido**: `tipo_alvo` (redundante com `tabela_alvo`)
- ✅ **Campo alterado**: `ip_address` → `user_agent` (mais útil no Google Apps Script)
- ✅ **Enum `acao`**: `['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'VIEW']`
- ✅ **Pattern ID**: `^HIS-\\d+$` com geração automática
- ✅ **FK validation**: `id_usuario` → `usuarios.uid`

### **📋 Campos Detalhados:**
| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| `id` | TEXT | Sim (auto) | ID único - gerado automaticamente | `HIS-001` |
| `id_usuario` | TEXT | Sim | FK para usuarios.uid | `U1726692234567` |
| `acao` | TEXT | Sim | Ação: CREATE\|UPDATE\|DELETE\|LOGIN\|LOGOUT\|VIEW | `CREATE` |
| `tabela_alvo` | TEXT | Não | Tabela afetada (opcional para LOGIN/LOGOUT) | `atividades` |
| `id_alvo` | TEXT | Não | ID do registro afetado | `ACT-202509190001` |
| `detalhes` | TEXT | Não | JSON com detalhes da operação | `{"campos":["titulo"]}` |
| `user_agent` | TEXT | Não | User agent do navegador (max 500 chars) | `Mozilla/5.0...` |
| `criado_em` | DATETIME | Sim (auto) | Data da ação - gerado automaticamente | `2025-09-22 15:30:00` |
| `deleted` | TEXT | Não | Soft delete | `''` |

### **📄 Exemplo de `detalhes`:**
```json
{
  "campos_alterados": ["titulo", "data_inicio"],
  "valores_anteriores": {"titulo": "Kata Antiga"},
  "valores_novos": {"titulo": "Kata Nova"},
  "ip": "192.168.1.100",
  "sessao": "SES-abc123"
}
```

---

## 🔄 **PRÓXIMOS PASSOS**

### **✅ JÁ CONCLUÍDO:**
1. ✅ **Data Dictionary atualizado** - Todas as 3 tabelas adicionadas com estruturas otimizadas
2. ✅ **Validações configuradas** - FK, patterns, enums, defaults
3. ✅ **Compatibilidade verificada** - Seguem padrões do sistema atual

### **📋 PENDENTE (Sua Revisão):**
1. **Revisar estruturas finais** - Campos e tipos estão adequados?
2. **Validar tipos de notificação** - Os 6 tipos cobrem suas necessidades?
3. **Confirmar preferências** - Que outras configs o usuário deve personalizar?
4. **Definir ações de auditoria** - Quais ações são importantes rastrear no histórico?

### **🚀 IMPLEMENTAÇÃO (Após Sua Aprovação):**
1. **Criar planilhas no Google Sheets** - Configurar abas com cabeçalhos
2. **Atualizar tabela "Planilhas"** - Adicionar configuração de acesso
3. **Testar CRUD básico** - Inserção e consulta via DatabaseManager
4. **Implementar APIs** - Funções específicas para cada tabela

---

## 💡 **SUGESTÕES PARA DISCUSSÃO**

### **🔔 Notificações:**
- Adicionar campo `prioridade` (baixa/média/alta)?
- Implementar sistema de templates para tipos recorrentes?
- Notificações automáticas baseadas em eventos do sistema?

### **⚙️ Preferências:**
- Adicionar configurações de timezone pessoal?
- Preferências de email/push notifications?
- Customização de cores/temas personalizados?

### **📚 Histórico:**
- Implementar retenção automática (ex: deletar logs > 1 ano)?
- Adicionar integração com PerformanceMonitor?
- Log automático de todas as operações do DatabaseManager?

---

**🎯 SISTEMA V2.0:** Estruturas prontas para Frontend V3 e funcionalidades avançadas!