**Object State Storage** is a tiny state container written in es6.

Install with `npm install --save object-state-storage` or `yarn add object-state-storage`. Note that no compiled version is provided. So if you are using webpack and babel, you might want to explicitly include object-state-storage in babel-loader rule.

## API
- `const store = new ObjectStateStorage([initialState: Object])` - create new storage with optional initial state.
- `const unsubscribe = store.subscribe(listener: (currentState, prevState, label) => {})` - subscribe to state changes, returns unsubscribe function. `label` might be useful for debugging.
- `store.setState(modifier: Object or ([currentState]) => Object, [label])` - recursively merges current state and modifier object. If modifier is a function, it might take currentState as an argument and return an Object, that is going to be merged into current state. Merge function can be reused: `import { merge } from 'object-state-storage'`. If modification results in null or undefined, nothing happens and subscribers are not called.
- `store.resetState(newState: Object or ([currentState]) => Object, [label])` - replaces current state with provided newState Object. If newState is a function, it might take currentState as an argument and return an Object, that is going to replace current state. If modification results in null or undefined, nothing happens and subscribers are not called.
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

## Note

I've previously written, that this state container is based on Redux, but without reducers and other related things. After reading comments to [this publication](https://news.ycombinator.com/item?id=15519059) on hacker news I decided that it might be a bit misleading.

This library is not a replacement for Redux, but can be a good alternative if you can live without benefits of message-passing system and you don't want to repeat everything three times, an action type constant, the action type creator function, and the reducer ([reference tweet](https://twitter.com/modernserf/status/884882364379385858)).

More links on understanding Redux:
- [What’s So Great About Redux?](https://medium.freecodecamp.org/whats-so-great-about-redux-ac16f1cc0f8b)
- [Redux Pros, Cons, and Limitations](https://storify.com/acemarke/redux-pros-cons-and-limitations)
- [https://twitter.com/modernserf/status/886426115874717697](https://twitter.com/modernserf/status/886426115874717697)
- [Idiomatic Redux: The Tao of Redux, Part 1 - Implementation and Intent](http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/)
- [Idiomatic Redux: The Tao of Redux, Part 2 - Practice and Philosophy](http://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-2/)

When using object-state-storage with React it's better to put business logic into separate functions (actions) and only modify store state there (to inject those in components, you might want to use something like [components-di](https://github.com/vadirn/components-di)). Actions combine reducers and action creators (redux) into a single function. I guess testing actions might be treated as integration tests, as they are not pure functions and have side-effects.
