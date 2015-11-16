import Eventist from '../../eventist';

export default class IOAbstract extends Eventist {
  constructor() {
    super()
  }

  setGalgulator(galgulator) {
    if(galgulator) {
      this.galgulator = galgulator;
      this.subscribe(galgulator);
    } else {
      this.galgulator = null;
      this.unsubscribe();
    }

    return this;
  }
}
