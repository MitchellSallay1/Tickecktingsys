import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Calendar, MapPin, Clock, DollarSign, Users, Image as ImageIcon, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createEventApi } from '../../services/eventService';
import { uploadFile } from '../../services/uploadService';
import Card, { CardContent, CardHeader, CardFooter } from '../../components/common/Card';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import FileUpload from '../../components/common/FileUpload';

interface EventFormData {
  title: string;
  description: string;
  bannerImage: string;
  bannerImageFile?: File;
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
  const [uploadError, setUploadError] = useState<string | null>(null);
  
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

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    watch,
    setValue,
    setError,
    clearErrors
  } = useForm<EventFormData>({
    defaultValues: {
      price: 0,
      maxTickets: 100,
    }
  });

  const onSubmit = async (data: EventFormData) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      let bannerImageUrl = data.bannerImage;

      // Upload banner image if a file was selected
      if (data.bannerImageFile) {
        try {
          const uploadResponse = await uploadFile(data.bannerImageFile);
          bannerImageUrl = uploadResponse.url;
        } catch (error) {
          setError('bannerImage', { 
            type: 'manual',
            message: 'Failed to upload image. Please try again.'
          });
          return;
        }
      }

      const eventData = {
        ...data,
        bannerImage: bannerImageUrl,
        organizerId: user.id,
        organizerName: user.name,
        soldTickets: 0,
        status: 'upcoming' as const,
      };
      
      const event = await createEventApi(eventData);
      navigate(`/organizer/events/edit/${event.id}`);
    } catch (error) {
      console.error('Error creating event:', error);
      // Show a general error message
      setError('root.serverError', {
        type: 'manual',
        message: 'Failed to create event. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Event</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errors.root?.serverError && (
          <div className="p-4 bg-error-50 border border-error-200 rounded-md">
            <p className="text-sm text-error-600">{errors.root.serverError.message}</p>
          </div>
        )}

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
        
        <FileUpload
          label="Banner Image"
          accept="image/*"
          previewType="image"
          error={errors.bannerImage?.message}
          value={watch('bannerImage')}
          onChange={(file, error) => {
            if (error) {
              setError('bannerImage', { 
                type: 'manual',
                message: error
              });
              return;
            }

            clearErrors('bannerImage');
            if (file) {
              setValue('bannerImageFile', file);
              // Set a temporary preview URL
              setValue('bannerImage', URL.createObjectURL(file));
            } else {
              setValue('bannerImageFile', undefined);
              setValue('bannerImage', '');
            }
          }}
        />
        
        <Select
          label="Category"
          options={categories}
          error={errors.category?.message}
          {...register('category', { required: 'Category is required' })}
        />

        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Creating Event...' : 'Create Event'}
        </Button>
      </form>
    </div>
  );
};

export default CreateEvent;