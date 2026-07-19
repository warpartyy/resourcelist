'use client'

import { getSupabase } from '@/lib/supabase'
import { logImpactActivity } from '@/lib/services/impact/impactLogger'

export default function UpdateRequestActions({
  id,
  onComplete,
}: {
  id: string
  onComplete: (id: string, status: 'approved' | 'rejected') => void
}) {
  const handleAction = async (status: 'approved' | 'rejected') => {
    const supabase = getSupabase()

    const { data: submission } = await supabase
      .from('resource_submissions')
      .select('resource_id')
      .eq('id', id)
      .single()

    const res = await fetch('/api/update-request-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })

    if (!res.ok) {
      alert('Something went wrong')
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      try {
        await logImpactActivity({
          adminId: user.id,
          resourceId: submission?.resource_id ?? null,
          activityType: 'update_request_resolved',
          activityKey: status,
          metadata: {
            submission_id: id,
            resolution: status,
          },
        })
      } catch (impactError) {
        console.error('Failed to log update request impact:', impactError)
      }
    }

    // ✅ tell parent to remove item
    onComplete(id, status)
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


    </div>
  )
}