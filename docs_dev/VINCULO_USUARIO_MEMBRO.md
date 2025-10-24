# 🔗 PROJETO: Vínculo Usuário ↔ Membro

**Status:** 📋 Planejamento
**Prioridade:** 🔴 Alta (Bloqueador para Práticas)
**Criado em:** 18/10/2025

---

## 🎯 OBJETIVO

Criar sistema de relacionamento N:N entre usuários (autenticação) e membros (cadastro do dojo), permitindo que:
- Um usuário acesse dados de múltiplos membros (ex: pais gerenciando filhos)
- Um membro possa ser acessado por múltiplos usuários (ex: filho menor + mãe + pai)
- Sistema de práticas e outras features saibam qual membro está sendo gerenciado

---

## 🚨 PROBLEMA ATUAL

### Situação:
- ✅ Tabela `usuarios` existe (login, autenticação)
- ✅ Tabela `membros` existe (cadastro de praticantes)
- ❌ **Nenhum relacionamento entre elas**

### Cenários Bloqueados:
1. **Maria** (usuária U001) é praticante E tem 2 filhos no dojo
   - Ela mesma precisa registrar suas práticas
   - Precisa registrar práticas dos filhos (menores de idade)
   - Sistema atual: não consegue identificar qual membro é ela nem os filhos

2. **João** (membro 12) é menor de idade
   - Mãe (U001) e pai (U002) precisam acessar dados dele
   - Sistema atual: não sabe que João pertence a esses usuários

3. **Sistema de Práticas**
   - Precisa saber: "Qual membro este usuário quer registrar práticas?"
   - Sem vínculo = bloqueado

---

## 🏗️ ARQUITETURA PROPOSTA

### ⭐ SOLUÇÃO: Tabela de Relacionamento N:N

Criar tabela intermediária `usuario_membro` que conecta:
- `usuarios.uid` ↔ `membros.codigo_sequencial`

**Tipo de relacionamento:** Muitos-para-Muitos (N:N)
- 1 usuário → N membros (pais + filhos)
- 1 membro → N usuários (mãe + pai + próprio quando crescer)

---

## 📊 ESTRUTURA DE DADOS

### **Nova Tabela: `usuario_membro`**

```javascript
usuario_membro: {
  tableName: 'usuario_membro',
  description: 'Relacionamento entre usuários e membros (N:N)',
  primaryKey: 'id',
  file: 'Configurações',
  sheet: 'UsuarioMembro',

  fields: {
    // ═══════════════════════════════════════════════════════════════
    // ID ÚNICO
    // ═══════════════════════════════════════════════════════════════
    id: {
      type: 'TEXT',
      required: true,
      pattern: '^UM-\\d+$',
      description: 'ID único do vínculo (UM-0001, UM-0002...)',
      generated: true,
      example: 'UM-0001'
    },

    // ═══════════════════════════════════════════════════════════════
    // FOREIGN KEYS
    // ═══════════════════════════════════════════════════════════════
    user_id: {
      type: 'TEXT',
      required: true,
      foreignKey: { table: 'usuarios', field: 'uid' },
      description: 'UID do usuário que terá acesso',
      example: 'U001'
    },

    membro_id: {
      type: 'NUMBER',
      required: true,
      foreignKey: { table: 'membros', field: 'codigo_sequencial' },
      description: 'Código sequencial do membro',
      example: 5
    },

    // ═══════════════════════════════════════════════════════════════
    // TIPO DE VÍNCULO
    // ═══════════════════════════════════════════════════════════════
    tipo_vinculo: {
      type: 'TEXT',
      required: true,
      enum: ['proprio', 'filho', 'filha', 'dependente', 'pai', 'mae', 'responsavel', 'tutor'],
      description: 'Tipo de relacionamento entre usuário e membro',
      default: 'proprio',
      example: 'filho'
    },

    // ═══════════════════════════════════════════════════════════════
    // CONTROLE
    // ═══════════════════════════════════════════════════════════════
    ativo: {
      type: 'BOOLEAN',
      required: true,
      default: true,
      description: 'Vínculo ativo (true) ou inativo (false)'
    },

    principal: {
      type: 'BOOLEAN',
      required: false,
      default: false,
      description: 'Indica se este é o membro principal do usuário (usado como padrão)'
    },

    // ═══════════════════════════════════════════════════════════════
    // AUDITORIA
    // ═══════════════════════════════════════════════════════════════
    criado_em: {
      type: 'DATETIME',
      required: true,
      autoTimestamp: true,
      description: 'Data/hora de criação do vínculo'
    },

    criado_por: {
      type: 'TEXT',
      required: false,
      foreignKey: { table: 'usuarios', field: 'uid' },
      description: 'UID do usuário (admin) que criou o vínculo'
    },

    atualizado_em: {
      type: 'DATETIME',
      required: false,
      autoTimestamp: true,
      description: 'Data/hora da última atualização'
    },

    desativado_em: {
      type: 'DATETIME',
      required: false,
      description: 'Data/hora que o vínculo foi desativado'
    },

    desativado_por: {
      type: 'TEXT',
      required: false,
      foreignKey: { table: 'usuarios', field: 'uid' },
      description: 'UID do usuário que desativou o vínculo'
    },

    observacoes: {
      type: 'TEXT',
      required: false,
      maxLength: 500,
      description: 'Observações sobre o vínculo (motivo, detalhes)'
    },

    deleted: {
      type: 'BOOLEAN',
      required: true,
      default: false,
      description: 'Soft delete'
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ÍNDICES E CONSTRAINTS
  // ═══════════════════════════════════════════════════════════════
  indexes: [
    {
      fields: ['user_id', 'membro_id'],
      unique: true,
      description: 'Impede vínculo duplicado (mesmo usuário + mesmo membro)'
    },
    {
      fields: ['user_id', 'ativo'],
      unique: false,
      description: 'Buscar vínculos ativos de um usuário (performance)'
    },
    {
      fields: ['membro_id', 'ativo'],
      unique: false,
      description: 'Buscar quem tem acesso a um membro (performance)'
    }
  ],

  // ═══════════════════════════════════════════════════════════════
  // REGRAS DE NEGÓCIO
  // ═══════════════════════════════════════════════════════════════
  businessRules: [
    'Um usuário deve ter pelo menos 1 vínculo ativo para acessar funcionalidades que dependem de membro',
    'Um usuário pode ter no máximo 1 vínculo marcado como principal',
    'Tipo "proprio" indica que o usuário É aquele membro',
    'Vínculos inativos são mantidos para histórico (não deletar fisicamente)',
    'Ao criar vínculo tipo "proprio", marcar como principal automaticamente se for o primeiro'
  ]
}
```

---

## 📋 EXEMPLOS DE DADOS

### **Exemplo 1: Família com 2 filhos**

**Contexto:**
- Maria (U001) é praticante e tem 2 filhos: João e Ana
- Pai Pedro (U002) também tem login
- João cresceu e criou conta própria (U015)

**Tabela `usuarios`:**
| uid | nome | login |
|-----|------|-------|
| U001 | Maria Silva | maria.silva |
| U002 | Pedro Silva | pedro.silva |
| U015 | João Silva | joao.silva |

**Tabela `membros`:**
| codigo_sequencial | nome | categoria_membro | status |
|-------------------|------|------------------|--------|
| 5 | Maria Silva | Adulto | Ativo |
| 12 | João Silva | Jovem | Ativo |
| 13 | Ana Silva | Criança | Ativo |

**Tabela `usuario_membro`:**
| id | user_id | membro_id | tipo_vinculo | ativo | principal |
|----|---------|-----------|--------------|-------|-----------|
| UM-0001 | U001 | 5 | proprio | true | true |
| UM-0002 | U001 | 12 | filho | true | false |
| UM-0003 | U001 | 13 | filha | true | false |
| UM-0004 | U002 | 12 | filho | true | false |
| UM-0005 | U002 | 13 | filha | true | false |
| UM-0006 | U015 | 12 | proprio | true | true |

**Interpretação:**
- Maria (U001) acessa: ela mesma (5) + João (12) + Ana (13)
- Pedro (U002) acessa: João (12) + Ana (13) [ele não é praticante]
- João (U015) acessa: ele mesmo (12)
- Ana (13) não tem usuário (ainda é criança)

---

### **Exemplo 2: Admin que não é membro**

**Tabela `usuarios`:**
| uid | nome | login |
|-----|------|-------|
| U003 | Carlos Admin | admin |

**Tabela `usuario_membro`:**
| id | user_id | membro_id | tipo_vinculo | ativo | principal |
|----|---------|-----------|--------------|-------|-----------|
| (vazio) | - | - | - | - | - |

**Interpretação:**
- Carlos (U003) não tem vínculos
- Ele pode acessar sistema administrativo
- NÃO pode registrar práticas (não está vinculado a nenhum membro)
- Sistema mostra: "Você não está vinculado a nenhum membro"

---

## 🔄 FLUXOS DO SISTEMA

### **Fluxo 1: Login e Resolução de Vínculo**

```
┌─────────────────────────────────────────────────────────────┐
│  1. USUÁRIO FAZ LOGIN                                       │
│     └─> maria.silva / senha                                 │
│         └─> Sistema valida → uid = U001                    │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. FRONTEND CARREGA VÍNCULOS DO USUÁRIO                    │
│     └─> apiCall('getMyLinkedMembers')                      │
│         └─> Backend: SELECT * FROM usuario_membro          │
│                      WHERE user_id='U001' AND ativo=true   │
│                      ORDER BY principal DESC, tipo_vinculo  │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. RESULTADO: Maria tem 3 vínculos                         │
│     [                                                        │
│       { membro_id: 5,  nome: 'Maria Silva', tipo: 'proprio', principal: true },  │
│       { membro_id: 12, nome: 'João Silva',  tipo: 'filho',   principal: false }, │
│       { membro_id: 13, nome: 'Ana Silva',   tipo: 'filha',   principal: false }  │
│     ]                                                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. FRONTEND ARMAZENA EM STATE                              │
│     └─> State.set('linkedMembers', [...])                  │
│     └─> State.set('currentMemberId', 5)  // Principal      │
└─────────────────────────────────────────────────────────────┘
```

---

### **Fluxo 2: Acessar Práticas (Seleção de Membro)**

```
┌─────────────────────────────────────────────────────────────┐
│  1. USUÁRIO NAVEGA PARA "PRÁTICAS"                          │
│     └─> initPractices() é chamado                          │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. VERIFICAR VÍNCULOS                                      │
│     linkedMembers = State.get('linkedMembers')              │
│                                                             │
│     SE linkedMembers.length === 0:                          │
│       └─> Mostrar: "Você não está vinculado a membros"     │
│       └─> Desabilitar funcionalidade                       │
│                                                             │
│     SE linkedMembers.length === 1:                          │
│       └─> Usar único membro automaticamente                │
│       └─> currentMemberId = linkedMembers[0].membro_id     │
│       └─> Carregar práticas                                │
│                                                             │
│     SE linkedMembers.length > 1:                            │
│       └─> Mostrar SELETOR DE MEMBRO                        │
│       └─> Aguardar escolha do usuário                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. SELETOR DE MEMBRO (UI)                                  │
│     ┌─────────────────────────────────────────────┐        │
│     │  Registrar práticas de:                     │        │
│     │                                              │        │
│     │  ◉ Maria Silva (você)            [padrão]   │        │
│     │  ○ João Silva (filho)                       │        │
│     │  ○ Ana Silva (filha)                        │        │
│     │                                              │        │
│     │  [Continuar]                                │        │
│     └─────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. USUÁRIO SELECIONA "João Silva"                          │
│     └─> currentMemberId = 12                               │
│     └─> localStorage.setItem('lastSelectedMember', 12)     │
│     └─> loadPracticesFromServer(12)                        │
└─────────────────────────────────────────────────────────────┘
```

---

### **Fluxo 3: Admin Cria Vínculo (Gestão)**

```
┌─────────────────────────────────────────────────────────────┐
│  1. ADMIN ACESSA "Configurações → Vínculos"                 │
│     └─> loadVinculosPage()                                 │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  2. ADMIN BUSCA USUÁRIO                                     │
│     └─> Input: "maria"                                     │
│     └─> apiCall('searchUsuarios', 'maria')                 │
│     └─> Resultado: Maria Silva (U001)                      │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  3. ADMIN SELECIONA MARIA                                   │
│     └─> apiCall('getVinculosUsuario', 'U001')             │
│     └─> Mostra vínculos existentes:                        │
│         ✓ Maria Silva (proprio) - ATIVO                    │
│         ✓ João Silva (filho) - ATIVO                       │
│         ✓ Ana Silva (filha) - ATIVO                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  4. ADMIN CLICA "Adicionar Vínculo"                         │
│     └─> Modal:                                             │
│         ┌──────────────────────────────────────┐           │
│         │  Adicionar Vínculo para Maria Silva  │           │
│         │                                       │           │
│         │  Membro: [Select: buscar membros]    │           │
│         │  Tipo:   [Select: proprio/filho...]  │           │
│         │  Observações: [textarea]             │           │
│         │                                       │           │
│         │  [Cancelar]  [Criar Vínculo]         │           │
│         └──────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│  5. ADMIN PREENCHE E SALVA                                  │
│     Membro: Pedro Silva (codigo_sequencial=20)              │
│     Tipo: filho                                             │
│     Obs: "Filho adotivo"                                    │
│     └─> apiCall('createVinculo', {                         │
│           user_id: 'U001',                                  │
│           membro_id: 20,                                    │
│           tipo_vinculo: 'filho',                            │
│           observacoes: 'Filho adotivo'                      │
│         })                                                  │
│         └─> Backend: DatabaseManager.insert('usuario_membro', {...}) │
│         └─> Retorna: { ok: true, id: 'UM-0007' }          │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 IMPLEMENTAÇÃO - BACKEND

### **1. Business Logic: `src/01-business/vinculos.gs`**

```javascript
/**
 * ═══════════════════════════════════════════════════════════════
 * FUNÇÕES CORE - Vínculos Usuário ↔ Membro
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Busca todos os membros vinculados a um usuário
 * @param {string} userId - UID do usuário
 * @param {boolean} somenteAtivos - Retornar apenas vínculos ativos
 * @returns {Object} { ok, items: [...] }
 */
function _getLinkedMembersCore(userId, somenteAtivos = true) {
  try {
    Logger.info('Vinculos', 'Buscando membros vinculados', { userId, somenteAtivos });

    // Validar parâmetro
    if (!userId) {
      return { ok: false, error: 'userId é obrigatório' };
    }

    // Query com filtro de ativo
    const filters = { user_id: userId, deleted: false };
    if (somenteAtivos) {
      filters.ativo = true;
    }

    const result = DatabaseManager.query('usuario_membro', filters);

    if (!result.ok) {
      Logger.error('Vinculos', 'Erro ao buscar vínculos', { userId, error: result.error });
      return { ok: false, error: result.error };
    }

    // Enriquecer com dados do membro
    const vinculos = result.items.map(vinculo => {
      const membro = DatabaseManager.queryOne('membros', { codigo_sequencial: vinculo.membro_id });
      return {
        ...vinculo,
        membro_nome: membro?.ok ? membro.item.nome : 'Desconhecido',
        membro_status: membro?.ok ? membro.item.status : null
      };
    });

    // Ordenar: principal primeiro, depois por tipo
    vinculos.sort((a, b) => {
      if (a.principal && !b.principal) return -1;
      if (!a.principal && b.principal) return 1;
      return a.tipo_vinculo.localeCompare(b.tipo_vinculo);
    });

    Logger.info('Vinculos', `${vinculos.length} vínculos encontrados`, { userId });

    return {
      ok: true,
      items: vinculos,
      total: vinculos.length
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao buscar membros vinculados', { userId, error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Busca todos os usuários vinculados a um membro
 * @param {number} membroId - Código sequencial do membro
 * @param {boolean} somenteAtivos - Retornar apenas vínculos ativos
 * @returns {Object} { ok, items: [...] }
 */
function _getUsersLinkedToMemberCore(membroId, somenteAtivos = true) {
  try {
    Logger.info('Vinculos', 'Buscando usuários vinculados ao membro', { membroId, somenteAtivos });

    if (!membroId) {
      return { ok: false, error: 'membroId é obrigatório' };
    }

    const filters = { membro_id: membroId, deleted: false };
    if (somenteAtivos) {
      filters.ativo = true;
    }

    const result = DatabaseManager.query('usuario_membro', filters);

    if (!result.ok) {
      Logger.error('Vinculos', 'Erro ao buscar usuários vinculados', { membroId, error: result.error });
      return { ok: false, error: result.error };
    }

    // Enriquecer com dados do usuário
    const vinculos = result.items.map(vinculo => {
      const usuario = DatabaseManager.queryOne('usuarios', { uid: vinculo.user_id });
      return {
        ...vinculo,
        usuario_nome: usuario?.ok ? usuario.item.nome : 'Desconhecido',
        usuario_status: usuario?.ok ? usuario.item.status : null
      };
    });

    return {
      ok: true,
      items: vinculos,
      total: vinculos.length
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao buscar usuários vinculados', { membroId, error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Cria um novo vínculo usuário ↔ membro
 * @param {Object} vinculoData - Dados do vínculo
 * @returns {Object} { ok, id }
 */
function _createVinculoCore(vinculoData, createdBy) {
  try {
    Logger.info('Vinculos', 'Criando novo vínculo', { vinculoData, createdBy });

    // Validações obrigatórias
    if (!vinculoData.user_id) {
      return { ok: false, error: 'user_id é obrigatório' };
    }
    if (!vinculoData.membro_id) {
      return { ok: false, error: 'membro_id é obrigatório' };
    }
    if (!vinculoData.tipo_vinculo) {
      return { ok: false, error: 'tipo_vinculo é obrigatório' };
    }

    // Verificar se vínculo já existe
    const existing = DatabaseManager.queryOne('usuario_membro', {
      user_id: vinculoData.user_id,
      membro_id: vinculoData.membro_id,
      deleted: false
    });

    if (existing.ok && existing.item) {
      return { ok: false, error: 'Vínculo já existe entre este usuário e membro' };
    }

    // Verificar se é o primeiro vínculo do usuário
    const existingLinks = _getLinkedMembersCore(vinculoData.user_id, false);
    const isPrimeiro = !existingLinks.ok || existingLinks.items.length === 0;

    // Preparar dados
    const data = {
      user_id: vinculoData.user_id,
      membro_id: vinculoData.membro_id,
      tipo_vinculo: vinculoData.tipo_vinculo,
      ativo: true,
      principal: vinculoData.principal !== undefined ? vinculoData.principal : isPrimeiro,
      observacoes: vinculoData.observacoes || '',
      criado_por: createdBy || vinculoData.user_id
    };

    // Inserir
    const result = DatabaseManager.insert('usuario_membro', data);

    if (!result.ok) {
      Logger.error('Vinculos', 'Erro ao criar vínculo', { data, error: result.error });
      return { ok: false, error: result.error };
    }

    Logger.info('Vinculos', 'Vínculo criado com sucesso', { id: result.id });

    return {
      ok: true,
      id: result.id,
      message: 'Vínculo criado com sucesso'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao criar vínculo', { vinculoData, error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Atualiza um vínculo existente
 * @param {string} vinculoId - ID do vínculo (UM-XXXX)
 * @param {Object} updates - Campos a atualizar
 * @returns {Object} { ok }
 */
function _updateVinculoCore(vinculoId, updates) {
  try {
    Logger.info('Vinculos', 'Atualizando vínculo', { vinculoId, updates });

    if (!vinculoId) {
      return { ok: false, error: 'vinculoId é obrigatório' };
    }

    // Campos permitidos para atualização
    const allowedFields = ['tipo_vinculo', 'ativo', 'principal', 'observacoes'];
    const data = {};

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        data[key] = updates[key];
      }
    });

    if (Object.keys(data).length === 0) {
      return { ok: false, error: 'Nenhum campo válido para atualizar' };
    }

    const result = DatabaseManager.update('usuario_membro', vinculoId, data);

    if (!result.ok) {
      Logger.error('Vinculos', 'Erro ao atualizar vínculo', { vinculoId, error: result.error });
      return { ok: false, error: result.error };
    }

    Logger.info('Vinculos', 'Vínculo atualizado com sucesso', { vinculoId });

    return {
      ok: true,
      message: 'Vínculo atualizado com sucesso'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao atualizar vínculo', { vinculoId, error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Desativa um vínculo (soft delete de ativo)
 * @param {string} vinculoId - ID do vínculo
 * @param {string} deactivatedBy - UID de quem desativou
 * @returns {Object} { ok }
 */
function _deactivateVinculoCore(vinculoId, deactivatedBy) {
  try {
    Logger.info('Vinculos', 'Desativando vínculo', { vinculoId, deactivatedBy });

    if (!vinculoId) {
      return { ok: false, error: 'vinculoId é obrigatório' };
    }

    const data = {
      ativo: false,
      desativado_em: new Date(),
      desativado_por: deactivatedBy
    };

    const result = DatabaseManager.update('usuario_membro', vinculoId, data);

    if (!result.ok) {
      Logger.error('Vinculos', 'Erro ao desativar vínculo', { vinculoId, error: result.error });
      return { ok: false, error: result.error };
    }

    Logger.info('Vinculos', 'Vínculo desativado com sucesso', { vinculoId });

    return {
      ok: true,
      message: 'Vínculo desativado com sucesso'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao desativar vínculo', { vinculoId, error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Reativa um vínculo desativado
 * @param {string} vinculoId - ID do vínculo
 * @returns {Object} { ok }
 */
function _reactivateVinculoCore(vinculoId) {
  try {
    Logger.info('Vinculos', 'Reativando vínculo', { vinculoId });

    if (!vinculoId) {
      return { ok: false, error: 'vinculoId é obrigatório' };
    }

    const data = {
      ativo: true,
      desativado_em: null,
      desativado_por: null
    };

    const result = DatabaseManager.update('usuario_membro', vinculoId, data);

    if (!result.ok) {
      Logger.error('Vinculos', 'Erro ao reativar vínculo', { vinculoId, error: result.error });
      return { ok: false, error: result.error };
    }

    Logger.info('Vinculos', 'Vínculo reativado com sucesso', { vinculoId });

    return {
      ok: true,
      message: 'Vínculo reativado com sucesso'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao reativar vínculo', { vinculoId, error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Define um vínculo como principal para um usuário
 * @param {string} userId - UID do usuário
 * @param {string} vinculoId - ID do vínculo a ser principal
 * @returns {Object} { ok }
 */
function _setPrincipalVinculoCore(userId, vinculoId) {
  try {
    Logger.info('Vinculos', 'Definindo vínculo principal', { userId, vinculoId });

    if (!userId || !vinculoId) {
      return { ok: false, error: 'userId e vinculoId são obrigatórios' };
    }

    // 1. Remover principal de todos os vínculos do usuário
    const allLinks = _getLinkedMembersCore(userId, false);
    if (allLinks.ok) {
      allLinks.items.forEach(link => {
        if (link.principal) {
          DatabaseManager.update('usuario_membro', link.id, { principal: false });
        }
      });
    }

    // 2. Definir novo principal
    const result = DatabaseManager.update('usuario_membro', vinculoId, { principal: true });

    if (!result.ok) {
      Logger.error('Vinculos', 'Erro ao definir principal', { vinculoId, error: result.error });
      return { ok: false, error: result.error };
    }

    Logger.info('Vinculos', 'Vínculo principal definido', { vinculoId });

    return {
      ok: true,
      message: 'Vínculo principal atualizado'
    };

  } catch (error) {
    Logger.error('Vinculos', 'Exceção ao definir principal', { userId, vinculoId, error: error.message });
    return { ok: false, error: error.message };
  }
}
```

---

### **2. API Layer: `src/02-api/vinculos_api.gs`**

```javascript
/**
 * ═══════════════════════════════════════════════════════════════
 * ENDPOINTS PÚBLICOS - Vínculos API
 * ═══════════════════════════════════════════════════════════════
 */

/**
 * Retorna membros vinculados ao usuário logado
 * @param {string} sessionId - ID da sessão
 * @returns {Object} { ok, items: [...] }
 */
async function getMyLinkedMembers(sessionId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    const userId = auth.user.uid;

    Logger.info('VinculosAPI', 'Buscando membros vinculados ao usuário logado', { userId });

    const result = _getLinkedMembersCore(userId, true);

    return result;

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao buscar membros vinculados', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Retorna vínculos de um usuário específico (admin)
 * @param {string} sessionId - ID da sessão
 * @param {string} targetUserId - UID do usuário alvo
 * @returns {Object} { ok, items: [...] }
 */
async function getVinculosUsuario(sessionId, targetUserId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin buscando vínculos de usuário', { targetUserId });

    const result = _getLinkedMembersCore(targetUserId, false);

    return result;

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao buscar vínculos do usuário', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Retorna usuários vinculados a um membro (admin)
 * @param {string} sessionId - ID da sessão
 * @param {number} membroId - Código do membro
 * @returns {Object} { ok, items: [...] }
 */
async function getUsersLinkedToMember(sessionId, membroId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin buscando usuários vinculados ao membro', { membroId });

    const result = _getUsersLinkedToMemberCore(membroId, false);

    return result;

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao buscar usuários vinculados', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Cria novo vínculo (admin)
 * @param {string} sessionId - ID da sessão
 * @param {Object} vinculoData - Dados do vínculo
 * @returns {Object} { ok, id }
 */
async function createVinculo(sessionId, vinculoData) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    const createdBy = auth.user.uid;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin criando vínculo', { vinculoData, createdBy });

    const result = _createVinculoCore(vinculoData, createdBy);

    return result;

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao criar vínculo', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Atualiza vínculo (admin)
 * @param {string} sessionId - ID da sessão
 * @param {string} vinculoId - ID do vínculo
 * @param {Object} updates - Campos a atualizar
 * @returns {Object} { ok }
 */
async function updateVinculo(sessionId, vinculoId, updates) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin atualizando vínculo', { vinculoId, updates });

    const result = _updateVinculoCore(vinculoId, updates);

    return result;

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao atualizar vínculo', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Desativa vínculo (admin)
 * @param {string} sessionId - ID da sessão
 * @param {string} vinculoId - ID do vínculo
 * @returns {Object} { ok }
 */
async function deactivateVinculo(sessionId, vinculoId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    const deactivatedBy = auth.user.uid;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin desativando vínculo', { vinculoId });

    const result = _deactivateVinculoCore(vinculoId, deactivatedBy);

    return result;

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao desativar vínculo', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Reativa vínculo (admin)
 * @param {string} sessionId - ID da sessão
 * @param {string} vinculoId - ID do vínculo
 * @returns {Object} { ok }
 */
async function reactivateVinculo(sessionId, vinculoId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    // TODO: Validar se usuário logado é admin

    Logger.info('VinculosAPI', 'Admin reativando vínculo', { vinculoId });

    const result = _reactivateVinculoCore(vinculoId);

    return result;

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao reativar vínculo', { error: error.message });
    return { ok: false, error: error.message };
  }
}

/**
 * Define vínculo como principal do usuário logado
 * @param {string} sessionId - ID da sessão
 * @param {string} vinculoId - ID do vínculo
 * @returns {Object} { ok }
 */
async function setMyPrincipalMember(sessionId, vinculoId) {
  try {
    // Validar sessão
    const auth = await requireSession(sessionId, 'VinculosAPI');
    if (!auth.ok) return auth;

    const userId = auth.user.uid;

    Logger.info('VinculosAPI', 'Usuário definindo membro principal', { userId, vinculoId });

    // Verificar se vínculo pertence ao usuário
    const vinculo = DatabaseManager.queryOne('usuario_membro', { id: vinculoId });
    if (!vinculo.ok || vinculo.item.user_id !== userId) {
      return { ok: false, error: 'Vínculo não encontrado ou não pertence a você' };
    }

    const result = _setPrincipalVinculoCore(userId, vinculoId);

    return result;

  } catch (error) {
    Logger.error('VinculosAPI', 'Erro ao definir membro principal', { error: error.message });
    return { ok: false, error: error.message };
  }
}
```

---

## 💻 IMPLEMENTAÇÃO - FRONTEND

### **1. Component: Seletor de Membro**

**Local:** `src/05-components/memberSelector.html`

```html
<!-- ===== SELETOR DE MEMBRO ===== -->
<style>
.member-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.member-selector-modal {
  background: var(--card-bg);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-xl);
  max-width: 500px;
  width: 90%;
  box-shadow: var(--shadow-lg);
}

.member-selector-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.member-option {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.member-option:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.member-option.selected {
  border-color: var(--primary);
  background: var(--primary-light);
}

.member-option input[type="radio"] {
  margin-right: var(--spacing-md);
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--text-primary);
}

.member-type {
  font-size: var(--font-size-sm);
  color: var(--text-light);
  margin-top: 2px;
}

.member-badge {
  font-size: var(--font-size-xs);
  padding: 2px 8px;
  border-radius: 12px;
  background: var(--primary);
  color: white;
  margin-left: var(--spacing-sm);
}
</style>

<div id="member-selector-overlay" class="member-selector-overlay hidden">
  <div class="member-selector-modal">
    <h3 class="member-selector-title">Selecionar Membro</h3>
    <p style="color: var(--text-light); margin-bottom: var(--spacing-lg);">
      Escolha para qual membro você deseja acessar:
    </p>

    <div id="member-options-container">
      <!-- Opções serão inseridas via JavaScript -->
    </div>

    <div style="display: flex; gap: var(--spacing-md); margin-top: var(--spacing-xl);">
      <button class="btn btn-secondary" onclick="closeMemberSelector()" style="flex: 1;">
        Cancelar
      </button>
      <button class="btn btn-primary" onclick="confirmMemberSelection()" style="flex: 1;">
        Continuar
      </button>
    </div>
  </div>
</div>

<script>
let selectedMemberIdForSelector = null;

/**
 * Mostra seletor de membro
 * @param {Array} members - Lista de membros vinculados
 */
function showMemberSelector(members) {
  const container = document.getElementById('member-options-container');
  const overlay = document.getElementById('member-selector-overlay');

  if (!container || !overlay) return;

  // Pegar último membro selecionado
  const lastSelected = localStorage.getItem('lastSelectedMemberId');

  // Renderizar opções
  container.innerHTML = members.map((member, index) => {
    const isPrincipal = member.principal;
    const isLastSelected = lastSelected && lastSelected == member.membro_id;
    const shouldSelect = isLastSelected || (index === 0 && !lastSelected);

    if (shouldSelect) {
      selectedMemberIdForSelector = member.membro_id;
    }

    return `
      <label class="member-option ${shouldSelect ? 'selected' : ''}" onclick="selectMemberOption(${member.membro_id})">
        <input
          type="radio"
          name="member-selector"
          value="${member.membro_id}"
          ${shouldSelect ? 'checked' : ''}
        >
        <div class="member-info">
          <div class="member-name">
            ${member.membro_nome}
            ${isPrincipal ? '<span class="member-badge">Padrão</span>' : ''}
          </div>
          <div class="member-type">
            ${getTipoVinculoLabel(member.tipo_vinculo)}
          </div>
        </div>
      </label>
    `;
  }).join('');

  overlay.classList.remove('hidden');
}

/**
 * Seleciona opção de membro
 */
function selectMemberOption(membroId) {
  selectedMemberIdForSelector = membroId;

  // Atualizar visual
  document.querySelectorAll('.member-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  event.currentTarget.classList.add('selected');
}

/**
 * Confirma seleção de membro
 */
function confirmMemberSelection() {
  if (!selectedMemberIdForSelector) {
    showToast('Selecione um membro', 'warning');
    return;
  }

  // Salvar preferência
  localStorage.setItem('lastSelectedMemberId', selectedMemberIdForSelector);

  // Atualizar estado global
  State.set('currentMemberId', selectedMemberIdForSelector);

  // Fechar modal
  closeMemberSelector();

  // Callback (depende da página)
  if (typeof onMemberSelected === 'function') {
    onMemberSelected(selectedMemberIdForSelector);
  }
}

/**
 * Fecha seletor
 */
function closeMemberSelector() {
  const overlay = document.getElementById('member-selector-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
}

/**
 * Retorna label amigável do tipo de vínculo
 */
function getTipoVinculoLabel(tipo) {
  const labels = {
    'proprio': 'Você',
    'filho': 'Seu filho',
    'filha': 'Sua filha',
    'dependente': 'Dependente',
    'pai': 'Seu pai',
    'mae': 'Sua mãe',
    'responsavel': 'Responsável',
    'tutor': 'Tutor'
  };
  return labels[tipo] || tipo;
}
</script>
```

---

### **2. Modificação: `src/04-views/practices.html`**

```javascript
// No início do initPractices()
function initPractices() {
  // Buscar membros vinculados
  apiCall('getMyLinkedMembers')
    .then(result => {
      if (!result.ok) {
        showToast('Erro ao buscar vínculos: ' + result.error, 'error');
        return;
      }

      const members = result.items;

      if (members.length === 0) {
        // Usuário não tem vínculos
        showNoMembersMessage();
        return;
      }

      if (members.length === 1) {
        // Apenas 1 membro, usar automaticamente
        State.set('currentMemberId', members[0].membro_id);
        State.set('linkedMembers', members);

        if (selectedDays.length === 0) {
          selectLast7Days();
        }
        loadPracticesFromServer();

      } else {
        // Múltiplos membros, mostrar seletor
        State.set('linkedMembers', members);
        showMemberSelector(members);
      }
    })
    .catch(error => {
      showToast('Erro de conexão', 'error');
      console.error('Erro ao buscar membros vinculados:', error);
    });
}

// Callback quando membro é selecionado
function onMemberSelected(membroId) {
  if (selectedDays.length === 0) {
    selectLast7Days();
  }
  loadPracticesFromServer();
}

// Mensagem quando não há vínculos
function showNoMembersMessage() {
  const grid = document.getElementById('days-grid');
  if (grid) {
    grid.innerHTML = `
      <div class="empty-state" style="text-align: center; padding: var(--spacing-3xl);">
        <div style="font-size: 48px; margin-bottom: var(--spacing-md);">👤</div>
        <h3 style="margin-bottom: var(--spacing-sm);">Nenhum Membro Vinculado</h3>
        <p style="color: var(--text-light); margin-bottom: var(--spacing-lg);">
          Você não está vinculado a nenhum membro do dojo.<br>
          Entre em contato com o administrador para criar o vínculo.
        </p>
      </div>
    `;
  }
}
```

---

### **3. View: Gestão de Vínculos (Admin)**

**Local:** `src/04-views/vinculos.html` (NOVA VIEW)

```html
<!-- ===== PÁGINA: GESTÃO DE VÍNCULOS ===== -->
<div id="vinculos" class="page-content hidden">
  <div class="card">
    <div class="card-header">
      <h1>Gestão de Vínculos Usuário ↔ Membro</h1>
      <p style="opacity: 0.9;">Conecte usuários aos seus membros cadastrados</p>
    </div>

    <!-- Buscar Usuário -->
    <div style="padding: var(--spacing-lg);">
      <div style="display: flex; gap: var(--spacing-md); margin-bottom: var(--spacing-xl);">
        <input
          type="text"
          id="search-usuario-vinculos"
          placeholder="Buscar usuário por nome ou login..."
          style="flex: 1;"
          onkeyup="searchUsuarioVinculos(event)"
        >
        <button class="btn btn-secondary" onclick="clearSearchVinculos()">
          Limpar
        </button>
      </div>

      <!-- Lista de Usuários -->
      <div id="usuarios-list-vinculos">
        <!-- Lista será inserida via JavaScript -->
      </div>

      <!-- Detalhes do Usuário Selecionado -->
      <div id="usuario-vinculos-detail" class="hidden">
        <h2 style="margin-bottom: var(--spacing-md);">
          Vínculos de <span id="usuario-nome-display"></span>
        </h2>

        <!-- Tabela de Vínculos -->
        <table class="table">
          <thead>
            <tr>
              <th>Membro</th>
              <th>Tipo</th>
              <th>Status</th>
              <th>Principal</th>
              <th>Criado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="vinculos-table-body">
            <!-- Vínculos serão inseridos aqui -->
          </tbody>
        </table>

        <button class="btn btn-primary" onclick="openAddVinculoModal()">
          + Adicionar Vínculo
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Modal: Adicionar Vínculo -->
<div id="add-vinculo-modal" class="modal-overlay hidden">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Adicionar Vínculo</h3>
      <button class="btn-close" onclick="closeAddVinculoModal()">✕</button>
    </div>

    <form id="add-vinculo-form" onsubmit="submitAddVinculo(event)">
      <div class="form-group">
        <label>Usuário</label>
        <input type="text" id="vinculo-usuario-nome" readonly>
        <input type="hidden" id="vinculo-user-id">
      </div>

      <div class="form-group">
        <label>Membro *</label>
        <select id="vinculo-membro-id" required>
          <option value="">Selecione um membro...</option>
        </select>
      </div>

      <div class="form-group">
        <label>Tipo de Vínculo *</label>
        <select id="vinculo-tipo" required>
          <option value="proprio">Próprio (o usuário É este membro)</option>
          <option value="filho">Filho</option>
          <option value="filha">Filha</option>
          <option value="dependente">Dependente</option>
          <option value="pai">Pai</option>
          <option value="mae">Mãe</option>
          <option value="responsavel">Responsável</option>
          <option value="tutor">Tutor</option>
        </select>
      </div>

      <div class="form-group">
        <label>Observações</label>
        <textarea id="vinculo-observacoes" rows="3"></textarea>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" onclick="closeAddVinculoModal()">
          Cancelar
        </button>
        <button type="submit" class="btn btn-primary">
          Criar Vínculo
        </button>
      </div>
    </form>
  </div>
</div>

<script>
let currentUsuarioIdVinculos = null;

/**
 * Busca usuários (admin)
 */
function searchUsuarioVinculos(event) {
  if (event.key === 'Enter') {
    const query = document.getElementById('search-usuario-vinculos').value.trim();

    if (!query) {
      showToast('Digite um nome ou login para buscar', 'warning');
      return;
    }

    showLoading('Buscando usuários...');

    apiCall('searchUsuarios', query)
      .then(result => {
        hideLoading();
        if (result.ok) {
          renderUsuariosList(result.items);
        } else {
          showToast('Erro ao buscar: ' + result.error, 'error');
        }
      });
  }
}

/**
 * Renderiza lista de usuários
 */
function renderUsuariosList(usuarios) {
  const container = document.getElementById('usuarios-list-vinculos');

  if (usuarios.length === 0) {
    container.innerHTML = '<p>Nenhum usuário encontrado.</p>';
    return;
  }

  container.innerHTML = `
    <div class="list-group">
      ${usuarios.map(u => `
        <div class="list-item" onclick="selectUsuarioVinculos('${u.uid}', '${u.nome}')">
          <div>
            <strong>${u.nome}</strong>
            <small style="color: var(--text-light);">${u.login}</small>
          </div>
          <span class="badge badge-${u.status === 'Ativo' ? 'success' : 'danger'}">
            ${u.status}
          </span>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Seleciona usuário e carrega vínculos
 */
function selectUsuarioVinculos(userId, userName) {
  currentUsuarioIdVinculos = userId;

  document.getElementById('usuario-nome-display').textContent = userName;
  document.getElementById('usuario-vinculos-detail').classList.remove('hidden');

  loadVinculosUsuario(userId);
}

/**
 * Carrega vínculos de um usuário
 */
function loadVinculosUsuario(userId) {
  showLoading('Carregando vínculos...');

  apiCall('getVinculosUsuario', userId)
    .then(result => {
      hideLoading();
      if (result.ok) {
        renderVinculosTable(result.items);
      } else {
        showToast('Erro ao carregar vínculos: ' + result.error, 'error');
      }
    });
}

/**
 * Renderiza tabela de vínculos
 */
function renderVinculosTable(vinculos) {
  const tbody = document.getElementById('vinculos-table-body');

  if (vinculos.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: var(--spacing-xl);">
          Nenhum vínculo encontrado. Clique em "Adicionar Vínculo" para criar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = vinculos.map(v => `
    <tr>
      <td>${v.membro_nome} (${v.membro_id})</td>
      <td>${getTipoVinculoLabel(v.tipo_vinculo)}</td>
      <td>
        <span class="badge badge-${v.ativo ? 'success' : 'danger'}">
          ${v.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </td>
      <td>
        ${v.principal ? '⭐ Sim' : '-'}
      </td>
      <td>${formatDate(v.criado_em)}</td>
      <td>
        ${v.ativo ? `
          <button class="btn btn-sm btn-danger" onclick="deactivateVinculoAdmin('${v.id}')">
            Desativar
          </button>
        ` : `
          <button class="btn btn-sm btn-success" onclick="reactivateVinculoAdmin('${v.id}')">
            Reativar
          </button>
        `}
      </td>
    </tr>
  `).join('');
}

/**
 * Abre modal de adicionar vínculo
 */
function openAddVinculoModal() {
  if (!currentUsuarioIdVinculos) {
    showToast('Selecione um usuário primeiro', 'warning');
    return;
  }

  document.getElementById('vinculo-user-id').value = currentUsuarioIdVinculos;
  document.getElementById('vinculo-usuario-nome').value = document.getElementById('usuario-nome-display').textContent;

  // Carregar membros disponíveis
  loadMembrosSelect();

  document.getElementById('add-vinculo-modal').classList.remove('hidden');
}

/**
 * Fecha modal
 */
function closeAddVinculoModal() {
  document.getElementById('add-vinculo-modal').classList.add('hidden');
  document.getElementById('add-vinculo-form').reset();
}

/**
 * Carrega select de membros
 */
function loadMembrosSelect() {
  apiCall('listMembros')
    .then(result => {
      if (result.ok) {
        const select = document.getElementById('vinculo-membro-id');
        select.innerHTML = '<option value="">Selecione um membro...</option>' +
          result.items.map(m => `
            <option value="${m.codigo_sequencial}">
              ${m.nome} (${m.codigo_sequencial}) - ${m.status}
            </option>
          `).join('');
      }
    });
}

/**
 * Submete criação de vínculo
 */
function submitAddVinculo(event) {
  event.preventDefault();

  const data = {
    user_id: document.getElementById('vinculo-user-id').value,
    membro_id: parseInt(document.getElementById('vinculo-membro-id').value),
    tipo_vinculo: document.getElementById('vinculo-tipo').value,
    observacoes: document.getElementById('vinculo-observacoes').value
  };

  showLoading('Criando vínculo...');

  apiCall('createVinculo', data)
    .then(result => {
      hideLoading();
      if (result.ok) {
        showToast('Vínculo criado com sucesso!', 'success');
        closeAddVinculoModal();
        loadVinculosUsuario(currentUsuarioIdVinculos);
      } else {
        showToast('Erro ao criar vínculo: ' + result.error, 'error');
      }
    });
}

/**
 * Desativa vínculo (admin)
 */
function deactivateVinculoAdmin(vinculoId) {
  if (!confirm('Deseja realmente desativar este vínculo?')) return;

  showLoading('Desativando...');

  apiCall('deactivateVinculo', vinculoId)
    .then(result => {
      hideLoading();
      if (result.ok) {
        showToast('Vínculo desativado', 'success');
        loadVinculosUsuario(currentUsuarioIdVinculos);
      } else {
        showToast('Erro: ' + result.error, 'error');
      }
    });
}

/**
 * Reativa vínculo (admin)
 */
function reactivateVinculoAdmin(vinculoId) {
  showLoading('Reativando...');

  apiCall('reactivateVinculo', vinculoId)
    .then(result => {
      hideLoading();
      if (result.ok) {
        showToast('Vínculo reativado', 'success');
        loadVinculosUsuario(currentUsuarioIdVinculos);
      } else {
        showToast('Erro: ' + result.error, 'error');
      }
    });
}

/**
 * Limpa busca
 */
function clearSearchVinculos() {
  document.getElementById('search-usuario-vinculos').value = '';
  document.getElementById('usuarios-list-vinculos').innerHTML = '';
  document.getElementById('usuario-vinculos-detail').classList.add('hidden');
  currentUsuarioIdVinculos = null;
}
</script>
```

---

## 📝 ORDEM DE IMPLEMENTAÇÃO (REVISADA)

### **FASE 1: Backend (2-3 dias)** ⭐ OBRIGATÓRIO
1. ✅ Criar definição da tabela `usuario_membro` em `data_dictionary.gs`
2. ✅ Criar `src/01-business/vinculos.gs` (funções core)
3. ✅ Criar `src/02-api/vinculos_api.gs` (endpoints públicos)
4. ✅ Implementar validação de duplicatas (regra obrigatória)
5. ✅ Testar funções de criação, leitura, atualização

**⚠️ REQUER APROVAÇÃO:**
- Modificar `data_dictionary.gs` (ZONA VERMELHA 🔴)
- Criar 2 arquivos novos .gs (ZONA VERMELHA 🔴)

**📝 Notas de Implementação:**
- Apenas validação de duplicatas é obrigatória
- Limites numéricos (10 vínculos/user, 5 users/membro) são opcionais

---

### **FASE 2: Planilha (30 min)** ⭐ OBRIGATÓRIO
6. ✅ Criar aba "UsuarioMembro" no Google Sheets (arquivo "Configurações")
7. ✅ Adicionar registro na tabela "planilhas"
8. ✅ Testar acesso via DatabaseManager
9. ✅ Inserir vínculos de teste manualmente (temporário)

**⚠️ REQUER APROVAÇÃO:**
- Criar aba no Google Sheets (ZONA VERMELHA 🔴)

---

### **FASE 3: Frontend - Componente Seletor (1 dia)** ⭐ OBRIGATÓRIO
10. ✅ Criar `src/05-components/memberSelector.html`
11. ✅ Incluir no `index.html`
12. ✅ Integrar com fluxo de login (modal após autenticação)
13. ✅ Implementar persistência de preferência (localStorage)
14. ✅ Testar isoladamente

**✅ PODE FAZER:**
- Criar componente reutilizável (ZONA VERDE 🟢)

**📝 Notas de Implementação:**
- Modal aparece automaticamente após login se usuário tem múltiplos membros
- Última seleção é lembrada via localStorage
- Trocar membro = logout/login novamente (por enquanto)

---

### **FASE 4: Frontend - Integração com Auth (1 dia)** ⭐ OBRIGATÓRIO
15. ✅ Modificar `src/05-components/core/auth.html`:
    - Carregar vínculos após login bem-sucedido
    - Chamar `showMemberSelector()` se múltiplos membros
    - Armazenar `currentMemberId` no State
16. ✅ Modificar `src/04-views/practices.html`:
    - Usar `State.get('currentMemberId')` ao invés de buscar
    - Mostrar mensagem se não houver membro selecionado
17. ✅ Testar fluxo completo de login → seleção → práticas

**⚠️ REQUER APROVAÇÃO:**
- Modificar `auth.html` (ZONA AMARELA 🟡 - arquivo crítico)

**✅ PODE FAZER:**
- Modificar `practices.html` (ZONA VERDE 🟢)

---

### **FASE 5: Frontend - Gestão Admin (2 dias)** 🔮 PENDÊNCIA FUTURA
**STATUS: OPCIONAL NO MVP**

**Opção A - Implementar agora:**
- ✅ Criar `src/04-views/vinculos.html` (código já está pronto na documentação)
- ✅ Adicionar rota no router
- ✅ Adicionar item no menu (apenas para admin)
- ✅ Testar CRUD completo de vínculos via interface

**Opção B - Postergar:**
- ⏸️ Admin cria vínculos manualmente no Google Sheets
- ⏸️ View de gestão fica como pendência futura
- ⏸️ Economiza 2 dias de desenvolvimento

**⚠️ REQUER APROVAÇÃO (se implementar agora):**
- Criar nova view (ZONA VERMELHA 🔴)
- Modificar router e menu (ZONA AMARELA 🟡)

**📌 DECISÃO:** Avaliar durante implementação. View completa está documentada e pronta.

---

### **FASE 6: Testes (1 dia)** ⭐ OBRIGATÓRIO
18. ✅ Testar cenário: usuário com 1 membro vinculado
19. ✅ Testar cenário: usuário com múltiplos membros vinculados
20. ✅ Testar cenário: usuário sem vínculos
21. ✅ Testar cenário: tentativa de criar vínculo duplicado (deve bloquear)
22. ✅ Testar persistência da última seleção (localStorage)
23. ✅ Testar modal de seleção após login
24. ⏸️ *(Opcional se Fase 5)* Testar CRUD admin de vínculos

---

## ✅ DECISÕES VALIDADAS

### 1️⃣ **Tipos de Vínculo:** ✅ APROVADO
Lista confirmada:
- ✅ proprio
- ✅ filho / filha
- ✅ dependente
- ✅ pai / mae
- ✅ responsavel / tutor

### 2️⃣ **Limites:** ✅ APROVADO
- ✅ **NÃO permitir** vínculo duplicado (mesmo user + mesmo membro) - **OBRIGATÓRIO**
- ⚠️ Máximo de vínculos por usuário: **10** (opcional, implementar se necessário)
- ⚠️ Máximo de usuários por membro: **5** (opcional, implementar se necessário)

**Decisão:** Implementar apenas validação de duplicatas no MVP. Limites numéricos podem ser adicionados depois se necessário.

### 3️⃣ **Permissões de Criação:** ✅ APROVADO
- ✅ **APENAS ADMIN** pode criar/editar/desativar vínculos
- ❌ Usuário comum NÃO pode criar vínculos (sem auto-serviço)

**Decisão:** Gestão centralizada pelo administrador.

### 4️⃣ **Comportamento do Seletor:** ✅ APROVADO
**MVP (Implementar agora):**
- ✅ Modal de seleção **logo após login** (se múltiplos membros)
- ✅ Lembrar última seleção (localStorage)

**PENDÊNCIA FUTURA (v2):**
- 🔮 Dropdown/selector em todas as telas para troca rápida
- 🔮 Indicador visual de qual membro está ativo
- 🔮 Atalho de teclado para trocar membro

**Decisão:** Implementar modal no login + preferência. Trocar membro sem logout fica como evolução futura.

### 5️⃣ **Gestão Admin (View):** ✅ DECISÃO PRAGMÁTICA
**Cenário ideal:** View admin completa (código já está na documentação)

**Decisão prática:**
- ✅ **SE for simples implementar** → Fazer agora (Fase 5 incluída)
- ⚠️ **SE for demorado** → Admin cria manualmente no banco, view fica como pendência futura

**Status:** Avaliar durante implementação. View está documentada e pronta para uso futuro.

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Backend
- [ ] Definir tabela `usuario_membro` em `data_dictionary.gs`
- [ ] Criar `vinculos.gs` com todas as funções core
- [ ] Criar `vinculos_api.gs` com todos os endpoints
- [ ] Testar `_getLinkedMembersCore()`
- [ ] Testar `_createVinculoCore()`
- [ ] Testar `_updateVinculoCore()`
- [ ] Testar `_deactivateVinculoCore()`
- [ ] Validar foreign keys funcionam

### Planilha
- [ ] Criar aba "UsuarioMembro" no Sheets
- [ ] Configurar cabeçalhos corretamente
- [ ] Adicionar na tabela "planilhas"
- [ ] Testar read/write via DatabaseManager
- [ ] Inserir vínculos de teste manualmente

### Frontend - Componente
- [ ] Criar `memberSelector.html`
- [ ] Incluir no `index.html`
- [ ] Testar renderização com 1 membro
- [ ] Testar renderização com múltiplos membros
- [ ] Testar seleção e confirmação
- [ ] Testar persistência em localStorage

### Frontend - Práticas
- [ ] Modificar `initPractices()` para carregar vínculos
- [ ] Adicionar tratamento: 0 vínculos
- [ ] Adicionar tratamento: 1 vínculo
- [ ] Adicionar tratamento: N vínculos
- [ ] Salvar última seleção
- [ ] Atualizar saves para usar `membro_id` correto

### Frontend - Admin
- [ ] Criar `vinculos.html`
- [ ] Implementar busca de usuários
- [ ] Implementar listagem de vínculos
- [ ] Implementar modal de criação
- [ ] Implementar desativação/reativação
- [ ] Adicionar rota no router
- [ ] Adicionar item no menu (admin only)

### Testes Integrados
- [ ] Usuário com 1 membro: auto-seleciona
- [ ] Usuário com N membros: mostra seletor
- [ ] Usuário sem vínculos: mostra mensagem
- [ ] Admin cria vínculo: aparece na lista
- [ ] Trocar membro principal: funciona
- [ ] Preferência persiste após logout/login
- [ ] Multiplos usuários: dados isolados

---

## 📚 BENEFÍCIOS PARA O SISTEMA

Este projeto, apesar de ser "auxiliar", traz benefícios estruturais enormes:

### ✅ **Imediatos:**
1. Sistema de Práticas pode funcionar (bloqueador removido)
2. Dados organizados por membro (não por usuário)
3. Pais podem gerenciar filhos menores

### ✅ **Futuros:**
1. **Relatórios personalizados** por membro
2. **Histórico completo** do membro (mesmo que usuário mude)
3. **Permissões avançadas** baseadas em relacionamento
4. **Features familiares**:
   - Dashboard da família
   - Notificações sobre filhos
   - Comparativos pais vs filhos
5. **Migração de conta**:
   - Criança cresce → cria conta própria
   - Membro troca responsável
   - Tutores temporários

---

## 📅 ESTIMATIVA DE TEMPO (REVISADA)

| Fase | Descrição | Tempo Estimado | Status |
|------|-----------|----------------|--------|
| 1 | Backend (vinculos.gs + API) | 2-3 dias | ⭐ OBRIGATÓRIO |
| 2 | Planilha (criar aba) | 30 min | ⭐ OBRIGATÓRIO |
| 3 | Frontend - Componente Seletor | 1 dia | ⭐ OBRIGATÓRIO |
| 4 | Frontend - Integração Auth + Práticas | 1 dia | ⭐ OBRIGATÓRIO |
| 5 | Frontend - Gestão Admin | 2 dias | 🔮 OPCIONAL |
| 6 | Testes completos | 1 dia | ⭐ OBRIGATÓRIO |
| **TOTAL MVP** | **(Fases 1-4 + 6)** | **5-6 dias** | |
| **TOTAL COMPLETO** | **(Todas as fases)** | **7-8 dias** | |

### 🎯 Recomendação de Execução:

**CENÁRIO 1: MVP Rápido** (5-6 dias)
- ✅ Implementar Fases 1, 2, 3, 4, 6
- ⏸️ Pular Fase 5 (Gestão Admin)
- 📝 Admin insere vínculos manualmente no Google Sheets
- 🚀 Sistema de práticas funciona completamente
- 💡 View admin fica como pendência futura

**CENÁRIO 2: Solução Completa** (7-8 dias)
- ✅ Implementar todas as fases (1-6)
- ✅ Interface completa de gestão de vínculos
- 👨‍💼 Admin gerencia tudo pela interface
- 🎨 Sistema profissional e pronto para escalar

---

## 🚀 PRÓXIMOS PASSOS - PLANO DE AÇÃO

### ✅ DECISÕES VALIDADAS - PRONTO PARA IMPLEMENTAR

Todas as decisões foram aprovadas pelo usuário. Plano definido:

1. **Tipos de vínculo:** proprio, filho, filha, dependente, pai, mae, responsavel, tutor
2. **Limites:** Apenas validação de duplicatas (obrigatória)
3. **Permissões:** Apenas admin cria/edita vínculos
4. **Seletor:** Modal após login + lembrar preferência
5. **View Admin:** Avaliar durante implementação (opcional no MVP)

### 📋 ROADMAP DE IMPLEMENTAÇÃO

#### **ETAPA 1: Solicitar Aprovações Formais** 🔴
Preciso solicitar aprovação para:
- [ ] Modificar `data_dictionary.gs` (adicionar tabela `usuario_membro`)
- [ ] Criar arquivo `src/01-business/vinculos.gs`
- [ ] Criar arquivo `src/02-api/vinculos_api.gs`
- [ ] Modificar `src/05-components/core/auth.html` (integração com seletor)
- [ ] Criar aba "UsuarioMembro" no Google Sheets

**❓ Posso prosseguir com essas modificações?**

#### **ETAPA 2: Implementação Backend** (após aprovação)
- Fase 1: Criar tabela e lógica de negócio
- Fase 2: Criar e configurar planilha

#### **ETAPA 3: Implementação Frontend** (após backend)
- Fase 3: Componente seletor
- Fase 4: Integração com auth e práticas

#### **ETAPA 4: Testes**
- Fase 6: Validação completa

#### **ETAPA 5: Gestão Admin (Opcional)**
- Fase 5: Avaliar necessidade e implementar se viável

---

## 📊 RESUMO EXECUTIVO

### O QUE FOI DECIDIDO:
✅ Arquitetura: Tabela N:N `usuario_membro`
✅ MVP: Fases 1-4 + 6 (5-6 dias)
✅ Gestão: Apenas admin (sem auto-serviço)
✅ UX: Modal após login + preferência
✅ Validação: Apenas duplicatas (obrigatória)

### O QUE ESTÁ PRONTO:
✅ Documentação completa
✅ Código backend pronto (na documentação)
✅ Código frontend pronto (na documentação)
✅ Estrutura da tabela definida
✅ Fluxos mapeados

### O QUE FALTA:
⏳ Aprovação para modificar arquivos
⏳ Implementação (copiar código para arquivos)
⏳ Testes e validação
⏳ Deploy

### PENDÊNCIAS FUTURAS (v2):
🔮 Dropdown para trocar membro em qualquer tela
🔮 View admin de gestão de vínculos
🔮 Indicador visual de membro ativo
🔮 Limites numéricos (10/5)

---

## 📝 HISTÓRICO DE IMPLEMENTAÇÃO

### ✅ **IMPLEMENTADO - 19/10/2025**

#### **FASE 1: Backend** ✅ COMPLETO
- ✅ Tabela `usuario_membro` criada em `data_dictionary.gs`
- ✅ Arquivo `src/01-business/vinculos.gs` criado
- ✅ Arquivo `src/02-api/vinculos_api.gs` criado
- ✅ Validação de duplicatas implementada
- ✅ **OTIMIZAÇÃO:** Implementado Map para evitar N+1 queries
  - **Antes:** 1 query vínculos + N queries membros = N+1 acessos ao Sheets
  - **Depois:** 1 query vínculos + 1 query todos membros + Map em memória = 2 acessos ao Sheets
  - Código: `vinculos.gs` linhas 52-67

#### **FASE 2: Planilha** ✅ COMPLETO
- ✅ Aba "UsuarioMembro" criada no Google Sheets
- ✅ Registro adicionado na tabela "planilhas"
- ✅ Testado via DatabaseManager

#### **FASE 3: Frontend - Componente Seletor** ✅ COMPLETO
- ✅ Arquivo `src/05-components/memberSelector.html` criado (~447 linhas)
- ✅ Incluído no `index.html`
- ✅ **Implementado como DROPDOWN** (não modal centralizado)
  - Botão 🥋 no header (classe theme-toggle)
  - Dropdown posicionado via JavaScript (position: fixed)
  - Estilo consistente com userMenuDropdown
  - Só aparece se usuário tem 2+ vínculos
- ✅ **Loading overlay** durante carregamento de vínculos
  - Função `showMemberLoadingOverlay()` em `loading.html`
  - Mensagem: "Carregando perfis..."
- ✅ **Ordenação:** Principal primeiro, depois alfabética (A-Z)
  - Usa `localeCompare` com locale pt-BR
- ✅ Persistência em State (localStorage)
- ✅ **NÃO atualiza campo "principal"** no banco (apenas sessão)

#### **FASE 4: Frontend - Integração Auth** ✅ COMPLETO
- ✅ Modificado `src/05-components/core/auth.html`
  - Carrega vínculos após login via `initMemberSelector()`
  - Executa em paralelo com `preLoadCachedData()`
- ✅ Auto-seleção do membro principal (`principal='sim'`)
- ✅ Armazenamento em State:
  - `State.selectedMember` (objeto completo)
  - `State.selectedMemberId` (código sequencial)

#### **FASE 6: Testes** ✅ COMPLETO
- ✅ Testado com múltiplos membros vinculados
- ✅ Seleção visual funcionando (check mark)
- ✅ Troca de perfil sem atualizar banco
- ✅ Loading overlay funcionando

---

### 🎨 **MELHORIAS IMPLEMENTADAS**

#### **Loading Overlays Unificados**
- ✅ `showMemberLoadingOverlay()` - Carregamento de perfis
- ✅ `showActivitiesLoadingOverlay()` - Carregamento de atividades
- ✅ Removido loading inline do grid de atividades
- ✅ Padrão consistente em toda aplicação

#### **Otimização de Performance**
- ✅ Redução de queries ao Google Sheets (N+1 → 2)
- ✅ Map temporário para lookup O(1)
- ✅ Cache do DatabaseManager para tabela membros

---

### 🔮 **PENDÊNCIAS FUTURAS (v2)**

#### **1. View Admin de Gestão de Vínculos**
**Status:** Código documentado, não implementado
**Arquivo:** `src/04-views/vinculos.html` (linhas 1313-1679 desta documentação)

**Funcionalidades:**
- Buscar usuários
- Listar vínculos de um usuário
- Criar novos vínculos
- Desativar/reativar vínculos
- Definir vínculo principal

**Decisão:** Admin gerencia manualmente no Google Sheets por enquanto

#### **2. Trocar Membro Sem Logout**
**Status:** Não implementado
**Descrição:** Dropdown acessível em todas as telas para trocar membro sem precisar fazer logout/login

**Implementação sugerida:**
- Adicionar botão/dropdown global no header
- Recarregar dados da página atual ao trocar
- Manter sessão ativa

#### **3. Indicador Visual de Membro Ativo**
**Status:** Não implementado
**Descrição:** Mostrar qual membro está selecionado no momento

**Implementação sugerida:**
- Badge/tag no header: "Atuando como: João Silva"
- Ícone colorido indicando modo
- Tooltip ao passar mouse no botão 🥋

#### **4. Atalho de Teclado**
**Status:** Não implementado
**Sugestões:**
- `Ctrl + M` / `Alt + M` - Abrir dropdown de membros
- `Ctrl + 1/2/3` - Trocar direto para membro 1, 2 ou 3
- `Esc` - Fechar dropdown (já implementado)

#### **5. Limites Numéricos**
**Status:** Não implementado (opcional)
**Validações:**
- Máximo 10 vínculos por usuário
- Máximo 5 usuários por membro

**Decisão:** Implementar apenas se necessário no futuro

---

### 📋 **PENDÊNCIAS TÉCNICAS**

#### **DatabaseManager - Implementar Map Global**
**Status:** Pendente
**Descrição:** Avaliar implementação de padrão Map em todas as consultas que fazem N+1 queries

**Escopo:**
- Analisar todas as queries do sistema
- Identificar padrões N+1 similares
- Criar helper genérico no DatabaseManager
- Documentar padrão de uso

**Benefícios:**
- Performance consistente em todo sistema
- Menos acessos ao Google Sheets
- Código mais limpo e reutilizável

---

**📅 Última atualização:** 19/10/2025
**📌 Status:** ✅ MVP COMPLETO - Pendências são features v2 opcionais
**👤 Implementado por:** Claude Code
**👤 Aprovado por:** Diogo Duarte
