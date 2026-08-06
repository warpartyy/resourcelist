"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";

type ResourceSearchReason = {
  field: string;
  matchedValue: string;
  points: number;
};

type GroundedResourceResult = {
  score: number;
  confidence: "high" | "medium" | "low";
  isFallbackMatch?: boolean;
  selectionTier?: "high" | "medium" | "fallback";
  reasons: ResourceSearchReason[];
  resource: {
    id: string;
    slug?: string | null;
    organization: string | null;
    description: string | null;
    city?: string | null;
    state?: string | null;
    services: string[] | null;
    parent_categories?: string[] | null;
    subcategories?: string[] | null;
    eligibility: string | null;
    tribal_eligibility: string | null;
    counties_served: string[] | null;
    website: string | null;
    phone: string | null;
    application_link: string | null;
    last_verified?: string | null;
  };
};

type ResourceGuideMetadata = {
  model?: string;
  promptVersion?: string;
  normalizedQuery?: string;
  detectedNeeds?: string[];
  expandedTerms?: string[];
  usesFallbackResults?: boolean;
  selectionTier?: "high" | "medium" | "fallback";
};

type ResourceGuideSearchMetadata = {
  normalizedQuery?: string;
  detectedNeeds?: string[];
  expandedTerms?: string[];
};

type ClarificationOption = {
  id: string;
  label: string;
};

type ChatApiResponse =
  | {
      type: "clarification";
      conversationId: string;
      question: string;
      options: ClarificationOption[];
    }
  | {
      type: "answer";
      conversationId: string;
      response: string;
      metadata?: ResourceGuideMetadata;
      searchMetadata?: ResourceGuideSearchMetadata;
      groundedResults?: GroundedResourceResult[];
    };

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  conversationId?: string;
  userMessage?: string;
  metadata?: ResourceGuideMetadata;
  searchMetadata?: ResourceGuideSearchMetadata;
  groundedResults?: GroundedResourceResult[];
  clarificationOptions?: ClarificationOption[];
  feedbackSubmitted?: boolean;
  feedbackSubmitting?: boolean;
  feedbackDialog?: FeedbackSentiment;
  feedbackSelections?: string[];
  feedbackOtherText?: string;
  visibleRecommendationCount?: number;
  createdAtMs?: number;
};

type FeedbackSentiment = "helpful" | "not_helpful";

type StructuredFeedbackOption = {
  id: string;
  label: string;
};

type ResourceGuideChatProps = {
  initialConversationId?: string;
  compact?: boolean;
  onConversationIdChange?: (conversationId: string) => void;
  onFeedbackSubmitted?: () => void;
  onFeedbackDraftChange?: (draft: ResourceGuideFeedbackDraft | null) => void;
};

export type ResourceGuideFeedbackDraft = {
  conversationId: string;
  toolId: string;
  promptVersion?: string;
  model?: string;
  query?: string;
  response?: string;
  resourceIds: string[];
  confidence: "high" | "medium" | "low" | "none";
  metadata: {
    searchMetadata?: ResourceGuideSearchMetadata;
    aiMetadata?: ResourceGuideMetadata;
    normalizedQuery?: string;
    detectedNeeds?: string[];
    expandedTerms?: string[];
  };
};

type MessageControls = {
  onHelpful: (messageId: string) => void;
  onNotHelpful: (messageId: string) => void;
  onCancelFeedback: (messageId: string) => void;
  onToggleFeedbackSelection: (messageId: string, selection: string) => void;
  onFeedbackOtherTextChange: (messageId: string, value: string) => void;
  onSubmitFeedback: (messageId: string) => void;
  onResourceClick: (
    message: ChatMessage,
    resourceId: string,
    recommendationPosition: number,
    totalRecommendationsShown: number
  ) => void;
  onShowMoreResults: (messageId: string) => void;
  onClarificationOption: (label: string) => void;
};

const INITIAL_VISIBLE_RESULTS = 3;
const RESULTS_PER_PAGE = 3;
const DESCRIPTION_LIMIT = 200;
const STATE_LABELS: Record<string, string> = {
  OK: "Oklahoma",
};
const HELPFUL_FEEDBACK_OPTIONS: StructuredFeedbackOption[] = [
  { id: "found_resource", label: "I found the resource I needed" },
  { id: "relevant_recommendations", label: "The recommendations were relevant" },
  { id: "understood_question", label: "The AI understood my question" },
  { id: "clear_explanation", label: "The explanation was clear" },
  {
    id: "discovered_resource",
    label: "I discovered a resource I didn't know about",
  },
  { id: "other", label: "Other" },
];
const NOT_HELPFUL_FEEDBACK_OPTIONS: StructuredFeedbackOption[] = [
  { id: "could_not_find", label: "I couldn't find what I needed" },
  { id: "not_relevant", label: "The recommendations weren't relevant" },
  { id: "misunderstood_request", label: "The AI misunderstood my request" },
  { id: "too_many_results", label: "Too many results" },
  { id: "too_few_results", label: "Too few results" },
  { id: "missing_resources", label: "Important resources were missing" },
  { id: "explanation_not_helpful", label: "The explanation wasn't helpful" },
  { id: "other", label: "Other" },
];

export default function ResourceGuideChat({
  initialConversationId,
  compact = false,
  onConversationIdChange,
  onFeedbackSubmitted,
  onFeedbackDraftChange,
}: ResourceGuideChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const chatHeight = compact ? "min-h-0 flex-1" : "h-[640px]";
  const scrollAreaClasses = compact
    ? "rounded-none p-4 md:rounded-2xl"
    : "rounded-2xl p-4";

  const updateConversationId = (nextConversationId: string) => {
    setConversationId(nextConversationId);
    onConversationIdChange?.(nextConversationId);
  };

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        content: trimmedMessage,
      },
    ]);
    setInput("");
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmedMessage,
          ...(conversationId ? { conversationId } : {}),
        }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const data = (await response.json()) as ChatApiResponse;
      updateConversationId(data.conversationId);

      const assistantMessage =
        data.type === "clarification"
          ? buildClarificationMessage(data, trimmedMessage)
          : buildAnswerMessage(data, trimmedMessage);

      if (assistantMessage.role === "assistant" && !assistantMessage.clarificationOptions?.length) {
        onFeedbackDraftChange?.(buildFeedbackDraft(assistantMessage));
      }

      setMessages((prev) => [
        ...prev,
        assistantMessage,
      ]);
    } catch (error) {
      console.error("Resource Guide request failed:", error);
      toast.error("Unable to get a response from Resource Guide.");
    } finally {
      setIsSending(false);
    }
  };

  const submitFeedback = async (
    message: ChatMessage,
    sentiment: FeedbackSentiment,
    selections: string[],
    otherText?: string
  ) => {
    if (!message.conversationId || message.feedbackSubmitted) {
      return;
    }

    setMessages((prev) =>
      prev.map((item) =>
        item.id === message.id ? { ...item, feedbackSubmitting: true } : item
      )
    );

    try {
      const response = await fetch("/api/resource-guide/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          buildFeedbackPayload({
            message,
            helpful: sentiment === "helpful",
            selections,
            otherText,
          })
        ),
      });

      if (!response.ok) {
        throw new Error("Feedback request failed");
      }

      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id
            ? { ...item, feedbackSubmitted: true, feedbackSubmitting: false }
            : item
        )
      );
      onFeedbackSubmitted?.();
      toast.success("Thanks for helping us improve the Resource Guide!");
    } catch (error) {
      console.error("Resource Guide feedback failed:", error);
      toast.error("Unable to submit feedback.");
      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id ? { ...item, feedbackSubmitting: false } : item
        )
      );
    }
  };

  const controls: MessageControls = {
    onHelpful: (messageId) => {
      openFeedbackDialog(messageId, "helpful");
    },
    onNotHelpful: (messageId) => {
      openFeedbackDialog(messageId, "not_helpful");
    },
    onCancelFeedback: (messageId) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId
            ? {
                ...item,
                feedbackDialog: undefined,
                feedbackSelections: [],
                feedbackOtherText: "",
              }
            : item
        )
      );
    },
    onToggleFeedbackSelection: (messageId, selection) => {
      setMessages((prev) =>
        prev.map((item) => {
          if (item.id !== messageId) {
            return item;
          }

          const selections = item.feedbackSelections ?? [];
          const nextSelections = selections.includes(selection)
            ? selections.filter((value) => value !== selection)
            : [...selections, selection];

          return {
            ...item,
            feedbackSelections: nextSelections,
            feedbackOtherText: nextSelections.includes("other")
              ? item.feedbackOtherText
              : "",
          };
        })
      );
    },
    onFeedbackOtherTextChange: (messageId, value) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId ? { ...item, feedbackOtherText: value } : item
        )
      );
    },
    onSubmitFeedback: (messageId) => {
      const message = messages.find((item) => item.id === messageId);
      if (message?.feedbackDialog) {
        void submitFeedback(
          message,
          message.feedbackDialog,
          message.feedbackSelections ?? [],
          message.feedbackOtherText
        );
      }
    },
    onResourceClick: (
      message,
      resourceId,
      recommendationPosition,
      totalRecommendationsShown
    ) => {
      trackResourceClick(
        message,
        resourceId,
        recommendationPosition,
        totalRecommendationsShown
      );
    },
    onShowMoreResults: (messageId) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId
            ? {
                ...item,
                visibleRecommendationCount:
                  (item.visibleRecommendationCount ?? INITIAL_VISIBLE_RESULTS) +
                  RESULTS_PER_PAGE,
              }
            : item
        )
      );
    },
    onClarificationOption: (label) => {
      void sendMessage(label);
    },
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const openFeedbackDialog = (
    messageId: string,
    sentiment: FeedbackSentiment
  ) => {
    setMessages((prev) =>
      prev.map((item) =>
        item.id === messageId && !item.feedbackSubmitted
          ? {
              ...item,
              feedbackDialog: sentiment,
              feedbackSelections: [],
              feedbackOtherText: "",
            }
          : item
      )
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <div
        className={`min-w-0 overflow-x-hidden overflow-y-auto bg-bg ${scrollAreaClasses} ${chatHeight} space-y-5`}
      >
        {messages.length === 0 ? (
          <p className="text-sm text-text-muted">
            Ask a question and the Resource Chat will respond using verified
            resources from the directory.
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              controls={controls}
            />
          ))
        )}
        {isSending ? (
          <p className="max-w-[min(88%,34rem)] rounded-2xl rounded-bl-md bg-surface px-4 py-3 text-sm text-text-muted shadow-sm">
            Searching verified resources...
          </p>
        ) : null}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 flex-col gap-2 border-t border-border bg-bg p-3 sm:flex-row md:border-t-0 md:p-0"
      >
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your question..."
          className="min-h-12 min-w-0 flex-1 rounded-xl border border-border bg-surface px-4 py-3 text-base text-text-primary shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 sm:text-sm"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="min-h-12 rounded-xl bg-teal-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

function buildAnswerMessage(
  data: Extract<ChatApiResponse, { type: "answer" }>,
  userMessage: string
): ChatMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: data.response,
    conversationId: data.conversationId,
    userMessage,
    metadata: data.metadata,
    searchMetadata: data.searchMetadata,
    groundedResults: data.groundedResults ?? [],
    visibleRecommendationCount: INITIAL_VISIBLE_RESULTS,
    createdAtMs: Date.now(),
  };
}

function buildClarificationMessage(
  data: Extract<ChatApiResponse, { type: "clarification" }>,
  userMessage: string
): ChatMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: data.question,
    conversationId: data.conversationId,
    userMessage,
    clarificationOptions: data.options,
    groundedResults: [],
    createdAtMs: Date.now(),
  };
}

function MessageBubble({
  message,
  controls,
}: {
  message: ChatMessage;
  controls: MessageControls;
}) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[min(86%,34rem)] whitespace-pre-wrap break-words rounded-2xl rounded-br-md border border-accent/30 bg-accent/10 px-4 py-3 text-sm leading-6 text-text-primary [overflow-wrap:anywhere]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <article className="space-y-3">
      <div className="max-w-[min(92%,36rem)] whitespace-pre-wrap break-words rounded-2xl rounded-bl-md bg-surface px-4 py-3 text-sm leading-6 text-text-primary shadow-sm [overflow-wrap:anywhere]">
        {getAssistantDisplayText(message)}
      </div>

      {message.clarificationOptions?.length ? (
        <ul className="flex flex-wrap gap-2">
          {message.clarificationOptions.map((option) => (
            <li key={option.id}>
              <button
                type="button"
                onClick={() => controls.onClarificationOption(option.label)}
                className="rounded-full border border-border bg-bg px-3 py-1 text-sm text-text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <RecommendedResources message={message} controls={controls} />
      )}

      {!message.clarificationOptions?.length ? (
        <ResponseFeedback
          message={message}
          onHelpful={() => controls.onHelpful(message.id)}
          onNotHelpful={() => controls.onNotHelpful(message.id)}
          onCancel={() => controls.onCancelFeedback(message.id)}
          onToggleSelection={(selection) =>
            controls.onToggleFeedbackSelection(message.id, selection)
          }
          onOtherTextChange={(value) =>
            controls.onFeedbackOtherTextChange(message.id, value)
          }
          onSubmit={() => controls.onSubmitFeedback(message.id)}
        />
      ) : null}
    </article>
  );
}

function RecommendedResources({
  message,
  controls,
}: {
  message: ChatMessage;
  controls: MessageControls;
}) {
  const results = message.groundedResults ?? [];
  const visibleCount = message.visibleRecommendationCount ?? INITIAL_VISIBLE_RESULTS;
  const visibleResults = results.slice(0, visibleCount);

  if (results.length === 0) {
    return null;
  }

  return (
    <section aria-label="Recommended resources" className="max-w-full space-y-3 overflow-hidden">
      <ul className="space-y-2">
        {visibleResults.map((result, index) => (
          <li key={`${message.id}-${result.resource.id}-${index}`}>
            <RecommendedResourceCard
              result={result}
              onResourceClick={(resourceId) =>
                controls.onResourceClick(
                  message,
                  resourceId,
                  index + 1,
                  visibleResults.length
                )
              }
            />
          </li>
        ))}
      </ul>
      {visibleCount < results.length ? (
        <button
          type="button"
          onClick={() => controls.onShowMoreResults(message.id)}
          className="min-h-11 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Show More Results
        </button>
      ) : null}
    </section>
  );
}

function getAssistantDisplayText(message: ChatMessage): string {
  if (message.clarificationOptions?.length) {
    return message.content;
  }

  const results = message.groundedResults ?? [];

  if (results.length === 0) {
    return (
      getBriefPlainText(message.content) ||
      "I couldn't find matching resources in the directory for that request."
    );
  }

  const need = getNeedLabel(
    message.metadata?.detectedNeeds ?? message.searchMetadata?.detectedNeeds ?? []
  );
  const location = getSharedLocation(results.slice(0, INITIAL_VISIBLE_RESULTS));
  const countPhrase =
    results.length === 1
      ? `one ${need} resource`
      : results.length === 2
        ? `a couple of ${need} resources`
        : `${results.length > INITIAL_VISIBLE_RESULTS ? "several" : "a few"} ${need} resources`;
  const locationPhrase = location ? ` in the ${location} area` : "";

  return `I found ${countPhrase}${locationPhrase} that look like good matches. I've listed the best options below, and I can narrow things further if these aren't quite right.`;
}

function getBriefPlainText(value: string): string {
  const withoutListLines = value
    .split(/\r?\n/)
    .filter((line) => !/^\s*(?:[-*•]|\d+[.)])\s+/.test(line))
    .join(" ")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!withoutListLines) {
    return "";
  }

  const sentences = withoutListLines.match(/[^.!?]+[.!?]+/g);

  if (sentences && sentences.length > 0) {
    return sentences.slice(0, 2).join(" ").trim();
  }

  return truncateDescription(withoutListLines);
}

function getNeedLabel(needs: string[]): string {
  const primaryNeed = needs[0];

  if (!primaryNeed) {
    return "resource";
  }

  const labels: Record<string, string> = {
    healthcare: "healthcare",
    mental_health: "mental health",
    substance_use: "substance use",
    housing: "housing",
    food: "food",
    utilities: "utility",
    transportation: "transportation",
    legal: "legal",
    employment: "employment",
  };

  return labels[primaryNeed] ?? "resource";
}

function getSharedLocation(results: GroundedResourceResult[]): string | null {
  const cities = results
    .map((result) => result.resource.city?.trim())
    .filter((city): city is string => Boolean(city));

  if (cities.length === 0) {
    return null;
  }

  return cities.every((city) => city === cities[0]) ? cities[0] : null;
}

function RecommendedResourceCard({
  result,
  onResourceClick,
}: {
  result: GroundedResourceResult;
  onResourceClick: (resourceId: string) => void;
}) {
  const { resource } = result;
  const location = formatLocation(resource.city, resource.state);

  return (
    <article className="w-full max-w-full overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="break-words text-sm font-semibold leading-5 text-text-primary [overflow-wrap:anywhere]">
          {resource.organization || "Unnamed resource"}
        </h3>
        <span className="inline-flex w-fit shrink-0 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-800">
          {getMatchBadgeLabel(result)}
        </span>
      </div>

      {resource.description ? (
        <p className="mt-2 text-sm leading-5 text-text-muted">
          {truncateDescription(resource.description)}
        </p>
      ) : null}

      {location ? (
        <p className="mt-2 text-xs font-medium text-text-muted">{location}</p>
      ) : null}

      <Link
        href={getResourceHref(resource)}
        onClick={() => onResourceClick(resource.id)}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 sm:w-auto"
      >
        View Resource
      </Link>
    </article>
  );
}

function getMatchBadgeLabel(result: GroundedResourceResult): string {
  if (result.selectionTier === "fallback" || result.isFallbackMatch) {
    return "Closest Match";
  }

  if (result.selectionTier === "medium" || result.confidence === "medium") {
    return "Good Match";
  }

  return "Strong Match";
}

function ResponseFeedback({
  message,
  onHelpful,
  onNotHelpful,
  onCancel,
  onToggleSelection,
  onOtherTextChange,
  onSubmit,
}: {
  message: ChatMessage;
  onHelpful: () => void;
  onNotHelpful: () => void;
  onCancel: () => void;
  onToggleSelection: (selection: string) => void;
  onOtherTextChange: (value: string) => void;
  onSubmit: () => void;
}) {
  if (message.feedbackSubmitted) {
    return (
      <div className="text-sm font-medium text-text-muted">
        Thanks for helping us improve the Resource Guide!
      </div>
    );
  }

  if (message.feedbackDialog) {
    const isHelpful = message.feedbackDialog === "helpful";
    const options = isHelpful
      ? HELPFUL_FEEDBACK_OPTIONS
      : NOT_HELPFUL_FEEDBACK_OPTIONS;
    const selections = message.feedbackSelections ?? [];
    const hasOther = selections.includes("other");

    return (
      <section
        className="max-w-sm overflow-hidden rounded-2xl border border-border bg-surface p-4 shadow-sm"
        aria-label={isHelpful ? "Helpful feedback" : "Not Helpful feedback"}
      >
        <div className="flex items-start gap-2">
          <span className="text-xl leading-none" aria-hidden="true">
            {isHelpful ? "👍" : "👎"}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">
              {isHelpful ? "What was helpful?" : "What could have been better?"}
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              Select all that apply.
            </p>
          </div>
        </div>

        <fieldset className="mt-4 space-y-2">
          {options.map((option) => (
            <label
              key={option.id}
              className="flex items-start gap-2 text-sm text-text-primary"
            >
              <input
                type="checkbox"
                checked={selections.includes(option.id)}
                onChange={() => onToggleSelection(option.id)}
                disabled={message.feedbackSubmitting}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </fieldset>

        {hasOther ? (
          <label className="mt-4 block text-sm text-text-muted">
            <span className="font-medium text-text-primary">Tell us more...</span>
            <textarea
              value={message.feedbackOtherText ?? ""}
              onChange={(event) => onOtherTextChange(event.target.value)}
              disabled={message.feedbackSubmitting}
              rows={3}
              className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            />
          </label>
        ) : null}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={message.feedbackSubmitting}
            className="min-h-11 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={message.feedbackSubmitting || selections.length === 0}
            className="min-h-11 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continue
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="pt-1" aria-label="Response feedback">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onHelpful}
          disabled={message.feedbackSubmitting}
          className="min-h-11 min-w-11 rounded-full border border-border bg-bg px-3 py-1.5 text-lg leading-none text-text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Helpful"
        >
          👍
        </button>
        <button
          type="button"
          onClick={onNotHelpful}
          disabled={message.feedbackSubmitting}
          className="min-h-11 min-w-11 rounded-full border border-border bg-bg px-3 py-1.5 text-lg leading-none text-text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
          aria-label="Not Helpful"
        >
          👎
        </button>
      </div>
    </section>
  );
}

function buildFeedbackPayload({
  message,
  helpful,
  selections,
  otherText,
  clickedResourceId,
  eventType,
  recommendationPosition,
  totalRecommendationsShown,
  timeUntilClickMs,
}: {
  message: ChatMessage;
  helpful?: boolean;
  selections?: string[];
  otherText?: string;
  clickedResourceId?: string;
  eventType?: "resource_click";
  recommendationPosition?: number;
  totalRecommendationsShown?: number;
  timeUntilClickMs?: number;
}) {
  return {
    ...buildFeedbackDraft(message),
    helpful,
    feedback: otherText,
    reason: selections?.join(","),
    structuredFeedback:
      helpful === undefined || !selections
        ? undefined
        : {
            sentiment: helpful ? "helpful" : "not_helpful",
            selections,
            otherText,
    },
    clickedResourceId,
    eventType,
    recommendationPosition,
    totalRecommendationsShown,
    timeUntilClickMs,
  };
}

function buildFeedbackDraft(message: ChatMessage): ResourceGuideFeedbackDraft {
  const resourceIds =
    message.groundedResults?.map((result) => result.resource.id) ?? [];

  return {
    conversationId: message.conversationId || createConversationId(),
    toolId: "resource-search",
    promptVersion: message.metadata?.promptVersion,
    model: message.metadata?.model,
    query: message.userMessage,
    response: message.content,
    resourceIds,
    confidence: getHighestConfidence(message.groundedResults),
    metadata: {
      searchMetadata: message.searchMetadata,
      aiMetadata: message.metadata,
      normalizedQuery:
        message.metadata?.normalizedQuery || message.searchMetadata?.normalizedQuery,
      detectedNeeds:
        message.metadata?.detectedNeeds || message.searchMetadata?.detectedNeeds,
      expandedTerms:
        message.metadata?.expandedTerms || message.searchMetadata?.expandedTerms,
    },
  };
}

function trackResourceClick(
  message: ChatMessage,
  resourceId: string,
  recommendationPosition: number,
  totalRecommendationsShown: number
) {
  if (!message.conversationId) {
    return;
  }

  const payload = buildFeedbackPayload({
    message,
    clickedResourceId: resourceId,
    eventType: "resource_click",
    recommendationPosition,
    totalRecommendationsShown,
    timeUntilClickMs: message.createdAtMs
      ? Math.max(0, Date.now() - message.createdAtMs)
      : undefined,
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/resource-guide/feedback",
      new Blob([JSON.stringify(payload)], { type: "application/json" })
    );
    return;
  }

  void fetch("/api/resource-guide/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  });
}

function truncateDescription(value: string): string {
  const trimmed = value.replace(/\s+/g, " ").trim();

  if (trimmed.length <= DESCRIPTION_LIMIT) {
    return trimmed;
  }

  const truncated = trimmed.slice(0, DESCRIPTION_LIMIT);
  const lastSpace = truncated.lastIndexOf(" ");
  const clean = lastSpace > 120 ? truncated.slice(0, lastSpace) : truncated;

  return `${clean.trim()}...`;
}

function formatLocation(
  city: string | null | undefined,
  state: string | null | undefined
): string | null {
  const stateValue = state?.trim();
  const parts = [
    city?.trim(),
    stateValue ? STATE_LABELS[stateValue.toUpperCase()] ?? stateValue : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

function getResourceHref(resource: GroundedResourceResult["resource"]): string {
  if (resource.slug) {
    return `/resources/${resource.slug}`;
  }

  if (resource.organization) {
    return `/resources/${slugify(resource.organization)}`;
  }

  return `/resources/${resource.id}`;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getHighestConfidence(
  groundedResults: GroundedResourceResult[] | undefined
): "high" | "medium" | "low" | "none" {
  const confidences = groundedResults?.map((result) => result.confidence) ?? [];

  if (confidences.includes("high")) return "high";
  if (confidences.includes("medium")) return "medium";
  if (confidences.includes("low")) return "low";

  return "none";
}

function createConversationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `resource-guide-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
