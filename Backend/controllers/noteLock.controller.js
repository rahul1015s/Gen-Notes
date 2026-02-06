import NoteLock from '../models/noteLock.model.js';
import bcryptjs from 'bcryptjs';

export async function createNoteLock(req, res) {
  try {
    const { noteId, pin, password, lockType = 'PIN' } = req.body;
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
    if (pin && (lockType === 'PIN' || lockType === 'PIN_PASSWORD')) {
      const salt = await bcryptjs.genSalt(10);
      lockData.pinHash = await bcryptjs.hash(pin.toString(), salt);
    }
    // Hash password if provided
    if (password && (lockType === 'PASSWORD' || lockType === 'PIN_PASSWORD')) {
      const salt = await bcryptjs.genSalt(10);
      lockData.passwordHash = await bcryptjs.hash(password.toString(), salt);
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
    const { noteId, pin, password } = req.body;
    const userId = req.user._id;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
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

    let isValid = false;
    if (lock.lockType === 'PIN') {
      if (!pin) return res.status(400).json({ message: 'pin is required' });
      isValid = await bcryptjs.compare(pin.toString(), lock.pinHash);
    } else if (lock.lockType === 'PASSWORD') {
      if (!password) return res.status(400).json({ message: 'password is required' });
      isValid = await bcryptjs.compare(password.toString(), lock.passwordHash);
    } else if (lock.lockType === 'PIN_PASSWORD') {
      if (!pin || !password) return res.status(400).json({ message: 'pin and password are required' });
      const pinOk = await bcryptjs.compare(pin.toString(), lock.pinHash);
      const passOk = await bcryptjs.compare(password.toString(), lock.passwordHash);
      isValid = pinOk && passOk;
    }
    
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
    const noteId = req.params.noteId || req.body.noteId;
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
    const noteId = req.params.noteId || req.body.noteId;
    const { pin, password, lockType } = req.body;
    const userId = req.user._id;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    let updateData = {};

    if (pin) {
      const salt = await bcryptjs.genSalt(10);
      updateData.pinHash = await bcryptjs.hash(pin.toString(), salt);
    }
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.passwordHash = await bcryptjs.hash(password.toString(), salt);
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
