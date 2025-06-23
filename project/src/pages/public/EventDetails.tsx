import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, User, Ticket, Share2 } from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { toast } from 'react-toastify';

interface TicketType {
  id: string;
  name: string;
  price: number;
  description: string;
  available: number;
  maxPerOrder: number;
}

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [selectedTickets, setSelectedTickets] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock event data - in a real app, fetch from API
  const event = {
    id,
    title: 'Summer Music Festival 2024',
    description: `Join us for an unforgettable day of music, food, and fun at the Summer Music Festival 2024! 
    Featuring top artists from around the world, multiple stages, gourmet food vendors, and much more.
    
    Don't miss out on the biggest music event of the year!`,
    date: '2024-07-15',
    time: '12:00 PM',
    location: 'Central Park, New York',
    organizer: {
      id: '1',
      name: 'NYC Events',
      image: 'https://example.com/organizer.jpg',
    },
    bannerImage: 'https://example.com/event-banner.jpg',
    ticketTypes: [
      {
        id: 'early-bird',
        name: 'Early Bird',
        price: 49.99,
        description: 'Limited early bird tickets at a special price',
        available: 100,
        maxPerOrder: 4,
      },
      {
        id: 'regular',
        name: 'Regular',
        price: 79.99,
        description: 'Standard admission ticket',
        available: 500,
        maxPerOrder: 6,
      },
      {
        id: 'vip',
        name: 'VIP',
        price: 149.99,
        description: 'VIP access with exclusive benefits',
        available: 50,
        maxPerOrder: 2,
      },
    ],
  };

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setSelectedTickets(prev => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const calculateTotal = () => {
    return event.ticketTypes.reduce((total, ticket) => {
      const quantity = selectedTickets[ticket.id] || 0;
      return total + ticket.price * quantity;
    }, 0);
  };

  const handlePurchase = async () => {
    const selectedCount = Object.values(selectedTickets).reduce((a, b) => a + b, 0);
    if (selectedCount === 0) {
      toast.error('Please select at least one ticket');
      return;
    }

    setIsLoading(true);
    try {
      // In a real app, make API call to purchase tickets
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Tickets purchased successfully!');
      setSelectedTickets({});
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to purchase tickets. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: event.title,
        text: `Check out ${event.title}!`,
        url: window.location.href,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Event Banner */}
        <div className="relative h-96 rounded-xl overflow-hidden mb-8">
          <img
            src={event.bannerImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent>
                <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                
                <div className="mt-6 space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    {event.date}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="w-5 h-5 mr-2" />
                    {event.time}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-5 h-5 mr-2" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="w-5 h-5 mr-2" />
                    Organized by {event.organizer.name}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    About This Event
                  </h2>
                  <p className="text-gray-600 whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ticket Selection */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Select Tickets
                  </h2>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                  >
                    <Share2 size={18} className="mr-2" />
                    Share
                  </Button>
                </div>

                <div className="space-y-4">
                  {event.ticketTypes.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {ticket.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {ticket.description}
                          </p>
                        </div>
                        <div className="text-lg font-bold text-primary-600">
                          ${ticket.price}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          {ticket.available} available
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(
                              ticket.id,
                              Math.max(0, (selectedTickets[ticket.id] || 0) - 1)
                            )}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">
                            {selectedTickets[ticket.id] || 0}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(
                              ticket.id,
                              Math.min(
                                ticket.maxPerOrder,
                                (selectedTickets[ticket.id] || 0) + 1
                              )
                            )}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t">
                  <div className="flex justify-between text-lg font-semibold mb-4">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>

                  <Button
                    className="w-full"
                    disabled={isLoading}
                    onClick={handlePurchase}
                  >
                    <Ticket size={18} className="mr-2" />
                    {isLoading ? 'Processing...' : 'Purchase Tickets'}
                  </Button>
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