import { Router } from "express";
import { getUser, getUsers, updatePreferences } from "../controllers/user.controller.js";
import authorize from "../middlewares/auth.middleware.js";


const userRouter = Router();

userRouter.get('/', getUsers);

// Get current user profile
userRouter.get('/me', authorize, getUser);

// Update user preferences (theme, notifications, 2FA)
userRouter.put('/preferences', authorize, updatePreferences);

userRouter.get('/:id',authorize, getUser);