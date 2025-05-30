// Import all validation schemas from separate files
const { 
  registerSchema, 
  loginSchema, 
  changePasswordSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema 
} = require('./authValidations');

const { 
  updateUserSchema, 
  updateProfileSchema 
} = require('./userValidations');

const { 
  addressSchema 
} = require('./addressValidations');

const { 
  categorySchema 
} = require('./categoryValidations');

const { 
  productSchema 
} = require('./productValidations');

const { 
  addToCartSchema 
} = require('./cartValidations');

const { 
  createOrderSchema 
} = require('./orderValidations');

const { 
  customJsonSchema,
  viewSchema
} = require('./customJsonValidations');

const { 
  notificationSchema 
} = require('./notificationValidations');

module.exports = {
  // Auth validations
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,

  // User validations
  updateUserSchema,
  updateProfileSchema,

  // Address validations
  addressSchema,

  // Category validations
  categorySchema,

  // Product validations
  productSchema,

  // Cart validations
  addToCartSchema,

  // Order validations
  createOrderSchema,

  // CustomJson validations
  customJsonSchema,
  viewSchema,

  // Notification validations
  notificationSchema
};