const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  obra_id: String,
  data: String,
  clima: String,
  descricao: String,
  equipe: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);