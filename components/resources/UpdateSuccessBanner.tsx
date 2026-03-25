'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function UpdateSuccessBanner() {
  const searchParams = useSearchParams()
  const updated = searchParams.get('updated')

  const [visible, setVisible] = useState(true)

  useEffect(() => {
    if (!updated) return

    const timer = setTimeout(() => setVisible(false), 4000)
    return () => clearTimeout(timer)
  }, [updated])

  if (!updated || !visible) return null

return (
  <div className="mb-4 sm:mb-6 p-3 sm:p-4 border rounded bg-green-50 text-green-800 text-sm sm:text-base transition-all duration-500 ease-out animate-in fade-in slide-in-from-top-2">
    ✅ Thank you for helping improve this resource!
  </div>
)
}