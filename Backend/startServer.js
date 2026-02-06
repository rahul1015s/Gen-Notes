import app from "./app.js";
import { PORT } from "./config/env.js";
import connectToDatabase from "./database/mongodb.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";
import { startDailySyncScheduler } from "./services/dailySyncScheduler.js";

// Connect to db and start server for local development
if (process.env.NODE_ENV !== 'production') {
    connectToDatabase().then(() => {
        startReminderScheduler();
        startDailySyncScheduler();
        app.listen(PORT, () => {
            console.log(`App is running on http://localhost:${PORT}`);
        });
    }).catch((err) => {
        console.log('Failed to connect to database:', err);
        process.exit(1);
    });
}

// Export for Vercel serverless function
export default async function handler(req, res) {
    try {
        // Connect to database on cold start
        await connectToDatabase();
        
        // Forward to Express app
        return app(req, res);
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
}
