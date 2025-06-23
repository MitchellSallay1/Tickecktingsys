# EventTix - Event Ticketing System

A comprehensive event ticketing platform with USSD integration, built with Go (backend) and React/TypeScript (frontend).

## Features

### Backend (Go)
- **RESTful API** with Gin framework
- **MongoDB** database integration
- **JWT Authentication** for secure access
- **USSD Integration** for mobile ticket purchases
- **Payment Processing** with mobile money integration
- **QR Code Generation** for ticket validation
- **SMS Notifications** for ticket confirmations
- **File Upload** for event images
- **Admin Dashboard** for event management

### Frontend (React/TypeScript)
- **Modern UI** with Tailwind CSS
- **Responsive Design** for all devices
- **Role-based Access** (Admin, Organizer, User)
- **Real-time Updates** for ticket status
- **QR Code Scanner** for ticket validation
- **Analytics Dashboard** for event insights
- **Bulk Operations** for ticket management

### USSD Features
- **Menu Navigation** for easy ticket browsing
- **Event Discovery** through USSD
- **Ticket Purchase** via mobile money
- **Ticket Status** checking
- **SMS Confirmations** for purchases

## Tech Stack

### Backend
- **Go** - Programming language
- **Gin** - Web framework
- **MongoDB** - Database
- **JWT** - Authentication
- **Docker** - Containerization

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool
- **React Router** - Navigation

## Quick Start

### Prerequisites
- Go 1.19+
- Node.js 16+
- MongoDB
- Docker (optional)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Eventticketing/backend
   ```

2. **Install dependencies**
   ```bash
   go mod download
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Run the application**
   ```bash
   go run main.go
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### Docker Setup

1. **Build and run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/organizer/login` - Organizer login

### Events
- `GET /api/events` - List all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event details
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Tickets
- `GET /api/tickets` - List tickets
- `POST /api/tickets` - Purchase ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket status

### USSD
- `POST /api/ussd` - Handle USSD requests

## Project Structure

```
Eventticketing/
├── backend/                 # Go backend
│   ├── config/             # Configuration
│   ├── controllers/        # HTTP controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── utils/             # Utility functions
├── project/               # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@eventtix.com or create an issue in the repository. 