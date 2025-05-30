
const Joi = require('joi');

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

module.exports = {
  addToCartSchema
};
