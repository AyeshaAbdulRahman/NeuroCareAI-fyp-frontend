import api from './axiosConfig';

export const userService = {
  // Get current user profile
  getProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to get profile' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to get profile' };
      }
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/users/profile', userData);
      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to update profile' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to update profile' };
      }
    }
  },

  // Upload profile picture
  uploadProfilePicture: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/users/profile-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        // Update user in localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.profile_picture = response.data.profile_picture;
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to upload profile picture' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to upload profile picture' };
      }
    }
  },

  // Delete user account
  deleteAccount: async () => {
    try {
      const response = await api.delete('/users/account');
      if (response.data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return response.data;
    } catch (error) {
      console.error('Delete account error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to delete account' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to delete account' };
      }
    }
  },

  // Get user activity history
  getActivity: async (params = {}) => {
    try {
      const response = await api.get('/users/activity', { params });
      return response.data;
    } catch (error) {
      console.error('Get activity error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to get activity' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to get activity' };
      }
    }
  },

  // Create custom user activity
  logActivity: async (activityData) => {
    try {
      const response = await api.post('/users/activity', activityData);
      return response.data;
    } catch (error) {
      console.error('Log activity error:', error);
      if (error.response) {
        throw error.response.data || { success: false, message: 'Failed to log activity' };
      } else if (error.request) {
        throw { success: false, message: 'Cannot connect to server' };
      } else {
        throw { success: false, message: error.message || 'Failed to log activity' };
      }
    }
  }
};

export default userService;
