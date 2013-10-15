function success(options, callback) {
  process.nextTick(callback.bind(null, null, true, options));
}

module.exports = success;
