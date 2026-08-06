import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "../components/layout/AppShell";
import ResourceGuideLauncher from "@/components/resource-guide/ResourceGuideLauncher";
import "./globals.css";
import "@mfm/ui/src/index.css";
import { Toaster } from "react-hot-toast";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Resource List",
  description: "Community-driven resource directory connecting people to essential services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
         className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-bg text-text-primary overflow-x-hidden`}>
        <Toaster position="top-right" />
        <AppShell>{children}</AppShell>
        <ResourceGuideLauncher />
      </body>
    </html>
  );
}
