const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');

const svgSchema = new mongoose.Schema(
  {
    file_name: { type: String, maxlength: 255, default: null },
    url: { type: String, default: null },
    key: { type: String, maxlength: 255, default: null },
    alt: { type: String, maxlength: 255, default: null }
  },
  { _id: false }
);

const designAreaSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: () => uuidv4()  // auto-generates UUID if not provided
    },
    isCustom: { type: Boolean, default: true },
    x: Number,
    y: Number,
    width: Number,
    height: Number,
    label: String
  },
  { _id: false }
);

const viewSchema = new mongoose.Schema(
  {
    designAreas: [designAreaSchema],
    svg: [svgSchema],
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

const availableColorSchema = new mongoose.Schema(
  {
    name: String,
    hexCode: String,
    color: String,
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

const availableSizeSchema = new mongoose.Schema(
  {
    name: String,
    size: String,
    chest: String,
    length: String,
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

const customJsonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
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
    bottom: viewSchema
  },
  availableColors: [availableColorSchema],
  availableSizes: [availableSizeSchema],
  isColorAvailable: { type: Boolean, default: true },
  isSizeAvailable: { type: Boolean, default: true },
  createdAt: {
    type: Date,
    default: Date.now
  }
});


const CustomJson = mongoose.model("CustomJson", customJsonSchema);
module.exports = CustomJson;
