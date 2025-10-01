# 🥋 Sistema Dojotai

> **Sistema completo de gestão para dojos** - Gerenciamento de membros, atividades, relatórios e gamificação

## 📋 Sobre o Projeto

O **Dojotai** é uma plataforma web desenvolvida para centralizar e modernizar a gestão de dojos, substituindo controles manuais em planilhas por um sistema unificado, responsivo e escalável.

### 🎯 **Objetivo Principal**
Transformar a gestão tradicional de dojos em uma experiência digital completa, facilitando o controle de membros, atividades, relatórios e implementando elementos de gamificação para engajamento.

### 🔮 **Visão Futura**
Migração para **PWA instalável** com notificações push para uma experiência mobile nativa.

---

## 🚀 Funcionalidades

### ✅ **Já Implementadas (MVP v0.1)**
- 🔐 **Sistema de Autenticação** - Login via planilha com diferentes papéis
- 👥 **Gestão de Usuários** - UID automático + controle de acesso
- 📋 **Gestão de Atividades** - Criar, listar, concluir atividades
- 🎨 **Categorias de Atividades** - Organização com cores e ícones
- 📅 **Calendário Inteligente** - Visualização e filtros de atividades
- 📱 **Interface Responsiva** - Dark mode + design mobile-first
- 🔔 **Feedback Visual** - Toasts e estados de loading
- 🎛️ **Menu Dinâmico** - Configurável via planilha

### 🔄 **Em Desenvolvimento (v0.2)**
- 👤 **Seleção de Participantes** - Definir quem participa de cada atividade
- 🔍 **Filtros Avançados** - "Minhas tarefas" e filtros personalizados
- 🎨 **Melhorias de UX** - Responsividade aprimorada

### 📋 **Roadmap Futuro**
- 📊 **Relatórios Mensais** - Cadastro, aprovação e consolidação
- 🌳 **Organograma** - Estrutura hierárquica de grupos e membros
- 📈 **Sistema de Ondas** - Importação e análise de dados
- 📦 **Controle de Materiais** - Gestão de estoque
- 🎮 **Gamificação** - Práticas, ranking e engajamento
- 🎂 **Funcionalidades Sociais** - Aniversariantes do mês
- 📱 **PWA** - App instalável com push notifications

---

## 🛠️ Tecnologias

### **Backend**
- **Google Apps Script** - Lógica de servidor
- **Google Sheets** - Base de dados
- **Sistema de Planilhas Dinâmico** - Configuração flexível via tabela

### **Frontend**
- **HTML5/CSS3** - Estrutura e estilização
- **Vanilla JavaScript** - Lógica client-side
- **SPA Architecture** - Single Page Application com roteamento
- **Responsive Design** - Mobile-first approach

### **Deploy & Versionamento**
- **clasp CLI** - Deploy para Google Apps Script
- **Git** - Controle de versão
- **Scripts automatizados** - Deploy integrado

---

## 📁 Estrutura do Projeto

```
dojotai/
├── 📚 docs/                    # Documentação
│   ├── dados_dojotai.md        # Dicionário de dados
│   ├── telas_dojotai.md        # Especificação de telas
│   ├── fluxos_dojotai.md       # Fluxos de negócio
│   └── roadmap_dojotai.md      # Roadmap e changelog
│
├── 💻 src/
│   ├── server/                 # Google Apps Script (.gs)
│   │   ├── main.gs             # Ponto de entrada
│   │   ├── auth.gs             # Autenticação
│   │   ├── activities.gs       # Gestão de atividades
│   │   ├── activities_categories.gs # Categorias
│   │   ├── menu.gs             # Sistema de menu
│   │   └── utils.gs            # Utilitários
│   │
│   └── client/                 # Frontend (.html)
│       ├── index.html          # Template principal
│       ├── views/              # Telas da aplicação
│       ├── components/         # Componentes reutilizáveis
│       ├── scripts/            # Lógica JavaScript
│       └── styles/             # Estilos CSS
│
└── 🔧 config/
    └── deploy.sh               # Script de deploy
```

---

## ⚙️ Configuração e Deploy

### **Pré-requisitos**
```bash
# Instalar Google Apps Script CLI
npm install -g @google/clasp

# Autenticar
clasp login
```

### **Configuração Inicial**
1. Clone o repositório
2. Configure as planilhas do Google Sheets conforme [documentação](docs/dados_dojotai.md)
3. Atualize as configurações em `utils.gs`

### **Deploy**
```bash
# Deploy manual
clasp push

# Deploy automatizado (recomendado)
./deploy.sh "Descrição da alteração"
```

---

## 📊 Arquitetura de Dados

### **Principais Entidades**
- **👥 Usuários** - Sistema de autenticação e permissões
- **📋 Atividades** - Gestão completa de eventos e tarefas
- **🎨 Categorias** - Organização visual das atividades
- **🎛️ Menu** - Navegação dinâmica configurável
- **📊 Planilhas** - Sistema de configuração flexível

### **Sistema de Permissões**
- **Admin** - Acesso completo ao sistema
- **Secretaria** - Gestão operacional
- **Líder** - Gestão do seu grupo
- **Usuário** - Acesso básico às suas atividades

### **Configuração Flexível**
O sistema utiliza uma tabela de configuração que permite:
- Múltiplas planilhas Google Sheets
- Named ranges ou ranges A1
- Ativação/desativação de funcionalidades

---

## 🎨 Interface e UX

### **Design System**
- **Mobile-First** - Prioridade para dispositivos móveis
- **Dark Mode** - Tema escuro automático
- **Sistema de Semáforos** - Alertas visuais por proximidade de datas
- **Feedback Imediato** - Toasts e estados de loading

### **Configurações Personalizáveis**
```javascript
// Configuração de semáforos de data
if (diffDays <= 0) return 'overdue';     // Vencidas/hoje
if (diffDays <= 7) return 'upcoming';   // Próximos 7 dias
```

---

## 🔐 Segurança e Privacidade

### **Controle de Acesso**
- Autenticação via login/PIN
- Sistema de papéis hierárquico
- Logs de acesso automático
- Sessões temporárias com tokens

### **Dados**
- Armazenamento em Google Sheets privado
- Sem dados sensíveis no código cliente
- Validações server-side em Google Apps Script

---

## 📖 Documentação Técnica

### **Para Desenvolvedores**
- [📊 Dicionário de Dados](docs/dados_dojotai.md) - Estrutura completa das tabelas
- [🔄 Fluxos de Negócio](docs/fluxos_dojotai.md) - Regras e processos
- [📱 Especificação de Telas](docs/telas_dojotai.md) - Interface e funcionalidades

### **Para Gestão**
- [🗺️ Roadmap](docs/roadmap_dojotai.md) - Planejamento e changelog
- **Status Atual**: MVP funcional em produção
- **Próxima Entrega**: Sistema de participação em atividades

---

## 🚀 Como Contribuir

### **Fluxo de Desenvolvimento**
1. Criar/editar funcionalidade
2. Testar localmente
3. Commit das alterações
4. Deploy via `./deploy.sh "descrição"`

### **Padrões de Código**
- JavaScript vanilla (sem frameworks)
- CSS responsivo mobile-first
- Nomenclatura em português para domínio de negócio
- Documentação inline em funções críticas

---

## 📞 Suporte e Contato

### **Status do Projeto**
- 🟢 **Ativo** - Em desenvolvimento contínuo
- 📅 **Última atualização**: Confira o [roadmap](docs/roadmap_dojotai.md)
- 🎯 **Próxima milestone**: Sistema de participação em atividades

### **Bugs e Melhorias**
Reporte issues e sugestões através dos canais internos da organização.

---

## 📄 Licença

**Uso Interno** - Desenvolvimento proprietário para gestão de dojos.

---

<div align="center">

**🥋 Desenvolvido com dedicação para modernizar a gestão de dojos**

*Sistema Dojotai - Unindo tradição e tecnologia*

</div>