import Reminder from '../models/reminder.model.js';
import { sendPushToUser } from './push.service.js';

const INTERVAL_MS = 30 * 1000;

function getNextOccurrence(reminder) {
  const base = reminder.reminderTime ? new Date(reminder.reminderTime) : new Date();
  switch (reminder.type) {
    case 'DAILY':
      return new Date(base.getTime() + 24 * 60 * 60 * 1000);
    case 'WEEKLY':
      return new Date(base.getTime() + 7 * 24 * 60 * 60 * 1000);
    case 'MONTHLY': {
      const next = new Date(base);
      next.setMonth(next.getMonth() + 1);
      return next;
    }
    default:
      return null;
  }
}

export function startReminderScheduler() {
  setInterval(async () => {
    try {
      const now = new Date();

      const due = await Reminder.find({
        isActive: true,
        notificationSent: false,
        $or: [
          { isSnoozed: false },
          { isSnoozed: true, snoozeUntil: { $lte: now } },
        ],
        reminderTime: { $lte: now },
      }).lean();

      for (const reminder of due) {
        const payload = {
          title: reminder.title || 'Reminder',
          body: reminder.description || 'You have a scheduled reminder.',
          url: `/note/${reminder.noteId}`,
          tag: `reminder-${reminder._id}`,
        };

        await sendPushToUser(reminder.userId, payload);

        if (reminder.type === 'ONE_TIME') {
          await Reminder.updateOne(
            { _id: reminder._id },
            {
              notificationSent: true,
              lastNotificationTime: new Date(),
              isSnoozed: false,
              snoozeUntil: null,
            }
          );
        } else {
          const next = getNextOccurrence(reminder);
          await Reminder.updateOne(
            { _id: reminder._id },
            {
              reminderTime: next || reminder.reminderTime,
              nextOccurrence: next || reminder.reminderTime,
              notificationSent: false,
              lastNotificationTime: new Date(),
              isSnoozed: false,
              snoozeUntil: null,
            }
          );
        }
      }
    } catch (error) {
      console.error('Reminder scheduler error', error);
    }
  }, INTERVAL_MS);
}
