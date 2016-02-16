import Galgulator from './galgulator';
import GalgulatorIOScreen from './galgulator/io/screen';
import GalgulatorIOHistoryStack from './galgulator/io/history-stack';
import GalgulatorIOKeypad from './galgulator/io/keypad';
import GalgulatorIOKeyWatch from './galgulator/io/key-watch';

// Transform all galgulator into living creatures
Array.prototype.slice.call(document.getElementsByClassName('galgulator'))
.forEach(el => {
  const galgulator = new Galgulator();

  // Input keypad
  Array.prototype.slice.call(el.getElementsByClassName('keypad'))
    .forEach(el => {
      galgulator.addIO(new GalgulatorIOKeypad(el));
    });

  // Input key watch, listen to keyboard input
  galgulator.addIO(new GalgulatorIOKeyWatch(el));

  // Output screen
  Array.prototype.slice.call(el.querySelectorAll('.history-stack'))
    .forEach(el => {
      galgulator.addIO(new GalgulatorIOHistoryStack(el));
    });

  // Output history stacks
  Array.prototype.slice.call(el.querySelectorAll('.screen .q'))
    .forEach(el => {
      galgulator.addIO(new GalgulatorIOScreen(el));
    });
});
