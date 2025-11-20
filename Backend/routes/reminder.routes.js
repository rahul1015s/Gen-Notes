import express from 'express';
import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  snoozeReminder,
  getUpcomingReminders,
  dismissReminder,
} from '../controllers/reminder.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Reminder endpoints
router.post('/', createReminder); // Create reminder
router.get('/', getReminders); // Get all reminders for user or specific note
router.get('/upcoming', getUpcomingReminders); // Get reminders for next 24 hours
router.patch('/:reminderId', updateReminder); // Update reminder
router.delete('/:reminderId', deleteReminder); // Delete reminder
router.post('/:reminderId/snooze', snoozeReminder); // Snooze reminder
router.post('/:reminderId/dismiss', dismissReminder); // Dismiss notification

export default router;
