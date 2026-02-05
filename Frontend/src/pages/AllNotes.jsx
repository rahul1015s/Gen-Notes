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
  Cloud,
  CloudOff,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

import RateLimitedUi from '../components/RateLimitedUi.jsx';
import NoteCard from '../components/NoteCard.jsx';
import DashboardSidebar from '../components/dashboard/Sidebar.jsx';
import DashboardTopBar from '../components/dashboard/TopBar.jsx';
import DashboardBottomNav from '../components/dashboard/BottomNav.jsx';
import DashboardNotesGrid from '../components/dashboard/NotesGrid.jsx';
import TagManager from '../components/TagManager.jsx';
import api from '../lib/axios.js';
import GlobalSearch from '../features/search/Search.jsx';
import offlineSyncService from '../services/offlineSyncService.js';
import foldersService, { FOLDER_ICONS } from '../services/foldersService.js';
import pinService from '../services/pinService.js';
import useOfflineSync from '../hooks/useOfflineSync.js';

const AllNotes = () => {
  const navigate = useNavigate();
  const { folderId } = useParams();
  
  // Offline sync hook
  const { isOnline, isSyncing, syncOfflineChanges } = useOfflineSync();

  // UI state
  const [loading, setLoading] = useState(true);
  const [rateLimit, setRateLimit] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isOnlineStatus, setIsOnlineStatus] = useState(navigator.onLine);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('notes');
  const [isDark, setIsDark] = useState(() => {
    // Load theme from localStorage, default to dark
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

  // Apply theme when isDark changes
  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    // Save preference
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Init offline db + listeners
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        await offlineSyncService.initDB();
        
        // Check for pending syncs
        const pending = await offlineSyncService.getPendingSyncItems();
        if (mounted) {
          setPendingSyncCount(pending.length);
          console.log(`Pending sync items: ${pending.length}`);
        }
      } catch (err) {
        console.error('Offline DB init failed', err);
      }
    };
    init();

    const onOnline = () => {
      setIsOnlineStatus(true);
      // Auto-sync when coming online
      syncOfflineChanges();
      
      // Refresh pending count
      offlineSyncService.getPendingSyncItems().then(pending => {
        if (mounted) setPendingSyncCount(pending.length);
      });
    };
    
    const onOffline = () => setIsOnlineStatus(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      mounted = false;
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [syncOfflineChanges]);

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

        // Cache notes for offline access
        for (const n of notesRes.data || []) {
          await offlineSyncService.saveNoteOffline(n);
        }
      } catch (error) {
        if (error?.response?.status === 429) {
          setRateLimit(true);
        } else {
          console.error('Fetch error', error);
          
          // Try to load from offline storage (works both online and offline)
          try {
            const offlineNotes = await offlineSyncService.getAllNotesOffline();
            if (offlineNotes && offlineNotes.length > 0) {
              setNotes(offlineNotes);
              if (!isOnlineStatus) {
                toast.info(`📖 Showing ${offlineNotes.length} offline notes`);
              } else {
                toast.info('Using cached notes');
              }
            } else {
              // No offline data available
              if (!isOnlineStatus) {
                toast.error('No offline data available. Notes will appear when you go online.');
              } else {
                toast.error('Failed to load data');
              }
            }
          } catch (err) {
            console.error('Failed to load offline notes', err);
            if (!isOnlineStatus) {
              toast.error('No offline data available');
            } else {
              toast.error('Failed to load data');
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchAll();
    return () => (cancelled = true);
  }, [isOnlineStatus]);

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

  // Search handler using MongoDB aggregation pipeline
  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await api.get(`/api/v1/notes/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search notes');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // UI: loading / rate limit states
  if (rateLimit) {
    return (
      <div className="min-h-screen bg-base-100">
        <RateLimitedUi />
      </div>
    );
  }

  // Transform notes for dashboard display
  const getFolderForNote = (noteId) => {
    const note = notes.find(n => n._id === noteId);
    if (!note || !note.folderId) return { name: 'General', color: 'bg-slate-500' };
    
    const folder = folders.find(f => f._id === note.folderId);
    if (!folder) return { name: 'General', color: 'bg-slate-500' };
    
    // Generate color based on folder name
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = Math.abs(folder.name.charCodeAt(0)) % colors.length;
    
    return {
      name: folder.name,
      color: colors[colorIndex],
      _id: folder._id,
    };
  };

  const transformedNotes = displayNotes.map((note) => {
    const folder = getFolderForNote(note._id);
    
    return {
      title: note.title,
      course: {
        name: folder.name,
        color: folder.color,
      },
      priority: note.priority || 'medium',
      description: note.content ? note.content.substring(0, 100) : 'No description',
      tags: note.tags && Array.isArray(note.tags) ? note.tags.map(t => typeof t === 'string' ? t : t.name) : [],
      createdAt: note.createdAt,
      snippets: 0,
      _id: note._id,
    };
  });

  return (
    <div className={cn(
      "flex h-screen transition-colors duration-300",
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900" 
        : "bg-white"
    )}>
      {/* Sidebar - Desktop only */}
      <DashboardSidebar 
        totalNotes={displayNotes.length}
        folders={folders}
        onFolderSelect={(folderId) => navigate(`/all-notes/${folderId}`)}
        onFolderCreated={(newFolder) => {
          setFolders([...folders, newFolder]);
        }}
        isDark={isDark}
        notes={displayNotes}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <DashboardTopBar
          onViewChange={setViewMode}
          isDark={isDark}
          onThemeToggle={() => setIsDark(!isDark)}
          onSearch={handleSearch}
          onNewNote={goCreateNote}
        />

        {/* Content Area */}
        <main className={cn(
          "flex-1 overflow-y-auto pb-20 lg:pb-6 transition-colors duration-300",
          isDark ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className={cn("text-3xl font-bold mb-2", isDark ? "text-white" : "text-slate-900")}>
                  {folderId && currentFolder ? `${currentFolder.icon} ${currentFolder.name}` : 'All Notes'}
                </h2>
                <p className={cn("", isDark ? "text-slate-400" : "text-slate-600")}>{displayNotes.length} notes found</p>
              </div>
              <TagManager 
                isDark={isDark} 
                onTagCreated={(newTag) => {
                  // Tag created, can refresh tags if needed
                  console.log('New tag created:', newTag);
                }}
              />
            </div>

            {/* Notes Grid/List */}
            {loading && !searchQuery ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4", isDark ? "border-blue-500" : "border-blue-600")}></div>
                  <p className={cn("", isDark ? "text-slate-400" : "text-slate-600")}>Loading notes...</p>
                </div>
              </div>
            ) : isSearching ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4", isDark ? "border-blue-500" : "border-blue-600")}></div>
                  <p className={cn("", isDark ? "text-slate-400" : "text-slate-600")}>Searching...</p>
                </div>
              </div>
            ) : (
              <DashboardNotesGrid
                notes={searchQuery ? searchResults : transformedNotes}
                viewMode={viewMode}
                onNoteClick={(note) => navigate(`/note/${note._id}`)}
                isDark={isDark}
              />
            )}
          </div>
        </main>
      </div>

      {/* Bottom Navigation - Mobile only */}
      <DashboardBottomNav
        activeTab={activeTab}
        onNewNote={goCreateNote}
        onTabChange={(tab) => {
          if (tab === 'new') {
            goCreateNote();
          } else if (tab === 'settings') {
            navigate('/settings');
          } else {
            setActiveTab(tab);
          }
        }}
        folders={folders}
        notes={displayNotes}
        isDark={isDark}
        onFolderSelect={(folderId) => navigate(`/all-notes/${folderId}`)}
      />
    </div>
  );
};

export default AllNotes;


