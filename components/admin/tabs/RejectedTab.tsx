"use client";

import { useEffect, useState } from "react";
import SubmissionsPanel from "../SubmissionsPanel";
import { fetchSubmissionsByStatus } from "@/lib/services/adminService";

type Props = {
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onSuccess?: () => void;
  search: string;
  sortOrder: "az" | "za" | "newest" | "oldest";
};

export default function RejectedTab(props: Props) {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch rejected submissions
  const loadData = async () => {
    setLoading(true);
    const data = await fetchSubmissionsByStatus("rejected");
    setSubmissions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Refresh after actions
  const handleSuccess = async () => {
    await loadData();
    props.onSuccess?.();
  };

  if (loading) {
    return (
      <div className="text-sm text-text-muted">
        Loading rejected submissions...
      </div>
    );
  }

  return (
    <SubmissionsPanel
      {...props}
      submissions={submissions}
      section="rejected"
      onSuccess={handleSuccess}
      search={props.search}
      sortOrder={props.sortOrder}
    />
  );
}