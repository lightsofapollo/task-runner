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

runner.perform(
  require.resolve('myask'), /* module to run: use require.resolve to use npm packages */
  1000, /* timeout in ms */
  { somedata: true }, /* options to pass to task */
  function(err, result) {
    /* result of task */
  }
);
```

## Isolation and error handling

- Your task is run in a totally separate process and has no direct access the
memory in the process where it was started.

- Each task may fail (process dies, on the sync exception, off the
async exception) and it will be handled gracefully and passed to the
task runner.
