const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 2. Address Model
const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["billing", "shipping"],
    required: true,
  },
  address1: {
    type: String,
    required: true,
    trim: true,
  },
  address2: {
    type: String,
    trim: true,
  },
  landmark: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
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

const Address = mongoose.model("Address", addressSchema);

// 6. Cart Model
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

const Cart = mongoose.model("Cart", cartSchema);

// 7. Order Model
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

const Order = mongoose.model("Order", orderSchema);

// 8. Notification Model
const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["order", "payment", "promotion", "system", "delivery"],
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  relatedOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

// 9. App Settings Model
const appSettingsSchema = new mongoose.Schema({
  appName: {
    type: String,
    default: "MultiVendor Marketplace",
  },
  siteName: {
    type: String,
    default: "MultiVendor E-commerce",
  },
  logo: [
    {
      file_name: String,
      url: String,
      key: String,
    },
  ],
  favicon: [
    {
      file_name: String,
      url: String,
      key: String,
    },
  ],
  contactEmail: {
    type: String,
    required: true,
  },
  siteEmail: {
    type: String,
    required: true,
  },
  contactPhone: {
    type: String,
    required: true,
  },
  sitePhone: {
    type: String,
    required: true,
  },
  address: String,
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
  },
  aboutUs: String,
  termsAndConditions: String,
  privacyPolicy: String,
  currency: {
    code: {
      type: String,
      default: "USD",
    },
    symbol: {
      type: String,
      default: "$",
    },
  },
  currencyCode: {
    type: String,
    default: "INR",
  },
  currencySymbol: {
    type: String,
    default: "₹",
  },
  metaTags: {
    title: String,
    description: String,
    keywords: String,
  },
  defaultLanguage: {
    type: String,
    default: "en",
  },
  emailNotifications: {
    orderConfirmation: { type: Boolean, default: true },
    orderStatusUpdate: { type: Boolean, default: true },
    orderShipped: { type: Boolean, default: false },
    orderDelivered: { type: Boolean, default: true },
    orderCancelled: { type: Boolean, default: true },
    newAccountCreated: { type: Boolean, default: true },
  },
  shopTiming: {
    monday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: "08:00 AM" },
      closeTime: { type: String, default: "09:00 PM" },
    },
    tuesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: "08:00 AM" },
      closeTime: { type: String, default: "09:00 PM" },
    },
    wednesday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: "08:00 AM" },
      closeTime: { type: String, default: "09:00 PM" },
    },
    thursday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: "08:00 AM" },
      closeTime: { type: String, default: "09:00 PM" },
    },
    friday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: "08:00 AM" },
      closeTime: { type: String, default: "09:00 PM" },
    },
    saturday: {
      isOpen: { type: Boolean, default: true },
      openTime: { type: String, default: "08:00 AM" },
      closeTime: { type: String, default: "09:00 PM" },
    },
    sunday: {
      isOpen: { type: Boolean, default: false },
      openTime: { type: String, default: "08:00 AM" },
      closeTime: { type: String, default: "09:00 PM" },
    },
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
  paymentGateways: {
    cashOnDelivery: {
      isActive: { type: Boolean, default: true },
    },
    razorpay: {
      isActive: { type: Boolean, default: false },
      keyId: String,
      keySecret: String,
    },
    stripe: {
      isActive: { type: Boolean, default: false },
      publishableKey: String,
      secretKey: String,
    },
    paypal: {
      isActive: { type: Boolean, default: false },
      clientId: String,
      clientSecret: String,
    },
  },
  shippingMethods: [
    {
      name: String,
      description: String,
      cost: Number,
      estimatedDays: String,
      isActive: { type: Boolean, default: true },
    },
  ],
  smtpSettings: {
    isActive: { type: Boolean, default: false },
    host: String,
    port: { type: Number, default: 587 },
    username: String,
    password: String,
    fromEmail: String,
    fromName: String,
  },
  home: {
    sections: [
      {
        name: String,
        description: String,
        isActive: { type: Boolean, default: true },
        products: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
        ],
      },
    ],
    banners: [
      {
        images: [
          {
            file_name: String,
            url: String,
            key: String,
          },
        ],
        mobileUrl: String,
        webUrl: String,
        isActive: { type: Boolean, default: true },
      },
    ],
  },
  serviceLocations: [
    {
      location: String,
      lat: String,
      lang: String,
      maxServiceDistance: { type: Number, default: 5 },
      isActive: { type: Boolean, default: true },
    },
  ],
  taxSettings: {
    enableTax: { type: Boolean, default: true },
    taxRate: { type: Number, default: 18 },
    taxName: { type: String, default: "GST" },
  },
  deliverySettings: {
    enableScheduledDelivery: { type: Boolean, default: true },
    freeDeliveryMinOrder: { type: Number, default: 500 },
    deliveryCharges: { type: Number, default: 50 },
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

appSettingsSchema.index({}, { unique: true });

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);

// 10. User Settings Model
const userSettingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  notifications: {
    email: {
      orderUpdates: { type: Boolean, default: false },
      promotions: { type: Boolean, default: false },
      newsletter: { type: Boolean, default: false },
    },
    push: {
      orderUpdates: { type: Boolean, default: false },
      promotions: { type: Boolean, default: false },
      reminders: { type: Boolean, default: false },
    },
    sms: {
      orderUpdates: { type: Boolean, default: false },
      promotions: { type: Boolean, default: false },
    },
  },
  // privacy: {
  //   profileVisibility: {
  //     type: String,
  //     enum: ["public", "private"],
  //     default: "private",
  //   },
  //   dataSharing: { type: Boolean, default: false },
  //   showOnlineStatus: { type: Boolean, default: true },
  // },
  // preferences: {
  //   currency: { type: String, default: "INR" },
  //   language: { type: String, default: "en" },
  //   theme: {
  //     type: String,
  //     enum: ["light", "dark", "auto"],
  //     default: "light",
  //   },
  //   timezone: { type: String, default: "Asia/Kolkata" },
  // },
  // deliveryPreferences: {
  //   preferredTimeSlot: {
  //     type: String,
  //     enum: ["morning", "afternoon", "evening", "anytime"],
  //     default: "anytime",
  //   },
  //   specialInstructions: String,
  // },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

module.exports = {
  Address,
  Cart,
  Order,
  Notification,
  AppSettings,
  UserSettings,
};