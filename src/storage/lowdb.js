const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const file = path.resolve(__dirname, '../../db/db.json');
const adapter = new JSONFile(file);

const db = new Low(adapter, { reports: [] }); 

module.exports = {
  async saveMapping(mapping) {
    await db.read();
    db.data.reports.push(mapping);
    await db.write();
  },

  async getMappingById(localId) {
    await db.read();
    return db.data.reports.find(r => r.id === localId);
  }
};
