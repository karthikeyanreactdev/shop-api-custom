
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["home", "work", "other", "billing", "shipping"],
    default: "home",
    required: true,
  },
  address1: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
  },
  address2: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  landmark: {
    type: String,
    trim: true,
    maxlength: 200,
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
    match: /^[0-9]{6}$/,
  },
  country: {
    type: String,
    trim: true,
    maxlength: 100,
    default: "India",
  },
  isDefault: {
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

module.exports = mongoose.model("Address", addressSchema);
