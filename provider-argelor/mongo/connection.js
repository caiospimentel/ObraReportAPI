const mongoose = require('mongoose');

const MAX_RETRIES = 5;
const RETRY_INTERVAL = 3000;

async function connectWithRetry() {
  const mongoUrl = process.env.MONGO_URI || 'mongodb://localhost:27017/argelor-db';

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log('Iniciando conexão com MongoDB (Argelor)');
    try {
      await mongoose.connect(mongoUrl);
      console.log('MongoDB conectado com sucesso (Argelor)');
      return; // sucesso!
    } catch (err) {
      console.error(`Erro na conexão (tentativa ${attempt}):`, err.message);
      if (attempt < MAX_RETRIES) {
        console.log(`Tentando novamente em ${RETRY_INTERVAL / 1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      } else {
        console.error('Número máximo de tentativas atingido. Abortando.');
        process.exit(1);
      }
    }
  }
}

module.exports = connectWithRetry;
