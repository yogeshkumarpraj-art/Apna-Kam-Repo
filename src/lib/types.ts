
export interface Worker {
  id: string;
  name: string;
  category: string;
  location: string;
  pincode?: string;
  rating: number;
  reviewCount: number;
  price: number;
  priceType: 'daily' | 'job' | 'sqft';
  skills: string[];
  description: string;
  isFavorite: boolean;
  avatar: string;
  portfolio: { url: string, hint: string, fullPath: string }[];
  contact?: {
    phone: string;
    email: string;
  };
}

export interface Review {
  id: string;
  bookingId: string;
  workerId: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Booking {
    id: string;
    workerId: string;
    customerId: string;
    workerName: string;
    customerName: string;
    bookingDate: Date;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
    createdAt: Date;
    hasBeenReviewed?: boolean;
}
