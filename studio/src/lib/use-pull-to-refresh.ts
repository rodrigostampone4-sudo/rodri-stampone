import { useEffect } from 'react';

const PULL_DISTANCE = 120;
const INTERACTIVE_TARGETS =
  'input, select, textarea, nav, [role="navigation"], [contenteditable]:not([contenteditable="false"]), [role="dialog"], [aria-modal="true"]';

function isAtTop(element: Element) {
  for (let current: Element | null = element; current; current = current.parentElement) {
    if (current.scrollTop > 0) {
      return false;
    }
  }

  return true;
}

export function installPullToRefresh(doc: Document, refresh: () => void) {
  let start: { x: number; y: number; target: Element } | null = null;
  let pulling = false;

  const onTouchStart = (event: TouchEvent) => {
    const target = event.target;
    const touch = event.touches[0];
    start = null;
    pulling = false;
    doc.removeEventListener('touchmove', onTouchMove);

    if (
      event.touches.length !== 1 ||
      !(target instanceof Element) ||
      target.closest(INTERACTIVE_TARGETS) ||
      !isAtTop(target)
    ) {
      return;
    }

    start = { x: touch.clientX, y: touch.clientY, target };
    doc.addEventListener('touchmove', onTouchMove, { passive: false });
  };

  const onTouchMove = (event: TouchEvent) => {
    if (event.defaultPrevented || event.touches.length !== 1 || (start && !isAtTop(start.target))) {
      start = null;
      pulling = false;
      doc.removeEventListener('touchmove', onTouchMove);
      return;
    }

    if (!start) {
      return;
    }

    const touch = event.touches[0];
    const downwardDistance = touch.clientY - start.y;
    const sidewaysDistance = Math.abs(touch.clientX - start.x);

    if (!pulling && downwardDistance > 2 && downwardDistance > sidewaysDistance * 2) {
      pulling = true;
    }

    if (pulling && event.cancelable) {
      event.preventDefault();
    }
  };

  const onTouchEnd = (event: TouchEvent) => {
    const gesture = start;
    const wasPulling = pulling;
    start = null;
    pulling = false;
    doc.removeEventListener('touchmove', onTouchMove);

    if (
      !gesture ||
      !wasPulling ||
      event.defaultPrevented ||
      event.changedTouches.length !== 1 ||
      !isAtTop(gesture.target)
    ) {
      return;
    }

    const touch = event.changedTouches[0];
    const downwardDistance = touch.clientY - gesture.y;
    const sidewaysDistance = Math.abs(touch.clientX - gesture.x);

    // Studio panes scroll inside the page, so Chrome may not receive their pull gesture.
    if (downwardDistance >= PULL_DISTANCE && downwardDistance > sidewaysDistance * 2) {
      refresh();
    }
  };

  const onTouchCancel = () => {
    start = null;
    pulling = false;
    doc.removeEventListener('touchmove', onTouchMove);
  };

  doc.addEventListener('touchstart', onTouchStart, { passive: true });
  doc.addEventListener('touchend', onTouchEnd, { passive: true });
  doc.addEventListener('touchcancel', onTouchCancel, { passive: true });

  return () => {
    doc.removeEventListener('touchstart', onTouchStart);
    doc.removeEventListener('touchmove', onTouchMove);
    doc.removeEventListener('touchend', onTouchEnd);
    doc.removeEventListener('touchcancel', onTouchCancel);
  };
}

export function usePullToRefresh() {
  useEffect(() => installPullToRefresh(document, () => window.location.reload()), []);
}
