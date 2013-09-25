module.exports = function() {
  setTimeout(function() {
    throw new Error('uncaught');
  });
};
