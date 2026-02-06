import mongoose from 'mongoose';

const noteLockSchema = new mongoose.Schema(
  {
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lockType: {
      type: String,
      enum: ['PIN', 'PASSWORD', 'PIN_PASSWORD', 'BIOMETRIC', 'PASSKEY'],
      default: 'PIN',
    },
    pinHash: String, // bcryptjs hashed PIN
    passwordHash: String, // bcryptjs hashed password
    biometricEnabled: {
      type: Boolean,
      default: false,
    },
    passkeyCredentialId: String, // WebAuthn credential ID
    isLocked: {
      type: Boolean,
      default: true,
    },
    failedAttempts: {
      type: Number,
      default: 0,
    },
    lastFailedAttempt: Date,
    lockedUntil: Date, // Timestamp when to unlock after failed attempts
  },
  { timestamps: true }
);

// Index for fast queries
noteLockSchema.index({ userId: 1, isLocked: 1 });

export default mongoose.model('NoteLock', noteLockSchema);
