import IOAbstract from './abstract';

export default class IOScreen extends IOAbstract {
  constructor(el) {
    super()
    el && this.attachTo(el);
  }

  attachTo(el) {
    this.el = el;

    this.on('enqueue dequeue', (evt, data) => {
      el.innerHTML = this.render(data);
    });
  }

  render(data) {
    let html = data.queue.join('');

    // Wrap the pow expression
    //
    // 2^3^4^5
    //
    // should become
    //
    // span.expr.pow
    //   2
    //   span.expr.pow
    //     3
    //     span.expr.pow
    //     4
    //     5
    html = html.replace(/(?:\d+\^)+\d*/g, (exp) => {
      let powOperands = exp.split('^')
        , n = powOperands.length
        , i = n - 2;

      let powExpression = powOperands[n - 1] || '@placeholder@';
      for(; i>-1; --i) {
        powExpression = '<span class="expr pow">' + powOperands[i] + '@spliter@' + powExpression + '</span>';
      }

      return powExpression;
    });

    // Wrap around no and op
    html = html
      .replace(/\d+/g, '<span class="no">$&</span>')
      .replace(/[-+*]/g, '<span class="op">$&</span>');

    // And get rid of system elements
    html = html
      .replace(/@spliter@/gi, '')
      .replace(/@placeholder@/gi, '<span class="blk">&#9744;</span>');

    return html;
  }
}
