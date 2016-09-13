Object State Storage is a tiny state container.

It is based on [Redux](https://github.com/reactjs/redux), but has no reducers and actions.
You can also have as many storage units as you want.

Install with `npm install --save object-state-storage` command.

Example:
```javascript

const { createStorage } = require('object-state-storage');

// create a storage unit with initial value { foo: 'bar' }
const store = createStorage({ foo: 'bar' });

// subscribe to store updates
const unsubscribe = store.subscribe((curState, prevState) => {
  // log previous state and current state
  console.log(curState, prevState);
  // unsubscribe
  unsubscribe();
});

// update the state (merges current state and provided object)
store.setState({ bar: 'foo' });
// resets the state (replaces current state and provided object)
store.resetState({ foobar: 'foobar' });

// log current state after store was updated
// expect the following object to be in console.log
// {
//   foo: 'bar',
//   bar: 'foo',
// }
console.log(store.getState());

```

Extra functions: `const { clone, merge } = require('object-state-storage')`.
