// Offline Sync Service
// Handles IndexedDB storage and cloud sync

class OfflineSyncService {
  constructor() {
    this.dbName = "NotesAppDB";
    this.version = 1;
    this.db = null;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];

    window.addEventListener("online", () => this.handleOnline());
    window.addEventListener("offline", () => this.handleOffline());
  }

  /**
   * Initialize IndexedDB
   */
  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create Notes store
        if (!db.objectStoreNames.contains("notes")) {
          const notesStore = db.createObjectStore("notes", { keyPath: "_id" });
          notesStore.createIndex("folderId", "folderId", { unique: false });
          notesStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Create Sync Queue store
        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", {
            keyPath: "id",
            autoIncrement: true,
          });
        }

        // Create Tags store
        if (!db.objectStoreNames.contains("tags")) {
          db.createObjectStore("tags", { keyPath: "_id" });
        }

        // Create Folders store
        if (!db.objectStoreNames.contains("folders")) {
          db.createObjectStore("folders", { keyPath: "_id" });
        }
      };
    });
  }

  /**
   * Save note to offline storage
   */
  async saveNoteOffline(note) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["notes"], "readwrite");
      const store = transaction.objectStore("notes");
      const request = store.put(note);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get note from offline storage
   */
  async getNoteOffline(noteId) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["notes"], "readonly");
      const store = transaction.objectStore("notes");
      const request = store.get(noteId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get all notes from offline storage
   */
  async getAllNotesOffline() {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["notes"], "readonly");
      const store = transaction.objectStore("notes");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Delete note from offline storage
   */
  async deleteNoteOffline(noteId) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["notes"], "readwrite");
      const store = transaction.objectStore("notes");
      const request = store.delete(noteId);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Add to sync queue
   */
  async addToSyncQueue(noteId, action, data) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      const request = store.add({
        noteId,
        action, // 'create', 'update', 'delete'
        data,
        timestamp: Date.now(),
        synced: false,
      });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get pending sync items
   */
  async getPendingSyncItems() {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["syncQueue"], "readonly");
      const store = transaction.objectStore("syncQueue");
      const index = store.index("synced");
      const range = IDBKeyRange.only(false);
      const request = index.getAll(range);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Mark sync item as synced
   */
  async markAsSynced(syncId) {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      const getRequest = store.get(syncId);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        item.synced = true;
        const putRequest = store.put(item);

        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve(putRequest.result);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue() {
    if (!this.db) await this.initDB();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(["syncQueue"], "readwrite");
      const store = transaction.objectStore("syncQueue");
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Handle going online
   */
  async handleOnline() {
    this.isOnline = true;
    console.log("App is online - starting sync...");
    // Trigger sync callback
    window.dispatchEvent(
      new CustomEvent("app:online", { detail: { timestamp: Date.now() } })
    );
  }

  /**
   * Handle going offline
   */
  handleOffline() {
    this.isOnline = false;
    console.log("App is offline - operations saved locally");
    window.dispatchEvent(
      new CustomEvent("app:offline", { detail: { timestamp: Date.now() } })
    );
  }

  /**
   * Check if currently online
   */
  getOnlineStatus() {
    return this.isOnline;
  }

  /**
   * Clear all offline data
   */
  async clearAllOfflineData() {
    if (!this.db) await this.initDB();

    return Promise.all([
      this.clearStore("notes"),
      this.clearStore("syncQueue"),
      this.clearStore("tags"),
      this.clearStore("folders"),
    ]);
  }

  /**
   * Clear a specific store
   */
  async clearStore(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export default new OfflineSyncService();
