
const Joi = require('joi');

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

module.exports = {
  categorySchema
};
