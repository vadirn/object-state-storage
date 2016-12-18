# Changelog

## 2.0.2
- Remove .babelrc and babel-related deps

## 2.0.0
- Use jest for tests
- Rewrite ObjectStateStorage as es6 class
- Breaking changes:
  - `store.getState()` is now `store.state`
  - `const { createStore } = require('object-state-storage')` is now `import ObjectStateStorage from 'object-state-storage'`
  - `const store = createStore({ foo: 'bar' })` is now `const store = new ObjectStateStorage({ foo: 'bar' })`