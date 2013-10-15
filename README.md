task-runner
===========

Task runner framework 

## Defining a task

A task is a single isolated module that exports an object with the
following api:

```js
// this is the "mytask" module
function myTask(options, callback) {
  // in the case of a non-deterministic error you simply
  // invoke the callback with one like in all node operations
  callback(new Error('....'));

  // and in the success case
  callback(null, outcome, { someData: true });
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
  function(err, outcome, result) {
    /* result of task */
  }
);
```

The callback takes a standard node-style error object, a `boolean` and an
`Object`.  The error object is a standard node error callback object. The
`boolean` contains the outcome of the task.  A `true` value means that the
operation completely succeeded.  A `false` value means that the operation
failed and should be retried.  The `Object` contains information relevant
to status and reporting.  The task running system will not make any choices
based on the contents of this `Object`.

## Isolation and error handling

- Your task is run in a totally separate process and has no direct access the
memory in the process where it was started.

- Each task may fail (process dies, on the sync exception, off the
async exception) and it will be handled gracefully and passed to the
task runner.

- Tasks should only generate errors when they fail non-deterministically.
Deterministic failures should be noted by having an outcome of `false`.
An api call that fails because the connection died should generate an
error, where trying to comment on a bug that doesn't exist should have
a `false` outcome
