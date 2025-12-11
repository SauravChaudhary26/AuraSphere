const request = require('supertest');
const { app, server } = require('../index');
const mongoose = require('mongoose');

describe('Health Check', () => {
  afterAll(async () => {
    // Close the server and database connection
    await mongoose.connection.close();
    server.close();
  });

  it('should return 200 OK for /test route', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('SERVER IS RUNNING FINE');
  });
});
