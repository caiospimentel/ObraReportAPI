const fs = require('fs');
const path = require('path');

const logFile = path.resolve(__dirname, '../../logs.txt');

function writeLog(level, message, error = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] [${level}] ${message}\n`;

  if (error && error.stack) {
    logMessage += `[STACK] ${error.stack}\n`;
  }

  fs.appendFile(logFile, logMessage, err => {
    if (err) {
      console.error('Erro ao gravar no log:', err);
    }
  });
}

module.exports = {
  info: (msg) => writeLog('INFO', msg),
  error: (msg, err = null) => writeLog('ERROR', msg, err),
};
