import api from './axiosConfig';

export const feedbackService = {
  // Submit feedback
  submitFeedback: async (feedbackText) => {
    try {
      const response = await api.post('/feedback', { feedback_text: feedbackText });
      return response.data;
    } catch (error) {
      console.error('Submit feedback error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to submit feedback' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to submit feedback' };
      }
    }
  },

  // Get my feedback
  getMyFeedback: async () => {
    try {
      const response = await api.get('/feedback');
      return response.data;
    } catch (error) {
      console.error('Get my feedback error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to get feedback' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to get feedback' };
      }
    }
  },

  // Get all feedback (Admin only)
  getAllFeedback: async () => {
    try {
      const response = await api.get('/feedback/all');
      return response.data;
    } catch (error) {
      console.error('Get all feedback error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to get feedback' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to get feedback' };
      }
    }
  },

  // Update feedback status (Admin only)
  updateFeedbackStatus: async (feedbackId, status) => {
    try {
      const response = await api.put(`/feedback/${feedbackId}`, { status });
      return response.data;
    } catch (error) {
      console.error('Update feedback error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to update feedback' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to update feedback' };
      }
    }
  },

  // Delete feedback
  deleteFeedback: async (feedbackId) => {
    try {
      const response = await api.delete(`/feedback/${feedbackId}`);
      return response.data;
    } catch (error) {
      console.error('Delete feedback error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to delete feedback' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to delete feedback' };
      }
    }
  }
};

export default feedbackService;
