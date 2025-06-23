import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Plus, MoreVertical, Calendar, MapPin, DollarSign, Users, Search } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { Event } from '../../types';
import { toast } from 'react-toastify';

interface EventTemplate extends Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'soldTickets'> {
  id: string;
  templateName: string;
  lastUsed: string;
  timesUsed: number;
}

const mockTemplates: EventTemplate[] = [
  {
    id: '1',
    templateName: 'Tech Conference Template',
    title: 'Tech Conference',
    description: 'A comprehensive technology conference template',
    startDate: '2024-06-15T09:00:00',
    endDate: '2024-06-17T18:00:00',
    location: 'Convention Center',
    capacity: 1000,
    price: 299.99,
    category: 'Technology',
    status: 'active',
    organizerId: '1',
    lastUsed: '2024-02-15',
    timesUsed: 5,
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
      {
        name: 'VIP',
        price: 499.99,
        quantity: 200,
        description: 'VIP access with exclusive benefits',
      },
    ],
  },
  {
    id: '2',
    templateName: 'Music Festival Template',
    title: 'Music Festival',
    description: 'A multi-day music festival template',
    startDate: '2024-07-01T12:00:00',
    endDate: '2024-07-03T23:00:00',
    location: 'Festival Grounds',
    capacity: 5000,
    price: 199.99,
    category: 'Music',
    status: 'active',
    organizerId: '1',
    lastUsed: '2024-01-20',
    timesUsed: 3,
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
      {
        name: 'VIP Pass',
        price: 399.99,
        quantity: 500,
        description: 'VIP access with backstage passes',
      },
    ],
  },
];

const EventTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load event templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    navigate('/organizer/templates/create');
  };

  const handleUseTemplate = async (template: EventTemplate) => {
    try {
      // In a real app, we would call an API to create a new event from the template
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Event created from template');
      navigate('/organizer/events/create', { state: { template } });
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Failed to create event from template');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      // In a real app, we would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTemplates(templates.filter(t => t.id !== id));
      toast.success('Template deleted successfully');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.templateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
          Event Templates
        </h1>
        <Button onClick={handleCreateTemplate}>
          <Plus size={16} className="mr-2" />
          Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              placeholder="Search templates..."
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="h-full">
            <CardContent>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {template.templateName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {template.description}
                  </p>
                </div>
                <div className="relative">
                  <button
                    className="p-2 hover:bg-gray-100 rounded-full"
                    onClick={() => {/* Handle menu */}}
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-gray-600">
                  <Calendar size={16} className="mr-2" />
                  {new Date(template.startDate).toLocaleDateString()} - {new Date(template.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin size={16} className="mr-2" />
                  {template.location}
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign size={16} className="mr-2" />
                  Starting from ${template.ticketTypes[0].price}
                </div>
                <div className="flex items-center text-gray-600">
                  <Users size={16} className="mr-2" />
                  Capacity: {template.capacity}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Last used: {new Date(template.lastUsed).toLocaleDateString()}</span>
                  <span>Used {template.timesUsed} times</span>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleUseTemplate(template)}
                  >
                    <Copy size={16} className="mr-2" />
                    Use Template
                  </Button>
                  <Button
                    variant="outline"
                    className="px-3"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <MoreVertical size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventTemplates; 