// utility function, tests if provided item is a key-value object and not an array
export const isObject = item => typeof item === 'object' && item !== null && !Array.isArray(item);

// utility function, clones key-value objects
export const clone = item => {
  if (isObject(item)) {
    return JSON.parse(JSON.stringify(item));
  }
  if (console && console.warn) {
    console.warn('Trying to clone non-object entity, empty object is returned');
  }
  return {};
};

// utility function, recursively merges key-value objects
export const merge = (target, modifier) => {
  if (isObject(modifier)) {
    const runner = (target, modifier) => {
      return Object.keys(modifier).reduce((accum, key) => {
        if (isObject(modifier[key]) && isObject(target[key])) {
          accum[key] = runner(target[key], modifier[key]);
        } else if (modifier[key] !== undefined) {
          accum[key] = modifier[key];
        }
        return accum;
      }, target);
    };
    return runner(clone(target), modifier);
  }
  return clone(target);
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
  setState(modifier, label) {
    // prvious state is passed to listener
    const prevState = this.state;

    if (typeof modifier === 'function') {
      // apply update to currentState
      this._currentState = merge(this._currentState, modifier(prevState));
    } else {
      this._currentState = merge(this._currentState, modifier);
    }

    // update currentListeners
    this._currentListeners = this._nextListeners.slice();
    // iterate through currentListeners
    for (const listener of this._currentListeners) {
      listener(this.state, prevState, label);
    }
  }
  resetState(newState, label) {
    // completely replace state
    const prevState = this.state;

    if (typeof newState === 'function') {
      // apply update to currentState
      this._currentState = clone(newState(prevState));
    } else {
      this._currentState = clone(newState);
    }

    // update currentListeners
    this._currentListeners = this._nextListeners.slice();
    // iterate through currentListeners
    for (const listener of this._currentListeners) {
      listener(this.state, prevState, label);
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
