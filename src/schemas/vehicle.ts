import { FUEL_TYPES } from '../types/vehicle.js';

const currentYear = new Date().getFullYear();

const errorResponse = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer' },
    error: { type: 'string' },
    message: { type: 'string' },
  },
} as const;

const validationErrorResponse = {
  type: 'object',
  properties: {
    statusCode: { type: 'integer', example: 422 },
    error: { type: 'string', example: 'Unprocessable Entity' },
    message: { type: 'string', example: 'Validation failed' },
    details: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'vin' },
          message: { type: 'string', example: 'Invalid VIN check digit' },
        },
      },
    },
  },
} as const;

export const vehicleProperties = {
  vin: {
    type: 'string',
    minLength: 17,
    maxLength: 17,
    description: '17-character Vehicle Identification Number',
    example: '1HGBH41JXMN109186',
  },
  manufacturerName: {
    type: 'string',
    minLength: 1,
    description: 'Vehicle manufacturer name',
    example: 'Honda',
  },
  description: {
    type: 'string',
    nullable: true,
    description: 'Optional vehicle description',
    example: 'Reliable mid-size sedan',
  },
  horsePower: {
    type: 'integer',
    minimum: 1,
    maximum: 2000,
    description: 'Engine horsepower',
    example: 192,
  },
  modelName: {
    type: 'string',
    minLength: 1,
    description: 'Vehicle model name',
    example: 'Accord',
  },
  modelYear: {
    type: 'integer',
    minimum: 1886,
    maximum: currentYear + 2,
    description: 'Year of manufacture',
    example: 2024,
  },
  purchasePrice: {
    type: 'number',
    minimum: 0,
    description: 'Purchase price in USD',
    example: 32999.99,
  },
  fuelType: {
    type: 'string',
    enum: FUEL_TYPES,
    description: 'Type of fuel the vehicle uses',
    example: 'Gasoline',
  },
} as const;

export const vehicleResponseProperties = {
  id: {
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier',
    example: '550e8400-e29b-41d4-a716-446655440000',
  },
  ...vehicleProperties,
  createdAt: {
    type: 'string',
    format: 'date-time',
    description: 'Timestamp when vehicle was created',
    example: '2024-01-15T10:30:00.000Z',
  },
  updatedAt: {
    type: 'string',
    format: 'date-time',
    description: 'Timestamp when vehicle was last updated',
    example: '2024-01-15T10:30:00.000Z',
  },
} as const;

export const createVehicleSchema = {
  description: 'Create a new vehicle record',
  tags: ['vehicles'],
  body: {
    type: 'object',
    required: ['vin', 'manufacturerName', 'horsePower', 'modelName', 'modelYear', 'purchasePrice', 'fuelType'],
    properties: vehicleProperties,
    additionalProperties: false,
  },
  response: {
    201: {
      description: 'Vehicle created successfully',
      type: 'object',
      properties: vehicleResponseProperties,
    },
    400: {
      description: 'Invalid JSON in request body',
      ...errorResponse,
    },
    409: {
      description: 'Vehicle with this VIN already exists',
      ...errorResponse,
    },
    422: {
      description: 'Validation failed (invalid VIN or missing required fields)',
      ...validationErrorResponse,
    },
  },
} as const;

export const updateVehicleSchema = {
  description: 'Update an existing vehicle by VIN',
  tags: ['vehicles'],
  params: {
    type: 'object',
    required: ['vin'],
    properties: {
      vin: {
        type: 'string',
        description: 'Vehicle Identification Number',
        example: '1HGBH41JXMN109186',
      },
    },
  },
  body: {
    type: 'object',
    description: 'Fields to update (all optional)',
    properties: {
      manufacturerName: { type: 'string', minLength: 1, example: 'Honda' },
      description: { type: 'string', nullable: true, example: 'Updated description' },
      horsePower: { type: 'integer', minimum: 1, maximum: 2000, example: 200 },
      modelName: { type: 'string', minLength: 1, example: 'Accord' },
      modelYear: { type: 'integer', minimum: 1886, maximum: currentYear + 2, example: 2024 },
      purchasePrice: { type: 'number', minimum: 0, example: 34999.99 },
      fuelType: { type: 'string', enum: FUEL_TYPES, example: 'Hybrid' },
    },
    additionalProperties: false,
  },
  response: {
    200: {
      description: 'Vehicle updated successfully',
      type: 'object',
      properties: vehicleResponseProperties,
    },
    404: {
      description: 'Vehicle not found',
      ...errorResponse,
    },
    422: {
      description: 'Validation failed',
      ...validationErrorResponse,
    },
  },
} as const;

export const getVehicleSchema = {
  description: 'Get a single vehicle by VIN (case-insensitive)',
  tags: ['vehicles'],
  params: {
    type: 'object',
    required: ['vin'],
    properties: {
      vin: {
        type: 'string',
        description: 'Vehicle Identification Number',
        example: '1HGBH41JXMN109186',
      },
    },
  },
  response: {
    200: {
      description: 'Vehicle found',
      type: 'object',
      properties: vehicleResponseProperties,
    },
    404: {
      description: 'Vehicle not found',
      ...errorResponse,
    },
  },
} as const;

export const deleteVehicleSchema = {
  description: 'Delete a vehicle by VIN',
  tags: ['vehicles'],
  params: {
    type: 'object',
    required: ['vin'],
    properties: {
      vin: {
        type: 'string',
        description: 'Vehicle Identification Number',
        example: '1HGBH41JXMN109186',
      },
    },
  },
  response: {
    204: {
      description: 'Vehicle deleted successfully',
      type: 'null',
    },
    404: {
      description: 'Vehicle not found',
      ...errorResponse,
    },
  },
} as const;

export const listVehiclesSchema = {
  description: 'List all vehicles with pagination and optional filtering',
  tags: ['vehicles'],
  querystring: {
    type: 'object',
    properties: {
      page: {
        type: 'integer',
        minimum: 1,
        default: 1,
        description: 'Page number',
        example: 1,
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 20,
        description: 'Items per page',
        example: 20,
      },
      manufacturer: {
        type: 'string',
        description: 'Filter by manufacturer name (case-insensitive, partial match)',
        example: 'Honda',
      },
      fuelType: {
        type: 'string',
        enum: FUEL_TYPES,
        description: 'Filter by fuel type',
        example: 'Electric',
      },
      yearMin: {
        type: 'integer',
        minimum: 1886,
        description: 'Minimum model year',
        example: 2020,
      },
      yearMax: {
        type: 'integer',
        maximum: currentYear + 2,
        description: 'Maximum model year',
        example: 2024,
      },
    },
  },
  response: {
    200: {
      description: 'List of vehicles with pagination info',
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
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 20 },
            total: { type: 'integer', example: 42 },
            totalPages: { type: 'integer', example: 3 },
          },
        },
      },
    },
  },
} as const;
