
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    file_name: { type: String, maxlength: 255, default: null },
    url: { type: String, default: null },
    key: { type: String, maxlength: 255, default: null },
  },
  { _id: false }
);

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  images: [imageSchema],
  icon: [imageSchema],
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
const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
