import api from './api';
import { Ticket, FilterParams, PaginatedResponse } from '../types';

// Mock data for development
const MOCK_API = true;

// Mock tickets data
const mockTickets: Ticket[] = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Tech Conference 2025',
    eventDate: '2025-06-15',
    eventTime: '09:00 AM - 06:00 PM',
    eventLocation: 'Convention Center, San Francisco',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '123-456-7890',
    price: 299.99,
    purchaseDate: '2024-05-10T14:30:00Z',
    status: 'paid',
    ticketNumber: 'TC2025-001234'
  },
  {
    id: '2',
    eventId: '2',
    eventTitle: 'Summer Music Festival',
    eventDate: '2025-07-24',
    eventTime: '12:00 PM - 11:00 PM',
    eventLocation: 'Central Park, New York',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '123-456-7890',
    price: 149.50,
    purchaseDate: '2024-04-22T09:15:00Z',
    status: 'paid',
    ticketNumber: 'SMF2025-002345'
  },
  {
    id: '3',
    eventId: '3',
    eventTitle: 'Startup Pitch Competition',
    eventDate: '2025-05-22',
    eventTime: '02:00 PM - 08:00 PM',
    eventLocation: 'Innovation Hub, Austin',
    userId: '1',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    userPhone: '123-456-7890',
    price: 75.00,
    purchaseDate: '2024-05-01T16:45:00Z',
    status: 'paid',
    ticketNumber: 'SPC2025-003456'
  },
  {
    id: '4',
    eventId: '4',
    eventTitle: 'Food & Wine Festival',
    eventDate: '2025-08-08',
    eventTime: '11:00 AM - 07:00 PM',
    eventLocation: 'Waterfront Park, Chicago',
    userId: '2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    userPhone: '987-654-3210',
    price: 120.00,
    purchaseDate: '2024-05-12T11:30:00Z',
    status: 'paid',
    ticketNumber: 'FWF2025-004567'
  },
  {
    id: '5',
    eventId: '1',
    eventTitle: 'Tech Conference 2025',
    eventDate: '2025-06-15',
    eventTime: '09:00 AM - 06:00 PM',
    eventLocation: 'Convention Center, San Francisco',
    userId: '2',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    userPhone: '987-654-3210',
    price: 299.99,
    purchaseDate: '2024-05-15T10:20:00Z',
    status: 'paid',
    ticketNumber: 'TC2025-005678'
  }
];

export const getUserTicketsApi = async (
  userId: string,
  params?: FilterParams
): Promise<PaginatedResponse<Ticket>> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const userTickets = mockTickets.filter(ticket => ticket.userId === userId);
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTickets = userTickets.slice(startIndex, endIndex);
    
    return {
      data: paginatedTickets,
      total: userTickets.length,
      page,
      limit,
      totalPages: Math.ceil(userTickets.length / limit)
    };
  }
  
  const response = await api.get<PaginatedResponse<Ticket>>(`/users/${userId}/tickets`, { params });
  return response.data;
};

export const getEventTicketsApi = async (
  eventId: string,
  params?: FilterParams
): Promise<PaginatedResponse<Ticket>> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const eventTickets = mockTickets.filter(ticket => ticket.eventId === eventId);
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTickets = eventTickets.slice(startIndex, endIndex);
    
    return {
      data: paginatedTickets,
      total: eventTickets.length,
      page,
      limit,
      totalPages: Math.ceil(eventTickets.length / limit)
    };
  }
  
  const response = await api.get<PaginatedResponse<Ticket>>(`/events/${eventId}/tickets`, { params });
  return response.data;
};

export const getTicketByIdApi = async (id: string): Promise<Ticket> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) {
      throw new Error('Ticket not found');
    }
    
    return ticket;
  }
  
  const response = await api.get<Ticket>(`/tickets/${id}`);
  return response.data;
};

export const purchaseTicketApi = async (
  eventId: string,
  userId: string,
  quantity: number
): Promise<Ticket[]> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For mock purposes, we'll just create a new ticket object
    // In a real app, this would handle payment processing too
    const mockTicket: Ticket = {
      id: String(mockTickets.length + 1),
      eventId,
      eventTitle: mockTickets.find(t => t.eventId === eventId)?.eventTitle || 'Event Title',
      eventDate: mockTickets.find(t => t.eventId === eventId)?.eventDate || '2025-01-01',
      eventTime: mockTickets.find(t => t.eventId === eventId)?.eventTime || '10:00 AM',
      eventLocation: mockTickets.find(t => t.eventId === eventId)?.eventLocation || 'Event Location',
      userId,
      userName: 'Current User',
      userEmail: 'user@example.com',
      price: mockTickets.find(t => t.eventId === eventId)?.price || 100,
      purchaseDate: new Date().toISOString(),
      status: 'pending',
      ticketNumber: `EVENT-${Math.floor(100000 + Math.random() * 900000)}`
    };
    
    // Create the requested quantity of tickets
    const tickets = Array(quantity).fill(null).map((_, i) => ({
      ...mockTicket,
      id: String(Number(mockTicket.id) + i),
      ticketNumber: `EVENT-${Math.floor(100000 + Math.random() * 900000)}`
    }));
    
    return tickets;
  }
  
  const response = await api.post<Ticket[]>('/tickets/purchase', { eventId, userId, quantity });
  return response.data;
};

export const validateTicketApi = async (
  ticketId: string,
  eventId: string
): Promise<{ valid: boolean; message: string }> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const ticket = mockTickets.find(t => t.id === ticketId && t.eventId === eventId);
    
    if (!ticket) {
      return { valid: false, message: 'Ticket not found for this event' };
    }
    
    if (ticket.status === 'used') {
      return { valid: false, message: 'Ticket has already been used' };
    }
    
    if (ticket.status !== 'paid') {
      return { valid: false, message: `Ticket status is ${ticket.status}` };
    }
    
    // In a real app, we would mark the ticket as used here
    return { valid: true, message: 'Ticket is valid' };
  }
  
  const response = await api.post<{ valid: boolean; message: string }>(
    `/tickets/${ticketId}/validate`,
    { eventId }
  );
  return response.data;
};

export const cancelTicketApi = async (ticketId: string): Promise<Ticket> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }
    
    // In a real app, we would update the database
    // For mock purposes, we'll just return an updated ticket
    const updatedTicket: Ticket = {
      ...mockTickets[ticketIndex],
      status: 'cancelled'
    };
    
    return updatedTicket;
  }
  
  const response = await api.put<Ticket>(`/tickets/${ticketId}/cancel`);
  return response.data;
};

export const refundTicketApi = async (ticketId: string): Promise<Ticket> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const ticketIndex = mockTickets.findIndex(t => t.id === ticketId);
    if (ticketIndex === -1) {
      throw new Error('Ticket not found');
    }
    
    // In a real app, we would update the database
    // For mock purposes, we'll just return an updated ticket
    const updatedTicket: Ticket = {
      ...mockTickets[ticketIndex],
      status: 'refunded'
    };
    
    return updatedTicket;
  }
  
  const response = await api.put<Ticket>(`/tickets/${ticketId}/refund`);
  return response.data;
};

export const getAllTicketsApi = async (
  params?: FilterParams
): Promise<PaginatedResponse<Ticket>> => {
  if (MOCK_API) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let filteredTickets = [...mockTickets];
    
    // Apply filters if provided
    if (params) {
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.eventTitle.toLowerCase().includes(searchLower) || 
          ticket.userName.toLowerCase().includes(searchLower) ||
          ticket.ticketNumber.toLowerCase().includes(searchLower)
        );
      }
      
      if (params.status) {
        filteredTickets = filteredTickets.filter(ticket => 
          ticket.status === params.status
        );
      }
    }
    
    // Pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);
    
    return {
      data: paginatedTickets,
      total: filteredTickets.length,
      page,
      limit,
      totalPages: Math.ceil(filteredTickets.length / limit)
    };
  }
  
  const response = await api.get<PaginatedResponse<Ticket>>('/tickets', { params });
  return response.data;
};