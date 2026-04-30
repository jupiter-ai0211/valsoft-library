import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import BookForm from '../components/BookForm';
import ProtectedRoute from '../components/ProtectedRoute';
import { CreateBookInput } from '../types/book';
import { bookService } from '../services/bookService';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';

export default function NewBook() {
  const navigate = useNavigate();
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (data: CreateBookInput) => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      await bookService.createBook(data, user.id);
      navigate('/books');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create book';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Check authorization
  const isAuthorized = user?.id && profile?.role && ['admin', 'librarian'].includes(profile.role);

  if (!isAuthorized) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">You don't have permission to add books</p>
            <button
              onClick={() => navigate('/books')}
              className="mt-4 text-blue-600 hover:text-blue-700"
            >
              Back to catalog
            </button>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Add New Book</h1>
            <p className="text-gray-600 mt-2">Add a book to the library catalog</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <BookForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/books')}
            isLoading={loading}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
