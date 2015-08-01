var BrowserWindow = require('browser-window');
var cache = {

  list: {},

  isAppQuitting: false,

  add: function (name, options, url) {
    if (cache.has(name)) {
      console.error('Window already exists. ');
      return false;
    }

    var bw = new BrowserWindow(options);
    if (url) {
      bw.loadUrl(url);
    }

    bw.on('close', function (event) {
      if (!cache.isAppQuitting) {
        event.preventDefault();
        this.hide();
        return false;
      }
      else {
        cache.remove(name);
      }
    });

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
    var win = cache.get(name);
    if (win) {
      win.show();
    }
  },

  hide: function (name) {
    var win = cache.get(name);
    if (win) {
      win.hide(); 
    }
  },

  appQuit: function () {
    cache.isAppQuitting = true;
    cache.removeAll();
    return true;
  }
};

module.exports = cache;
