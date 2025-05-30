
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      productName: String,
      productImages: [
        {
          file_name: String,
          url: String,
          key: String,
        },
      ],
      count: Number,
      priceBreakdown: {
        basePrice: Number,
        designCost: Number,
        totalUnitPrice: Number,
        totalAmount: Number,
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
            position: String,
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
    },
  ],
  billingAddress: {
    address1: String,
    address2: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
  },
  shippingAddress: {
    address1: String,
    address2: String,
    landmark: String,
    city: String,
    state: String,
    pincode: String,
  },
  paymentMethod: {
    type: String,
    enum: ["card", "upi", "netbanking", "cod", "wallet"],
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending",
  },
  orderStatus: {
    type: String,
    enum: [
      "placed",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "placed",
  },
  isScheduledDelivery: {
    type: Boolean,
    default: false,
  },
  scheduledDateTime: {
    type: Date,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  taxAmount: {
    type: Number,
    default: 0,
  },
  shippingAmount: {
    type: Number,
    default: 0,
  },
  discountAmount: {
    type: Number,
    default: 0,
  },
  invoiceData: {
    invoiceNumber: String,
    invoiceDate: Date,
    dueDate: Date,
    taxDetails: [
      {
        taxType: String,
        rate: Number,
        amount: Number,
      },
    ],
  },
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber =
      "ORD" +
      Date.now() +
      Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
