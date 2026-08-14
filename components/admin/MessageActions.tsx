'use client';

import { useState } from 'react';
import toast from "react-hot-toast";

export default function MessageActions({
  id,
  currentStatus,
  onUpdate,
}: {
  id: string;
  currentStatus: string;
  onUpdate: (status: 'new' | 'in_progress' | 'resolved') => void;
}) {
  const [loading, setLoading] = useState(false);

type MessageStatus = 'new' | 'in_progress' | 'resolved';

async function updateStatus(status: MessageStatus) {
  setLoading(true);

  const res = await fetch('/api/messages/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, status }),
  });

  setLoading(false);

  // ❌ Handle failure
  if (!res.ok) {
    toast.error("Failed to update message");
    return;
  }

  // ✅ Update UI
  onUpdate(status);

  // ✅ Toast feedback
  if (status === 'resolved') {
    toast.success("Message marked as resolved");
  } else if (status === 'in_progress') {
    toast("Message marked as in progress");
  }
}



  return (
    <div className="flex gap-2 pt-2">
      <button
        disabled={loading || currentStatus === 'in_progress'}
        onClick={() => updateStatus('in_progress')}
        className="text-xs px-2 py-1 border rounded"
      >
        In Progress
      </button>

      <button
        disabled={loading || currentStatus === 'resolved'}
        onClick={() => updateStatus('resolved')}
        className="text-xs px-2 py-1 border rounded"
      >
        Responded
      </button>
    </div>
  );
}
