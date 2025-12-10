import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { sendMessage } from "../api/chatService"; // make sure this exists
import "./Styles/Chatbot.css";

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem("chatHistory")) || [];
    setHistory(savedChats);
    if (savedChats.length > 0) {
      setMessages(savedChats[0].messages);
      setSelectedChat(savedChats[0].id);
    } else {
      startNewChat();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [
        { id: 1, sender: "bot", text: "👋 Hello! How can I assist you today?", references: [] },
      ],
    };
    setHistory((prev) => [newChat, ...prev]);
    setMessages(newChat.messages);
    setSelectedChat(newChat.id);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { id: Date.now(), sender: "user", text: input };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    // Show typing indicator
    setIsTyping(true);

    try {
      const result = await sendMessage(userMessage.text);

      const botMessage = {
        id: Date.now(),
        sender: "bot",
        text: result.reply,
        references: result.references || [],
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      setHistory((prev) =>
        prev.map((chat) =>
          chat.id === selectedChat ? { ...chat, messages: finalMessages } : chat
        )
      );
    } catch (err) {
      const errorMsg = {
        id: Date.now(),
        sender: "bot",
        text: "❌ Sorry, something went wrong.",
        references: [],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const loadChat = (chat) => {
    setSelectedChat(chat.id);
    setMessages(chat.messages);
  };

  const deleteChat = (id) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    if (selectedChat === id && updated.length > 0) {
      setMessages(updated[0].messages);
      setSelectedChat(updated[0].id);
    } else if (updated.length === 0) {
      startNewChat();
    }
  };

  const filteredHistory = history.filter((chat) =>
    chat.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="search-box">
          <i className="bi bi-search "></i>
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="chat-history">
          {filteredHistory.length > 0 ? (
            filteredHistory.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item ${
                  selectedChat === chat.id ? "active" : ""
                }`}
                onClick={() => loadChat(chat)}
              >
                <span>{chat.messages[1]?.text.slice(0, 25) || chat.title}</span>
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
          <p>Empathetic • Intelligent • Reliable</p>
        </header>

        <div className="chat-body">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble ${msg.sender}`}>
              <p>{msg.text}</p>
              {msg.sender === "bot" && msg.references && msg.references.length > 0 && (
                <div className="chat-references">
                  <strong>Sources:</strong>
                  <ul>
                    {msg.references.map((ref, i) => (
                      <li key={i}>
                        Chunk {ref.chunk_id} | Page {ref.page} | {ref.source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
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