import React, { useState } from 'react';
import { Link } from 'react-router-dom'; 
import { Trash2Icon } from 'lucide-react';
import { formatDate } from '../lib/utils.js';
import api from '../lib/axios.js';
import toast from 'react-hot-toast';

const NoteCard = ({ note, setNotes }) => {

    // Local state to control visibility of delete confirmation modal
    const [showModal, setShowModal] = useState(false);
    
    // Function to handle note deletion
    const handleDelete = async (e, id) => {
        
        try {
            // API call to delete note by ID
            await api.delete(`/notes/${id}`);

            // Remove deleted note from UI by filtering state
            setNotes((prev) => prev.filter(note => note._id !== id));

            toast.success("Note deleted successfully.");
        } catch (error) {
            toast.error("Failed to delete Note.");
        }
    };

    return (
        <>
            {/* Clickable card, navigates to note detail page */}
            <Link to={`/note/${note._id}`}
                className='card bg-base-100 hover:shadow-lg transition-all duration-200 border-1 border-solid'
            >
                <div className='card-body'>

                    {/* Note title */}
                    <h3 className='card-title text-base-conten/45'>{note.title}</h3>

                    {/* Note content (truncated to 3 lines) */}
                    <p className='text-base-content/70 line-clamp-3'>{note.content}</p>

                    {/* Footer with created date and delete button */}
                    <div className='card-actions items-center justify-between mt-4'>
                        <span className='text-sm text-base-content/60'>
                            Created: {formatDate(note.createdAt)}
                        </span>
                        
                        {/* Delete button triggers confirmation modal */}
                        <button className='btn btn-ghost btn-xs text-error'
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation(); // Prevent navigation when clicking delete
                                setShowModal(true);
                            }}
                        >
                            <Trash2Icon className='size-4' />
                        </button>
                    </div>
                </div>
            </Link>

            {/* Delete Confirmation Modal */}
            {showModal && (
                <dialog open className="modal modal-bottom sm:modal-middle">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg">Delete Note?</h3>
                        <p className="py-4">This action cannot be undone.</p>
                        <div className="modal-action">
                            
                            {/* Cancel button to close modal */}
                            <button
                                className="btn btn-ghost"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowModal(false);
                                }}
                            >
                                Cancel
                            </button>

                            {/* Confirm Delete */}
                            <button
                                className="btn btn-error"
                                onClick={(e) => {
                                    handleDelete(e, note._id);
                                    setShowModal(false);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </>
    );
};

export default NoteCard;
