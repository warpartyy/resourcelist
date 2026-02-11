export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
      {children}
    </div>
  );
}
