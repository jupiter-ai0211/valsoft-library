import { useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import NewBook from './pages/NewBook';
import EditBook from './pages/EditBook';
import MyLoans from './pages/MyLoans';
import AdminUsers from './pages/AdminUsers';

// Components
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { fetchCurrentUser } = useAuthStore();
  
  // Memoize to prevent dependency issues
  const initAuth = useCallback(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // Restore auth session on app load
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <Books />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/new"
          element={
            <ProtectedRoute requiredRole="librarian">
              <NewBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/books/:id/edit"
          element={
            <ProtectedRoute requiredRole="librarian">
              <EditBook />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-loans"
          element={
            <ProtectedRoute>
              <MyLoans />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminUsers />
            </ProtectedRoute>
          }
        />

        {/* Redirects */}
        <Route path="/" element={<Navigate to="/books" replace />} />
        <Route path="*" element={<Navigate to="/books" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
