suite('perform', function() {
  var perform = require('../lib/perform'),
      fsPath = require('path');

  var TIMEOUT = 2000;

  function fixture(name) {
    return fsPath.join(__dirname, 'fixtures', name);
  }

  function assertError(err, message) {
    assert.ok(err instanceof Error, 'is an Error');
    assert.equal(err.message, message, 'error.message');
  }

  test('success', function(done) {
    var input = { itsAnObject: { inAnObject: true }};

    perform(fixture('success'), TIMEOUT, input, function(err, result) {
      assert.ok(!err, 'is successful: ' + err);
      assert.deepEqual(input, result, 'mirrors the data over the wire');
      assert.notEqual(input, result, 'is not a reference');
      done();
    });
  });

  test('sync error (in module)', function(done) {
    perform(fixture('sync_error_load'), TIMEOUT, {}, function(err) {
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
    var isClosed = false;
    var task = perform(fixture('sync_error_run'), TIMEOUT, {}, function(err) {
      assertError(err, 'yyy');
      assert.ok(isClosed, 'process is closed');
      // verify we have a nice stack
      assert.ok(
        err.stack.indexOf('sync_error_run.js:2') !== -1,
        err.stack + ' contains correct filename in stack'
      );
      done();
    });

    task.process.on('close', function() {
      isClosed = true;
    });
  });

  test('async error (passed)', function(done) {
    perform(fixture('async_error_pass'), TIMEOUT, {}, function(err) {
      assertError(err, 'async');
      done();
    });
  });

  test('async error (uncaught)', function(done) {
    var isClosed = false;

    var task = perform(
      fixture('async_error_uncaught'),
      TIMEOUT,
      {},
      function(err) {
        assertError(err, 'uncaught');
        assert.ok(isClosed, 'task process is closed');
        done();
      }
    );

    task.process.on('close', function() {
      isClosed = true;
    });
  });

  test('timeout', function(done) {
    var isClosed;

    var task = perform(
      fixture('timeout'),
      10,
      {},
      function(err) {
        assert.ok(err, 'has error');
        assert.ok(isClosed, 'process has closed');
        assert.ok(
          err.message.indexOf('timeout') !== -1,
          'is a timeout err: ' + err.message
        );
        done();
      }
    );

    task.process.on('close', function() {
      isClosed = true;
    });
  });
});
