import logger from '../../utils/logger.js';
import { getAllProducts, getProductById, formatCurrency } from './catalogService.js';

function assertSendFunction() {
  if (typeof global.sendWhatsApp !== 'function') {
    throw new Error('Função global sendWhatsApp não configurada.');
  }
}

function buildMenuMessage(products) {
  const header = '📦 *Catálogo de Produtos*\n';
  const productList = products
    .map((product) => {
      const price = formatCurrency(product.preco);
      const stars = '⭐'.repeat(Math.floor(product.nota || 5));
      const reviews = product.avaliacoes ? ` (${product.avaliacoes} avaliações)` : '';
      return `${product.id}. *${product.nome}* - ${price}\n   ${stars}${reviews}`;
    })
    .join('\n\n');
  const footer = '\n\nDigite o número do produto para ver detalhes.';

  return `${header}\n${productList}${footer}`;
}

export async function sendCatalogMenu(chatId) {
  assertSendFunction();
  const products = await getAllProducts();

  if (products.length === 0) {
    await global.sendWhatsApp(
      chatId,
      'Não há produtos cadastrados no momento. Por favor, tente novamente mais tarde.'
    );
    logger.warn({ chatId }, 'Catálogo vazio solicitado.');
    return;
  }

  const message = buildMenuMessage(products);
  await global.sendWhatsApp(chatId, message);
  logger.info({ chatId }, 'Menu do catálogo enviado.');
}

export async function sendProductById(chatId, id) {
  assertSendFunction();
  const product = await getProductById(id);

  if (!product) {
    await global.sendWhatsApp(
      chatId,
      '❌ Produto não encontrado.\n\nDigite *2* para ver o catálogo completo ou *menu* para voltar.'
    );
    logger.warn({ chatId, id }, 'Produto não encontrado.');
    return;
  }

  // Formata o preço
  const price = formatCurrency(product.preco);
  const priceOriginal = product.preco_original ? formatCurrency(product.preco_original) : null;
  
  // Calcula desconto se houver preço original
  let discount = '';
  if (priceOriginal) {
    const percentOff = Math.round(((product.preco_original - product.preco) / product.preco_original) * 100);
    discount = `\n~~${priceOriginal}~~ 🔥 *${percentOff}% OFF*`;
  }

  // Monta avaliações
  const stars = product.nota ? '⭐'.repeat(Math.floor(product.nota)) : '⭐⭐⭐⭐⭐';
  const rating = product.nota ? ` ${product.nota}/5` : '';
  const reviews = product.avaliacoes ? ` • ${product.avaliacoes} avaliações` : '';
  
  // Estoque
  const stockStatus = product.estoque > 10 
    ? `✅ *Em estoque* (${product.estoque} unidades)`
    : product.estoque > 0 
      ? `⚠️ *Últimas unidades!* (${product.estoque} restantes)`
      : '❌ *Esgotado*';

  // Variações
  let variations = '';
  if (product.tamanhos && product.tamanhos.length > 0) {
    variations += `\n📏 *Tamanhos:* ${product.tamanhos.join(', ')}`;
  }
  if (product.cores && product.cores.length > 0) {
    variations += `\n🎨 *Cores:* ${product.cores.join(', ')}`;
  }

  // Descrição completa ou básica
  const description = product.descricao_completa || product.descricao;

  // Monta mensagem final
  const message = `*${product.nome}*
${product.marca ? `🏷️ *${product.marca}*\n` : ''}
${stars}${rating}${reviews}

${description}

💰 *Preço:* ${price}${discount}

${stockStatus}${variations}

━━━━━━━━━━━━━━━━━━━━━
📦 Digite *2* para ver mais produtos
🏠 Digite *menu* para voltar ao início`;

  // Envia com imagem principal
  if (product.img) {
    await global.sendWhatsApp(chatId, message, { image: { url: product.img } });
  } else {
    await global.sendWhatsApp(chatId, message);
  }

  // Se tiver imagens adicionais, envia também
  if (product.imagens_detalhes && product.imagens_detalhes.length > 0) {
    for (const imgUrl of product.imagens_detalhes.slice(0, 2)) { // Limita a 2 imagens extras
      await global.sendWhatsApp(chatId, '📸 Mais detalhes:', { image: { url: imgUrl } });
      // Pequeno delay para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  logger.info({ chatId, productId: id }, 'Detalhes do produto enviados.');
}
