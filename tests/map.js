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

suite('Map', function() {

  function keys(map) {
    var rv = [];
    map.forEach(function(_, k) {
      rv.push(k);
    });
    return rv;
  }

  function values(map) {
    var rv = [];
    map.forEach(function(v) {
      rv.push(v);
    });
    return rv;
  }

  test('Old tests', function() {

    var m = new Map;
    m.set('a', 'A');
    assert.isTrue(m.has('a'));
    assert.isFalse(m.has(new String('a')));

    m.set('b', 'B');
    m.delete('a');
    assert.isFalse(m.has('a'));
    m.set('a', 'AA');

    m.forEach(function(v, k) {
      assert.isTrue(m.has(k));
      assert.strictEqual(v, m.get(k));
      assert.strictEqual(m, this);
      if (k === 'b') {
        m.delete('b');
        m.set('c', 'C');
      }
    });

    assert.strictEqual('ac', keys(m).join(''));
    assert.strictEqual('AAC', values(m).join(''));

    for (var i = 0; i < 500; i++) {
      m.set(i, i);
    }

    for (var i = 0; i < 500; i++) {
      if (i % 100)
        m.delete(i);
    }

    assert.strictEqual('ac0100200300400', keys(m).join(''));
    assert.strictEqual('AAC0100200300400', values(m).join(''));

    var obj = {};
    m.forEach(function(v, k, self) {
      assert.strictEqual(m, self);
      assert.strictEqual(this, obj);
    }, obj);

    var m2 = new Map;
    m2.set('a', 'A');
    m2.set(1, 1);
    m2.set(0, 0);

    var i = 0;
    var expected = [
      ['a', 'A'],
      [1, 1],
      [0, 0]
    ];
    m2.forEach(function(v, k) {
      assert.strictEqual(k, expected[i][0]);
      assert.strictEqual(v, expected[i][1]);
      i++;
    });
  });

  test('Numeric key ordering', function() {
    var m = new Map;
    m.set(5, 5);
    m.set(1, 1);
    m.set(9, 9);

    assert.deepEqual([5, 1, 9], keys(m));
  });

  test('String key ordering', function() {
    var m = new Map;
    m.set('f', 5);
    m.set('a', 1);
    m.set('b', 9);

    assert.deepEqual(['f','a', 'b'], keys(m));

    m.set(NaN, NaN);
    assert.equal(4, keys(m).length);
    assert.isTrue(isNaN(keys(m)[3]));

  });

  test('Boolean key ordering', function() {
    var m = new Map;
    m.set(false, 0);
    m.set(true, 1);
    m.set(false, 2);

    assert.deepEqual([false, true], keys(m));
  });

  test('Null, undefined key ordering', function() {
    var m = new Map;
    m.set(undefined, 0);
    m.set(null, 1);

    assert.deepEqual([undefined, null], keys(m));
  });

  test('Object, function key ordering', function() {
    var m = new Map;
    var o = {};
    var p = {};
    var f = function() {};
    var g = function() {};

    m.set(o, 0);
    m.set(p, 1);
    m.set(f, 2);
    m.set(g, 3);

    assert.deepEqual([o, p, f, g], keys(m));
  });

  test('issue 2', function() {
    var s = [];
    var value = 42;
    var map = new Map();
    map.set(0, value);
    map.set(1, value);
    map.set(2, value);
    map.set(3, value);
    map.delete(1, value);
    map.forEach(function(value, key) {
      s.push(key);
      if (key === 0) {
        map.delete(0);
        map.delete(2);
        map.set(4);
      }
    });
    assert.equal(s.join(''), '034');
  });

});
