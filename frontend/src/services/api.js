import axios from 'axios';

const API_BASE = 'https://staynest-backend-n2kn.onrender.com/api/v1';

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Attach JWT token automatically for every request
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

  login: async (email, password) => {
    const response = await axios.post(`${API_BASE}/auth/login`, { email, password });
    localStorage.setItem('token', response.data.token); // Save token automatically
    return response.data;
  },

  logout: () => localStorage.removeItem('token'),

  getCurrentUser: () => api.get(`${API_BASE}/auth/me`),
};

/* =========================
   USER SERVICES
========================= */
export const userService = {
  getProfile: () => api.get(`${API_BASE}/auth/me`),
  updateProfile: (data) => api.put(`${API_BASE}/auth/profile`, data),
};

/* =========================
   LISTING SERVICES
========================= */
export const listingService = {
  getListings: (params) => api.get(`${API_BASE}/listings`, { params }),
  getListing: (id) => api.get(`${API_BASE}/listings/${id}`),
  createListing: (data) => api.post(`${API_BASE}/listings`, data),
  updateListing: (id, data) => api.put(`${API_BASE}/listings/${id}`, data),
  getOwnerListings: () => api.get(`${API_BASE}/listings/owner/my-listings`),
  toggleFavorite: (listingId) => api.post(`${API_BASE}/listings/user/toggle-favorite`, { listingId }),
  getUserFavorites: () => api.get(`${API_BASE}/listings/user/favorites`),
  addViewHistory: (listingId) => api.post(`${API_BASE}/listings/user/view-history`, { listingId }),
  getViewHistory: () => api.get(`${API_BASE}/listings/user/view-history`),
};

/* =========================
   BOOKING SERVICES
========================= */
export const bookingService = {
  createBooking: (data) => api.post(`${API_BASE}/bookings`, data),
  getOwnerBookings: () => api.get(`${API_BASE}/bookings/owner`),
  getStudentBookings: () => api.get(`${API_BASE}/bookings/student`),
  updateBookingStatus: (id, status) => api.put(`${API_BASE}/bookings/${id}/status`, { status }),
};

/* =========================
   REVIEW SERVICES
========================= */
export const reviewService = {
  createReview: (data) => api.post(`${API_BASE}/reviews`, data),
  getListingReviews: (listingId) => api.get(`${API_BASE}/reviews/listing/${listingId}`),
  replyToReview: (id, reply) => api.put(`${API_BASE}/reviews/${id}/reply`, { reply }),
};

/* =========================
   FLAG SERVICES
========================= */
export const flagService = {
  flagListing: (listingId, reason) => api.post(`${API_BASE}/flags`, { listingId, reason }),
};

/* =========================
   NOTIFICATION SERVICES
========================= */
export const notificationService = {
  getNotifications: (limit = 20) => api.get(`${API_BASE}/notifications`, { params: { limit } }),
  markAsRead: (notificationId) => api.put(`${API_BASE}/notifications/${notificationId}/read`),
  markAllAsRead: () => api.put(`${API_BASE}/notifications/read-all`),
  deleteNotification: (notificationId) => api.delete(`${API_BASE}/notifications/${notificationId}`),
};

/* =========================
   SAVED SEARCH SERVICES
========================= */
export const savedSearchService = {
  getSavedSearches: () => api.get(`${API_BASE}/saved-searches`),
  createSavedSearch: (data) => api.post(`${API_BASE}/saved-searches`, data),
  updateSavedSearch: (id, data) => api.put(`${API_BASE}/saved-searches/${id}`, data),
  deleteSavedSearch: (id) => api.delete(`${API_BASE}/saved-searches/${id}`),
};

/* =========================
   ADMIN SERVICES
========================= */
export const adminService = {
  getDashboardStats: () => api.get(`${API_BASE}/admin/dashboard/stats`),
  getUnverifiedOwners: () => api.get(`${API_BASE}/admin/owners/unverified`),
  verifyOwner: (userId) => api.put(`${API_BASE}/admin/owners/${userId}/verify`),
  rejectOwner: (userId, reason) => api.put(`${API_BASE}/admin/owners/${userId}/reject`, { reason }),
  getUnverifiedListings: () => api.get(`${API_BASE}/admin/listings/unverified`),
  verifyListing: (id) => api.put(`${API_BASE}/admin/listings/${id}/verify`),
  getFlags: () => api.get(`${API_BASE}/admin/flags`),
  resolveFlag: (id, adminNotes) => api.put(`${API_BASE}/admin/flags/${id}/resolve`, { adminNotes }),
  getActions: (params) => api.get(`${API_BASE}/admin/actions`, { params }),
};

export default api;
