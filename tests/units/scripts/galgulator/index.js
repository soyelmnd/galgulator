import Galgulator from '../../../../src/scripts/galgulator';
import Eventist from '../../../../src/scripts/eventist';
import IOAbstract from '../../../../src/scripts/galgulator/io/abstract';

describe('Galgulator', () => {
  it('should be defined and instantiable', () => {
    expect(Galgulator).toBeDefined();
    expect(new Galgulator()).toBeDefined();
  });

  describe('basic queue', () => {
    let galgulator;

    // The idea is a calculator have a queue
    //   and operator/digit is to be enqueued/dequeued
    //   just as we type/clear
    beforeEach(() => {
      galgulator = new Galgulator();
    });

    it('should have basic queue methods', () => {
      expect(galgulator.enqueue).toBeDefined();
      expect(galgulator.dequeue).toBeDefined();
      expect(galgulator.clear).toBeDefined();
      expect(galgulator.resolve).toBeDefined();
    });

    it('should have basic queue work', (done) => {
      // Let's start simple with
      //   a string queue element
      galgulator.enqueue('1');
      galgulator.enqueue('1');
      galgulator.enqueue('+');
      galgulator.enqueue('2');
      galgulator.enqueue('2');

      galgulator.resolve().then(result => {
        expect(result).toEqual(33);
        done();
      });
    });

    it('should be able to dequeue', (done) => {
      galgulator.enqueue('1');
      galgulator.enqueue('1');
      galgulator.enqueue('+');
      galgulator.enqueue('2');
      galgulator.enqueue('2');
      galgulator.enqueue('+');
      galgulator.enqueue('3');
      galgulator.dequeue();
      galgulator.dequeue();

      galgulator.resolve().then(result => {
        expect(result).toEqual(33);
        done();
      });
    });
  });

  describe('non-uniform expression', () => {
    let galgulator;
    beforeEach(() => {
      galgulator = new Galgulator();
    });

    it('should handle trailing operators', (done) => {
      galgulator.enqueue('1');
      galgulator.enqueue('+');
      galgulator.enqueue('2');
      galgulator.enqueue('+');

      galgulator.resolve().then(result => {
        expect(result).toEqual(3);
        done();
      });
    });
  });

  describe('complex operation', () => {
    let galgulator;
    beforeEach(() => {
      galgulator = new Galgulator();
    });

    it('should handle Math.pow', (done) => {
      galgulator.enqueue('2');
      galgulator.enqueue('+');
      galgulator.enqueue('2');
      galgulator.enqueue('^');
      galgulator.enqueue('2');
      galgulator.enqueue('^');
      galgulator.enqueue('2');
      galgulator.enqueue('^');
      galgulator.enqueue('2');
      galgulator.enqueue('-');
      galgulator.enqueue('2');
      galgulator.enqueue('*');
      galgulator.enqueue('2');

      galgulator.resolve().then(result => {
        expect(result).toEqual(65534);
        done();
      })
    })
  });

  describe('io', () => {
    let galgulator;

    beforeEach(() => {
      galgulator = new Galgulator();
    });

    it('should be able to add io', () => {
      // Shouldn't init an abstract,
      //   but .. it's the ideal solution, by the way
      let ioA = new IOAbstract()
        , ioB = new IOAbstract();

      spyOn(ioA, 'setGalgulator');
      spyOn(ioB, 'setGalgulator');

      galgulator.addIO(ioA).addIO(ioB);
      expect(ioA.setGalgulator).toHaveBeenCalled();
      expect(ioB.setGalgulator).toHaveBeenCalled();
    });

    it('should have basic characteristics', () => {
      // Should be an instance of eventist
      //   so we can have `events` as a handy communication tool
      expect(galgulator.id).toBeDefined();
      expect(galgulator instanceof Eventist).toBeTruthy();

      // A calculator should have io (screen, keypad)
      //   to not only work via api
      expect(galgulator.addIO).toBeDefined();
    });

    it('should broadcast event', (done) => {
      spyOn(galgulator, 'broadcast');

      galgulator.enqueue('1');
      expect(galgulator.broadcast.calls.count()).toEqual(1);

      galgulator.dequeue();
      expect(galgulator.broadcast.calls.count()).toEqual(2);

      galgulator.clear();
      expect(galgulator.broadcast.calls.count()).toEqual(3);

      galgulator.resolve().then(() => {
        expect(galgulator.broadcast.calls.count()).toEqual(4);
        done();
      });
    });
  });
})
