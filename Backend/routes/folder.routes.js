import express from "express";
import {
  getAllFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderNotes,
  getFolderTree,
  archiveFolder,
} from "../controllers/folder.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Specific routes BEFORE generic :id routes
// Get folder tree structure
router.get("/tree", getFolderTree);

// Create new folder
router.post("/", createFolder);

// Generic :id routes AFTER specific ones
// Get all folders
router.get("/", getAllFolders);

// Get notes in folder (must come before /:id)
router.get("/:id/notes", getFolderNotes);

// Archive folder (must come before /:id PUT/DELETE)
router.patch("/:id/archive", archiveFolder);

// Get folder by ID
router.get("/:id", getFolderById);

// Update folder
router.put("/:id", updateFolder);

// Delete folder
router.delete("/:id", deleteFolder);

export default router;
