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

} = process.env;