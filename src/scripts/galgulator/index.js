import Eventist from '../eventist';
import Promise from '../promise';

/**
 * @name Galgulator
 * @class
 * @extends Eventist
 */
export default class Galgulator extends Eventist {
  constructor() {
    super();

    this.ios = [];
    this.queue = [];
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
        op: op
      });
    }
    return this;
  }

  dequeue() {
    if(this.queue.length) {
      let op = this.queue.pop();

      this.broadcast('dequeue', {
        queue: this.queue,
        op: op
      })
    }
    return this;
  }

  clear() {
    let exQueue = this.queue;

    this.queue = [];

    this.broadcast('clear', {
      queue: this.queue,
      exQueue: exQueue
    });

    return this;
  }

  resolve() {
    let expression = this.queue.join('');
    let self = this;

    // Remove spaces, trailing operators, and redundant 0
    expression = expression.replace(/\s+|\b0+|[^\d]+$/g, '');

    // Convert to js friendly
    expression = expression.replace(/x/gi, '*').replace(/:/gi, '/');

    // Handle pow by transforming
    //   x^y^z to Math.pow(x, Math.pow(y, z))
    expression = expression.replace(/\d+(?:\^\d+)+/g, (exp) => {
      let powOperands = exp.split('^')
        , n = powOperands.length
        , i = n - 2;

      let powExpression = powOperands[n - 1];
      for(; i>-1; --i) {
        powExpression = 'Math.pow(' + powOperands[i] + ',' + powExpression + ')';
      }

      return powExpression;
    });

    return new Promise((resolve, reject) => {
      let result = new Function('return ' + expression)();

      self.queue = [result];
      self.broadcast('resolve', {
        queue: self.queue
      });

      resolve(result);
    })
  }
}
