import { getSupabase } from "@/lib/supabase";

export async function searchResources(query: string) {
  const supabase = getSupabase();

  if (!query.trim()) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("resources")
    .select("*")
    .or(`
      organization.ilike.%${query}%,
      description.ilike.%${query}%,
      services.cs.{${query}},
      tags.cs.{${query}},
      subcategories.cs.{${query}},
      parent_categories.cs.{${query}}
    `)
    .order("organization", { ascending: true });

  return { data, error };
}
