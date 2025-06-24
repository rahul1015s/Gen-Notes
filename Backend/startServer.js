import app from "./app.js";
import { PORT } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";


//connect to db and start server

connectToDatabase().then(() => {
    app.listen(PORT, async () => {
    console.log(`App is running on http://localhost:${PORT}`)
})
}).catch((err) => {
    console.log('Faoled to connect to database:', err);
    process.exit(1); // exit the app when db failed to connect 
})
