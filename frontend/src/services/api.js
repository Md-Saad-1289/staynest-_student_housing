// src/api.js
import axios from 'axios';

/* =========================
   Base API Configuration
========================= */
const API_BASE = 'https://staynest-backend-n2kn.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

/* =========================
   Request Interceptor: Attach JWT token automatically
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   Response Interceptor: Handle 401 globally
========================= */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn('Unauthorized: Token missing/expired');
      localStorage.removeItem('token');        // Clear token
      window.location.href = '/login';         // Redirect to login page
    }
    return Promise.reject(err);
  }
);

/* =========================
   AUTH SERVICE
========================= */
export const authService = {
  register: (name, email, mobile, password, role) =>
    api.post('/auth/register', { name, email, mobile, password, role }),

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token); // Save token
    }
    return res.data;
  },

  logout: () => localStorage.removeItem('token'),

  getCurrentUser: () => api.get('/auth/me'),
};

/* =========================
   LISTING SERVICE
========================= */
export const listingService = {
  getListings: (params) => api.get('/listings', { params }),
  getOwnerListings: () => api.get('/listings/owner/my-listings'), // Only for owner role
  getUserFavorites: () => api.get('/listings/user/favorites'),
  toggleFavorite: (listingId) => api.post('/listings/user/toggle-favorite', { listingId }),
  addViewHistory: (listingId) => api.post('/listings/user/view-history', { listingId }),
  getViewHistory: () => api.get('/listings/user/view-history'),
};

/* =========================
   USER SERVICE
========================= */
export const userService = {
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

/* =========================
   BOOKING SERVICE
========================= */
export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getOwnerBookings: () => api.get('/bookings/owner'),
  getStudentBookings: () => api.get('/bookings/student'),
  updateBookingStatus: (id, status) => api.put(`/bookings/${id}/status`, { status }),
};

/* =========================
   REVIEW SERVICE
========================= */
export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getListingReviews: (listingId) => api.get(`/reviews/listing/${listingId}`),
  replyToReview: (id, reply) => api.put(`/reviews/${id}/reply`, { reply }),
};

/* =========================
   ADMIN SERVICE
========================= */
export const adminService = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getUnverifiedOwners: () => api.get('/admin/owners/unverified'),
  verifyOwner: (userId) => api.put(`/admin/owners/${userId}/verify`),
  rejectOwner: (userId, reason) => api.put(`/admin/owners/${userId}/reject`, { reason }),
  getUnverifiedListings: () => api.get('/admin/listings/unverified'),
  verifyListing: (id) => api.put(`/admin/listings/${id}/verify`),
  getFlags: () => api.get('/admin/flags'),
  resolveFlag: (id, adminNotes) => api.put(`/admin/flags/${id}/resolve`, { adminNotes }),
  getActions: (params) => api.get('/admin/actions', { params }),
};

export default api;
