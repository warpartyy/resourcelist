// /components/admin/submissions/ContactInfoSection.tsx

type Props = {
  submission: any;
};

export default function ContactInfoSection({ submission }: Props) {
  return (
    <div className="text-sm text-text-muted mt-2 space-y-1">
      {submission.address && (
        <div>
          <span className="text-text-subtle">Address:</span>{" "}
          {submission.address}
          {submission.city && `, ${submission.city}`}
          {submission.state && `, ${submission.state}`}
          {submission.zip && ` ${submission.zip}`}
        </div>
      )}

      {submission.email && (
        <div>
          <span className="text-text-subtle">Email:</span>{" "}
          {submission.email}
        </div>
      )}

      {submission.phone && (
        <div>
          <span className="text-text-subtle">Phone:</span>{" "}
          {submission.phone}
        </div>
      )}
    </div>
  );
}