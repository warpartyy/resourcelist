'use client';

import { useState } from 'react';

export default function MessageActions({
  id,
  currentStatus,
}: {
  id: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    setLoading(true);

    await fetch('/api/messages/update', {
      method: 'POST',
      body: JSON.stringify({ id, status }),
    });

    setLoading(false);

    // simple refresh for now
    window.location.reload();
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
        Resolved
      </button>
    </div>
  );
}