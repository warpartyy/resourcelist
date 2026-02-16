export default function Card({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl transition hover:border-zinc-700 hover:shadow-lg">


      {children}
    </div>
  );
}
