import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';

export default function MessageInput() {
  const { sendMessage, startTyping, stopTyping, loading, isConnected } = useChat();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage({ text: message.trim() });
      setMessage('');
      stopTyping();
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicators
    if (!isTyping && e.target.value.trim()) {
      setIsTyping(true);
      startTyping();
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        stopTyping();
      }
    }, 1000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const disabled = loading || !isConnected;

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 border-t bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <div className="relative flex-1">
        <input
          type="text"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={disabled ? (loading ? 'Connecting…' : 'Disconnected') : 'Type a message…'}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-full bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
        {isTyping && !disabled && (
          <div className="absolute -bottom-5 left-3 text-xs text-slate-500 dark:text-slate-400">typing…</div>
        )}
      </div>
      <button
        type="submit"
        disabled={disabled || !message.trim()}
        className="px-5 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-600 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
      >
        Send
      </button>
    </form>
  );
}
