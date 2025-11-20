import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Loader2, FolderOpen, Tag, X } from 'lucide-react';
import toast from "react-hot-toast";
import api from '../lib/axios.js';
import TiptapEditor from '../components/TiptapEditor.jsx';
import foldersService from '../services/foldersService.js';

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Folder & Tags
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFolderId = searchParams.get('folderId');

  // Load folders & tags
  useEffect(() => {
    const loadData = async () => {
      try {
        const [foldersRes, tagsRes] = await Promise.all([
          api.get('/api/v1/folders').catch(() => ({ data: [] })),
          api.get('/api/v1/tags').catch(() => ({ data: [] })),
        ]);
        setFolders(foldersRes.data || []);
        setTags(tagsRes.data || []);
        if (urlFolderId) {
          setSelectedFolderId(urlFolderId);
        }
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [urlFolderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    if (!textContent.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    setLoading(true);

    try {
      const noteData = { 
        title: title.trim(), 
        content,
        tags: selectedTags,
      };

      if (selectedFolderId) {
        noteData.folderId = selectedFolderId;
      }

      await api.post("/api/v1/notes", noteData);
      
      toast.success("✅ Note Created!");
      navigate("/all-notes");
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error(
          <span>
            Slow down! Too many requests.<br />
            <span className="text-red-500">Try again after 15 minutes.</span>
          </span>,
          {
            duration: 4000,
            icon: <AlertTriangle className="text-red-500" />,
          }
        );
      } else {
        toast.error(error.response?.data?.message || "Failed to create note!");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const res = await api.post('/api/v1/tags', {
        name: newTagName.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      });
      const newTag = res.data;
      setTags([...tags, newTag]);
      setSelectedTags([...selectedTags, newTag._id]);
      setNewTagName("");
      setShowNewTag(false);
      toast.success("🏷️ Tag created!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create tag");
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 py-8 px-4">
      <div className="w-full max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link 
            to="/all-notes" 
            className="btn btn-ghost gap-2 hover:bg-base-300"
          >
            <ArrowLeft className="size-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <h1 className="text-2xl font-bold text-base-content">✍️ New Note</h1>
          <div className="w-14"></div>
        </div>

        {/* Main Card */}
        <div className="bg-base-100 shadow-lg rounded-2xl border border-base-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">

            {/* Title Input */}
            <div>
              <input
                type="text"
                placeholder="Title"
                className="w-full text-3xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-base-content/20 text-base-content"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
              />
              <div className="h-px bg-gradient-to-r from-base-300 via-base-300 to-transparent mt-4"></div>
            </div>

            {/* Folder Selection */}
            <div>
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Select Folder (Optional)
                </span>
              </label>
              <select
                className="select select-bordered w-full"
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                disabled={loading}
              >
                <option value="">No Folder</option>
                {folders.map((folder) => (
                  <option key={folder._id} value={folder._id}>
                    {folder.icon} {folder.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags Selection */}
            <div>
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags (Optional)
                </span>
              </label>
              
              {/* Tag List */}
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map((tag) => (
                  <button
                    key={tag._id}
                    type="button"
                    onClick={() => toggleTag(tag._id)}
                    className={`badge badge-lg cursor-pointer transition ${
                      selectedTags.includes(tag._id)
                        ? 'badge-primary'
                        : 'badge-ghost'
                    }`}
                    style={{
                      backgroundColor: selectedTags.includes(tag._id) 
                        ? tag.color 
                        : 'transparent',
                      color: selectedTags.includes(tag._id) 
                        ? 'white' 
                        : 'inherit',
                    }}
                  >
                    {tag.name}
                    {selectedTags.includes(tag._id) && (
                      <span className="ml-1">✓</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Add New Tag */}
              {showNewTag ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="New tag name..."
                    className="input input-bordered input-sm flex-1"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    autoFocus
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAddTag}
                    disabled={loading}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setShowNewTag(false);
                      setNewTagName("");
                    }}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm btn-block"
                  onClick={() => setShowNewTag(true)}
                  disabled={loading}
                >
                  + Create New Tag
                </button>
              )}
            </div>

            {/* Content Editor */}
            <div>
              <label className="label">
                <span className="label-text font-medium">Content</span>
              </label>
              <TiptapEditor
                value={content}
                onChange={setContent}
                height="400px"
                placeholder="Start typing your note..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
              <Link 
                to="/all-notes" 
                className="btn btn-ghost gap-2"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={loading}
              >
                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                {loading ? "Saving..." : "Create Note"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;