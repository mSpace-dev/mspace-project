"use client";
import React, { useState, useEffect, FormEvent } from "react";

interface ChatMessage {
  question: string;
  answer: string;
  timestamp: string;
}

export default function Chatbot() {
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("agrilink_chat_history");
    if (stored) setHistory(JSON.parse(stored));
  }, []);

  // Save chat history to localStorage on change
  useEffect(() => {
    localStorage.setItem("agrilink_chat_history", JSON.stringify(history));
  }, [history]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");
    const userQuestion = query;
    setQuery(""); // Clear input after submit
    const res = await fetch("/api/chatbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userQuestion }),
    });
    const data = await res.json();
    const answer = data.data?.response || data.response || "No response";
    setResponse(answer);
    setHistory((prev) => [
      {
        question: userQuestion,
        answer,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);
    setLoading(false);
  };

  return (
    <div className="chatbot-container flex flex-col items-center min-h-[70vh] w-full max-w-2xl mx-auto p-4 bg-white rounded-xl shadow-lg">
      <div className="flex-1 w-full flex flex-col gap-2 overflow-y-auto mb-6">
        {loading && (
          <div className="text-center text-green-700">Thinking...</div>
        )}
        {!loading && response === "" && history.length === 0 && (
          <div className="text-center text-green-700">
            Ask a question to get started!
          </div>
        )}
        <div className="flex flex-col gap-4">
          {[...history].map((chat, idx) => (
            <div
              key={idx}
              className="flex w-full gap-2 items-end justify-between"
            >
              {/* User question on left */}
              <div className="flex flex-col items-start flex-1">
                <div className="bg-green-100 text-gray-900 rounded-lg px-4 py-2 max-w-[70%] shadow">
                  <span className="font-semibold">You:</span> {chat.question}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {chat.timestamp}
                </div>
              </div>
              {/* Bot response on right */}
              <div className="flex flex-col items-end flex-1">
                <div className="bg-green-600 text-white rounded-lg px-4 py-2 max-w-[70%] shadow">
                  <span className="font-semibold">Bot:</span> {chat.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center gap-2 mt-4"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question…"
          className="border p-2 rounded w-full text-black focus:outline-none focus:ring-0"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-green-600 text-white rounded font-semibold"
        >
          Send
        </button>
      </form>
    </div>
  );
}