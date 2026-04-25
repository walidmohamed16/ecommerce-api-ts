import { Request, Response, NextFunction } from 'express';
import Order from '../models/Order';
import Cart from '../models/Cart';
import Product from '../models/Product';
import ApiError from '../utils/apiError';
import { AuthRequest } from '../types';

// ⭐ Create Order (from Cart)
export const createOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shippingAddress } = req.body;

    // 1. Get user's cart
    const cart = await Cart.findOne({ user: req.user?._id });

    if (!cart || cart.items.length === 0) {
      return next(new ApiError('Your cart is empty', 400));
    }

    // 2. Check stock for all items
    for (const item of cart.items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return next(new ApiError(`Product not found`, 404));
      }

      if (!product.isActive) {
        return next(new ApiError(`${product.name} is no longer available`, 400));
      }

      if (product.stock < item.quantity) {
        return next(
          new ApiError(
            `${product.name} only has ${product.stock} items in stock, but you requested ${item.quantity}`,
            400
          )
        );
      }
    }

    // 3. Reduce stock for all items ⭐
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity }
      });
    }

    // 4. Create order
    const order = await Order.create({
      user: req.user?._id,
      items: cart.items,
      totalPrice: cart.totalPrice,
      shippingAddress
    });

    // 5. Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    // 6. Populate and return
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    res.status(201).json({
      status: 'success',
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    next(error);
  }
};

// Get My Orders
export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    const queryObj: any = { user: req.user?._id };

    if (status) queryObj.orderStatus = status;

    // Pagination
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const skip: number = (page - 1) * limit;

    const orders = await Order.find(queryObj)
      .populate('items.product', 'name price images')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(queryObj);

    res.status(200).json({
      status: 'success',
      results: orders.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};

// Get Single Order
export const getOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    // Check ownership (user or admin)
    if (
      order.user._id.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      return next(new ApiError('You are not authorized to view this order', 403));
    }

    res.status(200).json({
      status: 'success',
      data: { order }
    });
  } catch (error) {
    next(error);
  }
};

// ⭐ Cancel Order
export const cancelOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    // Check ownership
    if (
      order.user.toString() !== req.user?._id.toString() &&
      req.user?.role !== 'admin'
    ) {
      return next(new ApiError('You are not authorized to cancel this order', 403));
    }

    // Can only cancel processing orders
    if (order.orderStatus !== 'processing') {
      return next(
        new ApiError(`Cannot cancel a ${order.orderStatus} order`, 400)
      );
    }

    // 1. Return stock ⭐
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity }
      });
    }

    // 2. Update order status
    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully. Stock has been restored.',
      data: { order: populatedOrder }
    });
  } catch (error) {
    next(error);
  }
};

// ⭐ Update Order Status (Admin only)
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ApiError('Order not found', 404));
    }

    // Can't update cancelled orders
    if (order.orderStatus === 'cancelled') {
      return next(new ApiError('Cannot update a cancelled order', 400));
    }

    // Can't update delivered orders
    if (order.orderStatus === 'delivered') {
      return next(new ApiError('Order already delivered', 400));
    }

    // Validate status flow
    const validFlow: { [key: string]: string[] } = {
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled']
    };

    if (!validFlow[order.orderStatus]?.includes(orderStatus)) {
      return next(
        new ApiError(
          `Cannot change status from ${order.orderStatus} to ${orderStatus}`,
          400
        )
      );
    }

    // If cancelling, return stock
    if (orderStatus === 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
      order.cancelledAt = new Date();
    }

    // If delivered, mark delivery date and payment
    if (orderStatus === 'delivered') {
      order.deliveredAt = new Date();
      order.paymentStatus = 'paid';
    }

    order.orderStatus = orderStatus;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product', 'name price images');

    res.status(200).json({
      status: 'success',
      message: `Order status updated to ${orderStatus}`,
      data: { order: populatedOrder }
    });
  } catch (error) {
    next(error);
  }
};

// Get All Orders (Admin only)
export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status } = req.query;
    const queryObj: any = {};

    if (status) queryObj.orderStatus = status;

    // Pagination
    const page: number = Number(req.query.page) || 1;
    const limit: number = Number(req.query.limit) || 10;
    const skip: number = (page - 1) * limit;

    const orders = await Order.find(queryObj)
      .populate('user', 'name email')
      .populate('items.product', 'name price images')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(queryObj);

    // Calculate total revenue
    const revenue = await Order.aggregate([
      {
        $match: {
          orderStatus: { $ne: 'cancelled' }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalPrice' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      results: orders.length,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      stats: revenue[0] || { totalRevenue: 0, totalOrders: 0 },
      data: { orders }
    });
  } catch (error) {
    next(error);
  }
};