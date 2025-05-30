
const mongoose = require("mongoose");

const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  notifications: {
    email: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: true },
      newsletter: { type: Boolean, default: false },
    },
    push: {
      orderUpdates: { type: Boolean, default: true },
      promotions: { type: Boolean, default: false },
      reminders: { type: Boolean, default: true },
    },
    sms: {
      orderUpdates: { type: Boolean, default: false },
      promotions: { type: Boolean, default: false },
    },
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    dataSharing: { type: Boolean, default: false },
    showOnlineStatus: { type: Boolean, default: true },
  },
  preferences: {
    currency: { type: String, default: "INR" },
    language: { type: String, default: "en" },
    theme: {
      type: String,
      enum: ["light", "dark", "auto"],
      default: "light",
    },
    timezone: { type: String, default: "Asia/Kolkata" },
  },
  deliveryPreferences: {
    preferredTimeSlot: {
      type: String,
      enum: ["morning", "afternoon", "evening", "anytime"],
      default: "anytime",
    },
    specialInstructions: String,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserSettings", userSettingsSchema);
