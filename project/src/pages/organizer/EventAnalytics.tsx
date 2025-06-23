import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Download,
  Filter,
  Clock,
} from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { toast } from 'react-toastify';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsData {
  totalSales: number;
  totalTickets: number;
  averageTicketPrice: number;
  ticketsSoldByType: {
    [key: string]: number;
  };
  salesByDate: {
    date: string;
    amount: number;
  }[];
  attendeesByLocation: {
    location: string;
    count: number;
  }[];
  ticketsSoldByTimeOfDay: {
    hour: number;
    count: number;
  }[];
  refundRate: number;
  conversionRate: number;
}

const mockAnalytics: AnalyticsData = {
  totalSales: 45750.25,
  totalTickets: 295,
  averageTicketPrice: 155.08,
  ticketsSoldByType: {
    'Early Bird': 75,
    'Regular': 200,
    'VIP': 20,
  },
  salesByDate: [
    { date: '2024-01-01', amount: 5000 },
    { date: '2024-01-02', amount: 7500 },
    { date: '2024-01-03', amount: 6000 },
    { date: '2024-01-04', amount: 8500 },
    { date: '2024-01-05', amount: 9000 },
    { date: '2024-01-06', amount: 4750 },
    { date: '2024-01-07', amount: 5000 },
  ],
  attendeesByLocation: [
    { location: 'New York', count: 100 },
    { location: 'Los Angeles', count: 75 },
    { location: 'Chicago', count: 50 },
    { location: 'Other', count: 70 },
  ],
  ticketsSoldByTimeOfDay: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    count: Math.floor(Math.random() * 20),
  })),
  refundRate: 2.5,
  conversionRate: 15.8,
};

const EventAnalytics: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: '',
    end: '',
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // In a real app, we would call an API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAnalytics(mockAnalytics);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [eventId, dateRange]);

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    try {
      // In a real app, we would call an API to generate and download the report
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Report exported as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (isLoading || !analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-12 h-12 border-t-4 border-primary-600 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  const salesChartData = {
    labels: analytics.salesByDate.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Sales',
        data: analytics.salesByDate.map(d => d.amount),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  const ticketTypeChartData = {
    labels: Object.keys(analytics.ticketsSoldByType),
    datasets: [
      {
        data: Object.values(analytics.ticketsSoldByType),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(16, 185, 129)',
        ],
      },
    ],
  };

  const locationChartData = {
    labels: analytics.attendeesByLocation.map(l => l.location),
    datasets: [
      {
        data: analytics.attendeesByLocation.map(l => l.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(249, 115, 22, 0.7)',
        ],
      },
    ],
  };

  const timeOfDayChartData = {
    labels: analytics.ticketsSoldByTimeOfDay.map(t => `${t.hour}:00`),
    datasets: [
      {
        label: 'Tickets Sold',
        data: analytics.ticketsSoldByTimeOfDay.map(t => t.count),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Event Analytics
        </h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
          >
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
          >
            <Download size={16} className="mr-2" />
            Export Excel
          </Button>
          <Button onClick={() => handleExport('pdf')}>
            <Download size={16} className="mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card className="mb-8">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              type="date"
              label="Start Date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="flex-1"
            />
            <Input
              type="date"
              label="End Date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="flex-1"
            />
            <div className="flex items-end">
              <Button>
                <Filter size={16} className="mr-2" />
                Apply Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="text-center">
            <DollarSign className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics.totalSales)}
            </h3>
            <p className="text-gray-600">Total Sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <Users className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {analytics.totalTickets}
            </h3>
            <p className="text-gray-600">Tickets Sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <TrendingUp className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {analytics.conversionRate}%
            </h3>
            <p className="text-gray-600">Conversion Rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="text-center">
            <BarChart3 className="w-8 h-8 text-primary-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900">
              {formatCurrency(analytics.averageTicketPrice)}
            </h3>
            <p className="text-gray-600">Average Ticket Price</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Sales Over Time</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={salesChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: value => formatCurrency(Number(value)),
                      },
                    },
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Tickets by Type</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie
                data={ticketTypeChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Attendees by Location</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Pie
                data={locationChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Sales by Time of Day</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <Line
                data={timeOfDayChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
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

export default EventAnalytics; 