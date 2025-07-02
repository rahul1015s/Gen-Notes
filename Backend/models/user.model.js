import mongoose from "mongoose";

//define a new schema for user collection

const userSchema = new mongoose.Schema({
    //name field
    name: {
        type: String,
        required: [true, "User name is required"],
        trim: true, // Remove leading/trailing whitespacce
        minLength: 2,
        maxLength: 50,
    },

    //Email field
    email: {
        type: String,
        required: [true, "Email is required."],
        unique: true,
        lowercase: true,
        match:  [/\S+@\S+\.\S+/, 'Please fill a valid email address'] // Validates email format
    },

    //Password field
    password: {
        type: String,
        required: [true, "User password is required"],
        minLength: 6
    }
}, {timestamps: true});// Automatically adds createdAt and updatedAt timestamps

// Creating the user model from schema

const User = mongoose.model('User', userSchema);

export default User;