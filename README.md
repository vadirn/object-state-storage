Object State Storage is a tiny state container.

It is based on [Redux](https://github.com/reactjs/redux), but has no reducers and actions.
You can also have as many storage units as you want.

Install with `npm install --save object-state-storage` command.

Example:
```javascript

const createStore = require('object-state-storage');

// create a storage unit with initial value { foo: 'bar' } 
const store = createStore({ foo: 'bar' });

// subscribe to store updates
const unsubscribe = store.subscribe((prevState, curState) => {
  // log previous state and current state
  console.log(prevState, curState);
  // unsubscribe
  unsubscribe();
});

// update the state
store.setState({ bar: 'foo' });

// log current state after store was updated
// expect the following object to be in console.log
// {
//   foo: 'bar',
//   bar: 'foo',
// }
console.log(store.getState());

```