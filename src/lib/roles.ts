import { UserRole } from '../types/user';

export function canManageBooks(role: UserRole | null): boolean {
  return role === 'admin' || role === 'librarian';
}

export function canManageUsers(role: UserRole | null): boolean {
  return role === 'admin';
}

export function canBorrowBooks(role: UserRole | null): boolean {
  return role === 'member' || role === 'librarian' || role === 'admin';
}

export function canViewDashboard(role: UserRole | null): boolean {
  return role === 'admin' || role === 'librarian';
}

export function canViewAllLoans(role: UserRole | null): boolean {
  return role === 'admin' || role === 'librarian';
}
