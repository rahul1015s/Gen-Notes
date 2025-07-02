import { JWT_SECRET } from "../config/env.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

// Middleware to authorize routes using JWT token
const authorize = async (req, res, next) => {
    try {
        let token;

        // Check if Authorization header exists and starts with 'Bearer'
        // Example: Authorization: Bearer abc.def.ghi
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            // Extract token from the header
            token = req.headers.authorization.split(' ')[1];
        }

        // If token not found, return Unauthorized
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify the token using secret key
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find the user from the decoded token payload
        const user = await User.findById(decoded.userId).select("-password");

        // If user doesn't exist in DB, return Unauthorized
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Attach the user object to request for access in next middleware/routes
        req.user = user;

        // Continue to the next middleware or route handler
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized', error: error.message });
    }
};

export default authorize;
