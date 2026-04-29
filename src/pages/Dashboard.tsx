import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import DashboardStats from '../components/DashboardStats';
import { bookService } from '../services/bookService';
import { loanService } from '../services/loanService';
import { useAuthStore } from '../store/authStore';
import { canViewDashboard } from '../lib/roles';

export default function Dashboard() {
  const { profile } = useAuthStore();
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    activeLoans: 0,
    overdueLoans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!canViewDashboard(profile?.role)) {
      return;
    }

    const loadStats = async () => {
      try {
        const [bookStats, loanStats] = await Promise.all([
          bookService.getBookStats(),
          loanService.getLoanStats(),
        ]);

        setStats({
          totalBooks: bookStats.total,
          availableBooks: bookStats.available,
          borrowedBooks: bookStats.borrowed,
          activeLoans: loanStats.activeLoans,
          overdueLoans: loanStats.overdueLoans,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [profile?.role]);

  if (!canViewDashboard(profile?.role)) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Only admins and librarians can view the dashboard.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {profile?.full_name}!</p>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading stats...</p>
          </div>
        ) : (
          <DashboardStats
            totalBooks={stats.totalBooks}
            availableBooks={stats.availableBooks}
            borrowedBooks={stats.borrowedBooks}
            activeLoans={stats.activeLoans}
            overdueLoans={stats.overdueLoans}
          />
        )}

        {/* Quick Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Library Overview</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Catalog</span>
                <span className="font-semibold">{stats.totalBooks} books</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Available Now</span>
                <span className="font-semibold text-green-600">{stats.availableBooks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currently Borrowed</span>
                <span className="font-semibold text-yellow-600">{stats.borrowedBooks}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Activity</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Loans</span>
                <span className="font-semibold">{stats.activeLoans}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Overdue</span>
                <span className={`font-semibold ${stats.overdueLoans > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {stats.overdueLoans}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Loans Processed</span>
                <span className="font-semibold">{stats.activeLoans + stats.overdueLoans}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
