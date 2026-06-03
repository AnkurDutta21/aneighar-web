const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const PGListing = require('../models/PGListing');
const Inquiry = require('../models/Inquiry');

describe('Inquiry Routes', () => {
  let ownerToken;
  let studentToken;
  let pgId;
  let inquiryId;

  beforeAll(async () => {
    // Register owner
    const ownerRes = await request(app).post('/api/auth/register').send({
      name: 'Owner', email: 'owner@test.com', password: 'password', role: 'owner'
    });
    ownerToken = ownerRes.body.data.accessToken;

    // Register student
    const studentRes = await request(app).post('/api/auth/register').send({
      name: 'Student', email: 'student@test.com', password: 'password', role: 'student'
    });
    studentToken = studentRes.body.data.accessToken;

    // Create PG
    const pgRes = await request(app)
      .post('/api/pg')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        title: 'Inquiry Test PG', description: 'At least 20 characters description here',
        location: { address: '123 Test', city: 'test', state: 'TS', pincode: '123456' },
        rent: 5000, deposit: 10000, genderPreference: 'any', roomType: 'single', totalRooms: 10, availableRooms: 5
      });
    pgId = pgRes.body.data.pg._id;
  });

  it('should allow student to create an inquiry', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        pgId: pgId,
        message: 'I am interested in this PG',
        phone: '1234567890'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.inquiry.message).toBe('I am interested in this PG');
    inquiryId = res.body.data.inquiry._id;
  });

  it('should prevent owner from creating an inquiry', async () => {
    const res = await request(app)
      .post('/api/inquiries')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ pgId: pgId, message: 'Test', phone: '1234567890' });
    
    expect(res.statusCode).toBe(403);
  });

  it('should get owner inquiries', async () => {
    const res = await request(app)
      .get('/api/inquiries/owner')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.inquiries.length).toBe(1);
    expect(res.body.inquiries[0].message).toBe('I am interested in this PG');
  });

  it('should allow owner to update inquiry status', async () => {
    const res = await request(app)
      .patch(`/api/inquiries/${inquiryId}/status`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ status: 'responded' });

    expect(res.statusCode).toBe(200);
    expect(res.body.data.inquiry.status).toBe('responded');
  });
});
