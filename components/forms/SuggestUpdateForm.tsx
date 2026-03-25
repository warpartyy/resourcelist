'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SuggestUpdateForm({
  resourceId,
  slug,
}: {
  resourceId: string
  slug: string
}) {
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch('/api/suggest-update', {
      method: 'POST',
      body: new URLSearchParams({
        resource_id: resourceId,
        message,
      }),
    })

    if (res.ok) {
      setSubmitted(true)
    } else {
      alert('Something went wrong')
    }
  }

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        router.push(`/resources/${slug}?updated=true`)
      }, 600)

      return () => clearTimeout(timer)
    }
  }, [submitted, router, slug])

  // ✅ Success state
  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6 sm:px-0">
        <div className="p-4 border rounded text-green-700 bg-green-50">
          ✅ Thanks! Your update was submitted.
        </div>
      </div>
    )
  }

  // ✅ Form state
  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:px-0">
      <form onSubmit={handleSubmit}>
        <label className="block mb-2 font-medium">
          What needs to be updated?
        </label>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          className="w-full border rounded p-3 mb-4 text-base min-h-[120px]"
          placeholder="Describe what needs to change (e.g. phone number is incorrect, missing services, etc.)"
        />

<div className="flex justify-center">
  <button
    type="submit"
    className="button button-primary"
  >
    Submit Update Suggestion
  </button>
</div>
      </form>
    </div>
  )
}