import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Trash2Icon, PenSquareIcon, SaveIcon, XIcon, ShareIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { formatDate } from '../lib/utils.js';
import RichTextEditor from '../components/TiptapEditor.jsx';
import NoteLockSettings from '../components/NoteLockSettings.jsx';
import ReminderManager from '../components/ReminderManager.jsx';
import PinLockModal from '../components/PinLockModal.jsx';
import DOMPurify from 'dompurify';

const NotedetailPage = () => {
  const [note, setNote] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/api/v1/notes/${id}`);
        setNote(res.data);
        
        // Check if note is locked
        try {
          const lockRes = await api.get(`/api/v1/locks/${id}`);
          if (lockRes.data.isLocked) {
            setIsLocked(true);
            setShowPinModal(true);
          }
        } catch (err) {
          // No lock found
        }
      } catch (error) {
        toast.error("Failed to load note");
        navigate('/all-notes');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/notes/${id}`);
      toast.success("Note deleted");
      navigate('/all-notes');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    }
  };

  const handleSave = async () => {
    if (!note.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = note.content;
    const textContent = tempDiv.textContent || tempDiv.innerText || "";
    
    if (!textContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/v1/notes/${id}`, {
        title: note.title.trim(),
        content: note.content
      });
      toast.success("Note updated ✅");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!note || !note._id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base-content/60">Note not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200">
      {/* PIN Lock Modal */}
      <PinLockModal
        noteId={id}
        isOpen={showPinModal}
        onClose={() => setShowPinModal(false)}
        onUnlocked={() => {
          setIsLocked(false);
          setShowPinModal(false);
        }}
      />

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Header with Actions */}
        <div className="flex justify-between items-center mb-8">
          <Link 
            to="/all-notes" 
            className="btn btn-ghost gap-2 rounded-lg hover:bg-base-300"
          >
            <ArrowLeft className="size-5" />
            <span className="hidden sm:inline">Back</span>
          </Link>

          {!isEditing && (
            <div className="flex gap-2">
              <button
                className="btn btn-primary gap-2"
                onClick={() => setIsEditing(true)}
              >
                <PenSquareIcon className="size-5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
              <button
                className="btn btn-error btn-outline gap-2"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2Icon className="size-5" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Main Card */}
        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">

            {isEditing ? (
              <>
                {/* Edit Mode */}
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Edit Note</h2>
                  <button
                    className="btn btn-ghost btn-circle"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    <XIcon className="size-5" />
                  </button>
                </div>

                {/* Title Input */}
                <div>
                  <input
                    type="text"
                    className="w-full text-3xl font-bold bg-transparent border-0 focus:outline-none focus:ring-0 text-base-content"
                    value={note.title}
                    onChange={(e) => setNote({ ...note, title: e.target.value })}
                    placeholder="Note title"
                    autoFocus
                    disabled={saving}
                  />
                  <div className="h-px bg-base-300 mt-4"></div>
                </div>

                {/* Content Editor */}
                <RichTextEditor
                  value={note.content}
                  onChange={(html) => setNote({ ...note, content: html })}
                  height="500px"
                />

                {/* Save Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-base-200">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="size-5" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div>
                  <h1 className="text-4xl font-bold mb-4 text-base-content">{note.title}</h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                    <span title={new Date(note.createdAt).toLocaleString()}>
                      📅 {formatDate(note.createdAt)}
                    </span>
                    {note.updatedAt !== note.createdAt && (
                      <span title={new Date(note.updatedAt).toLocaleString()}>
                        ✏️ Updated: {formatDate(note.updatedAt)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-base-300 via-base-300 to-transparent"></div>

                {/* Content */}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <div className="bg-base-50 rounded-xl p-6 border border-base-200/50">
                    <div
                      className="prose max-w-none dark:prose-invert text-base-content"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(note.content)
                      }}
                    />
                  </div>
                </div>

                {/* Settings Toggle Button */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="btn btn-outline btn-sm gap-2"
                  >
                    {showSettings ? '▲ Hide Settings' : '▼ Note Settings'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {!isEditing && showSettings && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {/* Lock Settings */}
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 p-6">
              <NoteLockSettings 
                noteId={id}
                onLockStatusChange={(locked) => setIsLocked(locked)}
              />
            </div>

            {/* Reminders */}
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 p-6">
              <ReminderManager noteId={id} />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <dialog open className="modal modal-bottom sm:modal-middle">
            <div className="modal-box max-w-sm">
              <h3 className="font-bold text-lg mb-2">Delete Note?</h3>
              <p className="text-sm text-base-content/80 mb-6">
                Delete "<strong>{note.title}</strong>"? This action can't be undone.
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => {
                    handleDelete();
                    setShowDeleteModal(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <form method="dialog" className="modal-backdrop">
              <button onClick={() => setShowDeleteModal(false)}>close</button>
            </form>
          </dialog>
        )}
      </main>
    </div>
  );
};

export default NotedetailPage;
