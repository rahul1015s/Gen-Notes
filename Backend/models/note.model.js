import mongoose from "mongoose";

const noteSchema  = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    content: {
        type: String,
        required: true,
    }
}, {timestamps: true})  //Automatically adds createdAt and updatedAt timestamps


// Creating the User model from the schema
const Note = mongoose.model('Note', noteSchema);

export default Note;