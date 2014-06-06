(function() {
  var Assert, URL, assert, assertMatch, isRegExp;

  assert = require("assert");

  isRegExp = require("util").isRegExp;

  URL = require("url");

  assertMatch = function(actual, expected, message) {
    if (isRegExp(expected)) {
      return assert(expected.test(actual), message || ("Expected '" + actual + "' to match " + expected));
    } else if (typeof expected === "function") {
      return assert(expected(actual), message);
    } else {
      return assert.deepEqual(actual, expected, message);
    }
  };

  Assert = (function() {
    function Assert(browser) {
      this.browser = browser;
    }

    Assert.prototype.cookie = function(identifier, expected, message) {
      var actual;
      if (arguments.length === 1) {
        expected = null;
      }
      actual = this.browser.getCookie(identifier);
      message || (message = "Expected cookie " + (JSON.stringify(identifier)) + " to have the value '" + expected + "', found '" + actual + "'");
      return assertMatch(actual, expected, message);
    };

    Assert.prototype.redirected = function(message) {
      return assert(this.browser.redirected, message);
    };

    Assert.prototype.status = function(code, message) {
      return assert.equal(this.browser.statusCode, code, message);
    };

    Assert.prototype.success = function(message) {
      return assert(this.browser.success, message);
    };

    Assert.prototype.url = function(expected, message) {
      var absolute, defaultValue, key, url, value, _results;
      if (typeof expected === "string") {
        absolute = URL.resolve(this.browser.location.href, expected);
        return assertMatch(this.browser.location.href, absolute, message);
      } else if (isRegExp(expected) || typeof expected === "function") {
        return assertMatch(this.browser.location.href, expected, message);
      } else {
        url = URL.parse(this.browser.location.href, true);
        _results = [];
        for (key in expected) {
          value = expected[key];
          if (key === "port") {
            defaultValue = 80;
          } else {
            defaultValue = null;
          }
          _results.push(assertMatch(url[key] || defaultValue, value || defaultValue, message));
        }
        return _results;
      }
    };

    Assert.prototype.attribute = function(selector, name, expected, message) {
      var actual, element, elements, _i, _len, _results;
      if (arguments.length === 2) {
        expected = null;
      }
      elements = this.browser.queryAll(selector);
      assert(elements.length > 0, "Expected selector '" + selector + "' to return one or more elements");
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        actual = element.getAttribute(name);
        _results.push(assertMatch(actual, expected, message));
      }
      return _results;
    };

    Assert.prototype.element = function(selector, message) {
      return this.elements(selector, {
        exactly: 1
      }, message);
    };

    Assert.prototype.elements = function(selector, count, message) {
      var elements;
      elements = this.browser.queryAll(selector);
      if (arguments.length === 1) {
        count = {
          atLeast: 1
        };
      }
      if (count.exactly) {
        count = count.exactly;
      }
      if (typeof count === "number") {
        message || (message = "Expected " + count + " elements matching '" + selector + "', found " + elements.length);
        return assert.equal(elements.length, count, message);
      } else {
        if (count.atLeast) {
          elements = this.browser.queryAll(selector);
          message || (message = "Expected at least " + count.atLeast + " elements matching '" + selector + "', found only " + elements.length);
          assert(elements.length >= count.atLeast, message);
        }
        if (count.atMost) {
          message || (message = "Expected at most " + count.atMost + " elements matching '" + selector + "', found " + elements.length);
          return assert(elements.length <= count.atMost, message);
        }
      }
    };

    Assert.prototype.hasClass = function(selector, expected, message) {
      var classNames, element, elements, _i, _len, _results;
      elements = this.browser.queryAll(selector);
      assert(elements.length > 0, "Expected selector '" + selector + "' to return one or more elements");
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        classNames = element.className.split(/\s+/);
        _results.push(assert(~classNames.indexOf(expected), message || ("Expected element '" + selector + "' to have class " + expected + ", found " + (classNames.join(", ")))));
      }
      return _results;
    };

    Assert.prototype.hasNoClass = function(selector, expected, message) {
      var classNames, element, elements, _i, _len, _results;
      elements = this.browser.queryAll(selector);
      assert(elements.length > 0, "Expected selector '" + selector + "' to return one or more elements");
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        classNames = element.className.split(/\s+/);
        _results.push(assert(classNames.indexOf(expected) === -1, message || ("Expected element '" + selector + "' to not have class " + expected + ", found " + (classNames.join(", ")))));
      }
      return _results;
    };

    Assert.prototype.className = function(selector, expected, message) {
      var actual, element, elements, _i, _len, _results;
      elements = this.browser.queryAll(selector);
      assert(elements.length > 0, "Expected selector '" + selector + "' to return one or more elements");
      expected = expected.split(/\s+/).sort().join(" ");
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        actual = element.className.split(/\s+/).sort().join(" ");
        _results.push(assertMatch(actual, expected, message || ("Expected element '" + selector + "' to have class " + expected + ", found " + actual)));
      }
      return _results;
    };

    Assert.prototype.style = function(selector, style, expected, message) {
      var actual, element, elements, _i, _len, _results;
      if (arguments.length === 2) {
        expected = null;
      }
      elements = this.browser.queryAll(selector);
      assert(elements.length > 0, "Expected selector '" + selector + "' to return one or more elements");
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        actual = element.style[style];
        _results.push(assertMatch(actual, expected, message || ("Expected element '" + selector + "' to have style " + style + " value of " + expected + ", found " + actual)));
      }
      return _results;
    };

    Assert.prototype.input = function(selector, expected, message) {
      var element, elements, _i, _len, _results;
      if (arguments.length === 1) {
        expected = null;
      }
      elements = this.browser.queryAll(selector);
      assert(elements.length > 0, "Expected selector '" + selector + "' to return one or more elements");
      _results = [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        _results.push(assertMatch(element.value, expected, message));
      }
      return _results;
    };

    Assert.prototype.link = function(selector, text, url, message) {
      var elements, matching;
      url = URL.resolve(this.browser.location.href, url);
      elements = this.browser.queryAll(selector);
      assert(elements.length > 0, "Expected selector '" + selector + "' to return one or more elements");
      matching = elements.filter(function(element) {
        return element.textContent.trim() === text && element.href === url;
      });
      return assert(matching.length > 0, "Expected at least one link matching the given text and URL");
    };

    Assert.prototype.text = function(selector, expected, message) {
      var actual, elements;
      elements = this.browser.queryAll(selector);
      assert(elements.length > 0, "Expected selector '" + selector + "' to return one or more elements");
      actual = elements.map(function(e) {
        return e.textContent;
      }).join("").trim().replace(/\s+/g, " ");
      return assertMatch(actual, expected || "", message);
    };

    Assert.prototype.hasFocus = function(selector, message) {
      var elements;
      if (selector) {
        elements = this.browser.queryAll(selector);
        assert.equal(elements.length, 1, "Expected selector '" + selector + "' to return one element");
        return assert.equal(this.browser.activeElement, elements[0], "Expected element '" + selector + "' to have the focus'");
      } else {
        return assert.equal(this.browser.activeElement, this.browser.body, "Expected no element to have focus");
      }
    };

    Assert.prototype.evaluate = function(expression, expected, message) {
      var actual;
      actual = this.browser.evaluate(expression);
      if (arguments.length === 1) {
        return assert(actual);
      } else {
        return assertMatch(actual, expected, message);
      }
    };

    Assert.prototype.global = function(name, expected, message) {
      var actual;
      actual = this.browser.window[name];
      if (arguments.length === 1) {
        return assert(actual);
      } else {
        message || (message = "Expected global " + name + " to have the value '" + expected + "', found '" + actual + "'");
        return assertMatch(actual, expected, message);
      }
    };

    Assert.prototype.prompted = function(messageShown, message) {
      return assert(this.browser.prompted(messageShown), message);
    };

    return Assert;

  })();

  module.exports = Assert;

}).call(this);

(function() {
  var ALIASES, BCat, COMMANDS, exec, http, spawn, _ref;

  _ref = require("child_process"), exec = _ref.exec, spawn = _ref.spawn;

  http = require("http");

  COMMANDS = {
    "Darwin": {
      "default": "open",
      "safari": "open -a Safari",
      "firefox": "open -a Firefox",
      "chrome": "open -a Google\\ Chrome",
      "chromium": "open -a Chromium",
      "opera": "open -a Opera",
      "curl": "curl -s"
    },
    "X11": {
      "default": "xdg-open",
      "firefox": "firefox",
      "chrome": "google-chrome",
      "chromium": "chromium",
      "mozilla": "mozilla",
      "epiphany": "epiphany",
      "curl": "curl -s"
    }
  };

  ALIASES = {
    "google-chrome": "chrome",
    "google chrome": "chrome",
    "gnome": "epiphany"
  };

  BCat = (function() {
    function BCat() {}

    BCat.prototype.open = function(browser, port) {
      return exec("uname", function(err, stdout) {
        var cmd, command, env;
        if (err) {
          throw new Error("Sorry, I don't support your operating system");
        }
        if (/Darwin/.test(stdout)) {
          env = "Darwin";
        } else if (/(Linux|BSD)/.test(stdout)) {
          env = "X11";
        } else {
          env = "X11";
        }
        browser = ALIASES[browser] || browser || "default";
        command = COMMANDS[env][browser];
        if (!command) {
          throw new Error("Sorry, don't know how to run " + browser);
        }
        cmd = spawn(command, ["http://localhost:" + port + "/"]);
        return cmd.stderr.on("data", function(data) {
          return process.stdout.write(data);
        });
      });
    };

    BCat.prototype.serve = function(input, port) {
      var server;
      if (input.setEncoding && input.pause) {
        input.setEncoding("utf8");
        input.pause();
      }
      server = http.createServer(function(req, res) {
        res.writeHead(200, {
          "Content-Type": "text/html"
        });
        if (input.resume && input.on) {
          input.resume();
          input.on("data", function(chunk) {
            return res.write(chunk, "utf8");
          });
          return input.on("end", function() {
            res.end();
            server.close();
            return process.exit(0);
          });
        } else {
          res.write(input, "utf8");
          res.end();
          server.close();
          return process.exit(0);
        }
      });
      return server.listen(port);
    };

    return BCat;

  })();

  exports.bcat = function(input, port, browser) {
    var bcat;
    if (port == null) {
      port = 8091;
    }
    bcat = new BCat;
    input || (input = process.openStdin());
    bcat.serve(input, port);
    process.stdout.write("open your browser on http://127.0.0.1:" + port + "/\n\n");
    return bcat.open(browser, port);
  };

}).call(this);

(function() {
  var Assert, BROWSER_FEATURES, BROWSER_OPTIONS, Browser, Console, Cookie, Cookies, Credentials, DEFAULT_FEATURES, DNSMask, EventEmitter, EventLoop, File, HTML, HTML5, Interact, MOUSE_EVENT_NAMES, Mime, Path, PortMap, Q, Resources, Storages, Tough, URL, XPath, assert, createTabs, format, ms,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  assert = require("assert");

  Assert = require("./assert");

  createTabs = require("./tabs");

  Console = require("./console");

  Cookies = require("./cookies");

  DNSMask = require("./dns_mask");

  EventEmitter = require("events").EventEmitter;

  EventLoop = require("./eventloop");

  format = require("util").format;

  File = require("fs");

  HTML5 = require("html5");

  Interact = require("./interact");

  HTML = require("jsdom").dom.level3.html;

  Mime = require("mime");

  ms = require("ms");

  Q = require("q");

  Path = require("path");

  PortMap = require("./port_map");

  Resources = require("./resources");

  Storages = require("./storage");

  Tough = require("tough-cookie");

  Cookie = Tough.Cookie;

  URL = require("url");

  XPath = require("jsdom").dom.level3.xpath;

  require("./jsdom_patches");

  require("./forms");

  require("./dom_focus");

  require("./dom_iframe");

  BROWSER_OPTIONS = ["debug", "features", "headers", "htmlParser", "waitDuration", "proxy", "referer", "silent", "site", "strictSSL", "userAgent", "maxRedirects", "language", "runScripts"];

  BROWSER_FEATURES = ["scripts", "css", "img", "iframe"];

  DEFAULT_FEATURES = "scripts no-css no-img iframe";

  MOUSE_EVENT_NAMES = ["mousedown", "mousemove", "mouseup"];

  Browser = (function(_super) {
    __extends(Browser, _super);

    function Browser(options) {
      var browser, extension, name, _i, _j, _len, _len1, _ref;
      if (options == null) {
        options = {};
      }
      browser = this;
      this.cookies = new Cookies();
      this._storages = new Storages();
      this._interact = Interact.use(this);
      this._windowInScope = null;
      this.assert = new Assert(this);
      this.console = new Console(this);
      this.on("console", function(level, message) {
        if (!browser.silent) {
          switch (level) {
            case "error":
              return process.stderr.write(message + "\n");
            case "debug":
              if (browser.debug) {
                return process.stdout.write(message + "\n");
              }
              break;
            default:
              return process.stdout.write(message + "\n");
          }
        }
      });
      this.on("log", function(message) {
        if (browser.debug) {
          return process.stdout.write("Zombie: " + message + "\n");
        }
      });
      this.referer = null;
      this.resources = new Resources(this);
      this.on("request", function(request) {});
      this.on("response", function(request, response) {
        return browser.log("" + request.method + " " + request.url + " => " + response.statusCode);
      });
      this.on("redirect", function(request, response) {
        return browser.log("" + request.method + " " + request.url + " => " + response.statusCode + " " + response.url);
      });
      this.on("loaded", function(document) {
        return browser.log("Loaded document", document.location.href);
      });
      this.tabs = createTabs(this);
      this.on("opened", function(window) {
        return browser.log("Opened window", window.location.href, window.name || "");
      });
      this.on("closed", function(window) {
        return browser.log("Closed window", window.location.href, window.name || "");
      });
      this.on("active", function(window) {
        var element, onfocus;
        onfocus = window.document.createEvent("HTMLEvents");
        onfocus.initEvent("focus", false, false);
        window.dispatchEvent(onfocus);
        if (element = window.document.activeElement) {
          onfocus = window.document.createEvent("HTMLEvents");
          onfocus.initEvent("focus", false, false);
          return element.dispatchEvent(onfocus);
        }
      });
      this.on("inactive", function(window) {
        var element, onblur;
        if (element = window.document.activeElement) {
          onblur = window.document.createEvent("HTMLEvents");
          onblur.initEvent("blur", false, false);
          element.dispatchEvent(onblur);
        }
        onblur = window.document.createEvent("HTMLEvents");
        onblur.initEvent("blur", false, false);
        return window.dispatchEvent(onblur);
      });
      this.eventLoop = new EventLoop(this);
      this.errors = [];
      this.on("error", function(error) {
        browser.errors.push(error);
        return browser.console.error(error.message, error.stack);
      });
      this.on("done", function(timedOut) {
        if (timedOut) {
          return browser.log("Event loop timed out");
        } else {
          return browser.log("Event loop is empty");
        }
      });
      this.on("timeout", function(fn, delay) {
        return browser.log("Fired timeout after " + delay + "ms delay");
      });
      this.on("interval", function(fn, interval) {
        return browser.log("Fired interval every " + interval + "ms");
      });
      this.on("link", function(url, target) {
        return browser.log("Follow link to " + url);
      });
      this.on("submit", function(url, target) {
        return browser.log("Submit form to " + url);
      });
      for (_i = 0, _len = BROWSER_OPTIONS.length; _i < _len; _i++) {
        name = BROWSER_OPTIONS[_i];
        if (options.hasOwnProperty(name)) {
          this[name] = options[name];
        } else if (Browser["default"].hasOwnProperty(name)) {
          this[name] = Browser["default"][name];
        }
      }
      _ref = Browser._extensions;
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        extension = _ref[_j];
        extension(this);
      }
    }

    Browser.extend = function(extension) {
      return Browser._extensions.push(extension);
    };

    Browser._extensions = [];

    Browser.prototype.hasFeature = function(name, ifMissing) {
      var features;
      if (ifMissing == null) {
        ifMissing = true;
      }
      if (this.features) {
        features = this.features.split(/\s+/);
        if (~features.indexOf(name)) {
          return true;
        }
        if (~features.indexOf("no-" + name)) {
          return false;
        }
      }
      return ifMissing;
    };

    Browser.prototype.withOptions = function(options, fn) {
      var k, restore, v, _ref;
      if (options) {
        restore = {};
        for (k in options) {
          v = options[k];
          if (~BROWSER_OPTIONS.indexOf(k)) {
            _ref = [this[k], v], restore[k] = _ref[0], this[k] = _ref[1];
          }
        }
        return (function(_this) {
          return function() {
            var _results;
            _results = [];
            for (k in restore) {
              v = restore[k];
              _results.push(_this[k] = v);
            }
            return _results;
          };
        })(this);
      } else {
        return function() {};
      }
    };

    Browser.prototype.fork = function() {
      var forked, name, opt, _i, _len;
      opt = {};
      for (_i = 0, _len = BROWSER_OPTIONS.length; _i < _len; _i++) {
        name = BROWSER_OPTIONS[_i];
        opt[name] = this[name];
      }
      forked = Browser.create(opt);
      forked.loadCookies(this.saveCookies());
      forked.loadStorage(this.saveStorage());
      forked.location = this.location.href;
      return forked;
    };

    Browser.prototype.__defineGetter__("window", function() {
      return this.tabs.current;
    });

    Browser.prototype.open = function(options) {
      var name, referer, url;
      if (options) {
        url = options.url, name = options.name, referer = options.referer;
      }
      return this.tabs.open({
        url: url,
        name: name,
        referer: referer
      });
    };

    Browser.prototype.__defineGetter__("error", function() {
      return this.errors[this.errors.length - 1];
    });

    Browser.prototype.wait = function(options, callback) {
      var completionFunction, promise, waitDuration, _ref;
      if (!this.window) {
        process.nextTick(function() {
          return callback(new Error("No window open"));
        });
        return;
      }
      if (arguments.length === 1 && typeof options === "function") {
        _ref = [options, null], callback = _ref[0], options = _ref[1];
      }
      if (callback && typeof callback !== "function") {
        throw new Error("Second argument expected to be a callback function or null");
      }
      if (typeof options === "number") {
        waitDuration = options;
      } else if (typeof options === "string") {
        waitDuration = options;
      } else if (typeof options === "function") {
        waitDuration = this.waitDuration;
        completionFunction = options;
      } else if (options) {
        waitDuration = options.duration || this.waitDuration;
        if (options.element) {
          completionFunction = function(window) {
            return !!window.document.querySelector(options.element);
          };
        } else {
          completionFunction = options["function"];
        }
      } else {
        waitDuration = this.waitDuration;
      }
      promise = this.eventLoop.wait(waitDuration, completionFunction);
      if (callback) {
        promise.done(callback, callback);
      }
      return promise;
    };

    Browser.prototype.fire = function(selector, eventName, callback) {
      var event, eventType, target;
      if (!this.window) {
        throw new Error("No window open");
      }
      target = this.query(selector);
      if (!(target && target.dispatchEvent)) {
        throw new Error("No target element (note: call with selector/element, event name and callback)");
      }
      if (~MOUSE_EVENT_NAMES.indexOf(eventName)) {
        eventType = "MouseEvents";
      } else {
        eventType = "HTMLEvents";
      }
      event = this.document.createEvent(eventType);
      event.initEvent(eventName, true, true);
      target.dispatchEvent(event);
      return this.wait(callback);
    };

    Browser.prototype.click = function(selector, callback) {
      return this.fire(selector, "click", callback);
    };

    Browser.prototype.dispatchEvent = function(selector, event) {
      var target;
      target = this.query(selector);
      if (!this.window) {
        throw new Error("No window open");
      }
      return target.dispatchEvent(event);
    };

    Browser.prototype.queryAll = function(selector, context) {
      var elements;
      if (Array.isArray(selector)) {
        return selector;
      } else if (selector instanceof HTML.Element) {
        return [selector];
      } else if (selector) {
        context || (context = this.document);
        elements = context.querySelectorAll(selector);
        return Array.prototype.slice.call(elements, 0);
      } else {
        return [];
      }
    };

    Browser.prototype.query = function(selector, context) {
      if (selector instanceof HTML.Element) {
        return selector;
      }
      if (selector) {
        context || (context = this.document);
        return context.querySelector(selector);
      } else {
        return context;
      }
    };

    Browser.prototype.$$ = function(selector, context) {
      return this.query(selector, context);
    };

    Browser.prototype.querySelector = function(selector) {
      return this.document.querySelector(selector);
    };

    Browser.prototype.querySelectorAll = function(selector) {
      return this.document.querySelectorAll(selector);
    };

    Browser.prototype.text = function(selector, context) {
      if (this.document.documentElement) {
        return this.queryAll(selector || "html", context).map(function(e) {
          return e.textContent;
        }).join("").trim().replace(/\s+/g, " ");
      } else if (this.source) {
        return this.source.toString();
      } else {
        return "";
      }
    };

    Browser.prototype.html = function(selector, context) {
      if (this.document.documentElement) {
        return this.queryAll(selector || "html", context).map(function(e) {
          return e.outerHTML.trim();
        }).join("");
      } else if (this.source) {
        return this.source.toString();
      } else {
        return "";
      }
    };

    Browser.prototype.xpath = function(expression, context) {
      return this.document.evaluate(expression, context || this.document.documentElement, null, XPath.XPathResult.ANY_TYPE);
    };

    Browser.prototype.__defineGetter__("document", function() {
      if (this.window) {
        return this.window.document;
      }
    });

    Browser.prototype.__defineGetter__("body", function() {
      return this.document.querySelector("body");
    });

    Browser.prototype.__defineGetter__("activeElement", function() {
      return this.document.activeElement;
    });

    Browser.prototype.close = function(window) {
      return this.tabs.close.apply(this.tabs, arguments);
    };

    Browser.prototype.destroy = function() {
      if (this.tabs) {
        this.tabs.closeAll();
        return this.tabs = null;
      }
    };

    Browser.prototype.visit = function(url, options, callback) {
      var promise, resetOptions, site, _ref;
      if (typeof options === "function" && !callback) {
        _ref = [options, null], callback = _ref[0], options = _ref[1];
      }
      resetOptions = this.withOptions(options);
      if (site = this.site) {
        if (!/^(https?:|file:)/i.test(site)) {
          site = "http://" + site;
        }
        url = URL.resolve(site, URL.parse(URL.format(url)));
      }
      if (this.window) {
        this.tabs.close(this.window);
      }
      this.tabs.open({
        url: url,
        referer: this.referer
      });
      promise = this.wait(options);
      promise["finally"](resetOptions);
      if (callback) {
        promise.done(callback, callback);
      }
      return promise;
    };

    Browser.prototype.load = function(html, callback) {
      var deferred, error, first;
      this.location = "about:blank";
      try {
        this.errors = [];
        this.document.readyState = "loading";
        this.document.open();
        this.document.write(html);
        this.document.close();
      } catch (_error) {
        error = _error;
        this.emit("error", error);
      }
      first = this.errors[0];
      if (first) {
        if (callback) {
          process.nextTick(function() {
            return callback(first);
          });
        } else {
          deferred = Q.defer();
          deferred.reject(first);
          return deferred.promise;
        }
      } else {
        return this.wait(callback);
      }
    };

    Browser.prototype.__defineGetter__("location", function() {
      if (this.window) {
        return this.window.location;
      }
    });

    Browser.prototype.__defineSetter__("location", function(url) {
      if (this.window) {
        return this.window.location = url;
      } else {
        return this.open({
          url: url
        });
      }
    });

    Browser.prototype.__defineGetter__("url", function() {
      if (this.window) {
        return URL.format(this.window.location);
      }
    });

    Browser.prototype.link = function(selector) {
      var link, _i, _len, _ref;
      if (selector instanceof HTML.Element) {
        return selector;
      }
      link = this.querySelector(selector);
      if (link && link.tagName === "A") {
        return link;
      }
      _ref = this.querySelectorAll("body a");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        link = _ref[_i];
        if (link.textContent.trim() === selector) {
          return link;
        }
      }
      return null;
    };

    Browser.prototype.clickLink = function(selector, callback) {
      var link;
      if (!(link = this.link(selector))) {
        throw new Error("No link matching '" + selector + "'");
      }
      return this.click(link, callback);
    };

    Browser.prototype.__defineGetter__("history", function() {
      if (!this.window) {
        this.open();
      }
      return this.window.history;
    });

    Browser.prototype.back = function(callback) {
      this.window.history.back();
      return this.wait(callback);
    };

    Browser.prototype.reload = function(callback) {
      this.window.location.reload();
      return this.wait(callback);
    };

    Browser.prototype.authenticate = function(host, create) {
      var credentials, _ref;
      if (create == null) {
        create = true;
      }
      host || (host = "*");
      credentials = (_ref = this._credentials) != null ? _ref[host] : void 0;
      if (!credentials) {
        if (create) {
          credentials = new Credentials();
          this._credentials || (this._credentials = {});
          this._credentials[host] = credentials;
        } else {
          credentials = this.authenticate();
        }
      }
      return credentials;
    };

    Browser.prototype.saveHistory = function() {
      return this.window.history.save();
    };

    Browser.prototype.loadHistory = function(serialized) {
      return this.window.history.load(serialized);
    };

    Browser.prototype.field = function(selector) {
      var error, field, forAttr, label, _i, _j, _len, _len1, _ref, _ref1;
      if (selector instanceof HTML.Element) {
        return selector;
      }
      try {
        field = this.query(selector);
        if (field && (field.tagName === "INPUT" || field.tagName === "TEXTAREA" || field.tagName === "SELECT")) {
          return field;
        }
      } catch (_error) {
        error = _error;
      }
      _ref = this.queryAll("input[name],textarea[name],select[name]");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        field = _ref[_i];
        if (field.getAttribute("name") === selector) {
          return field;
        }
      }
      _ref1 = this.queryAll("label");
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        label = _ref1[_j];
        if (label.textContent.trim() === selector) {
          if (forAttr = label.getAttribute("for")) {
            return this.document.getElementById(forAttr);
          } else {
            return label.querySelector("input,textarea,select");
          }
        }
      }
    };

    Browser.prototype.focus = function(selector) {
      var field;
      field = this.field(selector) || this.query(selector);
      if (!field) {
        throw new Error("No form field matching '" + selector + "'");
      }
      field.focus();
      return this;
    };

    Browser.prototype.fill = function(selector, value) {
      var field;
      field = this.field(selector);
      if (!(field && (field.tagName === "TEXTAREA" || (field.tagName === "INPUT")))) {
        throw new Error("No INPUT matching '" + selector + "'");
      }
      if (field.getAttribute("disabled")) {
        throw new Error("This INPUT field is disabled");
      }
      if (field.getAttribute("readonly")) {
        throw new Error("This INPUT field is readonly");
      }
      field.focus();
      field.value = value;
      this.fire(field, "input");
      field.blur();
      return this;
    };

    Browser.prototype._setCheckbox = function(selector, value) {
      var field;
      field = this.field(selector);
      if (!(field && field.tagName === "INPUT" && field.type === "checkbox")) {
        throw new Error("No checkbox INPUT matching '" + selector + "'");
      }
      if (field.getAttribute("disabled")) {
        throw new Error("This INPUT field is disabled");
      }
      if (field.getAttribute("readonly")) {
        throw new Error("This INPUT field is readonly");
      }
      if (field.checked ^ value) {
        field.click();
      }
      return this;
    };

    Browser.prototype.check = function(selector) {
      return this._setCheckbox(selector, true);
    };

    Browser.prototype.uncheck = function(selector) {
      return this._setCheckbox(selector, false);
    };

    Browser.prototype.choose = function(selector) {
      var field;
      field = this.field(selector) || this.field("input[type=radio][value=\"" + (escape(selector)) + "\"]");
      if (!(field && field.tagName === "INPUT" && field.type === "radio")) {
        throw new Error("No radio INPUT matching '" + selector + "'");
      }
      field.click();
      return this;
    };

    Browser.prototype._findOption = function(selector, value) {
      var field, option, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
      field = this.field(selector);
      if (!(field && field.tagName === "SELECT")) {
        throw new Error("No SELECT matching '" + selector + "'");
      }
      if (field.getAttribute("disabled")) {
        throw new Error("This SELECT field is disabled");
      }
      if (field.getAttribute("readonly")) {
        throw new Error("This SELECT field is readonly");
      }
      _ref = field.options;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        option = _ref[_i];
        if (option.value === value) {
          return option;
        }
      }
      _ref1 = field.options;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        option = _ref1[_j];
        if (option.label === value) {
          return option;
        }
      }
      _ref2 = field.options;
      for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
        option = _ref2[_k];
        if (option.textContent.trim() === value) {
          return option;
        }
      }
      throw new Error("No OPTION '" + value + "'");
    };

    Browser.prototype.select = function(selector, value) {
      var option;
      option = this._findOption(selector, value);
      this.selectOption(option);
      return this;
    };

    Browser.prototype.selectOption = function(selector) {
      var option, select;
      option = this.query(selector);
      if (option && !option.getAttribute("selected")) {
        select = this.xpath("./ancestor::select", option).iterateNext();
        option.setAttribute("selected", "selected");
        select.focus();
        this.fire(select, "change");
      }
      return this;
    };

    Browser.prototype.unselect = function(selector, value) {
      var option;
      option = this._findOption(selector, value);
      this.unselectOption(option);
      return this;
    };

    Browser.prototype.unselectOption = function(selector) {
      var option, select;
      option = this.query(selector);
      if (option && option.getAttribute("selected")) {
        select = this.xpath("./ancestor::select", option).iterateNext();
        if (!select.multiple) {
          throw new Error("Cannot unselect in single select");
        }
        option.removeAttribute("selected");
        select.focus();
        this.fire(select, "change");
      }
      return this;
    };

    Browser.prototype.attach = function(selector, filename) {
      var field, file, stat;
      field = this.field(selector);
      if (!(field && field.tagName === "INPUT" && field.type === "file")) {
        throw new Error("No file INPUT matching '" + selector + "'");
      }
      if (filename) {
        stat = File.statSync(filename);
        file = new this.window.File();
        file.name = Path.basename(filename);
        file.type = Mime.lookup(filename);
        file.size = stat.size;
        field.files || (field.files = []);
        field.files.push(file);
        field.value = filename;
      }
      field.focus();
      this.fire(field, "change");
      return this;
    };

    Browser.prototype.button = function(selector) {
      var button, input, inputs, _i, _j, _k, _len, _len1, _len2, _ref;
      if (selector instanceof HTML.Element) {
        return selector;
      }
      if (button = this.querySelector(selector)) {
        if (button.tagName === "BUTTON" || button.tagName === "INPUT") {
          return button;
        }
      }
      _ref = this.querySelectorAll("button");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        button = _ref[_i];
        if (button.textContent.trim() === selector) {
          return button;
        }
      }
      inputs = this.querySelectorAll("input[type=submit],button");
      for (_j = 0, _len1 = inputs.length; _j < _len1; _j++) {
        input = inputs[_j];
        if (input.name === selector) {
          return input;
        }
      }
      for (_k = 0, _len2 = inputs.length; _k < _len2; _k++) {
        input = inputs[_k];
        if (input.value === selector) {
          return input;
        }
      }
    };

    Browser.prototype.pressButton = function(selector, callback) {
      var button;
      if (!(button = this.button(selector))) {
        throw new Error("No BUTTON '" + selector + "'");
      }
      if (button.getAttribute("disabled")) {
        throw new Error("This button is disabled");
      }
      button.focus();
      this.fire(button, "click");
      return this.wait(callback);
    };

    Browser.prototype.getCookie = function(identifier, allProperties) {
      var cookie;
      identifier = this._cookieIdentifier(identifier);
      assert(identifier.name, "Missing cookie name");
      assert(identifier.domain, "No domain specified and no open page");
      cookie = this.cookies.select(identifier)[0];
      if (cookie) {
        if (allProperties) {
          return this._cookieProperties(cookie);
        } else {
          return cookie.value;
        }
      } else {
        return null;
      }
    };

    Browser.prototype.deleteCookie = function(identifier) {
      var cookie;
      identifier = this._cookieIdentifier(identifier);
      assert(identifier.name, "Missing cookie name");
      assert(identifier.domain, "No domain specified and no open page");
      cookie = this.cookies.select(identifier)[0];
      if (cookie) {
        this.cookies["delete"](cookie);
        return true;
      } else {
        return false;
      }
    };

    Browser.prototype.setCookie = function(nameOrOptions, value) {
      var domain, location;
      if (location = this.location) {
        domain = location.hostname;
      }
      if (typeof nameOrOptions === "string") {
        this.cookies.set({
          name: nameOrOptions,
          value: value || "",
          domain: domain,
          path: "/",
          secure: false,
          httpOnly: false
        });
      } else {
        assert(nameOrOptions.name, "Missing cookie name");
        this.cookies.set({
          name: nameOrOptions.name,
          value: nameOrOptions.value || value || "",
          domain: nameOrOptions.domain || domain,
          path: nameOrOptions.path || "/",
          secure: !!nameOrOptions.secure,
          httpOnly: !!nameOrOptions.httpOnly,
          expires: nameOrOptions.expires,
          "max-age": nameOrOptions["max-age"]
        });
      }
    };

    Browser.prototype.deleteCookies = function() {
      this.cookies.deleteAll();
    };

    Browser.prototype.saveCookies = function() {
      var cookie, serialized, _i, _len, _ref;
      serialized = ["# Saved on " + (new Date().toISOString())];
      _ref = this.cookies.sort(Tough.cookieCompare);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cookie = _ref[_i];
        serialized.push(cookie.toString());
      }
      return serialized.join("\n") + "\n";
    };

    Browser.prototype.loadCookies = function(serialized) {
      var line, _i, _len, _ref, _results;
      _ref = serialized.split(/\n+/);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        line = line.trim();
        if (line[0] === "#" || line === "") {
          continue;
        }
        _results.push(this.cookies.push(Cookie.parse(line)));
      }
      return _results;
    };

    Browser.prototype._cookieProperties = function(cookie) {
      var properties;
      properties = {
        name: cookie.key,
        value: cookie.value,
        domain: cookie.domain,
        path: cookie.path
      };
      if (cookie.secure) {
        properties.secure = true;
      }
      if (cookie.httpOnly) {
        properties.httpOnly = true;
      }
      if (cookie.expires && cookie.expires < Infinity) {
        properties.expires = cookie.expires;
      }
      return properties;
    };

    Browser.prototype._cookieIdentifier = function(identifier) {
      var domain, location, path;
      location = this.location;
      domain = location && location.hostname;
      path = location && location.pathname || "/";
      if (typeof identifier === "string") {
        identifier = {
          name: identifier,
          domain: domain,
          path: path
        };
      } else {
        identifier = {
          name: identifier.name,
          domain: identifier.domain || domain,
          path: identifier.path || path
        };
      }
      return identifier;
    };

    Browser.prototype.localStorage = function(host) {
      return this._storages.local(host);
    };

    Browser.prototype.sessionStorage = function(host) {
      return this._storages.session(host);
    };

    Browser.prototype.saveStorage = function() {
      return this._storages.save();
    };

    Browser.prototype.loadStorage = function(serialized) {
      return this._storages.load(serialized);
    };

    Browser.prototype.evaluate = function(code, filename) {
      if (!this.window) {
        this.open();
      }
      return this.window._evaluate(code, filename);
    };

    Browser.prototype.inject = function(src, callback) {
      var err, script;
      script = this.window.document.createElement('script');
      script.onload = (function(_this) {
        return function() {
          return callback(null, _this);
        };
      })(this);
      script.onerror = (function(_this) {
        return function(err) {
          return callback(err, _this);
        };
      })(this);
      script.src = src;
      try {
        return this.window.document.documentElement.appendChild(script);
      } catch (_error) {
        err = _error;
        return callback(err, this);
      }
    };

    Browser.prototype.onalert = function(fn) {
      return this._interact.onalert(fn);
    };

    Browser.prototype.onconfirm = function(question, response) {
      return this._interact.onconfirm(question, response);
    };

    Browser.prototype.onprompt = function(message, response) {
      return this._interact.onprompt(message, response);
    };

    Browser.prototype.prompted = function(message) {
      return this._interact.prompted(message);
    };

    Browser.prototype.__defineGetter__("statusCode", function() {
      if (this.window && this.window._response) {
        return this.window._response.statusCode;
      } else {
        return null;
      }
    });

    Browser.prototype.__defineGetter__("success", function() {
      var statusCode;
      statusCode = this.statusCode;
      return statusCode >= 200 && statusCode < 400;
    });

    Browser.prototype.__defineGetter__("redirected", function() {
      return this.window && this.window._response && this.window._response.redirects > 0;
    });

    Browser.prototype.__defineGetter__("source", function() {
      if (this.window && this.window._response) {
        return this.window._response.body;
      } else {
        return null;
      }
    });

    Browser.prototype.viewInBrowser = function(browser) {
      return require("./bcat").bcat(this.html());
    };

    Browser.prototype.log = function() {
      var args;
      if (typeof arguments[0] === "function") {
        args = [arguments[0]()];
      } else {
        args = arguments;
      }
      return this.emit("log", format.apply(null, args));
    };

    Browser.prototype.dump = function() {
      var html, indent;
      indent = function(lines) {
        return lines.map(function(l) {
          return "  " + l + "\n";
        }).join("");
      };
      process.stdout.write("Zombie: " + Browser.VERSION + "\n\n");
      process.stdout.write("URL: " + this.window.location.href + "\n");
      process.stdout.write("History:\n" + (indent(this.window.history.dump())) + "\n");
      process.stdout.write("Cookies:\n" + (indent(this.cookies.dump())) + "\n");
      process.stdout.write("Storage:\n" + (indent(this._storages.dump())) + "\n");
      process.stdout.write("Eventloop:\n" + (indent(this.eventLoop.dump())) + "\n");
      if (this.document) {
        html = this.document.outerHTML;
        if (html.length > 497) {
          html = html.slice(0, 497) + "...";
        }
        return process.stdout.write("Document:\n" + (indent(html.split("\n"))) + "\n");
      } else {
        if (!this.document) {
          return process.stdout.write("No document\n");
        }
      }
    };

    return Browser;

  })(EventEmitter);

  Browser.VERSION = JSON.parse(File.readFileSync("" + __dirname + "/../../package.json")).version;

  Browser["default"] = {
    debug: false,
    features: DEFAULT_FEATURES,
    htmlParser: HTML5,
    maxRedirects: 5,
    proxy: null,
    silent: false,
    site: void 0,
    strictSSL: false,
    userAgent: "Mozilla/5.0 Chrome/10.0.613.0 Safari/534.15 Zombie.js/" + Browser.VERSION,
    language: "en-US",
    waitDuration: "5s",
    runScripts: true
  };

  Browser.create = function(options) {
    return new Browser(options);
  };

  Browser.dns = new DNSMask();

  Browser.ports = new PortMap();

  Browser.localhost = function(hostname, port) {
    Browser.dns.localhost(hostname);
    Browser.ports.map(hostname, port);
    if (!Browser["default"].site) {
      return Browser["default"].site = hostname.replace(/^\*\./, "");
    }
  };

  Credentials = (function() {
    function Credentials() {}

    Credentials.prototype.apply = function(headers) {
      var base64;
      switch (this.scheme) {
        case "basic":
          base64 = new Buffer(this.user + ":" + this.password).toString("base64");
          return headers["authorization"] = "Basic " + base64;
        case "bearer":
          return headers["authorization"] = "Bearer " + this.token;
        case "oauth":
          return headers["authorization"] = "OAuth " + this.token;
      }
    };

    Credentials.prototype.basic = function(user, password) {
      this.user = user;
      this.password = password;
      return this.scheme = "basic";
    };

    Credentials.prototype.bearer = function(token) {
      this.token = token;
      return this.scheme = "bearer";
    };

    Credentials.prototype.oauth = function(token) {
      this.token = token;
      return this.scheme = "oauth";
    };

    Credentials.prototype.reset = function() {
      delete this.scheme;
      delete this.token;
      delete this.user;
      return delete this.password;
    };

    return Credentials;

  })();

  module.exports = Browser;

}).call(this);

(function() {
  var Console, format, inspect, _ref,
    __slice = [].slice;

  _ref = require("util"), format = _ref.format, inspect = _ref.inspect;

  Console = (function() {
    function Console(browser) {
      this.browser = browser;
    }

    Console.prototype.assert = function(expression) {
      var message;
      if (expression) {
        return;
      }
      message = "Assertion failed:" + (format.apply(null, [""].concat(__slice.call(Array.prototype.slice.call(arguments, 1)))));
      this.browser.emit("console", "error", message);
      throw new Error(message);
    };

    Console.prototype.count = function(name) {
      var message, _base;
      this.counters || (this.counters = {});
      (_base = this.counters)[name] || (_base[name] = 0);
      this.counters[name]++;
      message = "" + name + ": " + this.counters[name];
      this.browser.emit("console", "log", message);
    };

    Console.prototype.debug = function() {
      this.browser.emit("console", "debug", format.apply(null, arguments));
    };

    Console.prototype.error = function() {
      this.browser.emit("console", "error", format.apply(null, arguments));
    };

    Console.prototype.group = function() {};

    Console.prototype.groupCollapsed = function() {};

    Console.prototype.groupEnd = function() {};

    Console.prototype.dir = function(object) {
      this.browser.emit("console", "log", inspect(object));
    };

    Console.prototype.info = function() {
      this.browser.emit("console", "info", format.apply(null, arguments));
    };

    Console.prototype.log = function() {
      this.browser.emit("console", "log", format.apply(null, arguments));
    };

    Console.prototype.time = function(name) {
      this.timers || (this.timers = {});
      return this.timers[name] = Date.now();
    };

    Console.prototype.timeEnd = function(name) {
      var message, start;
      if (this.timers) {
        if (start = this.timers[name]) {
          delete this.timers[name];
          message = "" + name + ": " + (Date.now() - start) + "ms";
          this.browser.emit("console", "log", message);
        }
      }
    };

    Console.prototype.trace = function() {
      var message, stack;
      stack = (new Error).stack.split("\n");
      stack[0] = "console.trace()";
      message = stack.join("\n");
      this.browser.emit("console", "trace", message);
    };

    Console.prototype.warn = function() {
      this.browser.emit("console", "warn", format.apply(null, arguments));
    };

    return Console;

  })();

  module.exports = Console;

}).call(this);

(function() {
  var Cookie, Cookies, HTML, Tough, assert,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  assert = require("assert");

  HTML = require("jsdom").dom.level3.html;

  Tough = require("tough-cookie");

  Cookie = Tough.Cookie;

  module.exports = Cookies = (function(_super) {
    __extends(Cookies, _super);

    function Cookies() {}

    Cookies.prototype.dump = function() {
      var cookie, _i, _len, _ref, _results;
      _ref = this.sort(Tough.cookieCompare);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cookie = _ref[_i];
        _results.push(process.stdout.write(cookie.toString() + "\n"));
      }
      return _results;
    };

    Cookies.prototype.serialize = function(domain, path) {
      return this.select({
        domain: domain,
        path: path
      }).map(function(cookie) {
        return cookie.cookieString();
      }).join("; ");
    };

    Cookies.prototype.select = function(identifier) {
      var cookies;
      cookies = this.filter(function(cookie) {
        return cookie.TTL() > 0;
      });
      if (identifier.name) {
        cookies = cookies.filter(function(cookie) {
          return cookie.key === identifier.name;
        });
      }
      if (identifier.path) {
        cookies = cookies.filter(function(cookie) {
          return Tough.pathMatch(identifier.path, cookie.path);
        });
      }
      if (identifier.domain) {
        cookies = cookies.filter(function(cookie) {
          return Tough.domainMatch(identifier.domain, cookie.domain);
        });
      }
      return cookies.sort(function(a, b) {
        return b.domain.length - a.domain.length;
      }).sort(Tough.cookieCompare);
    };

    Cookies.prototype.set = function(params) {
      var cookie, deleteIfExists;
      cookie = new Cookie({
        key: params.name,
        value: params.value,
        domain: params.domain || "localhost",
        path: params.path || "/"
      });
      if (params.expires) {
        cookie.setExpires(params.expires);
      } else if (params.hasOwnProperty("max-age")) {
        cookie.setMaxAge(params["max-age"]);
      }
      cookie.secure = !!params.secure;
      cookie.httpOnly = !!params.httpOnly;
      deleteIfExists = this.filter(function(c) {
        return c.key === cookie.key && c.domain === cookie.domain && c.path === cookie.path;
      })[0];
      this["delete"](deleteIfExists);
      if (cookie.TTL() > 0) {
        this.push(cookie);
      }
    };

    Cookies.prototype["delete"] = function(cookie) {
      var index;
      index = this.indexOf(cookie);
      if (~index) {
        return this.splice(index, 1);
      }
    };

    Cookies.prototype.deleteAll = function() {
      return this.length = 0;
    };

    Cookies.prototype.update = function(httpHeader, domain, path) {
      var cookie, deleteIfExists, _i, _len, _ref;
      if (httpHeader.constructor === Array) {
        httpHeader = httpHeader.join(",");
      }
      _ref = httpHeader.split(/,(?=[^;,]*=)|,$/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cookie = _ref[_i];
        cookie = Cookie.parse(cookie);
        if (cookie) {
          cookie.domain || (cookie.domain = domain);
          cookie.path || (cookie.path = Tough.defaultPath(path));
          deleteIfExists = this.filter(function(c) {
            return c.key === cookie.key && c.domain === cookie.domain && c.path === cookie.path;
          })[0];
          this["delete"](deleteIfExists);
          if (cookie.TTL() > 0) {
            this.push(cookie);
          }
        }
      }
    };

    return Cookies;

  })(Array);

  HTML.HTMLDocument.prototype.__defineGetter__("cookie", function() {
    return this.window.browser.cookies.select({
      domain: this.location.hostname,
      path: this.location.pathname
    }).filter(function(cookie) {
      return !cookie.httpOnly;
    }).map(function(cookie) {
      return "" + cookie.key + "=" + cookie.value;
    }).join("; ");
  });

  HTML.HTMLDocument.prototype.__defineSetter__("cookie", function(cookie) {
    return this.window.browser.cookies.update(cookie.toString(), this.location.hostname, this.location.pathname);
  });

}).call(this);

(function() {
  var DNS, DNSMask, Net;

  DNS = require("dns");

  Net = require("net");

  DNSMask = (function() {
    function DNSMask() {
      this._domains = {};
      this._lookup = DNS.lookup;
      DNS.lookup = this.lookup.bind(this);
      this._resolve = DNS.resolve;
      DNS.resolve = this.resolve.bind(this);
      this._resolveMx = DNS.resolve;
      DNS.resolveMx = this.resolveMx.bind(this);
    }

    DNSMask.prototype.localhost = function(domain) {
      this.map(domain, "A", "127.0.0.1");
      return this.map(domain, "AAAA", "::1");
    };

    DNSMask.prototype.map = function(domain, type, address) {
      var _base;
      if (arguments.length === 2) {
        address = type;
        switch (Net.isIP(address)) {
          case 4:
            type = "A";
            break;
          case 6:
            type = "AAAA";
            break;
          default:
            type = "CNAME";
        }
      }
      if (address) {
        (_base = this._domains)[domain] || (_base[domain] = {});
        return this._domains[domain][type] = address;
      } else {
        return this.unmap(domain, type);
      }
    };

    DNSMask.prototype.unmap = function(domain, type) {
      var _base;
      if (type) {
        (_base = this._domains)[domain] || (_base[domain] = {});
        return delete this._domains[domain][type];
      } else {
        return delete this._domains[domain];
      }
    };

    DNSMask.prototype.lookup = function(domain, family, callback) {
      var cname, _ref;
      if (arguments.length === 2) {
        _ref = [null, family], family = _ref[0], callback = _ref[1];
      }
      if (Net.isIP(domain)) {
        setImmediate(function() {
          return callback(null, domain, Net.isIP(domain));
        });
        return;
      }
      cname = this._find(domain, "CNAME");
      if (cname) {
        domain = cname;
      }
      switch (family) {
        case 4:
          return this.resolve(domain, "A", (function(_this) {
            return function(error, addresses) {
              return callback(error, addresses && addresses[0], 4);
            };
          })(this));
        case 6:
          return this.resolve(domain, "AAAA", (function(_this) {
            return function(error, addresses) {
              return callback(error, addresses && addresses[0], 6);
            };
          })(this));
        case null:
          return this.resolve(domain, "A", (function(_this) {
            return function(error, addresses) {
              if (addresses) {
                return callback(error, addresses && addresses[0], 4);
              } else {
                return _this.resolve(domain, "AAAA", function(error, addresses) {
                  if (addresses) {
                    return callback(error, addresses && addresses[0], 6);
                  } else {
                    return _this._lookup(domain, family, callback);
                  }
                });
              }
            };
          })(this));
        default:
          throw new Error("Unknown family " + family);
      }
    };

    DNSMask.prototype.resolve = function(domain, type, callback) {
      var ip, _ref;
      if (arguments.length === 2) {
        _ref = ["A", type], type = _ref[0], callback = _ref[1];
      }
      ip = this._find(domain, type);
      if (ip) {
        return setImmediate(function() {
          return callback(null, [ip]);
        });
      } else {
        return this._resolve(domain, type, callback);
      }
    };

    DNSMask.prototype.resolveMx = function(domain, callback) {
      var exchange;
      exchange = this._find(domain, "MX");
      if (exchange) {
        return setImmediate(function() {
          return callback(null, [exchange]);
        });
      } else {
        return this._resolveMx(domain, callback);
      }
    };

    DNSMask.prototype._find = function(domain, type) {
      var domains, i, parts, _i, _ref;
      parts = domain.split('.');
      domains = [domain, "*." + domain];
      for (i = _i = 1, _ref = parts.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        domains.push("*." + parts.slice(i, +parts.length + 1 || 9e9).join('.'));
      }
      return domains.map((function(_this) {
        return function(pattern) {
          return _this._domains[pattern];
        };
      })(this)).map((function(_this) {
        return function(domain) {
          return domain && domain[type];
        };
      })(this)).filter(function(ip) {
        return ip;
      })[0];
    };

    return DNSMask;

  })();

  module.exports = DNSMask;

}).call(this);

(function() {
  var HTML, JSDOM, JSDOMSelectors, Path, createDocument;

  JSDOM = require("jsdom");

  HTML = JSDOM.dom.level3.html;

  Path = require("path");

  JSDOMSelectors = require(Path.resolve(require.resolve("jsdom"), "../jsdom/selectors/index"));

  module.exports = createDocument = function(browser, window, referer) {
    var document, features, jsdomBrowser;
    features = {
      MutationEvents: "2.0",
      ProcessExternalResources: [],
      FetchExternalResources: [],
      QuerySelector: true
    };
    jsdomBrowser = JSDOM.browserAugmentation(HTML, {
      parser: browser.htmlParser
    });
    document = new jsdomBrowser.HTMLDocument({
      referrer: referer
    });
    JSDOMSelectors.applyQuerySelectorPrototype(HTML);
    if (browser.hasFeature("scripts", true)) {
      features.ProcessExternalResources.push("script");
      features.FetchExternalResources.push("script");
    }
    if (browser.hasFeature("css", false)) {
      features.FetchExternalResources.push("css");
      features.FetchExternalResources.push("link");
    }
    if (browser.hasFeature("img", false)) {
      features.FetchExternalResources.push("img");
    }
    if (browser.hasFeature("iframe", true)) {
      features.FetchExternalResources.push("iframe");
    }
    JSDOM.applyDocumentFeatures(document, features);
    Object.defineProperty(document, "window", {
      value: window
    });
    Object.defineProperty(document, "parentWindow", {
      value: window.parent
    });
    Object.defineProperty(document, "location", {
      get: function() {
        return window.location;
      },
      set: function(url) {
        return window.location = url;
      }
    });
    Object.defineProperty(document, "URL", {
      get: function() {
        return window.location.href;
      }
    });
    return document;
  };

}).call(this);

(function() {
  var FOCUS_ELEMENTS, HTML, elementType, setAttribute, setFocus, _i, _j, _len, _len1, _ref, _ref1;

  HTML = require("jsdom").dom.level3.html;

  FOCUS_ELEMENTS = ["INPUT", "SELECT", "TEXTAREA", "BUTTON", "ANCHOR"];

  HTML.HTMLDocument.prototype.__defineGetter__("activeElement", function() {
    return this._inFocus || this.body;
  });

  setFocus = function(document, element) {
    var inFocus, onblur, onfocus;
    inFocus = document._inFocus;
    if (element !== inFocus) {
      if (inFocus) {
        onblur = document.createEvent("HTMLEvents");
        onblur.initEvent("blur", false, false);
        inFocus.dispatchEvent(onblur);
      }
      if (element) {
        onfocus = document.createEvent("HTMLEvents");
        onfocus.initEvent("focus", false, false);
        element.dispatchEvent(onfocus);
        document._inFocus = element;
        return document.window.browser.emit("focus", element);
      }
    }
  };

  HTML.HTMLElement.prototype.focus = function() {};

  HTML.HTMLElement.prototype.blur = function() {};

  _ref = [HTML.HTMLInputElement, HTML.HTMLSelectElement, HTML.HTMLTextAreaElement, HTML.HTMLButtonElement, HTML.HTMLAnchorElement];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    elementType = _ref[_i];
    elementType.prototype.focus = function() {
      return setFocus(this.ownerDocument, this);
    };
    elementType.prototype.blur = function() {
      return setFocus(this.ownerDocument, null);
    };
    setAttribute = elementType.prototype.setAttribute;
    elementType.prototype.setAttribute = function(name, value) {
      var document;
      setAttribute.call(this, name, value);
      if (name === "autofocus") {
        document = this.ownerDocument;
        if (~FOCUS_ELEMENTS.indexOf(this.tagName) && !document._inFocus) {
          return this.focus();
        }
      }
    };
  }

  _ref1 = [HTML.HTMLInputElement, HTML.HTMLTextAreaElement, HTML.HTMLSelectElement];
  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
    elementType = _ref1[_j];
    elementType.prototype._eventDefaults.focus = function(event) {
      var element;
      element = event.target;
      return element._focusValue = element.value || '';
    };
    elementType.prototype._eventDefaults.blur = function(event) {
      var change, element, focusValue;
      element = event.target;
      focusValue = element._focusValue;
      if (focusValue !== element.value) {
        change = element.ownerDocument.createEvent("HTMLEvents");
        change.initEvent("change", false, false);
        return element.dispatchEvent(change);
      }
    };
  }

}).call(this);

(function() {
  var HTML, createHistory, frameInit;

  createHistory = require("./history");

  HTML = require("jsdom").dom.level3.html;

  frameInit = HTML.HTMLFrameElement._init;

  HTML.HTMLFrameElement._init = function() {
    var contentWindow, create, frame, parentWindow;
    frameInit.call(this);
    frame = this;
    parentWindow = frame.ownerDocument.parentWindow;
    contentWindow = null;
    Object.defineProperties(frame, {
      contentWindow: {
        get: function() {
          return contentWindow || create();
        }
      },
      contentDocument: {
        get: function() {
          return (contentWindow || create()).document;
        }
      }
    });
    return create = function(url) {
      var focus, open;
      focus = function(active) {
        return contentWindow = active;
      };
      open = createHistory(parentWindow.browser, focus);
      contentWindow = open({
        name: frame.name,
        parent: parentWindow,
        url: url
      });
      return contentWindow;
    };
  };

  HTML.HTMLFrameElement.prototype.setAttribute = function(name, value) {
    return HTML.HTMLElement.prototype.setAttribute.call(this, name, value);
  };

  HTML.HTMLFrameElement.prototype._attrModified = function(name, value, oldValue) {
    var onload, url;
    HTML.HTMLElement.prototype._attrModified.call(this, name, value, oldValue);
    if (name === "name") {
      return this.ownerDocument.parentWindow.__defineGetter__(value, (function(_this) {
        return function() {
          return _this.contentWindow;
        };
      })(this));
    } else if (name === "src" && value) {
      url = HTML.resourceLoader.resolve(this.ownerDocument, value);
      this.contentWindow.location = url;
      onload = (function(_this) {
        return function() {
          _this.contentWindow.removeEventListener("load", onload);
          onload = _this.ownerDocument.createEvent("HTMLEvents");
          onload.initEvent("load", true, false);
          return _this.dispatchEvent(onload);
        };
      })(this);
      return this.contentWindow.addEventListener("load", onload);
    }
  };

}).call(this);

(function() {
  var EventLoop, EventQueue, Interval, Q, Timeout, ms;

  ms = require("ms");

  Q = require("q");

  global.setImmediate || (global.setImmediate = process.nextTick);

  EventLoop = (function() {
    function EventLoop(browser) {
      this.browser = browser;
      this.active = null;
      this.expected = 0;
      this.running = false;
      this.listeners = [];
    }

    EventLoop.prototype.wait = function(waitDuration, completionFunction) {
      var deferred, eventHandlers, listener, promise, removeListener, timeout, timeoutTimer;
      deferred = Q.defer();
      promise = deferred.promise;
      waitDuration = ms(waitDuration.toString()) || this.browser.waitDuration;
      timeout = Date.now() + waitDuration;
      timeoutTimer = global.setTimeout(function() {
        return deferred.resolve();
      }, waitDuration);
      eventHandlers = {
        tick: (function(_this) {
          return function(next) {
            var completed, error, waitFor;
            if (next >= timeout) {
              deferred.resolve();
            } else if (completionFunction && _this.active.document.documentElement) {
              try {
                waitFor = Math.max(next - Date.now(), 0);
                completed = completionFunction(_this.active, waitFor);
                if (completed) {
                  deferred.resolve();
                }
              } catch (_error) {
                error = _error;
                deferred.reject(error);
              }
            }
          };
        })(this),
        done: deferred.resolve,
        error: deferred.reject
      };
      listener = function(event, argument) {
        return eventHandlers[event](argument);
      };
      this.listeners.push(listener);
      this.browser.addListener("error", deferred.reject);
      removeListener = (function(_this) {
        return function() {
          clearTimeout(timeoutTimer);
          _this.browser.removeListener("error", deferred.reject);
          _this.listeners = _this.listeners.filter(function(l) {
            return l !== listener;
          });
          if (_this.listeners.length === 0) {
            _this.emit("done");
          }
        };
      })(this);
      promise["finally"](removeListener);
      if (this.listeners.length === 1) {
        setImmediate((function(_this) {
          return function() {
            if (_this.active) {
              return _this.run();
            }
          };
        })(this));
      }
      return promise;
    };

    EventLoop.prototype.dump = function() {
      return [];
    };

    EventLoop.prototype.createEventQueue = function(window) {
      return new EventQueue(window);
    };

    EventLoop.prototype.setActiveWindow = function(window) {
      if (window === this.active) {
        return;
      }
      this.active = window;
      if (this.active) {
        return this.run();
      }
    };

    EventLoop.prototype.expecting = function() {
      var done;
      ++this.expected;
      done = (function(_this) {
        return function() {
          --_this.expected;
          _this.run();
        };
      })(this);
      return done;
    };

    EventLoop.prototype.next = function(fn) {
      ++this.expected;
      return setImmediate((function(_this) {
        return function() {
          var error;
          --_this.expected;
          try {
            fn();
            return _this.run();
          } catch (_error) {
            error = _error;
            return _this.emit("error", error);
          }
        };
      })(this));
    };

    EventLoop.prototype.run = function() {
      if (this.running) {
        return;
      }
      if (this.listeners.length === 0) {
        return;
      }
      if (!this.active) {
        this.emit("done");
        return;
      }
      this.running = true;
      setImmediate((function(_this) {
        return function() {
          var error, fn, time;
          _this.running = false;
          if (!_this.active) {
            _this.emit("done");
            return;
          }
          try {
            if (fn = _this.active._eventQueue.dequeue()) {
              fn();
              _this.emit("tick", 0);
              return _this.run();
            } else if (_this.expected > 0) {
              return _this.emit("tick", 0);
            } else {
              time = _this.active._eventQueue.next();
              _this.emit("tick", time);
              return _this.run();
            }
          } catch (_error) {
            error = _error;
            return _this.emit("error", error);
          }
        };
      })(this));
    };

    EventLoop.prototype.emit = function(event, value) {
      var listener, _i, _len, _ref, _results;
      this.browser.emit(event, value);
      _ref = this.listeners;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        _results.push(listener(event, value));
      }
      return _results;
    };

    return EventLoop;

  })();

  EventQueue = (function() {
    function EventQueue(window) {
      this.window = window;
      this.browser = this.window.browser;
      this.eventLoop = this.browser.eventLoop;
      this.timers = [];
      this.queue = [];
      this.expecting = [];
    }

    EventQueue.prototype.destroy = function() {
      var expecting, timer, _i, _j, _len, _len1, _ref, _ref1;
      _ref = this.timers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        timer = _ref[_i];
        if (timer) {
          timer.stop();
        }
      }
      _ref1 = this.expecting;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        expecting = _ref1[_j];
        expecting();
      }
      return this.timers = this.queue = this.expecting = null;
    };

    EventQueue.prototype.enqueue = function(fn) {
      if (fn && this.queue) {
        this.queue.push(fn);
        this.eventLoop.run();
      }
    };

    EventQueue.prototype.dequeue = function() {
      var fn, frame, _i, _len, _ref;
      if (!this.queue) {
        return;
      }
      if (fn = this.queue.shift()) {
        return fn;
      }
      _ref = this.window.frames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        frame = _ref[_i];
        if (fn = frame._eventQueue.dequeue()) {
          return fn;
        }
      }
    };

    EventQueue.prototype.http = function(method, url, options, callback) {
      var done;
      if (!this.queue) {
        return;
      }
      done = this.eventLoop.expecting();
      this.expecting.push(done);
      this.browser.resources.request(method, url, options, (function(_this) {
        return function(error, response) {
          if (_this.queue) {
            _this.enqueue(function() {
              return callback(error, response);
            });
            _this.expecting.splice(_this.expecting.indexOf(done), 1);
            return done();
          }
        };
      })(this));
    };

    EventQueue.prototype.onerror = function(error) {
      var event;
      this.window.console.error(error);
      this.browser.emit("error", error);
      event = this.window.document.createEvent("Event");
      event.initEvent("error", false, false);
      event.message = error.message;
      event.error = error;
      return this.window.dispatchEvent(event);
    };

    EventQueue.prototype.setTimeout = function(fn, delay) {
      var index, remove, timer;
      if (delay == null) {
        delay = 0;
      }
      if (!fn) {
        return;
      }
      index = this.timers.length;
      remove = (function(_this) {
        return function() {
          return delete _this.timers[index];
        };
      })(this);
      timer = new Timeout(this, fn, delay, remove);
      this.timers[index] = timer;
      return index + 1;
    };

    EventQueue.prototype.clearTimeout = function(timerHandle) {
      var index, timer;
      index = timerHandle - 1;
      timer = this.timers[index];
      if (timer) {
        timer.stop();
      }
    };

    EventQueue.prototype.setInterval = function(fn, interval) {
      var index, remove, timer;
      if (interval == null) {
        interval = 0;
      }
      if (!fn) {
        return;
      }
      index = this.timers.length;
      remove = (function(_this) {
        return function() {
          return delete _this.timers[index];
        };
      })(this);
      timer = new Interval(this, fn, interval, remove);
      this.timers[index] = timer;
      return index + 1;
    };

    EventQueue.prototype.clearInterval = function(timerHandle) {
      var index, timer;
      index = timerHandle - 1;
      timer = this.timers[index];
      if (timer) {
        timer.stop();
      }
    };

    EventQueue.prototype.next = function() {
      var frame, frameNext, next, timer, _i, _j, _len, _len1, _ref, _ref1;
      next = Infinity;
      _ref = this.timers;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        timer = _ref[_i];
        if (timer && timer.next < next) {
          next = timer.next;
        }
      }
      _ref1 = this.window.frames;
      for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
        frame = _ref1[_j];
        frameNext = frame._eventQueue.next();
        if (frameNext < next) {
          next = frameNext;
        }
      }
      return next;
    };

    return EventQueue;

  })();

  Timeout = (function() {
    function Timeout(queue, fn, delay, remove) {
      var fire;
      this.queue = queue;
      this.fn = fn;
      this.delay = delay;
      this.remove = remove;
      this.delay = Math.max(this.delay || 0, 0);
      fire = (function(_this) {
        return function() {
          _this.queue.enqueue(function() {
            _this.queue.browser.emit("timeout", _this.fn, _this.delay);
            return _this.queue.window._evaluate(_this.fn);
          });
          return _this.remove();
        };
      })(this);
      this.handle = global.setTimeout(fire, this.delay);
      this.next = Date.now() + this.delay;
    }

    Timeout.prototype.stop = function() {
      global.clearTimeout(this.handle);
      return this.remove();
    };

    return Timeout;

  })();

  Interval = (function() {
    function Interval(queue, fn, interval, remove) {
      var fire, pendingEvent;
      this.queue = queue;
      this.fn = fn;
      this.interval = interval;
      this.remove = remove;
      this.interval = Math.max(this.interval || 0);
      pendingEvent = false;
      fire = (function(_this) {
        return function() {
          _this.next = Date.now() + _this.interval;
          if (pendingEvent) {
            return;
          }
          pendingEvent = true;
          return _this.queue.enqueue(function() {
            pendingEvent = false;
            _this.queue.browser.emit("interval", _this.fn, _this.interval);
            return _this.queue.window._evaluate(_this.fn);
          });
        };
      })(this);
      this.handle = global.setInterval(fire, this.interval);
      this.next = Date.now() + this.interval;
    }

    Interval.prototype.stop = function() {
      global.clearInterval(this.handle);
      return this.remove();
    };

    return Interval;

  })();

  module.exports = EventLoop;

}).call(this);

(function() {
  var File, HTML, Mime, Path, UploadedFile;

  HTML = require("jsdom").dom.level3.html;

  Path = require("path");

  File = require("fs");

  Mime = require("mime");

  UploadedFile = function(filename) {
    var file;
    file = new String(Path.basename(filename));
    file.filename = filename;
    file.mime = Mime.lookup(filename);
    file.read = function() {
      return File.readFileSync(filename);
    };
    return file;
  };

  HTML.HTMLFormElement.prototype.submit = function(button) {
    var document, params, process;
    document = this.ownerDocument;
    params = {};
    process = (function(_this) {
      return function(index) {
        var field, name, option, selected, value, _i, _len, _name, _ref, _ref1;
        if (field = _this.elements.item(index)) {
          value = null;
          if (!field.getAttribute("disabled") && (name = field.getAttribute("name"))) {
            if (field.nodeName === "SELECT") {
              selected = [];
              _ref = field.options;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                option = _ref[_i];
                if (option.selected) {
                  selected.push(option.value);
                }
              }
              if (field.multiple) {
                params[name] = (params[name] || []).concat(selected);
              } else {
                if (selected.length > 0) {
                  value = selected[0];
                } else {
                  value = (_ref1 = field.options[0]) != null ? _ref1.value : void 0;
                }
                params[name] || (params[name] = []);
                params[name].push(value);
              }
            } else if (field.nodeName === "INPUT" && (field.type === "checkbox" || field.type === "radio")) {
              if (field.checked) {
                params[name] || (params[name] = []);
                params[name].push(field.value || "1");
              }
            } else if (field.nodeName === "INPUT" && field.type === "file") {
              if (field.value) {
                params[name] || (params[name] = []);
                params[name].push(UploadedFile(field.value));
              }
            } else if (field.nodeName === "TEXTAREA" || field.nodeName === "INPUT") {
              if (field.type !== "submit" && field.type !== "image") {
                params[name] || (params[name] = []);
                params[name].push(field.value || "");
              }
            }
          }
          return process(index + 1);
        } else {
          if (button && button.name) {
            params[_name = button.name] || (params[_name] = []);
            params[button.name].push(button.value);
          }
          return document.window._submit({
            url: _this.getAttribute("action") || document.location.href,
            method: _this.getAttribute("method") || "GET",
            encoding: _this.getAttribute("enctype"),
            params: params,
            target: _this.getAttribute("target")
          });
        }
      };
    })(this);
    return process(0);
  };

  HTML.HTMLFormElement.prototype.reset = function() {
    var field, option, _i, _len, _ref, _results;
    _ref = this.elements;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      field = _ref[_i];
      if (field.nodeName === "SELECT") {
        _results.push((function() {
          var _j, _len1, _ref1, _results1;
          _ref1 = field.options;
          _results1 = [];
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            option = _ref1[_j];
            _results1.push(option.selected = option._defaultSelected);
          }
          return _results1;
        })());
      } else if (field.nodeName === "INPUT" && (field.type === "checkbox" || field.type === "radio")) {
        _results.push(field.checked = !!field._defaultChecked);
      } else if (field.nodeName === "INPUT" || field.nodeName === "TEXTAREA") {
        _results.push(field.value = field._defaultValue);
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  HTML.HTMLFormElement.prototype._dispatchSubmitEvent = function(button) {
    var event;
    event = this.ownerDocument.createEvent("HTMLEvents");
    event.initEvent("submit", true, true);
    event._button = button;
    return this.dispatchEvent(event);
  };

  HTML.HTMLFormElement.prototype._eventDefaults["submit"] = function(event) {
    return event.target.submit(event._button);
  };

  HTML.HTMLInputElement.prototype._eventDefaults = {
    click: function(event) {
      var change, form, input;
      input = event.target;
      change = function() {
        event = input.ownerDocument.createEvent("HTMLEvents");
        event.initEvent("change", true, true);
        return input.dispatchEvent(event);
      };
      switch (input.type) {
        case "reset":
          if (form = input.form) {
            return form.reset();
          }
          break;
        case "submit":
        case "image":
          if (form = input.form) {
            return form._dispatchSubmitEvent(input);
          }
          break;
        case "checkbox":
          return change();
        case "radio":
          if (!input.getAttribute("readonly")) {
            input.checked = true;
            return change();
          }
      }
    }
  };

  HTML.HTMLInputElement.prototype.click = function() {
    var checked, click, original, radio, radios, _i, _j, _len, _len1;
    this.focus();
    click = (function(_this) {
      return function() {
        var cancelled, event;
        event = _this.ownerDocument.createEvent("HTMLEvents");
        event.initEvent("click", true, true);
        cancelled = _this.dispatchEvent(event);
        return !cancelled;
      };
    })(this);
    switch (this.type) {
      case "checkbox":
        if (!this.getAttribute("readonly")) {
          original = this.checked;
          this.checked = !this.checked;
          if (!click()) {
            this.checked = original;
          }
        }
        break;
      case "radio":
        if (!this.getAttribute("readonly")) {
          if (this.checked) {
            click();
          } else {
            radios = this.ownerDocument.querySelectorAll("input[type=radio][name='" + (this.getAttribute("name")) + "']", this.form);
            checked = null;
            for (_i = 0, _len = radios.length; _i < _len; _i++) {
              radio = radios[_i];
              if (radio.checked) {
                checked = radio;
                radio.checked = false;
              }
            }
            this.checked = true;
            if (!click()) {
              this.checked = false;
              for (_j = 0, _len1 = radios.length; _j < _len1; _j++) {
                radio = radios[_j];
                radio.checked = radio === checked;
              }
            }
          }
        }
        break;
      default:
        click();
    }
  };

  HTML.HTMLButtonElement.prototype._eventDefaults = {
    click: function(event) {
      var button, form;
      button = event.target;
      if (button.getAttribute("disabled")) {

      } else {
        form = button.form;
        if (form) {
          return form._dispatchSubmitEvent(button);
        }
      }
    }
  };

  HTML.Document.prototype._elementBuilders["button"] = function(doc, s) {
    var button;
    button = new HTML.HTMLButtonElement(doc, s);
    button.type || (button.type = "submit");
    return button;
  };

}).call(this);

(function() {
  var Entry, HTML, History, URL, createHistory, createLocation, createWindow, hashChange, parentFrom;

  createWindow = require("./window");

  HTML = require("jsdom").dom.level3.html;

  URL = require("url");

  createHistory = function(browser, focus) {
    var history;
    history = new History(browser, focus);
    return history.open.bind(history);
  };

  parentFrom = function(window) {
    if (window.parent !== window.getGlobal()) {
      return window.parent;
    }
  };

  Entry = (function() {
    function Entry(window, url, pushState) {
      this.window = window;
      this.pushState = pushState;
      this.url = URL.format(url);
      this.next = this.prev = null;
    }

    Entry.prototype.destroy = function(keepAlive) {
      if (this.next) {
        this.next.destroy(keepAlive || this.window);
        this.next = null;
      }
      if (keepAlive === this.window) {
        return;
      }
      if (this.prev && this.prev.window === this.window) {
        return;
      }
      return this.window._destroy();
    };

    Entry.prototype.append = function(newEntry, keepAlive) {
      if (this.next) {
        this.next.destroy(keepAlive);
      }
      newEntry.prev = this;
      return this.next = newEntry;
    };

    return Entry;

  })();

  History = (function() {
    function History(browser, focus) {
      this.browser = browser;
      this.focus = focus;
      this.first = this.current = null;
    }

    History.prototype.open = function(options) {
      var window;
      options.browser = this.browser;
      options.history = this;
      window = createWindow(options);
      this.addEntry(window, options.url);
      return window;
    };

    History.prototype.destroy = function() {
      var first;
      this.focus(null);
      first = this.first;
      this.first = this.current = null;
      if (first) {
        return first.destroy();
      }
    };

    History.prototype.addEntry = function(window, url, pushState) {
      var entry;
      url || (url = window.location.href);
      entry = new Entry(window, url, pushState);
      this.updateLocation(window, url);
      this.focus(window);
      if (this.current) {
        this.current.append(entry);
        return this.current = entry;
      } else {
        return this.current = this.first = entry;
      }
    };

    History.prototype.replaceEntry = function(window, url, pushState) {
      var entry;
      url || (url = window.location.href);
      entry = new Entry(window, url, pushState);
      this.updateLocation(window, url);
      this.focus(window);
      if (this.current === this.first) {
        if (this.current) {
          this.current.destroy(window);
        }
        return this.current = this.first = entry;
      } else {
        this.current.prev.append(entry, window);
        return this.current = entry;
      }
    };

    History.prototype.updateLocation = function(window, url) {
      var history;
      history = this;
      return Object.defineProperty(window, "location", {
        get: function() {
          return createLocation(history, url);
        },
        set: function(url) {
          return history.assign(url);
        },
        enumerable: true
      });
    };

    History.prototype.submit = function(options) {
      var newWindow, window;
      options.browser = this.browser;
      options.history = this;
      if (window = this.current.window) {
        options.name = window.name;
        options.parent = parentFrom(window);
        options.referer = window.URL;
      }
      newWindow = createWindow(options);
      return this.addEntry(newWindow, options.url);
    };

    History.prototype.__defineGetter__("url", function() {
      var _ref;
      return (_ref = this.current) != null ? _ref.url : void 0;
    });

    History.prototype.assign = function(url) {
      var event, name, parent, window;
      if (this.current) {
        url = HTML.resourceLoader.resolve(this.current.window.document, url);
        name = this.current.window.name;
        parent = parentFrom(this.current.window);
      }
      if (this.current && this.current.url === url) {
        this.replace(url);
        return;
      }
      if (hashChange(this.current, url)) {
        window = this.current.window;
        this.addEntry(window, url);
        event = window.document.createEvent("HTMLEvents");
        event.initEvent("hashchange", true, false);
        window._eventQueue.enqueue(function() {
          return window.dispatchEvent(event);
        });
      } else {
        window = createWindow({
          browser: this.browser,
          history: this,
          name: name,
          url: url,
          parent: parent
        });
        this.addEntry(window, url);
      }
    };

    History.prototype.replace = function(url) {
      var event, name, window;
      url = URL.format(url);
      if (this.current) {
        url = HTML.resourceLoader.resolve(this.current.window.document, url);
        name = this.current.window.name;
      }
      if (hashChange(this.current, url)) {
        window = this.current.window;
        this.replaceEntry(window, url);
        event = window.document.createEvent("HTMLEvents");
        event.initEvent("hashchange", true, false);
        window._eventQueue.enqueue(function() {
          return window.dispatchEvent(event);
        });
      } else {
        window = createWindow({
          browser: this.browser,
          history: this,
          name: name,
          url: url,
          parent: parentFrom(this.current.window)
        });
        this.replaceEntry(window, url);
      }
    };

    History.prototype.reload = function() {
      var newWindow, url, window;
      if (window = this.current.window) {
        url = window.location.href;
        newWindow = createWindow({
          browser: this.browser,
          history: this,
          name: window.name,
          url: url
        }, {
          parent: parentFrom(window),
          referer: window.referrer
        });
        return this.replaceEntry(newWindow, url);
      }
    };

    History.prototype.go = function(amount) {
      var event, newHost, oldHost, was, window;
      was = this.current;
      while (amount > 0) {
        if (this.current.next) {
          this.current = this.current.next;
        }
        --amount;
      }
      while (amount < 0) {
        if (this.current.prev) {
          this.current = this.current.prev;
        }
        ++amount;
      }
      if (this.current && was && this.current !== was) {
        window = this.current.window;
        this.updateLocation(window, this.current.url);
        this.focus(window);
        if (this.current.pushState || was.pushState) {
          oldHost = URL.parse(was.url).host;
          newHost = URL.parse(this.current.url).host;
          if (oldHost === newHost) {
            event = window.document.createEvent("HTMLEvents");
            event.initEvent("popstate", false, false);
            event.state = this.current.pushState;
            window._eventQueue.enqueue(function() {
              return window.dispatchEvent(event);
            });
          }
        } else if (hashChange(was, this.current.url)) {
          event = window.document.createEvent("HTMLEvents");
          event.initEvent("hashchange", true, false);
          window._eventQueue.enqueue(function() {
            return window.dispatchEvent(event);
          });
        }
      }
    };

    History.prototype.__defineGetter__("length", function() {
      var entry, length;
      entry = this.first;
      length = 0;
      while (entry) {
        ++length;
        entry = entry.next;
      }
      return length;
    });

    History.prototype.pushState = function(state, title, url) {
      url || (url = this.current.window.location.href);
      url = HTML.resourceLoader.resolve(this.current.window.document, url);
      this.addEntry(this.current.window, url, state || {});
    };

    History.prototype.replaceState = function(state, title, url) {
      url || (url = this.current.window.location.href);
      url = HTML.resourceLoader.resolve(this.current.window.document, url);
      this.replaceEntry(this.current.window, url, state || {});
    };

    History.prototype.__defineGetter__("state", function() {
      if (this.current.pushState) {
        return this.current.pushState;
      }
    });

    History.prototype.dump = function() {
      var cur, dump, i, line;
      cur = this.first;
      i = 1;
      dump = (function() {
        var _results;
        _results = [];
        while (cur) {
          line = cur.next ? '#' + i + ': ' : i + '. ';
          line += URL.format(cur.url);
          cur = cur.next;
          ++i;
          _results.push(line);
        }
        return _results;
      })();
      return dump;
    };

    return History;

  })();

  hashChange = function(entry, url) {
    var aBase, aHash, bBase, bHash, _ref, _ref1;
    if (!entry) {
      return false;
    }
    _ref = url.split("#"), aBase = _ref[0], aHash = _ref[1];
    _ref1 = entry.url.split("#"), bBase = _ref1[0], bHash = _ref1[1];
    return aBase === bBase && aHash !== bHash;
  };

  createLocation = function(history, url) {
    var location, prop, _fn, _i, _len, _ref;
    location = new Object();
    Object.defineProperties(location, {
      assign: {
        value: function(url) {
          return history.assign(url);
        }
      },
      replace: {
        value: function(url) {
          return history.replace(url);
        }
      },
      reload: {
        value: function(force) {
          return history.reload();
        }
      },
      toString: {
        value: function() {
          return url;
        },
        enumerable: true
      },
      hostname: {
        get: function() {
          return URL.parse(url).hostname;
        },
        set: function(hostname) {
          var newUrl;
          newUrl = URL.parse(url);
          if (newUrl.port) {
            newUrl.host = "" + hostname + ":" + newUrl.port;
          } else {
            newUrl.host = hostname;
          }
          return history.assign(URL.format(newUrl));
        },
        enumerable: true
      },
      href: {
        get: function() {
          return url;
        },
        set: function(href) {
          return history.assign(URL.format(href));
        },
        enumerable: true
      }
    });
    _ref = ["hash", "host", "pathname", "port", "protocol", "search"];
    _fn = (function(_this) {
      return function(prop) {
        return Object.defineProperty(location, prop, {
          get: function() {
            return URL.parse(url)[prop] || "";
          },
          set: function(value) {
            var newUrl;
            newUrl = URL.parse(url);
            newUrl[prop] = value;
            return history.assign(URL.format(newUrl));
          },
          enumerable: true
        });
      };
    })(this);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      prop = _ref[_i];
      _fn(prop);
    }
    return location;
  };

  module.exports = createHistory;

}).call(this);

(function() {
  var Assert, Browser, Path, Resources, listen, visit;

  Assert = require("./assert");

  Resources = require("./resources");

  Browser = require("./browser");

  Path = require("path");

  visit = function(url, options, callback) {
    var browser, _ref;
    if (arguments.length === 2) {
      _ref = [null, options], options = _ref[0], callback = _ref[1];
    }
    browser = Browser.create(options);
    if (callback) {
      return browser.visit(url, options, function(error) {
        return callback(error, browser);
      });
    } else {
      return browser.visit(url, options).then(function() {
        return browser;
      });
    }
  };

  listen = function(port, callback) {
    return require("./zombie/protocol").listen(port, callback);
  };

  Browser.listen = listen;

  Browser.visit = visit;

  Browser.Assert = Assert;

  Browser.Resources = Resources;

  Browser.debug = !!process.env.DEBUG;

  module.exports = Browser;

}).call(this);

(function() {
  var Interaction;

  Interaction = (function() {
    function Interaction(browser) {
      var alertFns, confirmCanned, confirmFns, promptCanned, promptFns, prompts;
      prompts = [];
      alertFns = [];
      this.onalert = function(fn) {
        return alertFns.push(fn);
      };
      confirmFns = [];
      confirmCanned = {};
      this.onconfirm = function(question, response) {
        if (typeof question === "function") {
          return confirmFns.push(question);
        } else {
          return confirmCanned[question] = !!response;
        }
      };
      promptFns = [];
      promptCanned = {};
      this.onprompt = function(message, response) {
        if (typeof message === "function") {
          return promptFns.push(message);
        } else {
          return promptCanned[message] = response;
        }
      };
      this.prompted = function(message) {
        return prompts.indexOf(message) >= 0;
      };
      this.extend = function(window) {
        window.alert = function(message) {
          var fn, _i, _len;
          browser.emit("alert", message);
          prompts.push(message);
          for (_i = 0, _len = alertFns.length; _i < _len; _i++) {
            fn = alertFns[_i];
            fn(message);
          }
        };
        window.confirm = function(question) {
          var fn, response, _i, _len;
          browser.emit("confirm", question);
          prompts.push(question);
          response = confirmCanned[question];
          if (!(response || response === false)) {
            for (_i = 0, _len = confirmFns.length; _i < _len; _i++) {
              fn = confirmFns[_i];
              response = fn(question);
              if (response || response === false) {
                break;
              }
            }
          }
          return !!response;
        };
        return window.prompt = function(message, defaultValue) {
          var fn, response, _i, _len;
          browser.emit("prompt", message);
          prompts.push(message);
          response = promptCanned[message];
          if (!(response || response === false)) {
            for (_i = 0, _len = promptFns.length; _i < _len; _i++) {
              fn = promptFns[_i];
              response = fn(message, defaultValue);
              if (response || response === false) {
                break;
              }
            }
          }
          if (response) {
            return response.toString();
          }
          if (response === false) {
            return null;
          }
          return defaultValue || "";
        };
      };
    }

    return Interaction;

  })();

  exports.use = function(browser) {
    return new Interaction(browser);
  };

}).call(this);

(function() {
  var HTML, element, _i, _len, _ref;

  HTML = require("jsdom").dom.level3.html;

  HTML.HTMLDocument.prototype.__defineGetter__("scripts", function() {
    return new HTML.HTMLCollection(this, (function(_this) {
      return function() {
        return _this.querySelectorAll('script');
      };
    })(this));
  });

  HTML.HTMLElement.prototype.__defineGetter__("offsetLeft", function() {
    return 0;
  });

  HTML.HTMLElement.prototype.__defineGetter__("offsetTop", function() {
    return 0;
  });

  HTML.HTMLScriptElement.prototype.__defineGetter__("src", function() {
    return this.getAttribute('src') || "";
  });

  HTML.HTMLElement.prototype.__defineGetter__("id", function() {
    return this.getAttribute("id") || "";
  });

  _ref = [HTML.HTMLInputElement, HTML.HTMLButtonElement, HTML.HTMLParamElement];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    element = _ref[_i];
    element.prototype.__defineGetter__("value", function() {
      return this.getAttribute("value") || "";
    });
  }

  HTML.HTMLAnchorElement.prototype._eventDefaults = {
    click: function(event) {
      var anchor, browser, window;
      anchor = event.target;
      if (!anchor.href) {
        return;
      }
      window = anchor.ownerDocument.window;
      browser = window.browser;
      switch (anchor.target || "_self") {
        case "_self":
          window.location = anchor.href;
          break;
        case "_parent":
          window.parent.location = anchor.href;
          break;
        case "_top":
          window.top.location = anchor.href;
          break;
        default:
          browser.tabs.open({
            name: anchor.target,
            url: anchor.href
          });
      }
      return browser.emit("link", anchor.href, anchor.target || "_self");
    }
  };

  Object.defineProperty(HTML.CSSStyleDeclaration.prototype, "opacity", {
    get: function() {
      var opacity;
      opacity = this.getPropertyValue("opacity");
      if (Number.isFinite(opacity)) {
        return opacity.toString();
      } else {
        return "";
      }
    },
    set: function(opacity) {
      if (opacity === null || opacity === void 0 || opacity === "") {
        return this.removeProperty("opacity");
      } else {
        opacity = parseFloat(opacity);
        if (isFinite(opacity)) {
          return this.setProperty("opacity", opacity);
        }
      }
    }
  });

  ["height", "width"].forEach(function(prop) {
    var client, offset;
    client = "client" + (prop[0].toUpperCase()) + (prop.slice(1));
    offset = "offset" + (prop[0].toUpperCase()) + (prop.slice(1));
    Object.defineProperty(HTML.HTMLElement.prototype, client, {
      get: function() {
        var value;
        value = parseInt(this.style.getPropertyValue(prop), 10);
        if (Number.isFinite(value)) {
          return value;
        } else {
          return 100;
        }
      }
    });
    return Object.defineProperty(HTML.HTMLElement.prototype, offset, {
      get: function() {
        return 0;
      }
    });
  });

  HTML.HTMLImageElement.prototype._attrModified = function(name, value, oldVal) {
    if (name === 'src' && value !== oldVal) {
      return HTML.resourceLoader.load(this, value);
    }
  };

  HTML.HTMLElement.prototype.insertAdjacentHTML = function(position, html) {
    var container, first_child, next_sibling, node, parentNode, _results, _results1, _results2, _results3;
    container = this.ownerDocument.createElementNS("http://www.w3.org/1999/xhtml", "_");
    parentNode = this.parentNode;
    container.innerHTML = html;
    switch (position.toLowerCase()) {
      case "beforebegin":
        _results = [];
        while ((node = container.firstChild)) {
          _results.push(parentNode.insertBefore(node, this));
        }
        return _results;
        break;
      case "afterbegin":
        first_child = this.firstChild;
        _results1 = [];
        while ((node = container.lastChild)) {
          _results1.push(first_child = this.insertBefore(node, first_child));
        }
        return _results1;
        break;
      case "beforeend":
        _results2 = [];
        while ((node = container.firstChild)) {
          _results2.push(this.appendChild(node));
        }
        return _results2;
        break;
      case "afterend":
        next_sibling = this.nextSibling;
        _results3 = [];
        while ((node = container.lastChild)) {
          _results3.push(next_sibling = parentNode.insertBefore(node, next_sibling));
        }
        return _results3;
    }
  };

  HTML.Node.prototype.contains = function(otherNode) {
    return !!(this.compareDocumentPosition(otherNode) & 16);
  };

}).call(this);

(function() {
  var HTTP, PortMap;

  HTTP = require("http");

  PortMap = (function() {
    function PortMap() {
      this._ports = {};
      this._http = HTTP.request;
      HTTP.request = this._request.bind(this);
    }

    PortMap.prototype.map = function(hostname, port) {
      return this._ports[hostname] = port;
    };

    PortMap.prototype.unmap = function(hostname) {
      return delete this._ports.hostname;
    };

    PortMap.prototype._request = function(options, callback) {
      var hostname, mapped, port;
      hostname = options.hostname || (options.host && options.host.split(":")[0]) || "localhost";
      port = options.port || (options.host && options.host.split(":")[1]) || 80;
      if (port === 80) {
        mapped = this._find(hostname);
        if (mapped) {
          options = Object.create(options);
          options.hostname = hostname;
          options.port = mapped;
        }
      }
      return this._http(options, callback);
    };

    PortMap.prototype._find = function(domain) {
      var domains, i, parts, _i, _ref;
      parts = domain.split('.');
      domains = [domain, "*." + domain];
      for (i = _i = 1, _ref = parts.length; 1 <= _ref ? _i < _ref : _i > _ref; i = 1 <= _ref ? ++_i : --_i) {
        domains.push("*." + parts.slice(i, +parts.length + 1 || 9e9).join('.'));
      }
      return domains.map((function(_this) {
        return function(pattern) {
          return _this._ports[pattern];
        };
      })(this)).filter(function(port) {
        return port;
      })[0];
    };

    return PortMap;

  })();

  module.exports = PortMap;

}).call(this);

(function() {
  var BULK, Context, ERROR, INTEGER, MULTI, Protocol, SINGLE, net;

  net = require("net");

  ERROR = -1;

  SINGLE = 0;

  INTEGER = 1;

  BULK = 2;

  MULTI = 3;

  Context = (function() {
    function Context(stream, debug) {
      var argc, argl, argv, input, last, queue, respond;
      this.stream = stream;
      this.debug = debug;
      this.reset();
      argc = 0;
      argl = 0;
      argv = [];
      input = "";
      last = null;
      this.process = function(chunk) {
        if (chunk) {
          input += chunk;
        }
        if (argc) {
          if (argl) {
            if (input.length >= argl) {
              argv.push(input.slice(0, argl));
              input = input.slice(argl);
              argl = 0;
              if (argv.length === argc) {
                queue(argv);
                argc = 0;
                argv = [];
              }
              if (input.length > 0) {
                return this.process();
              }
            }
          } else {
            input = input.replace(/^\$(\d+)\r\n/, (function(_this) {
              return function(_, value) {
                argl = parseInt(value, 10);
                if (_this.debug) {
                  console.log("Expecting argument of size " + argl);
                }
                return "";
              };
            })(this));
            if (argl) {
              return this.process();
            } else {
              if (input.length > 0 && input[0] !== "$") {
                throw new Error("Expecting $<argc>CRLF");
              }
            }
          }
        } else {
          input = input.replace(/^\*(\d+)\r\n/, (function(_this) {
            return function(_, value) {
              argc = parseInt(value, 10);
              if (_this.debug) {
                console.log("Expecting " + argc + " arguments");
              }
              return "";
            };
          })(this));
          if (argc) {
            return this.process();
          } else {
            if (input.length > 0 && input[0] !== "*") {
              throw new Error("Expecting *<argc>CRLF");
            }
          }
        }
      };
      queue = (function(_this) {
        return function(argv) {
          var command;
          command = {};
          command.invoke = function() {
            var error, fn;
            try {
              if (fn = _this[argv[0].toLowerCase()]) {
                if (debug) {
                  console.log("Executing " + (argv.join(" ")));
                }
                argv[0] = command.reply;
                return fn.apply(_this, argv);
              } else {
                return command.reply(ERROR, "Unknown command " + argv[0]);
              }
            } catch (_error) {
              error = _error;
              return command.reply(ERROR, "Failed on " + argv[0] + ": " + error.message);
            }
          };
          command.reply = function(type, value) {
            respond(_this.stream, type, value);
            if (last === command) {
              last = command.next;
            }
            if (command.next) {
              return process.nextTick(function() {
                return command.next.invoke();
              });
            }
          };
          if (last) {
            last.next = command;
            return last = command;
          } else {
            last = command;
            return command.invoke();
          }
        };
      })(this);
      respond = function(stream, type, value) {
        var item, _i, _len, _results;
        switch (type) {
          case ERROR:
            return stream.write("-" + value.message + "\r\n");
          case SINGLE:
            return stream.write("+" + value + "\r\n");
          case INTEGER:
            return stream.write(":" + value + "\r\n");
          case BULK:
            if (value) {
              stream.write("$" + value.length + "\r\n");
              stream.write(value);
              return stream.write("\r\n");
            } else {
              return stream.write("$-1\r\n");
            }
            break;
          case MULTI:
            if (value) {
              stream.write("*" + value.length + "\r\n");
              _results = [];
              for (_i = 0, _len = value.length; _i < _len; _i++) {
                item = value[_i];
                if (item) {
                  stream.write("$" + item.length + "\r\n");
                  stream.write(item);
                  _results.push(stream.write("\r\n"));
                } else {
                  _results.push(stream.write("$-1\r\n"));
                }
              }
              return _results;
            } else {
              return stream.write("*-1\r\n");
            }
        }
      };
    }

    Context.prototype.debug = function(reply, debug) {
      return this.browser.debug = debug === "0" || debug === "off";
    };

    Context.prototype.echo = function(reply, text) {
      return reply(SINGLE, text);
    };

    Context.prototype.reset = function(reply) {
      this.browser = new module.parent.exports.Browser({
        debug: this.debug
      });
      if (reply) {
        return reply(SINGLE, "OK");
      }
    };

    Context.prototype.status = function(reply) {
      return reply(INTEGER, this.browser.statusCode || 0);
    };

    Context.prototype.visit = function(reply, url) {
      this.browser.visit(url);
      return reply(SINGLE, "OK");
    };

    Context.prototype.wait = function(reply) {
      return this.browser.wait(function(error) {
        if (error) {
          return reply(ERROR, error.message);
        } else {
          return reply(SINGLE, "OK");
        }
      });
    };

    return Context;

  })();

  Protocol = (function() {
    function Protocol(port) {
      var active, debug, server;
      debug = false;
      server = net.createServer(function(stream) {
        var context;
        stream.setNoDelay(true);
        context = new Context(stream, debug);
        return stream.on("data", function(chunk) {
          return context.process(chunk);
        });
      });
      active = false;
      port || (port = 8091);
      this.listen = function(callback) {
        var listener;
        listener = function(err) {
          if (!err) {
            active = true;
          }
          if (callback) {
            return callback(err);
          }
        };
        if (typeof port === "number") {
          return server.listen(port, "127.0.0.1", listener);
        } else {
          return server.listen(port, listener);
        }
      };
      this.close = function() {
        if (active) {
          server.close();
          return active = false;
        }
      };
      this.__defineGetter__("active", function() {
        return active;
      });
    }

    return Protocol;

  })();

  exports.Protocol = Protocol;

  exports.listen = function(port, callback) {
    var protocol, _ref;
    if (!callback) {
      _ref = [8091, port], port = _ref[0], callback = _ref[1];
    }
    protocol = new Protocol(port);
    return protocol.listen(callback);
  };

}).call(this);

(function() {
  var File, HTML, HTTP, Path, QS, Request, Resources, URL, Zlib, assert, encoding,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    __slice = [].slice;

  encoding = require("encoding");

  File = require("fs");

  HTML = require("jsdom").dom.level3.html;

  Path = require("path");

  QS = require("querystring");

  Request = require("request");

  URL = require("url");

  HTTP = require('http');

  Zlib = require("zlib");

  assert = require("assert");

  Resources = (function(_super) {
    __extends(Resources, _super);

    function Resources(browser) {
      this.browser = browser;
      this.pipeline = Resources.pipeline.slice();
      this.urlMatchers = [];
    }

    Resources.prototype.request = function(method, url, options, callback) {
      var promise, request, resource, _ref;
      if (options == null) {
        options = {};
      }
      if (!callback && typeof options === 'function') {
        _ref = [{}, options], options = _ref[0], callback = _ref[1];
      }
      request = {
        method: method.toUpperCase(),
        url: url,
        headers: options.headers || {},
        params: options.params,
        body: options.body,
        time: Date.now(),
        timeout: options.timeout || 0,
        strictSSL: this.browser.strictSSL
      };
      resource = {
        request: request,
        target: options.target
      };
      this.push(resource);
      this.browser.emit("request", request);
      promise = new Promise((function(_this) {
        return function(resolve, reject) {
          return _this.runPipeline(request, function(error, response) {
            if (error) {
              resource.error = error;
              return reject(error);
            } else {
              response.url || (response.url = request.url);
              response.statusCode || (response.statusCode = 200);
              response.statusText = HTTP.STATUS_CODES[response.statusCode] || "Unknown";
              response.headers || (response.headers = {});
              response.redirects || (response.redirects = 0);
              response.time = Date.now();
              resource.response = response;
              _this.browser.emit("response", request, response);
              return resolve(resource.response);
            }
          });
        };
      })(this));
      if (callback) {
        return promise.then(function(response) {
          return callback(null, response);
        }, callback);
      } else {
        return promise;
      }
    };

    Resources.prototype.get = function(url, options, callback) {
      return this.request("get", url, options, callback);
    };

    Resources.prototype.post = function(url, options, callback) {
      return this.request("post", url, options, callback);
    };

    Resources.prototype.fail = function(url, message) {
      var failTheRequest;
      failTheRequest = function(request, next) {
        return next(new Error(message || "This request was intended to fail"));
      };
      this.urlMatchers.push([url, failTheRequest]);
    };

    Resources.prototype.delay = function(url, delay) {
      var delayTheResponse;
      if (delay == null) {
        delay = 10;
      }
      delayTheResponse = function(request, next) {
        return setTimeout(next, delay);
      };
      this.urlMatchers.push([url, delayTheResponse]);
    };

    Resources.prototype.mock = function(url, result) {
      var mockTheResponse;
      if (result == null) {
        result = {};
      }
      mockTheResponse = function(request, next) {
        return next(null, result);
      };
      this.urlMatchers.push([url, mockTheResponse]);
    };

    Resources.prototype.restore = function(url) {
      this.urlMatchers = this.urlMatchers.filter(function(_arg) {
        var match, _;
        match = _arg[0], _ = _arg[1];
        return match !== url;
      });
    };

    Resources.prototype.dump = function(output) {
      var error, name, request, resource, response, sample, target, value, _i, _len, _ref, _results;
      if (output == null) {
        output = process.stdout;
      }
      _results = [];
      for (_i = 0, _len = this.length; _i < _len; _i++) {
        resource = this[_i];
        request = resource.request, response = resource.response, error = resource.error, target = resource.target;
        if (response) {
          output.write("" + request.method + " " + response.url + " - " + response.statusCode + " " + response.statusText + " - " + (response.time - request.time) + "ms\n");
        } else {
          output.write("" + resource.request.method + " " + resource.request.url + "\n");
        }
        if (target instanceof HTML.Document) {
          output.write("  Loaded as HTML document\n");
        } else if (target) {
          if (target.id) {
            output.write("  Loading by element #" + target.id + "\n");
          } else {
            output.write("  Loading as " + target.tagName + " element\n");
          }
        }
        if (response) {
          if (response.redirects) {
            output.write("  Followed " + response.redirects + " redirects\n");
          }
          _ref = response.headers;
          for (name in _ref) {
            value = _ref[name];
            output.write("  " + name + ": " + value + "\n");
          }
          output.write("\n");
          sample = response.body.slice(0, 250).toString("utf8").split("\n").map(function(line) {
            return "  " + line;
          }).join("\n");
          output.write(sample);
        } else if (error) {
          output.write("  Error: " + error.message + "\n");
        } else {
          output.write("  Pending since " + (new Date(request.time)) + "\n");
        }
        _results.push(output.write("\n\n"));
      }
      return _results;
    };

    Resources.prototype.addHandler = function(handler) {
      assert(handler.call, "Handler must be a function");
      assert(handler.length === 2 || handler.length === 3, "Handler function takes 2 (request handler) or 3 (reponse handler) arguments");
      return this.pipeline.push(handler);
    };

    Resources.prototype.runPipeline = function(request, callback) {
      var nextRequestHandler, nextResponseHandler, requestHandlers, response, responseHandlers;
      requestHandlers = this.pipeline.filter(function(fn) {
        return fn.length === 2;
      });
      requestHandlers.push(Resources.makeHTTPRequest);
      responseHandlers = this.pipeline.filter(function(fn) {
        return fn.length === 3;
      });
      response = null;
      nextRequestHandler = (function(_this) {
        return function(error, responseFromHandler) {
          var handler;
          if (error) {
            return callback(error);
          } else if (responseFromHandler) {
            response = responseFromHandler;
            response.url || (response.url = request.url);
            return nextResponseHandler();
          } else {
            handler = requestHandlers.shift();
            try {
              return handler.call(_this.browser, request, nextRequestHandler);
            } catch (_error) {
              error = _error;
              return callback(error);
            }
          }
        };
      })(this);
      nextResponseHandler = (function(_this) {
        return function(error) {
          var handler;
          if (error) {
            return callback(error);
          } else {
            handler = responseHandlers.shift();
            if (handler) {
              try {
                return handler.call(_this.browser, request, response, nextResponseHandler);
              } catch (_error) {
                error = _error;
                return callback(error);
              }
            } else {
              return callback(null, response);
            }
          }
        };
      })(this);
      nextRequestHandler();
    };

    return Resources;

  })(Array);

  Resources.addHandler = function(handler) {
    assert(handler.call, "Handler must be a function");
    assert(handler.length === 2 || handler.length === 3, "Handler function takes 2 (request handler) or 3 (response handler) arguments");
    return this.pipeline.push(handler);
  };

  Resources.normalizeURL = function(request, next) {
    var method, name, uri, value, _ref;
    if (/^file:/.test(request.url)) {
      request.url = request.url.replace(/^file:\/{1,3}/, "file:///");
    } else {
      if (this.document) {
        request.url = HTML.resourceLoader.resolve(this.document, request.url);
      } else {
        request.url = URL.resolve(this.site || "http://localhost", request.url);
      }
    }
    if (request.params) {
      method = request.method;
      if (method === "GET" || method === "HEAD" || method === "DELETE") {
        uri = URL.parse(request.url, true);
        _ref = request.params;
        for (name in _ref) {
          value = _ref[name];
          uri.query[name] = value;
        }
        request.url = URL.format(uri);
      }
    }
    next();
  };

  Resources.mergeHeaders = function(request, next) {
    var credentials, headers, host, name, value, _ref, _ref1;
    headers = {
      "user-agent": this.userAgent
    };
    _ref = this.headers;
    for (name in _ref) {
      value = _ref[name];
      headers[name.toLowerCase()] = value;
    }
    if (request.headers) {
      _ref1 = request.headers;
      for (name in _ref1) {
        value = _ref1[name];
        headers[name.toLowerCase()] = value;
      }
    }
    host = URL.parse(request.url).host;
    headers.host = host;
    if (credentials = this.authenticate(host, false)) {
      credentials.apply(headers);
    }
    request.headers = headers;
    next();
  };

  Resources.createBody = function(request, next) {
    var binary, boundary, disp, headers, method, mimeType, multipart, name, params, value, values, _i, _len;
    method = request.method;
    if (method === "POST" || method === "PUT") {
      headers = request.headers;
      headers["content-type"] || (headers["content-type"] = "application/x-www-form-urlencoded");
      mimeType = headers["content-type"].split(";")[0];
      if (!request.body) {
        switch (mimeType) {
          case "application/x-www-form-urlencoded":
            request.body = QS.stringify(request.params || {});
            headers["content-length"] = request.body.length;
            break;
          case "multipart/form-data":
            params = request.params || {};
            if (Object.keys(params).length === 0) {
              headers["content-type"] = "text/plain";
              request.body = "";
            } else {
              boundary = "" + (new Date().getTime()) + "." + (Math.random());
              headers["content-type"] += "; boundary=" + boundary;
              multipart = [];
              for (name in params) {
                values = params[name];
                for (_i = 0, _len = values.length; _i < _len; _i++) {
                  value = values[_i];
                  disp = "form-data; name=\"" + name + "\"";
                  if (value.read) {
                    binary = value.read();
                    multipart.push({
                      "Content-Disposition": "" + disp + "; filename=\"" + value + "\"",
                      "Content-Type": value.mime || "application/octet-stream",
                      "Content-Length": binary.length,
                      body: binary
                    });
                  } else {
                    multipart.push({
                      "Content-Disposition": disp,
                      "Content-Type": "text/plain; charset=utf8",
                      "Content-Length": value.length,
                      body: value
                    });
                  }
                }
              }
              request.multipart = multipart;
            }
            break;
          case "text/plain":
            break;
          default:
            next(new Error("Unsupported content type " + mimeType));
            return;
        }
      }
    }
    next();
  };

  Resources.specialURLHandlers = function(request, next) {
    var handler, url, _i, _len, _ref, _ref1;
    _ref = this.resources.urlMatchers;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      _ref1 = _ref[_i], url = _ref1[0], handler = _ref1[1];
      if (URL.resolve(request.url, url) === request.url) {
        handler(request, next);
        return;
      }
    }
    return next();
  };

  Resources.decompressBody = function(request, response, next) {
    var contentEncoding, transferEncoding;
    if (response.body && response.headers) {
      transferEncoding = response.headers["transfer-encoding"];
      contentEncoding = response.headers["content-encoding"];
    }
    switch (transferEncoding || contentEncoding) {
      case "deflate":
        Zlib.inflate(response.body, function(error, buffer) {
          if (!error) {
            response.body = buffer;
          }
          return next(error);
        });
        break;
      case "gzip":
        Zlib.gunzip(response.body, function(error, buffer) {
          if (!error) {
            response.body = buffer;
          }
          return next(error);
        });
        break;
      default:
        next();
    }
  };

  Resources.decodeBody = function(request, response, next) {
    var charset, contentType, mimeType, subtype, type, typeOption, typeOptions, _i, _len, _ref, _ref1;
    if (response.body && response.headers) {
      contentType = response.headers["content-type"];
    }
    if (contentType) {
      _ref = contentType.split(/;\s*/), mimeType = _ref[0], typeOptions = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
      _ref1 = contentType.split(/\//, 2), type = _ref1[0], subtype = _ref1[1];
      if (!(mimeType === "application/octet-stream" || type === "image")) {
        for (_i = 0, _len = typeOptions.length; _i < _len; _i++) {
          typeOption = typeOptions[_i];
          if (/^charset=/.test(typeOption)) {
            charset = typeOption.split("=")[1];
            break;
          }
        }
        response.body = encoding.convert(response.body.toString(), null, charset || "utf-8").toString();
      }
    }
    next();
  };

  Resources.pipeline = [Resources.normalizeURL, Resources.mergeHeaders, Resources.createBody, Resources.specialURLHandlers, Resources.decompressBody, Resources.decodeBody];

  Resources.makeHTTPRequest = function(request, callback) {
    var cookies, filename, hostname, httpRequest, pathname, protocol, _ref;
    _ref = URL.parse(request.url), protocol = _ref.protocol, hostname = _ref.hostname, pathname = _ref.pathname;
    if (protocol === "file:") {
      if (request.method === "GET") {
        filename = Path.normalize(decodeURI(pathname));
        File.exists(filename, (function(_this) {
          return function(exists) {
            if (exists) {
              return File.readFile(filename, function(error, buffer) {
                if (error) {
                  resource.error = error;
                  return callback(error);
                } else {
                  return callback(null, {
                    body: buffer
                  });
                }
              });
            } else {
              return callback(null, {
                statusCode: 404
              });
            }
          };
        })(this));
      } else {
        callback(resource.error);
      }
    } else {
      cookies = this.cookies;
      request.headers.cookie = cookies.serialize(hostname, pathname);
      httpRequest = {
        method: request.method,
        url: request.url,
        headers: request.headers,
        body: request.body,
        multipart: request.multipart,
        proxy: this.proxy,
        jar: false,
        followRedirect: false,
        encoding: null,
        strictSSL: request.strictSSL,
        timeout: request.timeout || 0
      };
      Request(httpRequest, (function(_this) {
        return function(error, response) {
          var name, redirectHeaders, redirectRequest, redirects, setCookie, value, _ref1;
          if (error) {
            callback(error);
            return;
          }
          setCookie = response.headers["set-cookie"];
          if (setCookie) {
            cookies.update(setCookie, hostname, pathname);
          }
          redirects = request.redirects || 0;
          switch (response.statusCode) {
            case 301:
            case 307:
              if (request.method === "GET" || request.method === "HEAD") {
                response.url = URL.resolve(request.url, response.headers.location);
              }
              break;
            case 302:
            case 303:
              response.url = URL.resolve(request.url, response.headers.location);
          }
          if (response.url) {
            ++redirects;
            if (redirects > _this.maxRedirects) {
              callback(new Error("More than " + _this.maxRedirects + " redirects, giving up"));
              return;
            }
            redirectHeaders = {};
            _ref1 = request.headers;
            for (name in _ref1) {
              value = _ref1[name];
              redirectHeaders[name] = value;
            }
            redirectHeaders.referer = request.url;
            delete redirectHeaders["content-type"];
            delete redirectHeaders["content-length"];
            delete redirectHeaders["content-transfer-encoding"];
            redirectRequest = {
              method: "GET",
              url: response.url,
              headers: redirectHeaders,
              redirects: redirects,
              strictSSL: request.strictSSL,
              time: request.time,
              timeout: request.timeout
            };
            _this.emit("redirect", response, redirectRequest);
            return _this.resources.runPipeline(redirectRequest, callback);
          } else {
            response = {
              url: request.url,
              statusCode: response.statusCode,
              headers: response.headers,
              body: response.body,
              redirects: redirects
            };
            return callback(null, response);
          }
        };
      })(this));
    }
  };

  module.exports = Resources;

}).call(this);

(function() {
  var CoffeeScript, HTML, URL, ex, raise;

  HTML = require("jsdom").dom.level3.html;

  URL = require("url");

  try {
    CoffeeScript = require("coffee-script");
    HTML.languageProcessors.coffeescript = function(element, code, filename) {
      return this.javascript(element, CoffeeScript.compile(code), filename);
    };
  } catch (_error) {
    ex = _error;
  }

  HTML.languageProcessors.javascript = function(element, code, filename) {
    var cast, document, error, window;
    if (code) {
      document = element.ownerDocument;
      window = document.window;
      try {
        return window._evaluate(code, filename);
      } catch (_error) {
        error = _error;
        if (!(error instanceof Error)) {
          cast = new Error(error.message);
          cast.stack = error.stack;
          error = cast;
        }
        return raise({
          element: element,
          location: filename,
          from: __filename,
          error: error
        });
      }
    }
  };

  HTML.HTMLScriptElement._init = function() {
    this.addEventListener("DOMNodeInsertedIntoDocument", function() {
      var executeInOrder, executeInlineScript, filename;
      if (this.src) {
        return HTML.resourceLoader.load(this, this.src, this._eval);
      } else {
        if (this.id) {
          filename = "" + this.ownerDocument.URL + ":#" + id;
        } else {
          filename = "" + this.ownerDocument.URL + ":script";
        }
        executeInlineScript = (function(_this) {
          return function() {
            return _this._eval(_this.textContent, filename);
          };
        })(this);
        executeInOrder = HTML.resourceLoader.enqueue(this, executeInlineScript, filename);
        if (this.ownerDocument.readyState === "loading") {
          return process.nextTick(executeInOrder);
        } else {
          return executeInOrder();
        }
      }
    });
  };

  HTML.resourceLoader.load = function(element, href, callback) {
    var document, loaded, ownerImplementation, tagName, url, window;
    document = element.ownerDocument;
    window = document.parentWindow;
    ownerImplementation = document.implementation;
    tagName = element.tagName.toLowerCase();
    if (ownerImplementation.hasFeature("FetchExternalResources", tagName)) {
      loaded = function(response) {
        return callback.call(element, response.body.toString(), url.pathname);
      };
      url = HTML.resourceLoader.resolve(document, href);
      return window._eventQueue.http("GET", url, {
        target: element
      }, this.enqueue(element, loaded, url));
    }
  };

  module.exports = raise = function(_arg) {
    var document, element, error, line, location, message, partial, scope, window, _i, _len, _ref;
    element = _arg.element, location = _arg.location, scope = _arg.scope, error = _arg.error;
    document = element.ownerDocument || element;
    window = document.parentWindow;
    message = scope ? "" + scope + ": " + error.message : error.message;
    location || (location = document.location.href);
    partial = [];
    if (error.stack) {
      _ref = error.stack.split("\n");
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        if (~line.indexOf("contextify/lib/contextify.js")) {
          break;
        }
        partial.push(line);
      }
    }
    partial.push("    in " + location);
    error.stack = partial.join("\n");
    window._eventQueue.onerror(error);
  };

}).call(this);

(function() {
  var Event, HTML, Storage, StorageArea, StorageEvent, Storages;

  HTML = require("jsdom").dom.level3.html;

  Event = require("jsdom").dom.level3.events.Event;

  StorageArea = (function() {
    function StorageArea() {
      this._items = [];
      this._storages = [];
    }

    StorageArea.prototype._fire = function(source, key, oldValue, newValue) {
      var event, storage, window, _i, _len, _ref, _ref1, _results;
      _ref = this._storages;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        _ref1 = _ref[_i], storage = _ref1[0], window = _ref1[1];
        if (storage === source) {
          continue;
        }
        event = new StorageEvent(storage, window.location.href, key, oldValue, newValue);
        _results.push(window.dispatchEvent(event));
      }
      return _results;
    };

    StorageArea.prototype.__defineGetter__("length", function() {
      var i, k;
      i = 0;
      for (k in this._items) {
        ++i;
      }
      return i;
    });

    StorageArea.prototype.key = function(index) {
      var i, k;
      i = 0;
      for (k in this._items) {
        if (i === index) {
          return k;
        }
        ++i;
      }
    };

    StorageArea.prototype.get = function(key) {
      return this._items[key] || null;
    };

    StorageArea.prototype.set = function(source, key, value) {
      var oldValue;
      oldValue = this._items[key];
      this._items[key] = value;
      return this._fire(source, key, oldValue, value);
    };

    StorageArea.prototype.remove = function(source, key) {
      var oldValue;
      oldValue = this._items[key];
      delete this._items[key];
      return this._fire(source, key, oldValue);
    };

    StorageArea.prototype.clear = function(source) {
      this._items = [];
      return this._fire(source);
    };

    StorageArea.prototype.associate = function(storage, window) {
      return this._storages.push([storage, window]);
    };

    StorageArea.prototype.__defineGetter__("pairs", function() {
      var k, v;
      return (function() {
        var _ref, _results;
        _ref = this._items;
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push([k, v]);
        }
        return _results;
      }).call(this);
    });

    StorageArea.prototype.toString = function() {
      var k, v;
      return ((function() {
        var _ref, _results;
        _ref = this._items;
        _results = [];
        for (k in _ref) {
          v = _ref[k];
          _results.push("" + k + " = " + v);
        }
        return _results;
      }).call(this)).join("\n");
    };

    return StorageArea;

  })();

  Storage = (function() {
    function Storage(_area) {
      this._area = _area;
    }

    Storage.prototype.__defineGetter__("length", function() {
      return this._area.length;
    });

    Storage.prototype.key = function(index) {
      return this._area.key(index);
    };

    Storage.prototype.getItem = function(key) {
      return this._area.get(key.toString());
    };

    Storage.prototype.setItem = function(key, value) {
      return this._area.set(this, key.toString(), value);
    };

    Storage.prototype.removeItem = function(key) {
      return this._area.remove(this, key.toString());
    };

    Storage.prototype.clear = function() {
      return this._area.clear(this);
    };

    Storage.prototype.dump = function() {
      return this._area.dump();
    };

    return Storage;

  })();

  StorageEvent = function(storage, url, key, oldValue, newValue) {
    Event.call(this, "storage");
    this.__defineGetter__("url", function() {
      return url;
    });
    this.__defineGetter__("storageArea", function() {
      return storage;
    });
    this.__defineGetter__("key", function() {
      return key;
    });
    this.__defineGetter__("oldValue", function() {
      return oldValue;
    });
    return this.__defineGetter__("newValue", function() {
      return newValue;
    });
  };

  StorageEvent.prototype.__proto__ = Event.prototype;

  HTML.SECURITY_ERR = 18;

  Storages = (function() {
    function Storages() {
      this._locals = {};
      this._sessions = {};
    }

    Storages.prototype.local = function(host) {
      var area, _base;
      area = (_base = this._locals)[host] != null ? _base[host] : _base[host] = new StorageArea();
      return new Storage(area);
    };

    Storages.prototype.session = function(host) {
      var area, _base;
      area = (_base = this._sessions)[host] != null ? _base[host] : _base[host] = new StorageArea();
      return new Storage(area);
    };

    Storages.prototype.extend = function(window) {
      var storages;
      storages = this;
      window.StorageEvent = StorageEvent;
      Object.defineProperty(window, "localStorage", {
        get: function() {
          var _ref;
          return (_ref = this.document) != null ? _ref._localStorage || (_ref._localStorage = storages.local(this.location.host)) : void 0;
        }
      });
      return Object.defineProperty(window, "sessionStorage", {
        get: function() {
          var _ref;
          return (_ref = this.document) != null ? _ref._sessionStorage || (_ref._sessionStorage = storages.session(this.location.host)) : void 0;
        }
      });
    };

    Storages.prototype.dump = function() {
      var area, domain, pair, pairs, serialized, _i, _j, _len, _len1, _ref, _ref1;
      serialized = [];
      _ref = this._locals;
      for (domain in _ref) {
        area = _ref[domain];
        pairs = area.pairs;
        serialized.push("" + domain + " local:");
        for (_i = 0, _len = pairs.length; _i < _len; _i++) {
          pair = pairs[_i];
          serialized.push("  " + pair[0] + " = " + pair[1]);
        }
      }
      _ref1 = this._sessions;
      for (domain in _ref1) {
        area = _ref1[domain];
        pairs = area.pairs;
        serialized.push("" + domain + " session:");
        for (_j = 0, _len1 = pairs.length; _j < _len1; _j++) {
          pair = pairs[_j];
          serialized.push("  " + pair[0] + " = " + pair[1]);
        }
      }
      return serialized;
    };

    Storages.prototype.save = function() {
      var area, domain, pair, pairs, serialized, _i, _j, _len, _len1, _ref, _ref1;
      serialized = ["# Saved on " + (new Date().toISOString())];
      _ref = this._locals;
      for (domain in _ref) {
        area = _ref[domain];
        pairs = area.pairs;
        if (pairs.length > 0) {
          serialized.push("" + domain + " local:");
          for (_i = 0, _len = pairs.length; _i < _len; _i++) {
            pair = pairs[_i];
            serialized.push("  " + (escape(pair[0])) + " = " + (escape(pair[1])));
          }
        }
      }
      _ref1 = this._sessions;
      for (domain in _ref1) {
        area = _ref1[domain];
        pairs = area.pairs;
        if (pairs.length > 0) {
          serialized.push("" + domain + " session:");
          for (_j = 0, _len1 = pairs.length; _j < _len1; _j++) {
            pair = pairs[_j];
            serialized.push("  " + (escape(pair[0])) + " = " + (escape(pair[1])));
          }
        }
      }
      return serialized.join("\n") + "\n";
    };

    Storages.prototype.load = function(serialized) {
      var domain, item, key, storage, type, value, _i, _len, _ref, _ref1, _ref2, _results;
      storage = null;
      _ref = serialized.split(/\n+/);
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (item[0] === "#" || item === "") {
          continue;
        }
        if (item[0] === " ") {
          _ref1 = item.split("="), key = _ref1[0], value = _ref1[1];
          if (storage) {
            _results.push(storage.setItem(unescape(key.trim()), unescape(value.trim())));
          } else {
            throw "Must specify storage type using local: or session:";
          }
        } else {
          _ref2 = item.split(" "), domain = _ref2[0], type = _ref2[1];
          if (type === "local:") {
            _results.push(storage = this.local(domain));
          } else if (type === "session:") {
            _results.push(storage = this.session(domain));
          } else {
            throw "Unkown storage type " + type;
          }
        }
      }
      return _results;
    };

    return Storages;

  })();

  module.exports = Storages;

}).call(this);

(function() {
  var createHistory, createTabs;

  createHistory = require("./history");

  createTabs = function(browser) {
    var current, tabs;
    tabs = [];
    current = null;
    Object.defineProperties(tabs, {
      current: {
        get: function() {
          return current;
        },
        set: function(window) {
          window = tabs.find(window) || window;
          if (!~tabs.indexOf(window)) {
            return;
          }
          if (window && window !== current) {
            if (current) {
              browser.emit("inactive", current);
            }
            current = window;
            browser.emit("active", current);
          }
        }
      },
      dump: {
        value: function(output) {
          var window, _i, _len, _results;
          if (output == null) {
            output = process.stdout;
          }
          if (tabs.length === 0) {
            return output.write("No open tabs.\n");
          } else {
            _results = [];
            for (_i = 0, _len = tabs.length; _i < _len; _i++) {
              window = tabs[_i];
              _results.push(output.write("Window " + (window.name || "unnamed") + " open to " + window.location.href + "\n"));
            }
            return _results;
          }
        }
      },
      open: {
        value: function(options) {
          var active, focus, name, open, url, window;
          if (options == null) {
            options = {};
          }
          name = options.name, url = options.url;
          if (name && (window = this.find(name.toString()))) {
            tabs.current = window;
            if (url) {
              window.location = url;
            }
            return current;
          } else {
            if (name === "_blank" || !name) {
              name = "";
            }
            active = null;
            focus = function(window) {
              var index;
              if (window && window !== active) {
                index = tabs.indexOf(active);
                if (~index) {
                  tabs[index] = window;
                }
                if (tabs.current === active) {
                  tabs.current = window;
                }
                active = window;
              }
              return browser.eventLoop.setActiveWindow(window);
            };
            open = createHistory(browser, focus);
            options.url = url;
            window = open(options);
            this.push(window);
            if (name && (Object.propertyIsEnumerable(name) || !this[name])) {
              this[name] = window;
            }
            active = window;
            tabs.current = window;
            return window;
          }
        }
      },
      index: {
        get: function() {
          return this.indexOf(current);
        }
      },
      find: {
        value: function(name) {
          var window, _i, _len;
          if (tabs.propertyIsEnumerable(name)) {
            return tabs[name];
          }
          for (_i = 0, _len = this.length; _i < _len; _i++) {
            window = this[_i];
            if (window.name === name) {
              return window;
            }
          }
          return null;
        }
      },
      close: {
        value: function(window) {
          if (arguments.length === 0) {
            window = current;
          } else {
            window = this.find(window) || window;
          }
          if (~this.indexOf(window)) {
            window.close();
          }
        }
      },
      closeAll: {
        value: function() {
          var window, windows, _i, _len, _results;
          windows = this.slice(0);
          _results = [];
          for (_i = 0, _len = windows.length; _i < _len; _i++) {
            window = windows[_i];
            if (window.close) {
              _results.push(window.close());
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      }
    });
    browser.on("closed", function(window) {
      var index;
      index = tabs.indexOf(window);
      if (~index) {
        browser.emit("inactive", window);
        tabs.splice(index, 1);
        if (tabs.propertyIsEnumerable(window.name)) {
          delete tabs[window.name];
        }
        if (window === current) {
          if (index > 0) {
            current = tabs[index - 1];
          } else {
            current = tabs[0];
          }
          if (current) {
            return browser.emit("active", current);
          }
        }
      }
    });
    return tabs;
  };

  module.exports = createTabs;

}).call(this);

(function() {
  var EventSource, Events, File, HTML, History, JSDOM, Screen, URL, WebSocket, XMLHttpRequest, createDocument, createWindow, jsdomDispatchElement, loadDocument;

  createDocument = require("./document");

  EventSource = require("eventsource");

  History = require("./history");

  JSDOM = require("jsdom");

  WebSocket = require("ws");

  URL = require("url");

  XMLHttpRequest = require("./xhr");

  Events = JSDOM.dom.level3.events;

  HTML = JSDOM.dom.level3.html;

  module.exports = createWindow = function(_arg) {
    var browser, closed, document, encoding, eventQueue, global, history, method, name, opener, params, parent, referer, url, window, windowHistory;
    browser = _arg.browser, params = _arg.params, encoding = _arg.encoding, history = _arg.history, method = _arg.method, name = _arg.name, opener = _arg.opener, parent = _arg.parent, referer = _arg.referer, url = _arg.url;
    name || (name = "");
    url || (url = "about:blank");
    window = JSDOM.createWindow(HTML);
    global = window.getGlobal();
    closed = false;
    Object.defineProperty(window, "browser", {
      value: browser,
      enumerable: true
    });
    document = createDocument(browser, window, referer || history.url);
    Object.defineProperty(window, "document", {
      value: document,
      enumerable: true
    });
    Object.defineProperty(window, "name", {
      value: name,
      enumerable: true
    });
    if (parent) {
      Object.defineProperty(window, "parent", {
        value: parent,
        enumerable: true
      });
      Object.defineProperty(window, "top", {
        value: parent.top,
        enumerable: true
      });
    } else {
      Object.defineProperty(window, "parent", {
        value: global,
        enumerable: true
      });
      Object.defineProperty(window, "top", {
        value: global,
        enumerable: true
      });
    }
    Object.defineProperty(window, "opener", {
      value: opener && opener,
      enumerable: true
    });
    Object.defineProperty(window, "title", {
      get: function() {
        return document.title;
      },
      set: function(title) {
        return document.title = title;
      },
      enumerable: true
    });
    Object.defineProperty(window, "console", {
      value: browser.console,
      enumerable: true
    });
    Object.defineProperties(window.navigator, {
      cookieEnabled: {
        value: true
      },
      javaEnabled: {
        value: function() {
          return false;
        }
      },
      plugins: {
        value: []
      },
      userAgent: {
        value: browser.userAgent
      },
      language: {
        value: browser.language
      },
      vendor: {
        value: "Zombie Industries"
      }
    });
    Object.defineProperty(window, "cookies", {
      get: function() {
        return browser.cookies(this.location.hostname, this.location.pathname);
      }
    });
    browser._storages.extend(window);
    browser._interact.extend(window);
    Object.defineProperties(window, {
      File: {
        value: File
      },
      Event: {
        value: Events.Event
      },
      screen: {
        value: new Screen()
      },
      MouseEvent: {
        value: Events.MouseEvent
      },
      MutationEvent: {
        value: Events.MutationEvent
      },
      UIEvent: {
        value: Events.UIEvent
      }
    });
    window.atob = function(string) {
      return new Buffer(string, "base64").toString("utf8");
    };
    window.btoa = function(string) {
      return new Buffer(string, "utf8").toString("base64");
    };
    window.XMLHttpRequest = function() {
      return new XMLHttpRequest(window);
    };
    window.EventSource = function(url) {
      url = HTML.resourceLoader.resolve(document, url);
      window.setInterval((function() {}), 100);
      return new EventSource(url);
    };
    window.WebSocket = function(url, protocol) {
      var origin;
      url = HTML.resourceLoader.resolve(document, url);
      origin = "" + window.location.protocol + "//" + window.location.host;
      return new WebSocket(url, {
        origin: origin,
        protocol: protocol
      });
    };
    window.Image = function(width, height) {
      var img;
      img = new HTML.HTMLImageElement(window.document);
      img.width = width;
      img.height = height;
      return img;
    };
    window.resizeTo = function(width, height) {
      window.outerWidth = window.innerWidth = width;
      return window.outerHeight = window.innerHeight = height;
    };
    window.resizeBy = function(width, height) {
      return window.resizeTo(window.outerWidth + width, window.outerHeight + height);
    };
    window.onhashchange = null;
    window.postMessage = function(data, targetOrigin) {
      var event, origin;
      document = window.document;
      event = document.createEvent("MessageEvent");
      event.initEvent("message", false, false);
      event.data = data;
      event.source = (browser._windowInScope || window).getGlobal();
      origin = event.source.location;
      event.origin = URL.format({
        protocol: origin.protocol,
        host: origin.host
      });
      return window.dispatchEvent(event);
    };
    window._evaluate = function(code, filename) {
      var error, originalInScope, result, _ref;
      if (!browser.runScripts) {
        return;
      }
      try {
        _ref = [browser._windowInScope, window], originalInScope = _ref[0], browser._windowInScope = _ref[1];
        if (typeof code === "string" || code instanceof String) {
          result = global.run(code, filename);
        } else if (code) {
          result = code.call(global);
        }
        browser.emit("evaluated", code, result, filename);
        return result;
      } catch (_error) {
        error = _error;
        error.filename || (error.filename = filename);
        return browser.emit("error", error);
      } finally {
        browser._windowInScope = originalInScope;
      }
    };
    window.onerror = function(event) {
      var error;
      error = event.error || new Error("Error loading script");
      return browser.emit("error", error);
    };
    eventQueue = browser.eventLoop.createEventQueue(window);
    Object.defineProperties(window, {
      _eventQueue: {
        value: eventQueue
      },
      setTimeout: {
        value: eventQueue.setTimeout.bind(eventQueue)
      },
      clearTimeout: {
        value: eventQueue.clearTimeout.bind(eventQueue)
      },
      setInterval: {
        value: eventQueue.setInterval.bind(eventQueue)
      },
      clearInterval: {
        value: eventQueue.clearInterval.bind(eventQueue)
      },
      setImmediate: {
        value: function(fn) {
          return eventQueue.setTimeout(fn, 0);
        }
      },
      clearImmediate: {
        value: eventQueue.clearTimeout.bind(eventQueue)
      }
    });
    window.open = function(url, name, features) {
      url = url && HTML.resourceLoader.resolve(document, url);
      return browser.tabs.open({
        name: name,
        url: url,
        opener: window
      });
    };
    Object.defineProperty(window, "closed", {
      get: function() {
        return closed;
      },
      enumerable: true
    });
    window._destroy = function() {
      var frame, _i, _len, _ref;
      if (closed) {
        return;
      }
      closed = true;
      _ref = window.frames;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        frame = _ref[_i];
        frame.close();
      }
      eventQueue.destroy();
      document.close();
      window.dispose();
    };
    window.close = function() {
      if (parent || closed) {
        return;
      }
      if (browser._windowInScope === opener || browser._windowInScope === null) {
        browser.emit("closed", window);
        window._destroy();
        history.destroy();
      } else {
        browser.log("Scripts may not close windows that were not opened by script");
      }
    };
    history.updateLocation(window, url);
    windowHistory = {
      forward: history.go.bind(history, 1),
      back: history.go.bind(history, -1),
      go: history.go.bind(history),
      pushState: history.pushState.bind(history),
      replaceState: history.replaceState.bind(history),
      _submit: history.submit.bind(history),
      dump: history.dump.bind(history)
    };
    Object.defineProperties(windowHistory, {
      length: {
        get: function() {
          return history.length;
        },
        enumerable: true
      },
      state: {
        get: function() {
          return history.state;
        },
        enumerable: true
      }
    });
    Object.defineProperties(window, {
      history: {
        value: windowHistory
      }
    });
    browser.emit("opened", window);
    window._submit = function(_arg1) {
      var encoding, method, params, submitTo, target, url;
      url = _arg1.url, method = _arg1.method, encoding = _arg1.encoding, params = _arg1.params, target = _arg1.target;
      url = HTML.resourceLoader.resolve(document, url);
      target || (target = "_self");
      browser.emit("submit", url, target);
      switch (target) {
        case "_self":
          submitTo = window;
          break;
        case "_parent":
          submitTo = window.parent;
          break;
        case "_top":
          submitTo = window.top;
          break;
        default:
          submitTo = browser.tabs.open({
            name: target
          });
      }
      return submitTo.history._submit({
        url: url,
        method: method,
        encoding: encoding,
        params: params
      });
    };
    loadDocument({
      document: document,
      history: history,
      url: url,
      method: method,
      encoding: encoding,
      params: params
    });
    return window;
  };

  loadDocument = function(_arg) {
    var browser, document, done, encoding, error, headers, history, method, params, pathname, protocol, url, window, _ref;
    document = _arg.document, history = _arg.history, url = _arg.url, method = _arg.method, encoding = _arg.encoding, params = _arg.params;
    window = document.window;
    browser = window.browser;
    window._response = {};
    done = function(error) {
      if (error) {
        return browser.emit("error", error);
      } else {
        return browser.emit("loaded", document);
      }
    };
    method = (method || "GET").toUpperCase();
    if (method === "POST") {
      headers = {
        "content-type": encoding || "application/x-www-form-urlencoded"
      };
    }
    _ref = URL.parse(url), protocol = _ref.protocol, pathname = _ref.pathname;
    switch (protocol) {
      case "about:":
        document.open();
        document.write("<html><body></body></html>");
        document.close();
        return browser.emit("loaded", document);
      case "javascript:":
        try {
          window._evaluate(pathname, "javascript:");
          return browser.emit("loaded", document);
        } catch (_error) {
          error = _error;
          return browser.emit("error", error);
        }
        break;
      case "http:":
      case "https:":
      case "file:":
        headers = headers || {};
        if (!headers.referer) {
          headers.referer = document.referrer;
        }
        return window._eventQueue.http(method, url, {
          headers: headers,
          params: params,
          target: document
        }, function(error, response) {
          var body, contentLoaded, handleRefresh, windowLoaded;
          if (error) {
            document.open();
            document.write("<html><body>" + (error.message || error) + "</body></html>");
            document.close();
            browser.emit("error", error);
            return;
          }
          window._response = response;
          windowLoaded = function(event) {
            document.removeEventListener("load", windowLoaded);
            return window.dispatchEvent(event);
          };
          document.addEventListener("load", windowLoaded);
          handleRefresh = function() {
            var content, match, nothing, refresh, refreshTimeout, refreshURL, refresh_timeout, refresh_url;
            refresh = document.querySelector("meta[http-equiv='refresh']");
            if (refresh) {
              content = refresh.getAttribute("content");
              match = content.match(/^\s*(\d+)(?:\s*;\s*url\s*=\s*(.*?))?\s*(?:;|$)/i);
              if (match) {
                nothing = match[0], refresh_timeout = match[1], refresh_url = match[2];
              } else {
                return;
              }
              refreshTimeout = parseInt(refresh_timeout, 10);
              refreshURL = refresh_url || document.location.href;
              if (refreshTimeout >= 0) {
                return window._eventQueue.enqueue(function() {
                  var newWindow;
                  history.replace(refreshURL);
                  newWindow = history.current.window;
                  return newWindow.addEventListener("load", function() {
                    return newWindow._response.redirects++;
                  });
                });
              }
            }
          };
          contentLoaded = function(event) {
            document.removeEventListener("DOMContentLoaded", contentLoaded);
            window.dispatchEvent(event);
            return handleRefresh();
          };
          document.addEventListener("DOMContentLoaded", contentLoaded);
          window.browser.emit("loading", document);
          if (response.body) {
            body = response.body.toString("utf8");
          }
          if (!/<html>/.test(body)) {
            body = "<html><body>" + (body || "") + "</body></html>";
          }
          history.updateLocation(window, response.url);
          document.open();
          document.write(body);
          document.close();
          if (response.statusCode >= 400) {
            return browser.emit("error", new Error("Server returned status code " + response.statusCode + " from " + url));
          } else if (document.documentElement) {
            return browser.emit("loaded", document);
          } else {
            return browser.emit("error", new Error("Could not parse document at " + url));
          }
        });
      default:
        return browser.emit("error", new Error("Cannot load resource " + url + ", unsupported protocol"));
    }
  };

  jsdomDispatchElement = HTML.Element.prototype.dispatchEvent;

  HTML.Node.prototype.dispatchEvent = function(event) {
    var browser, document, error, originalInScope, self, window, _ref;
    self = this;
    document = self.ownerDocument || self.document || self;
    window = document.parentWindow;
    browser = window.browser;
    browser.emit("event", event, self);
    try {
      _ref = [browser._windowInScope, window], originalInScope = _ref[0], browser._windowInScope = _ref[1];
      window.event = event;
      return jsdomDispatchElement.call(self, event);
    } catch (_error) {
      error = _error;
      return browser.emit("error", error);
    } finally {
      delete window.event;
      browser._windowInScope = originalInScope;
    }
  };

  Screen = (function() {
    function Screen() {
      this.top = this.left = 0;
      this.width = 1280;
      this.height = 800;
    }

    Screen.prototype.__defineGetter__("availLeft", function() {
      return 0;
    });

    Screen.prototype.__defineGetter__("availTop", function() {
      return 0;
    });

    Screen.prototype.__defineGetter__("availWidth", function() {
      return 1280;
    });

    Screen.prototype.__defineGetter__("availHeight", function() {
      return 800;
    });

    Screen.prototype.__defineGetter__("colorDepth", function() {
      return 24;
    });

    Screen.prototype.__defineGetter__("pixelDepth", function() {
      return 24;
    });

    return Screen;

  })();

  File = (function() {
    function File() {}

    return File;

  })();

}).call(this);

(function() {
  var Events, HTML, URL, XMLHttpRequest, raise,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  HTML = require("jsdom").dom.level3.html;

  Events = require("jsdom").dom.level3.events;

  URL = require("url");

  raise = require("./scripts");

  HTML.SECURITY_ERR = 18;

  HTML.NETWORK_ERR = 19;

  HTML.ABORT_ERR = 20;

  XMLHttpRequest = (function(_super) {
    __extends(XMLHttpRequest, _super);

    function XMLHttpRequest(window) {
      this._window = window;
      this._pending = [];
      this._responseHeaders = null;
      this.onreadystatechange = null;
      this.timeout = 0;
      this.status = null;
      this.statusText = null;
      this.responseText = null;
      this.responseXML = null;
      this._ownerDocument = window.document;
      this._parentNode = window;
    }

    XMLHttpRequest.prototype.abort = function() {
      var request, _i, _len, _ref;
      _ref = this._pending;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        request = _ref[_i];
        request.error || (request.error = new HTML.DOMException(HTML.ABORT_ERR, "Request aborted"));
      }
      return this.readyState = XMLHttpRequest.UNSENT;
    };

    XMLHttpRequest.prototype.getAllResponseHeaders = function(header) {
      var headerStrings, value, _ref;
      if (this._responseHeaders) {
        headerStrings = [];
        _ref = this._responseHeaders;
        for (header in _ref) {
          value = _ref[header];
          headerStrings.push("" + header + ": " + value);
        }
        return headerStrings.join("\n");
      } else {
        return null;
      }
    };

    XMLHttpRequest.prototype.getResponseHeader = function(header) {
      if (this._responseHeaders) {
        return this._responseHeaders[header.toLowerCase()];
      } else {
        return null;
      }
    };

    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      var headers, request;
      if (async === false) {
        throw new HTML.DOMException(HTML.NOT_SUPPORTED_ERR, "Zombie does not support synchronous XHR requests");
      }
      this.abort();
      method = method.toUpperCase();
      if (/^(CONNECT|TRACE|TRACK)$/.test(method)) {
        throw new HTML.DOMException(HTML.SECURITY_ERR, "Unsupported HTTP method");
      }
      if (!/^(DELETE|GET|HEAD|OPTIONS|POST|PUT)$/.test(method)) {
        throw new HTML.DOMException(HTML.SYNTAX_ERR, "Unsupported HTTP method");
      }
      headers = {};
      url = URL.parse(URL.resolve(this._window.location.href, url));
      if ((url.protocol === 'https:' && url.port === '443') || (url.protocol === 'http:' && url.port === '80')) {
        delete url.port;
      }
      if (!/^https?:$/i.test(url.protocol)) {
        throw new HTML.DOMException(HTML.NOT_SUPPORTED_ERR, "Only HTTP/S protocol supported");
      }
      url.hostname || (url.hostname = this._window.location.hostname);
      url.host = url.port ? url.host = "" + url.hostname + ":" + url.port : url.host = url.hostname;
      if (url.host !== this._window.location.host) {
        headers.origin = this._window.location.protocol + "//" + this._window.location.host;
        this._cors = headers.origin;
      }
      url.hash = null;
      if (user) {
        url.auth = "" + user + ":" + password;
      }
      this.status = null;
      this.statusText = null;
      this.responseText = null;
      this.responseXML = null;
      request = {
        method: method,
        url: URL.format(url),
        headers: headers
      };
      this._pending.push(request);
      this._stateChanged(XMLHttpRequest.OPENED);
    };

    XMLHttpRequest.prototype.send = function(data) {
      var request, _base;
      if (this.readyState !== XMLHttpRequest.OPENED) {
        throw new HTML.DOMException(HTML.INVALID_STATE_ERR, "Invalid state");
      }
      request = this._pending[this._pending.length - 1];
      (_base = request.headers)["content-type"] || (_base["content-type"] = "text/plain");
      request.body = data;
      request.timeout = this.timeout;
      this._window._eventQueue.http(request.method, request.url, request, (function(_this) {
        return function(error, response) {
          var allowedOrigin, event;
          error || (error = request.error);
          if (error) {
            event = new Events.Event('xhr');
            event.initEvent('error', true, true);
            event.error = new HTML.DOMException(HTML.NETWORK_ERR, error.message);
            _this.dispatchEvent(event);
            return;
          }
          if (_this._cors) {
            allowedOrigin = response.headers['access-control-allow-origin'];
            if (!(allowedOrigin === '*' || allowedOrigin === _this._cors)) {
              event = new Events.Event('xhr');
              event.initEvent('error', true, true);
              event.error = new HTML.DOMException(HTML.SECURITY_ERR, "Cannot make request to different domain");
              _this.dispatchEvent(event);
              return;
            }
          }
          _this.status = response.statusCode;
          _this.statusText = response.statusText;
          _this._responseHeaders = response.headers;
          _this._stateChanged(XMLHttpRequest.HEADERS_RECEIVED);
          return _this._window._eventQueue.enqueue(function() {
            var _ref;
            _this.responseText = ((_ref = response.body) != null ? _ref.toString() : void 0) || "";
            _this.responseXML = null;
            return _this._stateChanged(XMLHttpRequest.DONE);
          });
        };
      })(this));
    };

    XMLHttpRequest.prototype.setRequestHeader = function(header, value) {
      var request;
      if (this.readyState !== XMLHttpRequest.OPENED) {
        throw new HTML.DOMException(HTML.INVALID_STATE_ERR, "Invalid state");
      }
      request = this._pending[this._pending.length - 1];
      request.headers[header.toString().toLowerCase()] = value.toString();
    };

    XMLHttpRequest.prototype._stateChanged = function(newState) {
      var event;
      this.readyState = newState;
      if (newState === XMLHttpRequest.DONE) {
        event = new Events.Event('xhr');
        event.initEvent('load', false, true);
        this.dispatchEvent(event);
      }
      if (this.onreadystatechange) {
        return this._window._eventQueue.enqueue((function(_this) {
          return function() {
            var error;
            try {
              return _this.onreadystatechange.call(_this);
            } catch (_error) {
              error = _error;
              return raise({
                element: _this._window.document,
                from: __filename,
                scope: "XHR",
                error: error
              });
            }
          };
        })(this));
      }
    };

    return XMLHttpRequest;

  })(Events.EventTarget);

  XMLHttpRequest.UNSENT = 0;

  XMLHttpRequest.OPENED = 1;

  XMLHttpRequest.HEADERS_RECEIVED = 2;

  XMLHttpRequest.LOADING = 3;

  XMLHttpRequest.DONE = 4;

  module.exports = XMLHttpRequest;

}).call(this);
