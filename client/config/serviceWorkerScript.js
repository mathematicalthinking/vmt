addEventListener('message', (messageEvent) => {
  if (messageEvent.data === 'skipWaiting') return skipWaiting();
});
