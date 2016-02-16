(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _galgulator = require('./galgulator');

var _galgulator2 = _interopRequireDefault(_galgulator);

var _screen = require('./galgulator/io/screen');

var _screen2 = _interopRequireDefault(_screen);

var _historyStack = require('./galgulator/io/history-stack');

var _historyStack2 = _interopRequireDefault(_historyStack);

var _keypad = require('./galgulator/io/keypad');

var _keypad2 = _interopRequireDefault(_keypad);

var _keyWatch = require('./galgulator/io/key-watch');

var _keyWatch2 = _interopRequireDefault(_keyWatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Transform all galgulator into living creatures
Array.prototype.slice.call(document.getElementsByClassName('galgulator')).forEach(function (el) {
  var galgulator = new _galgulator2.default();

  // Input keypad
  Array.prototype.slice.call(el.getElementsByClassName('keypad')).forEach(function (el) {
    galgulator.addIO(new _keypad2.default(el));
  });

  // Input key watch, listen to keyboard input
  galgulator.addIO(new _keyWatch2.default(el));

  // Output screen
  Array.prototype.slice.call(el.querySelectorAll('.history-stack')).forEach(function (el) {
    galgulator.addIO(new _historyStack2.default(el));
  });

  // Output history stacks
  Array.prototype.slice.call(el.querySelectorAll('.screen .q')).forEach(function (el) {
    galgulator.addIO(new _screen2.default(el));
  });
});

},{"./galgulator":3,"./galgulator/io/history-stack":5,"./galgulator/io/key-watch":6,"./galgulator/io/keypad":7,"./galgulator/io/screen":8}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _uuid = require('../uuid');

var _uuid2 = _interopRequireDefault(_uuid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var Eventist = function () {
  function Eventist() {
    _classCallCheck(this, Eventist);

    this.id = this.id || (0, _uuid2.default)();
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


  _createClass(Eventist, [{
    key: 'watch',
    value: function watch(child) {
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

  }, {
    key: 'unwatch',
    value: function unwatch(child) {
      if (!this._eventistChildren || !this._eventistChildren[child.id]) {
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

  }, {
    key: 'subscribe',
    value: function subscribe(parent) {
      if (!this.id) {
        throw new Error('An eventist need an id to be able to subscribe');
      }

      if (!(parent instanceof Eventist)) {
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

  }, {
    key: 'unsubscribe',
    value: function unsubscribe(parent) {
      if (!this._eventistParent) {
        throw new Error('But .. this eventist has no parent');
      }
      if (parent && parent != this._eventistParent) {
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

  }, {
    key: 'on',
    value: function on(events, callback, flag) {
      var listeners = this._eventListeners = this._eventListeners || {};

      // let's support multi event binding at a time
      //   separated by common delimiters, just like
      //   the other js famous frameworks/libraries
      events.split(/ |,|;|\|/).forEach(function (evt) {
        listeners[evt] = listeners[evt] || [];

        flag = flag || 'append';

        if ('append' == flag) {
          listeners[evt].push(callback);
        } else if ('prepend' == flag) {
          listeners[evt].unshift(callback);
        } else if ('set' == flag) {
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

  }, {
    key: 'dispatchEvent',
    value: function dispatchEvent(evt, args, origin) {
      if (this._eventListeners) {
        var callbacks = this._eventListeners[evt];

        if (callbacks && callbacks.length) {
          for (var idx in callbacks) {
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

  }, {
    key: 'emit',
    value: function emit(evt, args, origin) {
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

  }, {
    key: 'trigger',
    value: function trigger() {
      return this.emit.apply(this, arguments);
    }

    /**
     * @name Eventist#broadcast
     * @method
     * @param {string} event
     * @param {Object} [args]
     * @return {Eventist} this
     */

  }, {
    key: 'broadcast',
    value: function broadcast(evt, args, origin) {
      // Regarding the origin, @see above
      origin = origin || {
        eventType: 'broadcast',
        target: this,
        hop: []
      };

      origin.hop.push(this);

      this.dispatchEvent(evt, args, origin);

      if (this._eventistChildren) {
        for (var idx in this._eventistChildren) {
          // Inverse bubbling bubbling
          this._eventistChildren[idx].broadcast(evt, args, origin);
        }
      }

      return this;
    }
  }]);

  return Eventist;
}();

exports.default = Eventist;

},{"../uuid":10}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventist = require('../eventist');

var _eventist2 = _interopRequireDefault(_eventist);

var _promise = require('../promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * @name Galgulator
 * @class
 * @extends Eventist
 * @description
 * The idea is we'll have a base galgulator, with just a CPU.
 * All external components (keypad, screen, history stack ..) are IO, and should
 * extend from IOAbstract, then could be added to the base galgulator. With this
 * approach, we could extend it easy later.
 */

var Galgulator = function (_Eventist) {
  _inherits(Galgulator, _Eventist);

  function Galgulator() {
    _classCallCheck(this, Galgulator);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Galgulator).call(this));

    _this.ios = [];
    _this.queue = [];
    _this.historyStack = [];
    return _this;
  }

  _createClass(Galgulator, [{
    key: 'addIO',
    value: function addIO(io) {
      io.setGalgulator(this);
      this.ios.push(io);

      return this;
    }
  }, {
    key: 'enqueue',
    value: function enqueue(op) {
      op = op.trim();
      if (op) {
        this.queue.push(op);

        this.broadcast('enqueue', {
          queue: this.queue,
          op: op
        });
      }
      return this;
    }
  }, {
    key: 'dequeue',
    value: function dequeue() {
      if (this.queue.length) {
        var op = this.queue.pop();

        this.broadcast('dequeue', {
          queue: this.queue,
          op: op
        });
      }
      return this;
    }
  }, {
    key: 'clear',
    value: function clear() {
      var exQueue = this.queue;

      this.queue = [];

      this.broadcast('clear', {
        queue: this.queue,
        exQueue: exQueue
      });

      return this;
    }
  }, {
    key: 'resolve',
    value: function resolve() {
      var _this2 = this;

      var expression = this.queue.join('');

      // Remove spaces, trailing operators, and redundant 0
      expression = expression.replace(/\s+|\b0+|[^\d]+$/g, '');

      // Convert to js friendly
      expression = expression.replace(/x/gi, '*').replace(/:/gi, '/');

      // TODO generalize this, use a lot
      // Handle pow by transforming
      //   x^y^z to Math.pow(x, Math.pow(y, z))
      expression = expression.replace(/\d+(?:\^\d+)+/g, function (exp) {
        var powOperands = exp.split('^');
        var n = powOperands.length;

        var powExpression = powOperands[n - 1];
        for (var i = n - 2; i > -1; --i) {
          powExpression = 'Math.pow(' + powOperands[i] + ',' + powExpression + ')';
        }

        return powExpression;
      });

      return new _promise2.default(function (resolve, reject) {
        var result = new Function('return ' + expression)();

        // Save the history
        _this2.historyStack.push(_this2.queue);

        // Refresh the queue, and resolve
        _this2.queue = [result];
        _this2.broadcast('resolve', {
          historyStack: _this2.historyStack,
          queue: _this2.queue
        });

        resolve(result);
      });
    }
  }]);

  return Galgulator;
}(_eventist2.default);

exports.default = Galgulator;

},{"../eventist":2,"../promise":9}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _eventist = require('../../eventist');

var _eventist2 = _interopRequireDefault(_eventist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOAbstract = function (_Eventist) {
  _inherits(IOAbstract, _Eventist);

  function IOAbstract() {
    _classCallCheck(this, IOAbstract);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(IOAbstract).call(this));
  }

  _createClass(IOAbstract, [{
    key: 'setGalgulator',
    value: function setGalgulator(galgulator) {
      if (galgulator) {
        this.galgulator = galgulator;
        this.subscribe(galgulator);
      } else {
        this.galgulator = null;
        this.unsubscribe();
      }

      return this;
    }
  }]);

  return IOAbstract;
}(_eventist2.default);

exports.default = IOAbstract;

},{"../../eventist":2}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _screen = require('./screen');

var _screen2 = _interopRequireDefault(_screen);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOHistoryStack = function (_IOScreen) {
  _inherits(IOHistoryStack, _IOScreen);

  function IOHistoryStack(el) {
    _classCallCheck(this, IOHistoryStack);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(IOHistoryStack).call(this, el));
  }

  _createClass(IOHistoryStack, [{
    key: 'attachTo',
    value: function attachTo(el) {
      var _this2 = this;

      this.el = el;

      this.on('resolve', function (evt, data) {
        el.innerHTML = _this2.render(data.historyStack);
      });
    }

    /**
     * @param {Array} galgulator history stack
     * @return {String} html
     */

  }, {
    key: 'render',
    value: function render(historyStack) {
      var _this3 = this;

      var html = '';

      if (historyStack.length) {
        html = historyStack.map(function (queue) {
          return _get(Object.getPrototypeOf(IOHistoryStack.prototype), 'render', _this3).call(_this3, queue).replace(/^.+$/, '<div class="state">$& =</div>');
        }).reverse() // we need to render it upside-down
        .join('');
      }

      return html;
    }
  }]);

  return IOHistoryStack;
}(_screen2.default);

exports.default = IOHistoryStack;

},{"./screen":8}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _abstract = require('./abstract');

var _abstract2 = _interopRequireDefault(_abstract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOKeyWatch = function (_IOAbstract) {
  _inherits(IOKeyWatch, _IOAbstract);

  function IOKeyWatch(el) {
    _classCallCheck(this, IOKeyWatch);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IOKeyWatch).call(this));

    el && _this.attachTo(el);
    return _this;
  }

  _createClass(IOKeyWatch, [{
    key: 'attachTo',
    value: function attachTo(el) {
      var _this2 = this;

      this.el = el;

      el.tabIndex = 1;
      el.addEventListener('keypress', function (evt) {
        _this2.key(evt);
      }, false);
    }
  }, {
    key: 'key',
    value: function key(evt) {
      evt.preventDefault();

      if (13 == evt.keyCode) {
        this.galgulator.resolve();
      } else if (8 == evt.keyCode) {
        this.galgulator.dequeue();
      } else if (46 == evt.keyCode) {
        this.galgulator.clear();
      } else {
        var keyString = evt.key;

        if ('^' === keyString || '+' === keyString || '-' === keyString || 'x' === keyString || ':' === keyString || !isNaN(keyString)) {
          this.galgulator.enqueue(keyString);
        } else if ('*' == keyString) {
          this.galgulator.enqueue('x');
        } else if ('/' == keyString) {
          this.galgulator.enqueue(':');
        }
      }

      return this;
    }
  }]);

  return IOKeyWatch;
}(_abstract2.default);

exports.default = IOKeyWatch;

},{"./abstract":4}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _abstract = require('./abstract');

var _abstract2 = _interopRequireDefault(_abstract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOKeypad = function (_IOAbstract) {
  _inherits(IOKeypad, _IOAbstract);

  function IOKeypad(el) {
    _classCallCheck(this, IOKeypad);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IOKeypad).call(this));

    el && _this.attachTo(el);
    return _this;
  }

  _createClass(IOKeypad, [{
    key: 'attachTo',
    value: function attachTo(el) {
      var _this2 = this;

      this.el = el;

      el.addEventListener('click', function (evt) {
        _this2.key(evt.target.dataset.keyData);
      }, false);
    }
  }, {
    key: 'key',
    value: function key(keyData) {
      if ('AC' == keyData) {
        this.galgulator.clear();
      } else if ('CE' == keyData) {
        this.galgulator.dequeue();
      } else if ('=' == keyData) {
        this.galgulator.resolve();
      } else if (keyData) {
        this.galgulator.enqueue(keyData);
      }

      return this;
    }
  }]);

  return IOKeypad;
}(_abstract2.default);

exports.default = IOKeypad;

},{"./abstract":4}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _abstract = require('./abstract');

var _abstract2 = _interopRequireDefault(_abstract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOScreen = function (_IOAbstract) {
  _inherits(IOScreen, _IOAbstract);

  function IOScreen(el) {
    _classCallCheck(this, IOScreen);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IOScreen).call(this, el));

    el && _this.attachTo(el);
    return _this;
  }

  _createClass(IOScreen, [{
    key: 'attachTo',
    value: function attachTo(el) {
      var _this2 = this;

      this.el = el;

      this.on('enqueue dequeue clear resolve', function (evt, data) {
        el.innerHTML = _this2.render(data.queue);
      });
    }

    /**
     * @param {Array} galgulator queue
     * @return {String} html
     */

  }, {
    key: 'render',
    value: function render(queue) {
      var html = queue.join('');

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
      html = html.replace(/(?:\d+\^)+\d*/g, function (exp) {
        var powOperands = exp.split('^');
        var n = powOperands.length;

        var powExpression = powOperands[n - 1] || '@placeholder@';
        for (var i = n - 2; i > -1; --i) {
          powExpression = '<span class="expr pow">' + powOperands[i] + '@spliter@' + powExpression + '</span>';
        }

        return powExpression;
      });

      // Wrap around no and op
      html = html.replace(/\d+/g, '<span class="no">$&</span>').replace(/[-+:]|\bx\b/g, '<span class="op">$&</span>');

      // And get rid of system elements
      html = html.replace(/@spliter@/gi, '').replace(/@placeholder@/gi, '<span class="blk">&#9744;</span>');

      return html;
    }
  }]);

  return IOScreen;
}(_abstract2.default);

exports.default = IOScreen;

},{"./abstract":4}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @name Promise
 * @class
 * @description
 * A Promise parody, as the ES6 one is not ready as promised. This is not a proper Promise, but a working polyfill for our galgulator, yeah.
 */

var Promise = function () {
  function Promise(process) {
    var _this = this;

    _classCallCheck(this, Promise);

    this.onSuccess = [];
    this.onError = [];

    if (process) {
      setTimeout(function () {
        process(function (data) {
          return _this.resolve(data);
        }, function (data) {
          return _this.reject(data);
        });
      }, 0);
    }
  }

  _createClass(Promise, [{
    key: "resolve",
    value: function resolve(data) {
      this.onSuccess.forEach(function (fn) {
        return fn(data);
      });
      return this;
    }
  }, {
    key: "reject",
    value: function reject(data) {
      this.onError.forEach(function (fn) {
        return fn(data);
      });
      return this;
    }
  }, {
    key: "then",
    value: function then(fn) {
      this.onSuccess.push(fn);
      return this;
    }
  }, {
    key: "catch",
    value: function _catch(fn) {
      this.onError.push(fn);
      return this;
    }
  }, {
    key: "finally",
    value: function _finally(fn) {
      this.onSuccess.push(fn);
      this.onError.push(fn);
      return this;
    }
  }]);

  return Promise;
}();

exports.default = Promise;

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return (new Date().getTime().toString(36) + Math.random().toString(36).slice(-8)).match(/.{1,4}/gi).join('-');
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9hcHAuanMiLCJzcmMvc2NyaXB0cy9ldmVudGlzdC9pbmRleC5qcyIsInNyYy9zY3JpcHRzL2dhbGd1bGF0b3IvaW5kZXguanMiLCJzcmMvc2NyaXB0cy9nYWxndWxhdG9yL2lvL2Fic3RyYWN0LmpzIiwic3JjL3NjcmlwdHMvZ2FsZ3VsYXRvci9pby9oaXN0b3J5LXN0YWNrLmpzIiwic3JjL3NjcmlwdHMvZ2FsZ3VsYXRvci9pby9rZXktd2F0Y2guanMiLCJzcmMvc2NyaXB0cy9nYWxndWxhdG9yL2lvL2tleXBhZC5qcyIsInNyYy9zY3JpcHRzL2dhbGd1bGF0b3IvaW8vc2NyZWVuLmpzIiwic3JjL3NjcmlwdHMvcHJvbWlzZS9pbmRleC5qcyIsInNyYy9zY3JpcHRzL3V1aWQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDT0EsTUFBTSxTQUFOLENBQWdCLEtBQWhCLENBQXNCLElBQXRCLENBQTJCLFNBQVMsc0JBQVQsQ0FBZ0MsWUFBaEMsQ0FBM0IsRUFDQyxPQURELENBQ1MsY0FBTTtBQUNiLE1BQU0sYUFBYSwwQkFBYjs7O0FBRE8sT0FJYixDQUFNLFNBQU4sQ0FBZ0IsS0FBaEIsQ0FBc0IsSUFBdEIsQ0FBMkIsR0FBRyxzQkFBSCxDQUEwQixRQUExQixDQUEzQixFQUNHLE9BREgsQ0FDVyxjQUFNO0FBQ2IsZUFBVyxLQUFYLENBQWlCLHFCQUF1QixFQUF2QixDQUFqQixFQURhO0dBQU4sQ0FEWDs7O0FBSmEsWUFVYixDQUFXLEtBQVgsQ0FBaUIsdUJBQXlCLEVBQXpCLENBQWpCOzs7QUFWYSxPQWFiLENBQU0sU0FBTixDQUFnQixLQUFoQixDQUFzQixJQUF0QixDQUEyQixHQUFHLGdCQUFILENBQW9CLGdCQUFwQixDQUEzQixFQUNHLE9BREgs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TCxHQUFjLFFBQWQsQ0FBdUIsRUFBdkIsRUFBMkIsS0FBM0IsQ0FBaUMsQ0FBQyxDQUFELENBRG5DLENBREssQ0FJTixLQUpNLENBSUEsVUFKQSxFQUtOLElBTE0sQ0FLRCxHQUxDLENBQVAsQ0FEd0I7Q0FBWCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgR2FsZ3VsYXRvciBmcm9tICcuL2dhbGd1bGF0b3InO1xuaW1wb3J0IEdhbGd1bGF0b3JJT1NjcmVlbiBmcm9tICcuL2dhbGd1bGF0b3IvaW8vc2NyZWVuJztcbmltcG9ydCBHYWxndWxhdG9ySU9IaXN0b3J5U3RhY2sgZnJvbSAnLi9nYWxndWxhdG9yL2lvL2hpc3Rvcnktc3RhY2snO1xuaW1wb3J0IEdhbGd1bGF0b3JJT0tleXBhZCBmcm9tICcuL2dhbGd1bGF0b3IvaW8va2V5cGFkJztcbmltcG9ydCBHYWxndWxhdG9ySU9LZXlXYXRjaCBmcm9tICcuL2dhbGd1bGF0b3IvaW8va2V5LXdhdGNoJztcblxuLy8gVHJhbnNmb3JtIGFsbCBnYWxndWxhdG9yIGludG8gbGl2aW5nIGNyZWF0dXJlc1xuQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnZ2FsZ3VsYXRvcicpKVxuLmZvckVhY2goZWwgPT4ge1xuICBjb25zdCBnYWxndWxhdG9yID0gbmV3IEdhbGd1bGF0b3IoKTtcblxuICAvLyBJbnB1dCBrZXlwYWRcbiAgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZWwuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgna2V5cGFkJykpXG4gICAgLmZvckVhY2goZWwgPT4ge1xuICAgICAgZ2FsZ3VsYXRvci5hZGRJTyhuZXcgR2FsZ3VsYXRvcklPS2V5cGFkKGVsKSk7XG4gICAgfSk7XG5cbiAgLy8gSW5wdXQga2V5IHdhdGNoLCBsaXN0ZW4gdG8ga2V5Ym9hcmQgaW5wdXRcbiAgZ2FsZ3VsYXRvci5hZGRJTyhuZXcgR2FsZ3VsYXRvcklPS2V5V2F0Y2goZWwpKTtcblxuICAvLyBPdXRwdXQgc2NyZWVuXG4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5oaXN0b3J5LXN0YWNrJykpXG4gICAgLmZvckVhY2goZWwgPT4ge1xuICAgICAgZ2FsZ3VsYXRvci5hZGRJTyhuZXcgR2FsZ3VsYXRvcklPSGlzdG9yeVN0YWNrKGVsKSk7XG4gICAgfSk7XG5cbiAgLy8gT3V0cHV0IGhpc3Rvcnkgc3RhY2tzXG4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zY3JlZW4gLnEnKSlcbiAgICAuZm9yRWFjaChlbCA9PiB7XG4gICAgICBnYWxndWxhdG9yLmFkZElPKG5ldyBHYWxndWxhdG9ySU9TY3JlZW4oZWwpKTtcbiAgICB9KTtcbn0pO1xuIiwiaW1wb3J0IHV1aWQgZnJvbSAnLi4vdXVpZCc7XG5cbi8qKlxuICogQG5hbWUgRXZlbnRpc3RcbiAqIEBjbGFzc1xuICogQGRlc2NyaXB0aW9uXG4gKiBJbnNwaXJlZCBieSBodHRwczovL2RvY3MuYW5ndWxhcmpzLm9yZy9hcGkvbmcvdHlwZS8kcm9vdFNjb3BlLlNjb3BlXG4gKlxuICogQW4gZXZlbnRpc3QgY2FuIGBlbWl0YCAoYWthIGB0cmlnZ2VyYCBpbiBqUXVlcnkgRE9NKSBldmVudCwgbGlzdGVuIHRvXG4gKiBldmVudCB3aXRoIGBvbmAgKG11Y2ggbGlrZSBgb25gIGluIGpRdWVyeSBET00pIG9yIGV2ZW4gYGJyb2FkY2FzdGAgZXZlbnRcbiAqXG4gKiBXaXRoIGBlbWl0YCwgZXZlbnQgZmxvd3MgYXMgaW4gdGhlIGJ1YmJsaW5nIHBoYXNlIG9mIGJyb3dzZXIgRE9NLCBzdGFydFxuICogZGlzcGF0Y2hpbmcgZnJvbSB0aGUgdGFyZ2V0LCB0aGVuIHRhcmdldCdzIHBhcmVudCwgdGhlbiB0YXJnZXQnc1xuICogcGFyZW50J3MgcGFyZW50IC4uLlxuICpcbiAqIFdpdGggYGJyb2FkY2FzdGAsIGV2ZW50IGZsb3dzIGFzIGluIHRoZSBjYXB0dXJpbmcgcGhhc2UgYnJvd3NlciBET00sXG4gKiBzdGFydCBkaXNwYXRjaGluZyBmcm9tIHRoZSB0YXJnZXQsIHRoZW4gdGFyZ2V0J3MgY2hpbGRyZW4sIHRoZW4gdGFyZ2V0J3NcbiAqIGNoaWxkcmVuJ3MgY2hpbGRyZW4gLi4uXG4gKlxuICogQnV0IGhvdyBjYW4gYW4gZXZlbnRpc3Qga25vdyB3aG8ncyBpdHMgcGFyZW50LCBpbiBvcmRlciB0byBwcm9wYWdhdGVcbiAqIGV2ZW50PyBHb29kIHF1ZXN0aW9uISBBIHBhcmVudCBtdXN0IGJlIHNldCBleHBsaWNpdGx5LiBXZWxsLCBpbnN0ZWFkIG9mXG4gKiBjYWxsaW5nIGl0IHBhcmVudCwgbGV0J3MgdXNlIHRoZSB3b3JkIHN1YnNjcmliZXJcbiAqXG4gKiBPaCwgYW5kIHdlIGFsc28gaGF2ZSBldmVudC5zdG9wUHJvcGFnYXRpb24oKSBhbmQgZXZlbnQucHJldmVudERlZmF1bHQoKSxcbiAqIGFzIGEgcmVhbCBub3JtYWwgRE9NIGV2ZW50LCBidXQgLi4gI3RvQmVJbXBsZW1lbnRlZFxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBFdmVudGlzdCB7XG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuaWQgPSB0aGlzLmlkIHx8IHV1aWQoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmFtZSBFdmVudGlzdCN3YXRjaFxuICAgKiBAbWV0aG9kXG4gICAqIEBwYXJhbSB7RXZlbnRpc3R9IGNoaWxkXG4gICAqIEByZXR1cm4ge0V2ZW50aXN0fSB0aGlzXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBUaGUgaWRlYSBpcyB3ZSBkb24ndCB3YW50IGFuIG9iamVjdCB0byBtb2RpZnkgYW5vdGhlciBvYmplY3QncyB2YXJpYWJsZXNcbiAgICogU28gbGV0IGl0IG1vZGlmeSBpdHNlbGYgaW4gdGhlIHdheSBpdCB3YW50IHRvIGJlLiBXaWxsIGJlIGNhbGxlZCB3aGVuXG4gICAqIHRoZXJlJ3MgYSBzdWJzY3JpcHRpb24gcmVxdWVzdFxuICAgKi9cbiAgd2F0Y2goY2hpbGQpIHtcbiAgICAvLyBJbml0aWFsaXplIHRoZSBfZXZlbnRpc3RDaGlsZHJlbiBsaXN0LCBpZiBuZWVkZWRcbiAgICB0aGlzLl9ldmVudGlzdENoaWxkcmVuID0gdGhpcy5fZXZlbnRpc3RDaGlsZHJlbiB8fCB7fTtcbiAgICB0aGlzLl9ldmVudGlzdENoaWxkcmVuW2NoaWxkLmlkXSA9IGNoaWxkO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQG5hbWUgRXZlbnRpc3QjdW53YXRjaFxuICAgKiBAbWV0aG9kXG4gICAqIEBwYXJhbSB7RXZlbnRpc3R9IGNoaWxkXG4gICAqIEByZXR1cm4ge0V2ZW50aXN0fSB0aGlzXG4gICAqIEBzZWUgRXZlbnRpc3QjbWF0Y2hcbiAgICovXG4gIHVud2F0Y2goY2hpbGQpIHtcbiAgICBpZighdGhpcy5fZXZlbnRpc3RDaGlsZHJlbiB8fCAhdGhpcy5fZXZlbnRpc3RDaGlsZHJlbltjaGlsZC5pZF0pIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IGZpbmQgdGhpcyBldmVudGlzdCBpbiB0aGUgcGFyZW50IGNoaWxkcmVuIGxpc3QnKTtcbiAgICB9XG5cbiAgICBkZWxldGUgdGhpcy5fZXZlbnRpc3RDaGlsZHJlbltjaGlsZC5pZF07XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmFtZSBFdmVudGlzdCNzdWJzY3JpYmVcbiAgICogQG1ldGhvZFxuICAgKiBAcGFyYW0ge0V2ZW50aXN0fSBwYXJlbnRcbiAgICogQHJldHVybiB7RXZlbnRpc3R9IHRoaXNcbiAgICovXG4gIHN1YnNjcmliZShwYXJlbnQpIHtcbiAgICBpZighdGhpcy5pZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdBbiBldmVudGlzdCBuZWVkIGFuIGlkIHRvIGJlIGFibGUgdG8gc3Vic2NyaWJlJyk7XG4gICAgfVxuXG4gICAgaWYoIShwYXJlbnQgaW5zdGFuY2VvZiBFdmVudGlzdCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQW4gZXZlbnRpc3QgY291bGQgb25seSBzdWJzY3JpYmUgdG8gYW5vdGhlciBldmVudGlzdCcpO1xuICAgIH1cblxuICAgIHBhcmVudC53YXRjaCh0aGlzKTtcbiAgICB0aGlzLl9ldmVudGlzdFBhcmVudCA9IHBhcmVudDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuYW1lIEV2ZW50aXN0I3Vuc3Vic2NyaWJlXG4gICAqIEBtZXRob2RcbiAgICogQHBhcmFtIHtFdmVudGlzdH0gW3BhcmVudF1cbiAgICogQHJldHVybiB7RXZlbnRpc3R9IHRoaXNcbiAgICovXG4gIHVuc3Vic2NyaWJlKHBhcmVudCkge1xuICAgIGlmKCF0aGlzLl9ldmVudGlzdFBhcmVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdCdXQgLi4gdGhpcyBldmVudGlzdCBoYXMgbm8gcGFyZW50JylcbiAgICB9XG4gICAgaWYocGFyZW50ICYmIHBhcmVudCAhPSB0aGlzLl9ldmVudGlzdFBhcmVudCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgdW5zdWJzY3JpYmUgZnJvbSBhIHBhcmVudCBvZiBzb21lb25lIGVsc2UsIGxvbCcpO1xuICAgIH1cblxuICAgIC8vIFN1cHBvcnQgbm8gcGFyYW1cbiAgICAvLyAgIHRvIHVuc3Vic2NyaWJlIGZyb20gY3VycmVudCBwYXJlbnRcbiAgICBwYXJlbnQgPSBwYXJlbnQgfHwgdGhpcy5fZXZlbnRpc3RQYXJlbnQ7XG5cbiAgICBwYXJlbnQudW53YXRjaCh0aGlzKTtcbiAgICB0aGlzLl9ldmVudGlzdFBhcmVudCA9IG51bGw7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmFtZSBFdmVudGlzdCNvblxuICAgKiBAbWV0aG9kXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudHNcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtmbGFnXVxuICAgKiBAcmV0dXJuIHtFdmVudGlzdH0gdGhpc1xuICAgKi9cbiAgb24oZXZlbnRzLCBjYWxsYmFjaywgZmxhZykge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50TGlzdGVuZXJzID0gdGhpcy5fZXZlbnRMaXN0ZW5lcnMgfHwge307XG5cbiAgICAvLyBsZXQncyBzdXBwb3J0IG11bHRpIGV2ZW50IGJpbmRpbmcgYXQgYSB0aW1lXG4gICAgLy8gICBzZXBhcmF0ZWQgYnkgY29tbW9uIGRlbGltaXRlcnMsIGp1c3QgbGlrZVxuICAgIC8vICAgdGhlIG90aGVyIGpzIGZhbW91cyBmcmFtZXdvcmtzL2xpYnJhcmllc1xuICAgIGV2ZW50cy5zcGxpdCgvIHwsfDt8XFx8LykuZm9yRWFjaChldnQgPT4ge1xuICAgICAgbGlzdGVuZXJzW2V2dF0gPSBsaXN0ZW5lcnNbZXZ0XSB8fCBbXTtcblxuICAgICAgZmxhZyA9IGZsYWcgfHwgJ2FwcGVuZCc7XG5cbiAgICAgIGlmKCdhcHBlbmQnID09IGZsYWcpIHtcbiAgICAgICAgbGlzdGVuZXJzW2V2dF0ucHVzaChjYWxsYmFjayk7XG4gICAgICB9IGVsc2UgaWYoJ3ByZXBlbmQnID09IGZsYWcpIHtcbiAgICAgICAgbGlzdGVuZXJzW2V2dF0udW5zaGlmdChjYWxsYmFjayk7XG4gICAgICB9IGVsc2UgaWYoJ3NldCcgPT0gZmxhZykge1xuICAgICAgICBsaXN0ZW5lcnNbZXZ0XSA9IFtjYWxsYmFja107XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmFtZSBFdmVudGlzdCNkaXNwYXRjaEV2ZW50XG4gICAqIEBtZXRob2RcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnc11cbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcmlnaW5dXG4gICAqIEByZXR1cm4ge0V2ZW50aXN0fSB0aGlzXG4gICAqIEBkZXNjcmlwdGlvblxuICAgKiBEaXNwYXRjaCBldmVudCB3aXRob3V0IGFueSBidWJibGluZ1xuICAgKi9cbiAgZGlzcGF0Y2hFdmVudChldnQsIGFyZ3MsIG9yaWdpbikge1xuICAgIGlmKHRoaXMuX2V2ZW50TGlzdGVuZXJzKSB7XG4gICAgICBjb25zdCBjYWxsYmFja3MgPSB0aGlzLl9ldmVudExpc3RlbmVyc1tldnRdO1xuXG4gICAgICBpZihjYWxsYmFja3MgJiYgY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmb3IobGV0IGlkeCBpbiBjYWxsYmFja3MpIHtcbiAgICAgICAgICBjYWxsYmFja3NbaWR4XS5jYWxsKHRoaXMsIG9yaWdpbiB8fCB7fSwgYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmFtZSBFdmVudGlzdCNlbWl0XG4gICAqIEBtZXRob2RcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnc11cbiAgICogQHJldHVybiB7RXZlbnRpc3R9IHRoaXNcbiAgICovXG4gIGVtaXQoZXZ0LCBhcmdzLCBvcmlnaW4pIHtcbiAgICAvLyBUaGUgb3JpZ2luIHNob3VsZCBiZSBwcml2YXRlIGFuZCBub3QgdG8gYmUgZXhwb3NlZCB0byB1c2VyXG4gICAgLy8gICBzaW5jZSBpdCdzIHRvdGFsbHkgaW50ZXJuYWwgZm9yIGV2ZW50IG9yaWdpbiB0cmFja2luZyBwdXJwb3NlXG4gICAgLy8gICBUaGUgaWRlYSBpcywgb3JpZ2luIHdvbid0IGJlIHBhc3NlZCBpbiBhbnkgY2FsbFxuICAgIC8vICAgYW5kIHRoZSBmaXJzdCB0cmlnZ2VyIGluIGEgY2hhaW4gd2lsbCBwcm9wb3NlIGEgbmV3IG9yaWdpblxuICAgIG9yaWdpbiA9IG9yaWdpbiB8fCB7XG4gICAgICBldmVudFR5cGU6ICdlbWl0JyxcbiAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgIGhvcDogW11cbiAgICB9O1xuXG4gICAgb3JpZ2luLmhvcC5wdXNoKHRoaXMpOyAvLyB5ZXAsIHdlJ3JlIG5vdyBvbmUgaG9wIGluIHRoZSBldmVudCBwYXRoXG5cbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoZXZ0LCBhcmdzLCBvcmlnaW4pO1xuXG4gICAgLy8gQnViYmxpbmcgYnViYmxpbmdcbiAgICB0aGlzLl9ldmVudGlzdFBhcmVudCAmJiB0aGlzLl9ldmVudGlzdFBhcmVudC5lbWl0KGV2dCwgYXJncywgb3JpZ2luKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuYW1lIEV2ZW50aXN0I3RyaWdnZXJcbiAgICogQG1ldGhvZFxuICAgKiBAYWxpYXMgRXZlbnRpc3QjZW1pdFxuICAgKi9cbiAgdHJpZ2dlcigpIHtcbiAgICByZXR1cm4gdGhpcy5lbWl0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICAvKipcbiAgICogQG5hbWUgRXZlbnRpc3QjYnJvYWRjYXN0XG4gICAqIEBtZXRob2RcbiAgICogQHBhcmFtIHtzdHJpbmd9IGV2ZW50XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnc11cbiAgICogQHJldHVybiB7RXZlbnRpc3R9IHRoaXNcbiAgICovXG4gIGJyb2FkY2FzdChldnQsIGFyZ3MsIG9yaWdpbikge1xuICAgIC8vIFJlZ2FyZGluZyB0aGUgb3JpZ2luLCBAc2VlIGFib3ZlXG4gICAgb3JpZ2luID0gb3JpZ2luIHx8IHtcbiAgICAgIGV2ZW50VHlwZTogJ2Jyb2FkY2FzdCcsXG4gICAgICB0YXJnZXQ6IHRoaXMsXG4gICAgICBob3A6IFtdXG4gICAgfTtcblxuICAgIG9yaWdpbi5ob3AucHVzaCh0aGlzKTtcblxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldnQsIGFyZ3MsIG9yaWdpbik7XG5cbiAgICBpZih0aGlzLl9ldmVudGlzdENoaWxkcmVuKSB7XG4gICAgICBmb3IobGV0IGlkeCBpbiB0aGlzLl9ldmVudGlzdENoaWxkcmVuKSB7XG4gICAgICAgIC8vIEludmVyc2UgYnViYmxpbmcgYnViYmxpbmdcbiAgICAgICAgdGhpcy5fZXZlbnRpc3RDaGlsZHJlbltpZHhdLmJyb2FkY2FzdChldnQsIGFyZ3MsIG9yaWdpbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiIsImltcG9ydCBFdmVudGlzdCBmcm9tICcuLi9ldmVudGlzdCc7XG5pbXBvcnQgUHJvbWlzZSBmcm9tICcuLi9wcm9taXNlJztcblxuLyoqXG4gKiBAbmFtZSBHYWxndWxhdG9yXG4gKiBAY2xhc3NcbiAqIEBleHRlbmRzIEV2ZW50aXN0XG4gKiBAZGVzY3JpcHRpb25cbiAqIFRoZSBpZGVhIGlzIHdlJ2xsIGhhdmUgYSBiYXNlIGdhbGd1bGF0b3IsIHdpdGgganVzdCBhIENQVS5cbiAqIEFsbCBleHRlcm5hbCBjb21wb25lbnRzIChrZXlwYWQsIHNjcmVlbiwgaGlzdG9yeSBzdGFjayAuLikgYXJlIElPLCBhbmQgc2hvdWxkXG4gKiBleHRlbmQgZnJvbSBJT0Fic3RyYWN0LCB0aGVuIGNvdWxkIGJlIGFkZGVkIHRvIHRoZSBiYXNlIGdhbGd1bGF0b3IuIFdpdGggdGhpc1xuICogYXBwcm9hY2gsIHdlIGNvdWxkIGV4dGVuZCBpdCBlYXN5IGxhdGVyLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBHYWxndWxhdG9yIGV4dGVuZHMgRXZlbnRpc3Qge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5pb3MgPSBbXTtcbiAgICB0aGlzLnF1ZXVlID0gW107XG4gICAgdGhpcy5oaXN0b3J5U3RhY2sgPSBbXTtcbiAgfVxuXG4gIGFkZElPKGlvKSB7XG4gICAgaW8uc2V0R2FsZ3VsYXRvcih0aGlzKTtcbiAgICB0aGlzLmlvcy5wdXNoKGlvKTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZW5xdWV1ZShvcCkge1xuICAgIG9wID0gb3AudHJpbSgpO1xuICAgIGlmKG9wKSB7XG4gICAgICB0aGlzLnF1ZXVlLnB1c2gob3ApO1xuXG4gICAgICB0aGlzLmJyb2FkY2FzdCgnZW5xdWV1ZScsIHtcbiAgICAgICAgcXVldWU6IHRoaXMucXVldWUsXG4gICAgICAgIG9wLFxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgZGVxdWV1ZSgpIHtcbiAgICBpZih0aGlzLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgY29uc3Qgb3AgPSB0aGlzLnF1ZXVlLnBvcCgpO1xuXG4gICAgICB0aGlzLmJyb2FkY2FzdCgnZGVxdWV1ZScsIHtcbiAgICAgICAgcXVldWU6IHRoaXMucXVldWUsXG4gICAgICAgIG9wLFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBjb25zdCBleFF1ZXVlID0gdGhpcy5xdWV1ZTtcblxuICAgIHRoaXMucXVldWUgPSBbXTtcblxuICAgIHRoaXMuYnJvYWRjYXN0KCdjbGVhcicsIHtcbiAgICAgIHF1ZXVlOiB0aGlzLnF1ZXVlLFxuICAgICAgZXhRdWV1ZSxcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzb2x2ZSgpIHtcbiAgICBsZXQgZXhwcmVzc2lvbiA9IHRoaXMucXVldWUuam9pbignJyk7XG5cbiAgICAvLyBSZW1vdmUgc3BhY2VzLCB0cmFpbGluZyBvcGVyYXRvcnMsIGFuZCByZWR1bmRhbnQgMFxuICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLnJlcGxhY2UoL1xccyt8XFxiMCt8W15cXGRdKyQvZywgJycpO1xuXG4gICAgLy8gQ29udmVydCB0byBqcyBmcmllbmRseVxuICAgIGV4cHJlc3Npb24gPSBleHByZXNzaW9uLnJlcGxhY2UoL3gvZ2ksICcqJykucmVwbGFjZSgvOi9naSwgJy8nKTtcblxuICAgIC8vIFRPRE8gZ2VuZXJhbGl6ZSB0aGlzLCB1c2UgYSBsb3RcbiAgICAvLyBIYW5kbGUgcG93IGJ5IHRyYW5zZm9ybWluZ1xuICAgIC8vICAgeF55XnogdG8gTWF0aC5wb3coeCwgTWF0aC5wb3coeSwgeikpXG4gICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmVwbGFjZSgvXFxkKyg/OlxcXlxcZCspKy9nLCBleHAgPT4ge1xuICAgICAgY29uc3QgcG93T3BlcmFuZHMgPSBleHAuc3BsaXQoJ14nKTtcbiAgICAgIGNvbnN0IG4gPSBwb3dPcGVyYW5kcy5sZW5ndGg7XG5cbiAgICAgIGxldCBwb3dFeHByZXNzaW9uID0gcG93T3BlcmFuZHNbbiAtIDFdO1xuICAgICAgZm9yKGxldCBpPW4tMjsgaT4tMTsgLS1pKSB7XG4gICAgICAgIHBvd0V4cHJlc3Npb24gPSAnTWF0aC5wb3coJyArIHBvd09wZXJhbmRzW2ldICsgJywnICsgcG93RXhwcmVzc2lvbiArICcpJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBvd0V4cHJlc3Npb247XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgcmVzdWx0ID0gbmV3IEZ1bmN0aW9uKCdyZXR1cm4gJyArIGV4cHJlc3Npb24pKCk7XG5cbiAgICAgIC8vIFNhdmUgdGhlIGhpc3RvcnlcbiAgICAgIHRoaXMuaGlzdG9yeVN0YWNrLnB1c2godGhpcy5xdWV1ZSk7XG5cbiAgICAgIC8vIFJlZnJlc2ggdGhlIHF1ZXVlLCBhbmQgcmVzb2x2ZVxuICAgICAgdGhpcy5xdWV1ZSA9IFtyZXN1bHRdO1xuICAgICAgdGhpcy5icm9hZGNhc3QoJ3Jlc29sdmUnLCB7XG4gICAgICAgIGhpc3RvcnlTdGFjazogdGhpcy5oaXN0b3J5U3RhY2ssXG4gICAgICAgIHF1ZXVlOiB0aGlzLnF1ZXVlLFxuICAgICAgfSk7XG5cbiAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICB9KVxuICB9XG59XG4iLCJpbXBvcnQgRXZlbnRpc3QgZnJvbSAnLi4vLi4vZXZlbnRpc3QnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBJT0Fic3RyYWN0IGV4dGVuZHMgRXZlbnRpc3Qge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpXG4gIH1cblxuICBzZXRHYWxndWxhdG9yKGdhbGd1bGF0b3IpIHtcbiAgICBpZihnYWxndWxhdG9yKSB7XG4gICAgICB0aGlzLmdhbGd1bGF0b3IgPSBnYWxndWxhdG9yO1xuICAgICAgdGhpcy5zdWJzY3JpYmUoZ2FsZ3VsYXRvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvciA9IG51bGw7XG4gICAgICB0aGlzLnVuc3Vic2NyaWJlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiIsImltcG9ydCBJT1NjcmVlbiBmcm9tICcuL3NjcmVlbic7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElPSGlzdG9yeVN0YWNrIGV4dGVuZHMgSU9TY3JlZW4ge1xuICBjb25zdHJ1Y3RvcihlbCkge1xuICAgIHN1cGVyKGVsKTtcbiAgfVxuXG4gIGF0dGFjaFRvKGVsKSB7XG4gICAgdGhpcy5lbCA9IGVsO1xuXG4gICAgdGhpcy5vbigncmVzb2x2ZScsIChldnQsIGRhdGEpID0+IHtcbiAgICAgIGVsLmlubmVySFRNTCA9IHRoaXMucmVuZGVyKGRhdGEuaGlzdG9yeVN0YWNrKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge0FycmF5fSBnYWxndWxhdG9yIGhpc3Rvcnkgc3RhY2tcbiAgICogQHJldHVybiB7U3RyaW5nfSBodG1sXG4gICAqL1xuICByZW5kZXIoaGlzdG9yeVN0YWNrKSB7XG4gICAgbGV0IGh0bWwgPSAnJztcblxuICAgIGlmIChoaXN0b3J5U3RhY2subGVuZ3RoKSB7XG4gICAgICBodG1sID0gaGlzdG9yeVN0YWNrXG4gICAgICAgIC5tYXAocXVldWUgPT4ge1xuICAgICAgICAgIHJldHVybiBzdXBlci5yZW5kZXIocXVldWUpXG4gICAgICAgICAgICAucmVwbGFjZSgvXi4rJC8sICc8ZGl2IGNsYXNzPVwic3RhdGVcIj4kJiA9PC9kaXY+Jyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5yZXZlcnNlKCkgLy8gd2UgbmVlZCB0byByZW5kZXIgaXQgdXBzaWRlLWRvd25cbiAgICAgICAgLmpvaW4oJycpO1xuICAgIH1cblxuICAgIHJldHVybiBodG1sO1xuICB9XG59XG4iLCJpbXBvcnQgSU9BYnN0cmFjdCBmcm9tICcuL2Fic3RyYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSU9LZXlXYXRjaCBleHRlbmRzIElPQWJzdHJhY3Qge1xuICBjb25zdHJ1Y3RvcihlbCkge1xuICAgIHN1cGVyKClcbiAgICBlbCAmJiB0aGlzLmF0dGFjaFRvKGVsKTtcbiAgfVxuXG4gIGF0dGFjaFRvKGVsKSB7XG4gICAgdGhpcy5lbCA9IGVsO1xuXG4gICAgZWwudGFiSW5kZXggPSAxO1xuICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2tleXByZXNzJywgZXZ0ID0+IHtcbiAgICAgIHRoaXMua2V5KGV2dCk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAga2V5KGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYoMTMgPT0gZXZ0LmtleUNvZGUpIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvci5yZXNvbHZlKCk7XG4gICAgfSBlbHNlIGlmKDggPT0gZXZ0LmtleUNvZGUpIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvci5kZXF1ZXVlKCk7XG4gICAgfSBlbHNlIGlmKDQ2ID09IGV2dC5rZXlDb2RlKSB7XG4gICAgICB0aGlzLmdhbGd1bGF0b3IuY2xlYXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3Qga2V5U3RyaW5nID0gZXZ0LmtleTtcblxuICAgICAgaWYoXG4gICAgICAgICdeJyA9PT0ga2V5U3RyaW5nXG4gICAgICAgIHx8ICcrJyA9PT0ga2V5U3RyaW5nXG4gICAgICAgIHx8ICctJyA9PT0ga2V5U3RyaW5nXG4gICAgICAgIHx8ICd4JyA9PT0ga2V5U3RyaW5nXG4gICAgICAgIHx8ICc6JyA9PT0ga2V5U3RyaW5nXG4gICAgICAgIHx8ICFpc05hTihrZXlTdHJpbmcpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5nYWxndWxhdG9yLmVucXVldWUoa2V5U3RyaW5nKTtcbiAgICAgIH0gZWxzZSBpZignKicgPT0ga2V5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZ2FsZ3VsYXRvci5lbnF1ZXVlKCd4JylcbiAgICAgIH0gZWxzZSBpZignLycgPT0ga2V5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZ2FsZ3VsYXRvci5lbnF1ZXVlKCc6JylcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiaW1wb3J0IElPQWJzdHJhY3QgZnJvbSAnLi9hYnN0cmFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElPS2V5cGFkIGV4dGVuZHMgSU9BYnN0cmFjdCB7XG4gIGNvbnN0cnVjdG9yKGVsKSB7XG4gICAgc3VwZXIoKVxuICAgIGVsICYmIHRoaXMuYXR0YWNoVG8oZWwpO1xuICB9XG5cbiAgYXR0YWNoVG8oZWwpIHtcbiAgICB0aGlzLmVsID0gZWw7XG5cbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgICB0aGlzLmtleShldnQudGFyZ2V0LmRhdGFzZXQua2V5RGF0YSk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAga2V5KGtleURhdGEpIHtcbiAgICBpZignQUMnID09IGtleURhdGEpIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvci5jbGVhcigpO1xuICAgIH0gZWxzZSBpZignQ0UnID09IGtleURhdGEpIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvci5kZXF1ZXVlKCk7XG4gICAgfSBlbHNlIGlmKCc9JyA9PSBrZXlEYXRhKSB7XG4gICAgICB0aGlzLmdhbGd1bGF0b3IucmVzb2x2ZSgpO1xuICAgIH0gZWxzZSBpZihrZXlEYXRhKSB7XG4gICAgICB0aGlzLmdhbGd1bGF0b3IuZW5xdWV1ZShrZXlEYXRhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiaW1wb3J0IElPQWJzdHJhY3QgZnJvbSAnLi9hYnN0cmFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElPU2NyZWVuIGV4dGVuZHMgSU9BYnN0cmFjdCB7XG4gIGNvbnN0cnVjdG9yKGVsKSB7XG4gICAgc3VwZXIoZWwpO1xuXG4gICAgZWwgJiYgdGhpcy5hdHRhY2hUbyhlbCk7XG4gIH1cblxuICBhdHRhY2hUbyhlbCkge1xuICAgIHRoaXMuZWwgPSBlbDtcblxuICAgIHRoaXMub24oJ2VucXVldWUgZGVxdWV1ZSBjbGVhciByZXNvbHZlJywgKGV2dCwgZGF0YSkgPT4ge1xuICAgICAgZWwuaW5uZXJIVE1MID0gdGhpcy5yZW5kZXIoZGF0YS5xdWV1ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHBhcmFtIHtBcnJheX0gZ2FsZ3VsYXRvciBxdWV1ZVxuICAgKiBAcmV0dXJuIHtTdHJpbmd9IGh0bWxcbiAgICovXG4gIHJlbmRlcihxdWV1ZSkge1xuICAgIGxldCBodG1sID0gcXVldWUuam9pbignJyk7XG5cbiAgICAvLyBXcmFwIHRoZSBwb3cgZXhwcmVzc2lvblxuICAgIC8vXG4gICAgLy8gMl4zXjReNVxuICAgIC8vXG4gICAgLy8gc2hvdWxkIGJlY29tZVxuICAgIC8vXG4gICAgLy8gc3Bhbi5leHByLnBvd1xuICAgIC8vICAgMlxuICAgIC8vICAgc3Bhbi5leHByLnBvd1xuICAgIC8vICAgICAzXG4gICAgLy8gICAgIHNwYW4uZXhwci5wb3dcbiAgICAvLyAgICAgNFxuICAgIC8vICAgICA1XG4gICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKD86XFxkK1xcXikrXFxkKi9nLCBleHAgPT4ge1xuICAgICAgY29uc3QgcG93T3BlcmFuZHMgPSBleHAuc3BsaXQoJ14nKTtcbiAgICAgIGNvbnN0IG4gPSBwb3dPcGVyYW5kcy5sZW5ndGg7XG5cbiAgICAgIGxldCBwb3dFeHByZXNzaW9uID0gcG93T3BlcmFuZHNbbiAtIDFdIHx8ICdAcGxhY2Vob2xkZXJAJztcbiAgICAgIGZvcihsZXQgaT1uLTI7IGk+LTE7IC0taSkge1xuICAgICAgICBwb3dFeHByZXNzaW9uID0gYDxzcGFuIGNsYXNzPVwiZXhwciBwb3dcIj4ke3Bvd09wZXJhbmRzW2ldfUBzcGxpdGVyQCR7cG93RXhwcmVzc2lvbn08L3NwYW4+YDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBvd0V4cHJlc3Npb247XG4gICAgfSk7XG5cbiAgICAvLyBXcmFwIGFyb3VuZCBubyBhbmQgb3BcbiAgICBodG1sID0gaHRtbFxuICAgICAgLnJlcGxhY2UoL1xcZCsvZywgJzxzcGFuIGNsYXNzPVwibm9cIj4kJjwvc3Bhbj4nKVxuICAgICAgLnJlcGxhY2UoL1stKzpdfFxcYnhcXGIvZywgJzxzcGFuIGNsYXNzPVwib3BcIj4kJjwvc3Bhbj4nKTtcblxuICAgIC8vIEFuZCBnZXQgcmlkIG9mIHN5c3RlbSBlbGVtZW50c1xuICAgIGh0bWwgPSBodG1sXG4gICAgICAucmVwbGFjZSgvQHNwbGl0ZXJAL2dpLCAnJylcbiAgICAgIC5yZXBsYWNlKC9AcGxhY2Vob2xkZXJAL2dpLCAnPHNwYW4gY2xhc3M9XCJibGtcIj4mIzk3NDQ7PC9zcGFuPicpO1xuXG4gICAgcmV0dXJuIGh0bWw7XG4gIH1cbn1cbiIsIi8qKlxuICogQG5hbWUgUHJvbWlzZVxuICogQGNsYXNzXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgUHJvbWlzZSBwYXJvZHksIGFzIHRoZSBFUzYgb25lIGlzIG5vdCByZWFkeSBhcyBwcm9taXNlZC4gVGhpcyBpcyBub3QgYSBwcm9wZXIgUHJvbWlzZSwgYnV0IGEgd29ya2luZyBwb2x5ZmlsbCBmb3Igb3VyIGdhbGd1bGF0b3IsIHllYWguXG4gKi9cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFByb21pc2Uge1xuICBjb25zdHJ1Y3Rvcihwcm9jZXNzKSB7XG4gICAgdGhpcy5vblN1Y2Nlc3MgPSBbXTtcbiAgICB0aGlzLm9uRXJyb3IgPSBbXTtcblxuICAgIGlmKHByb2Nlc3MpIHtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBwcm9jZXNzKFxuICAgICAgICAgIGRhdGEgPT4gdGhpcy5yZXNvbHZlKGRhdGEpLFxuICAgICAgICAgIGRhdGEgPT4gdGhpcy5yZWplY3QoZGF0YSlcbiAgICAgICAgKTtcbiAgICAgIH0sIDApXG4gICAgfVxuICB9XG5cbiAgcmVzb2x2ZShkYXRhKSB7XG4gICAgdGhpcy5vblN1Y2Nlc3MuZm9yRWFjaChmbiA9PiBmbihkYXRhKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgcmVqZWN0KGRhdGEpIHtcbiAgICB0aGlzLm9uRXJyb3IuZm9yRWFjaChmbiA9PiBmbihkYXRhKSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB0aGVuKGZuKSB7XG4gICAgdGhpcy5vblN1Y2Nlc3MucHVzaChmbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjYXRjaChmbikge1xuICAgIHRoaXMub25FcnJvci5wdXNoKGZuKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGZpbmFsbHkoZm4pIHtcbiAgICB0aGlzLm9uU3VjY2Vzcy5wdXNoKGZuKTtcbiAgICB0aGlzLm9uRXJyb3IucHVzaChmbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbn1cbiIsIi8qKlxuICogQG5hbWUgdXVpZFxuICogQGZ1bmN0aW9uXG4gKiBAcmV0dXJuIHtzdHJpbmd9IHV1aWRcbiAqIEBkZXNjcmlwdGlvblxuICogQSBmYWtlIHV1aWQgd2hpY2ggZG9lcyBsb29rIHByZXR0eSBjb29sXG4gKiAgIHdpdGggdGhlIGZvcm1hdCB4eHh4LXh4eHgteHh4eC14eHh4XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gKFxuICAgIG5ldyBEYXRlKCkuZ2V0VGltZSgpLnRvU3RyaW5nKDM2KVxuICAgICsgTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc2xpY2UoLTgpXG4gIClcbiAgLm1hdGNoKC8uezEsNH0vZ2kpXG4gIC5qb2luKCctJyk7XG59XG4iXX0=
