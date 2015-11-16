import IOAbstract from '../../../../../src/scripts/galgulator/io/abstract';
import Eventist from '../../../../../src/scripts/eventist';

describe('IOAbstract', () => {
  it('should be defined', () => {
    expect(IOAbstract).toBeDefined();
  });

  it('should have base methods', () => {
    let ioAbstract = new IOAbstract(); // shouldn't be instantiable, but ..

    expect(ioAbstract).toBeDefined();
    expect(ioAbstract instanceof Eventist).toBeTruthy();
  });
});
