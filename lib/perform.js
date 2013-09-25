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

    this.onTaskComplete.apply(this, input.slice(1));
  }
};

/**
 * Use the given module to perform a task.
 * The task is run on a different process (forked)
 *
 * @param {String} module to perform task
 * @param {Object} options for given task
 * @param {Function} callback [Error, Object] result.
 */
function run(module, options, callback) {
  var child = fork(CHILD);
  var perform = new Perform(child);

  child.send([consts.TRIGGER, module, options]);

  perform.once('error', function(err) {
    callback(err);
  });

  perform.once('complete', function(result) {
    callback(null, result);
  });

  return perform;
}

module.exports = run;
