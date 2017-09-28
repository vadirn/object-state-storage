**Object State Storage** is a tiny state container written in es6.

It is based on [Redux](https://github.com/reactjs/redux), but has no reducers and actions.
You can also have as many storage units as you want.

Install with `npm install --save object-state-storage` or `yarn add object-state-storage`. Note that no compiled version is provided. So if you are using webpack and babel, you might want to explicitly include object-state-storage in babel-loader rule.

## API
- `const store = new ObjectStateStorage([initialState: Object])` - create new storage with optional initial state.
- `const unsubscribe = store.subscribe(listener: (currentState, prevState, label) => {})` - subscribe to state changes, returns unsubscribe function. `label` might be useful for debugging.
- `store.setState(modifier: Object or ([currentState]) => Object, [label])` - recursively merges current state and modifier object. If modifier is a function, it might take currentState as an argument and return an Object, that is going to be merged into current state. Merge function can be reused: `import { merge } from 'object-state-storage'`.
- `store.resetState(newState: Object or ([currentState]) => Object, [label])` - replaces current state with provided newState Object. If newState is a function, it might take currentState as an argument and return an Object, that is going to replace current state.
- `store.state` - returns cloned state. Clone function is available via `import { clone } from 'object-state-storage'`

## Example

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
// expect to see in console { foo: 'bar' } and { foo: 'bar', bar: 'foo' }
store.setState({ bar: 'foo' });

// log current state after store was updated
// expect the following object to be in console.log
// {
//   foo: 'bar',
//   bar: 'foo',
// }
console.log(store.state);

// resets the state (replaces current state and provided object)
store.resetState({ foobar: 'foobar' });

// expect to see { foobar: 'foobar' } in console
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
