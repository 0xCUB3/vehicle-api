export const FUEL_TYPES = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'Hydrogen', 'Other'] as const;
export type FuelType = typeof FUEL_TYPES[number];

export interface CreateVehicleInput {
  vin: string;
  manufacturerName: string;
  description?: string;
  horsePower: number;
  modelName: string;
  modelYear: number;
  purchasePrice: number;
  fuelType: FuelType;
}

export interface UpdateVehicleInput {
  manufacturerName?: string;
  description?: string;
  horsePower?: number;
  modelName?: string;
  modelYear?: number;
  purchasePrice?: number;
  fuelType?: FuelType;
}

export interface VehicleResponse {
  id: string;
  vin: string;
  manufacturerName: string;
  description: string | null;
  horsePower: number;
  modelName: string;
  modelYear: number;
  purchasePrice: number;
  fuelType: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface FilterParams {
  manufacturer?: string;
  fuelType?: string;
  yearMin?: number;
  yearMax?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: { field: string; message: string }[];
}
