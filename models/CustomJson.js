
const mongoose = require("mongoose");

const customJsonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  isFront: { type: Boolean, default: false },
  isBack: { type: Boolean, default: false },
  isLeft: { type: Boolean, default: false },
  isRight: { type: Boolean, default: false },
  isTop: { type: Boolean, default: false },
  isBottom: { type: Boolean, default: false },
  front: {
    designAreas: [
      {
        name: String,
        coordinates: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
      },
    ],
    images: [
      {
        file_name: String,
        url: String,
        key: String,
      },
    ],
    price: { type: Number, default: 0 },
  },
  back: {
    designAreas: [
      {
        name: String,
        coordinates: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
      },
    ],
    images: [
      {
        file_name: String,
        url: String,
        key: String,
      },
    ],
    price: { type: Number, default: 0 },
  },
  left: {
    designAreas: [
      {
        name: String,
        coordinates: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
      },
    ],
    images: [
      {
        file_name: String,
        url: String,
        key: String,
      },
    ],
    price: { type: Number, default: 0 },
  },
  right: {
    designAreas: [
      {
        name: String,
        coordinates: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
      },
    ],
    images: [
      {
        file_name: String,
        url: String,
        key: String,
      },
    ],
    price: { type: Number, default: 0 },
  },
  top: {
    designAreas: [
      {
        name: String,
        coordinates: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
      },
    ],
    images: [
      {
        file_name: String,
        url: String,
        key: String,
      },
    ],
    price: { type: Number, default: 0 },
  },
  bottom: {
    designAreas: [
      {
        name: String,
        coordinates: {
          x: Number,
          y: Number,
          width: Number,
          height: Number,
        },
      },
    ],
    images: [
      {
        file_name: String,
        url: String,
        key: String,
      },
    ],
    price: { type: Number, default: 0 },
  },
  availableColors: [
    {
      name: String,
      hexCode: String,
      price: { type: Number, default: 0 },
    },
  ],
  availableSizes: [
    {
      name: String,
      price: { type: Number, default: 0 },
    },
  ],
  isColorAvailable: { type: Boolean, default: true },
  isSizeAvailable: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("CustomJson", customJsonSchema);
