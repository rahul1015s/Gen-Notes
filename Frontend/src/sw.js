/// <reference lib="webworker" />

import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

const DB_NAME = 'NotesAppDB'
const DB_VERSION = 2

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('notes')) {
        const notesStore = db.createObjectStore('notes', { keyPath: '_id' })
        notesStore.createIndex('folderId', 'folderId', { unique: false })
        notesStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
        syncStore.createIndex('synced', 'synced', { unique: false })
        syncStore.createIndex('status', 'status', { unique: false })
      } else {
        const syncStore = request.transaction.objectStore('syncQueue')
        if (!syncStore.indexNames.contains('synced')) {
          syncStore.createIndex('synced', 'synced', { unique: false })
        }
        if (!syncStore.indexNames.contains('status')) {
          syncStore.createIndex('status', 'status', { unique: false })
        }
      }
      if (!db.objectStoreNames.contains('auth')) {
        db.createObjectStore('auth', { keyPath: 'key' })
      }
      if (!db.objectStoreNames.contains('syncConflicts')) {
        db.createObjectStore('syncConflicts', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

async function getAuthToken() {
  const db = await openDb()
  return new Promise((resolve) => {
    const tx = db.transaction(['auth'], 'readonly')
    const store = tx.objectStore('auth')
    const req = store.get('token')
    req.onsuccess = () => resolve(req.result?.value || null)
    req.onerror = () => resolve(null)
  })
}

async function getPendingSyncItems() {
  const db = await openDb()
  return new Promise((resolve) => {
    const tx = db.transaction(['syncQueue'], 'readonly')
    const store = tx.objectStore('syncQueue')
    const index = store.index('synced')
    const req = index.getAll(IDBKeyRange.only(false))
    req.onsuccess = () => resolve(req.result || [])
    req.onerror = () => resolve([])
  })
}

async function updateSyncItem(id, updates) {
  const db = await openDb()
  return new Promise((resolve) => {
    const tx = db.transaction(['syncQueue'], 'readwrite')
    const store = tx.objectStore('syncQueue')
    const getReq = store.get(id)
    getReq.onsuccess = () => {
      const item = getReq.result
      if (!item) return resolve(null)
      const putReq = store.put({ ...item, ...updates })
      putReq.onsuccess = () => resolve(putReq.result)
      putReq.onerror = () => resolve(null)
    }
    getReq.onerror = () => resolve(null)
  })
}

async function saveSyncConflict(conflict) {
  const db = await openDb()
  return new Promise((resolve) => {
    const tx = db.transaction(['syncConflicts'], 'readwrite')
    const store = tx.objectStore('syncConflicts')
    const req = store.add({ ...conflict, createdAt: Date.now() })
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

async function saveNoteOffline(note) {
  const db = await openDb()
  return new Promise((resolve) => {
    const tx = db.transaction(['notes'], 'readwrite')
    const store = tx.objectStore('notes')
    const req = store.put(note)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

async function deleteNoteOffline(noteId) {
  const db = await openDb()
  return new Promise((resolve) => {
    const tx = db.transaction(['notes'], 'readwrite')
    const store = tx.objectStore('notes')
    const req = store.delete(noteId)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(null)
  })
}

async function replaceNoteId(oldId, newNote) {
  const db = await openDb()
  return new Promise((resolve) => {
    const tx = db.transaction(['notes'], 'readwrite')
    const store = tx.objectStore('notes')
    const getReq = store.get(oldId)
    getReq.onsuccess = () => {
      const existing = getReq.result
      if (existing) {
        store.delete(oldId)
        store.put({ ...existing, ...newNote, _id: newNote._id })
      } else {
        store.put(newNote)
      }
      resolve(true)
    }
    getReq.onerror = () => resolve(false)
  })
}

async function authorizedFetch(url, options = {}) {
  const token = await getAuthToken()
  if (!token) throw new Error('missing_token')
  const headers = new Headers(options.headers || {})
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('Content-Type', 'application/json')
  return fetch(url, { ...options, headers })
}

async function syncQueuedChanges() {
  const items = await getPendingSyncItems()
  const syncItems = items.filter((i) => i.status !== 'conflict')
  if (syncItems.length === 0) return

  for (const item of syncItems) {
    try {
      if (item.action === 'create') {
        const res = await authorizedFetch('/api/v1/notes', {
          method: 'POST',
          body: JSON.stringify(item.data),
        })
        const created = await res.json()
        await replaceNoteId(item.noteId, created)
      } else if (item.action === 'update') {
        if (item.baseUpdatedAt) {
          const serverRes = await authorizedFetch(`/api/v1/notes/${item.noteId}`, { method: 'GET' })
          const server = await serverRes.json()
          const serverUpdatedAt = server?.updatedAt ? new Date(server.updatedAt).getTime() : 0
          const baseUpdatedAt = new Date(item.baseUpdatedAt).getTime()
          if (serverUpdatedAt > baseUpdatedAt) {
            await updateSyncItem(item.id, { status: 'conflict', lastError: 'conflict' })
            await saveSyncConflict({
              syncQueueId: item.id,
              noteId: item.noteId,
              local: item.data,
              server,
              baseUpdatedAt: item.baseUpdatedAt,
            })
            continue
          }
        }
        const res = await authorizedFetch(`/api/v1/notes/${item.noteId}`, {
          method: 'PUT',
          body: JSON.stringify(item.data),
        })
        const updated = await res.json()
        await saveNoteOffline(updated)
      } else if (item.action === 'delete') {
        await authorizedFetch(`/api/v1/notes/${item.noteId}`, { method: 'DELETE' })
        await deleteNoteOffline(item.noteId)
      }

      await updateSyncItem(item.id, { synced: true, status: 'synced', syncedAt: Date.now() })
    } catch (err) {
      await updateSyncItem(item.id, {
        status: 'error',
        retryCount: (item.retryCount || 0) + 1,
        lastError: err?.message || 'sync_failed',
      })
    }
  }
}

// Precache all assets generated by Vite
precacheAndRoute(self.__WB_MANIFEST)

// Cache strategy for API calls - Network First (try network, fallback to cache)
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 3600, // 1 hour
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Cache strategy for images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 2592000, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Cache strategy for fonts - Cache First
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 2592000, // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Cache strategy for CSS and JS - Stale While Revalidate
registerRoute(
  ({ request }) => request.destination === 'style' || request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: 'assets-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Handle offline fallback for HTML pages
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
)

// Message handler for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      cacheNames.forEach((cacheName) => {
        caches.delete(cacheName)
      })
    })
  }

  if (event.data && event.data.type === 'SYNC_NOW') {
    event.waitUntil(syncQueuedChanges())
  }
})

// Push notifications
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Reminder', body: 'You have a reminder.' };
  }

  const title = data.title || 'Reminder';
  const options = {
    body: data.body || 'You have a reminder.',
    icon: '/favicon/web-app-manifest-192x192.png',
    badge: '/favicon/web-app-manifest-192x192.png',
    data: { url: data.url || '/' },
    tag: data.tag || 'reminder',
  };

  if (data.type === 'daily-sync') {
    options.body = options.body || 'Syncing your notes in the background.'
    options.tag = 'daily-sync'
    event.waitUntil(Promise.all([
      self.registration.showNotification('Daily Sync', options),
      syncQueuedChanges(),
    ]))
    return
  }

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification?.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Keep only specific cache versions
          if (!['api-cache', 'images-cache', 'fonts-cache', 'assets-cache', 'pages-cache'].includes(cacheName)) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// One-off background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'notes-sync') {
    event.waitUntil(syncQueuedChanges())
  }
})

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(syncQueuedChanges())
  }
})
