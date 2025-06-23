import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Copy,
  Download,
  Upload,
  Trash2,
  Edit2,
  CheckSquare,
  Square,
  Search,
  Filter,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Event } from '../../types';
import { toast } from 'react-toastify';

interface BulkEvent extends Event {
  isSelected: boolean;
}

const mockEvents: BulkEvent[] = [
  {
    id: '1',
    title: 'Tech Conference 2024',
    description: 'Annual technology conference',
    startDate: '2024-06-15T09:00:00',
    endDate: '2024-06-17T18:00:00',
    location: 'Convention Center',
    capacity: 1000,
    price: 299.99,
    category: 'Technology',
    status: 'upcoming',
    organizerId: '1',
    createdAt: '2024-01-01T00:00:00',
    updatedAt: '2024-01-01T00:00:00',
    soldTickets: 0,
    isSelected: false,
    ticketTypes: [
      {
        name: 'Early Bird',
        price: 199.99,
        quantity: 200,
        description: 'Early bird discount tickets',
      },
      {
        name: 'Regular',
        price: 299.99,
        quantity: 600,
        description: 'Regular conference tickets',
      },
    ],
  },
  {
    id: '2',
    title: 'Music Festival 2024',
    description: 'Summer music festival',
    startDate: '2024-07-01T12:00:00',
    endDate: '2024-07-03T23:00:00',
    location: 'Festival Grounds',
    capacity: 5000,
    price: 199.99,
    category: 'Music',
    status: 'upcoming',
    organizerId: '1',
    createdAt: '2024-01-02T00:00:00',
    updatedAt: '2024-01-02T00:00:00',
    soldTickets: 0,
    isSelected: false,
    ticketTypes: [
      {
        name: 'Single Day',
        price: 89.99,
        quantity: 2000,
        description: 'Access for one day',
      },
      {
        name: 'Full Festival',
        price: 199.99,
        quantity: 2500,
        description: 'Access for all days',
      },
    ],
  },
];

const BulkOperations: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<BulkEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setEvents(mockEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleSelectAll = () => {
    setEvents(events.map(event => ({ ...event, isSelected: true })));
  };

  const handleDeselectAll = () => {
    setEvents(events.map(event => ({ ...event, isSelected: false })));
  };

  const handleToggleSelect = (id: string) => {
    setEvents(events.map(event =>
      event.id === id ? { ...event, isSelected: !event.isSelected } : event
    ));
  };

  const handleBulkDelete = async () => {
    const selectedEvents = events.filter(event => event.isSelected);
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(events.filter(event => !event.isSelected));
      toast.success(`${selectedEvents.length} events deleted successfully`);
    } catch (error) {
      console.error('Error deleting events:', error);
      toast.error('Failed to delete events');
    }
  };

  const handleBulkDuplicate = async () => {
    const selectedEvents = events.filter(event => event.isSelected);
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      const duplicatedEvents = selectedEvents.map(event => ({
        ...event,
        id: `${event.id}-copy`,
        title: `${event.title} (Copy)`,
        isSelected: false,
      }));
      setEvents([...events, ...duplicatedEvents]);
      toast.success(`${selectedEvents.length} events duplicated successfully`);
    } catch (error) {
      console.error('Error duplicating events:', error);
      toast.error('Failed to duplicate events');
    }
  };

  const handleExport = async () => {
    const selectedEvents = events.filter(event => event.isSelected);
    if (selectedEvents.length === 0) {
      toast.error('Please select at least one event');
      return;
    }

    try {
      // In a real app, we would generate and download a CSV/Excel file
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`${selectedEvents.length} events exported successfully`);
    } catch (error) {
      console.error('Error exporting events:', error);
      toast.error('Failed to export events');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || event.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const selectedCount = events.filter(event => event.isSelected).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bulk Event Operations
        </h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={selectedCount === 0}
          >
            <Download size={16} className="mr-2" />
            Export Selected
          </Button>
          <Button
            variant="outline"
            onClick={handleBulkDuplicate}
            disabled={selectedCount === 0}
          >
            <Copy size={16} className="mr-2" />
            Duplicate Selected
          </Button>
          <Button
            variant="outline"
            onClick={handleBulkDelete}
            disabled={selectedCount === 0}
          >
            <Trash2 size={16} className="mr-2" />
            Delete Selected
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<Search size={18} />}
              />
            </div>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              options={[
                { value: 'all', label: 'All Categories' },
                { value: 'Technology', label: 'Technology' },
                { value: 'Music', label: 'Music' },
                { value: 'Business', label: 'Business' },
                { value: 'Sports', label: 'Sports' },
              ]}
            />
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'ongoing', label: 'Ongoing' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                className="p-2 hover:bg-gray-100 rounded-lg mr-4"
                onClick={events.some(e => e.isSelected) ? handleDeselectAll : handleSelectAll}
              >
                {events.some(e => e.isSelected) ? (
                  <CheckSquare size={20} className="text-primary-600" />
                ) : (
                  <Square size={20} className="text-gray-400" />
                )}
              </button>
              <span className="text-sm text-gray-500">
                {selectedCount} events selected
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              {filteredEvents.length} events found
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredEvents.map(event => (
              <div
                key={event.id}
                className="flex items-center p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg mr-4"
                  onClick={() => handleToggleSelect(event.id)}
                >
                  {event.isSelected ? (
                    <CheckSquare size={20} className="text-primary-600" />
                  ) : (
                    <Square size={20} className="text-gray-400" />
                  )}
                </button>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Calendar size={16} className="mr-1" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <span>{event.location}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'upcoming'
                        ? 'bg-blue-100 text-blue-800'
                        : event.status === 'ongoing'
                        ? 'bg-green-100 text-green-800'
                        : event.status === 'completed'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="px-3"
                    onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                  >
                    <Edit2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkOperations; 