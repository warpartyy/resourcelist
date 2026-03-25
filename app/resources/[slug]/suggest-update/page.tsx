import { getSupabase } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import SuggestUpdateForm from '@/components/forms/SuggestUpdateForm'

export default async function SuggestUpdatePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = getSupabase()

  const { slug } = await params

  const { data: resource, error } = await supabase
    .from('resources')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'approved')
    .single()

  if (error || !resource) {
    notFound()
  }

return (
  <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
    <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
      Suggest an Update
    </h1>

    <div className="mb-6 p-3 sm:p-5 border rounded space-y-1 sm:space-y-2">
      <p className="font-medium text-base sm:text-lg">
        {resource.organization}
      </p>
      <p className="text-sm text-gray-600">
        {resource.city}, {resource.state}
      </p>
    </div>

    <SuggestUpdateForm
      resourceId={resource.id}
      slug={resource.slug}
    />
  </div>
)
}