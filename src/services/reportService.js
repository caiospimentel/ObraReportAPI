const { generateId } = require('../utils/idGenerator');
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

  try {
    response = await primary.createReport(data);
    providerUsed = primaryName;
  } catch(e){
    console.log(e.message)
    console.warn(`Provedor primário "${primaryName}" falhou. Tentando fallback...`);
    try {
      response = await secondary.createReport(data);
      providerUsed = secondaryName;
    } catch(err) {
      console.log(err.message)
      throw new Error('Nenhum provedor disponível no momento.');
    }
  }

  const mapping = {
    id: localId,
    provider: providerUsed,
    externalId: response.id || response.report_id,
    createdAt: new Date().toISOString()
  };

  await ReportRegistry.saveMapping(mapping);

  return {
    localId,
    externalId: mapping.externalId,
    provider: providerUsed
  };
}

async function getReport(localId) {
  const mapping = await ReportRegistry.getMappingById(localId);
  if (!mapping) return null;

  const provider = providerMap[mapping.provider];
  return await provider.getReport(mapping.externalId);
}

async function updateReport(localId, newData) {
  const mapping = await ReportRegistry.getMappingById(localId);
  if (!mapping) throw new Error('Relatório não encontrado.');

  const provider = providerMap[mapping.provider];
  return await provider.updateReport(mapping.externalId, newData);
}

module.exports = {
  createReport,
  getReport,
  updateReport
};
