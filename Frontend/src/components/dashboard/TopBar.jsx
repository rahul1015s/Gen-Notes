import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Search, Grid3x3, List, Plus, Sun, Moon } from 'lucide-react';

export default function TopBar({ 
  onViewChange = () => {}, 
  isDark = true, 
  onThemeToggle = () => {},
  onSearch = () => {},
  onNewNote = () => {}
}) {
  const [viewMode, setViewMode] = useState('grid');
  const [searchValue, setSearchValue] = useState('');

  const handleViewChange = (mode) => {
    setViewMode(mode);
    onViewChange(mode);
  };

  return (
    <div className={cn(
      "sticky top-0 z-40 w-full border-b transition-colors duration-300",
      isDark 
        ? "bg-slate-900/95 border-slate-800 backdrop-blur-sm" 
        : "bg-white/95 border-slate-200 backdrop-blur-sm"
    )}>
      <div className="flex items-center justify-between px-6 py-4 gap-4">
        {/* Search */}
        <div className="flex-1 relative max-w-md">
          <Search size={18} className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2",
            isDark ? "text-slate-500" : "text-slate-400"
          )} />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearch(e.target.value);
            }}
            className={cn(
              "w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all",
              isDark
                ? "bg-slate-800 border border-slate-700 text-white placeholder-slate-500"
                : "bg-slate-100 border border-slate-300 text-slate-900 placeholder-slate-400"
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className={cn(
            "hidden md:flex items-center gap-1 rounded-lg p-1",
            isDark ? "bg-slate-800/50" : "bg-slate-200/50"
          )}>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => handleViewChange('grid')}
              className={cn(
                'rounded-md',
                viewMode === 'grid' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : isDark
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300'
              )}
            >
              <Grid3x3 size={18} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon-sm"
              onClick={() => handleViewChange('list')}
              className={cn(
                'rounded-md',
                viewMode === 'list' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : isDark
                    ? 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300'
              )}
            >
              <List size={18} />
            </Button>
          </div>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onThemeToggle}
            className={cn(
              "rounded-lg transition-colors",
              isDark 
                ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-300"
            )}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          {/* New Note Button */}
          <Button
            onClick={onNewNote}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 rounded-lg"
            size="default"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">New Note</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
