'use client';

import { useEffect, useState } from 'react';
import MessageActions from '@/components/admin/MessageActions';

type Message = {
  id: string;
  content: string;
  contact_email: string | null;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
};

export default function MessagesTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'new' | 'in_progress' | 'resolved'>('new');

  async function fetchMessages() {
    const res = await fetch('/api/messages/list');
    const data = await res.json();

    setMessages(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchMessages();
  }, []);

  const statusStyles: Record<string, string> = {
    new: 'border-l-4 border-blue-500 bg-blue-50',
    in_progress: 'border-l-4 border-yellow-500 bg-yellow-50',
    resolved: 'border-l-4 border-green-500 bg-green-50',
  };

  const counts = {
    new: messages.filter((m) => m.status === 'new').length,
    in_progress: messages.filter((m) => m.status === 'in_progress').length,
    resolved: messages.filter((m) => m.status === 'resolved').length,
  };

  const filteredMessages = messages.filter(
    (msg) => msg.status === activeTab
  );

  if (loading) {
    return <div className="p-6">Loading messages...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">

      {/* Header */}
      <h1 className="text-xl font-semibold mb-4">Messages</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['new', 'in_progress', 'resolved'] as const).map((tab) => {
          const isActive = activeTab === tab;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-full text-sm capitalize border transition ${
                isActive
                  ? 'bg-black text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.replace('_', ' ')} ({counts[tab]})
            </button>
          );
        })}
      </div>

      {/* Message List */}
      <div className="space-y-4">
        {filteredMessages.map((msg) => (
          <div
            key={msg.id}
            className={`border rounded p-4 space-y-2 ${
              statusStyles[msg.status] || ''
            }`}
          >
            <div className="text-sm text-gray-500">
              {new Date(msg.created_at).toLocaleString()}
            </div>

            <div className="font-medium whitespace-pre-wrap">
              {msg.content}
            </div>

            {msg.contact_email && (
              <div className="text-sm text-gray-700">
                {msg.contact_email}
              </div>
            )}

            <div className="text-xs uppercase tracking-wide">
              Status: {msg.status}
            </div>

            <MessageActions
              id={msg.id}
              currentStatus={msg.status}
            />
          </div>
        ))}

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="text-sm text-gray-500">
            No {activeTab.replace('_', ' ')} messages
          </div>
        )}
      </div>
    </div>
  );
}