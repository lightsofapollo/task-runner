var fork = require('child_process').fork,
    consts = require('./const'),
    Errors = require('./serialize_error'),
    EventEmitter = require('events').EventEmitter;

var CHILD = __dirname + '/child.js';

function Perform(process) {
  EventEmitter.call(this);

  this.process = process;

  process.on('error', this.onError.bind(this));
  process.on('message', this.onMessage.bind(this));
}

Perform.prototype = {
  __proto__: EventEmitter.prototype,

  onTaskComplete: function(error, result) {
    // de-serialize error
    if (error) {
      this.emit('error', Errors.deserialize(error));
      return;
    }

    this.emit('complete', result);
  },

  onError: function() {
  },

  onMessage: function(input) {
    // abort in the case we get something other than an error or we
    // somehow get an array with an unknown message.
    if (!Array.isArray(input) || input[0] !== consts.COMPLETE) {
      return;
    }

    // wait for the task to close before signaling completion
    this.process.once('close', function() {
      this.onTaskComplete.apply(this, input.slice(1));
    }.bind(this));
  }
};

/**
 * Use the given module to perform a task.
 * The task is run on a different process (forked)
 *
 * @param {String} module to perform task
 * @param {Number} timeout for task.
 * @param {Object} options for given task
 * @param {Function} callback [Error, Object] result.
 */
function run(module, timeout, options, callback) {
  var child = fork(CHILD);
  var perform = new Perform(child);

  function triggerCallback(err, result) {
    // don't trigger a timeout
    clearTimeout(timeoutId);

    // notify callee we are done
    callback(err, result);
  }

  var onError = triggerCallback,
      onComplete = triggerCallback.bind(null, null);

  function onTimeout() {
    // cleanup after ourselves
    perform.removeListener('error', onError);
    perform.removeListener('complete', onComplete);

    // close process
    perform.process.once('close', function() {
      // let the callee know
      callback(
        new Error('task "' + module + '" timed out afer "' + timeout + '"ms')
      );
    });
    perform.process.kill();
  }

  var timeoutId = setTimeout(onTimeout, timeout);
  perform.once('error', onError);
  perform.once('complete', onComplete);

  // start the task in the child process
  child.send([consts.TRIGGER, module, options]);

  return perform;
}

module.exports = run;
