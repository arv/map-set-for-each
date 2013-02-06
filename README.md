This polyfills `Map.prototype.forEach` and `Set.prototype.forEach`.

The ordering of the iteration is done by storing a parallel object that maps the
keys to an string key which is used on a plain JavaScript object which we do the
iteration over.

```js
var map = new Map;
map.set('a', 'A');
map.set(document.body, 'B');
map.forEach(function(value, key) {
  console.log(value, key);
});
```

In the case of `Set` the callback passes the value twice so that the callback
function has the same signature as the callback used in `Array.prototype.forEach`.

```js
var set = new Set;
set.add('a');
set.add(document.body);
set.forEach(function(value, valueAgain) {
  assert(value === valueAgain);
  console.log(value);
});
```

---

This repository uses Git Submodules. You will need to run `git submodule init`
and `git submodule update` from the top level directory of the project working
tree before you can run tests, for example.