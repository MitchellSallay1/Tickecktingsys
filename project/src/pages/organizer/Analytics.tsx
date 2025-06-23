import React from 'react';
import { BarChart2, TrendingUp, Users, Ticket } from 'lucide-react';
import Card, { CardContent } from '../../components/common/Card';

const OrganizerAnalytics: React.FC = () => {
  // Mock data for analytics
  const stats = [
    {
      name: 'Total Events',
      value: '12',
      change: '+20%',
      trend: 'up',
      icon: BarChart2,
    },
    {
      name: 'Total Attendees',
      value: '1,234',
      change: '+15%',
      trend: 'up',
      icon: Users,
    },
    {
      name: 'Tickets Sold',
      value: '2,345',
      change: '+25%',
      trend: 'up',
      icon: Ticket,
    },
    {
      name: 'Revenue',
      value: '$12,345',
      change: '+30%',
      trend: 'up',
      icon: TrendingUp,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Overview</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your event performance and metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center">
                    <stat.icon className="h-6 w-6 text-primary-600" />
                    <h3 className="ml-2 text-sm font-medium text-gray-900">{stat.name}</h3>
                  </div>
                  <div className="mt-4">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <p className="mt-1 text-sm text-green-600">{stat.change} from last month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Ticket Sales Chart */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900">Ticket Sales</h3>
            <div className="mt-4 h-64 bg-gray-50 flex items-center justify-center">
              <p className="text-gray-500">Chart will be implemented here</p>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Chart */}
        <Card>
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900">Revenue</h3>
            <div className="mt-4 h-64 bg-gray-50 flex items-center justify-center">
              <p className="text-gray-500">Chart will be implemented here</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event Performance */}
      <div className="mt-8">
        <Card>
          <CardContent>
            <h3 className="text-lg font-medium text-gray-900">Event Performance</h3>
            <div className="mt-4">
              <div className="flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Event Name
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
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Tech Conference 2024
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              450/500
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              $45,000
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrganizerAnalytics; 