"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Comment = {
  id: string;
  comment: string;
  created_at: string | null;
  created_by_email: string | null;
};

type Props = {
  resourceId: string;
};

function getCommentIdFromHash(hash: string) {
  if (!hash.startsWith("#comment-")) return null;
  return hash.replace("#comment-", "");
}

export default function ResourceCommentsAnchorList({ resourceId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [targetCommentId, setTargetCommentId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  useEffect(() => {
    const syncFromHash = () => {
      setTargetCommentId(getCommentIdFromHash(window.location.hash));
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => {
      window.removeEventListener("hashchange", syncFromHash);
    };
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      if (!targetCommentId) {
        setComments([]);
        return;
      }

      const supabase = getSupabase();
      const { data } = await supabase
        .from("resource_comments")
        .select("id, comment, created_at, created_by_email")
        .eq("resource_id", resourceId)
        .order("created_at", { ascending: true });

      setComments(data || []);
    };

    fetchComments();
  }, [resourceId, targetCommentId]);

  useEffect(() => {
    if (!targetCommentId || comments.length === 0) return;

    const timeout = setTimeout(() => {
      const el = document.getElementById(`comment-${targetCommentId}`);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedId(targetCommentId);

      setTimeout(() => {
        setHighlightedId((prev) => (prev === targetCommentId ? null : prev));
      }, 2500);
    }, 120);

    return () => clearTimeout(timeout);
  }, [comments, targetCommentId]);

  const hasHashTarget = Boolean(targetCommentId);

  const targetExists = useMemo(
    () => comments.some((comment) => comment.id === targetCommentId),
    [comments, targetCommentId]
  );

  if (!hasHashTarget) return null;

  return (
    <section className="mt-8 pt-6 border-t border-border">
      <h2 className="text-lg font-semibold mb-3">Comment Context</h2>

      {!targetExists ? (
        <p className="text-sm text-text-muted">The referenced comment could not be found.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isTarget = comment.id === targetCommentId;
            const isHighlighted = highlightedId === comment.id;

            return (
              <article
                key={comment.id}
                id={`comment-${comment.id}`}
                className={`rounded-lg border p-3 transition-colors ${
                  isTarget || isHighlighted
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-border bg-surface"
                }`}
              >
                <div className="text-xs text-text-muted mb-1">
                  {comment.created_by_email || "Unknown"}
                  {comment.created_at
                    ? ` • ${new Date(comment.created_at).toLocaleString()}`
                    : ""}
                </div>
                <p className="text-sm text-text-primary whitespace-pre-wrap">{comment.comment}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
