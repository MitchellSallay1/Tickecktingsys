import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Auth Pages
import Login from './pages/auth/Login';
import UserLogin from './pages/auth/UserLogin';
import OrganizerLogin from './pages/auth/OrganizerLogin';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import EventDetails from './pages/EventDetails';

// Protected Pages - Admin
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminEvents from './pages/admin/Events';
import AdminAnalytics from './pages/admin/Analytics';
import AdminPayments from './pages/admin/Payments';

// Protected Pages - Organizer
import OrganizerDashboard from './pages/organizer/Dashboard';
import OrganizerEvents from './pages/organizer/Events';
import OrganizerAnalytics from './pages/organizer/Analytics';

// Protected Pages - User
import UserDashboard from './pages/user/Dashboard';
import UserTickets from './pages/user/Tickets';
import UserProfile from './pages/user/Profile';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import OrganizerLayout from './layouts/OrganizerLayout';
import UserLayout from './layouts/UserLayout';

// Context
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events/:id" element={<EventDetails />} />

          {/* Auth Routes */}
          <Route path="/auth">
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<Login />} />
            <Route path="user/login" element={<UserLogin />} />
            <Route path="organizer/login" element={<OrganizerLogin />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="payments" element={<AdminPayments />} />
          </Route>

          {/* Protected Organizer Routes */}
          <Route
            path="/organizer"
            element={
              <ProtectedRoute allowedRoles={['organizer']}>
                <OrganizerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/organizer/dashboard" replace />} />
            <Route path="dashboard" element={<OrganizerDashboard />} />
            <Route path="events" element={<OrganizerEvents />} />
            <Route path="analytics" element={<OrganizerAnalytics />} />
          </Route>

          {/* Protected User Routes */}
          <Route
            path="/user"
            element={
              <ProtectedRoute allowedRoles={['user']}>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/user/dashboard" replace />} />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="tickets" element={<UserTickets />} />
            <Route path="profile" element={<UserProfile />} />
          </Route>

          {/* Catch all - 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <ToastContainer position="top-right" />
    </AuthProvider>
  );
};

export default App;