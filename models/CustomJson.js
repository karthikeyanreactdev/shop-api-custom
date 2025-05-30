const mongoose = require("mongoose");

const designAreaSchema = {
  coordinates: {
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    label: String,
  },
};

const viewSchema = {
  designAreas: [designAreaSchema],
  images: [
    {
      file_name: String,
      url: String,
      key: String,
    },
  ],
  price: { type: Number, default: 0 },
};

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
  views: {
    front: viewSchema,
    back: viewSchema,
    left: viewSchema,
    right: viewSchema,
    top: viewSchema,
    bottom: viewSchema,
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