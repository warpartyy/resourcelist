"use client";

import { useState } from "react";

type Props = {
  password: string;
  confirmPassword: string;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  saving: boolean;
  onSave: () => void;
};

export default function SecuritySection({
  password,
  confirmPassword,
  setPassword,
  setConfirmPassword,
  saving,
  onSave,
}: Props) {
  const [isEditing, setIsEditing] = useState(false);

  const passwordsDoNotMatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-lg font-semibold mb-4">
        Security
      </h2>

      <div className="space-y-4">
        {!isEditing ? (
          <>
            <div>
              <p className="text-sm text-gray-500">Password</p>
              <p className="text-base">••••••••</p>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="button button-secondary"
            >
              Change Password
            </button>
          </>
        ) : (
          <>
            <div>
              <label className="block text-sm mb-1">
                New Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded p-2"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
                className="w-full border rounded p-2"
              />

              {passwordsDoNotMatch && (
                <p className="text-sm text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <p className="text-xs text-gray-500">
              Choose a strong password. You can update it anytime.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPassword("");
                  setConfirmPassword("");
                  setIsEditing(false);
                }}
                className="button button-secondary"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  onSave();
                  setIsEditing(false);
                }}
                disabled={
                  saving ||
                  !password ||
                  password !== confirmPassword
                }
                className="button button-primary"
              >
                {saving ? "Saving..." : "Update Password"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}