import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import chatService from "../api/chatService";
import "./Styles/Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const bootstrap = async () => {
      setIsLoadingSessions(true);
      try {
        const data = await chatService.listSessions();
        const fetched = Array.isArray(data?.sessions) ? data.sessions : [];
        if (fetched.length > 0) {
          setSessions(fetched);
          const firstSessionId = fetched[0].id;
          setSelectedChat(firstSessionId);
          await loadSessionMessages(firstSessionId);
        } else {
          await startNewChat();
        }
      } catch (error) {
        console.error("Failed to load sessions:", error);
      } finally {
        setIsLoadingSessions(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const refreshSessions = async (preferredSessionId = null) => {
    const data = await chatService.listSessions();
    const fetched = Array.isArray(data?.sessions) ? data.sessions : [];
    setSessions(fetched);
    if (
      preferredSessionId &&
      fetched.some((session) => session.id === preferredSessionId)
    ) {
      setSelectedChat(preferredSessionId);
    }
    return fetched;
  };

  const loadSessionMessages = async (sessionId) => {
    if (!sessionId) {
      setMessages([]);
      return;
    }

    setIsLoadingMessages(true);
    try {
      const data = await chatService.getSessionMessages(sessionId);
      const fetchedMessages = Array.isArray(data?.messages) ? data.messages : [];
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const startNewChat = async () => {
    try {
      const created = await chatService.createSession("New Chat");
      const session = created?.session;
      if (!session) {
        return;
      }
      setSessions((prev) => [session, ...prev]);
      setSelectedChat(session.id);
      setMessages([]);
    } catch (error) {
      console.error("Failed to create new chat session:", error);
    }
  };

  const handleSend = async () => {
    const messageText = input.trim();
    if (!messageText || isTyping) {
      return;
    }

    setInput("");
    setIsTyping(true);

    let activeSessionId = selectedChat;
    if (!activeSessionId) {
      try {
        const created = await chatService.createSession("New Chat");
        const session = created?.session;
        if (!session) {
          throw new Error("Failed to create a chat session.");
        }
        activeSessionId = session.id;
        setSelectedChat(session.id);
      } catch (error) {
        console.error("Could not initialize session:", error);
        setIsTyping(false);
        return;
      }
    }

    const optimisticUserMessage = {
      id: `temp-${Date.now()}`,
      sender: "user",
      message_text: messageText,
      references: [],
    };
    setMessages((prev) => [...prev, optimisticUserMessage]);

    try {
      const result = await chatService.sendMessage(messageText, activeSessionId);
      const resolvedSessionId = result?.session_id || activeSessionId;
      await Promise.all([
        refreshSessions(resolvedSessionId),
        loadSessionMessages(resolvedSessionId),
      ]);
    } catch (error) {
      console.error("Send message failed:", error);
      setMessages((prev) => [
        ...prev.filter((msg) => msg.id !== optimisticUserMessage.id),
        {
          id: `err-${Date.now()}`,
          sender: "bot",
          message_text: "Sorry, something went wrong.",
          references: [],
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const loadChat = async (chat) => {
    setSelectedChat(chat.id);
    await loadSessionMessages(chat.id);
  };

  const deleteChat = async (id) => {
    try {
      await chatService.deleteSession(id);
      const remaining = sessions.filter((session) => session.id !== id);
      setSessions(remaining);

      if (remaining.length === 0) {
        setSelectedChat(null);
        setMessages([]);
        await startNewChat();
        return;
      }

      if (selectedChat === id) {
        const nextSessionId = remaining[0].id;
        setSelectedChat(nextSessionId);
        await loadSessionMessages(nextSessionId);
      }
    } catch (error) {
      console.error("Failed to delete session:", error);
    }
  };

  const filteredSessions = sessions.filter((chat) => {
    const query = searchTerm.toLowerCase();
    const searchable = `${chat.title || ""} ${chat.last_message_preview || ""}`.toLowerCase();
    return searchable.includes(query);
  });

  return (
    <div className="chatbot-layout">
      <aside className="chat-sidebar">
        <h2 className="chatbot-logo">NeuroCare AI</h2>
        <button className="back-home-btn" onClick={() => navigate("/")}>
          <i className="bi bi-house-door"></i> Back to Home
        </button>
        <button className="new-chat-btn" onClick={startNewChat}>
          <i className="bi bi-plus-circle"></i> New Chat
        </button>
        <div className="chat-search-box">
          <i className="bi bi-search"></i>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="chat-history">
          {isLoadingSessions ? (
            <p className="no-history">Loading chats...</p>
          ) : filteredSessions.length > 0 ? (
            filteredSessions.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${selectedChat === chat.id ? "active" : ""}`}
                onClick={() => loadChat(chat)}
              >
                <span>{chat.title || "New Chat"}</span>
                <i
                  className="bi bi-trash3"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                ></i>
              </div>
            ))
          ) : (
            <p className="no-history">No chat history yet.</p>
          )}
        </div>
      </aside>

      <main className="chat-main">
        <header className="chat-header">
          <h1>NeuroCare Assistant</h1>
          <p>Empathetic | Intelligent | Reliable</p>
        </header>

        <div className="chat-body">
          {isLoadingMessages ? (
            <div className="chat-bubble bot">
              <em>Loading messages...</em>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-bubble bot">
              <p>Hello. How can I assist you today?</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={msg.id || `msg-${index}`} className={`chat-bubble ${msg.sender}`}>
                <p>{msg.message_text}</p>
                {msg.sender === "bot" &&
                  Array.isArray(msg.references) &&
                  msg.references.length > 0 && (
                    <div className="chat-references">
                      <strong>Sources:</strong>
                      <ul>
                        {msg.references.map((ref, i) => (
                          <li key={`${msg.id || index}-${i}`}>
                            Chunk {ref.chunk_id} | Page {ref.page} | {ref.source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            ))
          )}
          {isTyping && (
            <div className="chat-bubble bot">
              <em>Bot is typing...</em>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button onClick={handleSend}>
            <i className="bi bi-send"></i>
          </button>
        </div>
      </main>
    </div>
  );
}

export default Chatbot;
