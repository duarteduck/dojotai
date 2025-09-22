# 📊 Estruturas das Novas Tabelas para Layout Futuro

> **Criado**: 19/09/2025
> **Objetivo**: Preparar tabelas para futuro layout moderno

---

## 🔔 **Tabela: Notificacoes**

### **Estrutura Sugerida**
```
id | id_usuario | tipo | titulo | mensagem | lida | criado_em | expires_at
```

### **Campos Detalhados**
- **id**: TEXT - ID único (ex: `NOT-001`, `NOT-002`)
- **id_usuario**: TEXT - FK para usuarios.id
- **tipo**: TEXT - Tipo da notificação (`info`,`warning`, `success`, `error`,`atividade`,`confirmação`)
- **titulo**: TEXT - Título curto da notificação
- **mensagem**: TEXT - Mensagem completa
- **lida**: TEXT - Status (`sim`/vazio) - seguindo padrão do sistema
- **criado_em**: DATETIME - Timestamp de criação
- **expires_at**: DATETIME - Data de expiração (opcional)

### **Exemplos de Uso**
```
NOT-001 | U1726692234567 | info | Nova Atividade | "Atividade de Kata criada para amanhã" | vazio | 2025-09-19 20:00 | 2025-09-26 20:00
NOT-002 | U1726692234567 | warning | Confirmação Pendente | "Confirme sua participação na atividade de hoje" | vazio | 2025-09-19 08:00 | 2025-09-19 18:00
```

---

## ⚙️ **Tabela: Preferencias**

### **Estrutura Sugerida**
```
id_usuario | tema | notificacoes_ativas | configuracao_dashboard | idioma | atualizado_em
```

### **Campos Detalhados**
- **id_usuario**: TEXT - FK para usuarios.id (PK)
- **tema**: TEXT - Tema da interface (`claro`, `escuro`, `auto`)
- **notificacoes_ativas**: TEXT - Receber notificações (`sim`/vazio)
- **configuracao_dashboard**: TEXT - JSON com config do dashboard
- **idioma**: TEXT - Idioma da interface (`pt-BR`, `en-US`)
- **atualizado_em**: DATETIME - Última atualização

### **Exemplo de configuracao_dashboard (JSON)**
```json
{
  "widgets": ["atividades_proximas", "estatisticas", "participacoes"],
  "layout": "compacto",
  "cards_por_pagina": 10,
  "exibir_graficos": true
}
```

### **Exemplos de Uso**
```
U1726692234567 | escuro | sim | {"widgets":["atividades"],"layout":"compacto"} | pt-BR | 2025-09-19 20:00
```

---

## 📚 **Tabela: Historico**

### **Estrutura Sugerida**
```
id | id_usuario | acao | tabela_alvo | id_alvo | detalhes | ip_address | criado_em
```

### **Campos Detalhados**
- **id**: TEXT - ID único (ex: `HIS-001`, `HIS-002`)
- **id_usuario**: TEXT - FK para usuarios.id
- **acao**: TEXT - Tipo de ação (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, `LOGOUT`)
- **tabela_alvo**: TEXT - Tabela afetada (`atividades`, `membros`, etc.)
- **id_alvo**: TEXT - ID do registro afetado
- **tipo_alvo**: TEXT - Tipo do registro afetado (`atividade`,`usuario`,`membro`)
- **detalhes**: TEXT - JSON com detalhes da operação
- **ip_address**: TEXT - IP do usuário (se disponível)
- **criado_em**: DATETIME - Timestamp da ação

### **Exemplo de detalhes (JSON)**
```json
{
  "campos_alterados": ["titulo", "data_inicio"],
  "valores_anteriores": {"titulo": "Kata Antiga"},
  "valores_novos": {"titulo": "Kata Nova"},
  "user_agent": "Mozilla/5.0..."
}
```

### **Exemplos de Uso**
```
HIS-001 | U1726692234567 | CREATE | atividades | ACT-202509190001 | {"titulo":"Nova Atividade"} | 192.168.1.100 | 2025-09-19 20:00
HIS-002 | U1726692234567 | UPDATE | membros | M1726692234568 | {"campos_alterados":["grau"]} | 192.168.1.100 | 2025-09-19 20:05
HIS-003 | U1726692234567 | LOGIN | usuarios | U1726692234567 | {"successful":true} | 192.168.1.100 | 2025-09-19 19:55
```

---

## 🔧 **Integração com Sistema Atual**

### **Campos FK que Referenciam Tabelas Existentes**
- **Notificacoes.id_usuario** → usuarios.id
- **Preferencias.id_usuario** → usuarios.id
- **Historico.id_usuario** → usuarios.id
- **Historico.id_alvo** → Depende da tabela_alvo

### **Padrões de ID Sugeridos**
```javascript
// Em 00_config.gs - adicionar:
ID_PATTERNS: {
  // ... existentes ...
  notificacoes: {
    prefix: 'NOT',
    format: 'NOT-{counter}',
    description: 'ID de notificação - NOT- + contador'
  },
  historico: {
    prefix: 'HIS',
    format: 'HIS-{counter}',
    description: 'ID de histórico - HIS- + contador'
  }
}
```

---

## 📋 **Para Você Revisar e Ajustar**

### **Pontos para Decisão**
1. **Notificações**: Os tipos `info/warning/success/error` fazem sentido?
2. **Preferências**: Que outras configurações o usuário deve poder personalizar?
3. **Histórico**: Quais ações são importantes de auditar?
4. **Campos extras**: Algum campo específico do dojo que esqueci?

### **Próximos Passos**
1. **Revisar** estruturas propostas
2. **Ajustar** campos conforme necessário
3. **Criar** as tabelas no Google Sheets
4. **Atualizar** data_dictionary.gs com as novas tabelas
5. **Testar** inserção/consulta básica