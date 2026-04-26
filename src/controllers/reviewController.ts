import { Request, Response, NextFunction } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import Order from '../models/Order';
import mongoose from 'mongoose';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types';

// Helper: Update product ratings
const updateProductRatings = async (productId: string): Promise<void> => {
  const stats = await Review.aggregate([
    {
      $match: { product: new mongoose.Types.ObjectId(productId) }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratings: Math.round(stats[0].averageRating * 10) / 10,
      numReviews: stats[0].numReviews
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratings: 0,
      numReviews: 0
    });
  }
};

// ⭐ Create Review
export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, orderId, rating, comment } = req.body;

    // 1. Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    // 2. Check if user owns the order
    if (order.user.toString() !== req.user?._id.toString()) {
      return next(new ApiError('You can only review products from your own orders', 403));
    }

    // 3. Check if order is delivered
    if (order.orderStatus !== 'delivered') {
      return next(new ApiError('You can only review products from delivered orders', 400));
    }

    // 4. Check if product is in the order
    const productInOrder = order.items.some(
      (item) => item.product.toString() === productId
    );

    if (!productInOrder) {
      return next(new ApiError('This product is not in the order', 400));
    }

    // 5. Check if already reviewed
    const existingReview = await Review.findOne({
      user: req.user?._id,
      product: productId,
      order: orderId
    });

    if (existingReview) {
      return next(new ApiError('You have already reviewed this product from this order', 400));
    }

    // 6. Create review
    const review = await Review.create({
      user: req.user?._id,
      product: productId,
      order: orderId,
      rating,
      comment
    });

    // 7. Update product ratings ⭐
    await updateProductRatings(productId);

    // 8. Populate and return
    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('product', 'name');

    res.status(201).json({
      status: 'success',
      data: { review: populatedReview }
    });
  } catch (error) {
    next(error);
  }
};

// Get Product Reviews (Public)
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params;

    // Pagination
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const skip: number = (page - 1) * limit;

    const reviews = await Review.find({ product: productId })
      .populate('user', 'name avatar')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ product: productId });

    // Get rating stats
    const stats = await Review.aggregate([
      {
         $match: { product: new mongoose.Types.ObjectId(productId as string) }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
          rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats: stats[0] || {
        averageRating: 0,
        totalReviews: 0,
        rating5: 0,
        rating4: 0,
        rating3: 0,
        rating2: 0,
        rating1: 0
      },
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

// Get My Reviews
export const getMyReviews = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const reviews = await Review.find({ user: req.user?._id })
      .populate('product', 'name price images')
      .populate('order', 'createdAt')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews }
    });
  } catch (error) {
    next(error);
  }
};

// Update Review
export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ApiError('Review not found', 404));
    }

    // Check ownership
    if (review.user.toString() !== req.user?._id.toString()) {
      return next(new ApiError('You can only update your own reviews', 403));
    }

    // Update
    if (req.body.rating) review.rating = req.body.rating;
    if (req.body.comment) review.comment = req.body.comment;
    await review.save();

    // Update product ratings
    await updateProductRatings(review.product.toString());

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'name')
      .populate('product', 'name');

    res.status(200).json({
      status: 'success',
      data: { review: populatedReview }
    });
  } catch (error) {
    next(error);
  }
};

// Delete Review
export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new ApiError('Review not found', 404));
    }

    // Check ownership (user or admin)
    if (
      review.user.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      return next(new ApiError('You can only delete your own reviews', 403));
    }

    const productId = review.product.toString();

    await Review.findByIdAndDelete(req.params.id);

    // Update product ratings
    await updateProductRatings(productId);

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};