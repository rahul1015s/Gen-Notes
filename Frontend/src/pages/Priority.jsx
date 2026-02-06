import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import api from '../lib/axios.js';
import DashboardSidebar from '../components/dashboard/Sidebar.jsx';
import DashboardBottomNav from '../components/dashboard/BottomNav.jsx';
import DashboardNotesGrid from '../components/dashboard/NotesGrid.jsx';
import pinService from '../services/pinService.js';

const Priority = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [activePriority, setActivePriority] = useState('all');
  const [appUnlocked, setAppUnlocked] = useState(() => !!sessionStorage.getItem('appUnlocked'));

  useEffect(() => {
    const htmlElement = document.documentElement;
    if (isDark) {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const onFocus = () => setAppUnlocked(!!sessionStorage.getItem('appUnlocked'));
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notesRes, foldersRes] = await Promise.all([
          api.get('/api/v1/notes').catch(() => ({ data: [] })),
          api.get('/api/v1/folders').catch(() => ({ data: [] })),
        ]);
        if (cancelled) return;
        setNotes(notesRes.data || []);
        setFolders(foldersRes.data || []);
      } catch (error) {
        console.error('Error fetching priority data:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const normalizePriority = (value) => (value || 'medium').toString().toLowerCase();

  const privateFolderIds = useMemo(
    () => new Set(folders.filter((f) => f.isPrivate).map((f) => f._id)),
    [folders]
  );

  const visibleNotes = useMemo(() => {
    if (appUnlocked) return notes;
    return notes.filter((n) => !privateFolderIds.has(n.folderId));
  }, [notes, appUnlocked, privateFolderIds]);

  const priorityCounts = useMemo(() => ({
    all: visibleNotes.length,
    high: visibleNotes.filter((n) => normalizePriority(n.priority) === 'high').length,
    medium: visibleNotes.filter((n) => normalizePriority(n.priority) === 'medium').length,
    low: visibleNotes.filter((n) => normalizePriority(n.priority) === 'low').length,
  }), [visibleNotes]);

  const filteredNotes = useMemo(() => {
    if (activePriority === 'all') return visibleNotes;
    return visibleNotes.filter((n) => normalizePriority(n.priority) === activePriority);
  }, [visibleNotes, activePriority]);

  const getFolderForNote = (noteId) => {
    const note = notes.find((n) => n._id === noteId);
    if (!note || !note.folderId) return { name: 'General', color: 'bg-slate-500' };
    const folder = folders.find((f) => f._id === note.folderId);
    if (!folder) return { name: 'General', color: 'bg-slate-500' };
    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'];
    const colorIndex = Math.abs(folder.name.charCodeAt(0)) % colors.length;
    return {
      name: folder.name,
      color: colors[colorIndex],
      _id: folder._id,
    };
  };

  const transformNotes = (list) => list.map((note) => {
    const folder = getFolderForNote(note._id);
    return {
      title: note.title,
      course: {
        name: folder.name,
        color: folder.color,
      },
      isPinned: !!note.isPinned,
      priority: normalizePriority(note.priority),
      description: note.content ? note.content.substring(0, 100) : 'No description',
      tags: note.tags && Array.isArray(note.tags) ? note.tags.map((t) => typeof t === 'string' ? t : t.name) : [],
      createdAt: note.createdAt,
      snippets: 0,
      _id: note._id,
      content: note.content,
    };
  });

  const handlePinNote = async (noteId) => {
    try {
      const updated = await pinService.togglePin(noteId);
      setNotes((prev) => prev.map((n) => (n._id === noteId ? updated : n)));
    } catch (err) {
      console.error('Pin error', err);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await api.delete(`/api/v1/notes/${noteId}`);
      setNotes((prev) => prev.filter((n) => n._id !== noteId));
    } catch (err) {
      console.error('Delete error', err);
    }
  };

  return (
    <div className={cn(
      "flex h-screen transition-colors duration-300",
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900" 
        : "bg-white"
    )}>
      <DashboardSidebar
        totalNotes={visibleNotes.length}
        folders={folders}
        onFolderSelect={(folderId) => navigate(`/all-notes/${folderId}`)}
        onFolderCreated={(newFolder) => setFolders([...folders, newFolder])}
        isDark={isDark}
        notes={visibleNotes}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={cn(
          "sticky top-0 z-40 border-b",
          isDark ? "bg-slate-900/95 border-slate-800 backdrop-blur-sm" : "bg-white/95 border-slate-200 backdrop-blur-sm"
        )}>
          <div className="flex flex-col gap-3 px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>Priority</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsDark((v) => !v)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-xs font-semibold border transition-colors",
                    isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {isDark ? 'Light' : 'Dark'}
                </button>
                <button
                  onClick={() => navigate('/create')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
                    isDark ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-900 text-white hover:bg-slate-800"
                  )}
                >
                  New Note
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { id: 'all', label: 'All', count: priorityCounts.all },
                { id: 'high', label: 'High', count: priorityCounts.high },
                { id: 'medium', label: 'Medium', count: priorityCounts.medium },
                { id: 'low', label: 'Low', count: priorityCounts.low },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setActivePriority(p.id)}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-semibold border transition-colors",
                    activePriority === p.id
                      ? (isDark ? "bg-slate-700 text-white border-slate-600" : "bg-slate-900 text-white border-slate-900")
                      : (isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-100")
                  )}
                >
                  {p.label} ({p.count})
                </button>
              ))}
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-semibold border transition-colors",
                    viewMode === 'grid'
                      ? (isDark ? "bg-slate-700 text-white border-slate-600" : "bg-slate-900 text-white border-slate-900")
                      : (isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-100")
                  )}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-semibold border transition-colors",
                    viewMode === 'list'
                      ? (isDark ? "bg-slate-700 text-white border-slate-600" : "bg-slate-900 text-white border-slate-900")
                      : (isDark ? "border-slate-700 text-slate-300 hover:bg-slate-800" : "border-slate-200 text-slate-700 hover:bg-slate-100")
                  )}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        <main className={cn(
          "flex-1 overflow-y-auto pb-20 lg:pb-6 transition-colors duration-300",
          isDark ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4", isDark ? "border-blue-500" : "border-blue-600")}></div>
                  <p className={cn("", isDark ? "text-slate-400" : "text-slate-600")}>Loading notes...</p>
                </div>
              </div>
            ) : (
              <DashboardNotesGrid
                notes={transformNotes(filteredNotes)}
                viewMode={viewMode}
                onNoteClick={(note) => navigate(`/note/${note._id}`)}
                onPin={(note) => handlePinNote(note._id)}
                onDelete={(note) => handleDeleteNote(note._id)}
                isDark={isDark}
              />
            )}
          </div>
        </main>
      </div>

      <DashboardBottomNav
        activeTab="priority"
        isDark={isDark}
        onNewNote={() => navigate('/create')}
      />
    </div>
  );
};

export default Priority;
