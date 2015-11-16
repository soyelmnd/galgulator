import Galgulator from '../../../../src/scripts/galgulator/';

describe('Galgulator', () => {
  it('should be defined', () => {
    expect(Galgulator).toBeDefined();
  });

  it('should be instantiable', () => {
    let galgulator = new Galgulator();
    expect(galgulator).toBeDefined();
  });
})
