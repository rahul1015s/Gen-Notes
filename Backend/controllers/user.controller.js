import User from "../models/user.model.js";

// To get details of all user
export const getUsers = async (req, res, next) => {
    try {
        
        const users = await User.find();

        res.status(200).json({
            success: true,
            data: users
        })
    } catch (error) {
        next(error);
    }
}


// To get details of a single user by their ID
export const getUser = async (req, res, next) => {
    try {
        // Find the user by ID from the database
        // `.select('-password')` excludes the password field from the result
        const user = await User.findById(req.params.id).select('-password');

        // If user not found, throw an error with 404 status
        if (!user) {
            const error = new Error('User not found');
            error.status = 404; 
            throw error;
        }

        // If user found, send success response with user data
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        // Pass error to the error handling globel middleware
        next(error);
    }
};

