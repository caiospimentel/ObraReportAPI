const nock = require('nock');
const VateProvider = require('../../adapters/vateProvider');

const BASE_URL = 'http://localhost:3001';

describe('VateProvider', () => {
  const reportData = {
    obra_id: 'OBRA-456',
    data: '2025-05-11',
    clima: 'nublado',
    descricao: 'Teste Vate',
    equipe: ['C', 'D']
  };

  afterEach(() => {
    nock.cleanAll();
  });

  it('createReport - envia corretamente e retorna dados esperados', async () => {
    const responseMock = {
      id: 'abc789',
      createdAt: '2025-05-11T00:00:00Z',
      status: 'registrado'
    };

    let bodyRecebido = null;

    nock(BASE_URL)
      .post('/reports', (body) => {
        bodyRecebido = body;
        return true;
      })
      .reply(201, responseMock);

    const result = await VateProvider.createReport(reportData);

    expect(bodyRecebido).toEqual(reportData);
    expect(result).toEqual(responseMock);
  });

  it('createReport - lança erro se status não for 201', async () => {
    nock(BASE_URL)
      .post('/reports')
      .reply(500, 'Erro interno');

    await expect(VateProvider.createReport(reportData)).rejects.toThrow('VateProvider create failed');
  });

  it('getReport - retorna JSON do relatório existente', async () => {
    const reportId = 'abc789';
    const reportMock = { descricao: 'relatório Vate' };

    nock(BASE_URL)
      .get(`/reports/${reportId}`)
      .reply(200, reportMock);

    const result = await VateProvider.getReport(reportId);
    expect(result).toEqual(reportMock);
  });

  it('getReport - lança erro se status não for 200', async () => {
    const reportId = 'nao-existe';

    nock(BASE_URL)
      .get(`/reports/${reportId}`)
      .reply(404, 'Não encontrado');

    await expect(VateProvider.getReport(reportId)).rejects.toThrow('VateProvider get failed');
  });

  it('updateReport - atualiza e retorna status esperado', async () => {
    const reportId = 'abc789';
    const updatedData = {
      ...reportData,
      descricao: 'atualizado',
      externalId: reportId
    };
    const updateResponse = { id: reportId, status: 'atualizado' };

    let updateBody = null;;

    nock(BASE_URL)
      .put(`/reports/${reportId}`, (body) => {
        updateBody = body;
        return true;
      })
      .reply(200, updateResponse);

    const result = await VateProvider.updateReport(updatedData);

    const { externalId, ...expectedBody } = updatedData;
    expect(updateBody).toEqual(expectedBody);
    expect(result).toEqual(updateResponse);
  });

  it('updateReport - lança erro se status não for 200', async () => {
    const reportId = 'abc789';
    const updatedData = {
      ...reportData,
      descricao: 'erro',
      externalId: reportId
    };

    nock(BASE_URL)
      .put(`/reports/${reportId}`)
      .reply(500, 'Erro inesperado');

    await expect(VateProvider.updateReport(updatedData)).rejects.toThrow('VateProvider update failed');
  });
});
