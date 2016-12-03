Object State Storage is a tiny state container written in es6.

It is based on [Redux](https://github.com/reactjs/redux), but has no reducers and actions.
You can also have as many storage units as you want.

Install with `npm install --save object-state-storage` or `yarn add object-state-storage`.

Example:

```javascript
import ObjectStateStorage from 'object-state-storage';
import { merge, clone } from 'object-state-storage';

// create a storage unit with initial value { foo: 'bar' }
const store = new ObjectStateStorage({ foo: 'bar' });

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
console.log(store.state);

// immutable merge, used in setState:
const mergeExample = { foo: 'bar' };
const mergeResult = merge(mergeExample, { bar: 'foo' });

// expect { foo: 'bar' }
console.log(mergeExample);
// expect { foo: 'bar', bar: 'foo' }
console.log(mergeResult);

// clone:
const cloneExample = { foo: 'bar' };
const cloneResult = clone(cloneExample);
cloneExample.bar = 'foo';

// expect { foo: 'bar', bar: 'foo' }
console.log(cloneExample);
// expect { foo: 'bar' }
console.log(cloneResult);

```
