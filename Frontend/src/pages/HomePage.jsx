import React, { useEffect, useState } from 'react'
import Navbar from '../components/Navbar';
import RateLimitedUi from '../components/RateLimitedUi';
import toast from "react-hot-toast";
import NoteCard from '../components/NoteCard';
import { Loader2 } from 'lucide-react';
import api from '../lib/axios.js';
import NotesnotFound from '../components/NotesnotFound.jsx';


const HomePage = () => {
  const [rateLimit, setRateLimit] = useState(false)
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const res = await api.get("/notes");
        setNotes(res.data);
        setRateLimit(false);
      } catch (error) {
        if(error.response?.status === 429){
          setRateLimit(true);
        } else {
          toast.error('Failed to fetch notes');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchNotes();
  }, [])

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
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
            {notes.map((note) => (
              <NoteCard key={note._id} note={note} setNotes={setNotes} />
            ))}
          </div>
        ) : (
          !rateLimit && <NotesnotFound />
            
          
        )}
      </main>
    </div>
  )
}

export default HomePage;