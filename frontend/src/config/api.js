import axios from 'axios';

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/v1/auth/login',
  REGISTER: '/api/v1/auth/register',
  LOGOUT: '/api/v1/auth/logout',
  REFRESH_TOKEN: '/api/v1/auth/refresh',
  USER_PROFILE: '/api/v1/auth/me',

  // Templates
  TEMPLATES: '/api/v1/templates',
  TEMPLATE_BY_ID: (id) => `/api/v1/templates/${id}`,

  // Generation
  GENERATE: '/api/v1/generation-log', // This entry can be removed or kept, as GENERATION_LOG will be used by GenerationAPI
  GENERATION_LOG: '/api/v1/generation-log',
  GENERATION_STATUS: (id) => `/api/v1/generation-log/${id}/status`,

  // Events
  EVENTS: '/api/v1/events',
  EVENT_BY_ID: (id) => `/api/v1/events/${id}`,
  EVENT_TEMPLATES: (id) => `/api/v1/events/${id}/templates`,

  // Generated Assets
  GENERATED_ASSETS: '/api/v1/generated-assets',
  GENERATED_ASSET_BY_ID: (id) => `/api/v1/generated-assets/${id}`,
};

// Helper function to build full URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// ============================================================================
// BACKEND API CONFIGURATION
// ============================================================================

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send HttpOnly cookies for Auth
});

// --- REQUEST INTERCEPTOR ---
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- RESPONSE INTERCEPTOR ---
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Ignore 401 on login or refresh to prevent infinite loops
    if (originalRequest.url === API_ENDPOINTS.LOGIN || originalRequest.url === API_ENDPOINTS.REFRESH_TOKEN) {
      return Promise.reject(error);
    }

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await api.post(API_ENDPOINTS.REFRESH_TOKEN);
        // Refresh successful, retry original request
        return api(originalRequest);
      } catch (err) {
        // Refresh failed, user needs to login
        console.warn('Unauthorized request. Token refresh failed.', err);
        localStorage.removeItem('current_user'); // fallback localstate
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// API ENDPOINT SERVICES
// ============================================================================
export const AuthAPI = {
  login: (credentials) => api.post(API_ENDPOINTS.LOGIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.REGISTER, userData),
  getProfile: () => api.get(API_ENDPOINTS.USER_PROFILE),
  logout: () => api.post(API_ENDPOINTS.LOGOUT),
  refresh: () => api.post(API_ENDPOINTS.REFRESH_TOKEN)
};

export const TemplatesAPI = {
  getAll: () => api.get(API_ENDPOINTS.TEMPLATES),
  getById: (id) => api.get(API_ENDPOINTS.TEMPLATE_BY_ID(id)),
  create: (templateData) => api.post(API_ENDPOINTS.TEMPLATES, templateData),
  update: (id, templateData) => api.put(API_ENDPOINTS.TEMPLATE_BY_ID(id), templateData),
  delete: (id) => api.delete(API_ENDPOINTS.TEMPLATE_BY_ID(id))
};

export const EventsAPI = {
  getAll: () => api.get(API_ENDPOINTS.EVENTS),
  getById: (id) => api.get(API_ENDPOINTS.EVENT_BY_ID(id)),
  create: (eventData) => api.post(API_ENDPOINTS.EVENTS, eventData),
  getTemplates: (id) => api.get(API_ENDPOINTS.EVENT_TEMPLATES(id)),
  getDefaultEvent: async () => {
    try {
      const res = await api.get(API_ENDPOINTS.EVENTS);
      if (res.data && res.data.length > 0) {
        return res.data[0].id;
      }
      const newEvent = await api.post(API_ENDPOINTS.EVENTS, {
        name: 'Default Event',
        event_date: new Date().toISOString().split('T')[0]
      });
      return newEvent.data.id;
    } catch (e) {
      console.error('Failed to get or create default event:', e);
      return null;
    }
  }
};

export const GenerationAPI = {
  generate: (payload) => api.post(API_ENDPOINTS.GENERATION_LOG, payload),
  getStatus: (id) => api.get(API_ENDPOINTS.GENERATION_STATUS(id))
};

export default api;
