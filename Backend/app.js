import express from "express";
const app = express();
import { PORT } from "./config/env.js";

app.get('/',(req, res) => {
    res.send('Hello world!')
})

app.listen(PORT, async () => {
    console.log(`App is running on http://localhost:${PORT}`)
})

export default app;