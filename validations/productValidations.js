const Joi = require("joi");

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
    tierPricing: Joi.array()
      .items(
        Joi.object({
          minQuantity: Joi.number().min(1).required(),
          maxQuantity: Joi.number().min(1).optional(),
          discountType: Joi.string().valid("percentage", "fixed").required(),
          discountValue: Joi.number().min(0).required(),
          isActive: Joi.boolean().default(true),
        })
      )
      .optional(),
    designAreaPricing: Joi.array()
      .items(
        Joi.object({
          designAreaName: Joi.string().required(),
          position: Joi.string()
            .valid("front", "back", "left", "right", "top", "bottom")
            .required(),
          price: Joi.number().min(0).required(),
          isActive: Joi.boolean().default(true),
        })
      )
      .optional(),
  }).required(),
  images: Joi.array()
    .items(
      Joi.object({
        file_name: Joi.string().max(255).allow(null, ""), // Optional
        url: Joi.string().uri().allow(null, ""), // Optional
        key: Joi.string().max(255).allow(null, ""), // Optional
      })
    )
    .allow(null, "")
    .optional(),
  categoryId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required(),
  categoryTree: Joi.object({
    selectedId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .required(),
    selectedCategory: Joi.object({
      _id: Joi.string()
        .pattern(/^[0-9a-fA-F]{24}$/)
        .required(),
      name: Joi.string().required(),
      description: Joi.string().allow("", null),
      images: Joi.array().items(
        Joi.object({
          file_name: Joi.string().max(255).allow("", null),
          url: Joi.string().uri().allow("", null),
          key: Joi.string().max(255).allow("", null),
        })
      ),
      parentId: Joi.object({
        _id: Joi.string()
          .pattern(/^[0-9a-fA-F]{24}$/)
          .required(),
        name: Joi.string().required(),
      }).required(),
      level: Joi.number().default(0),
      isActive: Joi.boolean().default(true),
      isFeatured: Joi.boolean().default(false),
      sortOrder: Joi.number().default(0),
      icon: Joi.array().items(Joi.any()).optional(),
      createdAt: Joi.date().optional(),
      updatedAt: Joi.date().optional(),
      __v: Joi.number().optional(),
    }).required(),
    parentId: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional(),
    level1Id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional(),
    level2Id: Joi.string()
      .pattern(/^[0-9a-fA-F]{24}$/)
      .optional(),
  })
    .allow(null)
    .optional(),
  customJsonId: Joi.string().allow('', null)
    .optional(),
  isActive: Joi.boolean().default(true),
  isCustomAllowed: Joi.boolean().default(false),
  isFeatured: Joi.boolean().default(false),
  stock: Joi.number().min(0).default(0),
  minOrderQuantity: Joi.number().min(1).default(1),
  maxOrderQuantity: Joi.number().min(1).optional(),
  ratings: Joi.object({
    average: Joi.number().default(0),
    count: Joi.number().default(0),
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  specifications: Joi.array()
    .items(
      Joi.object({
        key: Joi.string().required(),
        value: Joi.string().required(),
      })
    )
    .optional(),
  weight: Joi.object({
    value: Joi.number(),
    unit: Joi.string().default("kg"),
  }).optional(),
  dimensions: Joi.object({
    length: Joi.number(),
    width: Joi.number(),
    height: Joi.number(),
    unit: Joi.string().default("cm"),
  }).optional(),
});

module.exports = {
  productSchema,
};
