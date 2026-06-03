// User Types
export interface User {
  _id: string;
  name: string;
  email?: string;
  role: 'student' | 'owner';
  phone?: string;
  phoneVerified?: boolean;
  firebaseUid?: string;
  isOnboarded?: boolean;
  avatar?: string;
  createdAt: string;
}

// Auth Types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'owner';
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface UpdateProfilePayload {
  name?: string;
  role?: 'student' | 'owner';
  phone?: string;
}

// PG Listing Types
export interface PGLocation {
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface PGImage {
  url: string;
  publicId: string;
}

export interface PGListing {
  _id: string;
  title: string;
  description: string;
  location: PGLocation;
  rent: number;
  deposit: number;
  genderPreference: 'male' | 'female' | 'any';
  roomType: 'single' | 'double' | 'triple' | 'dormitory';
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
  images: PGImage[];
  owner: User | string;
  active: boolean;
  analytics: {
    views: number;
    inquiries: number;
    saves: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PGListingsResponse {
  status: string;
  results: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
  // getAllPGs spreads result at top level (no data wrapper)
  listings: PGListing[];
  // getMyListings wraps in data
  data?: {
    listings: PGListing[];
  };
}

export interface PGFilters {
  city?: string;
  minRent?: number;
  maxRent?: number;
  genderPreference?: string;
  roomType?: string;
  amenities?: string;
  page?: number;
  limit?: number;
  sort?: string;
}

export interface CreatePGPayload {
  title: string;
  description: string;
  location: PGLocation;
  rent: number;
  deposit: number;
  genderPreference: 'male' | 'female' | 'any';
  roomType: 'single' | 'double' | 'triple' | 'dormitory';
  totalRooms: number;
  availableRooms: number;
  amenities: string[];
}

// Inquiry Types
export interface Inquiry {
  _id: string;
  pg: PGListing | string;
  student: User | string;
  message: string;
  phone: string;
  status: 'pending' | 'responded' | 'closed';
  createdAt: string;
}

export interface CreateInquiryPayload {
  pgId: string;
  message: string;
  phone: string;
}

// Dashboard Types
export interface DashboardStats {
  totalListings: number;
  availableListings: number;
  totalViews: number;
  totalInquiries: number;
  totalSaves: number;
  recentListings: PGListing[];
  recentInquiries: Inquiry[];
}

// API Response Types
export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  results: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    total: number;
  };
  data: T;
}
