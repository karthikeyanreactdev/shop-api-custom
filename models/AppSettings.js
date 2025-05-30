
const mongoose = require("mongoose");

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

module.exports = mongoose.model("AppSettings", appSettingsSchema);
