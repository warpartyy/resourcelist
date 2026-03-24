"use client";

import { useEffect, useState } from "react";

type Props = {
  displayName: string;
  saving: boolean;
  onSave: (newName: string) => void;
};

export default function AccountSection({
  displayName,
  saving,
  onSave,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingName, setEditingName] = useState(displayName);

  // Keep editing state in sync with saved state
  useEffect(() => {
    setEditingName(displayName);
  }, [displayName]);

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-lg font-semibold mb-4">
        Account Information
      </h2>

      <div className="space-y-4">
        {!isEditing ? (
          <>
            <div>
              <p className="text-sm text-gray-500">Display Name</p>
              <p className="text-base">{displayName || "Not set"}</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="button button-secondary"
            >
              Edit
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm mb-1">
                Display Name
              </label>
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingName(displayName);
                  setIsEditing(false);
                }}
                className="button button-secondary"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onSave(editingName);
                  setIsEditing(false);
                }}
                disabled={!editingName.trim() || saving}
                className="button button-primary"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}