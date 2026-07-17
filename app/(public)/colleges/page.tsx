import type { Metadata } from "next";
import CollegesPageClient from "@/components/landing/CollegesPageClient";
import "@/styles/landing.css";

export const metadata: Metadata = {
  title: "Arcade for Creators — Create. Teach. Inspire.",
  description:
    "Design and scale premium interactive courses and workspace labs on Arcade. Empower educators, institutions, and developer advocates worldwide.",
  openGraph: {
    title: "Arcade for Creators — Create. Teach. Inspire.",
    description:
      "Design and scale premium interactive courses and workspace labs on Arcade.",
    type: "website",
  },
};

export default function CollegesPage() {
  return <CollegesPageClient />;
}
