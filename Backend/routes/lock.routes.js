import express from 'express';
import {
  createNoteLock,
  verifyNoteLock,
  unlockNote,
  removeNoteLock,
  getNoteLock,
  updateNoteLock,
} from '../controllers/noteLock.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Lock endpoints
router.post('/', createNoteLock); // Create lock for a note
router.post('/verify', verifyNoteLock); // Verify PIN
router.post('/unlock', unlockNote); // Unlock note
router.delete('/:noteId', removeNoteLock); // Remove lock
router.get('/:noteId', getNoteLock); // Get lock status
router.patch('/:noteId', updateNoteLock); // Update PIN/lock type

export default router;
