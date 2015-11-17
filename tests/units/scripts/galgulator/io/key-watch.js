import IOAbstract from '../../../../../src/scripts/galgulator/io/abstract';
import IOKeyWatch from '../../../../../src/scripts/galgulator/io/key-watch';

describe('IOKeyWatch', () => {
  it('should be defined', () => {
    expect(IOKeyWatch).toBeDefined();
  });

  it('should be instantiable', () => {
    let keyWatch = new IOKeyWatch();
    expect(keyWatch).toBeDefined();
    expect(keyWatch instanceof IOAbstract).toBeTruthy();
  });
});
