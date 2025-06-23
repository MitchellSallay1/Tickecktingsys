# Event Ticketing System - Go Backend

A comprehensive event ticketing system built with Go (Golang), featuring role-based access control, QR code generation, USSD integration, and Mobile Money payment processing.

## 🚀 Features

- **User Management**: Registration, authentication, and role-based access control
- **Event Management**: Create, update, and manage events with organizer permissions
- **Ticket System**: Generate unique tickets with QR codes for easy verification
- **Payment Integration**: MoMo (Mobile Money) payment processing with webhook support
- **USSD Support**: Menu-driven ticket purchasing via USSD
- **SMS Notifications**: Automated SMS notifications for ticket confirmations
- **Admin Dashboard**: Comprehensive analytics and system management
- **QR Code Verification**: Real-time ticket validation for event entry

## 🛠 Technology Stack

- **Language**: Go (Golang) 1.21+
- **Framework**: Gin (HTTP web framework)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **QR Code**: github.com/skip2/go-qrcode
- **Payment**: MTN MoMo API integration
- **SMS**: MTN SMS Gateway integration

## 📋 Prerequisites

- Go 1.21 or higher
- MongoDB 4.4 or higher
- Git

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd eventticketing/backend
```

### 2. Install Dependencies

```bash
go mod tidy
```

### 3. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Server Configuration
PORT=8080
ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=eventticketing

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Mobile Money Configuration (MoMo)
MOMO_API_KEY=your-momo-api-key
MOMO_API_SECRET=your-momo-api-secret
MOMO_ENVIRONMENT=sandbox
MOMO_CALLBACK_URL=http://localhost:8080/api/payment/callback

# SMS Configuration (MTN SMS Gateway)
SMS_API_KEY=your-sms-api-key
SMS_API_SECRET=your-sms-api-secret
SMS_SENDER_ID=EventTix

# USSD Configuration
USSD_CODE=*123#
USSD_SESSION_TIMEOUT=300

# Admin Configuration
ADMIN_EMAIL=admin@eventticketing.com
ADMIN_PASSWORD=admin123
ADMIN_PHONE=+1234567890

# Commission Settings
COMMISSION_RATE=0.05

# Feature Toggles
ENABLE_USSD=true
ENABLE_QR=true
ENABLE_SMS=true
ENABLE_EMAIL=false

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On macOS with Homebrew
brew services start mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 5. Run the Application

```bash
go run main.go
```

The server will start on `http://localhost:8080`

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "role": "user"
}
```

#### Login
```http
POST /api/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/me
Authorization: Bearer <jwt-token>
```

### Event Endpoints

#### Get All Events (Public)
```http
GET /api/events?page=1&limit=10&search=concert&category=music&status=active
```

#### Get Event by ID (Public)
```http
GET /api/events/:id
```

#### Create Event (Organizer/Admin)
```http
POST /api/events
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Summer Music Festival",
  "description": "A fantastic summer music festival",
  "date": "2024-07-15T18:00:00Z",
  "location": "Central Park",
  "price": 50.00,
  "max_tickets": 1000,
  "category": "music",
  "image_url": "https://example.com/image.jpg"
}
```

#### Update Event (Organizer/Admin)
```http
PUT /api/events/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Updated Event Title",
  "price": 75.00
}
```

#### Delete Event (Organizer/Admin)
```http
DELETE /api/events/:id
Authorization: Bearer <jwt-token>
```

### Ticket Endpoints

#### Create Ticket
```http
POST /api/tickets
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "event_id": "event_id_here",
  "quantity": 2
}
```

#### Get User Tickets
```http
GET /api/user/tickets?page=1&limit=10&status=paid
Authorization: Bearer <jwt-token>
```

#### Verify Ticket
```http
POST /api/tickets/verify
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "ticket_code": "TIX-20241201123456-ABCD1234",
  "event_id": "event_id_here"
}
```

### Payment Endpoints

#### Initiate Payment
```http
POST /api/payments/initiate
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "event_id": "event_id_here",
  "quantity": 1,
  "phone_number": "+1234567890",
  "payment_type": "momo"
}
```

#### Get User Payments
```http
GET /api/payments?page=1&limit=10&status=success
Authorization: Bearer <jwt-token>
```

### USSD Endpoints

#### USSD Entry Point
```http
POST /api/ussd/entry
Content-Type: application/json

{
  "sessionId": "session_123",
  "serviceCode": "*123#",
  "phoneNumber": "+1234567890",
  "text": "1*2*1"
}
```

### Admin Endpoints

#### Get Dashboard Stats
```http
GET /api/admin/dashboard
Authorization: Bearer <jwt-token>
```

#### Get All Users
```http
GET /api/admin/users?page=1&limit=10&role=organizer&search=john
Authorization: Bearer <jwt-token>
```

#### Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "role": "organizer",
  "is_active": true
}
```

#### Get Analytics
```http
GET /api/admin/analytics
Authorization: Bearer <jwt-token>
```

## 🔐 Role-Based Access Control

The system supports three user roles:

1. **User**: Can browse events, purchase tickets, view their tickets
2. **Organizer**: Can create and manage events, view ticket sales for their events
3. **Admin**: Full system access, can manage all users, events, and view analytics

## 💳 Payment Integration

### MoMo Payment Flow

1. User initiates payment with event and quantity
2. System creates ticket and payment records
3. MoMo payment is initiated via API
4. User receives payment prompt on their phone
5. Payment callback updates ticket status
6. SMS confirmation is sent to user

### USSD Payment Flow

1. User dials USSD code (*123#)
2. Navigates menu to select event
3. Confirms purchase
4. Ticket is created with pending status
5. SMS with ticket details is sent

## 📱 USSD Menu Structure

```
Welcome to EventTix
1. View Events
2. Buy Ticket
3. My Tickets
4. Help

1* (View Events)
├── 1. Event 1 - Jan 15
├── 2. Event 2 - Jan 20
└── 0. Back

2* (Buy Ticket)
├── 1. Select Event
├── 2. Enter Event Code
└── 0. Back

2*1* (Select Event)
├── 1. Event 1 - $50.00
├── 2. Event 2 - $75.00
└── 0. Back

2*1*1* (Confirm Purchase)
├── 1. Confirm Purchase
└── 0. Cancel
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8080 |
| `ENV` | Environment (development/production) | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017 |
| `MONGODB_DB` | Database name | eventticketing |
| `JWT_SECRET` | JWT signing secret | (required) |
| `JWT_EXPIRY` | JWT token expiry | 24h |
| `MOMO_API_KEY` | MoMo API key | (required) |
| `MOMO_API_SECRET` | MoMo API secret | (required) |
| `SMS_API_KEY` | SMS API key | (required) |
| `SMS_API_SECRET` | SMS API secret | (required) |

### Feature Toggles

| Feature | Environment Variable | Default |
|---------|---------------------|---------|
| USSD Support | `ENABLE_USSD` | true |
| QR Code Generation | `ENABLE_QR` | true |
| SMS Notifications | `ENABLE_SMS` | true |
| Email Notifications | `ENABLE_EMAIL` | false |

## 🧪 Testing

### Health Check
```bash
curl http://localhost:8080/health
```

### Register a User
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

### Login
```bash
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📊 Database Schema

### Collections

1. **users**: User accounts and authentication
2. **events**: Event information and metadata
3. **tickets**: Ticket records and QR codes
4. **payments**: Payment transactions and status

### Indexes

The system automatically creates indexes for:
- User email and phone (unique)
- Event organizer and status
- Ticket code (unique) and user/event relationships
- Payment user and MoMo reference (unique)

## 🚀 Deployment

### Production Considerations

1. **Environment Variables**: Use production values for all secrets
2. **Database**: Use MongoDB Atlas or production MongoDB instance
3. **HTTPS**: Configure SSL/TLS certificates
4. **Rate Limiting**: Implement API rate limiting
5. **Monitoring**: Add logging and monitoring
6. **Backup**: Configure database backups

### Docker Deployment

```dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
EXPOSE 8080
CMD ["./main"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Email: support@eventticketing.com
- Documentation: [API Docs](https://docs.eventticketing.com)
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🔄 Changelog

### v1.0.0
- Initial release
- User authentication and authorization
- Event management
- Ticket system with QR codes
- MoMo payment integration
- USSD support
- Admin dashboard
- SMS notifications 