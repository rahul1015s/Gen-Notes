import mongoose from "mongoose";
import User from '../models/user.model.js';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { 
  sendResetPasswordEmail, 
  sendOTPVerificationEmail,
  sendWelcomeVerificationEmail 
} from "../services/mail.js";
import {
    JWT_SECRET,
    JWT_EXPIRE_IN,
    FRONTEND_URL
} from "../config/env.js";

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const signUp = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { name, email, password } = req.body;
        
        // Input validation
        if (!name || !email || !password) {
            const error = new Error('Name, email and password are required');
            error.statusCode = 400;
            throw error;
        }
        
        if (password.length < 6) {
            const error = new Error('Password must be at least 6 characters long');
            error.statusCode = 400;
            throw error;
        }

        if (!email.includes('@')) {
            const error = new Error('Valid email is required');
            error.statusCode = 400;
            throw error;
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        
        const newUsers = await User.create(
            [{ 
                name, 
                email, 
                password: hashedPassword,
                otp,
                otpExpires,
                isVerified: false
            }],
            { session }
        );

        // Send OTP email
        try {
            await sendOTPVerificationEmail(email, name, otp);
        } catch (emailError) {
            console.error('OTP email sending failed:', emailError);
            await session.abortTransaction();
            session.endSession();
            return res.status(500).json({
                success: false,
                message: "Account created but failed to send verification email. Please contact support."
            });
        }
        
        await session.commitTransaction();
        session.endSession();
        
        res.status(201).json({
            success: true,
            message: "User created successfully. Please check your email for verification code.",
            data: { 
                email,
                requiresVerification: true
            }
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
};

export const verifyOTP = async (req, res, next) => {
    try {
        const { email, otp } = req.body;
        
        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required"
            });
        }

        const user = await User.findOne({ 
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }

        // Update user as verified
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Send welcome email
        try {
            await sendWelcomeVerificationEmail(email, user.name);
        } catch (emailError) {
            console.error('Welcome email sending failed:', emailError);
            // Continue even if welcome email fails
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { 
            expiresIn: JWT_EXPIRE_IN 
        });

        // Remove password from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({
            success: true,
            message: "Email verified successfully",
            data: { 
                token, 
                user: userResponse 
            }
        });
    } catch (error) {
        next(error);
    }
};

export const resendOTP = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (user.isVerified) {
            return res.status(400).json({
                success: false,
                message: "Email is already verified"
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send new OTP email
        try {
            await sendOTPVerificationEmail(email, user.name, otp);
        } catch (emailError) {
            console.error('Resend OTP email failed:', emailError);
            return res.status(500).json({
                success: false,
                message: "Failed to send verification email. Please try again."
            });
        }

        res.status(200).json({
            success: true,
            message: "Verification code sent successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const signIn = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            const error = new Error('Email and password are required');
            error.statusCode = 400;
            throw error;
        }

        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        // Check if email is verified
        if (!user.isVerified) {
            // Generate new OTP if needed
            const otp = generateOTP();
            const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
            
            user.otp = otp;
            user.otpExpires = otpExpires;
            await user.save();

            // Send OTP email
            try {
                await sendOTPVerificationEmail(email, user.name, otp);
            } catch (emailError) {
                console.error('OTP email sending failed:', emailError);
            }

            return res.status(403).json({
                success: false,
                message: "Please verify your email before signing in",
                data: {
                    requiresVerification: true,
                    email: user.email
                }
            });
        }
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }
        
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { 
            expiresIn: JWT_EXPIRE_IN 
        });
        
        // Remove password from response
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: { token, user: userResponse }
        });
    } catch (error) {
        next(error);
    }
};

export const signOut = async (req, res, next) => {
    res.status(200).json({ 
        success: true, 
        message: "Signed out successfully" 
    });
};

export const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        
        // Email validation
        if (!email || !email.includes('@')) {
            return res.status(400).json({ 
                success: false,
                message: "Valid email is required" 
            });
        }

        const user = await User.findOne({ email });
        
        // Security: Don't reveal if user exists to prevent email enumeration
        if (!user) {
            return res.status(200).json({ 
                success: true,
                message: "If the email exists, a password reset link has been sent" 
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 minutes
        await user.save();

        const resetURL = `${FRONTEND_URL}/reset-password/${resetToken}`;
        
        try {
            await sendResetPasswordEmail(user.email, user.name, resetURL);
            
            res.status(200).json({ 
                success: true,
                message: "Password reset email sent successfully" 
            });
        } catch (emailError) {
            // If email fails, clear the reset token
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            
            console.error('Email sending failed:', emailError);
            return res.status(500).json({
                success: false,
                message: "Failed to send reset email. Please try again."
            });
        }
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        // Validate password
        if (!password || password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid or expired reset token" 
            });
        }

        // Check if new password is different from old one
        const isSamePassword = await bcrypt.compare(password, user.password);
        if (isSamePassword) {
            return res.status(400).json({
                success: false,
                message: "New password must be different from old password"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ 
            success: true,
            message: "Password reset successfully" 
        });
    } catch (error) {
        next(error);
    }
};