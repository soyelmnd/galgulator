import IOAbstract from './abstract';

export default class IOKeyWatch extends IOAbstract {
  constructor(el) {
    super()
    el && this.attachTo(el);
  }

  attachTo(el) {
    this.el = el;

    let self = this;
    el.tabIndex = 1;
    el.addEventListener('keypress', (evt) => {
      self.key(evt);
    }, false);
  }

  key(evt) {
    evt.preventDefault();

    if(13 == evt.keyCode) {
      this.galgulator.resolve();
    } else if(8 == evt.keyCode) {
      this.galgulator.dequeue();
    } else if(46 == evt.keyCode) {
      this.galgulator.clear();
    } else {
      let keyString = evt.key;
      if(
        '^' == keyString
        || '+' == keyString
        || '-' == keyString
        || 'x' == keyString
        || ':' == keyString
        || !isNaN(keyString)
      ) {
        this.galgulator.enqueue(keyString);
      } else if('*' == keyString) {
        this.galgulator.enqueue('x')
      } else if('/' == keyString) {
        this.galgulator.enqueue(':')
      }
    }

    return this;
  }
}
