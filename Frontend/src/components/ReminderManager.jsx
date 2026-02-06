import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Loader2, Clock, RefreshCw, Pause } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios.js';
import { ensurePushSubscription } from '../services/pushService.js';

const ReminderManager = ({ noteId }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    reminderTime: '',
    type: 'ONE_TIME',
  });

  useEffect(() => {
    fetchReminders();
  }, [noteId]);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/reminders', {
        params: { noteId },
      });
      setReminders(res.data);
    } catch (err) {
      console.error('Failed to fetch reminders', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReminder = async () => {
    if (!formData.title.trim() || !formData.reminderTime) {
      toast.error('Title and time are required');
      return;
    }

    try {
      setLoading(true);
      try {
        await ensurePushSubscription();
      } catch (err) {
        toast.error(err.message || 'Notifications not enabled');
      }
      await api.post('/api/v1/reminders', {
        noteId,
        title: formData.title,
        reminderTime: formData.reminderTime,
        type: formData.type,
      });

      toast.success('✅ Reminder created');
      setFormData({ title: '', reminderTime: '', type: 'ONE_TIME' });
      setShowForm(false);
      fetchReminders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    try {
      await api.delete(`/api/v1/reminders/${reminderId}`);
      toast.success('✅ Reminder deleted');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to delete reminder');
    }
  };

  const handleSnoozeReminder = async (reminderId) => {
    try {
      await api.post(`/api/v1/reminders/${reminderId}/snooze`, { minutes: 10 });
      toast.success('⏰ Reminder snoozed for 10 minutes');
      fetchReminders();
    } catch (err) {
      toast.error('Failed to snooze reminder');
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Reminders
        </h3>
        {reminders.length > 0 && (
          <span className="badge badge-primary">{reminders.length}</span>
        )}
      </div>

      {/* Reminders List */}
      {loading ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : reminders.length === 0 ? (
        <div className="text-center py-6 text-base-content/50">
          <p className="text-sm">No reminders yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {reminders.map((reminder) => (
            <div
              key={reminder._id}
              className="bg-base-100 border border-base-200 rounded-lg p-3 flex items-start justify-between hover:border-base-300 transition"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{reminder.title}</p>
                <div className="flex items-center gap-2 text-xs text-base-content/60 mt-1">
                  <Clock className="w-3 h-3" />
                  {formatTime(reminder.reminderTime)}
                </div>
                {reminder.type !== 'ONE_TIME' && (
                  <div className="flex items-center gap-2 text-xs text-primary mt-1">
                    <RefreshCw className="w-3 h-3" />
                    Repeats {reminder.type.toLowerCase()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 ml-2">
                <button
                  onClick={() => handleSnoozeReminder(reminder._id)}
                  className="btn btn-ghost btn-xs"
                  title="Snooze 10 mins"
                >
                  <Pause className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDeleteReminder(reminder._id)}
                  className="btn btn-ghost btn-xs text-error"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Reminder Form */}
      {showForm ? (
        <div className="bg-base-200 rounded-lg p-4 space-y-3">
          <input
            type="text"
            placeholder="Reminder title"
            className="input input-bordered w-full input-sm focus:input-primary"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            disabled={loading}
          />

          <input
            type="datetime-local"
            className="input input-bordered w-full input-sm focus:input-primary"
            value={formData.reminderTime}
            onChange={(e) =>
              setFormData({ ...formData, reminderTime: e.target.value })
            }
            disabled={loading}
          />

          <select
            className="select select-bordered w-full select-sm focus:select-primary"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
            disabled={loading}
          >
            <option value="ONE_TIME">One Time</option>
            <option value="DAILY">Daily</option>
            <option value="WEEKLY">Weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={() => setShowForm(false)}
              className="btn btn-ghost btn-sm flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleAddReminder}
              className="btn btn-primary btn-sm flex-1 gap-2"
              disabled={loading}
            >
              {loading && <Loader2 className="w-3 h-3 animate-spin" />}
              Create
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-outline btn-sm w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Reminder
        </button>
      )}
    </div>
  );
};

export default ReminderManager;
