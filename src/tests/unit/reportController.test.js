const ReportController = require('../../controllers/reportController');
const reportService = require('../../services/reportService');

jest.mock('../../services/reportService');

describe('ReportController', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('createReport', () => {
    it('retorna 201 com dados do relatório criado', async () => {
      req.body = { obra_id: 'OBRA-TESTE' };
      const fakeResult = {
        localId: 'local-123',
        externalId: 'ext-456',
        provider: 'vate'
      };
      reportService.createReport.mockResolvedValue(fakeResult);

      await ReportController.createReport(req, res, next);

      expect(reportService.createReport).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeResult);
    });

    it('chama next() em caso de erro', async () => {
      const error = new Error('falhou');
      reportService.createReport.mockRejectedValue(error);

      await ReportController.createReport(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getReport', () => {
    it('retorna 200 com os dados do relatório', async () => {
      req.params = { id: 'local-123' };
      const fakeData = { descricao: 'teste' };
      reportService.getReport.mockResolvedValue(fakeData);

      await ReportController.getReport(req, res, next);

      expect(reportService.getReport).toHaveBeenCalledWith('local-123');
      expect(res.status).not.toHaveBeenCalled(); // default 200
      expect(res.json).toHaveBeenCalledWith(fakeData);
    });

    it('retorna 404 se relatório não encontrado', async () => {
      req.params = { id: 'nao-existe' };
      reportService.getReport.mockResolvedValue(null);

      await ReportController.getReport(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Relatório não encontrado' });
    });
  });

  describe('updateReport', () => {
    it('retorna 200 com os dados atualizados', async () => {
      req.params = { id: 'local-123' };
      req.body = { descricao: 'atualizado' };
      const fakeUpdate = { status: 'ok' };
      reportService.updateReport.mockResolvedValue(fakeUpdate);

      await ReportController.updateReport(req, res, next);

      expect(reportService.updateReport).toHaveBeenCalledWith('local-123', req.body);
      expect(res.json).toHaveBeenCalledWith(fakeUpdate);
    });

    it('chama next() em caso de erro', async () => {
      const error = new Error('erro');
      reportService.updateReport.mockRejectedValue(error);

      req.params = { id: 'qualquer' };
      req.body = {};

      await ReportController.updateReport(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
