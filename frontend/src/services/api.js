import axios from 'axios';

const API_BASE = 'https://staynest-backend-n2kn.onrender.com/api/v1';

// Axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach token for protected routes
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

export default api;
