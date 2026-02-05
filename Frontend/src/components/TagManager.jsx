import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X, Plus } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const PRESET_COLORS = [
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#06B6D4', // cyan
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
];

export default function TagManager({ isDark = true, onTagCreated = () => {} }) {
  const [showModal, setShowModal] = useState(false);
  const [tagName, setTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  const handleCreateTag = async () => {
    if (!tagName.trim()) {
      toast.error('Tag name is required');
      return;
    }

    setIsCreatingTag(true);
    try {
      const response = await api.post('/api/v1/tags', {
        name: tagName.trim(),
        color: selectedColor,
      });
      
      toast.success('Tag created successfully!');
      setTagName('');
      setSelectedColor(PRESET_COLORS[0]);
      setShowModal(false);
      onTagCreated(response.data);
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error(error.response?.data?.message || 'Failed to create tag');
    } finally {
      setIsCreatingTag(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium",
          isDark
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        )}
      >
        <Plus size={18} />
        New Tag
      </button>

      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-sm p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <div className={cn("border rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95", isDark ? "bg-slate-800 border-slate-700/50" : "bg-white border-slate-200")}>
            <div className="flex items-center justify-between">
              <h3 className={cn("text-xl font-bold", isDark ? "text-white" : "text-slate-900")}>Create Tag</h3>
              <button
                onClick={() => setShowModal(false)}
                className={cn("p-1 rounded-lg transition-colors", isDark ? "hover:bg-slate-700" : "hover:bg-slate-200")}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className={cn("block text-sm font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Tag Name</label>
                <input
                  type="text"
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                  placeholder="Enter tag name"
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
                <label className={cn("block text-sm font-semibold", isDark ? "text-slate-300" : "text-slate-700")}>Color</label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "w-full h-12 rounded-lg transition-all border-2",
                        selectedColor === color
                          ? "border-white scale-110"
                          : "border-transparent hover:scale-105"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: `${selectedColor}20`, borderLeft: `4px solid ${selectedColor}` }}>
                <p className={cn("text-sm font-medium", isDark ? "text-slate-300" : "text-slate-700")}>Preview</p>
                <div className="mt-2 inline-block px-3 py-1 rounded-full text-white text-sm font-medium" style={{ backgroundColor: selectedColor }}>
                  {tagName || 'Tag Name'}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowModal(false)}
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
                onClick={handleCreateTag}
                disabled={isCreatingTag}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50"
              >
                {isCreatingTag ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
