# 📋 ORIENTAÇÃO DIÁRIA - Sistema Dojotai V2.0

> **🎯 LEIA ESTE ARQUIVO TODO DIA ANTES DE COMEÇAR O DESENVOLVIMENTO**
>
> **Última atualização:** 22/09/2025
> **Status do projeto:** Dia 4 - Sistema de Sessões Finalizado

---

## 🚨 **PRIMEIRO: O QUE VOCÊ DEVE SEMPRE LEMBRAR**

### **1. 📊 DICIONÁRIO DE DADOS (`src/00-core/data_dictionary.gs`)**
- **É A FONTE DA VERDADE** - Todas as tabelas, campos, validações e FKs estão definidas aqui
- **Primary Keys importantes:**
  - `usuarios` → `uid` (não `id`!)
  - `atividades` → `id`
  - `sessoes` → `session_id`
- **Foreign Keys seguem padrão:** `tabela.campo` (ex: `usuarios.uid`)
- **Sempre verificar FK antes de criar relacionamentos**

### **2. 🛠️ SISTEMA CENTRALIZADO (`DatabaseManager`)**
- **SEMPRE usar:** `DatabaseManager.insert()`, `.update()`, `.query()`
- **NUNCA usar:** appendRow() direto ou funções antigas
- **Validações automáticas:** FK, business rules, formatos
- **Logs automáticos:** Todas operações são logadas
- **Cache:** Invalidação automática

### **3. 🔐 SEGURANÇA (`SecurityManager`)**
- **Senhas:** SEMPRE hash SHA-256
- **Migração automática:** Texto → Hash
- **Validação híbrida:** Aceita texto E hash

### **4. 📝 LOGS (`Logger`)**
- **Usar sempre:** `Logger.info()`, `.warn()`, `.error()`
- **Contexto obrigatório:** `Logger.info('ModuleName', 'mensagem', { data })`
- **Níveis:** DEBUG < INFO < WARN < ERROR

---

## 📋 **PENDÊNCIAS ATUAIS (22/09/2025)**

### ✅ **CONCLUÍDO**
- ✅ **Sistema de Sessões V4** - ✅ **100% FUNCIONAL** (Login + Logout + State management)
- ✅ **Hash SHA-256** - Migração automática funcionando
- ✅ **Tags Híbridas** - Categorias múltiplas + tags livres
- ✅ **DatabaseManager** - Bug async/await corrigido
- ✅ **Configuração Central** - APP_CONFIG expandido
- ✅ **State Management** - User + Session persistidos no localStorage

### 🚧 **PENDÊNCIAS CRÍTICAS**

#### **1. REVISAR Estruturas das Novas Tabelas**
- **Arquivo:** `docs/ESTRUTURAS_NOVAS_TABELAS.md`
- **Tabelas:** Notificações, Preferências, Histórico
- **Ação:** Validar estruturas antes da implementação
- **Prioridade:** ALTA

#### **2. Implementar Sistema de Logs Estruturados**
- **Status:** Parcial (Logger existe, falta shared_logger.gs completo)
- **Dependência:** Estrutura de tabelas de logs
- **Prioridade:** MÉDIA

#### **3. Sistema de Permissões Granulares**
- **Status:** Planejado
- **Arquivo futuro:** `src/00-core/permission_manager.gs`
- **Dependência:** Sistema de sessões (✅ concluído)
- **Prioridade:** BAIXA

---

## 🏗️ **ARQUITETURA ATUAL**

### **📂 Estrutura de Arquivos**
```
src/00-core/
├── 00_config.gs              ✅ Configurações centrais
├── data_dictionary.gs        ✅ Fonte da verdade - SEMPRE CONSULTAR
├── database_manager.gs       ✅ CRUD centralizado
└── session_manager.gs        ✅ Sistema de sessões

auth.gs                       ✅ Integrado com sessões
utils.gs                      ✅ Funções auxiliares
activities.gs                 ✅ Sistema híbrido de tags
```

### **📊 Base de Dados (Google Sheets)**
- **Tabelas principais:** usuarios, atividades, membros, participacoes
- **Novas tabelas:** sessoes ✅
- **Pendentes:** notificacoes, preferencias, historico

### **🔄 Fluxo de Desenvolvimento**
1. **Verificar dicionário** → `data_dictionary.gs`
2. **Usar DatabaseManager** → Para todas operações
3. **Validações automáticas** → FK, business rules
4. **Logs estruturados** → Logger sempre
5. **Testes robustos** → Validar integração

---

## 🎯 **PRÓXIMOS PASSOS RECOMENDADOS**

### **Sessão de hoje (22/09/2025):**
1. **Revisar tabelas novas** - Estruturas em `ESTRUTURAS_NOVAS_TABELAS.md`
2. **Definir prioridades** - Qual sistema implementar primeiro?
3. **Validar arquitetura** - Estruturas fazem sentido para o negócio?

### **Próximas sessões:**
- **PermissionManager** - Sistema de permissões granulares
- **Logs avançados** - Sistema completo de auditoria
- **Performance monitoring** - Métricas e otimizações
- **Paginação** - Para grandes volumes
- **APIs REST** - Preparar para frontend moderno

---

## ⚠️ **ARMADILHAS COMUNS - EVITE:**

### **1. Confusão de Primary Keys**
- ❌ **ERRO:** `usuarios.id`
- ✅ **CORRETO:** `usuarios.uid`

### **2. Uso de funções antigas**
- ❌ **ERRO:** `appendRow()`, `getRange().setValues()`
- ✅ **CORRETO:** `DatabaseManager.insert()`, `DatabaseManager.update()`

### **3. Validações manuais**
- ❌ **ERRO:** Validar FK manualmente
- ✅ **CORRETO:** Deixar ValidationEngine validar automaticamente

### **4. Logs inadequados**
- ❌ **ERRO:** `console.log('erro')`
- ✅ **CORRETO:** `Logger.error('ModuleName', 'Descrição clara', { contextData })`

### **5. Async/await**
- ❌ **ERRO:** `const result = DatabaseManager.insert()` (sem await)
- ✅ **CORRETO:** `const result = await DatabaseManager.insert()`

---

## 🔍 **COMANDOS IMPORTANTES**

### **Deploy e Testes**
```bash
# Deploy para Google Apps Script
clasp push

# Abrir editor
clasp open

# Testar sessões (exemplo)
# Execute no Apps Script: testSessionManagerSimple()
```

### **Arquivos para consulta rápida**
- **Dicionário:** `src/00-core/data_dictionary.gs`
- **Configuração:** `src/00-core/00_config.gs`
- **Pendências:** `PENDENCIAS_E_ROADMAP.md`
- **Esta orientação:** `ORIENTACAO_DIARIA.md`

---

## 📈 **MÉTRICAS DE PROGRESSO**

### **Sistema V2.0 - Status Atual**
- **Concluído:** ~75% do core system
- **Em desenvolvimento:** Sistemas avançados (logs, permissões)
- **Próximo marco:** Tabelas auxiliares implementadas

### **Qualidade do Código**
- ✅ **Centralização:** DatabaseManager para todas operações
- ✅ **Validações:** FK e business rules automáticas
- ✅ **Logs:** Estruturados e consistentes
- ✅ **Segurança:** Hash SHA-256 implementado
- ✅ **Sessões:** Sistema robusto funcionando

---

## 🎖️ **LEMBRETE FINAL**

**Sempre que iniciar uma sessão de desenvolvimento:**

1. 📖 **Leia este arquivo** para relembrar contexto
2. 📊 **Consulte o dicionário** antes de mexer em tabelas
3. 🔍 **Verifique pendências** em `PENDENCIAS_E_ROADMAP.md`
4. 🧪 **Teste sempre** antes de considerar concluído
5. 📝 **Documente** mudanças importantes

**O sistema está bem estruturado - mantenha os padrões!** 🏗️

---

**👨‍💻 Desenvolvido com:** Claude Code + Diogo
**📅 Última sessão:** 22/09/2025 - Sistema de Sessões V4.0 finalizado
**🎯 Próxima meta:** Revisar e implementar estruturas auxiliares