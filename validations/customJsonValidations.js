const Joi = require('joi');

const svgJoiSchema = Joi.object({
  file_name: Joi.string().max(255).allow(null, ''),
  url: Joi.string().uri().allow(null, ''),
  key: Joi.string().max(255).allow(null, ''),
  alt: Joi.string().max(255).allow(null, '')
});

const designAreaJoiSchema = Joi.object({
  x: Joi.number().required(),
  y: Joi.number().required(),
  width: Joi.number().required(),
  height: Joi.number().required(),
  label: Joi.string().required()
});

const viewSchema = Joi.object({
  designAreas: Joi.array().items(designAreaJoiSchema).default([]),
  svg: Joi.array().items(svgJoiSchema).default([]),
  price: Joi.number().min(0).default(0),
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
    bottom: viewSchema,
  }).required(),
  availableColors: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      hexCode: Joi.string().required(),
      color: Joi.string().optional(), // Optional if you sometimes omit it
      price: Joi.number().min(0).default(0)
    })
  ).default([]),
  availableSizes: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      size: Joi.string().optional(),
      chest: Joi.string().optional(),
      length: Joi.string().optional(),
      price: Joi.number().min(0).default(0)
    })
  ).default([]),
  isColorAvailable: Joi.boolean().default(true),
  isSizeAvailable: Joi.boolean().default(true),
  createdAt: Joi.date().optional()
});

module.exports = {
  customJsonSchema,
  viewSchema
};
