import express from "express";
import notesRouter from "./routes/notes.routes.js";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import { appLimiter } from "./middlewares/rateLimit.middleware.js";
import path from "path";

const app = express();

// FIX 1: Add trust proxy for Vercel (must be before rate limiter)
app.set('trust proxy', 1);

const __dirname = path.resolve();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// FIX 2: Rate limiter after trust proxy
app.use(appLimiter);

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/notes', notesRouter);

// FIX 3: Remove or fix static file serving for Vercel
// Remove these lines or conditionally enable them:
// app.use(express.static(path.join(__dirname, "../Frontend/dist")))

// if (process.env.NODE_ENV === "production") {
//     app.get("*", (req, res) => {
//         res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"))
//     })
// }

// FIX 4: Add health check route (important for Vercel)
app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        environment: process.env.NODE_ENV 
    });
});

app.use(errorMiddleware);

export default app;