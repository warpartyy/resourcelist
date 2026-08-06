import { RESOURCE_GUIDE_AI_CONFIG } from "../config";
import type { ConversationContext, ConversationTurn } from "./types";

export function createConversationContext(conversationId: string): ConversationContext {
  return {
    conversationId,
    turns: [],
  };
}

export function appendTurn(
  context: ConversationContext,
  turn: ConversationTurn,
  windowSize = RESOURCE_GUIDE_AI_CONFIG.conversationWindow
): ConversationContext {
  return {
    ...context,
    turns: [...context.turns, turn].slice(-windowSize),
  };
}

export function getPromptContextTurns(
  context: ConversationContext,
  currentUserMessage: string
): ConversationTurn[] {
  return context.turns.filter(
    (turn, index) =>
      index !== context.turns.length - 1 ||
      turn.role !== "user" ||
      turn.content !== currentUserMessage
  );
}

export function createTurn(
  role: ConversationTurn["role"],
  content: string
): ConversationTurn {
  return {
    role,
    content,
    timestamp: new Date().toISOString(),
  };
}
