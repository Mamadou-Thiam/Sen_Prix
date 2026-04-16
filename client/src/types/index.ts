export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'moderator' | 'user' | 'merchant';
  phone?: string;
  isVerified: boolean;
  market?: Market;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  _id: string;
  name: string;
  category: 'riz' | 'huile' | 'sucre' | 'farine' | 'lait' | 'gaz' | 'autre';
  description?: string;
  unit: string;
  image?: string;
  price?: number;
  createdAt: string;
}

export interface Market {
  _id: string;
  name: string;
  city: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
}

export interface Price {
  _id: string;
  product: Product;
  market: Market;
  user: User;
  merchant?: User;
  price: number;
  quantity: string;
  date: string;
  source?: 'citoyen' | 'commercant';
  isVerified: boolean;
  createdAt: string;
}

export interface Alert {
  _id: string;
  type: 'high_price' | 'suspicious_variation';
  product?: Product;
  market?: Market;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Report {
  _id: string;
  type: 'price_incorrect' | 'product_quality' | 'merchant_behavior' | 'fake_product' | 'other';
  description?: string;
  product: Product;
  market: Market;
  price: number;
  quantity: string;
  reportedBy: User;
  reporterRole: 'user' | 'merchant';
  status: 'pending' | 'verified' | 'rejected';
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}
