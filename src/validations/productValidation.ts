import Joi from 'joi';

export const createProductValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Product name must be at least 2 characters',
      'any.required': 'Product name is required'
    }),
  description: Joi.string()
    .min(10)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'any.required': 'Description is required'
    }),
  price: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Price cannot be negative',
      'any.required': 'Price is required'
    }),
  category: Joi.string()
    .valid('electronics', 'clothing', 'books', 'food', 'furniture', 'sports', 'beauty', 'other')
    .required()
    .messages({
      'any.only': 'Invalid category',
      'any.required': 'Category is required'
    }),
  stock: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Stock cannot be negative',
      'any.required': 'Stock is required'
    }),
  images: Joi.array()
    .items(Joi.string())
    .optional()
});

export const updateProductValidation = Joi.object({
  name: Joi.string()
    .min(2)
    .max(200)
    .optional(),
  description: Joi.string()
    .min(10)
    .max(2000)
    .optional(),
  price: Joi.number()
    .min(0)
    .optional(),
  category: Joi.string()
    .valid('electronics', 'clothing', 'books', 'food', 'furniture', 'sports', 'beauty', 'other')
    .optional(),
  stock: Joi.number()
    .min(0)
    .optional(),
  images: Joi.array()
    .items(Joi.string())
    .optional(),
  isActive: Joi.boolean()
    .optional()
});