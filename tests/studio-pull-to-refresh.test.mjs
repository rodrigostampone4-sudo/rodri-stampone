import assert from 'node:assert/strict';
import { after, test } from 'node:test';

import { installPullToRefresh } from '../studio/src/lib/pull-to-refresh.ts';

const originalElement = globalThis.Element;

class TestElement {
  constructor(parentElement = null, interactive = false) {
    this.parentElement = parentElement;
    this.interactive = interactive;
    this.scrollTop = 0;
  }

  closest() {
    return this.interactive ? this : null;
  }
}

globalThis.Element = TestElement;
after(() => {
  globalThis.Element = originalElement;
});

function createGestureHarness() {
  const listeners = new Map();
  let refreshes = 0;
  let preventedScrolls = 0;
  const doc = {
    addEventListener(type, listener) {
      listeners.set(type, listener);
    },
    removeEventListener(type, listener) {
      if (listeners.get(type) === listener) listeners.delete(type);
    },
  };
  const remove = installPullToRefresh(doc, () => refreshes++);
  const touch = (x, y) => ({ clientX: x, clientY: y });
  const start = (target, x = 100, y = 100) =>
    listeners.get('touchstart')({ target, touches: [touch(x, y)] });
  const move = (target, x = 100, y = 150) =>
    listeners.get('touchmove')({
      target,
      touches: [touch(x, y)],
      cancelable: true,
      preventDefault() {
        preventedScrolls++;
      },
    });
  const end = (target, x = 100, y = 230) =>
    listeners.get('touchend')({ target, changedTouches: [touch(x, y)] });

  return {
    end,
    move,
    remove,
    start,
    get refreshes() {
      return refreshes;
    },
    get preventedScrolls() {
      return preventedScrolls;
    },
    listeners,
  };
}

test('a downward pull from the top refreshes once and removes its listeners on cleanup', () => {
  const gesture = createGestureHarness();
  const target = new TestElement(new TestElement());

  gesture.start(target);
  gesture.move(target);
  assert.equal(gesture.preventedScrolls, 1);
  gesture.end(target);
  assert.equal(gesture.refreshes, 1);

  gesture.remove();
  assert.equal(gesture.listeners.size, 0);
});

test('short, sideways, input, scrolled, handled, and cancelled gestures do not refresh', () => {
  const gesture = createGestureHarness();
  const target = new TestElement(new TestElement());

  gesture.start(target);
  gesture.end(target, 100, 200);
  gesture.start(target);
  gesture.end(target, 220, 230);
  gesture.start(target);
  gesture.move(target, 100, 90);
  gesture.end(target);
  assert.equal(gesture.preventedScrolls, 0);

  const interactive = new TestElement(null, true);
  gesture.start(interactive);
  gesture.end(interactive);

  target.parentElement.scrollTop = 10;
  gesture.start(target);
  gesture.end(target);
  target.parentElement.scrollTop = 0;

  gesture.start(target);
  target.parentElement.scrollTop = 10;
  gesture.move(target);
  target.parentElement.scrollTop = 0;
  gesture.end(target);

  gesture.start(target);
  gesture.listeners.get('touchcancel')();
  gesture.end(target);

  gesture.start(target);
  gesture.listeners.get('touchmove')({
    target,
    defaultPrevented: true,
    touches: [{ clientX: 100, clientY: 150 }],
  });
  gesture.end(target);

  gesture.start(target);
  gesture.listeners.get('touchstart')({
    target,
    touches: [{ clientX: 100, clientY: 100 }, { clientX: 120, clientY: 100 }],
  });
  gesture.end(target);

  assert.equal(gesture.refreshes, 0);
  gesture.remove();
});
