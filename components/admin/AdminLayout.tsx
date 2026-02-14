"use client";

type Props = {
  adminView: "submissions" | "resources";
  setAdminView: (view: "submissions" | "resources") => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function AdminLayout({
  adminView,
  setAdminView,
  onLogout,
  children,
}: Props) {
  return (
    <div className="min-h-screen flex bg-zinc-950 text-white">

      {/* Sidebar */}
      <div className="w-64 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8">
          Admin Panel
        </h2>

        <button
          onClick={() => setAdminView("submissions")}
          className={`text-left px-3 py-2 rounded-lg mb-2 ${
            adminView === "submissions"
              ? "bg-blue-600"
              : "hover:bg-zinc-800"
          }`}
        >
          Submissions
        </button>

        <button
          onClick={() => setAdminView("resources")}
          className={`text-left px-3 py-2 rounded-lg mb-2 ${
            adminView === "resources"
              ? "bg-blue-600"
              : "hover:bg-zinc-800"
          }`}
        >
          Live Resources
        </button>

        <div className="mt-auto">
          <button
            onClick={onLogout}
            className="w-full text-left px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
