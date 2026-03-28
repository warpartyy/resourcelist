"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import toast from "react-hot-toast";

type Props = {
  resourceId: string;
  user: any;
};

type Comment = {
  id: string;
  comment: string;
  created_at: string | null;
  created_by_email: string | null;
  created_by: string | null; // ✅ ADD THIS
};

export default function CommentsSection({ resourceId, user }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // 🔹 Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      if (!resourceId) return;

      const supabase = getSupabase();

      const { data, error } = await supabase
        .from("resource_comments")
        .select("*")
        .eq("resource_id", resourceId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching comments:", error);
        setLoading(false);
        return;
      }

      setComments(data || []);
      setLoading(false);
    };

    fetchComments();
  }, [resourceId]);

  // 🔹 Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) return;

const supabase = getSupabase();

// 🔹 get profile FIRST
const { data: profile } = await supabase
  .from("profiles")
  .select("display_name")
  .eq("id", user.id)
  .single();

const displayName = profile?.display_name || user.email;

// 🔹 insert comment
const { data, error } = await supabase
  .from("resource_comments")
  .insert({
    resource_id: resourceId,
    comment: newComment.trim(),
    created_by: user.id,
    created_by_email: displayName, // ✅ THIS IS THE FIX
  })
  .select()
  .single();
    if (error) {
      console.error(error);
      toast.error("Failed to add comment");
      return;
    }

    setComments((prev) => [...prev, data]);
    setNewComment("");
  };

  // 🔹 Start edit
  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditText(comment.comment);
  };

  // 🔹 Save edit
  const handleSaveEdit = async (id: string) => {
    const supabase = getSupabase();

    const { error } = await supabase
      .from("resource_comments")
      .update({ comment: editText })
      .eq("id", id);

    if (error) {
      console.error(error);
      toast.error("Failed to update comment");
      return;
    }

    setComments((prev) =>
      prev.map((c) => (c.id === id ? { ...c, comment: editText } : c))
    );

    setEditingId(null);
    setEditText("");
  };

  // 🔹 Delete
const handleDelete = async (id: string) => {
  const supabase = getSupabase();

  const { error } = await supabase
    .from("resource_comments")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    toast.error("Failed to delete comment");
    return;
  }

  setComments((prev) => prev.filter((c) => c.id !== id));
  toast.success("Comment deleted");
};

  return (
    <div className="mt-6">
        
      <div className="mb-2 font-semibold text-sm text-text-muted">
        Admin Comments
      </div>

      {/* Comments list */}
      <div className="space-y-4 mb-4">
        {loading ? (
          <div className="text-sm text-text-muted">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-text-muted">
            No comments yet. Start the conversation.
          </div>
        ) : (
          comments.map((c) => {
            const isMe = c.created_by === user?.id;
            const isEditing = editingId === c.id;

            return (
              <div
                key={c.id}
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
          })
        )}
      </div>

      {/* Add comment */}
      <textarea
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        className="w-full bg-bg border border-border rounded-lg p-3 mb-2 min-h-[100px] resize-y"
      />

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