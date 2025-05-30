
const Joi = require('joi');

const viewSchema = Joi.object({
  designAreas: Joi.array().items(Joi.object({
    coordinates: Joi.object({
      x: Joi.number(),
      y: Joi.number(),
      width: Joi.number(),
      height: Joi.number(),
      label: Joi.string()
    })
  })),
  images: Joi.array().items(Joi.object({
    file_name: Joi.string(),
    url: Joi.string(),
    key: Joi.string()
  })),
  price: Joi.number().min(0).default(0)
});

const customJsonSchema = Joi.object({
  name: Joi.string().required().trim(),
  isFront: Joi.boolean().default(false),
  isBack: Joi.boolean().default(false),
  isLeft: Joi.boolean().default(false),
  isRight: Joi.boolean().default(false),
  isTop: Joi.boolean().default(false),
  isBottom: Joi.boolean().default(false),
  views: Joi.object({
    front: viewSchema,
    back: viewSchema,
    left: viewSchema,
    right: viewSchema,
    top: viewSchema,
    bottom: viewSchema
  }),
  availableColors: Joi.array().items(Joi.object({
    name: Joi.string(),
    hexCode: Joi.string(),
    price: Joi.number().min(0).default(0)
  })),
  availableSizes: Joi.array().items(Joi.object({
    name: Joi.string(),
    price: Joi.number().min(0).default(0)
  })),
  isColorAvailable: Joi.boolean().default(true),
  isSizeAvailable: Joi.boolean().default(true)
});

module.exports = {
  customJsonSchema,
  viewSchema
};
