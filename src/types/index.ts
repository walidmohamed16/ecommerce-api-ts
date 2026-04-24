import { Request } from 'express';

// User Types
export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  phone?: string;
  address?: {
    street: string;
    city: string;
    country: string;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Auth Request (request with user)
export interface AuthRequest extends Request {
  user?: IUser;
}

// Product Types
export interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  seller: string;
  ratings: number;
  numReviews: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface ICartItem {
  product: string;
  quantity: number;
  price: number;
}

export interface ICart {
  _id: string;
  user: string;
  items: ICartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface IOrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface IOrder {
  _id: string;
  user: string;
  items: IOrderItem[];
  totalPrice: number;
  shippingAddress: {
    street: string;
    city: string;
    country: string;
  };
  paymentStatus: 'pending' | 'paid' | 'failed';
  orderStatus: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface IReview {
  _id: string;
  user: string;
  product: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}