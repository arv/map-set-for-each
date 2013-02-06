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

suite('Set', function() {

  function keys(set) {
    var rv = [];
    set.forEach(function(_, k) {
      rv.push(k);
    });
    return rv;
  }

  function values(set) {
    var rv = [];
    set.forEach(function(v) {
      rv.push(v);
    });
    return rv;
  }

  test('Old tests', function() {
    var s = new Set;
    s.add('a');
    assert.isTrue(s.has('a'));
    assert.isFalse(s.has(new String('a')));

    s.add('b');
    s.delete('a');
    assert.isFalse(s.has('a'));
    s.add('a');

    s.forEach(function(v, k) {
      assert.strictEqual(v, k);
      assert.isTrue(s.has(k));
      assert.strictEqual(s, this);
      if (k === 'b') {
        s.delete('b');
        s.add('c');
      }
    });

    assert.strictEqual('ac', keys(s).join(''));
    assert.strictEqual('ac', values(s).join(''));

    for (var i = 0; i < 500; i++) {
      s.add(i);
    }

    for (var i = 0; i < 500; i++) {
      if (i % 100)
        s.delete(i);
    }

    assert.strictEqual('ac0100200300400', keys(s).join(''));
    assert.strictEqual('ac0100200300400', values(s).join(''));

    var obj = {};
    s.forEach(function(v, k, self) {
      assert.strictEqual(s, self);
      assert.strictEqual(this, obj);
    }, obj);
  });

test('Numeric key ordering', function() {
    var s = new Set;
    s.add(5);
    s.add(1);
    s.add(9);

    assert.deepEqual([5, 1, 9], keys(s));
  });

  test('String key ordering', function() {
    var s = new Set;
    s.add('f');
    s.add('a');
    s.add('b');

    assert.deepEqual(['f','a', 'b'], keys(s));

    s.add(NaN);
    assert.equal(4, keys(s).length);
    assert.isTrue(isNaN(keys(s)[3]));

  });

  test('Boolean key ordering', function() {
    var s = new Set;
    s.add(false);
    s.add(true);
    s.add(false);

    assert.deepEqual([false, true], keys(s));
  });

  test('Null, undefined key ordering', function() {
    var s = new Set;
    s.add(undefined);
    s.add(null);

    assert.deepEqual([undefined, null], keys(s));
  });

  test('Object, function key ordering', function() {
    var s = new Set;
    var o = {};
    var p = {};
    var f = function() {};
    var g = function() {};

    s.add(o);
    s.add(p);
    s.add(f);
    s.add(g);

    assert.deepEqual([o, p, f, g], keys(s));
  });

});