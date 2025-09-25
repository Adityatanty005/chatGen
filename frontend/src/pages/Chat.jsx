// src/pages/Chat.jsx
import React from "react";
import { useChat } from "../context/ChatContext";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import UserList from "../components/UserList";

export default function Chat() {
  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      <ChatHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col">
          <MessageList />
          <MessageInput />
        </div>
        <UserList />
      </div>
    </div>
  );
}
