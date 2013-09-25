function success(options, callback) {
  process.nextTick(callback.bind(null, null, options));
}

module.exports = success;
