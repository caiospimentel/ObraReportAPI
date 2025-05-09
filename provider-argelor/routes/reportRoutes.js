const express = require('express');
const router = express.Router();
const Report = require('../models/report');

function shouldFail(req) {
  return req.query.fail === 'true' || req.headers['x-fail'] === 'true';
}

// POST /daily-reports
router.post('/', async (req, res) => {
  if (shouldFail(req)) return res.status(500).json({ error: 'Falha simulada' });

  const newReport = await Report.create(req.body);
  res.status(201).json({
    report_id: newReport._id,
    created: newReport.created,
    state: 'saved'
  });
});

// PUT /daily-reports/:id
router.put('/:id', async (req, res) => {
  if (shouldFail(req)) return res.status(500).json({ error: 'Falha simulada' });

  await Report.findByIdAndUpdate(req.params.id, req.body);
  res.json({
    report_id: req.params.id,
    state: 'updated'
  });
});

// GET /daily-reports/:id
router.get('/:id', async (req, res) => {
  const report = await Report.findById(req.params.id);
  if (!report) return res.status(404).json({ error: 'Relatório não encontrado' });
  res.json(report);
});

module.exports = router;
