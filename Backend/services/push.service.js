import webpush from 'web-push';
import PushSubscription from '../models/pushSubscription.model.js';
import { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT } from '../config/env.js';

const vapidSubject = VAPID_SUBJECT || 'mailto:support@gennotes.app';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(vapidSubject, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export async function sendPushToUser(userId, payload) {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn('VAPID keys are not configured. Skipping push.');
    return { sent: 0, removed: 0 };
  }

  const subscriptions = await PushSubscription.find({ userId }).lean();
  let sent = 0;
  let removed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: sub.keys,
          },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (err) {
        const status = err?.statusCode;
        if (status === 404 || status === 410) {
          await PushSubscription.deleteOne({ _id: sub._id });
          removed += 1;
        } else {
          console.error('Push send failed', err);
        }
      }
    })
  );

  return { sent, removed };
}
