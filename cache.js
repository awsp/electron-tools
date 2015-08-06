/**
 * Cache.js
 *
 * Cache BrowserWindows so we can reference it anywhere in main process.
 * Provides a convenient way to preserve BrowserWindow's state.
 */
var BrowserWindow = require("browser-window");

var AppWindow = (function () {
  /**
   * Class Constructor
   */
  function AppWindow(instance, id, triggerQuit) {
    this.id = id;
    this.instance = instance;
    this.triggerQuit = false;

    if (triggerQuit) {
      this.triggerQuit = triggerQuit;
    }
  }

  return AppWindow;
})();

var cache = {

  // Hold all references to BrowserWindows
  list: {},

  // Close options, hide|close
  closeOptions: ["hide", "close"],

  // Default close option
  defaultCloseOption: "hide",

  // Indicating if app is really quitting.
  isAppQuitting: false,

  // Create a new instance of BrowserWindow, inserted into our list to allow us
  // to have random access to all BrowserWindows.
  add: function (name, options, url, quit) {
    if (cache.has(name)) {
      console.error("Window already exists. ");
      return false;
    }

    var bw = new BrowserWindow(options);
    if (url) {
      bw.loadUrl(url);
    }

    bw.on("close", function (event) {
      if (cache.list[name].triggerQuit) {
        cache.isAppQuitting = true;
      }

      if (!cache.isAppQuitting) {
        event.preventDefault();
        this.hide();
        return false;
      }
      else {
        cache.remove(name);
      }
    });
    bw.on("closed", function (event) {
      if (cache.list[name].triggerQuit) {
        require("app").quit();
      }
      else {
        cache.list[name].status = "closed";
        cache.remove(name);
      }
    });
    var appWindow = new AppWindow(bw, bw.id);
    if (quit) {
      appWindow.triggerQuit = quit;
    }

    cache.list[name] = appWindow;
  },

  /**
   * Get a window based on its name
   *
   * @param String name
   * @param Boolean raw - indicate if it should return an instance or not.
   */
  get: function (name, raw) {
    if (name && cache.has(name)) {
      if (raw) {
        return cache.list[name];
      }
      return cache.list[name].instance;
    }
    return null;
  },

  find: function (callback, shouldReturn) {
    var win;
    for (var key in cache.list) {
      if (callback(cache.list[key])) {
        if (shouldReturn && shouldReturn === "key") {
          return key;
        }
        return cache.list[key];
      }
    }
    return null;
  },

  all: function () {
    return cache.list;
  },

  has: function (name) {
    return cache.list.hasOwnProperty(name);
  },

  // Remove BrowserWindow
  // Destroy the instance and remove it from list.
  remove: function (name) {
    if ( ! cache.has(name)) {
      var win = cache.get(name);
      win.destroy();
      delete cache.list[name];
    }
  },

  removeAll: function () {
    for (var key in cache.list) {
      cache.remove(key);
    }
  },

  show: function (name) {
    var win = cache.get(name, true);
    if (win) {
      win.instance.show();
    }
  },


  hide: function (name) {
    var win = cache.get(name, true);
    if (win) {
      win.instance.hide();
    }
  },

  open: function(name) {
    var appWindow = cache.get(name, true);
    appWindow.instance.show();
  },

  close: function (instance) {
    if (typeof instance === "string") {
      if (cache.defaultClosingOption === "hide") {
        cache.hide(instance);
      }
      else if (cache.defaultClosingOption === "close") {
        cache.get(instance).close();
      }
    }
    else if (typeof instance === "object") {
      var winKey = cache.find(function (win) {
        return win.id == instance.id;
      }, "key");
      cache.close(winKey);
    }
  },

  // App is quitting
  // Setup flag and remove all BrowserWindows instance.
  appQuit: function () {
    cache.isAppQuitting = true;
    cache.removeAll();
    return true;
  },

  setQuitOption: function (option) {
    if (cache.closeOptions.indexOf(option) >= 0) {
      cache.defaultCloseOption = option;
    }
  }
};

module.exports = cache;
