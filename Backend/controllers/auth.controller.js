import mongoose from "mongoose"
import User from '../models/user.model.js'
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"
import {
    JWT_SECRET,
    JWT_EXPIRE_IN,
} from "../config/env.js"

//User signup Controller
export const signUp = async (req, res, next) => {
    //starts a MongoDB session (for safe rollback if something fails)
    const session = await mongoose.startSession();
    session.startTransaction(); // like a safety net - if somthing fails, we undo everything

    try {

        const { name, email, password } = req.body;

        //check if the user already exists in the databse
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 409; // 409 = conflict
            throw error; // stop here and go to catch block
        }

        //Hash the password before saving(for security)
        const salt = await bcrypt.genSalt(10); // add some randomness
        const hashedPassword = await bcrypt.hash(password, salt); // scrambled version of password

        //Create a new user and save it in the current session
        const newUsers = await User.create(
            [{ name, email, password: hashedPassword }],
            { session }
        );

        //Generate a JWT token (used for login session)

        const token = jwt.sign(
            { userId: newUsers[0]._id }, // payload data inside token
            JWT_SECRET, // secret key to ssign in token
            {expiresIn: JWT_EXPIRE_IN} // LIKE= 1D, 7D ETC

        )

        // everything went well - save all to databse
        await session.commitTransaction();
        session.endSession();

        //send response to frontend
        res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                token,
                user: newUsers[0], // user info (you can customize field)
            }
        })

    } catch (error) {
        //Somthing went wrong - undo all DB actions
        session.abortTransaction();
        session.endSession();
        next(error) // send error to global handler
    }
}


//controller for handling user sign-in logic
export const signIn = async (req, res, next) => {
    try {
        // Extract email and password from request body
        const {email, password} = req.body;

        //Step 1: check if user exists in the database
        const user = await User.findOne({email});

        if(!user) {
            //if no user found, throw 404 error
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        //Step 2: Compare input passwordd with hashed password in DB

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            //if password is invalid, throw 401 Unauthorize error

            const error = new Error('Invalid password');
            throw error;
        }

        //Step: 3 Generate JWT token if authentication is successful

        const token = jwt.sign(
            {userId: user._id}, //payload: user ID
            JWT_SECRET, // Secret key
            {expiresIn: JWT_EXPIRE_IN} // tOKEN EXPIRY TIME
        );

        // sTEP 4: Send success response with token and user data
        res.status(200).json({
            success: true,
            message: "User signed in successfully",
            data: {
                token,
                user
            }
        })
        
    } catch (error) {
        //pass any error to the global error handling middleware
        next(error);
    }
}


export const signOut = async (req, res, next) => {

}


