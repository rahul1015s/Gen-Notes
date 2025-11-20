import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Search,
  Loader2,
  Plus,
  Menu,
  X,
  Wifi,
  WifiOff,
  FolderPlus,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

import RateLimitedUi from '../components/RateLimitedUi.jsx';
import NoteCard from '../components/NoteCard.jsx';
import api from '../lib/axios.js';
import GlobalSearch from '../features/search/Search.jsx';
import TagManager from '../features/tags/TagManager.jsx';
import offlineSyncService from '../services/offlineSyncService.js';
import foldersService, { FOLDER_ICONS } from '../services/foldersService.js';
import pinService from '../services/pinService.js';

const AllNotes = () => {
  const navigate = useNavigate();
  const { folderId } = useParams();

  // UI state
  const [loading, setLoading] = useState(true);
  const [rateLimit, setRateLimit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Data state
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState(null);

  // Folder creation state
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(FOLDER_ICONS[0]);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);

  // Drag & drop
  const [draggedNote, setDraggedNote] = useState(null);
  const [dragOverFolder, setDragOverFolder] = useState(null);

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
  const displayNotes = useMemo(() => {
    let filtered = notes;
    
    // Filter by folder
    if (folderId) {
      filtered = filtered.filter((n) => n.folderId === folderId);
    }
    
    // Filter by tag
    if (selectedTag) {
      filtered = filtered.filter((n) => 
        n.tags && n.tags.some(t => t._id === selectedTag)
      );
    }
    
    return filtered;
  }, [notes, folderId, selectedTag]);

  const pinnedNotes = useMemo(() => pinService.getPinnedNotes(displayNotes), [displayNotes]);
  const unpinnedNotes = useMemo(() => pinService.getUnpinnedNotes(displayNotes), [displayNotes]);

  const currentFolder = useMemo(
    () => folders.find(f => f._id === folderId),
    [folders, folderId]
  );

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    try {
      e.dataTransfer.setData('text/plain', note._id);
    } catch (err) {}
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (fId) => {
    setDragOverFolder(fId);
  };

  const handleDragLeave = () => {
    setDragOverFolder(null);
  };

  const handleDropToFolder = async (targetFolderId) => {
    setDragOverFolder(null);
    if (!draggedNote) return;
    try {
      const resp = await api.put(`/api/v1/notes/${draggedNote._id}`, { folderId: targetFolderId });
      const updatedNote = resp.data;
      setNotes((prev) => prev.map((n) => (n._id === updatedNote._id ? updatedNote : n)));
      await offlineSyncService.saveNoteOffline(updatedNote);
      toast.success('📂 Note moved to folder');
    } catch (err) {
      console.error('Move failed', err);
      toast.error(err?.response?.data?.message || 'Failed to move note');
    } finally {
      setDraggedNote(null);
    }
  };

  const handlePinNote = async (noteId) => {
    try {
      const updated = await pinService.togglePin(noteId);
      setNotes((prev) => prev.map((n) => (n._id === noteId ? updated : n)));
      await offlineSyncService.saveNoteOffline(updated);
      toast.success(updated.isPinned ? '📌 Pinned' : '📌 Unpinned');
    } catch (err) {
      console.error('Pin error', err);
      toast.error('Failed to pin note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/api/v1/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
      toast.success('Note deleted');
    } catch (err) {
      console.error('Delete error', err);
      toast.error('Failed to delete note');
    }
  };

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
      toast.success('✅ Folder created');
    } catch (err) {
      console.error('Create folder failed', err);
      toast.error(err?.message || 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const goCreateNote = () => {
    if (folderId) navigate(`/create?folderId=${folderId}`);
    else navigate('/create');
  };

  // UI: loading / rate limit states
  if (rateLimit) {
    return (
      <div className="min-h-screen bg-base-100">
        <RateLimitedUi />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* Header - Apple Notes Style */}
      <div className="sticky top-16 z-40 bg-base-100/80 backdrop-blur-md border-b border-base-300/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          {/* Title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <button
                className="btn btn-ghost btn-sm btn-circle lg:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">
                  {folderId && currentFolder ? currentFolder.icon + ' ' + currentFolder.name : '📝 GenNotes'}
                </h1>
                {folderId && (
                  <p className="text-xs sm:text-sm text-base-content/60 mt-1">
                    {displayNotes.length} note{displayNotes.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Status Badge */}
            <div className={`badge gap-1 badge-sm ${isOnline ? 'badge-success' : 'badge-warning'}`}>
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3" />
                  <span className="hidden sm:inline">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <button
              className="input input-bordered input-sm flex-1 bg-base-200 hover:bg-base-300 transition cursor-pointer flex items-center gap-2 px-3 text-left"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="w-4 h-4 text-base-content/40" />
              <span className="text-base-content/40 text-sm">Search</span>
            </button>

            {/* Create Buttons */}
            <button
              className="btn btn-outline btn-sm gap-1"
              onClick={() => setShowFolderModal(true)}
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Folder</span>
            </button>

            <button
              className="btn btn-primary btn-sm gap-1"
              onClick={goCreateNote}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar - Apple Style */}
          {sidebarOpen && (
            <aside className="lg:col-span-1 space-y-4">
              {/* Folders Card */}
              <div className="bg-base-100 rounded-2xl border border-base-200/50 overflow-hidden backdrop-blur-sm">
                <div className="p-4">
                  <h3 className="font-semibold text-xs uppercase tracking-widest text-base-content/60 mb-3 flex items-center gap-2">
                    <span>📁</span>
                    <span>Folders</span>
                    {folders.length > 0 && (
                      <span className="ml-auto text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-normal">
                        {folders.length}
                      </span>
                    )}
                  </h3>

                  {/* All Notes Link */}
                  <button
                    onClick={() => navigate('/all-notes')}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition mb-1 font-medium ${
                      !folderId
                        ? 'bg-primary/15 text-primary'
                        : 'text-base-content/80 hover:bg-base-200'
                    }`}
                  >
                    📚 All Notes
                  </button>

                  {/* Folders List */}
                  <div className="space-y-1">
                    {folders.length === 0 ? (
                      <p className="text-xs text-base-content/40 italic py-2 px-3">No folders yet</p>
                    ) : (
                      folders.map(folder => (
                        <button
                          key={folder._id}
                          onClick={() => navigate(`/all-notes/${folder._id}`)}
                          onDragOver={handleDragOver}
                          onDragEnter={() => handleDragEnter(folder._id)}
                          onDragLeave={handleDragLeave}
                          onDrop={() => handleDropToFolder(folder._id)}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center gap-2 ${
                            dragOverFolder === folder._id 
                              ? 'bg-primary/30 border-2 border-primary' 
                              : folderId === folder._id
                              ? 'bg-primary/15 text-primary font-medium'
                              : 'text-base-content/80 hover:bg-base-200'
                          }`}
                        >
                          <span className="text-lg">{folder.icon}</span>
                          <span className="truncate flex-1">{folder.name}</span>
                          <span className="text-xs text-base-content/40 bg-base-200 px-1.5 py-0.5 rounded">
                            {notes.filter(n => n.folderId === folder._id).length}
                          </span>
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setShowFolderModal(true)}
                    className="w-full btn btn-ghost btn-xs gap-1 mt-3 text-xs"
                  >
                    <Plus className="w-3 h-3" />
                    New Folder
                  </button>
                </div>
              </div>

              {/* Tags Card */}
              <div className="bg-base-100 rounded-2xl border border-base-200/50 overflow-hidden backdrop-blur-sm p-4">
                <h3 className="font-semibold text-xs uppercase tracking-widest text-base-content/60 mb-3 flex items-center gap-2">
                  <span>🏷️</span>
                  <span>Tags</span>
                </h3>
                <TagManager 
                  tags={tags} 
                  onTagsChange={setTags}
                  selectedTag={selectedTag}
                  onSelectTag={setSelectedTag}
                />
              </div>
            </aside>
          )}

          {/* Notes Grid */}
          <section className={sidebarOpen ? 'lg:col-span-4' : 'lg:col-span-5'}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                <p className="mt-4 text-base-content/60">Loading notes...</p>
              </div>
            ) : displayNotes.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-6xl mb-4">📝</p>
                <h2 className="text-2xl font-semibold text-base-content mb-2">No notes yet</h2>
                <p className="text-base-content/60 mb-8">
                  {folderId ? 'Create your first note in this folder' : 'Start by creating your first note'}
                </p>
                <button
                  className="btn btn-primary gap-2"
                  onClick={goCreateNote}
                >
                  <Plus className="w-5 h-5" />
                  Create Note
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Pinned Notes */}
                {pinnedNotes.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/60 mb-4 flex items-center gap-2">
                      <span>📌 Pinned</span>
                      <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                        {pinnedNotes.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pinnedNotes.map((note) => (
                        <div
                          key={note._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, note)}
                        >
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
                {unpinnedNotes.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-base-content/60 mb-4 flex items-center gap-2">
                      <span>📄 Notes</span>
                      <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                        {unpinnedNotes.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {unpinnedNotes.map((note) => (
                        <div
                          key={note._id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, note)}
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
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Search Modal */}
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

      {/* Create Folder Modal - Apple Style */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-base-100 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-base-300/50 animate-in zoom-in">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">📁</span>
              New Folder
            </h3>

            {/* Folder Name Input */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-medium text-sm">Folder Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full focus:input-primary"
                placeholder="e.g. Work, Personal, Ideas"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                autoFocus
                disabled={isCreatingFolder}
              />
            </div>

            {/* Icon Selector */}
            <div className="form-control mb-6">
              <label className="label">
                <span className="label-text font-medium text-sm">Choose Icon</span>
              </label>
              <div className="grid grid-cols-6 gap-2">
                {FOLDER_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`btn btn-sm text-2xl transition ${
                      selectedIcon === icon 
                        ? 'btn-primary ring-2 ring-primary ring-offset-2' 
                        : 'btn-ghost'
                    }`}
                    onClick={() => setSelectedIcon(icon)}
                    disabled={isCreatingFolder}
                    type="button"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setShowFolderModal(false);
                  setNewFolderName('');
                  setSelectedIcon(FOLDER_ICONS[0]);
                }}
                disabled={isCreatingFolder}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm gap-2"
                onClick={handleCreateFolder}
                disabled={isCreatingFolder || !newFolderName.trim()}
              >
                {isCreatingFolder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FolderPlus className="w-4 h-4" />
                    Create
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Create Button (Mobile) */}
      <button
        className="lg:hidden fixed bottom-6 right-6 btn btn-primary btn-circle shadow-lg z-50 w-14 h-14 text-xl hover:scale-110 transition-transform"
        onClick={goCreateNote}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default AllNotes;
