import { Book } from '../types/book';
import { Lightbulb, Plus } from 'lucide-react';

interface RecommendationCardProps {
  book: Book;
  reason: string;
  onAddBook: (bookId: string) => void;
  loading?: boolean;
}

export default function RecommendationCard({
  book,
  reason,
  onAddBook,
  loading = false,
}: RecommendationCardProps) {
  return (
    <div className="bg-white border border-blue-200 rounded-lg overflow-hidden hover:shadow-lg transition">
      {/* Book Cover */}
      <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-50">
            <div className="text-center px-4">
              <div className="text-gray-400 text-sm font-medium">No Cover</div>
            </div>
          </div>
        )}
        {/* Badge */}
        <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          <Lightbulb size={12} />
          Recommended
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-bold text-sm text-gray-900 mb-1 truncate" title={book.title}>
          {book.title}
        </h3>
        <p className="text-xs text-gray-600 mb-2 truncate" title={book.author}>
          by {book.author}
        </p>

        {/* Reason */}
        <div className="mb-3">
          <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block">
            {reason}
          </p>
        </div>

        {/* Add Button */}
        <button
          onClick={() => onAddBook(book.id)}
          disabled={loading || book.status === 'borrowed'}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 rounded-lg transition flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          {book.status === 'borrowed' ? 'Unavailable' : 'Borrow'}
        </button>
      </div>
    </div>
  );
}
