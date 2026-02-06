import PushSubscription from '../models/pushSubscription.model.js';

export async function subscribePush(req, res) {
  try {
    const userId = req.user._id;
    const { subscription } = req.body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return res.status(400).json({ message: 'Invalid subscription' });
    }

    const update = {
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      expirationTime: subscription.expirationTime || null,
    };

    await PushSubscription.findOneAndUpdate(
      { userId, endpoint: subscription.endpoint },
      update,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({ message: 'Subscribed to push notifications' });
  } catch (error) {
    console.error('Subscribe push error', error);
    res.status(500).json({ message: 'Failed to subscribe' });
  }
}

export async function unsubscribePush(req, res) {
  try {
    const userId = req.user._id;
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: 'endpoint is required' });
    }

    await PushSubscription.deleteOne({ userId, endpoint });
    res.status(200).json({ message: 'Unsubscribed' });
  } catch (error) {
    console.error('Unsubscribe push error', error);
    res.status(500).json({ message: 'Failed to unsubscribe' });
  }
}
