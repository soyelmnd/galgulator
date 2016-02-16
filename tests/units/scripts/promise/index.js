import Promise from '../../../../src/scripts/promise';

describe('Promise', () => {
  it('should be defined', () => {
    expect(Promise).toBeDefined();
  });

  it('should be instantiable', () => {
    const promise = new Promise();
    expect(promise).toBeDefined();

    expect(promise.resolve).toBeDefined();
    expect(promise.reject).toBeDefined();

    expect(promise.then).toBeDefined();
    expect(promise.catch).toBeDefined();
    expect(promise.finally).toBeDefined();
  });

  describe('basic resolve/reject', () => {
    let promise, onSuccess, onError, onFinal;

    beforeEach(() => {
      promise = new Promise();

      onSuccess = jasmine.createSpy('onSuccess');
      onError = jasmine.createSpy('onError');
      onFinal = jasmine.createSpy('onFinal');

      promise
      .then(onSuccess)
      .catch(onError)
      .finally(onFinal);
    });

    it('should have resolve working', (done) => {
      promise.resolve('data');

      expect(onSuccess).toHaveBeenCalledWith('data');
      expect(onFinal).toHaveBeenCalledWith('data');
      expect(onError).not.toHaveBeenCalled();

      expect(onSuccess.calls.count()).toEqual(1);
      expect(onFinal.calls.count()).toEqual(1);

      done();
    });

    it('should have reject working', (done) => {
      promise.reject('data');

      expect(onError).toHaveBeenCalledWith('data');
      expect(onFinal).toHaveBeenCalledWith('data');
      expect(onSuccess).not.toHaveBeenCalled();

      expect(onError.calls.count()).toEqual(1);
      expect(onFinal.calls.count()).toEqual(1);

      done();
    });
  });

  describe('handy constructor', () => {
    it('should have resolve working', (done) => {
      const onSuccess = jasmine.createSpy('onSuccess');
      const onError = jasmine.createSpy('onError');
      const onFinal = jasmine.createSpy('onFinal');

      new Promise((resolve, reject) => {
        resolve('data');

        expect(onSuccess).toHaveBeenCalledWith('data');
        expect(onFinal).toHaveBeenCalledWith('data');
        expect(onError).not.toHaveBeenCalled();

        expect(onSuccess.calls.count()).toEqual(1);
        expect(onFinal.calls.count()).toEqual(1);

        done();
      })
      .then(onSuccess)
      .catch(onError)
      .finally(onFinal);
    });

    it('should have reject working', (done) => {
      const onSuccess = jasmine.createSpy('onSuccess');
      const onError = jasmine.createSpy('onError');
      const onFinal = jasmine.createSpy('onFinal');

      new Promise((resolve, reject) => {
        reject('data');

        expect(onFinal).toHaveBeenCalledWith('data');
        expect(onError).toHaveBeenCalledWith('data');
        expect(onSuccess).not.toHaveBeenCalled();

        expect(onError.calls.count()).toEqual(1);
        expect(onFinal.calls.count()).toEqual(1);

        done();
      })
      .then(onSuccess)
      .catch(onError)
      .finally(onFinal);
    });
  });
});
