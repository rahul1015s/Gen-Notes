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
      const syncItems = pendingItems.filter((i) => i.status !== 'conflict');

      if (syncItems.length === 0) {
        setIsSyncing(false);
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const item of syncItems) {
        try {
          if (item.action === 'create') {
            // Create note on server
            const res = await api.post('/api/v1/notes', item.data);
            // Update local copy with server _id
            const created = res.data;
            const offlineNote = await offlineSyncService.getNoteOffline(item.noteId);
            if (offlineNote) {
              await offlineSyncService.deleteNoteOffline(item.noteId);
              await offlineSyncService.saveNoteOffline({ ...offlineNote, ...created, _id: created._id });
            } else {
              await offlineSyncService.saveNoteOffline(created);
            }
            successCount++;
          } else if (item.action === 'update') {
            // Conflict check (if we have a baseUpdatedAt)
            if (item.baseUpdatedAt) {
              const server = await api.get(`/api/v1/notes/${item.noteId}`);
              const serverUpdatedAt = server.data?.updatedAt ? new Date(server.data.updatedAt).getTime() : 0;
              const baseUpdatedAt = new Date(item.baseUpdatedAt).getTime();
              if (serverUpdatedAt > baseUpdatedAt) {
                await offlineSyncService.updateSyncItem(item.id, {
                  status: 'conflict',
                  lastError: 'conflict',
                });
                await offlineSyncService.saveSyncConflict({
                  syncQueueId: item.id,
                  noteId: item.noteId,
                  local: item.data,
                  server: server.data,
                  baseUpdatedAt: item.baseUpdatedAt,
                });
                errorCount++;
                continue;
              }
            }

            // Update note on server
            const res = await api.put(`/api/v1/notes/${item.noteId}`, item.data);
            if (res.data) {
              await offlineSyncService.saveNoteOffline(res.data);
            }
            successCount++;
          } else if (item.action === 'delete') {
            // Delete note on server
            await api.delete(`/api/v1/notes/${item.noteId}`);
            await offlineSyncService.deleteNoteOffline(item.noteId);
            successCount++;
          }

          // Mark as synced
          await offlineSyncService.markAsSynced(item.id);
        } catch (err) {
          console.error('Sync error for item:', item.id, err);
          errorCount++;
          await offlineSyncService.updateSyncItem(item.id, {
            status: 'error',
            retryCount: (item.retryCount || 0) + 1,
            lastError: err?.message || 'sync_failed',
          });
          // Keep the item in sync queue to retry later
        }
      }

      if (successCount > 0) {
        toast.success(`✅ Synced ${successCount} change${successCount !== 1 ? 's' : ''}!`);
        localStorage.setItem('lastSyncAt', new Date().toISOString());
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
