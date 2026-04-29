import api from "./axiosConfig";

const chatService = {
  // Session Management
  listSessions: async () => {
    const response = await api.get("/chatbot/sessions");
    return response.data;
  },

  createSession: async (title = "New Chat") => {
    const response = await api.post("/chatbot/sessions", { title });
    return response.data;
  },

  getSessionMessages: async (sessionId) => {
    const response = await api.get(`/chatbot/sessions/${sessionId}/messages`);
    return response.data;
  },

  deleteSession: async (sessionId) => {
    const response = await api.delete(`/chatbot/sessions/${sessionId}`);
    return response.data;
  },

  // Chat Messages
  sendMessage: async (message, sessionId = null) => {
    const payload = { message };
    if (sessionId) {
      payload.session_id = sessionId;
    }
    const response = await api.post("/chatbot/chat", payload);
    return response.data;
  },

  // Message Archiving & History
  getSessionArchives: async (sessionId) => {
    const response = await api.get(`/chatbot/sessions/${sessionId}/archives`);
    return response.data;
  },

  getArchiveMessages: async (sessionId, archiveId) => {
    const response = await api.get(
      `/chatbot/sessions/${sessionId}/archives/${archiveId}/messages`
    );
    return response.data;
  },
};

export default chatService;
