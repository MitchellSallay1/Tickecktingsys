export type Role = 'user' | 'organizer' | 'admin';

export interface User {
  id: string;
  email: string;
  role: Role;
  name: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  capacity: number;
  price: number;
  category: string;
  status: 'active' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizerId: string;
  createdAt: string;
  updatedAt: string;
  soldTickets: number;
  ticketTypes: TicketType[];
}

export interface TicketType {
  name: string;
  price: number;
  quantity: number;
  description: string;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  ticketType: string;
  purchaseDate: string;
  status: 'valid' | 'used' | 'cancelled' | 'refunded';
  qrCode: string;
}

export interface Payment {
  id: string;
  ticketId: string;
  userId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  category?: string;
  status?: string;
  page?: number;
  limit?: number;
}