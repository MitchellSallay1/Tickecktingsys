.PHONY: help build run test clean seed deps lint format docker-build docker-run

# Default target
help:
	@echo "Available commands:"
	@echo "  build       - Build the application"
	@echo "  run         - Run the application"
	@echo "  test        - Run tests"
	@echo "  clean       - Clean build artifacts"
	@echo "  seed        - Seed the database with sample data"
	@echo "  deps        - Download dependencies"
	@echo "  lint        - Run linter"
	@echo "  format      - Format code"
	@echo "  docker-build - Build Docker image"
	@echo "  docker-run  - Run Docker container"

# Build the application
build:
	@echo "Building application..."
	go build -o bin/eventticketing main.go

# Run the application
run:
	@echo "Running application..."
	go run main.go

# Run tests
test:
	@echo "Running tests..."
	go test ./...

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf bin/
	go clean

# Seed the database
seed:
	@echo "Seeding database..."
	go run scripts/seed.go

# Download dependencies
deps:
	@echo "Downloading dependencies..."
	go mod tidy
	go mod download

# Run linter
lint:
	@echo "Running linter..."
	golangci-lint run

# Format code
format:
	@echo "Formatting code..."
	go fmt ./...
	goimports -w .

# Build Docker image
docker-build:
	@echo "Building Docker image..."
	docker build -t eventticketing-backend .

# Run Docker container
docker-run:
	@echo "Running Docker container..."
	docker run -p 8080:8080 --env-file .env eventticketing-backend

# Development setup
dev-setup: deps seed
	@echo "Development setup completed!"

# Production build
prod-build: clean build
	@echo "Production build completed!"

# Install development tools
install-tools:
	@echo "Installing development tools..."
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	go install golang.org/x/tools/cmd/goimports@latest

# Database operations
db-reset:
	@echo "Resetting database..."
	# Add MongoDB reset commands here if needed

# API documentation
docs:
	@echo "Generating API documentation..."
	# Add swagger or other documentation generation here

# Security check
security:
	@echo "Running security checks..."
	go list -json -deps ./... | nancy sleuth

# Performance test
bench:
	@echo "Running benchmarks..."
	go test -bench=. ./...

# Coverage report
coverage:
	@echo "Generating coverage report..."
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "Coverage report generated: coverage.html" 