const { generateId } = require('../utils/idGenerator');
const logger = require('../utils/logger');

const ReportRegistry = require('../storage/lowdb');

const VateProvider = require('../adapters/vateProvider');
const ArgelorProvider = require('../adapters/argelorProvider');

const providerMap = {
  vate: VateProvider,
  argelor: ArgelorProvider
};

async function createReport(data) {
  const localId = generateId();
  const primaryName = process.env.PRIMARY_PROVIDER || 'vate';
  const secondaryName = process.env.SECONDARY_PROVIDER || 'argelor';

  const primary = providerMap[primaryName];
  const secondary = providerMap[secondaryName];

  let response, providerUsed;

  logger.info(`Iniciando criação de relatório para obra_id: ${data.obra_id} usando o provedor primário "${primaryName}".`);

  try {
    response = await primary.createReport(data);
    providerUsed = primaryName;
    logger.info(`Relatório criado com sucesso usando o provedor primário "${primaryName}".`);
  } catch (e) {
    logger.error(`Falha ao criar relatório com o provedor primário "${primaryName}".`, e);
    logger.info(`Tentando fallback com provedor "${secondaryName}".`);

    try {
      response = await secondary.createReport(data);
      providerUsed = secondaryName;
      logger.info(`Relatório criado com sucesso usando o fallback "${secondaryName}".`);
    } catch (err) {
      logger.error(`Falha também com o fallback "${secondaryName}". Nenhum provedor disponível.`, err);
      throw new Error('Nenhum provedor disponível no momento.');
    }
  }

  const externalId = response.id || response.report_id;
  const mapping = {
    id: localId,
    provider: providerUsed,
    externalId: externalId,
    createdAt: new Date().toISOString()
  };

  try {
    await ReportRegistry.saveMapping(mapping);
    logger.info(`Mapeamento salvo: localId=${localId}, provider=${providerUsed}, externalId=${externalId}`);
  } catch (e) {
    logger.error('Erro ao salvar o mapeamento do relatório.', e);
    throw new Error('Erro ao salvar o relatório localmente.');
  }

  return {
    localId,
    externalId,
    provider: providerUsed
  };
}

async function getReport(localId) {
  logger.info(`Solicitada busca de relatório com localId: ${localId}`);
  const mapping = await ReportRegistry.getMappingById(localId);

  if (!mapping) {
    logger.info(`Relatório com localId ${localId} não encontrado.`);
    return null;
  }

  const provider = providerMap[mapping.provider];
  logger.info(`Buscando relatório no provedor "${mapping.provider}" com externalId: ${mapping.externalId}`);
  return await provider.getReport(mapping.externalId);
}

async function updateReport(localId, newData) {
  logger.info(`Solicitada atualização de relatório com localId: ${localId}`);
  const mapping = await ReportRegistry.getMappingById(localId);

  if (!mapping) {
    logger.info(`Relatório com localId ${localId} não encontrado para atualização.`);
    throw new Error('Relatório não encontrado.');
  }

  const provider = providerMap[mapping.provider];
  logger.info(`Atualizando relatório no provedor "${mapping.provider}" com externalId: ${mapping.externalId}`);
  return await provider.updateReport(mapping.externalId, newData);
}

module.exports = {
  createReport,
  getReport,
  updateReport
};
