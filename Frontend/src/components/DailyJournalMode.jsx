import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Loader2, ChevronLeft, ChevronRight, Coffee, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';

const DailyJournalMode = ({ folderId }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [journalNotes, setJournalNotes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchJournalNotes();
  }, [selectedDate, folderId]);

  const fetchJournalNotes = async () => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await api.get('/api/v1/notes');
      const notes = res.data;

      // Find morning and evening notes for this date
      const morning = notes.find(
        (n) =>
          n.title?.includes(`📝 Morning Entry - ${dateStr}`) &&
          (!folderId || n.folderId === folderId)
      );
      const evening = notes.find(
        (n) =>
          n.title?.includes(`📝 Evening Entry - ${dateStr}`) &&
          (!folderId || n.folderId === folderId)
      );

      setJournalNotes({ morning, evening });
    } catch (err) {
      console.error('Failed to fetch journal notes', err);
    } finally {
      setLoading(false);
    }
  };

  const createJournalEntry = async (type) => {
    try {
      setCreating(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      const title = `📝 ${type === 'morning' ? 'Morning' : 'Evening'} Entry - ${dateStr}`;

      const template =
        type === 'morning'
          ? `# Good Morning! 🌅\n\nToday's intentions:\n- \n- \n- \n\nFocus area: `
          : `# Evening Reflection 🌙\n\nToday's highlights:\n- \n- \n- \n\nTomorrow's goals: `;

      const res = await api.post('/api/v1/notes', {
        title,
        content: template,
        folderId: folderId || undefined,
      });

      toast.success(`✅ ${type === 'morning' ? 'Morning' : 'Evening'} entry created`);
      fetchJournalNotes();
    } catch (err) {
      toast.error('Failed to create entry');
    } finally {
      setCreating(false);
    }
  };

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const dateDisplay = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-2xl border border-base-200/50 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Daily Journal
        </h3>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-base-100 rounded-lg p-3 border border-base-200">
        <button
          onClick={handlePrevDay}
          className="btn btn-ghost btn-sm btn-circle"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="font-medium">{dateDisplay}</p>
          <p className="text-xs text-base-content/60">
            {selectedDate.toDateString() === new Date().toDateString()
              ? '(Today)'
              : ''}
          </p>
        </div>

        <button
          onClick={handleNextDay}
          className="btn btn-ghost btn-sm btn-circle"
          disabled={selectedDate > new Date()}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Jump to Today */}
      {selectedDate.toDateString() !== new Date().toDateString() && (
        <button
          onClick={handleToday}
          className="btn btn-outline btn-sm w-full"
        >
          Jump to Today
        </button>
      )}

      {/* Journal Entries */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {/* Morning Entry */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold text-sm">Morning Entry</h4>
              </div>
            </div>

            {journalNotes?.morning ? (
              <Link
                to={`/note/${journalNotes.morning._id}`}
                className="btn btn-sm btn-outline gap-2"
              >
                Edit Entry
              </Link>
            ) : (
              <button
                onClick={() => createJournalEntry('morning')}
                disabled={creating}
                className="btn btn-sm btn-outline gap-2"
              >
                {creating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Create Morning Entry
              </button>
            )}
          </div>

          {/* Evening Entry */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold text-sm">Evening Entry</h4>
              </div>
            </div>

            {journalNotes?.evening ? (
              <Link
                to={`/note/${journalNotes.evening._id}`}
                className="btn btn-sm btn-outline gap-2"
              >
                Edit Entry
              </Link>
            ) : (
              <button
                onClick={() => createJournalEntry('evening')}
                disabled={creating}
                className="btn btn-sm btn-outline gap-2"
              >
                {creating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3" />
                )}
                Create Evening Entry
              </button>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <p className="text-xs text-base-content/50 bg-base-200 rounded-lg p-3">
        💡 Create automatic morning and evening journal entries. Templates help you
        reflect on your day and set intentions.
      </p>
    </div>
  );
};

export default DailyJournalMode;
