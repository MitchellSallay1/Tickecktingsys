# Quick Start Guide

This guide will help you get the Event Ticketing System backend running in minutes.

## Prerequisites

- Go 1.21 or higher
- MongoDB 4.4 or higher (or Docker)
- Git

## Option 1: Local Development (Recommended)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd eventticketing/backend

# Install dependencies
go mod tidy
```

### 2. Configure Environment

```bash
# Copy environment file
cp env.example .env

# Edit .env with your settings
# At minimum, update:
# - JWT_SECRET (generate a random string)
# - MONGODB_URI (if using remote MongoDB)
```

### 3. Start MongoDB

**Option A: Local MongoDB**
```bash
# macOS
brew services start mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Windows
net start MongoDB
```

**Option B: Docker MongoDB**
```bash
docker run -d -p 27017:27017 --name mongodb mongo:6.0
```

### 4. Seed Database

```bash
# Run the seed script to create sample data
go run scripts/seed.go
```

### 5. Start the Server

```bash
go run main.go
```

The server will be available at `http://localhost:8080`

## Option 2: Docker Compose (Easiest)

### 1. Setup

```bash
# Clone the repository
git clone <repository-url>
cd eventticketing/backend

# Start all services
docker-compose up -d
```

This will start:
- Go backend on port 8080
- MongoDB on port 27017
- Mongo Express (database UI) on port 8081

### 2. Seed Database

```bash
# Run seed script in container
docker-compose exec app go run scripts/seed.go
```

## Testing the API

### 1. Health Check

```bash
curl http://localhost:8080/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Event Ticketing API is running",
  "version": "1.0.0"
}
```

### 2. Register a User

```bash
curl -X POST http://localhost:8080/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "phone": "+1234567890",
    "password": "password123",
    "role": "user"
  }'
```

### 3. Login

```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 4. Get Events (Public)

```bash
curl http://localhost:8080/api/events
```

## Default Users

The seed script creates these users:

| Email | Password | Role |
|-------|----------|------|
| admin@eventticketing.com | admin123 | Admin |
| jane@example.com | password123 | Organizer |
| john@example.com | password123 | User |
| bob@example.com | password123 | User |

## Sample Events

The seed script creates 5 sample events:
- Summer Music Festival
- Tech Conference 2024
- Food & Wine Festival
- Comedy Night
- Art Exhibition

## API Documentation

- **Health Check**: `GET /health`
- **Register**: `POST /api/register`
- **Login**: `POST /api/login`
- **Events**: `GET /api/events`
- **Create Event**: `POST /api/events` (Organizer/Admin)
- **Tickets**: `POST /api/tickets`
- **Payments**: `POST /api/payments/initiate`
- **USSD**: `POST /api/ussd/entry`

## Development Tools

### Using Makefile

```bash
# Show all available commands
make help

# Install dependencies
make deps

# Run the application
make run

# Seed database
make seed

# Run tests
make test

# Format code
make format

# Build for production
make build
```

### Using Docker

```bash
# Build image
docker build -t eventticketing-backend .

# Run container
docker run -p 8080:8080 --env-file .env eventticketing-backend
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify MongoDB port (default: 27017)

2. **Port Already in Use**
   - Change PORT in .env file
   - Kill process using port 8080

3. **Permission Denied**
   - Ensure uploads directory is writable
   - Check file permissions

4. **JWT Secret Missing**
   - Generate a random JWT_SECRET in .env file

### Logs

```bash
# View application logs
docker-compose logs app

# View MongoDB logs
docker-compose logs mongo

# Follow logs in real-time
docker-compose logs -f app
```

## Next Steps

1. **Frontend Integration**: Connect your React frontend to the API
2. **Payment Setup**: Configure real MoMo API credentials
3. **SMS Setup**: Configure real SMS gateway credentials
4. **Production Deployment**: Set up production environment
5. **Testing**: Add comprehensive test coverage

## Support

- Check the main README.md for detailed documentation
- Review API endpoints in the routes configuration
- Examine the models for data structures
- Look at controllers for business logic

Happy coding! 🚀 