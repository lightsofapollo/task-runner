var consts = require('./const'),
    Errors = require('./serialize_error');

/**
 * Run the specific module task.
 *
 * @param {String} module to require and run.
 * @param {Object} options for module task.
 */
function runModuleTask(module, options) {
  var task = require(module);
  task(options, function(err, result) {
    process.send([consts.COMPLETE, err, result]);
  });
}

process.on('message', function taskInit(payload) {
  // catch synchronous errors
  try {
    if (Array.isArray(payload) && payload[0] === consts.TRIGGER) {
      runModuleTask(payload[1], payload[2]);
    }
  } catch (err) {
    process.removeListener('message', taskInit);
    process.send([consts.COMPLETE, Errors.serialize(err)]);
  }
});
