"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "../Header";
import Footer from "../Footer";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <div className="min-h-screen flex flex-col">
      {!isAdminRoute && <Header />}

      <main className="flex-grow w-full">
        {children}
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}