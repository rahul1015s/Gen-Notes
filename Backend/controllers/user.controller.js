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
        // If requesting current user via "/me" endpoint
        let userId = req.params.id;
        
        if (userId === 'me') {
            // Use the userId from the JWT token (set by auth middleware)
            userId = req.user._id;
        }

        // Find the user by ID from the database
        // `.select('-password')` excludes the password field from the result
        const user = await User.findById(userId).select('-password');

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

// Update user preferences
export const updatePreferences = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { theme, notificationsEnabled, twoFactorEnabled } = req.body;

        const updates = {};
        if (theme !== undefined) updates['preferences.theme'] = theme;
        if (notificationsEnabled !== undefined) updates['preferences.notificationsEnabled'] = notificationsEnabled;
        if (twoFactorEnabled !== undefined) updates['preferences.twoFactorEnabled'] = twoFactorEnabled;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: user
        });
    } catch (error) {
        next(error);
    }
};
