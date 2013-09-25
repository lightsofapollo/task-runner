'use strict';

/**
 * Keys which error objects may have.
 */
var KEYS = Object.freeze([
  'message',
  'stack',
  'code',
  'name'
]);

/**
 * Converts a given error object into a normal object.
 *
 * @param {Error} error to convert.
 * @return {Object} an object which can be converted to json.
 */
function serialize(error) {
  // null or undefined return
  if (error == null)
    return error;

  var result = {};
  var potentialKeys = Object.keys(error).concat(KEYS);

  potentialKeys.forEach(function(key) {
    if (key in error) {
      result[key] = error[key];
    }
  });

  return result;
}

function deserialize(object) {
  // null or undefined return
  if (object == null)
    return object;

  var error = Object.create(Error.prototype);

  for (var key in object) {
    error[key] = object[key];
  }

  return error;
}

module.exports.serialize = serialize;
module.exports.deserialize = deserialize;
