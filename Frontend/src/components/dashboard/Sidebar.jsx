import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { BookOpen, Plus, X, AlertCircle, Flag, Home, Settings } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function Sidebar({ totalNotes = 0, folders = [], onFolderSelect = () => {}, onFolderCreated = () => {}, isDark = true, notes = [] }) {
  const [stats, setStats] = useState([
    { label: 'Total Notes', value: '0', color: 'text-blue-500' },
    { label: 'Files', value: '0', color: 'text-green-500' },
  ]);

  const [priorityStats, setPriorityStats] = useState({
    all: 0,
    high: 0,
    medium: 0,
    low: 0,
  });

  const [showFolderModal, setShowFolderModal] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  // Update stats when total notes change
  useEffect(() => {
    setStats([
      { label: 'Total Notes', value: String(totalNotes), color: 'text-blue-500' },
      { label: 'Files', value: String(folders.length), color: 'text-green-500' },
    ]);
  }, [totalNotes, folders.length]);

  // Calculate priority statistics from notes
  useEffect(() => {
    if (notes && notes.length > 0) {
      const priorities = {
        all: notes.length,
        high: notes.filter(note => note.priority === 'High').length,
        medium: notes.filter(note => note.priority === 'Medium').length,
        low: notes.filter(note => note.priority === 'Low').length,
      };
      setPriorityStats(priorities);
    }
  }, [notes]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error('Folder name is required');
      return;
    }

    setIsCreatingFolder(true);
    try {
      const response = await api.post('/api/v1/folders', {
        name: folderName.trim(),
        description: folderDescription.trim(),
        isPrivate,
      });
      
      toast.success('Folder created successfully!');
      setFolderName('');
      setFolderDescription('');
      setIsPrivate(false);
      setShowFolderModal(false);
      onFolderCreated(response.data);
    } catch (error) {
      console.error('Error creating folder:', error);
      toast.error(error.response?.data?.message || 'Failed to create folder');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const navigate = useNavigate();

  const priorities = [
    { name: 'All Priorities', count: 5, icon: null },
    { name: 'High Priority', count: 2, icon: '🔴' },
    { name: 'Medium Priority', count: 2, icon: '🟡' },
    { name: 'Low Priority', count: 1, icon: '🟢' },
  ];

  return (
    <aside className={cn(
      "hidden lg:flex flex-col h-screen w-64 sticky top-0 overflow-y-auto border-r transition-colors duration-300",
      isDark 
        ? "bg-slate-900 border-slate-800" 
        : "bg-white border-slate-200"
    )}>
      {/* Header */}
      <div className={cn("p-6 border-b transition-colors duration-300", isDark ? "border-slate-800" : "border-slate-200")}>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <BookOpen size={20} className="text-white" />
          </div>
          <h1 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>GenNotes</h1>
        </div>
      </div>

      {/* Navigation */}
      <div className={cn("p-3 border-b transition-colors duration-300 space-y-2", isDark ? "border-slate-800" : "border-slate-200")}>
        <button
          onClick={() => navigate('/all-notes')}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
            isDark
              ? "hover:bg-slate-800 text-slate-300 hover:text-white"
              : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
          )}
        >
          <Home size={18} />
          <span className="text-sm font-medium">Home</span>
        </button>
        <button
          onClick={() => navigate('/settings')}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-lg transition-colors",
            isDark
              ? "hover:bg-slate-800 text-slate-300 hover:text-white"
              : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
          )}
        >
          <Settings size={18} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>

      {/* Stats */}
      <div className={cn("p-6 border-b transition-colors duration-300 space-y-4", isDark ? "border-slate-800" : "border-slate-200")}>
        <h2 className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>Dashboard</h2>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className={cn("rounded-lg p-3 transition-colors duration-300", isDark ? "bg-slate-800/50" : "bg-slate-100")}>
              <p className={cn("text-xs mb-1", isDark ? "text-slate-400" : "text-slate-500")}>{stat.label}</p>
              <p className={cn('text-2xl font-bold', stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Folders/Files Section */}
      <div className={cn("p-6 border-b transition-colors duration-300", isDark ? "border-slate-800" : "border-slate-200")}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={cn("text-xs font-semibold uppercase tracking-wider", isDark ? "text-slate-400" : "text-slate-500")}>Folders</h2>
          <button
            onClick={() => setShowFolderModal(true)}
            className={cn(
              "p-1 rounded-lg transition-colors",
              isDark
                ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                : "hover:bg-slate-200 text-slate-600 hover:text-slate-900"
            )}
            title="Create folder"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-3">
          {folders.length === 0 ? (
            <p className={cn("text-xs italic", isDark ? "text-slate-500" : "text-slate-400")}>No Folders yet</p>
          ) : (
            folders.map((folder) => {
              const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'];
              const colorIndex = Math.abs(folder.name.charCodeAt(0)) % colors.length;
              const color = colors[colorIndex];

              return (
                <div
                  key={folder._id}
                  onClick={() => onFolderSelect(folder._id)}
                  className={cn(
                    "flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                    isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
                  )}
                >
                  <div className={cn('w-3 h-3 rounded-full shrink-0 mt-1.5', color)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>
                      {folder.name} {folder.isPrivate ? "🔒" : ""}
                    </p>
                    <p className={cn("text-xs truncate", isDark ? "text-slate-500" : "text-slate-400")}>{folder.description || 'No description'}</p>
                  </div>
                  <span className={cn("text-xs shrink-0", isDark ? "text-slate-500" : "text-slate-400")}>{folder.noteCount || 0}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Priorities */}
      <div className={cn("p-6 border-b transition-colors duration-300", isDark ? "border-slate-800" : "border-slate-200")}>
        <h2 className={cn("text-xs font-semibold uppercase tracking-wider mb-4", isDark ? "text-slate-400" : "text-slate-500")}>Priorities</h2>
        <div className="space-y-2">
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-colors",
            isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
          )}>
            <span className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>All Priorities</span>
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold", isDark ? "bg-slate-800 text-blue-400" : "bg-blue-100 text-blue-700")}>{priorityStats.all}</span>
          </div>
          
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-colors",
            isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
          )}>
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-red-500" />
              <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-700")}>High Priority</span>
            </div>
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold", isDark ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-700")}>{priorityStats.high}</span>
          </div>
          
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-colors",
            isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
          )}>
            <div className="flex items-center gap-2">
              <Flag size={14} className="text-yellow-500" />
              <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-700")}>Medium Priority</span>
            </div>
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold", isDark ? "bg-yellow-900/40 text-yellow-400" : "bg-yellow-100 text-yellow-700")}>{priorityStats.medium}</span>
          </div>
          
          <div className={cn(
            "flex items-center justify-between p-2 rounded-lg transition-colors",
            isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
          )}>
            <div className="flex items-center gap-2">
              <Flag size={14} className="text-green-500" />
              <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-700")}>Low Priority</span>
            </div>
            <span className={cn("text-xs px-2.5 py-1 rounded-full font-semibold", isDark ? "bg-green-900/40 text-green-400" : "bg-green-100 text-green-700")}>{priorityStats.low}</span>
          </div>
        </div>
      </div>

      {/* Create Folder Modal */}
      {showFolderModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className={cn("border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95", isDark ? "bg-slate-800 border-slate-700/50" : "bg-white border-slate-200")}>
            <div className="flex items-center justify-between">
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>Create Folder</h3>
              <button
                onClick={() => setShowFolderModal(false)}
                className={cn("p-1 rounded-lg transition-colors", isDark ? "hover:bg-slate-700" : "hover:bg-slate-200")}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className={cn("block text-sm font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Folder Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Enter folder name"
                  className={cn(
                    "w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all",
                    isDark
                      ? "bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500/40"
                      : "bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-blue-500/40"
                  )}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <label className={cn("block text-sm font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Description (Optional)</label>
                <input
                  type="text"
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                  placeholder="Enter folder description"
                  className={cn(
                    "w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 transition-all",
                    isDark
                      ? "bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:ring-blue-500/40"
                      : "bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-500 focus:ring-blue-500/40"
                  )}
                />
              </div>
              <label className={cn("flex items-center gap-2 text-sm", isDark ? "text-slate-300" : "text-slate-700")}>
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                Private folder (requires app unlock)
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowFolderModal(false)}
                className={cn(
                  "flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium",
                  isDark
                    ? "text-slate-300 hover:text-white hover:bg-slate-700"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-200"
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                disabled={isCreatingFolder}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50"
              >
                {isCreatingFolder ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </aside>
  );
}
