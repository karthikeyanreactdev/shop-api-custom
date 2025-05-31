
const Joi = require('joi');

const productSchema = Joi.object({
  name: Joi.string().required().min(2).max(200).trim(),
  sku: Joi.string().required().trim(),
  brand: Joi.string().required().trim(),
  materialType: Joi.string().required().trim(),
  description: Joi.string().required().max(2000),
  tagLine: Joi.string().trim().optional(),
  pricing: Joi.object({
    basePrice: Joi.number().min(0).required(),
    offerPrice: Joi.number().min(0).optional(),
    tierPricing: Joi.array().items(Joi.object({
      minQuantity: Joi.number().min(1).required(),
      maxQuantity: Joi.number().min(1).optional(),
      discountType: Joi.string().valid('percentage', 'fixed').required(),
      discountValue: Joi.number().min(0).required(),
      isActive: Joi.boolean().default(true)
    })).optional(),
    designAreaPricing: Joi.array().items(Joi.object({
      designAreaName: Joi.string().required(),
      position: Joi.string().valid('front', 'back', 'left', 'right', 'top', 'bottom').required(),
      price: Joi.number().min(0).required(),
      isActive: Joi.boolean().default(true)
    })).optional()
  }).required(),
  images: Joi.array().items(Joi.object({
    file_name: Joi.string(),
    url: Joi.string(),
    key: Joi.string(),
    alt: Joi.string(),
    isPrimary: Joi.boolean().default(false)
  })).optional(),
  categoryId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  customJsonId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  isActive: Joi.boolean().default(true),
  isCustomAllowed: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false),
  stock: Joi.number().min(0).default(0),
  minOrderQuantity: Joi.number().min(1).default(1),
  maxOrderQuantity: Joi.number().min(1).optional(),
  ratings: Joi.object({
    average: Joi.number().default(0),
    count: Joi.number().default(0)
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.array().items(Joi.object({
    key: Joi.string().required(),
    value: Joi.string().required()
  })).optional(),
  weight: Joi.object({
    value: Joi.number(),
    unit: Joi.string().default('kg')
  }).optional(),
  dimensions: Joi.object({
    length: Joi.number(),
    width: Joi.number(),
    height: Joi.number(),
    unit: Joi.string().default('cm')
  }).optional()
});

module.exports = {
  productSchema
};
