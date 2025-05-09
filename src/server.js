require('dotenv').config();
const express = require('express');
const cors = require('cors');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas 
app.use('/reports', reportsRouter);

// Middleware de erro simples
app.use((err, req, res, next) => {
  console.error('[ERROR]', err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`ObraReport API rodando na porta ${PORT}`);
});