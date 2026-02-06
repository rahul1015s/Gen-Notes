export async function registerOneOffSync(tag = 'notes-sync') {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register(tag);
    return true;
  } catch (err) {
    console.warn('One-off background sync registration failed', err);
    return false;
  }
}

export async function registerPeriodicSync(tag = 'daily-sync', minIntervalMs = 24 * 60 * 60 * 1000) {
  if (!('serviceWorker' in navigator)) return false;
  const registration = await navigator.serviceWorker.ready;
  if (!('periodicSync' in registration)) return false;

  try {
    const status = await navigator.permissions.query({ name: 'periodic-background-sync' });
    if (status.state !== 'granted') return false;

    await registration.periodicSync.register(tag, {
      minInterval: minIntervalMs,
    });
    return true;
  } catch (err) {
    console.warn('Periodic background sync registration failed', err);
    return false;
  }
}
