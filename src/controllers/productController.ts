import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types';

// Create Product (Admin only)
export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.create({
      ...req.body,
      seller: req.user?._id
    });

    res.status(201).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// Get All Products (Public) with Search, Filter, Sort, Pagination
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Build query
    const queryObj: any = { isActive: true };

    // Filter by category
    if (req.query.category) {
      queryObj.category = req.query.category;
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) queryObj.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) queryObj.price.$lte = Number(req.query.maxPrice);
    }

    // Filter by stock (in stock only)
    if (req.query.inStock === 'true') {
      queryObj.stock = { $gt: 0 };
    }

    // Search by name or description
    if (req.query.search) {
      queryObj.$text = { $search: req.query.search as string };
    }

    // Sorting
    let sortBy: string = '-createdAt'; // default: newest first
    if (req.query.sort === 'price_asc') sortBy = 'price';
    if (req.query.sort === 'price_desc') sortBy = '-price';
    if (req.query.sort === 'rating') sortBy = '-ratings';
    if (req.query.sort === 'newest') sortBy = '-createdAt';

    // Pagination
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const skip: number = (page - 1) * limit;

    // Execute query
    const products = await Product.find(queryObj)
      .populate('seller', 'name email')
      .sort(sortBy)
      .skip(skip)
      .limit(limit);

    const total: number = await Product.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: products.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Product (Public)
export const getProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email');

    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// Update Product (Admin only)
export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    // Check if user is admin or seller
    if (
      req.user?.role !== 'admin' &&
      product.seller.toString() !== req.user?._id.toString()
    ) {
      return next(new ApiError('You can only update your own products', 403));
    }

    product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      data: { product }
    });
  } catch (error) {
    next(error);
  }
};

// Delete Product (Admin only)
export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ApiError('Product not found', 404));
    }

    // Check if user is admin or seller
    if (
      req.user?.role !== 'admin' &&
      product.seller.toString() !== req.user?._id.toString()
    ) {
      return next(new ApiError('You can only delete your own products', 403));
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get Products by Category
export const getProductsByCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find({
      category: req.params.category,
      isActive: true
    }).populate('seller', 'name email');

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};

// Get My Products (Seller)
export const getMyProducts = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await Product.find({ seller: req.user?._id })
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products }
    });
  } catch (error) {
    next(error);
  }
};