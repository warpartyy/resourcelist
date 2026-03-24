type Props = {
  displayName: string;
  email: string;
};

export default function ProfileCard({ displayName, email }: Props) {
  return (
    <div className="border rounded-lg p-6 bg-white">
      <h2 className="text-lg font-semibold mb-4">Profile</h2>

      <div className="space-y-2">
        <p className="text-sm text-gray-500">Display Name</p>
        <p className="text-base">
          {displayName || "Not set"}
        </p>

        <p className="text-sm text-gray-500 mt-4">Email</p>
        <p className="text-base">{email}</p>
      </div>
    </div>
  );
}