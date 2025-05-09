require('dotenv').config();
const fetch = require('node-fetch');

const ARGELOR_URL = process.env.PROVIDER_ARGELOR_URL || 'http://localhost:3002';

async function createReport(data) {
  const body = {
    site: data.obra_id,
    reportDate: data.data,
    weather: data.clima,
    summary: data.descricao,
    workers: data.equipe
  };

  const response = await fetch(`${ARGELOR_URL}/daily-reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ArgelorProvider create failed: ${response.status} ${errText}`);
  }

  const json = await response.json();
  return {
    id: json.report_id,
    status: json.state,
    createdAt: json.created
  };
}

async function getReport(id) {
  const response = await fetch(`${ARGELOR_URL}/daily-reports/${id}`);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ArgelorProvider get failed: ${response.status} ${errText}`);
  }

  return await response.json();
}

async function updateReport(id, data) {
  const body = {
    site: data.obra_id,
    reportDate: data.data,
    weather: data.clima,
    summary: data.descricao,
    workers: data.equipe
  };

  const response = await fetch(`${ARGELOR_URL}/daily-reports/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`ArgelorProvider update failed: ${response.status} ${errText}`);
  }

  return await response.json();
}

module.exports = {
  createReport,
  getReport,
  updateReport
};
