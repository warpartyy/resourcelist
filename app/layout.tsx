import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./globals.css";
import "@mfm/ui/src/index.css";

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
        <div className="min-h-screen flex flex-col">
          <Header />
            <main className="flex-grow w-full">
              {children}
            </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
