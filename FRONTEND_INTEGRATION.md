# Frontend Integration Guide

This guide explains how to integrate the React frontend with the Go backend for the Event Ticketing System.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install additional dependencies for full functionality
npm install @types/react @types/react-dom @types/node react-router-dom
```

### 2. Start the Backend

Make sure the Go backend is running:

```bash
cd backend
go run main.go
```

The backend will be available at `http://localhost:8080`

### 3. Start the Frontend

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── LoginForm.tsx    # User authentication
│   ├── RegisterForm.tsx # User registration
│   ├── EventsList.tsx   # Event browsing
│   └── TicketPurchase.tsx # Ticket purchasing
├── context/             # React context
│   └── AuthContext.tsx  # Authentication state management
├── services/            # API services
│   ├── api.ts          # Main API integration
│   └── uploadService.ts # File upload service
├── types/               # TypeScript type definitions
│   └── index.ts        # Shared types
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── index.css           # Global styles
```

## 🔧 API Integration

### Authentication Flow

1. **Login**: Users authenticate with email/password
2. **JWT Token**: Backend returns JWT token stored in localStorage
3. **Auto-login**: Token is validated on app startup
4. **Protected Routes**: Routes check authentication status

### API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login` | POST | User authentication |
| `/api/register` | POST | User registration |
| `/api/me` | GET | Get current user |
| `/api/events` | GET | List all events |
| `/api/events/:id` | GET | Get event details |
| `/api/tickets` | POST | Create ticket |
| `/api/payments/initiate` | POST | Start payment process |
| `/api/user/tickets` | GET | Get user's tickets |

## 🎨 Components Overview

### 1. Authentication Components

#### LoginForm.tsx
- Email/password authentication
- Form validation with react-hook-form
- Error handling and user feedback
- Redirect to dashboard on success

#### RegisterForm.tsx
- User registration with role selection
- Phone number validation
- Password confirmation
- Role-based account creation

### 2. Event Management

#### EventsList.tsx
- Browse all available events
- Search and filter functionality
- Pagination support
- Responsive grid layout
- Category filtering

#### TicketPurchase.tsx
- Event details display
- Ticket quantity selection
- Payment method selection (MoMo/USSD)
- Real-time price calculation
- Payment integration

### 3. Context Management

#### AuthContext.tsx
- Global authentication state
- User session management
- Automatic token validation
- Role-based access control

## 🔐 Authentication & Authorization

### User Roles

1. **User**: Can browse events and purchase tickets
2. **Organizer**: Can create and manage events
3. **Admin**: Full system access

### Protected Routes

```typescript
// Example of role-based route protection
<Route
  path="/admin/*"
  element={
    <ProtectedRoute roles={['admin']}>
      <AdminPanel />
    </ProtectedRoute>
  }
/>
```

## 💳 Payment Integration

### MoMo Payment Flow

1. User selects MoMo payment method
2. Frontend calls `/api/payments/initiate`
3. Backend creates payment record
4. MoMo payment prompt sent to user's phone
5. Payment callback updates ticket status
6. SMS confirmation sent to user

### USSD Payment Flow

1. User selects USSD payment method
2. Ticket created with pending status
3. User receives SMS with USSD instructions
4. Payment completed via USSD menu
5. Ticket status updated automatically

## 🎯 Key Features

### 1. Real-time Updates
- Event availability updates
- Payment status tracking
- Ticket validation

### 2. Responsive Design
- Mobile-first approach
- Tailwind CSS styling
- Cross-device compatibility

### 3. Error Handling
- API error responses
- Network connectivity issues
- User-friendly error messages

### 4. Loading States
- Skeleton loading for events
- Spinner animations
- Progress indicators

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_ENVIRONMENT=development
```

### API Configuration

The API base URL is configured in `src/services/api.ts`:

```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

## 🧪 Testing the Integration

### 1. Test User Registration

```bash
# Register a new user
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

### 2. Test Login

```bash
# Login with credentials
curl -X POST http://localhost:8080/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 3. Test Event Creation

```bash
# Create an event (requires organizer/admin token)
curl -X POST http://localhost:8080/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Event",
    "description": "A test event",
    "date": "2024-12-25T18:00:00Z",
    "location": "Test Location",
    "price": 50.00,
    "max_tickets": 100,
    "category": "test"
  }'
```

## 🚀 Deployment

### Development

```bash
# Start backend
cd backend && go run main.go

# Start frontend (in new terminal)
npm start
```

### Production

```bash
# Build frontend
npm run build

# Serve with nginx or similar
# Backend can be deployed with Docker
docker-compose up -d
```

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured correctly
   - Check `ALLOWED_ORIGINS` in backend config

2. **Authentication Issues**
   - Verify JWT token is being sent in headers
   - Check token expiration
   - Ensure user is active in database

3. **Payment Integration**
   - Verify MoMo API credentials
   - Check callback URL configuration
   - Test with sandbox environment first

4. **Database Connection**
   - Ensure MongoDB is running
   - Check connection string
   - Verify database indexes are created

### Debug Mode

Enable debug logging in the frontend:

```typescript
// In src/services/api.ts
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response logging
api.interceptors.request.use(request => {
  console.log('Request:', request);
  return request;
});

api.interceptors.response.use(response => {
  console.log('Response:', response);
  return response;
});
```

## 📚 Additional Resources

- [Go Backend Documentation](./backend/README.md)
- [API Documentation](./backend/README.md#api-documentation)
- [Database Schema](./backend/README.md#database-schema)
- [Payment Integration Guide](./backend/README.md#payment-integration)

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper TypeScript types
3. Include error handling
4. Test with the backend API
5. Update documentation

## 📞 Support

For issues and questions:
- Check the backend logs
- Review API documentation
- Test endpoints with curl/Postman
- Verify database connectivity

---

**Note**: This frontend integration is designed to work seamlessly with the Go backend. Make sure both services are running and properly configured before testing the full functionality. 