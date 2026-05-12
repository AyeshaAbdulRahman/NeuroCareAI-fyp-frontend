import api from './axiosConfig';

export const authService = {
  // Signup new user
  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        } else {
          localStorage.removeItem('refresh_token');
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error
        throw error.response.data || { success: false, message: 'Signup failed' };
      } else if (error.request) {
        // Request made but no response (backend not running)
        throw { 
          success: false, 
          message: 'Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:5000' 
        };
      } else {
        // Something else happened
        throw { success: false, message: error.message || 'Signup failed' };
      }
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (response.data.refresh_token) {
          localStorage.setItem('refresh_token', response.data.refresh_token);
        } else {
          localStorage.removeItem('refresh_token');
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.response) {
        // Server responded with error
        throw error.response.data || { success: false, message: 'Login failed' };
      } else if (error.request) {
        // Request made but no response (backend not running)
        throw { 
          success: false, 
          message: 'Cannot connect to server. Please make sure the backend is running on http://127.0.0.1:5000' 
        };
      } else {
        // Something else happened
        throw { success: false, message: error.message || 'Login failed' };
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
  },

  // Get current logged in user
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Refresh token
  refreshToken: async () => {
    try {
      const response = await api.post('/auth/refresh');
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      throw error;
    }
  }
};

export default authService;
