import React, { useState } from 'react';

export const ManageTestimonialsModal = ({ isOpen, onClose, testimonial, onSave, isLoading }) => {
  const [formData, setFormData] = useState(
    testimonial || {
      name: '',
      tag: '',
      text: '',
      rating: 5,
      approved: false,
      featured: false,
    }
  );

  const [errors, setErrors] = useState({});

  // Reset form when modal closes or testimonial changes
  React.useEffect(() => {
    if (isOpen && testimonial) {
      setFormData(testimonial);
      setErrors({});
    } else if (isOpen && !testimonial) {
      setFormData({
        name: '',
        tag: '',
        text: '',
        rating: 5,
        approved: false,
        featured: false,
      });
      setErrors({});
    }
  }, [isOpen, testimonial]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Student name is required';
    }
    if (!formData.tag || formData.tag.trim().length === 0) {
      newErrors.tag = 'Tag (e.g., School/University) is required';
    }
    if (!formData.text || formData.text.trim().length === 0) {
      newErrors.text = 'Testimonial text is required';
    } else if (formData.text.length < 20) {
      newErrors.text = 'Testimonial must be at least 20 characters';
    } else if (formData.text.length > 500) {
      newErrors.text = 'Testimonial must not exceed 500 characters';
    }
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      newErrors.rating = 'Rating must be between 1 and 5';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-comment-dots"></i>
              {testimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              {testimonial ? 'Update testimonial details' : 'Create a new student testimonial'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors disabled:opacity-50"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <i className="fas fa-user text-blue-600 mr-2"></i>
              Student Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Aisha Rahman"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Tag Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <i className="fas fa-tag text-green-600 mr-2"></i>
              Tag (School/University) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              placeholder="e.g., BUET Student"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.tag ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.tag && <p className="text-red-500 text-xs mt-1">{errors.tag}</p>}
          </div>

          {/* Rating Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <i className="fas fa-star text-yellow-500 mr-2"></i>
              Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-4">
              <select
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                className={`px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.rating ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Fair</option>
                <option value={3}>3 - Good</option>
                <option value={4}>4 - Very Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <i
                    key={i}
                    className={`fas fa-star text-lg ${
                      i < formData.rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  ></i>
                ))}
              </div>
            </div>
            {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
          </div>

          {/* Testimonial Text */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              <i className="fas fa-paragraph text-purple-600 mr-2"></i>
              Testimonial Text <span className="text-red-500">*</span>
            </label>
            <textarea
              name="text"
              value={formData.text}
              onChange={handleChange}
              placeholder="Write the student's testimonial here... (20-500 characters)"
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                errors.text ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1">
              <p className={`text-xs ${formData.text.length > 500 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.text.length}/500 characters
              </p>
              {errors.text && <p className="text-red-500 text-xs">{errors.text}</p>}
            </div>
          </div>

          {/* Status Toggles */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
              <input
                type="checkbox"
                name="approved"
                checked={formData.approved}
                onChange={handleChange}
                disabled={isLoading}
                className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
              />
              <div>
                <span className="font-semibold text-gray-900">
                  <i className="fas fa-check-circle text-green-600 mr-2"></i>
                  Approved
                </span>
                <p className="text-xs text-gray-600">Display on homepage</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded transition-colors">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                disabled={isLoading}
                className="w-5 h-5 text-yellow-500 rounded focus:ring-2 focus:ring-yellow-500"
              />
              <div>
                <span className="font-semibold text-gray-900">
                  <i className="fas fa-star text-yellow-500 mr-2"></i>
                  Featured
                </span>
                <p className="text-xs text-gray-600">Show at top of testimonials section</p>
              </div>
            </label>
          </div>

          {/* Footer Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg font-medium transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {testimonial ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
