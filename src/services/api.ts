import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'organizer';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'organizer' | 'admin';
  is_active: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  max_tickets: number;
  sold_tickets: number;
  status: 'active' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  category: string;
  image_url: string;
  organizer_id: string;
  organizer?: User;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  event_id: string;
  user_id: string;
  ticket_code: string;
  qr_code: string;
  status: 'pending' | 'paid' | 'used' | 'cancelled' | 'refunded';
  price: number;
  quantity: number;
  used_at?: string;
  event?: Event;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  user_id: string;
  event_id: string;
  ticket_id: string;
  amount: number;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  payment_type: 'momo' | 'ussd';
  momo_ref?: string;
  phone_number: string;
  description: string;
  user?: User;
  event?: Event;
  ticket?: Ticket;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  date: string;
  location: string;
  price: number;
  max_tickets: number;
  category: string;
  image_url?: string;
}

export interface CreateTicketRequest {
  eventId: string;
  paymentRef: string;
}

export interface InitiatePaymentRequest {
  event_id: string;
  quantity: number;
  phone_number: string;
  payment_type: 'momo' | 'ussd';
}

export interface VerifyTicketRequest {
  code: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<{ token: string; user: User }> => {
    const response: AxiosResponse<{ message: string; token: string; user: User }> = await api.post('/login', credentials);
    return { token: response.data.token, user: response.data.user };
  },

  register: async (userData: RegisterRequest): Promise<{ token: string; user: User }> => {
    const response: AxiosResponse<{ message: string; token: string; user: User }> = await api.post('/register', userData);
    return { token: response.data.token, user: response.data.user };
  },

  getCurrentUser: async (): Promise<User> => {
    const response: AxiosResponse<{ user: User }> = await api.get('/me');
    return response.data.user;
  },

  updateProfile: async (data: { name?: string; phone?: string }): Promise<User> => {
    const response: AxiosResponse<{ message: string; user: User }> = await api.put('/me', data);
    return response.data.user;
  },
};

// Events API
export const eventsAPI = {
  getAllEvents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const response: AxiosResponse<{ events: Event[]; pagination: any }> = await api.get('/events', { params });
    return {
      data: response.data.events,
      pagination: response.data.pagination,
    };
  },

  getEventById: async (id: string): Promise<Event> => {
    const response: AxiosResponse<{ event: Event }> = await api.get(`/events/${id}`);
    return response.data.event;
  },

  createEvent: async (eventData: CreateEventRequest): Promise<Event> => {
    const response: AxiosResponse<{ message: string; event: Event }> = await api.post('/organizer/events', eventData);
    return response.data.event;
  },

  updateEvent: async (id: string, eventData: Partial<CreateEventRequest>): Promise<void> => {
    await api.put(`/organizer/events/${id}`, eventData);
  },

  deleteEvent: async (id: string): Promise<void> => {
    await api.delete(`/organizer/events/${id}`);
  },

  getOrganizerEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const response: AxiosResponse<{ events: Event[]; pagination: any }> = await api.get('/organizer/events', { params });
    return {
      data: response.data.events,
      pagination: response.data.pagination,
    };
  },
};

// Tickets API
export const ticketsAPI = {
  createTicket: async (ticketData: CreateTicketRequest): Promise<Ticket> => {
    const response: AxiosResponse<{ message: string; ticket: Ticket }> = await api.post('/tickets', ticketData);
    return response.data.ticket;
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const response: AxiosResponse<{ ticket: Ticket }> = await api.get(`/tickets/${id}`);
    return response.data.ticket;
  },

  getUserTickets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ticket>> => {
    const response: AxiosResponse<{ tickets: Ticket[]; pagination: any }> = await api.get('/user/tickets', { params });
    return {
      data: response.data.tickets,
      pagination: response.data.pagination,
    };
  },

  verifyTicket: async (verifyData: VerifyTicketRequest): Promise<{ valid: boolean; message: string; ticket?: Ticket }> => {
    const response: AxiosResponse<{ valid: boolean; message: string; ticket?: Ticket }> = await api.post('/tickets/verify', verifyData);
    return response.data;
  },

  getOrganizerEventTickets: async (eventId: string, params?: { page?: number; limit?: number; }): Promise<PaginatedResponse<Ticket>> => {
    const response: AxiosResponse<{ tickets: Ticket[]; pagination: any }> = await api.get(`/organizer/tickets/${eventId}`, { params });
    return {
      data: response.data.tickets,
      pagination: response.data.pagination,
    };
  },
};

// Payments API
export const paymentsAPI = {
  initiatePayment: async (paymentData: InitiatePaymentRequest): Promise<{ payment: Payment; momo?: any }> => {
    const response: AxiosResponse<{ message: string; payment: Payment; momo?: any }> = await api.post('/payment/initiate', paymentData);
    return { payment: response.data.payment, momo: response.data.momo };
  },

  getPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Payment>> => {
    const response: AxiosResponse<{ payments: Payment[]; pagination: any }> = await api.get('/payments', { params });
    return {
      data: response.data.payments,
      pagination: response.data.pagination,
    };
  },

  paymentCallback: async (callbackData: any): Promise<any> => {
    const response: AxiosResponse<any> = await api.post('/payment/callback', callbackData);
    return response.data;
  },
};

// USSD API
export const ussdAPI = {
  handleUSSDEntry: async (data: {
    sessionId: string;
    serviceCode: string;
    phoneNumber: string;
    text: string;
  }): Promise<{ sessionId: string; serviceCode: string; response: string }> => {
    const response: AxiosResponse<{ sessionId: string; serviceCode: string; response: string }> = await api.post('/ussd/entry', data);
    return response.data;
  },
};

// Admin API
export const adminAPI = {
  getDashboard: async (): Promise<any> => {
    const response: AxiosResponse<{ dashboard: any }> = await api.get('/admin/dashboard');
    return response.data.dashboard;
  },

  getAllUsers: async (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }): Promise<PaginatedResponse<User>> => {
    const response: AxiosResponse<{ users: User[]; pagination: any }> = await api.get('/admin/users', { params });
    return {
      data: response.data.users,
      pagination: response.data.pagination,
    };
  },

  updateUser: async (id: string, data: { role?: string; is_active: boolean }): Promise<void> => {
    await api.put(`/admin/users/${id}`, data);
  },

  getAllEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Event>> => {
    const response: AxiosResponse<{ events: Event[]; pagination: any }> = await api.get('/admin/events', { params });
    return {
      data: response.data.events,
      pagination: response.data.pagination,
    };
  },

  getAllTickets: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<Ticket>> => {
    const response: AxiosResponse<{ tickets: Ticket[]; pagination: any }> = await api.get('/admin/tickets', { params });
    return {
      data: response.data.tickets,
      pagination: response.data.pagination,
    };
  },

  getAllPayments: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    payment_type?: string;
  }): Promise<PaginatedResponse<Payment>> => {
    const response: AxiosResponse<{ payments: Payment[]; pagination: any }> = await api.get('/admin/payments', { params });
    return {
      data: response.data.payments,
      pagination: response.data.pagination,
    };
  },

  getSettings: async (): Promise<any> => {
    const response: AxiosResponse<{ settings: any }> = await api.get('/admin/settings');
    return response.data.settings;
  },

  updateSettings: async (settings: any): Promise<void> => {
    await api.put('/admin/settings', settings);
  },

  getAnalytics: async (): Promise<any> => {
    const response: AxiosResponse<{ analytics: any }> = await api.get('/admin/analytics');
    return response.data.analytics;
  },
};

// Utility functions
export const setAuthToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const removeAuthToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export default api; 