
const Joi = require('joi');

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

module.exports = {
  updateUserSchema,
  updateProfileSchema
};
