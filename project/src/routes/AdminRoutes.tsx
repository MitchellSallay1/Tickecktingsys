import React from 'react';
import { Route, Routes } from 'react-router-dom';
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminEvents from '../pages/admin/Events';
import AdminTickets from '../pages/admin/Tickets';
import AdminSettings from '../pages/admin/Settings';
import AdminPayments from '../pages/admin/Payments';
import AdminAnalytics from '../pages/admin/Analytics';
import ProtectedRoute from '../components/common/ProtectedRoute';

const AdminRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute role="admin"><AdminEvents /></ProtectedRoute>} />
      <Route path="/tickets" element={<ProtectedRoute role="admin"><AdminTickets /></ProtectedRoute>} />
      <Route path="/payments" element={<ProtectedRoute role="admin"><AdminPayments /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute role="admin"><AdminSettings /></ProtectedRoute>} />
    </Routes>
  );
};

export default AdminRoutes; 