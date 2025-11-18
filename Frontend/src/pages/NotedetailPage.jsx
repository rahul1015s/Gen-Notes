import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, Loader2, Trash2Icon, PenSquareIcon, SaveIcon, XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { formatDate } from '../lib/utils.js';
import RichTextEditor from '../components/TiptapEditor.jsx';

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
  const { id } = useParams(); // Get note ID from URL params

  // Fetch note details when component mounts or 'id' changes
  useEffect(() => {
    const fetchNote = async () => {
      try {
        const res = await api.get(`/api/v1/notes/${id}`);
        setNote(res.data); // Store note data in state
      } catch (error) {
        toast.error("Failed to fetch the note"); // Show error toast
      } finally {
        setLoading(false); // Hide loader
      }
    };
    fetchNote();
  }, [id]);

  // Handle note deletion
  const handleDelete = async () => {
    try {
      await api.delete(`/api/v1/notes/${id}`);
      toast.success("Note deleted successfully");
      navigate('/'); // Go back to homepage after deletion
    } catch (error) {
      toast.error("Failed to delete note");
    }
  };

  // Handle saving the updated note
  const handleSave = async () => {
    if (!note.title.trim() || !note.content.trim()) {
      toast.error("Title and content cannot be empty");
      return;
    }

    setSaving(true);
    try {
      await api.put(`/api/v1/notes/${id}`, note);
      toast.success("Note updated successfully");
      setIsEditing(false); // Exit edit mode
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false); // Re-enable Save button
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
  if (!note) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-base-content/80">Note not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <main className="mx-auto max-w-3xl px-4 py-8">

        {/* Header with Back button and actions */}
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="btn btn-ghost">
            <ArrowLeftIcon className="size-5" />
            Back to Notes
          </Link>

          {/* Show Edit/Delete buttons only if not editing */}
          {!isEditing && (
            <div className="flex gap-2">
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <PenSquareIcon className="size-5" />
                Edit Note
              </button>
              <button
                className="btn btn-error btn-outline"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2Icon className="size-5" />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Note Content Card */}
        <div className="card bg-base-100 border border-base-200">
          <div className="card-body p-6">

            {/* Edit Mode */}
            {isEditing ? (
              <div className="space-y-6">

                {/* Editing header with close button */}
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Editing Note</h2>
                  <button
                    className="btn btn-ghost btn-circle"
                    onClick={() => setIsEditing(false)}
                  >
                    <XIcon className="size-5" />
                  </button>
                </div>

                {/* Title input */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Title</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered w-full"
                    value={note.title}
                    onChange={(e) => setNote({ ...note, title: e.target.value })}
                    autoFocus
                  />
                </div>

                {/* Content textarea
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Content</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-64 w-full"
                    value={note.content}
                    onChange={(e) => setNote({ ...note, content: e.target.value })}
                  />
                </div> */}

                {/* Rich Text Editor for content */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Content</span>
                  </label>
                  <RichTextEditor
                    value={note.content}
                    onChange={(html) => setNote({ ...note, content: html })}
                  />
                </div>


                {/* Save/Cancel buttons */}
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    className="btn btn-ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary gap-2"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <SaveIcon className="size-5" />
                    )}
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <h1 className="card-title text-2xl mb-2">{note.title}</h1>

                {/* Created and Updated dates */}
                <div className="flex items-center gap-2 text-sm text-base-content/60 mb-4">
                  <span>Created: {formatDate(note.createdAt)}</span>
                  {note.updatedAt !== note.createdAt && (
                    <span>• Updated: {formatDate(note.updatedAt)}</span>
                  )}
                </div>

                {/* Note content */}
                <div className="prose max-w-none">
                  <div className="p-4 bg-base-200 rounded-lg">
                    {/* <pre className="whitespace-pre-wrap font-sans text-base">
                      {note.content}
                    </pre> */}
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: note.content }}
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
              <p className="py-4">Are you sure you want to delete this note? This action cannot be undone.</p>
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
          </dialog>
        )}
      </main>
    </div>
  );
};

export default NotedetailPage;
