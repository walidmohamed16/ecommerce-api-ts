// src/types/index.ts

import { Request } from 'express';
import { IUserDocument } from '../models/User';

// Auth Request (request with user)
export interface AuthRequest extends Request {
  user?: IUserDocument;
}

// Product Types
export interface IProduct {
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
}

// Cart Types
export interface ICartItem {
  product: string;
  quantity: number;
  price: number;
}

export interface ICart {
  user: string;
  items: ICartItem[];
  totalPrice: number;
}

// Order Types
export interface IOrderItem {
  product: string;
  quantity: number;
  price: number;
}

export interface IOrder {
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
}

// Review Types
export interface IReview {
  user: string;
  product: string;
  rating: number;
  comment: string;
}