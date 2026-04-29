export type UserRole = 'admin' | 'librarian' | 'member';

export interface UserProfile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
  };
}

export interface SignUpInput {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
