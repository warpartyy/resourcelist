import { TAG_GROUPS } from "@/lib/taxonomy";

type Props = {
  editedSubmission: any;
  setEditedSubmission: (data: any) => void;
};

export default function TagsSection({
  editedSubmission,
  setEditedSubmission,
}: Props) {
  const toggle = (tag: string) => {
    setEditedSubmission((prev: any) => {
      const current = prev.tags || [];

      const updated = current.includes(tag)
        ? current.filter((t: string) => t !== tag)
        : [...current, tag];

      return {
        ...prev,
        tags: updated,
      };
    });
  };

  return (
    <div className="mb-6">
      <div className="mb-3 font-semibold text-sm text-text-muted">
        Tags
      </div>

      {Object.entries(TAG_GROUPS).map(([groupName, tags]) => (
        <div
          key={groupName}
          className="mb-8 pb-6 border-b border-border last:border-b-0"
        >
          <div className="capitalize text-xs text-text-subtle mb-3">
            {groupName}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tags.map((tag) => {
              const selected =
                editedSubmission.tags?.includes(tag) || false;

              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggle(tag)}
                  className={`p-3 rounded-lg border transition text-left ${
                    selected
                      ? "shadow-md"
                      : "bg-bg border-border text-text-muted hover:border-accent"
                  }`}
                  style={
                    selected
                      ? {
                          background: "var(--color-accent)",
                          borderColor: "var(--color-accent)",
                          color: "white",
                        }
                      : undefined
                  }
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}