suite('perform', function() {
  var perform = require('../lib/perform'),
      fsPath = require('path');

  function fixture(name) {
    return fsPath.join(__dirname, 'fixtures', name);
  }

  function assertError(err, message) {
    assert.ok(err instanceof Error, 'is an Error');
    assert.equal(err.message, message, 'error.message');
  }

  test('success', function(done) {
    var input = { itsAnObject: { inAnObject: true }};

    perform(fixture('success'), input, function(err, result) {
      assert.ok(!err, 'is successful: ' + err);
      assert.deepEqual(input, result, 'mirrors the data over the wire');
      assert.notEqual(input, result, 'is not a reference');
      done();
    });
  });

  test('sync error (in module)', function(done) {
    perform(fixture('sync_error_load'), {}, function(err) {
      assertError(err, 'xxx');
      // verify we have a nice stack
      assert.ok(
        err.stack.indexOf('sync_error_load.js:1') !== -1,
        err.stack + ' contains correct filename in stack'
      );
      done();
    });
  });

  test('sync error (in run)', function(done) {
    perform(fixture('sync_error_run'), {}, function(err) {
      assertError(err, 'yyy');
      // verify we have a nice stack
      assert.ok(
        err.stack.indexOf('sync_error_run.js:2') !== -1,
        err.stack + ' contains correct filename in stack'
      );
      done();
    });
  });

  test('async error (passed)', function(done) {
    perform(fixture('async_error_pass'), {}, function(err) {
      assertError(err, 'async');
      done();
    });
  });
});
