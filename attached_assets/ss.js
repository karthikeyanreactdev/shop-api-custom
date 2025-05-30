const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
  profilePicture: [
    {
      file_name: String,
      url: String,
      key: String,
    },
  ],
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

// 3. Category Model (with subcategory support and images)
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  images: [
    {
      file_name: String,
      url: String,
      key: String,
      alt: String,
      isPrimary: { type: Boolean, default: false },
    },
  ],
  icon: {
    file_name: String,
    url: String,
    key: String,
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null, // null for root categories
  },
  level: {
    type: Number,
    default: 0, // 0 for root, 1 for first level subcategory, etc.
    min: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
  metaTags: {
    title: String,
    description: String,
    keywords: String,
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

// Virtual to get subcategories
categorySchema.virtual("subcategories", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentId",
});

const Category = mongoose.model("Category", categorySchema);

// 4. Custom JSON Model (for customization options)
const customJsonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  // Position availability flags
  isFront: { type: Boolean, default: false },
  isBack: { type: Boolean, default: false },
  isLeft: { type: Boolean, default: false },
  isRight: { type: Boolean, default: false },
  isTop: { type: Boolean, default: false },
  isBottom: { type: Boolean, default: false },

  // Customization options for each position
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

  // Available options
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

const CustomJson = mongoose.model("CustomJson", customJsonSchema);

// 5. Product Model (with multi-tier pricing)
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

  // Multi-tier Pricing Structure
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
    // Quantity-based pricing tiers (only for base product)
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
        }, // null for unlimited
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
    // Design area fixed pricing (no tiers)
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

  images: [
    {
      file_name: String,
      url: String,
      key: String,
      alt: String,
      isPrimary: { type: Boolean, default: false },
    },
  ],
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

// Method to calculate price based on quantity and customizations
productSchema.methods.calculatePrice = function (
  quantity,
  designCustomizations = []
) {
  let finalPrice = this.pricing.offerPrice || this.pricing.basePrice;

  // Apply quantity-based tier pricing (only for base product)
  const applicableTier = this.pricing.tierPricing
    .filter(
      (tier) =>
        tier.isActive &&
        quantity >= tier.minQuantity &&
        (!tier.maxQuantity || quantity <= tier.maxQuantity)
    )
    .sort((a, b) => b.minQuantity - a.minQuantity)[0]; // Get highest applicable tier

  if (applicableTier) {
    if (applicableTier.discountType === "percentage") {
      finalPrice = finalPrice * (1 - applicableTier.discountValue / 100);
    } else {
      finalPrice = finalPrice - applicableTier.discountValue;
    }
  }

  // Add design area pricing (fixed prices, no tiers)
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

// Virtual for basic final price (without quantity considerations)
productSchema.virtual("finalPrice").get(function () {
  return this.pricing.offerPrice || this.pricing.basePrice;
});

const Product = mongoose.model("Product", productSchema);

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
  // Calculated pricing breakdown
  priceBreakdown: {
    basePrice: Number, // Per unit base price after tier discount
    designCost: Number, // Per unit design cost after tier discount
    totalUnitPrice: Number, // basePrice + designCost per unit
    totalAmount: Number, // totalUnitPrice * quantity
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

// Calculate total amount and individual item prices before saving
cartSchema.pre("save", async function (next) {
  let cartTotal = 0;

  for (let item of this.items) {
    // Get product details to calculate pricing
    const product = await mongoose.model("Product").findById(item.productId);
    if (product) {
      const pricing = product.calculatePrice(
        item.count,
        item.customization.designCustomizations
      );

      // Update item price breakdown
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

// Generate order number before saving
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

// 9. App Settings Model (Global/Admin Settings)
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

  // Social Media Links
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
  },

  // Legal Pages
  aboutUs: String,
  termsAndConditions: String,
  privacyPolicy: String,

  // Currency Settings
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

  // SEO Settings
  metaTags: {
    title: String,
    description: String,
    keywords: String,
  },

  defaultLanguage: {
    type: String,
    default: "en",
  },

  // Email Notification Settings
  emailNotifications: {
    orderConfirmation: { type: Boolean, default: true },
    orderStatusUpdate: { type: Boolean, default: true },
    orderShipped: { type: Boolean, default: false },
    orderDelivered: { type: Boolean, default: true },
    orderCancelled: { type: Boolean, default: true },
    newAccountCreated: { type: Boolean, default: true },
  },

  // Shop Timing
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

  // System Settings
  maintenanceMode: {
    type: Boolean,
    default: false,
  },

  // Payment Gateway Settings
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

  // Shipping Methods
  shippingMethods: [
    {
      name: String,
      description: String,
      cost: Number,
      estimatedDays: String,
      isActive: { type: Boolean, default: true },
    },
  ],

  // SMTP Settings
  smtpSettings: {
    isActive: { type: Boolean, default: false },
    host: String,
    port: { type: Number, default: 587 },
    username: String,
    password: String,
    fromEmail: String,
    fromName: String,
  },

  // Home Page Configuration
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

  // Service Locations
  serviceLocations: [
    {
      location: String,
      lat: String,
      lang: String,
      maxServiceDistance: { type: Number, default: 5 }, // in kilometers
      isActive: { type: Boolean, default: true },
    },
  ],

  // Tax Settings
  taxSettings: {
    enableTax: { type: Boolean, default: true },
    taxRate: { type: Number, default: 18 }, // percentage
    taxName: { type: String, default: "GST" },
  },

  // Delivery Settings
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

// Ensure only one settings document exists
appSettingsSchema.index({}, { unique: true });

const AppSettings = mongoose.model("AppSettings", appSettingsSchema);

// 10. User Settings Model (Individual User Preferences)
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

const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

// Export all models
module.exports = {
  User,
  Address,
  Category,
  CustomJson,
  Product,
  Cart,
  Order,
  Notification,
  AppSettings,
  UserSettings,
};
