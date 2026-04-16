// /components/admin/submissions/SubmissionDetailsSection.tsx

type Props = {
  submission: any;
};

export default function SubmissionDetailsSection({ submission }: Props) {
  return (
    <>
      {/* Description */}
      {submission.description && (
        <p className="text-text-muted text-sm mt-4">
          {submission.description}
        </p>
      )}

      {/* Metadata Row */}
      <div className="flex flex-wrap gap-6 text-sm text-text-muted mt-4">
        {submission.counties_served?.length > 0 && (
          <span>
            <span className="text-text-subtle">Counties:</span>{" "}
            {submission.counties_served.join(", ")}
          </span>
        )}

        {submission.parent_categories?.length > 0 && (
          <span>
            <span className="text-text-subtle">Category:</span>{" "}
            {submission.parent_categories.join(", ")}
          </span>
        )}

        {submission.created_at && (
          <span>
            <span className="text-text-subtle">Submitted:</span>{" "}
            {new Date(submission.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </>
  );
}