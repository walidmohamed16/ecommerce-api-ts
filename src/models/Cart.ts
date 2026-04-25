import mongoose from 'mongoose';

// Cart Item Interface
export interface ICartItemDocument {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

// Cart Interface
export interface ICartDocument {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: ICartItemDocument[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Schema
const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

export default mongoose.model<ICartDocument>('Cart', cartSchema);