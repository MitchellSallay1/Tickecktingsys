import React from 'react';
import { Users, Calendar, Ticket, CreditCard, BarChart2, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const cards = [
    {
      title: 'Users',
      icon: Users,
      value: '1,234',
      link: '/admin/users',
      color: 'bg-blue-500',
    },
    {
      title: 'Events',
      icon: Calendar,
      value: '56',
      link: '/admin/events',
      color: 'bg-green-500',
    },
    {
      title: 'Tickets',
      icon: Ticket,
      value: '2,345',
      link: '/admin/tickets',
      color: 'bg-purple-500',
    },
    {
      title: 'Revenue',
      icon: CreditCard,
      value: '$12,345',
      link: '/admin/payments',
      color: 'bg-yellow-500',
    },
    {
      title: 'Analytics',
      icon: BarChart2,
      value: 'View',
      link: '/admin/analytics',
      color: 'bg-red-500',
    },
    {
      title: 'Settings',
      icon: Settings,
      value: 'Manage',
      link: '/admin/settings',
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back, {user?.name}!</h1>
        <p className="mt-1 text-sm text-gray-600">Here's what's happening with your platform today.</p>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="py-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
              >
                <div className="p-5">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 p-3 rounded-md ${card.color}`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{card.title}</dt>
                        <dd className="text-lg font-semibold text-gray-900">{card.value}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;