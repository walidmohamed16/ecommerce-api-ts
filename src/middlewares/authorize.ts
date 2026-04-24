import { Response, NextFunction } from 'express';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types';

const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(
        new ApiError('You do not have permission to perform this action', 403)
      );
      return;
    }
    next();
  };
};

export default authorize;