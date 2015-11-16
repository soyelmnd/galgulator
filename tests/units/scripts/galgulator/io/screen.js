import IOAbstract from '../../../../../src/scripts/galgulator/io/abstract';
import IOScreen from '../../../../../src/scripts/galgulator/io/screen';

describe('IOScreen', () => {
  it('should be defined', () => {
    expect(IOScreen).toBeDefined();
  });

  it('should be instantiable', () => {
    let screen = new IOScreen();
    expect(screen).toBeDefined();
    expect(screen instanceof IOAbstract).toBeDefined();
  })
});
