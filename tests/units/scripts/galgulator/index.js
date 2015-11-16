import Galgulator from '../../../../src/scripts/galgulator';
import Eventist from '../../../../src/scripts/eventist';

describe('Galgulator', () => {
  it('should be defined', () => {
    expect(Galgulator).toBeDefined();
  });

  it('should be instantiable', () => {
    let galgulator = new Galgulator();

    expect(galgulator).toBeDefined();

    // Should be an instance of eventist
    //   so we can have `events` as a handy communication tool
    expect(galgulator.id).toBeDefined();
    expect(galgulator instanceof Eventist).toBeTruthy();

    // A calculator should have io (screen, keypad)
    //   and .. well, it should be smart enough
    //   to work by itself without any io via api
    expect(galgulator.addIO).toBeDefined();
  });
})
