task-runner
===========

Task runner framework 

## Defining a task

A task is a single isolated module that exports an object with the
following api:

```js
// this is the "mytask" module
function myTask(options, callback) {
  // in the case of an error you simply invoke the callback with one
  // like in all node operations
  callback(new Error('....'));

  // and in the success case
  callback(null, { someData: true });
}

module.exports = myTask;
```

## Invoking a task

```js
var runner = require('isolated-task-runner');

runner.perform('myask', { somedata: true }, function(err, result) {
  
});
```

## Isolation and error handling

- Your task is run in a totally separate process and has no direct access the
memory in the process where it was started.

- Each task may fail (process dies, on the sync exception, off the
async exception) and it will be handled gracefully and passed to the
task runner.
