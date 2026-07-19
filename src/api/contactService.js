import api from './axiosConfig';

export const contactService = {
  // Submit the public "Contact Us" form (no login required)
  submitMessage: async ({ name, email, message }) => {
    try {
      const response = await api.post('/contact', { name, email, message });
      return response.data;
    } catch (error) {
      console.error('Submit contact message error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to send message' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to send message' };
      }
    }
  },

  // Admin only: list all submitted messages
  getAllMessages: async () => {
    try {
      const response = await api.get('/contact');
      return response.data;
    } catch (error) {
      console.error('Get contact messages error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to get messages' };
      } else if (error.request) {
        throw { 
            success: false, 
            message: 'Cannot connect to server' 
        };
      } else {
        throw { success: false, message: error.message || 'Failed to get messages' };
      }
    }
  }
};

export default contactService;