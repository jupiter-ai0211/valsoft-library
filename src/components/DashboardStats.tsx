import { Book, Users, Bookmark, AlertCircle } from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
}

export interface DashboardStatsProps {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  activeLoans: number;
  overdueLoans: number;
}

export default function DashboardStats({
  totalBooks,
  availableBooks,
  borrowedBooks,
  activeLoans,
  overdueLoans,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <StatCard icon={<Book />} label="Total Books" value={totalBooks} color="blue" />
      <StatCard icon={<Book />} label="Available" value={availableBooks} color="green" />
      <StatCard icon={<Bookmark />} label="Borrowed" value={borrowedBooks} color="yellow" />
      <StatCard icon={<Users />} label="Active Loans" value={activeLoans} color="blue" />
      <StatCard icon={<AlertCircle />} label="Overdue" value={overdueLoans} color="red" />
    </div>
  );
}
