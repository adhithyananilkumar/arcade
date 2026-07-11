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


import Providers from "@/components/Providers";

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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
