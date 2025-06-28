import express from "express";
import notesRouter from "./routes/notes.routes.js";
import { appLimiter } from "./middlewares/rateLimit.middleware.js";

import cors from "cors";

const app = express();

//Middlewares
app.use(cors({
    origin: "http://localhost:5173"
}));


app.use(appLimiter);


app.use(express.json());

//Routes
app.use('/api/v1/notes', notesRouter)

app.get('/',(req, res) => {
    res.send('Hello world!')
})



export default app;