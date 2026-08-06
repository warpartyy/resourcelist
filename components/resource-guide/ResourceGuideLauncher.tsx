"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ResourceGuideWindow from "./ResourceGuideWindow";

export default function ResourceGuideLauncher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>();

  if (pathname?.startsWith("/admin") || pathname === "/resource-guide") {
    return null;
  }

  return (
    <>
      <ResourceGuideWindow
        isOpen={isOpen}
        conversationId={conversationId}
        onClose={() => setIsOpen(false)}
        onConversationIdChange={setConversationId}
      />
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-50 inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border border-teal-800 bg-teal-700 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-teal-800 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 md:bottom-6 md:right-6 md:px-5 ${
          isOpen ? "pointer-events-none opacity-0 md:pointer-events-auto md:opacity-100" : ""
        }`}
        aria-expanded={isOpen}
        aria-controls="resource-guide-window"
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        Resource Chat
      </button>
    </>
  );
}
