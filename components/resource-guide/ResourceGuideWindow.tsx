"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ResourceGuideChat from "./ResourceGuideChat";
import type { ResourceGuideFeedbackDraft } from "./ResourceGuideChat";

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
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackDraft, setFeedbackDraft] =
    useState<ResourceGuideFeedbackDraft | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackStep, setFeedbackStep] = useState<"choice" | "reason">("choice");
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackComment, setFeedbackComment] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const fullGuideHref = conversationId
    ? `/resource-guide?conversationId=${encodeURIComponent(conversationId)}`
    : "/resource-guide";
  const shouldAskForFeedback = Boolean(feedbackDraft && !feedbackSubmitted);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const mobileQuery = window.matchMedia("(max-width: 767px)");

    if (!mobileQuery.matches) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  });

  const closeWindow = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackStep("choice");
    setFeedbackReason("");
    setFeedbackComment("");
    onClose();
  };

  const closeWithoutFeedback = () => {
    if (feedbackDraft && !feedbackSubmitted) {
      trackConversationAbandonment(feedbackDraft);
    }

    closeWindow();
  };

  const handleClose = () => {
    if (shouldAskForFeedback) {
      setIsFeedbackModalOpen(true);
      return;
    }

    closeWindow();
  };

  const handleTouchEnd = (positionY: number) => {
    if (touchStartY === null) {
      return;
    }

    const distance = positionY - touchStartY;
    setTouchStartY(null);

    if (distance > 90) {
      handleClose();
    }
  };

  const submitCloseFeedback = async ({
    helpful,
    reason,
    comment,
  }: {
    helpful: boolean;
    reason?: string;
    comment?: string;
  }) => {
    if (!feedbackDraft) {
      closeWindow();
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const response = await fetch("/api/resource-guide/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...feedbackDraft,
          helpful,
          reason,
          feedback: comment,
        }),
      });

      if (!response.ok) {
        throw new Error("Feedback request failed");
      }

      setFeedbackSubmitted(true);
      closeWindow();
    } catch (error) {
      console.error("Resource Guide close feedback failed:", error);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/35 md:hidden"
          onClick={handleClose}
          aria-label="Close Resource Chat"
        />
      ) : null}

      <section
        id="resource-guide-window"
        className={`fixed inset-x-0 bottom-0 z-50 h-[78dvh] max-h-[calc(100dvh_-_3rem_-_env(safe-area-inset-top))] w-full flex-col overflow-hidden rounded-t-3xl border border-border bg-surface pb-[env(safe-area-inset-bottom)] shadow-2xl transition-transform duration-200 md:inset-x-auto md:bottom-24 md:right-6 md:h-[min(720px,calc(100vh-8rem))] md:w-[calc(100vw-2rem)] md:max-w-md md:rounded-2xl md:pb-0 ${
        isOpen ? "flex" : "hidden"
      }`}
        aria-label="Resource Chat"
      >
        <header
          className="sticky top-0 z-10 rounded-t-3xl border-b border-teal-800 bg-teal-700 px-4 pb-3 pt-2 text-white md:rounded-t-2xl md:py-3"
          onTouchStart={(event) =>
            setTouchStartY(event.touches[0]?.clientY ?? null)
          }
          onTouchEnd={(event) =>
            handleTouchEnd(event.changedTouches[0]?.clientY ?? touchStartY ?? 0)
          }
        >
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-teal-100/70 md:hidden" />
          <div className="flex min-h-12 items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Resource Chat</h2>
              <p className="text-xs text-teal-50">Verified directory search</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={fullGuideHref}
                className="hidden min-h-11 items-center rounded-lg border border-teal-100/60 bg-teal-800 px-3 py-2 text-sm text-white hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-teal-700 md:inline-flex"
              >
                Full screen
              </Link>
              <button
                type="button"
                onClick={handleClose}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-teal-100/60 bg-teal-800 text-white hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-teal-700 md:min-w-0 md:rounded-lg md:px-3 md:py-2"
                aria-label="Close Resource Chat"
              >
                <X className="h-5 w-5 md:hidden" aria-hidden="true" />
                <span className="hidden md:inline">Close</span>
              </button>
            </div>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden bg-bg p-0 md:p-3">
          <ResourceGuideChat
            compact
            initialConversationId={conversationId}
            onConversationIdChange={onConversationIdChange}
            onFeedbackSubmitted={() => setFeedbackSubmitted(true)}
            onFeedbackDraftChange={(draft) => setFeedbackDraft(draft)}
          />
        </div>

        {isFeedbackModalOpen ? (
          <FeedbackCloseModal
            step={feedbackStep}
            selectedReason={feedbackReason}
            comment={feedbackComment}
            isSubmitting={isSubmittingFeedback}
            onHelpful={() => void submitCloseFeedback({ helpful: true })}
            onNotHelpful={() => setFeedbackStep("reason")}
            onReasonChange={setFeedbackReason}
            onCommentChange={setFeedbackComment}
            onSubmitReason={() =>
              void submitCloseFeedback({
                helpful: false,
                reason: feedbackReason,
                comment: feedbackReason === "other" ? feedbackComment : undefined,
              })
            }
            onSkip={closeWithoutFeedback}
          />
        ) : null}
      </section>
    </>
  );
}

function trackConversationAbandonment(draft: ResourceGuideFeedbackDraft) {
  const payload = {
    conversationId: draft.conversationId,
    toolId: draft.toolId,
    eventType: "conversation_completion",
    completionReason: "abandonment",
    searchOutcome: "abandoned",
  };

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

const CLOSE_FEEDBACK_REASONS = [
  { value: "could_not_find", label: "Couldn't find what I needed" },
  { value: "not_relevant", label: "Recommendations weren't relevant" },
  { value: "misunderstood", label: "AI misunderstood my question" },
  { value: "other", label: "Other" },
];

function FeedbackCloseModal({
  step,
  selectedReason,
  comment,
  isSubmitting,
  onHelpful,
  onNotHelpful,
  onReasonChange,
  onCommentChange,
  onSubmitReason,
  onSkip,
}: {
  step: "choice" | "reason";
  selectedReason: string;
  comment: string;
  isSubmitting: boolean;
  onHelpful: () => void;
  onNotHelpful: () => void;
  onReasonChange: (reason: string) => void;
  onCommentChange: (comment: string) => void;
  onSubmitReason: () => void;
  onSkip: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 p-4">
      <section
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-2xl"
        aria-modal="true"
        role="dialog"
        aria-labelledby="resource-guide-feedback-title"
      >
        {step === "choice" ? (
          <>
            <h2
              id="resource-guide-feedback-title"
              className="text-base font-semibold text-text-primary"
            >
              Before you go...
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              Was this conversation helpful?
            </p>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={onHelpful}
                disabled={isSubmitting}
                className="min-h-11 min-w-11 rounded-full border border-border bg-bg px-4 py-2 text-xl leading-none hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Helpful"
              >
                👍
              </button>
              <button
                type="button"
                onClick={onNotHelpful}
                disabled={isSubmitting}
                className="min-h-11 min-w-11 rounded-full border border-border bg-bg px-4 py-2 text-xl leading-none hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Not Helpful"
              >
                👎
              </button>
              <button
                type="button"
                onClick={onSkip}
                disabled={isSubmitting}
                className="ml-auto min-h-11 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            <h2
              id="resource-guide-feedback-title"
              className="text-base font-semibold text-text-primary"
            >
              What could have been better?
            </h2>
            <fieldset className="mt-4 space-y-3">
              {CLOSE_FEEDBACK_REASONS.map((reason) => (
                <label
                  key={reason.value}
                  className="flex items-center gap-2 text-sm text-text-primary"
                >
                  <input
                    type="radio"
                    name="resource-guide-close-feedback"
                    value={reason.value}
                    checked={selectedReason === reason.value}
                    onChange={() => onReasonChange(reason.value)}
                    className="h-4 w-4 border-border"
                  />
                  <span>{reason.label}</span>
                </label>
              ))}
            </fieldset>
            {selectedReason === "other" ? (
              <label className="mt-4 block text-sm text-text-muted">
                <span className="font-medium text-text-primary">Optional comment</span>
                <textarea
                  value={comment}
                  onChange={(event) => onCommentChange(event.target.value)}
                  rows={3}
                  className="mt-2 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </label>
            ) : null}
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onSkip}
                disabled={isSubmitting}
                className="min-h-11 rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={onSubmitReason}
                disabled={isSubmitting || !selectedReason}
                className="min-h-11 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Submit
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
