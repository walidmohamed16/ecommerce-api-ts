import { Response, NextFunction } from 'express';
import Cart from '../models/Cart';
import Product from '../models/Product';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types';

// Helper: Calculate total price
const calculateTotalPrice = (items: any[]): number => {
  return items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
};

// Get My Cart
export const getMyCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let cart = await Cart.findOne({ user: req.user?._id })
      .populate('items.product', 'name price images stock');

    if (!cart) {
      cart = await Cart.create({
        user: req.user?._id,
        items: [],
        totalPrice: 0
      });
    }

    res.status(200).json({
      status: 'success',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};

// Add Item to Cart
export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity } = req.body;

    // 1. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    // 2. Check if product is active
    if (!product.isActive) {
      return next(new ApiError('Product is not available', 400));
    }

    // 3. Check stock
    if (product.stock < quantity) {
      return next(new ApiError(`Only ${product.stock} items available in stock`, 400));
    }

    // 4. Get or create cart
    let cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      cart = await Cart.create({
        user: req.user?._id,
        items: [],
        totalPrice: 0
      });
    }

    // 5. Check if product already in cart
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Update quantity
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;

      // Check stock for new quantity
      if (product.stock < newQuantity) {
        return next(new ApiError(`Only ${product.stock} items available in stock`, 400));
      }

      cart.items[existingItemIndex].quantity = newQuantity;
      cart.items[existingItemIndex].price = product.price;
    } else {
      // Add new item
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price
      } as any);
    }

    // 6. Calculate total
    cart.totalPrice = calculateTotalPrice(cart.items);

    // 7. Save
    await cart.save();

    // 8. Populate and return
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock');

    res.status(200).json({
      status: 'success',
      message: 'Product added to cart',
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
};

// Update Cart Item Quantity
export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    // 1. Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    // 2. Check stock
    if (product.stock < quantity) {
      return next(new ApiError(`Only ${product.stock} items available in stock`, 400));
    }

    // 3. Find cart
    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return next(new ApiError('Cart not found', 404));
    }

    // 4. Find item in cart
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return next(new ApiError('Product not found in cart', 404));
    }

    // 5. Update quantity and price
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].price = product.price;

    // 6. Calculate total
    cart.totalPrice = calculateTotalPrice(cart.items);

    // 7. Save
    await cart.save();

    // 8. Populate and return
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock');

    res.status(200).json({
      status: 'success',
      message: 'Cart updated',
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
};

// Remove Item from Cart
export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    // 1. Find cart
    const cart = await Cart.findOne({ user: req.user?._id });
    if (!cart) {
      return next(new ApiError('Cart not found', 404));
    }

    // 2. Find item
    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return next(new ApiError('Product not found in cart', 404));
    }

    // 3. Remove item
    cart.items.splice(itemIndex, 1);

    // 4. Calculate total
    cart.totalPrice = calculateTotalPrice(cart.items);

    // 5. Save
    await cart.save();

    // 6. Populate and return
    const populatedCart = await Cart.findById(cart._id)
      .populate('items.product', 'name price images stock');

    res.status(200).json({
      status: 'success',
      message: 'Product removed from cart',
      data: { cart: populatedCart }
    });
  } catch (error) {
    next(error);
  }
};

// Clear Cart
export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user?._id });

    if (!cart) {
      return next(new ApiError('Cart not found', 404));
    }

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared',
      data: { cart }
    });
  } catch (error) {
    next(error);
  }
};