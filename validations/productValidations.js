
const Joi = require('joi');

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

module.exports = {
  productSchema
};
