import type { Metadata } from "next";
import { CredentialStandards } from "@/apps/public/components/credentials/CredentialStandards";

export const metadata: Metadata = {
  title: "Arcade credential standard | Arcade",
  description: "How Arcade badges are levelled, earned and verified — one standard for every course, event and exam on the platform.",
};

export default function CredentialStandardsPage() {
  return <CredentialStandards />;
}
