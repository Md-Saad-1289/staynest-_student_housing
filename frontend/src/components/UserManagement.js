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
                        <td className="px-6 py-4 text-gray-700">{user.mobile}</td>
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
            {/* Modal Header with gradient */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 px-8 py-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">User Details</h3>
                <p className="text-blue-100 text-sm mt-1">Complete user information and actions</p>
              </div>
              <button
                onClick={() => {
                  setShowDetail(false);
                  setSelectedUser(null);
                }}
                className="text-white hover:text-blue-100 transition text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Alert if user is banned */}
              {selectedUser.isBanned && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="text-red-800 font-semibold flex items-center gap-2">
                    <i className="fas fa-ban text-red-600"></i>
                    This user is currently BANNED
                  </p>
                  {selectedUser.banReason && (
                    <p className="text-red-700 text-sm mt-2">Reason: {selectedUser.banReason}</p>
                  )}
                </div>
              )}

              {/* Personal Information Section */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600 flex items-center gap-2">
                  <i className="fas fa-user-circle text-blue-600"></i>
                  Personal Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <p className="text-gray-900 text-lg">{selectedUser.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">User ID</label>
                    <p className="text-gray-900 font-mono text-sm bg-gray-100 px-3 py-2 rounded">{selectedUser._id}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <p className="text-gray-900 break-all">{selectedUser.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900">{selectedUser.mobile}</p>
                  </div>
                </div>
              </div>

              {/* Account Status Section */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-600 flex items-center gap-2">
                  <i className="fas fa-shield-alt text-green-600"></i>
                  Account Status
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getRoleBadgeColor(selectedUser.role)}`}>
                      <i className={`fas ${selectedUser.role === 'admin' ? 'fa-crown' : selectedUser.role === 'owner' ? 'fa-home' : 'fa-graduation-cap'} mr-2`}></i>
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Verification Status</label>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getVerificationBadgeColor(
                        selectedUser.isVerified
                      )}`}
                    >
                      <i className={`fas ${selectedUser.isVerified ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                      {selectedUser.isVerified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Ban Status</label>
                    <span
                      className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${getBanBadgeColor(
                        selectedUser.isBanned
                      )}`}
                    >
                      <i className={`fas ${selectedUser.isBanned ? 'fa-ban' : 'fa-check'} mr-2`}></i>
                      {selectedUser.isBanned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                </div>
              </div>

              {/* NID Information Section */}
              {selectedUser.nidNumber && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-600 flex items-center gap-2">
                    <i className="fas fa-id-card text-purple-600"></i>
                    NID Information
                  </h4>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">NID Number</label>
                    <p className="text-gray-900 font-mono text-lg bg-gray-100 px-4 py-2 rounded">{selectedUser.nidNumber}</p>
                  </div>
                </div>
              )}

              {/* Verification History */}
              {(selectedUser.isVerified || selectedUser.rejectionReason) && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-600 flex items-center gap-2">
                    <i className="fas fa-history text-orange-600"></i>
                    Verification History
                  </h4>
                  {selectedUser.isVerified && selectedUser.verifiedAt && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                      <p className="text-green-800 font-semibold">✓ Verified on</p>
                      <p className="text-green-700 mt-1">
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
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded">
                      <p className="text-red-800 font-semibold">✗ Rejection Reason</p>
                      <p className="text-red-700 mt-1">{selectedUser.rejectionReason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Ban History */}
              {selectedUser.isBanned && selectedUser.bannedAt && (
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-600 flex items-center gap-2">
                    <i className="fas fa-ban text-red-600"></i>
                    Ban Information
                  </h4>
                  <div className="p-4 bg-red-50 border border-red-200 rounded">
                    <p className="text-red-800 font-semibold">Banned on</p>
                    <p className="text-red-700 mt-1">
                      {new Date(selectedUser.bannedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {selectedUser.banReason && (
                      <>
                        <p className="text-red-800 font-semibold mt-3">Reason</p>
                        <p className="text-red-700 mt-1">{selectedUser.banReason}</p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Account Timeline */}
              <div className="mb-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-600 flex items-center gap-2">
                  <i className="fas fa-clock text-gray-600"></i>
                  Account Timeline
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700 font-semibold">Member Since</span>
                    <span className="text-gray-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-gray-700 font-semibold">Last Updated</span>
                    <span className="text-gray-900">
                      {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex gap-3 flex-wrap">
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
                >
                  <i className="fas fa-times"></i> Close
                </button>

                {!selectedUser.isVerified && selectedUser.role === 'owner' && (
                  <button
                    onClick={() => handleVerify(selectedUser._id)}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-check-circle"></i> Verify
                  </button>
                )}

                {!selectedUser.isVerified && selectedUser.role === 'owner' && (
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-times-circle"></i> Reject
                  </button>
                )}

                {!selectedUser.isBanned && selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => setShowBanModal(true)}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-ban"></i> Ban
                  </button>
                )}

                {selectedUser.isBanned && (
                  <button
                    onClick={() => handleUnban(selectedUser._id)}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2"
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
