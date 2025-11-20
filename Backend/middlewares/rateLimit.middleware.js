import rateLimit from 'express-rate-limit';

// Helper to skip OPTIONS requests
const skipOptions = (req) => {
  return req.method === 'OPTIONS';
};

// General limiter for entire app (protects against abuse globally)
export const appLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: (req) => {
        if (skipOptions(req)) return 0; // Skip rate limiting for OPTIONS
        return 500; // Limit each IP to 60 requests per 15 minutes
    },
    standardHeaders: true,    // Return rate limit info in standard RateLimit-* headers
    legacyHeaders: false,     // Disable deprecated X-RateLimit-* headers
    message: {
        status: 429,
        message: "Too many requests from this IP. Please try again after 15 minutes."
    },
    skip: skipOptions // Alternative way to skip OPTIONS
});

// Stricter limiter for login/signup routes (prevent brute-force attacks)
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: (req) => {
        if (skipOptions(req)) return 0; // Skip rate limiting for OPTIONS
        return 15; // Only 15 attempts per 15 minutes
    },
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        message: "Too many login/signup attempts. Please try again after 15 minutes."
    },
    skip: skipOptions // Alternative way to skip OPTIONS
});