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

const __dirname = path.resolve();

// CORS Configuration
const corsOptions = {
  origin: [
    "https://gennotes.vercel.app",
    "https://www.gennotes.vercel.app",
    "http://localhost:5173"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
};

app.use(cors(corsOptions));

// Handle OPTIONS requests BEFORE rate limiting
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Apply rate limiting (will skip OPTIONS due to our updated limiter)
app.use(appLimiter);

// API Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/notes', notesRouter);

// Serve static files
app.use(express.static(path.join(__dirname, "Frontend/dist")));

// Client-side routing
app.get("*", (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, "Frontend/dist/index.html"));
});

app.use(errorMiddleware);

export default app;