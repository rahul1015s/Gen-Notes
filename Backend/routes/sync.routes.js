import express from 'express';
import { triggerDailySync } from '../controllers/sync.controller.js';

const router = express.Router();

// Trigger daily sync (intended for cron jobs)
router.post('/daily', triggerDailySync);

export default router;
