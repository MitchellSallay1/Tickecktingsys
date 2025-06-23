import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Ticket, 
  CalendarDays, 
  User, 
  Users, 
  CreditCard, 
  Settings, 
  BarChart3, 
  PlusCircle,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const userLinks = [
    { name: 'Dashboard', path: '/user/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Tickets', path: '/user/tickets', icon: <Ticket size={20} /> },
    { name: 'Profile', path: '/user/profile', icon: <User size={20} /> },
  ];

  const organizerLinks = [
    { name: 'Dashboard', path: '/organizer/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'My Events', path: '/organizer/events', icon: <CalendarDays size={20} /> },
    { name: 'Create Event', path: '/organizer/events/create', icon: <PlusCircle size={20} /> },
    { name: 'Tickets', path: '/organizer/tickets', icon: <Ticket size={20} /> },
    { name: 'Reports', path: '/organizer/reports', icon: <FileText size={20} /> },
    { name: 'Profile', path: '/organizer/profile', icon: <User size={20} /> },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Events', path: '/admin/events', icon: <CalendarDays size={20} /> },
    { name: 'Tickets', path: '/admin/tickets', icon: <Ticket size={20} /> },
    { name: 'Payments', path: '/admin/payments', icon: <CreditCard size={20} /> },
    { name: 'Analytics', path: '/admin/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    { name: 'Profile', path: '/admin/profile', icon: <User size={20} /> },
  ];

  const links = user.role === 'user' 
    ? userLinks 
    : user.role === 'organizer' 
      ? organizerLinks 
      : adminLinks;

  const sidebarClasses = `
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
    md:translate-x-0 fixed md:static inset-y-0 left-0 z-30 w-64 
    bg-white shadow-lg transition-transform duration-300 ease-in-out md:shadow-none
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" 
          onClick={onClose}
        ></div>
      )}

      <aside className={sidebarClasses}>
        <div className="h-full flex flex-col border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {links.map((link) => {
              const isActive = location.pathname === link.path || 
                (link.path !== `/${user.role}/dashboard` && location.pathname.startsWith(link.path));
                
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={onClose}
                >
                  <span className={`mr-3 ${isActive ? 'text-primary-500' : 'text-gray-400'}`}>
                    {link.icon}
                  </span>
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;