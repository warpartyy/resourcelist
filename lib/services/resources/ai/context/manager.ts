import {
  appendTurn,
  createConversationContext,
  createTurn,
} from "./context";
import type {
  ConversationContext,
  CreateConversationOptions,
} from "./types";

const conversations = new Map<string, ConversationContext>();

export function createConversation(
  options: CreateConversationOptions = {}
): ConversationContext {
  const conversationId = options.conversationId || createConversationId();
  const context = createConversationContext(conversationId);

  conversations.set(conversationId, context);

  return context;
}

export function getConversation(conversationId: string): ConversationContext | null {
  return conversations.get(conversationId) ?? null;
}

export function appendUserMessage(
  conversationId: string,
  content: string
): ConversationContext {
  return appendMessage(conversationId, "user", content);
}

export function appendAssistantMessage(
  conversationId: string,
  content: string
): ConversationContext {
  return appendMessage(conversationId, "assistant", content);
}

export function clearConversation(conversationId: string): void {
  conversations.delete(conversationId);
}

function appendMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string
): ConversationContext {
  const existing = getConversation(conversationId) ?? createConversation({ conversationId });
  const updated = appendTurn(existing, createTurn(role, content));

  conversations.set(conversationId, updated);

  return updated;
}

function createConversationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `resource-guide-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
