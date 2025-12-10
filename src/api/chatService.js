import axios from "axios";

const BASE_URL = "http://127.0.0.1:5000"; // backend URL

export const sendMessage = async (message) => {
  try {
    const response = await axios.post(`${BASE_URL}/chat`, { message });
    return response.data; // { reply, references }
  } catch (err) {
    console.error("API error:", err);
    return { reply: "Sorry, something went wrong.", references: [] };
  }
};