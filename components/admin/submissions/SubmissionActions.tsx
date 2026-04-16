// /components/admin/submissions/SubmissionActions.tsx

import { getSupabase } from "@/lib/supabase";
import SaveButton from "../actions/SaveButton";
import MoveSubmissionToPendingButton from "../actions/MoveToPendingButton";
import ApproveButton from "../actions/ApproveButton";
import DeleteButton from "../actions/DeleteButton";
import RejectButton from "../actions/RejectButton";
import { EditableLocation } from "@/lib/types/location";

type Props = {
  submission: any;
  section: "pending" | "approved" | "rejected";
  isEditing: boolean;
  setEditingId: (id: string | null) => void;
  setEditedSubmission: (data: any) => void;
  additionalLocations: EditableLocation[];
  setAdditionalLocations: (locs: EditableLocation[]) => void;
  editedSubmission: any;
  onSuccess: () => void;
};

export default function SubmissionActions({
  submission,
  section,
  isEditing,
  setEditingId,
  setEditedSubmission,
  additionalLocations,
  setAdditionalLocations,
  editedSubmission,
  onSuccess,
}: Props) {
  if (!isEditing) {
    return (
      <>
        {section === "pending" && (
          <>
            <button
              onClick={async () => {
                const supabase = getSupabase();

                setEditingId(submission.id);
                setEditedSubmission(submission);

                const { data: locations, error } = await supabase
                  .from("resource_locations")
                  .select("*")
                  .eq("resource_id", submission.id);

                if (error) {
                  console.error(error);
                  setAdditionalLocations([]);
                  return;
                }

                const additional = (locations || [])
                  .filter((loc) => !loc.is_primary)
                  .map((loc) => ({
                    address: loc.address || "",
                    city: loc.city || "",
                    state: loc.state || "OK",
                    zip: loc.zip || "",
                    is_primary: false,
                    location_name: loc.location_name || "",
                    phone: loc.phone || "",
                    email: loc.email || "",
                  }));

                setAdditionalLocations(
                  additional.length > 0
                    ? additional
                    : [
                        {
                          address: "",
                          city: "",
                          state: "OK",
                          zip: "",
                          is_primary: false,
                          location_name: "",
                          phone: "",
                          email: "",
                        },
                      ]
                );
              }}
              className="w-full md:w-auto px-4 py-2 rounded-md text-sm font-medium bg-bg border border-border hover:bg-surface transition"
            >
              Edit
            </button>

            <ApproveButton
              resource={submission}
              onSuccess={() => {
                setEditingId(null);
                onSuccess();
              }}
            />

            <RejectButton
              resource={submission}
              onSuccess={() => {
                onSuccess();
              }}
            />
          </>
        )}

        {section === "rejected" && (
          <>
            <MoveSubmissionToPendingButton
              submission={submission}
              onSuccess={() => {
                setEditingId(null);
                onSuccess();
              }}
            />

            <DeleteButton
              resource={submission}
              onSuccess={() => {
                setEditingId(null);
                onSuccess();
              }}
            />
          </>
        )}

        {section === "approved" && null}
      </>
    );
  }

  return (
    <>
      <SaveButton
        resourceId={submission.id}
        editedData={editedSubmission}
        additionalLocations={additionalLocations}
        onSuccess={() => {
          setEditingId(null);
          onSuccess();
        }}
      />

      <ApproveButton
        resource={submission}
        editedData={editedSubmission}
        isEditing={true}
        onSuccess={() => {
          setEditingId(null);
          onSuccess();
        }}
      />

      <button
        onClick={() => setEditingId(null)}
        className="w-full md:w-auto px-4 py-2 rounded-md text-sm font-medium border border-border text-text-muted hover:bg-bg transition"
      >
        Cancel
      </button>
    </>
  );
}