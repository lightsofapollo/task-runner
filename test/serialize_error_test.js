suite('serialize_error', function() {
  var Errors = require('../lib/serialize_error');
  var error;

  suiteSetup(function() {
    var localError = new Error('my error');
    localError.code = 'xxx';
    try {
      throw localError;
    } catch (e) {
      error = e;
    }
  });

  test('#serialize', function() {
    var subject = Errors.serialize(error);
    assert.deepEqual(subject, {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
  });

  test('#serialize given null', function() {
    assert.equal(Errors.serialize(null), null);
  });

  test('#deserialize', function() {
    var subject = Errors.deserialize(Errors.serialize(error));

    assert.ok(subject instanceof Error, 'is an Error object');
    assert.equal(subject.name, error.name, '.name');
    assert.equal(subject.stack, error.stack, '.stack');
    assert.equal(subject.code, error.code, '.code');
    assert.equal(subject.message, error.message, '.message');
  });

  test('#deserialize given null', function() {
    assert.equal(Errors.serialize(null), null);
  });

});
