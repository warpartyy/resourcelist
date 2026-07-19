// /components/admin/submissions/DuplicateMatchesPanel.tsx

import { getSupabase } from "@/lib/supabase";
import { useAdminStore } from "@/lib/stores/adminStore";
import { logImpactActivity } from "@/lib/services/impact/impactLogger";

type MatchResource = {
  id: string;
  organization: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
};

type SubmissionLike = {
  id: string;
  organization: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  subcategories: string[] | null;
  tags: string[] | null;
  parent_categories: string[] | null;
};

type Props = {
  section: "pending" | "approved" | "rejected";
  possibleMatches: MatchResource[];
  submission: SubmissionLike;
  setPossibleMatches: (matches: MatchResource[]) => void;
  onSuccess: () => void;
};

export default function DuplicateMatchesPanel({
  section,
  possibleMatches,
  submission,
  setPossibleMatches,
  onSuccess,
}: Props) {
  const { setEditingId } = useAdminStore();
  if (section !== "pending" || possibleMatches.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="text-xs font-medium text-blue-700">
        Possible duplicate or existing organization
      </div>

      <div className="text-xs text-blue-800 mt-1">
        This submission may belong to an existing organization.
        Review carefully before creating a new resource.
      </div>

      <div className="mt-2 space-y-2">
        {possibleMatches.map((match) => (
          <div
            key={match.id}
            className="flex justify-between items-center text-sm"
          >
            <div>
              <div className="font-medium text-blue-900">
                {match.organization}
              </div>

              <div className="text-xs text-blue-700 mt-1">
                {match.address &&
                submission.address &&
                match.address.toLowerCase().trim() ===
                  submission.address.toLowerCase().trim() &&
                match.city?.toLowerCase().trim() ===
                  submission.city?.toLowerCase().trim() ? (
                  <span className="text-red-600">
                    ⚠️ Exact duplicate (same address)
                  </span>
                ) : (
                  <span className="text-blue-700">
                    📍 Same organization, different location (
                    {match.city}, {match.state})
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={async () => {
                const supabase = getSupabase();

                const { data: existingResource } = await supabase
                  .from("resources")
                  .select("subcategories, tags, parent_categories")
                  .eq("id", match.id)
                  .single();

                const mergedSubcategories = Array.from(
                  new Set([
                    ...(existingResource?.subcategories || []),
                    ...(Array.isArray(submission.subcategories)
                      ? submission.subcategories
                      : []),
                  ])
                );

                const mergedTags = Array.from(
                  new Set([
                    ...(existingResource?.tags || []),
                    ...(Array.isArray(submission.tags)
                      ? submission.tags
                      : []),
                  ])
                );

                const mergedParentCategories = Array.from(
                  new Set([
                    ...(existingResource?.parent_categories || []),
                    ...(Array.isArray(submission.parent_categories)
                      ? submission.parent_categories
                      : []),
                  ])
                );

                await supabase
                  .from("resources")
                  .update({
                    subcategories: mergedSubcategories,
                    tags: mergedTags,
                    parent_categories: mergedParentCategories,
                  })
                  .eq("id", match.id);

                const { error } = await supabase
                  .from("resource_locations")
                  .insert({
                    resource_id: match.id,
                    address: submission.address,
                    city: submission.city,
                    state: submission.state,
                    zip: submission.zip,
                    is_primary: false,
                    location_name: submission.organization || null,
                  });

                if (error) {
                  console.error(error);
                  alert("Failed to attach location");
                  return;
                }

                await supabase
                  .from("resources")
                  .delete()
                  .eq("id", submission.id);

                const {
                  data: { user },
                } = await supabase.auth.getUser();

                if (user) {
                  try {
                    await logImpactActivity({
                      adminId: user.id,
                      resourceId: match.id,
                      activityType: "duplicate_merged",
                      activityKey: "resource_location_attached",
                      metadata: {
                        merged_resource_id: submission.id,
                      },
                    });
                  } catch (impactError) {
                    console.error("Failed to log duplicate merge impact:", impactError);
                  }
                }

                setPossibleMatches([]);
                setEditingId(null);
                onSuccess();
              }}
              className="text-xs text-blue-600 hover:underline"
            >
              Attach as location
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}