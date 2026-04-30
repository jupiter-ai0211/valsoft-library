import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useState } from 'react';
import { canViewDashboard } from '../lib/roles';

export default function Navbar() {
  const { user, profile, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user || !profile) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-2 font-bold text-xl">
            <span>📚</span>
            <span>LibraFlow</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {canViewDashboard(profile.role) && (
              <Link to="/dashboard" className="hover:bg-blue-700 px-3 py-2 rounded transition">
                Dashboard
              </Link>
            )}
            <Link to="/books" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              Catalog
            </Link>
            <Link to="/my-loans" className="hover:bg-blue-700 px-3 py-2 rounded transition">
              My Loans
            </Link>
            {profile.role === 'admin' && (
              <Link to="/admin/users" className="hover:bg-blue-700 px-3 py-2 rounded transition">
                Users
              </Link>
            )}

            {/* User Menu */}
            <div className="flex items-center space-x-4 border-l border-blue-500 pl-4">
              <div className="text-sm">
                <p className="font-medium">{profile.full_name}</p>
                <p className="text-blue-200 text-xs capitalize">{profile.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="hover:bg-blue-700 p-2 rounded transition"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 hover:bg-blue-700 rounded transition"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {canViewDashboard(profile.role) && (
              <Link
                to="/dashboard"
                className="block hover:bg-blue-700 px-3 py-2 rounded transition"
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/books"
              className="block hover:bg-blue-700 px-3 py-2 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              Catalog
            </Link>
            <Link
              to="/my-loans"
              className="block hover:bg-blue-700 px-3 py-2 rounded transition"
              onClick={() => setMenuOpen(false)}
            >
              My Loans
            </Link>
            {profile.role === 'admin' && (
              <Link
                to="/admin/users"
                className="block hover:bg-blue-700 px-3 py-2 rounded transition"
                onClick={() => setMenuOpen(false)}
              >
                Users
              </Link>
            )}
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full text-left hover:bg-blue-700 px-3 py-2 rounded transition flex items-center space-x-2"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
