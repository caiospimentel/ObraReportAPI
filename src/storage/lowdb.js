const fs = require('fs');
const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const dbPath = path.resolve(__dirname, 'db.json');


if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ reports: [] }, null, 2));
}

const adapter = new FileSync(dbPath);
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
