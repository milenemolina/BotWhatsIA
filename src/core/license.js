/**
 * Sistema de Verificação de Licenças
 * Controla ativação/desativação de módulos
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho para o arquivo de licença
const LICENSE_PATH = path.join(__dirname, '../../license.json');

/**
 * Carrega e valida a licença
 * @returns {Object} Objeto com dados da licença e módulos ativos
 */
export function loadLicense() {
  try {
    // Verifica se arquivo existe
    if (!fs.existsSync(LICENSE_PATH)) {
      logger.warn('⚠️ Arquivo license.json não encontrado. Usando modo DEMO.');
      return createDemoLicense();
    }

    // Lê o arquivo
    const licenseData = fs.readFileSync(LICENSE_PATH, 'utf-8');
    const license = JSON.parse(licenseData);

    // Valida estrutura básica
    if (!license.licenca || !license.modulos) {
      logger.error('❌ Estrutura de license.json inválida!');
      return createDemoLicense();
    }

    logger.info('✅ Licença carregada com sucesso');
    return license;

  } catch (error) {
    logger.error('❌ Erro ao carregar licença:', error.message);
    return createDemoLicense();
  }
}

/**
 * Verifica se a licença está válida
 * @param {Object} license - Dados da licença
 * @returns {Object} { valida: boolean, motivo: string }
 */
export function validateLicense(license) {
  const { licenca } = license;

  // Verifica tipo de licença
  if (licenca.tipo === 'demo') {
    return {
      valida: true,
      motivo: 'Modo DEMO - Apenas módulos base disponíveis',
      limitacoes: ['Apenas IA e Catálogo ativos', 'Para ativar mais módulos, adquira uma licença']
    };
  }

  // Verifica expiração (se tiver)
  if (licenca.expiracao && licenca.expiracao !== 'vitalicia') {
    const dataExpiracao = new Date(licenca.expiracao);
    const hoje = new Date();

    if (hoje > dataExpiracao) {
      return {
        valida: false,
        motivo: `Licença EXPIRADA em ${dataExpiracao.toLocaleDateString('pt-BR')}`,
        limitacoes: ['Apenas módulos base continuarão funcionando']
      };
    }
  }

  // Verifica chave (formato básico)
  if (!licenca.chave || licenca.chave === 'DEMO-2024') {
    return {
      valida: true,
      motivo: 'Chave demo detectada',
      limitacoes: ['Funcionalidade limitada aos módulos base']
    };
  }

  return {
    valida: true,
    motivo: 'Licença válida',
    limitacoes: []
  };
}

/**
 * Retorna lista de módulos ativos
 * @param {Object} license - Dados da licença
 * @returns {Array} Array com IDs dos módulos ativos
 */
export function getActiveModules(license) {
  if (!license || !license.modulos) {
    return ['catalogo']; // Apenas catálogo é base (gratuito)
  }

  // Se modulos é objeto, converte para array
  const modulosArray = Array.isArray(license.modulos) 
    ? license.modulos 
    : Object.keys(license.modulos).map(id => ({ id, ...license.modulos[id] }));

  return modulosArray
    .filter(modulo => modulo.ativo === true)
    .map(modulo => modulo.id);
}

/**
 * Verifica se um módulo específico está ativo
 * @param {String} moduleId - ID do módulo (ex: 'ia', 'catalogo', 'agendamento')
 * @param {Object} license - Dados da licença
 * @returns {Boolean}
 */
export function isModuleActive(moduleId, license) {
  if (!license || !license.modulos) {
    // Se não tem licença, apenas catálogo é base (gratuito)
    return ['catalogo'].includes(moduleId);
  }

  // Suporta tanto array quanto objeto
  let modulo;
  if (Array.isArray(license.modulos)) {
    modulo = license.modulos.find(m => m.id === moduleId);
  } else {
    modulo = license.modulos[moduleId];
  }
  
  if (!modulo) {
    logger.warn(`⚠️ Módulo "${moduleId}" não encontrado na licença`);
    return false;
  }

  return modulo.ativo === true;
}

/**
 * Retorna informações sobre um módulo
 * @param {String} moduleId - ID do módulo
 * @param {Object} license - Dados da licença
 * @returns {Object|null}
 */
export function getModuleInfo(moduleId, license) {
  if (!license || !license.modulos) {
    return null;
  }

  // Suporta tanto array quanto objeto
  if (Array.isArray(license.modulos)) {
    return license.modulos.find(m => m.id === moduleId) || null;
  } else {
    const modulo = license.modulos[moduleId];
    return modulo ? { id: moduleId, ...modulo } : null;
  }
}

/**
 * Exibe resumo da licença no console
 * @param {Object} license - Dados da licença
 */
export function displayLicenseInfo(license) {
  const validacao = validateLicense(license);
  const modulosAtivos = getActiveModules(license);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📜 INFORMAÇÕES DA LICENÇA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // Tipo de licença
  const tipo = license.licenca.tipo.toUpperCase();
  const emoji = tipo === 'DEMO' ? '🆓' : tipo === 'VITALICIA' ? '💎' : '⏰';
  console.log(`${emoji} Tipo: ${tipo}`);
  
  // Cliente (se tiver)
  if (license.licenca.cliente?.nome) {
    console.log(`👤 Cliente: ${license.licenca.cliente.nome}`);
  }
  
  // Validade
  if (validacao.valida) {
    console.log(`✅ Status: ${validacao.motivo}`);
  } else {
    console.log(`❌ Status: ${validacao.motivo}`);
  }

  // Módulos ativos
  console.log(`\n📦 Módulos Ativos (${modulosAtivos.length}):`);
  modulosAtivos.forEach(id => {
    const info = getModuleInfo(id, license);
    if (info) {
      console.log(`   ✓ ${info.nome} (v${info.versao})`);
    }
  });

  // Módulos inativos que requerem pagamento
  const modulosArray = Array.isArray(license.modulos)
    ? license.modulos
    : Object.keys(license.modulos).map(id => ({ id, ...license.modulos[id] }));

  const modulosInativos = modulosArray
    .filter(m => !m.ativo && m.requer_pagamento);
  
  if (modulosInativos.length > 0) {
    console.log(`\n🔒 Módulos Disponíveis para Compra (${modulosInativos.length}):`);
    modulosInativos.forEach(m => {
      console.log(`   ✗ ${m.nome} - ${m.descricao}`);
    });
    console.log('\n💡 Para ativar módulos extras, visite: [SEU_SITE_DE_VENDAS]');
  }

  // Limitações
  if (validacao.limitacoes && validacao.limitacoes.length > 0) {
    console.log('\n⚠️ Limitações:');
    validacao.limitacoes.forEach(l => console.log(`   • ${l}`));
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Cria uma licença demo padrão
 * @returns {Object}
 */
function createDemoLicense() {
  return {
    licenca: {
      chave: 'DEMO-2024',
      tipo: 'demo',
      expiracao: 'vitalicia',
      cliente: {
        nome: 'Usuário Demo',
        email: '',
        cnpj: ''
      }
    },
    modulos: {
      catalogo: {
        ativo: true,
        nome: 'Catálogo de Produtos',
        descricao: 'Exibição de produtos com imagens e preços',
        versao: '1.0.0',
        requer_pagamento: false
      },
      ia: {
        ativo: false,
        nome: 'Chatbot IA',
        descricao: 'Assistente com Inteligência Artificial (GPT-4 ou Llama 3.1)',
        versao: '1.0.0',
        requer_pagamento: true
      },
      agendamento: {
        ativo: false,
        nome: 'Agendamento de Serviços',
        descricao: 'Sistema de agendamento automático',
        versao: '1.0.0',
        requer_pagamento: true
      }
    },
    configuracoes: {
      verificar_licenca_ao_iniciar: true,
      enviar_analytics: false
    }
  };
}

/**
 * Mensagem de módulo inativo/bloqueado
 * @param {String} moduleId - ID do módulo
 * @param {Object} license - Dados da licença
 * @returns {String}
 */
export function getModuleBlockedMessage(moduleId, license) {
  const info = getModuleInfo(moduleId, license);
  
  if (!info) {
    logger.warn(`getModuleBlockedMessage: módulo "${moduleId}" não encontrado na licença`);
    return `⚠️ *Módulo Indisponível*

Este módulo não está disponível nesta versão.

*💰 ADQUIRA AGORA:*
🛒 https://seu-link-de-vendas.com

*💬 DÚVIDAS?*
📱 WhatsApp: https://wa.me/5511999999999
📧 Email: contato@seuemail.com`;
  }

  return `🔒 *Módulo Bloqueado*

📦 *${info.nome}*
${info.descricao}

💡 Este módulo requer ativação.

*💰 ADQUIRA AGORA:*
🛒 https://seu-link-de-vendas.com/modulo-${moduleId}

*💬 DÚVIDAS?*
📱 WhatsApp: https://wa.me/5511999999999
📧 Email: contato@seuemail.com

*✨ Após a compra você receberá:*
✅ Código completo do módulo
✅ Instruções de instalação
✅ Suporte por 30 dias`;
}

// Exporta tudo de uma vez
export default {
  loadLicense,
  validateLicense,
  getActiveModules,
  isModuleActive,
  getModuleInfo,
  displayLicenseInfo,
  getModuleBlockedMessage
};
