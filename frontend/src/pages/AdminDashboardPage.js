import React, { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/api';
import UserManagement from '../components/UserManagement';

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [unverifiedOwners, setUnverifiedOwners] = useState([]);
  const [unverifiedListings, setUnverifiedListings] = useState([]);
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('dashboard');
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      if (tab === 'dashboard') {
        const res = await adminService.getDashboardStats();
        setStats(res.data.stats);
      } else if (tab === 'users') {
        // Users tab is handled by UserManagement component
        return;
      } else if (tab === 'owners') {
        const res = await adminService.getUnverifiedOwners();
        setUnverifiedOwners(res.data.owners);
      } else if (tab === 'listings') {
        const res = await adminService.getUnverifiedListings();
        setUnverifiedListings(res.data.listings);
      } else if (tab === 'flags') {
        const res = await adminService.getFlags();
        setFlags(res.data.flags);
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleVerifyOwner = async (userId) => {
    try {
      // Fetch full owner profile so admin can inspect all fields before approving
      const res = await adminService.getOwnerById(userId);
      const owner = res.data.user;
      const summary = `Approve owner?\nName: ${owner.name}\nEmail: ${owner.email}\nPhone: ${owner.phoneNo || 'N/A'}\nNID: ${owner.nidNumber || 'N/A'}`;
      if (!window.confirm(summary)) return;
      await adminService.verifyOwner(userId);
      alert('Owner verified!');
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to verify owner');
    }
  };

  const handleVerifyListing = async (listingId) => {
    try {
      await adminService.verifyListing(listingId);
      alert('Listing verified!');
      fetchData();
    } catch (err) {
      alert('Failed to verify listing');
    }
  };

  const handleResolveFlag = async (flagId) => {
    const notes = prompt('Admin notes (optional):');
    try {
      await adminService.resolveFlag(flagId, notes);
      alert('Flag resolved!');
      fetchData();
    } catch (err) {
      alert('Failed to resolve flag');
    }
  };

  if (loading && tab !== 'users') return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {tab !== 'users' && <h1 className="text-3xl font-bold mb-8"><i className="fas fa-shield-alt text-blue-600"></i> Admin Dashboard</h1>}

        {error && tab !== 'users' && <div className="bg-red-100 text-red-700 p-4 rounded mb-4"><i className="fas fa-exclamation-circle"></i> {error}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b overflow-x-auto">
          {[
            { name: 'dashboard', icon: 'fas fa-chart-pie', label: 'Dashboard' },
            { name: 'users', icon: 'fas fa-users', label: 'Users' },
            { name: 'owners', icon: 'fas fa-home', label: 'Owners' },
            { name: 'listings', icon: 'fas fa-list', label: 'Listings' },
            { name: 'flags', icon: 'fas fa-flag', label: 'Flags' }
          ].map((t) => (
            <button
              key={t.name}
              onClick={() => setTab(t.name)}
              className={`px-6 py-3 font-semibold flex items-center gap-2 whitespace-nowrap ${
                tab === t.name
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <i className={t.icon}></i> {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {tab === 'dashboard' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.users.total },
              { label: 'Student Users', value: stats.users.students },
              { label: 'Owner Users', value: stats.users.owners },
              { label: 'Total Listings', value: stats.listings.total },
              { label: 'Verified Listings', value: stats.listings.verified },
              { label: 'Total Bookings', value: stats.bookings.total },
              { label: 'Completed Bookings', value: stats.bookings.completed },
              { label: 'Total Reviews', value: stats.reviews },
              { label: 'Unresolved Flags', value: stats.unresolvedFlags },
            ].map((stat, idx) => (
              <div key={idx} className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm font-semibold">{stat.label}</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Users Management Tab */}
        {tab === 'users' && (
          <UserManagement />
        )}

        {/* Unverified Owners Tab */}
        {tab === 'owners' && (
          <div className="space-y-4">
            {unverifiedOwners.length === 0 ? (
              <p className="text-gray-600">All owners are verified!</p>
            ) : (
              unverifiedOwners.map((owner) => (
                <div key={owner._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{owner.name}</h3>
                      <p className="text-gray-600">{owner.email}</p>
                      <p className="text-gray-600">{owner.phoneNo}</p>
                    </div>
                    <button
                      onClick={() => handleVerifyOwner(owner._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Verify Owner
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Unverified Listings Tab */}
        {tab === 'listings' && (
          <div className="space-y-4">
            {unverifiedListings.length === 0 ? (
              <p className="text-gray-600">All listings are verified!</p>
            ) : (
              unverifiedListings.map((listing) => (
                <div key={listing._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{listing.title}</h3>
                      <p className="text-gray-600">{listing.address}, {listing.city}</p>
                      <p className="text-sm mt-2">
                        <strong>Owner:</strong> {listing.ownerId?.name} {listing.ownerId?.isVerified ? '✓' : '(Not verified)'}
                      </p>
                      <p>
                        <strong>Rent:</strong> ৳{listing.rent} | <strong>Type:</strong> {listing.type}
                      </p>
                    </div>
                    <button
                      onClick={() => handleVerifyListing(listing._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 whitespace-nowrap"
                    >
                      Verify Listing
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Flags Tab */}
        {tab === 'flags' && (
          <div className="space-y-4">
            {flags.length === 0 ? (
              <p className="text-gray-600">No flags yet</p>
            ) : (
              flags.map((flag) => (
                <div key={flag._id} className={`rounded-lg shadow p-6 ${flag.resolved ? 'bg-gray-100' : 'bg-white'}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">{flag.listingId?.title}</h3>
                      <p className="text-gray-600 mb-2">Flagged by: {flag.flaggedBy?.name}</p>
                      <p className="text-gray-700 font-semibold">Reason:</p>
                      <p className="text-gray-600 mb-2">{flag.reason}</p>
                      {flag.resolved && flag.adminNotes && (
                        <div className="bg-blue-50 p-3 rounded mt-2">
                          <p className="text-sm font-semibold">Admin Notes:</p>
                          <p className="text-sm">{flag.adminNotes}</p>
                        </div>
                      )}
                    </div>
                    {!flag.resolved && (
                      <button
                        onClick={() => handleResolveFlag(flag._id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 whitespace-nowrap"
                      >
                        Resolve Flag
                      </button>
                    )}
                    {flag.resolved && (
                      <span className="bg-green-100 text-green-800 px-4 py-2 rounded font-semibold">✓ Resolved</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
