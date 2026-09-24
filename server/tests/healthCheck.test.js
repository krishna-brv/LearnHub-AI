const request = require('supertest');
const app = require('../app');

describe('LearnHub AI REST API Suite', () => {
  describe('GET /api/health', () => {
    it('should return 200 OK with health status online', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('status', 'online');
    });
  });

  describe('GET /api', () => {
    it('should return API welcome metadata', async () => {
      const res = await request(app).get('/api');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('GET /api/non-existent-route', () => {
    it('should return 404 for unhandled routes', async () => {
      const res = await request(app).get('/api/non-existent-route');
      expect(res.statusCode).toEqual(404);
    });
  });
});
