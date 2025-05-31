
const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema(
  {
    file_name: { type: String, maxlength: 255, default: null },
    url: { type: String, default: null },
    key: { type: String, maxlength: 255, default: null },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  brand: {
    type: String,
    required: true,
    trim: true,
  },
  materialType: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  tagLine: {
    type: String,
    trim: true,
  },
  pricing: {
    basePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    offerPrice: {
      type: Number,
      min: 0,
    },
    tierPricing: [
      {
        minQuantity: {
          type: Number,
          required: true,
          min: 1,
        },
        maxQuantity: {
          type: Number,
          min: 1,
        },
        discountType: {
          type: String,
          enum: ["percentage", "fixed"],
          required: true,
        },
        discountValue: {
          type: Number,
          required: true,
          min: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    designAreaPricing: [
      {
        designAreaName: {
          type: String,
          required: true,
        },
        position: {
          type: String,
          enum: ["front", "back", "left", "right", "top", "bottom"],
          required: true,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  images: [imageSchema],
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  customJsonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "CustomJson",
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isCustomAllowed: {
    type: Boolean,
    default: false,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
    default: 0,
    min: 0,
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  maxOrderQuantity: {
    type: Number,
    min: 1,
  },
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
  },
  tags: [String],
  specifications: [
    {
      key: String,
      value: String,
    },
  ],
  weight: {
    value: Number,
    unit: { type: String, default: "kg" },
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: "cm" },
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

productSchema.methods.calculatePrice = function (
  quantity,
  designCustomizations = []
) {
  let finalPrice = this.pricing.offerPrice || this.pricing.basePrice;

  const applicableTier = this.pricing.tierPricing
    .filter(
      (tier) =>
        tier.isActive &&
        quantity >= tier.minQuantity &&
        (!tier.maxQuantity || quantity <= tier.maxQuantity)
    )
    .sort((a, b) => b.minQuantity - a.minQuantity)[0];

  if (applicableTier) {
    if (applicableTier.discountType === "percentage") {
      finalPrice = finalPrice * (1 - applicableTier.discountValue / 100);
    } else {
      finalPrice = finalPrice - applicableTier.discountValue;
    }
  }

  let designCost = 0;
  designCustomizations.forEach((customization) => {
    const designAreaPrice = this.pricing.designAreaPricing.find(
      (da) =>
        da.designAreaName === customization.designAreaName &&
        da.position === customization.position &&
        da.isActive
    );

    if (designAreaPrice) {
      designCost += designAreaPrice.price;
    }
  });

  return {
    basePrice: finalPrice,
    designCost: designCost,
    totalPrice: finalPrice + designCost,
    quantity: quantity,
    finalAmount: (finalPrice + designCost) * quantity,
  };
};

productSchema.virtual("finalPrice").get(function () {
  return this.pricing.offerPrice || this.pricing.basePrice;
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;