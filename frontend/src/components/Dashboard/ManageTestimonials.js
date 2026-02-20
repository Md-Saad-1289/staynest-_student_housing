import React, { useState, useEffect, useCallback } from 'react';
import { DataTable } from './DataTable';
import { StatusBadge } from './StatusBadge';
import { ManageTestimonialsModal } from './ManageTestimonialsModal';
import { adminService } from '../../services/api';

export const ManageTestimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, approved, pending
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, rating

  // Fetch testimonials
  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getAllTestimonials();
      setTestimonials(res.data.testimonials || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load testimonials');
      console.error('Error fetching testimonials:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  // Filter and sort testimonials
  useEffect(() => {
    let filtered = [...testimonials];

    // Filter by approval status
    if (filterStatus === 'approved') {
      filtered = filtered.filter((t) => t.approved);
    } else if (filterStatus === 'pending') {
      filtered = filtered.filter((t) => !t.approved);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(query) ||
          t.tag.toLowerCase().includes(query) ||
          t.text.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredTestimonials(filtered);
  }, [testimonials, searchQuery, filterStatus, sortBy]);

  // Handle create/update submission
  const handleSaveTestimonial = async (formData) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (selectedTestimonial) {
        // Update
        await adminService.updateTestimonial(selectedTestimonial._id, formData);
        setSuccessMessage(`✓ Testimonial by ${formData.name} updated successfully!`);
      } else {
        // Create
        await adminService.createTestimonial(formData);
        setSuccessMessage(`✓ Testimonial by ${formData.name} created successfully!`);
      }

      // Refresh list
      await fetchTestimonials();
      setIsModalOpen(false);
      setSelectedTestimonial(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save testimonial');
      console.error('Error saving testimonial:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDeleteTestimonial = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"'s testimonial? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      await adminService.deleteTestimonial(id);
      setSuccessMessage(`✓ Testimonial deleted successfully!`);
      await fetchTestimonials();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete testimonial');
      console.error('Error deleting testimonial:', err);
    }
  };

  // Handle toggle approval
  const handleToggleApproval = async (id, currentStatus) => {
    try {
      setError('');
      await adminService.toggleApproval(id);
      setSuccessMessage(`✓ Testimonial ${currentStatus ? 'unapproved' : 'approved'}!`);
      await fetchTestimonials();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update testimonial');
      console.error('Error updating testimonial:', err);
    }
  };

  // Handle toggle featured
  const handleToggleFeatured = async (id, currentStatus) => {
    try {
      setError('');
      await adminService.toggleFeatured(id);
      setSuccessMessage(`✓ Testimonial ${currentStatus ? 'removed from' : 'featured on'} homepage!`);
      await fetchTestimonials();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update testimonial');
      console.error('Error updating testimonial:', err);
    }
  };

  // Handle edit
  const handleEditTestimonial = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  // Data table columns
  const columns = [
    {
      key: 'featured',
      label: '',
      render: (row) =>
        row.featured ? (
          <i className="fas fa-star text-yellow-500 text-lg" title="Featured"></i>
        ) : (
          <span className="text-gray-300">-</span>
        ),
    },
    {
      key: 'name',
      label: 'Student',
      render: (row) => (
        <div>
          <p className="font-semibold text-gray-900">{row.name}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <i className="fas fa-graduation-cap"></i> {row.tag}
          </p>
        </div>
      ),
    },
    {
      key: 'text',
      label: 'Testimonial',
      render: (row) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-700 line-clamp-2">"{row.text}"</p>
        </div>
      ),
    },
    {
      key: 'rating',
      label: 'Rating',
      render: (row) => (
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <i
              key={i}
              className={`fas fa-star text-sm ${
                i < row.rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
            ></i>
          ))}
          <span className="text-sm font-medium text-gray-700 ml-2">{row.rating}/5</span>
        </div>
      ),
    },
    {
      key: 'approved',
      label: 'Status',
      render: (row) => <StatusBadge status={row.approved ? 'approved' : 'pending'} />,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (row) => <span className="text-sm text-gray-600">{new Date(row.createdAt).toLocaleDateString()}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleToggleApproval(row._id, row.approved)}
            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
              row.approved
                ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
            title={row.approved ? 'Click to unapprove' : 'Click to approve'}
          >
            <i className={`fas ${row.approved ? 'fa-times-circle' : 'fa-check-circle'} mr-1`}></i>
            {row.approved ? 'Unapprove' : 'Approve'}
          </button>

          <button
            onClick={() => handleToggleFeatured(row._id, row.featured)}
            className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
              row.featured
                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={row.featured ? 'Click to unfeature' : 'Click to feature'}
          >
            <i className={`fas ${row.featured ? 'fa-star' : 'fa-star'}`} style={{ opacity: row.featured ? 1 : 0.5 }}></i>
            <span className="ml-1">{row.featured ? 'Featured' : 'Feature'}</span>
          </button>

          <button
            onClick={() => handleEditTestimonial(row)}
            className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium transition-colors"
            title="Edit testimonial"
          >
            <i className="fas fa-edit mr-1"></i>
            Edit
          </button>

          <button
            onClick={() => handleDeleteTestimonial(row._id, row.name)}
            className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors"
            title="Delete testimonial"
          >
            <i className="fas fa-trash mr-1"></i>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <i className="fas fa-comment-dots text-purple-600"></i>
              Manage Testimonials
            </h2>
            <p className="text-gray-600 mt-1">Create, edit, approve, and feature student testimonials</p>
          </div>
          <button
            onClick={() => {
              setSelectedTestimonial(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg font-medium transition-all flex items-center gap-2 justify-center"
          >
            <i className="fas fa-plus"></i>
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <i className="fas fa-exclamation-circle text-red-600 text-lg flex-shrink-0 mt-0.5"></i>
          <div>
            <p className="font-semibold text-red-900">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <i className="fas fa-check-circle text-green-600 text-lg flex-shrink-0 mt-0.5"></i>
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <i className="fas fa-search text-gray-600 mr-2"></i>
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <i className="fas fa-filter text-gray-600 mr-2"></i>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Testimonials</option>
              <option value="approved">Approved Only</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <i className="fas fa-sort text-gray-600 mr-2"></i>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating">Highest Rating</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{testimonials.length}</p>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{testimonials.filter((t) => t.approved).length}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">{testimonials.filter((t) => t.featured).length}</p>
            <p className="text-sm text-gray-600">Featured</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">{testimonials.filter((t) => !t.approved).length}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Testimonials Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
            <p className="text-gray-600 mt-2">Loading testimonials...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="p-12 text-center">
            <i className="fas fa-inbox text-4xl text-gray-300 mb-4"></i>
            <p className="text-gray-600 font-medium">No testimonials found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Get started by adding your first testimonial'}
            </p>
          </div>
        ) : (
          <DataTable columns={columns} data={filteredTestimonials} />
        )}
      </div>

      {/* Modal */}
      <ManageTestimonialsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTestimonial(null);
        }}
        testimonial={selectedTestimonial}
        onSave={handleSaveTestimonial}
        isLoading={isSubmitting}
      />
    </div>
  );
};
