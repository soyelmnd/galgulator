import Eventist from '../../../../src/scripts/eventist';

describe('Eventist', () => {
  it('should be defined', () => {
    expect(Eventist).toBeDefined();
  });

  it('should have trigger working', () => {
    let eventist = new Eventist()
      , callback = jasmine.createSpy('onCallback');

    eventist.on('say', callback);

    eventist.emit('say');
    eventist.trigger('say'); // Should have `trigger` as an alias for `emit`

    expect(callback).toHaveBeenCalled();
    expect(callback.calls.count()).toEqual(2);
  });

  it('should have subscribe working', () => {
    let ancestor = new Eventist()
      , parent = new Eventist()
      , child = new Eventist();

    let ancestorCallback = jasmine.createSpy('ancestorCallback')
      , parentCallback = jasmine.createSpy('parentCallback')
      , childCallback = jasmine.createSpy('childCallback');

    ancestor.on('say', ancestorCallback);
    parent.on('say', parentCallback);
    child.on('say', childCallback);

    parent.subscribe(ancestor);
    child.subscribe(parent);

    // A call from ancestor
    //   should trigger callbacks
    //   in all 3
    ancestor.broadcast('say', {});

    expect(ancestorCallback).toHaveBeenCalled();
    expect(ancestorCallback.calls.count()).toEqual(1);

    expect(parentCallback).toHaveBeenCalled();
    expect(parentCallback.calls.count()).toEqual(1);

    expect(childCallback).toHaveBeenCalled();
    expect(childCallback.calls.count()).toEqual(1);

    // .. and from child
    //   should trigger callback
    //   from all 3
    child.emit('say', {});

    expect(childCallback.calls.count()).toEqual(2);
    expect(parentCallback.calls.count()).toEqual(2);
    expect(ancestorCallback.calls.count()).toEqual(2);

    // .. now down from parent
    //   should trigger callback
    //   from parent and child
    parent.broadcast('say', {});

    expect(ancestorCallback.calls.count()).toEqual(2);
    expect(parentCallback.calls.count()).toEqual(3);
    expect(childCallback.calls.count()).toEqual(3);

    // .. finally from parent upward
    //   should trigger callback
    //   from parent and ancestor
    parent.emit('say', {});

    expect(ancestorCallback.calls.count()).toEqual(3);
    expect(parentCallback.calls.count()).toEqual(4);
    expect(childCallback.calls.count()).toEqual(3);
  });
});
