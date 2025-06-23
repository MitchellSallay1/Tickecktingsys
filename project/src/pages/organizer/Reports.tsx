import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getOrganizerEventsApi } from '../../services/eventService';
import { Event } from '../../types';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Reports: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      
      try {
        const response = await getOrganizerEventsApi(user.id);
        setEvents(response.data);
      } catch (error) {
        console.error('Error fetching events:', error);
        setError('Failed to load event data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const calculateTotalRevenue = () => {
    return events.reduce((total, event) => total + (event.price * event.soldTickets), 0);
  };

  const calculateAverageTicketPrice = () => {
    if (events.length === 0) return 0;
    return events.reduce((total, event) => total + event.price, 0) / events.length;
  };

  const calculateTotalTicketsSold = () => {
    return events.reduce((total, event) => total + event.soldTickets, 0);
  };

  const calculateTicketSalesByEvent = () => {
    const labels = events.map(event => event.title);
    const data = events.map(event => event.soldTickets);
    
    return {
      labels,
      datasets: [
        {
          label: 'Tickets Sold',
          data,
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const calculateRevenueByEvent = () => {
    const labels = events.map(event => event.title);
    const data = events.map(event => event.price * event.soldTickets);
    
    return {
      labels,
      datasets: [
        {
          label: 'Revenue ($)',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const calculateEventsByCategory = () => {
    const categoryCount = events.reduce((acc, event) => {
      acc[event.category] = (acc[event.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      labels: Object.keys(categoryCount),
      datasets: [
        {
          data: Object.values(categoryCount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-error-600">
        <h3 className="text-lg font-medium mb-1">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Event Reports</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold text-primary-600">
              ${calculateTotalRevenue().toFixed(2)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Average Ticket Price</h3>
            <p className="text-3xl font-bold text-primary-600">
              ${calculateAverageTicketPrice().toFixed(2)}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Tickets Sold</h3>
            <p className="text-3xl font-bold text-primary-600">
              {calculateTotalTicketsSold()}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Sales by Event */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Ticket Sales by Event</h2>
          </CardHeader>
          <CardContent className="p-6">
            <Bar
              data={calculateTicketSalesByEvent()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
        
        {/* Revenue by Event */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Revenue by Event</h2>
          </CardHeader>
          <CardContent className="p-6">
            <Bar
              data={calculateRevenueByEvent()}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </CardContent>
        </Card>
        
        {/* Events by Category */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Events by Category</h2>
          </CardHeader>
          <CardContent className="p-6">
            <div className="w-full max-w-md mx-auto">
              <Pie
                data={calculateEventsByCategory()}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom' as const,
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports; 