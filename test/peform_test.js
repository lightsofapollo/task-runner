suite('perform', function() {
  var perform = require('../lib/perform'),
      fsPath = require('path');

  function fixture(name) {
    return fsPath.join(__dirname, 'fixtures', name);
  }

  test('result', function(done) {
    var input = { itsAnObject: { inAnObject: true }};

    perform(fixture('success'), input, function(err, result) {
      assert.ok(!err, 'is successful: ' + err);
      assert.deepEqual(input, result, 'mirrors the data over the wire');
      assert.notEqual(input, result, 'is not a reference');
      done();
    });
  });
});
