'use client'

import { useEffect, useState } from 'react'
import { getSupabase } from '@/lib/supabase'
import UpdateRequestActions from '@/components/admin/UpdateRequestActions'

export default function UpdateRequestsTab({
  onHandled,
}: {
  onHandled?: () => void
}) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (message: string) => {
  setToast(message)
  setTimeout(() => setToast(null), 2500)
}

  useEffect(() => {
    const fetchData = async () => {
      const supabase = getSupabase()

      const { data, error } = await supabase
        .from('resource_submissions')
        .select(`
          id,
          message,
          status,
          submitted_at,
          resource_id,
          resources (
            id,
            organization,
            city,
            state
          )
        `)
        .eq('type', 'update')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })

      if (error) {
        console.error(error)
      } else {
        setSubmissions(data || [])
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <div>Loading update requests...</div>
  }

  if (submissions.length === 0) {
    return <div>No pending update requests</div>
  }


const handleRemove = (id: string, status: 'approved' | 'rejected') => {
  setSubmissions((prev) => prev.filter((s) => s.id !== id))

  onHandled?.() // ✅ decrement badge

  showToast(
    status === 'approved'
      ? '✅ Update approved'
      : '❌ Update rejected'
  )
}

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <div key={submission.id} className="border rounded p-4">
          <div className="mb-2">
            <p className="font-medium">
              {submission.resources?.organization || 'Unknown Resource'}
            </p>
            <p className="text-sm text-gray-500">
              {submission.resources?.city}, {submission.resources?.state}
            </p>
          </div>

          <p className="mb-3">{submission.message}</p>

          <p className="text-xs text-gray-400 mb-3">
            Submitted: {submission.submitted_at}
          </p>

<UpdateRequestActions
  id={submission.id}
  onComplete={(id, status) => handleRemove(id, status)}
/>
        </div>
      ))}
    </div>
  )
}