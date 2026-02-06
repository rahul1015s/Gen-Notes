import React from 'react';
import { cn } from '@/lib/utils';
import NoteCard from './NoteCard';

export default function NotesGrid({ notes = [], viewMode = 'grid', onNoteClick = () => {}, onPin = () => {}, onDelete = () => {}, isDark = true }) {
  // Extract plain text preview from HTML content
  const getPreview = (html) => {
    if (!html || typeof html !== 'string') return '';
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const text = (tempDiv.textContent || tempDiv.innerText || '').trim();
      return text ? text.substring(0, 100) : '';
    } catch (e) {
      return '';
    }
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">📝</div>
          <h3 className={cn("text-xl font-semibold mb-2", isDark ? "text-slate-200" : "text-slate-800")}> No notes yet</h3>
          <p className={cn("", isDark ? "text-slate-400" : "text-slate-600")}>Create your first note to get started</p>
        </div>
      </div>
    );
  }

  const gridClasses = {
    grid: 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    list: 'space-y-3',
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {notes.map((note, idx) => (
          <div
            key={idx}
            onClick={() => onNoteClick(note)}
            className={cn(
              "flex items-start gap-4 p-4 rounded-lg border transition-all cursor-pointer group",
              isDark
                ? "border-slate-700/50 bg-slate-800/40 hover:bg-slate-800/60 hover:border-slate-600"
                : "border-slate-200 bg-slate-100/40 hover:bg-slate-200/60 hover:border-slate-300"
            )}
          >
            {/* Course indicator */}
            <div
              className={cn('w-3 h-12 rounded-full flex-shrink-0 group-hover:w-4 transition-all', note.course.color)}
            />
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className={cn("font-semibold truncate", isDark ? "text-white" : "text-slate-900")}>{note.title}</h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    className={cn(
                      "text-xs font-semibold px-2.5 py-1 rounded-full border",
                      note.isPinned
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin(note);
                    }}
                  >
                    {note.isPinned ? "Pinned" : "Pin"}
                  </button>
                  <span className={cn(
                    'text-xs font-semibold px-2.5 py-1 rounded-full',
                    note.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    note.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                    'bg-green-500/10 text-green-400 border border-green-500/20'
                  )}>
                    {note.priority.charAt(0).toUpperCase() + note.priority.slice(1)}
                  </span>
                </div>
              </div>
              <p className={cn("text-sm mb-2 line-clamp-1", isDark ? "text-slate-400" : "text-slate-600")}>{getPreview(note.content) ? getPreview(note.content) : 'No content'}</p>
              <div className={cn("flex items-center justify-between text-xs", isDark ? "text-slate-500" : "text-slate-600")}>
                <span>{note.course?.name || 'Uncategorized'}</span>
                <span>{note.snippets || 0} snippets</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={gridClasses[viewMode]}>
      {notes.map((note, idx) => (
        <NoteCard
          key={idx}
          note={note}
          onClick={() => onNoteClick(note)}
          onPin={() => onPin(note)}
          onDelete={() => onDelete(note)}
          isDark={isDark}
        />
      ))}
    </div>
  );
}
