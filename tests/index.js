const { describe, it } = global;
const chai = require('chai');
const { expect } = chai;
const { spy } = require('sinon');

const { createStorage } = require('../index.js');

describe('object-state-storage', () => {
  it('stores the initial state', () => {
    const store = createStorage({ hello: 'world!' });

    expect(store.getState()).to.deep.equal({ hello: 'world!' });
  });

  it('supports multiple subscriptions', () => {
    const store = createStorage({ foo: 'bar' });

    const listenerA = spy();
    const listenerB = spy();

    let unsubscribeA = store.subscribe(listenerA);
    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(1);
    expect(listenerB.callCount).to.equal(0);

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(2);
    expect(listenerB.callCount).to.equal(0);

    const unsubscribeB = store.subscribe(listenerB);
    expect(listenerA.callCount).to.equal(2);
    expect(listenerB.callCount).to.equal(0);

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(3);
    expect(listenerB.callCount).to.equal(1);

    unsubscribeA();
    expect(listenerA.callCount).to.equal(3);
    expect(listenerB.callCount).to.equal(1);

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(3);
    expect(listenerB.callCount).to.equal(2);

    unsubscribeB();
    expect(listenerA.callCount).to.equal(3);
    expect(listenerB.callCount).to.equal(2);

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(3);
    expect(listenerB.callCount).to.equal(2);

    unsubscribeA = store.subscribe(listenerA);
    expect(listenerA.callCount).to.equal(3);
    expect(listenerB.callCount).to.equal(2);

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(4);
    expect(listenerB.callCount).to.equal(2);
  });

  it('only removes listener once when unsubscribe is called', () => {
    const store = createStorage({ foo: 'bar' });

    const listenerA = spy();
    const listenerB = spy();

    const unsubscribeA = store.subscribe(listenerA);
    store.subscribe(listenerB);

    unsubscribeA();
    unsubscribeA();

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(0);
    expect(listenerB.callCount).to.equal(1);
  });

  it('only removes relevant listener when unsubscribe is called', () => {
    const store = createStorage({ foo: 'bar' });

    const listenerA = spy();

    store.subscribe(listenerA);
    const unsubscribeSecond = store.subscribe(listenerA);

    unsubscribeSecond();
    unsubscribeSecond();

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(1);
  });

  it('supports removing a subscription within a subscription', () => {
    const store = createStorage({ foo: 'bar' });

    const listenerA = spy();
    const listenerB = spy();
    const listenerC = spy();

    store.subscribe(listenerA);
    const unSubB = store.subscribe(() => {
      listenerB();
      unSubB();
    });
    store.subscribe(listenerC);

    store.setState({ foo: 'bar' });
    store.setState({ foo: 'bar' });

    expect(listenerA.callCount).to.equal(2);
    expect(listenerB.callCount).to.equal(1);
    expect(listenerC.callCount).to.equal(2);
  });

  it('delays unsubscribe to the next state mutation', () => {
    const store = createStorage({ foo: 'bar' });
    const unsubscribeHandles = [];
    const doUnsubscribeAll = () => unsubscribeHandles.forEach(
      unsubscribe => unsubscribe()
    );

    const listenerA = spy();
    const listenerB = spy();
    const listenerC = spy();

    unsubscribeHandles.push(store.subscribe(() => listenerA()));
    unsubscribeHandles.push(store.subscribe(() => {
      listenerB();
      doUnsubscribeAll();
    }));
    unsubscribeHandles.push(store.subscribe(() => listenerC()));

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(1);
    expect(listenerB.callCount).to.equal(1);
    expect(listenerC.callCount).to.equal(1);

    store.setState({ foo: 'bar' });
    expect(listenerA.callCount).to.equal(1);
    expect(listenerB.callCount).to.equal(1);
    expect(listenerC.callCount).to.equal(1);
  });

  it('delays subscribe to the next state mutation', () => {
    const store = createStorage({ foo: 'bar' });

    const listener1 = spy();
    const listener2 = spy();
    const listener3 = spy();

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
    expect(listener1.callCount).to.equal(1);
    expect(listener2.callCount).to.equal(1);
    expect(listener3.callCount).to.equal(0);

    store.setState({ foo: 'bar' });
    expect(listener1.callCount).to.equal(2);
    expect(listener2.callCount).to.equal(2);
    expect(listener3.callCount).to.equal(1);
  });

  it('uses the last snapshot of subscribers during nested state mutation', () => {
    const store = createStorage({ foo: 'bar' });

    const listener1 = spy();
    const listener2 = spy();
    const listener3 = spy();
    const listener4 = spy();

    let unsubscribe4;
    const unsubscribe1 = store.subscribe(() => {
      listener1();
      expect(listener1.callCount).to.equal(1);
      expect(listener2.callCount).to.equal(0);
      expect(listener3.callCount).to.equal(0);
      expect(listener4.callCount).to.equal(0);

      unsubscribe1();
      unsubscribe4 = store.subscribe(listener4);
      store.setState({ foo: 'bar' });

      expect(listener1.callCount).to.equal(1);
      expect(listener2.callCount).to.equal(1);
      expect(listener3.callCount).to.equal(1);
      expect(listener4.callCount).to.equal(1);
    });
    store.subscribe(listener2);
    store.subscribe(listener3);

    store.setState({ foo: 'bar' });
    expect(listener1.callCount).to.equal(1);
    expect(listener2.callCount).to.equal(2);
    expect(listener3.callCount).to.equal(2);
    expect(listener4.callCount).to.equal(1);

    unsubscribe4();
    store.setState({ foo: 'bar' });
    expect(listener1.callCount).to.equal(1);
    expect(listener2.callCount).to.equal(3);
    expect(listener3.callCount).to.equal(3);
    expect(listener4.callCount).to.equal(1);
  });

  it('provides an up-to-date state when a subscriber is notified', done => {
    const store = createStorage({});
    store.subscribe(() => {
      expect(store.getState()).to.deep.equal({ foo: 'bar' });
      done();
    });
    store.setState({ foo: 'bar' });
  });

  it('handles nested state mutations gracefully', () => {
    const store = createStorage({});

    const unsubscribe = store.subscribe(() => {
      if (store.getState().bar !== 'foo') {
        expect(store.getState()).to.deep.equal({ foo: 'bar' });
      }
      unsubscribe(); // prevent infinite loop
      store.setState({ bar: 'foo' });
    });

    store.setState({ foo: 'bar' });
    expect(store.getState()).to.deep.equal({
      foo: 'bar',
      bar: 'foo',
    });
  });

  it('provides subscribers with previous and current state', () => {
    const store = createStorage({ foo: 'bar' });

    const state = store.getState();
    const unsubscribe = store.subscribe((curState, prevState) => {
      expect(prevState).to.deep.equal(state);
      expect(curState).to.deep.equal(store.getState());
      unsubscribe();
    });

    store.setState({ bar: 'foo' });
  });

  it('resetState() replaces the state, instead of updating it', () => {
    const store = createStorage({ foo: 'bar' });
    store.resetState({ bar: 'foo' });
    expect(store.getState().foo).to.be.an('undefined');
    expect(store.getState().bar).to.equal('foo');
  });
});
