import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "User name is required"],
        trim: true,
        minLength: 2,
        maxLength: 50,
    },
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: [true, "User password is required"],
        minLength: 6
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String,
        default: null,
    },
    otpExpires: {
        type: Date,
        default: null,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'dark'
        },
        notificationsEnabled: {
            type: Boolean,
            default: true
        },
        twoFactorEnabled: {
            type: Boolean,
            default: false
        }
    },
    biometricCredentials: [
        {
            credentialID: {
                type: String,
                required: true,
            },
            publicKey: {
                type: String,
                required: true,
            },
            counter: {
                type: Number,
                required: true,
                default: 0,
            },
            credentialDeviceType: {
                type: String,
                enum: ['single-device', 'multi-device'],
            },
            credentialBackedUp: {
                type: Boolean,
                default: false,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
            lastUsedAt: {
                type: Date,
            },
        }
    ]
}, { timestamps: true });

// Index for OTP expiration (automatic cleanup)
userSchema.index({ otpExpires: 1 }, { expireAfterSeconds: 0 });

const User = mongoose.model('User', userSchema);

export default User;