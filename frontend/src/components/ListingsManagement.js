import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';

export const ListingsManagement = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filter states (apply instantly)
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
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
  const [liveStats, setLiveStats] = useState(null);
  const [lastStatsUpdate, setLastStatsUpdate] = useState(null);
  const [statsAutoRefreshInterval, setStatsAutoRefreshInterval] = useState(null);

  // Fetch all listings using current filters
  const fetchListings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const filterParams = {
        page,
        limit: itemsPerPage,
        search: search || undefined,
        isVerified: statusFilter === 'true' ? true : statusFilter === 'false' ? false : undefined,
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
  }, [page, search, statusFilter, cityFilter, sortBy, sortOrder, itemsPerPage]);

  useEffect(() => {
    setPage(1); // Reset to first page when filters change
  }, [search, statusFilter, cityFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle resetting all filters
  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCityFilter('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
  };

  // Fetch live stats for a specific listing
  const fetchLiveStats = useCallback(async (listingId) => {
    try {
      const res = await adminService.getAllListings({ search: listingId, limit: 1 });
      const freshListing = res.data.listings?.[0];
      if (freshListing) {
        setLiveStats({
          views: freshListing.views || 0,
          averageRating: freshListing.averageRating || 0,
          totalRatings: freshListing.totalRatings || 0,
          isFeatured: freshListing.isFeatured || false,
        });
        setLastStatsUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch live stats:', error);
    }
  }, []);

  // Auto-refresh stats every 5 seconds when detail modal is open
  useEffect(() => {
    if (showDetailModal && selectedListing) {
      // Fetch immediately on open
      fetchLiveStats(selectedListing._id);

      // Set up interval for auto-refresh
      const interval = setInterval(() => {
        fetchLiveStats(selectedListing._id);
      }, 5000); // Refresh every 5 seconds

      setStatsAutoRefreshInterval(interval);

      // Cleanup on unmount or when modal closes
      return () => {
        clearInterval(interval);
        setStatsAutoRefreshInterval(null);
      };
    }
  }, [showDetailModal, selectedListing, fetchLiveStats]);

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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <i className="fas fa-tag mr-2 text-purple-600"></i> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Reset Button */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleResetFilters}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
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

      {/* Detail Modal - Professional Design */}
      {showDetailModal && selectedListing && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
            {/* Header with Listing Image and Info */}
            <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-8 py-8 text-white">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
              </div>
              
              {/* Header Content with Image */}
              <div className="relative flex justify-between items-start gap-6">
                {/* Featured Image */}
                <div className="w-32 h-32 rounded-2xl overflow-hidden bg-white/20 flex items-center justify-center shadow-lg flex-shrink-0 border-4 border-white/30 backdrop-blur-sm">
                  {selectedListing.photos && selectedListing.photos[0] ? (
                    <img src={selectedListing.photos[0]} alt={selectedListing.title} className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-image text-white text-5xl"></i>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-4xl font-bold">{selectedListing.title}</h3>
                    {selectedListing.isVerified ? (
                      <span className="px-3 py-1 bg-green-400 text-green-900 rounded-full text-sm font-bold flex items-center gap-1 flex-shrink-0">
                        <i className="fas fa-check-circle"></i> Verified
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-orange-400 text-orange-900 rounded-full text-sm font-bold flex items-center gap-1 flex-shrink-0">
                        <i className="fas fa-clock"></i> Pending
                      </span>
                    )}
                    {selectedListing.isFeatured && (
                      <span className="px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-sm font-bold flex items-center gap-1 flex-shrink-0 animate-pulse">
                        <i className="fas fa-crown"></i> Featured
                      </span>
                    )}
                  </div>
                  <p className="text-blue-100 text-sm mb-1">
                    <i className="fas fa-id-badge mr-2"></i>ID: {selectedListing._id}
                  </p>
                  <p className="text-blue-100 text-sm">
                    <i className="fas fa-map-pin mr-2"></i>{selectedListing.city} • Posted {new Date(selectedListing.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setLiveStats(null);
                    setLastStatsUpdate(null);
                  }}
                  className="text-white hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center transition text-xl font-bold flex-shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8">
              {/* Photos Gallery Section */}
              {selectedListing.photos && selectedListing.photos.length > 0 && (
                <div className="rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg">
                  <div className="bg-gray-100 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                      {/* Main Photo */}
                      <div className="md:col-span-2 bg-gray-900 flex items-center justify-center min-h-80">
                        <img
                          src={selectedListing.photos[0]}
                          alt="Main listing photo"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.src = 'https://via.placeholder.com/500x300?text=Photo')}
                        />
                      </div>
                      {/* Thumbnail strip */}
                      <div className="md:col-span-2 bg-gray-50 p-4 border-t border-gray-200">
                        <p className="text-sm font-bold text-gray-600 mb-2">
                          <i className="fas fa-images mr-2 text-blue-600"></i> Photos ({selectedListing.photos.length})
                        </p>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {selectedListing.photos.map((photo, idx) => (
                            <div key={idx} className="flex-shrink-0 w-20 h-20 rounded-lg border-2 border-gray-300 overflow-hidden hover:border-blue-500 transition cursor-pointer">
                              <img
                                src={photo}
                                alt={`Photo ${idx + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => (e.target.src = 'https://via.placeholder.com/80?text=Img')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* No Photos Message */}
              {(!selectedListing.photos || selectedListing.photos.length === 0) && (
                <div className="rounded-xl border-2 border-dashed border-gray-300 p-8 text-center bg-gray-50">
                  <i className="fas fa-image text-4xl text-gray-300 mb-3"></i>
                  <p className="text-gray-500 font-medium">No photos available for this listing</p>
                </div>
              )}

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-l-4 border-blue-600">
                  <p className="text-blue-600 text-xs font-bold uppercase tracking-wide mb-2">Monthly Rent</p>
                  <p className="text-2xl font-black text-blue-800">৳{selectedListing.rent.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-l-4 border-purple-600">
                  <p className="text-purple-600 text-xs font-bold uppercase tracking-wide mb-2">Size</p>
                  <p className="text-2xl font-black text-purple-800">{selectedListing.size} <span className="text-sm">sqft</span></p>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-l-4 border-green-600">
                  <p className="text-green-600 text-xs font-bold uppercase tracking-wide mb-2">Room Type</p>
                  <p className="text-xl font-black text-green-800">{selectedListing.roomType}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border-l-4 border-red-600">
                  <p className="text-red-600 text-xs font-bold uppercase tracking-wide mb-2">Location</p>
                  <p className="text-lg font-black text-red-800"><i className="fas fa-map-pin mr-1"></i>{selectedListing.city}</p>
                </div>
              </div>

              {/* Statistics Section - LIVE AUTO-UPDATING (From DB) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-indigo-200 relative overflow-hidden shadow-lg">
                {/* Live Update Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 text-xs font-bold text-indigo-600">
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live Stats
                </div>

                <div className="text-center p-4 bg-white rounded-xl shadow-md border border-indigo-100">
                  <div className="text-4xl font-black text-indigo-600 mb-2">
                    <i className="fas fa-eye"></i>
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">{liveStats?.views ?? selectedListing.views ?? 0}</p>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Views</p>
                </div>

                <div className="text-center p-4 bg-white rounded-xl shadow-md border border-yellow-100">
                  <div className="text-4xl font-black text-yellow-500 mb-2">
                    <i className="fas fa-star"></i>
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {liveStats?.averageRating ?? selectedListing.averageRating ? (liveStats?.averageRating ?? selectedListing.averageRating).toFixed(1) : '0.0'}
                  </p>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Rating</p>
                </div>

                <div className="text-center p-4 bg-white rounded-xl shadow-md border border-rose-100">
                  <div className="text-4xl font-black text-rose-600 mb-2">
                    <i className="fas fa-heart"></i>
                  </div>
                  <p className="text-3xl font-black text-gray-900 mb-1">{liveStats?.totalRatings ?? selectedListing.totalRatings ?? 0}</p>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Reviews</p>
                </div>

                <div className="text-center p-4 bg-white rounded-xl shadow-md border border-green-100">
                  <div className="text-3xl font-black text-green-600 mb-2">{selectedListing.size}</div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    <i className="fas fa-ruler-combined mr-1"></i>sqft
                  </p>
                </div>

                <div className="text-center p-4 bg-white rounded-xl shadow-md border border-purple-100">
                  <div className={`text-2xl font-black mb-2 ${liveStats?.isFeatured ?? selectedListing.isFeatured ? 'text-yellow-500 animate-bounce' : 'text-gray-400'}`}>
                    <i className="fas fa-crown"></i>
                  </div>
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                    {liveStats?.isFeatured ?? selectedListing.isFeatured ? 'Featured' : 'Regular'}
                  </p>
                </div>

                {/* Last Update Timestamp */}
                {lastStatsUpdate && (
                  <div className="absolute bottom-3 right-4 text-xs text-gray-500">
                    <i className="fas fa-sync-alt mr-1"></i>Updated: {lastStatsUpdate.toLocaleTimeString()}
                  </div>
                )}
              </div>

              {/* Main Info Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Listing Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Description */}
                  {selectedListing.description && (
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b-2 border-blue-600 flex items-center gap-2">
                        <i className="fas fa-file-alt text-blue-600"></i> Description
                      </h4>
                      <p className="text-gray-700 leading-relaxed text-base">{selectedListing.description}</p>
                    </div>
                  )}

                  {/* Facilities */}
                  {selectedListing.facilities && selectedListing.facilities.length > 0 && (
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b-2 border-purple-600 flex items-center gap-2">
                        <i className="fas fa-home text-purple-600"></i> Amenities & Facilities
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedListing.facilities.map((facility, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-200">
                            <i className="fas fa-check-circle text-purple-600"></i>
                            <span className="text-gray-800 font-medium text-sm">{facility}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Owner Card Sidebar */}
                <div className="space-y-6">
                  {/* Owner Info Card */}
                  <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-3xl mb-3 shadow-md">
                        <i className="fas fa-user"></i>
                      </div>
                      <h4 className="text-lg font-bold text-gray-900">{selectedListing.ownerId?.name}</h4>
                      <div className="mt-2">
                        {selectedListing.ownerId?.isVerified ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-bold">
                            <i className="fas fa-badge-check"></i> Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-500 text-white rounded-full text-xs font-bold">
                            <i className="fas fa-exclamation-circle"></i> Unverified
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3 border-t-2 border-green-200 pt-4">
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                          <i className="fas fa-envelope mr-2"></i> Email
                        </p>
                        <p className="text-sm text-gray-800 font-medium break-all">{selectedListing.ownerId?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">
                          <i className="fas fa-phone mr-2"></i> Phone
                        </p>
                        <p className="text-sm text-gray-800 font-medium">{selectedListing.ownerId?.phoneNo || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Card */}
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-300">
                    <h4 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gray-400 flex items-center gap-2">
                      <i className="fas fa-history text-gray-600"></i> Timeline
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                          <i className="fas fa-calendar-plus mr-2"></i> Created
                        </p>
                        <p className="text-sm text-gray-800 font-medium">
                          {new Date(selectedListing.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">
                          <i className="fas fa-calendar-check mr-2"></i> Last Updated
                        </p>
                        <p className="text-sm text-gray-800 font-medium">
                          {new Date(selectedListing.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t-2 border-gray-200 pt-8 grid grid-cols-2 md:grid-cols-3 gap-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 rounded-lg hover:from-gray-300 hover:to-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105 duration-200"
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
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                  >
                    <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-check-circle'}`}></i> Approve
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDeleteListing(selectedListing);
                    setShowDetailModal(false);
                  }}
                  disabled={isProcessing}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-lg hover:from-red-600 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 duration-200"
                >
                  <i className={`fas ${isProcessing ? 'fa-spinner fa-spin' : 'fa-trash-alt'}`}></i> Delete
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
