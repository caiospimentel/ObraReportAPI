const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  site: String,
  reportDate: String,
  weather: String,
  summary: String,
  workers: [String],
  created: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
