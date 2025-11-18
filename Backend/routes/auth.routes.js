import { Router } from "express";
import { 
    signUp, 
    signIn, 
    signOut, 
    forgotPassword, 
    resetPassword,
    verifyOTP,
    resendOTP 
} from "../controllers/auth.controller.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const authRouter = Router();

// Handle OPTIONS for auth routes specifically
authRouter.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'https://gennotes.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// Apply rate limiting only to actual API calls, not OPTIONS
authRouter.post('/sign-up', authLimiter, signUp);
authRouter.post('/sign-in', authLimiter, signIn);
authRouter.post('/sign-out', signOut);

// OTP Verification routes
authRouter.post('/verify-otp', authLimiter, verifyOTP);
authRouter.post('/resend-otp', authLimiter, resendOTP);

// Forgot password (send email with reset link)
authRouter.post('/forgot-password', authLimiter, forgotPassword);

// Reset password (update new password)
authRouter.post('/reset-password/:token', authLimiter, resetPassword);

export default authRouter;