const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const connectWithRetry = require('./mongo/connection');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/reports', reportRoutes);

connectWithRetry().then(() => {
    app.listen(PORT, () => {
      console.log(`Provedor Vate rodando na porta ${PORT}`);
    });
  });
