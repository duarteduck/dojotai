# 🥋 Sistema Dojotai

Sistema de gestão completo para dojos de artes marciais e práticas espirituais.

**Tecnologia:** Google Apps Script + Google Sheets como banco de dados
**Arquitetura:** Backend (15 arquivos .gs) + Frontend Modular (45 componentes .html)
**Status:** ✅ Em produção | ⚡ **Modularizado em Out/2025**

---

## ⚡ O Que Este Sistema Faz

- 📅 **Gestão de Atividades** - Treinos, eventos, avaliações, cerimônias
- 👥 **Gestão de Membros** - Cadastro completo de praticantes
- ✅ **Controle de Presença** - Sistema de participação e frequência
- 🎯 **Sistema de Alvos** - Definir quem convidar para cada atividade
- 📊 **Relatórios** - Estatísticas e acompanhamento

---

## 🚀 Quick Start (5 minutos)

### Pré-requisitos
```bash
- Node.js instalado
- Conta Google
- Git
```

### Instalação
```bash
# 1. Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd Sistema-Dojotai

# 2. Instale o clasp (CLI do Google Apps Script)
npm install -g @google/clasp

# 3. Autentique no Google
clasp login

# 4. Configure o projeto (já tem .clasp.json)
# Verifique o scriptId em .clasp.json

# 5. Faça o primeiro deploy
clasp push
```

### Abrir no Navegador
1. Execute: `clasp open`
2. No editor do Apps Script, clique em **Executar > Testar como Web App**
3. Ou acesse diretamente: [URL_DO_WEB_APP]

**Credenciais padrão (dev):**
- Login: `admin`
- Senha: `[SENHA_DO_SISTEMA]`

---

## 📚 Documentação

### 👨‍💻 Para Desenvolvedores

- **🧭 [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)** ⭐ **COMECE AQUI**
  - Como trabalhar no projeto
  - Setup completo
  - Workflows para tarefas comuns
  - Troubleshooting
  - Referência de APIs

- **🗺️ [MAPA_CODIGO.md](MAPA_CODIGO.md)**
  - Estrutura detalhada do código
  - Onde encontrar cada funcionalidade
  - Arquitetura de arquivos

- **🤖 [CLAUDE_INSTRUCOES.md](CLAUDE_INSTRUCOES.md)**
  - Regras para Claude Code
  - O que pode/não pode fazer
  - Checklist de segurança

### 📋 Para Gestão

- **📋 [TAREFAS.md](TAREFAS.md)**
  - Planejamento atual
  - Roadmap de funcionalidades
  - Backlog e ideias

---

## 🏗️ Arquitetura

```
FRONTEND (45 arquivos modulares)
    ↓ google.script.run
BACKEND (15 arquivos .gs)
    ↓ DatabaseManager
DATABASE (Google Sheets - 12 tabelas)
```

**📌 Modularizado em Out/2025:** 1 arquivo monolítico → 45 componentes especializados

**Detalhes completos da arquitetura:** Ver [MAPA_CODIGO.md](MAPA_CODIGO.md)
**Processo de modularização:** Ver [PARTICIONAMENTO_COMPLETO.md](PARTICIONAMENTO_COMPLETO.md)

---

## 🔧 Comandos Úteis

```bash
# Deploy para produção
clasp push

# Abrir editor online
clasp open

# Ver logs do sistema
clasp logs

# Criar nova versão
clasp push --watch  # modo desenvolvimento

# Pull (baixar do servidor)
clasp pull
```

---

## 📊 Informações do Projeto

- **Versão:** 2.0.0-modular (Out/2025)
- **Arquivos:** 60 (45 frontend modulares + 15 backend)
- **Linguagens:** JavaScript (Apps Script), HTML5, CSS3
- **Database:** Google Sheets (12 tabelas)
- **Status:** ✅ Produção | ⚡ Modularizado

**Métricas detalhadas:** Ver [MAPA_CODIGO.md](MAPA_CODIGO.md)

---

## 🆘 Precisa de Ajuda?

### Encontrou um bug?
1. Consulte [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md) seção **Troubleshooting**
2. Verifique se não é um problema conhecido
3. Reproduza o erro com passos claros
4. Reporte ao gerente do projeto

### Quer adicionar uma funcionalidade?
1. Leia [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md) seção **Workflows**
2. Consulte [TAREFAS.md](TAREFAS.md) para ver se já está planejada
3. Siga os padrões do projeto

### Claude Code não sabe o que fazer?
1. **Sempre** consulte [CLAUDE_INSTRUCOES.md](CLAUDE_INSTRUCOES.md)
2. Verifique o checklist antes de modificar código
3. Em caso de dúvida: **SEMPRE PERGUNTE**

---

## 🤝 Contribuindo

Este é um projeto privado, mas se você tem acesso:

1. **Leia primeiro:** [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)
2. **Entenda a estrutura:** [MAPA_CODIGO.md](MAPA_CODIGO.md)
3. **Siga as regras:** [CLAUDE_INSTRUCOES.md](CLAUDE_INSTRUCOES.md)
4. **Verifique as tarefas:** [TAREFAS.md](TAREFAS.md)

**Padrões de commit:**
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
refactor: refatora código sem mudar funcionalidade
chore: tarefas de manutenção
```

---

## 📞 Contato

- **Gerente/Testes:** Diogo Duarte
- **Desenvolvedor Principal:** Claude Code
- **Suporte Técnico:** [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)

---

## 📄 Licença

Projeto privado - Todos os direitos reservados

---

**⚡ Pronto para começar? Leia o [GUIA_DESENVOLVIMENTO.md](GUIA_DESENVOLVIMENTO.md)!**