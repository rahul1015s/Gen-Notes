import { config } from "dotenv";

config({ path: `.env.${process.env.NODE_ENV || 'development.local'}` });

export const {
    PORT,
    NODE_ENV,
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRE_IN,
    FRONTEND_URL,

    // Update these to match your .env file
    MAIL_HOST ,
    MAIL_PORT ,
    MAIL_SECURE ,
    MAIL_USER,
    MAIL_PASS ,
    MAIL_FROM_NAME ,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY,
    VAPID_SUBJECT,
    DAILY_SYNC_TZ,
    DAILY_SYNC_HOUR,
    DAILY_SYNC_MINUTE,
    CRON_SECRET,

} = process.env;
