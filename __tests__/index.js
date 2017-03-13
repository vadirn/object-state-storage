import ObjectStateStorage from '../index';

describe('object-state-storage', () => {
  it('stores the initial state', () => {
    const store = new ObjectStateStorage({ hello: 'world!' });

    expect(store.state).toEqual({ hello: 'world!' });
  });

  it('supports multiple subscriptions', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });

    const listenerA = jest.fn();
    const listenerB = jest.fn();

    let unsubscribeA = store.subscribe(listenerA);
    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(1);
    expect(listenerB.mock.calls.length).toBe(0);

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(2);
    expect(listenerB.mock.calls.length).toBe(0);

    const unsubscribeB = store.subscribe(listenerB);
    expect(listenerA.mock.calls.length).toBe(2);
    expect(listenerB.mock.calls.length).toBe(0);

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(1);

    unsubscribeA();
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(1);

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(2);

    unsubscribeB();
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(2);

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(2);

    unsubscribeA = store.subscribe(listenerA);
    expect(listenerA.mock.calls.length).toBe(3);
    expect(listenerB.mock.calls.length).toBe(2);

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(4);
    expect(listenerB.mock.calls.length).toBe(2);
  });

  it('only removes listener once when unsubscribe is called', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });

    const listenerA = jest.fn();
    const listenerB = jest.fn();

    const unsubscribeA = store.subscribe(listenerA);
    store.subscribe(listenerB);

    unsubscribeA();
    unsubscribeA();

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(0);
    expect(listenerB.mock.calls.length).toBe(1);
  });

  it('only removes relevant listener when unsubscribe is called', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });

    const listenerA = jest.fn();

    store.subscribe(listenerA);
    const unsubscribeSecond = store.subscribe(listenerA);

    unsubscribeSecond();
    unsubscribeSecond();

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(1);
  });

  it('supports removing a subscription within a subscription', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });

    const listenerA = jest.fn();
    const listenerB = jest.fn();
    const listenerC = jest.fn();

    store.subscribe(listenerA);
    const unSubB = store.subscribe(() => {
      listenerB();
      unSubB();
    });
    store.subscribe(listenerC);

    store.setState({ foo: 'bar' });
    store.setState({ foo: 'bar' });

    expect(listenerA.mock.calls.length).toBe(2);
    expect(listenerB.mock.calls.length).toBe(1);
    expect(listenerC.mock.calls.length).toBe(2);
  });

  it('delays unsubscribe to the next state mutation', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });
    const unsubscribeHandles = [];
    const doUnsubscribeAll = () => unsubscribeHandles.forEach(unsubscribe => unsubscribe());

    const listenerA = jest.fn();
    const listenerB = jest.fn();
    const listenerC = jest.fn();

    unsubscribeHandles.push(store.subscribe(() => listenerA()));
    unsubscribeHandles.push(
      store.subscribe(() => {
        listenerB();
        doUnsubscribeAll();
      })
    );
    unsubscribeHandles.push(store.subscribe(() => listenerC()));

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(1);
    expect(listenerB.mock.calls.length).toBe(1);
    expect(listenerC.mock.calls.length).toBe(1);

    store.setState({ foo: 'bar' });
    expect(listenerA.mock.calls.length).toBe(1);
    expect(listenerB.mock.calls.length).toBe(1);
    expect(listenerC.mock.calls.length).toBe(1);
  });

  it('delays subscribe to the next state mutation', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();

    let listener3Added = false;
    const maybeAddThirdListener = () => {
      if (!listener3Added) {
        listener3Added = true;
        store.subscribe(() => listener3());
      }
    };

    store.subscribe(() => listener1());
    store.subscribe(() => {
      listener2();
      maybeAddThirdListener();
    });

    store.setState({ foo: 'bar' });
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(1);
    expect(listener3.mock.calls.length).toBe(0);

    store.setState({ foo: 'bar' });
    expect(listener1.mock.calls.length).toBe(2);
    expect(listener2.mock.calls.length).toBe(2);
    expect(listener3.mock.calls.length).toBe(1);
  });

  it('uses the last snapshot of subscribers during nested state mutation', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });

    const listener1 = jest.fn();
    const listener2 = jest.fn();
    const listener3 = jest.fn();
    const listener4 = jest.fn();

    let unsubscribe4;
    const unsubscribe1 = store.subscribe(() => {
      listener1();
      expect(listener1.mock.calls.length).toBe(1);
      expect(listener2.mock.calls.length).toBe(0);
      expect(listener3.mock.calls.length).toBe(0);
      expect(listener4.mock.calls.length).toBe(0);

      unsubscribe1();
      unsubscribe4 = store.subscribe(listener4);
      store.setState({ foo: 'bar' });

      expect(listener1.mock.calls.length).toBe(1);
      expect(listener2.mock.calls.length).toBe(1);
      expect(listener3.mock.calls.length).toBe(1);
      expect(listener4.mock.calls.length).toBe(1);
    });
    store.subscribe(listener2);
    store.subscribe(listener3);

    store.setState({ foo: 'bar' });
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(2);
    expect(listener3.mock.calls.length).toBe(2);
    expect(listener4.mock.calls.length).toBe(1);

    unsubscribe4();
    store.setState({ foo: 'bar' });
    expect(listener1.mock.calls.length).toBe(1);
    expect(listener2.mock.calls.length).toBe(3);
    expect(listener3.mock.calls.length).toBe(3);
    expect(listener4.mock.calls.length).toBe(1);
  });

  it('provides an up-to-date state when a subscriber is notified', done => {
    const store = new ObjectStateStorage({});
    store.subscribe(() => {
      expect(store.state).toEqual({ foo: 'bar' });
      done();
    });
    store.setState({ foo: 'bar' });
  });

  it('handles nested state mutations gracefully', () => {
    const store = new ObjectStateStorage({});

    const unsubscribe = store.subscribe(() => {
      if (store.state.bar !== 'foo') {
        expect(store.state).toEqual({ foo: 'bar' });
      }
      unsubscribe(); // prevent infinite loop
      store.setState({ bar: 'foo' });
    });

    store.setState({ foo: 'bar' });
    expect(store.state).toEqual({
      foo: 'bar',
      bar: 'foo',
    });
  });

  it('provides subscribers with previous and current state', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });

    const state = store.state;
    const unsubscribe = store.subscribe((curState, prevState) => {
      expect(prevState).toEqual(state);
      expect(curState).toEqual(store.state);
      unsubscribe();
    });

    store.setState({ bar: 'foo' });
  });

  it('resetState() replaces the state, instead of updating it', () => {
    const store = new ObjectStateStorage({ foo: 'bar' });
    store.resetState({ bar: 'foo' });
    expect(store.state.foo).toBeUndefined();
    expect(store.state.bar).toEqual('foo');
  });

  it('if value is array, it should be replaced', () => {
    const store = new ObjectStateStorage({
      userData: {
        submitPayload: {
          aZg7gFGB: ['option-1'],
        },
      },
    });
    store.setState({
      userData: {
        submitPayload: {
          aZg7gFGB: ['option-1', 'option-2'],
        },
      },
    });
    expect(store.state).toEqual({
      userData: {
        submitPayload: {
          aZg7gFGB: ['option-1', 'option-2'],
        },
      },
    });
    store.setState({
      userData: {
        submitPayload: {
          aZg7gFGB: ['option-1'],
        },
      },
    });
    expect(store.state).toEqual({
      userData: {
        submitPayload: {
          aZg7gFGB: ['option-1'],
        },
      },
    });
  });

  it('setState can take function as argument', () => {
    const a = {
      a: 'a',
    };
    const b = state => {
      return { b: state.a };
    };
    const store = new ObjectStateStorage(a);

    store.setState(b);

    expect(store.state).toEqual({ a: 'a', b: 'a' });
  });

  it('resetState can take function as argument', () => {
    const a = {
      a: 'a',
    };
    const b = state => {
      return { b: state.a };
    };
    const store = new ObjectStateStorage(a);

    store.resetState(b);

    expect(store.state).toEqual({ b: 'a' });
  });
});
