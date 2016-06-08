// Extracted from https://github.com/reactjs/redux
// No actions / dispatches / etc.
// Just an object with subscription to its content updates

// ATTENTION: be very careful when updating state from listener. This may lead to infinite recursion
// (maximum call stack size exceeded)

module.exports = function createStorage(initialState) {
  let currentState = initialState;
  let currentListeners = [];
  let nextListeners = currentListeners;

  // create a copy of current listeners (this is actually a snapshot of nextListeners)
  // if nextListeners and currentListeners are the same
  // so that nextListeners mutations do not affect currentListeners
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  function getState() {
    // return current copy of currentState
    return Object.assign({}, currentState);
  }

  // make snapshot of listeners and invoke those
  function setState(state) {
    // create a copy of current state
    const prevState = Object.assign({}, currentState);
    // update current state
    currentState = Object.assign({}, currentState, state);

    // make sure to iterate through copy of currentListeners
    // this makes state mutations work inside subscriptions
    currentListeners = nextListeners;
    const listeners = currentListeners.slice();
    for (let i = 0; i < listeners.length; i++) {
      // callback is provided with prevState and currentState
      listeners[i](prevState, currentState);
    }
  }

  // This is a change listener
  // All subscriptions, that are registered before current 'set()' invokation
  // are called
  // Subscriptions, that are registered during or after current 'set()' invokation
  // will be called with next 'set()'
  function subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      // remove listener only once
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
    };
  }

  return {
    getState,
    setState,
    subscribe,
  };
};
