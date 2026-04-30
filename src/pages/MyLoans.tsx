import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import EmptyState from '../components/EmptyState';
import RecommendationCard from '../components/RecommendationCard';
import { Loan } from '../types/loan';
import { loanService } from '../services/loanService';
import { bookService } from '../services/bookService';
import { useAuthStore } from '../store/authStore';
import { getBorrowingHistoryRecommendations, Recommendation } from '../lib/recommendations';
import { showToast } from '../lib/toast';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function MyLoans() {
  const { user } = useAuthStore();
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [returnedLoans, setReturnedLoans] = useState<Loan[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowingLoading, setBorrowingLoading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'active' | 'returned'>('active');

  useEffect(() => {
    const loadLoans = async () => {
      if (!user?.id) return;

      try {
        const [active, returned] = await Promise.all([
          loanService.getUserLoans(user.id, 'active'),
          loanService.getUserLoans(user.id, 'returned'),
        ]);

        setActiveLoans(active);
        setReturnedLoans(returned);

        // Load recommendations based on borrowing history
        try {
          const [allBooks, borrowedBooks] = await Promise.all([
            bookService.getBooks(),
            loanService.getReturnedBooks(user.id),
          ]);

          if (borrowedBooks.length > 0) {
            const recs = getBorrowingHistoryRecommendations(borrowedBooks, allBooks);
            setRecommendations(recs);
          }
        } catch (recError) {
          console.error('Failed to load recommendations:', recError);
          // Recommendations are optional, so don't fail the entire load
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load loans');
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, [user?.id]);

  const handleReturn = async (loanId: string, bookId: string) => {
    try {
      await loanService.returnBook(loanId, bookId);
      setActiveLoans(activeLoans.filter(l => l.id !== loanId));
      const returnedLoan = activeLoans.find(l => l.id === loanId)!;
      setReturnedLoans([...returnedLoans, returnedLoan]);
      showToast.success(`Successfully returned "${returnedLoan.book?.title}"`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to return book';
      setError(errorMessage);
      showToast.error(errorMessage);
    }
  };

  const handleBorrow = async (bookId: string) => {
    if (!user?.id) return;

    try {
      setBorrowingLoading(true);
      await loanService.borrowBook(bookId, user.id);
      
      // Add to active loans
      const updatedLoans = await loanService.getUserLoans(user.id, 'active');
      setActiveLoans(updatedLoans);
      
      // Refresh recommendations
      try {
        const [allBooks, borrowedBooks] = await Promise.all([
          bookService.getBooks(),
          loanService.getReturnedBooks(user.id),
        ]);

        if (borrowedBooks.length > 0) {
          const recs = getBorrowingHistoryRecommendations(borrowedBooks, allBooks);
          setRecommendations(recs);
        }
      } catch (recError) {
        console.error('Failed to refresh recommendations:', recError);
      }

      showToast.success('Book borrowed successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to borrow book';
      setError(errorMessage);
      showToast.error(errorMessage);
    } finally {
      setBorrowingLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading loans...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">My Loans</h1>
          <p className="text-gray-600 mt-2">Track your borrowed books</p>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setTab('active')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              tab === 'active'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Active ({activeLoans.length})
          </button>
          <button
            onClick={() => setTab('returned')}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              tab === 'returned'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Returned ({returnedLoans.length})
          </button>
        </div>

        {/* Active Loans */}
        {tab === 'active' && (
          <div className="space-y-8">
            <div className="space-y-4">
              {activeLoans.length === 0 ? (
                <EmptyState
                  title="No active loans"
                  description="You haven't borrowed any books yet. Visit the catalog to find something to read!"
                />
              ) : (
                <div className="space-y-4">
                  {activeLoans.map(loan => (
                    <div
                      key={loan.id}
                      className={`bg-white rounded-lg shadow p-6 ${
                        isOverdue(loan.due_at) ? 'border-l-4 border-red-500' : ''
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Book Info */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            {loan.book?.cover_url && (
                              <img
                                src={loan.book.cover_url}
                                alt={loan.book.title}
                                className="h-20 w-14 object-cover rounded"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <h3 className="font-semibold text-gray-900">{loan.book?.title}</h3>
                              <p className="text-sm text-gray-600">by {loan.book?.author}</p>
                              <div className="mt-2 space-y-1 text-xs text-gray-600">
                                <p>
                                  Borrowed: {formatDate(loan.checked_out_at)}
                                </p>
                                <p className={isOverdue(loan.due_at) ? 'text-red-600 font-semibold' : ''}>
                                  Due: {formatDate(loan.due_at)}
                                  {isOverdue(loan.due_at) && ' (Overdue!)'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Status and Action */}
                        <div className="flex flex-col items-end gap-2">
                          {isOverdue(loan.due_at) ? (
                            <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                              <AlertCircle size={16} />
                              Overdue
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                              <Clock size={16} />
                              Active
                            </div>
                          )}
                          <button
                            onClick={() => handleReturn(loan.id, loan.book_id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                          >
                            Return Book
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Recommended for you</h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Based on your borrowing history
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {recommendations.map(rec => (
                    <RecommendationCard
                      key={rec.book.id}
                      book={rec.book}
                      reason={rec.reason}
                      onAddBook={handleBorrow}
                      loading={borrowingLoading}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Returned Loans */}
        {tab === 'returned' && (
          <div className="space-y-4">
            {returnedLoans.length === 0 ? (
              <EmptyState
                title="No returned loans yet"
                description="Books you return will appear here."
              />
            ) : (
              <div className="space-y-4">
                {returnedLoans.map(loan => (
                  <div
                    key={loan.id}
                    className="bg-white rounded-lg shadow p-6 opacity-75"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      {/* Book Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          {loan.book?.cover_url && (
                            <img
                              src={loan.book.cover_url}
                              alt={loan.book.title}
                              className="h-20 w-14 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <h3 className="font-semibold text-gray-900">{loan.book?.title}</h3>
                            <p className="text-sm text-gray-600">by {loan.book?.author}</p>
                            <div className="mt-2 space-y-1 text-xs text-gray-600">
                              <p>
                                Borrowed: {formatDate(loan.checked_out_at)}
                              </p>
                              <p>
                                Returned: {loan.checked_in_at ? formatDate(loan.checked_in_at) : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                        <CheckCircle size={16} />
                        Returned
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
