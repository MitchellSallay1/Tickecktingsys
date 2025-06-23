import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Users, DollarSign, BarChart3, ArrowRight, Ticket, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrganizerEventsApi } from '../../services/eventService';
import { Event } from '../../types';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    upcomingEvents: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const response = await getOrganizerEventsApi(user.id);
        setEvents(response.data);
        
        // Calculate stats
        const totalEvents = response.data.length;
        const totalTicketsSold = response.data.reduce((acc, event) => acc + event.soldTickets, 0);
        const totalRevenue = response.data.reduce((acc, event) => acc + (event.soldTickets * event.price), 0);
        const upcomingEvents = response.data.filter(event => event.status === 'upcoming').length;
        
        setStats({
          totalEvents,
          totalTicketsSold,
          totalRevenue,
          upcomingEvents
        });
      } catch (error) {
        console.error('Error fetching organizer data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  // Chart data for ticket sales by event
  const ticketSalesData = {
    labels: events.slice(0, 5).map(event => event.title),
    datasets: [
      {
        label: 'Tickets Sold',
        data: events.slice(0, 5).map(event => event.soldTickets),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(236, 72, 153, 0.7)',
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(249, 115, 22, 1)',
          'rgba(236, 72, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for revenue by event
  const revenueData = {
    labels: events.slice(0, 5).map(event => event.title),
    datasets: [
      {
        label: 'Revenue ($)',
        data: events.slice(0, 5).map(event => event.soldTickets * event.price),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
        <Button 
          onClick={() => navigate('/organizer/events/create')}
          className="flex items-center"
        >
          <PlusCircle size={16} className="mr-2" /> Create Event
        </Button>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Events</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalEvents}</h3>
              </div>
              <div className="bg-primary-100 p-3 rounded-full">
                <CalendarDays className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Tickets Sold</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.totalTicketsSold}</h3>
              </div>
              <div className="bg-secondary-100 p-3 rounded-full">
                <Ticket className="h-6 w-6 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">${stats.totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="bg-accent-100 p-3 rounded-full">
                <DollarSign className="h-6 w-6 text-accent-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Upcoming Events</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingEvents}</h3>
              </div>
              <div className="bg-warning-100 p-3 rounded-full">
                <Calendar className="h-6 w-6 text-warning-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Ticket Sales by Event</h2>
          </CardHeader>
          <CardContent className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No data available</h3>
                <p className="text-gray-500 mb-4">Create events to see statistics</p>
                <Button onClick={() => navigate('/organizer/events/create')}>Create Event</Button>
              </div>
            ) : (
              <div className="h-64">
                <Pie data={ticketSalesData} options={{ maintainAspectRatio: false }} />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Revenue by Event</h2>
          </CardHeader>
          <CardContent className="p-6">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No data available</h3>
                <p className="text-gray-500">Create events to see statistics</p>
              </div>
            ) : (
              <div className="h-64">
                <Bar 
                  data={revenueData} 
                  options={{ 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }} 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Events */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Events</h2>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => navigate('/organizer/events')}
            className="flex items-center"
          >
            View All <ArrowRight size={16} className="ml-1" />
          </Button>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No events created</h3>
              <p className="text-gray-500 mb-4">Start by creating your first event</p>
              <Button onClick={() => navigate('/organizer/events/create')}>Create Event</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tickets Sold
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.slice(0, 5).map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            <img 
                              className="h-10 w-10 rounded-full object-cover" 
                              src={event.bannerImage || 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg'} 
                              alt={event.title} 
                            />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {event.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.soldTickets} / {event.maxTickets}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${(event.soldTickets * event.price).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${event.status === 'upcoming' ? 'bg-primary-100 text-primary-800' : 
                            event.status === 'ongoing' ? 'bg-success-100 text-success-800' : 
                            event.status === 'completed' ? 'bg-gray-100 text-gray-800' : 
                            'bg-error-100 text-error-800'}`}
                        >
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="mr-2"
                          onClick={() => navigate(`/organizer/events/edit/${event.id}`)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/organizer/tickets/${event.id}`)}
                        >
                          Tickets
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Add missing Calendar icon component
const Calendar = ({ size = 24, className = '' }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M8 2v4"></path>
    <path d="M16 2v4"></path>
    <rect width="18" height="18" x="3" y="4" rx="2"></rect>
    <path d="M3 10h18"></path>
  </svg>
);

export default Dashboard;