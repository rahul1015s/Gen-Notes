import { Router } from "express";
import { signUp, signIn, signOut} from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const authRouter = Router();
//Path:/api/v1/auth/sign-up(POST)

authRouter.post('/sign-up',authLimiter, signUp);

authRouter.post('/sign-in',authLimiter, signIn);

authRouter.post('/sign-out', signOut);

export default authRouter;