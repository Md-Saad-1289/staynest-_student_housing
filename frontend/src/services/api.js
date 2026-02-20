import axios from 'axios';

// Normalize API base so frontend always calls the versioned API.
// If REACT_APP_API_URL is set to a root (e.g. https://api.example.com),
// we append `/api/v1`. If it already contains `/api/v1` we keep it.
const RAW_API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_VERSION = '/api/v1';
const normalizeBase = (raw) => {
  if (!raw) return `http://localhost:5000${API_VERSION}`;
  const trimmed = raw.replace(/\/+$/, '');
  if (trimmed.endsWith(API_VERSION)) return trimmed;
  return `${trimmed}${API_VERSION}`;
};

const API_BASE = normalizeBase(RAW_API_BASE);

// Axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   AUTH SERVICES
========================= */
export const authService = {
  register: (name, email, mobile, password, role) =>
    api.post('/auth/register', { name, email, mobile, password, role }).then(res => res),

  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(res => res),

  logout: () => localStorage.removeItem('token'),

  getCurrentUser: () => api.get('/auth/me').then(res => res),
};

/* =========================
   USER SERVICES
========================= */
export const userService = {
  getProfile: () => api.get('/auth/me').then(res => res),
  updateProfile: (data) => api.put('/auth/profile', data).then(res => res),
};

/* =========================
   LISTING SERVICES
========================= */
export const listingService = {
  getListings: (params) => api.get('/listings', { params }).then(res => res),
  getListing: (id) => api.get(`/listings/${id}`).then(res => res),
  createListing: (data) => api.post('/listings', data).then(res => res),
  updateListing: (id, data) => api.put(`/listings/${id}`, data).then(res => res),
  getOwnerListings: () => api.get('/listings/owner/my-listings').then(res => res),
  getFeaturedListings: () => api.get('/listings/featured').then(res => res),
  toggleFavorite: (listingId) => api.post('/listings/user/toggle-favorite', { listingId }).then(res => res),
  getUserFavorites: () => api.get('/listings/user/favorites').then(res => res),
  addViewHistory: (listingId) => api.post('/listings/user/view-history', { listingId }).then(res => res),
  getViewHistory: () => api.get('/listings/user/view-history').then(res => res),
};

/* =========================
   BOOKING SERVICES
========================= */
export const bookingService = {
  createBooking: (data) => api.post('/bookings', data).then(res => res),
  getOwnerBookings: () => api.get('/bookings/owner').then(res => res),
  getStudentBookings: () => api.get('/bookings/student').then(res => res),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }).then(res => res),
};

/* =========================
   NOTIFICATION SERVICES
========================= */
export const notificationService = {
  getNotifications: (limit = 20) => api.get('/notifications', { params: { limit } }).then(res => res),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`).then(res => res),
  markAllAsRead: () => api.put('/notifications/read-all').then(res => res),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`).then(res => res),
};

/* =========================
   SAVED SEARCH SERVICES
========================= */
export const savedSearchService = {
  getSavedSearches: () => api.get('/saved-searches').then(res => res),
  createSavedSearch: (data) => api.post('/saved-searches', data).then(res => res),
  updateSavedSearch: (id, data) => api.put(`/saved-searches/${id}`, data).then(res => res),
  deleteSavedSearch: (id) => api.delete(`/saved-searches/${id}`).then(res => res),
};

/* =========================
   FLAG SERVICES
========================= */
export const flagService = {
  flagListing: (listingId, reason) =>
    api.post('/flags', { listingId, reason }).then(res => res),
};

/* =========================
   REVIEW SERVICES
========================= */
export const reviewService = {
  createReview: (data) => api.post('/reviews', data).then(res => res),
  getListingReviews: (listingId) => api.get(`/reviews/listing/${listingId}`).then(res => res),
  replyToReview: (id, reply) => api.put(`/reviews/${id}/reply`, { reply }).then(res => res),
};

/* =========================
   TESTIMONIAL SERVICES
========================= */
export const testimonialService = {
  getTestimonials: () => api.get('/testimonials').then(res => res),
};

/* =========================
   ADMIN SERVICES
========================= */
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(res => res),
  getUnverifiedOwners: () => api.get('/admin/owners/unverified').then(res => res),
  verifyOwner: (userId) => api.put(`/admin/owners/${userId}/verify`).then(res => res),
  rejectOwner: (userId, reason) => api.put(`/admin/owners/${userId}/reject`, { reason }).then(res => res),
  getUnverifiedListings: () => api.get('/admin/listings/unverified').then(res => res),
  getAllListings: (params) => api.get('/admin/listings/all', { params }).then(res => res),
  verifyListing: (id) => api.put(`/admin/listings/${id}/verify`).then(res => res),
  getFeaturedListings: () => api.get('/admin/listings/featured').then(res => res),
  toggleFeaturedListing: (id) => api.put(`/admin/listings/${id}/toggle-featured`).then(res => res),
  getFlags: () => api.get('/admin/flags').then(res => res),
  resolveFlag: (id, adminNotes) => api.put(`/admin/flags/${id}/resolve`, { adminNotes }).then(res => res),
  getActions: (params) => api.get('/admin/actions', { params }).then(res => res),
  // Testimonials
  getAllTestimonials: () => api.get('/testimonials/admin/all').then(res => res),
  createTestimonial: (data) => api.post('/testimonials', data).then(res => res),
  updateTestimonial: (id, data) => api.put(`/testimonials/${id}`, data).then(res => res),
  deleteTestimonial: (id) => api.delete(`/testimonials/${id}`).then(res => res),
  toggleApproval: (id) => api.put(`/testimonials/${id}/approve`).then(res => res),
  toggleFeatured: (id) => api.put(`/testimonials/${id}/feature`).then(res => res),
};

// Default export axios instance
export default api;
