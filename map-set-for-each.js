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

  // We use an object to keep the ordering

  var keyMap = new WeakMap;

  function getKeyMap(obj) {
    var map = keyMap.get(obj);
    if (!map) {
      map = Object.create(null);
      keyMap.set(obj, map);
    }
    return map;
  }

  // These maps are used to map a value to a unique ID.
  var objectKeys = new WeakMap;
  var numberKeys = Object.create(null);
  var stringKeys = Object.create(null);

  var uidCounter = 4;  // 0 - 3 are used for null, undefined, false and true

  /**
   * @param {*} key
   * @return {string} A unique ID for a given key (of any type). This unique ID
   *    is a non numeric string since strings that can be used as array indexes
   *    causes different enumeration order.
   */
  function getUid(key) {
    if (key === null)
      return '$0';

    var keys, uid;

    switch (typeof key) {
      case 'undefined':
        return '$1';
      case 'boolean':
        // 2 & 3
        return '$' + (key + 2);
      case 'object':
      case 'function':
        uid = objectKeys.get(key);
        if (!uid) {
          uid = '$' + uidCounter++;
          objectKeys.set(key, uid);
        }
        return uid;
      case 'number':
        keys = numberKeys;
        break;
      case 'string':
        keys = stringKeys;
        break;
    }
    uid = keys[key];
    if (!uid) {
      uid = '$' + uidCounter++;
      keys[key] = uid;
    }
    return uid;
  }

  var MapSet = Map.prototype.set;
  var MapDelete = Map.prototype.delete;
  var SetAdd = Set.prototype.add;
  var SetDelete = Set.prototype.delete;

  Map.prototype.set = function(key, value) {
    var uid = getUid(key);
    var keyMap = getKeyMap(this);
    keyMap[uid] = key;
    return MapSet.call(this, key, value);
  };

  Map.prototype.delete = function(key) {
    var uid = getUid(key);
    var keyMap = getKeyMap(this);
    delete keyMap[uid];
    return MapDelete.call(this, key);
  };

  /**
   * For each key and value in the map call a function that takes the key and
   * the value (as well as the map).
   * @param {function(*, *, Map} f
   * @param {Object} opt_this The object to use as this in the callback.
   *     Defaults to the map itself.
   */
  Map.prototype.forEach = function(f, opt_this) {
    var keyMap = getKeyMap(this);
    for (var uid in keyMap) {
      var key = keyMap[uid]
      var value = this.get(key);
      f.call(opt_this || this, value, key, this);
    }
  };

  Set.prototype.add = function(key) {
    var uid = getUid(key);
    var keyMap = getKeyMap(this);
    keyMap[uid] = key;
    return SetAdd.call(this, key);
  };

  Set.prototype.delete = function(key) {
    var uid = getUid(key);
    var keyMap = getKeyMap(this);
    delete keyMap[uid];
    return SetDelete.call(this, key);
  };

  /**
   * For each value in the set call a function that takes the value and
   * the value (again) (as well as the set).
   * @param {function(*, *, Set} f
   * @param {Object} opt_this The object to use as this in the callback.
   *     Defaults to the set itself.
   */
  Set.prototype.forEach = function(f, opt_this) {
    var keyMap = getKeyMap(this);
    for (var uid in keyMap) {
      var key = keyMap[uid]
      f.call(opt_this || this, key, key, this);
    }
  };

})();
