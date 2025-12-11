import logger from '../../utils/logger.js';

/**
 * Transfere o atendimento para um operador humano.
 * 
 * COMO FUNCIONA:
 * 1. Envia mensagem de confirmação ao cliente
 * 2. Notifica equipe de atendimento (você precisa implementar)
 * 3. Desativa respostas automáticas (opcional)
 * 
 * IMPORTANTE: Este é um PLACEHOLDER. Você precisa integrar com:
 * - Sistema de tickets (Zendesk, Freshdesk, etc)
 * - CRM (Bitrix24, HubSpot, etc)
 * - Webhook para notificar atendentes
 * - Base de dados para registrar transferências
 * 
 * @param {string} chatId - ID do chat do usuário (formato: 5511999999999@s.whatsapp.net)
 */
export async function transferToHuman(chatId) {
  if (typeof global.sendWhatsApp !== 'function') {
    throw new Error('Função global sendWhatsApp não configurada.');
  }

  try {
    // 1. Confirma ao cliente
    await global.sendWhatsApp(chatId, '✅ *Solicitação recebida!*\n\nVou te conectar com um atendente humano.');
    
    // Delay natural
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    await global.sendWhatsApp(chatId, '⏳ Por favor aguarde alguns instantes...\n\n💡 *Dica:* Já prepare sua dúvida para agilizar o atendimento!');
    
    // 2. NOTIFICA EQUIPE (você precisa implementar uma dessas opções)
    await notifyHumanTeam(chatId);
    
    logger.info({ chatId }, '👤 Usuário transferido para atendimento humano.');
    
  } catch (error) {
    logger.error({ err: error, chatId }, 'Erro ao transferir para atendente humano.');
    await global.sendWhatsApp(
      chatId,
      '❌ Desculpe, houve um problema ao processar sua solicitação.\n\nTente novamente em alguns instantes ou digite *menu* para voltar.'
    );
  }
}

/**
 * Notifica a equipe de atendimento sobre nova transferência
 * 
 * IMPLEMENTE UMA DAS OPÇÕES ABAIXO:
 */
async function notifyHumanTeam(chatId) {
  // 🎯 OPÇÃO 1: Enviar para número de atendente específico
  const atendente = process.env.ATENDENTE_WHATSAPP || '5511999999999@s.whatsapp.net';
  
  try {
    await global.sendWhatsApp(
      atendente,
      `🔔 *NOVO ATENDIMENTO*\n\nCliente: ${chatId}\nHorário: ${new Date().toLocaleString('pt-BR')}\n\n📱 Responda diretamente pelo WhatsApp para atender.`
    );
  } catch (err) {
    logger.warn('Não foi possível notificar atendente via WhatsApp');
  }

  // 🎯 OPÇÃO 2: Webhook para sistema externo (descomente para usar)
  /*
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
  */

  // 🎯 OPÇÃO 3: Salvar em banco de dados (descomente para usar)
  /*
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
  */

  // 🎯 OPÇÃO 4: Email para equipe (descomente para usar)
  /*
  try {
    await sendEmail({
      to: process.env.EMAIL_SUPORTE,
      subject: '🔔 Novo Atendimento - WhatsApp Bot',
      text: `Cliente ${chatId} solicitou atendimento humano em ${new Date().toLocaleString('pt-BR')}`
    });
  } catch (err) {
    logger.warn('Erro ao enviar email de notificação');
  }
  */
}

/**
 * Verifica se um chat está em atendimento humano
 * (você pode implementar controle de estado)
 */
export function isHumanAttendance(chatId) {
  // TODO: Implementar verificação em banco de dados ou cache
  // Exemplo: return cache.get(`human_${chatId}`) === true;
  return false;
}

/**
 * Finaliza atendimento humano e retorna para bot
 */
export async function finishHumanAttendance(chatId) {
  // TODO: Implementar finalização
  logger.info({ chatId }, 'Atendimento humano finalizado');
}
