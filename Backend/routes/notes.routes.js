import { Router } from "express";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote,  } from "../controllers/notes.controller.js";
import { appLimiter } from "../middlewares/rateLimit.middleware.js";
import authorize from "../middlewares/auth.middleware.js";

const notesRouter = Router();

// Apply authorize to all routes at once
notesRouter.use(authorize);

notesRouter.post('/', createNote);
notesRouter.get('/', getAllNotes);
notesRouter.get('/:id', getNoteById);
notesRouter.put('/:id', updateNote );
notesRouter.delete('/:id', deleteNote);

export default notesRouter;