import Joi from 'joi';

export const createReviewValidation = Joi.object({
  productId: Joi.string()
    .required()
    .messages({
      'any.required': 'Product ID is required'
    }),
  orderId: Joi.string()
    .required()
    .messages({
      'any.required': 'Order ID is required'
    }),
  rating: Joi.number()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.min': 'Rating must be at least 1',
      'number.max': 'Rating cannot be more than 5',
      'any.required': 'Rating is required'
    }),
  comment: Joi.string()
    .min(3)
    .max(500)
    .required()
    .messages({
      'string.min': 'Comment must be at least 3 characters',
      'string.max': 'Comment cannot be more than 500 characters',
      'any.required': 'Comment is required'
    })
});

export const updateReviewValidation = Joi.object({
  rating: Joi.number()
    .min(1)
    .max(5)
    .optional(),
  comment: Joi.string()
    .min(3)
    .max(500)
    .optional()
});