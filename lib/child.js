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

var consts = require('./const');
process.on('message', function taskInit(payload) {
  if (Array.isArray(payload) && payload[0] === consts.TRIGGER) {
    runModuleTask(payload[1], payload[2]);
  }
});
