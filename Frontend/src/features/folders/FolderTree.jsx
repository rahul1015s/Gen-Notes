// Folder Tree Component for displaying nested folders
import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import foldersService, { FOLDER_ICONS } from "../../services/foldersService";
import "./FolderTree.css";

/**
 * @param {Object} props
 * @param {Array} props.folders - Flat array of folders
 * @param {Function} props.onSelectFolder - Callback when folder is clicked
 * @param {Function} props.onFoldersChange - Callback when folders change
 */
export default function FolderTree({ folders = [], onSelectFolder, onFoldersChange }) {
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [newFolderParent, setNewFolderParent] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState(FOLDER_ICONS[0]);

  const buildTree = (parentId = null) => {
    return folders.filter((f) => f.parentId === parentId);
  };

  const toggleExpand = (folderId) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const newFolder = await foldersService.createFolder(
        newFolderName,
        newFolderParent,
        selectedIcon
      );
      onFoldersChange?.([...folders, newFolder]);
      toast.success("Folder created successfully");
      setNewFolderName("");
      setSelectedIcon(FOLDER_ICONS[0]);
      setShowCreateForm(false);
      setNewFolderParent(null);
      
      // Auto-expand parent if creating subfolder
      if (newFolderParent) {
        const newExpanded = new Set(expandedFolders);
        newExpanded.add(newFolderParent);
        setExpandedFolders(newExpanded);
      }
    } catch (error) {
      toast.error(error.message || "Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateFolder = async (folderId) => {
    if (!editingName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const updated = await foldersService.updateFolder(folderId, {
        name: editingName,
      });
      const newFolders = folders.map((f) => (f._id === folderId ? updated : f));
      onFoldersChange?.(newFolders);
      toast.success("Folder updated successfully");
      setEditingId(null);
    } catch (error) {
      toast.error(error.message || "Failed to update folder");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!window.confirm("Are you sure? Notes will be moved to root.")) return;

    setIsLoading(true);
    try {
      await foldersService.deleteFolder(folderId, null);
      const newFolders = folders.filter((f) => f._id !== folderId);
      onFoldersChange?.(newFolders);
      toast.success("Folder deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete folder");
    } finally {
      setIsLoading(false);
    }
  };

  const renderFolderItem = (folder, level = 0) => {
    const children = buildTree(folder._id);
    const isExpanded = expandedFolders.has(folder._id);
    const hasChildren = children.length > 0;

    return (
      <div key={folder._id} className="folder-item">
        <div
          className="folder-row"
          style={{ paddingLeft: `${level * 1.5}rem` }}
        >
          <div className="folder-header">
            {hasChildren ? (
              <button
                className="folder-toggle"
                onClick={() => toggleExpand(folder._id)}
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <div className="folder-toggle-spacer"></div>
            )}

            <span className="folder-icon">{folder.icon || "📁"}</span>

            {editingId === folder._id ? (
              <div className="folder-edit">
                <input
                  type="text"
                  className="input input-bordered input-xs"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  className="btn btn-xs btn-success"
                  onClick={() => handleUpdateFolder(folder._id)}
                  disabled={isLoading}
                >
                  Save
                </button>
                <button
                  className="btn btn-xs btn-ghost"
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                className="folder-name"
                onClick={() => onSelectFolder?.(folder._id)}
              >
                {folder.name}
              </button>
            )}
          </div>

          {editingId !== folder._id && (
            <div className="folder-actions">
              <button
                className="btn btn-xs btn-ghost gap-1"
                onClick={() => {
                  setNewFolderParent(folder._id);
                  setShowCreateForm(true);
                }}
                disabled={isLoading}
                title="Create subfolder"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                className="btn btn-xs btn-ghost gap-1"
                onClick={() => {
                  setEditingId(folder._id);
                  setEditingName(folder.name);
                }}
                disabled={isLoading}
              >
                <Edit2 className="w-3 h-3" />
              </button>
              <button
                className="btn btn-xs btn-ghost text-error gap-1"
                onClick={() => handleDeleteFolder(folder._id)}
                disabled={isLoading}
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="folder-children">
            {children.map((child) => renderFolderItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolders = buildTree(null);

  return (
    <div className="folder-tree-container">
      {/* Create Folder Form */}
      {showCreateForm && (
        <div className="create-folder-form">
          <div className="form-content">
            <div>
              <label className="label-text text-sm">Folder Name</label>
              <input
                type="text"
                className="input input-bordered input-sm w-full"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                disabled={isLoading}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleCreateFolder()
                }
                autoFocus
              />
            </div>

            <div>
              <label className="label-text text-sm">Icon</label>
              <div className="icon-picker">
                {FOLDER_ICONS.map((icon) => (
                  <button
                    key={icon}
                    className={`icon-btn ${selectedIcon === icon ? "active" : ""}`}
                    onClick={() => setSelectedIcon(icon)}
                    type="button"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-sm btn-primary gap-2"
                onClick={handleCreateFolder}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Create
              </button>
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewFolderParent(null);
                  setNewFolderName("");
                }}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Root Create Button */}
      {!showCreateForm && (
        <button
          className="btn btn-sm btn-outline gap-2 w-full"
          onClick={() => {
            setNewFolderParent(null);
            setShowCreateForm(true);
          }}
        >
          <Plus className="w-4 h-4" />
          New Folder
        </button>
      )}

      {/* Folders List */}
      {rootFolders.length > 0 ? (
        <div className="folders-list">
          {rootFolders.map((folder) => renderFolderItem(folder))}
        </div>
      ) : (
        <div className="empty-state">
          <p className="text-sm text-base-content/50">
            No folders yet. Create one to get started!
          </p>
        </div>
      )}
    </div>
  );
}
