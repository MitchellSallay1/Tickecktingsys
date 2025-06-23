import api from './api';
import { Event, FilterParams, PaginatedResponse } from '../types';

// Mock data for development
const MOCK_API = true;

// Mock events data
const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Tech Conference 2025',
    description: 'Join us for the largest tech conference in the region, featuring speakers from leading technology companies.',
    bannerImage: 'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg',
    organizerId: '1',
    organizerName: 'Tech Events Inc',
    date: '2025-06-15',
    time: '09:00 AM - 06:00 PM',
    location: 'Convention Center, San Francisco',
    price: 299.99,
    maxTickets: 1000,
    soldTickets: 645,
    status: 'upcoming',
    category: 'Technology',
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z'
  },
  {
    id: '2',
    title: 'Summer Music Festival',
    description: 'A three-day music festival featuring top artists from around the world, with food, camping, and more.',
    bannerImage: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg',
    organizerId: '2',
    organizerName: 'Festival Productions',
    date: '2025-07-24',
    time: '12:00 PM - 11:00 PM',
    location: 'Central Park, New York',
    price: 149.50,
    maxTickets: 5000,
    soldTickets: 3210,
    status: 'upcoming',
    category: 'Music',
    createdAt: '2024-02-10T10:15:00Z',
    updatedAt: '2024-02-10T10:15:00Z'
  },
  {
    id: '3',
    title: 'Startup Pitch Competition',
    description: 'Watch innovative startups pitch their ideas to venture capitalists and angel investors.',
    bannerImage: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg',
    organizerId: '1',
    organizerName: 'Tech Events Inc',
    date: '2025-05-22',
    time: '02:00 PM - 08:00 PM',
    location: 'Innovation Hub, Austin',
    price: 75.00,
    maxTickets: 300,
    soldTickets: 186,
    status: 'upcoming',
    category: 'Business',
    createdAt: '2024-03-05T14:30:00Z',
    updatedAt: '2024-03-05T14:30:00Z'
  },
  {
    id: '4',
    title: 'Food & Wine Festival',
    description: 'Sample delicious cuisine and fine wines from acclaimed chefs and vineyards.',
    bannerImage: 'https://images.pexels.com/photos/5638732/pexels-photo-5638732.jpeg',
    organizerId: '3',
    organizerName: 'Culinary Events Co',
    date: '2025-08-08',
    time: '11:00 AM - 07:00 PM',
    location: 'Waterfront Park, Chicago',
    price: 120.00,
    maxTickets: 1500,
    soldTickets: 987,
    status: 'upcoming',
    category: 'Food & Drink',
    createdAt: '2024-04-12T09:45:00Z',
    updatedAt: '2024-04-12T09:45:00Z'
  },
  {
    id: '5',
    title: 'Digital Marketing Workshop',
    description: 'Learn the latest digital marketing strategies from industry experts in this hands-on workshop.',
    bannerImage: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg',
    organizerId: '4',
    organizerName: 'Marketing Pros',
    date: '2025-06-05',
    time: '10:00 AM - 04:00 PM',
    location: 'Business Center, Miami',
    price: 199.00,
    maxTickets: 100,
    soldTickets: 78,
    status: 'upcoming',
    category: 'Education',
    createdAt: '2024-05-01T11:20:00Z',
    updatedAt: '2024-05-01T11:20:00Z'
  },
  {
    id: '6',
    title: 'Charity Gala Dinner',
    description: 'An elegant evening of fine dining and entertainment to raise funds for education initiatives.',
    bannerImage: 'https://images.pexels.com/photos/587741/pexels-photo-587741.jpeg',
    organizerId: '5',
    organizerName: 'Hope Foundation',
    date: '2025-09-18',
    time: '07:00 PM - 11:00 PM',
    location: 'Grand Hotel, Los Angeles',
    price: 350.00,
    maxTickets: 200,
    soldTickets: 124,
    status: 'upcoming',
    category: 'Charity',
    createdAt: '2024-06-15T15:10:00Z',
    updatedAt: '2024-06-15T15:10:00Z'
  }
];

export const getEventsApi = async (params?: FilterParams): Promise<PaginatedResponse<Event>> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredEvents = [...mockEvents];
    
    // Apply filters if provided
    if (params) {
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredEvents = filteredEvents.filter(event => 
          event.title.toLowerCase().includes(searchLower) || 
          event.description.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.category) {
        filteredEvents = filteredEvents.filter(event => 
          event.category === params.category
        );
      }
      
      if (params.status) {
        filteredEvents = filteredEvents.filter(event => 
          event.status === params.status
        );
      }
    }
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    return {
      data: paginatedEvents,
      total: filteredEvents.length,
      page,
      limit,
      totalPages: Math.ceil(filteredEvents.length / limit)
    };
  }
  
  const response = await api.get<PaginatedResponse<Event>>('/events', { params });
  return response.data;
};

export const getEventByIdApi = async (id: string): Promise<Event> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const event = mockEvents.find(e => e.id === id);
    if (!event) {
      throw new Error('Event not found');
    }
    
    return event;
  }
  
  const response = await api.get<Event>(`/events/${id}`);
  return response.data;
};

export const getOrganizerEventsApi = async (
  organizerId: string,
  params?: FilterParams
): Promise<PaginatedResponse<Event>> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const organizerEvents = mockEvents.filter(event => event.organizerId === organizerId);
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEvents = organizerEvents.slice(startIndex, endIndex);
    
    return {
      data: paginatedEvents,
      total: organizerEvents.length,
      page,
      limit,
      totalPages: Math.ceil(organizerEvents.length / limit)
    };
  }
  
  const response = await api.get<PaginatedResponse<Event>>(`/organizers/${organizerId}/events`, { params });
  return response.data;
};

export const createEventApi = async (eventData: Partial<Event>): Promise<Event> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newEvent: Event = {
      id: String(mockEvents.length + 1),
      title: eventData.title || 'New Event',
      description: eventData.description || 'No description provided',
      bannerImage: eventData.bannerImage || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
      organizerId: eventData.organizerId || '1',
      organizerName: eventData.organizerName || 'Event Organizer',
      date: eventData.date || new Date().toISOString().split('T')[0],
      time: eventData.time || '10:00 AM - 04:00 PM',
      location: eventData.location || 'Event Location',
      price: eventData.price || 0,
      maxTickets: eventData.maxTickets || 100,
      soldTickets: 0,
      status: 'upcoming',
      category: eventData.category || 'Other',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // In a real app, we would add this to the database
    // For mock purposes, we'll just return the new event
    return newEvent;
  }
  
  const response = await api.post<Event>('/events', eventData);
  return response.data;
};

export const updateEventApi = async (
  id: string,
  eventData: Partial<Event>
): Promise<Event> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const eventIndex = mockEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    // In a real app, we would update the database
    // For mock purposes, we'll just return an updated event
    const updatedEvent: Event = {
      ...mockEvents[eventIndex],
      ...eventData,
      updatedAt: new Date().toISOString()
    };
    
    return updatedEvent;
  }
  
  const response = await api.put<Event>(`/events/${id}`, eventData);
  return response.data;
};

export const deleteEventApi = async (id: string): Promise<void> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const eventIndex = mockEvents.findIndex(e => e.id === id);
    if (eventIndex === -1) {
      throw new Error('Event not found');
    }
    
    // In a real app, we would remove from the database
    // For mock purposes, we'll just return
    return;
  }
  
  await api.delete(`/events/${id}`);
};