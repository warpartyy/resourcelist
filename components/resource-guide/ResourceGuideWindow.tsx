"use client";

import Link from "next/link";
import ResourceGuideChat from "./ResourceGuideChat";

type ResourceGuideWindowProps = {
  isOpen: boolean;
  conversationId?: string;
  onClose: () => void;
  onConversationIdChange: (conversationId: string) => void;
};

export default function ResourceGuideWindow({
  isOpen,
  conversationId,
  onClose,
  onConversationIdChange,
}: ResourceGuideWindowProps) {
  const fullGuideHref = conversationId
    ? `/resource-guide?conversationId=${encodeURIComponent(conversationId)}`
    : "/resource-guide";

  return (
    <section
      id="resource-guide-window"
      className={`fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-md rounded-2xl border border-border bg-surface shadow-xl sm:right-6 ${
        isOpen ? "block" : "hidden"
      }`}
      aria-label="Resource Chat"
    >
      <header className="flex items-center justify-between rounded-t-2xl border-b border-teal-800 bg-teal-700 px-4 py-3 text-white">
        <div>
          <h2 className="text-sm font-semibold">Resource Chat</h2>
          <p className="text-xs text-teal-50">Verified directory search</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-teal-100/60 bg-teal-800 px-3 py-1 text-sm text-white hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-teal-700"
          aria-label="Close Resource Chat"
        >
          Close
        </button>
      </header>

      <div className="p-4">
        <ResourceGuideChat
          compact
          initialConversationId={conversationId}
          onConversationIdChange={onConversationIdChange}
        />
      </div>

      <footer className="border-t border-border px-4 py-3">
        <Link
          href={fullGuideHref}
          className="button button-secondary block w-full text-center text-sm"
        >
          Open Full Resource Chat
        </Link>
      </footer>
    </section>
  );
}
