'use client';

import { useState } from 'react';
import MessageActions from './MessageActions';

export default function MessagesList({ initialMessages }: { initialMessages: any[] }) {
  const [messages, setMessages] = useState(initialMessages);

  function handleUpdate(id: string, newStatus: string) {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === id ? { ...msg, status: newStatus } : msg
      )
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div key={msg.id} className="border rounded p-4 space-y-2">
          <div className="text-sm text-gray-500">
            {new Date(msg.created_at).toLocaleString()}
          </div>

          <div className="font-medium whitespace-pre-wrap">
            {msg.content}
          </div>

          {msg.contact_email && (
            <div className="text-sm">
              {msg.contact_email}
            </div>
          )}

          <div className="text-xs uppercase tracking-wide">
            Status: {msg.status}
          </div>

          <MessageActions
            id={msg.id}
            currentStatus={msg.status}
            onUpdate={(status) => handleUpdate(msg.id, status)}
          />
        </div>
      ))}
    </div>
  );
}