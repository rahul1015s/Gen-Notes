import mongoose from "mongoose";

const noteSchema  = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },

    content: {
        type: String,
        required: true,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },

    tags: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag'
        }
    ],

    isPinned: {
        type: Boolean,
        default: false
    },

    color: {
        type: String,
        default: "#ffffff"
    },

    isArchived: {
        type: Boolean,
        default: false
    },

    isLocked: {
        type: Boolean,
        default: false
    },

    lockPassword: {
        type: String,
        default: null
    }

}, {timestamps: true})  //Automatically adds createdAt and updatedAt timestamps

// Index for faster queries
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ userId: 1, folderId: 1 });
noteSchema.index({ userId: 1, isPinned: 1 });
noteSchema.index({ tags: 1 });

// Creating the Note model from the schema
const Note = mongoose.model('Note', noteSchema);

export default Note;