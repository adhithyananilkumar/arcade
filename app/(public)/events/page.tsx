import type { Metadata } from "next";
import { EventDiscoveryPage } from "./EventDiscoveryPage";

export const metadata: Metadata = {
  title: "Events — Arcade",
  description: "Discover workshops, webinars, bootcamps, and more.",
};

export default function EventsPage() {
  return <EventDiscoveryPage />;
}
