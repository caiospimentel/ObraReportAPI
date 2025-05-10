const nock = require('nock');
const ArgelorProvider = require('../../adapters/argelorProvider');

const BASE_URL = 'http://localhost:3002';

describe('ArgelorProvider', () => {
  const reportData = {
    obra_id: 'OBRA-123',
    data: '2025-05-10',
    clima: 'ensolarado',
    descricao: 'Teste Argelor',
    equipe: ['A', 'B']
  };

  afterEach(() => {
    nock.cleanAll();
  });

  it('createReport - envia corretamente e retorna dados esperados', async () => {
    const responseMock = {
      report_id: 'xyz456',
      created: '2025-05-10T00:00:00Z',
      state: 'saved'
    };

    let bodyRecebido = null;

    nock(BASE_URL)
      .post('/daily-reports', (body) => {
        bodyRecebido = body;
        return true;
      })
      .reply(201, responseMock);

    const result = await ArgelorProvider.createReport(reportData);

    expect(bodyRecebido).toEqual({
      site: 'OBRA-123',
      reportDate: '2025-05-10',
      weather: 'ensolarado',
      summary: 'Teste Argelor',
      workers: ['A', 'B']
    });

    expect(result).toEqual({
      id: 'xyz456',
      createdAt: responseMock.created,
      status: 'saved'
    });
  });

  it('createReport - lança erro se status não for 201', async () => {
    nock(BASE_URL)
      .post('/daily-reports')
      .reply(500, 'Erro interno');

    await expect(ArgelorProvider.createReport(reportData)).rejects.toThrow('ArgelorProvider create failed');
  });

  it('getReport - retorna JSON do relatório existente', async () => {
    const reportId = 'xyz456';
    const reportMock = { summary: 'relatório original' };

    nock(BASE_URL)
      .get(`/daily-reports/${reportId}`)
      .reply(200, reportMock);

    const result = await ArgelorProvider.getReport(reportId);
    expect(result).toEqual(reportMock);
  });

  it('getReport - lança erro se status não for 200', async () => {
    const reportId = 'xyz999';

    nock(BASE_URL)
      .get(`/daily-reports/${reportId}`)
      .reply(404, 'Não encontrado');

    await expect(ArgelorProvider.getReport(reportId)).rejects.toThrow('ArgelorProvider get failed');
  });

  it('updateReport - atualiza e retorna status esperado', async () => {
    const reportId = 'xyz456';
    const updatedData = {
      ...reportData,
      descricao: 'atualizado',
      externalId: reportId
    };
    const updateResponse = { report_id: reportId, state: 'updated' };

    let updateBody = null;

    nock(BASE_URL)
      .put(`/daily-reports/${reportId}`, (body) => {
        updateBody = body;
        return true;
      })
      .reply(200, updateResponse);

    const result = await ArgelorProvider.updateReport(updatedData);

    expect(updateBody).toEqual({
      site: 'OBRA-123',
      reportDate: '2025-05-10',
      weather: 'ensolarado',
      summary: 'atualizado',
      workers: ['A', 'B']
    });

    expect(result).toEqual(updateResponse);
  });

  it('updateReport - lança erro se status não for 200', async () => {
    const reportId = 'xyz456';
    const updatedData = {
      ...reportData,
      descricao: 'erro',
      externalId: reportId
    };

    nock(BASE_URL)
      .put(`/daily-reports/${reportId}`)
      .reply(500, 'Erro inesperado');

    await expect(ArgelorProvider.updateReport(updatedData)).rejects.toThrow('ArgelorProvider update failed');
  });
});
