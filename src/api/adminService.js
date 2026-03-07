import api from './axiosConfig';

export const adminService = {
  // Get all users (Admin)
  getAllUsers: async (page = 1, perPage = 20, category = null) => {
    try {
      const params = { page, per_page: perPage };
      if (category) params.category = category;
      
      const response = await api.get('/admin/users', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get users' };
    }
  },

  // Get user by ID (Admin)
  getUser: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get user' };
    }
  },

  // Update user (Admin)
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update user' };
    }
  },

  // Delete user (Admin)
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to delete user' };
    }
  },

  // Get dashboard statistics (Admin)
  getStats: async () => {
    try {
      const response = await api.get('/admin/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get statistics' };
    }
  },

  // Get all feedback (Admin)
  getAllFeedback: async () => {
    try {
      const response = await api.get('/feedback/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to get feedback' };
    }
  },

  // Update feedback status (Admin)
  updateFeedbackStatus: async (feedbackId, status) => {
    try {
      const response = await api.put(`/feedback/${feedbackId}`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { success: false, message: 'Failed to update feedback' };
    }
  }
};

export default adminService;
