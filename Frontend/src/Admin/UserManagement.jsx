import React, { useState, useEffect } from 'react';
import { useGlobal } from '../context/GlobalContext';

const UserManagement = () => {
  const { fetchAllUsers, updateUserStatus, updateUserRole } = useGlobal();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const usersResult = await fetchAllUsers();
      
      if (usersResult.success) {
        // Transform users to match the expected format
        const transformedUsers = usersResult.users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.toLowerCase(), // Convert SELLER to seller
          status: user.status.toLowerCase(), // Convert ACTIVE to active
          joinDate: new Date(user.createdAt).toLocaleDateString(),
          lastActivity: new Date(user.updatedAt).toLocaleDateString(),
          agreeToTerms: user.agreeToTerms,
          subscribeNewsletter: user.subscribeNewsletter
        }));
        
        setUsers(transformedUsers);
      } else {
        throw new Error(usersResult.message || 'Failed to fetch users');
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const result = await updateUserRole(userId, newRole.toUpperCase());
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, role: newRole.toLowerCase() } : user
        ));
      } else {
        setError(result.message || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Failed to update user role');
    }
  };

  const handleUpdateUserStatus = async (userId, newStatus) => {
    try {
      const result = await updateUserStatus(userId, newStatus.toUpperCase());
      if (result.success) {
        setUsers(prev => prev.map(user => 
          user.id === userId ? { ...user, status: newStatus.toLowerCase() } : user
        ));
      } else {
        setError(result.message || 'Failed to update user status');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      setError('Failed to update user status');
    }
  };

  // Filter users based on search, role, and status filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Statistics based on actual data
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const sellers = users.filter(u => u.role === 'seller').length;
  const consumers = users.filter(u => u.role === 'consumer').length;
  const admins = users.filter(u => u.role === 'admin').length;

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium">{title}</p>
          <p className="text-white text-2xl font-bold mt-1">{value}</p>
          {subtitle && <p className="text-white/70 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className="text-white/80 text-3xl">{icon}</div>
      </div>
    </div>
  );

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'seller': return 'bg-blue-100 text-blue-800';
      case 'consumer': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-bold">Error Loading Data</p>
            <p>{error}</p>
            <button 
              onClick={loadData}
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-sky-400 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-gray-600 text-sm">Manage platform users and permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadData}
                className="bg-gradient-to-r from-blue-500 to-sky-400 px-4 py-2 rounded-full text-white text-sm font-medium hover:from-blue-600 hover:to-sky-500 transition-all"
              >
                Refresh Data
              </button>
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 px-4 py-2 rounded-full">
                <span className="text-white text-sm font-medium">{totalUsers} Users</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon="👥"
            color="from-blue-600 to-sky-400"
            subtitle={`${activeUsers} active, ${inactiveUsers} inactive`}
          />
          <StatCard
            title="Active Users"
            value={activeUsers}
            icon="✅"
            color="from-emerald-500 to-teal-400"
            subtitle="Currently active"
          />
          <StatCard
            title="Sellers"
            value={sellers}
            icon="🏪"
            color="from-purple-500 to-pink-400"
            subtitle="Marketplace vendors"
          />
          <StatCard
            title="Consumers"
            value={consumers}
            icon="🛒"
            color="from-orange-500 to-amber-400"
            subtitle="Platform buyers"
          />
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-sky-100 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4">
              <div className="flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="seller">Seller</option>
                <option value="consumer">Consumer</option>
              </select>
              <select
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg border border-sky-100">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Users ({filteredUsers.length})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-sky-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-sky-25 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-400">ID: {user.id}</p>
                        <p className="text-xs text-gray-400">Joined {user.joinDate}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{user.email}</p>
                      <div className="text-xs text-gray-400 mt-1">
                        {user.agreeToTerms && <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-1"></span>}
                        {user.subscribeNewsletter && <span className="text-blue-500">📧</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)} border-0 cursor-pointer`}
                        value={user.role}
                        onChange={(e) => handleUpdateUserRole(user.id, e.target.value)}
                      >
                        <option value="consumer">Consumer</option>
                        <option value="seller">Seller</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <p className="text-gray-900">Last: {user.lastActivity}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {user.status === 'active' ? (
                          <button 
                            className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                            onClick={() => handleUpdateUserStatus(user.id, 'inactive')}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button 
                            className="bg-green-100 text-green-600 hover:bg-green-200 px-3 py-1 rounded-full text-xs font-medium transition-colors"
                            onClick={() => handleUpdateUserStatus(user.id, 'active')}
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;