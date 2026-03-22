"use client";

import SubmissionsPanel from "../SubmissionsPanel";

export default function RejectedTab(props: any) {
  return (
    <SubmissionsPanel
      {...props}
      section="rejected"
    />
  );
}