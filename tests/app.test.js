const request = require('supertest');
const app = require('../src/app');

describe('Application Health', () => {
  describe('GET /health', () => {
    it('should return 200 OK with health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /', () => {
    it('should return 200 OK for home page', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.type).toBe('text/html');
    });
  });

  describe('GET /nonexistent', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/nonexistent')
        .expect(404);

      expect(response.type).toBe('text/html');
    });
  });
});