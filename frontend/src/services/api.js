import axios from 'axios';

/* =========================
   API বেস কনফিগারেশন
========================= */
const API_BASE = 'https://staynest-backend-n2kn.onrender.com/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

/* =========================
   JWT টোকেন স্বয়ংক্রিয়ভাবে সংযুক্ত করা
========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // লোকালস্টোরেজ থেকে টোকেন নাও
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // অটো হেডার যোগ করো
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   AUTH SERVICES
========================= */
export const authService = {
  // রেজিস্ট্রেশন
  register: async ({ name, email, mobile, password, role }) => {
    // ক্লায়েন্ট সাইড ভ্যালিডেশন
    if (!name || !email || !mobile || !password) {
      throw new Error('সব ফিল্ড পূরণ করতে হবে');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('ভুল ইমেইল ফরম্যাট');
    }

    if (!/^\d{10,15}$/.test(mobile)) {
      throw new Error('ভুল মোবাইল নাম্বার');
    }

    if (password.length < 6) {
      throw new Error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে');
    }

    const response = await api.post('/auth/register', { name, email, mobile, password, role });
    // যদি রেজিস্ট্রেশন সফল হয়, টোকেন লোকালস্টোরেজে সেভ করো
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  // লগইন
  login: async (email, password) => {
    if (!email || !password) throw new Error('ইমেইল এবং পাসওয়ার্ড প্রয়োজন');

    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token); // টোকেন সেভ
    }
    return response.data;
  },

  logout: () => localStorage.removeItem('token'),

  getCurrentUser: () => api.get('/auth/me'),
};

/* =========================
   LISTING SERVICES
========================= */
export const listingService = {
  getListings: (params) => api.get('/listings', { params }),
  getOwnerListings: () => api.get('/listings/owner/my-listings'),
  createListing: (data) => api.post('/listings', data),
  updateListing: (id, data) => api.put(`/listings/${id}`, data),
};

/* =========================
   UTILITY FUNCTIONS
========================= */
export const isLoggedIn = () => !!localStorage.getItem('token');
export const getToken = () => localStorage.getItem('token');

export default api;
