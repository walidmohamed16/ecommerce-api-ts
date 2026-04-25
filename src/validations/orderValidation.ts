import Joi from 'joi';

export const createOrderValidation = Joi.object({
  shippingAddress: Joi.object({
    street: Joi.string()
      .required()
      .messages({
        'any.required': 'Street is required'
      }),
    city: Joi.string()
      .required()
      .messages({
        'any.required': 'City is required'
      }),
    country: Joi.string()
      .required()
      .messages({
        'any.required': 'Country is required'
      }),
    phone: Joi.string()
      .required()
      .messages({
        'any.required': 'Phone is required'
      })
  }).required().messages({
    'any.required': 'Shipping address is required'
  })
});

export const updateOrderStatusValidation = Joi.object({
  orderStatus: Joi.string()
    .valid('processing', 'shipped', 'delivered', 'cancelled')
    .required()
    .messages({
      'any.only': 'Invalid order status',
      'any.required': 'Order status is required'
    })
});