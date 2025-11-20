// Reminders Service
import api from "../lib/axios";

class RemindersService {
  /**
   * Create a reminder for a note
   */
  async createReminder(noteId, type, dateTime, message = "") {
    try {
      const response = await api.post(`/api/v1/reminders`, {
        noteId,
        type, // 'once', 'daily', 'weekly', 'monthly'
        dateTime,
        message,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to create reminder";
    }
  }

  /**
   * Get reminders for a note
   */
  async getReminders(noteId) {
    try {
      const response = await api.get(`/api/v1/reminders?noteId=${noteId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch reminders";
    }
  }

  /**
   * Update reminder
   */
  async updateReminder(reminderId, updates) {
    try {
      const response = await api.put(`/api/v1/reminders/${reminderId}`, updates);
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to update reminder";
    }
  }

  /**
   * Delete reminder
   */
  async deleteReminder(reminderId) {
    try {
      await api.delete(`/api/v1/reminders/${reminderId}`);
    } catch (error) {
      throw error.response?.data?.message || "Failed to delete reminder";
    }
  }

  /**
   * Snooze reminder (postpone by minutes)
   */
  async snoozeReminder(reminderId, minutes = 10) {
    try {
      const newTime = new Date(Date.now() + minutes * 60000);
      return await this.updateReminder(reminderId, { dateTime: newTime });
    } catch (error) {
      throw error.message;
    }
  }

  /**
   * Get all upcoming reminders
   */
  async getUpcomingReminders() {
    try {
      const response = await api.get("/api/v1/reminders/upcoming");
      return response.data;
    } catch (error) {
      throw error.response?.data?.message || "Failed to fetch upcoming reminders";
    }
  }

  /**
   * Send notification (using Notification API)
   */
  sendNotification(title, options = {}) {
    if (!("Notification" in window)) {
      console.warn("Browser does not support notifications");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification(title, {
        icon: "/favicon/favicon.ico",
        badge: "/favicon/favicon.ico",
        ...options,
      });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, options);
        }
      });
    }
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  }

  /**
   * Calculate next reminder time based on recurrence
   */
  getNextReminderTime(type, baseTime = new Date()) {
    const date = new Date(baseTime);

    switch (type) {
      case "daily":
        date.setDate(date.getDate() + 1);
        break;
      case "weekly":
        date.setDate(date.getDate() + 7);
        break;
      case "monthly":
        date.setMonth(date.getMonth() + 1);
        break;
      default:
        return null;
    }

    return date;
  }
}

export default new RemindersService();
