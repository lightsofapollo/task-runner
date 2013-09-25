var fork = require('child_process').fork,
    consts = require('./const');

var CHILD = __dirname + '/child.js';

/**
 * Use the given module to perform a task.
 * The task is run on a different process (forked)
 *
 * @param {String} module to perform task
 * @param {Object} options for given task
 * @param {Function} callback [Error, Object] result.
 */
function perform(module, options, callback) {
  var child = fork(CHILD);

  child.send([consts.TRIGGER, module, options]);
  child.on('message', function taskComplete(payload) {
    if (Array.isArray(payload) && payload[0] === consts.COMPLETE) {
      var err = payload[1],
          result = payload[2];

      callback(err, result);
    }
  });
}

module.exports = perform;
