# Backend Implementation Guide - Advanced Features

## 📋 Overview

The frontend has been fully implemented with advanced features (pin, folders, tags, etc.), but these require backend API endpoints to work completely. This guide provides exact code to implement.

---

## 🎯 What Needs to Be Implemented

### 1. Database Models
- [x] Note model (already exists)
- [x] User model (already exists)
- [ ] **Tag model** - NEW
- [ ] **Folder model** - NEW
- [ ] **Pin/Reminder models** - OPTIONAL

### 2. API Routes
- [x] Auth routes (already exist)
- [x] Notes routes (already exist)
- [ ] **Tags routes** - NEW (5 endpoints)
- [ ] **Folders routes** - NEW (5 endpoints)
- [ ] **Pin routes** - NEW (3 endpoints)

### 3. Controllers
- [x] Auth controller (already exists)
- [x] Notes controller (already exists)
- [ ] **Tags controller** - NEW
- [ ] **Folders controller** - NEW
- [ ] **Pin controller** - NEW

---

## 📝 Step 1: Update Note Model

### File: `Backend/models/note.model.js`

Add these fields to the Note schema:

```javascript
const noteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    default: "Untitled Note",
  },
  content: {
    type: String,
    default: "",
  },
  
  // NEW FIELDS - Add these:
  isPinned: {
    type: Boolean,
    default: false,
  },
  folderId: {
    type: Schema.Types.ObjectId,
    ref: "Folder",
    default: null,
  },
  tags: [{
    type: Schema.Types.ObjectId,
    ref: "Tag",
  }],
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockType: {
    type: String,
    enum: ['pin', 'fingerprint', 'passkey'],
    default: null,
  },
  reminder: {
    type: Date,
    default: null,
  },
  
  // Keep existing fields:
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});
```

---

## 📝 Step 2: Create Tag Model

### File: `Backend/models/tag.model.js`

```javascript
const { Schema, model } = require("mongoose");

const tagSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    default: "#3b82f6", // Default blue
  },
  description: {
    type: String,
    default: "",
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
tagSchema.index({ userId: 1, name: 1 });

module.exports = model("Tag", tagSchema);
```

---

## 📝 Step 3: Create Folder Model

### File: `Backend/models/folder.model.js`

```javascript
const { Schema, model } = require("mongoose");

const folderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
  },
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "Folder",
    default: null, // null means root level
  },
  icon: {
    type: String,
    default: "📁",
  },
  color: {
    type: String,
    default: "#fbbf24", // Default yellow
  },
  orderIndex: {
    type: Number,
    default: 0,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
folderSchema.index({ userId: 1, parentId: 1 });

module.exports = model("Folder", folderSchema);
```

---

## 📝 Step 4: Create Tag Routes

### File: `Backend/routes/tags.routes.js`

```javascript
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const tagsController = require("../controllers/tags.controller");

// Get all tags for user
router.get("/", auth, tagsController.getAllTags);

// Get frequent tags
router.get("/frequent", auth, tagsController.getFrequentTags);

// Create new tag
router.post("/", auth, tagsController.createTag);

// Update tag
router.put("/:id", auth, tagsController.updateTag);

// Delete tag
router.delete("/:id", auth, tagsController.deleteTag);

module.exports = router;
```

---

## 📝 Step 5: Create Tags Controller

### File: `Backend/controllers/tags.controller.js`

```javascript
const Tag = require("../models/tag.model");
const Note = require("../models/note.model");

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tags" });
  }
};

exports.getFrequentTags = async (req, res) => {
  try {
    const limit = req.query.limit || 10;
    const tags = await Tag.find({ userId: req.userId })
      .sort({ usageCount: -1 })
      .limit(parseInt(limit));
    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch frequent tags" });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    // Check if tag already exists for this user
    const existingTag = await Tag.findOne({ userId: req.userId, name });
    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = await Tag.create({
      userId: req.userId,
      name: name.trim(),
      color: color || "#3b82f6",
    });

    res.status(201).json(tag);
  } catch (error) {
    res.status(500).json({ message: "Failed to create tag" });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;

    const tag = await Tag.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { name, color, description },
      { new: true }
    );

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ message: "Failed to update tag" });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove tag from all notes
    await Note.updateMany(
      { userId: req.userId },
      { $pull: { tags: id } }
    );

    // Delete tag
    const tag = await Tag.findOneAndDelete({ _id: id, userId: req.userId });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tag" });
  }
};
```

---

## 📝 Step 6: Create Folder Routes

### File: `Backend/routes/folders.routes.js`

```javascript
const router = require("express").Router();
const auth = require("../middlewares/auth.middleware");
const foldersController = require("../controllers/folders.controller");

// Get all folders for user
router.get("/", auth, foldersController.getAllFolders);

// Get folder tree (hierarchical)
router.get("/tree", auth, foldersController.getFolderTree);

// Create new folder
router.post("/", auth, foldersController.createFolder);

// Update folder
router.put("/:id", auth, foldersController.updateFolder);

// Delete folder
router.delete("/:id", auth, foldersController.deleteFolder);

module.exports = router;
```

---

## 📝 Step 7: Create Folders Controller

### File: `Backend/controllers/folders.controller.js`

```javascript
const Folder = require("../models/folder.model");
const Note = require("../models/note.model");

exports.getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.userId })
      .sort({ orderIndex: 1, createdAt: -1 });
    res.status(200).json(folders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch folders" });
  }
};

exports.getFolderTree = async (req, res) => {
  try {
    const buildTree = async (parentId = null) => {
      const folders = await Folder.find({ userId: req.userId, parentId })
        .sort({ orderIndex: 1 });

      const tree = [];
      for (const folder of folders) {
        const children = await buildTree(folder._id);
        tree.push({
          ...folder.toObject(),
          children,
        });
      }
      return tree;
    };

    const tree = await buildTree();
    res.status(200).json(tree);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch folder tree" });
  }
};

exports.createFolder = async (req, res) => {
  try {
    const { name, parentId, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Folder name is required" });
    }

    const folder = await Folder.create({
      userId: req.userId,
      name: name.trim(),
      parentId: parentId || null,
      icon: icon || "📁",
      color: color || "#fbbf24",
    });

    res.status(201).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Failed to create folder" });
  }
};

exports.updateFolder = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parentId, icon, color, isArchived } = req.body;

    const folder = await Folder.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { name, parentId, icon, color, isArchived, updatedAt: Date.now() },
      { new: true }
    );

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.status(200).json(folder);
  } catch (error) {
    res.status(500).json({ message: "Failed to update folder" });
  }
};

exports.deleteFolder = async (req, res) => {
  try {
    const { id } = req.params;

    // Move notes from this folder to root
    await Note.updateMany(
      { userId: req.userId, folderId: id },
      { folderId: null }
    );

    // Delete subfolders
    const subFolders = await Folder.find({ userId: req.userId, parentId: id });
    for (const folder of subFolders) {
      await Note.updateMany(
        { userId: req.userId, folderId: folder._id },
        { folderId: null }
      );
      await Folder.deleteOne({ _id: folder._id });
    }

    // Delete folder
    const folder = await Folder.findOneAndDelete({ _id: id, userId: req.userId });

    if (!folder) {
      return res.status(404).json({ message: "Folder not found" });
    }

    res.status(200).json({ message: "Folder deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete folder" });
  }
};
```

---

## 📝 Step 8: Create Pin Routes

### File: Add to `Backend/routes/notes.routes.js`

```javascript
// Add these routes to your existing notes routes:

// Pin a note
router.post("/:id/pin", auth, notesController.pinNote);

// Unpin a note
router.delete("/:id/pin", auth, notesController.unpinNote);

// Toggle pin status
router.patch("/:id/pin", auth, notesController.togglePin);
```

---

## 📝 Step 9: Create Pin Controller Methods

### Add to `Backend/controllers/notes.controller.js`

```javascript
exports.pinNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isPinned: true, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Failed to pin note" });
  }
};

exports.unpinNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { isPinned: false, updatedAt: Date.now() },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Failed to unpin note" });
  }
};

exports.togglePin = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findById(id);
    if (!note || note.userId.toString() !== req.userId) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isPinned = !note.isPinned;
    note.updatedAt = Date.now();
    await note.save();

    res.status(200).json(note);
  } catch (error) {
    res.status(500).json({ message: "Failed to toggle pin" });
  }
};
```

---

## 📝 Step 10: Register Routes in app.js

### File: `Backend/app.js`

```javascript
// Add these routes to your app.js (usually after existing routes):

const tagsRoutes = require("./routes/tags.routes");
const foldersRoutes = require("./routes/folders.routes");

// Register routes
app.use("/api/v1/tags", tagsRoutes);
app.use("/api/v1/folders", foldersRoutes);
// Notes routes should already include the pin endpoints
```

---

## ✅ Implementation Checklist

- [ ] Add new fields to Note model (isPinned, folderId, tags, etc.)
- [ ] Create Tag model
- [ ] Create Folder model
- [ ] Create tags.routes.js
- [ ] Create folders.routes.js
- [ ] Create tags.controller.js
- [ ] Create folders.controller.js
- [ ] Add pin methods to notes.controller.js
- [ ] Add routes to app.js
- [ ] Test all endpoints

---

## 🧪 Testing Endpoints

### Test Pin Endpoint
```bash
# Pin a note
POST /api/v1/notes/:noteId/pin

# Unpin a note
DELETE /api/v1/notes/:noteId/pin

# Toggle pin
PATCH /api/v1/notes/:noteId/pin
```

### Test Tag Endpoints
```bash
# Get all tags
GET /api/v1/tags

# Create tag
POST /api/v1/tags
Body: { "name": "Important", "color": "#ff0000" }

# Update tag
PUT /api/v1/tags/:tagId
Body: { "name": "Updated", "color": "#00ff00" }

# Delete tag
DELETE /api/v1/tags/:tagId
```

### Test Folder Endpoints
```bash
# Get all folders
GET /api/v1/folders

# Get folder tree
GET /api/v1/folders/tree

# Create folder
POST /api/v1/folders
Body: { "name": "My Folder", "icon": "📁", "color": "#fbbf24" }

# Update folder
PUT /api/v1/folders/:folderId
Body: { "name": "Updated Folder" }

# Delete folder
DELETE /api/v1/folders/:folderId
```

---

## 🎉 After Implementation

Once you implement these endpoints:
1. ✅ Pin feature will work end-to-end
2. ✅ Folders feature will work
3. ✅ Tags feature will work
4. ✅ All 404 errors will be resolved
5. ✅ Frontend will fully synchronize with backend

---

## 📊 Summary

**What's Ready (Frontend):** 100% ✅
- UI implemented
- Services created
- Components working

**What Needs Implementation (Backend):** 0% ⏳
- 2 new models (Tag, Folder)
- 2 new controllers (Tags, Folders)
- 2 new routes (Tags, Folders)
- 3 new methods in Notes controller (pin/unpin/toggle)
- 1 model update (Note)

**Total Time to Implement:** ~1-2 hours

---

**Start with models, then controllers, then routes. Test each endpoint as you go!**
