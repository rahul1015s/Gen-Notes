import Tag from "../models/tag.model.js";
import Note from "../models/note.model.js";

/**
 * Get all tags for logged-in user
 */
export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find({ userId: req.user._id })
      .select("-__v")
      .sort({ name: 1 });

    res.status(200).json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Failed to fetch tags" });
  }
};

/**
 * Get tag by ID
 */
export const getTagById = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id).select("-__v");

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (tag.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(tag);
  } catch (error) {
    console.error("Error fetching tag:", error);
    res.status(500).json({ message: "Failed to fetch tag" });
  }
};

/**
 * Create new tag
 */
export const createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    // Check if tag already exists for this user
    const existingTag = await Tag.findOne({
      userId: req.user._id,
      slug: name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    });

    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    // Create tag
    const tag = new Tag({
      userId: req.user._id,
      name: name.trim(),
      color: color || "#4ECDC4",
    });

    await tag.save();

    res.status(201).json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ message: "Failed to create tag" });
  }
};

/**
 * Update tag
 */
export const updateTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    let tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (tag.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update fields
    if (name) {
      tag.name = name.trim();
    }
    if (color) {
      tag.color = color;
    }

    await tag.save();

    res.status(200).json(tag);
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ message: "Failed to update tag" });
  }
};

/**
 * Delete tag
 */
export const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (tag.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove tag from all notes
    await Note.updateMany(
      { tags: req.params.id },
      { $pull: { tags: req.params.id } }
    );

    // Delete tag
    await Tag.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ message: "Failed to delete tag" });
  }
};

/**
 * Get notes by tag
 */
export const getTagNotes = async (req, res) => {
  try {
    const { tagId } = req.params;

    // Verify tag ownership
    const tag = await Tag.findById(tagId);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    if (tag.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Get notes with this tag
    const notes = await Note.find({
      userId: req.user._id,
      tags: tagId,
    })
      .select("-content")
      .sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching tag notes:", error);
    res.status(500).json({ message: "Failed to fetch tag notes" });
  }
};

/**
 * Search tags by name
 */
export const searchTags = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || !query.trim()) {
      return res.status(400).json({ message: "Search query is required" });
    }

    const tags = await Tag.find({
      userId: req.user._id,
      name: { $regex: query, $options: "i" },
    })
      .select("-__v")
      .limit(20);

    res.status(200).json(tags);
  } catch (error) {
    console.error("Error searching tags:", error);
    res.status(500).json({ message: "Failed to search tags" });
  }
};

/**
 * Get tag statistics
 */
export const getTagStats = async (req, res) => {
  try {
    const stats = await Tag.aggregate([
      { $match: { userId: req.user._id } },
      {
        $lookup: {
          from: "notes",
          let: { tagId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", req.user._id] },
                    { $in: ["$$tagId", "$tags"] },
                  ],
                },
              },
            },
          ],
          as: "notesWithTag",
        },
      },
      {
        $addFields: {
          noteCount: { $size: "$notesWithTag" },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          color: 1,
          slug: 1,
          noteCount: 1,
          createdAt: 1,
        },
      },
      { $sort: { noteCount: -1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    console.error("Error getting tag stats:", error);
    res.status(500).json({ message: "Failed to get tag statistics" });
  }
};
