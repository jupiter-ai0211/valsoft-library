import Fuse from 'fuse.js';
import { Book } from '../types/book';

export function searchBooks(books: Book[], query: string): Book[] {
  if (!query.trim()) return books;

  const fuse = new Fuse(books, {
    keys: ['title', 'author', 'isbn', 'category', 'description'],
    threshold: 0.3,
    includeScore: true,
  });

  return fuse.search(query).map(result => result.item);
}

export function filterByStatus(books: Book[], status: string | null): Book[] {
  if (!status || status === 'all') return books;
  return books.filter(book => book.status === status);
}

export function filterByCategory(books: Book[], category: string | null): Book[] {
  if (!category || category === 'all') return books;
  return books.filter(book => book.category === category);
}

export function sortBooks(
  books: Book[],
  sortBy: 'title' | 'author' | 'year' = 'title'
): Book[] {
  const sorted = [...books];

  switch (sortBy) {
    case 'author':
      sorted.sort((a, b) => a.author.localeCompare(b.author));
      break;
    case 'year':
      sorted.sort((a, b) => b.published_year - a.published_year);
      break;
    case 'title':
    default:
      sorted.sort((a, b) => a.title.localeCompare(b.title));
  }

  return sorted;
}
