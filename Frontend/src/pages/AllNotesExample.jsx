// Example: Integration file showing how to use all features together

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import toast from 'react-hot-toast';

// Features
import GlobalSearch from '../features/search/Search';
import FolderTree from '../features/folders/FolderTree';
import TagManager from '../features/tags/TagManager';

// Services
import api from '../lib/axios';
import foldersService from '../services/foldersService';
import tagsService from '../services/tagsService';
import pinService from '../services/pinService';
import remindersService from '../services/remindersService';
import offlineSyncService from '../services/offlineSyncService';

// Hooks
import {
  useDebounceSearch,
  useOnlineStatus,
  useOfflineNotes,
  useNotifications,
} from '../hooks';

/**
 * Example: AllNotes page with all features integrated
 * This is a template showing how to use all advanced features together
 */
export default function AllNotesExample() {
  const navigate = useNavigate();
  const isOnline = useOnlineStatus();
  const { canNotify, requestPermission } = useNotifications();
  const { saveNoteOffline, getAllNotesOffline } = useOfflineNotes();

  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Debounced search
  const { query, results, setQuery } = useDebounceSearch(notes, 200);

  // Initialize
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize offline storage
        await offlineSyncService.initDB();

        // Fetch all data
        const [notesRes, foldersRes, tagsRes] = await Promise.all([
          api.get('/api/v1/notes'),
          api.get('/api/v1/folders'),
          api.get('/api/v1/tags'),
        ]);

        setNotes(notesRes.data);
        setFolders(foldersRes.data);
        setTags(tagsRes.data);

        // Save to offline storage
        for (const note of notesRes.data) {
          await saveNoteOffline(note);
        }

        // Request notification permission
        if (!canNotify) {
          const hasPermission = await requestPermission();
          if (hasPermission) {
            remindersService.sendNotification('Notifications Enabled! 🔔');
          }
        }
      } catch (error) {
        console.error('Error initializing:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle online status change
  useEffect(() => {
    if (isOnline) {
      toast.success('Back online! Syncing...');
      // Implement sync logic here
    } else {
      toast.loading('Working offline - changes will sync when online');
    }
  }, [isOnline]);

  // Filter notes by selected folder
  const displayNotes = selectedFolder
    ? notes.filter((n) => n.folderId === selectedFolder)
    : notes;

  // Get pinned and unpinned notes
  const pinnedNotes = pinService.getPinnedNotes(displayNotes);
  const unpinnedNotes = pinService.getUnpinnedNotes(displayNotes);

  // Search results or filtered notes
  const notesToDisplay = query ? results.map((r) => r.note) : displayNotes;

  const handlePinNote = async (noteId) => {
    try {
      const updated = await pinService.togglePin(noteId);
      setNotes(notes.map((n) => (n._id === noteId ? updated : n)));
      await saveNoteOffline(updated);
      toast.success(
        updated.isPinned ? 'Note pinned!' : 'Note unpinned!'
      );
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;

    try {
      await api.delete(`/api/v1/notes/${noteId}`);
      setNotes(notes.filter((n) => n._id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const handleCreateReminder = async (noteId) => {
    const time = prompt('Enter reminder time (YYYY-MM-DD HH:mm):');
    if (!time) return;

    try {
      await remindersService.createReminder(noteId, 'once', new Date(time));
      toast.success('Reminder set!');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* Header */}
      <header className="bg-base-200 border-b border-base-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="btn btn-ghost btn-circle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold">My Notes</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              className="btn btn-ghost gap-2"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-5 h-5" />
              Search
            </button>

            {/* Online Status Indicator */}
            <div
              className={`badge ${isOnline ? 'badge-success' : 'badge-warning'}`}
            >
              {isOnline ? '🟢 Online' : '🔴 Offline'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-4 gap-8">
        {/* Sidebar */}
        {sidebarOpen && (
          <aside className="col-span-1 space-y-6">
            {/* Folders */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">📁 Folders</h3>
                <FolderTree
                  folders={folders}
                  onSelectFolder={setSelectedFolder}
                  onFoldersChange={setFolders}
                />
              </div>
            </div>

            {/* Tags Manager */}
            <div className="card bg-base-200">
              <div className="card-body">
                <h3 className="card-title text-lg mb-4">🏷️ Tags</h3>
                <TagManager tags={tags} onTagsChange={setTags} />
              </div>
            </div>
          </aside>
        )}

        {/* Main Content Area */}
        <main className={sidebarOpen ? 'col-span-3' : 'col-span-4'}>
          {/* Search Results Info */}
          {query && (
            <div className="mb-6 flex items-center gap-2">
              <span className="text-sm">
                Found {results.length} results for "{query}"
              </span>
              <button
                className="link link-sm"
                onClick={() => setQuery('')}
              >
                Clear
              </button>
            </div>
          )}

          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold mb-4">📌 Pinned Notes ({pinnedNotes.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCardExample
                    key={note._id}
                    note={note}
                    onPin={() => handlePinNote(note._id)}
                    onDelete={() => handleDeleteNote(note._id)}
                    onReminder={() => handleCreateReminder(note._id)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* All Notes Section */}
          <section>
            <h2 className="text-xl font-bold mb-4">
              All Notes ({unpinnedNotes.length})
            </h2>
            {notesToDisplay.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {notesToDisplay.map((note) => (
                  <NoteCardExample
                    key={note._id}
                    note={note}
                    onPin={() => handlePinNote(note._id)}
                    onDelete={() => handleDeleteNote(note._id)}
                    onReminder={() => handleCreateReminder(note._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-base-content/50">
                <p>No notes found</p>
              </div>
            )}
          </section>
        </main>
      </div>

      {/* Global Search Modal */}
      {searchOpen && (
        <GlobalSearch
          notes={notes}
          onSelectNote={(note) => {
            navigate(`/note/${note._id}`);
            setSearchOpen(false);
          }}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}

/**
 * Example Note Card Component
 */
function NoteCardExample({ note, onPin, onDelete, onReminder }) {
  return (
    <div className="card bg-base-200 shadow-md hover:shadow-lg transition">
      <div className="card-body p-4">
        <h3 className="card-title text-lg line-clamp-2">{note.title}</h3>

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.map((tag) => (
              <span key={tag} className="badge badge-sm badge-primary">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Content Preview */}
        <p className="text-sm text-base-content/70 line-clamp-2">
          {note.content.replace(/<[^>]*>/g, '')}
        </p>

        {/* Actions */}
        <div className="card-actions justify-between mt-4">
          <button
            className="btn btn-sm btn-ghost gap-2"
            onClick={onPin}
            title={note.isPinned ? 'Unpin' : 'Pin'}
          >
            {note.isPinned ? '📌' : '📍'}
          </button>

          <div className="flex gap-2">
            <button
              className="btn btn-sm btn-ghost gap-1"
              onClick={onReminder}
              title="Set reminder"
            >
              🔔
            </button>
            <button
              className="btn btn-sm btn-ghost text-error gap-1"
              onClick={onDelete}
              title="Delete"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Timestamp */}
        <div className="text-xs text-base-content/50 mt-2">
          {new Date(note.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
