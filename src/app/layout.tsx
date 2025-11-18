import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "maplibre-gl/dist/maplibre-gl.css";

import Nav from "@/components/ui/Nav";
import PrismClient from "@/components/PrismClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  weight: "800",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Event App",
  description: "Plan and Discover Events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-950 text-neutral-100 antialiased">
        {/* client-only Prism background  */}
        <PrismClient />

        <div className="main fixed inset-0 -z-10 pointer-events-none max-w-6xl mx-auto px-4">
          <div className="gradient" />
        </div>
        <main className="app">
            {/* Nav bar component imported from components/ui/Nav.tsx */}
            <Nav/>
            {children}
        </main>
      </body>
    </html>
  );
}