import IOAbstract from './abstract';

export default class IOKeypad extends IOAbstract {
  constructor(el) {
    super()
    el && this.attachTo(el);
  }

  attachTo(el) {
    this.el = el;

    let self = this;
    el.addEventListener('click', (evt) => {
      self.key(evt.target.dataset.keyData)
    }, false);
  }

  key(keyData) {
    if('AC' == keyData) {
      this.galgulator.clear();
    } else if('CE' == keyData) {
      this.galgulator.dequeue();
    } else if('=' == keyData) {
      this.galgulator.resolve();
    } else if(keyData) {
      this.galgulator.enqueue(keyData);
    }

    return this;
  }
}
