const crypto = require('crypto');

function generateId(prefix = 'rdo') {
  return `${prefix}-${crypto.randomUUID()}`;
}

module.exports = {
  generateId
};
