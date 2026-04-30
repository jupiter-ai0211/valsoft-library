import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import EmptyState from '../components/EmptyState';
import { UserProfile } from '../types/user';
import { userService } from '../services/userService';
import { showToast } from '../lib/toast';
import { AlertCircle, Shield, Users } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
        const roleMap: Record<string, string> = {};
        data.forEach(user => {
          roleMap[user.id] = user.role;
        });
        setSelectedRole(roleMap);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const userName = users.find(u => u.id === userId)?.full_name || 'User';
      await userService.updateUserRole(userId, newRole as any);
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      setSelectedRole({ ...selectedRole, [userId]: newRole });
      showToast.success(`${userName}'s role updated to ${newRole}!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update role';
      setError(message);
      showToast.error(message);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-red-100 text-red-800',
      librarian: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (role: string) => {
    const icons: Record<string, React.ReactNode> = {
      admin: <Shield size={16} className="inline mr-1" />,
      librarian: <Users size={16} className="inline mr-1" />,
      member: <Users size={16} className="inline mr-1" />,
    };
    return icons[role];
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <AppLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-2">Manage user roles and permissions</p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Users Table */}
          {users.length === 0 ? (
            <EmptyState
              title="No users found"
              description="No users have been registered yet."
            />
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Current Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Change Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">{user.id}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={selectedRole[user.id] || user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-sm border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="member">Member</option>
                          <option value="librarian">Librarian</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Role Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-semibold text-red-900 flex items-center gap-2">
                <Shield size={18} />
                Admin
              </p>
              <p className="text-sm text-red-700 mt-2">Full access to all features and settings</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="font-semibold text-blue-900">Librarian</p>
              <p className="text-sm text-blue-700 mt-2">Can manage books and view all loans</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="font-semibold text-green-900">Member</p>
              <p className="text-sm text-green-700 mt-2">Can borrow and return books</p>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
