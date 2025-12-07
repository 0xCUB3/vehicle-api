# Vehicle CRUD API

A RESTful API for managing vehicle records built with Fastify, TypeScript, Prisma, and PostgreSQL.

## Quick Start

```bash
# Clone and setup
make setup

# Start the server
make dev
```

The API runs at `http://localhost:3000`
API docs at `http://localhost:3000/docs`

## Prerequisites

- [Bun](https://bun.sh) (v1.0+)
- [Docker](https://docker.com) (for PostgreSQL)

## API Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| GET | `/vehicle` | List all vehicles (paginated) | 200 |
| POST | `/vehicle` | Create a new vehicle | 201, 400, 409, 422 |
| GET | `/vehicle/:vin` | Get vehicle by VIN | 200, 404 |
| PUT | `/vehicle/:vin` | Update vehicle | 200, 404, 422 |
| DELETE | `/vehicle/:vin` | Delete vehicle | 204, 404 |
| GET | `/health` | Health check | 200 |

## Request/Response Examples

### Create Vehicle
```bash
curl -X POST http://localhost:3000/vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGBH41JXMN109186",
    "manufacturerName": "Honda",
    "description": "Reliable sedan",
    "horsePower": 158,
    "modelName": "Accord",
    "modelYear": 2021,
    "purchasePrice": 25999.99,
    "fuelType": "Gasoline"
  }'
```

### List Vehicles with Filtering
```bash
# Pagination
curl "http://localhost:3000/vehicle?page=1&limit=10"

# Filter by manufacturer
curl "http://localhost:3000/vehicle?manufacturer=Honda"

# Filter by fuel type
curl "http://localhost:3000/vehicle?fuelType=Electric"

# Filter by year range
curl "http://localhost:3000/vehicle?yearMin=2020&yearMax=2024"
```

### Get Vehicle by VIN
```bash
curl http://localhost:3000/vehicle/1HGBH41JXMN109186
```

### Update Vehicle
```bash
curl -X PUT http://localhost:3000/vehicle/1HGBH41JXMN109186 \
  -H "Content-Type: application/json" \
  -d '{"horsePower": 200}'
```

### Delete Vehicle
```bash
curl -X DELETE http://localhost:3000/vehicle/1HGBH41JXMN109186
```

## Vehicle Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| vin | string | Yes | 17-character Vehicle Identification Number |
| manufacturerName | string | Yes | Vehicle manufacturer |
| description | string | No | Vehicle description |
| horsePower | integer | Yes | Engine horsepower (1-2000) |
| modelName | string | Yes | Model name |
| modelYear | integer | Yes | Year of manufacture (1886-2027) |
| purchasePrice | decimal | Yes | Price in dollars |
| fuelType | string | Yes | One of: Gasoline, Diesel, Electric, Hybrid, Hydrogen, Other |

## Error Responses

### 400 Bad Request
Malformed JSON in request body.

### 404 Not Found
Vehicle with specified VIN doesn't exist.

### 409 Conflict
Vehicle with VIN already exists.

### 422 Unprocessable Entity
Validation failed. Response includes details:
```json
{
  "statusCode": 422,
  "error": "Unprocessable Entity",
  "message": "Validation failed",
  "details": [
    { "field": "vin", "message": "VIN must be exactly 17 characters" }
  ]
}
```

## Running Tests

```bash
# All tests
make test

# Unit tests only
make test-unit

# Integration tests only
make test-e2e
```

## Development Commands

```bash
make install      # Install dependencies
make dev          # Start with hot reload
make start        # Production start
make test         # Run all tests
make lint         # Type check
make db-up        # Start PostgreSQL
make db-down      # Stop PostgreSQL
make db-push      # Push schema to database
make db-generate  # Generate Prisma client
make clean        # Remove artifacts
```

## Project Structure

```
src/
├── index.ts          # Entry point
├── app.ts            # Fastify configuration
├── db.ts             # Database connection
├── routes/           # API routes
├── services/         # Business logic
├── schemas/          # JSON Schema validation
├── types/            # TypeScript types
└── utils/            # Utilities (VIN validator)
```

## Tech Stack

- **Runtime**: Bun
- **Framework**: Fastify
- **Database**: PostgreSQL
- **ORM**: Prisma 7
- **Language**: TypeScript
- **Testing**: Bun Test
- **Documentation**: Swagger/OpenAPI

## Design Decisions

1. **VIN Validation**: Implements ISO 3779 standard with check digit validation for North American VINs. European VINs pass format validation without check digit (as per standard).

2. **Case-Insensitive VIN**: VINs are normalized to uppercase for storage and comparison, ensuring `1hgbh41jxmn109186` matches `1HGBH41JXMN109186`.

3. **Pagination**: All list endpoints support pagination (`page`, `limit`) with total count in response.

4. **Error Handling**:
   - 400 for malformed JSON
   - 422 for validation failures (per requirements)
   - Detailed error messages for debugging

5. **Decimal Handling**: Purchase prices stored as PostgreSQL DECIMAL(12,2) for financial accuracy.
