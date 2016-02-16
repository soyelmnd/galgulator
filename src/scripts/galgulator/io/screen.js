import IOAbstract from './abstract';

export default class IOScreen extends IOAbstract {
  constructor(el) {
    super(el);

    el && this.attachTo(el);
  }

  attachTo(el) {
    this.el = el;

    this.on('enqueue dequeue clear resolve', (evt, data) => {
      el.innerHTML = this.render(data.queue);
    });
  }

  /**
   * @param {Array} galgulator queue
   * @return {String} html
   */
  render(queue) {
    let html = queue.join('');

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
    html = html.replace(/(?:\d+\^)+\d*/g, exp => {
      const powOperands = exp.split('^');
      const n = powOperands.length;

      let powExpression = powOperands[n - 1] || '@placeholder@';
      for(let i=n-2; i>-1; --i) {
        powExpression = `<span class="expr pow">${powOperands[i]}@spliter@${powExpression}</span>`;
      }

      return powExpression;
    });

    // Wrap around no and op
    html = html
      .replace(/\d+/g, '<span class="no">$&</span>')
      .replace(/[-+:]|\bx\b/g, '<span class="op">$&</span>');

    // And get rid of system elements
    html = html
      .replace(/@spliter@/gi, '')
      .replace(/@placeholder@/gi, '<span class="blk">&#9744;</span>');

    return html;
  }
}
