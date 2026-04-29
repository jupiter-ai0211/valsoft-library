import { Book } from '../types/book';
import StatusBadge from './StatusBadge';
import { BookOpen } from 'lucide-react';

export interface BookCardProps {
  book: Book;
  onBorrow?: (bookId: string) => void;
  onReturn?: (bookId: string) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (bookId: string) => void;
  canManage?: boolean;
  canBorrow?: boolean;
  isBorrowed?: boolean;
}

export default function BookCard({
  book,
  onBorrow,
  onReturn,
  onEdit,
  onDelete,
  canManage = false,
  canBorrow = false,
  isBorrowed = false,
}: BookCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      <div className="relative h-48 bg-gray-200 overflow-hidden flex items-center justify-center">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400">
            <BookOpen size={48} />
            <span className="text-xs mt-2">No Cover</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Status */}
        <div className="mb-2">
          <StatusBadge status={book.status} />
        </div>

        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 truncate">{book.title}</h3>

        {/* Author */}
        <p className="text-sm text-gray-600 truncate">by {book.author}</p>

        {/* Category and Year */}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
          <span className="bg-gray-100 px-2 py-1 rounded">{book.category}</span>
          <span>{book.published_year}</span>
        </div>

        {/* ISBN */}
        {book.isbn && (
          <p className="text-xs text-gray-500 mt-2">ISBN: {book.isbn}</p>
        )}

        {/* Description */}
        {book.description && (
          <p className="text-xs text-gray-700 mt-2 line-clamp-2">{book.description}</p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {book.status === 'available' && canBorrow && onBorrow && !isBorrowed && (
            <button
              onClick={() => onBorrow(book.id)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-sm font-medium transition"
            >
              Borrow
            </button>
          )}

          {book.status === 'borrowed' && isBorrowed && onReturn && (
            <button
              onClick={() => onReturn(book.id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded text-sm font-medium transition"
            >
              Return
            </button>
          )}

          {canManage && onEdit && (
            <button
              onClick={() => onEdit(book)}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded text-sm font-medium transition"
            >
              Edit
            </button>
          )}

          {canManage && onDelete && (
            <button
              onClick={() => onDelete(book.id)}
              className="flex-1 bg-red-200 hover:bg-red-300 text-red-800 py-2 rounded text-sm font-medium transition"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
