import React from 'react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import OrganizerLayout from '../layouts/OrganizerLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import EventDetails from '../pages/public/EventDetails';
import DemoQRScanner from '../pages/DemoQRScanner';

// Auth Pages
import Login from '../pages/auth/Login';
import AdminLogin from '../pages/auth/AdminLogin';
import OrganizerLogin from '../pages/auth/OrganizerLogin';
import UserLogin from '../pages/auth/UserLogin';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// User Pages
import UserDashboard from '../pages/user/Dashboard';
import UserTickets from '../pages/user/Tickets';
import UserProfile from '../pages/user/Profile';

// Organizer Pages
import OrganizerDashboard from '../pages/organizer/Dashboard';
import OrganizerEvents from '../pages/organizer/Events';
import OrganizerAnalytics from '../pages/organizer/Analytics';
import CreateEvent from '../pages/organizer/CreateEvent';
import Tickets from '../pages/organizer/Tickets';
import CheckIn from '../pages/organizer/CheckIn';

// Admin Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminEvents from '../pages/admin/Events';
import AdminTickets from '../pages/admin/Tickets';
import AdminPayments from '../pages/admin/Payments';
import AdminSettings from '../pages/admin/Settings';
import AdminAnalytics from '../pages/admin/Analytics';
import AdminProfile from '../pages/admin/Profile';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // Public Routes
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'contact',
        element: <Contact />,
      },
      {
        path: 'event/:id',
        element: <EventDetails />,
      },
      {
        path: 'demo/qr-scanner',
        element: <DemoQRScanner />,
      },

      // Auth Routes
      {
        path: 'auth',
        children: [
          {
            path: 'login',
            element: <Login />,
          },
          {
            path: 'admin/login',
            element: <AdminLogin />,
          },
          {
            path: 'organizer/login',
            element: <OrganizerLogin />,
          },
          {
            path: 'user/login',
            element: <UserLogin />,
          },
          {
            path: 'register',
            element: <Register />,
          },
          {
            path: 'forgot-password',
            element: <ForgotPassword />,
          },
          {
            path: 'reset-password/:token',
            element: <ResetPassword />,
          },
        ],
      },

      // Admin Routes
      {
        path: 'admin',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: 'dashboard',
            element: <AdminDashboard />,
          },
          {
            path: 'users',
            element: <AdminUsers />,
          },
          {
            path: 'events',
            element: <AdminEvents />,
          },
          {
            path: 'tickets',
            element: <AdminTickets />,
          },
          {
            path: 'payments',
            element: <AdminPayments />,
          },
          {
            path: 'settings',
            element: <AdminSettings />,
          },
          {
            path: 'analytics',
            element: <AdminAnalytics />,
          },
          {
            path: 'profile',
            element: <AdminProfile />,
          },
        ],
      },

      // User Routes
      {
        path: 'user',
        element: (
          <ProtectedRoute allowedRoles={['user']}>
            <div className="min-h-screen bg-gray-100">
              <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <Outlet />
              </div>
            </div>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <UserDashboard />,
          },
          {
            path: 'dashboard',
            element: <UserDashboard />,
          },
          {
            path: 'tickets',
            element: <UserTickets />,
          },
          {
            path: 'profile',
            element: <UserProfile />,
          },
        ],
      },

      // Organizer Routes
      {
        path: 'organizer',
        element: (
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <OrganizerDashboard />,
          },
          {
            path: 'dashboard',
            element: <OrganizerDashboard />,
          },
          {
            path: 'events',
            element: <OrganizerEvents />,
          },
          {
            path: 'events/create',
            element: <CreateEvent />,
          },
          {
            path: 'events/edit/:id',
            element: <CreateEvent />,
          },
          {
            path: 'tickets/:eventId',
            element: <Tickets />,
          },
          {
            path: 'checkin/:eventId',
            element: <CheckIn />,
          },
          {
            path: 'analytics',
            element: <OrganizerAnalytics />,
          },
        ],
      },
    ],
  },
]);

const Routes: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default Routes; 