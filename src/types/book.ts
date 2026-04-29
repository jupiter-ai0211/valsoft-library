export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  published_year: number;
  description: string;
  cover_url: string;
  status: 'available' | 'borrowed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBookInput {
  title: string;
  author: string;
  isbn: string;
  category: string;
  published_year: number;
  description: string;
  cover_url: string;
}
