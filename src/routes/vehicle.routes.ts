import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { vehicleService } from '../services/vehicle.service.js';
import { validateVin } from '../utils/vin-validator.js';
import {
  createVehicleSchema,
  updateVehicleSchema,
  getVehicleSchema,
  deleteVehicleSchema,
  listVehiclesSchema,
} from '../schemas/vehicle.js';
import type { CreateVehicleInput, UpdateVehicleInput, FilterParams, PaginationParams } from '../types/vehicle.js';

interface VinParams {
  vin: string;
}

interface ListQuery extends PaginationParams, FilterParams {}

export async function vehicleRoutes(app: FastifyInstance) {
  // GET /vehicle - List all vehicles with pagination and filtering
  app.get<{ Querystring: ListQuery }>(
    '/vehicle',
    { schema: listVehiclesSchema },
    async (request, reply) => {
      const { page, limit, manufacturer, fuelType, yearMin, yearMax } = request.query;
      const result = await vehicleService.findAll(
        { page, limit },
        { manufacturer, fuelType, yearMin, yearMax }
      );
      return result;
    }
  );

  // GET /vehicle/:vin - Get single vehicle
  app.get<{ Params: VinParams }>(
    '/vehicle/:vin',
    { schema: getVehicleSchema },
    async (request, reply) => {
      const vehicle = await vehicleService.findByVin(request.params.vin);
      if (!vehicle) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: `Vehicle with VIN ${request.params.vin} not found`,
        });
      }
      return vehicle;
    }
  );

  // POST /vehicle - Create new vehicle
  app.post<{ Body: CreateVehicleInput }>(
    '/vehicle',
    { schema: createVehicleSchema },
    async (request, reply) => {
      const vinValidation = validateVin(request.body.vin);
      if (!vinValidation.valid) {
        return reply.status(422).send({
          statusCode: 422,
          error: 'Unprocessable Entity',
          message: 'Validation failed',
          details: [{ field: 'vin', message: vinValidation.error! }],
        });
      }

      const exists = await vehicleService.vinExists(request.body.vin);
      if (exists) {
        return reply.status(409).send({
          statusCode: 409,
          error: 'Conflict',
          message: `Vehicle with VIN ${request.body.vin} already exists`,
        });
      }

      const vehicle = await vehicleService.create(request.body);
      return reply.status(201).send(vehicle);
    }
  );

  // PUT /vehicle/:vin - Update vehicle
  app.put<{ Params: VinParams; Body: UpdateVehicleInput }>(
    '/vehicle/:vin',
    { schema: updateVehicleSchema },
    async (request, reply) => {
      const exists = await vehicleService.findByVin(request.params.vin);
      if (!exists) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: `Vehicle with VIN ${request.params.vin} not found`,
        });
      }

      const vehicle = await vehicleService.update(request.params.vin, request.body);
      return vehicle;
    }
  );

  // DELETE /vehicle/:vin - Delete vehicle
  app.delete<{ Params: VinParams }>(
    '/vehicle/:vin',
    { schema: deleteVehicleSchema },
    async (request, reply) => {
      const exists = await vehicleService.findByVin(request.params.vin);
      if (!exists) {
        return reply.status(404).send({
          statusCode: 404,
          error: 'Not Found',
          message: `Vehicle with VIN ${request.params.vin} not found`,
        });
      }

      await vehicleService.delete(request.params.vin);
      return reply.status(204).send();
    }
  );
}
