import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';

// Layouts
import PublicLayout from '@/components/layouts/PublicLayout';
import AdminLayout from '@/components/layouts/AdminLayout';

// Public Pages
import HomePage from '@/pages/public/HomePage';
import ListingsPage from '@/pages/public/ListingsPage';
import PropertyDetailsPage from '@/pages/public/PropertyDetailsPage';

// Admin Pages
import AdminLoginPage from '@/pages/admin/AdminLoginPage';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminPropertiesPage from '@/pages/admin/AdminPropertiesPage';
import AdminPropertyForm from '@/pages/admin/AdminPropertyForm';
import AdminAgentsPage from '@/pages/admin/AdminAgentsPage';
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage';
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingsPage />} />
            <Route path="/properties/:id" element={<PropertyDetailsPage />} />
          </Route>

          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="properties/new" element={<AdminPropertyForm />} />
              <Route path="properties/:id" element={<AdminPropertyForm />} />
              <Route path="agents" element={<AdminAgentsPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
              <Route path="settings" element={<AdminSettingsPage />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
