import { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  if (err.code === 11000) {
    err.statusCode = 400;
    err.status = 'fail';
    err.message = 'this product already exist';
  }

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

export default errorHandler;