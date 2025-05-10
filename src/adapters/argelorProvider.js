require('dotenv').config();
const fetch = require('node-fetch');

const ARGELOR_URL = process.env.PROVIDER_ARGELOR_URL || 'http://localhost:3002';

async function createReport(data, headers = {}) {
  if (headers['x-fail'] === 'true') {
    throw new Error('Simulated failure in ArgelorProvider');
  }

  const response = await fetch(`${ARGELOR_URL}/daily-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site: data.obra_id,
      reportDate: data.data,
      weather: data.clima,
      summary: data.descricao,
      workers: data.equipe
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ArgelorProvider create failed: ${response.status} ${errText}`);
  }

  //mapping dos campos para padronizar
  const json = await response.json();
  return {
    id: json.report_id,
    status: json.state,
    createdAt: json.created
  };
}

async function updateReport(data, headers = {}) {
  if (headers['x-fail'] === 'true') {
    throw new Error('Simulated failure in ArgelorProvider');
  }

  const response = await fetch(`${ARGELOR_URL}/daily-reports/${data.externalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      site: data.obra_id,
      reportDate: data.data,
      weather: data.clima,
      summary: data.descricao,
      workers: data.equipe
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ArgelorProvider update failed: ${response.status} ${errText}`);
  }

  return await response.json();

}

async function getReport(id) {
  const response = await fetch(`${ARGELOR_URL}/daily-reports/${id}`);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ArgelorProvider get failed: ${response.status} ${errText}`);
  }

  return await response.json();
}

module.exports = {
  createReport,
  updateReport,
  getReport
};
