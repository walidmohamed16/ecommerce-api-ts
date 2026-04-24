
import { Router } from 'express';
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getMyProducts
} from '../controllers/productController';
import { createProductValidation, updateProductValidation } from '../validations/productValidation';
import validate from '../middlewares/validate';
import auth from '../middlewares/auth';
import authorize from '../middlewares/authorize';

const router: Router = Router();

// Public routes
router.get('/', getAllProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProduct);

// Protected routes
router.use(auth);
router.get('/seller/me', getMyProducts);
router.post('/', authorize('admin'), validate(createProductValidation), createProduct);
router.put('/:id', authorize('admin'), validate(updateProductValidation), updateProduct);
router.delete('/:id', authorize('admin'), deleteProduct);

export default router;