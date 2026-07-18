"use client";

import { useEffect, useState } from "react";
import SubmissionsPanel from "../SubmissionsPanel";
import { fetchSubmissionsByStatus } from "@/lib/services/adminService";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess?: () => void;
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
      highlightedCommentId={props.highlightedCommentId}
    />
  );
}