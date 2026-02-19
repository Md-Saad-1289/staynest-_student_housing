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
    api.post('/auth/register', { name, email, mobile, password, role }).then(res => res.data),

  login: (email, password) =>
    api.post('/auth/login', { email, password }).then(res => res.data),

  logout: () => localStorage.removeItem('token'),

  getCurrentUser: () => api.get('/auth/me').then(res => res.data),
};

/* =========================
   USER SERVICES
========================= */
export const userService = {
  getProfile: () => api.get('/auth/me').then(res => res.data),
  updateProfile: (data) => api.put('/auth/profile', data).then(res => res.data),
};

/* =========================
   LISTING SERVICES
========================= */
export const listingService = {
  getListings: (params) => api.get('/listings', { params }).then(res => res.data),
  getListing: (id) => api.get(`/listings/${id}`).then(res => res.data),
  createListing: (data) => api.post('/listings', data).then(res => res.data),
  updateListing: (id, data) => api.put(`/listings/${id}`, data).then(res => res.data),
  getOwnerListings: () => api.get('/listings/owner/my-listings').then(res => res.data),
  toggleFavorite: (listingId) => api.post('/listings/user/toggle-favorite', { listingId }).then(res => res.data),
  getUserFavorites: () => api.get('/listings/user/favorites').then(res => res.data),
  addViewHistory: (listingId) => api.post('/listings/user/view-history', { listingId }).then(res => res.data),
  getViewHistory: () => api.get('/listings/user/view-history').then(res => res.data),
};

/* =========================
   BOOKING SERVICES
========================= */
export const bookingService = {
  createBooking: (data) => api.post('/bookings', data).then(res => res.data),
  getOwnerBookings: () => api.get('/bookings/owner').then(res => res.data),
  getStudentBookings: () => api.get('/bookings/student').then(res => res.data),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }).then(res => res.data),
};

/* =========================
   NOTIFICATION SERVICES
========================= */
export const notificationService = {
  getNotifications: (limit = 20) => api.get('/notifications', { params: { limit } }).then(res => res.data),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`).then(res => res.data),
  markAllAsRead: () => api.put('/notifications/read-all').then(res => res.data),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`).then(res => res.data),
};

/* =========================
   SAVED SEARCH SERVICES
========================= */
export const savedSearchService = {
  getSavedSearches: () => api.get('/saved-searches').then(res => res.data),
  createSavedSearch: (data) => api.post('/saved-searches', data).then(res => res.data),
  updateSavedSearch: (id, data) => api.put(`/saved-searches/${id}`, data).then(res => res.data),
  deleteSavedSearch: (id) => api.delete(`/saved-searches/${id}`).then(res => res.data),
};

/* =========================
   FLAG SERVICES
========================= */
export const flagService = {
  flagListing: (listingId, reason) =>
    api.post('/flags', { listingId, reason }).then(res => res.data),
};

/* =========================
   REVIEW SERVICES
========================= */
export const reviewService = {
  createReview: (data) => api.post('/reviews', data).then(res => res.data),
  getListingReviews: (listingId) => api.get(`/reviews/listing/${listingId}`).then(res => res.data),
  replyToReview: (id, reply) => api.put(`/reviews/${id}/reply`, { reply }).then(res => res.data),
};

/* =========================
   ADMIN SERVICES
========================= */
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard/stats').then(res => res.data),
  getUnverifiedOwners: () => api.get('/admin/owners/unverified').then(res => res.data),
  verifyOwner: (userId) => api.put(`/admin/owners/${userId}/verify`).then(res => res.data),
  rejectOwner: (userId, reason) => api.put(`/admin/owners/${userId}/reject`, { reason }).then(res => res.data),
  getUnverifiedListings: () => api.get('/admin/listings/unverified').then(res => res.data),
  verifyListing: (id) => api.put(`/admin/listings/${id}/verify`).then(res => res.data),
  getFlags: () => api.get('/admin/flags').then(res => res.data),
  resolveFlag: (id, adminNotes) => api.put(`/admin/flags/${id}/resolve`, { adminNotes }).then(res => res.data),
  getActions: (params) => api.get('/admin/actions', { params }).then(res => res.data),
};

// Default export axios instance
export default api;
