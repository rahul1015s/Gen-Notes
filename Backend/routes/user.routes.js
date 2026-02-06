import { Router } from "express";
import { getUser, getUsers, updatePreferences, getAppLockStatus, setAppLock, verifyAppLock } from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";


const userRouter = Router();

userRouter.get('/', getUsers);

// Get current user profile
userRouter.get('/me', authorize, getUser);

// Update user preferences (theme, notifications, 2FA)
userRouter.put('/preferences', authorize, updatePreferences);
userRouter.get('/app-lock', authorize, getAppLockStatus);
userRouter.post('/app-lock', authorize, setAppLock);
userRouter.post('/app-lock/verify', authorize, verifyAppLock);

userRouter.get('/:id',authorize, getUser);

export default userRouter;
