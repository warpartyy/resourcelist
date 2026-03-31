"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { getSupabase } from "@/lib/supabase";
import { updateResource } from "@/lib/services/resourceService";
import { EditableLocation } from "@/lib/types/location";

type Props = {
  resourceId: string;
  editedData: any;
  additionalLocations: EditableLocation[];
  onSuccess?: () => void;
};

export default function SaveButton({
  resourceId,
  editedData,
  additionalLocations,
  onSuccess,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      const supabase = getSupabase();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  toast.error("User not found");
  return;
}

// 🔑 Fetch profile (NEW)
const { data: profile } = await supabase
  .from("profiles")
  .select("display_name, email")
  .eq("id", user.id)
  .single();

// 🔁 UPDATED payload
const { error } = await updateResource(resourceId, {
  ...editedData,
  last_edited_by: user.id, // UUID stays
  last_edited_email: user.email,
  last_edited_name: profile?.display_name || user.email, // ✅ FIXED
  last_edited_at: new Date().toISOString(), // ✅ NEW
});


      if (error) {
        console.error(error);
        toast.error("Save failed.");
        return;
      }

      // ✅ STEP 2: Sync locations
const { error: deleteError } = await supabase
  .from("resource_locations")
  .delete()
  .eq("resource_id", resourceId);

if (deleteError) {
  console.error(deleteError);
  toast.error("Failed to update locations.");
  return;
}

// Build locations array
const primaryLocation = {
  resource_id: resourceId,
  address: editedData.address || "",
  city: editedData.city || "",
  state: editedData.state || "",
  zip: editedData.zip || "",
  is_primary: true,
  location_name: null,
  phone: editedData.phone || null, 
  email: editedData.email || null, 
};

const additional = additionalLocations.map((loc) => ({
  resource_id: resourceId,
  address: loc.address,
  city: loc.city,
  state: loc.state,
  zip: loc.zip,
  is_primary: false,
  location_name: loc.location_name || null,
  phone: loc.phone || null,
  email: loc.email || null,
}));

const allLocations = [primaryLocation, ...additional].filter(
  (loc) => loc.address || loc.city
);

// Insert all
const { error: insertError } = await supabase
  .from("resource_locations")
  .insert(allLocations);

if (insertError) {
  console.error(insertError);
  toast.error("Failed to save locations.");
  return;
}

      toast.success("Changes saved");
      onSuccess?.();
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <button
    onClick={handleSave}
    disabled={isLoading}
    className={`button button-primary ${
      isLoading ? "button-disabled" : ""
    }`}
  >
    {isLoading ? "Saving..." : "Save"}
  </button>
);
}