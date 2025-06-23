import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Calendar, DollarSign, Ticket, AlertCircle } from 'lucide-react';
import Card, { CardContent, CardHeader } from '../../components/common/Card';
import Select from '../../components/common/Select';

interface AnalyticsData {
  revenue: {
    daily: { date: string; amount: number }[];
    monthly: { month: string; amount: number }[];
    total: number;
  };
  users: {
    total: number;
    new: number;
    active: number;
    byRole: { role: string; count: number }[];
  };
  events: {
    total: number;
    active: number;
    upcoming: number;
    byCategory: { category: string; count: number }[];
  };
  tickets: {
    sold: number;
    revenue: number;
    byType: { type: string; count: number; revenue: number }[];
  };
}

const mockAnalytics: AnalyticsData = {
  revenue: {
    daily: [
      { date: '2024-01-01', amount: 1200 },
      { date: '2024-01-02', amount: 1800 },
      { date: '2024-01-03', amount: 1500 },
      { date: '2024-01-04', amount: 2200 },
      { date: '2024-01-05', amount: 2800 },
      { date: '2024-01-06', amount: 2100 },
      { date: '2024-01-07', amount: 1900 },
    ],
    monthly: [
      { month: 'Jan', amount: 45000 },
      { month: 'Feb', amount: 52000 },
      { month: 'Mar', amount: 48000 },
      { month: 'Apr', amount: 61000 },
      { month: 'May', amount: 55000 },
      { month: 'Jun', amount: 67000 },
    ],
    total: 328000,
  },
  users: {
    total: 5000,
    new: 120,
    active: 3200,
    byRole: [
      { role: 'Attendee', count: 4500 },
      { role: 'Organizer', count: 450 },
      { role: 'Admin', count: 50 },
    ],
  },
  events: {
    total: 250,
    active: 120,
    upcoming: 80,
    byCategory: [
      { category: 'Music', count: 80 },
      { category: 'Tech', count: 60 },
      { category: 'Sports', count: 40 },
      { category: 'Arts', count: 35 },
      { category: 'Food', count: 35 },
    ],
  },
  tickets: {
    sold: 12500,
    revenue: 328000,
    byType: [
      { type: 'VIP', count: 2000, revenue: 120000 },
      { type: 'Regular', count: 8000, revenue: 160000 },
      { type: 'Early Bird', count: 2500, revenue: 48000 },
    ],
  },
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // In a real app, we would call an API with the timeRange
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(mockAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="text-center py-8 text-error-600">
        <AlertCircle className="w-12 h-12 mx-auto text-error-500 mb-2" />
        <h3 className="text-lg font-medium mb-1">Error</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!analyticsData || isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <Select
          options={[
            { value: '7d', label: 'Last 7 Days' },
            { value: '30d', label: 'Last 30 Days' },
            { value: '90d', label: 'Last 90 Days' },
            { value: '1y', label: 'Last Year' },
          ]}
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="w-48"
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="w-12 h-12 text-primary-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {formatCurrency(analyticsData.revenue.total)}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="w-12 h-12 text-success-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {analyticsData.users.total.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Calendar className="w-12 h-12 text-warning-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {analyticsData.events.active.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Ticket className="w-12 h-12 text-error-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tickets Sold</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {analyticsData.tickets.sold.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Revenue Over Time</h2>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={analyticsData.revenue.daily}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="Revenue"
                  stroke="#0088FE"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Event Categories */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Events by Category</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.events.byCategory}
                    dataKey="count"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {analyticsData.events.byCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Sales */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Ticket Sales by Type</h2>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.tickets.byType}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar
                    yAxisId="left"
                    dataKey="count"
                    name="Tickets Sold"
                    fill="#0088FE"
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="revenue"
                    name="Revenue"
                    fill="#00C49F"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">User Statistics</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">New Users (This Period)</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.users.new.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.users.active.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">User Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {((analyticsData.users.active / analyticsData.users.total) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Event Statistics</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.events.total.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.events.active.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Upcoming Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.events.upcoming.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Ticket Statistics</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Tickets Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData.tickets.sold.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Revenue per Ticket</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.tickets.revenue / analyticsData.tickets.sold)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analyticsData.tickets.revenue)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;