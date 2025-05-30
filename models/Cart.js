
const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  count: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  customization: {
    selectedColor: {
      name: String,
      hexCode: String,
      price: Number,
    },
    selectedSize: {
      name: String,
      price: Number,
    },
    designCustomizations: [
      {
        position: {
          type: String,
          enum: ["front", "back", "left", "right", "top", "bottom"],
        },
        designAreaName: String,
        customText: String,
        customImages: [
          {
            file_name: String,
            url: String,
            key: String,
          },
        ],
        price: Number,
      },
    ],
  },
  priceBreakdown: {
    basePrice: Number,
    designCost: Number,
    totalUnitPrice: Number,
    totalAmount: Number,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

cartSchema.pre("save", async function (next) {
  let cartTotal = 0;

  for (let item of this.items) {
    const product = await mongoose.model("Product").findById(item.productId);
    if (product) {
      const pricing = product.calculatePrice(
        item.count,
        item.customization.designCustomizations
      );

      item.priceBreakdown = {
        basePrice: pricing.basePrice,
        designCost: pricing.designCost,
        totalUnitPrice: pricing.totalPrice,
        totalAmount: pricing.finalAmount,
      };

      cartTotal += pricing.finalAmount;
    }
  }

  this.totalAmount = cartTotal;
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Cart", cartSchema);
