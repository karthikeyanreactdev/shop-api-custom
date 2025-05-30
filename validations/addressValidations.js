
const Joi = require('joi');

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

module.exports = {
  addressSchema
};
