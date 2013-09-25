var fork = require('child_process').fork,
    consts = require('./const'),
    Errors = require('./serialize_error'),
    EventEmitter = require('events').EventEmitter;

var CHILD = __dirname + '/child.js';

function Perform(process, timeout) {
  EventEmitter.call(this);

  this.process = process;

  // bind the context of the handlers to this so we can un-subscribe
  // using this.X later on.
  this.onError = this.onError.bind(this);
  this.onMessage = this.onMessage.bind(this);
  this.onUnexpectedClose = this.onUnexpectedClose.bind(this);

  // general process handling
  process.once('error', this.onError);
  process.on('message', this.onMessage);

  // unexpected closures
  process.once('close', this.onUnexpectedClose);

  // timeouts
  if (timeout) {
    this.timeoutId = setTimeout(this.onTimeout.bind(this), timeout);
  }
}

Perform.prototype = {
  __proto__: EventEmitter.prototype,

  onTimeout: function() {
    // clear other handlers of responsibility
    this.process.removeListener('close', this.onUnexpectedClose);
    this.process.removeListener('error', this.onError);
    this.process.removeListener('message', this.onMessage);


    // close process
    this.process.once('close', function() {
      // let the callee know
      this.emit(
        'error',
        new Error('task has timed out')
      );
    }.bind(this));

    this.process.kill();
  },

  onUnexpectedClose: function(status) {
    this.emit(
      'error',
      new Error('process unexpectedly closed with status "' + status + '"')
    );
  },

  onTaskComplete: function(error, result) {
    // de-serialize error
    if (error) {
      this.emit('error', Errors.deserialize(error));
      return;
    }

    this.emit('complete', result);
  },

  onError: function(err) {
    this.emit('error', err);
  },

  onMessage: function(input) {
    // abort in the case we get something other than an error or we
    // somehow get an array with an unknown message.
    if (!Array.isArray(input) || input[0] !== consts.COMPLETE) {
      return;
    }

    // clear other handlers of responsibility
    this.process.removeListener('close', this.onUnexpectedClose);
    clearTimeout(this.timeoutId);

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
  var perform = new Perform(child, timeout);

  function triggerCallback(err, result) {
    // notify callee we are done
    callback(err, result);
  }

  var onError = triggerCallback,
      onComplete = triggerCallback.bind(null, null);

  perform.once('error', onError);
  perform.once('complete', onComplete);

  // start the task in the child process
  child.send([consts.TRIGGER, module, options]);

  return perform;
}

module.exports = run;
