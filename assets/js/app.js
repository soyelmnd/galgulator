(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _galgulator = require('./galgulator');

var _galgulator2 = _interopRequireDefault(_galgulator);

var _screen = require('./galgulator/io/screen');

var _screen2 = _interopRequireDefault(_screen);

var _keypad = require('./galgulator/io/keypad');

var _keypad2 = _interopRequireDefault(_keypad);

var _keyWatch = require('./galgulator/io/key-watch');

var _keyWatch2 = _interopRequireDefault(_keyWatch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Transform all galgulator into living creatures
Array.prototype.slice.call(document.getElementsByClassName('galgulator')).forEach(function (el) {
  var galgulator = new _galgulator2.default();

  // Output screen
  Array.prototype.slice.call(el.querySelectorAll('.screen .q')).forEach(function (screenEl) {
    galgulator.addIO(new _screen2.default(screenEl));
  });

  // Input keypad
  Array.prototype.slice.call(el.getElementsByClassName('keypad')).forEach(function (keypadEl) {
    galgulator.addIO(new _keypad2.default(keypadEl));
  });

  // Input key watch
  galgulator.addIO(new _keyWatch2.default(el));
});

},{"./galgulator":3,"./galgulator/io/key-watch":5,"./galgulator/io/keypad":6,"./galgulator/io/screen":7}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var Eventist = (function () {
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
        var callbacks = this._eventListeners[evt],
            idx = undefined;

        if (callbacks && callbacks.length) {
          for (idx in callbacks) {
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
})();

exports.default = Eventist;

},{"../uuid":9}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

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
 */

var Galgulator = (function (_Eventist) {
  _inherits(Galgulator, _Eventist);

  function Galgulator() {
    _classCallCheck(this, Galgulator);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Galgulator).call(this));

    _this.ios = [];
    _this.queue = [];
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
      var expression = this.queue.join('');
      var self = this;

      // Remove spaces, trailing operators, and redundant 0
      expression = expression.replace(/\s+|\b0+|[^\d]+$/g, '');

      // Convert to js friendly
      expression = expression.replace(/x/gi, '*').replace(/:/gi, '/');

      // Handle pow by transforming
      //   x^y^z to Math.pow(x, Math.pow(y, z))
      expression = expression.replace(/\d+(?:\^\d+)+/g, function (exp) {
        var powOperands = exp.split('^'),
            n = powOperands.length,
            i = n - 2;

        var powExpression = powOperands[n - 1];
        for (; i > -1; --i) {
          powExpression = 'Math.pow(' + powOperands[i] + ',' + powExpression + ')';
        }

        return powExpression;
      });

      return new _promise2.default(function (resolve, reject) {
        var result = new Function('return ' + expression)();

        self.queue = [result];
        self.broadcast('resolve', {
          queue: self.queue
        });

        resolve(result);
      });
    }
  }]);

  return Galgulator;
})(_eventist2.default);

exports.default = Galgulator;

},{"../eventist":2,"../promise":8}],4:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _eventist = require('../../eventist');

var _eventist2 = _interopRequireDefault(_eventist);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOAbstract = (function (_Eventist) {
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
})(_eventist2.default);

exports.default = IOAbstract;

},{"../../eventist":2}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _abstract = require('./abstract');

var _abstract2 = _interopRequireDefault(_abstract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOKeyWatch = (function (_IOAbstract) {
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
      this.el = el;

      var self = this;
      el.tabIndex = 1;
      el.addEventListener('keypress', function (evt) {
        self.key(evt);
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
        if ('^' == keyString || '+' == keyString || '-' == keyString || 'x' == keyString || ':' == keyString || !isNaN(keyString)) {
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
})(_abstract2.default);

exports.default = IOKeyWatch;

},{"./abstract":4}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _abstract = require('./abstract');

var _abstract2 = _interopRequireDefault(_abstract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOKeypad = (function (_IOAbstract) {
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
      this.el = el;

      var self = this;
      el.addEventListener('click', function (evt) {
        self.key(evt.target.dataset.keyData);
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
})(_abstract2.default);

exports.default = IOKeypad;

},{"./abstract":4}],7:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _abstract = require('./abstract');

var _abstract2 = _interopRequireDefault(_abstract);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var IOScreen = (function (_IOAbstract) {
  _inherits(IOScreen, _IOAbstract);

  function IOScreen(el) {
    _classCallCheck(this, IOScreen);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(IOScreen).call(this));

    el && _this2.attachTo(el);
    return _this2;
  }

  _createClass(IOScreen, [{
    key: 'attachTo',
    value: function attachTo(el) {
      var _this = this;

      this.el = el;

      this.on('enqueue dequeue clear resolve', function (evt, data) {
        el.innerHTML = _this.render(data);
      });
    }
  }, {
    key: 'render',
    value: function render(data) {
      var html = data.queue.join('');

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
        var powOperands = exp.split('^'),
            n = powOperands.length,
            i = n - 2;

        var powExpression = powOperands[n - 1] || '@placeholder@';
        for (; i > -1; --i) {
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
})(_abstract2.default);

exports.default = IOScreen;

},{"./abstract":4}],8:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @name Promise
 * @class
 * @description
 * A Promise parody, as the ES6 one is not ready as promised. This is not a proper Promise, but a working polyfill for our galgulator, yeah.
 */

var Promise = (function () {
  function Promise(process) {
    var _this = this;

    _classCallCheck(this, Promise);

    this.onSuccess = [];
    this.onError = [];

    if (process) {
      (function () {
        var self = _this;
        setTimeout(function () {
          process(function (data) {
            return self.resolve(data);
          }, function (data) {
            return self.reject(data);
          });
        }, 0);
      })();
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
})();

exports.default = Promise;

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  return (new Date().getTime().toString(36) + Math.random().toString(36).slice(-8)).match(/.{1,4}/gi).join('-');
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvc2NyaXB0cy9hcHAuanMiLCJzcmMvc2NyaXB0cy9ldmVudGlzdC9pbmRleC5qcyIsInNyYy9zY3JpcHRzL2dhbGd1bGF0b3IvaW5kZXguanMiLCJzcmMvc2NyaXB0cy9nYWxndWxhdG9yL2lvL2Fic3RyYWN0LmpzIiwic3JjL3NjcmlwdHMvZ2FsZ3VsYXRvci9pby9rZXktd2F0Y2guanMiLCJzcmMvc2NyaXB0cy9nYWxndWxhdG9yL2lvL2tleXBhZC5qcyIsInNyYy9zY3JpcHRzL2dhbGd1bGF0b3IvaW8vc2NyZWVuLmpzIiwic3JjL3NjcmlwdHMvcHJvbWlzZS9pbmRleC5qcyIsInNyYy9zY3JpcHRzL3V1aWQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNNQSxLQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxDQUFDLENBQ3hFLE9BQU8sQ0FBQyxVQUFBLEVBQUUsRUFBSTtBQUNiLE1BQUksVUFBVSxHQUFHLDBCQUFnQjs7O0FBQUMsQUFHbEMsT0FBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUM1RCxPQUFPLENBQUMsVUFBQSxRQUFRLEVBQUk7QUFDbkIsY0FBVSxDQUFDLEtBQUssQ0FBQyxxQkFBdUIsUUFBUSxDQUFDLENBQUMsQ0FBQTtHQUNuRCxDQUFDOzs7QUFBQyxBQUdILE9BQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsc0JBQXNCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FDOUQsT0FBTyxDQUFDLFVBQUEsUUFBUSxFQUFJO0FBQ25CLGNBQVUsQ0FB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QUFFLENBQUMsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxHQUMvQixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBLENBRXZDLEtBQUssQ0FBQyxVQUFVLENBQUMsQ0FDakIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ1oiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IEdhbGd1bGF0b3IgZnJvbSAnLi9nYWxndWxhdG9yJztcbmltcG9ydCBHYWxndWxhdG9ySU9TY3JlZW4gZnJvbSAnLi9nYWxndWxhdG9yL2lvL3NjcmVlbic7XG5pbXBvcnQgR2FsZ3VsYXRvcklPS2V5cGFkIGZyb20gJy4vZ2FsZ3VsYXRvci9pby9rZXlwYWQnO1xuaW1wb3J0IEdhbGd1bGF0b3JJT0tleVdhdGNoIGZyb20gJy4vZ2FsZ3VsYXRvci9pby9rZXktd2F0Y2gnO1xuXG4vLyBUcmFuc2Zvcm0gYWxsIGdhbGd1bGF0b3IgaW50byBsaXZpbmcgY3JlYXR1cmVzXG5BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdnYWxndWxhdG9yJykpXG4uZm9yRWFjaChlbCA9PiB7XG4gIGxldCBnYWxndWxhdG9yID0gbmV3IEdhbGd1bGF0b3IoKTtcblxuICAvLyBPdXRwdXQgc2NyZWVuXG4gIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJy5zY3JlZW4gLnEnKSlcbiAgLmZvckVhY2goc2NyZWVuRWwgPT4ge1xuICAgIGdhbGd1bGF0b3IuYWRkSU8obmV3IEdhbGd1bGF0b3JJT1NjcmVlbihzY3JlZW5FbCkpXG4gIH0pO1xuXG4gIC8vIElucHV0IGtleXBhZFxuICBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChlbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdrZXlwYWQnKSlcbiAgLmZvckVhY2goa2V5cGFkRWwgPT4ge1xuICAgIGdhbGd1bGF0b3IuYWRkSU8obmV3IEdhbGd1bGF0b3JJT0tleXBhZChrZXlwYWRFbCkpXG4gIH0pO1xuXG4gIC8vIElucHV0IGtleSB3YXRjaFxuICBnYWxndWxhdG9yLmFkZElPKG5ldyBHYWxndWxhdG9ySU9LZXlXYXRjaChlbCkpXG59KTtcbiIsImltcG9ydCB1dWlkIGZyb20gJy4uL3V1aWQnO1xuXG4vKipcbiAqIEBuYW1lIEV2ZW50aXN0XG4gKiBAY2xhc3NcbiAqIEBkZXNjcmlwdGlvblxuICogSW5zcGlyZWQgYnkgaHR0cHM6Ly9kb2NzLmFuZ3VsYXJqcy5vcmcvYXBpL25nL3R5cGUvJHJvb3RTY29wZS5TY29wZVxuICpcbiAqIEFuIGV2ZW50aXN0IGNhbiBgZW1pdGAgKGFrYSBgdHJpZ2dlcmAgaW4galF1ZXJ5IERPTSkgZXZlbnQsIGxpc3RlbiB0b1xuICogZXZlbnQgd2l0aCBgb25gIChtdWNoIGxpa2UgYG9uYCBpbiBqUXVlcnkgRE9NKSBvciBldmVuIGBicm9hZGNhc3RgIGV2ZW50XG4gKlxuICogV2l0aCBgZW1pdGAsIGV2ZW50IGZsb3dzIGFzIGluIHRoZSBidWJibGluZyBwaGFzZSBvZiBicm93c2VyIERPTSwgc3RhcnRcbiAqIGRpc3BhdGNoaW5nIGZyb20gdGhlIHRhcmdldCwgdGhlbiB0YXJnZXQncyBwYXJlbnQsIHRoZW4gdGFyZ2V0J3NcbiAqIHBhcmVudCdzIHBhcmVudCAuLi5cbiAqXG4gKiBXaXRoIGBicm9hZGNhc3RgLCBldmVudCBmbG93cyBhcyBpbiB0aGUgY2FwdHVyaW5nIHBoYXNlIGJyb3dzZXIgRE9NLFxuICogc3RhcnQgZGlzcGF0Y2hpbmcgZnJvbSB0aGUgdGFyZ2V0LCB0aGVuIHRhcmdldCdzIGNoaWxkcmVuLCB0aGVuIHRhcmdldCdzXG4gKiBjaGlsZHJlbidzIGNoaWxkcmVuIC4uLlxuICpcbiAqIEJ1dCBob3cgY2FuIGFuIGV2ZW50aXN0IGtub3cgd2hvJ3MgaXRzIHBhcmVudCwgaW4gb3JkZXIgdG8gcHJvcGFnYXRlXG4gKiBldmVudD8gR29vZCBxdWVzdGlvbiEgQSBwYXJlbnQgbXVzdCBiZSBzZXQgZXhwbGljaXRseS4gV2VsbCwgaW5zdGVhZCBvZlxuICogY2FsbGluZyBpdCBwYXJlbnQsIGxldCdzIHVzZSB0aGUgd29yZCBzdWJzY3JpYmVyXG4gKlxuICogT2gsIGFuZCB3ZSBhbHNvIGhhdmUgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCkgYW5kIGV2ZW50LnByZXZlbnREZWZhdWx0KCksXG4gKiBhcyBhIHJlYWwgbm9ybWFsIERPTSBldmVudCwgYnV0IC4uICN0b0JlSW1wbGVtZW50ZWRcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRXZlbnRpc3Qge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLmlkID0gdGhpcy5pZCB8fCB1dWlkKCk7XG4gIH1cblxuICAvKipcbiAgICogQG5hbWUgRXZlbnRpc3Qjd2F0Y2hcbiAgICogQG1ldGhvZFxuICAgKiBAcGFyYW0ge0V2ZW50aXN0fSBjaGlsZFxuICAgKiBAcmV0dXJuIHtFdmVudGlzdH0gdGhpc1xuICAgKiBAZGVzY3JpcHRpb25cbiAgICogVGhlIGlkZWEgaXMgd2UgZG9uJ3Qgd2FudCBhbiBvYmplY3QgdG8gbW9kaWZ5IGFub3RoZXIgb2JqZWN0J3MgdmFyaWFibGVzXG4gICAqIFNvIGxldCBpdCBtb2RpZnkgaXRzZWxmIGluIHRoZSB3YXkgaXQgd2FudCB0byBiZS4gV2lsbCBiZSBjYWxsZWQgd2hlblxuICAgKiB0aGVyZSdzIGEgc3Vic2NyaXB0aW9uIHJlcXVlc3RcbiAgICovXG4gIHdhdGNoKGNoaWxkKSB7XG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgX2V2ZW50aXN0Q2hpbGRyZW4gbGlzdCwgaWYgbmVlZGVkXG4gICAgdGhpcy5fZXZlbnRpc3RDaGlsZHJlbiA9IHRoaXMuX2V2ZW50aXN0Q2hpbGRyZW4gfHwge307XG4gICAgdGhpcy5fZXZlbnRpc3RDaGlsZHJlbltjaGlsZC5pZF0gPSBjaGlsZDtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuYW1lIEV2ZW50aXN0I3Vud2F0Y2hcbiAgICogQG1ldGhvZFxuICAgKiBAcGFyYW0ge0V2ZW50aXN0fSBjaGlsZFxuICAgKiBAcmV0dXJuIHtFdmVudGlzdH0gdGhpc1xuICAgKiBAc2VlIEV2ZW50aXN0I21hdGNoXG4gICAqL1xuICB1bndhdGNoKGNoaWxkKSB7XG4gICAgaWYoIXRoaXMuX2V2ZW50aXN0Q2hpbGRyZW4gfHwgIXRoaXMuX2V2ZW50aXN0Q2hpbGRyZW5bY2hpbGQuaWRdKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NvdWxkIG5vdCBmaW5kIHRoaXMgZXZlbnRpc3QgaW4gdGhlIHBhcmVudCBjaGlsZHJlbiBsaXN0Jyk7XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50aXN0Q2hpbGRyZW5bY2hpbGQuaWRdO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQG5hbWUgRXZlbnRpc3Qjc3Vic2NyaWJlXG4gICAqIEBtZXRob2RcbiAgICogQHBhcmFtIHtFdmVudGlzdH0gcGFyZW50XG4gICAqIEByZXR1cm4ge0V2ZW50aXN0fSB0aGlzXG4gICAqL1xuICBzdWJzY3JpYmUocGFyZW50KSB7XG4gICAgaWYoIXRoaXMuaWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQW4gZXZlbnRpc3QgbmVlZCBhbiBpZCB0byBiZSBhYmxlIHRvIHN1YnNjcmliZScpO1xuICAgIH1cblxuICAgIGlmKCEocGFyZW50IGluc3RhbmNlb2YgRXZlbnRpc3QpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIGV2ZW50aXN0IGNvdWxkIG9ubHkgc3Vic2NyaWJlIHRvIGFub3RoZXIgZXZlbnRpc3QnKTtcbiAgICB9XG5cbiAgICBwYXJlbnQud2F0Y2godGhpcyk7XG4gICAgdGhpcy5fZXZlbnRpc3RQYXJlbnQgPSBwYXJlbnQ7XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmFtZSBFdmVudGlzdCN1bnN1YnNjcmliZVxuICAgKiBAbWV0aG9kXG4gICAqIEBwYXJhbSB7RXZlbnRpc3R9IFtwYXJlbnRdXG4gICAqIEByZXR1cm4ge0V2ZW50aXN0fSB0aGlzXG4gICAqL1xuICB1bnN1YnNjcmliZShwYXJlbnQpIHtcbiAgICBpZighdGhpcy5fZXZlbnRpc3RQYXJlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQnV0IC4uIHRoaXMgZXZlbnRpc3QgaGFzIG5vIHBhcmVudCcpXG4gICAgfVxuICAgIGlmKHBhcmVudCAmJiBwYXJlbnQgIT0gdGhpcy5fZXZlbnRpc3RQYXJlbnQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ291bGQgbm90IHVuc3Vic2NyaWJlIGZyb20gYSBwYXJlbnQgb2Ygc29tZW9uZSBlbHNlLCBsb2wnKTtcbiAgICB9XG5cbiAgICAvLyBTdXBwb3J0IG5vIHBhcmFtXG4gICAgLy8gICB0byB1bnN1YnNjcmliZSBmcm9tIGN1cnJlbnQgcGFyZW50XG4gICAgcGFyZW50ID0gcGFyZW50IHx8IHRoaXMuX2V2ZW50aXN0UGFyZW50O1xuXG4gICAgcGFyZW50LnVud2F0Y2godGhpcyk7XG4gICAgdGhpcy5fZXZlbnRpc3RQYXJlbnQgPSBudWxsO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQG5hbWUgRXZlbnRpc3Qjb25cbiAgICogQG1ldGhvZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRzXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbZmxhZ11cbiAgICogQHJldHVybiB7RXZlbnRpc3R9IHRoaXNcbiAgICovXG4gIG9uKGV2ZW50cywgY2FsbGJhY2ssIGZsYWcpIHtcbiAgICBsZXQgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRMaXN0ZW5lcnMgPSB0aGlzLl9ldmVudExpc3RlbmVycyB8fCB7fTtcblxuICAgIC8vIGxldCdzIHN1cHBvcnQgbXVsdGkgZXZlbnQgYmluZGluZyBhdCBhIHRpbWVcbiAgICAvLyAgIHNlcGFyYXRlZCBieSBjb21tb24gZGVsaW1pdGVycywganVzdCBsaWtlXG4gICAgLy8gICB0aGUgb3RoZXIganMgZmFtb3VzIGZyYW1ld29ya3MvbGlicmFyaWVzXG4gICAgZXZlbnRzLnNwbGl0KC8gfCx8O3xcXHwvKS5mb3JFYWNoKGV2dCA9PiB7XG4gICAgICBsaXN0ZW5lcnNbZXZ0XSA9IGxpc3RlbmVyc1tldnRdIHx8IFtdO1xuXG4gICAgICBmbGFnID0gZmxhZyB8fCAnYXBwZW5kJztcblxuICAgICAgaWYoJ2FwcGVuZCcgPT0gZmxhZykge1xuICAgICAgICBsaXN0ZW5lcnNbZXZ0XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSBpZigncHJlcGVuZCcgPT0gZmxhZykge1xuICAgICAgICBsaXN0ZW5lcnNbZXZ0XS51bnNoaWZ0KGNhbGxiYWNrKTtcbiAgICAgIH0gZWxzZSBpZignc2V0JyA9PSBmbGFnKSB7XG4gICAgICAgIGxpc3RlbmVyc1tldnRdID0gW2NhbGxiYWNrXTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuYW1lIEV2ZW50aXN0I2Rpc3BhdGNoRXZlbnRcbiAgICogQG1ldGhvZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IFthcmdzXVxuICAgKiBAcGFyYW0ge09iamVjdH0gW29yaWdpbl1cbiAgICogQHJldHVybiB7RXZlbnRpc3R9IHRoaXNcbiAgICogQGRlc2NyaXB0aW9uXG4gICAqIERpc3BhdGNoIGV2ZW50IHdpdGhvdXQgYW55IGJ1YmJsaW5nXG4gICAqL1xuICBkaXNwYXRjaEV2ZW50KGV2dCwgYXJncywgb3JpZ2luKSB7XG4gICAgaWYodGhpcy5fZXZlbnRMaXN0ZW5lcnMpIHtcbiAgICAgIGxldCBjYWxsYmFja3MgPSB0aGlzLl9ldmVudExpc3RlbmVyc1tldnRdXG4gICAgICAgICwgaWR4O1xuXG4gICAgICBpZihjYWxsYmFja3MgJiYgY2FsbGJhY2tzLmxlbmd0aCkge1xuICAgICAgICBmb3IoaWR4IGluIGNhbGxiYWNrcykge1xuICAgICAgICAgIGNhbGxiYWNrc1tpZHhdLmNhbGwodGhpcywgb3JpZ2luIHx8IHt9LCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLyoqXG4gICAqIEBuYW1lIEV2ZW50aXN0I2VtaXRcbiAgICogQG1ldGhvZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IFthcmdzXVxuICAgKiBAcmV0dXJuIHtFdmVudGlzdH0gdGhpc1xuICAgKi9cbiAgZW1pdChldnQsIGFyZ3MsIG9yaWdpbikge1xuICAgIC8vIFRoZSBvcmlnaW4gc2hvdWxkIGJlIHByaXZhdGUgYW5kIG5vdCB0byBiZSBleHBvc2VkIHRvIHVzZXJcbiAgICAvLyAgIHNpbmNlIGl0J3MgdG90YWxseSBpbnRlcm5hbCBmb3IgZXZlbnQgb3JpZ2luIHRyYWNraW5nIHB1cnBvc2VcbiAgICAvLyAgIFRoZSBpZGVhIGlzLCBvcmlnaW4gd29uJ3QgYmUgcGFzc2VkIGluIGFueSBjYWxsXG4gICAgLy8gICBhbmQgdGhlIGZpcnN0IHRyaWdnZXIgaW4gYSBjaGFpbiB3aWxsIHByb3Bvc2UgYSBuZXcgb3JpZ2luXG4gICAgb3JpZ2luID0gb3JpZ2luIHx8IHtcbiAgICAgIGV2ZW50VHlwZTogJ2VtaXQnLFxuICAgICAgdGFyZ2V0OiB0aGlzLFxuICAgICAgaG9wOiBbXVxuICAgIH07XG5cbiAgICBvcmlnaW4uaG9wLnB1c2godGhpcyk7IC8vIHllcCwgd2UncmUgbm93IG9uZSBob3AgaW4gdGhlIGV2ZW50IHBhdGhcblxuICAgIHRoaXMuZGlzcGF0Y2hFdmVudChldnQsIGFyZ3MsIG9yaWdpbik7XG5cbiAgICAvLyBCdWJibGluZyBidWJibGluZ1xuICAgIHRoaXMuX2V2ZW50aXN0UGFyZW50ICYmIHRoaXMuX2V2ZW50aXN0UGFyZW50LmVtaXQoZXZ0LCBhcmdzLCBvcmlnaW4pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogQG5hbWUgRXZlbnRpc3QjdHJpZ2dlclxuICAgKiBAbWV0aG9kXG4gICAqIEBhbGlhcyBFdmVudGlzdCNlbWl0XG4gICAqL1xuICB0cmlnZ2VyKCkge1xuICAgIHJldHVybiB0aGlzLmVtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAbmFtZSBFdmVudGlzdCNicm9hZGNhc3RcbiAgICogQG1ldGhvZFxuICAgKiBAcGFyYW0ge3N0cmluZ30gZXZlbnRcbiAgICogQHBhcmFtIHtPYmplY3R9IFthcmdzXVxuICAgKiBAcmV0dXJuIHtFdmVudGlzdH0gdGhpc1xuICAgKi9cbiAgYnJvYWRjYXN0KGV2dCwgYXJncywgb3JpZ2luKSB7XG4gICAgLy8gUmVnYXJkaW5nIHRoZSBvcmlnaW4sIEBzZWUgYWJvdmVcbiAgICBvcmlnaW4gPSBvcmlnaW4gfHwge1xuICAgICAgZXZlbnRUeXBlOiAnYnJvYWRjYXN0JyxcbiAgICAgIHRhcmdldDogdGhpcyxcbiAgICAgIGhvcDogW11cbiAgICB9O1xuXG4gICAgb3JpZ2luLmhvcC5wdXNoKHRoaXMpO1xuXG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KGV2dCwgYXJncywgb3JpZ2luKTtcblxuICAgIGlmKHRoaXMuX2V2ZW50aXN0Q2hpbGRyZW4pIHtcbiAgICAgIGZvcihsZXQgaWR4IGluIHRoaXMuX2V2ZW50aXN0Q2hpbGRyZW4pIHtcbiAgICAgICAgLy8gSW52ZXJzZSBidWJibGluZyBidWJibGluZ1xuICAgICAgICB0aGlzLl9ldmVudGlzdENoaWxkcmVuW2lkeF0uYnJvYWRjYXN0KGV2dCwgYXJncywgb3JpZ2luKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiaW1wb3J0IEV2ZW50aXN0IGZyb20gJy4uL2V2ZW50aXN0JztcbmltcG9ydCBQcm9taXNlIGZyb20gJy4uL3Byb21pc2UnO1xuXG4vKipcbiAqIEBuYW1lIEdhbGd1bGF0b3JcbiAqIEBjbGFzc1xuICogQGV4dGVuZHMgRXZlbnRpc3RcbiAqL1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgR2FsZ3VsYXRvciBleHRlbmRzIEV2ZW50aXN0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIHRoaXMuaW9zID0gW107XG4gICAgdGhpcy5xdWV1ZSA9IFtdO1xuICB9XG5cbiAgYWRkSU8oaW8pIHtcbiAgICBpby5zZXRHYWxndWxhdG9yKHRoaXMpO1xuICAgIHRoaXMuaW9zLnB1c2goaW8pO1xuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBlbnF1ZXVlKG9wKSB7XG4gICAgb3AgPSBvcC50cmltKCk7XG4gICAgaWYob3ApIHtcbiAgICAgIHRoaXMucXVldWUucHVzaChvcCk7XG5cbiAgICAgIHRoaXMuYnJvYWRjYXN0KCdlbnF1ZXVlJywge1xuICAgICAgICBxdWV1ZTogdGhpcy5xdWV1ZSxcbiAgICAgICAgb3A6IG9wXG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBkZXF1ZXVlKCkge1xuICAgIGlmKHRoaXMucXVldWUubGVuZ3RoKSB7XG4gICAgICBsZXQgb3AgPSB0aGlzLnF1ZXVlLnBvcCgpO1xuXG4gICAgICB0aGlzLmJyb2FkY2FzdCgnZGVxdWV1ZScsIHtcbiAgICAgICAgcXVldWU6IHRoaXMucXVldWUsXG4gICAgICAgIG9wOiBvcFxuICAgICAgfSlcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBjbGVhcigpIHtcbiAgICBsZXQgZXhRdWV1ZSA9IHRoaXMucXVldWU7XG5cbiAgICB0aGlzLnF1ZXVlID0gW107XG5cbiAgICB0aGlzLmJyb2FkY2FzdCgnY2xlYXInLCB7XG4gICAgICBxdWV1ZTogdGhpcy5xdWV1ZSxcbiAgICAgIGV4UXVldWU6IGV4UXVldWVcbiAgICB9KTtcblxuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmVzb2x2ZSgpIHtcbiAgICBsZXQgZXhwcmVzc2lvbiA9IHRoaXMucXVldWUuam9pbignJyk7XG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gUmVtb3ZlIHNwYWNlcywgdHJhaWxpbmcgb3BlcmF0b3JzLCBhbmQgcmVkdW5kYW50IDBcbiAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC9cXHMrfFxcYjArfFteXFxkXSskL2csICcnKTtcblxuICAgIC8vIENvbnZlcnQgdG8ganMgZnJpZW5kbHlcbiAgICBleHByZXNzaW9uID0gZXhwcmVzc2lvbi5yZXBsYWNlKC94L2dpLCAnKicpLnJlcGxhY2UoLzovZ2ksICcvJyk7XG5cbiAgICAvLyBIYW5kbGUgcG93IGJ5IHRyYW5zZm9ybWluZ1xuICAgIC8vICAgeF55XnogdG8gTWF0aC5wb3coeCwgTWF0aC5wb3coeSwgeikpXG4gICAgZXhwcmVzc2lvbiA9IGV4cHJlc3Npb24ucmVwbGFjZSgvXFxkKyg/OlxcXlxcZCspKy9nLCAoZXhwKSA9PiB7XG4gICAgICBsZXQgcG93T3BlcmFuZHMgPSBleHAuc3BsaXQoJ14nKVxuICAgICAgICAsIG4gPSBwb3dPcGVyYW5kcy5sZW5ndGhcbiAgICAgICAgLCBpID0gbiAtIDI7XG5cbiAgICAgIGxldCBwb3dFeHByZXNzaW9uID0gcG93T3BlcmFuZHNbbiAtIDFdO1xuICAgICAgZm9yKDsgaT4tMTsgLS1pKSB7XG4gICAgICAgIHBvd0V4cHJlc3Npb24gPSAnTWF0aC5wb3coJyArIHBvd09wZXJhbmRzW2ldICsgJywnICsgcG93RXhwcmVzc2lvbiArICcpJztcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBvd0V4cHJlc3Npb247XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbGV0IHJlc3VsdCA9IG5ldyBGdW5jdGlvbigncmV0dXJuICcgKyBleHByZXNzaW9uKSgpO1xuXG4gICAgICBzZWxmLnF1ZXVlID0gW3Jlc3VsdF07XG4gICAgICBzZWxmLmJyb2FkY2FzdCgncmVzb2x2ZScsIHtcbiAgICAgICAgcXVldWU6IHNlbGYucXVldWVcbiAgICAgIH0pO1xuXG4gICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgfSlcbiAgfVxufVxuIiwiaW1wb3J0IEV2ZW50aXN0IGZyb20gJy4uLy4uL2V2ZW50aXN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSU9BYnN0cmFjdCBleHRlbmRzIEV2ZW50aXN0IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKVxuICB9XG5cbiAgc2V0R2FsZ3VsYXRvcihnYWxndWxhdG9yKSB7XG4gICAgaWYoZ2FsZ3VsYXRvcikge1xuICAgICAgdGhpcy5nYWxndWxhdG9yID0gZ2FsZ3VsYXRvcjtcbiAgICAgIHRoaXMuc3Vic2NyaWJlKGdhbGd1bGF0b3IpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmdhbGd1bGF0b3IgPSBudWxsO1xuICAgICAgdGhpcy51bnN1YnNjcmliZSgpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iLCJpbXBvcnQgSU9BYnN0cmFjdCBmcm9tICcuL2Fic3RyYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSU9LZXlXYXRjaCBleHRlbmRzIElPQWJzdHJhY3Qge1xuICBjb25zdHJ1Y3RvcihlbCkge1xuICAgIHN1cGVyKClcbiAgICBlbCAmJiB0aGlzLmF0dGFjaFRvKGVsKTtcbiAgfVxuXG4gIGF0dGFjaFRvKGVsKSB7XG4gICAgdGhpcy5lbCA9IGVsO1xuXG4gICAgbGV0IHNlbGYgPSB0aGlzO1xuICAgIGVsLnRhYkluZGV4ID0gMTtcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdrZXlwcmVzcycsIChldnQpID0+IHtcbiAgICAgIHNlbGYua2V5KGV2dCk7XG4gICAgfSwgZmFsc2UpO1xuICB9XG5cbiAga2V5KGV2dCkge1xuICAgIGV2dC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgaWYoMTMgPT0gZXZ0LmtleUNvZGUpIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvci5yZXNvbHZlKCk7XG4gICAgfSBlbHNlIGlmKDggPT0gZXZ0LmtleUNvZGUpIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvci5kZXF1ZXVlKCk7XG4gICAgfSBlbHNlIGlmKDQ2ID09IGV2dC5rZXlDb2RlKSB7XG4gICAgICB0aGlzLmdhbGd1bGF0b3IuY2xlYXIoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IGtleVN0cmluZyA9IGV2dC5rZXk7XG4gICAgICBpZihcbiAgICAgICAgJ14nID09IGtleVN0cmluZ1xuICAgICAgICB8fCAnKycgPT0ga2V5U3RyaW5nXG4gICAgICAgIHx8ICctJyA9PSBrZXlTdHJpbmdcbiAgICAgICAgfHwgJ3gnID09IGtleVN0cmluZ1xuICAgICAgICB8fCAnOicgPT0ga2V5U3RyaW5nXG4gICAgICAgIHx8ICFpc05hTihrZXlTdHJpbmcpXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5nYWxndWxhdG9yLmVucXVldWUoa2V5U3RyaW5nKTtcbiAgICAgIH0gZWxzZSBpZignKicgPT0ga2V5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZ2FsZ3VsYXRvci5lbnF1ZXVlKCd4JylcbiAgICAgIH0gZWxzZSBpZignLycgPT0ga2V5U3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZ2FsZ3VsYXRvci5lbnF1ZXVlKCc6JylcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfVxufVxuIiwiaW1wb3J0IElPQWJzdHJhY3QgZnJvbSAnLi9hYnN0cmFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIElPS2V5cGFkIGV4dGVuZHMgSU9BYnN0cmFjdCB7XG4gIGNvbnN0cnVjdG9yKGVsKSB7XG4gICAgc3VwZXIoKVxuICAgIGVsICYmIHRoaXMuYXR0YWNoVG8oZWwpO1xuICB9XG5cbiAgYXR0YWNoVG8oZWwpIHtcbiAgICB0aGlzLmVsID0gZWw7XG5cbiAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoZXZ0KSA9PiB7XG4gICAgICBzZWxmLmtleShldnQudGFyZ2V0LmRhdGFzZXQua2V5RGF0YSlcbiAgICB9LCBmYWxzZSk7XG4gIH1cblxuICBrZXkoa2V5RGF0YSkge1xuICAgIGlmKCdBQycgPT0ga2V5RGF0YSkge1xuICAgICAgdGhpcy5nYWxndWxhdG9yLmNsZWFyKCk7XG4gICAgfSBlbHNlIGlmKCdDRScgPT0ga2V5RGF0YSkge1xuICAgICAgdGhpcy5nYWxndWxhdG9yLmRlcXVldWUoKTtcbiAgICB9IGVsc2UgaWYoJz0nID09IGtleURhdGEpIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvci5yZXNvbHZlKCk7XG4gICAgfSBlbHNlIGlmKGtleURhdGEpIHtcbiAgICAgIHRoaXMuZ2FsZ3VsYXRvci5lbnF1ZXVlKGtleURhdGEpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iLCJpbXBvcnQgSU9BYnN0cmFjdCBmcm9tICcuL2Fic3RyYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgSU9TY3JlZW4gZXh0ZW5kcyBJT0Fic3RyYWN0IHtcbiAgY29uc3RydWN0b3IoZWwpIHtcbiAgICBzdXBlcigpO1xuICAgIGVsICYmIHRoaXMuYXR0YWNoVG8oZWwpO1xuICB9XG5cbiAgYXR0YWNoVG8oZWwpIHtcbiAgICB0aGlzLmVsID0gZWw7XG5cbiAgICB0aGlzLm9uKCdlbnF1ZXVlIGRlcXVldWUgY2xlYXIgcmVzb2x2ZScsIChldnQsIGRhdGEpID0+IHtcbiAgICAgIGVsLmlubmVySFRNTCA9IHRoaXMucmVuZGVyKGRhdGEpO1xuICAgIH0pO1xuICB9XG5cbiAgcmVuZGVyKGRhdGEpIHtcbiAgICBsZXQgaHRtbCA9IGRhdGEucXVldWUuam9pbignJyk7XG5cbiAgICAvLyBXcmFwIHRoZSBwb3cgZXhwcmVzc2lvblxuICAgIC8vXG4gICAgLy8gMl4zXjReNVxuICAgIC8vXG4gICAgLy8gc2hvdWxkIGJlY29tZVxuICAgIC8vXG4gICAgLy8gc3Bhbi5leHByLnBvd1xuICAgIC8vICAgMlxuICAgIC8vICAgc3Bhbi5leHByLnBvd1xuICAgIC8vICAgICAzXG4gICAgLy8gICAgIHNwYW4uZXhwci5wb3dcbiAgICAvLyAgICAgNFxuICAgIC8vICAgICA1XG4gICAgaHRtbCA9IGh0bWwucmVwbGFjZSgvKD86XFxkK1xcXikrXFxkKi9nLCAoZXhwKSA9PiB7XG4gICAgICBsZXQgcG93T3BlcmFuZHMgPSBleHAuc3BsaXQoJ14nKVxuICAgICAgICAsIG4gPSBwb3dPcGVyYW5kcy5sZW5ndGhcbiAgICAgICAgLCBpID0gbiAtIDI7XG5cbiAgICAgIGxldCBwb3dFeHByZXNzaW9uID0gcG93T3BlcmFuZHNbbiAtIDFdIHx8ICdAcGxhY2Vob2xkZXJAJztcbiAgICAgIGZvcig7IGk+LTE7IC0taSkge1xuICAgICAgICBwb3dFeHByZXNzaW9uID0gJzxzcGFuIGNsYXNzPVwiZXhwciBwb3dcIj4nICsgcG93T3BlcmFuZHNbaV0gKyAnQHNwbGl0ZXJAJyArIHBvd0V4cHJlc3Npb24gKyAnPC9zcGFuPic7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBwb3dFeHByZXNzaW9uO1xuICAgIH0pO1xuXG4gICAgLy8gV3JhcCBhcm91bmQgbm8gYW5kIG9wXG4gICAgaHRtbCA9IGh0bWxcbiAgICAgIC5yZXBsYWNlKC9cXGQrL2csICc8c3BhbiBjbGFzcz1cIm5vXCI+JCY8L3NwYW4+JylcbiAgICAgIC5yZXBsYWNlKC9bLSs6XXxcXGJ4XFxiL2csICc8c3BhbiBjbGFzcz1cIm9wXCI+JCY8L3NwYW4+Jyk7XG5cbiAgICAvLyBBbmQgZ2V0IHJpZCBvZiBzeXN0ZW0gZWxlbWVudHNcbiAgICBodG1sID0gaHRtbFxuICAgICAgLnJlcGxhY2UoL0BzcGxpdGVyQC9naSwgJycpXG4gICAgICAucmVwbGFjZSgvQHBsYWNlaG9sZGVyQC9naSwgJzxzcGFuIGNsYXNzPVwiYmxrXCI+JiM5NzQ0Ozwvc3Bhbj4nKTtcblxuICAgIHJldHVybiBodG1sO1xuICB9XG59XG4iLCIvKipcbiAqIEBuYW1lIFByb21pc2VcbiAqIEBjbGFzc1xuICogQGRlc2NyaXB0aW9uXG4gKiBBIFByb21pc2UgcGFyb2R5LCBhcyB0aGUgRVM2IG9uZSBpcyBub3QgcmVhZHkgYXMgcHJvbWlzZWQuIFRoaXMgaXMgbm90IGEgcHJvcGVyIFByb21pc2UsIGJ1dCBhIHdvcmtpbmcgcG9seWZpbGwgZm9yIG91ciBnYWxndWxhdG9yLCB5ZWFoLlxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcm9taXNlIHtcbiAgY29uc3RydWN0b3IocHJvY2Vzcykge1xuICAgIHRoaXMub25TdWNjZXNzID0gW107XG4gICAgdGhpcy5vbkVycm9yID0gW107XG5cbiAgICBpZihwcm9jZXNzKSB7XG4gICAgICBsZXQgc2VsZiA9IHRoaXM7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgcHJvY2VzcyhcbiAgICAgICAgICBkYXRhID0+IHNlbGYucmVzb2x2ZShkYXRhKSxcbiAgICAgICAgICBkYXRhID0+IHNlbGYucmVqZWN0KGRhdGEpXG4gICAgICAgICk7XG4gICAgICB9LCAwKVxuICAgIH1cbiAgfVxuXG4gIHJlc29sdmUoZGF0YSkge1xuICAgIHRoaXMub25TdWNjZXNzLmZvckVhY2goZm4gPT4gZm4oZGF0YSkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHJlamVjdChkYXRhKSB7XG4gICAgdGhpcy5vbkVycm9yLmZvckVhY2goZm4gPT4gZm4oZGF0YSkpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdGhlbihmbikge1xuICAgIHRoaXMub25TdWNjZXNzLnB1c2goZm4pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgY2F0Y2goZm4pIHtcbiAgICB0aGlzLm9uRXJyb3IucHVzaChmbik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBmaW5hbGx5KGZuKSB7XG4gICAgdGhpcy5vblN1Y2Nlc3MucHVzaChmbik7XG4gICAgdGhpcy5vbkVycm9yLnB1c2goZm4pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG59XG4iLCIvKipcbiAqIEBuYW1lIHV1aWRcbiAqIEBmdW5jdGlvblxuICogQHJldHVybiB7c3RyaW5nfSB1dWlkXG4gKiBAZGVzY3JpcHRpb25cbiAqIEEgZmFrZSB1dWlkIHdoaWNoIGRvZXMgbG9vayBwcmV0dHkgY29vbFxuICogICB3aXRoIHRoZSBmb3JtYXQgeHh4eC14eHh4LXh4eHgteHh4eFxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIChcbiAgICBuZXcgRGF0ZSgpLmdldFRpbWUoKS50b1N0cmluZygzNilcbiAgICArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnNsaWNlKC04KVxuICApXG4gIC5tYXRjaCgvLnsxLDR9L2dpKVxuICAuam9pbignLScpO1xufVxuIl19
