const reportService = require('../services/reportService');

async function createReport(req, res, next) {
  try {
    const reportData = req.body;
    const result = await reportService.createReport(reportData);
    res.status(201).json(result);
  } catch (error) {
    console.error('Erro ao criar relatório:', error.message);
    next(error);
  }
}

async function getReport(req, res, next) {
  try {
    const localId = req.params.id;
    const report = await reportService.getReport(localId);
    if (!report) return res.status(404).json({ error: 'Relatório não encontrado' });
    res.json(report);
  } catch (error) {
    console.error('Erro ao buscar relatório:', error.message);
    next(error);
  }
}

async function updateReport(req, res, next) {
  try {
    const localId = req.params.id;
    const updatedData = req.body;
    const updated = await reportService.updateReport(localId, updatedData);
    res.json(updated);
  } catch (error) {
    console.error('Erro ao atualizar relatório:', error.message);
    next(error);
  }
}

module.exports = {
  createReport,
  getReport,
  updateReport
};
