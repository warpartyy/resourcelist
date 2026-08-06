export interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ConversationContext {
  conversationId: string;
  turns: ConversationTurn[];
}

export interface CreateConversationOptions {
  conversationId?: string;
}
