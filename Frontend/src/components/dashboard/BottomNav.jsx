import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, BookOpen, AlertCircle, Plus, Settings, X, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function BottomNav({ 
  activeTab = 'notes', 
  onTabChange = () => {}, 
  onNewNote = () => {},
  folders = [],
  notes = [],
  isDark = true,
  onFolderSelect = () => {}
}) {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);
  const [selectedPanel, setSelectedPanel] = useState(null);

  // Calculate priority stats
  const priorityStats = {
    all: notes.length,
    high: notes.filter(n => n.priority === 'High').length,
    medium: notes.filter(n => n.priority === 'Medium').length,
    low: notes.filter(n => n.priority === 'Low').length,
  };

  const tabs = [
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files', icon: BookOpen },
    { id: 'priority', label: 'Priority', icon: AlertCircle },
    { id: 'new', label: 'New', icon: Plus, isCenter: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'notes' || tabId === 'files' || tabId === 'priority') {
      setSelectedPanel(tabId);
      setShowPanel(true);
    } else if (tabId === 'settings') {
      navigate('/settings');
    } else {
      onTabChange(tabId);
    }
  };

  const renderPanel = () => {
    if (selectedPanel === 'notes') {
      return (
        <div className="space-y-3">
          <div className={cn("p-3 rounded-lg", isDark ? "bg-slate-700/50" : "bg-slate-100")}>
            <p className={cn("text-xs mb-1", isDark ? "text-slate-400" : "text-slate-500")}>Total Notes</p>
            <p className={cn("text-2xl font-bold text-blue-500")}>{notes.length}</p>
          </div>
          <div className={cn("text-xs", isDark ? "text-slate-400" : "text-slate-600")}>
            <p>Showing all notes in your dashboard</p>
          </div>
        </div>
      );
    }

    if (selectedPanel === 'files') {
      return (
        <div className="space-y-3">
          <div className={cn("p-3 rounded-lg", isDark ? "bg-slate-700/50" : "bg-slate-100")}>
            <p className={cn("text-xs mb-2 font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Folders ({folders.length})</p>
            <div className="space-y-2">
              {folders.length === 0 ? (
                <p className={cn("text-xs italic", isDark ? "text-slate-500" : "text-slate-400")}>No folders yet</p>
              ) : (
                folders.map((folder) => (
                  <button
                    key={folder._id}
                    onClick={() => {
                      onFolderSelect(folder._id);
                      setShowPanel(false);
                    }}
                    className={cn(
                      "w-full text-left p-2 rounded-lg text-xs transition-colors",
                      isDark ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-200 text-slate-700"
                    )}
                  >
                    <p className="font-semibold">{folder.name}</p>
                    <p className={cn("text-xs truncate", isDark ? "text-slate-500" : "text-slate-400")}>{folder.description || 'No description'}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      );
    }

    if (selectedPanel === 'priority') {
      return (
        <div className="space-y-3">
          <div className={cn("p-3 rounded-lg", isDark ? "bg-slate-700/50" : "bg-slate-100")}>
            <p className={cn("text-xs mb-2 font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Priority Summary</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={cn("text-xs", isDark ? "text-slate-300" : "text-slate-700")}>All Priorities</span>
                <span className={cn("text-xs px-2 py-1 rounded-full font-semibold", isDark ? "bg-slate-600 text-blue-400" : "bg-blue-100 text-blue-700")}>{priorityStats.all}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs flex items-center gap-1", isDark ? "text-slate-300" : "text-slate-700")}><AlertCircle size={12} className="text-red-500" /> High</span>
                <span className={cn("text-xs px-2 py-1 rounded-full font-semibold", isDark ? "bg-red-900/40 text-red-400" : "bg-red-100 text-red-700")}>{priorityStats.high}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs flex items-center gap-1", isDark ? "text-slate-300" : "text-slate-700")}><AlertCircle size={12} className="text-yellow-500" /> Medium</span>
                <span className={cn("text-xs px-2 py-1 rounded-full font-semibold", isDark ? "bg-yellow-900/40 text-yellow-400" : "bg-yellow-100 text-yellow-700")}>{priorityStats.medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn("text-xs flex items-center gap-1", isDark ? "text-slate-300" : "text-slate-700")}><AlertCircle size={12} className="text-green-500" /> Low</span>
                <span className={cn("text-xs px-2 py-1 rounded-full font-semibold", isDark ? "bg-green-900/40 text-green-400" : "bg-green-100 text-green-700")}>{priorityStats.low}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id || (showPanel && selectedPanel === tab.id);
            
            if (tab.isCenter) {
              return (
                <Button
                  key={tab.id}
                  onClick={onNewNote}
                  className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-0 w-14 h-14 flex items-center justify-center shadow-lg"
                >
                  <Icon size={24} />
                </Button>
              );
            }

            return (
              <Button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                variant="ghost"
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-12 h-16 rounded-none',
                  isActive
                    ? 'text-blue-500'
                    : 'text-slate-500 hover:text-slate-300'
                )}
              >
                <Icon size={20} />
                <span className="text-xs">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {/* Panel Modal */}
      {showPanel && selectedPanel && createPortal(
        <div className="fixed inset-0 z-[9999] lg:hidden">
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowPanel(false)}
          />
          <div className={cn(
            "absolute bottom-0 left-0 right-0 rounded-t-2xl p-6 max-h-[70vh] overflow-y-auto animate-in slide-in-from-bottom",
            isDark ? "bg-slate-800" : "bg-white"
          )}>
            {/* Close Button */}
            <button
              onClick={() => setShowPanel(false)}
              className={cn("absolute top-3 right-3 p-2 rounded-lg transition-colors", isDark ? "hover:bg-slate-700" : "hover:bg-slate-200")}
            >
              <X size={20} />
            </button>

            {/* Header */}
            <h3 className={cn("text-lg font-semibold mb-4 pr-8", isDark ? "text-white" : "text-slate-900")}>
              {selectedPanel === 'notes' && 'Notes'}
              {selectedPanel === 'files' && 'Folders'}
              {selectedPanel === 'priority' && 'Priorities'}
            </h3>

            {/* Content */}
            {renderPanel()}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
