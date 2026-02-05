import axios from 'axios';

/**
 * IMPORTANT:
 * Must point to backend API root (with /api/v1)
 */
const API_BASE =
  process.env.REACT_APP_API_URL ||
  'https://staynest-backend-n2kn.onrender.com/api/v1';

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach JWT token automatically (if exists)
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   AUTH SERVICES
========================= */
export const authService = {
  register: (name, email, mobile, password, role) =>
    api.post('/auth/register', {
      name,
      email,
      mobile,
      password,
      role,
    }),

  login: (email, password) =>
    api.post('/auth/login', {
      email,
      password,
    }),

  getCurrentUser: () => api.get('/auth/me'),
};

/* =========================
   USER SERVICES
========================= */
export const userService = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

/* =========================
   LISTING SERVICES
========================= */
export const listingService = {
  getListings: (params) => api.get('/listings', { params }),
  getListing: (id) => api.get(`/listings/${id}`),
  createListing: (data) => api.post('/listings', data),
  updateListing: (id, data) => api.put(`/listings/${id}`, data),
  getOwnerListings: () => api.get('/listings/owner/my-listings'),
  toggleFavorite: (listingId) =>
    api.post('/listings/user/toggle-favorite', { listingId }),
  getUserFavorites: () => api.get('/listings/user/favorites'),
  addViewHistory: (listingId) =>
    api.post('/listings/user/view-history', { listingId }),
  getViewHistory: () => api.get('/listings/user/view-history'),
};

/* =========================
   BOOKING SERVICES
========================= */
export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getOwnerBookings: () => api.get('/bookings/owner'),
  getStudentBookings: () => api.get('/bookings/student'),
  updateBookingStatus: (id, status) =>
    api.put(`/bookings/${id}/status`, { status }),
};

/* =========================
   REVIEW SERVICES
========================= */
export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getListingReviews: (listingId) =>
    api.get(`/reviews/listing/${listingId}`),
  replyToReview: (id, reply) =>
    api.put(`/reviews/${id}/reply`, { reply }),
};

/* =========================
   FLAG SERVICES
========================= */
export const flagService = {
  flagListing: (listingId, reason) =>
    api.post('/flags', { listingId, reason }),
};

/* =========================
   NOTIFICATION SERVICES
========================= */
export const notificationService = {
  getNotifications: (limit = 20) =>
    api.get('/notifications', { params: { limit } }),
  markAsRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (notificationId) =>
    api.delete(`/notifications/${notificationId}`),
};

/* =========================
   SAVED SEARCH SERVICES
========================= */
export const savedSearchService = {
  getSavedSearches: () => api.get('/saved-searches'),
  createSavedSearch: (data) =>
    api.post('/saved-searches', data),
  updateSavedSearch: (id, data) =>
    api.put(`/saved-searches/${id}`, data),
  deleteSavedSearch: (id) =>
    api.delete(`/saved-searches/${id}`),
};

/* =========================
   ADMIN SERVICES
========================= */
export const adminService = {
  getDashboardStats: () =>
    api.get('/admin/dashboard/stats'),
  getUnverifiedOwners: () =>
    api.get('/admin/owners/unverified'),
  verifyOwner: (userId) =>
    api.put(`/admin/owners/${userId}/verify`),
  rejectOwner: (userId, reason) =>
    api.put(`/admin/owners/${userId}/reject`, { reason }),
  getUnverifiedListings: () =>
    api.get('/admin/listings/unverified'),
  verifyListing: (id) =>
    api.put(`/admin/listings/${id}/verify`),
  getFlags: () => api.get('/admin/flags'),
  resolveFlag: (id, adminNotes) =>
    api.put(`/admin/flags/${id}/resolve`, { adminNotes }),
  getActions: (params) =>
    api.get('/admin/actions', { params }),
};

export default api;
