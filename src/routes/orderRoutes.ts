import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  cancelOrder,
  updateOrderStatus,
  getAllOrders
} from '../controllers/orderController';
import { createOrderValidation, updateOrderStatusValidation } from '../validations/orderValidation';
import validate from '../middlewares/validate';
import auth from '../middlewares/auth';
import authorize from '../middlewares/authorize';

const router: Router = Router();

// All routes need authentication
router.use(auth);

// User routes
router.post('/', validate(createOrderValidation), createOrder);
router.get('/me', getMyOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', authorize('admin'), getAllOrders);
router.put('/:id/status', authorize('admin'), validate(updateOrderStatusValidation), updateOrderStatus);

export default router;