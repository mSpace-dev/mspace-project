'use client';
import React from 'react';
import styles from './ChatbotWidget.module.css';
import { useRouter } from 'next/navigation';

const ChatbotWidget: React.FC = () => {
  const router = useRouter();

  return (
    <button
      className={styles.fab}
      onClick={() => router.push('/chatbot')}
      aria-label="Open chatbot"
    >
      💬
    </button>
  );
};

export default ChatbotWidget;
