const express = require('express');
const router = express.Router();
const Report = require('../models/report');

// Simula falha
function shouldFail(req) {
  return req.query.fail === 'true' || req.headers['x-fail'] === 'true';
}

// POST /reports
router.post('/', async (req, res) => {
  if (shouldFail(req)) return res.status(500).json({ error: 'Falha simulada' });

  const newReport = await Report.create(req.body);
  res.status(201).json({
    id: newReport._id,
    createdAt: newReport.createdAt,
    status: 'registrado'
  });
});

// PUT /reports/:id
router.put('/:id', async (req, res) => {
  if (shouldFail(req)) return res.status(500).json({ error: 'Falha simulada' });

  await Report.findByIdAndUpdate(req.params.id, req.body);
  res.json({
    id: req.params.id,
    status: 'atualizado'
  });
});

// GET /reports/:id
router.get('/:id', async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Relatório não encontrado' });
  res.json(report);
});

module.exports = router;
