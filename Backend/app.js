import express from "express";
import notesRouter from "./routes/notes.routes.js";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import { appLimiter } from "./middlewares/rateLimit.middleware.js";
import path from "path"

const app = express();

const __dirname = path.resolve()

// Use only ONE CORS configuration - remove the other one
app.use(cors({
  origin: "http://localhost:5173", // your frontend dev URL
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(appLimiter);

//Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter)
app.use('/api/v1/notes', notesRouter);

app.use(express.static(path.join(__dirname, "../Frontend/dist")))

if (process.env.NODE_ENV === "production") {
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"))
    })
}

app.use(errorMiddleware);

export default app;