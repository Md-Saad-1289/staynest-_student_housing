import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('-1');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 15;

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');

  // Fetch users based on filters and pagination
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit,
        search,
        role: roleFilter === 'all' ? '' : roleFilter,
        isVerified: verificationFilter === 'all' ? '' : verificationFilter,
        sortBy,
        sortOrder,
      };

      const res = await adminService.getAllUsers(params);
      setUsers(res.data.users);
      setFilteredUsers(res.data.users);
      setTotalPages(res.data.pagination.pages);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, search, roleFilter, verificationFilter, sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter, verificationFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleVerify = async (userId) => {
    try {
      await adminService.verifyOwner(userId);
      setSuccess('User verified successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowDetail(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to verify user');
    }
  };

  const handleRejectConfirm = async (userId) => {
    try {
      await adminService.rejectOwner(userId, rejectReason || 'Rejected by admin');
      setSuccess('User rejected successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowRejectModal(false);
      setRejectReason('');
      setShowDetail(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reject user');
    }
  };

  const handleBanConfirm = async (userId) => {
    try {
      await adminService.banUser(userId, banReason || 'Banned by admin');
      setSuccess('User banned successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowBanModal(false);
      setBanReason('');
      setShowDetail(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to ban user');
    }
  };

  const handleUnban = async (userId) => {
    try {
      await adminService.unbanUser(userId);
      setSuccess('User unbanned successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setShowDetail(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to unban user');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'owner':
        return 'bg-blue-100 text-blue-800';
      case 'student':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerificationBadgeColor = (isVerified) => {
    return isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getBanBadgeColor = (isBanned) => {
    return isBanned ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            <i className="fas fa-users text-blue-600 mr-3"></i>User Management
          </h1>
          <p className="text-gray-600">Manage and verify all users in the system</p>
        </div>

        {/* Success & Error Messages */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
            <i className="fas fa-check-circle"></i>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
            <i className="fas fa-exclamation-circle"></i>
            {error}
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md mb-6 p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">
            <i className="fas fa-filter mr-2 text-blue-600"></i>Filters & Search
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Name, email, phone, NID..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Verification</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="true">Verified</option>
                <option value="false">Unverified</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="createdAt">Created Date</option>
                <option value="name">Name</option>
                <option value="email">Email</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="-1">Newest First</option>
                <option value="1">Oldest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading users...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <i className="fas fa-inbox text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600">No users found</p>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ban Status</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Phone</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-blue-50 transition duration-200"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-500">ID: {user._id.slice(-6)}</p>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleBadgeColor(user.role)}`}>
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${getVerificationBadgeColor(
                              user.isVerified
                            )}`}
                          >
                            <i className={`fas ${user.isVerified ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                            {user.isVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 w-fit ${getBanBadgeColor(
                              user.isBanned
                            )}`}
                          >
                            <i className={`fas ${user.isBanned ? 'fa-ban' : 'fa-check'}`}></i>
                            {user.isBanned ? 'Banned' : 'Active'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{user.phoneNo}</td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowDetail(true);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i> View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Page <span className="font-semibold">{currentPage}</span> of{' '}
                  <span className="font-semibold">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <i className="fas fa-chevron-left"></i> Previous
                  </button>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Professional User Details Modal */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            {/* Stunning Header with Gradient and Pattern */}
            <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-8 py-8 text-white">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
              </div>
              
              {/* Header Content */}
              <div className="relative flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <i className="fas fa-user-circle text-white text-xl"></i>
                    </div>
                    <h3 className="text-3xl font-bold">{selectedUser.name}</h3>
                  </div>
                  <p className="text-blue-100 text-sm">User ID: {selectedUser._id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedUser(null);
                  }}
                  className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6">
              {/* Alert if user is banned */}
              {selectedUser.isBanned && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg">
                  <p className="text-red-800 font-bold flex items-center gap-2 text-lg">
                    <i className="fas fa-ban text-red-600"></i>
                    ACCOUNT BANNED
                  </p>
                  {selectedUser.banReason && (
                    <p className="text-red-700 text-sm mt-2 ml-8">💬 {selectedUser.banReason}</p>
                  )}
                </div>
              )}
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <p className="text-blue-600 text-sm font-semibold mb-1">
                    <i className="fas fa-shield-alt mr-2"></i>ROLE
                  </p>
                  <p className="text-xl font-bold text-blue-800">{selectedUser.role.toUpperCase()}</p>
                </div>

                <div className={`bg-gradient-to-br p-4 rounded-xl border ${selectedUser.isVerified ? 'from-green-50 to-green-100 border-green-200' : 'from-orange-50 to-orange-100 border-orange-200'}`}>
                  <p className={`${selectedUser.isVerified ? 'text-green-600' : 'text-orange-600'} text-sm font-semibold mb-1`}>
                    <i className={`fas ${selectedUser.isVerified ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2`}></i>
                    VERIFICATION
                  </p>
                  <p className={`text-xl font-bold ${selectedUser.isVerified ? 'text-green-800' : 'text-orange-800'}`}>
                    {selectedUser.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </p>
                </div>

                <div className={`bg-gradient-to-br p-4 rounded-xl border ${selectedUser.isBanned ? 'from-red-50 to-red-100 border-red-200' : 'from-emerald-50 to-emerald-100 border-emerald-200'}`}>
                  <p className={`${selectedUser.isBanned ? 'text-red-600' : 'text-emerald-600'} text-sm font-semibold mb-1`}>
                    <i className={`fas ${selectedUser.isBanned ? 'fa-ban' : 'fa-check'} mr-2`}></i>
                    STATUS
                  </p>
                  <p className={`text-xl font-bold ${selectedUser.isBanned ? 'text-red-800' : 'text-emerald-800'}`}>
                    {selectedUser.isBanned ? 'BANNED' : 'ACTIVE'}
                  </p>
                </div>
              </div>

              {/* Contact Information Section */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600 flex items-center gap-2">
                  <i className="fas fa-envelope text-blue-600 bg-blue-50 w-8 h-8 flex items-center justify-center rounded-lg"></i>
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition group">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-2">
                      <i className="fas fa-at text-blue-600 mr-2"></i>Email Address
                    </p>
                    <p className="text-gray-900 font-medium break-all group-hover:text-blue-600 transition">{selectedUser.email}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 transition group">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-2">
                      <i className="fas fa-phone text-blue-600 mr-2"></i>Phone Number
                    </p>
                    <p className="text-gray-900 font-medium group-hover:text-blue-600 transition">{selectedUser.phoneNo}</p>
                  </div>
                </div>
              </div>

              {/* NID Information Section */}
              {selectedUser.nidNumber && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-600 flex items-center gap-2">
                    <i className="fas fa-id-card text-purple-600 bg-purple-50 w-8 h-8 flex items-center justify-center rounded-lg"></i>
                    NID Information
                  </h4>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <p className="text-purple-600 text-xs font-bold uppercase tracking-wide mb-2">
                      <i className="fas fa-hashtag mr-2"></i>NID Number
                    </p>
                    <p className="text-gray-900 font-mono text-lg bg-white px-4 py-2 rounded-lg">{selectedUser.nidNumber}</p>
                  </div>
                </div>
              )}

              {/* Verification History */}
              {(selectedUser.isVerified || selectedUser.rejectionReason) && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-amber-600 flex items-center gap-2">
                    <i className="fas fa-history text-amber-600 bg-amber-50 w-8 h-8 flex items-center justify-center rounded-lg"></i>
                    Verification History
                  </h4>
                  <div className="space-y-3">
                    {selectedUser.isVerified && selectedUser.verifiedAt && (
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg">
                        <p className="text-green-800 font-bold text-sm mb-1">
                          <i className="fas fa-check-circle text-green-600 mr-2"></i>Verified On
                        </p>
                        <p className="text-green-700 text-sm ml-6 font-medium">
                          {new Date(selectedUser.verifiedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}

                    {selectedUser.rejectionReason && (
                      <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg">
                        <p className="text-orange-800 font-bold text-sm mb-1">
                          <i className="fas fa-times-circle text-orange-600 mr-2"></i>Rejection Reason
                        </p>
                        <p className="text-orange-700 text-sm ml-6">{selectedUser.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Ban History */}
              {selectedUser.isBanned && selectedUser.bannedAt && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-600 flex items-center gap-2">
                    <i className="fas fa-ban text-red-600 bg-red-50 w-8 h-8 flex items-center justify-center rounded-lg"></i>
                    Ban Information
                  </h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg">
                      <p className="text-red-800 font-bold text-sm mb-1">
                        <i className="fas fa-calendar text-red-600 mr-2"></i>Banned Date
                      </p>
                      <p className="text-red-700 text-sm ml-6 font-medium">
                        {new Date(selectedUser.bannedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    {selectedUser.banReason && (
                      <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border-l-4 border-rose-500 rounded-lg">
                        <p className="text-rose-800 font-bold text-sm mb-1">
                          <i className="fas fa-comment-slash text-rose-600 mr-2"></i>Ban Reason
                        </p>
                        <p className="text-rose-700 text-sm ml-6">{selectedUser.banReason}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Account Timeline */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-600 flex items-center gap-2">
                  <i className="fas fa-clock text-indigo-600 bg-indigo-50 w-8 h-8 flex items-center justify-center rounded-lg"></i>
                  Account Timeline
                </h4>
                <div className="space-y-3 relative">
                  {/* Timeline Line */}
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-indigo-200 via-indigo-300 to-indigo-400"></div>
                  
                  {/* Created Timeline Item */}
                  <div className="relative pl-20">
                    <div className="absolute left-0 top-2.5 w-10 h-10 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <i className="fas fa-user-plus text-sm"></i>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 rounded-lg hover:shadow-md transition-all">
                      <p className="text-indigo-900 font-bold text-sm">Account Created</p>
                      <p className="text-indigo-700 text-sm mt-1">
                        {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Update Timeline Item */}
                  <div className="relative pl-20">
                    <div className="absolute left-0 top-2.5 w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg">
                      <i className="fas fa-sync text-sm"></i>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg hover:shadow-md transition-all">
                      <p className="text-blue-900 font-bold text-sm">Last Updated</p>
                      <p className="text-blue-700 text-sm mt-1">
                        {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Verification Timeline Item */}
                  {selectedUser.isVerified && selectedUser.verifiedAt && (
                    <div className="relative pl-20">
                      <div className="absolute left-0 top-2.5 w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <i className="fas fa-check text-sm"></i>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-lg hover:shadow-md transition-all">
                        <p className="text-green-900 font-bold text-sm">Owner Verified</p>
                        <p className="text-green-700 text-sm mt-1">
                          {new Date(selectedUser.verifiedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ban Timeline Item */}
                  {selectedUser.isBanned && selectedUser.bannedAt && (
                    <div className="relative pl-20">
                      <div className="absolute left-0 top-2.5 w-10 h-10 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center text-white shadow-lg">
                        <i className="fas fa-ban text-sm"></i>
                      </div>
                      <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-lg hover:shadow-md transition-all">
                        <p className="text-red-900 font-bold text-sm">Account Banned</p>
                        <p className="text-red-700 text-sm mt-1">
                          {new Date(selectedUser.bannedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg hover:from-gray-300 hover:to-gray-400 transition font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
                >
                  <i className="fas fa-times"></i> Close
                </button>

                {!selectedUser.isVerified && selectedUser.role === 'owner' && (
                  <button
                    onClick={() => handleVerify(selectedUser._id)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    <i className="fas fa-check-circle"></i> Verify
                  </button>
                )}

                {!selectedUser.isVerified && selectedUser.role === 'owner' && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg hover:from-orange-600 hover:to-amber-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    <i className="fas fa-times-circle"></i> Reject
                  </button>
                )}

                {!selectedUser.isBanned && selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => setShowBanModal(true)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    <i className="fas fa-ban"></i> Ban
                  </button>
                )}

                {selectedUser.isBanned && (
                  <button
                    onClick={() => handleUnban(selectedUser._id)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    <i className="fas fa-undo"></i> Unban
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-orange-600 px-6 py-4 text-white flex justify-between items-center rounded-t-xl">
              <h3 className="text-lg font-bold">Reject User</h3>
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="text-white hover:text-orange-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to reject <span className="font-semibold text-orange-600">{selectedUser.name}</span>?
              </p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rejection Reason (Optional)</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"
                  placeholder="Provide a reason for rejection..."
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRejectConfirm(selectedUser._id)}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="bg-red-600 px-6 py-4 text-white flex justify-between items-center rounded-t-xl">
              <h3 className="text-lg font-bold">Ban User</h3>
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setBanReason('');
                }}
                className="text-white hover:text-red-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">
                Are you sure you want to ban <span className="font-semibold text-red-600">{selectedUser.name}</span>?
              </p>
              <p className="text-sm text-gray-600">This user will be unable to access the platform and all their listings will be hidden.</p>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ban Reason</label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition"
                  placeholder="Explain why this user is being banned..."
                  rows="3"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setBanReason('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBanConfirm(selectedUser._id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
