// frontend/src/api/client.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sole_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sole_token');
      localStorage.removeItem('sole_user');
      window.dispatchEvent(new Event('auth:logout'));
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  register:       (d) => api.post('/auth/register', d),
  login:          (d) => api.post('/auth/login', d),
  me:             ()  => api.get('/auth/me'),
  updateProfile:  (d) => api.put('/auth/profile', d),
  changePassword: (d) => api.put('/auth/change-password', d),
};

export const productsAPI = {
  list:     (params) => api.get('/products', { params }),
  featured: ()       => api.get('/products/featured'),
  get:      (id)     => api.get(`/products/${id}`),
  reviews:  (id)     => api.get(`/products/${id}/reviews`),
  addReview:(id, d)  => api.post(`/products/${id}/reviews`, d),
};

export const categoriesAPI = {
  list: () => api.get('/categories'),
};

export const cartAPI = {
  get:        ()        => api.get('/cart'),
  addItem:    (d)       => api.post('/cart/items', d),
  updateItem: (id, d)   => api.put(`/cart/items/${id}`, d),
  removeItem: (id)      => api.delete(`/cart/items/${id}`),
  clear:      ()        => api.delete('/cart'),
};

export const ordersAPI = {
  create: (d)  => api.post('/orders', d),
  list:   (p)  => api.get('/orders', { params: p }),
  get:    (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.put(`/orders/${id}/cancel`),
};

export const wishlistAPI = {
  get:    ()    => api.get('/wishlist'),
  add:    (pid) => api.post('/wishlist', { productId: pid }),
  remove: (pid) => api.delete(`/wishlist/${pid}`),
};

export const dashboardAPI = {
  stats: () => api.get('/dashboard/stats'),
};
