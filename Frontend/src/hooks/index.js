// Custom React Hooks for Notes App

import { useState, useEffect, useCallback } from "react";
import offlineSyncService from "../services/offlineSyncService";
import searchService from "../services/searchService";
import { debounce } from "../utils/helpers";

/**
 * Hook for debounced search
 * @param {Array} items - Array of items to search
 * @param {number} delay - Debounce delay in ms
 * @returns {Object} - { query, results, setQuery }
 */
export function useDebounceSearch(items, delay = 200) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const performSearch = useCallback(
    debounce((q) => {
      if (!q.trim()) {
        setResults([]);
        return;
      }
      const searchResults = searchService.searchNotes(items, q);
      setResults(searchResults);
    }, delay),
    [items, delay]
  );

  const handleQueryChange = (q) => {
    setQuery(q);
    performSearch(q);
  };

  return { query, results, setQuery: handleQueryChange };
}

/**
 * Hook for managing online/offline status
 * @returns {boolean} - true if online, false if offline
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

/**
 * Hook for offline note storage
 * @returns {Object} - { saveNoteOffline, getNoteOffline, getAllNotesOffline, deleteNoteOffline }
 */
export function useOfflineNotes() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    offlineSyncService.initDB().then(() => setIsReady(true));
  }, []);

  return {
    isReady,
    saveNoteOffline: offlineSyncService.saveNoteOffline.bind(offlineSyncService),
    getNoteOffline: offlineSyncService.getNoteOffline.bind(offlineSyncService),
    getAllNotesOffline: offlineSyncService.getAllNotesOffline.bind(
      offlineSyncService
    ),
    deleteNoteOffline: offlineSyncService.deleteNoteOffline.bind(
      offlineSyncService
    ),
    addToSyncQueue: offlineSyncService.addToSyncQueue.bind(offlineSyncService),
    getPendingSyncItems: offlineSyncService.getPendingSyncItems.bind(
      offlineSyncService
    ),
  };
}

/**
 * Hook for managing notification permissions
 * @returns {Object} - { canNotify, requestPermission }
 */
export function useNotifications() {
  const [canNotify, setCanNotify] = useState(
    "Notification" in window && Notification.permission === "granted"
  );

  const requestPermission = useCallback(async () => {
    if (!("Notification" in window)) {
      alert("Your browser does not support notifications");
      return false;
    }

    if (Notification.permission === "granted") {
      setCanNotify(true);
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      const granted = permission === "granted";
      setCanNotify(granted);
      return granted;
    }

    return false;
  }, []);

  return { canNotify, requestPermission };
}

/**
 * Hook for managing debounced state updates
 * @param {any} initialValue - Initial state value
 * @param {number} delay - Debounce delay in ms
 * @returns {Array} - [value, debouncedValue, setValue]
 */
export function useDebouncedState(initialValue, delay = 500) {
  const [value, setValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return [value, debouncedValue, setValue];
}

/**
 * Hook for local storage sync
 * @param {string} key - Storage key
 * @param {any} initialValue - Initial value
 * @returns {Array} - [value, setValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

/**
 * Hook for async operations with loading/error states
 * @param {Function} asyncFn - Async function to execute
 * @param {Array} deps - Dependency array
 * @returns {Object} - { data, loading, error, execute }
 */
export function useAsync(asyncFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || "An error occurred");
      throw err;
    } finally {
      setLoading(false);
    }
  }, deps);

  return { data, loading, error, execute };
}

/**
 * Hook for managing previous value
 * @param {any} value - Current value
 * @returns {any} - Previous value
 */
export function usePrevious(value) {
  const ref = useState(undefined)[1];

  useEffect(() => {
    ref.current = value;
  }, [value, ref]);

  return ref.current;
}
