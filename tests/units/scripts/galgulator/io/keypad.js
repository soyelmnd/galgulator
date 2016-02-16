import IOAbstract from '../../../../../src/scripts/galgulator/io/abstract';
import IOKeypad from '../../../../../src/scripts/galgulator/io/keypad';

describe('IOKeypad', () => {
  it('should be defined', () => {
    expect(IOKeypad).toBeDefined();
  });

  it('should be instantiable', () => {
    const keypad = new IOKeypad();
    expect(keypad).toBeDefined();
    expect(keypad instanceof IOAbstract).toBeTruthy();
  });
});
