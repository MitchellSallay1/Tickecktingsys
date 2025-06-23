import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, MapPin, Ticket, AlertCircle } from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface UserTicket {
  id: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  ticketCode: string;
  status: 'valid' | 'used' | 'expired' | 'refunded';
  purchaseDate: string;
}

const mockTickets: UserTicket[] = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Tech Conference 2024',
    eventDate: '2024-06-15',
    eventTime: '09:00 AM - 06:00 PM',
    eventLocation: 'Convention Center, New York',
    ticketCode: 'TECH24-001',
    status: 'valid',
    purchaseDate: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    eventId: '2',
    eventTitle: 'Summer Music Festival',
    eventDate: '2024-07-20',
    eventTime: '12:00 PM - 11:00 PM',
    eventLocation: 'Central Park, New York',
    ticketCode: 'SMF24-001',
    status: 'valid',
    purchaseDate: '2024-01-20T15:45:00Z',
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<UserTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTickets(mockTickets);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        toast.error('Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          Here's an overview of your upcoming events and tickets.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="text-center">
            <Ticket className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {tickets.filter(t => t.status === 'valid').length}
            </h3>
            <p className="text-gray-600">Active Tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <Calendar className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {tickets.length}
            </h3>
            <p className="text-gray-600">Total Events</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <AlertCircle className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {tickets.filter(t => new Date(t.eventDate) > new Date()).length}
            </h3>
            <p className="text-gray-600">Upcoming Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Your Tickets
          </h2>
          <Link to="/user/tickets">
            <Button variant="outline">
              View All Tickets
            </Button>
          </Link>
        </div>

        {tickets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No tickets yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't purchased any tickets yet. Start exploring events and secure your spot!
              </p>
              <Link to="/">
                <Button>
                  Browse Events
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tickets.map(ticket => (
              <Link
                key={ticket.id}
                to={`/user/tickets/${ticket.id}`}
                className="block group"
              >
                <Card className="h-full transition-transform duration-200 group-hover:transform group-hover:-translate-y-1">
                  <CardContent>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600">
                          {ticket.eventTitle}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Ticket #{ticket.ticketCode}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === 'valid'
                          ? 'bg-success-100 text-success-800'
                          : ticket.status === 'used'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-error-100 text-error-800'
                      }`}>
                        {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-gray-600">
                        <Calendar size={16} className="mr-2" />
                        {formatDate(ticket.eventDate)}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={16} className="mr-2" />
                        {ticket.eventTime}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin size={16} className="mr-2" />
                        {ticket.eventLocation}
                      </div>
                    </div>

                    <div className="mt-4 text-sm text-gray-500">
                      Purchased on {formatDate(ticket.purchaseDate)}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Events */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Recommended for You
        </h2>
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              We're working on personalizing event recommendations just for you.
            </p>
            <Link to="/">
              <Button>
                Explore All Events
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;