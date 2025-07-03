import Note from "../models/note.model.js";

export async function getAllNotes(req, res) {
    try {
        // Get all notes - Only notes of logged-in user
        const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in getAllNotes controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getNoteById(req, res) {
    try {
        // Get single note - Must belong to logged-in user
        const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
        if (!note) return res.status(404).json({ message: "Note not found!" });
        res.json(note);
    } catch (error) {
        console.error('Error in getNoteById', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function createNote(req, res) {
    try {
        const { title, content } = req.body;
        const newNote = new Note({
            title, content,
            user: req.user._id // // Important: Attach logged-in user's ID
        });

        await newNote.save();
        res.status(201).json({ message: "Note created successfully." });

    } catch (error) {
        console.error("Error in createNote controller", error);
        res.status(500).json({ message: "Error in creating note" });
    }
}

export async function updateNote(req, res) {
    try {
        const { title, content } = req.body;
        const updatedNote = await Note.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { title, content }, { new: true });

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json({ message: "Note updated successfully" });
    } catch (error) {
        console.error('Error in updateNote', error);
        res.status(500).json({ message: "Error in updating note" });
    }
}

export async function deleteNote(req, res) {
    try {
        const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error('Error in deleteNote', error);
        res.status(500).json({ message: "Error in deleting note" });
    }
}
