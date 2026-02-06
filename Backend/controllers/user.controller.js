import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

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

// App Lock status
export const getAppLockStatus = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select("appLock");
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        res.status(200).json({
            success: true,
            appLock: {
                enabled: user.appLock?.enabled || false,
                method: user.appLock?.method || 'pin',
                lastUnlockedAt: user.appLock?.lastUnlockedAt || null,
            }
        });
    } catch (error) {
        next(error);
    }
};

// Configure App Lock
export const setAppLock = async (req, res, next) => {
    try {
        const { enabled, method, secret } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }

        if (enabled) {
            if (!method || !secret) {
                return res.status(400).json({ message: "method and secret are required" });
            }
            const salt = await bcryptjs.genSalt(10);
            const hash = await bcryptjs.hash(secret.toString(), salt);
            user.appLock.enabled = true;
            user.appLock.method = method;
            user.appLock.pinHash = null;
            user.appLock.patternHash = null;
            user.appLock.gestureHash = null;
            if (method === 'pin') user.appLock.pinHash = hash;
            if (method === 'pattern') user.appLock.patternHash = hash;
            if (method === 'gesture') user.appLock.gestureHash = hash;
        } else {
            user.appLock.enabled = false;
            user.appLock.pinHash = null;
            user.appLock.patternHash = null;
            user.appLock.gestureHash = null;
        }

        await user.save();
        res.status(200).json({ success: true, message: "App lock updated" });
    } catch (error) {
        next(error);
    }
};

// Verify App Lock
export const verifyAppLock = async (req, res, next) => {
    try {
        const { method, secret } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            throw error;
        }
        if (!user.appLock?.enabled) {
            return res.status(400).json({ message: "App lock not enabled" });
        }
        const hash =
            method === 'pin' ? user.appLock.pinHash :
            method === 'pattern' ? user.appLock.patternHash :
            user.appLock.gestureHash;
        if (!hash) {
            return res.status(400).json({ message: "Lock method not configured" });
        }
        const ok = await bcryptjs.compare(secret.toString(), hash);
        if (!ok) {
            return res.status(401).json({ message: "Invalid unlock" });
        }
        user.appLock.lastUnlockedAt = new Date();
        await user.save();
        res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
};
