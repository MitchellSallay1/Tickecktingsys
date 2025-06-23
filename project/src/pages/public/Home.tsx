import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, MapPin, Filter, QrCode } from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Event } from '../../types';

const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    description: 'Annual technology conference featuring the latest innovations and industry leaders.',
    category: 'Technology',
    startDate: '2024-06-15T09:00:00Z',
    endDate: '2024-06-15T18:00:00Z',
    location: 'Convention Center, New York',
    price: 299.99,
    capacity: 1000,
    soldTickets: 750,
    status: 'upcoming',
    organizerId: '1',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    ticketTypes: []
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    description: 'A day of live music performances from top artists across multiple genres.',
    category: 'Music',
    startDate: '2024-07-20T12:00:00Z',
    endDate: '2024-07-20T23:00:00Z',
    location: 'Central Park, New York',
    price: 149.99,
    capacity: 5000,
    soldTickets: 3500,
    status: 'upcoming',
    organizerId: '2',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    ticketTypes: []
  },
  {
    id: '3',
    title: 'Food & Wine Expo',
    description: 'Experience culinary delights and wine tastings from around the world.',
    category: 'Food & Drink',
    startDate: '2024-08-10T11:00:00Z',
    endDate: '2024-08-10T20:00:00Z',
    location: 'Expo Center, Chicago',
    price: 79.99,
    capacity: 2000,
    soldTickets: 1200,
    status: 'upcoming',
    organizerId: '3',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    ticketTypes: []
  },
];

const Home: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    date: '',
    location: '',
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Music', label: 'Music' },
    { value: 'Food & Drink', label: 'Food & Drink' },
    { value: 'Business', label: 'Business' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Arts', label: 'Arts' },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we would call an API with filters
    const filteredEvents = mockEvents.filter(event => {
      const matchesSearch = !filters.search || 
        event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        event.description.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = !filters.category || event.category === filters.category;
      const matchesDate = !filters.date || new Date(event.startDate).toLocaleDateString() === filters.date;
      const matchesLocation = !filters.location || 
        event.location.toLowerCase().includes(filters.location.toLowerCase());
      
      return matchesSearch && matchesCategory && matchesDate && matchesLocation;
    });
    
    setEvents(filteredEvents);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Find and Book Amazing Events
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover events that match your interests, from concerts and festivals to workshops and conferences.
          </p>
        </div>

        {/* Event Categories */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Popular Categories</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Add category cards here */}
          </div>
        </div>

        {/* Featured Events */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900">Featured Events</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Add event cards here */}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-primary-600 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-12 sm:px-12 sm:py-16">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                Ready to host your own event?
              </h2>
              <p className="mt-4 text-lg text-primary-100">
                Join as an organizer and start creating unforgettable experiences.
              </p>
              <Link
                to="/auth/register"
                className="mt-8 inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-600 bg-white hover:bg-primary-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Try Our Features</h2>
            <p className="mt-2 text-gray-600">Experience the latest event management technology</p>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardContent>
                <div className="text-center">
                  <QrCode className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Scanner Demo</h3>
                  <p className="text-gray-600 mb-4">
                    Test our QR code scanning functionality for event check-in. Perfect for organizers and event staff.
                  </p>
                  <Link to="/demo/qr-scanner">
                    <Button className="flex items-center mx-auto">
                      <QrCode size={16} className="mr-2" />
                      Try QR Scanner
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent>
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🎫</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ticket Management</h3>
                  <p className="text-gray-600 mb-4">
                    Explore our comprehensive ticket management system with real-time tracking and analytics.
                  </p>
                  <Button variant="outline" className="mx-auto">
                    Coming Soon
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

export default Home;