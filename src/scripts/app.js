import Galgulator from './galgulator';
import GalgulatorIOScreen from './galgulator/io/screen';
import GalgulatorIOKeypad from './galgulator/io/keypad';
import GalgulatorIOKeyWatch from './galgulator/io/key-watch';

// Transform all galgulator into living creatures
Array.prototype.slice.call(document.getElementsByClassName('galgulator'))
.forEach(el => {
  let galgulator = new Galgulator();

  // Output screen
  Array.prototype.slice.call(el.querySelectorAll('.screen .q'))
  .forEach(screenEl => {
    galgulator.addIO(new GalgulatorIOScreen(screenEl))
  });

  // Input keypad
  Array.prototype.slice.call(el.getElementsByClassName('keypad'))
  .forEach(keypadEl => {
    galgulator.addIO(new GalgulatorIOKeypad(keypadEl))
  });

  // Input key watch
  galgulator.addIO(new GalgulatorIOKeyWatch(el))
});
