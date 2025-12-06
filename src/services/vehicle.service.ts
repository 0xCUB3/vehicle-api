import { Prisma } from '@prisma/client';
import { prisma } from '../db.js';
import { normalizeVin } from '../utils/vin-validator.js';
import type { CreateVehicleInput, UpdateVehicleInput, FilterParams, PaginationParams } from '../types/vehicle.js';

export class VehicleService {
  async findAll(pagination: PaginationParams = {}, filters: FilterParams = {}) {
    const page = pagination.page || 1;
    const limit = pagination.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.VehicleWhereInput = {};

    if (filters.manufacturer) {
      where.manufacturerName = {
        contains: filters.manufacturer,
        mode: 'insensitive',
      };
    }

    if (filters.fuelType) {
      where.fuelType = filters.fuelType;
    }

    if (filters.yearMin || filters.yearMax) {
      where.modelYear = {};
      if (filters.yearMin) where.modelYear.gte = filters.yearMin;
      if (filters.yearMax) where.modelYear.lte = filters.yearMax;
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { manufacturerName: 'asc' },
          { modelYear: 'desc' },
        ],
      }),
      prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles.map(this.formatVehicle),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByVin(vin: string) {
    const normalizedVin = normalizeVin(vin);
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        vin: {
          equals: normalizedVin,
          mode: 'insensitive',
        },
      },
    });

    return vehicle ? this.formatVehicle(vehicle) : null;
  }

  async create(input: CreateVehicleInput) {
    const normalizedVin = normalizeVin(input.vin);

    const vehicle = await prisma.vehicle.create({
      data: {
        ...input,
        vin: normalizedVin,
        purchasePrice: new Prisma.Decimal(input.purchasePrice),
      },
    });

    return this.formatVehicle(vehicle);
  }

  async update(vin: string, input: UpdateVehicleInput) {
    const normalizedVin = normalizeVin(vin);

    const updateData: Prisma.VehicleUpdateInput = { ...input };
    if (input.purchasePrice !== undefined) {
      updateData.purchasePrice = new Prisma.Decimal(input.purchasePrice);
    }

    const vehicle = await prisma.vehicle.update({
      where: { vin: normalizedVin },
      data: updateData,
    });

    return this.formatVehicle(vehicle);
  }

  async delete(vin: string) {
    const normalizedVin = normalizeVin(vin);
    await prisma.vehicle.delete({
      where: { vin: normalizedVin },
    });
  }

  async vinExists(vin: string): Promise<boolean> {
    const normalizedVin = normalizeVin(vin);
    const count = await prisma.vehicle.count({
      where: {
        vin: {
          equals: normalizedVin,
          mode: 'insensitive',
        },
      },
    });
    return count > 0;
  }

  private formatVehicle(vehicle: {
    id: string;
    vin: string;
    manufacturerName: string;
    description: string | null;
    horsePower: number;
    modelName: string;
    modelYear: number;
    purchasePrice: Prisma.Decimal;
    fuelType: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: vehicle.id,
      vin: vehicle.vin,
      manufacturerName: vehicle.manufacturerName,
      description: vehicle.description,
      horsePower: vehicle.horsePower,
      modelName: vehicle.modelName,
      modelYear: vehicle.modelYear,
      purchasePrice: Number(vehicle.purchasePrice),
      fuelType: vehicle.fuelType,
      createdAt: vehicle.createdAt.toISOString(),
      updatedAt: vehicle.updatedAt.toISOString(),
    };
  }
}

export const vehicleService = new VehicleService();
