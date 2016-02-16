import uuid from '../uuid';

/**
 * @name Eventist
 * @class
 * @description
 * Inspired by https://docs.angularjs.org/api/ng/type/$rootScope.Scope
 *
 * An eventist can `emit` (aka `trigger` in jQuery DOM) event, listen to
 * event with `on` (much like `on` in jQuery DOM) or even `broadcast` event
 *
 * With `emit`, event flows as in the bubbling phase of browser DOM, start
 * dispatching from the target, then target's parent, then target's
 * parent's parent ...
 *
 * With `broadcast`, event flows as in the capturing phase browser DOM,
 * start dispatching from the target, then target's children, then target's
 * children's children ...
 *
 * But how can an eventist know who's its parent, in order to propagate
 * event? Good question! A parent must be set explicitly. Well, instead of
 * calling it parent, let's use the word subscriber
 *
 * Oh, and we also have event.stopPropagation() and event.preventDefault(),
 * as a real normal DOM event, but .. #toBeImplemented
 */
export default class Eventist {
  constructor() {
    this.id = this.id || uuid();
  }

  /**
   * @name Eventist#watch
   * @method
   * @param {Eventist} child
   * @return {Eventist} this
   * @description
   * The idea is we don't want an object to modify another object's variables
   * So let it modify itself in the way it want to be. Will be called when
   * there's a subscription request
   */
  watch(child) {
    // Initialize the _eventistChildren list, if needed
    this._eventistChildren = this._eventistChildren || {};
    this._eventistChildren[child.id] = child;

    return this;
  }

  /**
   * @name Eventist#unwatch
   * @method
   * @param {Eventist} child
   * @return {Eventist} this
   * @see Eventist#match
   */
  unwatch(child) {
    if(!this._eventistChildren || !this._eventistChildren[child.id]) {
      throw new Error('Could not find this eventist in the parent children list');
    }

    delete this._eventistChildren[child.id];

    return this;
  }

  /**
   * @name Eventist#subscribe
   * @method
   * @param {Eventist} parent
   * @return {Eventist} this
   */
  subscribe(parent) {
    if(!this.id) {
      throw new Error('An eventist need an id to be able to subscribe');
    }

    if(!(parent instanceof Eventist)) {
      throw new Error('An eventist could only subscribe to another eventist');
    }

    parent.watch(this);
    this._eventistParent = parent;

    return this;
  }

  /**
   * @name Eventist#unsubscribe
   * @method
   * @param {Eventist} [parent]
   * @return {Eventist} this
   */
  unsubscribe(parent) {
    if(!this._eventistParent) {
      throw new Error('But .. this eventist has no parent')
    }
    if(parent && parent != this._eventistParent) {
      throw new Error('Could not unsubscribe from a parent of someone else, lol');
    }

    // Support no param
    //   to unsubscribe from current parent
    parent = parent || this._eventistParent;

    parent.unwatch(this);
    this._eventistParent = null;

    return this;
  }

  /**
   * @name Eventist#on
   * @method
   * @param {string} events
   * @param {function} callback
   * @param {string} [flag]
   * @return {Eventist} this
   */
  on(events, callback, flag) {
    const listeners = this._eventListeners = this._eventListeners || {};

    // let's support multi event binding at a time
    //   separated by common delimiters, just like
    //   the other js famous frameworks/libraries
    events.split(/ |,|;|\|/).forEach(evt => {
      listeners[evt] = listeners[evt] || [];

      flag = flag || 'append';

      if('append' == flag) {
        listeners[evt].push(callback);
      } else if('prepend' == flag) {
        listeners[evt].unshift(callback);
      } else if('set' == flag) {
        listeners[evt] = [callback];
      }
    });

    return this;
  }

  /**
   * @name Eventist#dispatchEvent
   * @method
   * @param {string} event
   * @param {Object} [args]
   * @param {Object} [origin]
   * @return {Eventist} this
   * @description
   * Dispatch event without any bubbling
   */
  dispatchEvent(evt, args, origin) {
    if(this._eventListeners) {
      const callbacks = this._eventListeners[evt];

      if(callbacks && callbacks.length) {
        for(let idx in callbacks) {
          callbacks[idx].call(this, origin || {}, args);
        }
      }
    }

    return this;
  }

  /**
   * @name Eventist#emit
   * @method
   * @param {string} event
   * @param {Object} [args]
   * @return {Eventist} this
   */
  emit(evt, args, origin) {
    // The origin should be private and not to be exposed to user
    //   since it's totally internal for event origin tracking purpose
    //   The idea is, origin won't be passed in any call
    //   and the first trigger in a chain will propose a new origin
    origin = origin || {
      eventType: 'emit',
      target: this,
      hop: []
    };

    origin.hop.push(this); // yep, we're now one hop in the event path

    this.dispatchEvent(evt, args, origin);

    // Bubbling bubbling
    this._eventistParent && this._eventistParent.emit(evt, args, origin);

    return this;
  }

  /**
   * @name Eventist#trigger
   * @method
   * @alias Eventist#emit
   */
  trigger() {
    return this.emit.apply(this, arguments);
  }

  /**
   * @name Eventist#broadcast
   * @method
   * @param {string} event
   * @param {Object} [args]
   * @return {Eventist} this
   */
  broadcast(evt, args, origin) {
    // Regarding the origin, @see above
    origin = origin || {
      eventType: 'broadcast',
      target: this,
      hop: []
    };

    origin.hop.push(this);

    this.dispatchEvent(evt, args, origin);

    if(this._eventistChildren) {
      for(let idx in this._eventistChildren) {
        // Inverse bubbling bubbling
        this._eventistChildren[idx].broadcast(evt, args, origin);
      }
    }

    return this;
  }
}
