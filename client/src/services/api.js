import axios from 'axios';

// Resolve the backend API base URL dynamically
// If a production environment variable is defined, use it.
// Otherwise, fall back to local IP for mobile accessibility during local development.
const getAPIUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return `${import.meta.env.VITE_API_URL}/api`;
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  return `http://${hostname}:5000/api`;
};

const api = axios.create({
  baseURL: getAPIUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Automatically inject JWT token into authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Exports
export const authService = {
  login: async (name, roomNumber, accessCode) => {
    const response = await api.post('/auth/login', { name, roomNumber, accessCode });
    return response.data;
  },
  adminLogin: async (name, accessCode) => {
    const response = await api.post('/auth/admin/login', { name, accessCode });
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  }
};

export const matchService = {
  getActive: async () => {
    const response = await api.get('/matches/active');
    return response.data;
  },
  create: async (matchData) => {
    const response = await api.post('/matches', matchData);
    return response.data;
  },
  editActive: async (matchData) => {
    const response = await api.put('/matches/active', matchData);
    return response.data;
  },
  deleteActive: async () => {
    const response = await api.delete('/matches/active');
    return response.data;
  },
  updateAnnouncement: async (announcement) => {
    const response = await api.post('/matches/active/announcement', { announcement });
    return response.data;
  },
  resetResponses: async () => {
    const response = await api.post('/matches/active/reset');
    return response.data;
  }
};

export const responseService = {
  submit: async (status) => {
    const response = await api.post('/responses', { status });
    return response.data;
  },
  getPlayers: async () => {
    const response = await api.get('/responses/players');
    return response.data;
  }
};

export default api;
