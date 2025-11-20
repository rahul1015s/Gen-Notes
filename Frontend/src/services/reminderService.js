import api from '../lib/axios.js';

class ReminderService {
  async createReminder(noteId, reminder) {
    const res = await api.post('/api/v1/reminders', {
      noteId,
      ...reminder,
    });
    return res.data;
  }

  async getReminders(noteId) {
    const res = await api.get('/api/v1/reminders', {
      params: { noteId },
    });
    return res.data;
  }

  async getUpcomingReminders() {
    const res = await api.get('/api/v1/reminders/upcoming');
    return res.data;
  }

  async updateReminder(reminderId, updates) {
    const res = await api.patch(`/api/v1/reminders/${reminderId}`, updates);
    return res.data;
  }

  async deleteReminder(reminderId) {
    const res = await api.delete(`/api/v1/reminders/${reminderId}`);
    return res.data;
  }

  async snoozeReminder(reminderId, minutes = 10) {
    const res = await api.post(`/api/v1/reminders/${reminderId}/snooze`, {
      minutes,
    });
    return res.data;
  }

  async dismissReminder(reminderId) {
    const res = await api.post(`/api/v1/reminders/${reminderId}/dismiss`);
    return res.data;
  }

  // Check for upcoming reminders and show notifications
  async checkUpcomingReminders() {
    try {
      const reminders = await this.getUpcomingReminders();

      reminders.forEach((reminder) => {
        const now = new Date();
        const reminderTime = new Date(reminder.reminderTime);
        const diff = reminderTime - now;

        // Show notification if within 5 minutes
        if (diff > 0 && diff <= 5 * 60 * 1000 && !reminder.notificationSent) {
          this.showNotification(reminder);
        }
      });
    } catch (err) {
      console.error('Failed to check reminders', err);
    }
  }

  // Show PWA notification
  showNotification(reminder) {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        const notif = new Notification('🔔 Reminder', {
          body: reminder.title,
          icon: '/favicon/favicon-96x96.png',
          badge: '/favicon/favicon-96x96.png',
          tag: `reminder-${reminder._id}`,
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.open(`/note/${reminder.noteId._id || reminder.noteId}`, '_self');
        };

        // Auto-dismiss after 10 seconds
        setTimeout(() => notif.close(), 10000);
      }
    }
  }

  // Request notification permission
  static async requestNotificationPermission() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        return true;
      }
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
    }
    return false;
  }

  // Start reminder checking interval
  startReminderCheck(intervalMinutes = 1) {
    this.reminderCheckInterval = setInterval(() => {
      this.checkUpcomingReminders();
    }, intervalMinutes * 60 * 1000);

    // Initial check
    this.checkUpcomingReminders();
  }

  // Stop reminder checking
  stopReminderCheck() {
    if (this.reminderCheckInterval) {
      clearInterval(this.reminderCheckInterval);
    }
  }
}

export default new ReminderService();
