'use client';

import { useEffect, useState } from 'react';
import MessageActions from '@/components/admin/MessageActions';
import { getSupabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type Message = {
  id: string;
  content: string;
  contact_email: string | null;
  status: 'new' | 'in_progress' | 'resolved';
  created_at: string;
  responded_at?: string | null;
  replies?: MessageReply[];
};

type MessageReply = {
  id: string;
  contact_message_id: string;
  message: string;
  sent_by: string | null;
  sent_at: string;
  profiles?: {
    display_name: string | null;
    email: string | null;
  } | null;
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

  useEffect(() => {
    let isMounted = true;

    void fetch('/api/messages/list')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) {
            setMessages(data);
          } else {
            console.error("Messages API returned a non-array response", data);
            setMessages([]);
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
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
              {getStatusLabel(tab)} ({counts[tab]})
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
              {msg.status === 'resolved' && (
                <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">
                  Responded
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

            <MessageReplyPanel
              message={msg}
              onReplySent={({ reply, respondedAt }) => {
                setMessages((prev) =>
                  prev.map((message) =>
                    message.id === msg.id
                      ? {
                          ...message,
                          status: 'resolved',
                          responded_at: respondedAt,
                          replies: [...(message.replies ?? []), reply],
                        }
                      : message,
                  ),
                );
              }}
            />
          </div>
        ))}

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="text-sm text-gray-500 py-6">
            No {getStatusLabel(activeTab).toLowerCase()} messages right now
          </div>
        )}
      </div>
    </div>
  );
}

function MessageReplyPanel({
  message,
  onReplySent,
}: {
  message: Message;
  onReplySent: (result: {
    reply: MessageReply;
    respondedAt: string | null;
  }) => void;
}) {
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const canReply = Boolean(message.contact_email);

  async function sendReply() {
    const trimmedReply = reply.trim();

    if (!trimmedReply || sending) {
      return;
    }

    setSending(true);

    try {
      const token = await getCurrentAccessToken();
      const response = await fetch("/api/admin/contact/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messageId: message.id,
          reply: trimmedReply,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to send reply");
      }

      onReplySent({
        reply: data.reply as MessageReply,
        respondedAt: data.message?.responded_at ?? null,
      });
      setReply("");
      toast.success("Reply sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send reply");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border-t pt-4">
      {message.replies && message.replies.length > 0 ? (
        <div className="mb-4">
          <h4 className="mb-3 text-sm font-semibold text-gray-900">
            Reply History
          </h4>
          <div className="space-y-3">
            {message.replies.map((item) => (
              <div key={item.id} className="rounded-lg border bg-white p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>{new Date(item.sent_at).toLocaleString()}</span>
                  <span>•</span>
                  <span>{getReplyAuthor(item)}</span>
                </div>
                <p className="whitespace-pre-wrap text-sm text-gray-800">
                  {item.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <h4 className="mb-2 text-sm font-semibold text-gray-900">Reply</h4>
      {!canReply ? (
        <p className="text-sm text-gray-500">
          This message does not include an email address for replies.
        </p>
      ) : (
        <div className="space-y-3">
          <textarea
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            rows={5}
            className="w-full rounded-lg border border-border bg-white p-3 text-sm text-text-primary outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            placeholder="Write a reply..."
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={sendReply}
              disabled={sending || !reply.trim()}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Reply"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function getStatusLabel(status: Message["status"]) {
  if (status === "in_progress") return "In Progress";
  if (status === "resolved") return "Responded";
  return "New";
}

function getReplyAuthor(reply: MessageReply) {
  return reply.profiles?.display_name ?? reply.profiles?.email ?? "Admin";
}

async function getCurrentAccessToken() {
  const supabase = getSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.access_token ?? null;
}
