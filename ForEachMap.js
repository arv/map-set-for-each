
var ForEachMap = (function() {
  'use strict';

  if (typeof Map === 'undefined' || typeof WeakMap === 'undefined')
    throw Error('This requires Map and WeakMap');

  var privateState = new WeakMap;
  var hole = {};

  function getPrivate(map) {
    if (privateState.has(map))
      return privateState.get(map);
    var p = {
      map: new Map,
      keys: [],
      values: [],
      holes: 0,
      locked: 0
    };
    privateState.set(map, p);
    return p;
  }

  /**
   * In case the arrays contain more than half holes we recreate the arrays
   * without any holes.
   * @param {ForEachMap} map
   */
  function maybeRemoveHoles(map) {
    var p = getPrivate(map);
    var len = p.values.length
    if (!p.locked && len > 16 && p.holes > len / 2) {
      var keys = [];
      var values = [];
      var i = 0;
      map.forEach(function(v, k) {
        keys[i] = k;
        values[i] = v;
        p.map.set(k, i);
        i++;
      });
      p.keys = keys;
      p.values = values;
      p.holes = 0;
    }
  }

  /**
   * A map that allows iteration using |forEach| to iterate over the
   * keys and values in the order they were insterted.
   */
  function ForEachMap() {
  }

  ForEachMap.prototype = {
    has: function(key) {
      var p = getPrivate(this);
      return p.map.has(key);
    },

    set: function(key, value) {
      var p = getPrivate(this);
      if (p.map.has(key)) {
        var i = p.map.get(key);
        p.keys[i] = key;
        p.values[i] = value;
      } else {
        var i = p.values.length;
        p.keys[i] = key;
        p.values[i] = value;
        p.map.set(key, i);
      }
    },

    get: function(key) {
      var p = getPrivate(this);
      if (p.map.has(key)) {
        var i = p.map.get(key);
        return p.values[i];
      }
    },

    delete: function(key) {
      var p = getPrivate(this);
      if (p.map.has(key)) {
        var i = p.map.get(key);
        p.keys[i] = p.values[i] = hole;
        p.holes++;
        maybeRemoveHoles(this);
        p.map.delete(key);
      }
    },

    /**
     * For each key and value in the map call a function that takes the key and
     * the value (as well as the map).
     * @param {function(*, *, ForEachMap} f
     * @param {Object} opt_this The object to use as this in the callback.
     *     Defaults to the map itself.
     */
    forEach: function(f, opt_this) {
      var map = this;
      var p = getPrivate(this);
      // Lock the state so that we don't reindex during an iteration.
      p.locked++;
      try {
        for (var i = 0; i < p.values.length; i++) {
          var value = p.values[i];
          if (value !== hole)
            f.call(opt_this || map, value, p.keys[i], map);
        }
      } finally {
        p.locked--;
      }
    }
  };

  return ForEachMap;
})();
