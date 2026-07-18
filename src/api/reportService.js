import api from './axiosConfig';

const normalizeError = (error, fallbackMessage) => {
  const payload = error.response?.data;
  if (payload && typeof payload === 'object') {
    const message = payload.message || payload.msg || payload.error || payload.detail;
    if (message) {
      return { success: false, message };
    }
    return payload;
  }
  return { success: false, message: fallbackMessage };
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const reportService = {
  saveReport: async (reportData) => {
    try {
      const response = await api.post('/reports', reportData);
      return response.data;
    } catch (error) {
      throw normalizeError(error, 'Failed to save report');
    }
  },

  getReports: async (params = {}) => {
    try {
      const response = await api.get('/reports', { params });
      return response.data;
    } catch (error) {
      throw normalizeError(error, 'Failed to load reports');
    }
  },

  getReport: async (reportId) => {
    try {
      const response = await api.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw normalizeError(error, 'Failed to load report');
    }
  },

  downloadReport: async (reportId, format = 'pdf') => {
    try {
      const response = await api.get(`/reports/${reportId}/download`, {
        params: { format },
        responseType: 'blob',
      });
      triggerDownload(response.data, `report-${reportId}.pdf`);
      return { success: true };
    } catch (error) {
      throw normalizeError(error, 'Failed to download report');
    }
  },

  downloadReports: async (reportIds, format = 'pdf') => {
    try {
      const response = await api.get('/reports/download', {
        params: { ids: reportIds.join(','), format },
        responseType: 'blob',
      });
      triggerDownload(response.data, 'diagnosis-reports.zip');
      return { success: true };
    } catch (error) {
      throw normalizeError(error, 'Failed to download reports');
    }
  },
};

export default reportService;
