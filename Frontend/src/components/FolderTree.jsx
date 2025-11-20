import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Trash2, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

const FolderTree = ({
  folders = [],
  selectedFolder,
  onSelectFolder,
  onDragOver,
  onDropToFolder,
  onDeleteFolder,
  onUpdateFolder,
  draggedNote
}) => {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [hoveredFolderId, setHoveredFolderId] = useState(null);
  const [dragOverFolderId, setDragOverFolderId] = useState(null);

  const toggleExpand = (folderId) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleEditStart = (folder) => {
    setEditingFolderId(folder._id);
    setEditingName(folder.name);
  };

  const handleEditSave = async () => {
    if (!editingName.trim()) {
      toast.error('Folder name cannot be empty');
      return;
    }

    try {
      await onUpdateFolder(editingFolderId, editingName);
      setEditingFolderId(null);
      toast.success('Folder renamed successfully');
    } catch (error) {
      console.error('Error updating folder:', error);
      toast.error('Failed to rename folder');
    }
  };

  const handleDelete = async (folderId) => {
    if (confirm('Are you sure you want to delete this folder? Notes inside will not be deleted.')) {
      try {
        await onDeleteFolder(folderId);
        setEditingFolderId(null);
        toast.success('Folder deleted');
      } catch (error) {
        console.error('Error deleting folder:', error);
        toast.error('Failed to delete folder');
      }
    }
  };

  const handleDragOver = (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(folderId);
    if (onDragOver) onDragOver(e);
  };

  const handleDragLeave = (e) => {
    if (e.currentTarget === e.target) {
      setDragOverFolderId(null);
    }
  };

  const handleDrop = async (e, folderId) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    try {
      await onDropToFolder(folderId);
      toast.success('Note moved to folder');
    } catch (error) {
      console.error('Error moving note:', error);
      toast.error('Failed to move note');
    }
  };

  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder._id);
    const isEditing = editingFolderId === folder._id;
    const isDragOver = dragOverFolderId === folder._id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder._id} style={{ marginLeft: `${level * 16}px` }}>
        {/* Folder Item */}
        <div
          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-all ${
            selectedFolder === folder._id ? 'bg-primary/10 text-primary' : 'hover:bg-base-300'
          } ${isDragOver ? 'bg-primary/20 border-l-4 border-primary' : ''}`}
          onClick={() => onSelectFolder(folder._id)}
          onDragOver={(e) => handleDragOver(e, folder._id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, folder._id)}
        >
          {/* Expand/Collapse Arrow */}
          {hasChildren && (
            <button
              className='btn btn-ghost btn-xs p-0 w-6 h-6'
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(folder._id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className='w-4 h-4' />
              ) : (
                <ChevronRight className='w-4 h-4' />
              )}
            </button>
          )}
          {!hasChildren && <div className='w-6' />}

          {/* Folder Icon and Name */}
          <span className='text-lg'>{folder.icon}</span>

          {isEditing ? (
            <input
              type='text'
              className='input input-bordered input-sm flex-1'
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleEditSave();
                if (e.key === 'Escape') setEditingFolderId(null);
              }}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
          ) : (
            <span className='flex-1 truncate text-sm'>{folder.name}</span>
          )}

          {/* Action Buttons */}
          <div
            className={`flex gap-1 ${
              hoveredFolderId === folder._id || isEditing ? 'opacity-100' : 'opacity-0'
            } transition-opacity`}
            onMouseEnter={() => setHoveredFolderId(folder._id)}
            onMouseLeave={() => setHoveredFolderId(null)}
          >
            {isEditing ? (
              <>
                <button
                  className='btn btn-ghost btn-xs w-6 h-6 p-0'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditSave();
                  }}
                  title='Save'
                >
                  <Save className='w-3 h-3' />
                </button>
                <button
                  className='btn btn-ghost btn-xs w-6 h-6 p-0'
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingFolderId(null);
                  }}
                  title='Cancel'
                >
                  <X className='w-3 h-3' />
                </button>
              </>
            ) : (
              <>
                <button
                  className='btn btn-ghost btn-xs w-6 h-6 p-0'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditStart(folder);
                  }}
                  title='Edit'
                >
                  <Edit2 className='w-3 h-3' />
                </button>
                <button
                  className='btn btn-ghost btn-xs w-6 h-6 p-0 text-error'
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(folder._id);
                  }}
                  title='Delete'
                >
                  <Trash2 className='w-3 h-3' />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Child Folders */}
        {isExpanded && hasChildren && (
          <div className='mt-1'>
            {folder.children.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-1'>
      {folders.length === 0 ? (
        <div className='text-center py-4 text-base-content/50 text-sm'>
          <p>📁 No folders yet</p>
          <p className='text-xs'>Create one to organize your notes</p>
        </div>
      ) : (
        folders.map((folder) => renderFolder(folder))
      )}
    </div>
  );
};

export default FolderTree;
