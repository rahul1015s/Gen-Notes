import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2Icon } from 'lucide-react';
import { formatDate } from '../lib/utils.js';
import api from '../lib/axios.js';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';

const bgColors = [
  'bg-yellow-100 text-yellow-900',
  'bg-green-100 text-green-900',
  'bg-blue-100 text-blue-900',
  'bg-pink-100 text-pink-900',
  'bg-purple-100 text-purple-900',
  'bg-orange-100 text-orange-900'
];

const NoteCard = ({ note, setNotes }) => {
  const [showModal, setShowModal] = useState(false);
  const [bgClass, setBgClass] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Assign consistent background color based on note ID
  useEffect(() => {
    const hash = note._id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colorIndex = hash % bgColors.length;
    setBgClass(bgColors[colorIndex]);
  }, [note._id]);

  const handleDelete = async (e, id) => {
    e.preventDefault();
    setIsDeleting(true);
    
    try {
      await api.delete(`/notes/${id}`);
      setNotes((prev) => prev.filter(note => note._id !== id));
      toast.success("Note deleted successfully");
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
      {/* Clickable Note Card */}
      <Link
        to={`/note/${note._id}`}
        className={`relative inline-block w-full break-inside-avoid card shadow-md hover:shadow-xl transition duration-200 ${bgClass} border border-base-200 hover:-translate-y-1`}
        aria-label={`View note: ${note.title}`}
      >
        <div className="card-body">
          {/* Title with truncation */}
          <h3 className="text-lg font-semibold truncate" title={note.title}>
            {note.title || 'Untitled Note'}
          </h3>

          {/* Content Preview */}
          <div
            className="prose max-w-none text-sm opacity-80 line-clamp-3 overflow-hidden"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(note.content || '<p>No content</p>'),
            }}
            aria-label="Note content preview"
          />

          {/* Footer with date and delete button */}
          <div className="card-actions items-center justify-between mt-4">
            <span className="text-xs opacity-60" title={`Created on ${new Date(note.createdAt).toLocaleString()}`}>
              {formatDate(note.createdAt)}
            </span>

            <button
              className="btn btn-ghost btn-xs text-error hover:bg-error/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowModal(true);
              }}
              aria-label="Delete note"
            >
              <Trash2Icon className="size-4" />
            </button>
          </div>
        </div>
      </Link>

      {/* Delete Confirmation Modal */}
      <dialog 
        open={showModal} 
        className="modal modal-bottom sm:modal-middle"
        onClose={() => setShowModal(false)}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg">Delete Note?</h3>
          <p className="py-4">Are you sure you want to delete "<strong>{note.title || 'Untitled Note'}</strong>"? This action cannot be undone.</p>
          <div className="modal-action">
            <button
              className="btn btn-ghost"
              onClick={(e) => {
                e.preventDefault();
                setShowModal(false);
              }}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              className="btn btn-error"
              onClick={(e) => handleDelete(e, note._id)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="loading loading-spinner"></span>
              ) : 'Delete'}
            </button>
          </div>
        </div>
        
        {/* Click outside to close */}
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setShowModal(false)}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default NoteCard;