import rateLimit from 'express-rate-limit';

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    status: 'fail',
    message: 'Too many requests, please try again after 15 minutes'
  }
});

// Auth limiter (stricter)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    status: 'fail',
    message: 'Too many login attempts, please try again after 15 minutes'
  }
});