import { create } from 'zustand';
import { UserProfile, AuthUser } from '../types/user';
import { supabase } from '../lib/supabase';

interface AuthStore {
  user: AuthUser | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Auth methods
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

// Initialize Supabase session listener for auth persistence
let isInitialized = false;

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: null,
  loading: true,  // Start as true to prevent premature redirects on page refresh
  error: null,

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (email: string, password: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        set({ user: data.user });
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          set({ profile: profileData });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (email: string, password: string, fullName: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        set({ user: data.user });
        
        // Create profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: fullName,
            role: 'member',
          })
          .select()
          .single();

        if (profileError) throw profileError;

        if (profileData) {
          set({ profile: profileData });
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchCurrentUser: async () => {
    set({ loading: true });
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;

      if (user) {
        set({ user });
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          set({ profile: profileData });
        }
      } else {
        set({ user: null, profile: null });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch user';
      set({ error: message });
    } finally {
      set({ loading: false });
      
      // Set up auth state listener on first load
      if (!isInitialized) {
        isInitialized = true;
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            set({ user: session.user });
            // Fetch updated profile
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            if (profileData) {
              set({ profile: profileData });
            }
          } else {
            set({ user: null, profile: null });
          }
        });
      }
    }
  },
}));
