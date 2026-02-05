import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { BookOpen, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export default function Sidebar({ totalNotes = 0, folders = [], onFolderSelect = () => {}, isDark = true }) {
  const [stats, setStats] = useState([
    { label: 'Total Notes', value: '0', color: 'text-blue-500' },
    { label: 'Files', value: '0', color: 'text-green-500' },
  ]);

  // Update stats when total notes change
  useEffect(() => {
    setStats([
      { label: 'Total Notes', value: String(totalNotes), color: 'text-blue-500' },
      { label: 'Files', value: String(folders.length), color: 'text-green-500' },
    ]);
  }, [totalNotes, folders.length]);

  const priorities = [
    { name: 'All Priorities', count: 5, icon: null },
    { name: 'High Priority', count: 2, icon: '🔴' },
    { name: 'Medium Priority', count: 2, icon: '🟡' },
    { name: 'Low Priority', count: 1, icon: '🟢' },
  ];

  return (
    <aside className={cn(
      "hidden lg:flex w-64 flex-col h-screen sticky top-0 overflow-y-auto border-r transition-colors duration-300",
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

      {/* Files */}
      <div className={cn("p-6 border-b transition-colors duration-300", isDark ? "border-slate-800" : "border-slate-200")}>
        <h2 className={cn("text-xs font-semibold uppercase tracking-wider mb-4", isDark ? "text-slate-400" : "text-slate-500")}>Files</h2>
        <div className="space-y-3">
          {folders.length === 0 ? (
            <p className={cn("text-xs italic", isDark ? "text-slate-500" : "text-slate-400")}>No Files yet</p>
          ) : (
            folders.map((folder) => {
              // Generate a color based on folder name hash
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
                  <div className={cn('w-3 h-3 rounded-full flex-shrink-0 mt-1.5', color)} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>{folder.name}</p>
                    <p className={cn("text-xs truncate", isDark ? "text-slate-500" : "text-slate-400")}>{folder.description || 'No description'}</p>
                  </div>
                  <span className={cn("text-xs flex-shrink-0", isDark ? "text-slate-500" : "text-slate-400")}>{folder.noteCount || 0}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Priorities */}
      <div className="p-6">
        <h2 className={cn("text-xs font-semibold uppercase tracking-wider mb-4", isDark ? "text-slate-400" : "text-slate-500")}>Priority</h2>
        <div className="space-y-2">
          {priorities.map((priority) => (
            <div key={priority.name} className={cn(
              "flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors",
              isDark ? "hover:bg-slate-800/50" : "hover:bg-slate-100"
            )}>
              <span className={cn("text-sm", isDark ? "text-slate-300" : "text-slate-700")}>{priority.name}</span>
              <span className={cn("text-xs px-2 py-1 rounded", isDark ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-600")}>{priority.count}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
