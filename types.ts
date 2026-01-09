
export type UserRole = 'CUSTOMER' | 'RESTAURANT' | 'DRIVER';

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  image: string;
  category: string;
  location: string;
  ownerId?: string; // Links to a user if needed
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: 'PENDING' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  total: number;
  customerId: string;
  restaurantId: string;
  timestamp: number;
  paymentStatus: 'UNPAID' | 'PAID';
}

export interface DeliveryRequest {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  itemDescription: string;
  status: 'PENDING' | 'ACCEPTED' | 'PICKED_UP' | 'DELIVERED';
  customerId: string;
  driverId?: string;
  price: number;
  timestamp: number;
}

export interface UserProfile {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  location?: string;
}
