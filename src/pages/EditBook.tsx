import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import BookForm from '../components/BookForm';
import ProtectedRoute from '../components/ProtectedRoute';
import { CreateBookInput, Book } from '../types/book';
import { bookService } from '../services/bookService';
import { useAuthStore } from '../store/authStore';

export default function EditBook() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      if (!id) return;

      try {
        const data = await bookService.getBookById(id);
        setBook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load book');
      } finally {
        setLoading(false);
      }
    };

    loadBook();
  }, [id]);

  const handleSubmit = async (data: CreateBookInput) => {
    if (!id) return;

    setSubmitting(true);
    setError('');

    try {
      await bookService.updateBook(id, data);
      navigate('/books');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update book';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading book...</p>
        </div>
      </AppLayout>
    );
  }

  if (!book) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Book not found</h2>
          <button
            onClick={() => navigate('/books')}
            className="mt-4 text-blue-600 hover:text-blue-700"
          >
            Back to catalog
          </button>
        </div>
      </AppLayout>
    );
  }

  const { profile } = useAuthStore();

  // Check authorization
  const isAuthorized = profile?.role && ['admin', 'librarian'].includes(profile.role);

  if (!isAuthorized) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 text-red-600">Access Denied</h2>
            <p className="text-gray-600 mt-2">You don't have permission to edit books</p>
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
            <h1 className="text-4xl font-bold text-gray-900">Edit Book</h1>
            <p className="text-gray-600 mt-2">Update book details</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <BookForm
            initialData={book}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/books')}
            isLoading={submitting}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
