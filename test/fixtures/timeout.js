module.exports = function(options, callback) {
  setTimeout(function() {
    callback();
  }, 100);
};
