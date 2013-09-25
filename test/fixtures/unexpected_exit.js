module.exports = function(options, callback) {
  setTimeout(function() {
    process.exit(1);
  }, 10);
}
