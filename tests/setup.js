// Setup file for Jest tests
const mongoose = require('mongoose');

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.MONGODB_URI = 'mongodb://localhost:27017/multi-billeterie-test';

// Setup MongoDB connection for tests
beforeAll(async () => {
  if (process.env.MONGODB_URI) {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
    } catch (error) {
      console.warn('MongoDB not available for tests, using mocks');
    }
  }
});

// Clean up after all tests
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

// Clean up after each test
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});

// Global test utilities
global.testUser = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'password123',
  role: 'client'
};

global.testProvider = {
  firstName: 'Test',
  lastName: 'Provider',
  email: 'provider@example.com',
  password: 'password123',
  role: 'provider',
  company: 'Test Events'
};

global.testEvent = {
  title: 'Test Event',
  description: 'A test event',
  date: new Date(Date.now() + 86400000), // Tomorrow
  venue: 'Test Venue',
  category: 'concert',
  price: 25.99,
  totalTickets: 100
};