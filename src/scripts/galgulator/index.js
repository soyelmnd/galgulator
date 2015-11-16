import Eventist from '../eventist';
import Promise from '../promise';

export default class Galgulator extends Eventist {
  constructor() {
    super();
    this.queue = [];
  }

  addIO(io) {
  }

  enqueue(op) {
    op = op.trim();
    op && this.queue.push(op);
    return this;
  }

  dequeue() {
    this.queue.length && this.queue.pop();
    return this;
  }

  clear() {
    this.queue = [];
    return this;
  }

  resolve() {
    let expression = this.queue.join('');

    // Remove spaces, trailing operators, and redundant 0
    expression = expression.replace(/\s+|\b0+|[^\d]+$/g, '');

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
      resolve(new Function('return ' + expression)())
    })
  }
}
