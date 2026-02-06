import PushSubscription from '../models/pushSubscription.model.js';
import SchedulerState from '../models/schedulerState.model.js';
import { sendPushToUser } from './push.service.js';
import { DAILY_SYNC_HOUR, DAILY_SYNC_MINUTE, DAILY_SYNC_TZ } from '../config/env.js';

const INTERVAL_MS = 60 * 1000;
const JOB_NAME = 'daily-sync';

function getDatePartsInTZ(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const parts = formatter.formatToParts(date).reduce((acc, p) => {
    acc[p.type] = p.value;
    return acc;
  }, {});
  return {
    year: parts.year,
    month: parts.month,
    day: parts.day,
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function sameDayInTZ(a, b, timeZone) {
  const pa = getDatePartsInTZ(a, timeZone);
  const pb = getDatePartsInTZ(b, timeZone);
  return pa.year === pb.year && pa.month === pb.month && pa.day === pb.day;
}

export async function runDailySyncJob({ force = false } = {}) {
  const timeZone = DAILY_SYNC_TZ || 'America/New_York';
  const hour = Number(DAILY_SYNC_HOUR ?? 2);
  const minute = Number(DAILY_SYNC_MINUTE ?? 0);
  const now = new Date();

  const state = await SchedulerState.findOne({ name: JOB_NAME }).lean();
  if (!force && state?.lastRunAt && sameDayInTZ(new Date(state.lastRunAt), now, timeZone)) {
    return { skipped: true, reason: 'already_run_today' };
  }

  const userIds = await PushSubscription.distinct('userId');
  let sent = 0;
  let removed = 0;

  for (const userId of userIds) {
    const result = await sendPushToUser(userId, {
      type: 'daily-sync',
      title: 'Daily Sync',
      body: 'Syncing your notes in the background.',
      url: '/all-notes',
      tag: 'daily-sync',
    });
    sent += result.sent || 0;
    removed += result.removed || 0;
  }

  await SchedulerState.findOneAndUpdate(
    { name: JOB_NAME },
    { lastRunAt: new Date() },
    { upsert: true, new: true }
  );

  return { skipped: false, sent, removed, users: userIds.length };
}

export function startDailySyncScheduler() {
  setInterval(async () => {
    try {
      const timeZone = DAILY_SYNC_TZ || 'America/New_York';
      const hour = Number(DAILY_SYNC_HOUR ?? 2);
      const minute = Number(DAILY_SYNC_MINUTE ?? 0);
      const now = new Date();
      const parts = getDatePartsInTZ(now, timeZone);

      if (parts.hour === hour && parts.minute === minute) {
        await runDailySyncJob();
      }
    } catch (error) {
      console.error('Daily sync scheduler error', error);
    }
  }, INTERVAL_MS);
}
