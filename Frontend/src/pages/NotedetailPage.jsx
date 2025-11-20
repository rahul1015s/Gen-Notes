import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, Loader2, Trash2Icon, PenSquareIcon, SaveIcon, XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { formatDate } from '../lib/utils.js';
import RichTextEditor from '../components/TiptapEditor.jsx';
import DOMPurify from 'dompurify';

const NotedetailPage = () => {
  // State to hold note details
  const [note, setNote] = useState({ title: '', content: '' });

  // Loading state for initial fetch
  const [loading, setLoading] = useState(true);

  // State to control delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Saving state for disabling button during save
  const [saving, setSaving] = useState(false);

  // State to toggle edit mode
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch note details when component mounts or 'id' changes
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/api/v1/notes/${id}`);
        setNote(res.data);
      } catch (error) {
        toast.error("Failed to fetch the note");
        navigate('/all-notes');
      } finally {
        setLoading(false);
      }
    };
    fetchNote();
  }, [id, navigate]);

  // Handle note deletion
  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/notes/${id}`);
      toast.success("Note deleted successfully");
      navigate('/all-notes');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete note");
    }
  };

  // Handle saving the updated note
  const handleSave = async () => {
    if (!note.title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    // Check if content has actual text (not just empty HTML)
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
      toast.success("Note updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Show loader while fetching note
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  // Show message if note not found
  if (!note || !note._id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base-content/80 text-lg">Note not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <main className="mx-auto max-w-4xl px-4 py-8">

        {/* Header with Back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/all-notes" className="btn btn-ghost gap-2">
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          {/* Show Edit/Delete buttons only if not editing */}
          {!isEditing && (
            <div className="flex gap-2">
              <button
                className="btn btn-primary gap-2"
                onClick={() => setIsEditing(true)}
              >
                <PenSquareIcon className="size-5" />
                Edit
              </button>
              <button
                className="btn btn-error btn-outline gap-2"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2Icon className="size-5" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Note Content Card */}
        <div className="card bg-base-100 border border-base-200 shadow-md">
          <div className="card-body p-6 space-y-6">

            {/* Edit Mode */}
            {isEditing ? (
              <>
                {/* Editing header with close button */}
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

                {/* Title input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Title <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full focus:input-primary"
                    value={note.title}
                    onChange={(e) => setNote({ ...note, title: e.target.value })}
                    placeholder="Note title"
                    autoFocus
                    disabled={saving}
                  />
                </div>

                {/* Rich Text Editor for content */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Content <span className="text-error">*</span></span>
                  </label>
                  <RichTextEditor
                    value={note.content}
                    onChange={(html) => setNote({ ...note, content: html })}
                    height="500px"
                  />
                </div>

                {/* Save/Cancel buttons */}
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
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon className="size-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              // View Mode
              <>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{note.title}</h1>

                  {/* Created and Updated dates */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                    <span>📅 Created: {formatDate(note.createdAt)}</span>
                    {note.updatedAt !== note.createdAt && (
                      <span>✏️ Updated: {formatDate(note.updatedAt)}</span>
                    )}
                  </div>
                </div>

                {/* Note content */}
                <div className="divider"></div>
                <div className="prose prose-sm max-w-none">
                  <div className="p-4 bg-base-200 rounded-lg">
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(note.content)
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <dialog open className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Delete Note?</h3>
              <p className="py-4">
                Are you sure you want to delete <strong>"{note.title}"</strong>? 
                <br />
                This action cannot be undone.
              </p>
              <div className="modal-action">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-error"
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
