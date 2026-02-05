import axios from 'axios';

/**
 * Base API URL
 * Fallback for production safety
 */
const API_BASE = 'https://staynest-backend-n2kn.onrender.com/api/v1';

/**
 * Axios instance with JSON headers
 */
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Attach JWT token automatically if exists in localStorage
 */
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
    axios.post(`${API_BASE}/auth/register`, { name, email, mobile, password, role }),

  login: (email, password) =>
    axios.post(`${API_BASE}/auth/login`, { email, password }),

  getCurrentUser: () => axios.get(`${API_BASE}/auth/me`),
};

/* =========================
   USER SERVICES
========================= */
export const userService = {
  getProfile: () => axios.get(`${API_BASE}/auth/me`),
  updateProfile: (data) => axios.put(`${API_BASE}/auth/profile`, data),
};

/* =========================
   LISTING SERVICES
========================= */
export const listingService = {
  getListings: (params) => axios.get(`${API_BASE}/listings`, { params }),
  getListing: (id) => axios.get(`${API_BASE}/listings/${id}`),
  createListing: (data) => axios.post(`${API_BASE}/listings`, data),
  updateListing: (id, data) => axios.put(`${API_BASE}/listings/${id}`, data),
  getOwnerListings: () => axios.get(`${API_BASE}/listings/owner/my-listings`),
  toggleFavorite: (listingId) => axios.post(`${API_BASE}/listings/user/toggle-favorite`, { listingId }),
  getUserFavorites: () => axios.get(`${API_BASE}/listings/user/favorites`),
  addViewHistory: (listingId) => axios.post(`${API_BASE}/listings/user/view-history`, { listingId }),
  getViewHistory: () => axios.get(`${API_BASE}/listings/user/view-history`),
};

/* =========================
   BOOKING SERVICES
========================= */
export const bookingService = {
  createBooking: (data) => axios.post(`${API_BASE}/bookings`, data),
  getOwnerBookings: () => axios.get(`${API_BASE}/bookings/owner`),
  getStudentBookings: () => axios.get(`${API_BASE}/bookings/student`),
  updateBookingStatus: (id, status) => axios.put(`${API_BASE}/bookings/${id}/status`, { status }),
};

/* =========================
   REVIEW SERVICES
========================= */
export const reviewService = {
  createReview: (data) => axios.post(`${API_BASE}/reviews`, data),
  getListingReviews: (listingId) => axios.get(`${API_BASE}/reviews/listing/${listingId}`),
  replyToReview: (id, reply) => axios.put(`${API_BASE}/reviews/${id}/reply`, { reply }),
};

/* =========================
   FLAG SERVICES
========================= */
export const flagService = {
  flagListing: (listingId, reason) => axios.post(`${API_BASE}/flags`, { listingId, reason }),
};

/* =========================
   NOTIFICATION SERVICES
========================= */
export const notificationService = {
  getNotifications: (limit = 20) => axios.get(`${API_BASE}/notifications`, { params: { limit } }),
  markAsRead: (notificationId) => axios.put(`${API_BASE}/notifications/${notificationId}/read`),
  markAllAsRead: () => axios.put(`${API_BASE}/notifications/read-all`),
  deleteNotification: (notificationId) => axios.delete(`${API_BASE}/notifications/${notificationId}`),
};

/* =========================
   SAVED SEARCH SERVICES
========================= */
export const savedSearchService = {
  getSavedSearches: () => axios.get(`${API_BASE}/saved-searches`),
  createSavedSearch: (data) => axios.post(`${API_BASE}/saved-searches`, data),
  updateSavedSearch: (id, data) => axios.put(`${API_BASE}/saved-searches/${id}`, data),
  deleteSavedSearch: (id) => axios.delete(`${API_BASE}/saved-searches/${id}`),
};

/* =========================
   ADMIN SERVICES
========================= */
export const adminService = {
  getDashboardStats: () => axios.get(`${API_BASE}/admin/dashboard/stats`),
  getUnverifiedOwners: () => axios.get(`${API_BASE}/admin/owners/unverified`),
  verifyOwner: (userId) => axios.put(`${API_BASE}/admin/owners/${userId}/verify`),
  rejectOwner: (userId, reason) => axios.put(`${API_BASE}/admin/owners/${userId}/reject`, { reason }),
  getUnverifiedListings: () => axios.get(`${API_BASE}/admin/listings/unverified`),
  verifyListing: (id) => axios.put(`${API_BASE}/admin/listings/${id}/verify`),
  getFlags: () => axios.get(`${API_BASE}/admin/flags`),
  resolveFlag: (id, adminNotes) => axios.put(`${API_BASE}/admin/flags/${id}/resolve`, { adminNotes }),
  getActions: (params) => axios.get(`${API_BASE}/admin/actions`, { params }),
};

export default api;
