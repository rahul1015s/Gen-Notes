import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileText, BookOpen, AlertCircle, Plus, Settings } from 'lucide-react';

export default function BottomNav({ 
  activeTab = null, 
  onTabChange = () => {}, 
  onNewNote = () => {},
  folders = [],
  notes = [],
  isDark = true,
  onFolderSelect = () => {}
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname || '';
  const routeTab = (() => {
    if (path.startsWith('/all-notes')) return 'notes';
    if (path.startsWith('/folders')) return 'files';
    if (path.startsWith('/priority')) return 'priority';
    if (path.startsWith('/create')) return 'new';
    if (path.startsWith('/settings')) return 'settings';
    return 'notes';
  })();
  const resolvedActiveTab = activeTab || routeTab;

  const tabs = [
    { id: 'notes', label: 'Notes', icon: FileText },
    { id: 'files', label: 'Files', icon: BookOpen },
    { id: 'priority', label: 'Priority', icon: AlertCircle },
    { id: 'new', label: 'New', icon: Plus, isCenter: true },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    if (tabId === 'notes') {
      navigate('/all-notes');
    } else if (tabId === 'files') {
      navigate('/folders');
    } else if (tabId === 'priority') {
      navigate('/priority');
    } else if (tabId === 'settings') {
      navigate('/settings');
    } else if (tabId === 'new') {
      if (onNewNote) {
        onNewNote();
      } else {
        navigate('/create');
      }
    } else {
      onTabChange(tabId);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-40 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = resolvedActiveTab === tab.id;
            
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
    </>
  );
}
