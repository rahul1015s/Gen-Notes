import mongoose from "mongoose";

const tagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: [true, "Tag name is required"],
      trim: true,
      minlength: [1, "Tag name cannot be empty"],
      maxlength: [30, "Tag name cannot exceed 30 characters"],
    },
    color: {
      type: String,
      default: "#4ECDC4",
      match: [/^#[0-9A-F]{6}$/i, "Invalid color format"],
    },
    noteCount: {
      type: Number,
      default: 0,
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug
tagSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
  }
  next();
});

// Index for faster queries
tagSchema.index({ userId: 1, slug: 1 });
tagSchema.index({ userId: 1, name: 1 });

export default mongoose.model("Tag", tagSchema);
