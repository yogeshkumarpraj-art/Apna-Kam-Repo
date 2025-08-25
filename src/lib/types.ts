export interface Worker {
  id: string;
  name: string;
  category: string;
  location: string;
  pincode?: string;
  rating: number;
  reviews: number;
  price: number;
  priceType: 'daily' | 'job' | 'sqft';
  skills: string[];
  description: string;
  isFavorite: boolean;
  avatar: string;
  portfolio: { url: string, hint: string }[];
  contact?: {
    phone: string;
    email: string;
  };
}

export interface Review {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}
