import express from "express";
import notesRouter from "./routes/notes.routes.js";


import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import { appLimiter } from "./middlewares/rateLimit.middleware.js";
import { PORT } from "./config/env.js";

const app = express();

//Middlewares
app.use(cors({
    origin: `${process.env.FRONTEND_URL,PORT}`,
     credentials: true
}));





app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(appLimiter);

//Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter)
app.use('/api/v1/notes', notesRouter);

    

app.use(errorMiddleware);

app.get('/',(req, res) => {
    res.send('Hello world!')
})



export default app;