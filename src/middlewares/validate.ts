import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errors: string[] = error.details.map(detail => detail.message);
      res.status(400).json({
        status: 'fail',
        message: 'Validation Error',
        errors
      });
      return;
    }

    next();
  };
};

export default validate;