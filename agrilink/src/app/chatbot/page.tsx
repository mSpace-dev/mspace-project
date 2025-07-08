'use client';
import React, { useState } from 'react';
import styles from '../components/ChatbotWidget.module.css';

type Message = { sender: 'user' | 'bot'; text: string };

const ChatbotPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage: Message = { sender: 'user', text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [...msgs, { sender: 'bot', text: data.reply }]);
    } catch (e) {
      setMessages((msgs) => [...msgs, { sender: 'bot', text: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #e0fbe9 0%, #fff 100%)', display: 'flex' }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: '#22c55e', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '32px 0 0 0', minHeight: '100vh', boxShadow: '2px 0 12px rgba(34,197,94,0.08)' }}>
        <div style={{ fontWeight: 700, fontSize: 24, padding: '0 32px 32px 32px', letterSpacing: 1 }}>AgriLink Chatbot</div>
        <nav style={{ width: '100%' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '12px 32px', fontWeight: 500, background: 'rgba(255,255,255,0.08)', borderRadius: 8, margin: '0 16px 8px 16px' }}>Chat</li>
            <li style={{ padding: '12px 32px', color: '#d1fadf', cursor: 'not-allowed', margin: '0 16px 8px 16px' }}>History</li>
            <li style={{ padding: '12px 32px', color: '#d1fadf', cursor: 'not-allowed', margin: '0 16px 8px 16px' }}>Settings</li>
          </ul>
        </nav>
      </aside>
      {/* Main Chat Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', background: 'transparent', minHeight: '100vh' }}>
        <div style={{ width: '100%', maxWidth: 600, margin: '48px auto 0 auto', background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(34,197,94,0.10)', display: 'flex', flexDirection: 'column', minHeight: 540 }}>
          <div className={styles.header} style={{ borderRadius: '18px 18px 0 0', background: 'linear-gradient(90deg, #22c55e 60%, #16a34a 100%)', color: '#fff', fontSize: 22, fontWeight: 700, padding: '20px 32px' }}>
            Chatbot
          </div>
          <div className={styles.messages} style={{ minHeight: 320, background: '#f6fef9', borderRadius: 0, padding: '28px 24px 16px 24px' }}>
            {messages.length === 0 && (
              <div style={{ color: '#888', textAlign: 'center', marginTop: 40, fontSize: 18 }}>
                Ask me anything about agri prices, products, or markets!
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={msg.sender === 'user' ? styles.userMsg : styles.botMsg}>
                {msg.text}
              </div>
            ))}
            {loading && <div className={styles.botMsg}>...</div>}
          </div>
          <div className={styles.inputRow} style={{ borderRadius: '0 0 18px 18px', background: '#f6fef9', padding: '18px 18px 18px 24px' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              disabled={loading}
              className={styles.input}
            />
            <button onClick={handleSend} disabled={loading || !input.trim()} className={styles.sendBtn}>
              ➤
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatbotPage;
