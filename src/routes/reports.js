const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');

// Criar novo RDO
router.post('/', ReportController.createReport);

// Recuperar RDO pelo localId
router.get('/:id', ReportController.getReport);

// Editar um RDO existente
router.put('/:id', ReportController.updateReport);

module.exports = router;
