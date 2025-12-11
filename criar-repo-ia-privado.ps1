# Script para criar repositório privado do Módulo IA
# USO: .\criar-repo-ia-privado.ps1

Write-Host "🔒 Criando repositório privado do Módulo IA..." -ForegroundColor Cyan
Write-Host ""

# Define pastas
$pastaOrigem = Get-Location
$pastaDestino = Join-Path $pastaOrigem.Path "..\BotWhatsIA-IA-Premium"

# Cria pasta de destino
Write-Host "📁 Criando pasta: $pastaDestino" -ForegroundColor Yellow
if (Test-Path $pastaDestino) {
    Write-Host "⚠️  Pasta já existe. Removendo..." -ForegroundColor Yellow
    Remove-Item -Path $pastaDestino -Recurse -Force
}
New-Item -Path $pastaDestino -ItemType Directory | Out-Null

# Criar estrutura de pastas
$estrutura = @(
    "src\modules\ia",
    "services",
    "handlers"
)

foreach ($pasta in $estrutura) {
    $caminho = Join-Path $pastaDestino $pasta
    New-Item -Path $caminho -ItemType Directory -Force | Out-Null
}

# Lista de arquivos/pastas para COPIAR (apenas módulo IA)
$arquivosIA = @(
    @{ Origem = "src\modules\ia\*"; Destino = "src\modules\ia\" },
    @{ Origem = "services\openai.js"; Destino = "services\" },
    @{ Origem = "services\ollama.js"; Destino = "services\" },
    @{ Origem = "handlers\iaHandler.js"; Destino = "handlers\" },
    @{ Origem = "INSTALACAO-MODULO-IA.md"; Destino = "" },
    @{ Origem = ".gitignore"; Destino = "" }
)

# Copia arquivos do módulo IA
Write-Host "📦 Copiando arquivos do Módulo IA..." -ForegroundColor Green
foreach ($item in $arquivosIA) {
    $origem = Join-Path $pastaOrigem.Path $item.Origem
    $destino = Join-Path $pastaDestino $item.Destino
    
    if (Test-Path $origem) {
        if (-not (Test-Path (Split-Path $destino -Parent))) {
            New-Item -Path (Split-Path $destino -Parent) -ItemType Directory -Force | Out-Null
        }
        
        Copy-Item -Path $origem -Destination $destino -Recurse -Force
        Write-Host "  ✅ $($item.Origem)" -ForegroundColor Gray
    } else {
        Write-Host "  ⚠️  $($item.Origem) não encontrado" -ForegroundColor Yellow
    }
}

# Criar README.md do módulo IA
$readmeIA = @"
# 🔒 Módulo IA Premium - WhatsApp Bot

## 🎯 O que é?

Este é o **Módulo IA Premium** para o WhatsApp Bot.  
Adiciona inteligência artificial com GPT-4 (OpenAI) ou Llama 3.1 (Ollama).

## ⚠️ IMPORTANTE

Este módulo **requer o bot base** instalado:
👉 https://github.com/milenemolina/BotWhatsIA

## 📦 Conteúdo

\`\`\`
BotWhatsIA-IA-Premium/
├── src/
│   └── modules/
│       └── ia/                 ← Controlador do módulo IA
│           ├── iaController.js
│           ├── prompts.js
│           └── index.js
├── services/
│   ├── openai.js              ← Integração OpenAI
│   └── ollama.js              ← Integração Ollama
├── handlers/
│   └── iaHandler.js           ← Handler de mensagens IA
└── INSTALACAO-MODULO-IA.md    ← 📖 LEIA PRIMEIRO!
\`\`\`

## 🚀 Instalação

Veja instruções completas em: **[INSTALACAO-MODULO-IA.md](./INSTALACAO-MODULO-IA.md)**

### Resumo rápido:

1. **Clone este repositório** (você já tem acesso)
2. **Copie as pastas** para seu bot base:
   \`\`\`powershell
   # Copiar módulo IA
   Copy-Item -Path "src\modules\ia" -Destination "C:\Seu\Bot\src\modules\ia" -Recurse
   
   # Copiar serviços
   Copy-Item -Path "services\*" -Destination "C:\Seu\Bot\services\" -Recurse
   
   # Copiar handlers (se aplicável)
   Copy-Item -Path "handlers\iaHandler.js" -Destination "C:\Seu\Bot\handlers\" -Force
   \`\`\`

3. **Instale dependências adicionais:**
   \`\`\`powershell
   cd C:\Seu\Bot
   npm install openai ollama
   \`\`\`

4. **Configure variáveis de ambiente** (`.env`):
   \`\`\`env
   # Escolha o provedor: "openai" ou "ollama"
   IA_PROVIDER=openai
   
   # Se OpenAI:
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
   OPENAI_MODEL=gpt-4o-mini
   
   # Se Ollama:
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1:8b
   \`\`\`

5. **Ative o módulo** em \`license.json\`:
   \`\`\`json
   {
     "modulos": {
       "ia": {
         "ativo": true
       }
     }
   }
   \`\`\`

6. **Teste:**
   \`\`\`powershell
   node test-local.js
   # Digite: 1
   # Faça uma pergunta!
   \`\`\`

## 🔑 Como Obter API Keys

### OpenAI (Pago por Uso)
1. Criar conta: https://platform.openai.com/signup
2. Adicionar créditos: https://platform.openai.com/settings/organization/billing/overview
3. Criar API Key: https://platform.openai.com/api-keys
4. Copiar chave que começa com \`sk-proj-\`

**Custos estimados:**
- gpt-4o-mini: ~\$0.15 por 1000 mensagens
- gpt-4o: ~\$2.50 por 1000 mensagens

### Ollama (100% Gratuito)
1. Baixar: https://ollama.com/download
2. Instalar modelo: \`ollama pull llama3.1:8b\`
3. Iniciar servidor: \`ollama serve\`

**Vantagens:**
- ✅ Totalmente gratuito
- ✅ Privacidade total (local)
- ✅ Sem limites de uso
- ⚠️ Requer GPU potente

## 🎨 Personalização

### Customizar Persona da IA

Edite \`src/modules/ia/prompts.js\`:

\`\`\`javascript
export const SYSTEM_PROMPT = \`Você é um assistente virtual da MINHA LOJA.

INFORMAÇÕES DA EMPRESA:
- Nome: Minha Loja Incrível
- Ramo: [seu ramo]
- Diferencial: [seu diferencial]

INSTRUÇÕES:
- Seja educado e prestativo
- Responda em português do Brasil
- Se não souber, seja honesto

ESTILO:
- Tom amigável mas profissional
- Respostas curtas e diretas\`;
\`\`\`

## 📞 Suporte

**Você tem 30 dias de suporte incluído!**

- 📧 Email: contato@seudominio.com
- 💬 WhatsApp: https://wa.me/5511999999999
- ⏰ Horário: Segunda a sexta, 9h às 18h
- 📝 Resposta em até 24h úteis

## ⚖️ Licença

**Uso Proprietário - Comprador Individual**

✅ **Permitido:**
- Uso comercial pelo comprador
- Modificação para uso próprio
- Uso em múltiplos projetos seus

❌ **Proibido:**
- Redistribuição ou revenda
- Compartilhamento público do código
- Inclusão em produtos derivados para venda

## 🎉 Obrigado pela compra!

Se tiver dúvidas, consulte:
1. [INSTALACAO-MODULO-IA.md](./INSTALACAO-MODULO-IA.md) (guia completo)
2. Entre em contato no suporte

**Bom uso! 🚀**
"@

Set-Content -Path (Join-Path $pastaDestino "README.md") -Value $readmeIA -Encoding UTF8
Write-Host "  ✅ README.md criado" -ForegroundColor Gray

# Criar package.json do módulo IA
$packageIA = @"
{
  "name": "botwhats-ia-module",
  "version": "1.0.0",
  "description": "Módulo IA Premium para WhatsApp Bot",
  "type": "module",
  "author": "Milene Molina",
  "license": "PROPRIETARY",
  "dependencies": {
    "openai": "^4.20.0",
    "ollama": "^0.5.0"
  },
  "peerDependencies": {
    "pino": "^8.16.0"
  }
}
"@

Set-Content -Path (Join-Path $pastaDestino "package.json") -Value $packageIA -Encoding UTF8
Write-Host "  ✅ package.json criado" -ForegroundColor Gray

# Criar LICENSE proprietária
$licenseIA = @"
LICENÇA DE USO - MÓDULO IA PREMIUM

Copyright (c) 2025 Milene Molina

PERMISSÕES CONCEDIDAS AO COMPRADOR:
================================
✅ Uso comercial em projetos próprios
✅ Modificação para uso pessoal
✅ Uso em múltiplos projetos do comprador
✅ Uso privado

RESTRIÇÕES:
===========
❌ Redistribuição do código
❌ Revenda do módulo
❌ Compartilhamento público (GitHub público, etc)
❌ Inclusão em produtos derivados para revenda
❌ Sublicenciamento

GARANTIA:
=========
Este software é fornecido "como está", sem garantias de qualquer tipo,
expressas ou implícitas, incluindo, mas não se limitando a garantias
de comercialização, adequação a um propósito específico e não violação.

SUPORTE:
========
- 30 dias de suporte técnico incluído após a compra
- Suporte via email e WhatsApp
- Atualizações gratuitas por tempo indeterminado

VIOLAÇÃO:
=========
O uso deste software em violação aos termos desta licença resultará
na revogação imediata do direito de uso sem reembolso.

Para dúvidas sobre a licença, entre em contato:
Email: contato@seudominio.com
WhatsApp: https://wa.me/5511999999999
"@

Set-Content -Path (Join-Path $pastaDestino "LICENSE") -Value $licenseIA -Encoding UTF8
Write-Host "  ✅ LICENSE criada" -ForegroundColor Gray

# Criar .gitignore
$gitignoreIA = @"
node_modules/
.env
*.log
.DS_Store
"@

Set-Content -Path (Join-Path $pastaDestino ".gitignore") -Value $gitignoreIA -Encoding UTF8
Write-Host "  ✅ .gitignore criado" -ForegroundColor Gray

# Inicializar git
Write-Host ""
Write-Host "🔧 Inicializando Git..." -ForegroundColor Yellow
Set-Location $pastaDestino
git init | Out-Null
git add . | Out-Null
git commit -m "🔒 Initial commit - Módulo IA Premium v1.0.0" | Out-Null

Write-Host ""
Write-Host "✨ Repositório do Módulo IA criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📂 Localização: $pastaDestino" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Próximos passos:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Criar repositório PRIVADO no GitHub:"
Write-Host "   👉 https://github.com/new" -ForegroundColor Cyan
Write-Host "   - Nome: BotWhatsIA-IA-Premium"
Write-Host "   - Tipo: 🔒 PRIVADO"
Write-Host "   - Criar repositório"
Write-Host ""
Write-Host "2. Conectar e fazer push:"
Write-Host "   cd $pastaDestino" -ForegroundColor White
Write-Host "   git remote add origin https://github.com/milenemolina/BotWhatsIA-IA-Premium.git" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor White
Write-Host ""
Write-Host "3. Quando vender o módulo:"
Write-Host "   - Settings → Collaborators → Add people"
Write-Host "   - Digite email do comprador"
Write-Host "   - Cliente recebe convite para clonar repo privado"
Write-Host ""
Write-Host "📝 Lembre-se de:" -ForegroundColor Yellow
Write-Host "  - Manter repositório PRIVADO"
Write-Host "  - Adicionar apenas compradores como colaboradores"
Write-Host "  - Remover acesso se necessário (revoke)"
Write-Host ""

# Voltar para pasta original
Set-Location $pastaOrigem
