"use client";

import Link from "next/link";
import { useState } from "react";
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
  const fullGuideHref = conversationId
    ? `/resource-guide?conversationId=${encodeURIComponent(conversationId)}`
    : "/resource-guide";
  const shouldAskForFeedback = Boolean(feedbackDraft && !feedbackSubmitted);

  const closeWindow = () => {
    setIsFeedbackModalOpen(false);
    setFeedbackStep("choice");
    setFeedbackReason("");
    setFeedbackComment("");
    onClose();
  };

  const handleClose = () => {
    if (shouldAskForFeedback) {
      setIsFeedbackModalOpen(true);
      return;
    }

    closeWindow();
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
    <section
      id="resource-guide-window"
      className={`fixed bottom-24 right-4 z-50 h-[min(720px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl sm:right-6 ${
        isOpen ? "flex" : "hidden"
      }`}
      aria-label="Resource Chat"
    >
      <header className="flex items-center justify-between rounded-t-2xl border-b border-teal-800 bg-teal-700 px-4 py-3 text-white">
        <div>
          <h2 className="text-sm font-semibold">Resource Chat</h2>
          <p className="text-xs text-teal-50">Verified directory search</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={fullGuideHref}
            className="rounded-lg border border-teal-100/60 bg-teal-800 px-3 py-1 text-sm text-white hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-teal-700"
          >
            Full screen
          </Link>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg border border-teal-100/60 bg-teal-800 px-3 py-1 text-sm text-white hover:bg-teal-900 focus:outline-none focus:ring-2 focus:ring-teal-200 focus:ring-offset-2 focus:ring-offset-teal-700"
            aria-label="Close Resource Chat"
          >
            Close
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 bg-bg p-3">
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
          onSkip={closeWindow}
        />
      ) : null}
    </section>
  );
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
                className="rounded-full border border-border bg-bg px-4 py-2 text-xl leading-none hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Helpful"
              >
                👍
              </button>
              <button
                type="button"
                onClick={onNotHelpful}
                disabled={isSubmitting}
                className="rounded-full border border-border bg-bg px-4 py-2 text-xl leading-none hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Not Helpful"
              >
                👎
              </button>
              <button
                type="button"
                onClick={onSkip}
                disabled={isSubmitting}
                className="ml-auto rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
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
                className="rounded-lg px-3 py-2 text-sm text-text-muted hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={onSubmitReason}
                disabled={isSubmitting || !selectedReason}
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
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
