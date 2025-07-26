"use client";

import { useState, useRef, useEffect } from 'react';
import styles from '../components/ChatbotWidget.module.css';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "🌾 Welcome to AgriLink's AI Assistant! I can help you with current crop prices, market forecasts, and agricultural insights for Sri Lanka. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          userId: 'anonymous',
          sessionId: `session_${Date.now()}_${Math.random()}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: data.data.response,
          isUser: false,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickQuestions = [
    "What's the price of rice?",
    "Show me tomato prices",
    "Will potato prices increase?",
    "Best markets for vegetables",
    "Help with price alerts"
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg p-6 hidden md:block">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-green-700 mb-2">AgriLink Assistant</h2>
          <p className="text-gray-600 text-sm">
            Your AI-powered agricultural price assistant for Sri Lanka
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Quick Questions</h3>
          <div className="space-y-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputText(question)}
                className="w-full text-left p-3 text-sm bg-green-50 hover:bg-green-100 rounded-lg transition-colors border border-green-200 text-gray-700"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 mb-2">🌾 What I Can Help With:</h3>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Current crop prices</li>
            <li>• Price forecasts & trends</li>
            <li>• Market locations</li>
            <li>• Agricultural insights</li>
            <li>• SMS alert setup</li>
          </ul>
        </div>

        <div className="mt-6">
          <a
            href="/home"
            className="flex items-center justify-center w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="md:hidden mr-3">
                <a href="/home" className="text-green-600 hover:text-green-700">
                  ← Back
                </a>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <h1 className="text-xl font-semibold text-gray-800">Chat Assistant</h1>
            </div>
            <div className="text-sm text-gray-500">
              AI-Powered • Real-time Data
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${styles.messageContainer} ${
                  message.isUser ? styles.userMessage : styles.botMessage
                }`}
              >
                <div className="whitespace-pre-wrap break-words">
                  {message.text}
                </div>
                <div className={`text-xs mt-2 ${message.isUser ? 'text-green-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className={`${styles.messageContainer} ${styles.botMessage}`}>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about crop prices, market trends, or any agricultural question..."
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-gray-900 placeholder-gray-500 bg-white font-medium"
                rows={2}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!inputText.trim() || isLoading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Send'
              )}
            </button>
          </div>

          {/* Mobile Quick Questions */}
          <div className="md:hidden mt-3">
            <div className="flex flex-wrap gap-2">
              {quickQuestions.slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInputText(question)}
                  className="text-xs bg-green-50 hover:bg-green-100 text-green-700 px-3 py-1 rounded-full border border-green-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
