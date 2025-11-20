// src/pages/AllNotes.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Search,
  Loader2,
  Plus,
  Menu,
  X,
  Wifi,
  WifiOff,
  FolderPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Navbar from '../components/Navbar.jsx';
import RateLimitedUi from '../components/RateLimitedUi.jsx';
import NoteCard from '../components/NoteCard.jsx';
import NotesnotFound from '../components/NotesnotFound.jsx';
import api from '../lib/axios.js';
import GlobalSearch from '../features/search/Search.jsx';
import FolderTree from '../components/FolderTree.jsx';
import TagManager from '../features/tags/TagManager.jsx';
import offlineSyncService from '../services/offlineSyncService.js';
import foldersService, { FOLDER_ICONS } from '../services/foldersService.js';
import pinService from '../services/pinService.js';

/**
 * AllNotes — Apple-Notes style, fixed left sidebar (desktop) + drawer mobile,
 * cards follow Apple-style look. Uses folderId from URL for folder filtering.
 */
const AllNotes = () => {
  const navigate = useNavigate();
  const { folderId } = useParams(); // URL-driven folder selection

  // UI state
  const [loading, setLoading] = useState(true);
  const [rateLimit, setRateLimit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Data state
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);

  // Folder creation state
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(FOLDER_ICONS[0]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  // Drag & drop
  const [draggedNote, setDraggedNote] = useState(null);

  // Init offline db + listeners
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await offlineSyncService.initDB();
      } catch (err) {
        console.error('Offline DB init failed', err);
      }
    };
    init();

    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      mounted = false;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Fetch notes/folders/tags
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [notesRes, foldersRes, tagsRes] = await Promise.all([
          api.get('/api/v1/notes'),
          api.get('/api/v1/folders').catch(() => ({ data: [] })),
          api.get('/api/v1/tags').catch(() => ({ data: [] })),
        ]);

        if (cancelled) return;

        setNotes(notesRes.data || []);
        setFolders(foldersRes.data || []);
        setTags(tagsRes.data || []);
        setRateLimit(false);

        // save to offline store
        for (const n of notesRes.data || []) {
          await offlineSyncService.saveNoteOffline(n);
        }
      } catch (error) {
        if (error?.response?.status === 429) {
          setRateLimit(true);
        } else {
          console.error('Fetch error', error);
          toast.error('Failed to load data');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => (cancelled = true);
  }, []);

  // Derived lists
  const displayNotes = useMemo(
    () => (folderId ? notes.filter((n) => n.folderId === folderId) : notes),
    [notes, folderId]
  );

  const pinnedNotes = useMemo(() => pinService.getPinnedNotes(displayNotes), [displayNotes]);
  const unpinnedNotes = useMemo(() => pinService.getUnpinnedNotes(displayNotes), [displayNotes]);

  // Drag & drop handlers
  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    // Provide minimal data so Firefox/Chrome allow drag
    try {
      e.dataTransfer.setData('text/plain', note._id);
    } catch (err) {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToFolder = async (targetFolderId) => {
    if (!draggedNote) return;
    try {
      const resp = await api.put(`/api/v1/notes/${draggedNote._id}`, { folderId: targetFolderId });
      const updatedNote = resp.data;
      setNotes((prev) => prev.map((n) => (n._id === updatedNote._id ? updatedNote : n)));
      await offlineSyncService.saveNoteOffline(updatedNote);
      toast.success('Note moved to folder 📂');
      // if URL folder changed and we are viewing that folder, navigation will keep consistent
      // no further action required
    } catch (err) {
      console.error('Move failed', err);
      toast.error(err?.response?.data?.message || 'Failed to move note');
    } finally {
      setDraggedNote(null);
    }
  };

  // Pin toggle
  const handlePinNote = async (noteId) => {
    try {
      const updated = await pinService.togglePin(noteId);
      setNotes((prev) => prev.map((n) => (n._id === noteId ? updated : n)));
      await offlineSyncService.saveNoteOffline(updated);
      toast.success(updated.isPinned ? 'Pinned' : 'Unpinned');
    } catch (err) {
      console.error('Pin error', err);
      toast.error(err?.message || 'Failed to pin note');
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.delete(`/api/v1/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      toast.success('Note deleted');
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete note');
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error('Folder name is required');
      return;
    }
    setIsCreatingFolder(true);
    try {
      const newFolder = await foldersService.createFolder(newFolderName.trim(), null, selectedIcon);
      setFolders((prev) => [...prev, newFolder]);
      setNewFolderName('');
      setSelectedIcon(FOLDER_ICONS[0]);
      setShowFolderModal(false);
      toast.success('Folder created');
    } catch (err) {
      console.error('Create folder failed', err);
      toast.error(err?.message || 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // Create note navigation
  const goCreateNote = () => {
    if (folderId) navigate(`/create?folderId=${folderId}`);
    else navigate('/create');
  };

  // UI: loading / rate limit states
  if (rateLimit) {
    return (
      <div className="min-h-screen bg-base-100">
        <Navbar />
        <RateLimitedUi />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-100/95">
      <Navbar />

      {/* Header */}
      <div className="bg-base-100 sticky top-16 z-40 border-b border-base-300">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              className="btn btn-ghost btn-sm btn-circle lg:hidden"
              onClick={() => setSidebarOpen((s) => !s)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-semibold">{folderId ? `📂 ${folders.find(f => f._id === folderId)?.name || 'Folder'}` : '📚 My Notes'}</h1>
            </div>
          </div>

          <div className="flex gap-3 items-center w-full max-w-2xl">
            <button
              className="btn btn-outline btn-sm gap-2 flex-1 justify-start"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline text-base-content/70">Search notes...</span>
            </button>

            <div className={`badge badge-sm ${isOnline ? 'badge-success' : 'badge-warning'}`}>
              {isOnline ? (
                <div className="flex items-center gap-2"><Wifi className="w-3 h-3" /> <span className="hidden md:inline">Online</span></div>
              ) : (
                <div className="flex items-center gap-2"><WifiOff className="w-3 h-3" /> <span className="hidden md:inline">Offline</span></div>
              )}
            </div>

            <button
              className="btn btn-outline btn-sm gap-2 hidden md:flex"
              onClick={() => setShowFolderModal(true)}
              title="Create folder"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden lg:inline">Folder</span>
            </button>

            <button
              className="btn btn-primary btn-sm gap-2"
              onClick={goCreateNote}
              title="Create new note"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden md:inline">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          {sidebarOpen && (
            <aside className="lg:col-span-1 space-y-4">
              <div className="card bg-base-100 shadow-sm border border-base-300">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold flex items-center gap-2"><span className="text-xl">📁</span> Folders</h3>
                    <span className="badge badge-sm badge-primary">{folders.length}</span>
                  </div>

                  <div className="divider my-2" />

                  <div className="space-y-1">
                    <FolderTree
                      folders={folders}
                      selectedFolder={folderId}
                      onSelectFolder={(id) => {
                        if (!id) navigate('/all-notes');
                        else navigate(`/all-notes/${id}`);
                        // on mobile auto close
                        if (window.innerWidth < 1024) setSidebarOpen(false);
                      }}
                      onDragOver={handleDragOver}
                      onDropToFolder={handleDropToFolder}
                      onDeleteFolder={async (deleteFolderId) => {
                        try {
                          await foldersService.deleteFolder(deleteFolderId);
                          setFolders((prev) => prev.filter((f) => f._id !== deleteFolderId));
                          if (folderId === deleteFolderId) navigate('/all-notes');
                          toast.success('Folder removed');
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to delete folder');
                        }
                      }}
                      onUpdateFolder={async (updateFolderId, newName) => {
                        try {
                          await foldersService.updateFolder(updateFolderId, { name: newName });
                          setFolders((prev) => prev.map((f) => (f._id === updateFolderId ? { ...f, name: newName } : f)));
                          toast.success('Folder updated');
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to update folder');
                        }
                      }}
                      draggedNote={draggedNote}
                    />
                  </div>

                  <div className="divider my-4"></div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">🏷️ Tags</h4>
                    <TagManager tags={tags} onTagsChange={setTags} />
                  </div>
                </div>
              </div>

              {/* Quick mobile CTA */}
              <button className="btn btn-outline btn-block gap-2 lg:hidden" onClick={() => setShowFolderModal(true)}>
                <FolderPlus className="w-4 h-4" /> New Folder
              </button>
            </aside>
          )}

          {/* Content */}
          <section className={sidebarOpen ? 'lg:col-span-3' : 'lg:col-span-4'}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="mt-4 text-base-content/70">Loading your notes...</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Folder header (only when viewing a folder) */}
                {folderId && (
                  <div className="card bg-primary/5 border border-primary/20 shadow-sm">
                    <div className="card-body p-4 lg:p-6 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3"><span className="text-3xl">📂</span> {folders.find(f => f._id === folderId)?.name || 'Folder'}</h2>
                        <p className="text-sm text-base-content/70 mt-1">{displayNotes.length} note{displayNotes.length !== 1 ? 's' : ''} in this folder</p>
                      </div>
                      <div>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/all-notes')}>Clear Filter</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Pinned */}
                {pinnedNotes.length > 0 && (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">📌</span>
                        <h3 className="text-lg font-semibold">Pinned</h3>
                      </div>
                      <div className="badge badge-lg badge-primary">{pinnedNotes.length}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pinnedNotes.map((note) => (
                        <div key={note._id} className="transform transition-transform hover:scale-[1.02]">
                          <NoteCard
                            note={note}
                            setNotes={setNotes}
                            isPinned
                            onPinChange={() => handlePinNote(note._id)}
                            onDelete={() => handleDeleteNote(note._id)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* All Notes */}
                {displayNotes.length > 0 ? (
                  <section className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{folderId ? '📂' : '📝'}</span>
                        <h3 className="text-lg font-semibold">{folderId ? 'Folder Notes' : 'All Notes'}</h3>
                      </div>
                      <div className="badge badge-lg badge-accent">{displayNotes.length}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unpinnedNotes.map((note) => (
                        <div
                          key={note._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, note)}
                          className="transform transition-all hover:scale-[1.02] cursor-grab"
                        >
                          <NoteCard
                            note={note}
                            setNotes={setNotes}
                            isPinned={false}
                            onPinChange={() => handlePinNote(note._id)}
                            onDelete={() => handleDeleteNote(note._id)}
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ) : (
                  <div className="text-center py-20">
                    <NotesnotFound />
                    <div className="mt-6">
                      <button className="btn btn-primary btn-lg gap-2" onClick={goCreateNote}>
                        <Plus className="w-5 h-5" />
                        Create Your First Note
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Search modal */}
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

      {/* Create Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-base-100 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-base-300">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">📁</span>
              <h3 className="text-xl font-semibold">Create Folder</h3>
            </div>

            <div className="form-control mb-4">
              <label className="label"><span className="label-text font-medium">Folder Name</span></label>
              <input
                className="input input-bordered w-full"
                placeholder="My Important Notes"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
              />
            </div>

            <div className="form-control mb-4">
              <label className="label"><span className="label-text font-medium">Choose Icon</span></label>
              <div className="grid grid-cols-6 gap-2">
                {FOLDER_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`btn btn-sm text-2xl ${selectedIcon === icon ? 'btn-primary ring-2 ring-primary ring-offset-1' : 'btn-ghost'}`}
                    onClick={() => setSelectedIcon(icon)}
                    type="button"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-base-300">
              <button className="btn btn-ghost" onClick={() => { setShowFolderModal(false); setNewFolderName(''); setSelectedIcon(FOLDER_ICONS[0]); }} disabled={isCreatingFolder}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateFolder} disabled={isCreatingFolder || !newFolderName.trim()}>
                {isCreatingFolder ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><FolderPlus className="w-4 h-4" /> Create</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating create (mobile) */}
      <button
        className="lg:hidden fixed bottom-6 right-6 btn btn-primary btn-circle shadow-lg z-50 w-14 h-14 text-xl"
        onClick={goCreateNote}
        aria-label="Create note"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default AllNotes;
