import express from 'express';
import { subscribePush, unsubscribePush } from '../controllers/push.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/subscribe', subscribePush);
router.post('/unsubscribe', unsubscribePush);

export default router;
