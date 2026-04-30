import { supabase } from '../lib/supabase';
import { Loan, LoanWithDetails } from '../types/loan';

export const loanService = {
  async borrowBook(bookId: string, userId: string): Promise<Loan> {
    // Calculate due date (14 days from now)
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    // Create loan
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .insert({
        book_id: bookId,
        user_id: userId,
        status: 'active',
        due_at: dueDate.toISOString(),
      })
      .select()
      .single();

    if (loanError) throw loanError;

    // Update book status
    const { error: bookError } = await supabase
      .from('books')
      .update({ status: 'borrowed' })
      .eq('id', bookId);

    if (bookError) throw bookError;

    return loanData;
  },

  async returnBook(loanId: string, bookId: string): Promise<Loan> {
    // Update loan
    const { data: loanData, error: loanError } = await supabase
      .from('loans')
      .update({
        status: 'returned',
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', loanId)
      .select()
      .single();

    if (loanError) throw loanError;

    // Update book status
    const { error: bookError } = await supabase
      .from('books')
      .update({ status: 'available' })
      .eq('id', bookId);

    if (bookError) throw bookError;

    return loanData;
  },

  async getUserLoans(userId: string, status?: 'active' | 'returned'): Promise<LoanWithDetails[]> {
    let query = supabase
      .from('loans')
      .select(`
        *,
        book:books(id, title, author, isbn, cover_url),
        user:profiles(id, full_name)
      `)
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('checked_out_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllLoans(status?: 'active' | 'returned'): Promise<LoanWithDetails[]> {
    let query = supabase
      .from('loans')
      .select(`
        *,
        book:books(id, title, author, isbn, cover_url),
        user:profiles(id, full_name)
      `);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('checked_out_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getLoanStats(): Promise<{
    activeLoans: number;
    returnedLoans: number;
    overdueLoans: number;
  }> {
    const { data, error } = await supabase
      .from('loans')
      .select('status, due_at, checked_in_at');

    if (error) throw error;

    const loans = data || [];
    const now = new Date();

    return {
      activeLoans: loans.filter(l => l.status === 'active').length,
      returnedLoans: loans.filter(l => l.status === 'returned').length,
      overdueLoans: loans.filter(
        l => l.status === 'active' && new Date(l.due_at) < now
      ).length,
    };
  },

  async getBookLoans(bookId: string): Promise<Loan[]> {
    const { data, error } = await supabase
      .from('loans')
      .select('*')
      .eq('book_id', bookId)
      .order('checked_out_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },
};
