// Shared TypeScript types for PG listings and filters

export type GenderPreference = 'male' | 'female' | 'any'
export type RoomType = 'single' | 'double' | 'triple' | 'dormitory'
export type AmenityType =
  | 'wifi' | 'ac' | 'parking' | 'laundry' | 'meals'
  | 'gym' | 'cctv' | 'housekeeping' | 'water_purifier' | 'power_backup'

export interface PGImage {
  url: string
  publicId: string
}

export interface PGLocation {
  address: string
  city: string
  state: string
  pincode: string
  coordinates?: { lat: number; lng: number }
}

export interface PGAnalytics {
  views: number
  saves: number
  inquiries: number
}

export interface PGListing {
  _id: string
  owner: {
    _id: string
    name: string
    email: string
    phone?: string
    avatar?: string
  }
  title: string
  description: string
  images: PGImage[]
  location: PGLocation
  rent: number
  deposit: number
  genderPreference: GenderPreference
  roomType: RoomType
  amenities: AmenityType[]
  totalRooms: number
  availableRooms: number
  isAvailable: boolean
  rules: string[]
  analytics: PGAnalytics
  createdAt: string
  updatedAt: string
}

export interface PGFilters {
  city?: string
  minPrice?: number
  maxPrice?: number
  gender?: GenderPreference
  roomType?: RoomType
  amenities?: string[]
  isAvailable?: boolean
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'popular'
  page?: number
  limit?: number
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PGListResponse {
  listings: PGListing[]
  pagination: Pagination
}

export interface Inquiry {
  _id: string
  pg: Pick<PGListing, '_id' | 'title' | 'location' | 'images' | 'rent'>
  student: { _id: string; name: string; email: string; phone?: string }
  owner: { _id: string; name: string; email: string }
  message: string
  phone?: string
  status: 'pending' | 'viewed' | 'responded' | 'closed'
  createdAt: string
}
