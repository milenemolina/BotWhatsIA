# 🤖 Bot WhatsApp com IA - Atendimento Automatizado Inteligente

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Baileys](https://img.shields.io/badge/Baileys-6.6.0-blue)
![License](https://img.shields.io/badge/license-MIT-orange)

**Automação profissional de atendimento via WhatsApp com Inteligência Artificial**

Solução completa e modular para atendimento automatizado usando **Baileys** + **IA** (OpenAI/Groq)

[Características](#-características) • [Instalação](#-instalação) • [Configuração](#-configuração) • [Uso](#-uso) • [Módulos](#-módulos)

</div>

---

## 📋 Índice

- [Características](#-características)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Como Usar](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Módulos Disponíveis](#-módulos-disponíveis)
- [Modo de Teste](#-modo-de-teste)
- [Personalização](#-personalização)
- [Troubleshooting](#-troubleshooting)
- [FAQ](#-faq)
- [Suporte](#-suporte)

---

## ✨ Características

### 🎯 **Funcionalidades Principais**

- ✅ **Atendimento 24/7** - Bot sempre disponível para responder seus clientes
- 🤖 **IA Conversacional** - Respostas inteligentes usando GPT-4 ou Llama
- 📦 **Catálogo de Produtos** - Exibição automática com imagens e preços
- 👤 **Transferência Humana** - Encaminhamento para atendente real quando necessário
- 🔄 **Navegação Intuitiva** - Menu interativo com opções numeradas
- 🛡️ **Filtro de Grupos** - Responde apenas mensagens diretas (ignora grupos)
- 🔌 **Arquitetura Modular** - Fácil adicionar novos módulos e funcionalidades

### 🎨 **Diferenciais Técnicos**

- 📱 Multi-dispositivo (WhatsApp Web API via Baileys)
- 🚀 Zero dependências de servidores externos
- 🔐 Autenticação persistente (QR Code único)
- 📊 Sistema de logs detalhado (Pino)
- 🧩 Plug-and-play - Módulos independentes
- ⚡ Performance otimizada com ES Modules

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

### **Obrigatórios:**

| Requisito | Versão Mínima | Link |
|-----------|---------------|------|
| **Node.js** | 18.x ou superior | [Download](https://nodejs.org/) |
| **npm** | 8.x ou superior | Incluído com Node.js |
| **WhatsApp** | Conta ativa | Aplicativo oficial |
| **Chave API** | OpenAI ou Groq | [OpenAI](https://platform.openai.com/) / [Groq](https://console.groq.com/) |

### **Recomendados:**

- 📱 **Número de teste** - Chip separado para desenvolvimento
- 💻 **Terminal moderno** - Windows Terminal, iTerm2 ou similar
- 📝 **Editor de código** - VS Code (recomendado)

### **Verificar instalação:**

```bash
node --version  # Deve retornar v18.x ou superior
npm --version   # Deve retornar 8.x ou superior
```

---

## 📥 Instalação

### **Passo 1: Clone o repositório**

```bash
git clone <seu-repositorio>
cd BotWhatsIA
```

### **Passo 2: Instale as dependências**

```bash
npm install
```

**Pacotes instalados:**
- `@whiskeysockets/baileys` - Conexão com WhatsApp
- `axios` - Requisições HTTP para APIs de IA
- `dotenv` - Gerenciamento de variáveis de ambiente
- `pino` - Sistema de logs profissional
- `qrcode-terminal` - Exibição do QR Code no terminal

### **Passo 3: Verifique a instalação**

```bash
npm list --depth=0
```

✅ Se todos os pacotes aparecerem sem erros, a instalação foi bem-sucedida!

---

## ⚙️ Configuração

### **1. Arquivo de Ambiente (.env)**

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

**Windows (PowerShell):**
```powershell
Copy-Item .env.example .env
```

### **2. Configure suas credenciais**

Edite o arquivo `.env` com suas chaves:

```ini
# ============================================
# CONFIGURAÇÃO DE IA (Obrigatório)
# ============================================

# Escolha o provedor: 'openai' ou 'groq'
AI_PROVIDER=groq

# ============================================
# CHAVES DE API (Preencha apenas a do provedor escolhido)
# ============================================

# OpenAI (https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-proj-...

# Groq (https://console.groq.com/keys)
GROQ_API_KEY=gsk_...

# ============================================
# MODELOS DISPONÍVEIS
# ============================================

# Para OpenAI:
AI_MODEL=gpt-4o-mini          # Rápido e econômico (recomendado)
# AI_MODEL=gpt-4               # Mais poderoso, mais caro
# AI_MODEL=gpt-4-turbo         # Equilíbrio entre velocidade e qualidade

# Para Groq:
AI_MODEL=llama-3.1-70b-versatile  # Melhor qualidade (recomendado)
# AI_MODEL=llama-3.1-8b-instant    # Mais rápido, menos preciso
# AI_MODEL=mixtral-8x7b-32768      # Bom para textos longos
```

### **3. Como obter suas chaves de API**

#### **OpenAI:**
1. Acesse [platform.openai.com](https://platform.openai.com/)
2. Faça login ou crie uma conta
3. Vá em **API Keys** no menu
4. Clique em **Create new secret key**
5. Copie a chave (começa com `sk-proj-...`)

#### **Groq (Recomendado - Gratuito):**
1. Acesse [console.groq.com](https://console.groq.com/)
2. Crie uma conta (login com Google)
3. Vá em **API Keys**
4. Clique em **Create API Key**
5. Copie a chave (começa com `gsk_...`)

> **💡 Dica:** Groq oferece acesso gratuito com alta performance para testes!

---

## 🚀 Como Usar

### **Iniciar o Bot**

```bash
npm start
```

### **Primeira Conexão**

1. **QR Code aparecerá no terminal:**
   ```
   📲 Escaneie o QR Code abaixo com o WhatsApp:
   █████████████████████████████
   █                           █
   █  [QR CODE AQUI]           █
   █                           █
   █████████████████████████████
   ```

2. **No WhatsApp do celular:**
   - Abra o WhatsApp
   - Vá em **⚙️ Configurações**
   - Toque em **Dispositivos Conectados**
   - Toque em **Conectar um dispositivo**
   - Escaneie o QR Code exibido no terminal

3. **Aguarde a conexão:**
   ```
   ✅ Bot conectado com sucesso ao WhatsApp!
   ```

### **Testar o Bot**

De **outro número** (não o conectado), envie para o bot:

1. **Teste de saudação:**
   ```
   Você: oi
   Bot: Olá! Como posso te ajudar?
        1️⃣ Tenho uma dúvida
        2️⃣ Ver catálogo
        3️⃣ Falar com atendente
   ```

2. **Teste de IA:**
   ```
   Você: 1
   Bot: Perfeito! Estou aqui para responder suas dúvidas.
        
        💡 Dica: A qualquer momento você pode:
        • Digite menu para voltar ao menu principal
        • Digite atendente para falar com um humano
        
        O que você gostaria de saber?
   
   Você: como funciona a entrega?
   Bot: [Resposta da IA...]
   ```

3. **Teste de catálogo:**
   ```
   Você: 2
   Bot: 📦 *Nosso Catálogo de Produtos*
        
        🔹 1. Tênis Esportivo - R$ 199,90
        🔹 2. Camiseta DryFit - R$ 89,50
        🔹 3. Garrafa Térmica - R$ 79,00
   ```

### **Comandos Disponíveis**

| Comando | Descrição |
|---------|-----------|
| `oi`, `olá`, `bom dia` | Exibe o menu principal |
| `menu`, `voltar`, `inicio` | Volta ao menu (funciona em qualquer momento) |
| `1` | Inicia conversa com IA |
| `2` | Exibe catálogo de produtos |
| `3` | Solicita atendimento humano |
| `produto 1`, `ver 2` | Mostra detalhes de um produto específico |
| `atendente`, `humano` | Transfere para atendente (funciona em qualquer momento) |
| `0` | Volta ao menu principal |

---
- Outras perguntas serão direcionadas para o serviço de IA configurado.
- Logs básicos são exibidos no terminal para facilitar a depuração.
- O catálogo pode ser aberto digitando `catalogo`, `quero ver produtos`, `mostrar produtos` ou simplesmente `2`. Para ver detalhes de um item, envie `produto <id>`.

### Módulo de catálogo

- O módulo mora em `src/modules/catalog` e é composto por `catalogController.js`, `catalogService.js` e `products.json`.
- O `catalogController` expõe `sendCatalogMenu(chatId)` e `sendProductById(chatId, id)` e nunca chama a IA diretamente.
- O roteador (`src/core/router.js`) define a função global `sendWhatsApp({ chatId, payload })`, responsável por enviar mensagens via Baileys.

## Resolução de Problemas

- **`Chave de API não configurada`**: confirme que o `.env` contém `OPENAI_API_KEY` ou `GROQ_API_KEY` e reinicie o bot.
- **Erro `model_decommissioned`**: escolha um modelo ativo na plataforma do seu provedor e atualize `AI_MODEL`.
- **`stream:error conflict replaced`**: outra sessão está usando as mesmas credenciais. Encerre processos duplicados, remova dispositivos conectados antigos e, se necessário, apague a pasta `auth/` antes de reconectar.
- **Aviso `ExperimentalWarning`**: mensagem do Node sobre importação de JSON; pode ser ignorada.

## Estrutura do Projeto

```
.
├── auth/                     # Credenciais Baileys (gerado automaticamente)
├── src/
│   ├── core/
│   │   ├── bot.js            # Inicialização do WhatsApp e eventos principais
│   │   └── messageRouter.js  # Roteador para delegar mensagens aos módulos
│   ├── modules/
│   │   └── catalog/
│   │       ├── catalogController.js  # Controlador do catálogo
│   │       ├── catalogService.js     # Serviço para leitura dos produtos
│   │       └── products.json         # Dados base do catálogo
│   ├── services/
│   │   └── ai.js             # Conector com OpenAI/Groq
│   ├── utils/
│   │   ├── helpers.js        # Funções utilitárias
│   │   └── logger.js         # Logger centralizado (Pino)
│   └── index.js              # Entrada principal do bot
├── .env.example              # Template de variáveis de ambiente
├── package.json
└── README.md
```

---

## 📁 Estrutura do Projeto Detalhada

```
BotWhatsIA/
├── 📄 index.js                 # Ponto de entrada da aplicação
├── 📄 test-local.js            # Modo de teste sem WhatsApp
├── 📄 package.json             # Dependências e scripts
├── 📄 .env.example             # Exemplo de configuração
├── 📄 .env                     # Suas configurações (criar)
├── 📄 README.md                # Esta documentação
│
├── 📂 src/                     # Código fonte principal
│   ├── 📂 core/                # Núcleo do bot
│   │   ├── bot.js              # Conexão com WhatsApp (Baileys)
│   │   └── router.js           # Orquestrador de mensagens
│   │
│   ├── 📂 modules/             # Módulos funcionais (plug-and-play)
│   │   ├── 📂 catalog/         # Módulo de catálogo
│   │   │   ├── catalogController.js
│   │   │   ├── catalogService.js
│   │   │   └── products.json   # Base de produtos
│   │   ├── 📂 ia/              # Módulo de IA
│   │   │   ├── iaController.js
│   │   │   └── iaPrompt.js     # Personalidade da IA
│   │   └── 📂 humano/          # Módulo de transferência humana
│   │       └── humanoController.js
│   │
│   ├── 📂 services/            # Serviços compartilhados
│   │   └── ai.js               # Integração com APIs de IA
│   │
│   └── 📂 utils/               # Utilitários
│       ├── logger.js           # Sistema de logs (Pino)
│       └── helpers.js          # Funções auxiliares
│
└── 📂 auth/                    # Sessão WhatsApp (gerada automaticamente)
    └── creds.json              # Credenciais de autenticação
```

### **Arquivos Importantes**

| Arquivo | Descrição | Editar? |
|---------|-----------|---------|
| `.env` | Configurações e chaves API | ✅ Sim |
| `products.json` | Produtos do catálogo | ✅ Sim |
| `iaPrompt.js` | Personalidade da IA | ✅ Sim |
| `router.js` | Lógica de roteamento | ⚠️ Avançado |
| `bot.js` | Conexão WhatsApp | ❌ Não |

---

## 🎯 Módulos Disponíveis

### **1. Módulo IA (Chatbot Inteligente)**

📍 **Localização:** `src/modules/ia/`

**Funcionalidades:**
- Responde perguntas abertas usando GPT ou Llama
- Contexto conversacional inteligente
- Personalidade configurável via prompt

**Personalizar:**

Edite `src/modules/ia/iaPrompt.js`:

```javascript
export const SYSTEM_PROMPT = `
Você é um assistente virtual da [SUA EMPRESA].
Seja cordial, profissional e objetivo.
Responda sempre em português brasileiro.

Informações da empresa:
- Horário: Segunda a Sexta, 9h às 18h
- Entrega: 3-5 dias úteis
- Pagamento: PIX, Cartão, Boleto
`;
```

### **2. Módulo Catálogo**

📍 **Localização:** `src/modules/catalog/`

**Funcionalidades:**
- Exibe lista de produtos com preços
- Mostra detalhes individuais com imagens
- Navegação por números ou nomes

**Adicionar produtos:**

Edite `src/modules/catalog/products.json`:

```json
[
  {
    "id": 1,
    "nome": "Seu Produto",
    "descricao": "Descrição detalhada do produto",
    "preco": 149.90,
    "img": "https://exemplo.com/imagem.jpg"
  }
]
```

### **3. Módulo Humano (Transferência)**

📍 **Localização:** `src/modules/humano/`

**Funcionalidades:**
- Simula transferência para atendente
- Mensagens configuráveis
- Preparado para integração com CRM

---

## 🧪 Modo de Teste Local

Para testar **sem conectar ao WhatsApp real**:

```bash
node test-local.js
```

**Vantagens:**
- ✅ Não precisa de número de WhatsApp
- ✅ Testa toda a lógica do bot
- ✅ Ideal para desenvolvimento
- ⚠️ Não testa conexão real com WhatsApp

---

## 🔧 Troubleshooting

### **QR Code não aparece**

```bash
# Limpe a pasta de autenticação
rm -rf auth/      # Linux/Mac
Remove-Item -Recurse -Force auth/  # Windows

# Reinicie
npm start
```

### **"Connection Failure"**

1. Feche **todas** as abas do WhatsApp Web
2. No celular: Desconecte todos os dispositivos
3. Delete `auth/` e reconecte

### **Bot responde em grupos**

Verifique o filtro em `src/core/bot.js`:

```javascript
if (remoteJid.endsWith('@g.us')) {
  return;  // Ignora grupos
}
```

### **IA não responde (Erro 401)**

1. Verifique a chave API no `.env`
2. Teste a chave:

```bash
# Groq
curl -H "Authorization: Bearer gsk_SUA_CHAVE" https://api.groq.com/openai/v1/models
```

---

## ❓ FAQ

**1. Posso usar meu WhatsApp pessoal?**
- ⚠️ Não recomendado! Use número dedicado.

**2. O bot funciona 24/7?**
- ✅ Sim, enquanto o script estiver rodando.

**3. Quanto custa?**
- Groq: 🆓 Gratuito para testes
- OpenAI: 💰 GPT-4o-mini ≈ R$ 2/mês (1.000 msg/dia)

**4. Posso comercializar?**
- ✅ Sim! Licença MIT permite uso comercial.

---

## 📞 Suporte

- 📚 [Baileys Documentation](https://github.com/WhiskeySockets/Baileys)
- 🤖 [Groq API Docs](https://console.groq.com/docs)
- 💬 [OpenAI API Docs](https://platform.openai.com/docs)

---

## 📄 Licença

MIT License - Uso livre para projetos comerciais e pessoais.

---

<div align="center">

**Desenvolvido com ❤️ para automatizar atendimentos**

⭐ **Se este projeto ajudou, deixe uma estrela!**

[🐛 Reportar Bug](../../issues) • [✨ Sugerir Feature](../../issues) • [📖 Documentação](README.md)

</div>
