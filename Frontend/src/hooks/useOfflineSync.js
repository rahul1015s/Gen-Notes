import { useEffect, useState } from 'react';
import offlineSyncService from '../services/offlineSyncService';
import api from '../lib/axios';
import toast from 'react-hot-toast';

/**
 * Custom hook for handling offline sync operations
 */
export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when coming back online
      syncOfflineChanges();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Sync offline changes with server
   */
  const syncOfflineChanges = async () => {
    if (!isOnline) return;

    setIsSyncing(true);
    try {
      const pendingItems = await offlineSyncService.getPendingSyncItems();

      if (pendingItems.length === 0) {
        setIsSyncing(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const item of pendingItems) {
        try {
          if (item.action === 'create') {
            // Create note on server
            const res = await api.post('/api/v1/notes', item.data);
            // Update local copy with server _id
            const offlineNote = item.data;
            offlineNote._id = res.data._id;
            await offlineSyncService.saveNoteOffline(offlineNote);
            successCount++;
          } else if (item.action === 'update') {
            // Update note on server
            await api.put(`/api/v1/notes/${item.noteId}`, item.data);
            successCount++;
          } else if (item.action === 'delete') {
            // Delete note on server
            await api.delete(`/api/v1/notes/${item.noteId}`);
            successCount++;
          }

          // Mark as synced
          await offlineSyncService.markAsSynced(item.id);
        } catch (err) {
          console.error('Sync error for item:', item.id, err);
          errorCount++;
          // Keep the item in sync queue to retry later
        }
      }

      if (successCount > 0) {
        toast.success(`✅ Synced ${successCount} change${successCount !== 1 ? 's' : ''}!`);
      }
      
      if (errorCount > 0) {
        toast.error(`⚠️ ${errorCount} change${errorCount !== 1 ? 's' : ''} failed to sync. Retry when online.`);
      }
    } catch (err) {
      console.error('Sync failed:', err);
      toast.error('Sync failed. Will retry when online.');
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    isOnline,
    isSyncing,
    syncOfflineChanges,
  };
}

export default useOfflineSync;
