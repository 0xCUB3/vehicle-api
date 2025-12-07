import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { buildApp } from '../src/app.js';
import { prisma } from '../src/db.js';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;

const validVehicle = {
  vin: '1HGBH41JXMN109186',
  manufacturerName: 'Honda',
  description: 'Test vehicle',
  horsePower: 158,
  modelName: 'Accord',
  modelYear: 2021,
  purchasePrice: 25999.99,
  fuelType: 'Gasoline',
};

beforeAll(async () => {
  app = await buildApp();
});

afterAll(async () => {
  await prisma.$disconnect();
  await app.close();
});

beforeEach(async () => {
  // Clean up test data before each test
  await prisma.vehicle.deleteMany();
});

describe('Vehicle API', () => {
  describe('POST /vehicle', () => {
    test('creates a vehicle and returns 201', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.vin).toBe(validVehicle.vin);
      expect(body.manufacturerName).toBe(validVehicle.manufacturerName);
      expect(body.id).toBeDefined();
    });

    test('returns 409 for duplicate VIN', async () => {
      // First create a vehicle
      await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      // Try to create another with same VIN
      const response = await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toBe('Conflict');
    });

    test('returns 422 for invalid VIN format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: { ...validVehicle, vin: 'INVALID' },
      });

      expect(response.statusCode).toBe(422);
    });

    test('returns 422 for missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: { vin: '1HGBH41JXMN109186' },
      });

      expect(response.statusCode).toBe(422);
    });

    test('returns 400 for malformed JSON', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/vehicle',
        headers: { 'content-type': 'application/json' },
        payload: '{ invalid json }',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('GET /vehicle', () => {
    test('returns empty array when no vehicles', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/vehicle',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data).toEqual([]);
      expect(body.pagination.total).toBe(0);
    });

    test('returns all vehicles with pagination', async () => {
      // Create a vehicle first
      await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/vehicle',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(1);
      expect(body.pagination.total).toBe(1);
    });

    test('filters by manufacturer', async () => {
      await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/vehicle?manufacturer=Honda',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(1);
    });

    test('filters by fuelType', async () => {
      await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      const response = await app.inject({
        method: 'GET',
        url: '/vehicle?fuelType=Electric',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.data.length).toBe(0);
    });
  });

  describe('GET /vehicle/:vin', () => {
    test('returns vehicle by VIN', async () => {
      await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/vehicle/${validVehicle.vin}`,
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.vin).toBe(validVehicle.vin);
    });

    test('handles case-insensitive VIN lookup', async () => {
      await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      const response = await app.inject({
        method: 'GET',
        url: `/vehicle/${validVehicle.vin.toLowerCase()}`,
      });

      expect(response.statusCode).toBe(200);
    });

    test('returns 404 for non-existent VIN', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/vehicle/DOESNOTEXIST12345',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('PUT /vehicle/:vin', () => {
    test('updates vehicle and returns 200', async () => {
      await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      const response = await app.inject({
        method: 'PUT',
        url: `/vehicle/${validVehicle.vin}`,
        payload: { horsePower: 200 },
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.horsePower).toBe(200);
    });

    test('returns 404 for non-existent VIN', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/vehicle/DOESNOTEXIST12345',
        payload: { horsePower: 200 },
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /vehicle/:vin', () => {
    test('deletes vehicle and returns 204', async () => {
      await app.inject({
        method: 'POST',
        url: '/vehicle',
        payload: validVehicle,
      });

      const response = await app.inject({
        method: 'DELETE',
        url: `/vehicle/${validVehicle.vin}`,
      });

      expect(response.statusCode).toBe(204);

      // Verify it's gone
      const getResponse = await app.inject({
        method: 'GET',
        url: `/vehicle/${validVehicle.vin}`,
      });
      expect(getResponse.statusCode).toBe(404);
    });

    test('returns 404 for non-existent VIN', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/vehicle/DOESNOTEXIST12345',
      });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('GET /health', () => {
    test('returns health status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.timestamp).toBeDefined();
    });
  });
});
