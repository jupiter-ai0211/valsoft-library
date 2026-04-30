import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import { Book } from '../types/book';
import { bookService } from '../services/bookService';
import { loanService } from '../services/loanService';
import { useAuthStore } from '../store/authStore';
import { searchBooks, filterByStatus, filterByCategory, sortBooks } from '../lib/search';
import { canManageBooks, canBorrowBooks } from '../lib/roles';
import { showToast } from '../lib/toast';
import { AlertCircle } from 'lucide-react';

export default function Books() {
  const { user, profile } = useAuthStore();
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>('all');
  const [categoryFilter, setCategoryFilter] = useState<string | null>('all');
  const [sortBy, setSortBy] = useState<'title' | 'author' | 'year'>('title');

  const [categories, setCategories] = useState<string[]>([]);
  const [borrowedBookIds, setBorrowedBookIds] = useState<string[]>([]);

  // Load books and data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [booksData, categoriesData] = await Promise.all([
          bookService.getBooks(),
          bookService.getCategories(),
        ]);

        setBooks(booksData);
        setCategories(categoriesData);

        // Load user's borrowed books
        if (user?.id) {
          const loans = await loanService.getUserLoans(user.id, 'active');
          setBorrowedBookIds(loans.map(l => l.book_id));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load books');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Apply filters
  useEffect(() => {
    let result = [...books];

    // Search
    if (searchQuery) {
      result = searchBooks(result, searchQuery);
    }

    // Status filter
    result = filterByStatus(result, statusFilter);

    // Category filter
    result = filterByCategory(result, categoryFilter);

    // Sort
    result = sortBooks(result, sortBy);

    setFilteredBooks(result);
  }, [books, searchQuery, statusFilter, categoryFilter, sortBy]);

  const handleBorrow = async (bookId: string) => {
    if (!user?.id) return;

    try {
      const bookTitle = books.find(b => b.id === bookId)?.title || 'Book';
      await loanService.borrowBook(bookId, user.id);
      setBorrowedBookIds([...borrowedBookIds, bookId]);

      // Update book status
      setBooks(books.map(b => b.id === bookId ? { ...b, status: 'borrowed' } : b));
      setFilteredBooks(filteredBooks.map(b => b.id === bookId ? { ...b, status: 'borrowed' } : b));
      
      showToast.success(`Successfully borrowed "${bookTitle}"!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to borrow book';
      setError(message);
      showToast.error(message);
    }
  };

  const handleReturn = async (bookId: string) => {
    try {
      const loan = borrowedBookIds.includes(bookId);
      if (!loan) return;

      const bookTitle = books.find(b => b.id === bookId)?.title || 'Book';

      // Find the loan
      const loans = await loanService.getBookLoans(bookId);
      const activeLoan = loans.find(l => l.status === 'active' && l.user_id === user?.id);

      if (activeLoan) {
        await loanService.returnBook(activeLoan.id, bookId);
        setBorrowedBookIds(borrowedBookIds.filter(id => id !== bookId));

        // Update book status
        setBooks(books.map(b => b.id === bookId ? { ...b, status: 'available' } : b));
        setFilteredBooks(filteredBooks.map(b => b.id === bookId ? { ...b, status: 'available' } : b));
        
        showToast.success(`Successfully returned "${bookTitle}"!`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to return book';
      setError(message);
      showToast.error(message);
    }
  };

  const handleEdit = (book: Book) => {
    navigate(`/books/${book.id}/edit`);
  };

  const handleDelete = async (bookId: string) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    try {
      const bookTitle = books.find(b => b.id === bookId)?.title || 'Book';
      await bookService.deleteBook(bookId);
      setBooks(books.filter(b => b.id !== bookId));
      showToast.success(`"${bookTitle}" deleted successfully!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete book';
      setError(message);
      showToast.error(message);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading books...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Book Catalog</h1>
            <p className="text-gray-600 mt-2">Browse and manage the library collection</p>
          </div>
          {canManageBooks(profile?.role) && (
            <button
              onClick={() => navigate('/books/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              + Add Book
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          {/* Search */}
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Filter Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={statusFilter || 'all'}
                onChange={(e) => setStatusFilter(e.target.value === 'all' ? null : e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="available">Available</option>
                <option value="borrowed">Borrowed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter || 'all'}
                onChange={(e) => setCategoryFilter(e.target.value === 'all' ? null : e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="title">Title</option>
                <option value="author">Author</option>
                <option value="year">Year (Newest)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 ? (
          <EmptyState
            title="No books found"
            description={searchQuery ? 'Try adjusting your search or filters.' : 'Start by adding some books to the library.'}
            action={canManageBooks(profile?.role) ? { label: 'Add First Book', onClick: () => navigate('/books/new') } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredBooks.map(book => (
              <BookCard
                key={book.id}
                book={book}
                canManage={canManageBooks(profile?.role)}
                canBorrow={canBorrowBooks(profile?.role) && book.status === 'available'}
                isBorrowed={borrowedBookIds.includes(book.id)}
                onBorrow={handleBorrow}
                onReturn={handleReturn}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Results Summary */}
        {filteredBooks.length > 0 && (
          <div className="text-sm text-gray-600 text-center">
            Showing {filteredBooks.length} of {books.length} books
          </div>
        )}
      </div>
    </AppLayout>
  );
}
