import Note from "../models/note.model.js";

export async function getAllNotes(req, res) {
    try {
        // Get all notes - Only notes of logged-in user
        const notes = await Note.find({ userId: req.user._id })
            .populate('tags', 'name color')
            .populate('folderId', 'name icon')
            .sort({ createdAt: -1 });
        res.status(200).json(notes);
    } catch (error) {
        console.error("Error in getAllNotes controller", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getNoteById(req, res) {
    try {
        // Get single note - Must belong to logged-in user
        const note = await Note.findOne({ _id: req.params.id, userId: req.user._id })
            .populate('tags', 'name color')
            .populate('folderId', 'name icon');
        if (!note) return res.status(404).json({ message: "Note not found!" });
        res.json(note);
    } catch (error) {
        console.error('Error in getNoteById', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function createNote(req, res) {
    try {
        const { title, content, folderId, tags, color } = req.body;
        const newNote = new Note({
            title, 
            content,
            userId: req.user._id,
            user: req.user._id,
            folderId: folderId || null,
            tags: tags || [],
            color: color || "#ffffff",
            isPinned: false,
            isArchived: false,
            isLocked: false
        });

        await newNote.save();
        await newNote.populate('tags', 'name color');
        await newNote.populate('folderId', 'name icon');
        
        res.status(201).json(newNote);

    } catch (error) {
        console.error("Error in createNote controller", error);
        res.status(500).json({ message: "Error in creating note" });
    }
}

export async function updateNote(req, res) {
    try {
        const { title, content, folderId, tags, color, isPinned, isArchived } = req.body;
        
        const updateData = {};
        if (title !== undefined) updateData.title = title;
        if (content !== undefined) updateData.content = content;
        if (folderId !== undefined) updateData.folderId = folderId || null;
        if (tags !== undefined) updateData.tags = tags;
        if (color !== undefined) updateData.color = color;
        if (isPinned !== undefined) updateData.isPinned = isPinned;
        if (isArchived !== undefined) updateData.isArchived = isArchived;

        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id }, 
            updateData, 
            { new: true }
        )
        .populate('tags', 'name color')
        .populate('folderId', 'name icon');

        if (!updatedNote) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.status(200).json(updatedNote);
    } catch (error) {
        console.error('Error in updateNote', error);
        res.status(500).json({ message: "Error in updating note" });
    }
}

export async function deleteNote(req, res) {
    try {
        const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        if (!deletedNote) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error('Error in deleteNote', error);
        res.status(500).json({ message: "Error in deleting note" });
    }
}
