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
  task(options, function() {
    var args = Array.prototype.slice.call(arguments);
    // we need to handle the err object specially
    var err = Errors.serialize(args.shift());

    // pass all arguments
    process.send([consts.COMPLETE, err].concat(args));
  });
}

// global unhandled exception handler
process.on('uncaughtException', function(err) {
  process.send([consts.COMPLETE, Errors.serialize(err)]);
});

// global message handler which will trigger task on demand
process.on('message', function taskInit(payload) {
  // catch synchronous errors
  try {
    if (Array.isArray(payload) && payload[0] === consts.TRIGGER) {
      process.removeListener('message', taskInit);
      runModuleTask(payload[1], payload[2]);
    }
  } catch (err) {
    process.removeListener('message', taskInit);
    process.send([consts.COMPLETE, Errors.serialize(err)]);
  }
});
