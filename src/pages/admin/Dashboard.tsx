import React, { useState } from 'react';
import { Users, Calendar, Ticket, CreditCard, BarChart2, Settings, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { toast } from 'react-toastify';

// Mock data for pending organizers
const mockPendingOrganizers: User[] = [
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'organizer',
    status: 'pending',
    joinedDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    role: 'organizer',
    status: 'pending',
    joinedDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [pendingOrganizers, setPendingOrganizers] = useState<User[]>(mockPendingOrganizers);

  const handleApproveOrganizer = (userId: string) => {
    setPendingOrganizers(prev => prev.filter(org => org.id !== userId));
    toast.success('Organizer registration approved');
  };

  const handleRejectOrganizer = (userId: string) => {
    setPendingOrganizers(prev => prev.filter(org => org.id !== userId));
    toast.success('Organizer registration rejected');
  };

  const cards = [
    {
      title: 'Pending Organizers',
      icon: Users,
      value: pendingOrganizers.length.toString(),
      link: '/admin/users',
      color: 'bg-yellow-500',
    },
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

          {/* Pending Organizer Approvals Section */}
          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">
                  Pending Organizer Approvals
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {pendingOrganizers.length} organizer{pendingOrganizers.length !== 1 ? 's' : ''} waiting for approval
                </p>
              </div>
              {pendingOrganizers.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {pendingOrganizers.map(organizer => (
                    <li key={organizer.id} className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-6 w-6 text-gray-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {organizer.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {organizer.email}
                            </div>
                            <div className="text-sm text-gray-500">
                              Registered: {new Date(organizer.joinedDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveOrganizer(organizer.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-success-600 hover:bg-success-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success-500"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectOrganizer(organizer.id)}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-error-600 hover:bg-error-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-error-500"
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center text-sm text-gray-500">
                  No pending organizer registrations at this time.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 