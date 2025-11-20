// Tag Manager Component
import React, { useState, useEffect } from "react";
import { Plus, X, Edit2, Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import tagsService from "../../services/tagsService";
import "./TagManager.css";

export default function TagManager({ tags = [], onTagsChange, selectedTag, onSelectTag }) {
  const [allTags, setAllTags] = useState(tags);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const colors = [
    "#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8",
    "#F7DC6F", "#BB8FCE", "#85C1E2", "#F8B88B", "#ABE5D1",
    "#FFB6C1", "#90EE90", "#87CEEB", "#DDA0DD", "#F0E68C",
  ];

  useEffect(() => {
    setAllTags(tags);
  }, [tags]);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }

    setIsCreating(true);
    try {
      const newTag = await tagsService.createTag(newTagName, newTagColor);
      setAllTags([...allTags, newTag]);
      onTagsChange?.([...allTags, newTag]);
      toast.success("Tag created successfully");
      setNewTagName("");
      setNewTagColor("");
    } catch (error) {
      toast.error(error.message || "Failed to create tag");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateTag = async (tagId) => {
    if (!editingName.trim()) {
      toast.error("Tag name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const updated = await tagsService.updateTag(tagId, { name: editingName });
      setAllTags(allTags.map((t) => (t._id === tagId ? updated : t)));
      onTagsChange?.(allTags.map((t) => (t._id === tagId ? updated : t)));
      toast.success("Tag updated successfully");
      setEditingId(null);
    } catch (error) {
      toast.error(error.message || "Failed to update tag");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTag = async (tagId) => {
    if (!window.confirm("Are you sure you want to delete this tag?")) return;

    setIsLoading(true);
    try {
      await tagsService.deleteTag(tagId);
      const updated = allTags.filter((t) => t._id !== tagId);
      setAllTags(updated);
      onTagsChange?.(updated);
      // Clear filter if deleted tag was selected
      if (selectedTag === tagId) onSelectTag?.(null);
      toast.success("Tag deleted successfully");
    } catch (error) {
      toast.error(error.message || "Failed to delete tag");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="tag-manager space-y-4">
      {/* Create New Tag */}
      <div className="create-tag-form">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="New tag name..."
            className="input input-bordered input-sm flex-1"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateTag()}
            disabled={isCreating}
          />
          <select
            className="select select-bordered select-sm"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            disabled={isCreating}
          >
            <option value="">Color</option>
            {colors.map((color) => (
              <option key={color} value={color}>
                <span className="inline-block w-3 h-3 rounded mr-2" style={{ backgroundColor: color }} />
                {color}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary btn-sm gap-2"
            onClick={handleCreateTag}
            disabled={isCreating}
          >
            {isCreating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>
      </div>

      {/* Tags List - Clickable */}
      {allTags.length > 0 ? (
        <div className="flex flex-col gap-2">
          {/* View as Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag._id}
                onClick={() => onSelectTag?.(selectedTag === tag._id ? null : tag._id)}
                className={`badge badge-lg cursor-pointer transition ${
                  selectedTag === tag._id 
                    ? 'badge-primary ring-2 ring-offset-2' 
                    : 'badge-outline'
                }`}
                style={{
                  backgroundColor: selectedTag === tag._id ? tag.color : 'transparent',
                  color: selectedTag === tag._id ? 'white' : 'inherit',
                  borderColor: tag.color,
                }}
                title="Click to filter by this tag"
              >
                {tag.name}
              </button>
            ))}
          </div>
          
          {/* Edit Mode */}
          {allTags.length > 0 && (
            <details className="collapse collapse-arrow border border-base-200">
              <summary className="collapse-title text-sm cursor-pointer">Edit Tags</summary>
              <div className="collapse-content space-y-3">
                {allTags.map((tag) => (
                  <div key={tag._id} className="flex gap-2 items-center">
                    {editingId === tag._id ? (
                      <>
                        <input
                          type="text"
                          className="input input-bordered input-xs flex-1"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleUpdateTag(tag._id)
                          }
                          disabled={isLoading}
                          autoFocus
                        />
                        <button
                          className="btn btn-xs btn-success"
                          onClick={() => handleUpdateTag(tag._id)}
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
                      </>
                    ) : (
                      <>
                        <span
                          className="inline-block w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        ></span>
                        <span className="flex-1 text-sm">{tag.name}</span>
                        <button
                          className="btn btn-xs btn-ghost gap-1"
                          onClick={() => {
                            setEditingId(tag._id);
                            setEditingName(tag.name);
                          }}
                          disabled={isLoading}
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-xs btn-ghost text-error gap-1"
                          onClick={() => handleDeleteTag(tag._id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      ) : (
        <div className="text-center py-4 text-base-content/50">
          <p className="text-sm">No tags created yet</p>
        </div>
      )}
    </div>
  );
}
