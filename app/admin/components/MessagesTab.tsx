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

function timeAgo(date: string) {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

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


      <p className="text-sm text-gray-500 mb-4">
        Messages from users and community feedback
      </p>

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
            className={`border rounded p-4 space-y-3 ${
              statusStyles[msg.status] || ''
            }`}
          >
            {/* Top Row */}
            <div className="flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {timeAgo(msg.created_at)}
              </div>

              {msg.status === 'new' && (
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded">
                  New
                </span>
              )}
            </div>

            {/* Message Content */}
            <div className="text-sm whitespace-pre-wrap">
              {msg.content}
            </div>

            {/* Email */}
            {msg.contact_email && (
              <div className="text-xs text-gray-500">
                From: {msg.contact_email}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t">
<MessageActions
  id={msg.id}
  currentStatus={msg.status}
  onUpdate={(newStatus) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === msg.id ? { ...m, status: newStatus } : m
      )
    );
  }}
/>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="text-sm text-gray-500 py-6">
            No {activeTab.replace('_', ' ')} messages right now
          </div>
        )}
      </div>
    </div>
  );
}