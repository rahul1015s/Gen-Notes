import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2Icon, PenSquareIcon, SaveIcon, XIcon, ShareIcon, Wifi, WifiOff, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/utils.js';
import api from '../lib/axios.js';
import offlineSyncService from '../services/offlineSyncService.js';
import { formatDate } from '../lib/utils.js';
import RichTextEditor from '../components/TiptapEditor.jsx';
import NoteLockSettings from '../components/NoteLockSettings.jsx';
import ReminderManager from '../components/ReminderManager.jsx';
import PinLockModal from '../components/PinLockModal.jsx';
import ClockWidget from '../components/ClockWidget.jsx';
import DOMPurify from 'dompurify';

const NotedetailPage = () => {
  const [note, setNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lockType, setLockType] = useState('PIN');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showOverviewMobile, setShowOverviewMobile] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved ? saved === 'dark' : true;
    }
    return true;
  });

  const navigate = useNavigate();
  const { id } = useParams();

  const tasksSummary = useMemo(() => {
    const tasks = Array.isArray(note.tasks) ? note.tasks : [];
    const count = (list) =>
      list.reduce((acc, t) => acc + 1 + count(t.children || []), 0);
    const completed = (list) =>
      list.reduce((acc, t) => acc + (t.completed ? 1 : 0) + completed(t.children || []), 0);
    const total = count(tasks);
    const done = completed(tasks);
    return {
      total,
      done,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
      tasks,
    };
  }, [note.tasks]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for theme changes from other tabs/components
    const handleStorageChange = (e) => {
      if (e.key === 'theme') {
        setIsDark(e.newValue === 'dark');
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Apply theme class for DaisyUI components inside this page
  useEffect(() => {
    const htmlElement = document.documentElement;
    htmlElement.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/api/v1/notes/${id}`);
        setNote(res.data);
        
        // Cache for offline access
        await offlineSyncService.saveNoteOffline(res.data);
        
        // Check if note is locked
        try {
          const lockRes = await api.get(`/api/v1/locks/${id}`);
          if (lockRes.data.isLocked) {
            setIsLocked(true);
            if (lockRes.data.lockType) setLockType(lockRes.data.lockType);
            setShowPinModal(true);
          }
        } catch (err) {
          // No lock found
        }
      } catch (error) {
        console.error('Fetch error:', error);
        
        // Try to load from offline storage
        try {
          const offlineNote = await offlineSyncService.getNoteOffline(id);
          if (offlineNote) {
            setNote(offlineNote);
            toast.info('Showing offline copy of note');
          } else {
            toast.error("Failed to load note");
            navigate('/all-notes');
          }
        } catch (err) {
          console.error('Offline fallback failed:', err);
          toast.error("Failed to load note");
          navigate('/all-notes');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/notes/${id}`);
      toast.success("Note deleted");
      navigate('/all-notes');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    }
  };

  const handleSave = async () => {
    if (!note.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    if (!textContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        title: note.title.trim(),
        content: note.content
      };

      if (isOnline) {
        // Update on server
        await api.put(`/api/v1/notes/${id}`, updateData);
        
        // Update offline copy
        await offlineSyncService.saveNoteOffline({
          ...note,
          ...updateData,
          updatedAt: new Date()
        });
      } else {
        // Save to offline storage
        await offlineSyncService.saveNoteOffline({
          ...note,
          ...updateData,
          updatedAt: new Date()
        });
        
        // Add to sync queue
        await offlineSyncService.addToSyncQueue(id, 'update', updateData, { baseUpdatedAt: note.updatedAt });
        
        toast.success("📝 Changes saved offline!");
        setIsEditing(false);
        return;
      }
      
      toast.success("Note updated ✅");
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);
      
      // If offline, save locally anyway
      if (!isOnline) {
        try {
          await offlineSyncService.saveNoteOffline({
            ...note,
            title: note.title.trim(),
            content: note.content,
            updatedAt: new Date()
          });
          
          const updateData = {
            title: note.title.trim(),
            content: note.content
          };
          await offlineSyncService.addToSyncQueue(id, 'update', updateData, { baseUpdatedAt: note.updatedAt });
          
          toast.success("📝 Changes saved offline!");
          setIsEditing(false);
          return;
        } catch (err) {
          console.error('Offline save failed:', err);
        }
      }
      
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!note || !note._id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base-content/60">Note not found</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      isDark 
        ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white"
        : "bg-white text-slate-900"
    )}>
      {/* PIN Lock Modal */}
      <PinLockModal
        noteId={id}
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onUnlocked={() => {
          setIsLocked(false);
          setShowPinModal(false);
        }}
        lockType={lockType}
      />

      {/* Header */}
      <header className={cn(
        "sticky top-0 z-40 border-b transition-colors duration-300 backdrop-blur-md",
        isDark
          ? "bg-slate-900/95 border-slate-800/50"
          : "bg-white/95 border-slate-200"
      )}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back Button */}
            <Link 
              to="/all-notes" 
              className={cn(
                "inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 group",
                isDark
                  ? "bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-600 hover:text-slate-900"
              )}
              title="Go back to notes"
            >
              <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
            </Link>

            {/* Center: Title (Mobile Hidden) */}
            <div className="hidden sm:flex flex-1 items-center gap-3">
              <div className="flex-1 min-w-0">
                <h1 className={cn("text-lg font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>{note.title || 'Untitled'}</h1>
              </div>
            </div>

            {/* Right: Status & Actions */}
            <div className="flex items-center gap-3">
              {/* Status Badge */}
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                isOnline 
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              }`}>
                {isOnline ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    Online
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    Offline
                  </>
                )}
              </div>

              {/* Action Buttons */}
              {!isEditing && (
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
                    onClick={() => setIsEditing(true)}
                    title="Edit note"
                  >
                    <PenSquareIcon size={20} />
                  </button>
                  <button
                    className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-all duration-200"
                    onClick={() => setShowDeleteModal(true)}
                    title="Delete note"
                  >
                    <Trash2Icon size={20} />
                  </button>
                </div>
              )}

              {!isEditing && (
                <div className="sm:hidden relative">
                  <button
                    className={cn(
                      "inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                      isDark
                        ? "bg-slate-800/50 hover:bg-slate-700 text-slate-300"
                        : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                    )}
                    onClick={() => setShowActionMenu((v) => !v)}
                    title="Actions"
                  >
                    <MoreVertical size={18} />
                  </button>
                  {showActionMenu && (
                    <div className={cn(
                      "absolute right-0 mt-2 w-40 rounded-xl border shadow-lg z-50 overflow-hidden",
                      isDark ? "bg-slate-800 border-slate-700/50" : "bg-white border-slate-200"
                    )}>
                      <button
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm",
                          isDark ? "text-slate-200 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                        )}
                        onClick={() => {
                          setIsEditing(true);
                          setShowActionMenu(false);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        className={cn(
                          "w-full px-4 py-2 text-left text-sm",
                          isDark ? "text-red-400 hover:bg-slate-700" : "text-red-600 hover:bg-slate-100"
                        )}
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActionMenu(false);
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {isEditing ? (
          /* Edit Mode - Full Width Editor */
          <div className="space-y-6">
            {/* Edit Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className={cn("text-2xl font-bold mb-1", isDark ? "text-white" : "text-slate-900")}>Editing Note</h2>
                <p className={cn("text-sm", isDark ? "text-slate-400" : "text-slate-600")}>Make changes to your note below</p>
              </div>
              <button
                className={cn(
                  "inline-flex items-center justify-center w-10 h-10 rounded-lg transition-all",
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800/50"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                )}
                onClick={() => setIsEditing(false)}
                disabled={saving}
                title="Close editor"
              >
                <XIcon size={24} />
              </button>
            </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className={cn("block text-sm font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Note Title</label>
              <input
                type="text"
                className={cn(
                  "w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all",
                  isDark
                    ? "bg-slate-800/50 border border-slate-700/50 text-white placeholder-slate-500 focus:ring-blue-500/40 focus:border-blue-500/40"
                    : "bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400 focus:ring-blue-500/40 focus:border-blue-500/40"
                )}
                value={note.title}
                onChange={(e) => setNote({ ...note, title: e.target.value })}
                placeholder="Enter note title"
                autoFocus
                disabled={saving}
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <label className={cn("block text-sm font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Content</label>
              <div className={cn("border rounded-lg overflow-hidden", isDark ? "border-slate-700/50 bg-slate-800/30" : "border-slate-300 bg-slate-50")}>
                <RichTextEditor
                  value={note.content}
                  onChange={(html) => setNote({ ...note, content: html })}
                  height="500px"
                />
              </div>
            </div>

            {/* Save Actions */}
            <div className={cn("flex justify-end gap-3 pt-6 border-t", isDark ? "border-slate-700/30" : "border-slate-200")}>
              <button
                className={cn(
                  "px-6 py-2.5 rounded-lg transition-colors font-medium",
                  isDark
                    ? "text-slate-300 hover:text-white hover:bg-slate-800/50"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                )}
                onClick={() => setIsEditing(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200 disabled:opacity-50 hover:shadow-lg hover:shadow-blue-500/20"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <SaveIcon size={18} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* View Mode - Professional Layout */
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-8">
            <div className="space-y-8">
              {/* Title Section */}
              <div className="space-y-4">
                <h1 className={cn("text-2xl sm:text-4xl md:text-5xl font-bold leading-tight", isDark ? "text-white" : "text-slate-900")}>
                  {note.title}
                </h1>
                
                {/* Meta Information */}
                <div className={cn("flex flex-wrap items-center gap-6 text-sm", isDark ? "text-slate-400" : "text-slate-600")}>
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg", isDark ? "bg-slate-800/50" : "bg-slate-200")}>
                      <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <p className={cn("text-xs uppercase tracking-wider", isDark ? "text-slate-500" : "text-slate-500")}>Created</p>
                      <p className={cn("font-medium", isDark ? "text-slate-300" : "text-slate-700")} title={new Date(note.createdAt).toLocaleString()}>
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  </div>

                  {note.updatedAt !== note.createdAt && (
                    <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-lg", isDark ? "bg-slate-800/50" : "bg-slate-200")}>
                        <span className="text-lg">✏️</span>
                      </div>
                      <div>
                        <p className={cn("text-xs uppercase tracking-wider", isDark ? "text-slate-500" : "text-slate-500")}>Updated</p>
                        <p className={cn("font-medium", isDark ? "text-slate-300" : "text-slate-700")} title={new Date(note.updatedAt).toLocaleString()}>
                          {formatDate(note.updatedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Divider */}
              <div className={cn("h-px bg-gradient-to-r", isDark ? "from-slate-700/50 via-slate-700/20 to-transparent" : "from-slate-300/50 via-slate-300/20 to-transparent")}></div>

              {/* Mobile Overview */}
              <div className="lg:hidden">
                <button
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium",
                    isDark ? "bg-slate-800/50 border-slate-700/50 text-slate-200" : "bg-white border-slate-200 text-slate-700"
                  )}
                  onClick={() => setShowOverviewMobile((v) => !v)}
                >
                  Overview
                  <span>{showOverviewMobile ? "▲" : "▼"}</span>
                </button>
                {showOverviewMobile && (
                  <div className={cn("mt-3 rounded-xl border p-4 space-y-3", isDark ? "bg-slate-800/30 border-slate-700/50" : "bg-white border-slate-200")}>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn(isDark ? "text-slate-400" : "text-slate-600")}>Status</span>
                      <span className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-800")}>{isOnline ? "Online" : "Offline"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className={cn(isDark ? "text-slate-400" : "text-slate-600")}>Tasks</span>
                      <span className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-800")}>{tasksSummary.done}/{tasksSummary.total}</span>
                    </div>
                    <div>
                      <div className="h-2 w-full bg-slate-200/60 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: `${tasksSummary.percent}%` }} />
                      </div>
                      <div className={cn("mt-2 text-xs", isDark ? "text-slate-400" : "text-slate-600")}>{tasksSummary.percent}% complete</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Display */}
              <div className={cn("prose max-w-none", isDark ? "prose-invert" : "")}>
                <article className="space-y-8">
                  <div
                    className={cn(
                      "leading-relaxed text-lg space-y-6",
                      isDark
                        ? "text-slate-300 prose-headings:text-white prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-slate-300 prose-p:leading-7 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white prose-strong:font-semibold prose-em:text-slate-200 prose-em:italic prose-code:text-blue-300 prose-code:bg-slate-900/50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-700/50 prose-pre:rounded-lg prose-pre:p-4 prose-blockquote:border-l-4 prose-blockquote:border-slate-700 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-400 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-slate-300 prose-li:mb-2 prose-hr:border-slate-700/30 prose-hr:my-8 prose-table:border-collapse prose-table:w-full prose-th:bg-slate-800/50 prose-th:text-left prose-th:p-3 prose-th:font-semibold prose-th:text-slate-300 prose-th:border prose-th:border-slate-700/30 prose-td:p-3 prose-td:border prose-td:border-slate-700/30 prose-td:text-slate-400"
                        : "text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-headings:mt-8 prose-headings:mb-4 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:text-slate-700 prose-p:leading-7 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-strong:font-semibold prose-em:text-slate-800 prose-em:italic prose-code:text-blue-700 prose-code:bg-slate-200 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm prose-pre:bg-slate-200 prose-pre:border prose-pre:border-slate-300 prose-pre:rounded-lg prose-pre:p-4 prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:text-slate-700 prose-li:mb-2 prose-hr:border-slate-300/30 prose-hr:my-8 prose-table:border-collapse prose-table:w-full prose-th:bg-slate-200 prose-th:text-left prose-th:p-3 prose-th:font-semibold prose-th:text-slate-900 prose-th:border prose-th:border-slate-300 prose-td:p-3 prose-td:border prose-td:border-slate-300 prose-td:text-slate-700"
                    )}
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(note.content)
                    }}
                  />
                </article>
              </div>

              {/* Settings Toggle */}
              <div className={cn("flex justify-center pt-8 border-t", isDark ? "border-slate-700/30" : "border-slate-200")}>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    "px-6 py-3 rounded-lg border transition-all duration-200 font-medium flex items-center gap-2",
                    isDark
                      ? "bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 hover:text-white border-slate-700/50"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 border-slate-300"
                  )}
                >
                  <span>{showSettings ? '▲' : '▼'}</span>
                  {showSettings ? 'Hide Settings' : 'Show Settings'}
                </button>
              </div>

              {/* Settings Panel */}
              {showSettings && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                  {/* Lock Settings */}
                  <div className={cn("backdrop-blur-sm border rounded-xl p-6", isDark ? "bg-slate-800/30 border-slate-700/50" : "bg-slate-200/30 border-slate-300")}>
                    <h3 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                      <span>🔒</span>
                      Lock Protection
                    </h3>
                    <NoteLockSettings 
                      noteId={id}
                      onLockStatusChange={(locked) => setIsLocked(locked)}
                    />
                  </div>

                  {/* Reminders */}
                  <div className={cn("backdrop-blur-sm border rounded-xl p-6", isDark ? "bg-slate-800/30 border-slate-700/50" : "bg-slate-200/30 border-slate-300")}>
                    <h3 className={cn("text-lg font-bold mb-4 flex items-center gap-2", isDark ? "text-white" : "text-slate-900")}>
                      <span>🔔</span>
                      Reminders
                    </h3>
                    <ReminderManager noteId={id} />
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className={cn("border rounded-2xl p-5", isDark ? "border-slate-700/50 bg-slate-800/30" : "border-slate-200 bg-white")}>
                <h3 className={cn("text-sm font-semibold mb-3", isDark ? "text-slate-300" : "text-slate-700")}>Overview</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={cn(isDark ? "text-slate-400" : "text-slate-600")}>Status</span>
                    <span className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-800")}>
                      {isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn(isDark ? "text-slate-400" : "text-slate-600")}>Folder</span>
                    <span className={cn("font-medium truncate", isDark ? "text-slate-200" : "text-slate-800")}>
                      {note.folderId?.name || "General"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={cn(isDark ? "text-slate-400" : "text-slate-600")}>Tasks</span>
                    <span className={cn("font-medium", isDark ? "text-slate-200" : "text-slate-800")}>
                      {tasksSummary.done}/{tasksSummary.total}
                    </span>
                  </div>
                </div>
                {Array.isArray(note.tags) && note.tags.length > 0 && (
                  <div className="mt-4">
                    <div className={cn("text-xs uppercase tracking-wider mb-2", isDark ? "text-slate-500" : "text-slate-500")}>
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag) => (
                        <span
                          key={tag._id || tag}
                          className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium border",
                            isDark ? "border-slate-700 text-slate-300" : "border-slate-200 text-slate-700"
                          )}
                          style={typeof tag === "object" && tag?.color ? { backgroundColor: `${tag.color}22`, borderColor: `${tag.color}55` } : undefined}
                        >
                          {typeof tag === "string" ? tag : tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className={cn("border rounded-2xl p-5", isDark ? "border-slate-700/50 bg-slate-800/30" : "border-slate-200 bg-white")}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={cn("text-sm font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Checklist</h3>
                  <span className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>{tasksSummary.percent}%</span>
                </div>
                <div className="h-2 w-full bg-slate-200/60 dark:bg-slate-700/50 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${tasksSummary.percent}%` }} />
                </div>
                <div className="mt-3 space-y-2 text-sm">
                  {tasksSummary.tasks?.slice(0, 5).map((t) => (
                    <div key={t.id} className="flex items-center gap-2">
                      <span className={cn("text-xs", t.completed ? "text-green-400" : "text-slate-400")}>
                        {t.completed ? "●" : "○"}
                      </span>
                      <span className={cn("truncate", t.completed ? "line-through text-slate-500" : isDark ? "text-slate-300" : "text-slate-700")}>
                        {t.text || "Untitled task"}
                      </span>
                    </div>
                  ))}
                  {tasksSummary.total === 0 && (
                    <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-500")}>No tasks yet</div>
                  )}
                </div>
              </div>

              <ClockWidget className={isDark ? "border-slate-700/50 bg-slate-800/30 text-slate-200" : "border-slate-200 bg-white text-slate-900"} />
            </aside>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm p-4 animate-in fade-in" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className={cn("border rounded-2xl max-w-sm w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95", isDark ? "bg-slate-800 border-slate-700/50" : "bg-white border-slate-200")}>
            {/* Icon */}
            <div className="flex justify-center">
              <div className="p-4 rounded-full border" style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)', borderColor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.1)' }}>
                <Trash2Icon size={32} className="text-red-500" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center space-y-2">
              <h3 className={cn("text-2xl font-bold", isDark ? "text-white" : "text-slate-900")}>Delete Note?</h3>
              <p className={cn("", isDark ? "text-slate-400" : "text-slate-600")}>
                Delete "<span className={cn("font-semibold", isDark ? "text-white" : "text-slate-900")}>{note.title}</span>"? This cannot be undone.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium border",
                  isDark
                    ? "text-slate-300 hover:text-white hover:bg-slate-700/50 border-slate-700/30"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200 border-slate-300"
                )}
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-red-500/20"
                onClick={() => {
                  handleDelete();
                  setShowDeleteModal(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotedetailPage;
