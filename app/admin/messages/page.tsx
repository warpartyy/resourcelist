import { createClient } from '@/lib/supabase/server';
import MessageActions from '@/components/admin/MessageActions';

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

      <div className="space-y-4">
        {messages?.map((msg) => (
          <div
            key={msg.id}
            className="border rounded p-4 space-y-2"
          >
            <div className="text-sm text-gray-500">
              {new Date(msg.created_at).toLocaleString()}
            </div>

            <div className="font-medium whitespace-pre-wrap">
              {msg.content}
            </div>

            {msg.contact_email && (
              <div className="text-sm">
                {msg.contact_email}
              </div>
            )}

            <div className="text-xs uppercase tracking-wide">
              Status: {msg.status}
            </div>

            <MessageActions
              id={msg.id}
              currentStatus={msg.status}
            />
          </div>
        ))}
      </div>
    </div>
  );
}