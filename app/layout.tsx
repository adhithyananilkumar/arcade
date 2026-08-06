/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App
 * Type: Root Layout
 *
 * Purpose:
 * Declarative global HTML layout and Next.js root metadata.
 *
 * Rules:
 * - Do not place business logic here.
 * - Delegate to GlobalProviders in apps/core for React Context.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { Bricolage_Grotesque, Caveat } from "next/font/google";
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});


import Providers from "@/apps/core/Providers";
import { TooltipProvider } from "@/shared/design-system/ui/tooltip";


export const metadata: Metadata = {
  title: "Arcade — Empowering Innovation. Building Communities.",
  description:
    "Arcade is the official platform of Amal Jyothi College of Engineering — connecting students with hackathons, workshops, technical clubs, and opportunities to grow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${caveat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white" suppressHydrationWarning>
        <TooltipProvider>
          <Providers>
            <div className="flex-1 flex flex-col">
              {children}
            </div>
          </Providers>
        </TooltipProvider>
      </body>
    </html>
  );
}