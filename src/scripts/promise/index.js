/**
 * @name Promise
 * @class
 * @description
 * A Promise parody, as the ES6 one is not ready as promised. This is not a proper Promise, but a working polyfill for our galgulator, yeah.
 */
export default class Promise {
  constructor(process) {
    this.onSuccess = [];
    this.onError = [];

    if(process) {
      let self = this;
      setTimeout(() => {
        process(
          data => self.resolve(data),
          data => self.reject(data)
        );
      }, 0)
    }
  }

  resolve(data) {
    this.onSuccess.forEach(fn => fn(data));
    return this;
  }
  reject(data) {
    this.onError.forEach(fn => fn(data));
    return this;
  }

  then(fn) {
    this.onSuccess.push(fn);
    return this;
  }

  catch(fn) {
    this.onError.push(fn);
    return this;
  }

  finally(fn) {
    this.onSuccess.push(fn);
    this.onError.push(fn);
    return this;
  }
}
