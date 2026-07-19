"use client";

import { useEffect, useState } from "react";
import SubmissionsPanel from "../SubmissionsPanel";
import { fetchSubmissionsByStatus } from "@/lib/services/adminService";
import type { User } from "@supabase/supabase-js";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess?: () => void;
  user: User | null;
  highlightedCommentId?: string | null;
};

export default function PendingTab(props: Props) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch pending submissions
  const loadData = async () => {
    setLoading(true);
    const data = await fetchSubmissionsByStatus("pending");
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Optional: refresh after actions (approve/reject/etc)
const handleSuccess = async () => {
  await loadData();
  props.onSuccess?.();
};

  if (loading) {
    return <div className="text-sm text-text-muted">Loading pending submissions...</div>;
  }

  return (
    <SubmissionsPanel
      {...props}
      submissions={submissions}
      section="pending"
      onSuccess={handleSuccess}
    />
  );
}