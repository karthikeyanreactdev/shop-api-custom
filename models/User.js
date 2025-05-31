const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const imageSchema = new mongoose.Schema(
  {
    file_name: { type: String, maxlength: 255, default: null },
    url: { type: String, default: null },
    key: { type: String, maxlength: 255, default: null },
  },
  { _id: false }
);

// 1. User Model (handles login, register, profile)
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  role: {
    type: String,
    enum: ["customer", "admin", "vendor"],
    default: "customer",
  },
  referralCode: {
    type: String,
    trim: true,
  },
  profilePicture: [imageSchema],
  isActive: {
    type: Boolean,
    default: true,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
module.exports = User;