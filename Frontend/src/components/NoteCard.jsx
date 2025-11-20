import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2Icon, PinIcon, ChevronRightIcon } from 'lucide-react';
import { formatDate } from '../lib/utils.js';
import api from '../lib/axios.js';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import pinService from '../services/pinService.js';

const NoteCard = ({ note, setNotes, isPinned = false, onPinChange, onDelete }) => {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPinning, setIsPinning] = useState(false);
  const [pinned, setPinned] = useState(isPinned);

  // Extract plain text preview
  const getPreview = (html) => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html || '<p></p>';
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.substring(0, 100).trim();
  };

  const handleTogglePin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPinning(true);

    try {
      const newPinState = !pinned;
      if (newPinState) {
        await pinService.pinNote(note._id);
        setPinned(true);
        toast.success('📌 Pinned');
      } else {
        await pinService.unpinNote(note._id);
        setPinned(false);
        toast.success('Unpinned');
      }

      if (onPinChange) {
        onPinChange(note._id, newPinState);
      }
    } catch (error) {
      console.error('Pin error:', error);
      toast.error('Pin action failed');
    } finally {
      setIsPinning(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    setIsDeleting(true);
    
    try {
      await api.delete(`/api/v1/notes/${id}`);
      setNotes((prev) => prev.filter(note => note._id !== id));
      if (onDelete) onDelete(id);
      toast.success("Note deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete note");
    } finally {
      setIsDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <>
      {/* Note Card - Apple Notes Style */}
      <Link
        to={`/note/${note._id}`}
        className="group relative block h-full overflow-hidden rounded-xl bg-gradient-to-br from-base-100 to-base-100/50 border border-base-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label={`View note: ${note.title}`}
      >
        {/* Background gradient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative h-full p-4 flex flex-col">
          {/* Pin Button */}
          <div className="absolute top-3 right-3 z-10">
            <button
              className={`btn btn-ghost btn-xs btn-circle transition-all ${
                pinned ? 'text-warning bg-warning/10' : 'opacity-0 group-hover:opacity-100'
              }`}
              onClick={handleTogglePin}
              disabled={isPinning}
              title={pinned ? 'Unpin note' : 'Pin note'}
              aria-label={pinned ? 'Unpin note' : 'Pin note'}
            >
              {isPinning ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <PinIcon className={`size-3.5 ${pinned ? 'fill-current' : ''}`} />
              )}
            </button>
          </div>

          {/* Title */}
          <h3 className="text-base font-semibold line-clamp-2 mb-2 text-base-content pr-8">
            {note.title || 'Untitled'}
          </h3>

          {/* Content Preview */}
          <p className="text-sm text-base-content/70 line-clamp-3 mb-auto leading-relaxed flex-1">
            {getPreview(note.content) || 'No content'}
          </p>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-base-200/50 flex items-center justify-between text-xs text-base-content/50">
            <span className="truncate" title={new Date(note.createdAt).toLocaleString()}>
              {formatDate(note.createdAt)}
            </span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowModal(true);
                }}
                aria-label="Delete note"
              >
                <Trash2Icon className="size-3.5" />
              </button>
              <ChevronRightIcon className="size-3.5" />
            </div>
          </div>
        </div>
      </Link>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <dialog 
          open={showModal} 
          className="modal modal-bottom sm:modal-middle"
          onClose={() => setShowModal(false)}
        >
          <div className="modal-box max-w-sm">
            <h3 className="font-bold text-lg mb-2">Delete Note?</h3>
            <p className="text-sm text-base-content/80 mb-6">
              Delete "<strong>{note.title || 'Untitled Note'}</strong>"? This can't be undone.
            </p>
            <div className="modal-action">
              <button
                className="btn btn-sm btn-ghost"
                onClick={(e) => {
                  e.preventDefault();
                  setShowModal(false);
                }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-error"
                onClick={(e) => handleDelete(e, note._id)}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
          
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setShowModal(false)}>close</button>
          </form>
        </dialog>
      )}
    </>
  );
};

export default NoteCard;