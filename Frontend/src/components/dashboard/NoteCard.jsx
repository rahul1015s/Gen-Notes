import React from 'react';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';
import { Clock, Tag } from 'lucide-react';

// Helper function to strip HTML tags
const stripHtmlTags = (html) => {
  if (!html) return '';
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

export default function NoteCard({ note, onClick = () => {}, isDark = true }) {
  const {
    title = 'Untitled Note',
    course = { name: 'CS-201', color: 'bg-blue-500' },
    priority = 'medium',
    description = 'No description provided',
    tags = [],
    createdAt = new Date(),
    snippets = 0,
  } = note;

  const priorityConfig = {
    high: { color: 'bg-red-500/10 text-red-400', border: 'border-red-500/20', badge: 'High' },
    medium: { color: 'bg-yellow-500/10 text-yellow-400', border: 'border-yellow-500/20', badge: 'Medium' },
    low: { color: 'bg-green-500/10 text-green-400', border: 'border-green-500/20', badge: 'Low' },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer',
        'hover:shadow-lg hover:-translate-y-0.5 p-5 h-full flex flex-col',
        isDark
          ? 'border-slate-700/50 bg-slate-800/40 backdrop-blur-sm hover:border-slate-600 hover:bg-slate-800/60 hover:shadow-blue-500/10'
          : 'border-slate-200 bg-slate-100/40 backdrop-blur-sm hover:border-slate-300 hover:bg-slate-200/60 hover:shadow-blue-500/10'
      )}
    >
      {/* Gradient accent on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-transparent opacity-0 group-hover:opacity-5 transition-opacity duration-300" />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header with Course and Priority */}
        <div className="flex items-start justify-between mb-3 gap-2">
          <div className="flex items-center gap-2">
            <div className={cn('w-2.5 h-2.5 rounded-full flex-shrink-0', course.color)} />
            <span className={cn("text-xs font-semibold", isDark ? "text-slate-400" : "text-slate-600")}>{course.name}</span>
          </div>
          <span
            className={cn(
              'text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0',
              config.color,
              'border',
              config.border
            )}
          >
            {config.badge}
          </span>
        </div>

        {/* Title */}
        <h3 className={cn("font-bold text-base mb-2 line-clamp-2 leading-snug", isDark ? "text-white" : "text-slate-900")}>
          {title}
        </h3>

        {/* Description */}
        <p className={cn("text-sm mb-4 line-clamp-2 flex-grow", isDark ? "text-slate-400" : "text-slate-600")}>
          {stripHtmlTags(description)}
        </p>

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className={cn(
                  "text-xs px-2 py-1 rounded-md border transition-colors",
                  isDark
                    ? "bg-slate-700/50 text-slate-300 border-slate-600/30 hover:border-slate-600"
                    : "bg-slate-300/50 text-slate-700 border-slate-400/30 hover:border-slate-400"
                )}
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className={cn("text-xs px-2 py-1", isDark ? "text-slate-500" : "text-slate-600")}>+{tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={cn(
          "flex items-center justify-between pt-3 border-t text-xs",
          isDark ? "border-slate-700/30 text-slate-500" : "border-slate-300/30 text-slate-600"
        )}>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{formatDate(createdAt)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>{snippets}</span>
            <span>snippet{snippets !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
