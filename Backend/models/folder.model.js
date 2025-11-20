import mongoose from "mongoose";

const folderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Folder name is required"],
      trim: true,
      minlength: [1, "Folder name cannot be empty"],
      maxlength: [50, "Folder name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    icon: {
      type: String,
      default: "📁",
    },
    color: {
      type: String,
      default: "#4ECDC4",
      match: [/^#[0-9A-F]{6}$/i, "Invalid color format"],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Folder",
      default: null,
    },
    noteCount: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
folderSchema.index({ userId: 1, parentId: 1 });
folderSchema.index({ userId: 1, name: 1 });

export default mongoose.model("Folder", folderSchema);
