const low = require('lowdb');
const Memory = require('lowdb/adapters/Memory');

describe('lowdb - ReportRegistry', () => {
  let db;

  beforeEach(() => {
    const adapter = new Memory();
    db = low(adapter);
    db.defaults({ reports: [] }).write();
  });

  it('salva um novo mapping corretamente', () => {
    const mapping = {
      id: 'rdo-123',
      provider: 'vate',
      externalId: 'abc123',
      createdAt: new Date().toISOString()
    };

    db.get('reports').push(mapping).write();

    const saved = db.get('reports').find({ id: 'rdo-123' }).value();
    expect(saved).toEqual(mapping);
  });

  it('recupera um mapping pelo id', () => {
    const mapping = {
      id: 'rdo-456',
      provider: 'argelor',
      externalId: 'xyz789',
      createdAt: new Date().toISOString()
    };

    db.get('reports').push(mapping).write();

    const result = db.get('reports').find({ id: 'rdo-456' }).value();
    expect(result.externalId).toBe('xyz789');
    expect(result.provider).toBe('argelor');
  });

  it('retorna undefined se o id não existir', () => {
    const result = db.get('reports').find({ id: 'inexistente' }).value();
    expect(result).toBeUndefined();
  });
});
