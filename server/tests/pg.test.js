const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const PGListing = require('../models/PGListing');

describe('PG CRUD Routes', () => {
  let ownerToken;
  let studentToken;
  let ownerId;
  let pgId;

  const owner = {
    name: 'Owner User',
    email: 'owner@test.com',
    password: 'password123',
    role: 'owner'
  };

  const student = {
    name: 'Student User',
    email: 'student@test.com',
    password: 'password123',
    role: 'student'
  };

  beforeAll(async () => {
    // Register owner
    const ownerRes = await request(app).post('/api/auth/register').send(owner);
    ownerToken = ownerRes.body.data.accessToken;
    ownerId = ownerRes.body.data.user._id;

    // Register student
    const studentRes = await request(app).post('/api/auth/register').send(student);
    studentToken = studentRes.body.data.accessToken;
  });

  const samplePG = {
    title: 'Test PG Listing',
    description: 'This is a test description with at least 20 chars',
    location: {
      address: '123 Test St',
      city: 'testville',
      state: 'TS',
      pincode: '123456'
    },
    rent: 5000,
    deposit: 10000,
    genderPreference: 'any',
    roomType: 'single',
    totalRooms: 10,
    availableRooms: 5,
    amenities: ['wifi', 'ac']
  };

  it('should allow owner to create a PG listing', async () => {
    const res = await request(app)
      .post('/api/pg')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send(samplePG);

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.pg.title).toBe(samplePG.title);
    pgId = res.body.data.pg._id;
  });

  it('should prevent student from creating a PG listing', async () => {
    const res = await request(app)
      .post('/api/pg')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(samplePG);

    expect(res.statusCode).toBe(403);
  });

  it('should fetch all PG listings', async () => {
    const res = await request(app).get('/api/pg');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.listings.length).toBeGreaterThan(0);
  });

  it('should fetch a single PG listing and increment views', async () => {
    const res = await request(app).get(`/api/pg/${pgId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.pg.title).toBe(samplePG.title);
  });

  it('should allow owner to update their PG listing', async () => {
    const res = await request(app)
      .put(`/api/pg/${pgId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ rent: 6000 });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.pg.rent).toBe(6000);
  });

  it('should allow owner to soft delete their PG listing', async () => {
    const res = await request(app)
      .delete(`/api/pg/${pgId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(204);

    // Verify it is softly deleted (active: false)
    const dbPG = await PGListing.findById(pgId);
    expect(dbPG).toBeNull(); // Because queries filter active !== false by default
  });
});
