(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.GoEasy = factory());
})(this, (function () { 'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var GoEasy$1 = {};

	var NetworkStatus = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.NetworkStatus = void 0;

	  (function (NetworkStatus) {
	    NetworkStatus["DISCONNECTED"] = "disconnected";
	    NetworkStatus["DISCONNECTING"] = "disconnecting";
	    NetworkStatus["CONNECTING"] = "connecting";
	    NetworkStatus["CONNECTED"] = "connected";
	    NetworkStatus["RECONNECTING"] = "reconnecting";
	    NetworkStatus["RECONNECTED"] = "reconnected";
	    NetworkStatus["EXPIRED_RECONNECTED"] = "reconnected";
	    NetworkStatus["CONNECT_FAILED"] = "connect_failed"; //连接失败
	  })(exports.NetworkStatus || (exports.NetworkStatus = {}));
	})(NetworkStatus);

	var GoEasySocket = {};

	var AbstractSocket = {};

	var Permission = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.Permission = void 0;

	  (function (Permission) {
	    Permission["WRITE"] = "WRITE";
	    Permission["READ"] = "READ";
	    Permission["NONE"] = "NONE";
	  })(exports.Permission || (exports.Permission = {}));
	})(Permission);

	var Emitter$6 = {};

	Emitter$6.__esModule = true;
	Emitter$6.Emitter = void 0;
	var NetworkStatus_1$1 = NetworkStatus;

	var Emitter$5 =
	/** @class */
	function () {
	  function Emitter(socket) {
	    this.socket = socket;
	  }

	  Emitter.prototype.emit = function (rocket) {
	    if (this.socket.status === NetworkStatus_1$1.NetworkStatus.CONNECT_FAILED || this.socket.status === NetworkStatus_1$1.NetworkStatus.DISCONNECTED) {
	      rocket.fail({
	        resultCode: '409',
	        content: 'Please connect first'
	      });
	      return;
	    }

	    rocket.start();
	    this.doEmit(rocket);
	  };

	  Emitter.prototype.doEmit = function (rocket) {
	    var _this = this;

	    if (rocket.isTimeout()) {
	      rocket.fail({
	        resultCode: 408,
	        content: "Host unreachable or timeout"
	      });
	      return;
	    }

	    if (this.socket.status === NetworkStatus_1$1.NetworkStatus.CONNECT_FAILED) {
	      rocket.fail({
	        resultCode: 408,
	        content: "Failed to connect GoEasy."
	      });
	      return;
	    }

	    if (this.authenticated()) {
	      if (this.hasPermission(rocket)) {
	        var status_1 = [NetworkStatus_1$1.NetworkStatus.CONNECTED, NetworkStatus_1$1.NetworkStatus.RECONNECTED, NetworkStatus_1$1.NetworkStatus.EXPIRED_RECONNECTED];

	        if (status_1.includes(this.socket.status)) {
	          if (!rocket.complete) {
	            var timeout_1 = setTimeout(function () {
	              _this.doEmit(rocket);
	            }, rocket.singleTimeout);

	            if (rocket.unique) {
	              rocket.params.retried = rocket.retried;
	            }

	            this.socket.doEmit(rocket.name, rocket.params, function (ack) {
	              clearTimeout(timeout_1);
	              ack.resultCode === 200 || ack.code == 200 ? rocket.success(ack) : rocket.fail(ack);
	            });
	            rocket.retried++;
	          }
	        } else {
	          setTimeout(function () {
	            _this.doEmit(rocket);
	          }, 500);
	        }
	      } else {
	        rocket.fail({
	          resultCode: 401,
	          content: 'No permission' //应用层要重新定义

	        });
	      }
	    } else {
	      setTimeout(function () {
	        _this.doEmit(rocket);
	      }, 500);
	    }
	  };

	  Emitter.prototype.hasPermission = function (rocket) {
	    return !!this.socket.permissions.find(function (item) {
	      return item === rocket.permission;
	    });
	  };

	  Emitter.prototype.authenticated = function () {
	    var status = [NetworkStatus_1$1.NetworkStatus.CONNECTED, NetworkStatus_1$1.NetworkStatus.RECONNECTING, NetworkStatus_1$1.NetworkStatus.RECONNECTED, NetworkStatus_1$1.NetworkStatus.EXPIRED_RECONNECTED];
	    return status.includes(this.socket.status);
	  };

	  return Emitter;
	}();

	Emitter$6.Emitter = Emitter$5;

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	  }, _typeof(obj);
	}

	var lib$1 = {exports: {}};

	/**
	 * Parses an URI
	 *
	 * @author Steven Levithan <stevenlevithan.com> (MIT license)
	 * @api private
	 */
	var re = /^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;
	var parts = ['source', 'protocol', 'authority', 'userInfo', 'user', 'password', 'host', 'port', 'relative', 'path', 'directory', 'file', 'query', 'anchor'];

	var parseuri$2 = function parseuri(str) {
	  var src = str,
	      b = str.indexOf('['),
	      e = str.indexOf(']');

	  if (b != -1 && e != -1) {
	    str = str.substring(0, b) + str.substring(b, e).replace(/:/g, ';') + str.substring(e, str.length);
	  }

	  var m = re.exec(str || ''),
	      uri = {},
	      i = 14;

	  while (i--) {
	    uri[parts[i]] = m[i] || '';
	  }

	  if (b != -1 && e != -1) {
	    uri.source = src;
	    uri.host = uri.host.substring(1, uri.host.length - 1).replace(/;/g, ':');
	    uri.authority = uri.authority.replace('[', '').replace(']', '').replace(/;/g, ':');
	    uri.ipv6uri = true;
	  }

	  return uri;
	};

	var browser$2 = {exports: {}};

	var debug$6 = {exports: {}};

	var s$1 = 1000;
	var m$1 = s$1 * 60;
	var h$1 = m$1 * 60;
	var d$1 = h$1 * 24;
	var y$1 = d$1 * 365.25;
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	var ms$1 = function ms(val, options) {
	  options = options || {};

	  var type = _typeof(val);

	  if (type === 'string' && val.length > 0) {
	    return parse$1(val);
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options["long"] ? fmtLong$1(val) : fmtShort$1(val);
	  }

	  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
	};
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */


	function parse$1(str) {
	  str = String(str);

	  if (str.length > 100) {
	    return;
	  }

	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);

	  if (!match) {
	    return;
	  }

	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();

	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y$1;

	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d$1;

	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h$1;

	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m$1;

	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s$1;

	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;

	    default:
	      return undefined;
	  }
	}
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */


	function fmtShort$1(ms) {
	  if (ms >= d$1) {
	    return Math.round(ms / d$1) + 'd';
	  }

	  if (ms >= h$1) {
	    return Math.round(ms / h$1) + 'h';
	  }

	  if (ms >= m$1) {
	    return Math.round(ms / m$1) + 'm';
	  }

	  if (ms >= s$1) {
	    return Math.round(ms / s$1) + 's';
	  }

	  return ms + 'ms';
	}
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */


	function fmtLong$1(ms) {
	  return plural$1(ms, d$1, 'day') || plural$1(ms, h$1, 'hour') || plural$1(ms, m$1, 'minute') || plural$1(ms, s$1, 'second') || ms + ' ms';
	}
	/**
	 * Pluralization helper.
	 */


	function plural$1(ms, n, name) {
	  if (ms < n) {
	    return;
	  }

	  if (ms < n * 1.5) {
	    return Math.floor(ms / n) + ' ' + name;
	  }

	  return Math.ceil(ms / n) + ' ' + name + 's';
	}

	(function (module, exports) {
	  /**
	   * This is the common logic for both the Node.js and web browser
	   * implementations of `debug()`.
	   *
	   * Expose `debug()` as the module.
	   */
	  exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
	  exports.coerce = coerce;
	  exports.disable = disable;
	  exports.enable = enable;
	  exports.enabled = enabled;
	  exports.humanize = ms$1;
	  /**
	   * Active `debug` instances.
	   */

	  exports.instances = [];
	  /**
	   * The currently active debug mode names, and names to skip.
	   */

	  exports.names = [];
	  exports.skips = [];
	  /**
	   * Map of special "%n" handling functions, for the debug "format" argument.
	   *
	   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	   */

	  exports.formatters = {};
	  /**
	   * Select a color.
	   * @param {String} namespace
	   * @return {Number}
	   * @api private
	   */

	  function selectColor(namespace) {
	    var hash = 0,
	        i;

	    for (i in namespace) {
	      hash = (hash << 5) - hash + namespace.charCodeAt(i);
	      hash |= 0; // Convert to 32bit integer
	    }

	    return exports.colors[Math.abs(hash) % exports.colors.length];
	  }
	  /**
	   * Create a debugger with the given `namespace`.
	   *
	   * @param {String} namespace
	   * @return {Function}
	   * @api public
	   */


	  function createDebug(namespace) {
	    var prevTime;

	    function debug() {
	      // disabled?
	      if (!debug.enabled) return;
	      var self = debug; // set `diff` timestamp

	      var curr = +new Date();
	      var ms = curr - (prevTime || curr);
	      self.diff = ms;
	      self.prev = prevTime;
	      self.curr = curr;
	      prevTime = curr; // turn the `arguments` into a proper Array

	      var args = new Array(arguments.length);

	      for (var i = 0; i < args.length; i++) {
	        args[i] = arguments[i];
	      }

	      args[0] = exports.coerce(args[0]);

	      if ('string' !== typeof args[0]) {
	        // anything else let's inspect with %O
	        args.unshift('%O');
	      } // apply any `formatters` transformations


	      var index = 0;
	      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
	        // if we encounter an escaped % then don't increase the array index
	        if (match === '%%') return match;
	        index++;
	        var formatter = exports.formatters[format];

	        if ('function' === typeof formatter) {
	          var val = args[index];
	          match = formatter.call(self, val); // now we need to remove `args[index]` since it's inlined in the `format`

	          args.splice(index, 1);
	          index--;
	        }

	        return match;
	      }); // apply env-specific formatting (colors, etc.)

	      exports.formatArgs.call(self, args);
	      var logFn = debug.log || exports.log || console.log.bind(console);
	      logFn.apply(self, args);
	    }

	    debug.namespace = namespace;
	    debug.enabled = exports.enabled(namespace);
	    debug.useColors = exports.useColors();
	    debug.color = selectColor(namespace);
	    debug.destroy = destroy; // env-specific initialization logic for debug instances

	    if ('function' === typeof exports.init) {
	      exports.init(debug);
	    }

	    exports.instances.push(debug);
	    return debug;
	  }

	  function destroy() {
	    var index = exports.instances.indexOf(this);

	    if (index !== -1) {
	      exports.instances.splice(index, 1);
	      return true;
	    } else {
	      return false;
	    }
	  }
	  /**
	   * Enables a debug mode by namespaces. This can include modes
	   * separated by a colon and wildcards.
	   *
	   * @param {String} namespaces
	   * @api public
	   */


	  function enable(namespaces) {
	    exports.save(namespaces);
	    exports.names = [];
	    exports.skips = [];
	    var i;
	    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
	    var len = split.length;

	    for (i = 0; i < len; i++) {
	      if (!split[i]) continue; // ignore empty strings

	      namespaces = split[i].replace(/\*/g, '.*?');

	      if (namespaces[0] === '-') {
	        exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	      } else {
	        exports.names.push(new RegExp('^' + namespaces + '$'));
	      }
	    }

	    for (i = 0; i < exports.instances.length; i++) {
	      var instance = exports.instances[i];
	      instance.enabled = exports.enabled(instance.namespace);
	    }
	  }
	  /**
	   * Disable debug output.
	   *
	   * @api public
	   */


	  function disable() {
	    exports.enable('');
	  }
	  /**
	   * Returns true if the given mode name is enabled, false otherwise.
	   *
	   * @param {String} name
	   * @return {Boolean}
	   * @api public
	   */


	  function enabled(name) {
	    if (name[name.length - 1] === '*') {
	      return true;
	    }

	    var i, len;

	    for (i = 0, len = exports.skips.length; i < len; i++) {
	      if (exports.skips[i].test(name)) {
	        return false;
	      }
	    }

	    for (i = 0, len = exports.names.length; i < len; i++) {
	      if (exports.names[i].test(name)) {
	        return true;
	      }
	    }

	    return false;
	  }
	  /**
	   * Coerce `val`.
	   *
	   * @param {Mixed} val
	   * @return {Mixed}
	   * @api private
	   */


	  function coerce(val) {
	    if (val instanceof Error) return val.stack || val.message;
	    return val;
	  }
	})(debug$6, debug$6.exports);

	(function (module, exports) {
	  exports = module.exports = debug$6.exports;
	  exports.log = log;
	  exports.formatArgs = formatArgs;
	  exports.save = save;
	  exports.load = load;
	  exports.useColors = useColors;
	  exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();
	  /**
	   * Colors.
	   */

	  exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
	  /**
	   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	   * and the Firebug extension (any Firefox version) are known
	   * to support "%c" CSS customizations.
	   *
	   * TODO: add a `localStorage` variable to explicitly enable/disable colors
	   */

	  function useColors() {
	    // NB: In an Electron preload script, document will be defined but not fully
	    // initialized. Since we know we're in Chrome, we'll just detect this case
	    // explicitly
	    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
	      return true;
	    } // Internet Explorer and Edge do not support colors.


	    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
	      return false;
	    } // is webkit? http://stackoverflow.com/a/16459606/376773
	    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


	    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
	    typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
	    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
	  }
	  /**
	   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	   */


	  exports.formatters.j = function (v) {
	    try {
	      return JSON.stringify(v);
	    } catch (err) {
	      return '[UnexpectedJSONParseError]: ' + err.message;
	    }
	  };
	  /**
	   * Colorize log arguments if enabled.
	   *
	   * @api public
	   */


	  function formatArgs(args) {
	    var useColors = this.useColors;
	    args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);
	    if (!useColors) return;
	    var c = 'color: ' + this.color;
	    args.splice(1, 0, c, 'color: inherit'); // the final "%c" is somewhat tricky, because there could be other
	    // arguments passed either before or after the %c, so we need to
	    // figure out the correct index to insert the CSS into

	    var index = 0;
	    var lastC = 0;
	    args[0].replace(/%[a-zA-Z%]/g, function (match) {
	      if ('%%' === match) return;
	      index++;

	      if ('%c' === match) {
	        // we only are interested in the *last* %c
	        // (the user may have provided their own)
	        lastC = index;
	      }
	    });
	    args.splice(lastC, 0, c);
	  }
	  /**
	   * Invokes `console.log()` when available.
	   * No-op when `console.log` is not a "function".
	   *
	   * @api public
	   */


	  function log() {
	    // this hackery is required for IE8/9, where
	    // the `console.log` function doesn't have 'apply'
	    return 'object' === (typeof console === "undefined" ? "undefined" : _typeof(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments);
	  }
	  /**
	   * Save `namespaces`.
	   *
	   * @param {String} namespaces
	   * @api private
	   */


	  function save(namespaces) {
	    try {
	      if (null == namespaces) {
	        exports.storage.removeItem('debug');
	      } else {
	        exports.storage.debug = namespaces;
	      }
	    } catch (e) {}
	  }
	  /**
	   * Load `namespaces`.
	   *
	   * @return {String} returns the previously persisted debug modes
	   * @api private
	   */


	  function load() {
	    var r;

	    try {
	      r = exports.storage.debug;
	    } catch (e) {} // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


	    if (!r && typeof process !== 'undefined' && 'env' in process) {
	      r = process.env.DEBUG;
	    }

	    return r;
	  }
	  /**
	   * Enable namespaces listed in `localStorage.debug` initially.
	   */


	  exports.enable(load());
	  /**
	   * Localstorage attempts to return the localstorage.
	   *
	   * This is necessary because safari throws
	   * when a user disables cookies/localstorage
	   * and you attempt to access it.
	   *
	   * @return {LocalStorage}
	   * @api private
	   */

	  function localstorage() {
	    try {
	      return window.localStorage;
	    } catch (e) {}
	  }
	})(browser$2, browser$2.exports);

	/**
	 * Module dependencies.
	 */

	var parseuri$1 = parseuri$2;
	var debug$5 = browser$2.exports('socket.io-client:url');
	/**
	 * Module exports.
	 */

	var url_1 = url;
	/**
	 * URL parser.
	 *
	 * @param {String} url
	 * @param {Object} An object meant to mimic window.location.
	 *                 Defaults to window.location.
	 * @api public
	 */

	function url(uri, loc) {
	  var obj = uri; // default to window.location

	  loc = loc || typeof location !== 'undefined' && location;
	  if (null == uri) uri = loc.protocol + '//' + loc.host; // relative path support

	  if ('string' === typeof uri) {
	    if ('/' === uri.charAt(0)) {
	      if ('/' === uri.charAt(1)) {
	        uri = loc.protocol + uri;
	      } else {
	        uri = loc.host + uri;
	      }
	    }

	    if (!/^(https?|wss?):\/\//.test(uri)) {
	      debug$5('protocol-less url %s', uri);

	      if ('undefined' !== typeof loc) {
	        uri = loc.protocol + '//' + uri;
	      } else {
	        uri = 'https://' + uri;
	      }
	    } // parse


	    debug$5('parse %s', uri);
	    obj = parseuri$1(uri);
	  } // make sure we treat `localhost:80` and `localhost` equally


	  if (!obj.port) {
	    if (/^(http|ws)$/.test(obj.protocol)) {
	      obj.port = '80';
	    } else if (/^(http|ws)s$/.test(obj.protocol)) {
	      obj.port = '443';
	    }
	  }

	  obj.path = obj.path || '/';
	  var ipv6 = obj.host.indexOf(':') !== -1;
	  var host = ipv6 ? '[' + obj.host + ']' : obj.host; // define unique id

	  obj.id = obj.protocol + '://' + host + ':' + obj.port; // define href

	  obj.href = obj.protocol + '://' + host + (loc && loc.port === obj.port ? '' : ':' + obj.port);
	  return obj;
	}

	var socket_ioParser = {};

	var componentEmitter = {exports: {}};

	(function (module) {
	  /**
	   * Expose `Emitter`.
	   */
	  {
	    module.exports = Emitter;
	  }
	  /**
	   * Initialize a new `Emitter`.
	   *
	   * @api public
	   */


	  function Emitter(obj) {
	    if (obj) return mixin(obj);
	  }
	  /**
	   * Mixin the emitter properties.
	   *
	   * @param {Object} obj
	   * @return {Object}
	   * @api private
	   */

	  function mixin(obj) {
	    for (var key in Emitter.prototype) {
	      obj[key] = Emitter.prototype[key];
	    }

	    return obj;
	  }
	  /**
	   * Listen on the given `event` with `fn`.
	   *
	   * @param {String} event
	   * @param {Function} fn
	   * @return {Emitter}
	   * @api public
	   */


	  Emitter.prototype.on = Emitter.prototype.addEventListener = function (event, fn) {
	    this._callbacks = this._callbacks || {};
	    (this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);
	    return this;
	  };
	  /**
	   * Adds an `event` listener that will be invoked a single
	   * time then automatically removed.
	   *
	   * @param {String} event
	   * @param {Function} fn
	   * @return {Emitter}
	   * @api public
	   */


	  Emitter.prototype.once = function (event, fn) {
	    function on() {
	      this.off(event, on);
	      fn.apply(this, arguments);
	    }

	    on.fn = fn;
	    this.on(event, on);
	    return this;
	  };
	  /**
	   * Remove the given callback for `event` or all
	   * registered callbacks.
	   *
	   * @param {String} event
	   * @param {Function} fn
	   * @return {Emitter}
	   * @api public
	   */


	  Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function (event, fn) {
	    this._callbacks = this._callbacks || {}; // all

	    if (0 == arguments.length) {
	      this._callbacks = {};
	      return this;
	    } // specific event


	    var callbacks = this._callbacks['$' + event];
	    if (!callbacks) return this; // remove all handlers

	    if (1 == arguments.length) {
	      delete this._callbacks['$' + event];
	      return this;
	    } // remove specific handler


	    var cb;

	    for (var i = 0; i < callbacks.length; i++) {
	      cb = callbacks[i];

	      if (cb === fn || cb.fn === fn) {
	        callbacks.splice(i, 1);
	        break;
	      }
	    }

	    return this;
	  };
	  /**
	   * Emit `event` with the given args.
	   *
	   * @param {String} event
	   * @param {Mixed} ...
	   * @return {Emitter}
	   */


	  Emitter.prototype.emit = function (event) {
	    this._callbacks = this._callbacks || {};
	    var args = [].slice.call(arguments, 1),
	        callbacks = this._callbacks['$' + event];

	    if (callbacks) {
	      callbacks = callbacks.slice(0);

	      for (var i = 0, len = callbacks.length; i < len; ++i) {
	        callbacks[i].apply(this, args);
	      }
	    }

	    return this;
	  };
	  /**
	   * Return array of callbacks for `event`.
	   *
	   * @param {String} event
	   * @return {Array}
	   * @api public
	   */


	  Emitter.prototype.listeners = function (event) {
	    this._callbacks = this._callbacks || {};
	    return this._callbacks['$' + event] || [];
	  };
	  /**
	   * Check if this emitter has `event` handlers.
	   *
	   * @param {String} event
	   * @return {Boolean}
	   * @api public
	   */


	  Emitter.prototype.hasListeners = function (event) {
	    return !!this.listeners(event).length;
	  };
	})(componentEmitter);

	var toString$1 = {}.toString;

	var isarray = Array.isArray || function (arr) {
	  return toString$1.call(arr) == '[object Array]';
	};

	(function (exports) {
	  /**
	   * Module dependencies.
	   */
	  var debug = browser$2.exports('socket.io-parser');
	  var Emitter = componentEmitter.exports; // var binary = require('./binary');

	  var isArray = isarray; // var isBuf = require('./is-buffer');

	  /**
	   * Protocol version.
	   *
	   * @api public
	   */

	  exports.protocol = 4;
	  /**
	   * Packet types.
	   *
	   * @api public
	   */

	  exports.types = ['CONNECT', 'DISCONNECT', 'EVENT', 'ACK', 'ERROR', 'BINARY_EVENT', 'BINARY_ACK'];
	  /**
	   * Packet type `connect`.
	   *
	   * @api public
	   */

	  exports.CONNECT = 0;
	  /**
	   * Packet type `disconnect`.
	   *
	   * @api public
	   */

	  exports.DISCONNECT = 1;
	  /**
	   * Packet type `event`.
	   *
	   * @api public
	   */

	  exports.EVENT = 2;
	  /**
	   * Packet type `ack`.
	   *
	   * @api public
	   */

	  exports.ACK = 3;
	  /**
	   * Packet type `error`.
	   *
	   * @api public
	   */

	  exports.ERROR = 4;
	  /**
	   * Packet type 'binary event'
	   *
	   * @api public
	   */

	  exports.BINARY_EVENT = 5;
	  /**
	   * Packet type `binary ack`. For acks with binary arguments.
	   *
	   * @api public
	   */

	  exports.BINARY_ACK = 6;
	  /**
	   * Encoder constructor.
	   *
	   * @api public
	   */

	  exports.Encoder = Encoder;
	  /**
	   * Decoder constructor.
	   *
	   * @api public
	   */

	  exports.Decoder = Decoder;
	  /**
	   * A socket.io Encoder instance
	   *
	   * @api public
	   */

	  function Encoder() {}

	  var ERROR_PACKET = exports.ERROR + '"encode error"';
	  /**
	   * Encode a packet as a single string if non-binary, or as a
	   * buffer sequence, depending on packet type.
	   *
	   * @param {Object} obj - packet object
	   * @param {Function} callback - function to handle encodings (likely engine.write)
	   * @return Calls callback with Array of encodings
	   * @api public
	   */

	  Encoder.prototype.encode = function (obj, callback) {
	    // debug('encoding packet %j', obj);
	    //
	    // if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
	    //   encodeAsBinary(obj, callback);
	    // } else {
	    var encoding = encodeAsString(obj);
	    callback([encoding]); // }
	  };
	  /**
	   * Encode packet as string.
	   *
	   * @param {Object} packet
	   * @return {String} encoded
	   * @api private
	   */


	  function encodeAsString(obj) {
	    // first is type
	    var str = '' + obj.type; // attachments if we have them

	    if (exports.BINARY_EVENT === obj.type || exports.BINARY_ACK === obj.type) {
	      str += obj.attachments + '-';
	    } // if we have a namespace other than `/`
	    // we append it followed by a comma `,`


	    if (obj.nsp && '/' !== obj.nsp) {
	      str += obj.nsp + ',';
	    } // immediately followed by the id


	    if (null != obj.id) {
	      str += obj.id;
	    } // json data


	    if (null != obj.data) {
	      var payload = tryStringify(obj.data);

	      if (payload !== false) {
	        str += payload;
	      } else {
	        return ERROR_PACKET;
	      }
	    }

	    debug('encoded %j as %s', obj, str);
	    return str;
	  }

	  function tryStringify(str) {
	    try {
	      return JSON.stringify(str);
	    } catch (e) {
	      return false;
	    }
	  }
	  /**
	   * Encode packet as 'buffer sequence' by removing blobs, and
	   * deconstructing packet into object with placeholders and
	   * a list of buffers.
	   *
	   * @param {Object} packet
	   * @return {Buffer} encoded
	   * @api private
	   */
	  // function encodeAsBinary(obj, callback) {
	  //
	  //   function writeEncoding(bloblessData) {
	  //     var deconstruction = binary.deconstructPacket(bloblessData);
	  //     var pack = encodeAsString(deconstruction.packet);
	  //     var buffers = deconstruction.buffers;
	  //
	  //     buffers.unshift(pack); // add packet info to beginning of data list
	  //     callback(buffers); // write all the buffers
	  //   }
	  //
	  //   binary.removeBlobs(obj, writeEncoding);
	  // }

	  /**
	   * A socket.io Decoder instance
	   *
	   * @return {Object} decoder
	   * @api public
	   */


	  function Decoder() {
	    this.reconstructor = null;
	  }
	  /**
	   * Mix in `Emitter` with Decoder.
	   */


	  Emitter(Decoder.prototype);
	  /**
	   * Decodes an encoded packet string into packet JSON.
	   *
	   * @param {String} obj - encoded packet
	   * @return {Object} packet
	   * @api public
	   */

	  Decoder.prototype.add = function (obj) {
	    var packet;

	    if (typeof obj === 'string') {
	      packet = decodeString(obj); // if (exports.BINARY_EVENT === packet.type || exports.BINARY_ACK === packet.type) { // binary packet's json
	      //   this.reconstructor = new BinaryReconstructor(packet);
	      //
	      //   // no attachments, labeled binary but no binary data to follow
	      //   if (this.reconstructor.reconPack.attachments === 0) {
	      //     this.emit('decoded', packet);
	      //   }
	      // } else { // non-binary full packet

	      this.emit('decoded', packet); // }
	    } // else if (isBuf(obj) || obj.base64) { // raw binary data
	    //   if (!this.reconstructor) {
	    //     throw new Error('got binary data when not reconstructing a packet');
	    //   } else {
	    //     packet = this.reconstructor.takeBinaryData(obj);
	    //     if (packet) { // received final buffer
	    //       this.reconstructor = null;
	    //       this.emit('decoded', packet);
	    //     }
	    //   }
	    // }
	    else {
	      throw new Error('Unknown type: ' + obj);
	    }
	  };
	  /**
	   * Decode a packet String (JSON data)
	   *
	   * @param {String} str
	   * @return {Object} packet
	   * @api private
	   */


	  function decodeString(str) {
	    var i = 0; // look up type

	    var p = {
	      type: Number(str.charAt(0))
	    };

	    if (null == exports.types[p.type]) {
	      return error('unknown packet type ' + p.type);
	    } // look up attachments if type binary


	    if (exports.BINARY_EVENT === p.type || exports.BINARY_ACK === p.type) {
	      var buf = '';

	      while (str.charAt(++i) !== '-') {
	        buf += str.charAt(i);
	        if (i == str.length) break;
	      }

	      if (buf != Number(buf) || str.charAt(i) !== '-') {
	        throw new Error('Illegal attachments');
	      }

	      p.attachments = Number(buf);
	    } // look up namespace (if any)


	    if ('/' === str.charAt(i + 1)) {
	      p.nsp = '';

	      while (++i) {
	        var c = str.charAt(i);
	        if (',' === c) break;
	        p.nsp += c;
	        if (i === str.length) break;
	      }
	    } else {
	      p.nsp = '/';
	    } // look up id


	    var next = str.charAt(i + 1);

	    if ('' !== next && Number(next) == next) {
	      p.id = '';

	      while (++i) {
	        var c = str.charAt(i);

	        if (null == c || Number(c) != c) {
	          --i;
	          break;
	        }

	        p.id += str.charAt(i);
	        if (i === str.length) break;
	      }

	      p.id = Number(p.id);
	    } // look up json data


	    if (str.charAt(++i)) {
	      var payload = tryParse(str.substr(i));
	      var isPayloadValid = payload !== false && (p.type === exports.ERROR || isArray(payload));

	      if (isPayloadValid) {
	        p.data = payload;
	      } else {
	        return error('invalid payload');
	      }
	    }

	    debug('decoded %s as %j', str, p);
	    return p;
	  }

	  function tryParse(str) {
	    try {
	      return JSON.parse(str);
	    } catch (e) {
	      return false;
	    }
	  }
	  /**
	   * Deallocates a parser's resources
	   *
	   * @api public
	   */


	  Decoder.prototype.destroy = function () {
	    if (this.reconstructor) {
	      this.reconstructor.finishedReconstruction();
	    }
	  };

	  function error(msg) {
	    return {
	      type: exports.ERROR,
	      data: 'parser error: ' + msg
	    };
	  }
	})(socket_ioParser);

	var lib = {exports: {}};

	var transports$1 = {};

	var browser$1 = {};

	/**
	 * Gets the keys for an object.
	 *
	 * @return {Array} keys
	 * @api private
	 */

	var keys = Object.keys || function keys(obj) {
	  var arr = [];
	  var has = Object.prototype.hasOwnProperty;

	  for (var i in obj) {
	    if (has.call(obj, i)) {
	      arr.push(i);
	    }
	  }

	  return arr;
	};

	/*
	 * Module requirements.
	 */

	var isArray = isarray;
	var toString = Object.prototype.toString;
	var withNativeBlob = typeof Blob === 'function' || typeof Blob !== 'undefined' && toString.call(Blob) === '[object BlobConstructor]';
	var withNativeFile = typeof File === 'function' || typeof File !== 'undefined' && toString.call(File) === '[object FileConstructor]';
	/**
	 * Module exports.
	 */

	var hasBinary2 = hasBinary;
	/**
	 * Checks for binary data.
	 *
	 * Supports Buffer, ArrayBuffer, Blob and File.
	 *
	 * @param {Object} anything
	 * @api public
	 */

	function hasBinary(obj) {
	  if (!obj || _typeof(obj) !== 'object') {
	    return false;
	  }

	  if (isArray(obj)) {
	    for (var i = 0, l = obj.length; i < l; i++) {
	      if (hasBinary(obj[i])) {
	        return true;
	      }
	    }

	    return false;
	  }

	  if (typeof Buffer === 'function' && Buffer.isBuffer && Buffer.isBuffer(obj) || typeof ArrayBuffer === 'function' && obj instanceof ArrayBuffer || withNativeBlob && obj instanceof Blob || withNativeFile && obj instanceof File) {
	    return true;
	  } // see: https://github.com/Automattic/has-binary/pull/4


	  if (obj.toJSON && typeof obj.toJSON === 'function' && arguments.length === 1) {
	    return hasBinary(obj.toJSON(), true);
	  }

	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key) && hasBinary(obj[key])) {
	      return true;
	    }
	  }

	  return false;
	}

	var after_1 = after;

	function after(count, callback, err_cb) {
	  var bail = false;
	  err_cb = err_cb || noop$1;
	  proxy.count = count;
	  return count === 0 ? callback() : proxy;

	  function proxy(err, result) {
	    if (proxy.count <= 0) {
	      throw new Error('after called too many times');
	    }

	    --proxy.count; // after first error, rest are passed to err_cb

	    if (err) {
	      bail = true;
	      callback(err); // future error callbacks will go to error handler

	      callback = err_cb;
	    } else if (proxy.count === 0 && !bail) {
	      callback(null, result);
	    }
	  }
	}

	function noop$1() {}

	/*! https://mths.be/utf8js v2.1.2 by @mathias */
	var stringFromCharCode = String.fromCharCode; // Taken from https://mths.be/punycode

	function ucs2decode(string) {
	  var output = [];
	  var counter = 0;
	  var length = string.length;
	  var value;
	  var extra;

	  while (counter < length) {
	    value = string.charCodeAt(counter++);

	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // high surrogate, and there is a next character
	      extra = string.charCodeAt(counter++);

	      if ((extra & 0xFC00) == 0xDC00) {
	        // low surrogate
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // unmatched surrogate; only append this code unit, in case the next
	        // code unit is the high surrogate of a surrogate pair
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }

	  return output;
	} // Taken from https://mths.be/punycode


	function ucs2encode(array) {
	  var length = array.length;
	  var index = -1;
	  var value;
	  var output = '';

	  while (++index < length) {
	    value = array[index];

	    if (value > 0xFFFF) {
	      value -= 0x10000;
	      output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
	      value = 0xDC00 | value & 0x3FF;
	    }

	    output += stringFromCharCode(value);
	  }

	  return output;
	}

	function checkScalarValue(codePoint, strict) {
	  if (codePoint >= 0xD800 && codePoint <= 0xDFFF) {
	    if (strict) {
	      throw Error('Lone surrogate U+' + codePoint.toString(16).toUpperCase() + ' is not a scalar value');
	    }

	    return false;
	  }

	  return true;
	}
	/*--------------------------------------------------------------------------*/


	function createByte(codePoint, shift) {
	  return stringFromCharCode(codePoint >> shift & 0x3F | 0x80);
	}

	function encodeCodePoint(codePoint, strict) {
	  if ((codePoint & 0xFFFFFF80) == 0) {
	    // 1-byte sequence
	    return stringFromCharCode(codePoint);
	  }

	  var symbol = '';

	  if ((codePoint & 0xFFFFF800) == 0) {
	    // 2-byte sequence
	    symbol = stringFromCharCode(codePoint >> 6 & 0x1F | 0xC0);
	  } else if ((codePoint & 0xFFFF0000) == 0) {
	    // 3-byte sequence
	    if (!checkScalarValue(codePoint, strict)) {
	      codePoint = 0xFFFD;
	    }

	    symbol = stringFromCharCode(codePoint >> 12 & 0x0F | 0xE0);
	    symbol += createByte(codePoint, 6);
	  } else if ((codePoint & 0xFFE00000) == 0) {
	    // 4-byte sequence
	    symbol = stringFromCharCode(codePoint >> 18 & 0x07 | 0xF0);
	    symbol += createByte(codePoint, 12);
	    symbol += createByte(codePoint, 6);
	  }

	  symbol += stringFromCharCode(codePoint & 0x3F | 0x80);
	  return symbol;
	}

	function utf8encode(string, opts) {
	  opts = opts || {};
	  var strict = false !== opts.strict;
	  var codePoints = ucs2decode(string);
	  var length = codePoints.length;
	  var index = -1;
	  var codePoint;
	  var byteString = '';

	  while (++index < length) {
	    codePoint = codePoints[index];
	    byteString += encodeCodePoint(codePoint, strict);
	  }

	  return byteString;
	}
	/*--------------------------------------------------------------------------*/


	function readContinuationByte() {
	  if (byteIndex >= byteCount) {
	    throw Error('Invalid byte index');
	  }

	  var continuationByte = byteArray[byteIndex] & 0xFF;
	  byteIndex++;

	  if ((continuationByte & 0xC0) == 0x80) {
	    return continuationByte & 0x3F;
	  } // If we end up here, it’s not a continuation byte


	  throw Error('Invalid continuation byte');
	}

	function decodeSymbol(strict) {
	  var byte1;
	  var byte2;
	  var byte3;
	  var byte4;
	  var codePoint;

	  if (byteIndex > byteCount) {
	    throw Error('Invalid byte index');
	  }

	  if (byteIndex == byteCount) {
	    return false;
	  } // Read first byte


	  byte1 = byteArray[byteIndex] & 0xFF;
	  byteIndex++; // 1-byte sequence (no continuation bytes)

	  if ((byte1 & 0x80) == 0) {
	    return byte1;
	  } // 2-byte sequence


	  if ((byte1 & 0xE0) == 0xC0) {
	    byte2 = readContinuationByte();
	    codePoint = (byte1 & 0x1F) << 6 | byte2;

	    if (codePoint >= 0x80) {
	      return codePoint;
	    } else {
	      throw Error('Invalid continuation byte');
	    }
	  } // 3-byte sequence (may include unpaired surrogates)


	  if ((byte1 & 0xF0) == 0xE0) {
	    byte2 = readContinuationByte();
	    byte3 = readContinuationByte();
	    codePoint = (byte1 & 0x0F) << 12 | byte2 << 6 | byte3;

	    if (codePoint >= 0x0800) {
	      return checkScalarValue(codePoint, strict) ? codePoint : 0xFFFD;
	    } else {
	      throw Error('Invalid continuation byte');
	    }
	  } // 4-byte sequence


	  if ((byte1 & 0xF8) == 0xF0) {
	    byte2 = readContinuationByte();
	    byte3 = readContinuationByte();
	    byte4 = readContinuationByte();
	    codePoint = (byte1 & 0x07) << 0x12 | byte2 << 0x0C | byte3 << 0x06 | byte4;

	    if (codePoint >= 0x010000 && codePoint <= 0x10FFFF) {
	      return codePoint;
	    }
	  }

	  throw Error('Invalid UTF-8 detected');
	}

	var byteArray;
	var byteCount;
	var byteIndex;

	function utf8decode(byteString, opts) {
	  opts = opts || {};
	  var strict = false !== opts.strict;
	  byteArray = ucs2decode(byteString);
	  byteCount = byteArray.length;
	  byteIndex = 0;
	  var codePoints = [];
	  var tmp;

	  while ((tmp = decodeSymbol(strict)) !== false) {
	    codePoints.push(tmp);
	  }

	  return ucs2encode(codePoints);
	}

	var utf8 = {
	  version: '2.1.2',
	  encode: utf8encode,
	  decode: utf8decode
	};

	/**
	 * Create a blob builder even when vendor prefixes exist
	 */
	var BlobBuilder = typeof BlobBuilder !== 'undefined' ? BlobBuilder : typeof WebKitBlobBuilder !== 'undefined' ? WebKitBlobBuilder : typeof MSBlobBuilder !== 'undefined' ? MSBlobBuilder : typeof MozBlobBuilder !== 'undefined' ? MozBlobBuilder : false;
	/**
	 * Check if Blob constructor is supported
	 */

	var blobSupported = function () {
	  try {
	    var a = new Blob(['hi']);
	    return a.size === 2;
	  } catch (e) {
	    return false;
	  }
	}();
	/**
	 * Check if Blob constructor supports ArrayBufferViews
	 * Fails in Safari 6, so we need to map to ArrayBuffers there.
	 */


	var blobSupportsArrayBufferView = blobSupported && function () {
	  try {
	    var b = new Blob([new Uint8Array([1, 2])]);
	    return b.size === 2;
	  } catch (e) {
	    return false;
	  }
	}();
	/**
	 * Check if BlobBuilder is supported
	 */


	var blobBuilderSupported = BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob;
	/**
	 * Helper function that maps ArrayBufferViews to ArrayBuffers
	 * Used by BlobBuilder constructor and old browsers that didn't
	 * support it in the Blob constructor.
	 */

	function mapArrayBufferViews(ary) {
	  return ary.map(function (chunk) {
	    if (chunk.buffer instanceof ArrayBuffer) {
	      var buf = chunk.buffer; // if this is a subarray, make a copy so we only
	      // include the subarray region from the underlying buffer

	      if (chunk.byteLength !== buf.byteLength) {
	        var copy = new Uint8Array(chunk.byteLength);
	        copy.set(new Uint8Array(buf, chunk.byteOffset, chunk.byteLength));
	        buf = copy.buffer;
	      }

	      return buf;
	    }

	    return chunk;
	  });
	}

	function BlobBuilderConstructor(ary, options) {
	  options = options || {};
	  var bb = new BlobBuilder();
	  mapArrayBufferViews(ary).forEach(function (part) {
	    bb.append(part);
	  });
	  return options.type ? bb.getBlob(options.type) : bb.getBlob();
	}

	function BlobConstructor(ary, options) {
	  return new Blob(mapArrayBufferViews(ary), options || {});
	}

	if (typeof Blob !== 'undefined') {
	  BlobBuilderConstructor.prototype = Blob.prototype;
	  BlobConstructor.prototype = Blob.prototype;
	}

	var blob = function () {
	  if (blobSupported) {
	    return blobSupportsArrayBufferView ? Blob : BlobConstructor;
	  } else if (blobBuilderSupported) {
	    return BlobBuilderConstructor;
	  } else {
	    return undefined;
	  }
	}();

	/**
	 * Module dependencies.
	 */

	(function (exports) {
	  var keys$1 = keys;
	  var hasBinary = hasBinary2; // var sliceBuffer = require('arraybuffer.slice');

	  var after = after_1;
	  var utf8$1 = utf8; // var base64encoder;
	  // if (typeof ArrayBuffer !== 'undefined') {
	  //   base64encoder = require('base64-arraybuffer');
	  // }

	  /**
	   * Check if we are running an android browser. That requires us to use
	   * ArrayBuffer with polling transports...
	   *
	   * http://ghinda.net/jpeg-blob-ajax-android/
	   */

	  typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
	  /**
	   * Check if we are running in PhantomJS.
	   * Uploading a Blob with PhantomJS does not work correctly, as reported here:
	   * https://github.com/ariya/phantomjs/issues/11395
	   * @type boolean
	   */

	  typeof navigator !== 'undefined' && /PhantomJS/i.test(navigator.userAgent);
	  /**
	   * Current protocol version.
	   */

	  exports.protocol = 3;
	  /**
	   * Packet types.
	   */

	  var packets = exports.packets = {
	    open: 0 // non-ws
	    ,
	    close: 1 // non-ws
	    ,
	    ping: 2,
	    pong: 3,
	    message: 4,
	    upgrade: 5,
	    noop: 6
	  };
	  var packetslist = keys$1(packets);
	  /**
	   * Premade error packet.
	   */

	  var err = {
	    type: 'error',
	    data: 'parser error'
	  };
	  /**
	   * Create a blob api even for blob builder when vendor prefixes exist
	   */

	  var Blob = blob;
	  /**
	   * Encodes a packet.
	   *
	   *     <packet type id> [ <data> ]
	   *
	   * Example:
	   *
	   *     5hello world
	   *     3
	   *     4
	   *
	   * Binary is encoded in an identical principle
	   *
	   * @api private
	   */

	  exports.encodePacket = function (packet, supportsBinary, utf8encode, callback) {
	    if (typeof supportsBinary === 'function') {
	      callback = supportsBinary;
	      supportsBinary = false;
	    }

	    if (typeof utf8encode === 'function') {
	      callback = utf8encode;
	      utf8encode = null;
	    }

	    packet.data === undefined ? undefined : packet.data.buffer || packet.data; // if (typeof ArrayBuffer !== 'undefined' && data instanceof ArrayBuffer) {
	    //   return encodeArrayBuffer(packet, supportsBinary, callback);
	    // } else if (typeof Blob !== 'undefined' && data instanceof Blob) {
	    //   return encodeBlob(packet, supportsBinary, callback);
	    // }
	    //
	    // // might be an object with { base64: true, data: dataAsBase64String }
	    // if (data && data.base64) {
	    //   return encodeBase64Object(packet, callback);
	    // }
	    // Sending data as a utf-8 string

	    var encoded = packets[packet.type]; // data fragment is optional

	    if (undefined !== packet.data) {
	      encoded += utf8encode ? utf8$1.encode(String(packet.data), {
	        strict: false
	      }) : String(packet.data);
	    }

	    return callback('' + encoded);
	  }; // function encodeBase64Object(packet, callback) {
	  //   // packet data is an object { base64: true, data: dataAsBase64String }
	  //   var message = 'b' + exports.packets[packet.type] + packet.data.data;
	  //   return callback(message);
	  // }

	  /**
	   * Encode packet helpers for binary types
	   */
	  // function encodeArrayBuffer(packet, supportsBinary, callback) {
	  //   if (!supportsBinary) {
	  //     return exports.encodeBase64Packet(packet, callback);
	  //   }
	  //
	  //   var data = packet.data;
	  //   var contentArray = new Uint8Array(data);
	  //   var resultBuffer = new Uint8Array(1 + data.byteLength);
	  //
	  //   resultBuffer[0] = packets[packet.type];
	  //   for (var i = 0; i < contentArray.length; i++) {
	  //     resultBuffer[i+1] = contentArray[i];
	  //   }
	  //
	  //   return callback(resultBuffer.buffer);
	  // }
	  //
	  // function encodeBlobAsArrayBuffer(packet, supportsBinary, callback) {
	  //   if (!supportsBinary) {
	  //     return exports.encodeBase64Packet(packet, callback);
	  //   }
	  //
	  //   var fr = new FileReader();
	  //   fr.onload = function() {
	  //     exports.encodePacket({ type: packet.type, data: fr.result }, supportsBinary, true, callback);
	  //   };
	  //   return fr.readAsArrayBuffer(packet.data);
	  // }
	  //
	  // function encodeBlob(packet, supportsBinary, callback) {
	  //   if (!supportsBinary) {
	  //     return exports.encodeBase64Packet(packet, callback);
	  //   }
	  //
	  //   if (dontSendBlobs) {
	  //     return encodeBlobAsArrayBuffer(packet, supportsBinary, callback);
	  //   }
	  //
	  //   var length = new Uint8Array(1);
	  //   length[0] = packets[packet.type];
	  //   var blob = new Blob([length.buffer, packet.data]);
	  //
	  //   return callback(blob);
	  // }

	  /**
	   * Encodes a packet with binary data in a base64 string
	   *
	   * @param {Object} packet, has `type` and `data`
	   * @return {String} base64 encoded message
	   */
	  // exports.encodeBase64Packet = function(packet, callback) {
	  //   var message = 'b' + exports.packets[packet.type];
	  //   if (typeof Blob !== 'undefined' && packet.data instanceof Blob) {
	  //     var fr = new FileReader();
	  //     fr.onload = function() {
	  //       var b64 = fr.result.split(',')[1];
	  //       callback(message + b64);
	  //     };
	  //     return fr.readAsDataURL(packet.data);
	  //   }
	  //
	  //   var b64data;
	  //   try {
	  //     b64data = String.fromCharCode.apply(null, new Uint8Array(packet.data));
	  //   } catch (e) {
	  //     // iPhone Safari doesn't let you apply with typed arrays
	  //     var typed = new Uint8Array(packet.data);
	  //     var basic = new Array(typed.length);
	  //     for (var i = 0; i < typed.length; i++) {
	  //       basic[i] = typed[i];
	  //     }
	  //     b64data = String.fromCharCode.apply(null, basic);
	  //   }
	  //   message += btoa(b64data);
	  //   return callback(message);
	  // };

	  /**
	   * Decodes a packet. Changes format to Blob if requested.
	   *
	   * @return {Object} with `type` and `data` (if any)
	   * @api private
	   */


	  exports.decodePacket = function (data, binaryType, utf8decode) {
	    if (data === undefined) {
	      return err;
	    } // String data


	    if (typeof data === 'string') {
	      // if (data.charAt(0) === 'b') {
	      //   return exports.decodeBase64Packet(data.substr(1), binaryType);
	      // }
	      if (utf8decode) {
	        data = tryDecode(data);

	        if (data === false) {
	          return err;
	        }
	      }

	      var type = data.charAt(0);

	      if (Number(type) != type || !packetslist[type]) {
	        return err;
	      }

	      if (data.length > 1) {
	        return {
	          type: packetslist[type],
	          data: data.substring(1)
	        };
	      } else {
	        return {
	          type: packetslist[type]
	        };
	      }
	    }

	    var asArray = new Uint8Array(data);
	    var type = asArray[0];
	    var rest = sliceBuffer(data, 1);

	    if (Blob && binaryType === 'blob') {
	      rest = new Blob([rest]);
	    }

	    return {
	      type: packetslist[type],
	      data: rest
	    };
	  };

	  function tryDecode(data) {
	    try {
	      data = utf8$1.decode(data, {
	        strict: false
	      });
	    } catch (e) {
	      return false;
	    }

	    return data;
	  }
	  /**
	   * Decodes a packet encoded in a base64 string
	   *
	   * @param {String} base64 encoded message
	   * @return {Object} with `type` and `data` (if any)
	   */
	  // exports.decodeBase64Packet = function(msg, binaryType) {
	  //   var type = packetslist[msg.charAt(0)];
	  //   if (!base64encoder) {
	  //     return { type: type, data: { base64: true, data: msg.substr(1) } };
	  //   }
	  //
	  //   var data = base64encoder.decode(msg.substr(1));
	  //
	  //   if (binaryType === 'blob' && Blob) {
	  //     data = new Blob([data]);
	  //   }
	  //
	  //   return { type: type, data: data };
	  // };

	  /**
	   * Encodes multiple messages (payload).
	   *
	   *     <length>:data
	   *
	   * Example:
	   *
	   *     11:hello world2:hi
	   *
	   * If any contents are binary, they will be encoded as base64 strings. Base64
	   * encoded strings are marked with a b before the length specifier
	   *
	   * @param {Array} packets
	   * @api private
	   */


	  exports.encodePayload = function (packets, supportsBinary, callback) {
	    if (typeof supportsBinary === 'function') {
	      callback = supportsBinary;
	      supportsBinary = null;
	    }

	    var isBinary = hasBinary(packets); //
	    // if (supportsBinary && isBinary) {
	    //   if (Blob && !dontSendBlobs) {
	    //     return exports.encodePayloadAsBlob(packets, callback);
	    //   }
	    //
	    //   return exports.encodePayloadAsArrayBuffer(packets, callback);
	    // }

	    if (!packets.length) {
	      return callback('0:');
	    }

	    function setLengthHeader(message) {
	      return message.length + ':' + message;
	    }

	    function encodeOne(packet, doneCallback) {
	      exports.encodePacket(packet, !isBinary ? false : supportsBinary, true, function (message) {
	        doneCallback(null, setLengthHeader(message));
	      });
	    }

	    map(packets, encodeOne, function (err, results) {
	      return callback(results.join(''));
	    });
	  };
	  /**
	   * Async array map using after
	   */


	  function map(ary, each, done) {
	    var result = new Array(ary.length);
	    var next = after(ary.length, done);

	    var eachWithIndex = function eachWithIndex(i, el, cb) {
	      each(el, function (error, msg) {
	        result[i] = msg;
	        cb(error, result);
	      });
	    };

	    for (var i = 0; i < ary.length; i++) {
	      eachWithIndex(i, ary[i], next);
	    }
	  }
	  /*
	   * Decodes data when a payload is maybe expected. Possible binary contents are
	   * decoded from their base64 representation
	   *
	   * @param {String} data, callback method
	   * @api public
	   */


	  exports.decodePayload = function (data, binaryType, callback) {
	    // if (typeof data !== 'string') {
	    //   return exports.decodePayloadAsBinary(data, binaryType, callback);
	    // }
	    if (typeof binaryType === 'function') {
	      callback = binaryType;
	      binaryType = null;
	    }

	    var packet;

	    if (data === '') {
	      // parser error - ignoring payload
	      return callback(err, 0, 1);
	    }

	    var length = '',
	        n,
	        msg;

	    for (var i = 0, l = data.length; i < l; i++) {
	      var chr = data.charAt(i);

	      if (chr !== ':') {
	        length += chr;
	        continue;
	      }

	      if (length === '' || length != (n = Number(length))) {
	        // parser error - ignoring payload
	        return callback(err, 0, 1);
	      }

	      msg = data.substr(i + 1, n);

	      if (length != msg.length) {
	        // parser error - ignoring payload
	        return callback(err, 0, 1);
	      }

	      if (msg.length) {
	        packet = exports.decodePacket(msg, binaryType, true);

	        if (err.type === packet.type && err.data === packet.data) {
	          // parser error in individual packet - ignoring payload
	          return callback(err, 0, 1);
	        }

	        var ret = callback(packet, i + n, l);
	        if (false === ret) return;
	      } // advance cursor


	      i += n;
	      length = '';
	    }

	    if (length !== '') {
	      // parser error - ignoring payload
	      return callback(err, 0, 1);
	    }
	  };
	  /**
	   * Encodes multiple messages (payload) as binary.
	   *
	   * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
	   * 255><data>
	   *
	   * Example:
	   * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
	   *
	   * @param {Array} packets
	   * @return {ArrayBuffer} encoded payload
	   * @api private
	   */
	  // exports.encodePayloadAsArrayBuffer = function(packets, callback) {
	  //   if (!packets.length) {
	  //     return callback(new ArrayBuffer(0));
	  //   }
	  //
	  //   function encodeOne(packet, doneCallback) {
	  //     exports.encodePacket(packet, true, true, function(data) {
	  //       return doneCallback(null, data);
	  //     });
	  //   }
	  //
	  //   map(packets, encodeOne, function(err, encodedPackets) {
	  //     var totalLength = encodedPackets.reduce(function(acc, p) {
	  //       var len;
	  //       if (typeof p === 'string'){
	  //         len = p.length;
	  //       } else {
	  //         len = p.byteLength;
	  //       }
	  //       return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
	  //     }, 0);
	  //
	  //     var resultArray = new Uint8Array(totalLength);
	  //
	  //     var bufferIndex = 0;
	  //     encodedPackets.forEach(function(p) {
	  //       var isString = typeof p === 'string';
	  //       var ab = p;
	  //       if (isString) {
	  //         var view = new Uint8Array(p.length);
	  //         for (var i = 0; i < p.length; i++) {
	  //           view[i] = p.charCodeAt(i);
	  //         }
	  //         ab = view.buffer;
	  //       }
	  //
	  //       if (isString) { // not true binary
	  //         resultArray[bufferIndex++] = 0;
	  //       } else { // true binary
	  //         resultArray[bufferIndex++] = 1;
	  //       }
	  //
	  //       var lenStr = ab.byteLength.toString();
	  //       for (var i = 0; i < lenStr.length; i++) {
	  //         resultArray[bufferIndex++] = parseInt(lenStr[i]);
	  //       }
	  //       resultArray[bufferIndex++] = 255;
	  //
	  //       var view = new Uint8Array(ab);
	  //       for (var i = 0; i < view.length; i++) {
	  //         resultArray[bufferIndex++] = view[i];
	  //       }
	  //     });
	  //
	  //     return callback(resultArray.buffer);
	  //   });
	  // };

	  /**
	   * Encode as Blob
	   */
	  // exports.encodePayloadAsBlob = function(packets, callback) {
	  //   function encodeOne(packet, doneCallback) {
	  //     exports.encodePacket(packet, true, true, function(encoded) {
	  //       var binaryIdentifier = new Uint8Array(1);
	  //       binaryIdentifier[0] = 1;
	  //       if (typeof encoded === 'string') {
	  //         var view = new Uint8Array(encoded.length);
	  //         for (var i = 0; i < encoded.length; i++) {
	  //           view[i] = encoded.charCodeAt(i);
	  //         }
	  //         encoded = view.buffer;
	  //         binaryIdentifier[0] = 0;
	  //       }
	  //
	  //       var len = (encoded instanceof ArrayBuffer)
	  //         ? encoded.byteLength
	  //         : encoded.size;
	  //
	  //       var lenStr = len.toString();
	  //       var lengthAry = new Uint8Array(lenStr.length + 1);
	  //       for (var i = 0; i < lenStr.length; i++) {
	  //         lengthAry[i] = parseInt(lenStr[i]);
	  //       }
	  //       lengthAry[lenStr.length] = 255;
	  //
	  //       if (Blob) {
	  //         var blob = new Blob([binaryIdentifier.buffer, lengthAry.buffer, encoded]);
	  //         doneCallback(null, blob);
	  //       }
	  //     });
	  //   }
	  //
	  //   map(packets, encodeOne, function(err, results) {
	  //     return callback(new Blob(results));
	  //   });
	  // };

	  /*
	   * Decodes data when a payload is maybe expected. Strings are decoded by
	   * interpreting each byte as a key code for entries marked to start with 0. See
	   * description of encodePayloadAsBinary
	   *
	   * @param {ArrayBuffer} data, callback method
	   * @api public
	   */
	  // exports.decodePayloadAsBinary = function (data, binaryType, callback) {
	  //   if (typeof binaryType === 'function') {
	  //     callback = binaryType;
	  //     binaryType = null;
	  //   }
	  //
	  //   var bufferTail = data;
	  //   var buffers = [];
	  //
	  //   while (bufferTail.byteLength > 0) {
	  //     var tailArray = new Uint8Array(bufferTail);
	  //     var isString = tailArray[0] === 0;
	  //     var msgLength = '';
	  //
	  //     for (var i = 1; ; i++) {
	  //       if (tailArray[i] === 255) break;
	  //
	  //       // 310 = char length of Number.MAX_VALUE
	  //       if (msgLength.length > 310) {
	  //         return callback(err, 0, 1);
	  //       }
	  //
	  //       msgLength += tailArray[i];
	  //     }
	  //
	  //     bufferTail = sliceBuffer(bufferTail, 2 + msgLength.length);
	  //     msgLength = parseInt(msgLength);
	  //
	  //     var msg = sliceBuffer(bufferTail, 0, msgLength);
	  //     if (isString) {
	  //       try {
	  //         msg = String.fromCharCode.apply(null, new Uint8Array(msg));
	  //       } catch (e) {
	  //         // iPhone Safari doesn't let you apply to typed arrays
	  //         var typed = new Uint8Array(msg);
	  //         msg = '';
	  //         for (var i = 0; i < typed.length; i++) {
	  //           msg += String.fromCharCode(typed[i]);
	  //         }
	  //       }
	  //     }
	  //
	  //     buffers.push(msg);
	  //     bufferTail = sliceBuffer(bufferTail, msgLength);
	  //   }
	  //
	  //   var total = buffers.length;
	  //   buffers.forEach(function(buffer, i) {
	  //     callback(exports.decodePacket(buffer, binaryType, true), i, total);
	  //   });
	  // };

	})(browser$1);

	/**
	 * Module dependencies.
	 */
	var parser$4 = browser$1;
	var Emitter$4 = componentEmitter.exports;
	/**
	 * Module exports.
	 */

	var transport = Transport$2;
	/**
	 * Transport abstract constructor.
	 *
	 * @param {Object} options.
	 * @api private
	 */

	function Transport$2(opts) {
	  this.path = opts.path;
	  this.hostname = opts.hostname;
	  this.port = opts.port;
	  this.secure = opts.secure;
	  this.query = opts.query;
	  this.timestampParam = opts.timestampParam;
	  this.timestampRequests = opts.timestampRequests;
	  this.readyState = '';
	  this.agent = opts.agent || false;
	  this.socket = opts.socket;
	  this.enablesXDR = opts.enablesXDR; // SSL options for Node.js client

	  this.pfx = opts.pfx;
	  this.key = opts.key;
	  this.passphrase = opts.passphrase;
	  this.cert = opts.cert;
	  this.ca = opts.ca;
	  this.ciphers = opts.ciphers;
	  this.rejectUnauthorized = opts.rejectUnauthorized;
	  this.forceNode = opts.forceNode; // results of ReactNative environment detection

	  this.isReactNative = opts.isReactNative; // other options for Node.js client

	  this.extraHeaders = opts.extraHeaders;
	  this.localAddress = opts.localAddress;
	}
	/**
	 * Mix in `Emitter`.
	 */


	Emitter$4(Transport$2.prototype);
	/**
	 * Emits an error.
	 *
	 * @param {String} str
	 * @return {Transport} for chaining
	 * @api public
	 */

	Transport$2.prototype.onError = function (msg, desc) {
	  var err = new Error(msg);
	  err.type = 'TransportError';
	  err.description = desc;
	  this.emit('error', err);
	  return this;
	};
	/**
	 * Opens the transport.
	 *
	 * @api public
	 */


	Transport$2.prototype.open = function () {
	  if ('closed' === this.readyState || '' === this.readyState) {
	    this.readyState = 'opening';
	    this.doOpen();
	  }

	  return this;
	};
	/**
	 * Closes the transport.
	 *
	 * @api private
	 */


	Transport$2.prototype.close = function () {
	  if ('opening' === this.readyState || 'open' === this.readyState) {
	    this.doClose();
	    this.onClose();
	  }

	  return this;
	};
	/**
	 * Sends multiple packets.
	 *
	 * @param {Array} packets
	 * @api private
	 */


	Transport$2.prototype.send = function (packets) {
	  if ('open' === this.readyState) {
	    this.write(packets);
	  } else {
	    throw new Error('Transport not open');
	  }
	};
	/**
	 * Called upon open
	 *
	 * @api private
	 */


	Transport$2.prototype.onOpen = function () {
	  this.readyState = 'open';
	  this.writable = true;
	  this.emit('open');
	};
	/**
	 * Called with data.
	 *
	 * @param {String} data
	 * @api private
	 */


	Transport$2.prototype.onData = function (data) {
	  var packet = parser$4.decodePacket(data, this.socket.binaryType);
	  this.onPacket(packet);
	};
	/**
	 * Called with a decoded packet.
	 */


	Transport$2.prototype.onPacket = function (packet) {
	  this.emit('packet', packet);
	};
	/**
	 * Called upon close.
	 *
	 * @api private
	 */


	Transport$2.prototype.onClose = function () {
	  this.readyState = 'closed';
	  this.emit('close');
	};

	var parseqs$3 = {};

	/**
	 * Compiles a querystring
	 * Returns string representation of the object
	 *
	 * @param {Object}
	 * @api private
	 */

	parseqs$3.encode = function (obj) {
	  var str = '';

	  for (var i in obj) {
	    if (obj.hasOwnProperty(i)) {
	      if (str.length) str += '&';
	      str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);
	    }
	  }

	  return str;
	};
	/**
	 * Parses a simple querystring into an object
	 *
	 * @param {String} qs
	 * @api private
	 */


	parseqs$3.decode = function (qs) {
	  var qry = {};
	  var pairs = qs.split('&');

	  for (var i = 0, l = pairs.length; i < l; i++) {
	    var pair = pairs[i].split('=');
	    qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
	  }

	  return qry;
	};

	var componentInherit = function componentInherit(a, b) {
	  var fn = function fn() {};

	  fn.prototype = b.prototype;
	  a.prototype = new fn();
	  a.prototype.constructor = a;
	};

	var alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''),
	    length = 64,
	    map = {},
	    seed = 0,
	    i$1 = 0,
	    prev;
	/**
	 * Return a string representing the specified number.
	 *
	 * @param {Number} num The number to convert.
	 * @returns {String} The string representation of the number.
	 * @api public
	 */

	function encode(num) {
	  var encoded = '';

	  do {
	    encoded = alphabet[num % length] + encoded;
	    num = Math.floor(num / length);
	  } while (num > 0);

	  return encoded;
	}
	/**
	 * Return the integer value specified by the given string.
	 *
	 * @param {String} str The string to convert.
	 * @returns {Number} The integer value represented by the string.
	 * @api public
	 */


	function decode(str) {
	  var decoded = 0;

	  for (i$1 = 0; i$1 < str.length; i$1++) {
	    decoded = decoded * length + map[str.charAt(i$1)];
	  }

	  return decoded;
	}
	/**
	 * Yeast: A tiny growing id generator.
	 *
	 * @returns {String} A unique id.
	 * @api public
	 */


	function yeast$2() {
	  var now = encode(+new Date());
	  if (now !== prev) return seed = 0, prev = now;
	  return now + '.' + encode(seed++);
	} //
	// Map each character to its index.
	//


	for (; i$1 < length; i$1++) {
	  map[alphabet[i$1]] = i$1;
	} //
	// Expose the `yeast`, `encode` and `decode` functions.
	//


	yeast$2.encode = encode;
	yeast$2.decode = decode;
	var yeast_1 = yeast$2;

	var browser = {exports: {}};

	var debug$4 = {exports: {}};

	var s = 1000;
	var m = s * 60;
	var h = m * 60;
	var d = h * 24;
	var y = d * 365.25;
	/**
	 * Parse or format the given `val`.
	 *
	 * Options:
	 *
	 *  - `long` verbose formatting [false]
	 *
	 * @param {String|Number} val
	 * @param {Object} [options]
	 * @throws {Error} throw an error if val is not a non-empty string or a number
	 * @return {String|Number}
	 * @api public
	 */

	var ms = function ms(val, options) {
	  options = options || {};

	  var type = _typeof(val);

	  if (type === 'string' && val.length > 0) {
	    return parse(val);
	  } else if (type === 'number' && isNaN(val) === false) {
	    return options["long"] ? fmtLong(val) : fmtShort(val);
	  }

	  throw new Error('val is not a non-empty string or a valid number. val=' + JSON.stringify(val));
	};
	/**
	 * Parse the given `str` and return milliseconds.
	 *
	 * @param {String} str
	 * @return {Number}
	 * @api private
	 */


	function parse(str) {
	  str = String(str);

	  if (str.length > 100) {
	    return;
	  }

	  var match = /^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);

	  if (!match) {
	    return;
	  }

	  var n = parseFloat(match[1]);
	  var type = (match[2] || 'ms').toLowerCase();

	  switch (type) {
	    case 'years':
	    case 'year':
	    case 'yrs':
	    case 'yr':
	    case 'y':
	      return n * y;

	    case 'days':
	    case 'day':
	    case 'd':
	      return n * d;

	    case 'hours':
	    case 'hour':
	    case 'hrs':
	    case 'hr':
	    case 'h':
	      return n * h;

	    case 'minutes':
	    case 'minute':
	    case 'mins':
	    case 'min':
	    case 'm':
	      return n * m;

	    case 'seconds':
	    case 'second':
	    case 'secs':
	    case 'sec':
	    case 's':
	      return n * s;

	    case 'milliseconds':
	    case 'millisecond':
	    case 'msecs':
	    case 'msec':
	    case 'ms':
	      return n;

	    default:
	      return undefined;
	  }
	}
	/**
	 * Short format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */


	function fmtShort(ms) {
	  if (ms >= d) {
	    return Math.round(ms / d) + 'd';
	  }

	  if (ms >= h) {
	    return Math.round(ms / h) + 'h';
	  }

	  if (ms >= m) {
	    return Math.round(ms / m) + 'm';
	  }

	  if (ms >= s) {
	    return Math.round(ms / s) + 's';
	  }

	  return ms + 'ms';
	}
	/**
	 * Long format for `ms`.
	 *
	 * @param {Number} ms
	 * @return {String}
	 * @api private
	 */


	function fmtLong(ms) {
	  return plural(ms, d, 'day') || plural(ms, h, 'hour') || plural(ms, m, 'minute') || plural(ms, s, 'second') || ms + ' ms';
	}
	/**
	 * Pluralization helper.
	 */


	function plural(ms, n, name) {
	  if (ms < n) {
	    return;
	  }

	  if (ms < n * 1.5) {
	    return Math.floor(ms / n) + ' ' + name;
	  }

	  return Math.ceil(ms / n) + ' ' + name + 's';
	}

	(function (module, exports) {
	  /**
	   * This is the common logic for both the Node.js and web browser
	   * implementations of `debug()`.
	   *
	   * Expose `debug()` as the module.
	   */
	  exports = module.exports = createDebug.debug = createDebug['default'] = createDebug;
	  exports.coerce = coerce;
	  exports.disable = disable;
	  exports.enable = enable;
	  exports.enabled = enabled;
	  exports.humanize = ms;
	  /**
	   * Active `debug` instances.
	   */

	  exports.instances = [];
	  /**
	   * The currently active debug mode names, and names to skip.
	   */

	  exports.names = [];
	  exports.skips = [];
	  /**
	   * Map of special "%n" handling functions, for the debug "format" argument.
	   *
	   * Valid key names are a single, lower or upper-case letter, i.e. "n" and "N".
	   */

	  exports.formatters = {};
	  /**
	   * Select a color.
	   * @param {String} namespace
	   * @return {Number}
	   * @api private
	   */

	  function selectColor(namespace) {
	    var hash = 0,
	        i;

	    for (i in namespace) {
	      hash = (hash << 5) - hash + namespace.charCodeAt(i);
	      hash |= 0; // Convert to 32bit integer
	    }

	    return exports.colors[Math.abs(hash) % exports.colors.length];
	  }
	  /**
	   * Create a debugger with the given `namespace`.
	   *
	   * @param {String} namespace
	   * @return {Function}
	   * @api public
	   */


	  function createDebug(namespace) {
	    var prevTime;

	    function debug() {
	      // disabled?
	      if (!debug.enabled) return;
	      var self = debug; // set `diff` timestamp

	      var curr = +new Date();
	      var ms = curr - (prevTime || curr);
	      self.diff = ms;
	      self.prev = prevTime;
	      self.curr = curr;
	      prevTime = curr; // turn the `arguments` into a proper Array

	      var args = new Array(arguments.length);

	      for (var i = 0; i < args.length; i++) {
	        args[i] = arguments[i];
	      }

	      args[0] = exports.coerce(args[0]);

	      if ('string' !== typeof args[0]) {
	        // anything else let's inspect with %O
	        args.unshift('%O');
	      } // apply any `formatters` transformations


	      var index = 0;
	      args[0] = args[0].replace(/%([a-zA-Z%])/g, function (match, format) {
	        // if we encounter an escaped % then don't increase the array index
	        if (match === '%%') return match;
	        index++;
	        var formatter = exports.formatters[format];

	        if ('function' === typeof formatter) {
	          var val = args[index];
	          match = formatter.call(self, val); // now we need to remove `args[index]` since it's inlined in the `format`

	          args.splice(index, 1);
	          index--;
	        }

	        return match;
	      }); // apply env-specific formatting (colors, etc.)

	      exports.formatArgs.call(self, args);
	      var logFn = debug.log || exports.log || console.log.bind(console);
	      logFn.apply(self, args);
	    }

	    debug.namespace = namespace;
	    debug.enabled = exports.enabled(namespace);
	    debug.useColors = exports.useColors();
	    debug.color = selectColor(namespace);
	    debug.destroy = destroy; // env-specific initialization logic for debug instances

	    if ('function' === typeof exports.init) {
	      exports.init(debug);
	    }

	    exports.instances.push(debug);
	    return debug;
	  }

	  function destroy() {
	    var index = exports.instances.indexOf(this);

	    if (index !== -1) {
	      exports.instances.splice(index, 1);
	      return true;
	    } else {
	      return false;
	    }
	  }
	  /**
	   * Enables a debug mode by namespaces. This can include modes
	   * separated by a colon and wildcards.
	   *
	   * @param {String} namespaces
	   * @api public
	   */


	  function enable(namespaces) {
	    exports.save(namespaces);
	    exports.names = [];
	    exports.skips = [];
	    var i;
	    var split = (typeof namespaces === 'string' ? namespaces : '').split(/[\s,]+/);
	    var len = split.length;

	    for (i = 0; i < len; i++) {
	      if (!split[i]) continue; // ignore empty strings

	      namespaces = split[i].replace(/\*/g, '.*?');

	      if (namespaces[0] === '-') {
	        exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
	      } else {
	        exports.names.push(new RegExp('^' + namespaces + '$'));
	      }
	    }

	    for (i = 0; i < exports.instances.length; i++) {
	      var instance = exports.instances[i];
	      instance.enabled = exports.enabled(instance.namespace);
	    }
	  }
	  /**
	   * Disable debug output.
	   *
	   * @api public
	   */


	  function disable() {
	    exports.enable('');
	  }
	  /**
	   * Returns true if the given mode name is enabled, false otherwise.
	   *
	   * @param {String} name
	   * @return {Boolean}
	   * @api public
	   */


	  function enabled(name) {
	    if (name[name.length - 1] === '*') {
	      return true;
	    }

	    var i, len;

	    for (i = 0, len = exports.skips.length; i < len; i++) {
	      if (exports.skips[i].test(name)) {
	        return false;
	      }
	    }

	    for (i = 0, len = exports.names.length; i < len; i++) {
	      if (exports.names[i].test(name)) {
	        return true;
	      }
	    }

	    return false;
	  }
	  /**
	   * Coerce `val`.
	   *
	   * @param {Mixed} val
	   * @return {Mixed}
	   * @api private
	   */


	  function coerce(val) {
	    if (val instanceof Error) return val.stack || val.message;
	    return val;
	  }
	})(debug$4, debug$4.exports);

	(function (module, exports) {
	  exports = module.exports = debug$4.exports;
	  exports.log = log;
	  exports.formatArgs = formatArgs;
	  exports.save = save;
	  exports.load = load;
	  exports.useColors = useColors;
	  exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage ? chrome.storage.local : localstorage();
	  /**
	   * Colors.
	   */

	  exports.colors = ['#0000CC', '#0000FF', '#0033CC', '#0033FF', '#0066CC', '#0066FF', '#0099CC', '#0099FF', '#00CC00', '#00CC33', '#00CC66', '#00CC99', '#00CCCC', '#00CCFF', '#3300CC', '#3300FF', '#3333CC', '#3333FF', '#3366CC', '#3366FF', '#3399CC', '#3399FF', '#33CC00', '#33CC33', '#33CC66', '#33CC99', '#33CCCC', '#33CCFF', '#6600CC', '#6600FF', '#6633CC', '#6633FF', '#66CC00', '#66CC33', '#9900CC', '#9900FF', '#9933CC', '#9933FF', '#99CC00', '#99CC33', '#CC0000', '#CC0033', '#CC0066', '#CC0099', '#CC00CC', '#CC00FF', '#CC3300', '#CC3333', '#CC3366', '#CC3399', '#CC33CC', '#CC33FF', '#CC6600', '#CC6633', '#CC9900', '#CC9933', '#CCCC00', '#CCCC33', '#FF0000', '#FF0033', '#FF0066', '#FF0099', '#FF00CC', '#FF00FF', '#FF3300', '#FF3333', '#FF3366', '#FF3399', '#FF33CC', '#FF33FF', '#FF6600', '#FF6633', '#FF9900', '#FF9933', '#FFCC00', '#FFCC33'];
	  /**
	   * Currently only WebKit-based Web Inspectors, Firefox >= v31,
	   * and the Firebug extension (any Firefox version) are known
	   * to support "%c" CSS customizations.
	   *
	   * TODO: add a `localStorage` variable to explicitly enable/disable colors
	   */

	  function useColors() {
	    // NB: In an Electron preload script, document will be defined but not fully
	    // initialized. Since we know we're in Chrome, we'll just detect this case
	    // explicitly
	    if (typeof window !== 'undefined' && window.process && window.process.type === 'renderer') {
	      return true;
	    } // Internet Explorer and Edge do not support colors.


	    if (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
	      return false;
	    } // is webkit? http://stackoverflow.com/a/16459606/376773
	    // document is undefined in react-native: https://github.com/facebook/react-native/pull/1632


	    return typeof document !== 'undefined' && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // is firebug? http://stackoverflow.com/a/398120/376773
	    typeof window !== 'undefined' && window.console && (window.console.firebug || window.console.exception && window.console.table) || // is firefox >= v31?
	    // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
	    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1, 10) >= 31 || // double check webkit in userAgent just in case we are in a worker
	    typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
	  }
	  /**
	   * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
	   */


	  exports.formatters.j = function (v) {
	    try {
	      return JSON.stringify(v);
	    } catch (err) {
	      return '[UnexpectedJSONParseError]: ' + err.message;
	    }
	  };
	  /**
	   * Colorize log arguments if enabled.
	   *
	   * @api public
	   */


	  function formatArgs(args) {
	    var useColors = this.useColors;
	    args[0] = (useColors ? '%c' : '') + this.namespace + (useColors ? ' %c' : ' ') + args[0] + (useColors ? '%c ' : ' ') + '+' + exports.humanize(this.diff);
	    if (!useColors) return;
	    var c = 'color: ' + this.color;
	    args.splice(1, 0, c, 'color: inherit'); // the final "%c" is somewhat tricky, because there could be other
	    // arguments passed either before or after the %c, so we need to
	    // figure out the correct index to insert the CSS into

	    var index = 0;
	    var lastC = 0;
	    args[0].replace(/%[a-zA-Z%]/g, function (match) {
	      if ('%%' === match) return;
	      index++;

	      if ('%c' === match) {
	        // we only are interested in the *last* %c
	        // (the user may have provided their own)
	        lastC = index;
	      }
	    });
	    args.splice(lastC, 0, c);
	  }
	  /**
	   * Invokes `console.log()` when available.
	   * No-op when `console.log` is not a "function".
	   *
	   * @api public
	   */


	  function log() {
	    // this hackery is required for IE8/9, where
	    // the `console.log` function doesn't have 'apply'
	    return 'object' === (typeof console === "undefined" ? "undefined" : _typeof(console)) && console.log && Function.prototype.apply.call(console.log, console, arguments);
	  }
	  /**
	   * Save `namespaces`.
	   *
	   * @param {String} namespaces
	   * @api private
	   */


	  function save(namespaces) {
	    try {
	      if (null == namespaces) {
	        exports.storage.removeItem('debug');
	      } else {
	        exports.storage.debug = namespaces;
	      }
	    } catch (e) {}
	  }
	  /**
	   * Load `namespaces`.
	   *
	   * @return {String} returns the previously persisted debug modes
	   * @api private
	   */


	  function load() {
	    var r;

	    try {
	      r = exports.storage.debug;
	    } catch (e) {} // If debug isn't set in LS, and we're in Electron, try to load $DEBUG


	    if (!r && typeof process !== 'undefined' && 'env' in process) {
	      r = process.env.DEBUG;
	    }

	    return r;
	  }
	  /**
	   * Enable namespaces listed in `localStorage.debug` initially.
	   */


	  exports.enable(load());
	  /**
	   * Localstorage attempts to return the localstorage.
	   *
	   * This is necessary because safari throws
	   * when a user disables cookies/localstorage
	   * and you attempt to access it.
	   *
	   * @return {LocalStorage}
	   * @api private
	   */

	  function localstorage() {
	    try {
	      return window.localStorage;
	    } catch (e) {}
	  }
	})(browser, browser.exports);

	var hasCors = {exports: {}};

	/**
	 * Module exports.
	 *
	 * Logic borrowed from Modernizr:
	 *
	 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
	 */

	try {
	  hasCors.exports = typeof XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest();
	} catch (err) {
	  // if XMLHttp support is disabled in IE then it will throw
	  // when trying to create
	  hasCors.exports = false;
	}

	var hasCORS = hasCors.exports;

	var xmlhttprequest = function xmlhttprequest(opts) {
	  var xdomain = opts.xdomain; // scheme must be same when usign XDomainRequest
	  // http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx

	  var xscheme = opts.xscheme; // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
	  // https://github.com/Automattic/engine.io-client/pull/217

	  var enablesXDR = opts.enablesXDR; // XMLHttpRequest can be disabled on IE

	  try {
	    if ('undefined' !== typeof XMLHttpRequest && (!xdomain || hasCORS)) {
	      return new XMLHttpRequest();
	    }
	  } catch (e) {} // Use XDomainRequest for IE8 if enablesXDR is true
	  // because loading bar keeps flashing when using jsonp-polling
	  // https://github.com/yujiosaka/socke.io-ie8-loading-example


	  try {
	    if ('undefined' !== typeof XDomainRequest && !xscheme && enablesXDR) {
	      return new XDomainRequest();
	    }
	  } catch (e) {}

	  if (!xdomain) {
	    try {
	      return new self[['Active'].concat('Object').join('X')]('Microsoft.XMLHTTP');
	    } catch (e) {}
	  }
	};

	/**
	 * Module dependencies.
	 */
	var Transport$1 = transport;
	var parseqs$2 = parseqs$3;
	var parser$3 = browser$1;
	var inherit$2 = componentInherit;
	var yeast$1 = yeast_1;
	var debug$3 = browser.exports('engine.io-client:polling');
	/**
	 * Module exports.
	 */

	var polling$1 = Polling$1;
	/**
	 * Is XHR2 supported?
	 */

	var hasXHR2 = function () {
	  var XMLHttpRequest = xmlhttprequest;
	  var xhr = new XMLHttpRequest({
	    xdomain: false
	  });
	  return null != xhr.responseType;
	}();
	/**
	 * Polling interface.
	 *
	 * @param {Object} opts
	 * @api private
	 */


	function Polling$1(opts) {
	  var forceBase64 = opts && opts.forceBase64;

	  if (!hasXHR2 || forceBase64) {
	    this.supportsBinary = false;
	  }

	  Transport$1.call(this, opts);
	}
	/**
	 * Inherits from Transport.
	 */


	inherit$2(Polling$1, Transport$1);
	/**
	 * Transport name.
	 */

	Polling$1.prototype.name = 'polling';
	/**
	 * Opens the socket (triggers polling). We write a PING message to determine
	 * when the transport is open.
	 *
	 * @api private
	 */

	Polling$1.prototype.doOpen = function () {
	  this.poll();
	};
	/**
	 * Pauses polling.
	 *
	 * @param {Function} callback upon buffers are flushed and transport is paused
	 * @api private
	 */


	Polling$1.prototype.pause = function (onPause) {
	  var self = this;
	  this.readyState = 'pausing';

	  function pause() {
	    debug$3('paused');
	    self.readyState = 'paused';
	    onPause();
	  }

	  if (this.polling || !this.writable) {
	    var total = 0;

	    if (this.polling) {
	      debug$3('we are currently polling - waiting to pause');
	      total++;
	      this.once('pollComplete', function () {
	        debug$3('pre-pause polling complete');
	        --total || pause();
	      });
	    }

	    if (!this.writable) {
	      debug$3('we are currently writing - waiting to pause');
	      total++;
	      this.once('drain', function () {
	        debug$3('pre-pause writing complete');
	        --total || pause();
	      });
	    }
	  } else {
	    pause();
	  }
	};
	/**
	 * Starts polling cycle.
	 *
	 * @api public
	 */


	Polling$1.prototype.poll = function () {
	  debug$3('polling');
	  this.polling = true;
	  this.doPoll();
	  this.emit('poll');
	};
	/**
	 * Overloads onData to detect payloads.
	 *
	 * @api private
	 */


	Polling$1.prototype.onData = function (data) {
	  var self = this;
	  debug$3('polling got data %s', data);

	  var callback = function callback(packet, index, total) {
	    // if its the first message we consider the transport open
	    if ('opening' === self.readyState) {
	      self.onOpen();
	    } // if its a close packet, we close the ongoing requests


	    if ('close' === packet.type) {
	      self.onClose();
	      return false;
	    } // otherwise bypass onData and handle the message


	    self.onPacket(packet);
	  }; // decode payload


	  parser$3.decodePayload(data, this.socket.binaryType, callback); // if an event did not trigger closing

	  if ('closed' !== this.readyState) {
	    // if we got data we're not polling
	    this.polling = false;
	    this.emit('pollComplete');

	    if ('open' === this.readyState) {
	      this.poll();
	    } else {
	      debug$3('ignoring poll - transport state "%s"', this.readyState);
	    }
	  }
	};
	/**
	 * For polling, send a close packet.
	 *
	 * @api private
	 */


	Polling$1.prototype.doClose = function () {
	  var self = this;

	  function close() {
	    debug$3('writing close packet');
	    self.write([{
	      type: 'close'
	    }]);
	  }

	  if ('open' === this.readyState) {
	    debug$3('transport open - closing');
	    close();
	  } else {
	    // in case we're trying to close while
	    // handshaking is in progress (GH-164)
	    debug$3('transport not open - deferring close');
	    this.once('open', close);
	  }
	};
	/**
	 * Writes a packets payload.
	 *
	 * @param {Array} data packets
	 * @param {Function} drain callback
	 * @api private
	 */


	Polling$1.prototype.write = function (packets) {
	  var self = this;
	  this.writable = false;

	  var callbackfn = function callbackfn() {
	    self.writable = true;
	    self.emit('drain');
	  };

	  parser$3.encodePayload(packets, this.supportsBinary, function (data) {
	    self.doWrite(data, callbackfn);
	  });
	};
	/**
	 * Generates uri for connection.
	 *
	 * @api private
	 */


	Polling$1.prototype.uri = function () {
	  var query = this.query || {};
	  var schema = this.secure ? 'https' : 'http';
	  var port = ''; // cache busting is forced

	  if (false !== this.timestampRequests) {
	    query[this.timestampParam] = yeast$1();
	  }

	  if (!this.supportsBinary && !query.sid) {
	    query.b64 = 1;
	  }

	  query = parseqs$2.encode(query); // avoid port if default for schema

	  if (this.port && ('https' === schema && Number(this.port) !== 443 || 'http' === schema && Number(this.port) !== 80)) {
	    port = ':' + this.port;
	  } // prepend ? to query


	  if (query.length) {
	    query = '?' + query;
	  }

	  var ipv6 = this.hostname.indexOf(':') !== -1;
	  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
	};

	/**
	 * Module requirements.
	 */
	var Polling = polling$1;
	var inherit$1 = componentInherit;
	/**
	 * Module exports.
	 */

	var pollingJsonp = JSONPPolling;
	/**
	 * Cached regular expressions.
	 */

	var rNewline = /\n/g;
	var rEscapedNewline = /\\n/g;
	/**
	 * Global JSONP callbacks.
	 */

	var callbacks;
	/**
	 * Noop.
	 */

	function empty() {}
	/**
	 * Until https://github.com/tc39/proposal-global is shipped.
	 */


	function glob() {
	  return typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : {};
	}
	/**
	 * JSONP Polling constructor.
	 *
	 * @param {Object} opts.
	 * @api public
	 */


	function JSONPPolling(opts) {
	  Polling.call(this, opts);
	  this.query = this.query || {}; // define global callbacks array if not present
	  // we do this here (lazily) to avoid unneeded global pollution

	  if (!callbacks) {
	    // we need to consider multiple engines in the same page
	    var global = glob();
	    callbacks = global.___eio = global.___eio || [];
	  } // callback identifier


	  this.index = callbacks.length; // add callback to jsonp global

	  var self = this;
	  callbacks.push(function (msg) {
	    self.onData(msg);
	  }); // append to query string

	  this.query.j = this.index; // prevent spurious errors from being emitted when the window is unloaded

	  if (typeof addEventListener === 'function') {
	    addEventListener('beforeunload', function () {
	      if (self.script) self.script.onerror = empty;
	    }, false);
	  }
	}
	/**
	 * Inherits from Polling.
	 */


	inherit$1(JSONPPolling, Polling);
	/*
	 * JSONP only supports binary as base64 encoded strings
	 */

	JSONPPolling.prototype.supportsBinary = false;
	/**
	 * Closes the socket.
	 *
	 * @api private
	 */

	JSONPPolling.prototype.doClose = function () {
	  if (this.script) {
	    this.script.parentNode.removeChild(this.script);
	    this.script = null;
	  }

	  if (this.form) {
	    this.form.parentNode.removeChild(this.form);
	    this.form = null;
	    this.iframe = null;
	  }

	  Polling.prototype.doClose.call(this);
	};
	/**
	 * Starts a poll cycle.
	 *
	 * @api private
	 */


	JSONPPolling.prototype.doPoll = function () {
	  var self = this;
	  var script = document.createElement('script');

	  if (this.script) {
	    this.script.parentNode.removeChild(this.script);
	    this.script = null;
	  }

	  script.async = true;
	  script.src = this.uri();

	  script.onerror = function (e) {
	    self.onError('jsonp poll error', e);
	  };

	  var insertAt = document.getElementsByTagName('script')[0];

	  if (insertAt) {
	    insertAt.parentNode.insertBefore(script, insertAt);
	  } else {
	    (document.head || document.body).appendChild(script);
	  }

	  this.script = script;
	  var isUAgecko = 'undefined' !== typeof navigator && /gecko/i.test(navigator.userAgent);

	  if (isUAgecko) {
	    setTimeout(function () {
	      var iframe = document.createElement('iframe');
	      document.body.appendChild(iframe);
	      document.body.removeChild(iframe);
	    }, 100);
	  }
	};
	/**
	 * Writes with a hidden iframe.
	 *
	 * @param {String} data to send
	 * @param {Function} called upon flush.
	 * @api private
	 */


	JSONPPolling.prototype.doWrite = function (data, fn) {
	  var self = this;

	  if (!this.form) {
	    var form = document.createElement('form');
	    var area = document.createElement('textarea');
	    var id = this.iframeId = 'eio_iframe_' + this.index;
	    var iframe;
	    form.className = 'socketio';
	    form.style.position = 'absolute';
	    form.style.top = '-1000px';
	    form.style.left = '-1000px';
	    form.target = id;
	    form.method = 'POST';
	    form.setAttribute('accept-charset', 'utf-8');
	    area.name = 'd';
	    form.appendChild(area);
	    document.body.appendChild(form);
	    this.form = form;
	    this.area = area;
	  }

	  this.form.action = this.uri();

	  function complete() {
	    initIframe();
	    fn();
	  }

	  function initIframe() {
	    if (self.iframe) {
	      try {
	        self.form.removeChild(self.iframe);
	      } catch (e) {
	        self.onError('jsonp polling iframe removal error', e);
	      }
	    }

	    try {
	      // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
	      var html = '<iframe src="javascript:0" name="' + self.iframeId + '">';
	      iframe = document.createElement(html);
	    } catch (e) {
	      iframe = document.createElement('iframe');
	      iframe.name = self.iframeId;
	      iframe.src = 'javascript:0';
	    }

	    iframe.id = self.iframeId;
	    self.form.appendChild(iframe);
	    self.iframe = iframe;
	  }

	  initIframe(); // escape \n to prevent it from being converted into \r\n by some UAs
	  // double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side

	  data = data.replace(rEscapedNewline, '\\\n');
	  this.area.value = data.replace(rNewline, '\\n');

	  try {
	    this.form.submit();
	  } catch (e) {}

	  if (this.iframe.attachEvent) {
	    this.iframe.onreadystatechange = function () {
	      if (self.iframe.readyState === 'complete') {
	        complete();
	      }
	    };
	  } else {
	    this.iframe.onload = complete;
	  }
	};

	var Transport = transport;
	var parser$2 = browser$1;
	var parseqs$1 = parseqs$3;
	var inherit = componentInherit;
	var yeast = yeast_1;
	var debug$2 = browser.exports('engine.io-client:websocket');
	var BrowserWebSocket, NodeWebSocket;

	if (typeof uni === "undefined" && typeof wx === "undefined" || typeof WebSocket !== "undefined") {
	  if (typeof WebSocket !== 'undefined') {
	    BrowserWebSocket = WebSocket;
	  } else if (typeof self !== 'undefined') {
	    BrowserWebSocket = self.WebSocket || self.MozWebSocket;
	  } else {
	    try {
	      NodeWebSocket = require('ws');
	    } catch (e) {}
	  }
	}
	/**
	 * Get either the `WebSocket` or `MozWebSocket` globals
	 * in the browser or try to resolve WebSocket-compatible
	 * interface exposed by `ws` for Node-like environment.
	 */


	var WebSocketImpl = BrowserWebSocket || NodeWebSocket;

	if ((typeof uni !== "undefined" || typeof wx !== "undefined") && typeof WebSocket === "undefined" || typeof GameGlobal !== "undefined") {
	  WebSocketImpl = function WebSocket(uri) {
	    var self = this;

	    self.onopen = function () {};

	    self.onclose = function () {};

	    self.onmessage = function (data) {};

	    self.onerror = function (e) {};

	    if ((typeof tt === "undefined" ? "undefined" : _typeof(tt)) === "object" && tt.getSystemInfo) {
	      var _socketTask = tt.connectSocket({
	        url: uri
	      });

	      self.send = function (data) {
	        _socketTask.send({
	          data: data
	        });
	      };

	      self.close = function () {
	        _socketTask.close();
	      };

	      _socketTask.onOpen(function () {
	        self.onopen();
	      });

	      _socketTask.onError(function (e) {
	        self.onerror(e);
	      });

	      _socketTask.onMessage(function (res) {
	        self.onmessage(res);
	      });

	      _socketTask.onClose(function () {
	        self.onclose();
	      });
	    } else if (typeof uni !== "undefined") {
	      if (typeof my !== "undefined") {
	        my.connectSocket({
	          url: uri
	        });

	        self.send = function (data) {
	          my.sendSocketMessage({
	            data: data
	          });
	        };

	        self.close = function (data) {
	          my.closeSocket();
	        };

	        my.onSocketOpen(function (res) {
	          self.onopen();
	        });
	        my.onSocketError(function (e) {
	          self.onerror(e);
	        });
	        my.onSocketMessage(function (res) {
	          self.onmessage(res);
	        });
	        my.onSocketClose(function (e) {
	          self.onclose(e);
	        });
	      } else {
	        var uniSocketTask = uni.connectSocket({
	          url: uri,
	          complete: function complete() {}
	        });

	        self.send = function (data) {
	          uniSocketTask.send({
	            data: data
	          });
	        };

	        self.close = function () {
	          uniSocketTask.close();
	        };

	        uniSocketTask.onOpen(function (res) {
	          self.onopen();
	        });
	        uniSocketTask.onError(function (e) {
	          self.onerror(e);
	        });
	        uniSocketTask.onMessage(function (res) {
	          self.onmessage(res);
	        });
	        uniSocketTask.onClose(function (res) {
	          self.onclose();
	        });
	      }
	    } else {
	      var socketTask = wx.connectSocket({
	        url: uri
	      });

	      self.send = function (data) {
	        socketTask.send({
	          data: data
	        });
	      };

	      self.close = function (data) {
	        socketTask.close({
	          code: 1000
	        });
	      };

	      socketTask.onOpen(function () {
	        self.onopen();
	      });
	      socketTask.onError(function (e) {
	        self.onerror(e);
	      });
	      socketTask.onMessage(function (res) {
	        self.onmessage(res);
	      });
	      socketTask.onClose(function (e) {
	        self.onclose(e);
	      });
	    }
	  };
	}
	/**
	 * Module exports.
	 */


	var websocket$1 = WS;
	/**
	 * WebSocket transport constructor.
	 *
	 * @api {Object} connection options
	 * @api public
	 */

	function WS(opts) {
	  var forceBase64 = opts && opts.forceBase64;

	  if (forceBase64) {
	    this.supportsBinary = false;
	  }

	  if (typeof uni === "undefined" && typeof wx === "undefined" || typeof WebSocket !== "undefined") {
	    this.perMessageDeflate = opts.perMessageDeflate;
	    this.usingBrowserWebSocket = BrowserWebSocket && !opts.forceNode;
	    this.protocols = opts.protocols;

	    if (!this.usingBrowserWebSocket) {
	      WebSocketImpl = NodeWebSocket;
	    }
	  }

	  Transport.call(this, opts);
	}
	/**
	 * Inherits from Transport.
	 */


	inherit(WS, Transport);
	/**
	 * Transport name.
	 *
	 * @api public
	 */

	WS.prototype.name = 'websocket';
	/*
	 * WebSockets support binary
	 */

	WS.prototype.supportsBinary = false;
	/**
	 * Opens socket.
	 *
	 * @api private
	 */

	WS.prototype.doOpen = function () {
	  if (!this.check()) {
	    // let probe timeout
	    return;
	  }

	  var uri = this.uri();
	  var protocols;

	  if (typeof uni === "undefined" && typeof wx === "undefined" || typeof WebSocket !== "undefined") {
	    protocols = this.protocols;
	  }

	  var opts;

	  if ((typeof uni !== "undefined" || typeof wx !== "undefined") && typeof WebSocket === "undefined") {
	    opts = {
	      agent: this.agent
	    };
	  } else {
	    opts = {
	      agent: this.agent,
	      perMessageDeflate: this.perMessageDeflate
	    };
	  } // SSL options for Node.js client


	  opts.pfx = this.pfx;
	  opts.key = this.key;
	  opts.passphrase = this.passphrase;
	  opts.cert = this.cert;
	  opts.ca = this.ca;
	  opts.ciphers = this.ciphers;
	  opts.rejectUnauthorized = this.rejectUnauthorized;

	  if (this.extraHeaders) {
	    opts.headers = this.extraHeaders;
	  }

	  if (this.localAddress) {
	    opts.localAddress = this.localAddress;
	  }

	  try {
	    if ((typeof uni !== "undefined" || typeof wx !== "undefined") && typeof WebSocket === "undefined") {
	      this.ws = new WebSocketImpl(uri);
	    } else {
	      this.ws = this.usingBrowserWebSocket && !this.isReactNative ? protocols ? new WebSocketImpl(uri, protocols) : new WebSocketImpl(uri) : new WebSocketImpl(uri, protocols, opts);
	    }
	  } catch (err) {
	    return this.emit('error', err);
	  }

	  if (this.ws.binaryType === undefined) {
	    this.supportsBinary = false;
	  }

	  if (this.ws.supports && this.ws.supports.binary) {
	    this.supportsBinary = true;
	    this.ws.binaryType = 'nodebuffer';
	  } else {
	    this.ws.binaryType = 'arraybuffer';
	  }

	  this.addEventListeners();
	};
	/**
	 * Adds event listeners to the socket
	 *
	 * @api private
	 */


	WS.prototype.addEventListeners = function () {
	  var self = this;

	  this.ws.onopen = function () {
	    self.onOpen();
	  };

	  this.ws.onclose = function () {
	    self.onClose();
	  };

	  this.ws.onmessage = function (ev) {
	    self.onData(ev.data);
	  };

	  this.ws.onerror = function (e) {
	    self.onError('websocket error', e);
	  };
	};
	/**
	 * Writes data to socket.
	 *
	 * @param {Array} array of packets.
	 * @api private
	 */


	WS.prototype.write = function (packets) {
	  var self = this;
	  this.writable = false; // encodePacket efficient as it uses WS framing
	  // no need for encodePayload

	  var total = packets.length;

	  for (var i = 0, l = total; i < l; i++) {
	    (function (packet) {
	      parser$2.encodePacket(packet, self.supportsBinary, function (data) {
	        if ((typeof uni !== "undefined" || typeof wx !== "undefined") && typeof WebSocket === "undefined") {
	          try {
	            self.ws.send(data);
	          } catch (e) {
	            debug$2('websocket closed before onclose event');
	          }
	        } else {
	          if (!self.usingBrowserWebSocket) {
	            // always create a new object (GH-437)
	            var opts = {};

	            if (packet.options) {
	              opts.compress = packet.options.compress;
	            }

	            if (self.perMessageDeflate) {
	              var len = 'string' === typeof data ? Buffer.byteLength(data) : data.length;

	              if (len < self.perMessageDeflate.threshold) {
	                opts.compress = false;
	              }
	            }
	          } // Sometimes the websocket has already been closed but the browser didn't
	          // have a chance of informing us about it yet, in that case send will
	          // throw an error


	          try {
	            if (self.usingBrowserWebSocket) {
	              // TypeError is thrown when passing the second argument on Safari
	              self.ws.send(data);
	            } else {
	              self.ws.send(data, opts);
	            }
	          } catch (e) {
	            debug$2('websocket closed before onclose event');
	          }
	        }

	        --total || done();
	      });
	    })(packets[i]);
	  }

	  function done() {
	    self.emit('flush'); // fake drain
	    // defer to next tick to allow Socket to clear writeBuffer

	    setTimeout(function () {
	      self.writable = true;
	      self.emit('drain');
	    }, 0);
	  }
	};
	/**
	 * Called upon close
	 *
	 * @api private
	 */


	WS.prototype.onClose = function () {
	  Transport.prototype.onClose.call(this);
	};
	/**
	 * Closes socket.
	 *
	 * @api private
	 */


	WS.prototype.doClose = function () {
	  if (typeof this.ws !== 'undefined') {
	    this.ws.close();
	  }
	};
	/**
	 * Generates uri for connection.
	 *
	 * @api private
	 */


	WS.prototype.uri = function () {
	  var query = this.query || {};
	  var schema = this.secure ? 'wss' : 'ws';
	  var port = ''; // avoid port if default for schema

	  if (this.port && ('wss' === schema && Number(this.port) !== 443 || 'ws' === schema && Number(this.port) !== 80)) {
	    port = ':' + this.port;
	  } // append timestamp to URI


	  if (this.timestampRequests) {
	    query[this.timestampParam] = yeast();
	  } // communicate binary support capabilities


	  if (!this.supportsBinary) {
	    query.b64 = 1;
	  }

	  query = parseqs$1.encode(query); // prepend ? to query

	  if (query.length) {
	    query = '?' + query;
	  }

	  var ipv6 = this.hostname.indexOf(':') !== -1;
	  return schema + '://' + (ipv6 ? '[' + this.hostname + ']' : this.hostname) + port + this.path + query;
	};
	/**
	 * Feature detection for WebSocket.
	 *
	 * @return {Boolean} whether this transport is available.
	 * @api public
	 */


	WS.prototype.check = function () {
	  return !!WebSocketImpl && !('__initialize' in WebSocketImpl && this.name === WS.prototype.name);
	};

	/**
	 * Module dependencies
	 */
	// var XHR = require('./polling-xhr');

	var JSONP = pollingJsonp;
	var websocket = websocket$1;
	/**
	 * Export transports.
	 */

	transports$1.polling = polling;
	transports$1.websocket = websocket;
	/**
	 * Polling transport polymorphic constructor.
	 * Decides on xhr vs jsonp based on feature detection.
	 *
	 * @api private
	 */

	function polling(opts) {
	  var xd = false;
	  var xs = false;
	  false !== opts.jsonp;

	  if (typeof location !== 'undefined') {
	    var isSSL = 'https:' === location.protocol;
	    var port = location.port; // some user agents have empty `location.port`

	    if (!port) {
	      port = isSSL ? 443 : 80;
	    }

	    xd = opts.hostname !== location.hostname || port !== opts.port;
	    xs = opts.secure !== isSSL;
	  }

	  opts.xdomain = xd;
	  opts.xscheme = xs; // xhr = new XMLHttpRequest(opts);
	  //
	  // if ('open' in xhr && !opts.forceJSONP) {
	  //   return new XHR(opts);
	  // } else {
	  //   if (!jsonp) throw new Error('JSONP disabled');

	  return new JSONP(opts); // }
	}

	var indexOf$1 = [].indexOf;

	var indexof = function indexof(arr, obj) {
	  if (indexOf$1) return arr.indexOf(obj);

	  for (var i = 0; i < arr.length; ++i) {
	    if (arr[i] === obj) return i;
	  }

	  return -1;
	};

	var transports = transports$1;
	var Emitter$3 = componentEmitter.exports;
	var debug$1 = browser.exports('engine.io-client:socket');
	var index = indexof;
	var parser$1 = browser$1;
	var parseuri = parseuri$2;
	var parseqs = parseqs$3;
	/**
	 * Module exports.
	 */

	var socket$1 = Socket$1;
	/**
	 * Socket constructor.
	 *
	 * @param {String|Object} uri or options
	 * @param {Object} options
	 * @api public
	 */

	function Socket$1(uri, opts) {
	  if (!(this instanceof Socket$1)) return new Socket$1(uri, opts);
	  opts = opts || {};

	  if (uri && 'object' === _typeof(uri)) {
	    opts = uri;
	    uri = null;
	  }

	  if (uri) {
	    uri = parseuri(uri);
	    opts.hostname = uri.host;
	    opts.secure = uri.protocol === 'https' || uri.protocol === 'wss';
	    opts.port = uri.port;
	    if (uri.query) opts.query = uri.query;
	  } else if (opts.host) {
	    opts.hostname = parseuri(opts.host).host;
	  }

	  this.secure = null != opts.secure ? opts.secure : typeof location !== 'undefined' && 'https:' === location.protocol;

	  if (opts.hostname && !opts.port) {
	    // if no port is specified manually, use the protocol default
	    opts.port = this.secure ? '443' : '80';
	  }

	  this.agent = opts.agent || false;
	  this.hostname = opts.hostname || (typeof location !== 'undefined' ? location.hostname : 'localhost');
	  this.port = opts.port || (typeof location !== 'undefined' && location.port ? location.port : this.secure ? 443 : 80);
	  this.query = opts.query || {};
	  if ('string' === typeof this.query) this.query = parseqs.decode(this.query);
	  this.upgrade = false !== opts.upgrade;
	  this.path = (opts.path || '/engine.io').replace(/\/$/, '') + '/';
	  this.forceJSONP = !!opts.forceJSONP;
	  this.jsonp = false !== opts.jsonp;
	  this.forceBase64 = !!opts.forceBase64;
	  this.enablesXDR = !!opts.enablesXDR;
	  this.timestampParam = opts.timestampParam || 't';
	  this.timestampRequests = opts.timestampRequests;
	  this.transports = opts.transports || ['polling', 'websocket'];
	  this.transportOptions = opts.transportOptions || {};
	  this.readyState = '';
	  this.writeBuffer = [];
	  this.prevBufferLen = 0;
	  this.policyPort = opts.policyPort || 843;
	  this.rememberUpgrade = opts.rememberUpgrade || false;
	  this.binaryType = null;
	  this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;
	  this.perMessageDeflate = false !== opts.perMessageDeflate ? opts.perMessageDeflate || {} : false;
	  if (true === this.perMessageDeflate) this.perMessageDeflate = {};

	  if (this.perMessageDeflate && null == this.perMessageDeflate.threshold) {
	    this.perMessageDeflate.threshold = 1024;
	  } // SSL options for Node.js client


	  this.pfx = opts.pfx || null;
	  this.key = opts.key || null;
	  this.passphrase = opts.passphrase || null;
	  this.cert = opts.cert || null;
	  this.ca = opts.ca || null;
	  this.ciphers = opts.ciphers || null;
	  this.rejectUnauthorized = opts.rejectUnauthorized === undefined ? true : opts.rejectUnauthorized;
	  this.forceNode = !!opts.forceNode; // detect ReactNative environment

	  this.isReactNative = typeof navigator !== 'undefined' && typeof navigator.product === 'string' && navigator.product.toLowerCase() === 'reactnative'; // other options for Node.js or ReactNative client

	  if (typeof self === 'undefined' || this.isReactNative) {
	    if (opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0) {
	      this.extraHeaders = opts.extraHeaders;
	    }

	    if (opts.localAddress) {
	      this.localAddress = opts.localAddress;
	    }
	  } // set on handshake


	  this.id = null;
	  this.upgrades = null;
	  this.pingInterval = null;
	  this.pingTimeout = null; // set on heartbeat

	  this.pingIntervalTimer = null;
	  this.pingTimeoutTimer = null;
	  this.open();
	}

	Socket$1.priorWebsocketSuccess = false;
	/**
	 * Mix in `Emitter`.
	 */

	Emitter$3(Socket$1.prototype);
	/**
	 * Protocol version.
	 *
	 * @api public
	 */

	Socket$1.protocol = parser$1.protocol; // this is an int

	/**
	 * Expose deps for legacy compatibility
	 * and standalone browser access.
	 */

	Socket$1.Socket = Socket$1;
	Socket$1.Transport = transport;
	Socket$1.transports = transports$1;
	Socket$1.parser = browser$1;
	/**
	 * Creates transport of the given type.
	 *
	 * @param {String} transport name
	 * @return {Transport}
	 * @api private
	 */

	Socket$1.prototype.createTransport = function (name) {
	  debug$1('creating transport "%s"', name);
	  var query = clone(this.query); // append engine.io protocol identifier

	  query.EIO = parser$1.protocol; // transport name

	  query.transport = name; // per-transport options

	  var options = this.transportOptions[name] || {}; // session id if we already have one

	  if (this.id) query.sid = this.id;
	  var transport = new transports[name]({
	    query: query,
	    socket: this,
	    agent: options.agent || this.agent,
	    hostname: options.hostname || this.hostname,
	    port: options.port || this.port,
	    secure: options.secure || this.secure,
	    path: options.path || this.path,
	    forceJSONP: options.forceJSONP || this.forceJSONP,
	    jsonp: options.jsonp || this.jsonp,
	    forceBase64: options.forceBase64 || this.forceBase64,
	    enablesXDR: options.enablesXDR || this.enablesXDR,
	    timestampRequests: options.timestampRequests || this.timestampRequests,
	    timestampParam: options.timestampParam || this.timestampParam,
	    policyPort: options.policyPort || this.policyPort,
	    pfx: options.pfx || this.pfx,
	    key: options.key || this.key,
	    passphrase: options.passphrase || this.passphrase,
	    cert: options.cert || this.cert,
	    ca: options.ca || this.ca,
	    ciphers: options.ciphers || this.ciphers,
	    rejectUnauthorized: options.rejectUnauthorized || this.rejectUnauthorized,
	    perMessageDeflate: options.perMessageDeflate || this.perMessageDeflate,
	    extraHeaders: options.extraHeaders || this.extraHeaders,
	    forceNode: options.forceNode || this.forceNode,
	    localAddress: options.localAddress || this.localAddress,
	    requestTimeout: options.requestTimeout || this.requestTimeout,
	    protocols: options.protocols || void 0,
	    isReactNative: this.isReactNative
	  });
	  return transport;
	};

	function clone(obj) {
	  var o = {};

	  for (var i in obj) {
	    if (obj.hasOwnProperty(i)) {
	      o[i] = obj[i];
	    }
	  }

	  return o;
	}
	/**
	 * Initializes transport to use and starts probe.
	 *
	 * @api private
	 */


	Socket$1.prototype.open = function () {
	  var transport;

	  if (this.rememberUpgrade && Socket$1.priorWebsocketSuccess && this.transports.indexOf('websocket') !== -1) {
	    transport = 'websocket';
	  } else if (0 === this.transports.length) {
	    // Emit error on next tick so it can be listened to
	    var self = this;
	    setTimeout(function () {
	      self.emit('error', 'No transports available');
	    }, 0);
	    return;
	  } else {
	    transport = this.transports[0];
	  }

	  this.readyState = 'opening'; // Retry with the next transport if the transport is disabled (jsonp: false)

	  try {
	    transport = this.createTransport(transport);
	  } catch (e) {
	    this.transports.shift();
	    this.open();
	    return;
	  }

	  transport.open();
	  this.setTransport(transport);
	};
	/**
	 * Sets the current transport. Disables the existing one (if any).
	 *
	 * @api private
	 */


	Socket$1.prototype.setTransport = function (transport) {
	  debug$1('setting transport %s', transport.name);
	  var self = this;

	  if (this.transport) {
	    debug$1('clearing existing transport %s', this.transport.name);
	    this.transport.removeAllListeners();
	  } // set up transport


	  this.transport = transport; // set up transport listeners

	  transport.on('drain', function () {
	    self.onDrain();
	  }).on('packet', function (packet) {
	    self.onPacket(packet);
	  }).on('error', function (e) {
	    self.onError(e);
	  }).on('close', function () {
	    self.onClose('transport close');
	  });
	};
	/**
	 * Probes a transport.
	 *
	 * @param {String} transport name
	 * @api private
	 */


	Socket$1.prototype.probe = function (name) {
	  debug$1('probing transport "%s"', name);
	  var transport = this.createTransport(name, {
	    probe: 1
	  });
	  var failed = false;
	  var self = this;
	  Socket$1.priorWebsocketSuccess = false;

	  function onTransportOpen() {
	    if (self.onlyBinaryUpgrades) {
	      var upgradeLosesBinary = !this.supportsBinary && self.transport.supportsBinary;
	      failed = failed || upgradeLosesBinary;
	    }

	    if (failed) return;
	    debug$1('probe transport "%s" opened', name);
	    transport.send([{
	      type: 'ping',
	      data: 'probe'
	    }]);
	    transport.once('packet', function (msg) {
	      if (failed) return;

	      if ('pong' === msg.type && 'probe' === msg.data) {
	        debug$1('probe transport "%s" pong', name);
	        self.upgrading = true;
	        self.emit('upgrading', transport);
	        if (!transport) return;
	        Socket$1.priorWebsocketSuccess = 'websocket' === transport.name;
	        debug$1('pausing current transport "%s"', self.transport.name);
	        self.transport.pause(function () {
	          if (failed) return;
	          if ('closed' === self.readyState) return;
	          debug$1('changing transport and sending upgrade packet');
	          cleanup();
	          self.setTransport(transport);
	          transport.send([{
	            type: 'upgrade'
	          }]);
	          self.emit('upgrade', transport);
	          transport = null;
	          self.upgrading = false;
	          self.flush();
	        });
	      } else {
	        debug$1('probe transport "%s" failed', name);
	        var err = new Error('probe error');
	        err.transport = transport.name;
	        self.emit('upgradeError', err);
	      }
	    });
	  }

	  function freezeTransport() {
	    if (failed) return; // Any callback called by transport should be ignored since now

	    failed = true;
	    cleanup();
	    transport.close();
	    transport = null;
	  } // Handle any error that happens while probing


	  function onerror(err) {
	    var error = new Error('probe error: ' + err);
	    error.transport = transport.name;
	    freezeTransport();
	    debug$1('probe transport "%s" failed because of error: %s', name, err);
	    self.emit('upgradeError', error);
	  }

	  function onTransportClose() {
	    onerror('transport closed');
	  } // When the socket is closed while we're probing


	  function onclose() {
	    onerror('socket closed');
	  } // When the socket is upgraded while we're probing


	  function onupgrade(to) {
	    if (transport && to.name !== transport.name) {
	      debug$1('"%s" works - aborting "%s"', to.name, transport.name);
	      freezeTransport();
	    }
	  } // Remove all listeners on the transport and on self


	  function cleanup() {
	    transport.removeListener('open', onTransportOpen);
	    transport.removeListener('error', onerror);
	    transport.removeListener('close', onTransportClose);
	    self.removeListener('close', onclose);
	    self.removeListener('upgrading', onupgrade);
	  }

	  transport.once('open', onTransportOpen);
	  transport.once('error', onerror);
	  transport.once('close', onTransportClose);
	  this.once('close', onclose);
	  this.once('upgrading', onupgrade);
	  transport.open();
	};
	/**
	 * Called when connection is deemed open.
	 *
	 * @api public
	 */


	Socket$1.prototype.onOpen = function () {
	  debug$1('socket open');
	  this.readyState = 'open';
	  Socket$1.priorWebsocketSuccess = 'websocket' === this.transport.name;
	  this.emit('open');
	  this.flush(); // we check for `readyState` in case an `open`
	  // listener already closed the socket

	  if ('open' === this.readyState && this.upgrade && this.transport.pause) {
	    debug$1('starting upgrade probes');

	    for (var i = 0, l = this.upgrades.length; i < l; i++) {
	      this.probe(this.upgrades[i]);
	    }
	  }
	};
	/**
	 * Handles a packet.
	 *
	 * @api private
	 */


	Socket$1.prototype.onPacket = function (packet) {
	  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
	    debug$1('socket receive: type "%s", data "%s"', packet.type, packet.data);
	    this.emit('packet', packet); // Socket is live - any packet counts

	    this.emit('heartbeat');

	    switch (packet.type) {
	      case 'open':
	        this.onHandshake(JSON.parse(packet.data));
	        break;

	      case 'pong':
	        this.setPing();
	        this.emit('pong');
	        break;

	      case 'error':
	        var err = new Error('server error');
	        err.code = packet.data;
	        this.onError(err);
	        break;

	      case 'message':
	        this.emit('data', packet.data);
	        this.emit('message', packet.data);
	        break;
	    }
	  } else {
	    debug$1('packet received with socket readyState "%s"', this.readyState);
	  }
	};
	/**
	 * Called upon handshake completion.
	 *
	 * @param {Object} handshake obj
	 * @api private
	 */


	Socket$1.prototype.onHandshake = function (data) {
	  this.emit('handshake', data);
	  this.id = data.sid;
	  this.transport.query.sid = data.sid;
	  this.upgrades = this.filterUpgrades(data.upgrades);
	  this.pingInterval = data.pingInterval;
	  this.pingTimeout = data.pingTimeout;
	  this.onOpen(); // In case open handler closes socket

	  if ('closed' === this.readyState) return;
	  this.setPing(); // Prolong liveness of socket on heartbeat

	  this.removeListener('heartbeat', this.onHeartbeat);
	  this.on('heartbeat', this.onHeartbeat);
	};
	/**
	 * Resets ping timeout.
	 *
	 * @api private
	 */


	Socket$1.prototype.onHeartbeat = function (timeout) {
	  clearTimeout(this.pingTimeoutTimer);
	  var self = this;
	  self.pingTimeoutTimer = setTimeout(function () {
	    if ('closed' === self.readyState) return;
	    self.onClose('ping timeout');
	  }, timeout || self.pingInterval + self.pingTimeout);
	};
	/**
	 * Pings server every `this.pingInterval` and expects response
	 * within `this.pingTimeout` or closes connection.
	 *
	 * @api private
	 */


	Socket$1.prototype.setPing = function () {
	  var self = this;
	  clearTimeout(self.pingIntervalTimer);
	  self.pingIntervalTimer = setTimeout(function () {
	    debug$1('writing ping packet - expecting pong within %sms', self.pingTimeout);
	    self.ping();
	    self.onHeartbeat(self.pingTimeout);
	  }, self.pingInterval);
	};
	/**
	* Sends a ping packet.
	*
	* @api private
	*/


	Socket$1.prototype.ping = function () {
	  var self = this;
	  this.sendPacket('ping', function () {
	    self.emit('ping');
	  });
	};
	/**
	 * Called on `drain` event
	 *
	 * @api private
	 */


	Socket$1.prototype.onDrain = function () {
	  this.writeBuffer.splice(0, this.prevBufferLen); // setting prevBufferLen = 0 is very important
	  // for example, when upgrading, upgrade packet is sent over,
	  // and a nonzero prevBufferLen could cause problems on `drain`

	  this.prevBufferLen = 0;

	  if (0 === this.writeBuffer.length) {
	    this.emit('drain');
	  } else {
	    this.flush();
	  }
	};
	/**
	 * Flush write buffers.
	 *
	 * @api private
	 */


	Socket$1.prototype.flush = function () {
	  if ('closed' !== this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length) {
	    debug$1('flushing %d packets in socket', this.writeBuffer.length);
	    this.transport.send(this.writeBuffer); // keep track of current length of writeBuffer
	    // splice writeBuffer and callbackBuffer on `drain`

	    this.prevBufferLen = this.writeBuffer.length;
	    this.emit('flush');
	  }
	};
	/**
	 * Sends a message.
	 *
	 * @param {String} message.
	 * @param {Function} callback function.
	 * @param {Object} options.
	 * @return {Socket} for chaining.
	 * @api public
	 */


	Socket$1.prototype.write = Socket$1.prototype.send = function (msg, options, fn) {
	  this.sendPacket('message', msg, options, fn);
	  return this;
	};
	/**
	 * Sends a packet.
	 *
	 * @param {String} packet type.
	 * @param {String} data.
	 * @param {Object} options.
	 * @param {Function} callback function.
	 * @api private
	 */


	Socket$1.prototype.sendPacket = function (type, data, options, fn) {
	  if ('function' === typeof data) {
	    fn = data;
	    data = undefined;
	  }

	  if ('function' === typeof options) {
	    fn = options;
	    options = null;
	  }

	  if ('closing' === this.readyState || 'closed' === this.readyState) {
	    return;
	  }

	  options = options || {};
	  options.compress = false !== options.compress;
	  var packet = {
	    type: type,
	    data: data,
	    options: options
	  };
	  this.emit('packetCreate', packet);
	  this.writeBuffer.push(packet);
	  if (fn) this.once('flush', fn);
	  this.flush();
	};
	/**
	 * Closes the connection.
	 *
	 * @api private
	 */


	Socket$1.prototype.close = function () {
	  if ('opening' === this.readyState || 'open' === this.readyState) {
	    this.readyState = 'closing';
	    var self = this;

	    if (this.writeBuffer.length) {
	      this.once('drain', function () {
	        if (this.upgrading) {
	          waitForUpgrade();
	        } else {
	          close();
	        }
	      });
	    } else if (this.upgrading) {
	      waitForUpgrade();
	    } else {
	      close();
	    }
	  }

	  function close() {
	    self.onClose('forced close');
	    debug$1('socket closing - telling transport to close');
	    self.transport.close();
	  }

	  function cleanupAndClose() {
	    self.removeListener('upgrade', cleanupAndClose);
	    self.removeListener('upgradeError', cleanupAndClose);
	    close();
	  }

	  function waitForUpgrade() {
	    // wait for upgrade to finish since we can't send packets while pausing a transport
	    self.once('upgrade', cleanupAndClose);
	    self.once('upgradeError', cleanupAndClose);
	  }

	  return this;
	};
	/**
	 * Called upon transport error
	 *
	 * @api private
	 */


	Socket$1.prototype.onError = function (err) {
	  debug$1('socket error %j', err);
	  Socket$1.priorWebsocketSuccess = false;
	  this.emit('error', err);
	  this.onClose('transport error', err);
	};
	/**
	 * Called upon transport close.
	 *
	 * @api private
	 */


	Socket$1.prototype.onClose = function (reason, desc) {
	  if ('opening' === this.readyState || 'open' === this.readyState || 'closing' === this.readyState) {
	    debug$1('socket close with reason: "%s"', reason);
	    var self = this; // clear timers

	    clearTimeout(this.pingIntervalTimer);
	    clearTimeout(this.pingTimeoutTimer); // stop event from firing again for transport

	    this.transport.removeAllListeners('close'); // ensure transport won't stay open

	    this.transport.close(); // ignore further transport communication

	    this.transport.removeAllListeners(); // set ready state

	    this.readyState = 'closed'; // clear session id

	    this.id = null; // emit close event

	    this.emit('close', reason, desc); // clean buffers after, so users can still
	    // grab the buffers on `close` event

	    self.writeBuffer = [];
	    self.prevBufferLen = 0;
	  }
	};
	/**
	 * Filters upgrades, returning only those matching client transports.
	 *
	 * @param {Array} server upgrades
	 * @api private
	 *
	 */


	Socket$1.prototype.filterUpgrades = function (upgrades) {
	  var filteredUpgrades = [];

	  for (var i = 0, j = upgrades.length; i < j; i++) {
	    if (~index(this.transports, upgrades[i])) filteredUpgrades.push(upgrades[i]);
	  }

	  return filteredUpgrades;
	};

	lib.exports = socket$1;
	/**
	 * Exports parser
	 *
	 * @api public
	 *
	 */

	lib.exports.parser = browser$1;

	var socket = {exports: {}};

	var toArray_1 = toArray;

	function toArray(list, index) {
	  var array = [];
	  index = index || 0;

	  for (var i = index || 0; i < list.length; i++) {
	    array[i - index] = list[i];
	  }

	  return array;
	}

	/**
	 * Module exports.
	 */

	var on_1 = on$1;
	/**
	 * Helper for subscriptions.
	 *
	 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
	 * @param {String} event name
	 * @param {Function} callback
	 * @api public
	 */

	function on$1(obj, ev, fn) {
	  obj.on(ev, fn);
	  return {
	    destroy: function destroy() {
	      obj.removeListener(ev, fn);
	    }
	  };
	}

	/**
	 * Slice reference.
	 */
	var slice = [].slice;
	/**
	 * Bind `obj` to `fn`.
	 *
	 * @param {Object} obj
	 * @param {Function|String} fn or string
	 * @return {Function}
	 * @api public
	 */

	var componentBind = function componentBind(obj, fn) {
	  if ('string' == typeof fn) fn = obj[fn];
	  if ('function' != typeof fn) throw new Error('bind() requires a function');
	  var args = slice.call(arguments, 2);
	  return function () {
	    return fn.apply(obj, args.concat(slice.call(arguments)));
	  };
	};

	(function (module, exports) {
	  /**
	   * Module dependencies.
	   */
	  var parser = socket_ioParser;
	  var Emitter = componentEmitter.exports;
	  var toArray = toArray_1;
	  var on = on_1;
	  var bind = componentBind;
	  var debug = browser$2.exports('socket.io-client:socket');
	  var parseqs = parseqs$3;
	  var hasBin = hasBinary2;
	  /**
	   * Module exports.
	   */

	  module.exports = Socket;
	  /**
	   * Internal events (blacklisted).
	   * These events can't be emitted by the user.
	   *
	   * @api private
	   */

	  var events = {
	    connect: 1,
	    connect_error: 1,
	    connect_timeout: 1,
	    connecting: 1,
	    disconnect: 1,
	    error: 1,
	    reconnect: 1,
	    reconnect_attempt: 1,
	    reconnect_failed: 1,
	    reconnect_error: 1,
	    reconnecting: 1,
	    ping: 1,
	    pong: 1
	  };
	  /**
	   * Shortcut to `Emitter#emit`.
	   */

	  var emit = Emitter.prototype.emit;
	  /**
	   * `Socket` constructor.
	   *
	   * @api public
	   */

	  function Socket(io, nsp, opts) {
	    this.io = io;
	    this.nsp = nsp;
	    this.json = this; // compat

	    this.ids = 0;
	    this.acks = {};
	    this.receiveBuffer = [];
	    this.sendBuffer = [];
	    this.connected = false;
	    this.disconnected = true;
	    this.flags = {};

	    if (opts && opts.query) {
	      this.query = opts.query;
	    }

	    if (this.io.autoConnect) this.open();
	  }
	  /**
	   * Mix in `Emitter`.
	   */


	  Emitter(Socket.prototype);
	  /**
	   * Subscribe to open, close and packet events
	   *
	   * @api private
	   */

	  Socket.prototype.subEvents = function () {
	    if (this.subs) return;
	    var io = this.io;
	    this.subs = [on(io, 'open', bind(this, 'onopen')), on(io, 'packet', bind(this, 'onpacket')), on(io, 'close', bind(this, 'onclose'))];
	  };
	  /**
	   * "Opens" the socket.
	   *
	   * @api public
	   */


	  Socket.prototype.open = Socket.prototype.connect = function () {
	    if (this.connected) return this;
	    this.subEvents();
	    this.io.open(); // ensure open

	    if ('open' === this.io.readyState) this.onopen();
	    this.emit('connecting');
	    return this;
	  };
	  /**
	   * Sends a `message` event.
	   *
	   * @return {Socket} self
	   * @api public
	   */


	  Socket.prototype.send = function () {
	    var args = toArray(arguments);
	    args.unshift('message');
	    this.emit.apply(this, args);
	    return this;
	  };
	  /**
	   * Override `emit`.
	   * If the event is in `events`, it's emitted normally.
	   *
	   * @param {String} event name
	   * @return {Socket} self
	   * @api public
	   */


	  Socket.prototype.emit = function (ev) {
	    if (events.hasOwnProperty(ev)) {
	      emit.apply(this, arguments);
	      return this;
	    }

	    var args = toArray(arguments);
	    var packet = {
	      type: (this.flags.binary !== undefined ? this.flags.binary : hasBin(args)) ? parser.BINARY_EVENT : parser.EVENT,
	      data: args
	    };
	    packet.options = {};
	    packet.options.compress = !this.flags || false !== this.flags.compress; // event ack callback

	    if ('function' === typeof args[args.length - 1]) {
	      debug('emitting packet with ack id %d', this.ids);
	      this.acks[this.ids] = args.pop();
	      packet.id = this.ids++;
	    }

	    if (this.connected) {
	      this.packet(packet);
	    } else {
	      this.sendBuffer.push(packet);
	    }

	    this.flags = {};
	    return this;
	  };
	  /**
	   * Sends a packet.
	   *
	   * @param {Object} packet
	   * @api private
	   */


	  Socket.prototype.packet = function (packet) {
	    packet.nsp = this.nsp;
	    this.io.packet(packet);
	  };
	  /**
	   * Called upon engine `open`.
	   *
	   * @api private
	   */


	  Socket.prototype.onopen = function () {
	    debug('transport is open - connecting'); // write connect packet if necessary

	    if ('/' !== this.nsp) {
	      if (this.query) {
	        var query = _typeof(this.query) === 'object' ? parseqs.encode(this.query) : this.query;
	        debug('sending connect packet with query %s', query);
	        this.packet({
	          type: parser.CONNECT,
	          query: query
	        });
	      } else {
	        this.packet({
	          type: parser.CONNECT
	        });
	      }
	    }
	  };
	  /**
	   * Called upon engine `close`.
	   *
	   * @param {String} reason
	   * @api private
	   */


	  Socket.prototype.onclose = function (reason) {
	    debug('close (%s)', reason);
	    this.connected = false;
	    this.disconnected = true;
	    delete this.id;
	    this.emit('disconnect', reason);
	  };
	  /**
	   * Called with socket packet.
	   *
	   * @param {Object} packet
	   * @api private
	   */


	  Socket.prototype.onpacket = function (packet) {
	    var sameNamespace = packet.nsp === this.nsp;
	    var rootNamespaceError = packet.type === parser.ERROR && packet.nsp === '/';
	    if (!sameNamespace && !rootNamespaceError) return;

	    switch (packet.type) {
	      case parser.CONNECT:
	        this.onconnect();
	        break;

	      case parser.EVENT:
	        this.onevent(packet);
	        break;

	      case parser.BINARY_EVENT:
	        this.onevent(packet);
	        break;

	      case parser.ACK:
	        this.onack(packet);
	        break;

	      case parser.BINARY_ACK:
	        this.onack(packet);
	        break;

	      case parser.DISCONNECT:
	        this.ondisconnect();
	        break;

	      case parser.ERROR:
	        this.emit('error', packet.data);
	        break;
	    }
	  };
	  /**
	   * Called upon a server event.
	   *
	   * @param {Object} packet
	   * @api private
	   */


	  Socket.prototype.onevent = function (packet) {
	    var args = packet.data || [];
	    debug('emitting event %j', args);

	    if (null != packet.id) {
	      debug('attaching ack callback to event');
	      args.push(this.ack(packet.id));
	    }

	    if (this.connected) {
	      emit.apply(this, args);
	    } else {
	      this.receiveBuffer.push(args);
	    }
	  };
	  /**
	   * Produces an ack callback to emit with an event.
	   *
	   * @api private
	   */


	  Socket.prototype.ack = function (id) {
	    var self = this;
	    var sent = false;
	    return function () {
	      // prevent double callbacks
	      if (sent) return;
	      sent = true;
	      var args = toArray(arguments);
	      debug('sending ack %j', args);
	      self.packet({
	        type: hasBin(args) ? parser.BINARY_ACK : parser.ACK,
	        id: id,
	        data: args
	      });
	    };
	  };
	  /**
	   * Called upon a server acknowlegement.
	   *
	   * @param {Object} packet
	   * @api private
	   */


	  Socket.prototype.onack = function (packet) {
	    var ack = this.acks[packet.id];

	    if ('function' === typeof ack) {
	      debug('calling ack %s with %j', packet.id, packet.data);
	      ack.apply(this, packet.data);
	      delete this.acks[packet.id];
	    } else {
	      debug('bad ack %s', packet.id);
	    }
	  };
	  /**
	   * Called upon server connect.
	   *
	   * @api private
	   */


	  Socket.prototype.onconnect = function () {
	    this.connected = true;
	    this.disconnected = false;
	    this.emit('connect');
	    this.emitBuffered();
	  };
	  /**
	   * Emit buffered events (received and emitted).
	   *
	   * @api private
	   */


	  Socket.prototype.emitBuffered = function () {
	    var i;

	    for (i = 0; i < this.receiveBuffer.length; i++) {
	      emit.apply(this, this.receiveBuffer[i]);
	    }

	    this.receiveBuffer = [];

	    for (i = 0; i < this.sendBuffer.length; i++) {
	      this.packet(this.sendBuffer[i]);
	    }

	    this.sendBuffer = [];
	  };
	  /**
	   * Called upon server disconnect.
	   *
	   * @api private
	   */


	  Socket.prototype.ondisconnect = function () {
	    debug('server disconnect (%s)', this.nsp);
	    this.destroy();
	    this.onclose('io server disconnect');
	  };
	  /**
	   * Called upon forced client/server side disconnections,
	   * this method ensures the manager stops tracking us and
	   * that reconnections don't get triggered for this.
	   *
	   * @api private.
	   */


	  Socket.prototype.destroy = function () {
	    if (this.subs) {
	      // clean subscriptions to avoid reconnections
	      for (var i = 0; i < this.subs.length; i++) {
	        this.subs[i].destroy();
	      }

	      this.subs = null;
	    }

	    this.io.destroy(this);
	  };
	  /**
	   * Disconnects the socket manually.
	   *
	   * @return {Socket} self
	   * @api public
	   */


	  Socket.prototype.close = Socket.prototype.disconnect = function () {
	    if (this.connected) {
	      debug('performing disconnect (%s)', this.nsp);
	      this.packet({
	        type: parser.DISCONNECT
	      });
	    } // remove socket from pool


	    this.destroy();

	    if (this.connected) {
	      // fire events
	      this.onclose('io client disconnect');
	    }

	    return this;
	  };
	  /**
	   * Sets the compress flag.
	   *
	   * @param {Boolean} if `true`, compresses the sending data
	   * @return {Socket} self
	   * @api public
	   */


	  Socket.prototype.compress = function (compress) {
	    this.flags.compress = compress;
	    return this;
	  };
	  /**
	   * Sets the binary flag
	   *
	   * @param {Boolean} whether the emitted data contains binary
	   * @return {Socket} self
	   * @api public
	   */


	  Socket.prototype.binary = function (binary) {
	    this.flags.binary = binary;
	    return this;
	  };
	})(socket);

	/**
	 * Expose `Backoff`.
	 */

	var backo2 = Backoff$1;
	/**
	 * Initialize backoff timer with `opts`.
	 *
	 * - `min` initial timeout in milliseconds [100]
	 * - `max` max timeout [10000]
	 * - `jitter` [0]
	 * - `factor` [2]
	 *
	 * @param {Object} opts
	 * @api public
	 */

	function Backoff$1(opts) {
	  opts = opts || {};
	  this.ms = opts.min || 100;
	  this.max = opts.max || 10000;
	  this.factor = opts.factor || 2;
	  this.jitter = opts.jitter > 0 && opts.jitter <= 1 ? opts.jitter : 0;
	  this.attempts = 0;
	}
	/**
	 * Return the backoff duration.
	 *
	 * @return {Number}
	 * @api public
	 */


	Backoff$1.prototype.duration = function () {
	  var ms = this.ms * Math.pow(this.factor, this.attempts++);

	  if (this.jitter) {
	    var rand = Math.random();
	    var deviation = Math.floor(rand * this.jitter * ms);
	    ms = (Math.floor(rand * 10) & 1) == 0 ? ms - deviation : ms + deviation;
	  }

	  return Math.min(ms, this.max) | 0;
	};
	/**
	 * Reset the number of attempts.
	 *
	 * @api public
	 */


	Backoff$1.prototype.reset = function () {
	  this.attempts = 0;
	};
	/**
	 * Set the minimum duration
	 *
	 * @api public
	 */


	Backoff$1.prototype.setMin = function (min) {
	  this.ms = min;
	};
	/**
	 * Set the maximum duration
	 *
	 * @api public
	 */


	Backoff$1.prototype.setMax = function (max) {
	  this.max = max;
	};
	/**
	 * Set the jitter
	 *
	 * @api public
	 */


	Backoff$1.prototype.setJitter = function (jitter) {
	  this.jitter = jitter;
	};

	var UniApp$1 = {};

	var frameworkDetector = {};

	var platformDetector = {};

	(function (exports) {

	  var __values = commonjsGlobal && commonjsGlobal.__values || function (o) {
	    var s = typeof Symbol === "function" && Symbol.iterator,
	        m = s && o[s],
	        i = 0;
	    if (m) return m.call(o);
	    if (o && typeof o.length === "number") return {
	      next: function next() {
	        if (o && i >= o.length) o = void 0;
	        return {
	          value: o && o[i++],
	          done: !o
	        };
	      }
	    };
	    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	  };

	  exports.__esModule = true;
	  exports.PlatformDetector = exports.Platform = void 0;
	  var Platform;

	  (function (Platform) {
	    Platform["BROWSER"] = "BROWSER";
	    Platform["UNKNOWN"] = "UNKNOWN"; // 因为web版的app，只能是由特定厂商打出来的，在这个生态里只有厂商的环境，髌骨不是一个通用或者独立标准的APP概念，而是依附于技术平台的APP

	    Platform["APP_IOS"] = "APP_IOS";
	    Platform["APP_ANDROID"] = "APP_ANDROID"; // 各个厂家小程序环境

	    Platform["APPLET_WX"] = "APPLET_WX";
	    Platform["APPLET_WX_GAME"] = "APPLET_WX_GAME";
	    Platform["APPLET_ALIPAY"] = "APPLET_ALIPAY";
	    Platform["APPLET_BYTEDANCE"] = "APPLET_BYTEDANCE"; // UNI_APP = "Uni_App",  //用Uniapp开发的app，强调的是app
	    // React_Native, : 'React-Native',//特指 react-native开发的app，RN不是框架的原因是因为他不能像taro和Uniapp为其他平台赋能，
	    // WEIXIN_APPLET = "Weixin_Applet",
	    // ALIPAY_APPLET = "Alipay_Applet",
	    // BAIDU_APPLET = "Baidu_Applet",
	    // BYTEDANCE_APPLET = "Bytedance_Applet",
	    // QQ_APPLET = "QQ_Applet",
	    // WEIXIN_GAME = "Weixin_Game",
	    // _360_APPLET = "360_Applet",
	    // BROWSER = "Browser",
	    // UNKNOWN = "Unknown",
	  })(Platform = exports.Platform || (exports.Platform = {}));

	  var PlatformDetector =
	  /** @class */
	  function () {
	    function PlatformDetector() {
	      var _a, e_1, _b;

	      this.platform = null;
	      this.methods = (_a = {}, _a[Platform.BROWSER] = this.isBrowser, _a[Platform.APP_IOS] = this.isAppiOS, _a[Platform.APP_ANDROID] = this.isAppAndroid, _a[Platform.APPLET_WX] = this.isWXApplet, _a[Platform.APPLET_WX_GAME] = this.isWXGameApplet, _a);
	      var methods = this.methods;
	      var keys = Object.keys(methods);

	      try {
	        for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
	          var key = keys_1_1.value;
	          var method = methods[key];

	          if (method()) {
	            this.platform = key;
	            break;
	          }
	        }
	      } catch (e_1_1) {
	        e_1 = {
	          error: e_1_1
	        };
	      } finally {
	        try {
	          if (keys_1_1 && !keys_1_1.done && (_b = keys_1["return"])) _b.call(keys_1);
	        } finally {
	          if (e_1) throw e_1.error;
	        }
	      }

	      this.platform = this.platform || Platform.UNKNOWN;
	      console.log('PlatformDetector constructor - ', this.platform);
	    }

	    PlatformDetector.currentPlatform = function () {
	      return PlatformDetector.instance.platform;
	    };
	    /**************  detection plugin methods **************/


	    PlatformDetector.prototype.isBrowser = function () {
	      return typeof navigator !== 'undefined' && typeof document !== 'undefined' && (document.getElementById ? true : false) && typeof GameGlobal === 'undefined';
	    };

	    PlatformDetector.prototype.isAppiOS = function () {
	      return (typeof uni === "undefined" ? "undefined" : _typeof(uni)) === "object" && (uni.getSystemInfoSync ? true : false) && uni.getSystemInfoSync().platform === 'ios' && (typeof plus === "undefined" ? "undefined" : _typeof(plus)) === 'object';
	    };

	    PlatformDetector.prototype.isAppAndroid = function () {
	      return (typeof uni === "undefined" ? "undefined" : _typeof(uni)) === "object" && (uni.getSystemInfoSync ? true : false) && uni.getSystemInfoSync().platform === 'android' && (typeof plus === "undefined" ? "undefined" : _typeof(plus)) === 'object';
	    };

	    PlatformDetector.prototype.isWXApplet = function () {
	      return (typeof wx === "undefined" ? "undefined" : _typeof(wx)) === "object" && (wx.getSystemInfoSync ? true : false) && typeof WebSocket === 'undefined' && typeof XMLHttpRequest === 'undefined' && typeof plus === 'undefined';
	    };

	    PlatformDetector.prototype.isWXGameApplet = function () {
	      return (typeof GameGlobal === "undefined" ? "undefined" : _typeof(GameGlobal)) === 'object';
	    };

	    PlatformDetector.prototype.isAlipayApplet = function () {
	      return false;
	    };

	    PlatformDetector.prototype.isBytedanceApplet = function () {
	      return false;
	    };

	    PlatformDetector.prototype.isQQApplet = function () {
	      return false;
	    };

	    PlatformDetector.prototype.isBaiduApplet = function () {
	      return false;
	    };

	    PlatformDetector.instance = new PlatformDetector();
	    return PlatformDetector;
	  }();

	  exports.PlatformDetector = PlatformDetector;
	})(platformDetector);

	(function (exports) {

	  var __values = commonjsGlobal && commonjsGlobal.__values || function (o) {
	    var s = typeof Symbol === "function" && Symbol.iterator,
	        m = s && o[s],
	        i = 0;
	    if (m) return m.call(o);
	    if (o && typeof o.length === "number") return {
	      next: function next() {
	        if (o && i >= o.length) o = void 0;
	        return {
	          value: o && o[i++],
	          done: !o
	        };
	      }
	    };
	    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	  };

	  exports.__esModule = true;
	  exports.FrameworkDetector = exports.Framework = void 0;
	  var platform_detector_1 = platformDetector;
	  var Framework;

	  (function (Framework) {
	    Framework["UNIAPP"] = "UNIAPP";
	    Framework["REACT_NATIVE"] = "REACT_NATIVE";
	    Framework["TARO"] = "TARO";
	    Framework["IONIC"] = "IONIC"; // NATIVE APPLET

	    Framework["NATIVE_APPLET_WX"] = "NATIVE_APPLET_WX";
	    Framework["NATIVE_APPLET_ALIPAY"] = "NATIVE_APPLET_ALIPAY";
	    Framework["UNKNOWN"] = "UNKNOWN";
	  })(Framework = exports.Framework || (exports.Framework = {}));

	  var FrameworkDetector =
	  /** @class */
	  function () {
	    function FrameworkDetector() {
	      var _a, e_1, _b;

	      this.framework = null;
	      this.methods = (_a = {}, _a[Framework.UNIAPP] = this.isUniApp, _a[Framework.REACT_NATIVE] = this.isReactNative, // [Framework.TARO]: this.isTaro,
	      _a[Framework.NATIVE_APPLET_WX] = this.isWXApplet, _a);
	      var methods = this.methods;
	      var keys = Object.keys(methods);

	      try {
	        for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
	          var key = keys_1_1.value;
	          var method = methods[key];

	          if (method()) {
	            this.framework = key;
	            break;
	          }
	        }
	      } catch (e_1_1) {
	        e_1 = {
	          error: e_1_1
	        };
	      } finally {
	        try {
	          if (keys_1_1 && !keys_1_1.done && (_b = keys_1["return"])) _b.call(keys_1);
	        } finally {
	          if (e_1) throw e_1.error;
	        }
	      }

	      this.framework = this.framework || Framework.UNKNOWN;
	      console.log('FrameworkDetector constructor - ', this.framework);
	    }

	    FrameworkDetector.currentFramework = function () {
	      return this.instance.framework;
	    };
	    /**************  detection framework methods **************/


	    FrameworkDetector.prototype.isUniApp = function () {
	      return (typeof uni === "undefined" ? "undefined" : _typeof(uni)) === 'object' && (uni.getSystemInfoSync ? true : false);
	    };

	    FrameworkDetector.prototype.isReactNative = function () {
	      return typeof commonjsGlobal !== 'undefined' && commonjsGlobal.__fbGenNativeModule;
	    };

	    FrameworkDetector.prototype.isTaro = function () {
	      // typeof Taro, typeof taro   => undefined undefined
	      return false;
	    };
	    /**
	     * 首先如果是原生小程序开发的，平台肯定必须是小程序。
	     * 然后因为 因为不可能找到一个wx原生特有的方法，而在其他框架开发的小程序中调不了的方法，理论上其他框架开发的小程序代码，肯定也可以调用微信的所有方法
	     * 所以只能是排除掉已知的框架，比如现在已知的uni.
	     *
	     *
	     */


	    FrameworkDetector.prototype.isWXApplet = function () {
	      return platform_detector_1.PlatformDetector.currentPlatform() === platform_detector_1.Platform.APPLET_WX && typeof uni === 'undefined';
	    };

	    FrameworkDetector.instance = new FrameworkDetector();
	    return FrameworkDetector;
	  }();

	  exports.FrameworkDetector = FrameworkDetector;
	})(frameworkDetector);

	UniApp$1.__esModule = true;
	UniApp$1.uniApp = void 0;
	var framework_detector_1$4 = frameworkDetector;
	/**
	 * 监听app后台与前台切换
	 */

	var UniApp =
	/** @class */
	function () {
	  function UniApp() {
	    this.uniAppRunningBackend = false;
	    this.listenAppRunning();
	  }

	  UniApp.prototype.listenAppRunning = function () {
	    var _this = this;

	    var currentFramework = framework_detector_1$4.FrameworkDetector.currentFramework();

	    if (currentFramework === framework_detector_1$4.Framework.UNIAPP && (typeof plus === "undefined" ? "undefined" : _typeof(plus)) === "object") {
	      plus.globalEvent.addEventListener("resume", function () {
	        //从后台切换到前台
	        _this.uniAppRunningBackend = false;
	        console.log("app running frontend...:", _this.uniAppRunningBackend);
	      }, false);
	      plus.globalEvent.addEventListener("pause", function () {
	        //从前台切换到后台
	        _this.uniAppRunningBackend = true;
	        console.log("app running background...:", _this.uniAppRunningBackend);
	      }, false);
	    }
	  };

	  UniApp.prototype.runningBackend = function () {
	    return this.uniAppRunningBackend;
	  };

	  return UniApp;
	}();

	var uniApp$1 = new UniApp();
	UniApp$1.uniApp = uniApp$1;

	var GoEasyDomainNumber$2 = {};

	var config = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports["default"] = {
	    maxNumber: 5
	  };
	})(config);

	var localStorageDispatcher = {};

	var cookie = {};

	var __values$3 = commonjsGlobal && commonjsGlobal.__values || function (o) {
	  var s = typeof Symbol === "function" && Symbol.iterator,
	      m = s && o[s],
	      i = 0;
	  if (m) return m.call(o);
	  if (o && typeof o.length === "number") return {
	    next: function next() {
	      if (o && i >= o.length) o = void 0;
	      return {
	        value: o && o[i++],
	        done: !o
	      };
	    }
	  };
	  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	};

	cookie.__esModule = true;
	cookie.Cookie = void 0;

	var Cookie =
	/** @class */
	function () {
	  function Cookie() {}

	  Cookie.get = function (name) {
	    var e_1, _a;

	    var cookieName = encodeURIComponent(name) + '=';
	    var cookies = document.cookie.split('; ');

	    try {
	      for (var cookies_1 = __values$3(cookies), cookies_1_1 = cookies_1.next(); !cookies_1_1.done; cookies_1_1 = cookies_1.next()) {
	        var cookie = cookies_1_1.value;

	        if (cookie.startsWith(cookieName)) {
	          return decodeURIComponent(cookie.substring(cookieName.length));
	        }
	      }
	    } catch (e_1_1) {
	      e_1 = {
	        error: e_1_1
	      };
	    } finally {
	      try {
	        if (cookies_1_1 && !cookies_1_1.done && (_a = cookies_1["return"])) _a.call(cookies_1);
	      } finally {
	        if (e_1) throw e_1.error;
	      }
	    }

	    return null;
	  };
	  /**
	   * @description 设置 Cookie
	   * @param name 名字
	   * @param value  值
	   * @param expires 设置过期时间，不设置过期时间为 Session cookie 关闭浏览器失效
	   * @param path 作用 path
	   * @param domain  作用 path
	   * @param secure    如果想在客户端即网页中通过 js 去设置Secure类型的 cookie，必须保证网页是https协议的。
	   *     在http协议的网页中是无法设置secure类型cookie的。
	   */


	  Cookie.set = function (name, value, expires, domain, path, secure) {
	    if (path === void 0) {
	      path = '/';
	    }

	    if (secure === void 0) {
	      secure = false;
	    }

	    var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);

	    if (expires instanceof Date) {
	      cookieText += '; expires=' + expires.toGMTString();
	    }

	    if (path) {
	      cookieText += '; path=' + path;
	    }

	    if (domain) {
	      cookieText += '; domain=' + domain;
	    }

	    if (secure) {
	      cookieText += '; secure';
	    }

	    document.cookie = cookieText;
	  };
	  /**
	   * @description 移除 Cookie，移除的时候 需要传递与设置时相同的 name/path/domain 才能移除成功
	   */


	  Cookie.remove = function (name, domain, path, secure) {
	    if (path === void 0) {
	      path = '/';
	    }

	    if (secure === void 0) {
	      secure = false;
	    }

	    Cookie.set(name, '', new Date(0), domain, path, secure);
	  };

	  return Cookie;
	}();

	cookie.Cookie = Cookie;

	var __values$2 = commonjsGlobal && commonjsGlobal.__values || function (o) {
	  var s = typeof Symbol === "function" && Symbol.iterator,
	      m = s && o[s],
	      i = 0;
	  if (m) return m.call(o);
	  if (o && typeof o.length === "number") return {
	    next: function next() {
	      if (o && i >= o.length) o = void 0;
	      return {
	        value: o && o[i++],
	        done: !o
	      };
	    }
	  };
	  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	};

	localStorageDispatcher.__esModule = true;
	localStorageDispatcher.LocalStorageDispatcher = void 0;
	var cookie_1 = cookie;

	var CookieStorage =
	/** @class */
	function () {
	  function CookieStorage() {
	    this.domain = null;
	    var isDomain = /^(?:[A-za-z0-9-]+\.)+[A-za-z]{2,4}(?:[\/\?#][\/=\?%\-&~`@[\]\':+!\.#\w]*)?$/;
	    this.domain = typeof location !== 'undefined' && isDomain.test(location.host) ? location.host.split('.').slice(-2).join('.') : null;
	  }

	  CookieStorage.prototype.get = function (key) {
	    var result = cookie_1.Cookie.get(key) || null;
	    return JSON.parse(result);
	  };

	  CookieStorage.prototype.put = function (key, data) {
	    var expire = new Date(2030, 12, 31, 0, 0, 0, 0);
	    var domain = this.domain;
	    cookie_1.Cookie.set(key, JSON.stringify(data), expire, domain);
	  };

	  CookieStorage.prototype.remove = function (key) {
	    var domain = this.domain;
	    cookie_1.Cookie.remove(key, domain);
	  };

	  CookieStorage.prototype.support = function () {
	    return typeof navigator !== 'undefined' && navigator.cookieEnabled === true;
	  };

	  return CookieStorage;
	}();

	var LocalStorage =
	/** @class */
	function () {
	  function LocalStorage() {}

	  LocalStorage.prototype.get = function (key) {
	    var result = localStorage.getItem(key);
	    return JSON.parse(result);
	  };

	  LocalStorage.prototype.put = function (key, data) {
	    var result = localStorage.setItem(key, JSON.stringify(data));
	    JSON.stringify(result);
	  };

	  LocalStorage.prototype.remove = function (key) {
	    localStorage.removeItem(key);
	  };

	  LocalStorage.prototype.support = function () {
	    return typeof GameGlobal === 'undefined' && typeof localStorage !== 'undefined' && localStorage.setItem ? true : false;
	  };

	  return LocalStorage;
	}();

	var UniappLocalStorage =
	/** @class */
	function () {
	  function UniappLocalStorage() {}

	  UniappLocalStorage.prototype.get = function (key) {
	    var result = uni.getStorageSync(key) || null;
	    return JSON.parse(result);
	  };

	  UniappLocalStorage.prototype.put = function (key, data) {
	    uni.setStorageSync(key, JSON.stringify(data));
	  };

	  UniappLocalStorage.prototype.remove = function (key) {
	    uni.removeStorageSync(key);
	  };

	  UniappLocalStorage.prototype.support = function () {
	    return (typeof uni === "undefined" ? "undefined" : _typeof(uni)) === "object" && uni.getStorageSync ? true : false;
	  };

	  return UniappLocalStorage;
	}();

	var WXLocalStorage =
	/** @class */
	function () {
	  function WXLocalStorage() {}

	  WXLocalStorage.prototype.get = function (key) {
	    var result = wx.getStorageSync(key) || null;
	    return JSON.parse(result);
	  };

	  WXLocalStorage.prototype.put = function (key, data) {
	    wx.setStorageSync(key, JSON.stringify(data));
	  };

	  WXLocalStorage.prototype.remove = function (key) {
	    wx.removeStorageSync(key);
	  };

	  WXLocalStorage.prototype.support = function () {
	    return (typeof wx === "undefined" ? "undefined" : _typeof(wx)) === "object" && wx.getStorageSync ? true : false;
	  };

	  return WXLocalStorage;
	}();

	var LocalStorageDispatcher =
	/** @class */
	function () {
	  function LocalStorageDispatcher() {
	    this.supportedStorage = null;
	    var storages = LocalStorageDispatcher.storages;
	    storages.push(new UniappLocalStorage());
	    storages.push(new LocalStorage());
	    storages.push(new WXLocalStorage());
	    storages.push(new CookieStorage());
	    this.dispatch();
	    console.log('LocalStorageDispatcher constructor - ', this.supportedStorage);
	  }

	  LocalStorageDispatcher.localStorage = function () {
	    return this.instance.supportedStorage;
	  };

	  LocalStorageDispatcher.prototype.dispatch = function () {
	    var e_1, _a;

	    try {
	      for (var _b = __values$2(LocalStorageDispatcher.storages), _c = _b.next(); !_c.done; _c = _b.next()) {
	        var storage = _c.value;

	        if (storage.support()) {
	          this.supportedStorage = storage;
	          break;
	        }
	      }
	    } catch (e_1_1) {
	      e_1 = {
	        error: e_1_1
	      };
	    } finally {
	      try {
	        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
	      } finally {
	        if (e_1) throw e_1.error;
	      }
	    }
	  };

	  LocalStorageDispatcher.storages = new Array();
	  LocalStorageDispatcher.instance = new LocalStorageDispatcher();
	  return LocalStorageDispatcher;
	}();

	localStorageDispatcher.LocalStorageDispatcher = LocalStorageDispatcher;

	GoEasyDomainNumber$2.__esModule = true;
	GoEasyDomainNumber$2.goEasyDomainNumber = void 0;
	var config_1 = config;
	var local_storage_dispatcher_1$1 = localStorageDispatcher;

	var GoEasyDomainNumber$1 =
	/** @class */
	function () {
	  function GoEasyDomainNumber() {}

	  GoEasyDomainNumber.prototype.refreshNumber = function () {
	    var key = GoEasyDomainNumber.GOEASY_DOMAIN_NUMBER;
	    var storage = local_storage_dispatcher_1$1.LocalStorageDispatcher.localStorage();
	    var number = Math.floor(Math.random() * (config_1["default"].maxNumber - 1) + 1);

	    if (storage !== null) {
	      number = parseInt(storage.get(key)) || number;
	    }

	    if (number > 0 && number < config_1["default"].maxNumber) {
	      number += 1;
	    } else if (number === config_1["default"].maxNumber) {
	      number = 1;
	    }

	    if (storage !== null) {
	      storage.put(key, number);
	    }

	    return number;
	  };

	  GoEasyDomainNumber.GOEASY_DOMAIN_NUMBER = 'GOEASY_DOMAIN_NUMBER';
	  return GoEasyDomainNumber;
	}();

	var goEasyDomainNumber = new GoEasyDomainNumber$1();
	GoEasyDomainNumber$2.goEasyDomainNumber = goEasyDomainNumber;

	var eio = lib.exports;
	var Socket = socket.exports;
	var Emitter$2 = componentEmitter.exports;
	var parser = socket_ioParser;
	var on = on_1;
	var bind = componentBind;
	var debug = browser$2.exports('socket.io-client:manager');
	var indexOf = indexof;
	var Backoff = backo2;
	var uniApp = UniApp$1.uniApp;
	var GoEasyDomainNumber = GoEasyDomainNumber$2.goEasyDomainNumber;
	/**
	 * IE6+ hasOwnProperty
	 */

	var has = Object.prototype.hasOwnProperty;
	/**
	 * Module exports
	 */

	var manager = Manager;
	/**
	 * `Manager` constructor.
	 *
	 * @param {String} engine instance or engine uri/opts
	 * @param {Object} options
	 * @api public
	 */

	function Manager(uri, opts) {
	  if (!(this instanceof Manager)) return new Manager(uri, opts);

	  if (uri && 'object' === _typeof(uri)) {
	    opts = uri;
	    uri = undefined;
	  }

	  opts = opts || {};
	  opts.path = opts.path || '/socket.io';
	  this.nsps = {};
	  this.subs = [];
	  this.opts = opts;
	  this.reconnection(opts.reconnection !== false);
	  this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);
	  this.reconnectionDelay(opts.reconnectionDelay || 1000);
	  this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);
	  this.randomizationFactor(opts.randomizationFactor || 0.5);
	  this.backoff = new Backoff({
	    min: this.reconnectionDelay(),
	    max: this.reconnectionDelayMax(),
	    jitter: this.randomizationFactor()
	  });
	  this.timeout(null == opts.timeout ? 20000 : opts.timeout);
	  this.readyState = 'closed';
	  this.uri = uri;
	  this.connecting = [];
	  this.lastPing = null;
	  this.encoding = false;
	  this.packetBuffer = [];

	  var _parser = opts.parser || parser;

	  this.encoder = new _parser.Encoder();
	  this.decoder = new _parser.Decoder();
	  this.autoConnect = opts.autoConnect !== false;
	  if (this.autoConnect) this.open();
	}
	/**
	 * Propagate given event to sockets and emit on `this`
	 *
	 * @api private
	 */


	Manager.prototype.emitAll = function () {
	  this.emit.apply(this, arguments);

	  for (var nsp in this.nsps) {
	    if (has.call(this.nsps, nsp)) {
	      this.nsps[nsp].emit.apply(this.nsps[nsp], arguments);
	    }
	  }
	};
	/**
	 * Update `socket.id` of all sockets
	 *
	 * @api private
	 */


	Manager.prototype.updateSocketIds = function () {
	  for (var nsp in this.nsps) {
	    if (has.call(this.nsps, nsp)) {
	      this.nsps[nsp].id = this.generateId(nsp);
	    }
	  }
	};
	/**
	 * generate `socket.id` for the given `nsp`
	 *
	 * @param {String} nsp
	 * @return {String}
	 * @api private
	 */


	Manager.prototype.generateId = function (nsp) {
	  return (nsp === '/' ? '' : nsp + '#') + this.engine.id;
	};
	/**
	 * Mix in `Emitter`.
	 */


	Emitter$2(Manager.prototype);
	/**
	 * Sets the `reconnection` config.
	 *
	 * @param {Boolean} true/false if it should automatically reconnect
	 * @return {Manager} self or value
	 * @api public
	 */

	Manager.prototype.reconnection = function (v) {
	  if (!arguments.length) return this._reconnection;
	  this._reconnection = !!v;
	  return this;
	};
	/**
	 * Sets the reconnection attempts config.
	 *
	 * @param {Number} max reconnection attempts before giving up
	 * @return {Manager} self or value
	 * @api public
	 */


	Manager.prototype.reconnectionAttempts = function (v) {
	  if (!arguments.length) return this._reconnectionAttempts;
	  this._reconnectionAttempts = v;
	  return this;
	};
	/**
	 * Sets the delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */


	Manager.prototype.reconnectionDelay = function (v) {
	  if (!arguments.length) return this._reconnectionDelay;
	  this._reconnectionDelay = v;
	  this.backoff && this.backoff.setMin(v);
	  return this;
	};

	Manager.prototype.randomizationFactor = function (v) {
	  if (!arguments.length) return this._randomizationFactor;
	  this._randomizationFactor = v;
	  this.backoff && this.backoff.setJitter(v);
	  return this;
	};
	/**
	 * Sets the maximum delay between reconnections.
	 *
	 * @param {Number} delay
	 * @return {Manager} self or value
	 * @api public
	 */


	Manager.prototype.reconnectionDelayMax = function (v) {
	  if (!arguments.length) return this._reconnectionDelayMax;
	  this._reconnectionDelayMax = v;
	  this.backoff && this.backoff.setMax(v);
	  return this;
	};
	/**
	 * Sets the connection timeout. `false` to disable
	 *
	 * @return {Manager} self or value
	 * @api public
	 */


	Manager.prototype.timeout = function (v) {
	  if (!arguments.length) return this._timeout;
	  this._timeout = v;
	  return this;
	};
	/**
	 * Starts trying to reconnect if reconnection is enabled and we have not
	 * started reconnecting yet
	 *
	 * @api private
	 */


	Manager.prototype.maybeReconnectOnOpen = function () {
	  // Only try to reconnect if it's the first time we're connecting
	  if (!this.reconnecting && this._reconnection && this.backoff.attempts === 0) {
	    // keeps reconnection from firing twice for the same reconnection loop
	    this.reconnect();
	  }
	};
	/**
	 * Sets the current transport `socket`.
	 *
	 * @param {Function} optional, callback
	 * @return {Manager} self
	 * @api public
	 */


	Manager.prototype.open = Manager.prototype.connect = function (fn, opts) {
	  debug('readyState %s', this.readyState);
	  if (~this.readyState.indexOf('open')) return this;
	  debug('opening %s', this.uri);
	  this.engine = eio(this.uri, this.opts);
	  var socket = this.engine;
	  var self = this;
	  this.readyState = 'opening';
	  this.skipReconnect = false; // emit `open`

	  var openSub = on(socket, 'open', function () {
	    self.onopen();
	    fn && fn();
	  }); // emit `connect_error`

	  var errorSub = on(socket, 'error', function (data) {
	    if (typeof window !== 'undefined') {
	      var reg = /[1-9][0-9]*/g;
	      var index = parseInt(self.uri.match(reg)[0]);
	      var nextIndex = GoEasyDomainNumber.refreshNumber();
	      self.uri = self.uri.replace(index, nextIndex);
	    }

	    debug('connect_error');
	    self.cleanup();
	    self.readyState = 'closed';
	    self.emitAll('connect_error', data);

	    if (fn) {
	      var err = new Error('Connection error');
	      err.data = data;
	      fn(err);
	    } else {
	      // Only do this if there is no fn to handle the error
	      self.maybeReconnectOnOpen();
	    }
	  }); // emit `connect_timeout`

	  if (false !== this._timeout) {
	    var timeout = this._timeout;
	    debug('connect attempt will timeout after %d', timeout); // set timer

	    var timer = setTimeout(function () {
	      debug('connect attempt timed out after %d', timeout);
	      openSub.destroy();
	      socket.close();
	      socket.emit('error', 'timeout');
	      self.emitAll('connect_timeout', timeout);
	    }, timeout);
	    this.subs.push({
	      destroy: function destroy() {
	        clearTimeout(timer);
	      }
	    });
	  }

	  this.subs.push(openSub);
	  this.subs.push(errorSub);
	  return this;
	};
	/**
	 * Called upon transport open.
	 *
	 * @api private
	 */


	Manager.prototype.onopen = function () {
	  debug('open'); // clear old subs

	  this.cleanup(); // mark as open

	  this.readyState = 'open';
	  this.emit('open'); // add new subs

	  var socket = this.engine;
	  this.subs.push(on(socket, 'data', bind(this, 'ondata')));
	  this.subs.push(on(socket, 'ping', bind(this, 'onping')));
	  this.subs.push(on(socket, 'pong', bind(this, 'onpong')));
	  this.subs.push(on(socket, 'error', bind(this, 'onerror')));
	  this.subs.push(on(socket, 'close', bind(this, 'onclose')));
	  this.subs.push(on(this.decoder, 'decoded', bind(this, 'ondecoded')));
	};
	/**
	 * Called upon a ping.
	 *
	 * @api private
	 */


	Manager.prototype.onping = function () {
	  this.lastPing = new Date();
	  this.emitAll('ping');
	};
	/**
	 * Called upon a packet.
	 *
	 * @api private
	 */


	Manager.prototype.onpong = function () {
	  this.emitAll('pong', new Date() - this.lastPing);
	};
	/**
	 * Called with data.
	 *
	 * @api private
	 */


	Manager.prototype.ondata = function (data) {
	  this.decoder.add(data);
	};
	/**
	 * Called when parser fully decodes a packet.
	 *
	 * @api private
	 */


	Manager.prototype.ondecoded = function (packet) {
	  this.emit('packet', packet);
	};
	/**
	 * Called upon socket error.
	 *
	 * @api private
	 */


	Manager.prototype.onerror = function (err) {
	  debug('error', err);
	  this.emitAll('error', err);
	};
	/**
	 * Creates a new socket for the given `nsp`.
	 *
	 * @return {Socket}
	 * @api public
	 */


	Manager.prototype.socket = function (nsp, opts) {
	  var socket = this.nsps[nsp];

	  if (!socket) {
	    socket = new Socket(this, nsp, opts);
	    this.nsps[nsp] = socket;
	    var self = this;
	    socket.on('connecting', onConnecting);
	    socket.on('connect', function () {
	      socket.id = self.generateId(nsp);
	    });

	    if (this.autoConnect) {
	      // manually call here since connecting event is fired before listening
	      onConnecting();
	    }
	  }

	  function onConnecting() {
	    if (!~indexOf(self.connecting, socket)) {
	      self.connecting.push(socket);
	    }
	  }

	  return socket;
	};
	/**
	 * Called upon a socket close.
	 *
	 * @param {Socket} socket
	 */


	Manager.prototype.destroy = function (socket) {
	  var index = indexOf(this.connecting, socket);
	  if (~index) this.connecting.splice(index, 1);
	  if (this.connecting.length) return;
	  this.close();
	};
	/**
	 * Writes a packet.
	 *
	 * @param {Object} packet
	 * @api private
	 */


	Manager.prototype.packet = function (packet) {
	  debug('writing packet %j', packet);
	  var self = this;
	  if (packet.query && packet.type === 0) packet.nsp += '?' + packet.query;

	  if (!self.encoding) {
	    // encode, then write to engine with result
	    self.encoding = true;
	    this.encoder.encode(packet, function (encodedPackets) {
	      for (var i = 0; i < encodedPackets.length; i++) {
	        self.engine.write(encodedPackets[i], packet.options);
	      }

	      self.encoding = false;
	      self.processPacketQueue();
	    });
	  } else {
	    // add packet to the queue
	    self.packetBuffer.push(packet);
	  }
	};
	/**
	 * If packet buffer is non-empty, begins encoding the
	 * next packet in line.
	 *
	 * @api private
	 */


	Manager.prototype.processPacketQueue = function () {
	  if (this.packetBuffer.length > 0 && !this.encoding) {
	    var pack = this.packetBuffer.shift();
	    this.packet(pack);
	  }
	};
	/**
	 * Clean up transport subscriptions and packet buffer.
	 *
	 * @api private
	 */


	Manager.prototype.cleanup = function () {
	  debug('cleanup');
	  var subsLength = this.subs.length;

	  for (var i = 0; i < subsLength; i++) {
	    var sub = this.subs.shift();
	    sub.destroy();
	  }

	  this.packetBuffer = [];
	  this.encoding = false;
	  this.lastPing = null;
	  this.decoder.destroy();
	};
	/**
	 * Close the current socket.
	 *
	 * @api private
	 */


	Manager.prototype.close = Manager.prototype.disconnect = function () {
	  debug('disconnect');
	  this.skipReconnect = true;
	  this.reconnecting = false;

	  if ('opening' === this.readyState) {
	    // `onclose` will not fire because
	    // an open event never happened
	    this.cleanup();
	  }

	  this.backoff.reset();
	  this.readyState = 'closed';
	  if (this.engine) this.engine.close();
	};
	/**
	 * Called upon engine close.
	 *
	 * @api private
	 */


	Manager.prototype.onclose = function (reason) {
	  debug('onclose');
	  this.cleanup();
	  this.backoff.reset();
	  this.readyState = 'closed';
	  this.emit('close', reason);

	  if (this._reconnection && !this.skipReconnect) {
	    this.reconnect();
	  }
	};
	/**
	 * Attempt a reconnection.
	 *
	 * @api private
	 */


	function isUniRunningBackend() {
	  var isUni = false;

	  if ((typeof uni === "undefined" ? "undefined" : _typeof(uni)) === "object" && uni.getSystemInfo) {
	    isUni = true;
	  }

	  return isUni && uniApp.runningBackend();
	}

	Manager.prototype.reconnect = function () {
	  debug("isUniRunningBackend() :" + isUniRunningBackend());
	  if (this.reconnecting || this.skipReconnect) return this;
	  var self = this;

	  if (this.backoff.attempts >= this._reconnectionAttempts) {
	    debug('reconnect failed');
	    this.backoff.reset();
	    this.emitAll('reconnect_failed');
	    this.reconnecting = false;
	  } else {
	    var delay = this.backoff.duration();
	    debug('will wait %dms before reconnect attempt', delay);
	    this.reconnecting = true;
	    var timer = setTimeout(function () {
	      if (self.skipReconnect) return;
	      debug('attempting reconnect');
	      self.emitAll('reconnect_attempt', self.backoff.attempts);
	      self.emitAll('reconnecting', self.backoff.attempts); // check again for the case socket closed in above events

	      if (self.skipReconnect) return;

	      if (isUniRunningBackend()) {
	        debug('Uniapp running backend, skipped reconnect...');
	        self.reconnecting = false;
	        self.reconnect();
	        self.emitAll('reconnect_error', 'Uniapp running backend, skipped reconnect...');
	      } else {
	        self.open(function (err) {
	          if (err) {
	            debug('reconnect attempt error');
	            self.reconnecting = false;
	            self.reconnect();
	            self.emitAll('reconnect_error', err.data);
	          } else {
	            debug('reconnect success');
	            self.onreconnect();
	          }
	        });
	      }
	    }, delay);
	    this.subs.push({
	      destroy: function destroy() {
	        clearTimeout(timer);
	      }
	    });
	  }
	};
	/**
	 * Called upon successful reconnect.
	 *
	 * @api private
	 */


	Manager.prototype.onreconnect = function () {
	  var attempt = this.backoff.attempts;
	  this.reconnecting = false;
	  this.backoff.reset();
	  this.updateSocketIds();
	  this.emitAll('reconnect', attempt);
	};

	(function (module, exports) {
	  /**
	   * Module dependencies.
	   */
	  var url = url_1;
	  var parser = socket_ioParser;
	  var Manager = manager;
	  var debug = browser$2.exports('socket.io-client');
	  /**
	   * Module exports.
	   */

	  module.exports = exports = lookup;
	  /**
	   * Managers cache.
	   */

	  var cache = exports.managers = {};
	  /**
	   * Looks up an existing `Manager` for multiplexing.
	   * If the user summons:
	   *
	   *   `io('http://localhost/a');`
	   *   `io('http://localhost/b');`
	   *
	   * We reuse the existing instance based on same scheme/port/host,
	   * and we initialize sockets for each namespace.
	   *
	   * @api public
	   */

	  function lookup(uri, opts) {
	    if (_typeof(uri) === 'object') {
	      opts = uri;
	      uri = undefined;
	    }

	    opts = opts || {};
	    var parsed = url(uri);
	    var source = parsed.source;
	    var id = parsed.id;
	    var path = parsed.path;
	    var sameNamespace = cache[id] && path in cache[id].nsps;
	    var newConnection = opts.forceNew || opts['force new connection'] || false === opts.multiplex || sameNamespace;
	    var io;

	    if (newConnection) {
	      debug('ignoring socket cache for %s', source);
	      io = Manager(source, opts);
	    } else {
	      if (!cache[id]) {
	        debug('new io instance for %s', source);
	        cache[id] = Manager(source, opts);
	      }

	      io = cache[id];
	    }

	    if (parsed.query && !opts.query) {
	      opts.query = parsed.query;
	    }

	    return io.socket(parsed.path, opts);
	  }
	  /**
	   * Protocol version.
	   *
	   * @api public
	   */


	  exports.protocol = parser.protocol;
	  /**
	   * `connect`.
	   *
	   * @param {String} uri
	   * @api public
	   */

	  exports.connect = lookup;
	  /**
	   * Expose constructors for standalone build.
	   *
	   * @api public
	   */

	  exports.Manager = manager;
	  exports.Socket = socket.exports;
	})(lib$1, lib$1.exports);

	var Calibrator = {};

	(function (exports) {

	  exports.__esModule = true;

	  var Calibrator =
	  /** @class */
	  function () {
	    function Calibrator() {}

	    Calibrator.prototype.isDef = function (v) {
	      return !this.isUndef(v);
	    };

	    Calibrator.prototype.isUndef = function (v) {
	      return v === undefined || v === null;
	    };

	    Calibrator.prototype.isPrimitive = function (value) {
	      return typeof value === 'string' || typeof value === 'number' || _typeof(value) === 'symbol' || typeof value === 'boolean';
	    };

	    Calibrator.prototype.isObject = function (obj) {
	      return obj !== null && _typeof(obj) === 'object';
	    };

	    Calibrator.prototype.isPlainObject = function (obj) {
	      return Object.prototype.toString.call(obj) === '[object Object]';
	    };

	    Calibrator.prototype.isRegExp = function (v) {
	      return Object.prototype.toString.call(v) === '[object RegExp]';
	    };

	    Calibrator.prototype.isValidArrayIndex = function (val) {
	      var n = parseFloat(String(val));
	      return n >= 0 && Math.floor(n) === n && isFinite(val);
	    };

	    Calibrator.prototype.isString = function (v) {
	      return typeof v === 'string';
	    };

	    Calibrator.prototype.isNumber = function (v) {
	      return typeof v === 'number';
	    };

	    Calibrator.prototype.isStringOrNumber = function (v) {
	      return this.isString(v) || this.isNumber(v);
	    };

	    Calibrator.prototype.isArray = function (v) {
	      return Object.prototype.toString.call(v) === "[object Array]";
	    };

	    Calibrator.prototype.isEmpty = function (v) {
	      if (this.isArray(v)) {
	        return v.length === 0;
	      }

	      if (this.isObject(v)) {
	        return !this.isDef(v);
	      }

	      if (this.isNumber(v)) {
	        return false;
	      }

	      if (this.isString(v)) {
	        return v.trim() === '';
	      }

	      return !this.isDef(v);
	    };

	    Calibrator.prototype.isNative = function (Ctor) {
	      return typeof Ctor === 'function' && /native code/.test(Ctor.toString());
	    };

	    Calibrator.prototype.isFunction = function (fn) {
	      return typeof fn === 'function';
	    };

	    Calibrator.prototype.isBoolean = function (v) {
	      return typeof v === 'boolean';
	    };

	    Calibrator.prototype.isTrue = function (v) {
	      return v === true;
	    };

	    Calibrator.prototype.isFalse = function (v) {
	      return v === false;
	    };

	    return Calibrator;
	  }();

	  var calibrator = new Calibrator();
	  exports["default"] = calibrator;
	})(Calibrator);

	(function (exports) {

	  exports.__esModule = true;
	  var NetworkStatus_1 = NetworkStatus;
	  var Permission_1 = Permission;
	  var Emitter_1 = Emitter$6;
	  var io = lib$1.exports;
	  var Calibrator_1 = Calibrator;

	  var AbstractSocket =
	  /** @class */
	  function () {
	    function AbstractSocket() {
	      this.io = io;
	      this.status = NetworkStatus_1.NetworkStatus.DISCONNECTED;
	      this.permissions = [Permission_1.Permission.NONE];
	      this.connectedObservers = []; // todo: callback?

	      this.disconnectedObservers = [];
	      this.emitter = new Emitter_1.Emitter(this);
	    }

	    AbstractSocket.prototype.connect = function () {
	      this.status = NetworkStatus_1.NetworkStatus.CONNECTING;
	    };

	    AbstractSocket.prototype.emit = function (rocket) {
	      this.emitter.emit(rocket);
	    };

	    AbstractSocket.prototype.doEmit = function (name, params, ack) {};

	    AbstractSocket.prototype.on = function (name, listener) {
	      this.io.on(name, listener);
	    };

	    AbstractSocket.prototype.disconnect = function () {
	      this.io.disconnect();
	    };

	    AbstractSocket.prototype.getStatus = function () {
	      return this.status;
	    };

	    AbstractSocket.prototype.addConnectedObserver = function (callback) {
	      if (!Calibrator_1["default"].isFunction(callback)) return;
	      this.connectedObservers.push(callback);
	    };

	    AbstractSocket.prototype.addDisconnectedObserver = function (callback) {
	      if (!Calibrator_1["default"].isFunction(callback)) return;
	      this.disconnectedObservers.push(callback);
	    };

	    AbstractSocket.prototype.notify = function (list, response) {
	      for (var i = 0; i < list.length; i++) {
	        list[i](response);
	      }
	    };

	    return AbstractSocket;
	  }();

	  exports["default"] = AbstractSocket;
	})(AbstractSocket);

	var IOSocket = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var AbstractSocket_1 = AbstractSocket;
	  var NetworkStatus_1 = NetworkStatus;

	  var IOSocket =
	  /** @class */
	  function (_super) {
	    __extends(IOSocket, _super);

	    function IOSocket(options) {
	      var _this = _super.call(this) || this;

	      _this.reconnectingObservers = [];

	      _this.addReconnectingObserver(options.onReconnecting);

	      _this.addDisconnectedObserver(options.onDisconnected);

	      return _this;
	    }

	    IOSocket.prototype.connect = function (options) {
	      _super.prototype.connect.call(this); //连接


	      this.io = this.io.connect(options.uri, options.opts);
	      this.initListener();
	    };

	    IOSocket.prototype.doEmit = function (name, params, ack) {
	      this.io.emit(name, params, ack);
	    };

	    IOSocket.prototype.initListener = function () {
	      var _this = this; //监听重连


	      this.io.on('reconnecting', function (ack) {
	        _this.status = NetworkStatus_1.NetworkStatus.CONNECTING;

	        _this.notify(_this.reconnectingObservers, ack);
	      }); //连接成功

	      this.io.on('connect', function () {
	        _this.status = NetworkStatus_1.NetworkStatus.CONNECTED;

	        _this.notify(_this.connectedObservers);
	      }); //断连

	      this.io.on('disconnect', function () {
	        _this.status = NetworkStatus_1.NetworkStatus.DISCONNECTED;

	        _this.notify(_this.disconnectedObservers);
	      }); //连接错误

	      this.io.on('connect_error', function (ack) {// todo: 暂时不用，因为这个错误，貌似在重连中也会出现，会影响使用
	        // this.status = NetworkStatus.CONNECT_FAILED;
	        // console.log(ack)
	        //保留
	      });
	    };

	    IOSocket.prototype.addReconnectingObserver = function (event) {
	      this.reconnectingObservers.push(event);
	    };

	    return IOSocket;
	  }(AbstractSocket_1["default"]);

	  exports["default"] = IOSocket;
	})(IOSocket);

	var Rocket = {};

	var UUID = {};

	var rngBrowser = {exports: {}};

	// browser this is a little complicated due to unknown quality of Math.random()
	// and inconsistent support for the `crypto` API.  We do the best we can via
	// feature-detection
	// getRandomValues needs to be invoked in a context where "this" is a Crypto
	// implementation. Also, find the complete implementation of crypto on IE11.

	var getRandomValues = typeof crypto != 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto != 'undefined' && typeof window.msCrypto.getRandomValues == 'function' && msCrypto.getRandomValues.bind(msCrypto);

	if (getRandomValues) {
	  // WHATWG crypto RNG - http://wiki.whatwg.org/wiki/Crypto
	  var rnds8 = new Uint8Array(16); // eslint-disable-line no-undef

	  rngBrowser.exports = function whatwgRNG() {
	    getRandomValues(rnds8);
	    return rnds8;
	  };
	} else {
	  // Math.random()-based (RNG)
	  //
	  // If all else fails, use Math.random().  It's fast, but is of unspecified
	  // quality.
	  var rnds = new Array(16);

	  rngBrowser.exports = function mathRNG() {
	    for (var i = 0, r; i < 16; i++) {
	      if ((i & 0x03) === 0) r = Math.random() * 0x100000000;
	      rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
	    }

	    return rnds;
	  };
	}

	/**
	 * Convert array of 16 byte values to UUID string format of the form:
	 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
	 */
	var byteToHex = [];

	for (var i = 0; i < 256; ++i) {
	  byteToHex[i] = (i + 0x100).toString(16).substr(1);
	}

	function bytesToUuid$2(buf, offset) {
	  var i = offset || 0;
	  var bth = byteToHex; // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4

	  return [bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], '-', bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]], bth[buf[i++]]].join('');
	}

	var bytesToUuid_1 = bytesToUuid$2;

	var rng$1 = rngBrowser.exports;
	var bytesToUuid$1 = bytesToUuid_1; // **`v1()` - Generate time-based UUID**
	//
	// Inspired by https://github.com/LiosK/UUID.js
	// and http://docs.python.org/library/uuid.html

	var _nodeId;

	var _clockseq; // Previous uuid creation time


	var _lastMSecs = 0;
	var _lastNSecs = 0; // See https://github.com/uuidjs/uuid for API details

	function v1$1(options, buf, offset) {
	  var i = buf && offset || 0;
	  var b = buf || [];
	  options = options || {};
	  var node = options.node || _nodeId;
	  var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq; // node and clockseq need to be initialized to random values if they're not
	  // specified.  We do this lazily to minimize issues related to insufficient
	  // system entropy.  See #189

	  if (node == null || clockseq == null) {
	    var seedBytes = rng$1();

	    if (node == null) {
	      // Per 4.5, create and 48-bit node id, (47 random bits + multicast bit = 1)
	      node = _nodeId = [seedBytes[0] | 0x01, seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
	    }

	    if (clockseq == null) {
	      // Per 4.2.2, randomize (14 bit) clockseq
	      clockseq = _clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 0x3fff;
	    }
	  } // UUID timestamps are 100 nano-second units since the Gregorian epoch,
	  // (1582-10-15 00:00).  JSNumbers aren't precise enough for this, so
	  // time is handled internally as 'msecs' (integer milliseconds) and 'nsecs'
	  // (100-nanoseconds offset from msecs) since unix epoch, 1970-01-01 00:00.


	  var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime(); // Per 4.2.1.2, use count of uuid's generated during the current clock
	  // cycle to simulate higher resolution clock

	  var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1; // Time since last uuid creation (in msecs)

	  var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 10000; // Per 4.2.1.2, Bump clockseq on clock regression

	  if (dt < 0 && options.clockseq === undefined) {
	    clockseq = clockseq + 1 & 0x3fff;
	  } // Reset nsecs if clock regresses (new clockseq) or we've moved onto a new
	  // time interval


	  if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
	    nsecs = 0;
	  } // Per 4.2.1.2 Throw error if too many uuids are requested


	  if (nsecs >= 10000) {
	    throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
	  }

	  _lastMSecs = msecs;
	  _lastNSecs = nsecs;
	  _clockseq = clockseq; // Per 4.1.4 - Convert from unix epoch to Gregorian epoch

	  msecs += 12219292800000; // `time_low`

	  var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
	  b[i++] = tl >>> 24 & 0xff;
	  b[i++] = tl >>> 16 & 0xff;
	  b[i++] = tl >>> 8 & 0xff;
	  b[i++] = tl & 0xff; // `time_mid`

	  var tmh = msecs / 0x100000000 * 10000 & 0xfffffff;
	  b[i++] = tmh >>> 8 & 0xff;
	  b[i++] = tmh & 0xff; // `time_high_and_version`

	  b[i++] = tmh >>> 24 & 0xf | 0x10; // include version

	  b[i++] = tmh >>> 16 & 0xff; // `clock_seq_hi_and_reserved` (Per 4.2.2 - include variant)

	  b[i++] = clockseq >>> 8 | 0x80; // `clock_seq_low`

	  b[i++] = clockseq & 0xff; // `node`

	  for (var n = 0; n < 6; ++n) {
	    b[i + n] = node[n];
	  }

	  return buf ? buf : bytesToUuid$1(b);
	}

	var v1_1 = v1$1;

	var rng = rngBrowser.exports;
	var bytesToUuid = bytesToUuid_1;

	function v4$1(options, buf, offset) {
	  var i = buf && offset || 0;

	  if (typeof options == 'string') {
	    buf = options === 'binary' ? new Array(16) : null;
	    options = null;
	  }

	  options = options || {};
	  var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

	  rnds[6] = rnds[6] & 0x0f | 0x40;
	  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

	  if (buf) {
	    for (var ii = 0; ii < 16; ++ii) {
	      buf[i + ii] = rnds[ii];
	    }
	  }

	  return buf || bytesToUuid(rnds);
	}

	var v4_1 = v4$1;

	var v1 = v1_1;
	var v4 = v4_1;
	var uuid = v4;
	uuid.v1 = v1;
	uuid.v4 = v4;
	var uuid_1 = uuid;

	(function (exports) {

	  exports.__esModule = true;
	  var uuid = uuid_1;

	  var UUID =
	  /** @class */
	  function () {
	    function UUID() {}

	    UUID.get = function () {
	      var guid = uuid.v1();
	      return guid.replace(/-/g, "");
	    };

	    return UUID;
	  }();

	  exports["default"] = UUID;
	})(UUID);

	(function (exports) {

	  exports.__esModule = true;
	  var UUID_1 = UUID;
	  var Permission_1 = Permission;

	  var Rocket =
	  /** @class */
	  function () {
	    function Rocket(options) {
	      var _this = this;

	      this.permission = Permission_1.Permission.NONE;
	      this.singleTimeout = 0;
	      this.totalTimeout = 0;
	      this.startTime = 0;
	      this.complete = false;
	      this.retried = 0;
	      this.unique = false;
	      this.uuid = UUID_1["default"].get();
	      this.name = options.name;
	      this.params = options.params;
	      this.permission = options.permission;
	      this.totalTimeout = options.totalTimeout;
	      this.singleTimeout = options.singleTimeout;

	      if (options.unique) {
	        this.unique = options.unique;
	      }

	      this.success = function (ack) {
	        if (!_this.complete) {
	          _this.complete = true;
	          options.success(ack);
	        }
	      };

	      this.fail = function (ack) {
	        if (!_this.complete) {
	          _this.complete = true;
	          options.fail(ack);
	        }
	      };
	    }

	    Rocket.prototype.start = function () {
	      this.startTime = Date.now();
	    };

	    Rocket.prototype.isTimeout = function () {
	      var expiredTime = this.startTime + this.totalTimeout;
	      return expiredTime < Date.now();
	    };

	    return Rocket;
	  }();

	  exports["default"] = Rocket;
	})(Rocket);

	var MessageObserver$1 = {};

	var noop = {};

	(function (exports) {

	  exports.__esModule = true;

	  function noop() {
	    var params = [];

	    for (var _i = 0; _i < arguments.length; _i++) {
	      params[_i] = arguments[_i];
	    }
	  }

	  exports["default"] = noop;
	})(noop);

	MessageObserver$1.__esModule = true;
	MessageObserver$1.MessageObserver = void 0;
	var noop_1$4 = noop;

	var MessageObserver =
	/** @class */
	function () {
	  function MessageObserver(callback) {
	    this.callback = noop_1$4["default"];
	    this.guidList = [];
	    this.callback = callback;
	  }

	  MessageObserver.prototype.onMessage = function (key, message) {
	    if (typeof message == "string") {
	      message = JSON.parse(message);
	    }

	    if (message.i) {
	      var index = this.guidList.findIndex(function (item) {
	        return item === message.i;
	      });

	      if (index > -1) {
	        return;
	      }

	      this.guidList.unshift(message.i);

	      if (this.guidList.length > 300) {
	        this.guidList.pop();
	      }
	    }

	    this.callback(message);
	  };

	  return MessageObserver;
	}();

	MessageObserver$1.MessageObserver = MessageObserver;

	var SocketTimeout = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.SocketTimeout = void 0;

	  (function (SocketTimeout) {
	    SocketTimeout[SocketTimeout["connect"] = 1500] = "connect";
	    SocketTimeout[SocketTimeout["reconnectionDelayMax"] = 3000] = "reconnectionDelayMax";
	    SocketTimeout[SocketTimeout["commonQuerySingle"] = 2500] = "commonQuerySingle";
	    SocketTimeout[SocketTimeout["commonQueryTotal"] = 12000] = "commonQueryTotal";
	    SocketTimeout[SocketTimeout["commonRequestSingle"] = 1700] = "commonRequestSingle";
	    SocketTimeout[SocketTimeout["commonRequestTotal"] = 12000] = "commonRequestTotal";
	    SocketTimeout[SocketTimeout["commonInfiniteSingle"] = 1700] = "commonInfiniteSingle";
	    SocketTimeout[SocketTimeout["commonInfiniteTotal"] = 86400000] = "commonInfiniteTotal";
	  })(exports.SocketTimeout || (exports.SocketTimeout = {}));
	})(SocketTimeout);

	var anonymousUserIdRepository = {};

	anonymousUserIdRepository.__esModule = true;
	anonymousUserIdRepository.AnonymousUserIdRepository = void 0;
	var Calibrator_1$i = Calibrator;
	var local_storage_dispatcher_1 = localStorageDispatcher;

	var AnonymousUserIdRepository =
	/** @class */
	function () {
	  function AnonymousUserIdRepository() {}

	  AnonymousUserIdRepository.get = function () {
	    var storage = AnonymousUserIdRepository.storage;

	    if (storage !== null) {
	      var userId = storage.get(AnonymousUserIdRepository.ANONYMOUS_USER_ID_KEY);

	      if (!Calibrator_1$i["default"].isEmpty(userId)) {
	        return userId.toString();
	      }
	    }

	    return null;
	  };

	  AnonymousUserIdRepository.put = function (userId) {
	    var storage = AnonymousUserIdRepository.storage;

	    if (storage !== null) {
	      storage.put(AnonymousUserIdRepository.ANONYMOUS_USER_ID_KEY, userId.toString());
	    }
	  };

	  AnonymousUserIdRepository.storage = local_storage_dispatcher_1.LocalStorageDispatcher.localStorage();
	  AnonymousUserIdRepository.ANONYMOUS_USER_ID_KEY = "goeasy-anonymous-user-id";
	  return AnonymousUserIdRepository;
	}();

	anonymousUserIdRepository.AnonymousUserIdRepository = AnonymousUserIdRepository;

	var ClientInfo$1 = {};

	ClientInfo$1.__esModule = true;
	ClientInfo$1.clientInfo = void 0;
	var platform_detector_1$1 = platformDetector;
	var framework_detector_1$3 = frameworkDetector;

	var ClientInfo =
	/** @class */
	function () {
	  function ClientInfo() {
	    this.platform = platform_detector_1$1.PlatformDetector.currentPlatform();
	    this.framework = framework_detector_1$3.FrameworkDetector.currentFramework();
	    this.z = this.toZ();
	  }

	  ClientInfo.prototype.toZ = function () {
	    var thisAsString = JSON.stringify({
	      platform: this.platform,
	      framework: this.framework
	    });
	    var z = "";

	    for (var i = 0; i < thisAsString.length; i++) {
	      var _char = thisAsString.charCodeAt(i);

	      z = z + String.fromCharCode(_char + 5);
	    }

	    return z;
	  };

	  return ClientInfo;
	}();

	var clientInfo = new ClientInfo();
	ClientInfo$1.clientInfo = clientInfo;

	var RocketTypes = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.RocketTypes = void 0;

	  (function (RocketTypes) {
	    RocketTypes["authorize"] = "authorize";
	    RocketTypes["manualDisconnect"] = "manualDisconnect"; // pubsub

	    RocketTypes["subscribe"] = "subscribe";
	    RocketTypes["unsubscribe"] = "unsubscribe";
	    RocketTypes["publish"] = "publish";
	    RocketTypes["ack"] = "ack";
	    RocketTypes["historyMessages"] = "historyMessages";
	    RocketTypes["hereNow"] = "hereNow";
	    RocketTypes["hereNowByUserIds"] = "hereNowByUserIds"; //im

	    RocketTypes["imLastConversations"] = "imLastConversations";
	    RocketTypes["markPrivateMessageAsRead"] = "markPrivateMessageAsRead";
	    RocketTypes["markGroupMessageAsRead"] = "markGroupMessageAsRead";
	    RocketTypes["imGroupOnlineCount"] = "imGroupOnlineCount";
	    RocketTypes["imHereNow"] = "imHereNow";
	    RocketTypes["imGroupHereNow"] = "imGroupHereNow";
	    RocketTypes["publishIM"] = "publishIM";
	    RocketTypes["subscribeUserPresence"] = "subscribeUserPresence";
	    RocketTypes["unsubscribeUserPresence"] = "unsubscribeUserPresence";
	    RocketTypes["subscribeGroupPresence"] = "subscribeGroupPresence";
	    RocketTypes["unsubscribeGroupPresence"] = "unsubscribeGroupPresence";
	    RocketTypes["removeConversation"] = "removeConversation";
	    RocketTypes["topConversation"] = "topConversation";
	    RocketTypes["imData"] = "imData";
	    RocketTypes["subscribeGroups"] = "subscribeGroups";
	    RocketTypes["unsubscribeGroup"] = "unsubscribeGroup";
	    RocketTypes["IM_DELETE_MESSAGE"] = "IM_DELETE_MESSAGE";
	    RocketTypes["IM_HISTORY"] = "IM_HISTORY";
	    RocketTypes["IM_HISTORY_CHANGE"] = "IM_HISTORY_CHANGE";
	    RocketTypes["IM_RECALL_MESSAGE"] = "IM_RECALL_MESSAGE";
	    RocketTypes["RTC_ASK_NEW_TOKEN"] = "RTC_ASK_NEW_TOKEN";
	    RocketTypes["RTC_DIAL"] = "RTC_DIAL";
	    RocketTypes["RTC_ACCEPT"] = "RTC_ACCEPT";
	    RocketTypes["RTC_ACCEPT_FAILED"] = "RTC_ACCEPT_FAILED";
	    RocketTypes["RTC_MANUAL_END"] = "RTC_MANUAL_END";
	    RocketTypes["RTC_CLIENT_BUSY"] = "RTC_CLIENT_BUSY";
	    RocketTypes["RTC_TIMEOUT"] = "RTC_TIMEOUT";
	    RocketTypes["RTC_CALL_DATA"] = "RTC_CALL_DATA";
	    RocketTypes["CS_ACCEPT"] = "CS_ACCEPT";
	    RocketTypes["CS_END"] = "CS_END";
	    RocketTypes["CS_TRANSFER"] = "CS_TRANSFER";
	    RocketTypes["CS_STAFFS"] = "CS_STAFFS";
	    RocketTypes["CS_CUSTOMER_STATUS"] = "CS_CUSTOMER_STATUS";
	    RocketTypes["CS_IS_ONLINE"] = "CS_IS_ONLINE";
	    RocketTypes["CS_ONLINE"] = "CS_ONLINE";
	    RocketTypes["CS_OFFLINE"] = "CS_OFFLINE";
	    RocketTypes["MARK_AS_READ"] = "MARK_AS_READ";
	    RocketTypes["PENDING_CONVERSATION"] = "PENDING_CONVERSATION";
	  })(exports.RocketTypes || (exports.RocketTypes = {}));
	})(RocketTypes);

	var GNS$1 = {};

	GNS$1.__esModule = true;
	GNS$1.GNS = void 0;
	var Calibrator_1$h = Calibrator;
	var framework_detector_1$2 = frameworkDetector;
	var platform_detector_1 = platformDetector;
	var UniApp_1 = UniApp$1; // TODO:
	// 2. 各个事件类型是否应该集中生命诚常量或枚举？  DONE
	//      TS化后老类没有删？会不会增加打包后的体积？
	//      TS化后, goeasy.ts和Im.js有两个外层代码
	// 1  增加日志分级机制
	// 8. 如果客户也写了plus监听，会不会冲突

	var GNS =
	/** @class */
	function () {
	  function GNS(allowNotification) {
	    this.uniappPlugin = null;
	    this.regIdPromise = null;
	    this.onClickNotificationCallback = null;
	    this.payloadAssemblers = new Array();
	    this.allowNotification = allowNotification;

	    if (this.supportNotification()) {
	      this.uniappPlugin = uni.requireNativePlugin('GoEasy-Uniapp');

	      if (this.uniappPlugin) {
	        this.regIdPromise = this.askRegId();
	      } else {
	        //没有安装原生插件，plus的notification的click和create也可以让用户体验到手机notification
	        console.warn('No GoEasy-Uniapp Native Plugin.');
	      }
	    }
	  }

	  GNS.init = function (allow) {
	    this.instance = new GNS(allow);
	  };

	  GNS.prototype.addAssembler = function (assembler) {
	    this.payloadAssemblers.push(assembler);
	  };

	  GNS.prototype.assemblePayload = function (payload) {
	    var assembler = this.payloadAssemblers.find(function (assembler) {
	      return assembler.support(payload);
	    });
	    return assembler ? assembler.assemble(payload) : payload;
	  };

	  GNS.prototype.createLocalNotification = function (title, body, data) {
	    if (!UniApp_1.uniApp.runningBackend()) {
	      return;
	    }

	    data.g = 1;

	    if (typeof plus !== 'undefined') {
	      plus.push.createMessage(body, JSON.stringify(data), {
	        title: title
	      });
	    }
	  };

	  GNS.prototype.askRegId = function () {
	    var _this = this;

	    var timerId = null;
	    var repeatCount = 0;

	    var askRegIdPromise = function askRegIdPromise() {
	      return new Promise(function (resolve, reject) {
	        _this.uniappPlugin.regId(function (result) {
	          console.log('askRegId - ', result);
	          resolve(result);
	        }, function (e) {
	          /***
	           * 如果是魅族或苹果的网络不好，不会返回这里，不需要，也没有重试的机会
	           *来到这里，只有两种情况：
	           * 1. 网络问题超时(1000000)，3.5秒后再尝试， 失败5次后，放弃厂商推送，直接连接GoEasy
	           * 2. 网络问题以外的其他问题，这些情况，没必要重试，放弃厂商，直接连接GoEasy
	           */
	          console.log('askRegId error - ', e);

	          if (e.data.code === 1000000 && repeatCount <= 10) {
	            // clearTimeout(timerId); todo是不是不必要？
	            timerId = setTimeout(function () {
	              repeatCount++;
	              console.log('setTimeout askRegId - ', timerId);
	              _this.regIdPromise = askRegIdPromise();
	            }, 3500);
	          } else {
	            //不是网络问题，才会停止尝试
	            console.log('regId reject - ', e);
	            clearTimeout(timerId);
	            return reject(e);
	          }
	        });
	      });
	    };

	    var regIdPromise = askRegIdPromise();
	    return regIdPromise;
	  };

	  GNS.prototype.getRegIdPromise = function () {
	    return this.regIdPromise;
	  };

	  GNS.prototype.supportNotification = function () {
	    var platform = platform_detector_1.PlatformDetector.currentPlatform();
	    var framework = framework_detector_1$2.FrameworkDetector.currentFramework();
	    return this.allowNotification && framework === framework_detector_1$2.Framework.UNIAPP && (platform === platform_detector_1.Platform.APP_ANDROID || platform === platform_detector_1.Platform.APP_IOS);
	  };

	  GNS.prototype.listenPlusClickNotification = function () {
	    var _this = this;

	    console.log('push.addEventListener click');
	    plus.push.addEventListener('click', function (message) {
	      if (!message || !_this.availableIntent(message.payload)) {
	        return;
	      }

	      try {
	        var content = typeof message.payload === 'string' ? JSON.parse(message.payload) : message.payload;

	        var payload = _this.assemblePayload(content);

	        console.log('push parsedMessage - ', payload);
	        plus.push.clear();

	        _this.onClickNotificationCallback(payload);
	      } catch (e) {
	        console.log('JSON parse error.', e);
	      }
	    });
	  };

	  GNS.prototype.availableIntent = function (intent) {
	    return intent && Object.keys(intent).length && intent.g && parseInt(intent.g) === 1;
	  };
	  /**
	   * @description * 只在死进程首次被点击notification时使用，ios和android均需要
	   */


	  GNS.prototype.getIntentData = function () {
	    var _this = this;

	    this.uniappPlugin.getIntentData(function (intentData) {
	      console.log('getIntentData - ', intentData);

	      if (!_this.availableIntent(intentData)) {
	        return;
	      }

	      var payload = _this.assemblePayload(intentData);

	      var platform = platform_detector_1.PlatformDetector.currentPlatform();
	      plus.push.clear();

	      if (platform === platform_detector_1.Platform.APP_ANDROID) {
	        _this.uniappPlugin.clearAll();
	      }

	      _this.onClickNotificationCallback(payload);
	    });
	  };

	  GNS.prototype.listenClick = function () {
	    this.listenPlusClickNotification();
	    var platform = platform_detector_1.PlatformDetector.currentPlatform();

	    if (this.uniappPlugin && platform === platform_detector_1.Platform.APP_ANDROID) {
	      this.getIntentData();
	    }
	  };
	  /**
	   * @description TODO: 注册多次，可能会导致多次触发
	   * @param clickHandler
	   */


	  GNS.prototype.onClickNotification = function (clickHandler) {
	    if (!this.supportNotification()) {
	      console.warn('The current environment doesn\'t support or allowNotification is false.');
	      return;
	    }

	    if (!Calibrator_1$h["default"].isFunction(clickHandler)) {
	      throw new Error('The arguments must be a function.');
	    }

	    if (this.onClickNotificationCallback !== null) {
	      console.warn('The onClickNotification event has been listened on. Please do not listen to it more than once.');
	      return;
	    } //只能监听一次，第一次为准


	    this.onClickNotificationCallback = clickHandler;
	    this.listenClick();
	  };

	  return GNS;
	}();

	GNS$1.GNS = GNS;

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var AbstractSocket_1 = AbstractSocket;
	  var IOSocket_1 = IOSocket;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var NetworkStatus_1 = NetworkStatus;
	  var MessageObserver_1 = MessageObserver$1;
	  var noop_1 = noop;
	  var Calibrator_1 = Calibrator;
	  var GoEasyDomainNumber_1 = GoEasyDomainNumber$2;
	  var SocketTimeout_1 = SocketTimeout;
	  var GoEasy_1 = GoEasy$1;
	  var platform_detector_1 = platformDetector;
	  var anonymous_user_id_repository_1 = anonymousUserIdRepository;
	  var ClientInfo_1 = ClientInfo$1;
	  var RocketTypes_1 = RocketTypes;
	  var GNS_1 = GNS$1;

	  var GoEasySocket =
	  /** @class */
	  function (_super) {
	    __extends(GoEasySocket, _super);

	    function GoEasySocket(goEasyOptions, connectOptions) {
	      var _this = _super.call(this) || this;

	      _this.ioSocket = null; //连接参数

	      _this.sid = null;
	      _this.appKey = null;
	      _this.anonymous = false;
	      _this.userId = null;
	      _this.userData = null;
	      _this.otp = null;
	      _this.artifactVersion = '0.0.0';
	      _this.uri = null;
	      _this.ioOpts = null;
	      _this.allowNotification = false; //业务数据

	      _this.reconnectingTimes = 0; //观察者

	      _this.messageObservers = {};
	      _this.connectFailedObservers = [];
	      _this.connectingObservers = [];
	      _this.expiredReconnectedObservers = [];
	      _this.onConnectSuccess = noop_1["default"];
	      _this.onConnectFailed = noop_1["default"];
	      _this.onConnectProgress = noop_1["default"];

	      _this.setUriAndOpts(goEasyOptions);

	      _this.extendOptions(connectOptions); //初始化ioSocket 添加监听器


	      _this.ioSocket = new IOSocket_1["default"]({
	        onDisconnected: _this.onIoDisconnected.bind(_this),
	        onReconnecting: _this.onIoReconnecting.bind(_this)
	      });

	      _this.ioSocket.addConnectedObserver(_this.onIoReconnected.bind(_this)); //初始化连接参数


	      _this.appKey = goEasyOptions.appkey;
	      _this.allowNotification = goEasyOptions.allowNotification;
	      _this.modules = goEasyOptions.modules;

	      if (Calibrator_1["default"].isEmpty(connectOptions.id)) {
	        _this.anonymous = true;
	        _this.userId = anonymous_user_id_repository_1.AnonymousUserIdRepository.get();
	      } else {
	        _this.userId = connectOptions.id.toString();
	      }

	      _this.artifactVersion = GoEasy_1["default"].version; //注册监听器

	      _this.addConnectedObserver(_this.onConnectSuccess);

	      _this.addConnectFailedObserver(_this.onConnectFailed);

	      _this.addConnectingObserver(_this.onConnectProgress);

	      return _this;
	    }

	    GoEasySocket.prototype.extendOptions = function (options) {
	      if (Calibrator_1["default"].isFunction(options.onSuccess)) {
	        this.onConnectSuccess = options.onSuccess;
	      }

	      if (Calibrator_1["default"].isFunction(options.onFailed)) {
	        this.onConnectFailed = options.onFailed;
	      }

	      if (Calibrator_1["default"].isFunction(options.onProgress)) {
	        this.onConnectProgress = options.onProgress;
	      }

	      if (Calibrator_1["default"].isDef(options.data) && !Calibrator_1["default"].isObject(options.data)) {
	        throw {
	          code: 400,
	          content: 'TypeError: data requires an object.'
	        };
	      }

	      var len = Calibrator_1["default"].isDef(options.data) ? String(options.data).length : 0;

	      if (len > 300) {
	        if (Calibrator_1["default"].isObject(options) && Calibrator_1["default"].isFunction(options.onFailed)) {
	          throw {
	            code: 400,
	            content: 'user.data-length limit 300 byte.'
	          };
	        }
	      } else {
	        this.userData = options.data;
	      }

	      if (Calibrator_1["default"].isObject(options.wx_mp)) {
	        if (Calibrator_1["default"].isEmpty(options.wx_mp.appid)) {
	          throw {
	            code: 400,
	            content: 'wx_mp.appid is required.'
	          };
	        }

	        if (Calibrator_1["default"].isEmpty(options.wx_mp.openid)) {
	          throw {
	            code: 400,
	            content: 'wx_mp.openid is required. requires string.'
	          };
	        }
	      } else if (Calibrator_1["default"].isPrimitive(options.wx_mp)) {
	        throw {
	          code: 400,
	          content: 'TypeError: wx_mp requires an object.'
	        };
	      }

	      if (Calibrator_1["default"].isDef(options.wx_mp)) {
	        this.wx_mp = options.wx_mp;
	      }

	      this.otp = options.otp || null;
	    };

	    GoEasySocket.prototype.setUriAndOpts = function (options) {
	      var supportTLS = true;

	      if (platform_detector_1.PlatformDetector.currentPlatform() === platform_detector_1.Platform.BROWSER) {
	        var host = '://' + GoEasyDomainNumber_1.goEasyDomainNumber.refreshNumber() + options.host;
	        var transports = void 0;

	        if (options.supportOldBrowser === true) {
	          transports = ['polling', 'websocket'];
	          supportTLS = false;
	        } else {
	          transports = ['websocket'];
	        }

	        if (options.forceTLS === false || !supportTLS) {
	          this.uri = 'http' + host + ':80';
	        } else {
	          this.uri = 'https' + host + ':443';
	        }

	        this.ioOpts = {
	          transports: transports,
	          timeout: SocketTimeout_1.SocketTimeout.connect
	        };
	      } else {
	        this.uri = 'https://wx-' + options.host + ':443';
	        this.ioOpts = {
	          transports: ['websocket'],
	          reconnectionDelayMax: SocketTimeout_1.SocketTimeout.reconnectionDelayMax
	        };
	      }
	    };

	    GoEasySocket.prototype.onIoReconnected = function () {
	      if (this.status === NetworkStatus_1.NetworkStatus.RECONNECTING) {
	        this.authorize();
	      }
	    };

	    GoEasySocket.prototype.emit = function (rocket) {
	      _super.prototype.emit.call(this, rocket);
	    };

	    GoEasySocket.prototype.doEmit = function (name, params, ack) {
	      params.sid = this.sid;
	      this.ioSocket.doEmit(name, params, ack);
	    };

	    GoEasySocket.prototype.sendAck = function (name, data) {
	      this.ioSocket.io.emit(name, data);
	    }; //连接


	    GoEasySocket.prototype.connect = function () {
	      var _this = this; //触发 连接中


	      _super.prototype.connect.call(this);

	      this.onConnecting();
	      this.ioSocket.connect({
	        uri: this.uri,
	        opts: this.ioOpts
	      });
	      var gns = GNS_1.GNS.instance;

	      if (gns && gns.supportNotification() && gns.getRegIdPromise()) {
	        gns.getRegIdPromise().then(function (result) {
	          console.log('Reg id is resolved: ', result);
	          _this.regId = result;

	          _this.authorize();
	        })["catch"](function (e) {
	          console.warn("Failed to register the Manufacturers Push service:" + JSON.stringify(e));

	          _this.authorize();
	        });
	      } else {
	        this.authorize();
	      }
	    }; //断连


	    GoEasySocket.prototype.disconnect = function () {
	      var _this = this;

	      return new Promise(function (resolve, reject) {
	        var success = function success() {
	          _this.status = NetworkStatus_1.NetworkStatus.DISCONNECTED;

	          _this.ioSocket.disconnect();

	          resolve();
	        };

	        if (_this.allowNotification) {
	          var fail = function fail(e) {
	            reject(e);
	          };

	          var rocket = new Rocket_1["default"]({
	            name: RocketTypes_1.RocketTypes.manualDisconnect,
	            params: {},
	            permission: Permission_1.Permission.READ,
	            singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	            totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	            fail: fail,
	            success: success
	          });

	          _this.emit(rocket);
	        } else {
	          success();
	        }
	      });
	    }; //认证


	    GoEasySocket.prototype.authorize = function () {
	      var params = {
	        appkey: this.appKey,
	        userId: this.userId,
	        userData: JSON.stringify(this.userData),
	        otp: this.otp,
	        artifactVersion: this.artifactVersion,
	        // type: this.type,
	        sid: this.sid,
	        // imVersion : this.imVersion,
	        allowNT: this.allowNotification,
	        regId: this.regId,
	        wx_mp: this.wx_mp,
	        modules: this.modules,
	        a: this.anonymous,
	        z: ClientInfo_1.clientInfo.z
	      };
	      console.log("authorize params: ", JSON.stringify(params));
	      var rocket = new Rocket_1["default"]({
	        name: RocketTypes_1.RocketTypes.authorize,
	        params: params,
	        permission: Permission_1.Permission.NONE,
	        singleTimeout: SocketTimeout_1.SocketTimeout.commonInfiniteSingle,
	        totalTimeout: SocketTimeout_1.SocketTimeout.commonInfiniteTotal,
	        success: this.onAuthorizeSuccess.bind(this),
	        fail: this.onAuthorizeFailed.bind(this)
	      });
	      this.ioSocket.emit(rocket);
	    }; //连接中


	    GoEasySocket.prototype.onConnecting = function () {
	      this.notify(this.connectingObservers, this.reconnectingTimes);
	    }; //重连中


	    GoEasySocket.prototype.onIoReconnecting = function () {
	      this.reconnectingTimes++;

	      if (this.status == NetworkStatus_1.NetworkStatus.CONNECTED || this.status == NetworkStatus_1.NetworkStatus.EXPIRED_RECONNECTED || this.status == NetworkStatus_1.NetworkStatus.RECONNECTING) {
	        this.status = NetworkStatus_1.NetworkStatus.RECONNECTING;
	      } else {
	        this.status = NetworkStatus_1.NetworkStatus.CONNECTING;
	      }

	      this.onConnecting();
	    }; //断连


	    GoEasySocket.prototype.onIoDisconnected = function () {
	      if (this.status == NetworkStatus_1.NetworkStatus.DISCONNECTING) {
	        this.status = NetworkStatus_1.NetworkStatus.DISCONNECTED;
	        this.notify(this.disconnectedObservers);
	      } //如果不是disconnecting的，我们就认为是断网重连，忽略掉


	      this.notify(this.disconnectedObservers);
	    }; //连接成功


	    GoEasySocket.prototype.onAuthorizeSuccess = function (authorizeAck) {
	      if (this.anonymous === true && authorizeAck.u) {
	        anonymous_user_id_repository_1.AnonymousUserIdRepository.put(authorizeAck.u);
	        this.userId = authorizeAck.u;
	      }

	      if (this.status === NetworkStatus_1.NetworkStatus.RECONNECTING) {
	        var expiredClient = this.sid !== authorizeAck.sid;

	        if (expiredClient) {
	          this.status = NetworkStatus_1.NetworkStatus.EXPIRED_RECONNECTED;
	          this.notify(this.expiredReconnectedObservers);
	        } else {
	          this.status = NetworkStatus_1.NetworkStatus.RECONNECTED;
	        }
	      } else {
	        this.status = NetworkStatus_1.NetworkStatus.CONNECTED;
	        this.sid = authorizeAck.sid;
	      } //设置权限


	      if (authorizeAck.enablePublish) {
	        if (!this.permissions.find(function (item) {
	          return item == Permission_1.Permission.WRITE;
	        })) {
	          this.permissions.push(Permission_1.Permission.WRITE);
	        }
	      }

	      if (authorizeAck.enableSubscribe) {
	        if (!this.permissions.find(function (item) {
	          return item == Permission_1.Permission.READ;
	        })) {
	          this.permissions.push(Permission_1.Permission.READ);
	        }
	      }

	      this.reconnectingTimes = 0;
	      this.notify(this.connectedObservers);
	    }; //连接失败


	    GoEasySocket.prototype.onAuthorizeFailed = function (authorizeAck) {
	      this.ioSocket.disconnect();
	      this.status = NetworkStatus_1.NetworkStatus.CONNECT_FAILED;
	      var response = {
	        code: authorizeAck.resultCode || 408,
	        content: authorizeAck.content || 'Host unreachable or timeout'
	      };
	      this.notify(this.connectFailedObservers, response);
	    };

	    GoEasySocket.prototype.addConnectingObserver = function (callback) {
	      if (!Calibrator_1["default"].isFunction(callback)) return;
	      this.connectingObservers.push(callback);
	    };

	    GoEasySocket.prototype.addConnectFailedObserver = function (callback) {
	      if (!Calibrator_1["default"].isFunction(callback)) return;
	      this.connectFailedObservers.push(callback);
	    };

	    GoEasySocket.prototype.addExpiredReconnectedObserver = function (callback) {
	      if (!Calibrator_1["default"].isFunction(callback)) return;
	      this.expiredReconnectedObservers.push(callback);
	    };

	    GoEasySocket.prototype.addMessageObserver = function (key, callback) {
	      var _this = this;

	      if (!this.messageObservers[key]) {
	        this.messageObservers[key] = [];
	        this.ioSocket.io.on(key, function (message) {
	          _this.notifyMessageObservers(key, message);
	        });
	      }

	      this.messageObservers[key].push(new MessageObserver_1.MessageObserver(callback));
	    };

	    GoEasySocket.prototype.notifyMessageObservers = function (key, message) {
	      var observers = this.messageObservers[key];

	      for (var i = 0; i < observers.length; i++) {
	        observers[i].onMessage(key, message);
	      }
	    };

	    return GoEasySocket;
	  }(AbstractSocket_1["default"]);

	  exports["default"] = GoEasySocket;
	})(GoEasySocket);

	var ModuleTypes = {};

	ModuleTypes.__esModule = true;
	ModuleTypes.ModuleTypes = void 0;
	ModuleTypes.ModuleTypes = {
	  IM: 'IM',
	  PUBSUB: 'PUBSUB'
	};

	var pubsub = {};

	var Publisher = {};

	var validatorUtils = {};

	(function (exports) {

	  exports.__esModule = true;
	  var Calibrator_1 = Calibrator;

	  var ValidatorUtils =
	  /** @class */
	  function () {
	    function ValidatorUtils() {}
	    /**
	     *
	     * @param id  userId or groupId
	     */


	    ValidatorUtils.prototype.validateId = function (id, key) {
	      if (Calibrator_1["default"].isEmpty(id)) {
	        throw {
	          code: 400,
	          content: " ".concat(key, " is required.")
	        };
	      }

	      if (!Calibrator_1["default"].isStringOrNumber(id)) {
	        throw {
	          code: 400,
	          content: "TypeError: ".concat(key, " require string or number.")
	        };
	      }
	    };

	    ValidatorUtils.prototype.validateIdArray = function (ids, key) {
	      if (!Array.isArray(ids) || ids.length === 0) {
	        throw {
	          code: 400,
	          content: "TypeError: ".concat(key, " require array.")
	        };
	      }

	      if (ids.length > 300) {
	        throw {
	          code: 400,
	          content: "".concat(key, " is over max length 500.")
	        };
	      }

	      for (var i = 0; i < ids.length; i++) {
	        if (!Calibrator_1["default"].isStringOrNumber(ids[i])) {
	          throw {
	            code: 400,
	            content: "TypeError: ".concat(key, " item require string or number.")
	          };
	        }

	        if (Calibrator_1["default"].isNumber(ids[i])) {
	          ids[i] = ids[i].toString();
	        }

	        if (ids[i].length == 0) {
	          throw {
	            code: 400,
	            content: "".concat(key, " has empty item.")
	          };
	        }
	      }

	      if (Array.from(new Set(ids)).length < ids.length) {
	        throw {
	          code: 400,
	          content: "Duplicate element in ".concat(key)
	        };
	      }
	    };

	    ValidatorUtils.prototype.validateChannel = function (channel, key) {
	      this.validateId(channel, key);
	    };

	    ValidatorUtils.prototype.validateChannelArray = function (channels, key) {
	      this.validateIdArray(channels, key);
	    };

	    ValidatorUtils.prototype.validateChannelAndChannels = function (channel, channels) {
	      var hasChannel = !Calibrator_1["default"].isEmpty(channel);
	      var hasChannels = !Calibrator_1["default"].isEmpty(channels);

	      if (!hasChannel && !hasChannels) {
	        throw {
	          code: 400,
	          content: "channel is required."
	        };
	      }

	      if (hasChannel && hasChannels) {
	        throw {
	          code: 400,
	          content: "subscribe to either channel or channels, not both."
	        };
	      }

	      if (hasChannel) {
	        this.validateId(channel, 'channel');
	      }

	      if (hasChannels) {
	        this.validateIdArray(channels, 'channels');
	      }
	    };

	    ValidatorUtils.prototype.validateCallbackOptions = function (callbackOptions) {
	      if (!Calibrator_1["default"].isObject(callbackOptions)) {
	        throw {
	          code: 400,
	          content: "bad parameters" //todo: 更好的错误提示

	        };
	      }
	    };

	    ValidatorUtils.prototype.validateNotification = function (notification) {
	      if (Calibrator_1["default"].isObject(notification)) {
	        if (Calibrator_1["default"].isEmpty(notification.title)) {
	          throw {
	            code: 400,
	            content: 'notification.title is required.'
	          };
	        } else if (!Calibrator_1["default"].isString(notification.title)) {
	          throw {
	            code: 400,
	            content: 'TypeError: notification.title requires string.'
	          };
	        } else if (notification.title.length > 32) {
	          throw {
	            code: 400,
	            content: 'TypeError: notification.title over max length 32.'
	          };
	        }

	        if (Calibrator_1["default"].isEmpty(notification.body)) {
	          throw {
	            code: 400,
	            content: 'notification.body is required.'
	          };
	        } else if (!Calibrator_1["default"].isString(notification.body)) {
	          throw {
	            code: 400,
	            content: 'TypeError: notification.body must be string.'
	          };
	        } else if (notification.body.length > 50) {
	          throw {
	            code: 400,
	            content: 'notification.body over max length 50.'
	          };
	        }
	      } else if (Calibrator_1["default"].isPrimitive(notification)) {
	        throw {
	          code: 400,
	          content: 'TypeError: notification requires an object.'
	        };
	      }
	    };

	    ValidatorUtils.prototype.validateValIsEmpty = function (val, key) {
	      if (Calibrator_1["default"].isUndef(val) || Calibrator_1["default"].isEmpty(val)) {
	        throw {
	          code: 400,
	          content: "".concat(key, " is empty")
	        };
	      }
	    };

	    ValidatorUtils.prototype.validateWXMPTemplateMsg = function (wx_mp_template_msg) {
	      if (Calibrator_1["default"].isObject(wx_mp_template_msg)) {
	        if (!Calibrator_1["default"].isString(wx_mp_template_msg.template_id)) {
	          throw {
	            code: 400,
	            content: 'template_id must be string.'
	          };
	        }

	        if (!Calibrator_1["default"].isEmpty(wx_mp_template_msg.url) && !Calibrator_1["default"].isString(wx_mp_template_msg.url)) {
	          throw {
	            code: 400,
	            content: 'url must be string'
	          };
	        }

	        if (!Calibrator_1["default"].isEmpty(wx_mp_template_msg.miniprogram)) {
	          if (!Calibrator_1["default"].isString(wx_mp_template_msg.miniprogram.appid) || !Calibrator_1["default"].isString(wx_mp_template_msg.miniprogram.pagepath)) {
	            throw {
	              code: 400,
	              content: 'miniprogram.appid and miniprogram.pagepath must be strings.'
	            };
	          }
	        }

	        if (!Calibrator_1["default"].isObject(wx_mp_template_msg.data)) {
	          throw {
	            code: 400,
	            content: 'data requires an object.'
	          };
	        }
	      } else if (Calibrator_1["default"].isPrimitive(wx_mp_template_msg)) {
	        throw {
	          code: 400,
	          content: 'wx_mp_template_msg must be an object.'
	        };
	      }
	    };

	    return ValidatorUtils;
	  }();

	  var validatorUtils = new ValidatorUtils();
	  exports["default"] = validatorUtils;
	})(validatorUtils);

	var g = {};

	g.__esModule = true;
	g.G = void 0;

	var G =
	/** @class */
	function () {
	  function G() {}

	  G.i = function (socket) {
	    this.socket = socket;
	  };

	  G.s = function () {
	    if (this.socket) {
	      return this.socket;
	    }

	    throw new Error('Please connect first.');
	  };

	  G.u = function () {
	    return this.s().userId;
	  };

	  G.ud = function () {
	    return this.s().userData;
	  };

	  return G;
	}();

	g.G = G;

	(function (exports) {

	  exports.__esModule = true;
	  var noop_1 = noop;
	  var Calibrator_1 = Calibrator;
	  var UUID_1 = UUID;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var RocketTypes_1 = RocketTypes;
	  var validator_utils_1 = validatorUtils;
	  var g_1 = g;

	  var Publisher =
	  /** @class */
	  function () {
	    function Publisher() {}

	    Publisher.prototype.publish = function (options) {
	      if (!Calibrator_1["default"].isFunction(options.onFailed)) {
	        options.onFailed = noop_1["default"];
	      }

	      if (!Calibrator_1["default"].isFunction(options.onSuccess)) {
	        options.onSuccess = noop_1["default"];
	      }

	      this.validate(options);
	      options.channel = options.channel.toString();
	      var params = {
	        channel: options.channel,
	        content: options.message,
	        nt: options.notification,
	        at: options.accessToken,
	        guid: UUID_1["default"].get()
	      };

	      if (options.wx_mp_template_msg) {
	        params.wx_mp_template_msg = options.wx_mp_template_msg;
	        params.wx_mp_template_msg.data = JSON.stringify(params.wx_mp_template_msg.data); // todo:这个data需要转换成字符串吗?
	      }

	      var success = function success(ack) {
	        options.onSuccess({
	          code: 200,
	          content: 'ok'
	        });
	      };

	      var fail = function fail(ack) {
	        options.onFailed({
	          code: ack.resultCode,
	          content: ack.content
	        });
	      };

	      var rocket = new Rocket_1["default"]({
	        name: RocketTypes_1.RocketTypes.publish,
	        params: params,
	        unique: true,
	        singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	        totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	        permission: Permission_1.Permission.WRITE,
	        success: success,
	        fail: fail
	      });
	      g_1.G.s().emit(rocket);
	    };

	    Publisher.prototype.validate = function (options) {
	      validator_utils_1["default"].validateChannel(options.channel, 'channel');

	      if (Calibrator_1["default"].isEmpty(options.message)) {
	        throw {
	          code: 400,
	          content: 'message is required.'
	        };
	      }

	      if (!Calibrator_1["default"].isString(options.message)) {
	        throw {
	          code: 400,
	          content: 'TypeError: message requires string.'
	        };
	      } else if (options.message.length > 2500) {
	        throw {
	          code: 400,
	          content: 'Message over max length 2500.'
	        };
	      }

	      if (options.wx_mp_template_msg) {
	        validator_utils_1["default"].validateWXMPTemplateMsg(options.wx_mp_template_msg);
	      }

	      if (options.notification) {
	        validator_utils_1["default"].validateNotification(options.notification);
	      }
	    };

	    return Publisher;
	  }();

	  exports["default"] = Publisher;
	})(Publisher);

	var Subscriber$1 = {};

	var Subscription$1 = {};

	Subscription$1.__esModule = true;
	Subscription$1.Subscription = void 0;

	var Subscription =
	/** @class */
	function () {
	  function Subscription(options) {
	    this.channels = options.channels;
	    this.accessToken = options.accessToken;
	    this.onSuccess = options.onSuccess;
	    this.onFailed = options.onFailed;
	    this.onMessage = options.onMessage;
	  }

	  Subscription.prototype.empty = function () {};

	  return Subscription;
	}();

	Subscription$1.Subscription = Subscription;

	var RemoteEvents = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.RemoteEvents = void 0;

	  (function (RemoteEvents) {
	    RemoteEvents["message"] = "message";
	    RemoteEvents["imMessage"] = "imMessage";
	    RemoteEvents["userPresence"] = "userPresence";
	    RemoteEvents["groupPresence"] = "groupPresence";
	    RemoteEvents["IM_MSG_READ"] = "IM_MSG_READ";
	    RemoteEvents["IM_MSG_DELETED"] = "IM_MSG_DELETED";
	    RemoteEvents["IM_MSG_RECALLED"] = "IM_MSG_RECALLED";
	    RemoteEvents["RTC_RING_EVENT"] = "RTC_RING_EVENT";
	    RemoteEvents["RTC_CANCEL_RING"] = "RTC_CANCEL_RING";
	    RemoteEvents["RTC_REMOTE_USER_LEFT"] = "RTC_REMOTE_USER_LEFT";
	    RemoteEvents["RTC_CALL_END"] = "RTC_CALL_END";
	    RemoteEvents["PENDING_MESSAGE"] = "PENDING_MESSAGE";
	  })(exports.RemoteEvents || (exports.RemoteEvents = {}));
	})(RemoteEvents);

	Subscriber$1.__esModule = true;
	Subscriber$1.Subscriber = void 0;
	var noop_1$3 = noop;
	var Calibrator_1$g = Calibrator;
	var Rocket_1$6 = Rocket;
	var Permission_1$6 = Permission;
	var Subscription_1 = Subscription$1;
	var SocketTimeout_1$6 = SocketTimeout;
	var RocketTypes_1$8 = RocketTypes;
	var RemoteEvents_1$1 = RemoteEvents;
	var validator_utils_1$8 = validatorUtils;
	var GNS_1 = GNS$1;
	var g_1$g = g;

	var Subscriber =
	/** @class */
	function () {
	  function Subscriber() {
	    this.subscriptions = [];
	    GNS_1.GNS.instance.addAssembler(new (
	    /** @class */
	    function () {
	      function class_1() {}

	      class_1.prototype.assemble = function (oldPayload) {
	        return {
	          channel: oldPayload.ch,
	          content: oldPayload.ctt
	        };
	      };

	      class_1.prototype.support = function (oldPayload) {
	        return !!oldPayload.ch;
	      };

	      return class_1;
	    }())());
	  }

	  Subscriber.prototype.initialGoEasySocket = function () {
	    g_1$g.G.s().addMessageObserver(RemoteEvents_1$1.RemoteEvents.message, this.onNewMessage.bind(this));
	    g_1$g.G.s().addExpiredReconnectedObserver(this.onExpiredReconnected.bind(this));
	  };

	  Subscriber.prototype.resubscribe = function () {
	    var arr = this.subscriptions.slice(0);
	    this.subscriptions = [];

	    for (var i = 0; i < arr.length; i++) {
	      if (arr[i].channels.length != 0) {
	        this.subscribe(arr[i]);
	      }
	    }
	  };

	  Subscriber.prototype.clearSubscriptions = function () {
	    this.subscriptions = [];
	  };

	  Subscriber.prototype.onExpiredReconnected = function () {
	    this.resubscribe();
	  }; //收到消息分发


	  Subscriber.prototype.onNewMessage = function (message) {
	    //todo 临时处理方法，本应该在不同的消息中判断
	    if (message.n.indexOf('_presence') > -1) return;
	    console.log('Subscriber -> onNewMessage: ', message); //收到消息

	    if (message.a) {
	      g_1$g.G.s().sendAck('ack', {
	        "publishGuid": message.i
	      });
	    }

	    var neMessage = {
	      time: message.t,
	      channel: message.n,
	      content: message.c
	    };
	    this.createNotification(message);
	    var subscription = this.findSubscriptionByChannel(neMessage.channel);
	    subscription.onMessage(neMessage);
	  };

	  Subscriber.prototype.createNotification = function (message) {
	    var supportGNS = GNS_1.GNS.instance.supportNotification();

	    if (!Calibrator_1$g["default"].isObject(message.nt) || !supportGNS) {
	      return;
	    }

	    var data = {
	      ch: message.n,
	      ctt: message.c
	    };
	    GNS_1.GNS.instance.createLocalNotification(message.nt.t, message.nt.c, data);
	  };

	  Subscriber.prototype.formatOptions = function (options) {
	    this.formatCallback(options);

	    if (!Calibrator_1$g["default"].isFunction(options.onMessage)) {
	      options.onMessage = noop_1$3["default"];
	    }

	    if (options.channel) {
	      options.channel = options.channel.toString();
	      options.channels = [options.channel];
	    }

	    if (options.channels) {
	      options.channels = options.channels.toString().split(',');
	    }
	  };

	  Subscriber.prototype.formatCallback = function (options) {
	    if (!Calibrator_1$g["default"].isFunction(options.onSuccess)) {
	      options.onSuccess = noop_1$3["default"];
	    }

	    if (!Calibrator_1$g["default"].isFunction(options.onFailed)) {
	      options.onFailed = noop_1$3["default"];
	    }
	  }; //订阅


	  Subscriber.prototype.subscribe = function (options) {
	    var _this = this;

	    validator_utils_1$8["default"].validateChannelAndChannels(options.channel, options.channels);
	    this.formatOptions(options);

	    var success = function success() {
	      var subscription = new Subscription_1.Subscription({
	        channels: options.channels,
	        accessToken: options.accessToken,
	        onSuccess: options.onSuccess,
	        onFailed: options.onFailed,
	        onMessage: options.onMessage
	      });

	      _this.subscriptions.push(subscription);

	      options.onSuccess({
	        code: 200,
	        content: 'ok'
	      });
	    };

	    var fail = function fail(ack) {
	      options.onFailed({
	        code: ack.resultCode,
	        content: ack.content
	      });
	    };

	    var rocket = new Rocket_1$6["default"]({
	      name: RocketTypes_1$8.RocketTypes.subscribe,
	      permission: Permission_1$6.Permission.READ,
	      singleTimeout: SocketTimeout_1$6.SocketTimeout.commonInfiniteSingle,
	      totalTimeout: SocketTimeout_1$6.SocketTimeout.commonInfiniteTotal,
	      params: {
	        channels: options.channels,
	        accessToken: options.accessToken
	      },
	      success: success,
	      fail: fail
	    });
	    g_1$g.G.s().emit(rocket);
	  }; //取消订阅


	  Subscriber.prototype.unsubscribe = function (options) {
	    var _this = this;

	    validator_utils_1$8["default"].validateChannel(options.channel, 'channel');
	    options.channel = options.channel.toString();

	    if (!this.findSubscriptionByChannel(options.channel)) {
	      options.onFailed({
	        code: 400,
	        content: 'channel[' + options.channel + '] is not subscribed'
	      });
	      return;
	    }

	    var success = function success() {
	      options.onSuccess({
	        code: 200,
	        content: 'ok'
	      });

	      _this.removeChannel(options.channel);
	    };

	    var fail = function fail(ack) {
	      options.onFailed({
	        code: ack.resultCode,
	        content: ack.content
	      });
	    };

	    var rocket = new Rocket_1$6["default"]({
	      name: RocketTypes_1$8.RocketTypes.unsubscribe,
	      params: {
	        channel: options.channel
	      },
	      permission: Permission_1$6.Permission.READ,
	      singleTimeout: SocketTimeout_1$6.SocketTimeout.commonRequestSingle,
	      totalTimeout: SocketTimeout_1$6.SocketTimeout.commonRequestTotal,
	      success: success,
	      fail: fail
	    });
	    g_1$g.G.s().emit(rocket);
	  };

	  Subscriber.prototype.removeChannel = function (channel) {
	    for (var i = 0; i < this.subscriptions.length; i++) {
	      var channels = this.subscriptions[i].channels;

	      for (var j = 0; j < channels.length; j++) {
	        if (channels[j] == channel) {
	          this.subscriptions[i].channels.splice(j, 1);
	          break;
	        }
	      }
	    }
	  };

	  Subscriber.prototype.findSubscriptionByChannel = function (channel) {
	    var exist = false;
	    var subscription = null;

	    for (var i = this.subscriptions.length - 1; i >= 0; i--) {
	      var channels = this.subscriptions[i].channels;

	      for (var j = 0; j < channels.length; j++) {
	        if (channels[j] == channel) {
	          exist = true;
	          subscription = this.subscriptions[i];
	          break;
	        }
	      }

	      if (exist) break;
	    }

	    return subscription;
	  };

	  return Subscriber;
	}();

	Subscriber$1.Subscriber = Subscriber;

	var History$2 = {};

	History$2.__esModule = true;
	History$2.History = void 0;
	var noop_1$2 = noop;
	var Calibrator_1$f = Calibrator;
	var Rocket_1$5 = Rocket;
	var Permission_1$5 = Permission;
	var SocketTimeout_1$5 = SocketTimeout;
	var RocketTypes_1$7 = RocketTypes;
	var validator_utils_1$7 = validatorUtils;
	var g_1$f = g;

	var History$1 =
	/** @class */
	function () {
	  function History() {}

	  History.prototype.get = function (options) {
	    if (!Calibrator_1$f["default"].isFunction(options.onSuccess)) {
	      options.onSuccess = noop_1$2["default"];
	    }

	    if (!Calibrator_1$f["default"].isFunction(options.onFailed)) {
	      options.onFailed = noop_1$2["default"];
	    }

	    validator_utils_1$7["default"].validateChannel(options.channel, 'channel');
	    options.channel = options.channel.toString();

	    var ackCallback = function ackCallback(ack) {
	      options.onSuccess({
	        code: ack.resultCode || ack.code || 200,
	        content: ack.content
	      });
	    };

	    var failCallback = function failCallback(ack) {
	      options.onFailed({
	        code: ack.resultCode || ack.code,
	        content: ack.content
	      });
	    };

	    var rocket = new Rocket_1$5["default"]({
	      name: RocketTypes_1$7.RocketTypes.historyMessages,
	      permission: Permission_1$5.Permission.READ,
	      params: options,
	      singleTimeout: SocketTimeout_1$5.SocketTimeout.commonQuerySingle,
	      totalTimeout: SocketTimeout_1$5.SocketTimeout.commonQueryTotal,
	      success: ackCallback,
	      fail: failCallback
	    });
	    g_1$f.G.s().emit(rocket);
	  };

	  return History;
	}();

	History$2.History = History$1;

	var PresenceSubscriber$1 = {};

	var PresenceSubscription$1 = {};

	PresenceSubscription$1.__esModule = true;
	PresenceSubscription$1.PresenceSubscription = void 0;

	var PresenceSubscription =
	/** @class */
	function () {
	  function PresenceSubscription(options) {
	    this.channels = options.channels;
	    this.onSuccess = options.onSuccess;
	    this.onFailed = options.onFailed;
	    this.onPresence = options.onPresence;
	  }

	  return PresenceSubscription;
	}();

	PresenceSubscription$1.PresenceSubscription = PresenceSubscription;

	PresenceSubscriber$1.__esModule = true;
	PresenceSubscriber$1.PresenceSubscriber = void 0;
	var noop_1$1 = noop;
	var Calibrator_1$e = Calibrator;
	var Rocket_1$4 = Rocket;
	var Permission_1$4 = Permission;
	var SocketTimeout_1$4 = SocketTimeout;
	var PresenceSubscription_1 = PresenceSubscription$1;
	var RocketTypes_1$6 = RocketTypes;
	var RemoteEvents_1 = RemoteEvents;
	var validator_utils_1$6 = validatorUtils;
	var g_1$e = g;

	var PresenceSubscriber =
	/** @class */
	function () {
	  function PresenceSubscriber() {
	    this.presenters = [];
	  }

	  PresenceSubscriber.prototype.initialGoEasySocket = function () {
	    g_1$e.G.s().addMessageObserver(RemoteEvents_1.RemoteEvents.message, this.onNewMessage.bind(this));
	    g_1$e.G.s().addExpiredReconnectedObserver(this.onExpiredReconnected.bind(this));
	  };

	  PresenceSubscriber.prototype.resubscribe = function () {
	    var arr = this.presenters.slice(0);
	    this.presenters = [];

	    for (var i = 0; i < arr.length; i++) {
	      for (var j = 0; j < arr[i].channels.length; j++) {
	        var channelSplitArr = arr[i].channels[j].split('_presence');
	        arr[i].channels[j] = channelSplitArr[0];
	      }

	      if (arr[i].channels.length != 0) {
	        this.subscribePresence(arr[i]);
	      }
	    }
	  };

	  PresenceSubscriber.prototype.onExpiredReconnected = function () {
	    this.resubscribe();
	  }; //收到消息分发


	  PresenceSubscriber.prototype.onNewMessage = function (message) {
	    //todo 临时处理方法，本应该在不同的消息中判断
	    if (message.n.indexOf('_presence') == -1) return; //收到消息 通知channel

	    var presenceSubscription = this.findPresenceByChannel(message.n);

	    if (presenceSubscription) {
	      var content = JSON.parse(message.c);
	      content.events = content.events.map(function (item) {
	        var data = item.userData ? JSON.parse(item.userData) : {};
	        return {
	          time: item.time,
	          action: item.action,
	          id: item.userId,
	          data: data
	        };
	      });
	      presenceSubscription.onPresence(content);
	    }
	  };

	  PresenceSubscriber.prototype.formatOptions = function (options) {
	    this.formatCallback(options);

	    if (!Calibrator_1$e["default"].isFunction(options.onPresence)) {
	      options.onPresence = noop_1$1["default"];
	    }

	    if (options.channel) {
	      options.channel = options.channel.toString();
	      options.channels = [options.channel];
	    }

	    if (options.channels) {
	      options.channels = options.channels.toString().split(',');
	    }
	  };

	  PresenceSubscriber.prototype.formatCallback = function (options) {
	    if (!Calibrator_1$e["default"].isFunction(options.onSuccess)) {
	      options.onSuccess = noop_1$1["default"];
	    }

	    if (!Calibrator_1$e["default"].isFunction(options.onFailed)) {
	      options.onFailed = noop_1$1["default"];
	    }
	  };

	  PresenceSubscriber.prototype.subscribePresence = function (options) {
	    var _this = this;

	    validator_utils_1$6["default"].validateChannelAndChannels(options.channel, options.channels);
	    this.formatOptions(options);

	    if (Array.isArray(options.channels)) {
	      options.channels = options.channels.map(function (item) {
	        item += '_presence';
	        return item;
	      });
	    }

	    var success = function success() {
	      var presenter = new PresenceSubscription_1.PresenceSubscription({
	        channels: options.channels,
	        onSuccess: options.onSuccess,
	        onFailed: options.onFailed,
	        onPresence: options.onPresence
	      });

	      _this.presenters.push(presenter);

	      options.onSuccess({
	        code: 200,
	        content: 'ok'
	      });
	    };

	    var fail = function fail(ack) {
	      options.onFailed({
	        code: ack.resultCode,
	        content: ack.content
	      });
	    };

	    var rocket = new Rocket_1$4["default"]({
	      name: RocketTypes_1$6.RocketTypes.subscribe,
	      permission: Permission_1$4.Permission.READ,
	      singleTimeout: SocketTimeout_1$4.SocketTimeout.commonInfiniteSingle,
	      totalTimeout: SocketTimeout_1$4.SocketTimeout.commonInfiniteTotal,
	      params: {
	        channels: options.channels
	      },
	      success: success,
	      fail: fail
	    });
	    g_1$e.G.s().emit(rocket);
	  };

	  PresenceSubscriber.prototype.unsubscribePresence = function (options) {
	    var _this = this;

	    this.formatCallback(options);

	    if (!Calibrator_1$e["default"].isDef(options.channel)) {
	      options.onFailed({
	        code: 400,
	        content: 'channel is required'
	      });
	      return;
	    }

	    options.channel += '_presence';

	    if (!this.findPresenceByChannel(options.channel)) {
	      options.onFailed({
	        code: 400,
	        content: 'channel[' + options.channel + '] is not subscribed'
	      });
	      return;
	    }

	    var rocket = new Rocket_1$4["default"]({
	      name: RocketTypes_1$6.RocketTypes.unsubscribe,
	      params: {
	        channel: options.channel
	      },
	      permission: Permission_1$4.Permission.READ,
	      singleTimeout: SocketTimeout_1$4.SocketTimeout.commonRequestSingle,
	      totalTimeout: SocketTimeout_1$4.SocketTimeout.commonRequestTotal,
	      success: function success() {
	        options.onSuccess({
	          code: 200,
	          content: 'ok'
	        });

	        _this.removeChannel(options.channel);
	      },
	      fail: function fail(ack) {
	        options.onFailed({
	          code: ack.resultCode,
	          content: ack.content
	        });
	      }
	    });
	    g_1$e.G.s().emit(rocket);
	  };

	  PresenceSubscriber.prototype.removeChannel = function (channel) {
	    for (var i = 0; i < this.presenters.length; i++) {
	      var channels = this.presenters[i].channels;

	      for (var j = 0; j < channels.length; j++) {
	        if (channels[j] == channel) {
	          this.presenters[i].channels.splice(j, 1);
	          break;
	        }
	      }
	    }
	  };

	  PresenceSubscriber.prototype.findPresenceByChannel = function (channel) {
	    var exist = false;
	    var presenceSubscription = null;

	    for (var i = this.presenters.length - 1; i >= 0; i--) {
	      var channels = this.presenters[i].channels;

	      for (var j = 0; j < channels.length; j++) {
	        if (channels[j] == channel) {
	          exist = true;
	          presenceSubscription = this.presenters[i];
	          break;
	        }
	      }

	      if (exist) break;
	    }

	    return presenceSubscription;
	  };

	  return PresenceSubscriber;
	}();

	PresenceSubscriber$1.PresenceSubscriber = PresenceSubscriber;

	var HereNow$1 = {};

	HereNow$1.__esModule = true;
	HereNow$1.HereNow = void 0;
	var noop_1 = noop;
	var Calibrator_1$d = Calibrator;
	var Rocket_1$3 = Rocket;
	var Permission_1$3 = Permission;
	var SocketTimeout_1$3 = SocketTimeout;
	var RocketTypes_1$5 = RocketTypes;
	var validator_utils_1$5 = validatorUtils;
	var g_1$d = g;

	var HereNow =
	/** @class */
	function () {
	  function HereNow() {}

	  HereNow.prototype.byChannel = function (options) {
	    var params = {
	      channels: [],
	      includeUsers: false,
	      distinct: false
	    };

	    if (!Calibrator_1$d["default"].isFunction(options.onSuccess)) {
	      options.onSuccess = noop_1["default"];
	    }

	    if (!Calibrator_1$d["default"].isFunction(options.onFailed)) {
	      options.onFailed = noop_1["default"];
	    }

	    validator_utils_1$5["default"].validateChannelArray(options.channels, 'channels');
	    params.channels = options.channels.toString().split(','); // 转换为字符串数组

	    params.includeUsers = options.includeUsers || false;
	    params.distinct = options.distinct || false;

	    var ackCallback = function ackCallback(ack) {
	      var content = ack.content;
	      var channels = content.channels;

	      for (var channel in channels) {
	        if (channels.hasOwnProperty(channel)) {
	          var channelVal = channels[channel];

	          if (channelVal.users) {
	            channelVal.users = channelVal.users.map(function (user) {
	              user.data = user.data ? JSON.parse(user.data) : {};
	              return user;
	            });
	          }
	        }
	      }

	      options.onSuccess({
	        code: ack.resultCode || ack.code || 200,
	        content: content
	      });
	    };

	    var failCallback = function failCallback(ack) {
	      options.onFailed({
	        code: ack.resultCode || ack.code || 200,
	        content: ack.content
	      });
	    };

	    var rocket = new Rocket_1$3["default"]({
	      name: RocketTypes_1$5.RocketTypes.hereNow,
	      permission: Permission_1$3.Permission.READ,
	      params: params,
	      singleTimeout: SocketTimeout_1$3.SocketTimeout.commonQuerySingle,
	      totalTimeout: SocketTimeout_1$3.SocketTimeout.commonQueryTotal,
	      success: ackCallback,
	      fail: failCallback
	    });
	    g_1$d.G.s().emit(rocket);
	  };

	  HereNow.prototype.byUserId = function (options) {
	    var params = {
	      userIds: [],
	      distinct: true
	    };

	    if (!Calibrator_1$d["default"].isFunction(options.onSuccess)) {
	      options.onSuccess = noop_1["default"];
	    }

	    if (!Calibrator_1$d["default"].isFunction(options.onFailed)) {
	      options.onFailed = noop_1["default"];
	    }

	    validator_utils_1$5["default"].validateIdArray(options.userIds, 'userIds');
	    params.userIds = options.userIds.toString().split(',');

	    if (options.distinct == false) {
	      params.distinct = false;
	    }

	    var ackCallback = function ackCallback(ack) {
	      var content = ack.content;
	      content = content.map(function (user) {
	        var newUser = {
	          id: user.userId,
	          data: user.userData ? JSON.parse(user.userData) : {}
	        };
	        return newUser;
	      });
	      options.onSuccess({
	        code: ack.resultCode || ack.code || 200,
	        content: content
	      });
	    };

	    var failCallback = function failCallback(ack) {
	      options.onFailed({
	        code: ack.resultCode || ack.code || 200,
	        content: ack.content
	      });
	    };

	    var rocket = new Rocket_1$3["default"]({
	      name: RocketTypes_1$5.RocketTypes.hereNowByUserIds,
	      permission: Permission_1$3.Permission.READ,
	      params: params,
	      singleTimeout: SocketTimeout_1$3.SocketTimeout.commonQuerySingle,
	      totalTimeout: SocketTimeout_1$3.SocketTimeout.commonQueryTotal,
	      success: ackCallback,
	      fail: failCallback
	    });
	    g_1$d.G.s().emit(rocket);
	  };

	  return HereNow;
	}();

	HereNow$1.HereNow = HereNow;

	var callbackUtils = {};

	callbackUtils.__esModule = true;
	callbackUtils.CallbackUtils = void 0;
	var Calibrator_1$c = Calibrator;

	var CallbackUtils =
	/** @class */
	function () {
	  function CallbackUtils() {}

	  CallbackUtils.onSuccess = function (callbackOptions, result) {
	    if (Calibrator_1$c["default"].isFunction(callbackOptions.onSuccess)) {
	      callbackOptions.onSuccess(result);
	    }
	  };

	  CallbackUtils.onFailed = function (callbackOptions, error) {
	    if (Calibrator_1$c["default"].isObject(callbackOptions) && Calibrator_1$c["default"].isFunction(callbackOptions.onFailed)) {
	      callbackOptions.onFailed(error);
	    } else {
	      throw error;
	    }
	  };

	  return CallbackUtils;
	}();

	callbackUtils.CallbackUtils = CallbackUtils;

	pubsub.__esModule = true;
	pubsub.PubSub = void 0;
	var Publisher_1 = Publisher;
	var Subscriber_1 = Subscriber$1;
	var History_1 = History$2;
	var PresenceSubscriber_1 = PresenceSubscriber$1;
	var HereNow_1 = HereNow$1;
	var callback_utils_1$6 = callbackUtils;
	var NetworkStatus_1 = NetworkStatus;
	var ModuleTypes_1$1 = ModuleTypes;
	var g_1$c = g;

	var PubSub =
	/** @class */
	function () {
	  function PubSub(options) {
	    this.subscriber = new Subscriber_1.Subscriber();
	    this.options = options;
	  }

	  PubSub.init = function (options) {
	    PubSub.instance = new PubSub(options);
	  };

	  PubSub.prototype.initialGoEasySocket = function () {
	    this.publisher = new Publisher_1["default"]();
	    this.histories = new History_1.History();
	    this.presence = new PresenceSubscriber_1.PresenceSubscriber();
	    this.hereNows = new HereNow_1.HereNow();
	    this.subscriber.initialGoEasySocket();
	    this.presence.initialGoEasySocket();
	  };

	  PubSub.prototype.initialBeforeConnect = function () {
	    this.subscriber.clearSubscriptions();
	  };

	  PubSub.prototype["catch"] = function (functionObj, callbackOptions) {
	    try {
	      this.validateOptions();
	      functionObj();
	    } catch (err) {
	      callback_utils_1$6.CallbackUtils.onFailed(callbackOptions, err);
	    }
	  }; // todo: 方法名


	  PubSub.prototype.validateOptions = function () {
	    if (!g_1$c.G.s() || g_1$c.G.s().getStatus() !== NetworkStatus_1.NetworkStatus.CONNECTED) {
	      throw Error('Please call connect() first.');
	    }

	    if (!this.options.modules || !this.options.modules.includes(ModuleTypes_1$1.ModuleTypes.PUBSUB)) {
	      throw {
	        code: 400,
	        content: "Invalid options: module '".concat(ModuleTypes_1$1.ModuleTypes.PUBSUB, "' is not enabled")
	      };
	    }
	  };

	  PubSub.prototype.publish = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.publisher.publish(options);
	    }, options);
	  };

	  PubSub.prototype.subscribe = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.subscriber.subscribe(options);
	    }, options);
	  };

	  PubSub.prototype.unsubscribe = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.subscriber.unsubscribe(options);
	    }, options);
	  };

	  PubSub.prototype.subscribePresence = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.presence.subscribePresence(options);
	    }, options);
	  };

	  PubSub.prototype.unsubscribePresence = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.presence.unsubscribePresence(options);
	    }, options);
	  };

	  PubSub.prototype.history = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.histories.get(options);
	    }, options);
	  };

	  PubSub.prototype.hereNow = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.hereNows.byChannel(options);
	    }, options);
	  };

	  PubSub.prototype.hereNowByUserIds = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.hereNows.byUserId(options);
	    }, options);
	  };

	  return PubSub;
	}();

	pubsub.PubSub = PubSub;

	var im = {};

	var apiEventCenter = {};

	var imApiEvents = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.ImApiEvents = void 0;

	  (function (ImApiEvents) {
	    ImApiEvents["PRIVATE_MESSAGE_RECEIVED"] = "PRIVATE_MESSAGE_RECEIVED";
	    ImApiEvents["GROUP_MESSAGE_RECEIVED"] = "GROUP_MESSAGE_RECEIVED";
	    ImApiEvents["SYSTEM_MESSAGE_RECEIVED"] = "SYSTEM_MESSAGE_RECEIVED";
	    ImApiEvents["CONVERSATIONS_UPDATED"] = "CONVERSATIONS_UPDATED";
	    ImApiEvents["USER_PRESENCE"] = "USER_PRESENCE";
	    ImApiEvents["GROUP_PRESENCE"] = "GROUP_PRESENCE";
	    ImApiEvents["MESSAGE_DELETED"] = "MESSAGE_DELETED";
	    ImApiEvents["MESSAGE_READ"] = "MESSAGE_READ";
	    ImApiEvents["MESSAGE_RECALLED"] = "MESSAGE_RECALLED";
	    ImApiEvents["CS_MESSAGE_RECEIVED"] = "CS_MESSAGE_RECEIVED";
	    ImApiEvents["PENDING_CONVERSATIONS_UPDATED"] = "PENDING_CONVERSATIONS_UPDATED";
	  })(exports.ImApiEvents || (exports.ImApiEvents = {}));
	})(imApiEvents);

	var rtcApiEvents = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.RTCApiEvents = void 0;

	  (function (RTCApiEvents) {
	    RTCApiEvents["RING"] = "RING";
	    RTCApiEvents["USER_ACCEPTED"] = "USER_ACCEPTED";
	    RTCApiEvents["CALL_ENDED"] = "CALL_ENDED";
	    RTCApiEvents["USER_QUITED"] = "USER_QUITED";
	  })(exports.RTCApiEvents || (exports.RTCApiEvents = {}));
	})(rtcApiEvents);

	apiEventCenter.__esModule = true;
	apiEventCenter.ApiEventCenter = void 0;
	var im_api_events_1$2 = imApiEvents;
	var rtc_api_events_1 = rtcApiEvents;
	var Emitter$1 = componentEmitter.exports;
	var Calibrator_1$b = Calibrator;

	var ApiEventCenter =
	/** @class */
	function () {
	  function ApiEventCenter() {
	    this.emitter = new Emitter$1();
	  } //todo： 考虑是否要在连接断开的时候清空？ 但因为考虑到用户在连接前都可以监听，所以目前考虑客户自己维护


	  ApiEventCenter.prototype.on = function (apiEvent, callback) {
	    if (!Calibrator_1$b["default"].isString(apiEvent)) {
	      throw Error('event require a string.');
	    }

	    if (!Calibrator_1$b["default"].isDef(im_api_events_1$2.ImApiEvents[apiEvent]) && !Calibrator_1$b["default"].isDef(rtc_api_events_1.RTCApiEvents[apiEvent])) {
	      throw Error('An event that is not defined');
	    }

	    if (!Calibrator_1$b["default"].isFunction(callback)) {
	      throw Error('callback must be a function');
	    }

	    this.emitter.on(apiEvent, callback);
	  };

	  ApiEventCenter.prototype.fire = function (apiEvent, data) {
	    this.emitter.emit(apiEvent, data);
	  };

	  ApiEventCenter.prototype.off = function (apiEvent, callback) {
	    this.emitter.off(apiEvent, callback);
	  };

	  return ApiEventCenter;
	}();

	apiEventCenter.ApiEventCenter = ApiEventCenter;

	var GoEasyUploader$1 = {};

	var FileUploader$1 = {};

	var UniAppFileUploader$1 = {};

	var AbstractFileUploader = {};

	(function (exports) {

	  exports.__esModule = true;

	  var AbstractFileUploader =
	  /** @class */
	  function () {
	    function AbstractFileUploader() {}

	    AbstractFileUploader.prototype.upload = function (uploadRequest, onProgress) {
	      throw Error('Not implementation yet.');
	    };

	    return AbstractFileUploader;
	  }();

	  exports["default"] = AbstractFileUploader;
	})(AbstractFileUploader);

	var __extends$j = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	UniAppFileUploader$1.__esModule = true;
	UniAppFileUploader$1.uniAppFileUploader = void 0;
	var AbstractFileUploader_1$2 = AbstractFileUploader;

	var UniAppFileUploader =
	/** @class */
	function (_super) {
	  __extends$j(UniAppFileUploader, _super);

	  function UniAppFileUploader() {
	    return _super.call(this) || this;
	  }

	  UniAppFileUploader.prototype.upload = function (uploadRequest, onprogress) {
	    var _this = this;

	    try {
	      return new Promise(function (resolve, reject) {
	        var uploadTask = uni.uploadFile({
	          url: uploadRequest.host,
	          filePath: _this.getTempFilePath(uploadRequest),
	          name: 'file',
	          formData: uploadRequest.parameters,
	          success: function success(res) {
	            if (res.statusCode === 200) {
	              var content = uploadRequest.payload;
	              content.message = res.errMsg;
	              resolve({
	                code: 200,
	                content: content
	              });
	            } else {
	              reject({
	                code: res.statusCode,
	                content: res.errMsg
	              });
	            }
	          },
	          fail: function fail(err) {
	            reject({
	              code: 500,
	              content: err.errMsg
	            });
	          }
	        });
	        uploadTask.onProgressUpdate(function (res) {
	          onprogress && onprogress(res);
	        });
	      });
	    } catch (e) {
	      return new Promise(function (resolve, reject) {
	        reject({
	          code: 500,
	          content: e
	        });
	      });
	    }
	  };

	  UniAppFileUploader.prototype.getTempFilePath = function (uploadRequest) {
	    console.log('uploadRequest', uploadRequest);
	    var file = uploadRequest.file; //tempFilePath-->语音消息 fullPath-->安卓文件消息  path-->H5、wx文件消息

	    var tempFilePath = file.tempFilePath || file.fullPath || file.path;
	    return tempFilePath;
	  };

	  return UniAppFileUploader;
	}(AbstractFileUploader_1$2["default"]);

	var uniAppFileUploader = new UniAppFileUploader();
	UniAppFileUploader$1.uniAppFileUploader = uniAppFileUploader;

	var WXFileUploader$1 = {};

	var __extends$i = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	WXFileUploader$1.__esModule = true;
	WXFileUploader$1.wxFileUploader = void 0;
	var AbstractFileUploader_1$1 = AbstractFileUploader;

	var WXFileUploader =
	/** @class */
	function (_super) {
	  __extends$i(WXFileUploader, _super);

	  function WXFileUploader() {
	    return _super !== null && _super.apply(this, arguments) || this;
	  }

	  WXFileUploader.prototype.upload = function (uploadRequest, onprogress) {
	    var _this = this;

	    try {
	      return new Promise(function (resolve, reject) {
	        var uploadTask = wx.uploadFile({
	          url: uploadRequest.host,
	          filePath: _this.getTempFilePath(uploadRequest),
	          name: 'file',
	          formData: uploadRequest.parameters,
	          success: function success(res) {
	            if (res.statusCode === 200) {
	              var content = uploadRequest.payload;
	              content.message = res.errMsg;
	              resolve({
	                code: 200,
	                content: content
	              });
	            } else {
	              reject({
	                code: res.statusCode,
	                content: res.errMsg
	              });
	            }
	          },
	          fail: function fail(err) {
	            reject({
	              code: 500,
	              content: err.errMsg
	            });
	          }
	        });
	        uploadTask.onProgressUpdate(function (res) {
	          onprogress && onprogress(res);
	        });
	      });
	    } catch (e) {
	      return new Promise(function (resolve, reject) {
	        reject({
	          code: 500,
	          content: e
	        });
	      });
	    }
	  };

	  WXFileUploader.prototype.getTempFilePath = function (uploadRequest) {
	    var file = uploadRequest.file || uploadRequest.fileRes; // path-->图片、文件 tempFilePath-->视频、语音

	    return file.path || file.tempFilePath;
	  };

	  return WXFileUploader;
	}(AbstractFileUploader_1$1["default"]);

	var wxFileUploader = new WXFileUploader();
	WXFileUploader$1.wxFileUploader = wxFileUploader;

	var HtmlFileUploader$1 = {};

	var __extends$h = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	HtmlFileUploader$1.__esModule = true;
	HtmlFileUploader$1.htmlFileUploader = void 0;
	var AbstractFileUploader_1 = AbstractFileUploader;

	var HtmlFileUploader =
	/** @class */
	function (_super) {
	  __extends$h(HtmlFileUploader, _super);

	  function HtmlFileUploader() {
	    return _super.call(this) || this;
	  }

	  HtmlFileUploader.prototype.upload = function (uploadRequest, onprogress) {
	    try {
	      return new Promise(function (resolve, reject) {
	        var xhr = new XMLHttpRequest();
	        xhr.open('post', uploadRequest.host, true);

	        for (var key in uploadRequest.headers) {
	          xhr.setRequestHeader(key, uploadRequest.headers[key]);
	        }

	        xhr.upload.onprogress = function (progress) {
	          onprogress && onprogress(progress);
	        };

	        xhr.upload.onloadstart = function (progress) {
	          onprogress && onprogress(progress);
	        };

	        xhr.upload.onloadend = function (progress) {
	          onprogress && onprogress(progress);
	        }; //构建formData


	        var formData = new FormData();

	        for (var fd in uploadRequest.parameters) {
	          if (fd == 'fileRes') {
	            formData.append('file', uploadRequest.parameters[fd]);
	          } else {
	            formData.append(fd, uploadRequest.parameters[fd]);
	          }
	        }

	        xhr.send(formData);

	        xhr.onreadystatechange = function () {
	          if (xhr.readyState == 4) {
	            if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
	              var content = uploadRequest.payload;
	              content.message = xhr.responseText;
	              resolve({
	                code: 200,
	                content: content
	              });
	            } else {
	              reject({
	                code: xhr.status,
	                content: xhr.responseText
	              });
	            }
	          }
	        };
	      });
	    } catch (e) {
	      return new Promise(function (resolve, reject) {
	        reject({
	          code: 500,
	          content: e
	        });
	      });
	    }
	  };

	  return HtmlFileUploader;
	}(AbstractFileUploader_1["default"]);

	var htmlFileUploader = new HtmlFileUploader();
	HtmlFileUploader$1.htmlFileUploader = htmlFileUploader;

	FileUploader$1.__esModule = true;
	FileUploader$1.fileUploader = FileUploader$1.FileUploader = void 0;
	var UniAppFileUploader_1 = UniAppFileUploader$1;
	var WXFileUploader_1 = WXFileUploader$1;
	var HtmlFileUploader_1 = HtmlFileUploader$1;
	var framework_detector_1$1 = frameworkDetector;

	var FileUploader =
	/** @class */
	function () {
	  function FileUploader() {
	    var _a;

	    this.uploader = (_a = {}, _a[framework_detector_1$1.Framework.UNIAPP] = UniAppFileUploader_1.uniAppFileUploader, _a[framework_detector_1$1.Framework.NATIVE_APPLET_WX] = WXFileUploader_1.wxFileUploader, _a[framework_detector_1$1.Framework.UNKNOWN] = HtmlFileUploader_1.htmlFileUploader, _a);
	  }

	  FileUploader.prototype.upload = function (uploadRequest, onProgress) {
	    var framework = framework_detector_1$1.FrameworkDetector.currentFramework();
	    console.log('upload', framework);
	    return this.uploader[framework].upload(uploadRequest, onProgress);
	  };

	  return FileUploader;
	}();

	FileUploader$1.FileUploader = FileUploader;
	var fileUploader = new FileUploader();
	FileUploader$1.fileUploader = fileUploader;

	var RequestBuilder = {};

	var OSSRequestFactory$1 = {};

	var OssType = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.OssType = void 0;

	  (function (OssType) {
	    OssType["aliYun"] = "ALI";
	    OssType["qiNiu"] = "QN";
	  })(exports.OssType || (exports.OssType = {}));
	})(OssType);

	var AliyunOSSRequestBuilder = {};

	var FileUploadRequest = {};

	(function (exports) {

	  exports.__esModule = true;

	  var FileUploadRequest =
	  /** @class */
	  function () {
	    function FileUploadRequest(host, headers, parameters, file, payload) {
	      this.host = host;
	      this.headers = headers;
	      this.parameters = parameters;
	      this.file = file;
	      this.payload = payload;
	    }

	    return FileUploadRequest;
	  }();

	  exports["default"] = FileUploadRequest;
	})(FileUploadRequest);

	var AbstractOSSRequestBuilder = {};

	(function (exports) {

	  exports.__esModule = true;

	  var AbstractOSSRequestBuilder =
	  /** @class */
	  function () {
	    function AbstractOSSRequestBuilder() {}

	    AbstractOSSRequestBuilder.prototype.build = function (token, file, messageType) {};

	    AbstractOSSRequestBuilder.prototype.newFileName = function (token) {
	      return token && token.newFilename || '';
	    };

	    return AbstractOSSRequestBuilder;
	  }();

	  exports["default"] = AbstractOSSRequestBuilder;
	})(AbstractOSSRequestBuilder);

	var MessageType = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.MessageType = void 0;

	  (function (MessageType) {
	    MessageType["TEXT"] = "text";
	    MessageType["IMAGE"] = "image";
	    MessageType["FILE"] = "file";
	    MessageType["VIDEO"] = "video";
	    MessageType["AUDIO"] = "audio";
	  })(exports.MessageType || (exports.MessageType = {}));
	})(MessageType);

	var __extends$g = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	AliyunOSSRequestBuilder.__esModule = true;
	AliyunOSSRequestBuilder.aliYunOSSRequestBuilder = AliyunOSSRequestBuilder.AliYunOSSRequestBuilder = void 0;
	var FileUploadRequest_1$1 = FileUploadRequest;
	var AbstractOSSRequestBuilder_1$1 = AbstractOSSRequestBuilder;
	var MessageType_1$3 = MessageType;

	var AliYunOSSRequestBuilder =
	/** @class */
	function (_super) {
	  __extends$g(AliYunOSSRequestBuilder, _super);

	  function AliYunOSSRequestBuilder() {
	    return _super.call(this) || this;
	  }

	  AliYunOSSRequestBuilder.prototype.url = function (token) {
	    return token.host + '/' + token.dir + '/' + this.newFileName(token);
	  };

	  AliYunOSSRequestBuilder.prototype.build = function (token, file, messageType) {
	    var parameters;
	    parameters = {
	      key: token.dir + "/" + this.newFileName(token),
	      'OSSAccessKeyId': token.accessKeyId,
	      'policy': token.policy,
	      'signature': token.signature,
	      success_action_status: '200',
	      fileRes: file
	    };

	    if (MessageType_1$3.MessageType.FILE === messageType) {
	      parameters = {
	        key: token.dir + "/" + this.newFileName(token),
	        'OSSAccessKeyId': token.accessKeyId,
	        'policy': token.policy,
	        'signature': token.signature,
	        success_action_status: '200',
	        'Content-Disposition': 'attachment;filename=' + file.name,
	        fileRes: file
	      };
	    }

	    var payload = {
	      newFileName: this.newFileName(token),
	      url: this.url(token)
	    };
	    return new FileUploadRequest_1$1["default"](token.host, null, parameters, file, payload);
	  };

	  return AliYunOSSRequestBuilder;
	}(AbstractOSSRequestBuilder_1$1["default"]);

	AliyunOSSRequestBuilder.AliYunOSSRequestBuilder = AliYunOSSRequestBuilder;
	var aliYunOSSRequestBuilder = new AliYunOSSRequestBuilder();
	AliyunOSSRequestBuilder.aliYunOSSRequestBuilder = aliYunOSSRequestBuilder;

	var QiNiuYunOSSRequestBuilder$1 = {};

	var __extends$f = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	QiNiuYunOSSRequestBuilder$1.__esModule = true;
	QiNiuYunOSSRequestBuilder$1.qiNiuYunOSSRequestBuilder = void 0;
	var AbstractOSSRequestBuilder_1 = AbstractOSSRequestBuilder;
	var FileUploadRequest_1 = FileUploadRequest;

	var QiNiuYunOSSRequestBuilder =
	/** @class */
	function (_super) {
	  __extends$f(QiNiuYunOSSRequestBuilder, _super);

	  function QiNiuYunOSSRequestBuilder() {
	    return _super.call(this) || this;
	  }

	  QiNiuYunOSSRequestBuilder.prototype.url = function (token) {
	    return token.downloadUrl;
	  };

	  QiNiuYunOSSRequestBuilder.prototype.build = function (token, file) {
	    var parameters = {
	      key: this.newFileName(token),
	      token: token.token,
	      file: file
	    };
	    var payload = {
	      newFileName: this.newFileName(token),
	      url: this.url(token)
	    };
	    return new FileUploadRequest_1["default"](token.host, null, parameters, file, payload);
	  };

	  return QiNiuYunOSSRequestBuilder;
	}(AbstractOSSRequestBuilder_1["default"]);

	var qiNiuYunOSSRequestBuilder = new QiNiuYunOSSRequestBuilder();
	QiNiuYunOSSRequestBuilder$1.qiNiuYunOSSRequestBuilder = qiNiuYunOSSRequestBuilder;

	OSSRequestFactory$1.__esModule = true;
	OSSRequestFactory$1.OSSRequestFactory = void 0;
	var OssType_1 = OssType;
	var AliyunOSSRequestBuilder_1 = AliyunOSSRequestBuilder;
	var QiNiuYunOSSRequestBuilder_1 = QiNiuYunOSSRequestBuilder$1;

	var OSSRequestFactory =
	/** @class */
	function () {
	  function OSSRequestFactory(type) {
	    if (type === OssType_1.OssType.aliYun) {
	      return AliyunOSSRequestBuilder_1.aliYunOSSRequestBuilder;
	    } else {
	      return QiNiuYunOSSRequestBuilder_1.qiNiuYunOSSRequestBuilder;
	    }
	  }

	  OSSRequestFactory.prototype.build = function (token, file, messageType) {};

	  return OSSRequestFactory;
	}();

	OSSRequestFactory$1.OSSRequestFactory = OSSRequestFactory;

	var UploadTokenResolver = {};

	(function (exports) {

	  exports.__esModule = true;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var g_1 = g;

	  var UploadTokenResolver =
	  /** @class */
	  function () {
	    function UploadTokenResolver() {}

	    UploadTokenResolver.prototype.resolve = function (name) {
	      return new Promise(function (resolve, reject) {
	        var rocket = new Rocket_1["default"]({
	          name: 'uploadToken',
	          params: {
	            filename: name
	          },
	          permission: Permission_1.Permission.WRITE,
	          singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	          totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	          fail: function fail(e) {
	            reject(e);
	          },
	          success: function success(result) {
	            if (result.code === 200) {
	              resolve(result);
	            } else {
	              reject(result);
	            }
	          }
	        });
	        g_1.G.s().emit(rocket);
	      });
	    };

	    return UploadTokenResolver;
	  }();

	  exports["default"] = UploadTokenResolver;
	})(UploadTokenResolver);

	(function (exports) {

	  exports.__esModule = true;
	  var OSSRequestFactory_1 = OSSRequestFactory$1;
	  var UploadTokenResolver_1 = UploadTokenResolver;

	  var RequestBuilder =
	  /** @class */
	  function () {
	    function RequestBuilder() {
	      this.uploadTokenResolver = new UploadTokenResolver_1["default"]();
	    }

	    RequestBuilder.prototype.build = function (file, name, messageType) {
	      var _this = this;

	      return new Promise(function (resolve, reject) {
	        _this.uploadTokenResolver.resolve(name).then(function (result) {
	          var token = result.content;
	          resolve(new OSSRequestFactory_1.OSSRequestFactory(token.vendor).build(token, file, messageType));
	        })["catch"](function (e) {
	          reject(e);
	        });
	      });
	    };

	    return RequestBuilder;
	  }();

	  exports["default"] = RequestBuilder;
	})(RequestBuilder);

	GoEasyUploader$1.__esModule = true;
	GoEasyUploader$1.GoEasyUploader = void 0;
	var FileUploader_1 = FileUploader$1;
	var RequestBuilder_1 = RequestBuilder;

	var GoEasyUploader =
	/** @class */
	function () {
	  function GoEasyUploader() {
	    this.requestBuilder = new RequestBuilder_1["default"]();
	    this.fileUploader = FileUploader_1.fileUploader;
	  }

	  GoEasyUploader.prototype.upload = function (file, name, onProgress, messageType) {
	    var _this = this;

	    return new Promise(function (resolve, reject) {
	      var promise = _this.requestBuilder.build(file, name, messageType);

	      promise.then(function (uploadRequest) {
	        resolve(_this.doUpload(uploadRequest, onProgress));
	      })["catch"](function (e) {
	        reject(e);
	      });
	    });
	  };

	  GoEasyUploader.prototype.customizeUpload = function (uploadRequest, onProgress) {
	    this.doUpload(uploadRequest, onProgress);
	  };

	  GoEasyUploader.prototype.doUpload = function (uploadRequest, onProgress) {
	    return this.fileUploader.upload(uploadRequest, onProgress);
	  };

	  return GoEasyUploader;
	}();

	GoEasyUploader$1.GoEasyUploader = GoEasyUploader;

	var IMMessageSender = {};

	var PayloadImprover$1 = {};

	var FileMessagePayloadImprover$1 = {};

	var AbstractPayloadImprover$1 = {};

	AbstractPayloadImprover$1.__esModule = true;
	AbstractPayloadImprover$1.AbstractPayloadImprover = void 0;

	var AbstractPayloadImprover =
	/** @class */
	function () {
	  function AbstractPayloadImprover() {}

	  return AbstractPayloadImprover;
	}();

	AbstractPayloadImprover$1.AbstractPayloadImprover = AbstractPayloadImprover;

	var __extends$e = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	FileMessagePayloadImprover$1.__esModule = true;
	FileMessagePayloadImprover$1.FileMessagePayloadImprover = void 0;
	var AbstractPayloadImprover_1 = AbstractPayloadImprover$1;
	var GoEasyUploader_1$1 = GoEasyUploader$1;
	var MessageType_1$2 = MessageType;

	var FileMessagePayloadImprover =
	/** @class */
	function (_super) {
	  __extends$e(FileMessagePayloadImprover, _super);

	  function FileMessagePayloadImprover() {
	    var _this = _super !== null && _super.apply(this, arguments) || this;

	    _this.goEasyUploader = new GoEasyUploader_1$1.GoEasyUploader();
	    return _this;
	  }

	  FileMessagePayloadImprover.prototype.improve = function (options) {
	    var _this = this;

	    var message = options.message;
	    return new Promise(function (resolve, reject) {
	      var name;
	      var payload;
	      var buildOptions = message.buildOptions;
	      var createOptions = buildOptions.createOptions;

	      if (message.type === MessageType_1$2.MessageType.VIDEO) {
	        payload = message.payload;
	        name = payload.video.name;
	      } else {
	        payload = message.payload;
	        name = payload.name;
	      }

	      var uploadPromise = _this.goEasyUploader.upload(createOptions.file, name, createOptions.onProgress, message.type);

	      uploadPromise.then(function (uploadResponse) {
	        _this.setPayload(uploadResponse, message);

	        resolve();
	      })["catch"](function (e) {
	        reject(e);
	      });
	    });
	  };

	  FileMessagePayloadImprover.prototype.setPayload = function (uploadResponse, message) {
	    var _a = uploadResponse.content,
	        content = _a === void 0 ? {} : _a;
	    var payload = message.payload;
	    payload.url = content.url;
	  };

	  return FileMessagePayloadImprover;
	}(AbstractPayloadImprover_1.AbstractPayloadImprover);

	FileMessagePayloadImprover$1.FileMessagePayloadImprover = FileMessagePayloadImprover;

	var VideoMessagePayloadImprover$1 = {};

	var __extends$d = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	VideoMessagePayloadImprover$1.__esModule = true;
	VideoMessagePayloadImprover$1.VideoMessagePayloadImprover = void 0;
	var FileMessagePayloadImprover_1$1 = FileMessagePayloadImprover$1;

	var VideoMessagePayloadImprover =
	/** @class */
	function (_super) {
	  __extends$d(VideoMessagePayloadImprover, _super);

	  function VideoMessagePayloadImprover() {
	    return _super !== null && _super.apply(this, arguments) || this;
	  }

	  VideoMessagePayloadImprover.prototype.setPayload = function (uploadResponse, message) {
	    uploadResponse.content;
	    var payload = message.payload;
	    var rule = '?x-oss-process=video/snapshot,t_0000,f_jpg,w_' + payload.video.width + ',m_fast,ar_auto';
	    payload.video.url = uploadResponse.content.url;
	    payload.thumbnail.url = uploadResponse.content.url + rule;
	    payload.video.name = uploadResponse.content.newFileName;
	  };

	  return VideoMessagePayloadImprover;
	}(FileMessagePayloadImprover_1$1.FileMessagePayloadImprover);

	VideoMessagePayloadImprover$1.VideoMessagePayloadImprover = VideoMessagePayloadImprover;

	PayloadImprover$1.__esModule = true;
	PayloadImprover$1.PayloadImprover = void 0;
	var FileMessagePayloadImprover_1 = FileMessagePayloadImprover$1;
	var VideoMessagePayloadImprover_1 = VideoMessagePayloadImprover$1;
	var MessageType_1$1 = MessageType;

	var PayloadImprover =
	/** @class */
	function () {
	  function PayloadImprover() {
	    var _a;

	    this.improvers = (_a = {}, _a[MessageType_1$1.MessageType.FILE] = new FileMessagePayloadImprover_1.FileMessagePayloadImprover(), _a[MessageType_1$1.MessageType.AUDIO] = new FileMessagePayloadImprover_1.FileMessagePayloadImprover(), _a[MessageType_1$1.MessageType.IMAGE] = new FileMessagePayloadImprover_1.FileMessagePayloadImprover(), _a[MessageType_1$1.MessageType.VIDEO] = new VideoMessagePayloadImprover_1.VideoMessagePayloadImprover(), _a);
	  }

	  PayloadImprover.prototype.improve = function (options) {
	    var payloadImprover = this.improvers[options.message.type];

	    if (payloadImprover) {
	      return payloadImprover.improve(options);
	    }

	    return Promise.resolve();
	  };

	  return PayloadImprover;
	}();

	PayloadImprover$1.PayloadImprover = PayloadImprover;

	var BulletMessage = {};

	(function (exports) {

	  exports.__esModule = true;
	  var MessageType_1 = MessageType;
	  var GoEasy_1 = GoEasy$1;

	  var BulletMessage =
	  /** @class */
	  function () {
	    function BulletMessage(message, to, notification, wx_mp_template_msg, accessToken) {
	      this.validate(message);
	      this.mt = message.type;
	      this.to = to.id.toString();
	      this.d = JSON.stringify(to.data);
	      this.p = JSON.stringify(message.payload);

	      if (notification) {
	        this.nt = notification;
	      }

	      if (accessToken) {
	        this.at = accessToken;
	      }

	      if (wx_mp_template_msg) {
	        // @ts-ignore /todo：暂时先这样
	        wx_mp_template_msg.data = JSON.stringify(wx_mp_template_msg.data);
	        this.wx_mp_template_msg = wx_mp_template_msg;
	      }

	      var scene = to.type;
	      this.t = scene;

	      if (scene === GoEasy_1.Scene.CS) {
	        var csMessage = message;
	        this.tid = csMessage.teamId;
	      }

	      this.guid = message.messageId;
	    }

	    BulletMessage.prototype.validate = function (message) {
	      if (message.type === MessageType_1.MessageType.TEXT) {
	        var len = JSON.stringify(message.payload).length;

	        if (len > 3 * 1024) {
	          throw Error('message-length limit 3kb');
	        }
	      }
	    };

	    return BulletMessage;
	  }();

	  exports["default"] = BulletMessage;
	})(BulletMessage);

	var goeasyEventCenter = {};

	var EmitterEventDriver$1 = {};

	EmitterEventDriver$1.__esModule = true;
	EmitterEventDriver$1.EmitterEventDriver = void 0;
	var Emitter = componentEmitter.exports;

	var EmitterEventDriver =
	/** @class */
	function () {
	  function EmitterEventDriver() {
	    this.emitter = new Emitter();
	  }

	  EmitterEventDriver.prototype.on = function (name, callback) {
	    this.emitter.on(name, callback);
	    return this;
	  };

	  EmitterEventDriver.prototype.once = function (name, callback) {
	    this.emitter.once(name, callback);
	    return this;
	  };

	  EmitterEventDriver.prototype.off = function (name, callback) {
	    this.emitter.off(name, callback);
	    return this;
	  };

	  EmitterEventDriver.prototype.fire = function (name, data) {
	    this.emitter.emit(name, data);
	    return this;
	  };

	  return EmitterEventDriver;
	}();

	EmitterEventDriver$1.EmitterEventDriver = EmitterEventDriver;

	goeasyEventCenter.__esModule = true;
	goeasyEventCenter.GoEasyEventCenter = void 0;
	var EmitterEventDriver_1 = EmitterEventDriver$1;

	var GoEasyEventCenter =
	/** @class */
	function () {
	  function GoEasyEventCenter() {}

	  GoEasyEventCenter.initial = function () {
	    this.eventDriver = new EmitterEventDriver_1.EmitterEventDriver();
	  };

	  GoEasyEventCenter.on = function (eventname, callback) {
	    this.eventDriver.on(eventname, callback);
	  };

	  GoEasyEventCenter.once = function (eventname, callback) {
	    this.eventDriver.once(eventname, callback);
	  };

	  GoEasyEventCenter.fire = function (eventname, data) {
	    this.eventDriver.fire(eventname, data);
	  };

	  return GoEasyEventCenter;
	}();

	goeasyEventCenter.GoEasyEventCenter = GoEasyEventCenter;

	var internalEvents = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.IM_INTERNAL_EVENTS = void 0;

	  (function (IM_INTERNAL_EVENTS) {
	    IM_INTERNAL_EVENTS["MESSAGE_SENDING"] = "IM_INTERNAL_MESSAGE_SENDING";
	    IM_INTERNAL_EVENTS["MESSAGE_SEND_SUCCESS"] = "IM_INTERNAL_MESSAGE_SEND_SUCCESS";
	    IM_INTERNAL_EVENTS["MESSAGE_SEND_FAILED"] = "IM_INTERNAL_MESSAGE_SEND_FAILED";
	    IM_INTERNAL_EVENTS["MESSAGE_RECEIVED"] = "IM_INTERNAL_MESSAGE_RECEIVED";
	    IM_INTERNAL_EVENTS["MAX_MESSAGE_CHANGED"] = "IM_INTERNAL_MAX_MESSAGE_CHANGED";
	    IM_INTERNAL_EVENTS["UNREAD_AMOUNT_CHANGED"] = "IM_INTERNAL_UNREAD_MESSAGE_CHANGED";
	    IM_INTERNAL_EVENTS["CS_ONLINE_SUCCESS"] = "CS_ONLINE_SUCCESS";
	    IM_INTERNAL_EVENTS["CS_OFFLINE_SUCCESS"] = "CS_OFFLINE_SUCCESS";
	    IM_INTERNAL_EVENTS["CS_ACCEPTED"] = "CS_ACCEPTED";
	    IM_INTERNAL_EVENTS["CS_ENDED"] = "CS_ENDED";
	    IM_INTERNAL_EVENTS["CS_TRANSFER"] = "CS_TRANSFER";
	  })(exports.IM_INTERNAL_EVENTS || (exports.IM_INTERNAL_EVENTS = {}));
	})(internalEvents);

	var AbstractMessage$1 = {};

	AbstractMessage$1.__esModule = true;
	AbstractMessage$1.AbstractMessage = void 0;
	var g_1$b = g;

	var AbstractMessage =
	/** @class */
	function () {
	  function AbstractMessage() {}

	  AbstractMessage.prototype.clearUseLessAttribute = function () {
	    delete this.buildOptions;
	  };

	  AbstractMessage.prototype.isOtherSent = function () {
	    return this.senderId !== g_1$b.G.u();
	  };

	  AbstractMessage.prototype.getToData = function () {
	    var buildOptions = this.buildOptions;
	    var createOptions = buildOptions.createOptions;
	    return createOptions.to.data;
	  };

	  return AbstractMessage;
	}();

	AbstractMessage$1.AbstractMessage = AbstractMessage;

	(function (exports) {

	  exports.__esModule = true;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var PayloadImprover_1 = PayloadImprover$1;
	  var BulletMessage_1 = BulletMessage;
	  var goeasy_event_center_1 = goeasyEventCenter;
	  var internal_events_1 = internalEvents;
	  var GoEasy_1 = GoEasy$1;
	  var AbstractMessage_1 = AbstractMessage$1;
	  var RocketTypes_1 = RocketTypes;
	  var g_1 = g;
	  var callback_utils_1 = callbackUtils;

	  var IMMessageSender =
	  /** @class */
	  function () {
	    function IMMessageSender() {
	      this.payloadImprover = new PayloadImprover_1.PayloadImprover();
	    }

	    IMMessageSender.prototype.send = function (sendOptions) {
	      var _this = this;

	      this.validate(sendOptions);
	      var message = sendOptions.message;
	      var accessToken = sendOptions.accessToken;
	      var buildOptions = message.buildOptions;
	      var createOptions = buildOptions.createOptions;
	      var notification = createOptions.notification;
	      var wx_mp_template_msg = createOptions.wx_mp_template_msg;
	      var to = createOptions.to;

	      if (!to.data) {
	        to.data = {};
	      }

	      message.status = GoEasy_1.MessageStatus.SENDING;
	      var buildPromise = buildOptions.complete;
	      var improvePromise = this.payloadImprover.improve(sendOptions);
	      Promise.all([buildPromise, improvePromise]).then(function () {
	        _this.doSend(message, to, notification, wx_mp_template_msg, accessToken, sendOptions);
	      })["catch"](function (error) {
	        message.status = GoEasy_1.MessageStatus.FAIL;
	        callback_utils_1.CallbackUtils.onFailed(sendOptions, {
	          code: error.code || 400,
	          content: error.content || error
	        });
	      });
	    };

	    IMMessageSender.prototype.doSend = function (message, to, notification, wx_mp_template_msg, accessToken, options) {
	      var bulletMessage = new BulletMessage_1["default"](message, to, notification, wx_mp_template_msg, accessToken);
	      goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MESSAGE_SENDING, message);
	      var rocket = new Rocket_1["default"]({
	        name: RocketTypes_1.RocketTypes.publishIM,
	        params: bulletMessage,
	        unique: true,
	        permission: Permission_1.Permission.WRITE,
	        singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	        totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	        fail: function fail(error) {
	          message.status = GoEasy_1.MessageStatus.FAIL;
	          goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MESSAGE_SEND_FAILED, message);
	          callback_utils_1.CallbackUtils.onFailed(options, {
	            code: error.resultCode,
	            content: error.content
	          });
	        },
	        success: function success(result) {
	          message.status = GoEasy_1.MessageStatus.SUCCESS;
	          message.timestamp = result.content.timestamp;

	          if (message.scene() === GoEasy_1.Scene.CS) {
	            var csMessage = message;

	            if (csMessage.customerId() !== g_1.G.u()) {
	              csMessage.sessionId = result.content.sessionId;
	            }
	          }

	          message.clearUseLessAttribute();
	          goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MESSAGE_SEND_SUCCESS, message);
	          callback_utils_1.CallbackUtils.onSuccess(options, message);
	        }
	      });
	      g_1.G.s().emit(rocket);
	    };

	    IMMessageSender.prototype.validate = function (options) {
	      var message = options.message;

	      if (!(message instanceof AbstractMessage_1.AbstractMessage)) {
	        throw new Error("it is invalid message");
	      }

	      if (message.status !== GoEasy_1.MessageStatus.NEW) {
	        throw new Error("Please create a new message, a message can only be sent once");
	      }
	    };

	    return IMMessageSender;
	  }();

	  exports["default"] = IMMessageSender;
	})(IMMessageSender);

	var conversationList = {};

	var Conversations$1 = {};

	var Conversation$1 = {};

	var histories = {};

	var History = {};

	var MessageCache = {};

	var sortedInserter = {};

	sortedInserter.__esModule = true;
	sortedInserter.SortedInserter = void 0;

	var SortedInserter =
	/** @class */
	function () {
	  function SortedInserter() {}

	  SortedInserter.prototype.insert = function (array, t) {
	    var index = this.binarySearch(array, t);

	    if (index >= 0) {
	      // 覆盖
	      array.splice(index, 1, t);
	    } else {
	      // 插入
	      var newIndex = -index - 1;
	      array.splice(newIndex, 0, t);
	    }
	  };
	  /**
	   * 相等就覆盖
	   * 大于0往后查询
	   * 小于0往前查询
	   */


	  SortedInserter.prototype.binarySearch = function (array, t) {
	    var m = 0;
	    var n = array.length - 1;

	    while (m <= n) {
	      var k = n + m >> 1;
	      var cmp = this.compare(t, array[k]);

	      if (cmp > 0) {
	        // 往后查询
	        m = k + 1;
	      } else if (cmp < 0) {
	        // 往前查询
	        n = k - 1;
	      } else {
	        return k;
	      }
	    }

	    return -m - 1;
	  };

	  return SortedInserter;
	}();

	sortedInserter.SortedInserter = SortedInserter;

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var GoEasy_1 = GoEasy$1;
	  var Calibrator_1 = Calibrator;
	  var sorted_inserter_1 = sortedInserter;

	  var MessageCache =
	  /** @class */
	  function () {
	    function MessageCache(target) {
	      this.messages = new Array();
	      this.allLoaded = false; //是否已加载服务端的所有消息，如果已全部加载，就不要再向服务端发送请求

	      this.target = target;
	    }

	    MessageCache.prototype.all = function () {
	      return this.messages;
	    };

	    MessageCache.prototype.sliceOverLengthMessages = function () {
	      //确保不超过最大消息，防止内存溢出，尤其是发送消息
	      if (this.messages.length > MessageCache.CACHE_MAX_LENGTH) {
	        this.messages = this.messages.slice(-MessageCache.CACHE_MAX_LENGTH);

	        if (this.allLoaded === true) {
	          this.allLoaded = false;
	        }
	      }
	    };

	    MessageCache.prototype.getMaxMessage = function () {
	      return this.messages[this.messages.length - 1];
	    };

	    MessageCache.prototype.loadLocalMessages = function (limit, lastTimestamp) {
	      var localMessages = [];
	      var totalSize = this.messages.length;

	      if (lastTimestamp) {
	        if (totalSize > 0) {
	          var minTimestamp = this.messages[0].timestamp;
	          var maxTimestamp = this.messages[totalSize - 1].timestamp; // 大于等于最小，小于等于最大

	          var between = lastTimestamp >= minTimestamp && lastTimestamp <= maxTimestamp;

	          if (between) {
	            for (var i = totalSize - 1; i >= 0; i--) {
	              var message = this.messages[i];

	              if (message.timestamp < lastTimestamp) {
	                if (localMessages.length < limit) {
	                  localMessages.unshift(message);
	                } else {
	                  break;
	                }
	              }
	            }
	          }
	        }
	      } else {
	        localMessages = this.messages.slice(-limit);
	      }

	      return localMessages;
	    };
	    /**
	     * 缓存条件：
	     *  1.request.lastTimestamp为空
	     *  2.本地的第一条消息的时间等于传入的request.lastTimestamp
	     * 如果本地已经有消息，但是request.lastTimestamp不等于第一条消息，就丢掉
	     */


	    MessageCache.prototype.cacheServerMessages = function (request, serverMessages) {
	      var firstMessage = this.messages[0];
	      var totalSize = this.messages.length;

	      if (this.messages.length < MessageCache.CACHE_MAX_LENGTH && (!request.lastTimestamp || totalSize > 0 && firstMessage.timestamp === request.lastTimestamp)) {
	        this.messages = serverMessages.concat(this.messages);

	        if (serverMessages.length < request.limit) {
	          this.allLoaded = true;
	        }
	      }
	    };

	    MessageCache.prototype.findMessageByTime = function (time) {
	      return this.messages.find(function (message) {
	        return time === message.timestamp;
	      });
	    };

	    MessageCache.prototype.findMessagesByTimes = function (times) {
	      var _this = this;

	      var messages = [];
	      times.forEach(function (time) {
	        var message = _this.findMessageByTime(time);

	        if (Calibrator_1["default"].isDef(message)) {
	          messages.push(message);
	        }
	      });
	      return messages;
	    };

	    MessageCache.prototype.existsMessage = function (messageId) {
	      return this.findMessageIndexById(messageId) > -1;
	    };

	    MessageCache.prototype.findMessageIndexById = function (messageId) {
	      return this.messages.findIndex(function (message) {
	        return messageId === message.messageId;
	      });
	    };

	    MessageCache.prototype.deleteMessage = function (messageId) {
	      var index = this.findMessageIndexById(messageId); //服务端按照指令成功删除最关键，本地与服务端不一致，可以忽略

	      if (index >= 0) {
	        this.messages.splice(index, 1);
	      }
	    };

	    MessageCache.prototype.recallMessages = function (messages) {
	      var _this = this;

	      messages.forEach(function (message) {
	        var localMessage = _this.findMessageByTime(message.timestamp);

	        if (Calibrator_1["default"].isDef(localMessage)) {
	          localMessage.recalled = true;
	        }

	        message.recalled = true;
	      });
	    };

	    MessageCache.prototype.isEmpty = function () {
	      return this.messages.length === 0;
	    };

	    MessageCache.prototype.deleteMessages = function (messages) {
	      var _this = this;

	      messages.forEach(function (message) {
	        _this.deleteMessage(message.messageId);
	      });
	    };

	    MessageCache.prototype.saveMessage = function (message) {
	      MessageCache.sortedInserter.insert(this.messages, message);
	      this.sliceOverLengthMessages();
	    };

	    MessageCache.prototype.maxSuccessMessageTime = function () {
	      for (var i = this.messages.length - 1; i >= 0; i--) {
	        if (this.messages[i].status === GoEasy_1.MessageStatus.SUCCESS) {
	          return this.messages[i].timestamp;
	        }
	      }

	      return 0;
	    };

	    MessageCache.prototype.minTime = function () {
	      if (this.isEmpty()) {
	        return 0;
	      }

	      return this.messages[0].timestamp;
	    };

	    MessageCache.prototype.correctPosition = function (message) {
	      this.deleteMessage(message.messageId);
	      this.saveMessage(message);
	    };

	    MessageCache.CACHE_MAX_LENGTH = 200;
	    MessageCache.sortedInserter = new (
	    /** @class */
	    function (_super) {
	      __extends(class_1, _super);

	      function class_1() {
	        return _super !== null && _super.apply(this, arguments) || this;
	      }

	      class_1.prototype.compare = function (a, b) {
	        var c = a.timestamp - b.timestamp;
	        return c > 0 ? 1 : c === 0 ? 0 : -1;
	      };

	      return class_1;
	    }(sorted_inserter_1.SortedInserter))();
	    return MessageCache;
	  }();

	  exports["default"] = MessageCache;
	})(MessageCache);

	var MessageDeleter = {};

	var DeleteMessageRequest$1 = {};

	var Target$1 = {};

	Target$1.__esModule = true;
	Target$1.Target = void 0;
	var GoEasy_1$c = GoEasy$1;
	var Calibrator_1$a = Calibrator;
	var g_1$a = g;
	/**
	 * target.id不同的场景表达不同的含义:
	 *  cs场景：customer端id为teamId，staff端id为customerId
	 *  private: id为friendId
	 *  group：id为groupId
	 * 注意：cs中才有teamId
	 */

	var Target =
	/** @class */
	function () {
	  function Target(scene, id, teamId) {
	    this.scene = scene;
	    this.id = id;

	    if (Calibrator_1$a["default"].isDef(teamId)) {
	      this.teamId = teamId;
	    }
	  }

	  Target.prototype.toString = function () {
	    if (GoEasy_1$c.Scene.PRIVATE === this.scene || GoEasy_1$c.Scene.GROUP === this.scene) {
	      return this.scene + "#" + this.id;
	    }

	    return this.scene + "#" + this.id + "#" + this.teamId;
	  };

	  Target.prototype.customerId = function () {
	    if (GoEasy_1$c.Scene.CS === this.scene) {
	      if (this.id === this.teamId) {
	        return g_1$a.G.u();
	      } else {
	        return this.id;
	      }
	    }
	  };

	  Target.byScene = function (scene, targetId, teamId) {
	    return new Target(scene, targetId, teamId);
	  };

	  Target.byIMMessage = function (message) {
	    var teamId;
	    var id;
	    var scene = message.scene();

	    if (scene === GoEasy_1$c.Scene.PRIVATE) {
	      var senderId = message.senderId;
	      var receiverId = message.targetId();
	      id = g_1$a.G.u() === senderId ? receiverId : senderId;
	    } else if (scene === GoEasy_1$c.Scene.GROUP) {
	      id = message.targetId();
	    } else if (scene === GoEasy_1$c.Scene.CS) {
	      id = message.targetId();
	      var csMessage = message;
	      teamId = csMessage.teamId;
	    } else {
	      throw {
	        code: 400,
	        content: "scene ".concat(scene, " not exists")
	      };
	    }

	    return new Target(scene, id, teamId);
	  };

	  Target.byMessageReadRemoteEvent = function (event) {
	    var scene = event.scene;
	    var receiverId = event.targetId;
	    var markerId = event.markerId;
	    var teamId = event.teamId;
	    var targetId;

	    if (scene === GoEasy_1$c.Scene.PRIVATE) {
	      targetId = g_1$a.G.u() === markerId ? receiverId : markerId;
	    } else if (scene === GoEasy_1$c.Scene.GROUP) {
	      targetId = receiverId;
	    } else if (scene === GoEasy_1$c.Scene.CS) {
	      if (receiverId === teamId) {
	        // customer mark
	        if (markerId === g_1$a.G.u()) {
	          targetId = teamId;
	        } else {
	          targetId = markerId;
	        }
	      } else {
	        // staff mark
	        if (markerId === g_1$a.G.u()) {
	          targetId = receiverId;
	        } else {
	          targetId = teamId;
	        }
	      }
	    }

	    return new Target(scene, targetId, teamId);
	  };

	  Target.byIMMessageDeletedEvent = function (event) {
	    var scene = event.scene;
	    var deleterId = event.deleterId;

	    if (scene === GoEasy_1$c.Scene.PRIVATE) {
	      var targetId = g_1$a.G.u() === deleterId ? event.targetId : deleterId;
	      return new Target(scene, targetId);
	    } else if (scene === GoEasy_1$c.Scene.GROUP) {
	      return new Target(scene, event.targetId);
	    }
	  };

	  Target.byConversationDTO = function (conversationDto) {
	    var lastMessage = conversationDto.lastMessage;
	    return this.byIMMessage(lastMessage);
	  };

	  Target.byRemoteRecallEvent = function (event) {
	    var targetId;

	    if (event.scene === GoEasy_1$c.Scene.PRIVATE) {
	      var ids = event.conversationId.split(":", 2);
	      targetId = ids[0] === g_1$a.G.u() ? ids[1] : ids[0];
	    } else {
	      targetId = event.conversationId;
	    }

	    return new Target(event.scene, targetId);
	  };

	  return Target;
	}();

	Target$1.Target = Target;

	DeleteMessageRequest$1.__esModule = true;
	DeleteMessageRequest$1.DeleteMessageRequest = void 0;
	var GoEasy_1$b = GoEasy$1;
	var Target_1$3 = Target$1;

	var DeleteMessageRequest =
	/** @class */
	function () {
	  function DeleteMessageRequest(messages) {
	    var _this = this;

	    this.times = new Array();
	    var message = messages[0];
	    var target = Target_1$3.Target.byIMMessage(message);
	    this.scene = target.scene;
	    this.targetId = target.id;
	    messages.forEach(function (message) {
	      if (message.status === GoEasy_1$b.MessageStatus.SUCCESS) {
	        //未成功的消息，不要发到服务端
	        _this.times.push(message.timestamp);
	      }
	    }); // 升序排列

	    this.times.sort(function (x, y) {
	      return x < y ? -1 : x == y ? 0 : 1;
	    });
	  }

	  return DeleteMessageRequest;
	}();

	DeleteMessageRequest$1.DeleteMessageRequest = DeleteMessageRequest;

	(function (exports) {

	  exports.__esModule = true;
	  var GoEasy_1 = GoEasy$1;
	  var DeleteMessageRequest_1 = DeleteMessageRequest$1;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var RocketTypes_1 = RocketTypes;
	  var g_1 = g;

	  var MessageDeleter =
	  /** @class */
	  function () {
	    function MessageDeleter() {}

	    MessageDeleter.deleteServerMessages = function (messages) {
	      var request = new DeleteMessageRequest_1.DeleteMessageRequest(messages);

	      if (request.times.length < 0) {
	        return Promise.resolve();
	      }

	      return new Promise(function (resolve, reject) {
	        var rocket = new Rocket_1["default"]({
	          name: RocketTypes_1.RocketTypes.IM_DELETE_MESSAGE,
	          params: request,
	          permission: Permission_1.Permission.WRITE,
	          singleTimeout: SocketTimeout_1.SocketTimeout.commonQuerySingle,
	          totalTimeout: SocketTimeout_1.SocketTimeout.commonQueryTotal,
	          success: function success(res) {
	            if (res.code === 200) {
	              resolve(res);
	            } else {
	              reject(res);
	            }
	          },
	          fail: function fail(err) {
	            reject(err);
	          }
	        });
	        g_1.G.s().emit(rocket);
	      });
	    };

	    MessageDeleter.validate = function (options) {
	      var messages = options.messages;

	      for (var i = 0; i < messages.length; i++) {
	        var message = messages[i];

	        if (message.status === GoEasy_1.MessageStatus.SENDING) {
	          throw {
	            code: 400,
	            content: "message[" + i + "] is '" + message.status + "' and cannot be deleted"
	          };
	        }
	      }
	    };

	    return MessageDeleter;
	  }();

	  exports["default"] = MessageDeleter;
	})(MessageDeleter);

	var MessageRecaller = {};

	var RecallMessageRequest$1 = {};

	RecallMessageRequest$1.__esModule = true;
	RecallMessageRequest$1.RecallMessageRequest = void 0;
	var Target_1$2 = Target$1;

	var RecallMessageRequest =
	/** @class */
	function () {
	  function RecallMessageRequest(messages) {
	    var _this = this;

	    this.times = new Array();
	    var message = messages[0];
	    var target = Target_1$2.Target.byIMMessage(message);
	    this.scene = target.scene;
	    this.targetId = target.id;
	    messages.forEach(function (message) {
	      _this.times.push(message.timestamp);
	    }); // 升序排列

	    this.times.sort(function (x, y) {
	      return x < y ? -1 : x == y ? 0 : 1;
	    });
	  }

	  return RecallMessageRequest;
	}();

	RecallMessageRequest$1.RecallMessageRequest = RecallMessageRequest;

	(function (exports) {

	  exports.__esModule = true;
	  var GoEasy_1 = GoEasy$1;
	  var RecallMessageRequest_1 = RecallMessageRequest$1;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var RocketTypes_1 = RocketTypes;
	  var g_1 = g;
	  /**
	   * todo MessageRecaller名称并不专业需要优化
	   */

	  var MessageRecaller =
	  /** @class */
	  function () {
	    function MessageRecaller() {}

	    MessageRecaller.recallServerMessages = function (messages) {
	      var request = new RecallMessageRequest_1.RecallMessageRequest(messages);

	      if (request.times.length === 0) {
	        return Promise.resolve();
	      }

	      return new Promise(function (resolve, reject) {
	        var rocket = new Rocket_1["default"]({
	          name: RocketTypes_1.RocketTypes.IM_RECALL_MESSAGE,
	          params: request,
	          permission: Permission_1.Permission.WRITE,
	          singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	          totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	          fail: function fail(err) {
	            reject(err);
	          },
	          success: function success(res) {
	            if (res.code === 200) {
	              resolve(res);
	            } else {
	              reject(res);
	            }
	          }
	        });
	        g_1.G.s().emit(rocket);
	      });
	    };
	    /**
	     * 同一种会话的消息才能撤回，以传入的第一条消息作为会话标准
	     * @param options
	     */


	    MessageRecaller.validate = function (options) {
	      var messages = options.messages;

	      for (var i = 0; i < messages.length; i++) {
	        var message = messages[i];

	        if (message.status !== GoEasy_1.MessageStatus.SUCCESS) {
	          throw {
	            code: 400,
	            content: "message[" + i + "] is '" + message.status + "' and cannot be recalled"
	          };
	        }

	        if (message.recalled) {
	          throw {
	            code: 400,
	            content: "message[" + i + "] has been recalled"
	          };
	        }

	        if (message.senderId !== g_1.G.u()) {
	          throw {
	            code: 400,
	            content: "it is not allowed to recall messages sent by others"
	          };
	        }
	      }
	    };

	    return MessageRecaller;
	  }();

	  exports["default"] = MessageRecaller;
	})(MessageRecaller);

	var remoteHistory = {};

	var HistoryChangeQueryRequest = {};

	(function (exports) {

	  exports.__esModule = true;

	  var HistoryChangeQueryRequest =
	  /** @class */
	  function () {
	    function HistoryChangeQueryRequest(scene, id, after, min, teamId) {
	      this.scene = scene;
	      this.id = id;
	      this.after = after;
	      this.min = min;
	      this.teamId = teamId;
	    }

	    return HistoryChangeQueryRequest;
	  }();

	  exports["default"] = HistoryChangeQueryRequest;
	})(HistoryChangeQueryRequest);

	var ReadMessageMarkRequest$1 = {};

	ReadMessageMarkRequest$1.__esModule = true;
	ReadMessageMarkRequest$1.ReadMessageMarkRequest = void 0;

	var ReadMessageMarkRequest =
	/** @class */
	function () {
	  function ReadMessageMarkRequest(id, scene, lastTimestamp, teamId) {
	    this.id = id;
	    this.scene = scene;
	    this.lastTimestamp = lastTimestamp;
	    this.teamId = teamId;
	  }

	  return ReadMessageMarkRequest;
	}();

	ReadMessageMarkRequest$1.ReadMessageMarkRequest = ReadMessageMarkRequest;

	var remoteAbbrMessageBuilder = {};

	var PrivateMessage$1 = {};

	var __extends$c = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	PrivateMessage$1.__esModule = true;
	PrivateMessage$1.PrivateMessage = void 0;
	var AbstractMessage_1$2 = AbstractMessage$1;
	var GoEasy_1$a = GoEasy$1;

	var PrivateMessage =
	/** @class */
	function (_super) {
	  __extends$c(PrivateMessage, _super);

	  function PrivateMessage() {
	    var _this = _super !== null && _super.apply(this, arguments) || this;

	    _this.read = false;
	    return _this;
	  }

	  PrivateMessage.prototype.scene = function () {
	    return GoEasy_1$a.Scene.PRIVATE;
	  };

	  PrivateMessage.prototype.targetId = function () {
	    return this.receiverId;
	  };

	  return PrivateMessage;
	}(AbstractMessage_1$2.AbstractMessage);

	PrivateMessage$1.PrivateMessage = PrivateMessage;

	var GroupMessage$1 = {};

	var __extends$b = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	GroupMessage$1.__esModule = true;
	GroupMessage$1.GroupMessage = void 0;
	var AbstractMessage_1$1 = AbstractMessage$1;
	var GoEasy_1$9 = GoEasy$1;

	var GroupMessage =
	/** @class */
	function (_super) {
	  __extends$b(GroupMessage, _super);

	  function GroupMessage() {
	    return _super !== null && _super.apply(this, arguments) || this;
	  } // readAmount: number;
	  // readUsers: Array<string>;


	  GroupMessage.prototype.scene = function () {
	    return GoEasy_1$9.Scene.GROUP;
	  };

	  GroupMessage.prototype.targetId = function () {
	    return this.groupId;
	  };

	  return GroupMessage;
	}(AbstractMessage_1$1.AbstractMessage);

	GroupMessage$1.GroupMessage = GroupMessage;

	var csMessage = {};

	var __extends$a = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	csMessage.__esModule = true;
	csMessage.CSMessage = void 0;
	var AbstractMessage_1 = AbstractMessage$1;
	var GoEasy_1$8 = GoEasy$1;
	var g_1$9 = g;

	var CSMessage =
	/** @class */
	function (_super) {
	  __extends$a(CSMessage, _super);

	  function CSMessage() {
	    var _this = _super !== null && _super.apply(this, arguments) || this;

	    _this.accepted = false;
	    return _this;
	  }

	  CSMessage.prototype.scene = function () {
	    return GoEasy_1$8.Scene.CS;
	  };
	  /**
	   * 当前用户是customer，返回teamId
	   * 当前用户是staff，返回customerId
	   */


	  CSMessage.prototype.targetId = function () {
	    if (g_1$9.G.u() === this.customerId()) {
	      return this.teamId;
	    } else {
	      return this.customerId();
	    }
	  };

	  CSMessage.prototype.sendByCustomer = function () {
	    return this.to === this.teamId;
	  };

	  CSMessage.prototype.customerId = function () {
	    if (this.sendByCustomer()) {
	      return this.senderId;
	    } else {
	      return this.to;
	    }
	  }; //如果我是customer，这个发送方只要不是我，就是other
	  //如果我是staff，这个发送方是customer，就是other


	  CSMessage.prototype.isOtherSent = function () {
	    if (g_1$9.G.u() === this.customerId()) {
	      return this.senderId !== g_1$9.G.u();
	    } else {
	      return this.senderId === this.customerId();
	    }
	  };

	  return CSMessage;
	}(AbstractMessage_1.AbstractMessage);

	csMessage.CSMessage = CSMessage;

	var csMessageType = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.CSMessageType = void 0;

	  (function (CSMessageType) {
	    CSMessageType["ACCEPT"] = "CS_ACCEPT";
	    CSMessageType["END"] = "CS_END";
	    CSMessageType["TRANSFER"] = "CS_TRANSFER";
	  })(exports.CSMessageType || (exports.CSMessageType = {}));
	})(csMessageType);

	remoteAbbrMessageBuilder.__esModule = true;
	remoteAbbrMessageBuilder.RemoteAbbrMessageBuilder = void 0;
	var GoEasy_1$7 = GoEasy$1;
	var PrivateMessage_1$1 = PrivateMessage$1;
	var GroupMessage_1$1 = GroupMessage$1;
	var cs_message_1$1 = csMessage;
	var Calibrator_1$9 = Calibrator;
	var g_1$8 = g;
	var cs_message_type_1$2 = csMessageType;

	var RemoteAbbrMessageBuilder =
	/** @class */
	function () {
	  function RemoteAbbrMessageBuilder() {}

	  RemoteAbbrMessageBuilder.prototype.build = function (remoteAbbrMessage) {
	    var message;
	    var scene = remoteAbbrMessage.t;

	    if (scene === GoEasy_1$7.Scene.PRIVATE) {
	      message = new PrivateMessage_1$1.PrivateMessage();
	      message.read = false;
	      message.receiverId = remoteAbbrMessage.r;
	    } else if (scene === GoEasy_1$7.Scene.GROUP) {
	      message = new GroupMessage_1$1.GroupMessage();
	      message.groupId = remoteAbbrMessage.r;
	      message.senderData = remoteAbbrMessage.d ? JSON.parse(remoteAbbrMessage.d) : {};
	    } else if (scene === GoEasy_1$7.Scene.CS) {
	      message = new cs_message_1$1.CSMessage();
	      message.to = remoteAbbrMessage.r;
	      message.teamId = remoteAbbrMessage.tid;
	      message.senderData = remoteAbbrMessage.d ? JSON.parse(remoteAbbrMessage.d) : {};
	      message.accepted = remoteAbbrMessage.accepted;

	      if (message.customerId() !== g_1$8.G.u()) {
	        message.sessionId = remoteAbbrMessage.sessionId;
	      }
	    }

	    message.senderId = remoteAbbrMessage.s;
	    message.messageId = remoteAbbrMessage.i;
	    message.timestamp = remoteAbbrMessage.ts;
	    message.type = remoteAbbrMessage.mt;
	    var payload = remoteAbbrMessage.p;

	    if (Calibrator_1$9["default"].isDef(payload)) {
	      if (scene === GoEasy_1$7.Scene.CS && message.type === cs_message_type_1$2.CSMessageType.TRANSFER) {
	        var jsonPayload = JSON.parse(payload);
	        jsonPayload.transferTo.data = JSON.parse(jsonPayload.transferTo.data);
	        message.payload = jsonPayload;
	      } else {
	        message.payload = JSON.parse(payload);
	      }
	    }

	    message.recalled = remoteAbbrMessage.rc;
	    message.status = GoEasy_1$7.MessageStatus.SUCCESS;
	    return message;
	  };

	  return RemoteAbbrMessageBuilder;
	}();

	remoteAbbrMessageBuilder.RemoteAbbrMessageBuilder = RemoteAbbrMessageBuilder;

	var __awaiter$4 = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	  function adopt(value) {
	    return value instanceof P ? value : new P(function (resolve) {
	      resolve(value);
	    });
	  }

	  return new (P || (P = Promise))(function (resolve, reject) {
	    function fulfilled(value) {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function rejected(value) {
	      try {
	        step(generator["throw"](value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function step(result) {
	      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	    }

	    step((generator = generator.apply(thisArg, _arguments || [])).next());
	  });
	};

	var __generator$4 = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	  var _ = {
	    label: 0,
	    sent: function sent() {
	      if (t[0] & 1) throw t[1];
	      return t[1];
	    },
	    trys: [],
	    ops: []
	  },
	      f,
	      y,
	      t,
	      g;
	  return g = {
	    next: verb(0),
	    "throw": verb(1),
	    "return": verb(2)
	  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	    return this;
	  }), g;

	  function verb(n) {
	    return function (v) {
	      return step([n, v]);
	    };
	  }

	  function step(op) {
	    if (f) throw new TypeError("Generator is already executing.");

	    while (_) {
	      try {
	        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	        if (y = 0, t) op = [op[0] & 2, t.value];

	        switch (op[0]) {
	          case 0:
	          case 1:
	            t = op;
	            break;

	          case 4:
	            _.label++;
	            return {
	              value: op[1],
	              done: false
	            };

	          case 5:
	            _.label++;
	            y = op[1];
	            op = [0];
	            continue;

	          case 7:
	            op = _.ops.pop();

	            _.trys.pop();

	            continue;

	          default:
	            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	              _ = 0;
	              continue;
	            }

	            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	              _.label = op[1];
	              break;
	            }

	            if (op[0] === 6 && _.label < t[1]) {
	              _.label = t[1];
	              t = op;
	              break;
	            }

	            if (t && _.label < t[2]) {
	              _.label = t[2];

	              _.ops.push(op);

	              break;
	            }

	            if (t[2]) _.ops.pop();

	            _.trys.pop();

	            continue;
	        }

	        op = body.call(thisArg, _);
	      } catch (e) {
	        op = [6, e];
	        y = 0;
	      } finally {
	        f = t = 0;
	      }
	    }

	    if (op[0] & 5) throw op[1];
	    return {
	      value: op[0] ? op[1] : void 0,
	      done: true
	    };
	  }
	};

	remoteHistory.__esModule = true;
	remoteHistory.RemoteHistory = void 0;
	var GoEasy_1$6 = GoEasy$1;
	var HistoryChangeQueryRequest_1 = HistoryChangeQueryRequest;
	var Rocket_1$2 = Rocket;
	var RocketTypes_1$4 = RocketTypes;
	var Permission_1$2 = Permission;
	var SocketTimeout_1$2 = SocketTimeout;
	var g_1$7 = g;
	var ReadMessageMarkRequest_1 = ReadMessageMarkRequest$1;
	var remote_abbr_message_builder_1$2 = remoteAbbrMessageBuilder;

	var RemoteHistory =
	/** @class */
	function () {
	  function RemoteHistory() {
	    this.builder = new remote_abbr_message_builder_1$2.RemoteAbbrMessageBuilder();
	  }

	  RemoteHistory.prototype.sync = function (scene, targetId, after, min, teamId) {
	    var request = new HistoryChangeQueryRequest_1["default"](scene, targetId, after, min, teamId);
	    return new Promise(function (resolve, reject) {
	      var rocket = new Rocket_1$2["default"]({
	        name: RocketTypes_1$4.RocketTypes.IM_HISTORY_CHANGE,
	        params: request,
	        permission: Permission_1$2.Permission.READ,
	        singleTimeout: SocketTimeout_1$2.SocketTimeout.commonQuerySingle,
	        totalTimeout: SocketTimeout_1$2.SocketTimeout.commonQueryTotal,
	        fail: function fail(err) {
	          reject(err);
	        },
	        success: function success(res) {
	          var content = res.content;
	          resolve(content);
	        }
	      });
	      g_1$7.G.s().emit(rocket);
	    });
	  };

	  RemoteHistory.prototype.loadServerMessages = function (target, request) {
	    var _this = this;

	    return new Promise(function (resolve, reject) {
	      var rocket = new Rocket_1$2["default"]({
	        name: RocketTypes_1$4.RocketTypes.IM_HISTORY,
	        params: request,
	        permission: Permission_1$2.Permission.READ,
	        singleTimeout: SocketTimeout_1$2.SocketTimeout.commonQuerySingle,
	        totalTimeout: SocketTimeout_1$2.SocketTimeout.commonQueryTotal,
	        fail: function fail(err) {
	          reject(err);
	        },
	        success: function success(res) {
	          var content = res.content;
	          content.messages = _this.convertServerMessages(target, content.messages);
	          resolve(content);
	        }
	      });
	      g_1$7.G.s().emit(rocket);
	    });
	  };

	  RemoteHistory.prototype.convertServerMessages = function (target, serverMessages) {
	    var _this = this;

	    var messages = [];
	    var scene = target.scene;
	    var targetId = target.id;
	    serverMessages.forEach(function (remoteAbbrMessage) {
	      remoteAbbrMessage.t = scene;

	      if (GoEasy_1$6.Scene.PRIVATE === scene) {
	        remoteAbbrMessage.r = remoteAbbrMessage.s === g_1$7.G.u() ? targetId : g_1$7.G.u();
	      } else if (GoEasy_1$6.Scene.GROUP === scene) {
	        remoteAbbrMessage.r = targetId;
	      } else if (GoEasy_1$6.Scene.CS === scene) {
	        var customerId = target.customerId();
	        var teamId = target.teamId;

	        if (customerId === g_1$7.G.u()) {
	          remoteAbbrMessage.r = teamId;
	        } else {
	          remoteAbbrMessage.r = customerId;
	        }
	      }

	      var message = _this.builder.build(remoteAbbrMessage);

	      messages.push(message);
	    });
	    return messages;
	  };

	  RemoteHistory.prototype.updateServerOffsets = function (markTime, target) {
	    return __awaiter$4(this, void 0, void 0, function () {
	      var request;
	      return __generator$4(this, function (_a) {
	        request = new ReadMessageMarkRequest_1.ReadMessageMarkRequest(target.id, target.scene, markTime, target.teamId);
	        return [2
	        /*return*/
	        , new Promise(function (resolve, reject) {
	          var rocket = new Rocket_1$2["default"]({
	            name: RocketTypes_1$4.RocketTypes.MARK_AS_READ,
	            params: request,
	            permission: Permission_1$2.Permission.WRITE,
	            singleTimeout: SocketTimeout_1$2.SocketTimeout.commonRequestSingle,
	            totalTimeout: SocketTimeout_1$2.SocketTimeout.commonRequestTotal,
	            success: function success(res) {
	              resolve(res);
	            },
	            fail: function fail(err) {
	              reject(err);
	            }
	          });
	          g_1$7.G.s().emit(rocket);
	        })];
	      });
	    });
	  };

	  RemoteHistory.instance = new RemoteHistory();
	  return RemoteHistory;
	}();

	remoteHistory.RemoteHistory = RemoteHistory;

	var UserOffsets$1 = {};

	UserOffsets$1.__esModule = true;
	UserOffsets$1.UserOffsets = void 0;
	var Calibrator_1$8 = Calibrator;
	var g_1$6 = g;

	var UserOffsets =
	/** @class */
	function () {
	  function UserOffsets() {
	    this.offsetMap = new Map(); // 对于私聊保存的是userId与friendId的userOffset,群聊则是保存群所有人的userOffSet

	    this.markingTime = 0; // 用于mark异步请求(是否多次mark)

	    this.userId = g_1$6.G.u();
	  }

	  UserOffsets.prototype.updateOffset = function (userId, offset) {
	    var oldOffset = this.offsetMap.get(userId);

	    if (Calibrator_1$8["default"].isDef(oldOffset)) {
	      if (offset > oldOffset) {
	        this.offsetMap.set(userId, offset);
	        return true;
	      }
	    } else {
	      this.offsetMap.set(userId, offset);
	      return true;
	    }

	    return false;
	  };

	  UserOffsets.prototype.updateUserOffsets = function (userOffsets) {
	    var _this = this;

	    userOffsets.forEach(function (userOffset) {
	      var userId = userOffset.userId;
	      var offset = userOffset.offset;

	      _this.updateOffset(userId, offset);
	    });
	  };

	  UserOffsets.prototype.updateMyOffset = function (offset) {
	    return this.updateOffset(this.userId, offset);
	  };

	  UserOffsets.prototype.myOffset = function () {
	    return this.getOffset(this.userId);
	  };

	  UserOffsets.prototype.getOffset = function (userId) {
	    var offset = this.offsetMap.get(userId);

	    if (offset) {
	      return offset;
	    }

	    return 0;
	  };

	  return UserOffsets;
	}();

	UserOffsets$1.UserOffsets = UserOffsets;

	var HistoryQueryRequest = {};

	(function (exports) {

	  exports.__esModule = true;

	  var HistoryQueryRequest =
	  /** @class */
	  function () {
	    function HistoryQueryRequest(id, scene, lastTimestamp, limit, teamId) {
	      this.id = id;
	      this.scene = scene;
	      this.lastTimestamp = lastTimestamp;
	      this.limit = limit;
	      this.teamId = teamId;
	    }

	    return HistoryQueryRequest;
	  }();

	  exports["default"] = HistoryQueryRequest;
	})(HistoryQueryRequest);

	var unreadamountMaxmessageChangeDetector = {};

	unreadamountMaxmessageChangeDetector.__esModule = true;
	unreadamountMaxmessageChangeDetector.UnreadAmountMaxMessageChangeDetector = void 0;
	var goeasy_event_center_1$4 = goeasyEventCenter;
	var internal_events_1$4 = internalEvents;

	var UnreadAmountMaxMessageChangeDetector =
	/** @class */
	function () {
	  function UnreadAmountMaxMessageChangeDetector(history) {
	    this.history = history;
	  }

	  UnreadAmountMaxMessageChangeDetector.prototype.pre = function () {
	    this.oldLastMessage = this.history.getMaxMessage();
	    this.oldUnreadAmount = this.history.unreadAmount();

	    if (this.oldLastMessage) {
	      this.oldLastMessageRecalled = this.oldLastMessage.recalled;
	      this.oldLastMessageRead = this.oldLastMessage.read;
	      this.oldLastMessageStatus = this.oldLastMessage.status;
	    }
	  };
	  /**
	   * 1.自己发送消息
	   *  a.sending
	   *  b.发送成功后触发
	   *      1.mark对方->read变化,unreadAmount变化
	   *  c.failed
	   * 2.接收对方的消息
	   *  a.对方mark自己
	   *      1.自己消息的read变化,unreadAmount变化
	   * 3.接收自己多端的消息
	   *  a.mark对方->read变化,unreadAmount变化
	   * 4.对方mark
	   *  a.自己消息的read变化,unreadAmount变化
	   * 5.多端mark
	   *  a.mark对方->read变化,unreadAmount变化
	   * 6.delete
	   * 7.recall
	   */


	  UnreadAmountMaxMessageChangeDetector.prototype.post = function () {
	    var newUnreadAmount = this.history.unreadAmount();
	    var newLastMessage = this.history.getMaxMessage();
	    var newLastMessageRead;
	    var newLastMessageRecalled;
	    var newLastMessageStatus; // lastMessage 为空的情况：只查询了conversation缓存了lastMessage，多端删除,同步删除的消息后,本地不再有消息缓存

	    if (newLastMessage) {
	      newLastMessageStatus = newLastMessage.status;
	      newLastMessageRead = newLastMessage.read;
	      newLastMessageRecalled = newLastMessage.recalled;
	    }

	    if (this.oldLastMessage !== newLastMessage || this.oldLastMessageRead !== newLastMessageRead || this.oldLastMessageRecalled !== newLastMessageRecalled || this.oldLastMessageStatus !== newLastMessageStatus) {
	      goeasy_event_center_1$4.GoEasyEventCenter.fire(internal_events_1$4.IM_INTERNAL_EVENTS.MAX_MESSAGE_CHANGED, newLastMessage);
	    } else if (this.oldUnreadAmount !== newUnreadAmount) {
	      goeasy_event_center_1$4.GoEasyEventCenter.fire(internal_events_1$4.IM_INTERNAL_EVENTS.UNREAD_AMOUNT_CHANGED, this.history.target);
	    }
	  };

	  return UnreadAmountMaxMessageChangeDetector;
	}();

	unreadamountMaxmessageChangeDetector.UnreadAmountMaxMessageChangeDetector = UnreadAmountMaxMessageChangeDetector;

	(function (exports) {

	  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	    function adopt(value) {
	      return value instanceof P ? value : new P(function (resolve) {
	        resolve(value);
	      });
	    }

	    return new (P || (P = Promise))(function (resolve, reject) {
	      function fulfilled(value) {
	        try {
	          step(generator.next(value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function rejected(value) {
	        try {
	          step(generator["throw"](value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function step(result) {
	        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	      }

	      step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	  };

	  var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	    var _ = {
	      label: 0,
	      sent: function sent() {
	        if (t[0] & 1) throw t[1];
	        return t[1];
	      },
	      trys: [],
	      ops: []
	    },
	        f,
	        y,
	        t,
	        g;
	    return g = {
	      next: verb(0),
	      "throw": verb(1),
	      "return": verb(2)
	    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	      return this;
	    }), g;

	    function verb(n) {
	      return function (v) {
	        return step([n, v]);
	      };
	    }

	    function step(op) {
	      if (f) throw new TypeError("Generator is already executing.");

	      while (_) {
	        try {
	          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	          if (y = 0, t) op = [op[0] & 2, t.value];

	          switch (op[0]) {
	            case 0:
	            case 1:
	              t = op;
	              break;

	            case 4:
	              _.label++;
	              return {
	                value: op[1],
	                done: false
	              };

	            case 5:
	              _.label++;
	              y = op[1];
	              op = [0];
	              continue;

	            case 7:
	              op = _.ops.pop();

	              _.trys.pop();

	              continue;

	            default:
	              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	                _ = 0;
	                continue;
	              }

	              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	                _.label = op[1];
	                break;
	              }

	              if (op[0] === 6 && _.label < t[1]) {
	                _.label = t[1];
	                t = op;
	                break;
	              }

	              if (t && _.label < t[2]) {
	                _.label = t[2];

	                _.ops.push(op);

	                break;
	              }

	              if (t[2]) _.ops.pop();

	              _.trys.pop();

	              continue;
	          }

	          op = body.call(thisArg, _);
	        } catch (e) {
	          op = [6, e];
	          y = 0;
	        } finally {
	          f = t = 0;
	        }
	      }

	      if (op[0] & 5) throw op[1];
	      return {
	        value: op[0] ? op[1] : void 0,
	        done: true
	      };
	    }
	  };

	  var __values = commonjsGlobal && commonjsGlobal.__values || function (o) {
	    var s = typeof Symbol === "function" && Symbol.iterator,
	        m = s && o[s],
	        i = 0;
	    if (m) return m.call(o);
	    if (o && typeof o.length === "number") return {
	      next: function next() {
	        if (o && i >= o.length) o = void 0;
	        return {
	          value: o && o[i++],
	          done: !o
	        };
	      }
	    };
	    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	  };

	  exports.__esModule = true;
	  var GoEasy_1 = GoEasy$1;
	  var callback_utils_1 = callbackUtils;
	  var im_api_events_1 = imApiEvents;
	  var MessageCache_1 = MessageCache;
	  var MessageDeleter_1 = MessageDeleter;
	  var MessageRecaller_1 = MessageRecaller;
	  var im_1 = im;
	  var g_1 = g;
	  var remote_history_1 = remoteHistory;
	  var UserOffsets_1 = UserOffsets$1;
	  var HistoryQueryRequest_1 = HistoryQueryRequest;
	  var Calibrator_1 = Calibrator;
	  var unreadamount_maxmessage_change_detector_1 = unreadamountMaxmessageChangeDetector;
	  var goeasy_event_center_1 = goeasyEventCenter;
	  var internal_events_1 = internalEvents;

	  var History =
	  /** @class */
	  function () {
	    function History(target) {
	      this.expiredTime = 0;
	      this.remoteHistory = remote_history_1.RemoteHistory.instance;
	      this.target = target;
	      this.userOffsets = new UserOffsets_1.UserOffsets();
	      this.messageCache = new MessageCache_1["default"](target);
	    }
	    /**
	     * @param message
	     * @param userOffsets
	     */


	    History.prototype.initMaxMessageAndOffsets = function (message, userOffsets) {
	      var _this = this;

	      if (!this.existsMessage(message)) {
	        this.messageCache.saveMessage(message);
	        userOffsets.forEach(function (userOffset) {
	          _this.markLocalMessagesRead(_this.messageCache.all(), userOffset.userId, userOffset.offset, false);
	        });
	      }
	    };

	    History.prototype.existsMessage = function (message) {
	      return this.messageCache.existsMessage(message.messageId);
	    };

	    History.prototype.loadHistory = function (lastTimestamp, limit) {
	      return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              if (!(this.expiredTime > 0 && !this.messageCache.isEmpty())) return [3
	              /*break*/
	              , 2];
	              return [4
	              /*yield*/
	              , this.updateByServerChange()];

	            case 1:
	              _a.sent();

	              _a.label = 2;

	            case 2:
	              if (Calibrator_1["default"].isUndef(limit)) {
	                limit = 10;
	              } else {
	                if (limit > 30) {
	                  limit = 30;
	                }
	              }

	              return [4
	              /*yield*/
	              , this.loadServerMessages(lastTimestamp, limit)];

	            case 3:
	              return [2
	              /*return*/
	              , _a.sent()];
	          }
	        });
	      });
	    };

	    History.prototype.loadServerMessages = function (lastTimestamp, limit) {
	      return __awaiter(this, void 0, void 0, function () {
	        var messages, newLimit, newLastTimestamp, request, content, serverMessages_1;

	        var _this = this;

	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              messages = this.messageCache.loadLocalMessages(limit, lastTimestamp);
	              if (!(this.messageCache.allLoaded === false && messages.length !== limit)) return [3
	              /*break*/
	              , 2];
	              newLimit = limit - messages.length;
	              newLastTimestamp = messages[0] ? messages[0].timestamp : lastTimestamp;
	              request = new HistoryQueryRequest_1["default"](this.target.id.toString(), this.target.scene, newLastTimestamp, newLimit, this.target.teamId);
	              return [4
	              /*yield*/
	              , this.remoteHistory.loadServerMessages(this.target, request)];

	            case 1:
	              content = _a.sent();
	              serverMessages_1 = content.messages;
	              messages = serverMessages_1.concat(messages);
	              this.messageCache.cacheServerMessages(request, serverMessages_1);
	              content.userOffsets.forEach(function (userOffset) {
	                _this.userOffsets.updateOffset(userOffset.userId, userOffset.offset);
	              });
	              this.userOffsets.offsetMap.forEach(function (offset, userId) {
	                _this.markLocalMessagesRead(serverMessages_1, userId, offset, false);
	              });
	              _a.label = 2;

	            case 2:
	              return [2
	              /*return*/
	              , messages];
	          }
	        });
	      });
	    };

	    History.prototype.deleteMessages = function (options) {
	      return __awaiter(this, void 0, void 0, function () {
	        var _this = this;

	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              return [4
	              /*yield*/
	              , this.aopUnreadAmountMaxMessage(function () {
	                return __awaiter(_this, void 0, void 0, function () {
	                  var messages;
	                  return __generator(this, function (_a) {
	                    switch (_a.label) {
	                      case 0:
	                        messages = options.messages;
	                        return [4
	                        /*yield*/
	                        , MessageDeleter_1["default"].deleteServerMessages(messages)];

	                      case 1:
	                        _a.sent();

	                        this.messageCache.deleteMessages(messages);
	                        callback_utils_1.CallbackUtils.onSuccess(options);
	                        return [2
	                        /*return*/
	                        ];
	                    }
	                  });
	                });
	              })];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    History.prototype.syncDeletedMessage = function (deleterId, times) {
	      var _this = this;

	      this.aopUnreadAmountMaxMessage(function () {
	        _this.doSyncDeletedMessage(deleterId, times);
	      });
	    };

	    History.prototype.doSyncDeletedMessage = function (deleterId, times) {
	      if (deleterId === g_1.G.u()) {
	        var messages = this.messageCache.findMessagesByTimes(times);
	        this.messageCache.deleteMessages(messages);

	        if (messages.length > 0) {
	          im_1.IM.aec.fire(im_api_events_1.ImApiEvents.MESSAGE_DELETED, messages);
	        }
	      }
	    };

	    History.prototype.recallMessage = function (options) {
	      return __awaiter(this, void 0, void 0, function () {
	        var _this = this;

	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              return [4
	              /*yield*/
	              , this.aopUnreadAmountMaxMessage(function () {
	                return __awaiter(_this, void 0, void 0, function () {
	                  var messages;
	                  return __generator(this, function (_a) {
	                    switch (_a.label) {
	                      case 0:
	                        messages = options.messages;
	                        return [4
	                        /*yield*/
	                        , MessageRecaller_1["default"].recallServerMessages(messages)];

	                      case 1:
	                        _a.sent();

	                        this.messageCache.recallMessages(messages);
	                        callback_utils_1.CallbackUtils.onSuccess(options);
	                        return [2
	                        /*return*/
	                        ];
	                    }
	                  });
	                });
	              })];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    History.prototype.syncRecalledMessage = function (times) {
	      var _this = this;

	      this.aopUnreadAmountMaxMessage(function () {
	        return __awaiter(_this, void 0, void 0, function () {
	          return __generator(this, function (_a) {
	            this.doSyncRecalledMessage(times);
	            return [2
	            /*return*/
	            ];
	          });
	        });
	      });
	    };

	    History.prototype.doSyncRecalledMessage = function (times) {
	      var messages = this.messageCache.findMessagesByTimes(times);

	      if (messages.length > 0) {
	        this.messageCache.recallMessages(messages);
	        im_1.IM.aec.fire(im_api_events_1.ImApiEvents.MESSAGE_RECALLED, messages);
	      }
	    };
	    /**
	     * 发消息成功  lastOffset=myOffset   = message[0].time
	     * mark   lastOffset=myOffset     >= message[0].time
	     * 收到消息  lastOffset= message[0].time
	     * 删除
	     * 撤回
	     */


	    History.prototype.expire = function () {
	      if (!this.messageCache.isEmpty()) {
	        this.expiredTime = this.messageCache.maxSuccessMessageTime();
	      }
	    };

	    History.prototype.updateByServerChange = function () {
	      return __awaiter(this, void 0, void 0, function () {
	        var _this = this;

	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              return [4
	              /*yield*/
	              , this.aopUnreadAmountMaxMessage(function () {
	                return __awaiter(_this, void 0, void 0, function () {
	                  var content, deletedMessageTimes, recalledTimes;

	                  var _this = this;

	                  return __generator(this, function (_a) {
	                    switch (_a.label) {
	                      case 0:
	                        return [4
	                        /*yield*/
	                        , this.remoteHistory.sync(this.target.scene, this.target.id, this.expiredTime, this.messageCache.minTime(), this.target.teamId)];

	                      case 1:
	                        content = _a.sent();
	                        content.userOffsets.forEach(function (userOffset) {
	                          _this.markLocalMessagesRead(_this.messageCache.all(), userOffset.userId, userOffset.offset, true);
	                        });
	                        deletedMessageTimes = content.deletedMessageTimes;

	                        if (deletedMessageTimes.length > 0) {
	                          this.doSyncDeletedMessage(g_1.G.u(), deletedMessageTimes);
	                        }

	                        recalledTimes = content.recalled;

	                        if (recalledTimes.length > 0) {
	                          this.doSyncRecalledMessage(recalledTimes);
	                        }

	                        this.expiredTime = 0;
	                        return [2
	                        /*return*/
	                        ];
	                    }
	                  });
	                });
	              })];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    History.prototype.markRead = function () {
	      return __awaiter(this, void 0, void 0, function () {
	        var _this = this;

	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              return [4
	              /*yield*/
	              , this.aopUnreadAmountMaxMessage(function () {
	                return __awaiter(_this, void 0, void 0, function () {
	                  var markTime, myOffset;
	                  return __generator(this, function (_a) {
	                    switch (_a.label) {
	                      case 0:
	                        markTime = this.messageCache.maxSuccessMessageTime();
	                        myOffset = this.userOffsets.myOffset();
	                        if (!(markTime > myOffset)) return [3
	                        /*break*/
	                        , 2];
	                        this.userOffsets.markingTime = markTime;
	                        return [4
	                        /*yield*/
	                        , this.remoteHistory.updateServerOffsets(markTime, this.target)];

	                      case 1:
	                        _a.sent();

	                        if (markTime === this.userOffsets.markingTime) {
	                          //在你异步操作服务器期间，没有其他新的操作给出新的markingTime
	                          this.markLocalMessagesRead(this.messageCache.all(), g_1.G.u(), markTime, true);
	                        }

	                        _a.label = 2;

	                      case 2:
	                        return [2
	                        /*return*/
	                        ];
	                    }
	                  });
	                });
	              })];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    History.prototype.syncMarkedMessage = function (event) {
	      var _this = this;

	      this.aopUnreadAmountMaxMessage(function () {
	        _this.markLocalMessagesRead(_this.messageCache.all(), event.markerId, event.time, true);
	      });
	    };

	    History.prototype.onMessageSending = function (message) {
	      var _this = this;

	      this.aopUnreadAmountMaxMessage(function () {
	        _this.messageCache.saveMessage(message);
	      });
	    };

	    History.prototype.onMessageSendSuccess = function (message) {
	      var _this = this;

	      this.aopUnreadAmountMaxMessage(function () {
	        _this.messageCache.correctPosition(message);

	        _this.markLocalMessagesRead(_this.messageCache.all(), g_1.G.u(), message.timestamp, true);
	      });
	    };

	    History.prototype.onMessageSendFailed = function (message) {
	      var maxMessage = this.getMaxMessage();

	      if (maxMessage === message) {
	        goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MAX_MESSAGE_CHANGED, message);
	      }
	    };

	    History.prototype.onMessageReceived = function (message) {
	      var _this = this;

	      this.aopUnreadAmountMaxMessage(function () {
	        _this.messageCache.saveMessage(message);

	        _this.markLocalMessagesRead(_this.messageCache.all(), message.senderId, message.timestamp, true);
	      });
	    };

	    History.prototype.aopUnreadAmountMaxMessage = function (functionObj, callbackOptions) {
	      return __awaiter(this, void 0, void 0, function () {
	        var decorator, err_1;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              _a.trys.push([0, 2,, 3]);

	              decorator = new unreadamount_maxmessage_change_detector_1.UnreadAmountMaxMessageChangeDetector(this);
	              decorator.pre();
	              return [4
	              /*yield*/
	              , functionObj()];

	            case 1:
	              _a.sent();

	              decorator.post();
	              return [3
	              /*break*/
	              , 3];

	            case 2:
	              err_1 = _a.sent();
	              callback_utils_1.CallbackUtils.onFailed(callbackOptions, err_1);
	              return [3
	              /*break*/
	              , 3];

	            case 3:
	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    History.prototype.markLocalMessagesRead = function (messages, markerId, offset, fireMessageReadEvent) {
	      this.userOffsets.updateOffset(markerId, offset);

	      if (this.isOtherUserId(markerId)) {
	        var markedMessages = this.markMySentRead(messages, offset);

	        if (fireMessageReadEvent && markedMessages.length > 0) {
	          im_1.IM.aec.fire(im_api_events_1.ImApiEvents.MESSAGE_READ, markedMessages);
	        }
	      } else if (markerId === g_1.G.u()) {
	        this.markOthersSentRead(messages, offset);
	      } else ;
	    };

	    History.prototype.markOthersSentRead = function (messages, markTime) {
	      if (this.target.scene === GoEasy_1.Scene.PRIVATE) {
	        for (var i = messages.length - 1; i >= 0; i--) {
	          var message = messages[i];

	          if (message.isOtherSent() && message.timestamp <= markTime) {
	            if (message.read) {
	              break;
	            } else {
	              message.read = true;
	            }
	          }
	        }
	      }
	    };

	    History.prototype.markMySentRead = function (messages, markTime) {
	      var markedMessages = new Array();

	      if (this.target.scene === GoEasy_1.Scene.PRIVATE) {
	        for (var i = messages.length - 1; i >= 0; i--) {
	          var message = messages[i];

	          if (!message.isOtherSent() && message.timestamp <= markTime && message.status === GoEasy_1.MessageStatus.SUCCESS) {
	            if (message.read) {
	              break;
	            } else {
	              message.read = true;
	              markedMessages.push(message);
	            }
	          }
	        }
	      }

	      return markedMessages;
	    };

	    History.prototype.isOtherUserId = function (userId) {
	      if (this.target.scene === GoEasy_1.Scene.CS) {
	        var customerId = this.target.customerId();

	        if (g_1.G.u() === customerId) {
	          return userId !== g_1.G.u();
	        } else {
	          return userId === customerId;
	        }
	      } else {
	        return userId !== g_1.G.u();
	      }
	    };

	    History.prototype.unreadAmount = function (accepted) {
	      var e_1, _a;

	      var unreadAmount = 0;
	      var myOffset = this.userOffsets.myOffset();
	      var messages = this.messageCache.all();

	      try {
	        for (var messages_1 = __values(messages), messages_1_1 = messages_1.next(); !messages_1_1.done; messages_1_1 = messages_1.next()) {
	          var message = messages_1_1.value;

	          if (message.isOtherSent() && message.recalled === false && message.timestamp > myOffset) {
	            unreadAmount += 1;
	          }
	        }
	      } catch (e_1_1) {
	        e_1 = {
	          error: e_1_1
	        };
	      } finally {
	        try {
	          if (messages_1_1 && !messages_1_1.done && (_a = messages_1["return"])) _a.call(messages_1);
	        } finally {
	          if (e_1) throw e_1.error;
	        }
	      }

	      return unreadAmount;
	    };

	    History.prototype.getMaxMessage = function (accepted) {
	      return this.messageCache.getMaxMessage();
	    };

	    History.prototype.maxTime = function (accepted) {
	      var lastMessage = this.getMaxMessage();

	      if (Calibrator_1["default"].isDef(lastMessage)) {
	        return lastMessage.timestamp;
	      }

	      return 0;
	    };

	    return History;
	  }();

	  exports["default"] = History;
	})(History);

	var staffHistory = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	    function adopt(value) {
	      return value instanceof P ? value : new P(function (resolve) {
	        resolve(value);
	      });
	    }

	    return new (P || (P = Promise))(function (resolve, reject) {
	      function fulfilled(value) {
	        try {
	          step(generator.next(value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function rejected(value) {
	        try {
	          step(generator["throw"](value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function step(result) {
	        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	      }

	      step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	  };

	  var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	    var _ = {
	      label: 0,
	      sent: function sent() {
	        if (t[0] & 1) throw t[1];
	        return t[1];
	      },
	      trys: [],
	      ops: []
	    },
	        f,
	        y,
	        t,
	        g;
	    return g = {
	      next: verb(0),
	      "throw": verb(1),
	      "return": verb(2)
	    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	      return this;
	    }), g;

	    function verb(n) {
	      return function (v) {
	        return step([n, v]);
	      };
	    }

	    function step(op) {
	      if (f) throw new TypeError("Generator is already executing.");

	      while (_) {
	        try {
	          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	          if (y = 0, t) op = [op[0] & 2, t.value];

	          switch (op[0]) {
	            case 0:
	            case 1:
	              t = op;
	              break;

	            case 4:
	              _.label++;
	              return {
	                value: op[1],
	                done: false
	              };

	            case 5:
	              _.label++;
	              y = op[1];
	              op = [0];
	              continue;

	            case 7:
	              op = _.ops.pop();

	              _.trys.pop();

	              continue;

	            default:
	              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	                _ = 0;
	                continue;
	              }

	              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	                _.label = op[1];
	                break;
	              }

	              if (op[0] === 6 && _.label < t[1]) {
	                _.label = t[1];
	                t = op;
	                break;
	              }

	              if (t && _.label < t[2]) {
	                _.label = t[2];

	                _.ops.push(op);

	                break;
	              }

	              if (t[2]) _.ops.pop();

	              _.trys.pop();

	              continue;
	          }

	          op = body.call(thisArg, _);
	        } catch (e) {
	          op = [6, e];
	          y = 0;
	        } finally {
	          f = t = 0;
	        }
	      }

	      if (op[0] & 5) throw op[1];
	      return {
	        value: op[0] ? op[1] : void 0,
	        done: true
	      };
	    }
	  };

	  exports.__esModule = true;
	  var HistoryQueryRequest_1 = HistoryQueryRequest;
	  var History_1 = History;
	  var callback_utils_1 = callbackUtils;
	  var Calibrator_1 = Calibrator;
	  var goeasy_event_center_1 = goeasyEventCenter;
	  var internal_events_1 = internalEvents;
	  var g_1 = g;
	  var cs_message_type_1 = csMessageType;

	  var StaffHistory =
	  /** @class */
	  function (_super) {
	    __extends(StaffHistory, _super);

	    function StaffHistory(target) {
	      var _this = _super.call(this, target) || this;

	      _this.unread = 0;
	      _this.markingAmount = 0;
	      return _this;
	    }

	    StaffHistory.prototype.loadHistory = function (lastTimestamp, limit) {
	      return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              if (Calibrator_1["default"].isUndef(limit)) {
	                limit = 10;
	              } else {
	                if (limit > 30) {
	                  limit = 30;
	                }
	              }

	              return [4
	              /*yield*/
	              , this.loadServerMessages(lastTimestamp, limit)];

	            case 1:
	              return [2
	              /*return*/
	              , _a.sent()];
	          }
	        });
	      });
	    };

	    StaffHistory.prototype.loadServerMessages = function (lastTimestamp, limit) {
	      return __awaiter(this, void 0, void 0, function () {
	        var request, content;

	        var _this = this;

	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              request = new HistoryQueryRequest_1["default"](this.target.id.toString(), this.target.scene, lastTimestamp, limit, this.target.teamId);
	              return [4
	              /*yield*/
	              , this.remoteHistory.loadServerMessages(this.target, request)];

	            case 1:
	              content = _a.sent();
	              content.userOffsets.forEach(function (userOffset) {
	                _this.userOffsets.updateOffset(userOffset.userId, userOffset.offset);
	              });
	              return [2
	              /*return*/
	              , content.messages];
	          }
	        });
	      });
	    };

	    StaffHistory.prototype.deleteMessages = function (options) {
	      return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	          callback_utils_1.CallbackUtils.onFailed(options, "Delete CS message is not supported yet");
	          return [2
	          /*return*/
	          ];
	        });
	      });
	    };

	    StaffHistory.prototype.recallMessage = function (options) {
	      return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	          callback_utils_1.CallbackUtils.onFailed(options, "Recall CS message is not supported yet");
	          return [2
	          /*return*/
	          ];
	        });
	      });
	    };

	    StaffHistory.prototype.initMaxMessageAndOffsets = function (message, userOffsets) {
	      var _this = this;

	      userOffsets.forEach(function (userOffset) {
	        _this.userOffsets.updateOffset(userOffset.userId, userOffset.offset);
	      });

	      if (Calibrator_1["default"].isUndef(this.acceptedMaxMessage) || this.acceptedMaxMessage.timestamp < message.timestamp) {
	        this.increaseUnreadAmount(message);
	      }

	      this.saveAcceptedMessage(message);
	    };

	    StaffHistory.prototype.initPendingMaxMessageAndOffsets = function (message, userOffsets) {
	      var _this = this;

	      userOffsets.forEach(function (userOffset) {
	        _this.userOffsets.updateOffset(userOffset.userId, userOffset.offset);
	      });
	      this.savePendingMessage(message);
	    };

	    StaffHistory.prototype.savePendingMessage = function (message) {
	      if (this.pendingMaxMessage) {
	        if (this.pendingMaxMessage.timestamp < message.timestamp) {
	          this.pendingMaxMessage = message;
	        }
	      } else {
	        this.pendingMaxMessage = message;
	      }
	    };

	    StaffHistory.prototype.saveAcceptedMessage = function (message) {
	      if (this.acceptedMaxMessage) {
	        if (this.acceptedMaxMessage.timestamp < message.timestamp) {
	          this.acceptedMaxMessage = message;
	        }
	      } else {
	        this.acceptedMaxMessage = message;
	      }
	    };

	    StaffHistory.prototype.onMessageSending = function (message) {
	      this.saveAcceptedMessage(message);
	      goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MAX_MESSAGE_CHANGED, message);
	    };

	    StaffHistory.prototype.onMessageSendSuccess = function (message) {
	      this.saveAcceptedMessage(message);
	      this.userOffsets.updateOffset(message.senderId, message.timestamp);

	      if (this.acceptedMaxMessage === message) {
	        goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MAX_MESSAGE_CHANGED, message);
	      }
	    };

	    StaffHistory.prototype.onMessageSendFailed = function (message) {
	      if (this.acceptedMaxMessage === message) {
	        goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MAX_MESSAGE_CHANGED, message);
	      }
	    };

	    StaffHistory.prototype.onMessageReceived = function (message) {
	      if (!message.accepted || message.senderId !== g_1.G.u() && message.type === cs_message_type_1.CSMessageType.ACCEPT) {
	        this.savePendingMessage(message);
	      } else {
	        this.saveAcceptedMessage(message);
	      }

	      this.userOffsets.updateOffset(message.senderId, message.timestamp);
	      this.increaseUnreadAmount(message);
	      goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MAX_MESSAGE_CHANGED, message);
	    };

	    StaffHistory.prototype.increaseUnreadAmount = function (message) {
	      if (message.sendByCustomer() || message.type === cs_message_type_1.CSMessageType.TRANSFER && message.senderId !== g_1.G.u()) {
	        var myOffset = this.userOffsets.myOffset();

	        if (myOffset < message.timestamp && message.accepted) {
	          this.unread += 1;
	        }
	      }
	    };

	    StaffHistory.prototype.markRead = function () {
	      return __awaiter(this, void 0, void 0, function () {
	        var markTime;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              markTime = this.maxAcceptedMessageTime();
	              if (!this.preMark(markTime)) return [3
	              /*break*/
	              , 2];
	              return [4
	              /*yield*/
	              , this.remoteHistory.updateServerOffsets(markTime, this.target)];

	            case 1:
	              _a.sent();

	              this.postMark(markTime);
	              _a.label = 2;

	            case 2:
	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    StaffHistory.prototype.preMark = function (markTime) {
	      var myOffset = this.userOffsets.myOffset(); //todo:如果mark时 最后一条消息如果是自己发送的，有可能导致mark了没反应，但应该不会经常出现，观察一下再看

	      if (markTime > this.userOffsets.markingTime && markTime > myOffset) {
	        this.userOffsets.markingTime = markTime;
	        this.markingAmount = this.unread;
	        return true;
	      }

	      return false;
	    };

	    StaffHistory.prototype.postMark = function (markTime) {
	      if (markTime === this.userOffsets.markingTime) {
	        //确定是同一个请求才处理
	        this.unread -= this.markingAmount;
	        this.markingAmount = 0;
	        this.userOffsets.updateOffset(g_1.G.u(), markTime);
	        goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.UNREAD_AMOUNT_CHANGED, this.target);
	      }
	    };

	    StaffHistory.prototype.syncMarkedMessage = function (event) {// todo 远程同步mark不处理 do nothing
	    };

	    StaffHistory.prototype.getMaxMessage = function (accepted) {
	      return accepted ? this.acceptedMaxMessage : this.pendingMaxMessage;
	    };

	    StaffHistory.prototype.unreadAmount = function (accepted) {
	      return accepted ? this.unread : 0;
	    };

	    StaffHistory.prototype.existsMessage = function (message) {
	      return this.acceptedMaxMessage && this.acceptedMaxMessage.messageId === message.messageId || this.pendingMaxMessage && this.pendingMaxMessage.messageId === message.messageId;
	    };

	    StaffHistory.prototype.maxAcceptedMessageTime = function () {
	      return this.acceptedMaxMessage ? this.acceptedMaxMessage.timestamp : 0;
	    };

	    StaffHistory.prototype.maxTime = function (accepted) {
	      var maxMessage = this.getMaxMessage(accepted);

	      if (maxMessage) {
	        return maxMessage.timestamp;
	      }

	      return 0;
	    };

	    return StaffHistory;
	  }(History_1["default"]);

	  exports["default"] = StaffHistory;
	})(staffHistory);

	var customerHistory = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	    function adopt(value) {
	      return value instanceof P ? value : new P(function (resolve) {
	        resolve(value);
	      });
	    }

	    return new (P || (P = Promise))(function (resolve, reject) {
	      function fulfilled(value) {
	        try {
	          step(generator.next(value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function rejected(value) {
	        try {
	          step(generator["throw"](value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function step(result) {
	        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	      }

	      step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	  };

	  var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	    var _ = {
	      label: 0,
	      sent: function sent() {
	        if (t[0] & 1) throw t[1];
	        return t[1];
	      },
	      trys: [],
	      ops: []
	    },
	        f,
	        y,
	        t,
	        g;
	    return g = {
	      next: verb(0),
	      "throw": verb(1),
	      "return": verb(2)
	    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	      return this;
	    }), g;

	    function verb(n) {
	      return function (v) {
	        return step([n, v]);
	      };
	    }

	    function step(op) {
	      if (f) throw new TypeError("Generator is already executing.");

	      while (_) {
	        try {
	          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	          if (y = 0, t) op = [op[0] & 2, t.value];

	          switch (op[0]) {
	            case 0:
	            case 1:
	              t = op;
	              break;

	            case 4:
	              _.label++;
	              return {
	                value: op[1],
	                done: false
	              };

	            case 5:
	              _.label++;
	              y = op[1];
	              op = [0];
	              continue;

	            case 7:
	              op = _.ops.pop();

	              _.trys.pop();

	              continue;

	            default:
	              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	                _ = 0;
	                continue;
	              }

	              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	                _.label = op[1];
	                break;
	              }

	              if (op[0] === 6 && _.label < t[1]) {
	                _.label = t[1];
	                t = op;
	                break;
	              }

	              if (t && _.label < t[2]) {
	                _.label = t[2];

	                _.ops.push(op);

	                break;
	              }

	              if (t[2]) _.ops.pop();

	              _.trys.pop();

	              continue;
	          }

	          op = body.call(thisArg, _);
	        } catch (e) {
	          op = [6, e];
	          y = 0;
	        } finally {
	          f = t = 0;
	        }
	      }

	      if (op[0] & 5) throw op[1];
	      return {
	        value: op[0] ? op[1] : void 0,
	        done: true
	      };
	    }
	  };

	  exports.__esModule = true;
	  var History_1 = History;
	  var callback_utils_1 = callbackUtils;

	  var CustomerHistory =
	  /** @class */
	  function (_super) {
	    __extends(CustomerHistory, _super);

	    function CustomerHistory(target) {
	      return _super.call(this, target) || this;
	    }

	    CustomerHistory.prototype.deleteMessages = function (options) {
	      return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	          callback_utils_1.CallbackUtils.onFailed(options, "Delete CS message is not supported yet");
	          return [2
	          /*return*/
	          ];
	        });
	      });
	    };

	    CustomerHistory.prototype.recallMessage = function (options) {
	      return __awaiter(this, void 0, void 0, function () {
	        return __generator(this, function (_a) {
	          callback_utils_1.CallbackUtils.onFailed(options, "Recall CS message is not supported yet");
	          return [2
	          /*return*/
	          ];
	        });
	      });
	    };

	    return CustomerHistory;
	  }(History_1["default"]);

	  exports["default"] = CustomerHistory;
	})(customerHistory);

	(function (exports) {

	  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	    function adopt(value) {
	      return value instanceof P ? value : new P(function (resolve) {
	        resolve(value);
	      });
	    }

	    return new (P || (P = Promise))(function (resolve, reject) {
	      function fulfilled(value) {
	        try {
	          step(generator.next(value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function rejected(value) {
	        try {
	          step(generator["throw"](value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function step(result) {
	        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	      }

	      step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	  };

	  var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	    var _ = {
	      label: 0,
	      sent: function sent() {
	        if (t[0] & 1) throw t[1];
	        return t[1];
	      },
	      trys: [],
	      ops: []
	    },
	        f,
	        y,
	        t,
	        g;
	    return g = {
	      next: verb(0),
	      "throw": verb(1),
	      "return": verb(2)
	    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	      return this;
	    }), g;

	    function verb(n) {
	      return function (v) {
	        return step([n, v]);
	      };
	    }

	    function step(op) {
	      if (f) throw new TypeError("Generator is already executing.");

	      while (_) {
	        try {
	          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	          if (y = 0, t) op = [op[0] & 2, t.value];

	          switch (op[0]) {
	            case 0:
	            case 1:
	              t = op;
	              break;

	            case 4:
	              _.label++;
	              return {
	                value: op[1],
	                done: false
	              };

	            case 5:
	              _.label++;
	              y = op[1];
	              op = [0];
	              continue;

	            case 7:
	              op = _.ops.pop();

	              _.trys.pop();

	              continue;

	            default:
	              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	                _ = 0;
	                continue;
	              }

	              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	                _.label = op[1];
	                break;
	              }

	              if (op[0] === 6 && _.label < t[1]) {
	                _.label = t[1];
	                t = op;
	                break;
	              }

	              if (t && _.label < t[2]) {
	                _.label = t[2];

	                _.ops.push(op);

	                break;
	              }

	              if (t[2]) _.ops.pop();

	              _.trys.pop();

	              continue;
	          }

	          op = body.call(thisArg, _);
	        } catch (e) {
	          op = [6, e];
	          y = 0;
	        } finally {
	          f = t = 0;
	        }
	      }

	      if (op[0] & 5) throw op[1];
	      return {
	        value: op[0] ? op[1] : void 0,
	        done: true
	      };
	    }
	  };

	  exports.__esModule = true;
	  var GoEasy_1 = GoEasy$1;
	  var Calibrator_1 = Calibrator;
	  var History_1 = History;
	  var Target_1 = Target$1;
	  var goeasy_event_center_1 = goeasyEventCenter;
	  var internal_events_1 = internalEvents;
	  var AbstractMessage_1 = AbstractMessage$1;
	  var MessageDeleter_1 = MessageDeleter;
	  var MessageRecaller_1 = MessageRecaller;
	  var RemoteEvents_1 = RemoteEvents;
	  var g_1 = g;
	  var callback_utils_1 = callbackUtils;
	  var staff_history_1 = staffHistory;
	  var customer_history_1 = customerHistory;

	  var Histories =
	  /** @class */
	  function () {
	    function Histories() {
	      this.map = new Map();
	    }

	    Histories.init = function () {
	      if (!Histories.instance) {
	        Histories.instance = new Histories();
	      }

	      return Histories.instance;
	    };

	    Histories.prototype.initialListeners = function () {
	      var _this = this;

	      goeasy_event_center_1.GoEasyEventCenter.on(internal_events_1.IM_INTERNAL_EVENTS.MESSAGE_SENDING, function (message) {
	        return _this.onMessageSending(message);
	      });
	      goeasy_event_center_1.GoEasyEventCenter.on(internal_events_1.IM_INTERNAL_EVENTS.MESSAGE_SEND_SUCCESS, function (message) {
	        return _this.onMessageSendSuccess(message);
	      });
	      goeasy_event_center_1.GoEasyEventCenter.on(internal_events_1.IM_INTERNAL_EVENTS.MESSAGE_SEND_FAILED, function (message) {
	        return _this.onMessageSendFailed(message);
	      });
	      goeasy_event_center_1.GoEasyEventCenter.on(internal_events_1.IM_INTERNAL_EVENTS.MESSAGE_RECEIVED, function (message) {
	        return _this.onMessageReceived(message);
	      });
	      goeasy_event_center_1.GoEasyEventCenter.on(internal_events_1.IM_INTERNAL_EVENTS.CS_ACCEPTED, function (message) {
	        return _this.onCSAccepted(message);
	      });
	      goeasy_event_center_1.GoEasyEventCenter.on(internal_events_1.IM_INTERNAL_EVENTS.CS_ENDED, function (message) {
	        return _this.onCSEnded(message);
	      });
	      goeasy_event_center_1.GoEasyEventCenter.on(internal_events_1.IM_INTERNAL_EVENTS.CS_TRANSFER, function (message) {
	        return _this.onCSTransfer(message);
	      });
	      g_1.G.s().addMessageObserver(RemoteEvents_1.RemoteEvents.IM_MSG_READ, this.onRemoteMarkRead.bind(this));
	      g_1.G.s().addMessageObserver(RemoteEvents_1.RemoteEvents.IM_MSG_DELETED, this.onRemoteMessageDeleted.bind(this));
	      g_1.G.s().addMessageObserver(RemoteEvents_1.RemoteEvents.IM_MSG_RECALLED, this.onRemoteMessageRecalled.bind(this));
	      g_1.G.s().addDisconnectedObserver(this.onDisconnected.bind(this));
	    };

	    Histories.prototype.loadHistory = function (options, teamId) {
	      return __awaiter(this, void 0, void 0, function () {
	        var target, history, messages;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              target = this.queryToTarget(options, teamId);
	              history = this.findOrCreateHistory(target);
	              return [4
	              /*yield*/
	              , history.loadHistory(options.lastTimestamp, options.limit)];

	            case 1:
	              messages = _a.sent();
	              callback_utils_1.CallbackUtils.onSuccess(options, {
	                code: 200,
	                content: messages
	              });
	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    Histories.prototype.queryToTarget = function (options, teamId) {
	      if (Calibrator_1["default"].isDef(options.userId)) {
	        return new Target_1.Target(GoEasy_1.Scene.PRIVATE, options.userId);
	      } else if (Calibrator_1["default"].isDef(options.groupId)) {
	        return new Target_1.Target(GoEasy_1.Scene.GROUP, options.groupId);
	      } else if (Calibrator_1["default"].isDef(options.type)) {
	        if (!Object.values(GoEasy_1.Scene).includes(options.type)) {
	          throw new Error('incorrect type, must be: ' + Object.values(GoEasy_1.Scene));
	        }

	        if (Calibrator_1["default"].isUndef(options.id)) {
	          throw new Error('If type is not empty, id is required.');
	        }

	        if (GoEasy_1.Scene.CS == options.type) {
	          //如果teamId为空，就认为是customer端查询，更好的方式是能够判断当前用户是否customer
	          if (Calibrator_1["default"].isUndef(teamId)) {
	            teamId = options.id;
	          }
	        }

	        return new Target_1.Target(options.type, options.id, teamId);
	      }

	      throw new Error('incorrect query options.');
	    };

	    Histories.prototype.onMessageSending = function (message) {
	      var target = Target_1.Target.byIMMessage(message);
	      var history = this.findOrCreateHistory(target);
	      history.onMessageSending(message);
	    };

	    Histories.prototype.onMessageSendSuccess = function (message) {
	      var target = Target_1.Target.byIMMessage(message);
	      var history = this.findHistory(target);
	      history.onMessageSendSuccess(message);
	    };

	    Histories.prototype.onMessageSendFailed = function (message) {
	      var target = Target_1.Target.byIMMessage(message);
	      var history = this.findHistory(target);
	      history.onMessageSendFailed(message);
	    };

	    Histories.prototype.onMessageReceived = function (message) {
	      var target = Target_1.Target.byIMMessage(message);
	      var history = this.findOrCreateHistory(target);
	      history.onMessageReceived(message);
	    };

	    Histories.prototype.privateMarkAsRead = function (markOption) {
	      return __awaiter(this, void 0, void 0, function () {
	        var target;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              if (Calibrator_1["default"].isUndef(markOption.userId)) {
	                throw new Error('userId could not be empty.');
	              }

	              target = Target_1.Target.byScene(GoEasy_1.Scene.PRIVATE, markOption.userId);
	              return [4
	              /*yield*/
	              , this.markAsRead(target, markOption)];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    Histories.prototype.groupMarkAsRead = function (markOption) {
	      return __awaiter(this, void 0, void 0, function () {
	        var target;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              if (Calibrator_1["default"].isUndef(markOption.groupId)) {
	                throw new Error('groupId could not be empty.');
	              }

	              target = Target_1.Target.byScene(GoEasy_1.Scene.GROUP, markOption.groupId);
	              return [4
	              /*yield*/
	              , this.markAsRead(target, markOption)];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    Histories.prototype.markMessageAsRead = function (option, teamId) {
	      return __awaiter(this, void 0, void 0, function () {
	        var target;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              if (Calibrator_1["default"].isUndef(option.id)) {
	                throw new Error('id could not be empty.');
	              }

	              if (!Object.values(GoEasy_1.Scene).includes(option.type)) {
	                throw new Error('incorrect type, must be: ' + Object.values(GoEasy_1.Scene));
	              }

	              if (GoEasy_1.Scene.CS == option.type) {
	                //如果teamId为空，就认为是customer端mark，更好的方式是能够判断当前用户是否customer
	                if (Calibrator_1["default"].isUndef(teamId)) {
	                  teamId = option.id;
	                }
	              }

	              target = Target_1.Target.byScene(option.type, option.id, teamId);
	              return [4
	              /*yield*/
	              , this.markAsRead(target, option)];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    Histories.prototype.markAsRead = function (target, markOption) {
	      return __awaiter(this, void 0, void 0, function () {
	        var history;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              history = this.findHistory(target);
	              if (!history) return [3
	              /*break*/
	              , 2];
	              return [4
	              /*yield*/
	              , history.markRead()];

	            case 1:
	              _a.sent();

	              _a.label = 2;

	            case 2:
	              callback_utils_1.CallbackUtils.onSuccess(markOption);
	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    Histories.prototype.onRemoteMarkRead = function (event) {
	      var target = Target_1.Target.byMessageReadRemoteEvent(event);
	      var history = this.findHistory(target);

	      if (history) {
	        history.syncMarkedMessage(event);
	      }
	    };

	    Histories.prototype.deleteMessage = function (options) {
	      return __awaiter(this, void 0, void 0, function () {
	        var message, target, history;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              this.validateMessageArray(options.messages);
	              MessageDeleter_1["default"].validate(options);
	              message = options.messages[0];
	              target = Target_1.Target.byIMMessage(message);
	              history = this.findHistory(target);
	              if (!history) return [3
	              /*break*/
	              , 2];
	              return [4
	              /*yield*/
	              , history.deleteMessages(options)];

	            case 1:
	              _a.sent();

	              return [3
	              /*break*/
	              , 3];

	            case 2:
	              throw {
	                code: 400,
	                content: 'No message that could be deleted'
	              };

	            case 3:
	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    Histories.prototype.onRemoteMessageDeleted = function (event) {
	      var target = Target_1.Target.byIMMessageDeletedEvent(event);
	      var history = this.findHistory(target);

	      if (history) {
	        history.syncDeletedMessage(event.deleterId, event.times);
	      }
	    };

	    Histories.prototype.recallMessage = function (options) {
	      return __awaiter(this, void 0, void 0, function () {
	        var message, target, history;
	        return __generator(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              this.validateMessageArray(options.messages);
	              MessageRecaller_1["default"].validate(options);
	              message = options.messages[0];
	              target = Target_1.Target.byIMMessage(message);
	              history = this.findHistory(target);
	              if (!history) return [3
	              /*break*/
	              , 2];
	              return [4
	              /*yield*/
	              , history.recallMessage(options)];

	            case 1:
	              _a.sent();

	              return [3
	              /*break*/
	              , 3];

	            case 2:
	              throw {
	                code: 400,
	                content: 'No message that could be recalled'
	              };

	            case 3:
	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    };

	    Histories.prototype.onRemoteMessageRecalled = function (event) {
	      var target = Target_1.Target.byRemoteRecallEvent(event);
	      var history = this.findHistory(target);

	      if (history) {
	        history.syncRecalledMessage(event.times);
	      }
	    };

	    Histories.prototype.onDisconnected = function () {
	      this.map.forEach(function (history, key) {
	        history.expire();
	      });
	    };

	    Histories.prototype.onCSAccepted = function (message) {
	      this.onMessageReceived(message);
	    };

	    Histories.prototype.onCSEnded = function (message) {
	      this.onMessageReceived(message);
	    };

	    Histories.prototype.onCSTransfer = function (message) {
	      this.onMessageReceived(message);
	    };

	    Histories.prototype.findOrCreateHistory = function (target) {
	      var history = this.findHistory(target);

	      if (history) {
	        return history;
	      } else {
	        if (target.scene === GoEasy_1.Scene.CS) {
	          if (g_1.G.u() === target.customerId()) {
	            history = new customer_history_1["default"](target);
	          } else {
	            history = new staff_history_1["default"](target);
	          }
	        } else {
	          history = new History_1["default"](target);
	        }

	        this.map.set(target.toString(), history);
	        return history;
	      }
	    };

	    Histories.get = function (target) {
	      return Histories.instance.findOrCreateHistory(target);
	    };

	    Histories.prototype.findHistory = function (target) {
	      return this.map.get(target.toString());
	    };

	    Histories.prototype.validateMessageArray = function (messages) {
	      if (!Calibrator_1["default"].isArray(messages) || Calibrator_1["default"].isEmpty(messages)) {
	        throw {
	          code: 400,
	          content: "messages requires non empty array"
	        };
	      }

	      if (messages.length > 50) {
	        throw {
	          code: 400,
	          content: "The maximum number of messages is 50"
	        };
	      }

	      var firstTarget = Target_1.Target.byIMMessage(messages[0]);

	      for (var i = 0; i < messages.length; i++) {
	        var message = messages[i];

	        if (!(message instanceof AbstractMessage_1.AbstractMessage)) {
	          throw {
	            code: 400,
	            content: "message[" + i + "] is not a correct message"
	          };
	        }

	        if (i > 0) {
	          var target = Target_1.Target.byIMMessage(message);

	          if (target.scene !== firstTarget.scene || target.id !== firstTarget.id) {
	            throw {
	              code: 400,
	              content: "each message must be from the same friend or group"
	            };
	          }
	        }
	      }
	    };

	    return Histories;
	  }();

	  exports["default"] = Histories;
	})(histories);

	Conversation$1.__esModule = true;
	Conversation$1.Conversation = void 0;
	var GoEasy_1$5 = GoEasy$1;
	var histories_1$4 = histories;

	var Conversation =
	/** @class */
	function () {
	  function Conversation(target) {
	    this.top = false;
	    this.data = null;
	    this.dataLoaded = false;
	    this.target = target;
	  }

	  Conversation.prototype.toDto = function () {
	    var scene = this.target.scene;
	    var targetId = this.target.id;
	    var conversationDto = new GoEasy_1$5.ConversationDTO();

	    if (scene === GoEasy_1$5.Scene.PRIVATE) {
	      conversationDto.userId = targetId;
	    } else if (scene === GoEasy_1$5.Scene.GROUP) {
	      conversationDto.groupId = targetId;
	    } else if (scene === GoEasy_1$5.Scene.CS) {
	      //customer
	      conversationDto.id = this.target.teamId;
	    }

	    conversationDto.type = scene;
	    conversationDto.lastMessage = this.getMaxMessage();
	    conversationDto.unread = this.getUnreadAmount();
	    conversationDto.top = this.top;
	    conversationDto.data = this.data;
	    return conversationDto;
	  };

	  Conversation.prototype.getMaxMessage = function () {
	    return histories_1$4["default"].get(this.target).getMaxMessage();
	  };

	  Conversation.prototype.getUnreadAmount = function () {
	    return histories_1$4["default"].get(this.target).unreadAmount();
	  };

	  Conversation.prototype.maxMessageTime = function () {
	    return histories_1$4["default"].get(this.target).maxTime();
	  };

	  return Conversation;
	}();

	Conversation$1.Conversation = Conversation;

	var CSConversation$1 = {};

	var __extends$9 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	CSConversation$1.__esModule = true;
	CSConversation$1.CSConversation = void 0;
	var Conversation_1$1 = Conversation$1;
	var histories_1$3 = histories;
	var GoEasy_1$4 = GoEasy$1;

	var CSConversation =
	/** @class */
	function (_super) {
	  __extends$9(CSConversation, _super);

	  function CSConversation(target) {
	    var _this = _super.call(this, target) || this;

	    _this.accepted = false;
	    return _this;
	  }

	  CSConversation.prototype.toDto = function () {
	    var conversationDto = new GoEasy_1$4.ConversationDTO();
	    var scene = this.target.scene;
	    var customerId = this.target.id;
	    var teamId = this.target.teamId;
	    conversationDto.id = customerId;
	    conversationDto.teamId = teamId;
	    conversationDto.type = scene;
	    conversationDto.lastMessage = this.getMaxMessage();
	    conversationDto.unread = this.getUnreadAmount();
	    conversationDto.top = this.top;
	    conversationDto.data = this.data;
	    return conversationDto;
	  };

	  CSConversation.prototype.getMaxMessage = function () {
	    return histories_1$3["default"].get(this.target).getMaxMessage(this.accepted);
	  };

	  CSConversation.prototype.getUnreadAmount = function () {
	    return histories_1$3["default"].get(this.target).unreadAmount(this.accepted);
	  };

	  CSConversation.prototype.maxMessageTime = function () {
	    return histories_1$3["default"].get(this.target).maxTime(this.accepted);
	  };

	  return CSConversation;
	}(Conversation_1$1.Conversation);

	CSConversation$1.CSConversation = CSConversation;

	var remoteConversations = {};

	var TopConversationRequest = {};

	(function (exports) {

	  exports.__esModule = true;

	  var TopConversationRequest =
	  /** @class */
	  function () {
	    function TopConversationRequest(type, top, targetId, teamId) {
	      this.type = type;
	      this.top = top;
	      this.targetId = targetId;
	      this.teamId = teamId;
	    }

	    return TopConversationRequest;
	  }();

	  exports["default"] = TopConversationRequest;
	})(TopConversationRequest);

	var RemoveConversationRequest = {};

	(function (exports) {

	  exports.__esModule = true;

	  var RemoveConversationRequest =
	  /** @class */
	  function () {
	    function RemoveConversationRequest(type, targetId, teamId) {
	      this.type = type;
	      this.targetId = targetId;
	      this.teamId = teamId;
	    }

	    return RemoveConversationRequest;
	  }();

	  exports["default"] = RemoveConversationRequest;
	})(RemoveConversationRequest);

	var dataRequest = {};

	(function (exports) {

	  exports.__esModule = true;

	  var DataRequest =
	  /** @class */
	  function () {
	    function DataRequest(type, targetId, teamId) {
	      this.type = type;
	      this.targetId = targetId;
	      this.teamId = teamId;
	    }

	    return DataRequest;
	  }();

	  exports["default"] = DataRequest;
	})(dataRequest);

	(function (exports) {

	  var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	    function adopt(value) {
	      return value instanceof P ? value : new P(function (resolve) {
	        resolve(value);
	      });
	    }

	    return new (P || (P = Promise))(function (resolve, reject) {
	      function fulfilled(value) {
	        try {
	          step(generator.next(value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function rejected(value) {
	        try {
	          step(generator["throw"](value));
	        } catch (e) {
	          reject(e);
	        }
	      }

	      function step(result) {
	        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	      }

	      step((generator = generator.apply(thisArg, _arguments || [])).next());
	    });
	  };

	  var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	    var _ = {
	      label: 0,
	      sent: function sent() {
	        if (t[0] & 1) throw t[1];
	        return t[1];
	      },
	      trys: [],
	      ops: []
	    },
	        f,
	        y,
	        t,
	        g;
	    return g = {
	      next: verb(0),
	      "throw": verb(1),
	      "return": verb(2)
	    }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	      return this;
	    }), g;

	    function verb(n) {
	      return function (v) {
	        return step([n, v]);
	      };
	    }

	    function step(op) {
	      if (f) throw new TypeError("Generator is already executing.");

	      while (_) {
	        try {
	          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	          if (y = 0, t) op = [op[0] & 2, t.value];

	          switch (op[0]) {
	            case 0:
	            case 1:
	              t = op;
	              break;

	            case 4:
	              _.label++;
	              return {
	                value: op[1],
	                done: false
	              };

	            case 5:
	              _.label++;
	              y = op[1];
	              op = [0];
	              continue;

	            case 7:
	              op = _.ops.pop();

	              _.trys.pop();

	              continue;

	            default:
	              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	                _ = 0;
	                continue;
	              }

	              if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	                _.label = op[1];
	                break;
	              }

	              if (op[0] === 6 && _.label < t[1]) {
	                _.label = t[1];
	                t = op;
	                break;
	              }

	              if (t && _.label < t[2]) {
	                _.label = t[2];

	                _.ops.push(op);

	                break;
	              }

	              if (t[2]) _.ops.pop();

	              _.trys.pop();

	              continue;
	          }

	          op = body.call(thisArg, _);
	        } catch (e) {
	          op = [6, e];
	          y = 0;
	        } finally {
	          f = t = 0;
	        }
	      }

	      if (op[0] & 5) throw op[1];
	      return {
	        value: op[0] ? op[1] : void 0,
	        done: true
	      };
	    }
	  };

	  exports.__esModule = true;
	  var TopConversationRequest_1 = TopConversationRequest;
	  var Rocket_1 = Rocket;
	  var RocketTypes_1 = RocketTypes;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var RemoveConversationRequest_1 = RemoveConversationRequest;
	  var g_1 = g;
	  var data_request_1 = dataRequest;

	  var RemoteConversations =
	  /** @class */
	  function () {
	    function RemoteConversations() {}

	    RemoteConversations.prototype.top = function (target, top) {
	      var request = new TopConversationRequest_1["default"](target.scene, top, target.id, target.teamId);
	      return new Promise(function (resolve, reject) {
	        var rocket = new Rocket_1["default"]({
	          name: RocketTypes_1.RocketTypes.topConversation,
	          params: request,
	          permission: Permission_1.Permission.WRITE,
	          singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	          totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	          success: function success(res) {
	            if (res.code === 200) {
	              resolve(res);
	            } else {
	              reject(res);
	            }
	          },
	          fail: function fail(err) {
	            reject(err);
	          }
	        });
	        g_1.G.s().emit(rocket);
	      });
	    };

	    RemoteConversations.prototype.remove = function (target) {
	      var request = new RemoveConversationRequest_1["default"](target.scene, target.id, target.teamId);
	      return new Promise(function (resolve, reject) {
	        var rocket = new Rocket_1["default"]({
	          name: RocketTypes_1.RocketTypes.removeConversation,
	          params: request,
	          permission: Permission_1.Permission.WRITE,
	          singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	          totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	          success: function success(res) {
	            if (res.code == 200) {
	              resolve(res);
	            } else {
	              reject(res);
	            }
	          },
	          fail: function fail(err) {
	            reject(err);
	          }
	        });
	        g_1.G.s().emit(rocket);
	      });
	    };

	    RemoteConversations.prototype.query = function (rocketType) {
	      var _this = this;

	      return new Promise(function (resolve, reject) {
	        var rocket = new Rocket_1["default"]({
	          name: rocketType,
	          params: {},
	          permission: Permission_1.Permission.READ,
	          singleTimeout: SocketTimeout_1.SocketTimeout.commonQuerySingle,
	          totalTimeout: SocketTimeout_1.SocketTimeout.commonQueryTotal,
	          fail: function fail(err) {
	            reject(err);
	          },
	          success: function success(result) {
	            return __awaiter(_this, void 0, void 0, function () {
	              return __generator(this, function (_a) {
	                resolve(result);
	                return [2
	                /*return*/
	                ];
	              });
	            });
	          }
	        });
	        g_1.G.s().emit(rocket);
	      });
	    };

	    RemoteConversations.prototype.loadData = function (target) {
	      var request = new data_request_1["default"](target.scene, target.id, target.teamId);
	      return new Promise(function (resolve, reject) {
	        var rocket = new Rocket_1["default"]({
	          name: RocketTypes_1.RocketTypes.imData,
	          params: request,
	          permission: Permission_1.Permission.READ,
	          singleTimeout: SocketTimeout_1.SocketTimeout.commonQuerySingle,
	          totalTimeout: SocketTimeout_1.SocketTimeout.commonQueryTotal,
	          success: function success(result) {
	            var data = JSON.parse(result.content);
	            resolve(data);
	          },
	          fail: function fail(error) {
	            reject(error);
	          }
	        });
	        g_1.G.s().emit(rocket);
	      });
	    };

	    RemoteConversations.instance = new RemoteConversations();
	    return RemoteConversations;
	  }();

	  exports["default"] = RemoteConversations;
	})(remoteConversations);

	var __extends$8 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	var __awaiter$3 = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	  function adopt(value) {
	    return value instanceof P ? value : new P(function (resolve) {
	      resolve(value);
	    });
	  }

	  return new (P || (P = Promise))(function (resolve, reject) {
	    function fulfilled(value) {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function rejected(value) {
	      try {
	        step(generator["throw"](value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function step(result) {
	      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	    }

	    step((generator = generator.apply(thisArg, _arguments || [])).next());
	  });
	};

	var __generator$3 = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	  var _ = {
	    label: 0,
	    sent: function sent() {
	      if (t[0] & 1) throw t[1];
	      return t[1];
	    },
	    trys: [],
	    ops: []
	  },
	      f,
	      y,
	      t,
	      g;
	  return g = {
	    next: verb(0),
	    "throw": verb(1),
	    "return": verb(2)
	  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	    return this;
	  }), g;

	  function verb(n) {
	    return function (v) {
	      return step([n, v]);
	    };
	  }

	  function step(op) {
	    if (f) throw new TypeError("Generator is already executing.");

	    while (_) {
	      try {
	        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	        if (y = 0, t) op = [op[0] & 2, t.value];

	        switch (op[0]) {
	          case 0:
	          case 1:
	            t = op;
	            break;

	          case 4:
	            _.label++;
	            return {
	              value: op[1],
	              done: false
	            };

	          case 5:
	            _.label++;
	            y = op[1];
	            op = [0];
	            continue;

	          case 7:
	            op = _.ops.pop();

	            _.trys.pop();

	            continue;

	          default:
	            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	              _ = 0;
	              continue;
	            }

	            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	              _.label = op[1];
	              break;
	            }

	            if (op[0] === 6 && _.label < t[1]) {
	              _.label = t[1];
	              t = op;
	              break;
	            }

	            if (t && _.label < t[2]) {
	              _.label = t[2];

	              _.ops.push(op);

	              break;
	            }

	            if (t[2]) _.ops.pop();

	            _.trys.pop();

	            continue;
	        }

	        op = body.call(thisArg, _);
	      } catch (e) {
	        op = [6, e];
	        y = 0;
	      } finally {
	        f = t = 0;
	      }
	    }

	    if (op[0] & 5) throw op[1];
	    return {
	      value: op[0] ? op[1] : void 0,
	      done: true
	    };
	  }
	};

	var __values$1 = commonjsGlobal && commonjsGlobal.__values || function (o) {
	  var s = typeof Symbol === "function" && Symbol.iterator,
	      m = s && o[s],
	      i = 0;
	  if (m) return m.call(o);
	  if (o && typeof o.length === "number") return {
	    next: function next() {
	      if (o && i >= o.length) o = void 0;
	      return {
	        value: o && o[i++],
	        done: !o
	      };
	    }
	  };
	  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	};

	Conversations$1.__esModule = true;
	Conversations$1.Conversations = void 0;
	var Conversation_1 = Conversation$1;
	var callback_utils_1$5 = callbackUtils;
	var GoEasy_1$3 = GoEasy$1;
	var remote_abbr_message_builder_1$1 = remoteAbbrMessageBuilder;
	var RocketTypes_1$3 = RocketTypes;
	var im_api_events_1$1 = imApiEvents;
	var sorted_inserter_1 = sortedInserter;
	var goeasy_event_center_1$3 = goeasyEventCenter;
	var internal_events_1$3 = internalEvents;
	var Target_1$1 = Target$1;
	var CSConversation_1$1 = CSConversation$1;
	var im_1$2 = im;
	var remote_conversations_1 = remoteConversations;
	var histories_1$2 = histories;
	var g_1$5 = g;
	var cs_message_type_1$1 = csMessageType;
	var Calibrator_1$7 = Calibrator;

	var Conversations =
	/** @class */
	function () {
	  function Conversations() {
	    var _this = this;

	    this.list = new Array();
	    this.builder = new remote_abbr_message_builder_1$1.RemoteAbbrMessageBuilder();
	    this.remoteConversations = remote_conversations_1["default"].instance;
	    this["synchronized"] = false;
	    goeasy_event_center_1$3.GoEasyEventCenter.on(internal_events_1$3.IM_INTERNAL_EVENTS.MAX_MESSAGE_CHANGED, function (message) {
	      return _this.onMaxMessageChanged(message);
	    });
	    goeasy_event_center_1$3.GoEasyEventCenter.on(internal_events_1$3.IM_INTERNAL_EVENTS.UNREAD_AMOUNT_CHANGED, function (target) {
	      return _this.onUnreadMessageChanged(target);
	    });
	  }

	  Conversations.prototype.onUnreadMessageChanged = function (target) {
	    var conversation = this.findConversation(target);

	    if (conversation) {
	      this.fireUpdated();
	    }
	  };

	  Conversations.prototype.fireUpdated = function () {
	    var data = this.loadLocalConversations();
	    var updatedEventName = this.getUpdatedEventName();
	    im_1$2.IM.aec.fire(updatedEventName, {
	      unreadTotal: data.content.unreadTotal,
	      conversations: data.content.conversations
	    });
	  };

	  Conversations.prototype.getUpdatedEventName = function () {
	    return im_api_events_1$1.ImApiEvents.CONVERSATIONS_UPDATED;
	  };

	  Conversations.prototype.latestConversations = function (options) {
	    return __awaiter$3(this, void 0, void 0, function () {
	      var data;
	      return __generator$3(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            if (!!this["synchronized"]) return [3
	            /*break*/
	            , 2];
	            return [4
	            /*yield*/
	            , this.loadServerConversations()];

	          case 1:
	            _a.sent();

	            _a.label = 2;

	          case 2:
	            data = this.loadLocalConversations();
	            callback_utils_1$5.CallbackUtils.onSuccess(options, data);
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  Conversations.prototype.loadServerConversations = function () {
	    return __awaiter$3(this, void 0, void 0, function () {
	      var rocketType, data;
	      return __generator$3(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            rocketType = this.rocketName();
	            return [4
	            /*yield*/
	            , this.remoteConversations.query(rocketType)];

	          case 1:
	            data = _a.sent();
	            this.convertAbbrConversation(data.content);
	            this["synchronized"] = true;
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  Conversations.prototype.rocketName = function () {
	    return RocketTypes_1$3.RocketTypes.imLastConversations;
	  };

	  Conversations.prototype.convertAbbrConversation = function (abbrConversations) {
	    var e_1, _a;

	    var conversations = abbrConversations;

	    try {
	      for (var conversations_1 = __values$1(conversations), conversations_1_1 = conversations_1.next(); !conversations_1_1.done; conversations_1_1 = conversations_1.next()) {
	        var abbrConversation = conversations_1_1.value;
	        var scene = abbrConversation.t;
	        var top_1 = abbrConversation.top;
	        var data = abbrConversation.d ? JSON.parse(abbrConversation.d) : {};
	        var userOffsets = abbrConversation.userOffsets;
	        abbrConversation.lmsg.t = scene;
	        var lastMessage = abbrConversation.lmsg;
	        var message = this.builder.build(lastMessage);
	        var target = Target_1$1.Target.byIMMessage(message);
	        var conversation = this.findConversation(target);

	        if (Calibrator_1$7["default"].isUndef(conversation)) {
	          conversation = this.buildByAbbr(abbrConversation, message);
	          this.insertOne(conversation);
	        } else {
	          conversation.top = top_1;
	          conversation.data = data;
	        }

	        histories_1$2["default"].get(target).initMaxMessageAndOffsets(message, userOffsets);
	        this.correctPosition(conversation);
	      }
	    } catch (e_1_1) {
	      e_1 = {
	        error: e_1_1
	      };
	    } finally {
	      try {
	        if (conversations_1_1 && !conversations_1_1.done && (_a = conversations_1["return"])) _a.call(conversations_1);
	      } finally {
	        if (e_1) throw e_1.error;
	      }
	    }
	  };

	  Conversations.prototype.onMaxMessageChanged = function (message) {
	    return __awaiter$3(this, void 0, void 0, function () {
	      var csMessage;
	      return __generator$3(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            //对于staff收到的accepted=false的消息, 或者其他staff accepted的消息，不可以更新自己的userConversation，只能更新pendingConversation
	            if (message.scene() === GoEasy_1$3.Scene.CS) {
	              csMessage = message;

	              if (g_1$5.G.u() != csMessage.customerId()) {
	                if (csMessage.accepted === false || csMessage.type === cs_message_type_1$1.CSMessageType.ACCEPT && csMessage.senderId != g_1$5.G.u()) {
	                  return [2
	                  /*return*/
	                  ];
	                }
	              }
	            }

	            return [4
	            /*yield*/
	            , this.saveOrUpdateConversation(message)];

	          case 1:
	            _a.sent();

	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  Conversations.prototype.saveOrUpdateConversation = function (message) {
	    return __awaiter$3(this, void 0, void 0, function () {
	      var status, target, conversation, _a;

	      return __generator$3(this, function (_b) {
	        switch (_b.label) {
	          case 0:
	            status = message.status;
	            target = Target_1$1.Target.byIMMessage(message);
	            conversation = this.findConversation(target);
	            if (!(Calibrator_1$7["default"].isUndef(conversation) && status !== GoEasy_1$3.MessageStatus.FAIL)) return [3
	            /*break*/
	            , 2];
	            conversation = this.buildByMessage(message);
	            this.insertOne(conversation);
	            if (!(status === GoEasy_1$3.MessageStatus.SUCCESS)) return [3
	            /*break*/
	            , 2];
	            _a = conversation;
	            return [4
	            /*yield*/
	            , this.remoteConversations.loadData(target)];

	          case 1:
	            _a.data = _b.sent();
	            conversation.dataLoaded = true;
	            _b.label = 2;

	          case 2:
	            if (status === GoEasy_1$3.MessageStatus.SENDING) {
	              conversation.data = message.getToData();
	              conversation.dataLoaded = true;
	            }

	            if (conversation && conversation.dataLoaded) {
	              this.correctPosition(conversation);
	              this.fireUpdated();
	            }

	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  Conversations.prototype.loadLocalConversations = function () {
	    var e_2, _a;

	    var unreadTotal = 0;
	    var conversations = new Array();

	    try {
	      for (var _b = __values$1(this.list), _c = _b.next(); !_c.done; _c = _b.next()) {
	        var conversation = _c.value;

	        if (conversation.dataLoaded && conversation.getMaxMessage()) {
	          unreadTotal += conversation.getUnreadAmount();
	          var conversationDTO = conversation.toDto();
	          conversations.push(conversationDTO);
	        }
	      }
	    } catch (e_2_1) {
	      e_2 = {
	        error: e_2_1
	      };
	    } finally {
	      try {
	        if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
	      } finally {
	        if (e_2) throw e_2.error;
	      }
	    }

	    return {
	      code: 200,
	      content: {
	        unreadTotal: unreadTotal,
	        conversations: conversations
	      }
	    };
	  };

	  Conversations.prototype.findConversationIndex = function (target) {
	    return this.list.findIndex(function (item) {
	      return target.toString() === item.target.toString();
	    });
	  };

	  Conversations.prototype.findConversation = function (target) {
	    var index = this.findConversationIndex(target);
	    return this.list[index];
	  };

	  Conversations.prototype.removeLocalConversation = function (conversation) {
	    var index = this.findConversationIndex(conversation.target);
	    this.list.splice(index, 1);
	  };

	  Conversations.prototype.insertOne = function (conversation) {
	    Conversations.sortedInserter.insert(this.list, conversation);

	    if (this.list.length > Conversations.CONVERSATIONS_MAX_LENGTH) {
	      this.list = this.list.slice(0, Conversations.CONVERSATIONS_MAX_LENGTH);
	    }
	  };

	  Conversations.prototype.correctPosition = function (conversation) {
	    this.removeLocalConversation(conversation);
	    this.insertOne(conversation);
	  };

	  Conversations.prototype.removeConversation = function (message) {
	    var target = Target_1$1.Target.byIMMessage(message);
	    var conversation = this.findConversation(target);

	    if (conversation) {
	      this.removeLocalConversation(conversation);
	      this.fireUpdated();
	    }
	  };

	  Conversations.prototype.top = function (target, top, options) {
	    return __awaiter$3(this, void 0, void 0, function () {
	      var conversation;
	      return __generator$3(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            if (!Calibrator_1$7["default"].isBoolean(top)) {
	              throw new Error('top must be boolean.');
	            }

	            conversation = this.findConversation(target);

	            if (!conversation) {
	              throw new Error('conversation does not exist.');
	            }

	            if (!(conversation.top != top)) return [3
	            /*break*/
	            , 2];
	            return [4
	            /*yield*/
	            , this.remoteConversations.top(target, top)];

	          case 1:
	            _a.sent();

	            conversation.top = top;
	            this.correctPosition(conversation);
	            _a.label = 2;

	          case 2:
	            this.fireUpdated();
	            callback_utils_1$5.CallbackUtils.onSuccess(options);
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  Conversations.prototype.remove = function (target, options) {
	    return __awaiter$3(this, void 0, void 0, function () {
	      var conversation;
	      return __generator$3(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            conversation = this.findConversation(target);

	            if (!conversation) {
	              throw new Error('conversation does not exist.');
	            }

	            return [4
	            /*yield*/
	            , this.remoteConversations.remove(target)];

	          case 1:
	            _a.sent();

	            this.removeLocalConversation(conversation);
	            this.fireUpdated();
	            callback_utils_1$5.CallbackUtils.onSuccess(options);
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  Conversations.prototype.buildByAbbr = function (abbrConversation, message) {
	    var conversation;
	    var target = Target_1$1.Target.byIMMessage(message);

	    if (abbrConversation.t === GoEasy_1$3.Scene.CS) {
	      var csMessage = message;

	      if (g_1$5.G.u() === csMessage.customerId()) {
	        conversation = new Conversation_1.Conversation(target);
	      } else {
	        conversation = new CSConversation_1$1.CSConversation(target);
	        conversation.accepted = csMessage.accepted;
	      }
	    } else {
	      conversation = new Conversation_1.Conversation(target);
	    }

	    conversation.dataLoaded = true;
	    conversation.top = abbrConversation.top;
	    conversation.data = abbrConversation.d ? JSON.parse(abbrConversation.d) : {};
	    return conversation;
	  };
	  /**
	   * 注意：
	   *  客服消息：
	   *      customer端暂时使用conversation
	   *      staff端使用cs conversation
	   *  私聊和群聊使用conversation
	   */


	  Conversations.prototype.buildByMessage = function (message) {
	    var conversation;
	    var target = Target_1$1.Target.byIMMessage(message);

	    if (message.scene() === GoEasy_1$3.Scene.CS) {
	      var csMessage = message;

	      if (g_1$5.G.u() === csMessage.customerId()) {
	        conversation = new Conversation_1.Conversation(target);
	      } else {
	        conversation = new CSConversation_1$1.CSConversation(target);
	        conversation.accepted = csMessage.accepted;
	      }
	    } else {
	      conversation = new Conversation_1.Conversation(target);
	    }

	    return conversation;
	  };

	  Conversations.CONVERSATIONS_MAX_LENGTH = 200;
	  Conversations.sortedInserter = new (
	  /** @class */
	  function (_super) {
	    __extends$8(class_1, _super);

	    function class_1() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    class_1.prototype.compare = function (a, b) {
	      var c;

	      if (a.top == b.top) {
	        var aScore = a.maxMessageTime();
	        var bScore = b.maxMessageTime();
	        c = bScore - aScore;
	      } else {
	        c = a.top ? -1 : 1;
	      }

	      return c === 0 ? 0 : c > 0 ? 1 : -1;
	    };

	    return class_1;
	  }(sorted_inserter_1.SortedInserter))();
	  return Conversations;
	}();

	Conversations$1.Conversations = Conversations;

	var PendingConversations$1 = {};

	var __extends$7 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	var __awaiter$2 = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	  function adopt(value) {
	    return value instanceof P ? value : new P(function (resolve) {
	      resolve(value);
	    });
	  }

	  return new (P || (P = Promise))(function (resolve, reject) {
	    function fulfilled(value) {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function rejected(value) {
	      try {
	        step(generator["throw"](value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function step(result) {
	      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	    }

	    step((generator = generator.apply(thisArg, _arguments || [])).next());
	  });
	};

	var __generator$2 = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	  var _ = {
	    label: 0,
	    sent: function sent() {
	      if (t[0] & 1) throw t[1];
	      return t[1];
	    },
	    trys: [],
	    ops: []
	  },
	      f,
	      y,
	      t,
	      g;
	  return g = {
	    next: verb(0),
	    "throw": verb(1),
	    "return": verb(2)
	  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	    return this;
	  }), g;

	  function verb(n) {
	    return function (v) {
	      return step([n, v]);
	    };
	  }

	  function step(op) {
	    if (f) throw new TypeError("Generator is already executing.");

	    while (_) {
	      try {
	        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	        if (y = 0, t) op = [op[0] & 2, t.value];

	        switch (op[0]) {
	          case 0:
	          case 1:
	            t = op;
	            break;

	          case 4:
	            _.label++;
	            return {
	              value: op[1],
	              done: false
	            };

	          case 5:
	            _.label++;
	            y = op[1];
	            op = [0];
	            continue;

	          case 7:
	            op = _.ops.pop();

	            _.trys.pop();

	            continue;

	          default:
	            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	              _ = 0;
	              continue;
	            }

	            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	              _.label = op[1];
	              break;
	            }

	            if (op[0] === 6 && _.label < t[1]) {
	              _.label = t[1];
	              t = op;
	              break;
	            }

	            if (t && _.label < t[2]) {
	              _.label = t[2];

	              _.ops.push(op);

	              break;
	            }

	            if (t[2]) _.ops.pop();

	            _.trys.pop();

	            continue;
	        }

	        op = body.call(thisArg, _);
	      } catch (e) {
	        op = [6, e];
	        y = 0;
	      } finally {
	        f = t = 0;
	      }
	    }

	    if (op[0] & 5) throw op[1];
	    return {
	      value: op[0] ? op[1] : void 0,
	      done: true
	    };
	  }
	};

	var __values = commonjsGlobal && commonjsGlobal.__values || function (o) {
	  var s = typeof Symbol === "function" && Symbol.iterator,
	      m = s && o[s],
	      i = 0;
	  if (m) return m.call(o);
	  if (o && typeof o.length === "number") return {
	    next: function next() {
	      if (o && i >= o.length) o = void 0;
	      return {
	        value: o && o[i++],
	        done: !o
	      };
	    }
	  };
	  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
	};

	PendingConversations$1.__esModule = true;
	PendingConversations$1.PendingConversations = void 0;
	var Conversations_1 = Conversations$1;
	var GoEasy_1$2 = GoEasy$1;
	var RocketTypes_1$2 = RocketTypes;
	var Target_1 = Target$1;
	var goeasy_event_center_1$2 = goeasyEventCenter;
	var internal_events_1$2 = internalEvents;
	var im_api_events_1 = imApiEvents;
	var cs_message_type_1 = csMessageType;
	var histories_1$1 = histories;
	var CSConversation_1 = CSConversation$1;
	var g_1$4 = g;
	var Calibrator_1$6 = Calibrator;

	var PendingConversations =
	/** @class */
	function (_super) {
	  __extends$7(PendingConversations, _super);

	  function PendingConversations() {
	    var _this = _super.call(this) || this;

	    _this.expired = false;
	    goeasy_event_center_1$2.GoEasyEventCenter.on(internal_events_1$2.IM_INTERNAL_EVENTS.CS_ONLINE_SUCCESS, function () {
	      return _this.onCSOnlineSuccess();
	    });
	    goeasy_event_center_1$2.GoEasyEventCenter.on(internal_events_1$2.IM_INTERNAL_EVENTS.CS_OFFLINE_SUCCESS, function () {
	      return _this.onCSOfflineSuccess();
	    });
	    g_1$4.G.s().addDisconnectedObserver(_this.onDisconnected.bind(_this));
	    g_1$4.G.s().addConnectedObserver(_this.onConnected.bind(_this));
	    return _this;
	  }

	  PendingConversations.prototype.onMaxMessageChanged = function (message) {
	    return __awaiter$2(this, void 0, void 0, function () {
	      var csMessage;
	      return __generator$2(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            if (!(message.scene() === GoEasy_1$2.Scene.CS)) return [3
	            /*break*/
	            , 3];
	            csMessage = message;
	            if (!(csMessage.customerId() != g_1$4.G.u())) return [3
	            /*break*/
	            , 3];
	            if (!(csMessage.accepted === false || csMessage.type === cs_message_type_1.CSMessageType.ACCEPT)) return [3
	            /*break*/
	            , 3];
	            if (!(cs_message_type_1.CSMessageType.ACCEPT === message.type)) return [3
	            /*break*/
	            , 1];
	            this.removeConversation(message);
	            return [3
	            /*break*/
	            , 3];

	          case 1:
	            return [4
	            /*yield*/
	            , this.saveOrUpdateConversation(message)];

	          case 2:
	            _a.sent();

	            _a.label = 3;

	          case 3:
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  PendingConversations.prototype.latestConversations = function (options) {
	    return __awaiter$2(this, void 0, void 0, function () {
	      var _synchronized;

	      return __generator$2(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            _synchronized = this["synchronized"];
	            return [4
	            /*yield*/
	            , _super.prototype.latestConversations.call(this, options)];

	          case 1:
	            _a.sent();

	            if (this.list.length > 0 && !_synchronized) {
	              //todo:首次查询会倒是DTO重复转换，未来业务逻辑成熟后优化
	              this.fireUpdated();
	            }

	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  PendingConversations.prototype.onUnreadMessageChanged = function (target) {// pending message没有unread amount 所以do nothing
	  };

	  PendingConversations.prototype.onCSOnlineSuccess = function () {
	    return __awaiter$2(this, void 0, void 0, function () {
	      return __generator$2(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            return [4
	            /*yield*/
	            , this.loadServerConversations()];

	          case 1:
	            _a.sent();

	            this.fireUpdated();
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  PendingConversations.prototype.onCSOfflineSuccess = function () {
	    this.list = [];
	    this.fireUpdated();
	  };

	  PendingConversations.prototype.getUpdatedEventName = function () {
	    return im_api_events_1.ImApiEvents.PENDING_CONVERSATIONS_UPDATED;
	  };

	  PendingConversations.prototype.rocketName = function () {
	    return RocketTypes_1$2.RocketTypes.PENDING_CONVERSATION;
	  };

	  PendingConversations.prototype.convertAbbrConversation = function (abbrConversations) {
	    return __awaiter$2(this, void 0, void 0, function () {
	      var conversations, conversations_1, conversations_1_1, abbrConversation, customerData, lastMessage, userOffsets, data, message, target, conversation, staffHistory;

	      var e_1, _a;

	      return __generator$2(this, function (_b) {
	        conversations = abbrConversations;

	        try {
	          for (conversations_1 = __values(conversations), conversations_1_1 = conversations_1.next(); !conversations_1_1.done; conversations_1_1 = conversations_1.next()) {
	            abbrConversation = conversations_1_1.value;
	            abbrConversation.lastMessage.t = GoEasy_1$2.Scene.CS;
	            customerData = abbrConversation.customerData;
	            lastMessage = abbrConversation.lastMessage;
	            userOffsets = abbrConversation.userOffsets;
	            data = customerData ? JSON.parse(customerData) : {};
	            message = this.builder.build(lastMessage);
	            target = Target_1.Target.byIMMessage(message);
	            conversation = this.findConversation(target);

	            if (Calibrator_1$6["default"].isUndef(conversation)) {
	              conversation = new CSConversation_1.CSConversation(target);
	              conversation.accepted = message.accepted;
	              conversation.dataLoaded = true;
	              this.insertOne(conversation);
	            }

	            conversation.top = false;
	            conversation.data = data;
	            staffHistory = histories_1$1["default"].get(target);
	            staffHistory.initPendingMaxMessageAndOffsets(message, userOffsets);
	            this.correctPosition(conversation);
	          }
	        } catch (e_1_1) {
	          e_1 = {
	            error: e_1_1
	          };
	        } finally {
	          try {
	            if (conversations_1_1 && !conversations_1_1.done && (_a = conversations_1["return"])) _a.call(conversations_1);
	          } finally {
	            if (e_1) throw e_1.error;
	          }
	        }

	        return [2
	        /*return*/
	        ];
	      });
	    });
	  };

	  PendingConversations.prototype.onDisconnected = function () {
	    this.expired = true;
	  };

	  PendingConversations.prototype.onConnected = function () {
	    return __awaiter$2(this, void 0, void 0, function () {
	      return __generator$2(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            if (!this.expired) return [3
	            /*break*/
	            , 2];
	            this.expired = false;
	            this.list = [];
	            return [4
	            /*yield*/
	            , this.loadServerConversations()];

	          case 1:
	            _a.sent();

	            this.fireUpdated();
	            _a.label = 2;

	          case 2:
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  return PendingConversations;
	}(Conversations_1.Conversations);

	PendingConversations$1.PendingConversations = PendingConversations;

	(function (exports) {

	  exports.__esModule = true;
	  var Conversations_1 = Conversations$1;
	  var Target_1 = Target$1;
	  var GoEasy_1 = GoEasy$1;
	  var PendingConversations_1 = PendingConversations$1;
	  var cs_message_1 = csMessage;
	  var g_1 = g;

	  var ConversationList =
	  /** @class */
	  function () {
	    function ConversationList() {
	      this.conversations = new Conversations_1.Conversations();
	      this.pendingConversations = new PendingConversations_1.PendingConversations();
	    }

	    ConversationList.prototype.latestConversations = function (options) {
	      this.conversations.latestConversations(options);
	    };

	    ConversationList.prototype.latestPendingConversations = function (options) {
	      this.pendingConversations.latestConversations(options);
	    };

	    ConversationList.prototype.topPrivateConversation = function (options) {
	      var target = Target_1.Target.byScene(GoEasy_1.Scene.PRIVATE, options.userId);
	      this.conversations.top(target, options.top, options);
	    };

	    ConversationList.prototype.topGroupConversation = function (options) {
	      var target = Target_1.Target.byScene(GoEasy_1.Scene.GROUP, options.groupId);
	      this.conversations.top(target, options.top, options);
	    };

	    ConversationList.prototype.topConversation = function (options) {
	      var conversationDTO = options.conversation;
	      this.validateConversationDTO(conversationDTO);
	      var target = Target_1.Target.byConversationDTO(conversationDTO);
	      this.conversations.top(target, options.top, options);
	    };

	    ConversationList.prototype.removePrivateConversation = function (options) {
	      var target = Target_1.Target.byScene(GoEasy_1.Scene.PRIVATE, options.userId);
	      this.conversations.remove(target, options);
	    };

	    ConversationList.prototype.removeGroupConversation = function (options) {
	      var target = Target_1.Target.byScene(GoEasy_1.Scene.GROUP, options.groupId);
	      this.conversations.remove(target, options);
	    };

	    ConversationList.prototype.removeConversation = function (options) {
	      var conversationDTO = options.conversation;
	      this.validateConversationDTO(conversationDTO);
	      var target = Target_1.Target.byConversationDTO(conversationDTO);
	      this.conversations.remove(target, options);
	    };

	    ConversationList.prototype.validateConversationDTO = function (conversationDTO) {
	      if (!(conversationDTO instanceof GoEasy_1.ConversationDTO)) {
	        throw new Error('Incorrect conversation object.');
	      } else {
	        var lastMessage = conversationDTO.lastMessage;

	        if (lastMessage instanceof cs_message_1.CSMessage) {
	          if (lastMessage.customerId() !== g_1.G.u() && lastMessage.accepted === false) {
	            throw new Error('pending conversation cannot be topped or removed.');
	          }
	        }
	      }
	    };

	    return ConversationList;
	  }();

	  exports["default"] = ConversationList;
	})(conversationList);

	var IMReceiver = {};

	(function (exports) {

	  exports.__esModule = true;
	  var internal_events_1 = internalEvents;
	  var goeasy_event_center_1 = goeasyEventCenter;
	  var remote_abbr_message_builder_1 = remoteAbbrMessageBuilder;
	  var RemoteEvents_1 = RemoteEvents;
	  var GNS_1 = GNS$1;
	  var Calibrator_1 = Calibrator;
	  var GoEasy_1 = GoEasy$1;
	  var g_1 = g;
	  var im_api_events_1 = imApiEvents;
	  var histories_1 = histories;
	  var Target_1 = Target$1;
	  var im_1 = im;

	  var IMReceiver =
	  /** @class */
	  function () {
	    function IMReceiver() {
	      this.builder = new remote_abbr_message_builder_1.RemoteAbbrMessageBuilder();
	      GNS_1.GNS.instance.addAssembler(new (
	      /** @class */
	      function () {
	        function class_1() {}

	        class_1.prototype.assemble = function (oldPayload) {
	          var newPayload = {
	            // im fields
	            messageId: oldPayload.id,
	            timestamp: oldPayload.tm,
	            type: oldPayload.t,
	            senderId: oldPayload.sid,
	            toType: oldPayload.tt
	          };

	          if (oldPayload.tt === GoEasy_1.Scene.GROUP) {
	            newPayload.groupId = oldPayload.gid;
	          }

	          return newPayload;
	        };

	        class_1.prototype.support = function (oldPayload) {
	          return !!oldPayload.sid;
	        };

	        return class_1;
	      }())());
	    }

	    IMReceiver.prototype.initialGoEasySocket = function () {
	      g_1.G.s().addMessageObserver(RemoteEvents_1.RemoteEvents.imMessage, this.onMessageReceived.bind(this));
	    };

	    IMReceiver.prototype.onMessageReceived = function (message) {
	      console.log('IMReceiver -> onMessageReceived:', message);
	      var receivedMessage = this.builder.build(message);
	      this.sendAck(receivedMessage);
	      var target = Target_1.Target.byIMMessage(receivedMessage);
	      var history = histories_1["default"].get(target);

	      if (!history.existsMessage(receivedMessage)) {
	        this.createNotification(message);
	        goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.MESSAGE_RECEIVED, receivedMessage);
	        var scene = target.scene;

	        if (scene === GoEasy_1.Scene.PRIVATE) {
	          im_1.IM.aec.fire(im_api_events_1.ImApiEvents.PRIVATE_MESSAGE_RECEIVED, receivedMessage);
	        } else if (scene === GoEasy_1.Scene.GROUP) {
	          im_1.IM.aec.fire(im_api_events_1.ImApiEvents.GROUP_MESSAGE_RECEIVED, receivedMessage);
	        } else if (scene === GoEasy_1.Scene.CS) {
	          im_1.IM.aec.fire(im_api_events_1.ImApiEvents.CS_MESSAGE_RECEIVED, receivedMessage);
	        }
	      }
	    };

	    IMReceiver.prototype.sendAck = function (message) {
	      g_1.G.s().sendAck('imAck', {
	        "publishGuid": message.messageId
	      });
	    };

	    IMReceiver.prototype.createNotification = function (message) {
	      var supportGNS = GNS_1.GNS.instance.supportNotification();

	      if (!Calibrator_1["default"].isObject(message.nt) || message.s === g_1.G.u() || !supportGNS) {
	        return;
	      }

	      var data = {
	        id: message.i,
	        tm: message.ts,
	        t: message.mt,
	        sid: message.s,
	        tt: message.t
	      };

	      if (data.tt === GoEasy_1.Scene.GROUP) {
	        data.gid = message.r;
	      }

	      GNS_1.GNS.instance.createLocalNotification(message.nt.t, message.nt.c, data);
	    };

	    return IMReceiver;
	  }();

	  exports["default"] = IMReceiver;
	})(IMReceiver);

	var GroupMessageSubscriber = {};

	(function (exports) {

	  exports.__esModule = true;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var validator_utils_1 = validatorUtils;
	  var RocketTypes_1 = RocketTypes;
	  var callback_utils_1 = callbackUtils;
	  var g_1 = g;

	  var GroupMessageSubscriber =
	  /** @class */
	  function () {
	    function GroupMessageSubscriber() {}

	    GroupMessageSubscriber.prototype.subscribe = function (options) {
	      validator_utils_1["default"].validateIdArray(options.groupIds, 'groupIds');
	      options.groupIds = options.groupIds.toString().split(',');
	      var rocket = new Rocket_1["default"]({
	        name: RocketTypes_1.RocketTypes.subscribeGroups,
	        params: {
	          groupIds: options.groupIds,
	          at: options.accessToken
	        },
	        permission: Permission_1.Permission.WRITE,
	        singleTimeout: SocketTimeout_1.SocketTimeout.commonInfiniteSingle,
	        totalTimeout: SocketTimeout_1.SocketTimeout.commonInfiniteTotal,
	        success: function success() {
	          callback_utils_1.CallbackUtils.onSuccess(options, {
	            code: 200,
	            content: 'ok'
	          });
	        },
	        fail: function fail(e) {
	          callback_utils_1.CallbackUtils.onFailed(options, {
	            code: e.resultCode || 408,
	            content: e.content || 'Failed to subscribe group message'
	          });
	        }
	      });
	      g_1.G.s().emit(rocket);
	    };

	    GroupMessageSubscriber.prototype.unsubscribe = function (options) {
	      validator_utils_1["default"].validateId(options.groupId, 'groupId');
	      options.groupId = options.groupId.toString();
	      var rocket = new Rocket_1["default"]({
	        name: RocketTypes_1.RocketTypes.unsubscribeGroup,
	        params: {
	          groupId: options.groupId
	        },
	        permission: Permission_1.Permission.READ,
	        singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	        totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	        success: function success() {
	          callback_utils_1.CallbackUtils.onSuccess(options, {
	            code: 200,
	            content: 'ok'
	          });
	        },
	        fail: function fail(e) {
	          callback_utils_1.CallbackUtils.onFailed(options, {
	            code: e.resultCode || 408,
	            content: e.content || 'Failed to unsubscribe group message'
	          });
	        }
	      });
	      g_1.G.s().emit(rocket);
	    };

	    return GroupMessageSubscriber;
	  }();

	  exports["default"] = GroupMessageSubscriber;
	})(GroupMessageSubscriber);

	var GroupPresenceSubscriber = {};

	(function (exports) {

	  exports.__esModule = true;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var RocketTypes_1 = RocketTypes;
	  var RemoteEvents_1 = RemoteEvents;
	  var im_api_events_1 = imApiEvents;
	  var validator_utils_1 = validatorUtils;
	  var callback_utils_1 = callbackUtils;
	  var g_1 = g;
	  var im_1 = im;

	  var GroupPresenceSubscribe =
	  /** @class */
	  function () {
	    function GroupPresenceSubscribe() {
	      g_1.G.s().addMessageObserver(RemoteEvents_1.RemoteEvents.groupPresence, this.newMessageReceived.bind(this));
	    }

	    GroupPresenceSubscribe.prototype.presence = function (options) {
	      validator_utils_1["default"].validateIdArray(options.groupIds, 'groupIds');
	      options.groupIds.toString().split(',');

	      var success = function success() {
	        callback_utils_1.CallbackUtils.onSuccess(options, {
	          code: 200,
	          content: 'ok'
	        });
	      };

	      var fail = function fail(e) {
	        callback_utils_1.CallbackUtils.onFailed(options, {
	          code: e.code || 408,
	          content: e.content || 'Failed to subscribe group message'
	        });
	      };

	      var params = {
	        groupIds: options.groupIds
	      };
	      this.emitRocket(RocketTypes_1.RocketTypes.subscribeGroupPresence, params, success, fail, SocketTimeout_1.SocketTimeout.commonInfiniteSingle, SocketTimeout_1.SocketTimeout.commonInfiniteTotal);
	    };

	    GroupPresenceSubscribe.prototype.unPresence = function (options) {
	      validator_utils_1["default"].validateId(options.groupId, 'groupId');
	      options.groupId = options.groupId.toString();

	      var success = function success() {
	        callback_utils_1.CallbackUtils.onSuccess(options, {
	          code: 200,
	          content: 'ok'
	        });
	      };

	      var fail = function fail(e) {
	        callback_utils_1.CallbackUtils.onFailed(options, {
	          code: e.code || 408,
	          content: e.content || 'Failed to unsubscribe presence'
	        });
	      };

	      var params = {
	        groupId: options.groupId
	      };
	      this.emitRocket(RocketTypes_1.RocketTypes.unsubscribeGroupPresence, params, success, fail, SocketTimeout_1.SocketTimeout.commonRequestSingle, SocketTimeout_1.SocketTimeout.commonRequestTotal);
	    };

	    GroupPresenceSubscribe.prototype.emitRocket = function (emitType, params, success, fail, singleTimeout, totalTimeout) {
	      var rocket = new Rocket_1["default"]({
	        name: emitType,
	        params: params,
	        singleTimeout: singleTimeout,
	        totalTimeout: totalTimeout,
	        permission: Permission_1.Permission.WRITE,
	        success: success,
	        fail: fail
	      });
	      g_1.G.s().emit(rocket);
	    };

	    GroupPresenceSubscribe.prototype.newMessageReceived = function (message) {
	      var content = null;

	      if (message.c) {
	        content = JSON.parse(message.c);
	      }

	      content && content.events && content.events.map(function (item) {
	        var data = item.userData ? JSON.parse(item.userData) : {};
	        var event = {
	          time: item.time,
	          action: item.action,
	          groupOnlineCount: content.userAmount,
	          groupId: content.groupId,
	          id: item.userId,
	          data: data
	        };
	        im_1.IM.aec.fire(im_api_events_1.ImApiEvents.GROUP_PRESENCE, event);
	      });
	    };

	    return GroupPresenceSubscribe;
	  }();

	  exports["default"] = GroupPresenceSubscribe;
	})(GroupPresenceSubscriber);

	var GroupOnlineCount = {};

	(function (exports) {

	  exports.__esModule = true;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var RocketTypes_1 = RocketTypes;
	  var validator_utils_1 = validatorUtils;
	  var callback_utils_1 = callbackUtils;
	  var g_1 = g;

	  var GroupOnlineCount =
	  /** @class */
	  function () {
	    function GroupOnlineCount() {}

	    GroupOnlineCount.prototype.get = function (options) {
	      validator_utils_1["default"].validateId(options.groupId, 'groupId');
	      options.groupId = options.groupId.toString();
	      var rocket = new Rocket_1["default"]({
	        name: RocketTypes_1.RocketTypes.imGroupOnlineCount,
	        params: {
	          groupId: options.groupId
	        },
	        permission: Permission_1.Permission.READ,
	        singleTimeout: SocketTimeout_1.SocketTimeout.commonQuerySingle,
	        totalTimeout: SocketTimeout_1.SocketTimeout.commonQueryTotal,
	        fail: function fail(e) {
	          callback_utils_1.CallbackUtils.onFailed(options, e || {
	            code: 408,
	            content: 'Failed to query online group users'
	          });
	        },
	        success: function success(result) {
	          if (result.code == 200) {
	            callback_utils_1.CallbackUtils.onSuccess(options, result);
	          } else {
	            callback_utils_1.CallbackUtils.onFailed(options, result);
	          }
	        }
	      });
	      g_1.G.s().emit(rocket);
	    };

	    return GroupOnlineCount;
	  }();

	  exports["default"] = GroupOnlineCount;
	})(GroupOnlineCount);

	var GroupHereNow = {};

	(function (exports) {

	  exports.__esModule = true;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var RocketTypes_1 = RocketTypes;
	  var validator_utils_1 = validatorUtils;
	  var callback_utils_1 = callbackUtils;
	  var g_1 = g;

	  var GroupHereNow =
	  /** @class */
	  function () {
	    function GroupHereNow() {}

	    GroupHereNow.prototype.hereNow = function (options) {
	      validator_utils_1["default"].validateId(options.groupId, 'groupId');
	      options.groupId = options.groupId.toString();
	      var rocket = new Rocket_1["default"]({
	        name: RocketTypes_1.RocketTypes.imGroupHereNow,
	        params: {
	          groupId: options.groupId
	        },
	        permission: Permission_1.Permission.READ,
	        singleTimeout: SocketTimeout_1.SocketTimeout.commonQuerySingle,
	        totalTimeout: SocketTimeout_1.SocketTimeout.commonQueryTotal,
	        fail: function fail(e) {
	          callback_utils_1.CallbackUtils.onFailed(options, {
	            code: e.resultCode || 408,
	            content: e.content || 'Failed to query online group users'
	          });
	        },
	        success: function success(result) {
	          if (result.code == 200) {
	            var content = result.content;
	            result.content = content.map(function (user) {
	              var data = user.userData ? JSON.parse(user.userData) : {};
	              return {
	                id: user.userId,
	                data: data
	              };
	            });
	            callback_utils_1.CallbackUtils.onSuccess(options, result);
	          } else {
	            callback_utils_1.CallbackUtils.onFailed(options, result);
	          }
	        }
	      });
	      g_1.G.s().emit(rocket);
	    };

	    return GroupHereNow;
	  }();

	  exports["default"] = GroupHereNow;
	})(GroupHereNow);

	var UserPresenceSubscriber = {};

	(function (exports) {

	  exports.__esModule = true;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var validator_utils_1 = validatorUtils;
	  var RocketTypes_1 = RocketTypes;
	  var RemoteEvents_1 = RemoteEvents;
	  var im_api_events_1 = imApiEvents;
	  var callback_utils_1 = callbackUtils;
	  var g_1 = g;
	  var im_1 = im;

	  var UserPresenceSubscriber =
	  /** @class */
	  function () {
	    function UserPresenceSubscriber() {
	      g_1.G.s().addMessageObserver(RemoteEvents_1.RemoteEvents.userPresence, this.newMessageReceived.bind(this));
	    }

	    UserPresenceSubscriber.prototype.presence = function (options) {
	      validator_utils_1["default"].validateIdArray(options.userIds, 'userIds');
	      options.userIds.toString().split(',');

	      var success = function success() {
	        callback_utils_1.CallbackUtils.onSuccess(options, {
	          code: 200,
	          content: 'ok'
	        });
	      };

	      var fail = function fail(e) {
	        callback_utils_1.CallbackUtils.onFailed(options, {
	          code: e.code || 408,
	          content: e.content || 'Failed to subscribe group message'
	        });
	      };

	      var params = {
	        userIds: options.userIds
	      };
	      this.emitRocket(RocketTypes_1.RocketTypes.subscribeUserPresence, params, success, fail, SocketTimeout_1.SocketTimeout.commonInfiniteSingle, SocketTimeout_1.SocketTimeout.commonInfiniteTotal);
	    };

	    UserPresenceSubscriber.prototype.unPresence = function (options) {
	      validator_utils_1["default"].validateId(options.userId, 'userId');
	      options.userId = options.userId.toString();

	      var success = function success() {
	        callback_utils_1.CallbackUtils.onSuccess(options, {
	          code: 200,
	          content: 'ok'
	        });
	      };

	      var fail = function fail(e) {
	        callback_utils_1.CallbackUtils.onFailed(options, {
	          code: e.code || 408,
	          content: e.content || 'Failed to unsubscribe presence'
	        });
	      };

	      var params = {
	        userId: options.userId
	      };
	      this.emitRocket(RocketTypes_1.RocketTypes.unsubscribeUserPresence, params, success, fail, SocketTimeout_1.SocketTimeout.commonRequestSingle, SocketTimeout_1.SocketTimeout.commonRequestTotal);
	    };

	    UserPresenceSubscriber.prototype.emitRocket = function (emitType, params, success, fail, singleTimeout, totalTimeout) {
	      var rocket = new Rocket_1["default"]({
	        name: emitType,
	        params: params,
	        singleTimeout: singleTimeout,
	        totalTimeout: totalTimeout,
	        permission: Permission_1.Permission.WRITE,
	        success: success,
	        fail: fail
	      });
	      g_1.G.s().emit(rocket);
	    };

	    UserPresenceSubscriber.prototype.newMessageReceived = function (message) {
	      var events = [];

	      if (message.c) {
	        events = JSON.parse(message.c).events || [];
	      }

	      events.map(function (item) {
	        var data = item.userData ? JSON.parse(item.userData) : {};
	        var event = {
	          time: item.time,
	          action: item.action,
	          id: item.userId,
	          data: data
	        };
	        im_1.IM.aec.fire(im_api_events_1.ImApiEvents.USER_PRESENCE, event);
	      });
	    };

	    return UserPresenceSubscriber;
	  }();

	  exports["default"] = UserPresenceSubscriber;
	})(UserPresenceSubscriber);

	var UserHereNow = {};

	(function (exports) {

	  exports.__esModule = true;
	  var Rocket_1 = Rocket;
	  var Permission_1 = Permission;
	  var SocketTimeout_1 = SocketTimeout;
	  var RocketTypes_1 = RocketTypes;
	  var validator_utils_1 = validatorUtils;
	  var callback_utils_1 = callbackUtils;
	  var g_1 = g;

	  var UserHereNow =
	  /** @class */
	  function () {
	    function UserHereNow() {}

	    UserHereNow.prototype.hereNow = function (options) {
	      var userIds = options.userIds;
	      validator_utils_1["default"].validateIdArray(userIds, 'userIds');
	      userIds.toString().split(',');
	      var rocket = new Rocket_1["default"]({
	        name: RocketTypes_1.RocketTypes.imHereNow,
	        params: options,
	        permission: Permission_1.Permission.READ,
	        singleTimeout: SocketTimeout_1.SocketTimeout.commonQuerySingle,
	        totalTimeout: SocketTimeout_1.SocketTimeout.commonQueryTotal,
	        fail: function fail(e) {
	          callback_utils_1.CallbackUtils.onFailed(options, e);
	        },
	        success: function success(result) {
	          if (result.code == 200) {
	            var content = result.content;
	            result.content = content.map(function (user) {
	              var data = user.userData ? JSON.parse(user.userData) : {};
	              return {
	                id: user.userId,
	                data: data
	              };
	            });
	            callback_utils_1.CallbackUtils.onSuccess(options, result);
	          } else {
	            callback_utils_1.CallbackUtils.onFailed(options, result);
	          }
	        }
	      });
	      g_1.G.s().emit(rocket);
	    };

	    return UserHereNow;
	  }();

	  exports["default"] = UserHereNow;
	})(UserHereNow);

	var IMMessageBuilder$1 = {};

	var WXImagePayloadBuilder = {};

	var Str$1 = {};

	Str$1.__esModule = true;
	Str$1.str = void 0;
	var Calibrator_1$5 = Calibrator;

	var Str =
	/** @class */
	function () {
	  function Str() {}

	  Str.prototype.fileExtension = function (str, type) {
	    if (!Calibrator_1$5["default"].isString(str)) return;

	    try {
	      var strArr = str.split(type);
	      return strArr[strArr.length - 1];
	    } catch (e) {
	      throw Error(e);
	    }
	  };

	  return Str;
	}();

	var str = new Str();
	Str$1.str = str;

	var ImageMessagePayload$1 = {};

	var FileMessagePayload$1 = {};

	var AbstractMessagePayload$1 = {};

	AbstractMessagePayload$1.__esModule = true;
	AbstractMessagePayload$1.AbstractMessagePayload = void 0;

	var AbstractMessagePayload =
	/** @class */
	function () {
	  function AbstractMessagePayload() {}

	  return AbstractMessagePayload;
	}();

	AbstractMessagePayload$1.AbstractMessagePayload = AbstractMessagePayload;

	var __extends$6 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	FileMessagePayload$1.__esModule = true;
	FileMessagePayload$1.FileMessagePayload = void 0;
	var AbstractMessagePayload_1$2 = AbstractMessagePayload$1;

	var FileMessagePayload =
	/** @class */
	function (_super) {
	  __extends$6(FileMessagePayload, _super);

	  function FileMessagePayload() {
	    var _this = _super !== null && _super.apply(this, arguments) || this;

	    _this.contentType = "";
	    _this.name = "";
	    _this.size = 0;
	    _this.url = "";
	    return _this;
	  }

	  return FileMessagePayload;
	}(AbstractMessagePayload_1$2.AbstractMessagePayload);

	FileMessagePayload$1.FileMessagePayload = FileMessagePayload;

	var __extends$5 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	ImageMessagePayload$1.__esModule = true;
	ImageMessagePayload$1.ImageMessagePayload = void 0;
	var FileMessagePayload_1$1 = FileMessagePayload$1;

	var ImageMessagePayload =
	/** @class */
	function (_super) {
	  __extends$5(ImageMessagePayload, _super);

	  function ImageMessagePayload() {
	    var _this = _super !== null && _super.apply(this, arguments) || this;

	    _this.width = 0;
	    _this.height = 0;
	    return _this;
	  }

	  return ImageMessagePayload;
	}(FileMessagePayload_1$1.FileMessagePayload);

	ImageMessagePayload$1.ImageMessagePayload = ImageMessagePayload;

	var WXFilePayloadBuilder = {};

	var AbstractPayloadBuilder$1 = {};

	AbstractPayloadBuilder$1.__esModule = true;
	AbstractPayloadBuilder$1.AbstractPayloadBuilder = void 0;

	var AbstractPayloadBuilder =
	/** @class */
	function () {
	  function AbstractPayloadBuilder() {}

	  AbstractPayloadBuilder.prototype.build = function (buildOptions) {
	    this.validate(buildOptions.createOptions);
	    var messagePayload = this.create();
	    this.setPayload(buildOptions, messagePayload);
	    return messagePayload;
	  };

	  return AbstractPayloadBuilder;
	}();

	AbstractPayloadBuilder$1.AbstractPayloadBuilder = AbstractPayloadBuilder;

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var AbstractPayloadBuilder_1 = AbstractPayloadBuilder$1;
	  var FileMessagePayload_1 = FileMessagePayload$1;
	  var Calibrator_1 = Calibrator;

	  var WXFilePayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(WXFilePayloadBuilder, _super);

	    function WXFilePayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    WXFilePayloadBuilder.prototype.create = function () {
	      return new FileMessagePayload_1.FileMessagePayload();
	    };

	    WXFilePayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      var filePayload = payload;
	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      filePayload.url = file.path;
	      filePayload.name = file.name;
	      filePayload.size = file.size;
	      filePayload.contentType = file.type;
	      buildOptions.complete = Promise.resolve();
	    };

	    WXFilePayloadBuilder.prototype.validate = function (createOptions) {
	      if (!Calibrator_1["default"].isObject(createOptions)) {
	        throw Error('it is an empty message.');
	      }

	      if (!Calibrator_1["default"].isDef(createOptions.file)) {
	        throw Error('file is empty.');
	      }
	    };

	    return WXFilePayloadBuilder;
	  }(AbstractPayloadBuilder_1.AbstractPayloadBuilder);

	  exports["default"] = WXFilePayloadBuilder;
	})(WXFilePayloadBuilder);

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var Str_1 = Str$1;
	  var Calibrator_1 = Calibrator;
	  var ImageMessagePayload_1 = ImageMessagePayload$1;
	  var WXFilePayloadBuilder_1 = WXFilePayloadBuilder;

	  var WXImagePayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(WXImagePayloadBuilder, _super);

	    function WXImagePayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    WXImagePayloadBuilder.prototype.create = function () {
	      return new ImageMessagePayload_1.ImageMessagePayload();
	    };

	    WXImagePayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      _super.prototype.setPayload.call(this, buildOptions, payload);

	      var createOptions = buildOptions.createOptions;
	      var tempFile = createOptions.file;
	      var messagePayload = payload; // wx.chooseImage --> path, wx.chooseMedia --> tempFilePath

	      var path = tempFile.path || tempFile.tempFilePath;
	      var namePath = Calibrator_1["default"].isEmpty(tempFile.name) || tempFile.name === undefined ? path : tempFile.name;
	      messagePayload.name = 'wx-image.' + Str_1.str.fileExtension(namePath, '.');
	      messagePayload.contentType = 'image/' + Str_1.str.fileExtension(namePath, '.');
	      messagePayload.url = path;
	      messagePayload.size = tempFile.size;
	      buildOptions.complete = new Promise(function (resolve, reject) {
	        wx.getImageInfo({
	          src: messagePayload.url,
	          success: function success(res) {
	            messagePayload.width = res.width;
	            messagePayload.height = res.height;
	            resolve();
	          },
	          fail: function fail(err) {
	            reject(err);
	          }
	        });
	      });
	    };

	    WXImagePayloadBuilder.prototype.validate = function (createOptions) {
	      _super.prototype.validate.call(this, createOptions);
	    };

	    return WXImagePayloadBuilder;
	  }(WXFilePayloadBuilder_1["default"]);

	  exports["default"] = WXImagePayloadBuilder;
	})(WXImagePayloadBuilder);

	var WXAudioPayloadBuilder = {};

	var AudioMessagePayload$1 = {};

	var __extends$4 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	AudioMessagePayload$1.__esModule = true;
	AudioMessagePayload$1.AudioMessagePayload = void 0;
	var FileMessagePayload_1 = FileMessagePayload$1;

	var AudioMessagePayload =
	/** @class */
	function (_super) {
	  __extends$4(AudioMessagePayload, _super);

	  function AudioMessagePayload() {
	    var _this = _super !== null && _super.apply(this, arguments) || this;

	    _this.duration = 0;
	    return _this;
	  }

	  return AudioMessagePayload;
	}(FileMessagePayload_1.FileMessagePayload);

	AudioMessagePayload$1.AudioMessagePayload = AudioMessagePayload;

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var AudioMessagePayload_1 = AudioMessagePayload$1;
	  var Calibrator_1 = Calibrator;
	  var Str_1 = Str$1;
	  var WXFilePayloadBuilder_1 = WXFilePayloadBuilder;

	  var WXAudioPayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(WXAudioPayloadBuilder, _super);

	    function WXAudioPayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    WXAudioPayloadBuilder.prototype.create = function () {
	      return new AudioMessagePayload_1.AudioMessagePayload();
	    };

	    WXAudioPayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      _super.prototype.setPayload.call(this, buildOptions, payload);

	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      var audioPayload = payload;
	      var path = file.tempFilePath;
	      var namePath = Calibrator_1["default"].isEmpty(file.name) || file.name == undefined ? path : file.name;
	      var duration = file.duration;
	      var size = file.fileSize;
	      audioPayload.url = path;
	      audioPayload.size = size;
	      audioPayload.duration = duration / 1000;
	      audioPayload.name = 'wx-audio.' + Str_1.str.fileExtension(namePath, '.');
	      audioPayload.contentType = 'audio/' + Str_1.str.fileExtension(namePath, '.');
	      buildOptions.complete = Promise.resolve();
	    };

	    WXAudioPayloadBuilder.prototype.validate = function (createOptions) {
	      _super.prototype.validate.call(this, createOptions);
	    };

	    return WXAudioPayloadBuilder;
	  }(WXFilePayloadBuilder_1["default"]);

	  exports["default"] = WXAudioPayloadBuilder;
	})(WXAudioPayloadBuilder);

	var TextPayloadBuilder$1 = {};

	var TextMessagePayload$1 = {};

	var __extends$3 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	TextMessagePayload$1.__esModule = true;
	TextMessagePayload$1.TextMessagePayload = void 0;
	var AbstractMessagePayload_1$1 = AbstractMessagePayload$1;

	var TextMessagePayload =
	/** @class */
	function (_super) {
	  __extends$3(TextMessagePayload, _super);

	  function TextMessagePayload() {
	    var _this = _super !== null && _super.apply(this, arguments) || this;

	    _this.text = "";
	    return _this;
	  }

	  return TextMessagePayload;
	}(AbstractMessagePayload_1$1.AbstractMessagePayload);

	TextMessagePayload$1.TextMessagePayload = TextMessagePayload;

	var __extends$2 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	TextPayloadBuilder$1.__esModule = true;
	TextPayloadBuilder$1.TextPayloadBuilder = void 0;
	var AbstractPayloadBuilder_1$1 = AbstractPayloadBuilder$1;
	var TextMessagePayload_1 = TextMessagePayload$1;
	var Calibrator_1$4 = Calibrator;

	var TextPayloadBuilder =
	/** @class */
	function (_super) {
	  __extends$2(TextPayloadBuilder, _super);

	  function TextPayloadBuilder() {
	    return _super !== null && _super.apply(this, arguments) || this;
	  }

	  TextPayloadBuilder.prototype.create = function () {
	    return new TextMessagePayload_1.TextMessagePayload();
	  };

	  TextPayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	    var textPayload = payload;
	    var createOptions = buildOptions.createOptions;
	    textPayload.text = createOptions.text;
	    buildOptions.complete = Promise.resolve();
	  };

	  TextPayloadBuilder.prototype.validate = function (createOptions) {
	    if (Calibrator_1$4["default"].isEmpty(createOptions.text)) {
	      throw {
	        code: 400,
	        content: "text is empty"
	      };
	    }

	    if (Calibrator_1$4["default"].isString(createOptions.text)) {
	      if (createOptions.text.trim() === '') {
	        throw {
	          code: 400,
	          content: "text is empty"
	        };
	      }
	    } else {
	      throw {
	        code: 400,
	        content: 'TypeError: text requires string.'
	      };
	    }

	    if (createOptions.text.length > 2500) {
	      throw {
	        code: 400,
	        content: 'Message text over max length 2500'
	      };
	    }
	  };

	  return TextPayloadBuilder;
	}(AbstractPayloadBuilder_1$1.AbstractPayloadBuilder);

	TextPayloadBuilder$1.TextPayloadBuilder = TextPayloadBuilder;

	var WXVideoPayloadBuilder = {};

	var VideoMessagePayload$1 = {};

	var __extends$1 = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	VideoMessagePayload$1.__esModule = true;
	VideoMessagePayload$1.VideoMessagePayload = void 0;
	var AbstractMessagePayload_1 = AbstractMessagePayload$1;

	var VideoMessagePayload =
	/** @class */
	function (_super) {
	  __extends$1(VideoMessagePayload, _super);

	  function VideoMessagePayload() {
	    var _this = _super !== null && _super.apply(this, arguments) || this;

	    _this.video = new GoEasyVideo();
	    _this.thumbnail = new GoEasyThumbnail();
	    return _this;
	  }

	  return VideoMessagePayload;
	}(AbstractMessagePayload_1.AbstractMessagePayload);

	VideoMessagePayload$1.VideoMessagePayload = VideoMessagePayload;

	var GoEasyThumbnail =
	/** @class */
	function () {
	  function GoEasyThumbnail() {
	    this.name = "";
	    this.url = "";
	    this.width = 0;
	    this.height = 0;
	    this.contentType = "";
	  }

	  return GoEasyThumbnail;
	}();

	var GoEasyVideo =
	/** @class */
	function () {
	  function GoEasyVideo() {
	    this.name = "";
	    this.url = "";
	    this.width = 0;
	    this.height = 0;
	    this.contentType = "";
	    this.size = 0;
	    this.duration = 0;
	  }

	  return GoEasyVideo;
	}();

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var VideoMessagePayload_1 = VideoMessagePayload$1;
	  var Calibrator_1 = Calibrator;
	  var Str_1 = Str$1;
	  var AbstractPayloadBuilder_1 = AbstractPayloadBuilder$1;

	  var WXVideoPayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(WXVideoPayloadBuilder, _super);

	    function WXVideoPayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    WXVideoPayloadBuilder.prototype.create = function () {
	      return new VideoMessagePayload_1.VideoMessagePayload();
	    };

	    WXVideoPayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      var videoPayload = payload;
	      var video = videoPayload.video;
	      var thumbnail = videoPayload.thumbnail;
	      var duration = file.duration,
	          height = file.height,
	          size = file.size,
	          tempFilePath = file.tempFilePath,
	          thumbTempFilePath = file.thumbTempFilePath,
	          width = file.width,
	          _a = file.name,
	          name = _a === void 0 ? '' : _a;
	      var videoPath = Calibrator_1["default"].isEmpty(name) ? tempFilePath : name;
	      video.contentType = 'video/' + Str_1.str.fileExtension(videoPath, '.');
	      video.name = 'wx-video.' + Str_1.str.fileExtension(videoPath, '.');
	      video.url = tempFilePath;
	      video.width = thumbnail.width = width;
	      video.height = thumbnail.height = height;
	      video.size = size;
	      video.duration = duration;
	      thumbnail.url = thumbTempFilePath;
	      thumbnail.contentType = 'image/jpg';
	      thumbnail.name = 'wx-thumbnail.jpg';
	      buildOptions.complete = Promise.resolve();
	    };

	    WXVideoPayloadBuilder.prototype.validate = function (createOptions) {
	      if (!Calibrator_1["default"].isObject(createOptions)) {
	        throw Error('it is an empty message.');
	      }

	      if (!Calibrator_1["default"].isDef(createOptions.file)) {
	        throw Error('file is empty.');
	      }
	    };

	    return WXVideoPayloadBuilder;
	  }(AbstractPayloadBuilder_1.AbstractPayloadBuilder);

	  exports["default"] = WXVideoPayloadBuilder;
	})(WXVideoPayloadBuilder);

	var UniAppImagePayloadBuilder = {};

	var UniAppFilePayloadBuilder = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var AbstractPayloadBuilder_1 = AbstractPayloadBuilder$1;
	  var FileMessagePayload_1 = FileMessagePayload$1;
	  var Calibrator_1 = Calibrator;

	  var UniAppFilePayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(UniAppFilePayloadBuilder, _super);

	    function UniAppFilePayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    UniAppFilePayloadBuilder.prototype.create = function () {
	      return new FileMessagePayload_1.FileMessagePayload();
	    };

	    UniAppFilePayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      var filePayload = payload;
	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      filePayload.url = file.fullPath;
	      filePayload.name = file.name;
	      filePayload.size = file.size;
	      /****
	       *  todo: 论证必要性 ，无法标准化，对用户来说也不是刚需
	       *  因为只有h5拿到正确的contentType，小程序和ios/Android都不标准
	       *  小程序中type: png、file，安卓有时能获取到正常的contentType有时不能
	       */

	      filePayload.contentType = file.type;
	      console.log('filePayload file.type', file.type);
	      buildOptions.complete = Promise.resolve();
	    };

	    UniAppFilePayloadBuilder.prototype.validate = function (createOptions) {
	      if (!Calibrator_1["default"].isObject(createOptions)) {
	        throw Error('it is an empty message.');
	      }

	      if (!Calibrator_1["default"].isDef(createOptions.file)) {
	        throw Error('file is empty.');
	      }
	    };

	    return UniAppFilePayloadBuilder;
	  }(AbstractPayloadBuilder_1.AbstractPayloadBuilder);

	  exports["default"] = UniAppFilePayloadBuilder;
	})(UniAppFilePayloadBuilder);

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var Str_1 = Str$1;
	  var Calibrator_1 = Calibrator;
	  var ImageMessagePayload_1 = ImageMessagePayload$1;
	  var UniAppFilePayloadBuilder_1 = UniAppFilePayloadBuilder;

	  var UniAppImagePayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(UniAppImagePayloadBuilder, _super);

	    function UniAppImagePayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    UniAppImagePayloadBuilder.prototype.create = function () {
	      return new ImageMessagePayload_1.ImageMessagePayload();
	    };

	    UniAppImagePayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      var imagePayload = payload;
	      var createOptions = buildOptions.createOptions;
	      var tempFile = createOptions.file;
	      imagePayload.url = tempFile.path;
	      imagePayload.size = tempFile.size;
	      var path = Calibrator_1["default"].isEmpty(tempFile.name) || tempFile.name === undefined ? tempFile.path : tempFile.name;
	      imagePayload.contentType = 'image/' + Str_1.str.fileExtension(path, '.');
	      imagePayload.name = 'uni-image.' + Str_1.str.fileExtension(path, '.');
	      buildOptions.complete = new Promise(function (resolve, reject) {
	        uni.getImageInfo({
	          src: tempFile.path,
	          success: function success(res) {
	            imagePayload.width = res.width;
	            imagePayload.height = res.height;
	            resolve();
	          },
	          fail: function fail(err) {
	            reject(err);
	          }
	        });
	      });
	    };

	    UniAppImagePayloadBuilder.prototype.validate = function (createOptions) {
	      _super.prototype.validate.call(this, createOptions);
	    };

	    return UniAppImagePayloadBuilder;
	  }(UniAppFilePayloadBuilder_1["default"]);

	  exports["default"] = UniAppImagePayloadBuilder;
	})(UniAppImagePayloadBuilder);

	var UniAppAudioPayloadBuilder = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var Calibrator_1 = Calibrator;
	  var Str_1 = Str$1;
	  var AudioMessagePayload_1 = AudioMessagePayload$1;
	  var UniAppFilePayloadBuilder_1 = UniAppFilePayloadBuilder;

	  var UniAppAudioPayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(UniAppAudioPayloadBuilder, _super);

	    function UniAppAudioPayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    UniAppAudioPayloadBuilder.prototype.create = function () {
	      return new AudioMessagePayload_1.AudioMessagePayload();
	    };

	    UniAppAudioPayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      var createOptions = buildOptions.createOptions;
	      var audioPayload = payload;
	      var file = createOptions.file;
	      var path = file.tempFilePath;
	      var namePath = Calibrator_1["default"].isEmpty(file.name) || file.name == undefined ? path : file.name;
	      audioPayload.url = path;
	      audioPayload.name = 'uni-audio.' + Str_1.str.fileExtension(namePath, '.');
	      audioPayload.contentType = 'audio/' + Str_1.str.fileExtension(namePath, '.');
	      buildOptions.complete = new Promise(function (resolve, reject) {
	        uni.getFileInfo({
	          filePath: path,
	          success: function success(res) {
	            var size = res.size;
	            audioPayload.size = size;

	            if (size === 0) {
	              // if res size is 0,innerAudioContext can't callback onCanplay method and onError method
	              resolve();
	            } else {
	              if (Calibrator_1["default"].isDef(createOptions.file.duration)) {
	                //编译成微信小程序
	                audioPayload.duration = createOptions.file.duration / 1000;
	                resolve();
	              } else {
	                //app
	                var innerAudioContext_1 = uni.createInnerAudioContext();
	                innerAudioContext_1.src = path;
	                innerAudioContext_1.onCanplay(function (error) {
	                  if (error.errCode) {
	                    innerAudioContext_1.destroy();
	                    reject(error);
	                  } else {
	                    audioPayload.duration = innerAudioContext_1.duration;
	                    innerAudioContext_1.destroy();
	                    resolve();
	                  }
	                });
	                innerAudioContext_1.onError(function (error) {
	                  innerAudioContext_1.destroy();

	                  if (error.errCode === -99) {
	                    resolve();
	                  } else {
	                    reject(error);
	                  }
	                });
	              }
	            }
	          },
	          fail: function fail(error) {
	            reject(error);
	          }
	        });
	      });
	    };

	    UniAppAudioPayloadBuilder.prototype.validate = function (createOptions) {
	      _super.prototype.validate.call(this, createOptions);
	    };

	    return UniAppAudioPayloadBuilder;
	  }(UniAppFilePayloadBuilder_1["default"]);

	  exports["default"] = UniAppAudioPayloadBuilder;
	})(UniAppAudioPayloadBuilder);

	var UniAppVideoPayloadBuilder = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var Calibrator_1 = Calibrator;
	  var Str_1 = Str$1;
	  var VideoMessagePayload_1 = VideoMessagePayload$1;
	  var AbstractPayloadBuilder_1 = AbstractPayloadBuilder$1;

	  var UniAppVideoPayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(UniAppVideoPayloadBuilder, _super);

	    function UniAppVideoPayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    UniAppVideoPayloadBuilder.prototype.create = function () {
	      return new VideoMessagePayload_1.VideoMessagePayload();
	    };

	    UniAppVideoPayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      var videoPayload = payload;
	      var video = videoPayload.video;
	      var thumbnail = videoPayload.thumbnail;
	      var duration = file.duration,
	          height = file.height,
	          size = file.size,
	          tempFilePath = file.tempFilePath,
	          width = file.width,
	          _a = file.name,
	          name = _a === void 0 ? '' : _a;
	      var path = Calibrator_1["default"].isEmpty(name) ? tempFilePath : name;
	      video.size = size;
	      video.width = width;
	      video.height = height;
	      video.url = tempFilePath;
	      video.duration = duration;
	      video.contentType = 'video/' + Str_1.str.fileExtension(path, '.');
	      video.name = 'uni-video.' + Str_1.str.fileExtension(path, '.');
	      thumbnail.url = tempFilePath;
	      thumbnail.width = width;
	      thumbnail.height = height;
	      thumbnail.contentType = 'image/jpg';
	      thumbnail.name = 'uni-thumbnail.jpg';
	      buildOptions.complete = Promise.resolve();
	    };

	    UniAppVideoPayloadBuilder.prototype.validate = function (createOptions) {
	      if (!Calibrator_1["default"].isObject(createOptions)) {
	        throw Error('it is an empty message.');
	      }

	      if (!Calibrator_1["default"].isDef(createOptions.file)) {
	        throw Error('file is empty.');
	      }
	    };

	    return UniAppVideoPayloadBuilder;
	  }(AbstractPayloadBuilder_1.AbstractPayloadBuilder);

	  exports["default"] = UniAppVideoPayloadBuilder;
	})(UniAppVideoPayloadBuilder);

	var HTMLImagePayloadBuilder = {};

	var HTMLFilePayloadBuilder = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var AbstractPayloadBuilder_1 = AbstractPayloadBuilder$1;
	  var FileMessagePayload_1 = FileMessagePayload$1;
	  var Calibrator_1 = Calibrator;

	  var HTMLFilePayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(HTMLFilePayloadBuilder, _super);

	    function HTMLFilePayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    HTMLFilePayloadBuilder.prototype.create = function () {
	      return new FileMessagePayload_1.FileMessagePayload();
	    };

	    HTMLFilePayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      var filePayload = payload;
	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      var url = window.URL || window.webkitURL;
	      filePayload.url = url.createObjectURL(file);
	      filePayload.name = file.name;
	      filePayload.size = file.size;
	      filePayload.contentType = file.type;
	    };

	    HTMLFilePayloadBuilder.prototype.validate = function (createOptions) {
	      if (!Calibrator_1["default"].isObject(createOptions)) {
	        throw Error('it is an empty message.');
	      }

	      if (!(createOptions.file instanceof File)) {
	        throw Error('wrong file type.');
	      }

	      if (createOptions.file.size == 0) {
	        throw Error('File size is 0.');
	      }

	      if (createOptions.file.size > 500 * 1024 * 1024) {
	        throw Error('message-length limit 30mib');
	      }
	    };

	    return HTMLFilePayloadBuilder;
	  }(AbstractPayloadBuilder_1.AbstractPayloadBuilder);

	  exports["default"] = HTMLFilePayloadBuilder;
	})(HTMLFilePayloadBuilder);

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var ImageMessagePayload_1 = ImageMessagePayload$1;
	  var HTMLFilePayloadBuilder_1 = HTMLFilePayloadBuilder;

	  var HTMLImagePayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(HTMLImagePayloadBuilder, _super);

	    function HTMLImagePayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    HTMLImagePayloadBuilder.prototype.create = function () {
	      return new ImageMessagePayload_1.ImageMessagePayload();
	    };

	    HTMLImagePayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      _super.prototype.setPayload.call(this, buildOptions, payload);

	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      var imagePayLoad = payload;
	      var url = window.URL || window.webkitURL;
	      var img = new Image();
	      img.src = url.createObjectURL(file);
	      buildOptions.complete = new Promise(function (resolve, reject) {
	        img.onload = function () {
	          imagePayLoad.width = img.width;
	          imagePayLoad.height = img.height;
	          url.revokeObjectURL(img.src);
	          resolve();
	        };

	        img.onerror = function (error) {
	          url.revokeObjectURL(img.src);
	          reject(error);
	        };
	      });
	    };

	    HTMLImagePayloadBuilder.prototype.validate = function (createOptions) {
	      _super.prototype.validate.call(this, createOptions);

	      var supportTypes = ['gif', 'jpg', 'png', 'jpeg'];

	      if (!supportTypes.find(function (item) {
	        return item === createOptions.file.type.split('/')[1].toLowerCase();
	      })) {
	        throw Error('Only ' + supportTypes.join(',') + " is supported image.");
	      }
	    };

	    return HTMLImagePayloadBuilder;
	  }(HTMLFilePayloadBuilder_1["default"]);

	  exports["default"] = HTMLImagePayloadBuilder;
	})(HTMLImagePayloadBuilder);

	var HTMLAudioPayloadBuilder = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var AudioMessagePayload_1 = AudioMessagePayload$1;
	  var HTMLFilePayloadBuilder_1 = HTMLFilePayloadBuilder;

	  var HTMLAudioPayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(HTMLAudioPayloadBuilder, _super);

	    function HTMLAudioPayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    HTMLAudioPayloadBuilder.prototype.create = function () {
	      return new AudioMessagePayload_1.AudioMessagePayload();
	    };

	    HTMLAudioPayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      _super.prototype.setPayload.call(this, buildOptions, payload);

	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      var audioPayLoad = payload;
	      var url = window.URL || window.webkitURL;
	      var audio = document.createElement('audio');
	      audio.src = url.createObjectURL(file);
	      buildOptions.complete = new Promise(function (resolve, reject) {
	        audio.onloadedmetadata = function () {
	          audioPayLoad.duration = audio.duration;
	          url.revokeObjectURL(audio.src);
	          resolve();
	        };

	        audio.onerror = function (error) {
	          url.revokeObjectURL(audio.src);
	          reject(error);
	        };
	      });
	    };

	    HTMLAudioPayloadBuilder.prototype.validate = function (createOptions) {
	      _super.prototype.validate.call(this, createOptions);

	      var supportTypes = ['mp3', 'ogg', 'wav', 'wma', 'ape', 'acc', 'mpeg'];

	      if (!supportTypes.find(function (item) {
	        return item === createOptions.file.type.split('/')[1].toLowerCase();
	      })) {
	        throw Error('Only ' + supportTypes.join(',') + " is supported audio.");
	      }
	    };

	    return HTMLAudioPayloadBuilder;
	  }(HTMLFilePayloadBuilder_1["default"]);

	  exports["default"] = HTMLAudioPayloadBuilder;
	})(HTMLAudioPayloadBuilder);

	var HTMLVideoPayloadBuilder = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var VideoMessagePayload_1 = VideoMessagePayload$1;
	  var AbstractPayloadBuilder_1 = AbstractPayloadBuilder$1;
	  var Calibrator_1 = Calibrator;

	  var HTMLVideoPayloadBuilder =
	  /** @class */
	  function (_super) {
	    __extends(HTMLVideoPayloadBuilder, _super);

	    function HTMLVideoPayloadBuilder() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    HTMLVideoPayloadBuilder.prototype.create = function () {
	      return new VideoMessagePayload_1.VideoMessagePayload();
	    };

	    HTMLVideoPayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	      var _this = this;

	      var createOptions = buildOptions.createOptions;
	      var file = createOptions.file;
	      var videoPayLoad = payload;
	      var video = videoPayLoad.video;
	      var thumbnail = videoPayLoad.thumbnail;
	      var url = window.URL || window.webkitURL;
	      var videoElement = document.createElement('video');
	      videoElement.src = url.createObjectURL(file);
	      video.size = file.size;
	      video.name = file.name;
	      video.contentType = file.type;
	      video.url = videoElement.src;
	      thumbnail.name = file.name;
	      thumbnail.contentType = 'image/jpg';
	      buildOptions.complete = new Promise(function (resolve, reject) {
	        videoElement.onloadedmetadata = function () {
	          video.duration = videoElement.duration;
	          video.width = videoElement.videoWidth;
	          video.height = videoElement.videoHeight;
	          thumbnail.width = videoElement.videoWidth;
	          thumbnail.height = videoElement.videoHeight;
	          thumbnail.url = _this.getThumbnailUrl(videoElement);
	          url.revokeObjectURL(videoElement.src);
	          resolve();
	        };

	        videoElement.onerror = function (error) {
	          url.revokeObjectURL(videoElement.src);
	          reject(error);
	        };
	      });
	    };

	    HTMLVideoPayloadBuilder.prototype.getThumbnailUrl = function (video) {
	      var canvas = document.createElement("canvas");
	      canvas.width = video.videoWidth;
	      canvas.height = video.videoHeight;
	      canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
	      return canvas.toDataURL("image/png");
	    };

	    HTMLVideoPayloadBuilder.prototype.validate = function (createOptions) {
	      if (!Calibrator_1["default"].isObject(createOptions)) {
	        throw Error('it is an empty message.');
	      }

	      if (!(createOptions.file instanceof File)) {
	        throw Error('wrong file type.');
	      }

	      if (createOptions.file.size == 0) {
	        throw Error('File size is 0.');
	      }

	      if (createOptions.file.size > 30 * 1024 * 1024) {
	        throw Error('message-length limit 30mib');
	      }

	      var supportTypes = ['avi', 'mov', 'rmvb', 'rm', 'flv', 'mp4', '3gp', 'quicktime'];

	      if (!supportTypes.find(function (item) {
	        return item === createOptions.file.type.split('/')[1].toLowerCase();
	      })) {
	        throw Error('Only ' + supportTypes.join(',') + " is supported video.");
	      }
	    };

	    return HTMLVideoPayloadBuilder;
	  }(AbstractPayloadBuilder_1.AbstractPayloadBuilder);

	  exports["default"] = HTMLVideoPayloadBuilder;
	})(HTMLVideoPayloadBuilder);

	var CustomPayloadBuilder$1 = {};

	var CustomMessagePayload = {};

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  var AbstractMessagePayload_1 = AbstractMessagePayload$1;

	  var CustomMessagePayload =
	  /** @class */
	  function (_super) {
	    __extends(CustomMessagePayload, _super);

	    function CustomMessagePayload() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    return CustomMessagePayload;
	  }(AbstractMessagePayload_1.AbstractMessagePayload);

	  exports["default"] = CustomMessagePayload;
	})(CustomMessagePayload);

	var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	  var _extendStatics = function extendStatics(d, b) {
	    _extendStatics = Object.setPrototypeOf || {
	      __proto__: []
	    } instanceof Array && function (d, b) {
	      d.__proto__ = b;
	    } || function (d, b) {
	      for (var p in b) {
	        if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	      }
	    };

	    return _extendStatics(d, b);
	  };

	  return function (d, b) {
	    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	    _extendStatics(d, b);

	    function __() {
	      this.constructor = d;
	    }

	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	  };
	}();

	CustomPayloadBuilder$1.__esModule = true;
	CustomPayloadBuilder$1.CustomPayloadBuilder = void 0;
	var AbstractPayloadBuilder_1 = AbstractPayloadBuilder$1;
	var CustomMessagePayload_1 = CustomMessagePayload;
	var Calibrator_1$3 = Calibrator;

	var CustomPayloadBuilder =
	/** @class */
	function (_super) {
	  __extends(CustomPayloadBuilder, _super);

	  function CustomPayloadBuilder() {
	    return _super !== null && _super.apply(this, arguments) || this;
	  }

	  CustomPayloadBuilder.prototype.create = function () {
	    return new CustomMessagePayload_1["default"]();
	  };

	  CustomPayloadBuilder.prototype.setPayload = function (buildOptions, payload) {
	    var customMessageOptions = buildOptions.createOptions;
	    var customMessagePayLoad = payload;
	    customMessagePayLoad.payload = customMessageOptions.payload;
	    buildOptions.complete = Promise.resolve();
	  };

	  CustomPayloadBuilder.prototype.validate = function (createOptions) {
	    var type = createOptions.type;
	    var payload = createOptions.payload;

	    if (Calibrator_1$3["default"].isEmpty(type)) {
	      throw Error('type is empty.');
	    }

	    if (!Calibrator_1$3["default"].isString(type)) {
	      throw Error('type require a string');
	    }

	    if (Calibrator_1$3["default"].isEmpty(payload)) {
	      throw Error('payload is empty.');
	    }

	    if (!Calibrator_1$3["default"].isPlainObject(payload) && !Calibrator_1$3["default"].isStringOrNumber(payload)) {
	      throw Error('payload require object | string | number.');
	    }
	  };

	  return CustomPayloadBuilder;
	}(AbstractPayloadBuilder_1.AbstractPayloadBuilder);

	CustomPayloadBuilder$1.CustomPayloadBuilder = CustomPayloadBuilder;

	var LocalIMMessageBuildOptions$1 = {};

	LocalIMMessageBuildOptions$1.__esModule = true;
	LocalIMMessageBuildOptions$1.LocalIMMessageBuildOptions = void 0;

	var LocalIMMessageBuildOptions =
	/** @class */
	function () {
	  function LocalIMMessageBuildOptions(type, createOptions) {
	    this.type = type;
	    this.createOptions = createOptions;
	  }

	  return LocalIMMessageBuildOptions;
	}();

	LocalIMMessageBuildOptions$1.LocalIMMessageBuildOptions = LocalIMMessageBuildOptions;

	IMMessageBuilder$1.__esModule = true;
	IMMessageBuilder$1.IMMessageBuilder = void 0;
	var framework_detector_1 = frameworkDetector;
	var WXImagePayloadBuilder_1 = WXImagePayloadBuilder;
	var WXFilePayloadBuilder_1 = WXFilePayloadBuilder;
	var WXAudioPayloadBuilder_1 = WXAudioPayloadBuilder;
	var TextPayloadBuilder_1 = TextPayloadBuilder$1;
	var WXVideoPayloadBuilder_1 = WXVideoPayloadBuilder;
	var UniAppImagePayloadBuilder_1 = UniAppImagePayloadBuilder;
	var UniAppFilePayloadBuilder_1 = UniAppFilePayloadBuilder;
	var UniAppAudioPayloadBuilder_1 = UniAppAudioPayloadBuilder;
	var UniAppVideoPayloadBuilder_1 = UniAppVideoPayloadBuilder;
	var HTMLImagePayloadBuilder_1 = HTMLImagePayloadBuilder;
	var HTMLFilePayloadBuilder_1 = HTMLFilePayloadBuilder;
	var HTMLAudioPayloadBuilder_1 = HTMLAudioPayloadBuilder;
	var HTMLVideoPayloadBuilder_1 = HTMLVideoPayloadBuilder;
	var CustomPayloadBuilder_1 = CustomPayloadBuilder$1;
	var LocalIMMessageBuildOptions_1 = LocalIMMessageBuildOptions$1;
	var UUID_1 = UUID;
	var Calibrator_1$2 = Calibrator;
	var GoEasy_1$1 = GoEasy$1;
	var GroupMessage_1 = GroupMessage$1;
	var PrivateMessage_1 = PrivateMessage$1;
	var validator_utils_1$4 = validatorUtils;
	var cs_message_1 = csMessage;
	var callback_utils_1$4 = callbackUtils;
	var g_1$3 = g;

	var IMMessageBuilder =
	/** @class */
	function () {
	  function IMMessageBuilder() {
	    var _a;

	    this.framework = framework_detector_1.FrameworkDetector.currentFramework();
	    this.payloadBuilders = (_a = {}, _a[framework_detector_1.Framework.UNIAPP] = {
	      image: new UniAppImagePayloadBuilder_1["default"](),
	      file: new UniAppFilePayloadBuilder_1["default"](),
	      audio: new UniAppAudioPayloadBuilder_1["default"](),
	      video: new UniAppVideoPayloadBuilder_1["default"](),
	      text: new TextPayloadBuilder_1.TextPayloadBuilder()
	    }, _a[framework_detector_1.Framework.NATIVE_APPLET_WX] = {
	      image: new WXImagePayloadBuilder_1["default"](),
	      file: new WXFilePayloadBuilder_1["default"](),
	      audio: new WXAudioPayloadBuilder_1["default"](),
	      video: new WXVideoPayloadBuilder_1["default"](),
	      text: new TextPayloadBuilder_1.TextPayloadBuilder()
	    }, _a[framework_detector_1.Framework.UNKNOWN] = {
	      image: new HTMLImagePayloadBuilder_1["default"](),
	      file: new HTMLFilePayloadBuilder_1["default"](),
	      audio: new HTMLAudioPayloadBuilder_1["default"](),
	      video: new HTMLVideoPayloadBuilder_1["default"](),
	      text: new TextPayloadBuilder_1.TextPayloadBuilder()
	    }, _a);
	  }

	  IMMessageBuilder.prototype.buildMessage = function (type, createOptions) {
	    var payloadBuilder = this.payloadBuilders[this.framework][type];
	    var buildOptions = new LocalIMMessageBuildOptions_1.LocalIMMessageBuildOptions(type, createOptions);

	    if (payloadBuilder) {
	      var payload = payloadBuilder.build(buildOptions);
	      buildOptions.payload = payload;
	    } else {
	      var customPayloadBuilder = new CustomPayloadBuilder_1.CustomPayloadBuilder();
	      var payload = customPayloadBuilder.build(buildOptions);
	      buildOptions.payload = payload.payload;
	    }

	    var message = this.build(buildOptions);
	    buildOptions.complete.then(function () {
	      callback_utils_1$4.CallbackUtils.onSuccess(createOptions, message);
	    })["catch"](function (e) {
	      callback_utils_1$4.CallbackUtils.onFailed(createOptions, e);
	    });
	    return message;
	  };

	  IMMessageBuilder.prototype.build = function (buildOptions) {
	    var type = buildOptions.type;
	    var payload = buildOptions.payload;
	    var createOptions = buildOptions.createOptions;
	    var to = createOptions.to;
	    var scene = to.type;
	    this.validate(createOptions);
	    var message;

	    if (scene === GoEasy_1$1.Scene.GROUP) {
	      message = new GroupMessage_1.GroupMessage();
	      message.groupId = to.id.toString();
	      message.senderData = g_1$3.G.ud();
	    } else if (scene === GoEasy_1$1.Scene.PRIVATE) {
	      message = new PrivateMessage_1.PrivateMessage();
	      message.read = false;
	      message.receiverId = to.id.toString();
	    } else if (scene === GoEasy_1$1.Scene.CS) {
	      message = new cs_message_1.CSMessage();
	      message.to = to.id.toString();
	      message.teamId = to.id.toString();
	      message.senderData = g_1$3.G.ud();
	    }

	    message.senderId = g_1$3.G.u();
	    message.messageId = UUID_1["default"].get();
	    message.payload = payload;
	    message.timestamp = Date.now();
	    message.type = type;
	    message.recalled = false;
	    message.status = GoEasy_1$1.MessageStatus.NEW;
	    message.buildOptions = buildOptions;
	    return message;
	  };

	  IMMessageBuilder.prototype.validate = function (createOptions) {
	    var to = createOptions.to;

	    if (!to) {
	      throw new Error("message require property to.");
	    }

	    if (!Calibrator_1$2["default"].isObject(to)) {
	      throw new Error("TypeError: to requires an object.");
	    }

	    if (!Calibrator_1$2["default"].isObject(to.data)) {
	      throw new Error("TypeError: to.data requires an object.");
	    }

	    if (!to.type || to.type !== GoEasy_1$1.Scene.GROUP && to.type !== GoEasy_1$1.Scene.PRIVATE && to.type !== GoEasy_1$1.Scene.CS) {
	      throw new Error("message require property to.type");
	    }

	    if (Calibrator_1$2["default"].isEmpty(to.id)) {
	      throw new Error("message require property to.id");
	    }

	    if (!Calibrator_1$2["default"].isStringOrNumber(to.id)) {
	      throw new Error("to.id should be a string or number.");
	    }

	    if (g_1$3.G.u() === to.id) {
	      throw new Error("to.id can not be the same as your id.");
	    }

	    if (createOptions.notification) {
	      validator_utils_1$4["default"].validateNotification(createOptions.notification);
	    }

	    if (createOptions.wx_mp_template_msg) {
	      validator_utils_1$4["default"].validateWXMPTemplateMsg(createOptions.wx_mp_template_msg);
	    }
	  };

	  return IMMessageBuilder;
	}();

	IMMessageBuilder$1.IMMessageBuilder = IMMessageBuilder;

	var __awaiter$1 = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	  function adopt(value) {
	    return value instanceof P ? value : new P(function (resolve) {
	      resolve(value);
	    });
	  }

	  return new (P || (P = Promise))(function (resolve, reject) {
	    function fulfilled(value) {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function rejected(value) {
	      try {
	        step(generator["throw"](value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function step(result) {
	      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	    }

	    step((generator = generator.apply(thisArg, _arguments || [])).next());
	  });
	};

	var __generator$1 = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	  var _ = {
	    label: 0,
	    sent: function sent() {
	      if (t[0] & 1) throw t[1];
	      return t[1];
	    },
	    trys: [],
	    ops: []
	  },
	      f,
	      y,
	      t,
	      g;
	  return g = {
	    next: verb(0),
	    "throw": verb(1),
	    "return": verb(2)
	  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	    return this;
	  }), g;

	  function verb(n) {
	    return function (v) {
	      return step([n, v]);
	    };
	  }

	  function step(op) {
	    if (f) throw new TypeError("Generator is already executing.");

	    while (_) {
	      try {
	        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	        if (y = 0, t) op = [op[0] & 2, t.value];

	        switch (op[0]) {
	          case 0:
	          case 1:
	            t = op;
	            break;

	          case 4:
	            _.label++;
	            return {
	              value: op[1],
	              done: false
	            };

	          case 5:
	            _.label++;
	            y = op[1];
	            op = [0];
	            continue;

	          case 7:
	            op = _.ops.pop();

	            _.trys.pop();

	            continue;

	          default:
	            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	              _ = 0;
	              continue;
	            }

	            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	              _.label = op[1];
	              break;
	            }

	            if (op[0] === 6 && _.label < t[1]) {
	              _.label = t[1];
	              t = op;
	              break;
	            }

	            if (t && _.label < t[2]) {
	              _.label = t[2];

	              _.ops.push(op);

	              break;
	            }

	            if (t[2]) _.ops.pop();

	            _.trys.pop();

	            continue;
	        }

	        op = body.call(thisArg, _);
	      } catch (e) {
	        op = [6, e];
	        y = 0;
	      } finally {
	        f = t = 0;
	      }
	    }

	    if (op[0] & 5) throw op[1];
	    return {
	      value: op[0] ? op[1] : void 0,
	      done: true
	    };
	  }
	};

	im.__esModule = true;
	im.IM = void 0;
	var api_event_center_1 = apiEventCenter;
	var GoEasyUploader_1 = GoEasyUploader$1;
	var IMMessageSender_1 = IMMessageSender;
	var conversation_list_1 = conversationList;
	var IMReceiver_1 = IMReceiver;
	var GroupMessageSubscriber_1 = GroupMessageSubscriber;
	var GroupPresenceSubscriber_1 = GroupPresenceSubscriber;
	var GroupOnlineCount_1 = GroupOnlineCount;
	var GroupHereNow_1 = GroupHereNow;
	var UserPresenceSubscriber_1 = UserPresenceSubscriber;
	var UserHereNow_1 = UserHereNow;
	var Calibrator_1$1 = Calibrator;
	var ModuleTypes_1 = ModuleTypes;
	var validator_utils_1$3 = validatorUtils;
	var callback_utils_1$3 = callbackUtils;
	var IMMessageBuilder_1 = IMMessageBuilder$1;
	var MessageType_1 = MessageType;
	var histories_1 = histories;
	var g_1$2 = g;

	var IM =
	/** @class */
	function () {
	  function IM(options) {
	    this._iMReceiver = new IMReceiver_1["default"]();
	    this.options = options;
	    IM.aec = new api_event_center_1.ApiEventCenter();
	    this._userHereNow = new UserHereNow_1["default"]();
	    this.goEasyUploader = new GoEasyUploader_1.GoEasyUploader();
	    this._groupHereNow = new GroupHereNow_1["default"]();
	    this._groupOnlineCount = new GroupOnlineCount_1["default"]();
	    this.groupMessageSubscriber = new GroupMessageSubscriber_1["default"]();
	  }

	  IM.init = function (options) {
	    IM.instance = new IM(options);
	  };

	  IM.prototype.afterConnect = function () {
	    this._iMReceiver.initialGoEasySocket();

	    this.messageBuilder = new IMMessageBuilder_1.IMMessageBuilder();
	    this.messageSender = new IMMessageSender_1["default"]();
	    this.histories = histories_1["default"].init();
	    this.histories.initialListeners();
	    this.conversations = new conversation_list_1["default"]();
	    this._groupPresenceSubscriber = new GroupPresenceSubscriber_1["default"]();
	    this._userPresenceSubscriber = new UserPresenceSubscriber_1["default"]();
	  }; // todo: 函数名


	  IM.prototype.validateModules = function () {
	    if (Calibrator_1$1["default"].isUndef(g_1$2.G.s())) {
	      throw Error('Please call connect() first.');
	    }

	    if (!this.options.modules || !this.options.modules.includes(ModuleTypes_1.ModuleTypes.IM)) {
	      throw Error("Invalid options: module '".concat(ModuleTypes_1.ModuleTypes.IM, "' is not enabled"));
	    }
	  };

	  IM.prototype["catch"] = function (functionObj, callbackOptions) {
	    return __awaiter$1(this, void 0, void 0, function () {
	      var err_1;
	      return __generator$1(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            _a.trys.push([0, 2,, 3]);

	            this.validateModules();
	            validator_utils_1$3["default"].validateCallbackOptions(callbackOptions);
	            return [4
	            /*yield*/
	            , functionObj()];

	          case 1:
	            _a.sent();

	            return [3
	            /*break*/
	            , 3];

	          case 2:
	            err_1 = _a.sent();
	            callback_utils_1$3.CallbackUtils.onFailed(callbackOptions, err_1);
	            return [3
	            /*break*/
	            , 3];

	          case 3:
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  }; // ----------- External API ----------


	  IM.prototype.on = function (event, callBack) {
	    IM.aec.on(event, callBack);
	  };

	  IM.prototype.off = function (event, callBack) {
	    IM.aec.off(event, callBack);
	  };

	  IM.prototype.createTextMessage = function (createOptions) {
	    this.validateModules();
	    return this.messageBuilder.buildMessage(MessageType_1.MessageType.TEXT, createOptions);
	  };

	  IM.prototype.createImageMessage = function (createOptions) {
	    this.validateModules();
	    return this.messageBuilder.buildMessage(MessageType_1.MessageType.IMAGE, createOptions);
	  };

	  IM.prototype.createFileMessage = function (createOptions) {
	    this.validateModules();
	    return this.messageBuilder.buildMessage(MessageType_1.MessageType.FILE, createOptions);
	  };

	  IM.prototype.createAudioMessage = function (createOptions) {
	    this.validateModules();
	    return this.messageBuilder.buildMessage(MessageType_1.MessageType.AUDIO, createOptions);
	  };

	  IM.prototype.createVideoMessage = function (createOptions) {
	    this.validateModules();
	    return this.messageBuilder.buildMessage(MessageType_1.MessageType.VIDEO, createOptions);
	  };

	  IM.prototype.createCustomMessage = function (createOptions) {
	    this.validateModules();
	    return this.messageBuilder.buildMessage(createOptions.type, createOptions);
	  };

	  IM.prototype.sendMessage = function (sendOptions) {
	    var _this = this;

	    this["catch"](function () {
	      _this.messageSender.send(sendOptions);
	    }, sendOptions);
	  };

	  IM.prototype.recallMessage = function (messageRecallOptions) {
	    var _this = this;

	    this["catch"](function () {
	      _this.histories.recallMessage(messageRecallOptions);
	    }, messageRecallOptions);
	  };

	  IM.prototype.deleteMessage = function (messageDeleteOptions) {
	    var _this = this;

	    this["catch"](function () {
	      _this.histories.deleteMessage(messageDeleteOptions);
	    }, messageDeleteOptions);
	  };

	  IM.prototype.markGroupMessageAsRead = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return __awaiter$1(_this, void 0, void 0, function () {
	        return __generator$1(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              return [4
	              /*yield*/
	              , this.histories.groupMarkAsRead(options)];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    }, options);
	  };

	  IM.prototype.markPrivateMessageAsRead = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return __awaiter$1(_this, void 0, void 0, function () {
	        return __generator$1(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              return [4
	              /*yield*/
	              , this.histories.privateMarkAsRead(options)];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    }, options);
	  };

	  IM.prototype.markMessageAsRead = function (option, teamId) {
	    var _this = this;

	    this["catch"](function () {
	      return __awaiter$1(_this, void 0, void 0, function () {
	        return __generator$1(this, function (_a) {
	          switch (_a.label) {
	            case 0:
	              return [4
	              /*yield*/
	              , this.histories.markMessageAsRead(option, teamId)];

	            case 1:
	              _a.sent();

	              return [2
	              /*return*/
	              ];
	          }
	        });
	      });
	    }, option);
	  };

	  IM.prototype.latestConversations = function (options) {
	    this.validateModules();
	    this.conversations.latestConversations(options);
	  };

	  IM.prototype.removePrivateConversation = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this.conversations.removePrivateConversation(options);
	    }, options);
	  };

	  IM.prototype.removeGroupConversation = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this.conversations.removeGroupConversation(options);
	    }, options);
	  };

	  IM.prototype.topPrivateConversation = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this.conversations.topPrivateConversation(options);
	    }, options);
	  };

	  IM.prototype.topGroupConversation = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this.conversations.topGroupConversation(options);
	    }, options);
	  };

	  IM.prototype.history = function (options, teamId) {
	    var _this = this;

	    this["catch"](function () {
	      _this.histories.loadHistory(options, teamId);
	    }, options);
	  };

	  IM.prototype.subscribeUserPresence = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this._userPresenceSubscriber.presence(options);
	    }, options);
	  };

	  IM.prototype.unsubscribeUserPresence = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this._userPresenceSubscriber.unPresence(options);
	    }, options);
	  };

	  IM.prototype.hereNow = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this._userHereNow.hereNow(options);
	    }, options);
	  };

	  IM.prototype.subscribeGroup = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this.groupMessageSubscriber.subscribe(options);
	    }, options);
	  };

	  IM.prototype.unsubscribeGroup = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this.groupMessageSubscriber.unsubscribe(options);
	    }, options);
	  };

	  IM.prototype.subscribeGroupPresence = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this._groupPresenceSubscriber.presence(options);
	    }, options);
	  };

	  IM.prototype.unsubscribeGroupPresence = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this._groupPresenceSubscriber.unPresence(options);
	    }, options);
	  };

	  IM.prototype.groupHereNow = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this._groupHereNow.hereNow(options);
	    }, options);
	  };

	  IM.prototype.groupOnlineCount = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      return _this._groupOnlineCount.get(options);
	    }, options);
	  };

	  IM.prototype.latestPendingConversations = function (options) {
	    this.validateModules();
	    this.conversations.latestPendingConversations(options);
	  };

	  IM.prototype.topConversation = function (options) {
	    this.validateModules();
	    this.conversations.topConversation(options);
	  };

	  IM.prototype.removeConversation = function (options) {
	    this.validateModules();
	    this.conversations.removeConversation(options);
	  };

	  return IM;
	}();

	im.IM = IM;

	var mediaType = {};

	(function (exports) {

	  exports.__esModule = true;
	  exports.MediaType = void 0;

	  (function (MediaType) {
	    MediaType["VIDEO"] = "VIDEO";
	    MediaType["VOICE"] = "VOICE";
	  })(exports.MediaType || (exports.MediaType = {}));
	})(mediaType);

	var cs = {};

	var team = {};

	var conversationHandler = {};

	var csStatusQueryRequest = {};

	csStatusQueryRequest.__esModule = true;
	csStatusQueryRequest.CSStatusQueryRequest = void 0;

	var CSStatusQueryRequest =
	/** @class */
	function () {
	  function CSStatusQueryRequest(customerId, teamId) {
	    this.customerId = customerId;
	    this.teamId = teamId;
	  }

	  return CSStatusQueryRequest;
	}();

	csStatusQueryRequest.CSStatusQueryRequest = CSStatusQueryRequest;

	var csAcceptRequest = {};

	csAcceptRequest.__esModule = true;
	csAcceptRequest.CSAcceptRequest = void 0;

	var CSAcceptRequest =
	/** @class */
	function () {
	  function CSAcceptRequest(customerId, teamId) {
	    this.customerId = customerId;
	    this.teamId = teamId;
	  }

	  return CSAcceptRequest;
	}();

	csAcceptRequest.CSAcceptRequest = CSAcceptRequest;

	var csTransferRequest = {};

	csTransferRequest.__esModule = true;
	csTransferRequest.CSTransferRequest = void 0;

	var CSTransferRequest =
	/** @class */
	function () {
	  function CSTransferRequest(customerId, teamId, to) {
	    this.customerId = customerId;
	    this.teamId = teamId;
	    this.to = to;
	  }

	  return CSTransferRequest;
	}();

	csTransferRequest.CSTransferRequest = CSTransferRequest;

	conversationHandler.__esModule = true;
	conversationHandler.ConversationHandler = void 0;
	var cs_status_query_request_1 = csStatusQueryRequest;
	var cs_accept_request_1 = csAcceptRequest;
	var validator_utils_1$2 = validatorUtils;
	var Rocket_1$1 = Rocket;
	var RocketTypes_1$1 = RocketTypes;
	var Permission_1$1 = Permission;
	var SocketTimeout_1$1 = SocketTimeout;
	var callback_utils_1$2 = callbackUtils;
	var g_1$1 = g;
	var goeasy_event_center_1$1 = goeasyEventCenter;
	var internal_events_1$1 = internalEvents;
	var remote_abbr_message_builder_1 = remoteAbbrMessageBuilder;
	var cs_transfer_request_1 = csTransferRequest;

	var ConversationHandler =
	/** @class */
	function () {
	  function ConversationHandler() {
	    this.builder = new remote_abbr_message_builder_1.RemoteAbbrMessageBuilder();
	  }

	  ConversationHandler.getInstance = function () {
	    if (!ConversationHandler.instance) {
	      ConversationHandler.instance = new ConversationHandler();
	    }

	    return ConversationHandler.instance;
	  };

	  ConversationHandler.prototype.accept = function (teamId, options) {
	    var _this = this;

	    this.validate(options);
	    var id = options.id;
	    var customerId = id.toString();
	    var request = new cs_accept_request_1.CSAcceptRequest(customerId, teamId);
	    var rocket = new Rocket_1$1["default"]({
	      name: RocketTypes_1$1.RocketTypes.CS_ACCEPT,
	      params: request,
	      permission: Permission_1$1.Permission.WRITE,
	      singleTimeout: SocketTimeout_1$1.SocketTimeout.commonRequestSingle,
	      totalTimeout: SocketTimeout_1$1.SocketTimeout.commonRequestTotal,
	      fail: function fail(err) {
	        callback_utils_1$2.CallbackUtils.onFailed(options, err);
	      },
	      success: function success(res) {
	        var acceptedMessage = _this.builder.build(res.content.message);

	        goeasy_event_center_1$1.GoEasyEventCenter.fire(internal_events_1$1.IM_INTERNAL_EVENTS.CS_ACCEPTED, acceptedMessage);
	        callback_utils_1$2.CallbackUtils.onSuccess(options, {
	          message: acceptedMessage,
	          customerStatus: res.content.customerStatus
	        });
	      }
	    });
	    g_1$1.G.s().emit(rocket);
	  };

	  ConversationHandler.prototype.end = function (teamId, options) {
	    var _this = this;

	    this.validate(options);
	    var customerId = options.id.toString();
	    var request = new cs_accept_request_1.CSAcceptRequest(customerId, teamId);
	    var rocket = new Rocket_1$1["default"]({
	      name: RocketTypes_1$1.RocketTypes.CS_END,
	      params: request,
	      permission: Permission_1$1.Permission.WRITE,
	      singleTimeout: SocketTimeout_1$1.SocketTimeout.commonRequestSingle,
	      totalTimeout: SocketTimeout_1$1.SocketTimeout.commonRequestTotal,
	      fail: function fail(err) {
	        callback_utils_1$2.CallbackUtils.onFailed(options, err);
	      },
	      success: function success(res) {
	        var endedMessage = _this.builder.build(res.content.message);

	        goeasy_event_center_1$1.GoEasyEventCenter.fire(internal_events_1$1.IM_INTERNAL_EVENTS.CS_ENDED, endedMessage);
	        callback_utils_1$2.CallbackUtils.onSuccess(options, {
	          message: endedMessage,
	          customerStatus: res.content.customerStatus
	        });
	      }
	    });
	    g_1$1.G.s().emit(rocket);
	  };

	  ConversationHandler.prototype.queryCustomerStatus = function (teamId, options) {
	    this.validate(options);
	    var id = options.id;
	    var customerId = id.toString();
	    var request = new cs_status_query_request_1.CSStatusQueryRequest(customerId, teamId);
	    var rocket = new Rocket_1$1["default"]({
	      name: RocketTypes_1$1.RocketTypes.CS_CUSTOMER_STATUS,
	      params: request,
	      permission: Permission_1$1.Permission.READ,
	      singleTimeout: SocketTimeout_1$1.SocketTimeout.commonQuerySingle,
	      totalTimeout: SocketTimeout_1$1.SocketTimeout.commonQueryTotal,
	      fail: function fail(err) {
	        callback_utils_1$2.CallbackUtils.onFailed(options, err);
	      },
	      success: function success(res) {
	        //todo: 理论上还应该有user, team两个id/data，暂时没有，视情况要不要补充？
	        var content = res.content;

	        if (content.staff) {
	          content.staff.data = JSON.parse(content.staff.data);
	        }

	        callback_utils_1$2.CallbackUtils.onSuccess(options, res);
	      }
	    });
	    g_1$1.G.s().emit(rocket);
	  };

	  ConversationHandler.prototype.transfer = function (teamId, options) {
	    var _this = this;

	    this.validate(options);
	    this.validateTransfer(options);
	    var customerId = options.id.toString();
	    var to = options.to.toString();
	    var request = new cs_transfer_request_1.CSTransferRequest(customerId, teamId, to);
	    var rocket = new Rocket_1$1["default"]({
	      name: RocketTypes_1$1.RocketTypes.CS_TRANSFER,
	      params: request,
	      permission: Permission_1$1.Permission.WRITE,
	      singleTimeout: SocketTimeout_1$1.SocketTimeout.commonRequestSingle,
	      totalTimeout: SocketTimeout_1$1.SocketTimeout.commonRequestTotal,
	      fail: function fail(err) {
	        callback_utils_1$2.CallbackUtils.onFailed(options, err);
	      },
	      success: function success(res) {
	        var transferMessage = _this.builder.build(res.content.message);

	        goeasy_event_center_1$1.GoEasyEventCenter.fire(internal_events_1$1.IM_INTERNAL_EVENTS.CS_TRANSFER, transferMessage);
	        var customerStatus = res.content.customerStatus;

	        if (customerStatus.staff) {
	          customerStatus.staff.data = JSON.parse(customerStatus.staff.data);
	        }

	        callback_utils_1$2.CallbackUtils.onSuccess(options, {
	          message: transferMessage,
	          customerStatus: customerStatus
	        });
	      }
	    });
	    g_1$1.G.s().emit(rocket);
	  };

	  ConversationHandler.prototype.validate = function (options) {
	    var key = "id";
	    var customerId = options[key];
	    validator_utils_1$2["default"].validateId(customerId, key);
	  };

	  ConversationHandler.prototype.validateTransfer = function (options) {
	    var key = "to";
	    var transferToId = options[key];
	    validator_utils_1$2["default"].validateId(transferToId, key);
	  };

	  return ConversationHandler;
	}();

	conversationHandler.ConversationHandler = ConversationHandler;

	var staffStatus = {};

	var csIsOnlineRequest = {};

	csIsOnlineRequest.__esModule = true;
	csIsOnlineRequest.CSIsOnlineRequest = void 0;

	var CSIsOnlineRequest =
	/** @class */
	function () {
	  function CSIsOnlineRequest(teamId) {
	    this.teamId = teamId;
	  }

	  return CSIsOnlineRequest;
	}();

	csIsOnlineRequest.CSIsOnlineRequest = CSIsOnlineRequest;

	var csOnlineRequest = {};

	csOnlineRequest.__esModule = true;
	csOnlineRequest.CSOnlineRequest = void 0;

	var CSOnlineRequest =
	/** @class */
	function () {
	  function CSOnlineRequest(teamId, teamData, staffData) {
	    this.teamId = teamId;
	    this.teamData = JSON.stringify(teamData);
	    this.staffData = JSON.stringify(staffData);
	  }

	  return CSOnlineRequest;
	}();

	csOnlineRequest.CSOnlineRequest = CSOnlineRequest;

	var csOfflineRequest = {};

	csOfflineRequest.__esModule = true;
	csOfflineRequest.CSOfflineRequest = void 0;

	var CSOfflineRequest =
	/** @class */
	function () {
	  function CSOfflineRequest(teamId) {
	    this.teamId = teamId;
	  }

	  return CSOfflineRequest;
	}();

	csOfflineRequest.CSOfflineRequest = CSOfflineRequest;

	var csStaffsQueryRequest = {};

	csStaffsQueryRequest.__esModule = true;
	csStaffsQueryRequest.CSStaffsQueryRequest = void 0;

	var CSStaffsQueryRequest =
	/** @class */
	function () {
	  function CSStaffsQueryRequest(teamId) {
	    this.teamId = teamId;
	  }

	  return CSStaffsQueryRequest;
	}();

	csStaffsQueryRequest.CSStaffsQueryRequest = CSStaffsQueryRequest;

	staffStatus.__esModule = true;
	staffStatus.StaffStatus = void 0;
	var cs_is_online_request_1 = csIsOnlineRequest;
	var Rocket_1 = Rocket;
	var RocketTypes_1 = RocketTypes;
	var Permission_1 = Permission;
	var SocketTimeout_1 = SocketTimeout;
	var Calibrator_1 = Calibrator;
	var cs_online_request_1 = csOnlineRequest;
	var cs_offline_request_1 = csOfflineRequest;
	var goeasy_event_center_1 = goeasyEventCenter;
	var internal_events_1 = internalEvents;
	var callback_utils_1$1 = callbackUtils;
	var g_1 = g;
	var cs_staffs_query_request_1 = csStaffsQueryRequest;

	var StaffStatus =
	/** @class */
	function () {
	  function StaffStatus() {}

	  StaffStatus.getInstance = function () {
	    if (!StaffStatus.instance) {
	      StaffStatus.instance = new StaffStatus();
	    }

	    return StaffStatus.instance;
	  };

	  StaffStatus.prototype.isOnline = function (teamId, option) {
	    var request = new cs_is_online_request_1.CSIsOnlineRequest(teamId);
	    var rocket = new Rocket_1["default"]({
	      name: RocketTypes_1.RocketTypes.CS_IS_ONLINE,
	      params: request,
	      permission: Permission_1.Permission.READ,
	      singleTimeout: SocketTimeout_1.SocketTimeout.commonQuerySingle,
	      totalTimeout: SocketTimeout_1.SocketTimeout.commonQueryTotal,
	      fail: function fail(err) {
	        callback_utils_1$1.CallbackUtils.onFailed(option, err);
	      },
	      success: function success(res) {
	        // todo 这里抛错如何捕获?
	        callback_utils_1$1.CallbackUtils.onSuccess(option, res);
	      }
	    });
	    g_1.G.s().emit(rocket);
	  };

	  StaffStatus.prototype.online = function (teamId, option) {
	    if (!Calibrator_1["default"].isObject(option.staffData) || !Calibrator_1["default"].isObject(option.teamData)) {
	      throw {
	        code: 400,
	        content: "staffData and teamData require an object"
	      };
	    }

	    var request = new cs_online_request_1.CSOnlineRequest(teamId, option.teamData, option.staffData);
	    var rocket = new Rocket_1["default"]({
	      name: RocketTypes_1.RocketTypes.CS_ONLINE,
	      params: request,
	      permission: Permission_1.Permission.WRITE,
	      singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	      totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	      fail: function fail(err) {
	        callback_utils_1$1.CallbackUtils.onFailed(option, err);
	      },
	      success: function success(res) {
	        callback_utils_1$1.CallbackUtils.onSuccess(option);
	        goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.CS_ONLINE_SUCCESS);
	      }
	    });
	    g_1.G.s().emit(rocket);
	  };

	  StaffStatus.prototype.offline = function (teamId, option) {
	    var request = new cs_offline_request_1.CSOfflineRequest(teamId);
	    var rocket = new Rocket_1["default"]({
	      name: RocketTypes_1.RocketTypes.CS_OFFLINE,
	      params: request,
	      permission: Permission_1.Permission.WRITE,
	      singleTimeout: SocketTimeout_1.SocketTimeout.commonRequestSingle,
	      totalTimeout: SocketTimeout_1.SocketTimeout.commonRequestTotal,
	      fail: function fail(err) {
	        callback_utils_1$1.CallbackUtils.onFailed(option, err);
	      },
	      success: function success(res) {
	        callback_utils_1$1.CallbackUtils.onSuccess(option);
	        goeasy_event_center_1.GoEasyEventCenter.fire(internal_events_1.IM_INTERNAL_EVENTS.CS_OFFLINE_SUCCESS);
	      }
	    });
	    g_1.G.s().emit(rocket);
	  };

	  StaffStatus.prototype.staffs = function (teamId, options) {
	    var request = new cs_staffs_query_request_1.CSStaffsQueryRequest(teamId);
	    var rocket = new Rocket_1["default"]({
	      name: RocketTypes_1.RocketTypes.CS_STAFFS,
	      params: request,
	      permission: Permission_1.Permission.READ,
	      singleTimeout: SocketTimeout_1.SocketTimeout.commonQuerySingle,
	      totalTimeout: SocketTimeout_1.SocketTimeout.commonQueryTotal,
	      fail: function fail(err) {
	        callback_utils_1$1.CallbackUtils.onFailed(options, err);
	      },
	      success: function success(res) {
	        res.content.forEach(function (staff) {
	          staff.data = JSON.parse(staff.data);
	        });
	        callback_utils_1$1.CallbackUtils.onSuccess(options, res);
	      }
	    });
	    g_1.G.s().emit(rocket);
	  };

	  return StaffStatus;
	}();

	staffStatus.StaffStatus = StaffStatus;

	var messageCreator = {};

	messageCreator.__esModule = true;
	messageCreator.MessageCreator = void 0;
	var GoEasy_1 = GoEasy$1;
	var im_1$1 = im;

	var MessageCreator =
	/** @class */
	function () {
	  function MessageCreator() {}

	  MessageCreator.getInstance = function () {
	    if (!MessageCreator.instance) {
	      MessageCreator.instance = new MessageCreator();
	    }

	    return MessageCreator.instance;
	  };

	  MessageCreator.prototype.createTextMessage = function (teamId, createOptions) {
	    var imMessage = im_1$1.IM.instance.createTextMessage(createOptions);
	    this.extendProps(teamId, imMessage);
	  };

	  MessageCreator.prototype.createImageMessage = function (teamId, createOptions) {
	    var imMessage = im_1$1.IM.instance.createImageMessage(createOptions);
	    this.extendProps(teamId, imMessage);
	  };

	  MessageCreator.prototype.createFileMessage = function (teamId, createOptions) {
	    var imMessage = im_1$1.IM.instance.createFileMessage(createOptions);
	    this.extendProps(teamId, imMessage);
	  };

	  MessageCreator.prototype.createAudioMessage = function (teamId, createOptions) {
	    var imMessage = im_1$1.IM.instance.createAudioMessage(createOptions);
	    this.extendProps(teamId, imMessage);
	  };

	  MessageCreator.prototype.createVideoMessage = function (teamId, createOptions) {
	    var imMessage = im_1$1.IM.instance.createVideoMessage(createOptions);
	    this.extendProps(teamId, imMessage);
	  };

	  MessageCreator.prototype.createCustomMessage = function (teamId, createOptions) {
	    var imMessage = im_1$1.IM.instance.createCustomMessage(createOptions);
	    this.extendProps(teamId, imMessage);
	  };
	  /**
	   * staff发送的消息accepted一定为true(staff必须接入才能发送消息)
	   */


	  MessageCreator.prototype.extendProps = function (teamId, imMessage) {
	    if (imMessage.scene() === GoEasy_1.Scene.CS) {
	      var csMessage = imMessage;
	      csMessage.teamId = teamId;
	      csMessage.accepted = true;
	    }
	  };

	  return MessageCreator;
	}();

	messageCreator.MessageCreator = MessageCreator;

	var __awaiter = commonjsGlobal && commonjsGlobal.__awaiter || function (thisArg, _arguments, P, generator) {
	  function adopt(value) {
	    return value instanceof P ? value : new P(function (resolve) {
	      resolve(value);
	    });
	  }

	  return new (P || (P = Promise))(function (resolve, reject) {
	    function fulfilled(value) {
	      try {
	        step(generator.next(value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function rejected(value) {
	      try {
	        step(generator["throw"](value));
	      } catch (e) {
	        reject(e);
	      }
	    }

	    function step(result) {
	      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
	    }

	    step((generator = generator.apply(thisArg, _arguments || [])).next());
	  });
	};

	var __generator = commonjsGlobal && commonjsGlobal.__generator || function (thisArg, body) {
	  var _ = {
	    label: 0,
	    sent: function sent() {
	      if (t[0] & 1) throw t[1];
	      return t[1];
	    },
	    trys: [],
	    ops: []
	  },
	      f,
	      y,
	      t,
	      g;
	  return g = {
	    next: verb(0),
	    "throw": verb(1),
	    "return": verb(2)
	  }, typeof Symbol === "function" && (g[Symbol.iterator] = function () {
	    return this;
	  }), g;

	  function verb(n) {
	    return function (v) {
	      return step([n, v]);
	    };
	  }

	  function step(op) {
	    if (f) throw new TypeError("Generator is already executing.");

	    while (_) {
	      try {
	        if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
	        if (y = 0, t) op = [op[0] & 2, t.value];

	        switch (op[0]) {
	          case 0:
	          case 1:
	            t = op;
	            break;

	          case 4:
	            _.label++;
	            return {
	              value: op[1],
	              done: false
	            };

	          case 5:
	            _.label++;
	            y = op[1];
	            op = [0];
	            continue;

	          case 7:
	            op = _.ops.pop();

	            _.trys.pop();

	            continue;

	          default:
	            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
	              _ = 0;
	              continue;
	            }

	            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
	              _.label = op[1];
	              break;
	            }

	            if (op[0] === 6 && _.label < t[1]) {
	              _.label = t[1];
	              t = op;
	              break;
	            }

	            if (t && _.label < t[2]) {
	              _.label = t[2];

	              _.ops.push(op);

	              break;
	            }

	            if (t[2]) _.ops.pop();

	            _.trys.pop();

	            continue;
	        }

	        op = body.call(thisArg, _);
	      } catch (e) {
	        op = [6, e];
	        y = 0;
	      } finally {
	        f = t = 0;
	      }
	    }

	    if (op[0] & 5) throw op[1];
	    return {
	      value: op[0] ? op[1] : void 0,
	      done: true
	    };
	  }
	};

	team.__esModule = true;
	team.Team = void 0;
	var validator_utils_1$1 = validatorUtils;
	var callback_utils_1 = callbackUtils;
	var im_1 = im;
	var conversation_handler_1 = conversationHandler;
	var staff_status_1 = staffStatus;
	var message_creator_1 = messageCreator;

	var Team =
	/** @class */
	function () {
	  function Team(teamId) {
	    this.teamId = teamId;
	    this.staffStatus = staff_status_1.StaffStatus.getInstance();
	    this.conversationHandler = conversation_handler_1.ConversationHandler.getInstance();
	    this.messageCreator = message_creator_1.MessageCreator.getInstance();
	  }

	  Team.prototype["catch"] = function (functionObj, callbackOptions) {
	    return __awaiter(this, void 0, void 0, function () {
	      var err_1;
	      return __generator(this, function (_a) {
	        switch (_a.label) {
	          case 0:
	            _a.trys.push([0, 2,, 3]);

	            validator_utils_1$1["default"].validateCallbackOptions(callbackOptions);
	            return [4
	            /*yield*/
	            , functionObj()];

	          case 1:
	            _a.sent();

	            return [3
	            /*break*/
	            , 3];

	          case 2:
	            err_1 = _a.sent();
	            callback_utils_1.CallbackUtils.onFailed(callbackOptions, err_1);
	            return [3
	            /*break*/
	            , 3];

	          case 3:
	            return [2
	            /*return*/
	            ];
	        }
	      });
	    });
	  };

	  Team.prototype.isOnline = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.staffStatus.isOnline(_this.teamId, options);
	    }, options);
	  };

	  Team.prototype.online = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.staffStatus.online(_this.teamId, options);
	    }, options);
	  };

	  Team.prototype.offline = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.staffStatus.offline(_this.teamId, options);
	    }, options);
	  };

	  Team.prototype.customerStatus = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.conversationHandler.queryCustomerStatus(_this.teamId, options);
	    }, options);
	  };

	  Team.prototype.accept = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.conversationHandler.accept(_this.teamId, options);
	    }, options);
	  };

	  Team.prototype.end = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.conversationHandler.end(_this.teamId, options);
	    }, options);
	  };

	  Team.prototype.history = function (options) {
	    im_1.IM.instance.history(options, this.teamId);
	  };

	  Team.prototype.markMessageAsRead = function (options) {
	    im_1.IM.instance.markMessageAsRead(options, this.teamId);
	  };

	  Team.prototype.createTextMessage = function (createOptions) {
	    this.messageCreator.createTextMessage(this.teamId, createOptions);
	  };

	  Team.prototype.createImageMessage = function (createOptions) {
	    this.messageCreator.createImageMessage(this.teamId, createOptions);
	  };

	  Team.prototype.createFileMessage = function (createOptions) {
	    this.messageCreator.createFileMessage(this.teamId, createOptions);
	  };

	  Team.prototype.createAudioMessage = function (createOptions) {
	    this.messageCreator.createAudioMessage(this.teamId, createOptions);
	  };

	  Team.prototype.createVideoMessage = function (createOptions) {
	    this.messageCreator.createVideoMessage(this.teamId, createOptions);
	  };

	  Team.prototype.createCustomMessage = function (createOptions) {
	    this.messageCreator.createCustomMessage(this.teamId, createOptions);
	  };

	  Team.prototype.transfer = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.conversationHandler.transfer(_this.teamId, options);
	    }, options);
	  };

	  Team.prototype.staffs = function (options) {
	    var _this = this;

	    this["catch"](function () {
	      _this.staffStatus.staffs(_this.teamId, options);
	    }, options);
	  };

	  return Team;
	}();

	team.Team = Team;

	cs.__esModule = true;
	cs.CS = void 0;
	var team_1 = team;
	var validator_utils_1 = validatorUtils;

	var CS =
	/** @class */
	function () {
	  function CS() {}

	  CS.team = function (teamId) {
	    validator_utils_1["default"].validateId(teamId, "teamId");
	    var team = this.teams.get(teamId);

	    if (!team) {
	      team = new team_1.Team(teamId.toString());
	      this.teams.set(teamId.toString(), team);
	    }

	    return team;
	  };

	  CS.teams = new Map();
	  return CS;
	}();

	cs.CS = CS;

	(function (exports) {

	  var __extends = commonjsGlobal && commonjsGlobal.__extends || function () {
	    var _extendStatics = function extendStatics(d, b) {
	      _extendStatics = Object.setPrototypeOf || {
	        __proto__: []
	      } instanceof Array && function (d, b) {
	        d.__proto__ = b;
	      } || function (d, b) {
	        for (var p in b) {
	          if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
	        }
	      };

	      return _extendStatics(d, b);
	    };

	    return function (d, b) {
	      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");

	      _extendStatics(d, b);

	      function __() {
	        this.constructor = d;
	      }

	      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	    };
	  }();

	  exports.__esModule = true;
	  exports.CSTeam = exports.GoEasyIM = exports.GoEasyPubSub = exports.CustomerStatusQuery = exports.StaffOffline = exports.StaffOnline = exports.StaffIsOnline = exports.ConversationDTO = exports.MessageStatus = exports.Scene = exports.CallBackOptions = void 0;
	  var NetworkStatus_1 = NetworkStatus;
	  var GoEasySocket_1 = GoEasySocket;
	  var Calibrator_1 = Calibrator;
	  var ModuleTypes_1 = ModuleTypes;
	  var pubsub_1 = pubsub;
	  var im_1 = im;
	  var GNS_1 = GNS$1;
	  var im_api_events_1 = imApiEvents;
	  var goeasy_event_center_1 = goeasyEventCenter;
	  var media_type_1 = mediaType;
	  var cs_1 = cs;
	  var g_1 = g; // Lib version flag

	  var packageVersion = '2.5.2-1';

	  var CallBackOptions =
	  /** @class */
	  function () {
	    function CallBackOptions() {}

	    return CallBackOptions;
	  }();

	  exports.CallBackOptions = CallBackOptions; // --------------- IM API Options ---------------

	  var Scene;

	  (function (Scene) {
	    Scene["PRIVATE"] = "private";
	    Scene["GROUP"] = "group";
	    Scene["SYSTEM"] = "system";
	    Scene["CS"] = "cs";
	  })(Scene = exports.Scene || (exports.Scene = {}));

	  (function (MessageStatus) {
	    MessageStatus["NEW"] = "new";
	    MessageStatus["SENDING"] = "sending";
	    MessageStatus["SUCCESS"] = "success";
	    MessageStatus["FAIL"] = "fail";
	  })(exports.MessageStatus || (exports.MessageStatus = {}));

	  var ConversationDTO =
	  /** @class */
	  function () {
	    function ConversationDTO() {}

	    return ConversationDTO;
	  }();

	  exports.ConversationDTO = ConversationDTO;

	  var StaffIsOnline =
	  /** @class */
	  function (_super) {
	    __extends(StaffIsOnline, _super);

	    function StaffIsOnline() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    return StaffIsOnline;
	  }(CallBackOptions);

	  exports.StaffIsOnline = StaffIsOnline;

	  var StaffOnline =
	  /** @class */
	  function (_super) {
	    __extends(StaffOnline, _super);

	    function StaffOnline() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    return StaffOnline;
	  }(CallBackOptions);

	  exports.StaffOnline = StaffOnline;

	  var StaffOffline =
	  /** @class */
	  function (_super) {
	    __extends(StaffOffline, _super);

	    function StaffOffline() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    return StaffOffline;
	  }(CallBackOptions);

	  exports.StaffOffline = StaffOffline;

	  var CustomerStatusQuery =
	  /** @class */
	  function (_super) {
	    __extends(CustomerStatusQuery, _super);

	    function CustomerStatusQuery() {
	      return _super !== null && _super.apply(this, arguments) || this;
	    }

	    return CustomerStatusQuery;
	  }(CallBackOptions);

	  exports.CustomerStatusQuery = CustomerStatusQuery;
	  /**
	   * @description PubSub 类
	   */

	  var GoEasyPubSub =
	  /** @class */
	  function () {
	    function GoEasyPubSub(options) {
	      pubsub_1.PubSub.init(options);
	    }

	    GoEasyPubSub.prototype.initialGoEasySocket = function () {
	      pubsub_1.PubSub.instance.initialGoEasySocket();
	    };

	    GoEasyPubSub.prototype.initialBeforeConnect = function () {
	      pubsub_1.PubSub.instance.initialBeforeConnect();
	    };

	    GoEasyPubSub.prototype.publish = function (options) {
	      pubsub_1.PubSub.instance.publisher.publish(options);
	    };

	    GoEasyPubSub.prototype.subscribe = function (options) {
	      pubsub_1.PubSub.instance.subscriber.subscribe(options);
	    };

	    GoEasyPubSub.prototype.unsubscribe = function (options) {
	      pubsub_1.PubSub.instance.subscriber.unsubscribe(options);
	    };

	    GoEasyPubSub.prototype.subscribePresence = function (options) {
	      pubsub_1.PubSub.instance.presence.subscribePresence(options);
	    };

	    GoEasyPubSub.prototype.unsubscribePresence = function (options) {
	      pubsub_1.PubSub.instance.presence.unsubscribePresence(options);
	    };

	    GoEasyPubSub.prototype.history = function (options) {
	      pubsub_1.PubSub.instance.histories.get(options);
	    };

	    GoEasyPubSub.prototype.hereNow = function (options) {
	      pubsub_1.PubSub.instance.hereNows.byChannel(options);
	    };

	    GoEasyPubSub.prototype.hereNowByUserIds = function (options) {
	      pubsub_1.PubSub.instance.hereNows.byUserId(options);
	    };

	    return GoEasyPubSub;
	  }();

	  exports.GoEasyPubSub = GoEasyPubSub;
	  /**
	   * @description IM 聊天类
	   */

	  var GoEasyIM =
	  /** @class */
	  function () {
	    function GoEasyIM(options) {
	      im_1.IM.init(options);
	    }

	    GoEasyIM.prototype.afterConnect = function () {
	      im_1.IM.instance.afterConnect();
	    };

	    GoEasyIM.prototype.on = function (event, callBack) {
	      im_1.IM.instance.on(event, callBack);
	    };

	    GoEasyIM.prototype.off = function (event, callBack) {
	      im_1.IM.instance.off(event, callBack);
	    };

	    GoEasyIM.prototype.createTextMessage = function (createOptions) {
	      return im_1.IM.instance.createTextMessage(createOptions);
	    };

	    GoEasyIM.prototype.createImageMessage = function (createOptions) {
	      return im_1.IM.instance.createImageMessage(createOptions);
	    };

	    GoEasyIM.prototype.createFileMessage = function (createOptions) {
	      return im_1.IM.instance.createFileMessage(createOptions);
	    };

	    GoEasyIM.prototype.createAudioMessage = function (createOptions) {
	      return im_1.IM.instance.createAudioMessage(createOptions);
	    };

	    GoEasyIM.prototype.createVideoMessage = function (createOptions) {
	      return im_1.IM.instance.createVideoMessage(createOptions);
	    };

	    GoEasyIM.prototype.createCustomMessage = function (createOptions) {
	      return im_1.IM.instance.createCustomMessage(createOptions);
	    };

	    GoEasyIM.prototype.sendMessage = function (sendOptions) {
	      im_1.IM.instance.sendMessage(sendOptions);
	    };

	    GoEasyIM.prototype.recallMessage = function (messageRecallOptions) {
	      im_1.IM.instance.recallMessage(messageRecallOptions);
	    };

	    GoEasyIM.prototype.deleteMessage = function (messageDeleteOptions) {
	      im_1.IM.instance.deleteMessage(messageDeleteOptions);
	    };

	    GoEasyIM.prototype.markGroupMessageAsRead = function (options) {
	      im_1.IM.instance.markGroupMessageAsRead(options);
	    };

	    GoEasyIM.prototype.markPrivateMessageAsRead = function (options) {
	      im_1.IM.instance.markPrivateMessageAsRead(options);
	    };

	    GoEasyIM.prototype.latestConversations = function (options) {
	      im_1.IM.instance.latestConversations(options);
	    };

	    GoEasyIM.prototype.removePrivateConversation = function (options) {
	      im_1.IM.instance.removePrivateConversation(options);
	    };

	    GoEasyIM.prototype.removeGroupConversation = function (options) {
	      im_1.IM.instance.removeGroupConversation(options);
	    };

	    GoEasyIM.prototype.topPrivateConversation = function (options) {
	      im_1.IM.instance.topPrivateConversation(options);
	    };

	    GoEasyIM.prototype.topGroupConversation = function (options) {
	      im_1.IM.instance.topGroupConversation(options);
	    };

	    GoEasyIM.prototype.history = function (options) {
	      im_1.IM.instance.history(options);
	    };

	    GoEasyIM.prototype.subscribeUserPresence = function (options) {
	      im_1.IM.instance.subscribeUserPresence(options);
	    };

	    GoEasyIM.prototype.unsubscribeUserPresence = function (options) {
	      im_1.IM.instance.unsubscribeUserPresence(options);
	    };

	    GoEasyIM.prototype.hereNow = function (options) {
	      im_1.IM.instance.hereNow(options);
	    };

	    GoEasyIM.prototype.subscribeGroup = function (options) {
	      im_1.IM.instance.subscribeGroup(options);
	    };

	    GoEasyIM.prototype.unsubscribeGroup = function (options) {
	      im_1.IM.instance.unsubscribeGroup(options);
	    };

	    GoEasyIM.prototype.subscribeGroupPresence = function (options) {
	      im_1.IM.instance.subscribeGroupPresence(options);
	    };

	    GoEasyIM.prototype.unsubscribeGroupPresence = function (options) {
	      im_1.IM.instance.unsubscribeGroupPresence(options);
	    };

	    GoEasyIM.prototype.groupHereNow = function (options) {
	      im_1.IM.instance.groupHereNow(options);
	    };

	    GoEasyIM.prototype.groupOnlineCount = function (options) {
	      im_1.IM.instance.groupOnlineCount(options);
	    };

	    GoEasyIM.prototype.markMessageAsRead = function (options) {
	      im_1.IM.instance.markMessageAsRead(options);
	    };

	    GoEasyIM.prototype.csTeam = function (teamId) {
	      return new CSTeam(teamId);
	    };

	    GoEasyIM.prototype.pendingConversations = function (options) {
	      im_1.IM.instance.latestPendingConversations(options);
	    };

	    GoEasyIM.prototype.topConversation = function (options) {
	      im_1.IM.instance.topConversation(options);
	    };

	    GoEasyIM.prototype.removeConversation = function (options) {
	      im_1.IM.instance.removeConversation(options);
	    };

	    return GoEasyIM;
	  }();

	  exports.GoEasyIM = GoEasyIM;
	  /**
	   * @description GoEasy 对外接口核心类
	   */

	  var GoEasy =
	  /** @class */
	  function () {
	    function GoEasy(options) {
	      if (Calibrator_1["default"].isDef(GoEasy.instance) && GoEasy.instance.getConnectionStatus() !== NetworkStatus_1.NetworkStatus.DISCONNECTED) {
	        return GoEasy.instance;
	      }

	      this.validateOptions(options);
	      this.options = options;
	      GNS_1.GNS.init(options.allowNotification);
	      this.pubsub = new GoEasyPubSub(this.options);
	      this.im = new GoEasyIM(this.options); // this.rtc = new GoEasyRTC();
	    }

	    GoEasy.getInstance = function (options) {
	      if (Calibrator_1["default"].isUndef(GoEasy.instance)) {
	        GoEasy.instance = new GoEasy(options);
	      }

	      return GoEasy.instance;
	    };

	    GoEasy.prototype.connect = function (options) {
	      if (this.getConnectionStatus() !== NetworkStatus_1.NetworkStatus.DISCONNECTED) {
	        //必须是手动断开或未连接，才能connect
	        if (Calibrator_1["default"].isObject(options) && Calibrator_1["default"].isFunction(options.onFailed)) {
	          options.onFailed({
	            code: 408,
	            content: 'It is already connected, don\'t try again until disconnect() is called. '
	          });
	          return;
	        }
	      }

	      this.confirmUserId(options);
	      goeasy_event_center_1.GoEasyEventCenter.initial();
	      this.pubsub.initialBeforeConnect();
	      this.goEasySocket = new GoEasySocket_1["default"](this.options, options);
	      this.goEasySocket.connect();
	      g_1.G.i(this.goEasySocket);
	      this.im.afterConnect();
	      this.pubsub.initialGoEasySocket(); // this.rtc.initialGoEasySocket(this.goEasySocket);
	    };

	    GoEasy.prototype.disconnect = function (options) {
	      this.goEasySocket.disconnect().then(function () {
	        if (Calibrator_1["default"].isObject(options) && Calibrator_1["default"].isFunction(options.onSuccess)) {
	          options.onSuccess();
	        }
	      })["catch"](function (e) {
	        if (Calibrator_1["default"].isObject(options) && Calibrator_1["default"].isFunction(options.onFailed)) {
	          options.onFailed(e);
	        }
	      });
	    };

	    GoEasy.prototype.getConnectionStatus = function () {
	      if (this.goEasySocket) {
	        return this.goEasySocket.getStatus();
	      }

	      return NetworkStatus_1.NetworkStatus.DISCONNECTED;
	    };

	    GoEasy.prototype.validateOptions = function (options) {
	      var msg = '';

	      if (!Calibrator_1["default"].isObject(options)) {
	        msg = "options is require an object.";
	        throw Error(msg);
	      }

	      if (!Calibrator_1["default"].isPrimitive(options.appkey) || options.appkey.length == 0) {
	        msg = "Invalid options:'appkey' is empty.";
	        throw Error(msg);
	      }

	      if (!Calibrator_1["default"].isPrimitive(options.host) || options.host.length == 0) {
	        msg = "Invalid options:'host' is empty.";
	        throw Error(msg);
	      }

	      if (!Calibrator_1["default"].isArray(options.modules)) {
	        msg = "Invalid options: 'modules' must be nonempty array";
	        throw Error(msg);
	      }

	      var supportModules = [ModuleTypes_1.ModuleTypes.IM, ModuleTypes_1.ModuleTypes.PUBSUB];
	      var modules = options.modules.map(function (moduleName) {
	        var name = moduleName.toUpperCase();

	        if (!supportModules.includes(name)) {
	          msg = "Invalid options: module '".concat(moduleName, "' is not support");
	          throw Error(msg);
	        }

	        return name;
	      });
	      options.modules = modules;
	    };

	    GoEasy.prototype.onClickNotification = function (clickHandler) {
	      GNS_1.GNS.instance.onClickNotification(clickHandler);
	    };

	    GoEasy.prototype.confirmUserId = function (options) {
	      if (this.options.modules.includes(ModuleTypes_1.ModuleTypes.IM) && (Calibrator_1["default"].isEmpty(options.id) || !Calibrator_1["default"].isStringOrNumber(options.id))) {
	        throw {
	          code: 400,
	          content: 'TypeError: id requires number or string.'
	        };
	      } else if (typeof options.id === 'string' && options.id.length > 60) {
	        //if use calibrator.isString() directly, options.id.length will be error
	        throw {
	          code: 400,
	          content: 'id over max length 60'
	        };
	      }
	    };

	    GoEasy.version = packageVersion;
	    GoEasy.IM_EVENT = im_api_events_1.ImApiEvents;
	    GoEasy.IM_SCENE = Scene;
	    GoEasy.MEDIA_TYPE = media_type_1.MediaType;
	    return GoEasy;
	  }();

	  exports["default"] = GoEasy;

	  var CSTeam =
	  /** @class */
	  function () {
	    function CSTeam(id) {
	      this.id = id;
	    }

	    CSTeam.prototype.isOnline = function (options) {
	      cs_1.CS.team(this.id).isOnline(options);
	    };

	    CSTeam.prototype.online = function (options) {
	      cs_1.CS.team(this.id).online(options);
	    };

	    CSTeam.prototype.offline = function (options) {
	      cs_1.CS.team(this.id).offline(options);
	    };

	    CSTeam.prototype.customerStatus = function (options) {
	      cs_1.CS.team(this.id).customerStatus(options);
	    };

	    CSTeam.prototype.accept = function (options) {
	      cs_1.CS.team(this.id).accept(options);
	    };

	    CSTeam.prototype.end = function (options) {
	      cs_1.CS.team(this.id).end(options);
	    };

	    CSTeam.prototype.history = function (options) {
	      cs_1.CS.team(this.id).history(options);
	    };

	    CSTeam.prototype.markMessageAsRead = function (options) {
	      cs_1.CS.team(this.id).markMessageAsRead(options);
	    };

	    CSTeam.prototype.createTextMessage = function (options) {
	      cs_1.CS.team(this.id).createTextMessage(options);
	    };

	    CSTeam.prototype.createImageMessage = function (options) {
	      cs_1.CS.team(this.id).createImageMessage(options);
	    };

	    CSTeam.prototype.createFileMessage = function (options) {
	      cs_1.CS.team(this.id).createFileMessage(options);
	    };

	    CSTeam.prototype.createAudioMessage = function (options) {
	      cs_1.CS.team(this.id).createAudioMessage(options);
	    };

	    CSTeam.prototype.createVideoMessage = function (options) {
	      cs_1.CS.team(this.id).createVideoMessage(options);
	    };

	    CSTeam.prototype.createCustomMessage = function (options) {
	      cs_1.CS.team(this.id).createCustomMessage(options);
	    };

	    CSTeam.prototype.transfer = function (options) {
	      cs_1.CS.team(this.id).transfer(options);
	    };

	    CSTeam.prototype.staffs = function (options) {
	      cs_1.CS.team(this.id).staffs(options);
	    };

	    return CSTeam;
	  }();

	  exports.CSTeam = CSTeam;
	})(GoEasy$1);

	var GoEasy = /*@__PURE__*/getDefaultExportFromCjs(GoEasy$1);

	return GoEasy;

}));
