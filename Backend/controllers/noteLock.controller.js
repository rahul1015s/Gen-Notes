import NoteLock from '../models/noteLock.model.js';
import bcryptjs from 'bcryptjs';

export async function createNoteLock(req, res) {
  try {
    const { noteId, pin, lockType = 'PIN' } = req.body;
    const userId = req.user._id;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    // Check if lock already exists
    const existingLock = await NoteLock.findOne({ noteId, userId });
    if (existingLock) {
      return res.status(400).json({ message: 'Note is already locked' });
    }

    let lockData = {
      noteId,
      userId,
      lockType,
      isLocked: true,
    };

    // Hash PIN if provided
    if (pin && lockType === 'PIN') {
      const salt = await bcryptjs.genSalt(10);
      lockData.pinHash = await bcryptjs.hash(pin.toString(), salt);
    }

    const newLock = await NoteLock.create(lockData);
    res.status(201).json({ message: 'Note locked successfully', lock: newLock });
  } catch (error) {
    console.error('Error creating note lock', error);
    res.status(500).json({ message: 'Failed to create lock' });
  }
}

export async function verifyNoteLock(req, res) {
  try {
    const { noteId, pin } = req.body;
    const userId = req.user._id;

    if (!noteId || !pin) {
      return res.status(400).json({ message: 'noteId and pin are required' });
    }

    const lock = await NoteLock.findOne({ noteId, userId });
    if (!lock) {
      return res.status(404).json({ message: 'Note lock not found' });
    }

    // Check if locked due to failed attempts
    if (lock.lockedUntil && new Date() < lock.lockedUntil) {
      return res.status(429).json({ 
        message: 'Too many failed attempts. Try again later.',
        lockedUntil: lock.lockedUntil,
      });
    }

    // Verify PIN
    const isValid = await bcryptjs.compare(pin.toString(), lock.pinHash);
    
    if (!isValid) {
      // Increment failed attempts
      lock.failedAttempts += 1;
      lock.lastFailedAttempt = new Date();

      // Lock for 5 minutes after 3 failed attempts
      if (lock.failedAttempts >= 3) {
        lock.lockedUntil = new Date(Date.now() + 5 * 60 * 1000);
      }

      await lock.save();
      return res.status(401).json({ 
        message: 'Invalid PIN',
        attemptsRemaining: Math.max(0, 3 - lock.failedAttempts),
      });
    }

    // Reset failed attempts on successful verification
    lock.failedAttempts = 0;
    lock.lastFailedAttempt = null;
    lock.lockedUntil = null;
    lock.isLocked = false;
    await lock.save();

    res.status(200).json({ message: 'PIN verified successfully' });
  } catch (error) {
    console.error('Error verifying lock', error);
    res.status(500).json({ message: 'Failed to verify lock' });
  }
}

export async function unlockNote(req, res) {
  try {
    const { noteId } = req.body;
    const userId = req.user._id;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    const lock = await NoteLock.findOneAndUpdate(
      { noteId, userId },
      { isLocked: false },
      { new: true }
    );

    if (!lock) {
      return res.status(404).json({ message: 'Note lock not found' });
    }

    res.status(200).json({ message: 'Note unlocked', lock });
  } catch (error) {
    console.error('Error unlocking note', error);
    res.status(500).json({ message: 'Failed to unlock note' });
  }
}

export async function removeNoteLock(req, res) {
  try {
    const { noteId } = req.body;
    const userId = req.user._id;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    const lock = await NoteLock.findOneAndDelete({ noteId, userId });

    if (!lock) {
      return res.status(404).json({ message: 'Note lock not found' });
    }

    res.status(200).json({ message: 'Lock removed successfully' });
  } catch (error) {
    console.error('Error removing lock', error);
    res.status(500).json({ message: 'Failed to remove lock' });
  }
}

export async function getNoteLock(req, res) {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;

    const lock = await NoteLock.findOne({ noteId, userId });

    if (!lock) {
      return res.status(404).json({ message: 'No lock found for this note' });
    }

    // Don't send PIN hash to client
    const lockData = lock.toObject();
    delete lockData.pinHash;
    
    res.status(200).json(lockData);
  } catch (error) {
    console.error('Error fetching lock', error);
    res.status(500).json({ message: 'Failed to fetch lock' });
  }
}

export async function updateNoteLock(req, res) {
  try {
    const { noteId, pin, lockType } = req.body;
    const userId = req.user._id;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    let updateData = {};

    if (pin) {
      const salt = await bcryptjs.genSalt(10);
      updateData.pinHash = await bcryptjs.hash(pin.toString(), salt);
    }

    if (lockType) {
      updateData.lockType = lockType;
    }

    const lock = await NoteLock.findOneAndUpdate(
      { noteId, userId },
      updateData,
      { new: true }
    );

    if (!lock) {
      return res.status(404).json({ message: 'Note lock not found' });
    }

    const lockData = lock.toObject();
    delete lockData.pinHash;

    res.status(200).json({ message: 'Lock updated successfully', lock: lockData });
  } catch (error) {
    console.error('Error updating lock', error);
    res.status(500).json({ message: 'Failed to update lock' });
  }
}
