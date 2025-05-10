const { generateId } = require('../utils/idGenerator');
const logger = require('../utils/logger');
const ReportRegistry = require('../storage/lowdb');

const VateProvider = require('../adapters/vateProvider');
const ArgelorProvider = require('../adapters/argelorProvider');

const providerMap = {
  vate: VateProvider,
  argelor: ArgelorProvider
};

async function tryWithFallback(actionName, data, primary, secondary, headers) {
  try {
    return {
      response: await primary[actionName](data, headers),
      providerUsed: primary.name
    };
  } catch (e) {
    logger.info(`Provedor primário "${primary.name}" falhou: ${e.message}`);
    try {
      return {
        //limpar os headers para parar de simular falha
        response: await secondary[actionName](data, {}),
        providerUsed: secondary.name
      };
    } catch (err) {
      logger.error(`Fallback "${secondary.name}" também falhou.`, err);
      throw new Error('Nenhum provedor disponível no momento.');
    }
  }
}

async function createReport(data, options = {}) {
  const localId = generateId();
  const headers = options.headers || {};

  const primaryName = process.env.PRIMARY_PROVIDER || 'vate';
  const secondaryName = process.env.SECONDARY_PROVIDER || 'argelor';

  const primary = { ...providerMap[primaryName], name: primaryName };
  const secondary = { ...providerMap[secondaryName], name: secondaryName };

  logger.info(`Criando relatório com provedor primário "${primary.name}"`);

  const { response, providerUsed } = await tryWithFallback('createReport', data, primary, secondary, headers);

  const externalId = response.id || response.report_id;
  const mapping = {
    id: localId,
    provider: providerUsed,
    externalId: externalId,
    createdAt: new Date().toISOString()
  };

  await ReportRegistry.saveMapping(mapping);

  return {
    localId,
    externalId,
    provider: providerUsed
  };
}

async function getReport(localId) {
  const mapping = await ReportRegistry.getMappingById(localId);
  if (!mapping) return null;

  const provider = providerMap[mapping.provider];
  return await provider.getReport(mapping.externalId);
}

async function updateReport(localId, newData, options = {}) {
  const headers = options.headers || {};
  const mapping = await ReportRegistry.getMappingById(localId);

  if (!mapping) throw new Error('Relatório não encontrado.');

  const primary = { ...providerMap[mapping.provider], name: mapping.provider };
  const fallbackName = Object.keys(providerMap).find(p => p !== mapping.provider);
  const secondary = { ...providerMap[fallbackName], name: fallbackName };

  const { response } = await tryWithFallback('updateReport', {
    ...newData,
    externalId: mapping.externalId
  }, primary, secondary, headers);

  return response;
}

module.exports = {
  createReport,
  getReport,
  updateReport
};
