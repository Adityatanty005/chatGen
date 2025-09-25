import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';

export default function ChatHeader() {
  const { user, logout } = useAuth();
  const { isConnected, connectedUsers } = useChat();
  const [dark, setDark] = useState(false);

  const userInitial = useMemo(() => {
    const email = user?.email || '';
    return email ? email.charAt(0).toUpperCase() : '?';
  }, [user]);

  // Initialize theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const next = stored ? stored === 'dark' : prefersDark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800">
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500" />
          <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-100 truncate">Chatgen</h1>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <span className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${isConnected ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
            <span className={`inline-block w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <span className="text-sm text-gray-500 dark:text-slate-400">
            {connectedUsers.length} online
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${dark ? 'bg-slate-700' : 'bg-slate-300'}`}
          aria-label="Toggle theme"
          aria-pressed={dark}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${dark ? 'translate-x-5' : 'translate-x-1'}`}
          />
        </button>
        <div className="hidden md:flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-700 dark:text-slate-200">
              {userInitial}
            </div>
            <div className="text-sm text-gray-600 dark:text-slate-300 truncate max-w-[18ch]">
              {user?.email}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
