import mongoose from 'mongoose';

// Order Item Interface
export interface IOrderItemDocument {
  product: mongoose.Types.ObjectId;
  quantity: number;
  price: number;
}

// Order Interface
export interface IOrderDocument {
  _id: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  items: IOrderItemDocument[];
  totalPrice: number;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
    phone: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  cancelledAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Order Item Schema
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

// Order Schema
const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: {
      type: String,
      required: [true, 'Street is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    country: {
      type: String,
      required: [true, 'Country is required']
    },
    phone: {
      type: String,
      required: [true, 'Phone is required']
    }
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing'
  },
  cancelledAt: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

export default mongoose.model<IOrderDocument>('Order', orderSchema);