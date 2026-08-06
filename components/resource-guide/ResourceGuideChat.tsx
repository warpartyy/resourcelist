"use client";

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
    organization: string | null;
    description: string | null;
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
  feedbackPromptOpen?: boolean;
  feedbackComment?: string;
};

type FeedbackReason =
  | "did_not_understand"
  | "wrong_resources"
  | "missing_resources"
  | "ai_response_unclear"
  | "other";

type ResourceGuideChatProps = {
  initialConversationId?: string;
  compact?: boolean;
  onConversationIdChange?: (conversationId: string) => void;
};

const CONFIDENCE_LABELS: Record<GroundedResourceResult["confidence"], string> = {
  high: "Excellent Match",
  medium: "Good Match",
  low: "Possible Match",
};

const CONFIDENCE_STYLES: Record<GroundedResourceResult["confidence"], string> = {
  high: "border-accent/30 bg-accent/10 text-accent",
  medium: "border-border bg-bg text-text-primary",
  low: "border-border bg-bg text-text-muted",
};

const REASON_FIELD_LABELS: Record<string, string> = {
  organization: "Organization",
  city: "City",
  services: "Services",
  tags: "Tags",
  description: "Description",
  parent_categories: "Parent categories",
  subcategories: "Subcategories",
  counties_served: "Counties served",
  eligibility: "Eligibility",
  tribal_eligibility: "Tribal eligibility",
};

const FEEDBACK_REASONS: Array<{ value: FeedbackReason; label: string }> = [
  { value: "did_not_understand", label: "Didn't understand my situation" },
  { value: "wrong_resources", label: "Wrong resources" },
  { value: "missing_resources", label: "Missing resources" },
  { value: "ai_response_unclear", label: "AI response unclear" },
  { value: "other", label: "Other" },
];

export default function ResourceGuideChat({
  initialConversationId,
  compact = false,
  onConversationIdChange,
}: ResourceGuideChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(initialConversationId);
  const chatHeight = compact ? "max-h-[52vh] min-h-[280px]" : "max-h-[640px] min-h-[320px]";

  const hasMessages = messages.length > 0;

  const updateConversationId = (nextConversationId: string) => {
    setConversationId(nextConversationId);
    onConversationIdChange?.(nextConversationId);
  };

  const sendMessage = async (message: string) => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
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

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Resource Guide request failed:", error);
      toast.error("Unable to get a response from Resource Guide.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const submitFeedback = async (
    message: ChatMessage,
    helpful: boolean,
    reason?: FeedbackReason
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
        body: JSON.stringify(buildFeedbackPayload({ message, helpful, reason })),
      });

      if (!response.ok) {
        throw new Error("Feedback request failed");
      }

      setMessages((prev) =>
        prev.map((item) =>
          item.id === message.id
            ? { ...item, feedbackSubmitted: true, feedbackPromptOpen: false }
            : item
        )
      );
      toast.success("Thanks for the feedback.");
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

  const controls = {
    onHelpful: (messageId: string) => {
      const message = messages.find((item) => item.id === messageId);
      if (message) void submitFeedback(message, true);
    },
    onNotHelpful: (messageId: string) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId && !item.feedbackSubmitted
            ? { ...item, feedbackPromptOpen: true }
            : item
        )
      );
    },
    onFeedbackReason: (messageId: string, reason: FeedbackReason) => {
      const message = messages.find((item) => item.id === messageId);
      if (message) void submitFeedback(message, false, reason);
    },
    onFeedbackCommentChange: (messageId: string, comment: string) => {
      setMessages((prev) =>
        prev.map((item) =>
          item.id === messageId ? { ...item, feedbackComment: comment } : item
        )
      );
    },
    onResourceClick: (message: ChatMessage, resourceId: string) => {
      trackResourceClick(message, resourceId);
    },
    onClarificationOption: (label: string) => {
      void sendMessage(label);
    },
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div
        className={`overflow-y-auto rounded-2xl border border-border bg-surface p-4 sm:p-5 ${chatHeight} space-y-4`}
      >
        {!hasMessages ? (
          <p className="text-sm text-text-muted">
            Ask a question and the Resource Guide will respond using verified
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
          <p className="rounded-lg border border-border bg-bg p-3 text-sm text-text-muted">
            Searching verified resources...
          </p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type your question..."
          className="flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending || !input.trim()}
          className="button button-primary px-4 py-2 text-sm"
        >
          {isSending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}

function buildAnswerMessage(data: Extract<ChatApiResponse, { type: "answer" }>, userMessage: string): ChatMessage {
  return {
    id: `assistant-${Date.now()}`,
    role: "assistant",
    content: data.response,
    conversationId: data.conversationId,
    userMessage,
    metadata: data.metadata,
    searchMetadata: data.searchMetadata,
    groundedResults: data.groundedResults ?? [],
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
  };
}

type MessageControls = {
  onHelpful: (messageId: string) => void;
  onNotHelpful: (messageId: string) => void;
  onFeedbackReason: (messageId: string, reason: FeedbackReason) => void;
  onFeedbackCommentChange: (messageId: string, comment: string) => void;
  onResourceClick: (message: ChatMessage, resourceId: string) => void;
  onClarificationOption: (label: string) => void;
};

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
        <div className="max-w-[85%] whitespace-pre-wrap rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-text-primary">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-border bg-surface p-4 text-text-primary">
      <section aria-labelledby={`${message.id}-guidance`}>
        <h2 id={`${message.id}-guidance`} className="text-sm font-semibold">
          AI Guidance
        </h2>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
          {message.content}
        </p>
      </section>

      {message.clarificationOptions?.length ? (
        <ul className="mt-3 flex flex-wrap gap-2">
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

      <footer className="mt-4 border-t border-border pt-3 text-xs text-text-muted">
        Recommendations are generated using verified directory information. AI
        explanations never replace the resource&apos;s official eligibility
        requirements.
      </footer>

      {!message.clarificationOptions?.length ? (
        <ResponseFeedback
          message={message}
          onHelpful={() => controls.onHelpful(message.id)}
          onNotHelpful={() => controls.onNotHelpful(message.id)}
          onFeedbackReason={(reason) => controls.onFeedbackReason(message.id, reason)}
          onFeedbackCommentChange={(comment) =>
            controls.onFeedbackCommentChange(message.id, comment)
          }
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
  return (
    <section
      aria-labelledby={`${message.id}-resources`}
      className="mt-5 border-t border-border pt-4"
    >
      <h2 id={`${message.id}-resources`} className="text-sm font-semibold">
        Recommended Resources
      </h2>

      {message.groundedResults && message.groundedResults.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {message.groundedResults.map((result, index) => (
            <li key={`${message.id}-${index}`}>
              <RecommendedResourceCard
                result={result}
                onResourceClick={(resourceId) =>
                  controls.onResourceClick(message, resourceId)
                }
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 rounded-lg border border-border bg-bg p-3 text-sm text-text-muted">
          We couldn&apos;t find a strong match in our directory for your request.
        </p>
      )}
    </section>
  );
}

function RecommendedResourceCard({
  result,
  onResourceClick,
}: {
  result: GroundedResourceResult;
  onResourceClick: (resourceId: string) => void;
}) {
  const { resource } = result;
  const matchedServices = getMatchedValues(result.reasons, "services");
  const matchedParentCategories = getDisplayValues(
    resource.parent_categories,
    getMatchedValues(result.reasons, "parent_categories")
  );
  const matchedSubcategories = getDisplayValues(
    resource.subcategories,
    getMatchedValues(result.reasons, "subcategories")
  );

  return (
    <article className="rounded-lg border border-border bg-bg p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <h3 className="text-base font-semibold text-text-primary">
          {resource.organization || "Unnamed resource"}
        </h3>
        <span
          className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${CONFIDENCE_STYLES[result.confidence]}`}
        >
          <span>
            {getSelectionTierLabel(result)}
          </span>
          <span>{Math.round(result.score)}%</span>
        </span>
      </div>

      <section className="mt-4 border-t border-border pt-3">
        <h4 className="text-sm font-semibold text-text-primary">
          Why this was recommended
        </h4>
        {result.reasons.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {result.reasons.map((reason, index) => (
              <li
                key={`${reason.field}-${reason.matchedValue}-${index}`}
                className="flex gap-2 text-sm text-text-muted"
              >
                <span className="text-accent" aria-hidden="true">
                  -
                </span>
                <span>{formatMatchReason(reason)}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="mt-4 grid gap-4 border-t border-border pt-3 sm:grid-cols-2">
        <ChipSection title="Matched Categories" values={matchedParentCategories} />
        <ChipSection title="Matched Subcategories" values={matchedSubcategories} />
      </section>

      <section className="mt-4 border-t border-border pt-3">
        <h4 className="text-sm font-semibold text-text-primary">Matched Services</h4>
        {matchedServices.length > 0 ? (
          <ul className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            {matchedServices.map((service) => (
              <li key={service} className="flex gap-2 text-text-muted">
                <span className="text-accent" aria-hidden="true">
                  ✓
                </span>
                <span className="font-medium text-text-primary">{service}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-text-muted">
            No specific services matched the query.
          </p>
        )}
      </section>

      <section className="mt-4 border-t border-border pt-3">
        <h4 className="text-sm font-semibold text-text-primary">
          Eligibility Summary
        </h4>
        <EligibilitySummary
          eligibility={resource.eligibility}
          tribalEligibility={resource.tribal_eligibility}
        />
      </section>

      <details className="mt-4 border-t border-border pt-3">
        <summary className="cursor-pointer text-sm font-semibold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40">
          Verified directory details
        </summary>
        <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <DetailField label="Description" value={resource.description} />
          <DetailField label="Counties served" values={resource.counties_served} />
          <DetailField
            label="Website"
            value={resource.website}
            href={resource.website}
            onClick={() => onResourceClick(resource.id)}
          />
          <DetailField
            label="Phone"
            value={resource.phone}
            href={resource.phone ? `tel:${resource.phone}` : null}
            onClick={() => onResourceClick(resource.id)}
          />
          <DetailField
            label="Application link"
            value={resource.application_link}
            href={resource.application_link}
            onClick={() => onResourceClick(resource.id)}
          />
          <DetailField
            label="Last verified"
            value={formatLastVerified(resource.last_verified)}
            fallback="Information not available in our directory."
          />
        </dl>
      </details>
    </article>
  );
}

function ChipSection({ title, values }: { title: string; values: string[] }) {
  return (
    <section>
      <h4 className="text-sm font-semibold text-text-primary">{title}</h4>
      {values.length > 0 ? (
        <ul className="mt-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <li
              key={value}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-text-primary"
            >
              {value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-text-muted">
          No matched categories were returned.
        </p>
      )}
    </section>
  );
}

function EligibilitySummary({
  eligibility,
  tribalEligibility,
}: {
  eligibility: string | null;
  tribalEligibility: string | null;
}) {
  const items = [
    { label: "Eligibility", value: eligibility },
    { label: "Tribal eligibility", value: tribalEligibility },
  ].filter((item) => item.value?.trim());

  if (items.length === 0) {
    return (
      <p className="mt-2 text-sm text-text-muted">
        Eligibility information not provided.
      </p>
    );
  }

  return (
    <dl className="mt-2 space-y-2 text-sm">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="font-medium text-text-primary">{item.label}</dt>
          <dd className="mt-1 text-text-muted">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function DetailField({
  label,
  value,
  values,
  href,
  onClick,
  fallback,
}: {
  label: string;
  value?: string | null;
  values?: string[] | null;
  href?: string | null;
  onClick?: () => void;
  fallback?: string;
}) {
  const displayValue = values?.filter(Boolean).join(", ") || value?.trim();

  if (!displayValue && !fallback) {
    return null;
  }

  return (
    <div>
      <dt className="font-medium text-text-primary">{label}</dt>
      <dd className="mt-1 text-text-muted">
        {href && displayValue ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            onClick={onClick}
            className="text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label={`${label}: ${displayValue}`}
          >
            {displayValue}
          </a>
        ) : (
          displayValue || fallback
        )}
      </dd>
    </div>
  );
}

function ResponseFeedback({
  message,
  onHelpful,
  onNotHelpful,
  onFeedbackReason,
  onFeedbackCommentChange,
}: {
  message: ChatMessage;
  onHelpful: () => void;
  onNotHelpful: () => void;
  onFeedbackReason: (reason: FeedbackReason) => void;
  onFeedbackCommentChange: (comment: string) => void;
}) {
  if (message.feedbackSubmitted) {
    return (
      <div className="mt-4 rounded-lg border border-accent/30 bg-accent/10 p-3 text-sm text-text-primary">
        <p className="font-medium">Thanks!</p>
        <p className="mt-1 text-text-muted">
          Your feedback helps improve future recommendations.
        </p>
      </div>
    );
  }

  return (
    <section className="mt-4 border-t border-border pt-3" aria-label="Response feedback">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onHelpful}
          disabled={message.feedbackSubmitting}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Helpful
        </button>
        <button
          type="button"
          onClick={onNotHelpful}
          disabled={message.feedbackSubmitting}
          className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          Not helpful
        </button>
      </div>

      <label className="mt-3 block text-sm text-text-muted">
        <span className="font-medium text-text-primary">Optional comment</span>
        <textarea
          value={message.feedbackComment ?? ""}
          onChange={(event) => onFeedbackCommentChange(event.target.value)}
          disabled={message.feedbackSubmitting}
          rows={2}
          className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          placeholder="Add a note for the team..."
        />
      </label>

      {message.feedbackPromptOpen ? (
        <fieldset className="mt-3 rounded-lg border border-border bg-bg p-3">
          <legend className="text-sm font-medium text-text-primary">
            What could have been better?
          </legend>
          <div className="mt-3 space-y-2">
            {FEEDBACK_REASONS.map((reason) => (
              <label
                key={reason.value}
                className="flex items-center gap-2 text-sm text-text-muted"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  disabled={message.feedbackSubmitting}
                  onChange={() => onFeedbackReason(reason.value)}
                />
                <span>{reason.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
    </section>
  );
}

function buildFeedbackPayload({
  message,
  helpful,
  reason,
  clickedResourceId,
  eventType,
}: {
  message: ChatMessage;
  helpful?: boolean;
  reason?: FeedbackReason;
  clickedResourceId?: string;
  eventType?: "resource_click";
}) {
  const resourceIds =
    message.groundedResults?.map((result) => result.resource.id) ?? [];

  return {
    conversationId: message.conversationId || createConversationId(),
    helpful,
    feedback: message.feedbackComment,
    reason,
    clickedResourceId,
    eventType,
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

function trackResourceClick(message: ChatMessage, resourceId: string) {
  if (!message.conversationId) {
    return;
  }

  const payload = buildFeedbackPayload({
    message,
    clickedResourceId: resourceId,
    eventType: "resource_click",
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

function getMatchedValues(
  reasons: ResourceSearchReason[],
  field: string
): string[] {
  return Array.from(
    new Set(
      reasons
        .filter((reason) => reason.field === field)
        .map((reason) => reason.matchedValue.trim())
        .filter(Boolean)
    )
  );
}

function getDisplayValues(
  resourceValues: string[] | null | undefined,
  matchedValues: string[]
): string[] {
  return matchedValues.length > 0
    ? matchedValues
    : resourceValues?.filter(Boolean) ?? [];
}

function formatMatchReason(reason: ResourceSearchReason): string {
  const value = reason.matchedValue;

  if (reason.field === "counties_served") {
    return `Serves ${value} County`;
  }

  if (reason.field === "services") {
    return `Matches your request for ${value}`;
  }

  if (reason.field === "description") {
    return `Directory description matched ${value}`;
  }

  const label = REASON_FIELD_LABELS[reason.field] || reason.field;
  return `${label} matched ${value}`;
}

function formatLastVerified(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
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

function getSelectionTierLabel(result: GroundedResourceResult): string {
  if (result.selectionTier === "high") return "Strong Match";
  if (result.selectionTier === "medium") return "Good Match";
  if (result.selectionTier === "fallback" || result.isFallbackMatch) {
    return "Closest Match";
  }

  return CONFIDENCE_LABELS[result.confidence];
}

function createConversationId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `resource-guide-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
