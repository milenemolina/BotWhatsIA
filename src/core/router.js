import logger from '../utils/logger.js';
import { normalizeText } from '../utils/helpers.js';
import { sendCatalogMenu, sendProductById } from '../modules/catalog/catalogController.js';
import { handleIA } from '../modules/ia/iaController.js';
import { transferToHuman } from '../modules/humano/humanoController.js';
import { isModuleActive, getModuleBlockedMessage } from './license.js';

const WELCOME_MESSAGE = `Olá! Como posso te ajudar?
1️⃣ Tenho uma dúvida
2️⃣ Ver catálogo
3️⃣ Falar com atendente`;

const GREETING_KEYWORDS = ['oi', 'ola', 'olá', 'bom dia', 'boa tarde', 'boa noite'];
const MENU_KEYWORDS = ['menu', 'voltar', 'inicio', 'início', 'opcoes', 'opções'];
const HUMAN_KEYWORDS = ['humano', 'atendente', 'pessoa', 'falar com alguem', 'falar com alguém', 'operador'];
const IA_INTENT_KEYWORDS = [
  'tenho uma duvida',
  'tenho uma dúvida',
  'pode me ajudar',
  'preciso saber',
  'como funciona',
  'me ajuda',
  'ajuda',
  'duvida',
  'dúvida'
];
const CATALOG_INTENT_KEYWORDS = [
  'catalogo',
  'catálogo',
  'ver produtos',
  'quero ver',
  'mostrar produtos',
  'produtos'
];

let socketRef = null;

// Armazena contexto da última interação de cada usuário
const userContexts = new Map();

export function initRouter(socket) {
  socketRef = socket;

  global.sendWhatsApp = async (chatId, texto, opcoes = {}) => {
    if (!socketRef) {
      throw new Error('Socket não inicializado para envio de mensagens.');
    }

    if (!chatId || !texto) {
      throw new Error('sendWhatsApp requer chatId e texto.');
    }

    const payload = opcoes.image
      ? { image: opcoes.image, caption: texto }
      : { text: texto };

    await socketRef.sendMessage(chatId, payload);
  };
}

function extractProductId(text) {
  const patterns = [
    /^produto\s+(\d+)/i,
    /^ver\s+(\d+)/i,
    /^item\s+(\d+)/i,
    /^(\d+)$/
  ];

  for (const pattern of patterns) {
    const match = text.trim().match(pattern);
    if (match && match[1]) {
      const id = Number(match[1]);
      if (id > 0 && id < 100) {
        return id;
      }
    }
  }
  return null;
}

function matchesGreeting(normalized) {
  return GREETING_KEYWORDS.some((keyword) => normalized === keyword);
}

function matchesMenu(normalized) {
  return MENU_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function matchesHuman(normalized) {
  return HUMAN_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function matchesIAIntent(normalized) {
  return IA_INTENT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function matchesCatalogIntent(normalized) {
  return CATALOG_INTENT_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export async function handleIncomingMessage({ from, message }) {
  if (!socketRef) {
    throw new Error('Router não inicializado. Chame initRouter(sock) antes de processar mensagens.');
  }

  // FILTRO: Ignora grupos (segurança dupla)
  if (from.endsWith('@g.us')) {
    logger.info({ from }, '⛔ Router: Grupo detectado e ignorado');
    return;
  }

  const text = (message || '').trim();
  if (!text) {
    logger.debug({ from }, 'Mensagem vazia ignorada.');
    return;
  }

  const normalized = normalizeText(text);

  // Recupera contexto do usuário (última ação)
  const lastContext = userContexts.get(from) || 'menu';
  logger.debug({ from, lastContext, message: text }, '📍 Contexto atual');

  // 1. ATALHO GLOBAL: Detecta palavras-chave para voltar ao menu (funciona em qualquer momento)
  if (matchesMenu(normalized)) {
    userContexts.set(from, 'menu'); // Reseta contexto
    await global.sendWhatsApp(from, WELCOME_MESSAGE);
    logger.info({ from }, '🔙 Retorno ao menu solicitado.');
    return;
  }

  // 2. ATALHO GLOBAL: Detecta solicitação de atendente humano (funciona em qualquer momento)
  if (matchesHuman(normalized)) {
    userContexts.set(from, 'menu'); // Reseta contexto
    await transferToHuman(from);
    logger.info({ from }, '👤 Transferência para humano solicitada.');
    return;
  }

  // 3. Detecta "0" para voltar ao menu principal
  if (normalized === '0') {
    userContexts.set(from, 'menu'); // Reseta contexto
    await global.sendWhatsApp(from, WELCOME_MESSAGE);
    logger.info({ from }, 'Retorno ao menu principal solicitado via "0".');
    return;
  }

  // 4. Detecta saudações e envia menu inicial
  if (matchesGreeting(normalized)) {
    userContexts.set(from, 'menu'); // Define contexto como menu
    logger.info({ from, normalized }, '✅ Saudação detectada! Enviando menu...');
    await global.sendWhatsApp(from, WELCOME_MESSAGE);
    logger.info({ from }, '📋 Menu inicial enviado com sucesso!');
    return;
  }

  // 5. SE CONTEXTO = CATALOG: Números de 1-99 são IDs de produtos
  if (lastContext === 'catalog') {
    const productId = extractProductId(text);
    if (productId) {
      logger.info({ from, productId, text }, '� ID de produto detectado no contexto catálogo');
      const license = global.botLicense || null;
      if (!isModuleActive('catalogo', license)) {
        logger.warn({ from, productId }, '🔒 Tentativa de acessar produto com módulo bloqueado');
        const mensagemBloqueio = getModuleBlockedMessage('catalogo', license);
        await global.sendWhatsApp(from, mensagemBloqueio);
        return;
      }

      await sendProductById(from, productId);
      // Mantém contexto catalog para facilitar navegação entre produtos
      logger.info({ from, productId }, 'Produto específico enviado.');
      return;
    }
  }

  // 6. SE NÃO ESTÁ NO CONTEXTO CATALOG: Verifica opções do menu (1, 2, 3)
  // 7. SE NÃO ESTÁ NO CONTEXTO CATALOG: Verifica opções do menu (1, 2, 3)
  
  // Opção "1" → IA
  if (normalized === '1') {
    userContexts.set(from, 'ia'); // Define contexto IA
    // Verifica se módulo IA está ativo
    const license = global.botLicense || null;
    if (!isModuleActive('ia', license)) {
      logger.warn({ from }, '🔒 Tentativa de acessar módulo IA bloqueado');
      const mensagemBloqueio = getModuleBlockedMessage('ia', license);
      await global.sendWhatsApp(from, mensagemBloqueio);
      userContexts.set(from, 'menu'); // Volta ao menu
      return;
    }

    const iaInstructions = `Perfeito! Estou aqui para responder suas dúvidas.

💡 *Dica:* A qualquer momento você pode:
• Digite *menu* para voltar ao menu principal
• Digite *atendente* para falar com um humano

O que você gostaria de saber?`;
    
    await global.sendWhatsApp(from, iaInstructions);
    logger.info({ from }, 'Usuário direcionado para IA via opção 1.');
    return;
  }

  // 8. Opção "2" → Catálogo
  if (normalized === '2') {
    userContexts.set(from, 'catalog'); // Define contexto catálogo
    // Verifica se módulo está ativo
    const license = global.botLicense || null;
    if (!isModuleActive('catalogo', license)) {
      logger.warn({ from }, '🔒 Tentativa de acessar módulo Catálogo bloqueado');
      const mensagemBloqueio = getModuleBlockedMessage('catalogo', license);
      await global.sendWhatsApp(from, mensagemBloqueio);
      userContexts.set(from, 'menu'); // Volta ao menu
      return;
    }

    await sendCatalogMenu(from);
    logger.info({ from }, 'Catálogo enviado via opção 2.');
    return;
  }

  // 9. Opção "3" → Atendente humano
  if (normalized === '3') {
    userContexts.set(from, 'menu'); // Reseta contexto
    await transferToHuman(from);
    return;
  }

  // 10. Detecta frases relacionadas a dúvidas → IA
  if (matchesIAIntent(normalized)) {
    userContexts.set(from, 'ia'); // Define contexto IA
    // Verifica se módulo IA está ativo
    const license = global.botLicense || null;
    if (!isModuleActive('ia', license)) {
      logger.warn({ from }, '🔒 Tentativa de acessar IA por intent bloqueado');
      const mensagemBloqueio = getModuleBlockedMessage('ia', license);
      await global.sendWhatsApp(from, mensagemBloqueio);
      userContexts.set(from, 'menu'); // Volta ao menu
      return;
    }

    await handleIA(text, from);
    logger.info({ from }, 'Pergunta direcionada automaticamente para IA.');
    return;
  }

  // 10. Detecta frases relacionadas ao catálogo
  if (matchesCatalogIntent(normalized)) {
    userContexts.set(from, 'catalog'); // Define contexto catálogo
    // Verifica se módulo está ativo
    const license = global.botLicense || null;
    if (!isModuleActive('catalogo', license)) {
      logger.warn({ from }, '🔒 Tentativa de acessar catálogo por intent bloqueado');
      const mensagemBloqueio = getModuleBlockedMessage('catalogo', license);
      await global.sendWhatsApp(from, mensagemBloqueio);
      userContexts.set(from, 'menu'); // Volta ao menu
      return;
    }

    await sendCatalogMenu(from);
    logger.info({ from }, 'Catálogo enviado por detecção de intent.');
    return;
  }

  // 12. Fallback: envia para IA se não corresponder a nenhum fluxo
  const license = global.botLicense || null;
  if (!isModuleActive('ia', license)) {
    logger.warn({ from }, '🔒 Fallback para IA bloqueado - enviando para atendente');
    userContexts.set(from, 'menu'); // Reseta contexto
    await global.sendWhatsApp(from, `⚠️ Desculpe, não entendi sua mensagem.

Digite *menu* para ver as opções disponíveis ou *atendente* para falar com um humano.`);
    return;
  }

  userContexts.set(from, 'ia'); // Define contexto IA
  await handleIA(text, from);
  logger.info({ from }, 'Mensagem enviada para IA como fallback.');
}
