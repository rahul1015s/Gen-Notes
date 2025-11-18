import { config } from "dotenv";

// Load environment variables based on environment
if (process.env.NODE_ENV === 'production') {
    // In production (Vercel), environment variables are already set
    // No need to load from file
    console.log('Running in production mode - using Vercel environment variables');
} else {
    // In development, load from .env files
    // Try .env.local first, then .env
    config({ path: '.env.local' });
    config({ path: '.env' });
}

export const {
    PORT = 3000, // Default values as fallback
    NODE_ENV = 'development',
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRE_IN,
    FRONTEND_URL = 'http://localhost:5173',
    MAIL_HOST,
    MAIL_PORT,
    MAIL_SECURE,
    MAIL_USER,
    MAIL_PASS,
    MAIL_FROM_NAME,
} = process.env;

// Validation for required environment variables
if (!DB_URI) {
    throw new Error('DB_URI environment variable is required');
}

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required');
}