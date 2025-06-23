import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Ticket,
  DollarSign,
  LineChart,
  Settings,
} from 'lucide-react';

const AdminNavigation: React.FC = () => {
  const navItems = [
    { path: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { path: '/admin/events', icon: <CalendarDays size={20} />, label: 'Events' },
    { path: '/admin/tickets', icon: <Ticket size={20} />, label: 'Tickets' },
    { path: '/admin/payments', icon: <DollarSign size={20} />, label: 'Payments' },
    { path: '/admin/analytics', icon: <LineChart size={20} />, label: 'Analytics' },
    { path: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/admin'}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary-100 text-primary-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <span className="mr-3">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default AdminNavigation; 