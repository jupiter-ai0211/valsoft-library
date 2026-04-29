export type LoanStatus = 'active' | 'returned';

export interface Loan {
  id: string;
  book_id: string;
  user_id: string;
  checked_out_at: string;
  due_at: string;
  checked_in_at: string | null;
  status: LoanStatus;
  book?: {
    title: string;
    author: string;
    cover_url: string;
  };
  user?: {
    full_name: string;
  };
}

export interface LoanWithDetails extends Loan {
  book: {
    id: string;
    title: string;
    author: string;
    isbn: string;
    cover_url: string;
  };
  user: {
    id: string;
    full_name: string;
    email: string;
  };
}
