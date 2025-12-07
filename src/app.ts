import Fastify, { FastifyError } from 'fastify';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { vehicleRoutes } from './routes/vehicle.routes.js';
import { connectDb } from './db.js';

interface ValidationError {
  instancePath: string;
  message?: string;
  params?: { missingProperty?: string };
}

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  });

  // Connect to database
  await connectDb();

  // Register Swagger
  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Vehicle API',
        description: 'CRUD API for managing vehicles',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://localhost:${process.env.PORT || 3000}`,
        },
      ],
      tags: [
        { name: 'vehicles', description: 'Vehicle operations' },
        { name: 'health', description: 'Health check' },
      ],
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });

  // Error handler for validation errors (return 422 instead of 400)
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      return reply.status(422).send({
        statusCode: 422,
        error: 'Unprocessable Entity',
        message: 'Validation failed',
        details: (error.validation as ValidationError[]).map((v: ValidationError) => ({
          field: v.instancePath.replace('/', '') || v.params?.missingProperty || 'unknown',
          message: v.message || 'Invalid value',
        })),
      });
    }

    if (error.statusCode === 400) {
      return reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Invalid JSON',
      });
    }

    request.log.error(error);
    return reply.status(500).send({
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred',
    });
  });

  // Register routes
  await app.register(vehicleRoutes);

  // Health check
  app.get('/health', { schema: { tags: ['health'] } }, async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return app;
}
