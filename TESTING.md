# API Testing Guide

This guide provides commands to demonstrate all features of the Vehicle API.

## Base URL

```bash
# Production
BASE="https://vehicle-api-steel.vercel.app"

# Local development
# BASE="http://localhost:3000"
```

---

## 1. Health Check

```bash
curl -s $BASE/health | jq .
```

Expected: `200 OK` with status and timestamp.

---

## 2. Create Vehicle (POST /vehicle → 201)

```bash
curl -s -X POST $BASE/vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGBH41JXMN109186",
    "manufacturerName": "Honda",
    "description": "Reliable mid-size sedan",
    "horsePower": 192,
    "modelName": "Accord",
    "modelYear": 2024,
    "purchasePrice": 32999.99,
    "fuelType": "Gasoline"
  }' | jq .
```

Expected: `201 Created` with vehicle data including generated `id`.

---

## 3. Get All Vehicles (GET /vehicle → 200)

```bash
curl -s $BASE/vehicle | jq .
```

Expected: `200 OK` with paginated list of vehicles.

---

## 4. Get Vehicle by VIN (GET /vehicle/:vin → 200)

```bash
curl -s $BASE/vehicle/1HGBH41JXMN109186 | jq .
```

Expected: `200 OK` with single vehicle.

---

## 5. Case-Insensitive VIN Lookup

```bash
curl -s $BASE/vehicle/1hgbh41jxmn109186 | jq .
```

Expected: `200 OK` - same vehicle returned (VIN is case-insensitive).

---

## 6. Update Vehicle (PUT /vehicle/:vin → 200)

```bash
curl -s -X PUT $BASE/vehicle/1HGBH41JXMN109186 \
  -H "Content-Type: application/json" \
  -d '{
    "horsePower": 215,
    "description": "Updated with sport package"
  }' | jq .
```

Expected: `200 OK` with updated vehicle data.

---

## 7. Pagination

```bash
# Create more vehicles for pagination demo
curl -s -X POST $BASE/vehicle -H "Content-Type: application/json" \
  -d '{"vin":"WBAPH5C55BA123456","manufacturerName":"BMW","horsePower":300,"modelName":"M3","modelYear":2023,"purchasePrice":70000,"fuelType":"Gasoline"}' > /dev/null

curl -s -X POST $BASE/vehicle -H "Content-Type: application/json" \
  -d '{"vin":"5YJSA1E26MF234567","manufacturerName":"Tesla","horsePower":670,"modelName":"Model S","modelYear":2024,"purchasePrice":89990,"fuelType":"Electric"}' > /dev/null

# Get page 1 with limit 2
curl -s "$BASE/vehicle?page=1&limit=2" | jq .

# Get page 2
curl -s "$BASE/vehicle?page=2&limit=2" | jq .
```

Expected: Paginated results with `page`, `limit`, `total`, `totalPages`.

---

## 8. Filtering

```bash
# Filter by manufacturer
curl -s "$BASE/vehicle?manufacturer=Tesla" | jq .

# Filter by fuel type
curl -s "$BASE/vehicle?fuelType=Electric" | jq .

# Filter by year range
curl -s "$BASE/vehicle?yearMin=2024&yearMax=2024" | jq .

# Combined filters
curl -s "$BASE/vehicle?manufacturer=BMW&fuelType=Gasoline" | jq .
```

---

## 9. Error Handling

### 400 Bad Request (Malformed JSON)

```bash
curl -s -X POST $BASE/vehicle \
  -H "Content-Type: application/json" \
  -d '{ invalid json }' | jq .
```

Expected: `400 Bad Request` with error message.

### 422 Unprocessable Entity (Validation Error)

```bash
# Missing required fields
curl -s -X POST $BASE/vehicle \
  -H "Content-Type: application/json" \
  -d '{"vin": "1HGBH41JXMN109186"}' | jq .

# Invalid VIN (too short)
curl -s -X POST $BASE/vehicle \
  -H "Content-Type: application/json" \
  -d '{"vin":"SHORT","manufacturerName":"Test","horsePower":100,"modelName":"Test","modelYear":2024,"purchasePrice":10000,"fuelType":"Gasoline"}' | jq .

# Invalid VIN check digit (North American)
curl -s -X POST $BASE/vehicle \
  -H "Content-Type: application/json" \
  -d '{"vin":"1HGBH41JXMN109187","manufacturerName":"Honda","horsePower":100,"modelName":"Test","modelYear":2024,"purchasePrice":10000,"fuelType":"Gasoline"}' | jq .
```

Expected: `422 Unprocessable Entity` with validation details.

### 404 Not Found

```bash
curl -s $BASE/vehicle/DOESNOTEXIST12345 | jq .
```

Expected: `404 Not Found`.

### 409 Conflict (Duplicate VIN)

```bash
# Try to create vehicle with existing VIN
curl -s -X POST $BASE/vehicle \
  -H "Content-Type: application/json" \
  -d '{"vin":"1HGBH41JXMN109186","manufacturerName":"Toyota","horsePower":100,"modelName":"Camry","modelYear":2024,"purchasePrice":30000,"fuelType":"Gasoline"}' | jq .
```

Expected: `409 Conflict`.

---

## 10. Delete Vehicle (DELETE /vehicle/:vin → 204)

```bash
curl -s -X DELETE $BASE/vehicle/1HGBH41JXMN109186 -w "Status: %{http_code}\n"
```

Expected: `204 No Content` (empty response body).

### Verify Deletion

```bash
curl -s $BASE/vehicle/1HGBH41JXMN109186 | jq .
```

Expected: `404 Not Found`.

---

## 11. Cleanup

```bash
curl -s -X DELETE $BASE/vehicle/WBAPH5C55BA123456 > /dev/null
curl -s -X DELETE $BASE/vehicle/5YJSA1E26MF234567 > /dev/null
echo "Cleanup complete"
```

---

## 12. Swagger Documentation

Visit: https://vehicle-api-steel.vercel.app/docs

- Interactive API documentation
- Try endpoints directly from the browser
- View request/response schemas

---

## Quick Full Demo Script

Run this for a complete demonstration:

```bash
BASE="https://vehicle-api-steel.vercel.app"

echo "=== 1. Health Check ===" && curl -s $BASE/health | jq .

echo "\n=== 2. Create Vehicle ===" && curl -s -X POST $BASE/vehicle -H "Content-Type: application/json" -d '{"vin":"1HGBH41JXMN109186","manufacturerName":"Honda","description":"Demo vehicle","horsePower":192,"modelName":"Accord","modelYear":2024,"purchasePrice":32999.99,"fuelType":"Gasoline"}' | jq .

echo "\n=== 3. Get All Vehicles ===" && curl -s $BASE/vehicle | jq .

echo "\n=== 4. Get by VIN ===" && curl -s $BASE/vehicle/1HGBH41JXMN109186 | jq .

echo "\n=== 5. Case-Insensitive ===" && curl -s $BASE/vehicle/1hgbh41jxmn109186 | jq .vin

echo "\n=== 6. Update Vehicle ===" && curl -s -X PUT $BASE/vehicle/1HGBH41JXMN109186 -H "Content-Type: application/json" -d '{"horsePower":215}' | jq .horsePower

echo "\n=== 7. 409 Conflict ===" && curl -s -X POST $BASE/vehicle -H "Content-Type: application/json" -d '{"vin":"1HGBH41JXMN109186","manufacturerName":"Toyota","horsePower":100,"modelName":"Camry","modelYear":2024,"purchasePrice":30000,"fuelType":"Gasoline"}' | jq .

echo "\n=== 8. 422 Validation ===" && curl -s -X POST $BASE/vehicle -H "Content-Type: application/json" -d '{"vin":"SHORT"}' | jq .

echo "\n=== 9. 400 Bad JSON ===" && curl -s -X POST $BASE/vehicle -H "Content-Type: application/json" -d 'not json' | jq .

echo "\n=== 10. Delete ===" && curl -s -X DELETE $BASE/vehicle/1HGBH41JXMN109186 -w "Status: %{http_code}\n"

echo "\n=== 11. 404 Not Found ===" && curl -s $BASE/vehicle/1HGBH41JXMN109186 | jq .

echo "\n=== Demo Complete ==="
```
