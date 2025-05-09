const reportService = require('../../services/reportService');

jest.mock('../../adapters/vateProvider', () => ({
  createReport: jest.fn(),
  getReport: jest.fn(),
  updateReport: jest.fn()
}));

jest.mock('../../adapters/argelorProvider', () => ({
  createReport: jest.fn(),
  getReport: jest.fn(),
  updateReport: jest.fn()
}));

jest.mock('../../storage/lowdb', () => ({
  saveMapping: jest.fn(),
  getMappingById: jest.fn()
}));

const VateProvider = require('../../adapters/vateProvider');
const ArgelorProvider = require('../../adapters/argelorProvider');
const ReportRegistry = require('../../storage/lowdb');

describe('reportService - createReport', () => {
  const fakeData = {
    obra_id: 'OBRA-TESTE',
    data: '2025-05-10',
    clima: 'ensolarado',
    descricao: 'teste',
    equipe: ['A', 'B']
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.PRIMARY_PROVIDER = 'vate';
    process.env.SECONDARY_PROVIDER = 'argelor';
  });

  it('usa o provedor primário se ele estiver disponível', async () => {
    VateProvider.createReport.mockResolvedValue({ id: 'abc123' });

    const result = await reportService.createReport(fakeData);

    expect(VateProvider.createReport).toHaveBeenCalled();
    expect(ArgelorProvider.createReport).not.toHaveBeenCalled();
    expect(ReportRegistry.saveMapping).toHaveBeenCalledWith(
      expect.objectContaining({
        externalId: 'abc123',
        provider: 'vate'
      })
    );
    expect(result).toHaveProperty('localId');
  });

  it('faz fallback para o secundário se o primário falhar', async () => {
    VateProvider.createReport.mockRejectedValue(new Error('Falha no primário'));
    ArgelorProvider.createReport.mockResolvedValue({ id: 'fallback123' });

    const result = await reportService.createReport(fakeData);

    expect(VateProvider.createReport).toHaveBeenCalled();
    expect(ArgelorProvider.createReport).toHaveBeenCalled();
    expect(result.provider).toBe('argelor');
  });

  it('lança erro se ambos os provedores falharem', async () => {
    VateProvider.createReport.mockRejectedValue(new Error('Erro 1'));
    ArgelorProvider.createReport.mockRejectedValue(new Error('Erro 2'));

    await expect(reportService.createReport(fakeData)).rejects.toThrow('Nenhum provedor disponível no momento.');

    expect(VateProvider.createReport).toHaveBeenCalled();
    expect(ArgelorProvider.createReport).toHaveBeenCalled();
    expect(ReportRegistry.saveMapping).not.toHaveBeenCalled();
  });
});
