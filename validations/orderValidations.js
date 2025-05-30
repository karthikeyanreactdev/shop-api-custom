
const Joi = require('joi');

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
  createOrderSchema
};
