import Eventist from '../eventist';
import Promise from '../promise';

/**
 * @name Galgulator
 * @class
 * @extends Eventist
 * @description
 * The idea is we'll have a base galgulator, with just a CPU.
 * All external components (keypad, screen, history stack ..) are IO, and should
 * extend from IOAbstract, then could be added to the base galgulator. With this
 * approach, we could extend it easy later.
 */
export default class Galgulator extends Eventist {
  constructor() {
    super();

    this.ios = [];
    this.queue = [];
    this.historyStack = [];
  }

  addIO(io) {
    io.setGalgulator(this);
    this.ios.push(io);

    return this;
  }

  enqueue(op) {
    op = op.trim();
    if(op) {
      this.queue.push(op);

      this.broadcast('enqueue', {
        queue: this.queue,
        op,
      });
    }
    return this;
  }

  dequeue() {
    if(this.queue.length) {
      const op = this.queue.pop();

      this.broadcast('dequeue', {
        queue: this.queue,
        op,
      })
    }
    return this;
  }

  clear() {
    const exQueue = this.queue;

    this.queue = [];

    this.broadcast('clear', {
      queue: this.queue,
      exQueue,
    });

    return this;
  }

  resolve() {
    let expression = this.queue.join('');

    // Remove spaces, trailing operators, and redundant 0
    expression = expression.replace(/\s+|\b0+|[^\d]+$/g, '');

    // Convert to js friendly
    expression = expression.replace(/x/gi, '*').replace(/:/gi, '/');

    // TODO generalize this, use a lot
    // Handle pow by transforming
    //   x^y^z to Math.pow(x, Math.pow(y, z))
    expression = expression.replace(/\d+(?:\^\d+)+/g, exp => {
      const powOperands = exp.split('^');
      const n = powOperands.length;

      let powExpression = powOperands[n - 1];
      for(let i=n-2; i>-1; --i) {
        powExpression = 'Math.pow(' + powOperands[i] + ',' + powExpression + ')';
      }

      return powExpression;
    });

    return new Promise((resolve, reject) => {
      const result = new Function('return ' + expression)();

      // Save the history
      this.historyStack.push(this.queue);

      // Refresh the queue, and resolve
      this.queue = [result];
      this.broadcast('resolve', {
        historyStack: this.historyStack,
        queue: this.queue,
      });

      resolve(result);
    })
  }
}
