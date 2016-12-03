// utility function, tests if provided item is a key-value object and not an array
const isObject = item => typeof item === 'object' && item !== null && !Array.isArray(item);


// utility function, clones key-value objects
export const clone = (item) => JSON.parse(JSON.stringify(item));


// utility function, recursively merges key-value objects
export const merge = (to, from) => {
  const result = clone(to);
  const changes = clone(from);

  Object.keys(changes).forEach((key) => {
    const value = changes[key];

    if (isObject(value) && isObject(result[key])) {
      // go deeper if both sides are objects
      result[key] = merge(result[key], changes[key]);
    } else {
      // can set value of the result
      result[key] = changes[key];
    }
  });

  return result;
};


// store with subscriptions
export default class ObjectStateStorage {
  constructor(initialState) {
    this._currentState = initialState;
    this._currentListeners = [];
    this._nextListeners = [];

    // binds
    this.setState = this.setState.bind(this);
    this.resetState = this.resetState.bind(this);
    this.subscribe = this.subscribe.bind(this);
  }
  setState(update) {
    // prvious state is passed to listener
    const prevState = this.state;
    // apply update to currentState
    this._currentState = merge(this._currentState, update);

    // update currentListeners
    this._currentListeners = this._nextListeners.slice();
    // iterate through currentListeners
    for (const listener of this._currentListeners) {
      listener(this.state, prevState);
    }
  }
  resetState(newState) {
    // completely replace state
    const prevState = this.state;
    this._currentState = clone(newState);

    // update currentListeners
    this._currentListeners = this._nextListeners.slice();
    // iterate through currentListeners
    for (const listener of this._currentListeners) {
      listener(this.state, prevState);
    }
  }
  subscribe(listener) {
    if (typeof listener !== 'function') {
      throw new Error('Expected listener to be a function.');
    }

    // flag to prevent multiple unsubscribe calls
    let isSubscribed = true;

    // add listener to the list
    this._nextListeners.push(listener);

    // unsubscribe function
    return () => {
      // remove listener only once
      if (!isSubscribed) {
        return;
      }

      isSubscribed = false;

      // remove listener from the list
      const index = this._nextListeners.indexOf(listener);
      this._nextListeners.splice(index, 1);
    };
  }
  get state() {
    // return copy of currentState
    return clone(this._currentState);
  }
}
