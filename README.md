# Event Ticketing System

A comprehensive event ticketing system built with Go (backend) and React/TypeScript (frontend), featuring QR code integration, mobile money payments, USSD support, and role-based access control.

## 🚀 Features

### Core Functionality
- **Event Management**: Create, edit, and manage events with detailed information
- **Ticket Sales**: Purchase tickets with real-time availability checking
- **QR Code Integration**: Generate and scan QR codes for ticket verification
- **Payment Processing**: Integrated mobile money (MoMo) payment system
- **USSD Support**: Ticket purchase via USSD for mobile users
- **Role-Based Access**: Separate interfaces for users, organizers, and administrators

### Advanced Features
- **Ticket Cancellation & Refunds**: Full cancellation and refund workflow
- **Real-time Analytics**: Dashboard with sales and attendance analytics
- **Bulk Operations**: Manage multiple tickets efficiently
- **Check-in System**: QR code-based entry verification
- **Email Notifications**: Automated ticket confirmations and updates
- **Multi-currency Support**: USD and LRD (Liberian Dollar) support

## 🏗️ Architecture

### Backend (Go)
- **Framework**: Gin web framework
- **Database**: MongoDB with MongoDB Go driver
- **Authentication**: JWT-based authentication
- **Payment**: Mobile Money (MoMo) integration
- **QR Codes**: QR code generation and validation
- **USSD**: USSD session management

### Frontend (React/TypeScript)
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router v6
- **UI Components**: Custom component library
- **QR Scanner**: Web-based QR code scanning

## 📁 Project Structure

```
Eventticketing/
├── backend/                 # Go backend application
│   ├── config/             # Configuration files
│   ├── controllers/        # HTTP request handlers
│   ├── middleware/         # Authentication and CORS middleware
│   ├── models/            # Data models and validation
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic services
│   ├── utils/             # Utility functions
│   └── uploads/           # File uploads directory
├── project/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── context/       # React context providers
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Go 1.21+
- Node.js 18+
- MongoDB 6.0+
- Docker (optional)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MitchellSallay1/Tickecktingsys.git
   cd Tickecktingsys/backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Configure environment**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start MongoDB**
   ```bash
   # Using Docker
   docker-compose up -d mongodb
   
   # Or install MongoDB locally
   ```

5. **Run the application**
   ```bash
   go run main.go
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
PORT=8080
ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/eventticketing

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRY=24h

# Payment (MoMo)
MOMO_API_KEY=your-momo-api-key
MOMO_API_SECRET=your-momo-api-secret
MOMO_ENVIRONMENT=sandbox

# SMS Service
SMS_API_KEY=your-sms-api-key
SMS_SENDER_ID=EventTix

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=Event Ticketing System
```

## 📱 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/me` - Get current user
- `PUT /api/me` - Update user profile

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (organizer/admin)
- `PUT /api/events/:id` - Update event (organizer/admin)
- `DELETE /api/events/:id` - Delete event (organizer/admin)

### Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket by ID
- `GET /api/user/tickets` - Get user's tickets
- `GET /api/tickets/event/:eventId` - Get event tickets (organizer/admin)
- `POST /api/tickets/verify` - Verify ticket for entry
- `PUT /api/tickets/:id/cancel` - Cancel ticket
- `PUT /api/tickets/:id/refund` - Process refund (admin/organizer)

### Payments
- `POST /api/payments/initiate` - Initiate payment
- `GET /api/payments` - Get payment history
- `POST /api/payment/callback` - Payment webhook

### USSD
- `POST /api/ussd/entry` - USSD session handler

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Get all users
- `GET /api/admin/events` - Get all events
- `GET /api/admin/tickets` - Get all tickets
- `GET /api/admin/analytics` - System analytics

## 🔐 Authentication & Authorization

### User Roles
- **User**: Purchase tickets, view own tickets
- **Organizer**: Create/manage events, view event tickets
- **Admin**: Full system access, user management

### JWT Token Structure
```json
{
  "user_id": "user_id",
  "email": "user@example.com",
  "role": "user|organizer|admin",
  "exp": 1640995200
}
```

## 💳 Payment Integration

### Mobile Money (MoMo)
- Supports MTN, Orange, and other mobile money providers
- Real-time payment verification
- Automatic ticket activation upon payment
- Refund processing capabilities

### Payment Flow
1. User selects tickets
2. Payment initiated via MoMo
3. User receives USSD prompt
4. Payment confirmed via webhook
5. Ticket status updated to "paid"

## 📊 Analytics & Reporting

### Dashboard Metrics
- Total events and tickets sold
- Revenue analytics
- User registration trends
- Event performance metrics
- Payment success rates

### Export Capabilities
- CSV export for ticket lists
- PDF reports for events
- Financial summaries

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Rate limiting
- Secure file uploads
- Payment data encryption

## 🧪 Testing

### Backend Tests
```bash
cd backend
go test ./...
```

### Frontend Tests
```bash
cd project
npm test
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment
1. Build backend binary
2. Set up production environment
3. Configure reverse proxy (nginx)
4. Set up SSL certificates
5. Configure monitoring

## 📈 Performance Optimization

- Database indexing for queries
- Caching for frequently accessed data
- Image optimization for event photos
- Lazy loading for ticket lists
- Pagination for large datasets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Email: support@eventticketing.com
- Documentation: [docs.eventticketing.com](https://docs.eventticketing.com)

## 🔄 Changelog

### v1.0.0 (2024-01-15)
- Initial release
- Basic event and ticket management
- QR code integration
- Mobile money payments
- USSD support
- Role-based access control

### v1.1.0 (2024-01-20)
- Added ticket cancellation and refund functionality
- Enhanced analytics dashboard
- Improved error handling
- Performance optimizations
- Security enhancements
