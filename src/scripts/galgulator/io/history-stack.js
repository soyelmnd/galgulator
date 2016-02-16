import IOScreen from './screen';

export default class IOHistoryStack extends IOScreen {
  constructor(el) {
    super(el);
  }

  attachTo(el) {
    this.el = el;

    this.on('resolve', (evt, data) => {
      el.innerHTML = this.render(data.historyStack);
    });
  }

  /**
   * @param {Array} galgulator history stack
   * @return {String} html
   */
  render(historyStack) {
    let html = '';

    if (historyStack.length) {
      html = historyStack
        .map(queue => {
          return super.render(queue)
            .replace(/^.+$/, '<div class="state">$& =</div>');
        })
        .reverse() // we need to render it upside-down
        .join('');
    }

    return html;
  }
}
