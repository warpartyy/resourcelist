"use client";

import { useEffect } from "react";
import SubmissionCard from "./SubmissionCard";

type Props = {
  submissions: any[];
  activeTab: "pending" | "approved" | "rejected";
  setActiveTab: (tab: "pending" | "approved" | "rejected") => void;
  fetchData: () => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
  CATEGORY_OPTIONS: any[];
  COUNTY_OPTIONS: string[];
  onApprove: (submission: any) => void;
  onReject: (id: string) => void;
};

export default function SubmissionsPanel({
  submissions,
  activeTab,
  setActiveTab,
  editingId,
  setEditingId,
  editedSubmission,
  setEditedSubmission,
  CATEGORY_OPTIONS,
  COUNTY_OPTIONS,
  onApprove,
  onReject,
}: Props) {
  return (
    <>
      {/* Status Tabs */}
      <div className="flex gap-4 mb-6">
        {["pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() =>
              setActiveTab(tab as "pending" | "approved" | "rejected")
            }
            className={`px-4 py-2 rounded-lg capitalize ${
              activeTab === tab
                ? "bg-blue-600"
                : "bg-zinc-800 hover:bg-zinc-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {submissions.length === 0 ? (
        <div className="text-zinc-400">
          No {activeTab} submissions.
        </div>
      ) : (
        submissions.map((submission) => (
          <SubmissionCard
            key={submission.id}
            submission={submission}
            editingId={editingId}
            setEditingId={setEditingId}
            editedSubmission={editedSubmission}
            setEditedSubmission={setEditedSubmission}
            CATEGORY_OPTIONS={CATEGORY_OPTIONS}
            COUNTY_OPTIONS={COUNTY_OPTIONS}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))
      )}
    </>
  );
}
