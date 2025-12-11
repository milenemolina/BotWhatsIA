# 👤 Sistema de Atendimento Humano

## 📋 O que é?

O módulo de **Atendimento Humano** permite que clientes solicitem transferência para um atendente real quando o bot não consegue resolver sua dúvida.

---

## 🎯 Como Funciona Atualmente?

### **Fluxo do Cliente:**

1. Cliente digita: `atendente`, `humano`, `falar com alguém` ou escolhe opção `3` do menu
2. Bot confirma: "✅ Solicitação recebida! Vou te conectar com um atendente humano"
3. Bot aguarda: "⏳ Por favor aguarde alguns instantes..."
4. Sistema notifica equipe (você precisa configurar)

### **O que acontece nos bastidores:**

```javascript
// src/modules/humano/humanoController.js

1. Cliente solicita atendente
   ↓
2. Bot envia confirmação ao cliente
   ↓
3. Bot chama notifyHumanTeam(chatId)
   ↓
4. Notificação enviada (você escolhe o método)
   ↓
5. Atendente recebe alerta e responde manualmente
```

---

## ⚙️ Configuração Básica

### **1. Configure o WhatsApp do Atendente**

Edite seu arquivo `.env`:

```bash
# WhatsApp que receberá notificações
ATENDENTE_WHATSAPP=5511999999999
```

**IMPORTANTE:** Use o formato internacional sem `+` e sem `@s.whatsapp.net`
- ✅ Correto: `5511999999999`
- ❌ Errado: `+55 (11) 99999-9999`
- ❌ Errado: `5511999999999@s.whatsapp.net`

### **2. O bot adicionará o sufixo automaticamente**

O código já faz:
```javascript
const atendente = process.env.ATENDENTE_WHATSAPP + '@s.whatsapp.net';
```

---

## 🔔 Métodos de Notificação

O sistema suporta **4 métodos** de notificar sua equipe. Escolha o que melhor se adapta:

### **📱 MÉTODO 1: WhatsApp (Padrão - JÁ IMPLEMENTADO)**

**Como funciona:**
- Quando cliente pede atendente, o bot envia mensagem para o número configurado em `ATENDENTE_WHATSAPP`
- Atendente recebe notificação no próprio WhatsApp
- Atendente responde manualmente direto para o cliente

**Vantagens:**
- ✅ Simples de configurar
- ✅ Não precisa de sistema externo
- ✅ Funciona imediatamente

**Desvantagens:**
- ❌ Atendente precisa estar com WhatsApp aberto
- ❌ Sem controle de fila
- ❌ Sem histórico organizado

**Configuração:**
```bash
# .env
ATENDENTE_WHATSAPP=5511999999999
```

**Exemplo de notificação recebida:**
```
🔔 NOVO ATENDIMENTO

Cliente: 5511888888888@s.whatsapp.net
Horário: 11/12/2024 14:32:15

📱 Responda diretamente pelo WhatsApp para atender.
```

---

### **🌐 MÉTODO 2: Webhook para Sistema Externo**

**Como funciona:**
- Bot envia POST para sua URL de webhook
- Seu sistema processa e notifica como quiser (email, SMS, push notification)

**Quando usar:**
- Você tem sistema próprio de atendimento
- Quer integrar com CRM (Bitrix24, HubSpot, etc)
- Quer criar tickets automaticamente

**Configuração:**

1. **Edite `.env`:**
```bash
WEBHOOK_ATENDIMENTO=https://seu-sistema.com/webhook/atendimento
```

2. **Descomente no código:**

Abra `src/modules/humano/humanoController.js` e descomente:

```javascript
// 🎯 OPÇÃO 2: Webhook para sistema externo
try {
  await fetch(process.env.WEBHOOK_ATENDIMENTO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tipo: 'novo_atendimento',
      cliente: chatId,
      timestamp: new Date().toISOString()
    })
  });
} catch (err) {
  logger.warn('Webhook de atendimento falhou');
}
```

3. **Implemente endpoint no seu sistema:**

```javascript
// Exemplo: Node.js + Express
app.post('/webhook/atendimento', (req, res) => {
  const { tipo, cliente, timestamp } = req.body;
  
  // Criar ticket no seu sistema
  await criarTicket({
    cliente: cliente,
    status: 'aguardando',
    data: timestamp
  });
  
  // Notificar equipe por email/SMS/push
  await notificarEquipe(cliente);
  
  res.json({ success: true });
});
```

**Payload enviado:**
```json
{
  "tipo": "novo_atendimento",
  "cliente": "5511888888888@s.whatsapp.net",
  "timestamp": "2024-12-11T14:32:15.123Z"
}
```

---

### **💾 MÉTODO 3: Banco de Dados**

**Como funciona:**
- Bot salva solicitação em banco de dados
- Sistema de atendimento consulta banco periodicamente
- Atendentes pegam da fila

**Quando usar:**
- Tem equipe grande de atendentes
- Precisa de controle de fila
- Quer estatísticas detalhadas

**Configuração:**

1. **Instale driver do banco:**
```bash
npm install pg  # PostgreSQL
# ou
npm install mysql2  # MySQL
# ou
npm install mongodb  # MongoDB
```

2. **Descomente no código:**

```javascript
// 🎯 OPÇÃO 3: Salvar em banco de dados
try {
  await database.atendimentos.create({
    cliente_id: chatId,
    status: 'aguardando',
    data_inicio: new Date(),
    atendente_id: null
  });
} catch (err) {
  logger.warn('Erro ao salvar atendimento no banco');
}
```

3. **Crie tabela:**
```sql
CREATE TABLE atendimentos (
  id SERIAL PRIMARY KEY,
  cliente_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'aguardando',
  data_inicio TIMESTAMP DEFAULT NOW(),
  data_fim TIMESTAMP,
  atendente_id INT,
  mensagens_cliente TEXT[],
  mensagens_atendente TEXT[]
);
```

---

### **📧 MÉTODO 4: Email**

**Como funciona:**
- Bot envia email para equipe quando cliente pede atendente
- Equipe abre WhatsApp e atende manualmente

**Quando usar:**
- Atendentes não ficam tempo inteiro no WhatsApp
- Quer backup além do WhatsApp
- Precisa de registro por email

**Configuração:**

1. **Instale biblioteca de email:**
```bash
npm install nodemailer
```

2. **Configure `.env`:**
```bash
EMAIL_SUPORTE=suporte@suaempresa.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-app
```

3. **Crie service de email:**

```javascript
// src/services/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendEmail({ to, subject, text }) {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text
  });
}
```

4. **Descomente no código:**

```javascript
// 🎯 OPÇÃO 4: Email para equipe
try {
  await sendEmail({
    to: process.env.EMAIL_SUPORTE,
    subject: '🔔 Novo Atendimento - WhatsApp Bot',
    text: `Cliente ${chatId} solicitou atendimento humano em ${new Date().toLocaleString('pt-BR')}`
  });
} catch (err) {
  logger.warn('Erro ao enviar email de notificação');
}
```

---

## 🔄 Como o Atendente Responde?

### **Opção A: Resposta Manual (Atual)**

1. Atendente recebe notificação
2. Abre WhatsApp no celular/WhatsApp Web
3. Busca conversa do cliente
4. Responde manualmente

**Problema:** Bot continua respondendo junto!

### **Opção B: Pausar Bot Durante Atendimento (Recomendado)**

Para **desativar o bot** durante atendimento humano:

1. **Crie sistema de controle de estado:**

```javascript
// src/utils/attendanceControl.js
const activeHumanAttendances = new Set();

export function startHumanAttendance(chatId) {
  activeHumanAttendances.add(chatId);
  console.log(`🟢 Atendimento humano INICIADO: ${chatId}`);
}

export function endHumanAttendance(chatId) {
  activeHumanAttendances.delete(chatId);
  console.log(`🔴 Atendimento humano FINALIZADO: ${chatId}`);
}

export function isInHumanAttendance(chatId) {
  return activeHumanAttendances.has(chatId);
}
```

2. **Modifique o router para checar:**

```javascript
// src/core/router.js
import { isInHumanAttendance } from '../utils/attendanceControl.js';

export async function handleIncomingMessage({ from, message }) {
  // ANTES de qualquer processamento, checa se está em atendimento humano
  if (isInHumanAttendance(from)) {
    logger.info({ from }, '⏸️ Mensagem ignorada - atendimento humano ativo');
    return; // Bot não responde!
  }
  
  // ... resto do código
}
```

3. **Comandos para atendente:**

O atendente pode enviar comandos especiais:

```javascript
// src/modules/humano/humanoController.js
export async function transferToHuman(chatId) {
  // ... código existente ...
  
  // Inicia atendimento humano (bot para de responder)
  startHumanAttendance(chatId);
  
  // Instrui como finalizar
  await global.sendWhatsApp(
    atendente,
    `🔔 NOVO ATENDIMENTO\n\nCliente: ${chatId}\n\n⚠️ BOT PAUSADO para este cliente.\n\nQuando finalizar, digite:\n/finalizar ${chatId}`
  );
}

// Adicione comando para finalizar
export async function handleAttendantCommand(message, from) {
  if (message.startsWith('/finalizar ')) {
    const clientId = message.replace('/finalizar ', '').trim();
    endHumanAttendance(clientId);
    
    await global.sendWhatsApp(from, `✅ Atendimento finalizado. Bot reativado para ${clientId}`);
    await global.sendWhatsApp(clientId, `✅ Atendimento finalizado!\n\nDigite *menu* para voltar às opções automáticas.`);
  }
}
```

---

## 📊 Estatísticas e Relatórios (Futuro)

Para ter controle total, você pode implementar:

### **Dashboard de Atendimentos:**
- Quantos clientes pediram atendente hoje?
- Tempo médio de espera
- Tempo médio de atendimento
- Atendentes mais ativos

### **Exemplo de estrutura:**

```javascript
// src/services/analytics.js
export async function logAttendance(data) {
  await database.analytics.create({
    tipo: 'atendimento_humano',
    cliente: data.chatId,
    inicio: data.inicio,
    fim: data.fim,
    atendente: data.atendente,
    duracao: data.fim - data.inicio
  });
}
```

---

## 🎯 Resumo - Qual Método Escolher?

| Método | Complexidade | Custo | Melhor Para |
|--------|--------------|-------|-------------|
| **WhatsApp** | ⭐ Fácil | 💰 Grátis | Pequenos negócios, 1-2 atendentes |
| **Webhook** | ⭐⭐ Médio | 💰 Variável | Integração com sistemas existentes |
| **Banco de Dados** | ⭐⭐⭐ Difícil | 💰💰 Médio | Equipes grandes, controle de fila |
| **Email** | ⭐⭐ Médio | 💰 Grátis | Backup, notificação extra |

---

## ✅ Checklist de Implementação

### **Básico (Grátis):**
- [x] WhatsApp do atendente configurado em `.env`
- [ ] Testar notificação enviando "atendente" no bot
- [ ] Atendente recebe notificação e responde manualmente

### **Intermediário:**
- [ ] Implementar controle de estado (pausar bot)
- [ ] Comandos `/finalizar` para atendente
- [ ] Webhook para sistema externo (opcional)

### **Avançado:**
- [ ] Banco de dados para fila de atendimentos
- [ ] Dashboard de estatísticas
- [ ] Distribuição automática entre múltiplos atendentes
- [ ] Integração com CRM (Bitrix24, HubSpot, etc)

---

## 🚀 Próximos Passos

1. **Configure agora:**
   - Edite `.env` com número do atendente
   - Teste no `test-local.js` digitando "atendente"

2. **Para produção:**
   - Implemente pausa do bot durante atendimento
   - Adicione comandos `/finalizar` para controle

3. **Melhorias futuras:**
   - Sistema de fila
   - Múltiplos atendentes
   - Estatísticas detalhadas

---

## 💡 Dúvidas Frequentes

**1. O bot continua respondendo durante atendimento humano?**
Sim, por padrão. Você precisa implementar controle de estado (veja "Opção B" acima).

**2. Posso ter múltiplos atendentes?**
Sim! Configure webhook ou banco de dados para distribuir entre eles.

**3. Como saber quanto tempo cada atendimento levou?**
Implemente logging em banco de dados com timestamp de início e fim.

**4. Posso integrar com Zendesk/Freshdesk?**
Sim! Use webhook para criar tickets automaticamente nesses sistemas.

---

**📝 Documentação relacionada:**
- [README.md](./README.md) - Visão geral do projeto
- [QUICKSTART.md](./QUICKSTART.md) - Instalação rápida
