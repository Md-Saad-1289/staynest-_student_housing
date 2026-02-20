import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { StatCard } from '../components/Dashboard/StatCard';
import { DataTable } from '../components/Dashboard/DataTable';
import { StatusBadge } from '../components/Dashboard/StatusBadge';
import { ConfirmModal } from '../components/Dashboard/ConfirmModal';
import { adminService } from '../services/api';

export const AdminSuperDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [unverifiedOwners, setUnverifiedOwners] = useState([]);
  const [unverifiedListings, setUnverifiedListings] = useState([]);
  const [allListings, setAllListings] = useState([]);
  const [featuredListings, setFeaturedListings] = useState([]);
  const [flags, setFlags] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ open: false });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVerified, setFilterVerified] = useState('');
  const [newTestimonial, setNewTestimonial] = useState({ name: '', tag: '', text: '', rating: 5, approved: false });
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  // Tab color mapping
  const getTabClasses = (tabId) => {
    const colorMap = {
      overview: 'border-blue-600 text-blue-600 bg-blue-50',
      featured: 'border-yellow-600 text-yellow-600 bg-yellow-50',
      listings: 'border-green-600 text-green-600 bg-green-50',
      testimonials: 'border-purple-600 text-purple-600 bg-purple-50',
    };
    return colorMap[tabId] || colorMap.overview;
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      if (activeTab === 'overview') {
        // Fetch all data for overview tab
        const [statsRes, ownersRes, listingsRes, flagsRes] = await Promise.all([
          adminService.getDashboardStats().catch(() => ({ data: { stats: {} } })),
          adminService.getUnverifiedOwners().catch(() => ({ data: { owners: [] } })),
          adminService.getUnverifiedListings().catch(() => ({ data: { listings: [] } })),
          adminService.getFlags().catch(() => ({ data: { flags: [] } })),
        ]);
        
        setStats(statsRes.data.stats);
        setUnverifiedOwners(ownersRes.data.owners || []);
        setUnverifiedListings(listingsRes.data.listings || []);
        setFlags(flagsRes.data.flags || []);
      } else if (activeTab === 'featured') {
        // Fetch featured and all verified listings
        const [featuredRes, allRes] = await Promise.all([
          adminService.getFeaturedListings().catch(() => ({ data: { listings: [] } })),
          adminService.getAllListings({ verified: 'true' }).catch(() => ({ data: { listings: [] } })),
        ]);
        
        setFeaturedListings(featuredRes.data.listings || []);
        setAllListings(allRes.data.listings || []);
      } else if (activeTab === 'listings') {
        // Fetch listings with filters
        const allRes = await adminService.getAllListings({ 
          search: searchQuery,
          verified: filterVerified || undefined
        }).catch(() => ({ data: { listings: [] } }));
        
        setAllListings(allRes.data.listings || []);
      } else if (activeTab === 'testimonials') {
        // Fetch all testimonials
        const testimonialsRes = await adminService.getAllTestimonials()
          .catch(() => ({ data: { testimonials: [] } }));
        
        setTestimonials(testimonialsRes.data.testimonials || []);
      }
    } catch (err) {
      setError('Failed to load data: ' + (err.message || 'Unknown error'));
      console.error('Data fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery, filterVerified]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerifyOwner = async (userId) => {
    try {
      await adminService.verifyOwner(userId);
      alert('✓ Owner verified successfully!');
      fetchData();
    } catch (err) {
      setError('Failed to verify owner: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleVerifyListing = async (listingId) => {
    try {
      await adminService.verifyListing(listingId);
      alert('✓ Listing verified successfully!');
      fetchData();
    } catch (err) {
      setError('Failed to verify listing: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleFeatured = async (listingId, currentStatus) => {
    try {
      await adminService.toggleFeaturedListing(listingId);
      alert(`✓ Listing ${currentStatus ? 'removed from' : 'added to'} featured list!`);
      fetchData();
    } catch (err) {
      setError('Failed to update featured status: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleResolveFlag = async (flagId) => {
    const notes = prompt('Admin notes (optional):');
    if (notes !== null) {
      try {
        await adminService.resolveFlag(flagId, notes);
        alert('✓ Flag resolved!');
        fetchData();
      } catch (err) {
        setError('Failed to resolve flag: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  // Testimonial handlers with improved error handling
  const handleCreateTestimonial = async () => {
    try {
      if (!newTestimonial.name || !newTestimonial.tag || !newTestimonial.text) {
        setError('Please fill all required fields');
        return;
      }
      await adminService.createTestimonial(newTestimonial);
      alert('✓ Testimonial created successfully!');
      setNewTestimonial({ name: '', tag: '', text: '', rating: 5, approved: false });
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to create testimonial: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateTestimonial = async () => {
    try {
      if (!editingTestimonial.name || !editingTestimonial.tag || !editingTestimonial.text) {
        setError('Please fill all required fields');
        return;
      }
      await adminService.updateTestimonial(editingTestimonial._id, editingTestimonial);
      alert('✓ Testimonial updated successfully!');
      setEditingTestimonial(null);
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to update testimonial: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteTestimonial = async (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      try {
        await adminService.deleteTestimonial(id);
        alert('✓ Testimonial deleted!');
        setError('');
        fetchData();
      } catch (err) {
        setError('Failed to delete testimonial: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      await adminService.toggleApproval(id);
      alert(`✓ Testimonial ${currentStatus ? 'unapproved' : 'approved'}!`);
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to toggle approval: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleToggleTestimonialFeatured = async (id, currentStatus) => {
    try {
      await adminService.toggleFeatured(id);
      alert(`✓ Testimonial ${currentStatus ? 'removed from' : 'added to'} featured!`);
      setError('');
      fetchData();
    } catch (err) {
      setError('Failed to toggle featured: ' + (err.response?.data?.error || err.message));
    }
  };

  // Table Columns
  const ownersColumns = [
    {
      key: 'name',
      label: 'Owner',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'mobile',
      label: 'Contact',
      render: (row) => <span className="text-sm text-gray-700">{row.mobile}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleVerifyOwner(row._id)}
          className="px-3 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded-lg font-medium transition-colors"
        >
          <i className="fas fa-check mr-1"></i> Verify
        </button>
      ),
    },
  ];

  const listingsColumns = [
    {
      key: 'title',
      label: 'Listing',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-500">{row.city}</p>
        </div>
      ),
    },
    {
      key: 'rent',
      label: 'Rent',
      render: (row) => <span className="font-medium">৳{row.rent?.toLocaleString()}</span>,
    },
    {
      key: 'verified',
      label: 'Status',
      render: (row) => (
        <StatusBadge status={row.verified ? 'verified' : 'pending'} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          {!row.verified && (
            <button
              onClick={() => handleVerifyListing(row._id)}
              className="px-2 py-1 text-xs bg-green-50 text-green-600 hover:bg-green-100 rounded font-medium transition-colors"
            >
              <i className="fas fa-check mr-1"></i> Verify
            </button>
          )}
        </div>
      ),
    },
  ];

  const featuredColumns = [
    {
      key: 'title',
      label: 'Listing',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.title}</p>
          <p className="text-xs text-gray-500">{row.city} • ৳{row.rent?.toLocaleString()}</p>
        </div>
      ),
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.ownerId?.name}</p>
          <p className="text-xs text-gray-500">{row.ownerId?.email}</p>
        </div>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) => (
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${row.isFeatured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {row.isFeatured ? '✓ Featured' : 'Not Featured'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <button
          onClick={() => handleToggleFeatured(row._id, row.isFeatured)}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
            row.isFeatured 
              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
          }`}
        >
          <i className={`fas fa-${row.isFeatured ? 'times' : 'star'} mr-1`}></i>
          {row.isFeatured ? 'Remove' : 'Feature'}
        </button>
      ),
    },
  ];

  const flagsColumns = [
    {
      key: 'listing',
      label: 'Listing',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900">{row.listingId?.title}</p>
          <p className="text-xs text-gray-500">Flagged by: {row.flaggedBy?.name}</p>
        </div>
      ),
    },
    {
      key: 'reason',
      label: 'Reason',
      render: (row) => <span className="text-sm text-gray-700">{row.reason}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusBadge status={row.resolved ? 'resolved' : 'pending'} />
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        !row.resolved && (
          <button
            onClick={() => handleResolveFlag(row._id)}
            className="px-3 py-1 text-xs bg-orange-50 text-orange-600 hover:bg-orange-100 rounded-lg font-medium transition-colors"
          >
            <i className="fas fa-check mr-1"></i> Resolve
          </button>
        )
      ),
    },
  ];

  if (loading && activeTab === 'overview') {
    return <div className="flex items-center justify-center min-h-screen"><i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i></div>;
  }

  return (
    <DashboardLayout title="Super Admin Dashboard">
      {/* Error Message with Dismiss */}
      {error && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg flex items-center justify-between gap-3 border border-red-200 shadow-sm text-xs sm:text-base">
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <i className="fas fa-exclamation-circle text-lg flex-shrink-0 hidden sm:inline"></i>
            <span className="font-medium">{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-red-500 hover:text-red-700 font-bold text-xl leading-none flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* Admin Header - Mobile Responsive */}
      <div className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg px-3 sm:px-6 py-4 sm:py-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            <h1 className="text-xl sm:text-4xl font-bold mb-2 flex items-center gap-2 sm:gap-3">
              <i className="fas fa-crown text-yellow-300 text-sm sm:text-2xl"></i><span>Super Admin</span>
            </h1>
            <p className="hidden sm:block text-blue-100 text-base sm:text-lg">Manage all platform operations, verify users & listings, control featured content & testimonials</p>
            <p className="sm:hidden text-blue-100 text-xs mb-2">Manage platform operations, verify users & listings</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-xs sm:text-sm">
              <div className="flex items-center gap-2 text-blue-100">
                <i className="fas fa-shield-alt text-green-300"></i>
                <span>Full Control</span>
              </div>
              <div className="flex items-center gap-2 text-blue-100">
                <i className="fas fa-check-circle text-green-300"></i>
                <span>All Active</span>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-auto text-center sm:text-right bg-white/10 backdrop-blur-sm rounded-lg p-2 sm:p-4 border border-white/20 text-xs sm:text-base">
            <p className="text-blue-100">Welcome</p>
            <p className="font-bold">Super Admin</p>
            <p className="text-green-300 mt-1">✓ All Permissions</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Mobile Responsive */}
      <div className="mb-6 sm:mb-8 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto scrollbar-hide">
          {[
            { id: 'overview', label: 'Dashboard', icon: 'fas fa-chart-line' },
            { id: 'featured', label: 'Featured Listings', icon: 'fas fa-star' },
            { id: 'listings', label: 'All Listings', icon: 'fas fa-list' },
            { id: 'testimonials', label: 'What Students Say', icon: 'fas fa-comment-dots' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 sm:px-6 py-2 sm:py-4 font-semibold text-xs sm:text-base transition-all whitespace-nowrap flex items-center justify-center gap-1 sm:gap-2 border-b-2 ${
                activeTab === tab.id
                  ? getTabClasses(tab.id)
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <i className={`${tab.icon} hidden sm:inline`}></i>
              <span className="hidden xs:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && stats && (
        <>
          {/* Dashboard Summary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <i className="fas fa-chart-line text-blue-600 mr-2"></i>
              Platform Overview
            </h2>
            <p className="text-gray-600">Real-time statistics and pending actions for platform management</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
            <StatCard
              icon="fas fa-users"
              label="Total Users"
              value={stats.users?.total}
              subtext={`${stats.users?.owners} owners, ${stats.users?.students} students`}
              color="blue"
            />
            <StatCard
              icon="fas fa-home"
              label="Total Listings"
              value={stats.listings?.total}
              subtext={`${stats.listings?.verified} verified`}
              color="green"
            />
            <StatCard
              icon="fas fa-calendar-check"
              label="Total Bookings"
              value={stats.bookings?.total}
              subtext={`${stats.bookings?.completed} completed`}
              color="purple"
            />
            <StatCard
              icon="fas fa-flag"
              label="Unresolved Flags"
              value={stats.unresolvedFlags}
              subtext="Pending reports"
              color="red"
            />
          </div>

          {/* Priority Actions */}
          {(unverifiedOwners.length > 0 || unverifiedListings.length > 0 || flags.length > 0) && (
            <div className="bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-red-900 mb-3">
                <i className="fas fa-exclamation-circle mr-2"></i>
                Actions Required
              </h3>
              <ul className="text-sm text-red-800 space-y-1">
                {unverifiedOwners.length > 0 && <li>✓ <strong>{unverifiedOwners.length}</strong> owners awaiting verification</li>}
                {unverifiedListings.length > 0 && <li>✓ <strong>{unverifiedListings.length}</strong> listings awaiting verification</li>}
                {flags.length > 0 && <li>✓ <strong>{flags.filter(f => !f.resolved).length}</strong> flags awaiting resolution</li>}
              </ul>
            </div>
          )}

          {/* Unverified Owners */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="fas fa-user-check text-blue-600 mr-2"></i>
              Unverified Owners ({unverifiedOwners.length})
            </h2>
            <DataTable 
              columns={ownersColumns} 
              data={unverifiedOwners} 
              emptyMessage="All owners are verified! ✓"
            />
          </div>

          {/* Unverified Listings */}
          <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="fas fa-list-check text-blue-600 mr-2"></i>
              Unverified Listings ({unverifiedListings.length})
            </h2>
            <DataTable 
              columns={listingsColumns} 
              data={unverifiedListings} 
              emptyMessage="All listings are verified!"
            />
          </div>

          {/* Flagged Listings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              <i className="fas fa-flag text-red-600 mr-2"></i>
              Flagged Listings ({flags.length})
            </h2>
            <DataTable 
              columns={flagsColumns} 
              data={flags} 
              emptyMessage="No flags to review"
            />
          </div>
        </>
      )}

      {/* Featured Listings Tab */}
      {activeTab === 'featured' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  <i className="fas fa-star text-yellow-500 mr-2"></i>
                  Manage Featured Listings
                </h2>
                <p className="text-gray-600">Featured listings appear in the "Popular Mess & Hostels" section on the homepage. Admins can easily toggle featured status for any verified listing.</p>
              </div>
              <div className="text-right bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-gray-600 text-sm">Currently Featured</p>
                <p className="text-3xl font-bold text-yellow-600">{featuredListings.length}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 rounded">
              <p className="text-blue-900 text-xs sm:text-sm font-medium">Total Verified</p>
              <p className="text-2xl font-bold text-blue-600">{allListings.length}</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-900 text-sm font-medium">Available for Featuring</p>
              <p className="text-2xl font-bold text-green-600">{allListings.filter(l => !l.isFeatured).length}</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-900 text-sm font-medium">Featured Percentage</p>
              <p className="text-2xl font-bold text-yellow-600">{allListings.length > 0 ? Math.round((featuredListings.length / allListings.length) * 100) : 0}%</p>
            </div>
          </div>

          {/* Feature Instructions */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">
              <i className="fas fa-lightbulb text-blue-600 mr-2"></i>Best Practices
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Feature high-rated listings to boost visibility</li>
              <li>✓ Rotate featured listings to support all property owners</li>
              <li>✓ Feature 3-6 listings for optimal homepage display</li>
            </ul>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by listing title, address, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <DataTable 
            columns={featuredColumns} 
            data={allListings} 
            emptyMessage="No verified listings available. Please verify some listings first."
          />
        </div>
      )}

      {/* All Listings Tab */}
      {activeTab === 'listings' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <i className="fas fa-list text-green-600 mr-2"></i>
              All Listings Management
            </h2>
            <p className="text-gray-600 mb-4">Search and filter through all listings in the system. Admins can verify unverified listings here.</p>

            {/* Filter Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Listings</label>
                <input
                  type="text"
                  placeholder="Search by title, address, owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Verification Status</label>
                <select
                  value={filterVerified}
                  onChange={(e) => setFilterVerified(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Verified Only</option>
                  <option value="false">Unverified Only</option>
                </select>
              </div>
            </div>
          </div>

          <DataTable 
            columns={listingsColumns} 
            data={allListings} 
            emptyMessage="No listings found"
          />
        </div>
      )}

      {/* Testimonials Tab */}
      {activeTab === 'testimonials' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              <i className="fas fa-comment-dots text-purple-600 mr-2"></i>
              Manage Student Testimonials
            </h2>
            <p className="text-gray-600 mb-4">Control what students say about your platform on the homepage. Create, edit, approve, and feature testimonials.</p>
          </div>

          {/* Create New Testimonial Form */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="fas fa-plus text-purple-600 mr-2"></i>
              {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Student name"
                value={editingTestimonial ? editingTestimonial.name : newTestimonial.name}
                onChange={(e) => {
                  if (editingTestimonial) {
                    setEditingTestimonial({ ...editingTestimonial, name: e.target.value });
                  } else {
                    setNewTestimonial({ ...newTestimonial, name: e.target.value });
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="text"
                placeholder="Tag (e.g., BUET Student)"
                value={editingTestimonial ? editingTestimonial.tag : newTestimonial.tag}
                onChange={(e) => {
                  if (editingTestimonial) {
                    setEditingTestimonial({ ...editingTestimonial, tag: e.target.value });
                  } else {
                    setNewTestimonial({ ...newTestimonial, tag: e.target.value });
                  }
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <textarea
              placeholder="What did they say? (Testimonial text)"
              value={editingTestimonial ? editingTestimonial.text : newTestimonial.text}
              onChange={(e) => {
                if (editingTestimonial) {
                  setEditingTestimonial({ ...editingTestimonial, text: e.target.value });
                } else {
                  setNewTestimonial({ ...newTestimonial, text: e.target.value });
                }
              }}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={editingTestimonial ? editingTestimonial.rating : newTestimonial.rating}
                  onChange={(e) => {
                    if (editingTestimonial) {
                      setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) });
                    } else {
                      setNewTestimonial({ ...newTestimonial, rating: parseInt(e.target.value) });
                    }
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="1">1 Star</option>
                  <option value="2">2 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="5">5 Stars</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={editingTestimonial ? editingTestimonial.approved : newTestimonial.approved}
                    onChange={(e) => {
                      if (editingTestimonial) {
                        setEditingTestimonial({ ...editingTestimonial, approved: e.target.checked });
                      } else {
                        setNewTestimonial({ ...newTestimonial, approved: e.target.checked });
                      }
                    }}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium">Approve immediately</span>
                </label>
              </div>
              <div className="flex gap-2 items-end">
                <button
                  onClick={editingTestimonial ? handleUpdateTestimonial : handleCreateTestimonial}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <i className={`fas fa-${editingTestimonial ? 'save' : 'plus'} mr-1`}></i>
                  {editingTestimonial ? 'Update' : 'Create'}
                </button>
                {editingTestimonial && (
                  <button
                    onClick={() => setEditingTestimonial(null)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-blue-900 text-sm font-medium">Total Testimonials</p>
              <p className="text-2xl font-bold text-blue-600">{testimonials.length}</p>
            </div>
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="text-green-900 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-600">{testimonials.filter(t => t.approved).length}</p>
            </div>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="text-yellow-900 text-sm font-medium">Featured</p>
              <p className="text-2xl font-bold text-yellow-600">{testimonials.filter(t => t.featured).length}</p>
            </div>
          </div>

          {/* Testimonials Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-300">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Student</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Testimonial</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rating</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                      <i className="fas fa-inbox text-2xl mb-2"></i>
                      <p>No testimonials yet</p>
                    </td>
                  </tr>
                ) : (
                  testimonials.map(t => (
                    <tr key={t._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-500">{t.tag}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-700 truncate">"{t.text.substring(0, 50)}..."</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`fas fa-star text-xs ${i < t.rating ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 flex-col">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${t.approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {t.approved ? '✓ Approved' : 'Pending'}
                          </span>
                          {t.featured && <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-700">⭐ Featured</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 flex-col">
                          <button
                            onClick={() => setEditingTestimonial(t)}
                            className="px-2 py-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 rounded font-medium transition-colors"
                          >
                            <i className="fas fa-edit mr-1"></i>Edit
                          </button>
                          <button
                            onClick={() => handleToggleApproval(t._id, t.approved)}
                            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${t.approved ? 'bg-gray-50 text-gray-600 hover:bg-gray-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                          >
                            <i className={`fas fa-${t.approved ? 'ban' : 'check'} mr-1`}></i>
                            {t.approved ? 'Unapprove' : 'Approve'}
                          </button>
                          <button
                            onClick={() => handleToggleTestimonialFeatured(t._id, t.featured)}
                            className={`px-2 py-1 text-xs rounded font-medium transition-colors ${t.featured ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                          >
                            <i className={`fas fa-${t.featured ? 'times' : 'star'} mr-1`}></i>
                            {t.featured ? 'Unfeature' : 'Feature'}
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(t._id)}
                            className="px-2 py-1 text-xs bg-red-50 text-red-600 hover:bg-red-100 rounded font-medium transition-colors"
                          >
                            <i className="fas fa-trash mr-1"></i>Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.open}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ open: false })}
      />
    </DashboardLayout>
  );
};

export default AdminSuperDashboardPage;
