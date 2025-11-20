import express from "express";
import {
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getTagNotes,
  searchTags,
  getTagStats,
} from "../controllers/tag.controller.js";
import auth from "../middlewares/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(auth);

// Specific routes BEFORE generic :id routes
// Get tag statistics
router.get("/stats", getTagStats);

// Search tags
router.get("/search", searchTags);

// Create new tag
router.post("/", createTag);

// Generic :id routes AFTER specific ones
// Get all tags
router.get("/", getAllTags);

// Get notes by tag (must come before /:id)
router.get("/:id/notes", getTagNotes);

// Get tag by ID
router.get("/:id", getTagById);

// Update tag
router.put("/:id", updateTag);

// Delete tag
router.delete("/:id", deleteTag);

export default router;
