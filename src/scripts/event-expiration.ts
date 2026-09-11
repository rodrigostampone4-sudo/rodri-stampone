const maximumTimeout = 2_147_483_647;

let expirationTimeout: ReturnType<typeof setTimeout> | undefined;

function synchronizeEventVisibility() {
  const eventList = document.querySelector<HTMLOListElement>('[data-events-list]');
  const emptyState = document.querySelector<HTMLElement>('[data-events-empty-state]');

  if (!eventList || !emptyState) {
    return;
  }

  const now = Date.now();
  let nextExpiration = Number.POSITIVE_INFINITY;
  let visibleEventCount = 0;

  for (const eventItem of eventList.querySelectorAll<HTMLElement>('[data-event-expires-at]')) {
    const expirationTime = Number(eventItem.dataset.eventExpiresAt);
    const isActive = Number.isFinite(expirationTime) && now < expirationTime;

    eventItem.hidden = !isActive;

    if (isActive) {
      visibleEventCount += 1;
      nextExpiration = Math.min(nextExpiration, expirationTime);
    }
  }

  eventList.hidden = visibleEventCount === 0;
  emptyState.hidden = visibleEventCount !== 0;

  if (expirationTimeout) {
    clearTimeout(expirationTimeout);
  }

  if (Number.isFinite(nextExpiration)) {
    const delay = Math.min(Math.max(nextExpiration - now + 50, 0), maximumTimeout);
    expirationTimeout = setTimeout(synchronizeEventVisibility, delay);
  }
}

synchronizeEventVisibility();

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    synchronizeEventVisibility();
  }
});
