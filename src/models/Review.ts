import mongoose from 'mongoose';

// Review Interface
export interface IReviewDocument {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

// Review Schema
const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: [500, 'Comment cannot be more than 500 characters']
  }
}, {
  timestamps: true
});

// User can review a product from an order only once
reviewSchema.index({ user: 1, product: 1, order: 1 }, { unique: true });

export default mongoose.model<IReviewDocument>('Review', reviewSchema);