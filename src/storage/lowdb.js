const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const file = path.resolve(__dirname, '../../db/db.json');
const adapter = new FileSync(file);
const db = low(adapter);

db.defaults({ reports: [] }).write();

module.exports = {
  saveMapping(mapping) {
    db.get('reports').push(mapping).write();
  },

  getMappingById(localId) {
    return db.get('reports').find({ id: localId }).value();
  }
};
