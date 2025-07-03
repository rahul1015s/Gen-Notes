import rateLimit from 'express-rate-limit';

// General limiter for entire app
export const appLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 60, //60 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many requests from this IP. Please try again after 15 minutes."
    },
});

// Stricter limiter for login/signup routes
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, // Only 5 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many login/signup attempts. Please try again after 15 minutes."
    },
});
