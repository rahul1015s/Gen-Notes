import Reminder from '../models/reminder.model.js';

export async function createReminder(req, res) {
  try {
    const { noteId, title, description, reminderTime, type = 'ONE_TIME', repeatDays } = req.body;
    const userId = req.user._id;

    if (!noteId || !title || !reminderTime) {
      return res.status(400).json({ message: 'noteId, title, and reminderTime are required' });
    }

    const reminder = await Reminder.create({
      noteId,
      userId,
      title,
      description,
      reminderTime: new Date(reminderTime),
      type,
      repeatDays: repeatDays || [],
      isActive: true,
      nextOccurrence: new Date(reminderTime),
    });

    res.status(201).json({ message: 'Reminder created', reminder });
  } catch (error) {
    console.error('Error creating reminder', error);
    res.status(500).json({ message: 'Failed to create reminder' });
  }
}

export async function getReminders(req, res) {
  try {
    const userId = req.user._id;
    const { noteId } = req.query;

    let query = { userId };
    if (noteId) {
      query.noteId = noteId;
    }

    const reminders = await Reminder.find(query)
      .populate('noteId', 'title')
      .sort({ reminderTime: 1 });

    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching reminders', error);
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
}

export async function updateReminder(req, res) {
  try {
    const { reminderId } = req.params;
    const { title, description, reminderTime, type, repeatDays, isActive } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (reminderTime) updateData.reminderTime = new Date(reminderTime);
    if (type) updateData.type = type;
    if (repeatDays) updateData.repeatDays = repeatDays;
    if (isActive !== undefined) updateData.isActive = isActive;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, userId },
      updateData,
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json({ message: 'Reminder updated', reminder });
  } catch (error) {
    console.error('Error updating reminder', error);
    res.status(500).json({ message: 'Failed to update reminder' });
  }
}

export async function deleteReminder(req, res) {
  try {
    const { reminderId } = req.params;
    const userId = req.user._id;

    const reminder = await Reminder.findOneAndDelete({ _id: reminderId, userId });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json({ message: 'Reminder deleted' });
  } catch (error) {
    console.error('Error deleting reminder', error);
    res.status(500).json({ message: 'Failed to delete reminder' });
  }
}

export async function snoozeReminder(req, res) {
  try {
    const { reminderId } = req.params;
    const { minutes = 10 } = req.body;
    const userId = req.user._id;

    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);

    const reminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, userId },
      { 
        isSnoozed: true,
        snoozeUntil,
        notificationSent: false,
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json({ message: `Reminder snoozed for ${minutes} minutes`, reminder });
  } catch (error) {
    console.error('Error snoozing reminder', error);
    res.status(500).json({ message: 'Failed to snooze reminder' });
  }
}

export async function getUpcomingReminders(req, res) {
  try {
    const userId = req.user._id;

    const reminders = await Reminder.find({
      userId,
      isActive: true,
      isSnoozed: false,
      reminderTime: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) }, // Next 24 hours
    })
      .populate('noteId', 'title')
      .sort({ reminderTime: 1 });

    res.status(200).json(reminders);
  } catch (error) {
    console.error('Error fetching upcoming reminders', error);
    res.status(500).json({ message: 'Failed to fetch reminders' });
  }
}

export async function dismissReminder(req, res) {
  try {
    const { reminderId } = req.params;
    const userId = req.user._id;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, userId },
      { 
        notificationSent: true,
        lastNotificationTime: new Date(),
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.status(200).json({ message: 'Reminder dismissed', reminder });
  } catch (error) {
    console.error('Error dismissing reminder', error);
    res.status(500).json({ message: 'Failed to dismiss reminder' });
  }
}
