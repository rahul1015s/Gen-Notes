import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Loader2, FolderOpen, Tag, X, Wifi, WifiOff, GripVertical, Plus, CheckCheck, Trash2, Calendar, Bell, Flag } from 'lucide-react';
import toast from "react-hot-toast";
import api from '../lib/axios.js';
import TiptapEditor from '../components/TiptapEditor.jsx';
import foldersService from '../services/foldersService.js';
import offlineSyncService from '../services/offlineSyncService.js';

const CreatePage = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Folder & Tags
  const [folders, setFolders] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [tasks, setTasks] = useState([]);
  const dragStateRef = useRef(null);
  const [appUnlocked, setAppUnlocked] = useState(() => !!sessionStorage.getItem('appUnlocked'));

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlFolderId = searchParams.get('folderId');

  const getContrastText = (hexColor) => {
    if (!hexColor || typeof hexColor !== "string") return "inherit";
    const hex = hexColor.replace("#", "");
    if (hex.length !== 6) return "inherit";
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? "#111827" : "#f8fafc";
  };

  const generateId = () => {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `task_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
  };

  const sortedTasks = useMemo(() => {
    const sortByOrder = (list) =>
      [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((t) => ({
        ...t,
        children: t.children ? sortByOrder(t.children) : []
      }));
    return sortByOrder(tasks);
  }, [tasks]);

  const totalTasks = useMemo(() => {
    const count = (list) => list.reduce((acc, t) => acc + 1 + count(t.children || []), 0);
    return count(tasks);
  }, [tasks]);

  const completedTasks = useMemo(() => {
    const count = (list) => list.reduce((acc, t) => acc + (t.completed ? 1 : 0) + count(t.children || []), 0);
    return count(tasks);
  }, [tasks]);

  const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const addTask = (parentId = null) => {
    const newTask = {
      id: generateId(),
      text: "",
      completed: false,
      order: Date.now(),
      priority: "medium",
      dueDate: null,
      reminderAt: null,
      children: []
    };
    if (!parentId) {
      setTasks((prev) => [...prev, newTask]);
      return;
    }
    const addToTree = (list) =>
      list.map((t) => {
        if (t.id === parentId) {
          return { ...t, children: [...(t.children || []), newTask] };
        }
        return { ...t, children: addToTree(t.children || []) };
      });
    setTasks((prev) => addToTree(prev));
  };

  const updateTask = (id, updates) => {
    const updateTree = (list) =>
      list.map((t) => {
        if (t.id === id) return { ...t, ...updates };
        return { ...t, children: updateTree(t.children || []) };
      });
    setTasks((prev) => updateTree(prev));
  };

  const toggleTask = (id) => {
    const toggleTree = (list) =>
      list.map((t) => {
        if (t.id === id) {
          const completed = !t.completed;
          const toggleChildren = (children) =>
            children.map((c) => ({
              ...c,
              completed,
              children: toggleChildren(c.children || [])
            }));
          return { ...t, completed, children: toggleChildren(t.children || []) };
        }
        return { ...t, children: toggleTree(t.children || []) };
      });
    setTasks((prev) => toggleTree(prev));
  };

  const deleteTask = (id) => {
    const removeFromTree = (list) =>
      list
        .filter((t) => t.id !== id)
        .map((t) => ({ ...t, children: removeFromTree(t.children || []) }));
    setTasks((prev) => removeFromTree(prev));
  };

  const markAllComplete = () => {
    const markTree = (list) =>
      list.map((t) => ({
        ...t,
        completed: true,
        children: markTree(t.children || [])
      }));
    setTasks((prev) => markTree(prev));
  };

  const handleDragStart = (parentId, index) => {
    dragStateRef.current = { parentId, index };
  };

  const handleDrop = (parentId, index) => {
    const drag = dragStateRef.current;
    if (!drag) return;
    if (drag.parentId !== parentId) return;
    const reorder = (list) => {
      const updated = [...list];
      const [moved] = updated.splice(drag.index, 1);
      updated.splice(index, 0, moved);
      return updated.map((t, idx) => ({ ...t, order: idx }));
    };
    const reorderTree = (list) =>
      list.map((t) => ({
        ...t,
        children: reorderTree(t.children || [])
      }));
    if (!parentId) {
      setTasks((prev) => reorder(prev));
    } else {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === parentId ? { ...t, children: reorder(t.children || []) } : { ...t, children: reorderTree(t.children || []) }
        )
      );
    }
    dragStateRef.current = null;
  };

  const renderTasks = (list, parentId = null, depth = 0) => (
    <div className={`space-y-2 ${depth > 0 ? "ml-6 border-l border-base-200 pl-4" : ""}`}>
      {list.map((task, index) => (
        <div
          key={task.id}
          className={`rounded-xl border border-base-200 bg-base-100 p-3 ${
            task.completed ? "opacity-70" : ""
          }`}
          draggable
          onDragStart={() => handleDragStart(parentId, index)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(parentId, index)}
        >
          <div className="flex items-start gap-2">
            <button
              type="button"
              className="mt-2 text-base-content/40 hover:text-base-content/80 cursor-grab"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <input
              type="checkbox"
              className="checkbox checkbox-sm mt-2"
              checked={task.completed}
              onChange={() => toggleTask(task.id)}
            />
            <input
              type="text"
              placeholder="Task description"
              className="input input-ghost w-full text-sm sm:text-base"
              value={task.text}
              onChange={(e) => updateTask(task.id, { text: e.target.value })}
            />
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => addTask(task.id)}
              title="Add subtask"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => deleteTask(task.id)}
              title="Delete task"
            >
              <Trash2 className="w-4 h-4 text-error" />
            </button>
          </div>

          <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <label className="input input-bordered input-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-base-content/60" />
              <input
                type="date"
                className="grow"
                value={task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : ""}
                onChange={(e) => updateTask(task.id, { dueDate: e.target.value || null })}
              />
            </label>
            <label className="input input-bordered input-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-base-content/60" />
              <input
                type="datetime-local"
                className="grow"
                value={task.reminderAt ? new Date(task.reminderAt).toISOString().slice(0, 16) : ""}
                onChange={(e) => updateTask(task.id, { reminderAt: e.target.value || null })}
              />
            </label>
            <label className="select select-bordered select-sm flex items-center gap-2">
              <Flag className="w-4 h-4 text-base-content/60" />
              <select
                className="grow bg-transparent"
                value={task.priority}
                onChange={(e) => updateTask(task.id, { priority: e.target.value })}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </label>
          </div>

          {task.children && task.children.length > 0 && (
            <div className="mt-3">
              {renderTasks(task.children, task.id, depth + 1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Load folders & tags
  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    const loadData = async () => {
      try {
        const [foldersRes, tagsRes] = await Promise.all([
          api.get('/api/v1/folders').catch(() => ({ data: [] })),
          api.get('/api/v1/tags').catch(() => ({ data: [] })),
        ]);
        const allFolders = foldersRes.data || [];
        const visibleFolders = appUnlocked ? allFolders : allFolders.filter(f => !f.isPrivate);
        setFolders(visibleFolders);
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

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [urlFolderId, appUnlocked]);

  useEffect(() => {
    const onFocus = () => setAppUnlocked(!!sessionStorage.getItem('appUnlocked'));
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

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
        tasks: tasks,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (selectedFolderId) {
        noteData.folderId = selectedFolderId;
      }

      if (isOnline) {
        // Create on server
        const res = await api.post("/api/v1/notes", noteData);
        
        // Save to offline storage
        await offlineSyncService.saveNoteOffline(res.data);
        
        toast.success("✅ Note Created!");
        navigate("/all-notes");
      } else {
        // Create offline - generate temp ID
        const tempId = 'temp_' + Date.now();
        const offlineNote = { ...noteData, _id: tempId };
        
        // Save to offline storage
        await offlineSyncService.saveNoteOffline(offlineNote);
        
        // Add to sync queue
        await offlineSyncService.addToSyncQueue(tempId, 'create', noteData);
        
        toast.success("📝 Note saved offline! Will sync when online.");
        navigate("/all-notes");
      }
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
        console.error('Create error:', error);
        
        // If offline, save locally anyway
        if (!isOnline) {
          try {
            const tempId = 'temp_' + Date.now();
            const offlineNote = { ...noteData, _id: tempId };
            await offlineSyncService.saveNoteOffline(offlineNote);
            await offlineSyncService.addToSyncQueue(tempId, 'create', noteData);
            
            toast.success("📝 Note saved offline! Will sync when online.");
            navigate("/all-notes");
            return;
          } catch (err) {
            console.error('Offline save failed:', err);
          }
        }
        
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
    <div className="min-h-screen bg-[radial-gradient(1000px_circle_at_0%_-10%,hsl(var(--p)/0.06),transparent_60%),radial-gradient(900px_circle_at_100%_-10%,hsl(var(--a)/0.06),transparent_55%)] bg-base-100">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-10">

        {/* App Bar */}
        <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-4 pb-3 bg-base-100/90 backdrop-blur border-b border-base-200">
          <div className="flex items-center gap-3">
            <Link 
              to="/all-notes" 
              className="btn btn-ghost btn-sm sm:btn-md gap-2 hover:bg-base-200"
            >
              <ArrowLeft className="size-5" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-base-content">New Note</h1>
              <p className="text-xs sm:text-sm text-base-content/60">Create, tag, and organize</p>
            </div>
            <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
              isOnline 
                ? 'bg-success/15 text-success border-success/30' 
                : 'bg-warning/15 text-warning border-warning/30'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="size-3" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="size-3" />
                  Offline
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="mt-6 bg-base-100 shadow-xl rounded-2xl sm:rounded-3xl border border-base-200 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8">
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
              <div className="space-y-6">
                {/* Title Input */}
                <div className="rounded-2xl border border-base-200 bg-base-100 p-4 sm:p-5">
                  <input
                    type="text"
                    placeholder="Title"
                    className="w-full text-2xl sm:text-3xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 placeholder-base-content/30 text-base-content"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                  <div className="h-px bg-gradient-to-r from-base-300 via-base-300/70 to-transparent mt-4"></div>
                  <p className="mt-3 text-xs sm:text-sm text-base-content/60">
                    Give your note a clear, searchable title.
                  </p>
                </div>

                {/* Content Editor */}
                <div className="rounded-2xl border border-base-200 bg-base-100 p-4 sm:p-5">
                  <label className="label px-0">
                    <span className="label-text font-medium">Content</span>
                  </label>
                  <TiptapEditor
                    value={content}
                    onChange={setContent}
                    height="520px"
                    placeholder="Start typing your note..."
                  />
                </div>
              </div>

              <div className="mt-6 lg:mt-0 space-y-6">
                <div className="rounded-2xl border border-base-200 bg-base-100 p-4 sm:p-5">
                  <label className="label px-0">
                    <span className="label-text font-medium flex items-center gap-2">
                      <FolderOpen className="w-4 h-4" />
                      Folder
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
                <div className="rounded-2xl border border-base-200 bg-base-100 p-4 sm:p-5">
                  <label className="label px-0">
                    <span className="label-text font-medium flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
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
                            ? getContrastText(tag.color) 
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
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        placeholder="New tag name..."
                        className="input input-bordered input-sm flex-1 min-w-[160px]"
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
                      className="btn btn-outline btn-sm w-full sm:w-auto"
                      onClick={() => setShowNewTag(true)}
                      disabled={loading}
                    >
                      + Create New Tag
                    </button>
                  )}
                </div>

                {/* Tasks Panel */}
                <div className="rounded-2xl border border-base-200 bg-base-100 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-base-content">Checklist & Tasks</h3>
                      <p className="text-xs sm:text-sm text-base-content/60">
                        {totalTasks === 0 ? "Add tasks to track progress" : `${completedTasks}/${totalTasks} completed`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm gap-2"
                        onClick={() => addTask()}
                      >
                        <Plus className="w-4 h-4" />
                        Add Task
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm gap-2"
                        onClick={markAllComplete}
                        disabled={totalTasks === 0}
                      >
                        <CheckCheck className="w-4 h-4" />
                        Mark All Complete
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <progress
                      className="progress progress-primary w-full"
                      value={progressPercent}
                      max="100"
                    ></progress>
                    <div className="mt-1 text-xs text-base-content/60">{progressPercent}% done</div>
                  </div>

                  <div className="mt-4">
                    {sortedTasks.length === 0 ? (
                      <div className="text-sm text-base-content/60">
                        No tasks yet. Click “Add Task” to start.
                      </div>
                    ) : (
                      renderTasks(sortedTasks)
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden sm:flex justify-end gap-3 pt-6 border-t border-base-200 mt-6">
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

      {/* Mobile Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-base-100/95 backdrop-blur border-t border-base-200 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link 
            to="/all-notes" 
            className="btn btn-ghost flex-1"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary flex-1"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Saving..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePage;
