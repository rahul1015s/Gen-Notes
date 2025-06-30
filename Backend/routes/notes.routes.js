import { Router } from "express";
import { createNote, deleteNote, getAllNotes, getNoteById, updateNote,  } from "../controllers/notes.controller.js";
import { appLimiter } from "../middlewares/rateLimit.middleware.js";

const notesRouter = Router();

notesRouter.get('/', getAllNotes);
notesRouter.get('/:id', getNoteById);
notesRouter.post('/', appLimiter, createNote);
notesRouter.put('/:id', updateNote );
notesRouter.delete('/:id', deleteNote);

export default notesRouter;