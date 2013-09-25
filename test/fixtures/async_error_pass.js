module.exports = function(opts, callback) {
  process.nextTick(callback.bind(this, new Error('async')));
};
