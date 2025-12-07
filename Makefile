.PHONY: install dev start test test-unit test-e2e lint clean db-up db-down db-push db-generate

# Install dependencies
install:
	bun install

# Run in development mode with hot reload
dev:
	bun run dev

# Run in production mode
start:
	bun run start

# Run all tests
test:
	bun test

# Run unit tests only
test-unit:
	bun test test/vin-validator.test.ts

# Run integration tests only
test-e2e:
	bun test test/vehicle.test.ts

# Lint code
lint:
	bunx tsc --noEmit

# Clean build artifacts
clean:
	rm -rf node_modules dist *.db

# Start database container
db-up:
	docker compose up -d

# Stop database container
db-down:
	docker compose down

# Push schema to database
db-push:
	bunx prisma db push

# Generate Prisma client
db-generate:
	bunx prisma generate

# Setup: install deps, start db, push schema, generate client
setup: install db-up
	@echo "Waiting for database..."
	@sleep 3
	$(MAKE) db-push
	$(MAKE) db-generate
	@echo "Setup complete! Run 'make dev' to start the server."
