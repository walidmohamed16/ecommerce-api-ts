import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middlewares/errorHandler';
import ApiError from './utils/apiError';
import { apiLimiter, authLimiter } from './middlewares/rateLimiter';

// Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';

const app: Application = express();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://ecommerce-frontend-wine-three.vercel.app'  
  ],
  credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));

// Rate Limiting
app.use('/api', apiLimiter);

// Apply authLimiter ONLY to login and register (not /me)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'E-Commerce API (TypeScript) is running!'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);

// Handle undefined routes
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server`, 404));
});

// Error Handler
app.use(errorHandler);

export default app;