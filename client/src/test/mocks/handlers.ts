import { http, HttpResponse } from 'msw'

const mockUser = {
  _id: 'user-123',
  name: 'Test Student',
  email: 'student@test.com',
  role: 'student',
}

const mockPG = {
  _id: 'pg-abc123',
  title: 'Cozy PG Near Station',
  description: 'A great PG for students with all amenities.',
  images: [{ url: 'https://example.com/img.jpg', publicId: 'img-1' }],
  location: { address: '123 Main St', city: 'mumbai', state: 'Maharashtra', pincode: '400001' },
  rent: 8000,
  deposit: 16000,
  genderPreference: 'any',
  roomType: 'single',
  amenities: ['wifi', 'ac'],
  totalRooms: 10,
  availableRooms: 5,
  isAvailable: true,
  rules: [],
  analytics: { views: 10, saves: 2, inquiries: 1 },
  owner: { _id: 'owner-1', name: 'Test Owner', email: 'owner@test.com' },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}

export const handlers = [
  // Auth
  http.post('/api/auth/register', () =>
    HttpResponse.json({
      status: 'success',
      data: { user: mockUser, accessToken: 'mock-access-token' },
    }, { status: 201 })
  ),
  http.post('/api/auth/login', () =>
    HttpResponse.json({
      status: 'success',
      data: { user: mockUser, accessToken: 'mock-access-token' },
    })
  ),
  http.get('/api/auth/me', () =>
    HttpResponse.json({ status: 'success', data: { user: mockUser } })
  ),
  http.post('/api/auth/logout', () =>
    HttpResponse.json({ status: 'success' })
  ),

  // PG Listings
  http.get('/api/pg', () =>
    HttpResponse.json({
      status: 'success',
      listings: [mockPG],
      pagination: { total: 1, page: 1, limit: 12, totalPages: 1, hasNextPage: false, hasPrevPage: false },
    })
  ),
  http.get('/api/pg/:id', ({ params }) =>
    params.id === 'pg-abc123'
      ? HttpResponse.json({ status: 'success', data: { pg: mockPG } })
      : HttpResponse.json({ status: 'fail', message: 'Not found' }, { status: 404 })
  ),

  // Saves
  http.get('/api/saves', () =>
    HttpResponse.json({ status: 'success', data: { saved: [] } })
  ),
]

export { mockUser, mockPG }
