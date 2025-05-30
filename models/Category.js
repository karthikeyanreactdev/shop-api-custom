
const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  images: [
    {
      file_name: String,
      url: String,
      key: String,
      alt: String,
      isPrimary: { type: Boolean, default: false },
    },
  ],
  icon: {
    file_name: String,
    url: String,
    key: String,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  level: {
    type: Number,
    default: 0,
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  metaTags: {
    title: String,
    description: String,
    keywords: String,
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

categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentId",
});

module.exports = mongoose.model("Category", categorySchema);
