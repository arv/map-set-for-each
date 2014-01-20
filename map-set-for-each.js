// Copyright (c) 2013 Erik Arvidsson and contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

(function() {
  'use strict';

  if (typeof Map === 'undefined' ||
      typeof Set === 'undefined' ||
      typeof WeakMap === 'undefined') {
    throw Error('This requires Map, Set and WeakMap');
  }

  if (Map.prototype.forEach && Set.prototype.forEach)
    return;

  // Each Map and Set is backed by a MapData object. This MapData object
  // consists of an array (for iteration order) and a Map (for constant time
  // lookup). Both the map and array conatins Nodes. These Nodes contains the
  // index where they are stored in the array.
  //
  // When deleting a key the entry in the array is set to null and th Node in
  // the internal Map is deleted. After a key has been deleted we check if we
  // should clean up our internal array to remove the null nodes.
  //
  // When we iterate we increment a counter. This is because we cannot clean up
  // the backing array during interation or the iteration order would be
  // incorrect.

  var MapGet = Map.prototype.get;
  var MapSet = Map.prototype.set;
  var MapDelete = Map.prototype.delete;
  var MapClear = Map.prototype.clear;

  function Node(key, value, index) {
    this.key = key;
    this.value = value;
    this.index = index;
  }

  function MapData() {
    this.iteratorCount = 0;
    this.map = new Map;
    this.array = [];
    this.size = 0;
  }

  MapData.prototype = {
    getNode: function(key) {
      return MapGet.call(this.map, key);
    },
    has: function(key) {
      var node = this.getNode(key);
      return !!node;
    },
    get: function(key) {
      var node = this.getNode(key);
      return node && node.value;
    },
    set: function(key, value) {
      var node = this.getNode(key);
      if (node) {
        node.value = value;
      } else {
        var index = this.array.length;
        node = new Node(key, value, index);
        this.array[index] = node;
        MapSet.call(this.map, key, node);
        this.size++;
      }
    },
    delete: function(key) {
      var node = this.getNode(key);
      if (!node)
        return false;
      this.array[node.index] = null;
      MapDelete.call(this.map, key);
      this.size--;
      this.maybeCleanup();
      return true;
    },
    clear: function() {
      if (this.iteratorCount === 0) {
        this.array = [];
      } else {
        for (var i = 0; i < this.array.length; i++) {
          this.array[i] = null;
        }
      }
      MapClear.call(this.map);
      this.size = 0;
    },
    maybeCleanup: function() {
      if (this.iteratorCount === 0 &&  this.array.length > 1.5 * this.size)
        this.cleanup();
    },
    cleanup: function() {
      var newArray = [], j = 0;
      for (var i = 0; i < this.array.length; i++) {
        var node = this.array[i];
        if (node) {
          node.index = j;
          newArray[j++] = node;
        }
      }
      this.array = newArray;
    },
    forEach: function(f, self, context) {
      this.iteratorCount++;
      try {
        for (var i = 0; i < this.array.length; i++) {
          var node = this.array[i];
          if (node)
            f.call(context || self, node.value, node.key, self);
        }
      } finally {
        this.iteratorCount--;
        this.maybeCleanup();
      }
    }
  };

  var mapDataMap = new WeakMap;

  function getMapData(object) {
    var mapData = mapDataMap.get(object);
    if (!mapData)
      mapDataMap.set(object, mapData = new MapData);
    return mapData;
  }

  Map.prototype.has = function(key) {
    return getMapData(this).has(key);
  };

  Map.prototype.get = function(key) {
    return getMapData(this).get(key);
  };

  Map.prototype.set = function(key, value) {
    getMapData(this).set(key, value);
    return this;
  };

  Map.prototype.delete = function(key) {
    return getMapData(this).delete(key);
  };

  Map.prototype.clear = function(f) {
    getMapData(this).clear();
  };

  Object.defineProperty(Set.prototype, 'size', {
    get: function() {
      return getMapData(this).size;
    }
  });

  /**
   * For each key and value in the map call a function that takes the key and
   * the value (as well as the map).
   * @param {function(*, *, Map} f
   * @param {Object} opt_this The object to use as this in the callback.
   *     Defaults to the map itself.
   */
  Map.prototype.forEach = function(f, opt_this) {
    getMapData(this).forEach(f, this, opt_this);
  };


  Set.prototype.has = function(key) {
    return getMapData(this).has(key);
  };

  Set.prototype.add = function(key) {
    getMapData(this).set(key, key);
    return this;
  };

  Set.prototype.delete = function(key) {
    return getMapData(this).delete(key);
  };

  Set.prototype.clear = function() {
    getMapData(this).clear();
  };

  Object.defineProperty(Set.prototype, 'size', {
    get: function() {
      return getMapData(this).size;
    }
  });

  /**
   * For each value in the set call a function that takes the value and
   * the value (again) (as well as the set).
   * @param {function(*, *, Set} f
   * @param {Object} opt_this The object to use as this in the callback.
   *     Defaults to the set itself.
   */
  Set.prototype.forEach = function(f, opt_this) {
    getMapData(this).forEach(f, this, opt_this);
  };

})();
