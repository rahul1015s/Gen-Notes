import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Folder, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '../lib/axios.js';
import DashboardSidebar from '../components/dashboard/Sidebar.jsx';
import DashboardBottomNav from '../components/dashboard/BottomNav.jsx';

const Folders = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
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
        console.error('Error fetching folders:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const visibleFolders = useMemo(() => {
    if (appUnlocked) return folders;
    return folders.filter((f) => !f.isPrivate);
  }, [folders, appUnlocked]);

  const privateFolderIds = useMemo(
    () => new Set(folders.filter((f) => f.isPrivate).map((f) => f._id)),
    [folders]
  );

  const visibleNotes = useMemo(() => {
    if (appUnlocked) return notes;
    return notes.filter((n) => !privateFolderIds.has(n.folderId));
  }, [notes, appUnlocked, privateFolderIds]);

  const folderCounts = useMemo(() => {
    const counts = new Map();
    for (const note of visibleNotes) {
      if (!note.folderId) continue;
      counts.set(note.folderId, (counts.get(note.folderId) || 0) + 1);
    }
    return counts;
  }, [visibleNotes]);

  return (
    <div className={cn(
      "flex h-screen transition-colors duration-300",
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900" 
        : "bg-white"
    )}>
      <DashboardSidebar
        totalNotes={visibleNotes.length}
        folders={visibleFolders}
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
          <div className="flex items-center justify-between px-6 py-4">
            <h1 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>Folders</h1>
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

        <main className={cn(
          "flex-1 overflow-y-auto pb-20 lg:pb-6 transition-colors duration-300",
          isDark ? "bg-slate-900" : "bg-white"
        )}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className={cn("animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4", isDark ? "border-blue-500" : "border-blue-600")}></div>
                  <p className={cn("", isDark ? "text-slate-400" : "text-slate-600")}>Loading folders...</p>
                </div>
              </div>
            ) : visibleFolders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="text-5xl mb-4">📁</div>
                <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-slate-200" : "text-slate-800")}>No folders yet</h3>
                <p className={cn("", isDark ? "text-slate-400" : "text-slate-600")}>Create folders to organize your notes</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleFolders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => navigate(`/all-notes/${folder._id}`)}
                    className={cn(
                      "text-left rounded-xl border p-4 transition-all",
                      isDark
                        ? "border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600"
                        : "border-slate-200 bg-slate-100/40 hover:bg-slate-200/60 hover:border-slate-300"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        isDark ? "bg-slate-700/60 text-slate-200" : "bg-slate-200 text-slate-800"
                      )}>
                        <Folder size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className={cn("font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>
                            {folder.name}
                          </h3>
                          {folder.isPrivate && <Lock size={14} className="text-amber-400" />}
                        </div>
                        <p className={cn("text-xs truncate", isDark ? "text-slate-400" : "text-slate-600")}>
                          {folder.description || 'No description'}
                        </p>
                      </div>
                    </div>
                    <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
                      {folderCounts.get(folder._id) || 0} notes
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <DashboardBottomNav
        activeTab="files"
        isDark={isDark}
        onNewNote={() => navigate('/create')}
      />
    </div>
  );
};

export default Folders;
