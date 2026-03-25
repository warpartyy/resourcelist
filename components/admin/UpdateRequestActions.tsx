'use client'

import { useEffect, useState } from 'react'

export default function UpdateRequestActions({
  id,
  onComplete,
}: {
  id: string
  onComplete: (id: string, status: 'approved' | 'rejected') => void
}) {
  const handleAction = async (status: 'approved' | 'rejected') => {
    const res = await fetch('/api/update-request-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })

    if (!res.ok) {
      alert('Something went wrong')
      return
    }

    // ✅ tell parent to remove item
    onComplete(id, status)
  }

  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
  setToast(message)
  setTimeout(() => setToast(null), 2500)
}
  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction('approved')}
        className="border px-3 py-1 rounded text-sm"
      >
        Approve
      </button>

      <button
        onClick={() => handleAction('rejected')}
        className="border px-3 py-1 rounded text-sm"
      >
        Reject
      </button>

{toast && (
  <div className="fixed bottom-6 right-6 bg-black text-white px-4 py-2 rounded shadow-lg">
    {toast}
  </div>
)}
      
    </div>
  )
}