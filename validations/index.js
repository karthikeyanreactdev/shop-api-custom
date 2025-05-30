const Joi = require('joi');

// Auth validations
const registerSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
  phone: Joi.string().required().pattern(/^[0-9]{10}$/)
});

const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required'
    })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      'any.required': 'Current password is required'
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required'
    })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': 'Reset token is required'
    }),
  newPassword: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'New password must be at least 6 characters long',
      'any.required': 'New password is required'
    })
});

// User validations
const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  mobile: Joi.string().pattern(/^[0-9]{10}$/),
  gender: Joi.string().valid('male', 'female', 'other')
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  phone: Joi.string().pattern(/^[0-9]{10}$/),
  dateOfBirth: Joi.date(),
  gender: Joi.string().valid('male', 'female', 'other')
});

// Address validations
const addressSchema = Joi.object({
  type: Joi.string().valid('home', 'work', 'other', 'billing', 'shipping').default('home'),
  address1: Joi.string().required().max(200),
  address2: Joi.string().max(200),
  city: Joi.string().required().max(100),
  state: Joi.string().required().max(100),
  pincode: Joi.string().required().pattern(/^[0-9]{6}$/),
  country: Joi.string().max(100).default('India'),
  landmark: Joi.string().max(200),
  isDefault: Joi.boolean().default(false)
});

// Category validations
const categorySchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  description: Joi.string().max(500),
  parentId: Joi.string().allow(null),
  level: Joi.number().integer().min(0).max(5).default(0),
  isActive: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false),
  sortOrder: Joi.number().integer().min(0).default(0),
  metaTags: Joi.object({
    title: Joi.string().max(100),
    description: Joi.string().max(200),
    keywords: Joi.string().max(500)
  })
});

// Product validations
const productSchema = Joi.object({
  name: Joi.string().required().min(2).max(200),
  description: Joi.string().required().max(2000),
  shortDescription: Joi.string().max(500),
  sku: Joi.string().required(),
  brand: Joi.string().max(100),
  categoryId: Joi.string().required(),
  price: Joi.number().min(0).required(),
  salePrice: Joi.number().min(0),
  isOnSale: Joi.boolean().default(false),
  stockQuantity: Joi.number().integer().min(0).default(0),
  lowStockThreshold: Joi.number().integer().min(0).default(5),
  weight: Joi.number().min(0),
  dimensions: Joi.object({
    length: Joi.number().min(0),
    width: Joi.number().min(0),
    height: Joi.number().min(0)
  }),
  isActive: Joi.boolean().default(true),
  isFeatured: Joi.boolean().default(false),
  tags: Joi.array().items(Joi.string()),
  metaTags: Joi.object({
    title: Joi.string().max(100),
    description: Joi.string().max(200),
    keywords: Joi.string().max(500)
  }),
  materialType: Joi.string(),
  tagLine: Joi.string(),
  pricing: Joi.object({
    basePrice: Joi.number().min(0).required(),
    offerPrice: Joi.number().min(0).optional(),
    tierPricing: Joi.array().items(Joi.object({
      minQuantity: Joi.number().min(1).required(),
      maxQuantity: Joi.number().min(1).optional(),
      discountType: Joi.string().valid('percentage', 'fixed').required(),
      discountValue: Joi.number().min(0).required(),
      isActive: Joi.boolean().optional()
    })).optional(),
    designAreaPricing: Joi.array().items(Joi.object({
      designAreaName: Joi.string().required(),
      position: Joi.string().valid('front', 'back', 'left', 'right', 'top', 'bottom').required(),
      price: Joi.number().min(0).required(),
      isActive: Joi.boolean().optional()
    })).optional()
  }),
  customJsonId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  isCustomAllowed: Joi.boolean().optional(),
  stock: Joi.number().min(0).optional(),
  minOrderQuantity: Joi.number().min(1).optional(),
  maxOrderQuantity: Joi.number().min(1).optional(),
  specifications: Joi.array().items(Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required()
  })).optional()
});

// Cart validations
const addToCartSchema = Joi.object({
  productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  count: Joi.number().min(1).required(),
  customization: Joi.object({
    selectedColor: Joi.object({
      name: Joi.string().required(),
      hexCode: Joi.string().required(),
      price: Joi.number().min(0).required()
    }).optional(),
    selectedSize: Joi.object({
      name: Joi.string().required(),
      price: Joi.number().min(0).required()
    }).optional(),
    designCustomizations: Joi.array().items(Joi.object({
      position: Joi.string().valid('front', 'back', 'left', 'right', 'top', 'bottom').required(),
      designAreaName: Joi.string().required(),
      customText: Joi.string().optional(),
      price: Joi.number().min(0).required()
    })).optional()
  }).optional()
});

// Order validations
const createOrderSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    productId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
    count: Joi.number().min(1).required(),
    customization: Joi.object().optional()
  })).required(),
  billingAddress: Joi.object({
    address1: Joi.string().required(),
    address2: Joi.string().optional(),
    landmark: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).required()
  }).required(),
  shippingAddress: Joi.object({
    address1: Joi.string().required(),
    address2: Joi.string().optional(),
    landmark: Joi.string().optional(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    pincode: Joi.string().pattern(/^[0-9]{6}$/).required()
  }).required(),
  paymentMethod: Joi.string().valid('card', 'upi', 'netbanking', 'cod', 'wallet').required(),
  isScheduledDelivery: Joi.boolean().optional(),
  scheduledDateTime: Joi.date().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateUserSchema,
  updateProfileSchema,
  addressSchema,
  categorySchema,
  productSchema,
  addToCartSchema,
  createOrderSchema
};