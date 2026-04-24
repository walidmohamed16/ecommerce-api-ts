import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types';

interface JwtPayload {
  id: string;
}

const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // 1. Check if token exists
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(
        new ApiError('You are not logged in. Please login first', 401)
      );
    }

    // 2. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // 3. Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ApiError('User no longer exists', 401));
    }

    // 4. Add user to request
    req.user = user as any;
    next();
  } catch (error) {
    return next(new ApiError('Invalid token. Please login again', 401));
  }
};

export default auth;