import { CRON_SECRET } from '../config/env.js';
import { runDailySyncJob } from '../services/dailySyncScheduler.js';

export async function triggerDailySync(req, res) {
  try {
    if (CRON_SECRET) {
      const secret = req.headers['x-cron-secret'];
      if (!secret || secret !== CRON_SECRET) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
    }

    const result = await runDailySyncJob({ force: true });
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Daily sync trigger error', error);
    res.status(500).json({ message: 'Failed to trigger daily sync' });
  }
}
