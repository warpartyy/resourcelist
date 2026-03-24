import { getSupabase } from "@/lib/supabase";

export default async function EventsPage() {
  const supabase = getSupabase();

  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "approved")
    .order("date", { ascending: true });

  if (error) {
    console.error(error);
    return <div className="p-6">Error loading events</div>;
  }

  if (!events || events.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Events</h1>
        <p>No upcoming events right now.</p>
      </div>
    );
  }


  return (
  <div className="max-w-4xl mx-auto py-10 px-4">
    <h1 className="text-4xl font-bold mb-8">Community Events</h1>

    <div className="space-y-6">
      {events.map((event) => {
        const dateObj = new Date(event.date);
        const month = dateObj.toLocaleString("default", { month: "short" });
        const day = dateObj.getDate();

        return (
          <div
            key={event.id}
            className="border border-border rounded-2xl p-5 bg-bg shadow-sm hover:shadow-md transition"
          >
            <div className="flex gap-4">

              {/* 📅 DATE BLOCK */}
              <div className="flex flex-col items-center justify-center bg-accent/10 text-accent rounded-lg px-3 py-2 min-w-[60px]">
                <span className="text-xs uppercase">{month}</span>
                <span className="text-xl font-bold">{day}</span>
              </div>

              {/* 📄 CONTENT */}
              <div className="flex-1">

                {/* TITLE + TAGS */}
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold">
                    {event.title}
                  </h2>

                  {event.is_free && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Free
                    </span>
                  )}

                  {event.is_tribal && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Tribal
                    </span>
                  )}
                </div>

                {/* META */}
                <p className="text-sm text-text-muted mb-2">
                  {event.start_time && `${event.start_time} • `}
                  {event.location_name}
                  {event.city && ` • ${event.city}`}
                </p>

                {/* DESCRIPTION */}
                {event.description && (
                  <p className="text-text-primary mb-3 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {/* CTA */}
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    className="text-accent text-sm font-medium hover:underline"
                  >
                    View Details →
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
}