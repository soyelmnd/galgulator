import IOAbstract from '../../../../../src/scripts/galgulator/io/abstract';
import Eventist from '../../../../../src/scripts/eventist';
import Galgulator from '../../../../../src/scripts/galgulator/';

describe('IOAbstract', () => {
  it('should be defined', () => {
    expect(IOAbstract).toBeDefined();
  });

  it('should know its galgulator', () => {
    // shouldn't be instantiable, but ..
    //   this is the flexibly awesome javascript by the way
    let ioAbstract = new IOAbstract();

    // @see Galgulator
    expect(ioAbstract).toBeDefined();
    expect(ioAbstract instanceof Eventist).toBeTruthy();
    expect(ioAbstract.setGalgulator).toBeDefined();
  });

  it('should subscribe to galgulator', () => {
    let galgulator = new Galgulator();

    let ioA = new IOAbstract()
      , ioB = new IOAbstract();

    spyOn(ioA, 'setGalgulator').and.callThrough();
    spyOn(ioB, 'setGalgulator').and.callThrough();
    spyOn(ioA, 'subscribe').and.callThrough();
    spyOn(ioB, 'subscribe').and.callThrough();
    spyOn(ioA, 'dispatchEvent').and.callThrough();
    spyOn(ioB, 'dispatchEvent').and.callThrough();
    spyOn(galgulator, 'broadcast').and.callThrough();

    galgulator.addIO(ioA).addIO(ioB);
    expect(ioA.setGalgulator).toHaveBeenCalledWith(galgulator);
    expect(ioB.setGalgulator).toHaveBeenCalledWith(galgulator);
    expect(ioA.galgulator).toBe(galgulator);
    expect(ioB.galgulator).toBe(galgulator);
    expect(ioA.subscribe).toHaveBeenCalledWith(galgulator);
    expect(ioB.subscribe).toHaveBeenCalledWith(galgulator);

    // Let's try a simple queue
    galgulator.enqueue('1');
    expect(galgulator.broadcast.calls.count()).toEqual(1);
    expect(ioA.dispatchEvent.calls.count()).toEqual(1);
    expect(ioB.dispatchEvent.calls.count()).toEqual(1);

    // Another one
    galgulator.dequeue();
    expect(galgulator.broadcast.calls.count()).toEqual(2);
    expect(ioA.dispatchEvent.calls.count()).toEqual(2);
    expect(ioB.dispatchEvent.calls.count()).toEqual(2);
  });
});
