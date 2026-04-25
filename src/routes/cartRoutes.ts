import { Router } from 'express';
import {
  getMyCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cartController';
import { addToCartValidation, updateCartItemValidation } from '../validations/cartValidation';
import validate from '../middlewares/validate';
import auth from '../middlewares/auth';

const router: Router = Router();

// All routes need authentication
router.use(auth);

router.get('/', getMyCart);
router.post('/add', validate(addToCartValidation), addToCart);
router.put('/update/:productId', validate(updateCartItemValidation), updateCartItem);
router.delete('/remove/:productId', removeFromCart);
router.delete('/clear', clearCart);

export default router;