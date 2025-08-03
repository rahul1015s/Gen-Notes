import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import RateLimitedUi from '../components/RateLimitedUi.jsx';
import toast from "react-hot-toast";
import NoteCard from '../components/NoteCard.jsx';
import { Loader2, Plus } from 'lucide-react';
import api from '../lib/axios.js';
import NotesnotFound from '../components/NotesnotFound.jsx';

const AllNotes = () => {
  const [rateLimit, setRateLimit] = useState(false);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        setNotes(res.data);
        setRateLimit(false);
      } catch (error) {
        if (error.response?.status === 429) {
          setRateLimit(true);
        } else {
          toast.error('Failed to fetch notes');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  return (
    <div className='min-h-screen bg-base-100'>
      <Navbar />

      <main className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8'>
        {rateLimit && <RateLimitedUi />}

        {loading ? (
          <div className='flex flex-col items-center justify-center py-20'>
            <Loader2 className='h-8 w-8 text-primary animate-spin' />
            <p className='mt-4 text-base-content/80'>Loading your notes...</p>
          </div>
        ) : notes.length > 0 && !rateLimit ? (
          <div className="columns-2 sm:columns-2 lg:columns-3 gap-4 space-y-4 px-1">
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </div>
        ) : (
          !rateLimit && <NotesnotFound />
        )}
      </main>

      {/* Floating Add Note Button (only on small screens) */}
      <button
        className="sm:hidden fixed bottom-6 right-6 btn btn-primary btn-circle shadow-lg z-50"
        onClick={() => navigate("/create")}
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AllNotes;
