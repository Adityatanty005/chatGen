import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

export default function MessageList() {
  const { messages, loading, typingUsers } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm dark:bg-slate-800 dark:text-slate-300">
            No messages yet
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/40 dark:bg-slate-950/20">
      {messages.map((msg, index) => {
        const isMine = msg.sender === user?.email;
        const isSystem = msg.type === 'system';
        return (
          <div
            key={msg._id || index}
            className={`flex ${isSystem ? 'justify-center' : isMine ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-3 py-2 rounded-2xl shadow-sm ${
                isSystem
                  ? 'bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800'
                  : isMine
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-bl-md dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800'
              }`}
            >
              {!isSystem && (
                <div className={`text-[10px] mb-1 ${isMine ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  {msg.sender} • {msg.timestamp}
                </div>
              )}
              <div className={isSystem ? 'italic text-sm' : ''}>{msg.text}</div>
            </div>
          </div>
        );
      })}

      {/* Typing indicators */}
      {typingUsers.size > 0 && (
        <div className="flex justify-start">
          <div className="bg-white border border-slate-200 dark:bg-slate-900 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-300">
            {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
