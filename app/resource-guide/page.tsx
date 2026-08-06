import ResourceGuideChat from "@/components/resource-guide/ResourceGuideChat";

export default async function ResourceGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ conversationId?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Resource Guide</h1>
        <p className="mt-2 text-sm text-text-muted">
          Describe what you need help with, and I&apos;ll help you find resources
          from our directory.
        </p>
      </div>

      <ResourceGuideChat initialConversationId={params.conversationId} />
    </div>
  );
}
