import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, Clock, DollarSign, Users, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createEventApi } from '../../services/eventService';
import Card, { CardContent, CardHeader, CardFooter } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

interface EventFormData {
  title: string;
  description: string;
  bannerImage: string;
  date: string;
  time: string;
  location: string;
  price: number;
  maxTickets: number;
  category: string;
}

const CreateEvent: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch 
  } = useForm<EventFormData>({
    defaultValues: {
      price: 0,
      maxTickets: 100,
    }
  });

  const categories = [
    { value: 'Technology', label: 'Technology' },
    { value: 'Music', label: 'Music' },
    { value: 'Business', label: 'Business' },
    { value: 'Food & Drink', label: 'Food & Drink' },
    { value: 'Education', label: 'Education' },
    { value: 'Charity', label: 'Charity' },
    { value: 'Sports', label: 'Sports' },
    { value: 'Arts', label: 'Arts' },
    { value: 'Other', label: 'Other' },
  ];

  const onSubmit = async (data: EventFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const eventData = {
        ...data,
        organizerId: user.id,
        organizerName: user.name,
        soldTickets: 0,
        status: 'upcoming' as const,
      };
      
      const event = await createEventApi(eventData);
      navigate(`/organizer/events/edit/${event.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create New Event</h1>
        <Button
          variant="outline"
          onClick={() => navigate('/organizer/events')}
        >
          Cancel
        </Button>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Basic Information</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Event Title"
              error={errors.title?.message}
              {...register('title', { 
                required: 'Title is required',
                minLength: {
                  value: 3,
                  message: 'Title must be at least 3 characters'
                }
              })}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                className={`
                  block w-full rounded-md shadow-sm px-4 py-2
                  ${errors.description ? 'border-error-500 focus:ring-error-500 focus:border-error-500' : 
                    'border-gray-300 focus:ring-primary-500 focus:border-primary-500'}
                `}
                rows={4}
                {...register('description', {
                  required: 'Description is required',
                  minLength: {
                    value: 20,
                    message: 'Description must be at least 20 characters'
                  }
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
              )}
            </div>
            
            <Input
              label="Banner Image URL"
              icon={<ImageIcon size={18} />}
              placeholder="https://example.com/image.jpg"
              error={errors.bannerImage?.message}
              {...register('bannerImage', {
                pattern: {
                  value: /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i,
                  message: 'Must be a valid image URL'
                }
              })}
            />
            
            <Select
              label="Category"
              options={categories}
              error={errors.category?.message}
              {...register('category', { required: 'Category is required' })}
            />
          </CardContent>
        </Card>
        
        {/* Date and Location */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Date and Location</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Event Date"
                icon={<Calendar size={18} />}
                min={new Date().toISOString().split('T')[0]}
                error={errors.date?.message}
                {...register('date', { required: 'Date is required' })}
              />
              
              <Input
                type="time"
                label="Event Time"
                icon={<Clock size={18} />}
                error={errors.time?.message}
                {...register('time', { required: 'Time is required' })}
              />
            </div>
            
            <Input
              label="Location"
              icon={<MapPin size={18} />}
              placeholder="Venue name and address"
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
            />
          </CardContent>
        </Card>
        
        {/* Tickets and Pricing */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Tickets and Pricing</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Ticket Price ($)"
                icon={<DollarSign size={18} />}
                min="0"
                step="0.01"
                error={errors.price?.message}
                {...register('price', {
                  required: 'Price is required',
                  min: {
                    value: 0,
                    message: 'Price cannot be negative'
                  },
                  valueAsNumber: true
                })}
              />
              
              <Input
                type="number"
                label="Maximum Tickets"
                icon={<Users size={18} />}
                min="1"
                error={errors.maxTickets?.message}
                {...register('maxTickets', {
                  required: 'Maximum tickets is required',
                  min: {
                    value: 1,
                    message: 'Must have at least 1 ticket'
                  },
                  valueAsNumber: true
                })}
              />
            </div>
            
            {/* Preview total revenue */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Revenue Preview</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Price per ticket:</p>
                  <p className="font-semibold">${watch('price') || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Maximum revenue:</p>
                  <p className="font-semibold">
                    ${((watch('price') || 0) * (watch('maxTickets') || 0)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Submit Button */}
        <Card>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <FileText size={16} className="inline-block mr-1" />
                All fields marked with an asterisk (*) are required
              </div>
              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full md:w-auto"
              >
                Create Event
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default CreateEvent;