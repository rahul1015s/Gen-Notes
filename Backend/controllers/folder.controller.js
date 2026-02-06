import Folder from "../models/folder.model.js";
import Note from "../models/note.model.js";

/**
 * Get all folders for logged-in user
 */
export const getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find({
      userId: req.user._id,
      isArchived: false,
    })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ message: "Failed to fetch folders" });
  }
};

/**
 * Get folder by ID
 */
export const getFolderById = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id).select("-__v");

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Verify ownership
    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json(folder);
  } catch (error) {
    console.error("Error fetching folder:", error);
    res.status(500).json({ message: "Failed to fetch folder" });
  }
};

/**
 * Create new folder
 */
export const createFolder = async (req, res) => {
  try {
    const { name, description, icon, color, parentId, isPrivate } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    // If parentId provided, verify it exists and belongs to user
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
      if (parentFolder.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Parent folder not authorized" });
      }
    }

    // Create folder
    const folder = new Folder({
      userId: req.user._id,
      name: name.trim(),
      description: description?.trim() || "",
      icon: icon || "📁",
      color: color || "#4ECDC4",
      parentId: parentId || null,
      isPrivate: !!isPrivate,
    });

    await folder.save();

    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Failed to create folder" });
  }
};

/**
 * Update folder
 */
export const updateFolder = async (req, res) => {
  try {
    const { name, description, icon, color, parentId, isPrivate } = req.body;

    let folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Verify ownership
    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prevent self-nesting
    if (parentId && parentId === req.params.id) {
      return res
        .status(400)
        .json({ message: "Cannot set folder as its own parent" });
    }

    // Verify parent folder exists and belongs to user
    if (parentId) {
      const parentFolder = await Folder.findById(parentId);
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
      if (parentFolder.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Parent folder not authorized" });
      }
    }

    // Update fields
    if (name) folder.name = name.trim();
    if (description !== undefined) folder.description = description.trim();
    if (icon) folder.icon = icon;
    if (color) folder.color = color;
    if (parentId !== undefined) folder.parentId = parentId || null;
    if (isPrivate !== undefined) folder.isPrivate = !!isPrivate;

    await folder.save();

    res.status(200).json(folder);
  } catch (error) {
    console.error("Error updating folder:", error);
    res.status(500).json({ message: "Failed to update folder" });
  }
};

/**
 * Delete folder
 */
export const deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    // Verify ownership
    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Remove folder reference from notes (don't delete notes)
    await Note.updateMany(
      { folderId: req.params.id },
      { $unset: { folderId: 1 } }
    );

    // Delete folder
    await Folder.findByIdAndDelete(req.params.id);

    // Delete child folders if any
    await Folder.deleteMany({ parentId: req.params.id });

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Failed to delete folder" });
  }
};

/**
 * Get notes in folder
 */
export const getFolderNotes = async (req, res) => {
  try {
    const { folderId } = req.params;
    const { recursive } = req.query;

    // Verify folder ownership
    const folder = await Folder.findById(folderId);
    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (recursive === "true") {
      // Get notes from this folder and all subfolders
      const subfolderIds = await getSubfolderIds(folderId);
      const allFolderIds = [folderId, ...subfolderIds];

      const notes = await Note.find({
        userId: req.user._id,
        folderId: { $in: allFolderIds },
      })
        .select("-content")
        .sort({ createdAt: -1 });

      return res.status(200).json(notes);
    }

    // Get notes only in this folder
    const notes = await Note.find({
      userId: req.user._id,
      folderId: folderId,
    })
      .select("-content")
      .sort({ createdAt: -1 });

    res.status(200).json(notes);
  } catch (error) {
    console.error("Error fetching folder notes:", error);
    res.status(500).json({ message: "Failed to fetch folder notes" });
  }
};

/**
 * Helper function to get all subfolder IDs recursively
 */
async function getSubfolderIds(folderId) {
  const subfolders = await Folder.find({ parentId: folderId }).select("_id");
  let allSubfolderIds = [];

  for (const subfolder of subfolders) {
    allSubfolderIds.push(subfolder._id);
    const nestedIds = await getSubfolderIds(subfolder._id);
    allSubfolderIds = [...allSubfolderIds, ...nestedIds];
  }

  return allSubfolderIds;
}

/**
 * Build folder tree structure
 */
export const getFolderTree = async (req, res) => {
  try {
    const rootFolders = await Folder.find({
      userId: req.user._id,
      parentId: null,
      isArchived: false,
    })
      .select("-__v")
      .sort({ name: 1 });

    // Build tree for each root folder
    const tree = [];
    for (const folder of rootFolders) {
      tree.push(await buildFolderTree(folder));
    }

    res.status(200).json(tree);
  } catch (error) {
    console.error("Error building folder tree:", error);
    res.status(500).json({ message: "Failed to build folder tree" });
  }
};

/**
 * Helper function to build folder tree recursively
 */
async function buildFolderTree(folder) {
  const children = await Folder.find({
    parentId: folder._id,
    isArchived: false,
  })
    .select("-__v")
    .sort({ name: 1 });

  const folderObj = folder.toObject();
  folderObj.children = [];

  for (const child of children) {
    folderObj.children.push(await buildFolderTree(child));
  }

  return folderObj;
}

/**
 * Move folder to archive
 */
export const archiveFolder = async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.id);

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    if (folder.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    folder.isArchived = true;
    await folder.save();

    res.status(200).json({ message: "Folder archived successfully" });
  } catch (error) {
    console.error("Error archiving folder:", error);
    res.status(500).json({ message: "Failed to archive folder" });
  }
};
