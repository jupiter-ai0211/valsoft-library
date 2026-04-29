import { supabase } from '../lib/supabase';
import { Book, CreateBookInput } from '../types/book';

export const bookService = {
  async getBooks(): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getBookById(id: string): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createBook(input: CreateBookInput, userId: string): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .insert({
        ...input,
        created_by: userId,
        status: 'available',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBook(id: string, input: Partial<CreateBookInput>): Promise<Book> {
    const { data, error } = await supabase
      .from('books')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBook(id: string): Promise<void> {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('books')
      .select('category')
      .neq('category', null);

    if (error) throw error;

    const categories = new Set(data?.map(b => b.category).filter(Boolean));
    return Array.from(categories).sort();
  },

  async getBookStats(): Promise<{
    total: number;
    available: number;
    borrowed: number;
  }> {
    const { data, error } = await supabase.from('books').select('status');

    if (error) throw error;

    const books = data || [];
    return {
      total: books.length,
      available: books.filter(b => b.status === 'available').length,
      borrowed: books.filter(b => b.status === 'borrowed').length,
    };
  },
};
