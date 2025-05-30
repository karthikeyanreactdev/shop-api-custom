
const Joi = require('joi');

const notificationSchema = Joi.object({
  title: Joi.string().required().trim(),
  message: Joi.string().required().trim(),
  type: Joi.string().valid('order', 'payment', 'promotion', 'system', 'delivery').required(),
  userId: Joi.string().when('broadcast', {
    is: Joi.boolean().valid(true),
    then: Joi.optional(),
    otherwise: Joi.string().required()
  }),
  broadcast: Joi.boolean().default(false),
  relatedOrderId: Joi.string().optional()
});

module.exports = {
  notificationSchema
};
