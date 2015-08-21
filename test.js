'use strict';

var async = require('async');
var lib = require('./');
var livedb = require('livedb');
var racer = require('racer');
var test = require('tape');

test('lib', function (t) {
  t.plan(1);
  t.equals(typeof lib, 'function');
});

test('change', {timeout: 1000}, function (t) {
  t.plan(205);

  var backend = livedb.client({
    db: livedb.memory()
  });

  var store = racer.createStore({
    backend: backend
  });

  var model = store.createModel({
    fetchOnly: true
  });

  var hooks = lib(store);

  var thing1 = {
    id: 'id',
    stuff: {
      a: {foo: 'bar'},
      b: {baz: 'qux'}
    },
    items: [{a: 1}, {b: 2}]
  };

  var thing2 = {
    id: 'id',
    stuff: {a: {foo: 'bar!'}},
    items: [{a: 1}, {b: 2}]
  };

  var thing3 = {
    id: 'id',
    stuff: {a: {foo: 'bar!'}},
    items: [{a: 3}, {b: 2}]
  };

  var thing4 = {
    id: 'id',
    stuff: {a: {foo: 'bar!'}},
    items: [{a: 3}, {c: 1}]
  };

  var thing5 = {
    id: 'id',
    stuff: {a: {foo: 'b++ar!'}},
    items: [{a: 3}, {c: 1}]
  };

  var thing6 = {
    id: 'id',
    stuff: {a: {foo: 'b++!'}},
    items: [{a: 3}, {c: 1}]
  };

  var pass = 0;

  hooks.on('change', 'things.id', function (next, prev, snapshot) {
    t.ok(true);

    if (pass === 1) {
      t.deepEqual(next, thing1);
      t.equal(typeof prev, 'undefined');
      t.deepEqual(snapshot, thing1);
    }

    if (pass === 2) {
      t.deepEqual(next.stuff, thing2.stuff);
      t.deepEqual(prev.stuff, thing1.stuff);
      t.deepEqual(snapshot, thing2);
    }

    if (pass === 3) {
      t.deepEqual(next.items[0].a, thing3.items[0].a);
      t.deepEqual(prev.items[0].a, thing2.items[0].a);
      t.deepEqual(snapshot, thing3);
    }

    if (pass === 4) {
      t.deepEqual(next.items[1], thing4.items[1]);
      t.deepEqual(prev.items[1], thing3.items[1]);
      t.deepEqual(snapshot, thing4);
    }

    if (pass === 5) {
      t.deepEqual(next.stuff.a.foo, thing5.stuff.a.foo);
      t.deepEqual(prev.stuff.a.foo, thing4.stuff.a.foo);
      t.deepEqual(snapshot, thing5);
    }

    if (pass === 6) {
      t.deepEqual(next.stuff.a.foo, thing6.stuff.a.foo);
      t.deepEqual(prev.stuff.a.foo, thing5.stuff.a.foo);
      t.deepEqual(snapshot, thing6);
    }
  });

  hooks.on('change', 'things.*', function (id, next, prev, snapshot) {
    t.ok(true);

    if (pass === 1) {
      t.equal(id, thing1.id);
      t.deepEqual(next, thing1);
      t.equal(typeof prev, 'undefined');
      t.deepEqual(snapshot, thing1);
    }

    if (pass === 2) {
      t.equal(id, thing2.id);
      t.deepEqual(next.stuff, thing2.stuff);
      t.deepEqual(prev.stuff, thing1.stuff);
      t.deepEqual(snapshot, thing2);
    }

    if (pass === 3) {
      t.equal(id, thing3.id);
      t.deepEqual(next.items[0].a, thing3.items[0].a);
      t.deepEqual(prev.items[0].a, thing2.items[0].a);
      t.deepEqual(snapshot, thing3);
    }

    if (pass === 4) {
      t.equal(id, thing4.id);
      t.deepEqual(next.items[1], thing4.items[1]);
      t.deepEqual(prev.items[1], thing3.items[1]);
      t.deepEqual(snapshot, thing4);
    }

    if (pass === 5) {
      t.equal(id, thing5.id);
      t.deepEqual(next.stuff.a.foo, thing5.stuff.a.foo);
      t.deepEqual(prev.stuff.a.foo, thing4.stuff.a.foo);
      t.deepEqual(snapshot, thing5);
    }

    if (pass === 6) {
      t.equal(id, thing6.id);
      t.deepEqual(next.stuff.a.foo, thing6.stuff.a.foo);
      t.deepEqual(prev.stuff.a.foo, thing5.stuff.a.foo);
      t.deepEqual(snapshot, thing6);
    }
  });

  hooks.on('change', '*.id', function (coll, next, prev, snapshot) {
    t.ok(true);

    if (pass === 1) {
      t.equal(coll, 'things');
      t.deepEqual(next, thing1);
      t.equal(typeof prev, 'undefined');
      t.deepEqual(snapshot, thing1);
    }

    if (pass === 2) {
      t.equal(coll, 'things');
      t.deepEqual(next.stuff, thing2.stuff);
      t.deepEqual(prev.stuff, thing1.stuff);
      t.deepEqual(snapshot, thing2);
    }

    if (pass === 3) {
      t.equal(coll, 'things');
      t.deepEqual(next.items[0].a, thing3.items[0].a);
      t.deepEqual(prev.items[0].a, thing2.items[0].a);
      t.deepEqual(snapshot, thing3);
    }

    if (pass === 4) {
      t.equal(coll, 'things');
      t.deepEqual(next.items[1], thing4.items[1]);
      t.deepEqual(prev.items[1], thing3.items[1]);
      t.deepEqual(snapshot, thing4);
    }

    if (pass === 5) {
      t.equal(coll, 'things');
      t.deepEqual(next.stuff.a.foo, thing5.stuff.a.foo);
      t.deepEqual(prev.stuff.a.foo, thing4.stuff.a.foo);
      t.deepEqual(snapshot, thing5);
    }

    if (pass === 6) {
      t.equal(coll, 'things');
      t.deepEqual(next.stuff.a.foo, thing6.stuff.a.foo);
      t.deepEqual(prev.stuff.a.foo, thing5.stuff.a.foo);
      t.deepEqual(snapshot, thing6);
    }
  });

  hooks.on('change', 'things.*.stuff', function (id, next, prev, snapshot) {
    t.ok(true);

    if (pass === 1) {
      t.equal(id, thing1.id);
      t.deepEqual(next, thing1.stuff);
      t.equal(typeof prev, 'undefined');
      t.deepEqual(snapshot, thing1);
    }

    if (pass === 2) {
      t.equal(id, thing2.id);
      t.deepEqual(next, thing2.stuff);
      t.deepEqual(prev, thing1.stuff);
      t.deepEqual(snapshot, thing2);
    }

    if (pass === 5) {
      t.equal(id, thing5.id);
      t.deepEqual(next.a.foo, thing5.stuff.a.foo);
      t.deepEqual(prev.a.foo, thing4.stuff.a.foo);
      t.deepEqual(snapshot, thing5);
    }

    if (pass === 6) {
      t.equal(id, thing6.id);
      t.deepEqual(next.a.foo, thing6.stuff.a.foo);
      t.deepEqual(prev.a.foo, thing5.stuff.a.foo);
      t.deepEqual(snapshot, thing6);
    }
  });

  hooks.on('change', 'things.*.stuff.*', function (id, captures, snapshot) {
    t.ok(true);

    if (pass === 1) {
      t.equal(id, thing1.id);
      t.equal(captures[0][0], 'a');
      t.deepEqual(captures[0][1], thing1.stuff.a);
      t.equal(typeof captures[0][2], 'undefined');
      t.equal(captures[1][0], 'b');
      t.deepEqual(captures[1][1], thing1.stuff.b);
      t.equal(typeof captures[1][2], 'undefined');
      t.deepEqual(snapshot, thing1);
    }

    if (pass === 2) {
      t.equal(id, thing2.id);
      t.equal(captures[0][0], 'a');
      t.deepEqual(captures[0][1], thing2.stuff.a);
      t.deepEqual(captures[0][2], thing1.stuff.a);
      t.equal(captures[1][0], 'b');
      t.equal(typeof captures[1][1], 'undefined');
      t.deepEqual(captures[1][2], thing1.stuff.b);
      t.deepEqual(snapshot, thing2);
    }

    if (pass === 5) {
      t.equal(id, thing5.id);
      t.equal(captures[0][0], 'a');
      t.deepEqual(captures[0][1], thing5.stuff.a);
      t.deepEqual(captures[0][2], thing4.stuff.a);
      t.deepEqual(snapshot, thing5);
    }

    if (pass === 6) {
      t.equal(id, thing6.id);
      t.equal(captures[0][0], 'a');
      t.deepEqual(captures[0][1], thing6.stuff.a);
      t.deepEqual(captures[0][2], thing5.stuff.a);
    }
  });

  hooks.on('change', 'things.*.*.*', function (id, captures, snapshot) {
    t.ok(true);

    if (pass === 1) {
      t.equal(id, thing1.id);
      t.equal(captures[0][0], 'stuff');
      t.equal(captures[0][1], 'a');
      t.deepEqual(captures[0][2], thing1.stuff.a);
      t.deepEqual(typeof captures[0][3], 'undefined');
      t.equal(captures[1][0], 'stuff');
      t.equal(captures[1][1], 'b');
      t.deepEqual(captures[1][2], thing1.stuff.b);
      t.deepEqual(typeof captures[1][3], 'undefined');
      t.equal(captures[2][0], 'items');
      t.equal(captures[2][1], '0');
      t.deepEqual(captures[2][2], thing1.items[0]);
      t.deepEqual(typeof captures[2][3], 'undefined');
      t.equal(captures[3][0], 'items');
      t.equal(captures[3][1], '1');
      t.deepEqual(captures[3][2], thing1.items[1]);
      t.deepEqual(typeof captures[3][3], 'undefined');
      t.deepEqual(snapshot, thing1);
    }

    if (pass === 2) {
      t.equal(id, thing2.id);
      t.equal(captures[0][0], 'stuff');
      t.equal(captures[0][1], 'a');
      t.deepEqual(captures[0][2], thing2.stuff.a);
      t.deepEqual(captures[0][3], thing1.stuff.a);
      t.equal(captures[1][0], 'stuff');
      t.equal(captures[1][1], 'b');
      t.deepEqual(captures[1][2], thing2.stuff.b);
      t.deepEqual(captures[1][3], thing1.stuff.b);
      t.deepEqual(snapshot, thing2);
    }

    if (pass === 3) {
      t.equal(id, thing3.id);
      t.equal(captures[0][0], 'items');
      t.equal(captures[0][1], '0');
      t.deepEqual(captures[0][2], thing3.items[0]);
      t.deepEqual(captures[0][3], thing2.items[0]);
      t.deepEqual(snapshot, thing3);
    }

    if (pass === 4) {
      t.equal(id, thing4.id);
      t.deepEqual(snapshot, thing4);
      t.equal(captures[0][0], 'items');
      t.equal(captures[0][1], '1');
      t.deepEqual(captures[0][2], thing4.items[1]);
      t.deepEqual(captures[0][3], thing3.items[1]);
      t.deepEqual(snapshot, thing4);
    }

    if (pass === 5) {
      t.equal(id, thing5.id);
      t.equal(captures[0][0], 'stuff');
      t.equal(captures[0][1], 'a');
      t.deepEqual(captures[0][2], thing5.stuff.a);
      t.deepEqual(captures[0][3], thing4.stuff.a);
      t.deepEqual(snapshot, thing5);
    }

    if (pass === 6) {
      t.equal(id, thing6.id);
      t.equal(captures[0][0], 'stuff');
      t.equal(captures[0][1], 'a');
      t.deepEqual(captures[0][2], thing6.stuff.a);
      t.deepEqual(captures[0][3], thing5.stuff.a);
      t.deepEqual(snapshot, thing6);
    }
  });

  hooks.on('change', 'things.*.items.*.a', function (id, captures) {
    t.ok(true);

    if (pass === 1) {
      t.equal(id, thing1.id);
      t.equal(captures[0][0], '0');
      t.equal(captures[0][1], 1);
      t.equal(typeof captures[0][2], 'undefined');
    }

    if (pass === 3) {
      t.equal(id, thing3.id);
      t.equal(captures[0][0], '0');
      t.equal(captures[0][1], thing3.items[0].a);
      t.equal(captures[0][2], thing2.items[0].a);
    }
  });

  pass = 1;
  model.add('things', thing1, function (err) {
    t.error(err);
    var $thing = model.at('things.id');

    $thing.fetch(function (err) {
      t.error(err);

      async.series([
        function (done) {
          setTimeout(function () {
            pass = 2;
            $thing.setDiffDeep('', thing2, done);
          });
        },
        function (done) {
          setTimeout(function () {
            pass = 3;
            $thing.increment('items.0.a', 2, done);
          });
        },
        function (done) {
          setTimeout(function () {
            pass = 4;
            $thing.set('items.1', {c: 1}, done);
          });
        },
        function (done) {
          setTimeout(function () {
            pass = 5;
            $thing.stringInsert('stuff.a.foo', 1, '++', done);
          });
        },
        function (done) {
          setTimeout(function () {
            pass = 6;
            $thing.stringRemove('stuff.a.foo', 3, 2, done);
          });
        }
      ], function (err) {
        t.error(err);

        model.whenNothingPending(function () {
          model.close();
        });
      });
    });
  });
});
