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
  });

  describe('render and attach', () => {
    let screen;
    beforeEach(() => {
      screen = new IOScreen();
    });

    it('should have methods', () => {
      expect(screen.render).toBeDefined();
      expect(screen.attachTo).toBeDefined();
    });

    it('should have render running with enqueue event', () => {
      let domEl = {};
      screen.attachTo(domEl);

      spyOn(screen, 'render');
      screen.dispatchEvent('enqueue', 'dummy data');
      expect(screen.render).toHaveBeenCalledWith('dummy data');
    });

    it('should render correct html string', () => {
      expect(
        screen.render({
          queue: ['1', '2', '+', '3', '^', '4', '^']
        })
      )
      .toEqual(
        '<span class="no">12</span><span class="op">+</span><span class="expr pow"><span class="no">3</span><span class="expr pow"><span class="no">4</span><span class="blk">&#9744;</span></span></span>'
      )
    });
  });
});
