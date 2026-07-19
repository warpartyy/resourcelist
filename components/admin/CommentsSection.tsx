"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { extractMentions } from "@/lib/utils/extractMentions";
import type { User } from "@supabase/supabase-js";


function mapStatusToSection(status: string) {
  if (status === "approved") return "resources";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  return "pending";
}

type Props = {
  resourceId?: string;
  submissionId?: string;
  user: User | null;
  highlightedCommentId?: string | null;
  status: "pending" | "approved" | "rejected";
};

type Comment = {
  id: string;
  comment: string;
  created_at: string | null;
  created_by_email: string | null;
  created_by: string | null;
};

export default function CommentsSection({
  resourceId,
  submissionId,
  user,
  highlightedCommentId,
}: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // 🔹 mentions
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionResults, setMentionResults] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });



useEffect(() => {
  if (!highlightedCommentId || comments.length === 0) return;

  // small delay ensures DOM is painted
  const timeout = setTimeout(() => {
    const el = document.getElementById(
      `comment-${highlightedCommentId}`
    );

    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      el.classList.add("ring-2", "ring-yellow-400");

      setTimeout(() => {
        el.classList.remove("ring-2", "ring-yellow-400");
      }, 2000);
    }
  }, 100);

  return () => clearTimeout(timeout);
}, [highlightedCommentId, comments]);



useEffect(() => {
  const fetchComments = async () => {
    const supabase = getSupabase();

const column = resourceId

if (!resourceId) return;

const { data } = await supabase
  .from("resource_comments")
  .select("*")
  .eq("resource_id", resourceId as string) // ✅ FIX
  .order("created_at", { ascending: true });

    setComments(data || []);
    setLoading(false);
  };

  fetchComments();
}, [resourceId, submissionId]);



  // 🔹 fetch mention users
  useEffect(() => {
    const fetchUsers = async () => {
      const supabase = getSupabase();

      let query = supabase
        .from("profiles")
        .select("id, display_name")
        .limit(5);

      if (mentionQuery) {
        query = query.ilike("display_name", `%${mentionQuery}%`);
      }

      const { data } = await query;
      setMentionResults(data || []);
      setSelectedIndex(0);
    };

    if (showMentions) fetchUsers();
  }, [mentionQuery, showMentions]);





  // 🔹 select mention
  const handleSelectMention = (name: string) => {
    const newText = newComment.replace(/@([\w]*)$/, `@${name} `);
    setNewComment(newText);
    setShowMentions(false);
  };

  // 🔹 add comment
  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    const supabase = getSupabase();

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .single();

    const displayName = profile?.display_name || user.email;

    const { data, error } = await supabase
      .from("resource_comments")
.insert({
resource_id: resourceId, // 🔥 ALWAYS use this
  comment: newComment.trim(),
  created_by: user.id,
  created_by_email: displayName,
})
      .select()
      .single();

      
    if (error) {
      toast.error("Failed to add comment");
      return;
    }

    if (data) {
      setComments((prev) => [...prev, data]);
    }
    

// 🔹 mentions → notifications
const mentions = extractMentions(newComment.trim());

if (mentions.length > 0) {
  const { data: users } = await supabase
    .from("profiles")
    .select("id, display_name")
    .or(
      mentions
        .map((m) => `display_name.ilike.%${m}%`)
        .join(",")
    );

  if (users) {
    // 🔥 NEW: get resource name
let resourceName = "a resource";

if (resourceId) {
  const { data: resource } = await supabase
    .from("resources")
    .select("organization")
    .eq("id", resourceId)
    .single();

  if (resource?.organization) {
    resourceName = resource.organization;
  }
}

function mapStatusToSection(status: string) {
  if (status === "approved") return "resources";
  if (status === "pending") return "pending";
  if (status === "rejected") return "rejected";
  return "pending";
}

const notifications = users.map((u) => ({
  user_id: u.id,
  type: "mention",
  resource_id: resourceId || null,
  comment_id: data.id,
  message: `${displayName} mentioned you on ${resourceName}`,
  comment_preview: newComment.trim(),
  section: mapStatusToSection(status), // ✅ NOW SAFE
}));

    if (notifications.length > 0) {
      console.log("CREATING NOTIFICATIONS:", notifications);
      await supabase.from("notifications").insert(notifications);
    }

  }
}

    setNewComment("");
  };

  // 🔹 edit
  const handleEdit = (c: Comment) => {
    setEditingId(c.id);
    setEditText(c.comment);
  };

  const handleSaveEdit = async (id: string) => {
    const supabase = getSupabase();

    await supabase
      .from("resource_comments")
      .update({ comment: editText })
      .eq("id", id);

    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const supabase = getSupabase();

    await supabase
      .from("resource_comments")
      .delete()
      .eq("id", id);

    setComments((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="mt-6">
      <div className="mb-2 font-semibold text-sm text-text-muted">
        Admin Comments
      </div>

      {/* comments */}
      <div className="space-y-4 mb-4">
        {comments.map((c) => {
          const isMe = c.created_by === user?.id;
          const isEditing = editingId === c.id;

          return (
            
<div
  key={c.id}
  id={`comment-${c.id}`}
  className={`p-3 rounded-lg border ${
    isMe
      ? "bg-blue-50 border-blue-200 ml-6"
      : "bg-surface border-border mr-6"
  }`}
>
    <div className="text-xs text-text-subtle mb-1 flex justify-between">
      <span>
        {isMe ? (
          <span className="font-medium text-blue-700">You</span>
        ) : (
          c.created_by_email || "Unknown"
        )}{" "}
        •{" "}
        {c.created_at
          ? new Date(c.created_at).toLocaleString()
          : "Unknown time"}
      </span>

      {isMe && !isEditing && (
        <div className="flex gap-2 text-xs">
          <button
            onClick={() => handleEdit(c)}
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(c.id)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </div>
      )}
    </div>

    {isEditing ? (
      <>
        <textarea
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          className="w-full bg-bg border border-border rounded-md p-2 text-sm mb-2"
        />

        <div className="flex gap-2">
          <button
            onClick={() => handleSaveEdit(c.id)}
            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md"
          >
            Save
          </button>
          <button
            onClick={() => setEditingId(null)}
            className="px-3 py-1 text-xs border border-border rounded-md"
          >
            Cancel
          </button>
        </div>
      </>
    ) : (
      <div className="text-sm whitespace-pre-wrap">
        {c.comment}
      </div>
    )}
  </div>
);





        })}
      </div>

      {/* input */}
      <div className="relative">
        <textarea
          value={newComment}
          onChange={(e) => {
            const value = e.target.value;
            setNewComment(value);

            const match = value
              .slice(0, e.target.selectionStart)
              .match(/@([\w]*)?$/);

            if (match) {
              setMentionQuery(match[1] || "");
              setShowMentions(true);
            } else {
              setShowMentions(false);
            }
          }}
          onKeyDown={(e) => {
            if (!showMentions) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setSelectedIndex((i) =>
                i < mentionResults.length - 1 ? i + 1 : 0
              );
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setSelectedIndex((i) =>
                i > 0 ? i - 1 : mentionResults.length - 1
              );
            }

            if (e.key === "Enter") {
              if (mentionResults[selectedIndex]) {
                e.preventDefault();
                handleSelectMention(
                  mentionResults[selectedIndex].display_name
                );
              }
            }
          }}
          className="w-full border p-3"
          placeholder="Add a comment..."
        />

        {/* dropdown */}
        {showMentions && mentionResults.length > 0 && (
          <div className="absolute bg-white border shadow rounded w-64 mt-1 z-50">
            {mentionResults.map((u, i) => (
              <div
                key={u.id}
                onClick={() => handleSelectMention(u.display_name)}
                className={`px-3 py-2 cursor-pointer ${
                  i === selectedIndex
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {u.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

<button
  onClick={handleAddComment}
  disabled={!user}
  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
    user
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  {user ? "Post Comment" : "Loading user..."}
</button>
    </div>
  );
}