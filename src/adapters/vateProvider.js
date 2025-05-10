require('dotenv').config();
const fetch = require('node-fetch');

const VATE_URL = process.env.PROVIDER_VATE_URL || 'http://localhost:3001';

async function createReport(data, headers = {}) {

  if (headers['x-fail'] === 'true') {
    throw new Error('Simulated failure in VateProvider');
  }

  const body = {
    obra_id: data.obra_id,
    data: data.data,
    clima: data.clima,
    descricao: data.descricao,
    equipe: data.equipe
  };

  const response = await fetch(`${VATE_URL}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`VateProvider create failed: ${response.status} ${errText}`);
  }

  const json = await response.json();
  return {
    id: json.id,
    status: json.status,
    createdAt: json.createdAt
  };
}

async function getReport(id) {
  const response = await fetch(`${VATE_URL}/reports/${id}`);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`VateProvider get failed: ${response.status} ${errText}`);
  }

  return await response.json();
}

async function updateReport(data, headers = {}) {
  if (headers['x-fail'] === 'true') {
    throw new Error('Simulated failure in VateProvider');
  }

  const response = await fetch(`${VATE_URL}/reports/${data.externalId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      obra_id: data.obra_id,
      data: data.data,
      clima: data.clima,
      descricao: data.descricao,
      equipe: data.equipe
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`VateProvider update failed: ${response.status} ${errText}`);
  }

  return await response.json();
}

module.exports = {
  createReport,
  getReport,
  updateReport
};
