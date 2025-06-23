import React from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, Ticket } from 'lucide-react';
import Button from '../components/common/Button';
import Card, { CardContent } from '../components/common/Card';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  // Mock event data (in a real app, this would be fetched from an API)
  const event = {
    id,
    title: 'Tech Conference 2024',
    description: 'Join us for the biggest tech conference of the year. Learn from industry experts, network with peers, and discover the latest innovations in technology.',
    startDate: '2024-06-15T09:00:00Z',
    endDate: '2024-06-17T18:00:00Z',
    location: 'San Francisco Convention Center',
    capacity: 1000,
    remainingTickets: 250,
    price: 499,
    organizer: {
      name: 'Tech Events Inc.',
      image: 'https://via.placeholder.com/150',
    },
    ticketTypes: [
      {
        name: 'Early Bird',
        price: 399,
        quantity: 100,
        description: 'Limited early bird tickets at a special price',
      },
      {
        name: 'Regular',
        price: 499,
        quantity: 800,
        description: 'Standard conference admission',
      },
      {
        name: 'VIP',
        price: 999,
        quantity: 100,
        description: 'VIP access including exclusive workshops and networking events',
      },
    ],
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="h-64 bg-gray-200">
            {/* Event image would go here */}
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2" />
                {formatDate(event.startDate)}
              </div>
              <div className="flex items-center text-gray-600">
                <Clock className="w-5 h-5 mr-2" />
                {formatTime(event.startDate)} - {formatTime(event.endDate)}
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2" />
                {event.location}
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                {event.remainingTickets} tickets remaining
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Description */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">About this event</h2>
                <p className="text-gray-600">{event.description}</p>
              </CardContent>
            </Card>

            {/* Organizer Information */}
            <Card className="mt-8">
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Organizer</h2>
                <div className="flex items-center">
                  <img
                    src={event.organizer.image}
                    alt={event.organizer.name}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{event.organizer.name}</h3>
                    <p className="text-gray-600">Event Organizer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Selection */}
          <div>
            <Card>
              <CardContent>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tickets</h2>
                <div className="space-y-4">
                  {event.ticketTypes.map((ticket) => (
                    <div
                      key={ticket.name}
                      className="p-4 border rounded-lg hover:border-primary-500 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{ticket.name}</h3>
                          <p className="text-sm text-gray-500">{ticket.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">${ticket.price}</p>
                          <p className="text-sm text-gray-500">{ticket.quantity} available</p>
                        </div>
                      </div>
                      <Button className="w-full mt-4">
                        <Ticket className="w-4 h-4 mr-2" />
                        Select
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails; 