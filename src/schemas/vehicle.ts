import { FUEL_TYPES } from '../types/vehicle.js';

const currentYear = new Date().getFullYear();

export const vehicleProperties = {
  vin: { type: 'string', minLength: 17, maxLength: 17 },
  manufacturerName: { type: 'string', minLength: 1 },
  description: { type: 'string', nullable: true },
  horsePower: { type: 'integer', minimum: 1, maximum: 2000 },
  modelName: { type: 'string', minLength: 1 },
  modelYear: { type: 'integer', minimum: 1886, maximum: currentYear + 2 },
  purchasePrice: { type: 'number', minimum: 0 },
  fuelType: { type: 'string', enum: FUEL_TYPES },
} as const;

export const vehicleResponseProperties = {
  id: { type: 'string', format: 'uuid' },
  ...vehicleProperties,
  createdAt: { type: 'string', format: 'date-time' },
  updatedAt: { type: 'string', format: 'date-time' },
} as const;

export const createVehicleSchema = {
  body: {
    type: 'object',
    required: ['vin', 'manufacturerName', 'horsePower', 'modelName', 'modelYear', 'purchasePrice', 'fuelType'],
    properties: vehicleProperties,
    additionalProperties: false,
  },
  response: {
    201: {
      type: 'object',
      properties: vehicleResponseProperties,
    },
  },
} as const;

export const updateVehicleSchema = {
  params: {
    type: 'object',
    required: ['vin'],
    properties: {
      vin: { type: 'string' },
    },
  },
  body: {
    type: 'object',
    properties: {
      manufacturerName: { type: 'string', minLength: 1 },
      description: { type: 'string', nullable: true },
      horsePower: { type: 'integer', minimum: 1, maximum: 2000 },
      modelName: { type: 'string', minLength: 1 },
      modelYear: { type: 'integer', minimum: 1886, maximum: currentYear + 2 },
      purchasePrice: { type: 'number', minimum: 0 },
      fuelType: { type: 'string', enum: FUEL_TYPES },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      type: 'object',
      properties: vehicleResponseProperties,
    },
  },
} as const;

export const getVehicleSchema = {
  params: {
    type: 'object',
    required: ['vin'],
    properties: {
      vin: { type: 'string' },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: vehicleResponseProperties,
    },
  },
} as const;

export const deleteVehicleSchema = {
  params: {
    type: 'object',
    required: ['vin'],
    properties: {
      vin: { type: 'string' },
    },
  },
} as const;

export const listVehiclesSchema = {
  querystring: {
    type: 'object',
    properties: {
      page: { type: 'integer', minimum: 1, default: 1 },
      limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
      manufacturer: { type: 'string' },
      fuelType: { type: 'string', enum: FUEL_TYPES },
      yearMin: { type: 'integer', minimum: 1886 },
      yearMax: { type: 'integer', maximum: currentYear + 2 },
    },
  },
  response: {
    200: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: vehicleResponseProperties,
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer' },
            limit: { type: 'integer' },
            total: { type: 'integer' },
            totalPages: { type: 'integer' },
          },
        },
      },
    },
  },
} as const;
