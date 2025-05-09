const request = require('supertest');
const express = require('express');
const reportsRouter = require('../../routes/reports');

const app = express();
app.use(express.json());
app.use('/reports', reportsRouter);

describe('ObraReport API - Integração completa', () => {
  let localId = null;

  // Teste de criação do relatório (POST)
  it('POST /reports - deve criar um novo RDO', async () => {
    const res = await request(app)
      .post('/reports')
      .send({
        obra_id: 'OBRA-TESTE',
        data: '2025-05-10',
        clima: 'ensolarado',
        descricao: 'Fundação finalizada',
        equipe: ['Maria', 'Carlos']
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('localId');
    expect(res.body).toHaveProperty('externalId');
    expect(res.body).toHaveProperty('provider');

    localId = res.body.localId;
  });

  // Teste de recuperação do relatório (GET)
  it('GET /reports/:id - deve recuperar o RDO criado', async () => {
    const res = await request(app).get(`/reports/${localId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('descricao');
    expect(res.body.descricao).toMatch(/Fundação finalizada/);
  });

  // Teste de edição do relatório (PUT)
  it('PUT /reports/:id - deve atualizar o RDO com novos dados', async () => {
    const res = await request(app)
      .put(`/reports/${localId}`)
      .send({
        obra_id: 'OBRA-TESTE',
        data: '2025-05-11',
        clima: 'nublado',
        descricao: 'Cobertura iniciada',
        equipe: ['Maria', 'Carlos', 'João']
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status');
  });
});
