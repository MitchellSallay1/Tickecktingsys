import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Search, Filter, Calendar, MapPin, Users, AlertCircle, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrganizerEventsApi, deleteEventApi } from '../../services/eventService';
import { Event, FilterParams } from '../../types';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';

const Events: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterParams>({
    search: '',
    status: '',
    page: 1,
    limit: 10,
  });
  
  const [totalPages, setTotalPages] = useState(1);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  useEffect(() => {
    fetchEvents();
  }, [filters.page, filters.status]);

  const fetchEvents = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getOrganizerEventsApi(user.id, {
        ...filters,
        search: filters.search || undefined,
        status: filters.status || undefined,
      });
      
      setEvents(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchEvents();
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters({ ...filters, status: e.target.value, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setFilters({ ...filters, page: newPage });
    }
  };

  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteEventApi(eventToDelete.id);
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (error) {
      console.error('Error deleting event:', error);
      // Show error message
    } finally {
      setIsDeleting(false);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
        <Button 
          onClick={() => navigate('/organizer/events/create')}
          className="flex items-center"
        >
          <PlusCircle size={16} className="mr-2" /> Create Event
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
            <div className="flex-grow">
              <Input
                type="text"
                placeholder="Search events..."
                icon={<Search size={18} />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full"
              />
            </div>
            
            <div className="md:w-1/4">
              <Select
                options={statusOptions}
                value={filters.status}
                onChange={handleStatusChange}
                className="w-full"
              />
            </div>
            
            <Button type="submit">
              Search
            </Button>
          </form>
        </CardHeader>
        
        <CardContent className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-error-600">
              <AlertCircle className="w-12 h-12 mx-auto text-error-500 mb-2" />
              <h3 className="text-lg font-medium mb-1">Error</h3>
              <p>{error}</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={fetchEvents}
              >
                Try Again
              </Button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
              <p className="text-gray-500 mb-4">
                {filters.search || filters.status
                  ? 'Try adjusting your search or filter criteria'
                  : 'Start by creating your first event'}
              </p>
              {(filters.search || filters.status) ? (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setFilters({
                      search: '',
                      status: '',
                      page: 1,
                      limit: 10,
                    });
                    fetchEvents();
                  }}
                >
                  Clear Filters
                </Button>
              ) : (
                <Button onClick={() => navigate('/organizer/events/create')}>
                  Create Event
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {events.map(event => (
                <div 
                  key={event.id} 
                  className="flex flex-col md:flex-row border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="md:w-1/4 h-48 md:h-auto">
                    <img 
                      src="https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg" 
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(event.status)}`}>
                        {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="mt-2 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar size={16} className="mr-2 text-gray-400" />
                        <span>{new Date(event.startDate).toLocaleDateString()} at {new Date(event.startDate).toLocaleTimeString()}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-gray-400" />
                        <span>{event.location}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Users size={16} className="mr-2 text-gray-400" />
                        <span>{event.soldTickets} / {event.capacity} tickets sold</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/organizer/checkin/${event.id}`)}
                        className="flex items-center"
                      >
                        <QrCode size={16} className="mr-1" />
                        Check-in
                      </Button>
                      
                      <Button 
                        size="sm"
                        onClick={() => navigate(`/organizer/tickets/${event.id}`)}
                      >
                        Manage Tickets
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => navigate(`/organizer/events/edit/${event.id}`)}
                      >
                        Edit Event
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-error-600 hover:bg-error-50"
                        onClick={() => handleDeleteClick(event)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <nav className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange((filters.page || 1) - 1)}
                      disabled={(filters.page || 1) === 1}
                      className="px-3 py-1"
                    >
                      Previous
                    </Button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded-md ${
                            (filters.page || 1) === page
                              ? 'bg-primary-600 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => handlePageChange((filters.page || 1) + 1)}
                      disabled={(filters.page || 1) === totalPages}
                      className="px-3 py-1"
                    >
                      Next
                    </Button>
                  </nav>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setEventToDelete(null);
        }}
        title="Delete Event"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this event?</p>
          <p className="text-sm text-gray-500">
            This action cannot be undone. All tickets will be cancelled and refunded.
          </p>
          
          {eventToDelete && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium">{eventToDelete.title}</h4>
              <p className="text-sm text-gray-600">
                {new Date(eventToDelete.startDate).toLocaleDateString()} at {new Date(eventToDelete.startDate).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteModalOpen(false);
              setEventToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            isLoading={isDeleting}
          >
            Delete Event
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Events;