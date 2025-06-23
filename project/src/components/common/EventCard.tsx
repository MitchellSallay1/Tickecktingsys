import React from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { Event } from '../../types';
import Card from './Card';

interface EventCardProps {
  event: Event;
  showActions?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({ event, showActions = true }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/event/${event.id}`);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-primary-100 text-primary-800';
      case 'ongoing':
        return 'bg-success-100 text-success-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-error-100 text-error-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card hover className="overflow-hidden flex flex-col h-full" onClick={handleClick}>
      <div className="relative">
        <img 
          src={event.bannerImage || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'} 
          alt={event.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadgeClass(event.status)}`}>
            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
          </span>
        </div>
      </div>
      
      <div className="p-4 flex-grow">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
        
        <div className="space-y-2 text-sm text-gray-600 mb-4">
          <div className="flex items-center">
            <Calendar size={16} className="mr-2 text-gray-400" />
            <span>{formatDate(event.date)}</span>
          </div>
          
          <div className="flex items-center">
            <Clock size={16} className="mr-2 text-gray-400" />
            <span>{event.time}</span>
          </div>
          
          <div className="flex items-center">
            <MapPin size={16} className="mr-2 text-gray-400" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          
          <div className="flex items-center">
            <Users size={16} className="mr-2 text-gray-400" />
            <span>{event.soldTickets} / {event.maxTickets} tickets sold</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-4">
          <span className="font-bold text-lg">
            ${event.price.toFixed(2)}
          </span>
          
          {showActions && event.status === 'upcoming' && (
            <button 
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/event/${event.id}`);
              }}
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;