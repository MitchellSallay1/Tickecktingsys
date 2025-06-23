export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'user';
  status: 'active' | 'pending' | 'inactive';
  joinedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  bannerImage: string;
  category: string;
  date: string;
  time: string;
  location: string;
  price: number;
  maxTickets: number;
  soldTickets: number;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  organizerId: string;
  organizerName: string;
  createdAt: string;
  updatedAt: string;
} 