/**
 * Cache.js
 *
 * Cache BrowserWindows so we can reference it anywhere in main process.
 * Provides a convenient to preserve BrowserWindow's state.  
 */
var BrowserWindow = require('browser-window');
var cache = {

  // Hold all references to BrowserWindows
  list: {},

  // Close options, hide|close
  closeOptions: ['hide', 'close'],

  // Default close option
  defaultCloseOption: 'hide',

  // Indicating if app is really quitting.
  isAppQuitting: false,

  // Create a new instance of BrowserWindow, inserted into our list to allow us
  // to have random access to all BrowserWindows.
  add: function (name, options, url) {
    if (cache.has(name)) {
      console.error('Window already exists. ');
      return false;
    }

    var bw = new BrowserWindow(options);

    // Load page if url is provided.
    if (url) {
      bw.loadUrl(url);
    }

    // Prevent default window close option, hide window instead,
    // so we can preserve window's state even we "closed" the window.
    if (cache.defaultCloseOption === 'hide') {
      bw.on('close', function (event) {
        if (!cache.isAppQuitting) {
          event.preventDefault();
          this.hide();
          return false;
        }
        else {
          // Prevent memory leaks.
          // We are going to destroy all windows when app is truely quitting.
          cache.remove(name);
        }
      });
    }

    cache.list[name] = bw;
  },

  get: function (name) {
    if (name && cache.has(name)) {
      return cache.list[name];
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

  // Alias to .get([windowKey]).show()
  show: function (name) {
    var win = cache.get(name);
    if (win) {
      win.show();
    }
  },

  // Alias to .get([windowKey]).hide()
  hide: function (name) {
    var win = cache.get(name);
    if (win) {
      win.hide();
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
