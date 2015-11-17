import Galgulator from './galgulator';
import GalgulatorIOScreen from './galgulator/io/screen';
import GalgulatorIOKeypad from './galgulator/io/keypad';

// Transform all galgulator into living creatures
Array.prototype.slice.call(document.getElementsByClassName('galgulator'))
.forEach(el => {
  let galgulator = new Galgulator();
  window.galgulator = galgulator;

  Array.prototype.slice.call(el.querySelectorAll('.screen .q'))
  .forEach(screenEl => {
    galgulator.addIO(new GalgulatorIOScreen(screenEl))
  });

  Array.prototype.slice.call(el.getElementsByClassName('keypad'))
  .forEach(keypadEl => {
    galgulator.addIO(new GalgulatorIOKeypad(keypadEl))
  });
});
