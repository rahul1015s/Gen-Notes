import rateLimit from 'express-rate-limit';

export const appLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 60, //Limit each IP TO 60 request per window  (here, per 15 minutes).
     standardHeaders: true,
     legacyHeaders: false,
     message: {
        status: 429,
        message: "Too many request from this IP. Please try again after 15 minutes."
     },

});