import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { listingService } from '../services/api';
import { ListingCard } from '../components/ListingCard';
import SaveSearchButton from '../components/SaveSearchButton';
import ListingComparisonModal from '../components/ListingComparisonModal';

const MOCK = [
  {
    _id: 'm1',
    title: 'Dhanmondi Female Mess',
    address: 'Dhanmondi, Dhaka',
    rent: 6000,
    type: 'mess',
    genderAllowed: 'female',
    verified: true,
    photos: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=60'],
    averageRating: 4.6,
    views: 342,
    isFeatured: true,
  },
  {
    _id: 'm2',
    title: 'Mirpur Budget Hostel',
    address: 'Mirpur, Dhaka',
    rent: 4500,
    type: 'hostel',
    genderAllowed: 'male',
    verified: true,
    photos: ['https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=60'],
    averageRating: 4.2,
    views: 156,
    isFeatured: false,
  },
  {
    _id: 'm3',
    title: 'Gulshan Mixed Mess',
    address: 'Gulshan, Dhaka',
    rent: 8000,
    type: 'mess',
    genderAllowed: 'both',
    verified: false,
    photos: ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=60'],
    averageRating: 4.8,
    views: 89,
    isFeatured: false,
  },
];

export const ListingsPage = () => {
  const location = useLocation();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');

  // Filter state
  const [filters, setFilters] = useState({
    minRent: '',
    maxRent: '',
    city: '',
    gender: '',
    type: '',
    verified: false,
    sort: 'newest',
  });

  const itemsPerPage = 12;

  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const params = {};
    const city = q.get('city');
    const minRent = q.get('minRent');
    const maxRent = q.get('maxRent');
    const gender = q.get('gender');

    if (city) {
      params.city = city;
      setFilters(prev => ({ ...prev, city }));
    }
    if (minRent) {
      params.minRent = minRent;
      setFilters(prev => ({ ...prev, minRent }));
    }
    if (maxRent) {
      params.maxRent = maxRent;
      setFilters(prev => ({ ...prev, maxRent }));
    }
    if (gender) {
      params.genderAllowed = gender;
      setFilters(prev => ({ ...prev, gender }));
    }

    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await listingService.getListings(params);
        const data = res?.data?.listings || MOCK;
        setListings(data);
        applyFiltersAndSort(data, filters);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load listings');
        setListings(MOCK);
        applyFiltersAndSort(MOCK, filters);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, [location.search]);

  const applyFiltersAndSort = (listingsToFilter, currentFilters) => {
    let result = [...listingsToFilter];

    // Apply filters
    if (currentFilters.minRent) {
      result = result.filter(l => l.rent >= parseInt(currentFilters.minRent));
    }
    if (currentFilters.maxRent) {
      result = result.filter(l => l.rent <= parseInt(currentFilters.maxRent));
    }
    if (currentFilters.city) {
      result = result.filter(l => l.city === currentFilters.city);
    }
    if (currentFilters.gender) {
      result = result.filter(l => l.genderAllowed === currentFilters.gender || l.genderAllowed === 'both');
    }
    if (currentFilters.type) {
      result = result.filter(l => l.type === currentFilters.type);
    }
    if (currentFilters.verified) {
      result = result.filter(l => l.verified);
    }

    // Search query (title / address / area)
    if (currentFilters.query) {
      const q = currentFilters.query.toLowerCase();
      result = result.filter(l => (
        (l.title || '').toLowerCase().includes(q) ||
        (l.address || '').toLowerCase().includes(q) ||
        (l.city || '').toLowerCase().includes(q)
      ));
    }

    // Apply sort
    if (currentFilters.sort === 'price-low') {
      result.sort((a, b) => a.rent - b.rent);
    } else if (currentFilters.sort === 'price-high') {
      result.sort((a, b) => b.rent - a.rent);
    } else if (currentFilters.sort === 'rating') {
      result.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (currentFilters.sort === 'popular') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredListings(result);
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFiltersAndSort(listings, newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = { minRent: '', maxRent: '', city: '', gender: '', type: '', verified: false, sort: 'newest' };
    setFilters(defaultFilters);
    applyFiltersAndSort(listings, defaultFilters);
  };

  // Comparison handlers
  const toggleComparison = (listingId) => {
    if (selectedForComparison.includes(listingId)) {
      setSelectedForComparison(selectedForComparison.filter(id => id !== listingId));
    } else {
      if (selectedForComparison.length < 3) {
        setSelectedForComparison([...selectedForComparison, listingId]);
      } else {
        alert('You can compare maximum 3 listings');
      }
    }
  };

  const openComparison = () => {
    const toCompare = listings.filter(l => selectedForComparison.includes(l._id));
    if (toCompare.length >= 2) {
      setShowComparisonModal(true);
    } else {
      alert('Select at least 2 listings to compare');
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedListings = filteredListings.slice(startIdx, startIdx + itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-2 text-gray-800">
              <i className="fas fa-search text-blue-600"></i> Find Your Home
            </h1>
            <p className="text-gray-600 mt-1">Found <strong>{filteredListings.length}</strong> listing{filteredListings.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <SaveSearchButton filters={filters} />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition"
            >
              <i className="fas fa-sliders-h"></i> {showFilters ? 'Hide' : 'Show'} Filters
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="bg-white rounded-md shadow-sm flex items-center px-3 py-2 w-full">
              <i className="fas fa-search text-gray-400 mr-3"></i>
              <input
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); applyFiltersAndSort(listings, { ...filters, query: e.target.value }); }}
                placeholder="Search by area, title, address..."
                className="w-full outline-none text-sm"
              />
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
                title="Grid view"
              >
                <i className="fas fa-th"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border'}`}
                title="List view"
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">Showing <strong>{paginatedListings.length}</strong> of <strong>{filteredListings.length}</strong></div>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 flex items-center gap-2">
            <i className="fas fa-circle-exclamation"></i> {error}
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-full lg:w-64 bg-white p-6 rounded-lg shadow-md h-fit sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <i className="fas fa-redo"></i> Reset
                </button>
              </div>

              <div className="space-y-4">
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-money-bill text-green-600"></i> Price Range (৳/month)
                  </label>
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minRent}
                    onChange={(e) => handleFilterChange('minRent', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxRent}
                    onChange={(e) => handleFilterChange('maxRent', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-city text-purple-600"></i> City
                  </label>
                  <select
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">All Cities</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Rajshahi">Rajshahi</option>
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-venus-mars text-pink-600"></i> Gender
                  </label>
                  <select
                    value={filters.gender}
                    onChange={(e) => handleFilterChange('gender', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">All</option>
                    <option value="male">Male Only</option>
                    <option value="female">Female Only</option>
                    <option value="both">Mixed</option>
                  </select>
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-building text-blue-600"></i> Type
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">All Types</option>
                    <option value="mess">Mess</option>
                    <option value="hostel">Hostel</option>
                  </select>
                </div>

                {/* Verified */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.verified}
                      onChange={(e) => handleFilterChange('verified', e.target.checked)}
                      className="w-4 h-4 accent-blue-600"
                    />
                    <span className="text-sm font-semibold text-gray-700"><i className="fas fa-check-circle text-green-600"></i> Verified Only</span>
                  </label>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <i className="fas fa-sort text-gray-600"></i> Sort By
                  </label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange('sort', e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rating</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <i className="fas fa-spinner fa-spin text-blue-600 text-3xl"></i>
                <p className="text-gray-600">Loading listings...</p>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center gap-3 text-gray-500">
                <i className="fas fa-inbox text-5xl text-gray-300"></i>
                <p className="text-lg font-semibold">No listings found</p>
                <p className="text-sm">Try adjusting your filters</p>
              </div>
            ) : (
              <>
                {selectedForComparison.length > 0 && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-check-circle text-blue-600"></i>
                      <span className="font-semibold text-gray-800">
                        {selectedForComparison.length} listing{selectedForComparison.length !== 1 ? 's' : ''} selected for comparison
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={openComparison}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-semibold text-sm"
                      >
                        <i className="fas fa-columns"></i> Compare
                      </button>
                      <button
                        onClick={() => setSelectedForComparison([])}
                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition text-sm font-semibold"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedListings.map((l) => (
                        <div key={l._id} className="relative">
                          <div className="absolute top-3 left-3 z-20">
                            <input
                              type="checkbox"
                              checked={selectedForComparison.includes(l._id)}
                              onChange={() => toggleComparison(l._id)}
                              className="w-5 h-5 text-blue-600 rounded cursor-pointer accent-blue-600 bg-white p-1 rounded-sm"
                              title="Select for comparison"
                            />
                          </div>
                          <ListingCard listing={l} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {paginatedListings.map((l) => (
                        <div key={l._id} className="flex gap-3">
                          <div className="flex items-start pt-2">
                            <input
                              type="checkbox"
                              checked={selectedForComparison.includes(l._id)}
                              onChange={() => toggleComparison(l._id)}
                              className="w-5 h-5 text-blue-600 rounded cursor-pointer accent-blue-600"
                              title="Select for comparison"
                            />
                          </div>
                          <div className="flex-1">
                            <ListingCard listing={l} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded transition ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                )}
                </>
              )}
            {showComparisonModal && (
              <ListingComparisonModal
                listings={listings.filter(l => selectedForComparison.includes(l._id))}
                onClose={() => setShowComparisonModal(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingsPage;
