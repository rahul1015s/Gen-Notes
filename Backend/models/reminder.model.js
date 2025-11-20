import mongoose from 'mongoose';

const reminderSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    reminderTime: {
      type: Date,
      required: true,
    },
    type: {
      type: String,
      enum: ['ONE_TIME', 'DAILY', 'WEEKLY', 'MONTHLY'],
      default: 'ONE_TIME',
    },
    repeatDays: [Number], // [0-6] for weekly repeats (0=Sunday, 6=Saturday)
    isActive: {
      type: Boolean,
      default: true,
    },
    isSnoozed: {
      type: Boolean,
      default: false,
    },
    snoozeUntil: Date,
    notificationSent: {
      type: Boolean,
      default: false,
    },
    lastNotificationTime: Date,
    nextOccurrence: Date, // Calculated field for next reminder time
  },
  { timestamps: true }
);

// Index for fast queries
reminderSchema.index({ userId: 1, isActive: 1 });
reminderSchema.index({ reminderTime: 1, isActive: 1 });

export default mongoose.model('Reminder', reminderSchema);
