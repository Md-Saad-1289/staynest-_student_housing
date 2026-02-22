import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';

export const ListingsManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'true', 'false', ''
  const [cityFilter, setCityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalListings, setTotalListings] = useState(0);
  const [cities, setCities] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch all listings
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const filterParams = {
        page,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        isVerified: statusFilter || undefined,
        city: cityFilter || undefined,
        sortBy,
        sortOrder,
      };

      const res = await adminService.getAllListings(filterParams);
      
      const allListings = res.data.listings || [];
      setListings(allListings);
      setTotalListings(res.data.total || res.data.meta?.total || allListings.length);

      // Extract unique cities
      const uniqueCities = [...new Set(allListings.map((l) => l.city).filter(Boolean))];
      setCities(uniqueCities.sort());
    } catch (error) {
      console.error('Failed to fetch listings:', error);
      setError('Failed to load listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter, cityFilter, sortBy, sortOrder, itemsPerPage]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle delete listing
  const handleDeleteListing = (listing) => {
    const reason = prompt(`Why are you deleting "${listing.title}"?\n\n(This reason will be logged for audit purposes)`);
    if (reason === null) return; // User cancelled

    setConfirmModal({
      open: true,
      title: 'Delete Listing?',
      message: `You are about to permanently delete "${listing.title}". This action cannot be undone.`,
      reason,
      listingId: listing._id,
      listingTitle: listing.title,
      action: 'delete',
    });
  };

  const confirmDelete = async () => {
    try {
      setIsProcessing(true);
      await adminService.deleteListing(confirmModal.listingId, confirmModal.reason);
      setSuccess('✓ Listing deleted successfully');
      setConfirmModal({ open: false });
      setShowDetailModal(false);
      setTimeout(() => setSuccess(''), 3000);
      fetchListings();
    } catch (error) {
      setError('Failed to delete: ' + (error.response?.data?.error || error.message));
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyListing = (listing) => {
    setConfirmModal({
      open: true,
      title: 'Approve Listing?',
      message: `Are you sure you want to approve "${listing.title}"?\n\nThis listing will be marked as verified and visible to students.`,
      action: 'verify',
      listingId: listing._id,
      listingTitle: listing.title,
    });
  };

  const confirmVerify = async () => {
    try {
      setIsProcessing(true);
      await adminService.verifyListing(confirmModal.listingId);
      setSuccess('✓ Listing approved successfully');
      setConfirmModal({ open: false });
      setTimeout(() => setSuccess(''), 3000);
      fetchListings();
    } catch (error) {
      setError('Failed: ' + (error.response?.data?.error || error.message));
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalPages = Math.ceil(totalListings / itemsPerPage);

  const getStatusBadge = (listing) => {
    if (listing.isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
          <i className="fas fa-check-circle"></i> Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
        <i className="fas fa-clock"></i> Pending
      </span>
    );
  };

  const getOwnerBadge = (listing) => {
    if (listing.ownerId?.isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium">
          <i className="fas fa-badge-check text-blue-500"></i> Verified Owner
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded text-xs font-medium">
        <i className="fas fa-exclamation-circle"></i> Unverified Owner
      </span>
    );
  };

  if (loading && listings.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600 font-medium">Loading listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error & Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
          <i className="fas fa-circle-exclamation"></i>
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2">
          <i className="fas fa-check-circle"></i>
          {success}
        </div>
      )}
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black mb-2 flex items-center gap-2">
              <i className="fas fa-layer-group"></i> Listings Management
            </h2>
            <p className="text-blue-100">View, approve, and manage all property listings on the platform</p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-white bg-opacity-20 backdrop-blur px-4 py-2 rounded-lg">
              <p className="text-sm font-semibold">
                Total Listings: <span className="text-2xl font-bold">{totalListings}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Total Listings</span>
            <i className="fas fa-layer-group text-blue-600 text-xl"></i>
          </div>
          <p className="text-3xl font-black text-gray-900">{totalListings}</p>
          <p className="text-xs text-gray-500 mt-2">All properties</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Approved</span>
            <i className="fas fa-check-circle text-green-600 text-xl"></i>
          </div>
          <p className="text-3xl font-black text-green-600">
            {listings.filter((l) => l.isVerified).length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Ready for students</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Pending Review</span>
            <i className="fas fa-clock text-orange-600 text-xl"></i>
          </div>
          <p className="text-3xl font-black text-orange-600">
            {listings.filter((l) => !l.isVerified).length}
          </p>
          <p className="text-xs text-gray-500 mt-2">Awaiting approval</p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <i className="fas fa-filter text-blue-600"></i> Filters & Search
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-search mr-2 text-blue-600"></i> Search
            </label>
            <input
              type="text"
              placeholder="Title, owner, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-tag mr-2 text-purple-600"></i> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Status</option>
              <option value="true">Approved</option>
              <option value="false">Pending</option>
            </select>
          </div>

          {/* City Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-map-marker-alt mr-2 text-red-600"></i> City
            </label>
            <select
              value={cityFilter}
              onChange={(e) => {
                setCityFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-sort mr-2 text-green-600"></i> Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="createdAt">Date Added</option>
              <option value="title">Title</option>
              <option value="rent">Rent Price</option>
            </select>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-arrow-up-down mr-2 text-indigo-600"></i> Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Reset Filters Button */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('');
              setCityFilter('');
              setSortBy('createdAt');
              setSortOrder('desc');
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
          >
            <i className="fas fa-redo"></i> Reset Filters
          </button>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  <i className="fas fa-home mr-2 text-blue-600"></i> Listing
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  <i className="fas fa-user mr-2 text-green-600"></i> Owner
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  <i className="fas fa-map-marker-alt mr-2 text-red-600"></i> Location
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  <i className="fas fa-money-bill-wave mr-2 text-green-600"></i> Rent
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  <i className="fas fa-badge-check mr-2 text-purple-600"></i> Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                  <i className="fas fa-cogs mr-2 text-gray-600"></i> Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing, idx) => (
                <tr
                  key={listing._id}
                  className={`border-b border-gray-200 hover:bg-blue-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div
                      onClick={() => {
                        setSelectedListing(listing);
                        setShowDetailModal(true);
                      }}
                      className="cursor-pointer hover:text-blue-600 transition"
                    >
                      <p className="font-semibold text-gray-900">{listing.title}</p>
                      <p className="text-xs text-gray-500">{listing._id.slice(0, 8)}...</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{listing.ownerId?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{listing.ownerId?.email || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-map-marker-alt text-red-600 text-sm"></i>
                      <span className="text-gray-900 font-medium">{listing.city}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-green-600">৳{listing.rent.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(listing)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedListing(listing);
                          setShowDetailModal(true);
                        }}
                        className="px-3 py-2 text-xs bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors flex items-center gap-1"
                      >
                        <i className="fas fa-eye"></i> View
                      </button>

                      {!listing.isVerified && (
                        <button
                          onClick={() => handleVerifyListing(listing)}
                          disabled={isProcessing}
                          className="px-3 py-2 text-xs bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-1"
                        >
                          <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-check'}`}></i> Approve
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteListing(listing)}
                        disabled={isProcessing}
                        className="px-3 py-2 text-xs bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors flex items-center gap-1"
                      >
                        <i className="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {listings.length === 0 && (
          <div className="text-center py-12">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 font-medium">No listings found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            <i className="fas fa-chevron-left"></i> Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-3 py-2 rounded-lg font-medium transition ${
                page === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            Next <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-1">{selectedListing.title}</h3>
                <p className="text-blue-100 text-sm">ID: {selectedListing._id}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <p className="text-blue-600 text-sm font-semibold mb-1">
                    <i className="fas fa-check-circle mr-2"></i> Verification Status
                  </p>
                  <p className="text-xl font-bold text-blue-800">
                    {selectedListing.isVerified ? 'Approved' : 'Pending'}
                  </p>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <p className="text-green-600 text-sm font-semibold mb-1">
                    <i className="fas fa-user mr-2"></i> Owner Status
                  </p>
                  <p className="text-xl font-bold text-green-800">
                    {selectedListing.ownerId?.isVerified ? 'Verified' : 'Unverified'}
                  </p>
                </div>
              </div>

              {/* Basic Info */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-600 flex items-center gap-2">
                  <i className="fas fa-info-circle text-blue-600"></i> Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">
                      <i className="fas fa-map-marker-alt mr-2 text-red-600"></i> Location
                    </p>
                    <p className="text-gray-900 font-medium">{selectedListing.city}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">
                      <i className="fas fa-money-bill-wave mr-2 text-green-600"></i> Monthly Rent
                    </p>
                    <p className="text-gray-900 font-bold text-lg">৳{selectedListing.rent.toLocaleString()}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">
                      <i className="fas fa-ruler mr-2 text-purple-600"></i> Size
                    </p>
                    <p className="text-gray-900 font-medium">{selectedListing.size} sqft</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">
                      <i className="fas fa-door-open mr-2 text-blue-600"></i> Rooms
                    </p>
                    <p className="text-gray-900 font-medium">{selectedListing.roomType}</p>
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-600 flex items-center gap-2">
                  <i className="fas fa-user text-green-600"></i> Owner Information
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <p className="text-green-600 text-xs font-bold uppercase tracking-wide mb-1">Owner Name</p>
                    <p className="text-gray-900 font-medium">{selectedListing.ownerId?.name}</p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <p className="text-green-600 text-xs font-bold uppercase tracking-wide mb-1">Email</p>
                    <p className="text-gray-900 font-medium">{selectedListing.ownerId?.email}</p>
                  </div>

                  <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                    <p className="text-green-600 text-xs font-bold uppercase tracking-wide mb-1">Phone</p>
                    <p className="text-gray-900 font-medium">{selectedListing.ownerId?.mobile}</p>
                  </div>

                  <div className="p-3">{getOwnerBadge(selectedListing)}</div>
                </div>
              </div>

              {/* Description */}
              {selectedListing.description && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-yellow-600 flex items-center gap-2">
                    <i className="fas fa-align-left text-yellow-600"></i> Description
                  </h4>
                  <p className="text-gray-700 leading-relaxed">{selectedListing.description}</p>
                </div>
              )}

              {/* Facilities */}
              {selectedListing.facilities && selectedListing.facilities.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-600 flex items-center gap-2">
                    <i className="fas fa-star text-purple-600"></i> Facilities
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedListing.facilities.map((facility, idx) => (
                      <div key={idx} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <p className="text-purple-700 font-medium text-sm">
                          <i className="fas fa-check text-purple-600 mr-2"></i> {facility}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-600 flex items-center gap-2">
                  <i className="fas fa-calendar text-gray-600"></i> Dates
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">Created</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedListing.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 text-xs font-bold uppercase tracking-wide mb-1">Last Updated</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedListing.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6 flex gap-3 flex-wrap">
                <button
                  onClick={() => setShowDetailModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2"
                >
                  <i className="fas fa-times"></i> Close
                </button>

                {!selectedListing.isVerified && (
                  <button
                    onClick={() => {
                      handleVerifyListing(selectedListing);
                      setShowDetailModal(false);
                    }}
                    disabled={isProcessing}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-check-circle'}`}></i> Approve Listing
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDeleteListing(selectedListing);
                    setShowDetailModal(false);
                  }}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i> Delete Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal.open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full">
            <div className={`px-6 py-4 text-white flex justify-between items-center ${
              confirmModal.action === 'delete' ? 'bg-red-600' : 'bg-orange-600'
            }`}>
              <h3 className="text-lg font-bold">{confirmModal.title}</h3>
              <button
                onClick={() => setConfirmModal({ open: false })}
                disabled={isProcessing}
                className="text-white hover:text-gray-200 transition disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-700">{confirmModal.message}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmModal({ open: false })}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
                    if (confirmModal.action === 'delete') {
                      confirmDelete();
                    } else if (confirmModal.action === 'verify') {
                      confirmVerify();
                    }
                  }}
                  disabled={isProcessing}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    confirmModal.action === 'delete'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-orange-600 hover:bg-orange-700'
                  }`}
                >
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : ''}`}></i>
                  {confirmModal.action === 'verify' ? 'Approve' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
