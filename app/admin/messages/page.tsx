import { createClient } from '@/lib/supabase/server';
import MessagesList from '@/components/admin/MessagesList';

export default async function MessagesPage() {
  const supabase = await createClient();

  const { data: messages, error } = await supabase
    .from('messages')
    .select('*')
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error loading messages</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold mb-6">
        Messages
      </h1>

      {/* ✅ NEW: Client-side interactive list */}
      <MessagesList initialMessages={messages || []} />
    </div>
  );
}