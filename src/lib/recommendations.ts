import { Book } from '../types/book';

export interface Recommendation {
  book: Book;
  score: number;
  reason: string;
}

export function getRecommendations(
  sourceBook: Book,
  allBooks: Book[],
  excludeBorrowed: boolean = true
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  allBooks.forEach(book => {
    if (book.id === sourceBook.id) return;
    if (excludeBorrowed && book.status === 'borrowed') return;

    let score = 0;
    let reason = '';

    // Same author
    if (book.author.toLowerCase() === sourceBook.author.toLowerCase()) {
      score += 50;
      reason = `Same author as ${sourceBook.title}`;
    }

    // Same category
    if (book.category.toLowerCase() === sourceBook.category.toLowerCase()) {
      score += 40;
      reason = reason || `Same category as ${sourceBook.title}`;
    }

    // Matching keywords in title or description
    const sourceKeywords = extractKeywords(sourceBook.title + ' ' + sourceBook.description);
    const bookKeywords = extractKeywords(book.title + ' ' + book.description);

    const matchingKeywords = sourceKeywords.filter(kw => bookKeywords.includes(kw));
    if (matchingKeywords.length > 0) {
      score += matchingKeywords.length * 15;
      reason = reason || `Related topics: ${matchingKeywords.slice(0, 2).join(', ')}`;
    }

    if (score > 0) {
      recommendations.push({ book, score, reason });
    }
  });

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function extractKeywords(text: string): string[] {
  const commonWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  ]);

  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !commonWords.has(word))
    .slice(0, 10);
}

export function getBorrowingHistoryRecommendations(
  borrowedBooks: Book[],
  allBooks: Book[]
): Recommendation[] {
  if (borrowedBooks.length === 0) return [];

  const categoryCount: Record<string, number> = {};
  const authorCount: Record<string, number> = {};
  const allBorrowedKeywords: string[] = [];

  // Build keyword map from borrowed books
  borrowedBooks.forEach(book => {
    categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
    authorCount[book.author] = (authorCount[book.author] || 0) + 1;
    const keywords = extractKeywords(book.title + ' ' + (book.description || ''));
    allBorrowedKeywords.push(...keywords);
  });

  const recommendations: Recommendation[] = [];

  allBooks.forEach(book => {
    if (borrowedBooks.some(b => b.id === book.id)) return;
    if (book.status === 'borrowed') return;

    let score = 0;
    let reason = '';

    // Author match (highest priority)
    if (authorCount[book.author]) {
      score += authorCount[book.author] * 50;
      reason = `By an author you enjoy`;
    }

    // Category match (high priority)
    if (categoryCount[book.category]) {
      score += categoryCount[book.category] * 40;
      reason = reason || `Popular in your favorite category`;
    }

    // Keyword match (medium priority)
    const bookKeywords = extractKeywords(book.title + ' ' + (book.description || ''));
    const matchingKeywords = bookKeywords.filter(kw => allBorrowedKeywords.includes(kw));
    if (matchingKeywords.length > 0) {
      score += matchingKeywords.length * 20;
      reason = reason || `Related to your interests: ${matchingKeywords.slice(0, 2).join(', ')}`;
    }

    if (score > 0) {
      recommendations.push({
        book,
        score,
        reason,
      });
    }
  });

  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}
