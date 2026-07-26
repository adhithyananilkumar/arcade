/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App
 * Type: Root Layout
 * ------------------------------------------------------------------
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque, Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} ${plusJakarta.variable} ${outfit.variable} h-full antialiased`}
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