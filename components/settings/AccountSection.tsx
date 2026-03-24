type Props = {
  displayName: string;
  setDisplayName: (value: string) => void;
  saving: boolean;
  onSave: () => void;
};

export default function AccountSection({
  displayName,
  setDisplayName,
  saving,
  onSave,
}: Props) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-lg font-semibold mb-4">
        Account Information
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">
            Display Name
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full border rounded p-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            This name is shown to other admins
          </p>
        </div>

        <button
          onClick={onSave}
          disabled={saving || !displayName.trim()}
          className="button button-primary"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}