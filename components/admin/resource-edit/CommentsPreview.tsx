"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Props = {
  resourceId: string;
};

type Comment = {
  id: string;
  comment: string;
  created_at: string | null;
  created_by_email: string | null;
};

export default function CommentsPreview({ resourceId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const supabase = getSupabase();

      const { data } = await supabase
        .from("resource_comments")
        .select("*")
        .eq("resource_id", resourceId)
        .order("created_at", { ascending: true });

      setComments(data || []);
    };

    fetch();
  }, [resourceId]);

  if (comments.length === 0) return null;

  return (
    <div className="mt-4 p-3 bg-bg border border-border rounded-md">
      <div className="text-xs text-text-subtle mb-2">
        Admin Comments
      </div>

      <div className="space-y-2">
        {comments.slice(-3).map((c) => (
          <div key={c.id} className="text-sm text-text-muted">
            <span className="text-xs text-text-subtle">
              {c.created_by_email || "Unknown"}:
            </span>{" "}
            {c.comment}
          </div>
        ))}
      </div>
    </div>
  );
}