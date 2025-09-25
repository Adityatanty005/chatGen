import React, { useMemo } from 'react';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

export default function UserList() {
  const { connectedUsers, typingUsers } = useChat();
  const { user } = useAuth();

  const users = useMemo(() => connectedUsers.map(email => ({
    email,
    name: email.split('@')[0],
    initial: (email[0] || '?').toUpperCase()
  })), [connectedUsers]);

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 p-4 hidden md:block">
      <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide mb-3">Online Users</h3>

      {users.length === 0 ? (
        <div className="text-sm text-slate-500 dark:text-slate-400">No users online</div>
      ) : (
        <div className="space-y-1.5">
          {users.map(({ email, name, initial }) => {
            const isMe = email === user?.email;
            const isTyping = typingUsers.has(email);
            return (
              <div key={email} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="relative">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 text-white flex items-center justify-center text-sm font-semibold">
                    {initial}
                  </div>
                  <span className="absolute -bottom-0 -right-0 inline-block w-2.5 h-2.5 rounded-full bg-green-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-slate-800 dark:text-slate-100 truncate">
                    {isMe ? 'You' : name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[16ch]">{email}</div>
                </div>
                {isTyping && (
                  <div className="ml-auto text-xs text-blue-500">typing…</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
